-- =====================================================================
-- KismatKart :: 0003_functions.sql
-- Server-side atomic operations. Called only from API routes running
-- with the service-role key (they bypass RLS). Each function locks the
-- rows it needs so concurrent checkouts can't oversell inventory.
-- =====================================================================

-- ---------- Order number generator (KK-YYYY-NNNNNN) -------------------
create sequence if not exists public.order_number_seq;
create or replace function public.next_order_number()
returns text language sql as $$
  select 'KK-' || to_char(now(),'YYYY') || '-' ||
         lpad(nextval('public.order_number_seq')::text, 6, '0')
$$;

-- ---------- Reserve inventory for a variant (row-locked) --------------
-- Returns true if the reservation succeeded; false if insufficient stock.
create or replace function public.reserve_stock(p_variant_id uuid, p_qty int)
returns boolean language plpgsql as $$
declare v_available int;
begin
  if p_qty <= 0 then return false; end if;

  -- Row-lock the inventory row for the variant
  select (stock_qty - reserved_qty) into v_available
    from public.inventory
   where variant_id = p_variant_id
   for update;

  if v_available is null or v_available < p_qty then
    return false;
  end if;

  update public.inventory
     set reserved_qty = reserved_qty + p_qty,
         updated_at   = now()
   where variant_id = p_variant_id;

  return true;
end $$;

-- ---------- Release a reservation (payment failed / cancelled) --------
create or replace function public.release_stock(p_variant_id uuid, p_qty int)
returns void language plpgsql as $$
begin
  update public.inventory
     set reserved_qty = greatest(0, reserved_qty - p_qty),
         updated_at   = now()
   where variant_id = p_variant_id;
end $$;

-- ---------- Commit a reservation (payment captured) -------------------
-- Moves qty from reserved_qty out of stock_qty.
create or replace function public.commit_stock(p_variant_id uuid, p_qty int)
returns void language plpgsql as $$
begin
  update public.inventory
     set stock_qty    = greatest(0, stock_qty - p_qty),
         reserved_qty = greatest(0, reserved_qty - p_qty),
         updated_at   = now()
   where variant_id = p_variant_id;
end $$;

-- ---------- Restore stock on cancel/refund ----------------------------
create or replace function public.restore_stock(p_variant_id uuid, p_qty int)
returns void language plpgsql as $$
begin
  update public.inventory
     set stock_qty  = stock_qty + p_qty,
         updated_at = now()
   where variant_id = p_variant_id;
end $$;

-- ---------- Validate + price a coupon for a user & subtotal -----------
-- Returns discount amount (numeric). Raises exception with a code the
-- API layer maps to a user-friendly message.
create or replace function public.apply_coupon(
  p_code text, p_user_id uuid, p_subtotal numeric
) returns numeric language plpgsql as $$
declare c public.coupons%rowtype;
        v_used int;
        v_disc numeric;
begin
  select * into c from public.coupons
    where code = p_code and is_active
    for update;
  if not found then raise exception 'COUPON_NOT_FOUND'; end if;

  if now() < c.starts_at then raise exception 'COUPON_NOT_STARTED'; end if;
  if c.ends_at is not null and now() > c.ends_at then raise exception 'COUPON_EXPIRED'; end if;
  if p_subtotal < c.min_order_amount then raise exception 'COUPON_MIN_ORDER'; end if;

  if c.usage_limit is not null then
    select count(*) into v_used from public.coupon_usage where coupon_id = c.id;
    if v_used >= c.usage_limit then raise exception 'COUPON_EXHAUSTED'; end if;
  end if;

  select count(*) into v_used
    from public.coupon_usage
   where coupon_id = c.id and user_id = p_user_id;
  if v_used >= c.per_user_limit then raise exception 'COUPON_PER_USER_LIMIT'; end if;

  if c.discount_type = 'percent' then
    v_disc := round(p_subtotal * (c.discount_value / 100.0), 2);
    if c.max_discount_amount is not null then
      v_disc := least(v_disc, c.max_discount_amount);
    end if;
  else
    v_disc := least(c.discount_value, p_subtotal);
  end if;

  return v_disc;
end $$;

