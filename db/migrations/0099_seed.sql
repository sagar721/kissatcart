-- =====================================================================
-- KismatKart :: 0099_seed.sql
-- Seeds 6 categories, 60 products (10 per category), variants,
-- placeholder images, inventory, and a couple of coupons.
-- Idempotent via ON CONFLICT DO NOTHING on slug/code.
-- =====================================================================

-- ---------- CATEGORIES ------------------------------------------------
insert into public.categories(slug, name, description, sort_order) values
 ('shirts',        'Shirts',         'Casual & printed shirts for the modern gentleman', 1),
 ('t-shirts',      'T-Shirts',       'Oversized, graphic and everyday tees', 2),
 ('jeans',         'Jeans',          'Straight, slim & relaxed-fit denim',   3),
 ('hoodies',       'Hoodies',        'Streetwear hoodies & sweatshirts',     4),
 ('cargo-pants',   'Cargo Pants',    'Utility & tapered cargos',             5),
 ('formal-shirts', 'Formal Shirts',  'Slim-fit formal & office shirts',      6)
on conflict (slug) do nothing;

-- ---------- PRODUCT SEED HELPER --------------------------------------
-- Generates 10 products per category with sensible names/prices/variants.
do $$
declare
  cat record;
  i int;
  v_slug text;
  v_prod uuid;
  v_var  uuid;
  sizes text[] := array['S','M','L','XL','XXL'];
  colors jsonb := jsonb_build_array(
    jsonb_build_object('name','Black',  'hex','#111111'),
    jsonb_build_object('name','White',  'hex','#F8F5F0'),
    jsonb_build_object('name','Olive',  'hex','#5B6B3A'),
    jsonb_build_object('name','Sage',   'hex','#9BAA88'),
    jsonb_build_object('name','Mocha',  'hex','#6E4A34'),
    jsonb_build_object('name','Navy',   'hex','#1B2A49'),
    jsonb_build_object('name','Rust',   'hex','#A0522D'),
    jsonb_build_object('name','Ivory',  'hex','#F1E9DB'));
  v_color jsonb;
  s text;
  price numeric;
  mrp numeric;
begin
  for cat in select * from public.categories order by sort_order loop
    for i in 1..10 loop
      v_slug := cat.slug || '-' || lpad(i::text, 3, '0');
      case cat.slug
        when 't-shirts'      then price := 649;  mrp := 1799;
        when 'shirts'        then price := 999;  mrp := 1999;
        when 'jeans'         then price := 1299; mrp := 2499;
        when 'hoodies'       then price := 1499; mrp := 2999;
        when 'cargo-pants'   then price := 1199; mrp := 2299;
        when 'formal-shirts' then price := 999;  mrp := 1999;
      end case;

      insert into public.products(
        slug, name, brand, short_description, description, category_id,
        price, mrp, sku_prefix, tags, is_active, is_new_arrival, is_featured)
      values(
        v_slug,
        initcap(replace(cat.slug,'-',' ')) || ' No. ' || i,
        'KismatKart',
        'Premium menswear — ' || cat.name || ' cut for a modern silhouette.',
        'Crafted from breathable fabric with a relaxed fit. Machine wash cold, tumble dry low. Made in India.',
        cat.id, price, mrp,
        'KK-' || upper(substring(cat.slug,1,3)) || lpad(i::text,3,'0'),
        array[cat.slug, 'menswear', 'new-drop'],
        true, (i <= 4), (i <= 2))
      on conflict (slug) do nothing
      returning id into v_prod;

      if v_prod is not null then
        -- Thumbnail (placeholder gradient rendered client-side)
        insert into public.product_images(product_id, url, alt, is_thumbnail, sort_order)
        values (v_prod, '/img/placeholder/'||cat.slug||'-'||i||'.jpg',
                cat.name || ' — style ' || i, true, 0);
        -- 4 gallery images
        for s in select unnest(array['a','b','c','d']) loop
          insert into public.product_images(product_id, url, alt, sort_order)
          values (v_prod, '/img/placeholder/'||cat.slug||'-'||i||'-'||s||'.jpg',
                  cat.name || ' — view '||s, ascii(s)-96);
        end loop;

        -- Variants: every product gets sizes S..XL and 3 rotating colors
        for s in select unnest(sizes) loop
          for v_color in select * from jsonb_array_elements(
              case when i % 3 = 0 then jsonb_build_array(colors->0, colors->2, colors->4)
                   when i % 3 = 1 then jsonb_build_array(colors->1, colors->3, colors->5)
                   else                jsonb_build_array(colors->6, colors->7, colors->0) end)
          loop
            insert into public.product_variants(
              product_id, sku, size, color, color_hex, price_delta, is_active)
            values(
              v_prod,
              'KK-' || upper(substring(cat.slug,1,3)) || lpad(i::text,3,'0')
                    || '-' || s || '-' || upper(substring(v_color->>'name',1,3)),
              s, v_color->>'name', v_color->>'hex', 0, true)
            on conflict (product_id, size, color) do nothing
            returning id into v_var;

            if v_var is not null then
              insert into public.inventory(variant_id, stock_qty, reserved_qty, low_stock_at)
              values(v_var, 25 + (random()*40)::int, 0, 5)
              on conflict (variant_id) do nothing;
            end if;
          end loop;
        end loop;
      end if;
      v_prod := null;
    end loop;
  end loop;
end $$;

-- ---------- COUPONS ---------------------------------------------------
insert into public.coupons(
  code, discount_type, discount_value, min_order_amount, max_discount_amount,
  scope, starts_at, ends_at, usage_limit, per_user_limit, is_active)
values
  ('WELCOME10', 'percent', 10, 999,  500, 'cart',
   now(), now() + interval '90 days', 5000, 1, true),
  ('FLAT200',   'flat',    200, 1499, null, 'cart',
   now(), now() + interval '60 days', 2000, 2, true),
  ('MONSOON30', 'percent', 30, 1999, 1200, 'cart',
   now(), now() + interval '30 days', 500,  1, true)
on conflict (code) do nothing;