-- ---------- Atomic checkout ------------------------------------------
-- Reserves stock, creates the order + items, records history.
-- Payment record is created separately by the /api/checkout/create-order route.
-- Input: user id, address id, cart items array (variant_id, qty), coupon code, shipping/tax.
create or replace function public.create_order(
  p_user_id            uuid,
  p_shipping_address   uuid,
  p_items              jsonb,            -- [{variant_id, quantity, unit_price}, ...]
  p_coupon_code        text default null,
  p_shipping_total     numeric default 0,
  p_tax_total          numeric default 0
) returns uuid language plpgsql as $$
declare
  v_order_id     uuid := gen_random_uuid();
  v_number       text := public.next_order_number();
  v_addr         public.addresses%rowtype;
  v_addr_snap    jsonb;
  v_item         jsonb;
  v_subtotal     numeric := 0;
  v_discount     numeric := 0;
  v_grand        numeric := 0;
  v_coupon_id    uuid;
  v_variant      public.product_variants%rowtype;
  v_product      public.products%rowtype;
  v_ok           boolean;
begin
  if jsonb_array_length(p_items) = 0 then
    raise exception 'EMPTY_CART';
  end if;

  select * into v_addr from public.addresses
    where id = p_shipping_address and user_id = p_user_id;
  if not found then raise exception 'ADDRESS_NOT_FOUND'; end if;

  v_addr_snap := to_jsonb(v_addr);

  -- Reserve stock and compute subtotal
  for v_item in select * from jsonb_array_elements(p_items) loop
    v_ok := public.reserve_stock(
      (v_item->>'variant_id')::uuid,
      (v_item->>'quantity')::int);
    if not v_ok then
      raise exception 'OUT_OF_STOCK: %', v_item->>'variant_id';
    end if;
    v_subtotal := v_subtotal
      + ((v_item->>'unit_price')::numeric * (v_item->>'quantity')::int);
  end loop;

  -- Coupon
  if p_coupon_code is not null and p_coupon_code <> '' then
    v_discount := public.apply_coupon(p_coupon_code, p_user_id, v_subtotal);
    select id into v_coupon_id from public.coupons where code = p_coupon_code;
  end if;

  v_grand := v_subtotal - v_discount + p_shipping_total + p_tax_total;

  insert into public.orders(
    id, order_number, user_id, status, subtotal, discount_total,
    shipping_total, tax_total, grand_total, coupon_id, coupon_code,
    shipping_address_id, shipping_address_snap, estimated_delivery)
  values (
    v_order_id, v_number, p_user_id, 'pending', v_subtotal, v_discount,
    p_shipping_total, p_tax_total, v_grand, v_coupon_id, p_coupon_code,
    p_shipping_address, v_addr_snap, now() + interval '5 days');

  for v_item in select * from jsonb_array_elements(p_items) loop
    select * into v_variant from public.product_variants where id = (v_item->>'variant_id')::uuid;
    select * into v_product from public.products where id = v_variant.product_id;
    insert into public.order_items(
      order_id, product_id, variant_id, product_name, variant_label, sku,
      quantity, unit_price, line_total)
    values (
      v_order_id, v_product.id, v_variant.id, v_product.name,
      concat_ws(' / ', v_variant.size, v_variant.color), v_variant.sku,
      (v_item->>'quantity')::int,
      (v_item->>'unit_price')::numeric,
      (v_item->>'unit_price')::numeric * (v_item->>'quantity')::int);
  end loop;

  insert into public.order_status_history(order_id, status, note, changed_by)
    values (v_order_id, 'pending', 'Order created; awaiting payment', p_user_id);

  if v_coupon_id is not null then
    insert into public.coupon_usage(coupon_id, user_id, order_id)
      values (v_coupon_id, p_user_id, v_order_id);
  end if;

  return v_order_id;
end $$;

-- ---------- Advance order status (admin) -----------------------------
create or replace function public.set_order_status(
  p_order_id uuid, p_status order_status, p_note text default null
) returns void language plpgsql as $$
declare v_old order_status;
begin
  update public.orders set status = p_status,
    cancelled_at = case when p_status = 'cancelled' then now() else cancelled_at end
    where id = p_order_id returning status into v_old;
  insert into public.order_status_history(order_id, status, note, changed_by)
    values (p_order_id, p_status, p_note, auth.uid());
end $$;

-- ---------- Refresh product rating aggregate -------------------------
create or replace function public.tg_refresh_product_rating()
returns trigger language plpgsql as $$
begin
  update public.products p
     set rating_avg = coalesce(
           (select round(avg(rating)::numeric, 2) from public.reviews
             where product_id = p.id and is_approved), 0),
         rating_count = coalesce(
           (select count(*) from public.reviews
             where product_id = p.id and is_approved), 0)
   where p.id = coalesce(new.product_id, old.product_id);
  return null;
end $$;
drop trigger if exists tg_reviews_agg on public.reviews;
create trigger tg_reviews_agg
  after insert or update or delete on public.reviews
  for each row execute function public.tg_refresh_product_rating();
