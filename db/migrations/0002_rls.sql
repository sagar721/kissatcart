-- =====================================================================
-- KismatKart :: 0002_rls.sql
-- Row-level security. Users see only their own carts/wishlist/orders/etc.
-- Admins bypass via role check. Public catalog reads are open (products,
-- categories, images, variants, reviews) but writes are admin-only.
-- =====================================================================

-- Helper: is the current auth user an admin?
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce(
    (select role in ('admin','staff') from public.profiles where id = auth.uid()),
    false);
$$;

-- Enable RLS everywhere we care about
alter table public.profiles          enable row level security;
alter table public.addresses         enable row level security;
alter table public.categories        enable row level security;
alter table public.products          enable row level security;
alter table public.product_images    enable row level security;
alter table public.product_variants  enable row level security;
alter table public.inventory         enable row level security;
alter table public.wishlists         enable row level security;
alter table public.wishlist_items    enable row level security;
alter table public.carts             enable row level security;
alter table public.cart_items        enable row level security;
alter table public.coupons           enable row level security;
alter table public.coupon_usage      enable row level security;
alter table public.orders            enable row level security;
alter table public.order_items       enable row level security;
alter table public.order_status_history enable row level security;
alter table public.shipping          enable row level security;
alter table public.payments          enable row level security;
alter table public.reviews           enable row level security;
alter table public.review_images     enable row level security;
alter table public.notifications     enable row level security;

-- ---------- PROFILES --------------------------------------------------
drop policy if exists "profiles: self read"   on public.profiles;
drop policy if exists "profiles: self update" on public.profiles;
drop policy if exists "profiles: admin all"   on public.profiles;
create policy "profiles: self read"   on public.profiles for select using (id = auth.uid() or public.is_admin());
create policy "profiles: self update" on public.profiles for update using (id = auth.uid()) with check (id = auth.uid() and role = (select role from public.profiles where id = auth.uid()));
create policy "profiles: admin all"   on public.profiles for all    using (public.is_admin()) with check (public.is_admin());

-- ---------- ADDRESSES -------------------------------------------------
drop policy if exists "addresses: owner rw" on public.addresses;
drop policy if exists "addresses: admin"    on public.addresses;
create policy "addresses: owner rw" on public.addresses for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "addresses: admin"    on public.addresses for all using (public.is_admin()) with check (public.is_admin());

-- ---------- CATALOG (public read, admin write) ------------------------
drop policy if exists "categories: read"       on public.categories;
drop policy if exists "categories: admin"      on public.categories;
create policy "categories: read"  on public.categories for select using (is_active or public.is_admin());
create policy "categories: admin" on public.categories for all    using (public.is_admin()) with check (public.is_admin());

drop policy if exists "products: read"  on public.products;
drop policy if exists "products: admin" on public.products;
create policy "products: read"  on public.products for select using (is_active or public.is_admin());
create policy "products: admin" on public.products for all    using (public.is_admin()) with check (public.is_admin());

drop policy if exists "product_images: read"  on public.product_images;
drop policy if exists "product_images: admin" on public.product_images;
create policy "product_images: read"  on public.product_images for select using (true);
create policy "product_images: admin" on public.product_images for all    using (public.is_admin()) with check (public.is_admin());

drop policy if exists "variants: read"  on public.product_variants;
drop policy if exists "variants: admin" on public.product_variants;
create policy "variants: read"  on public.product_variants for select using (is_active or public.is_admin());
create policy "variants: admin" on public.product_variants for all    using (public.is_admin()) with check (public.is_admin());

drop policy if exists "inventory: read"  on public.inventory;
drop policy if exists "inventory: admin" on public.inventory;
create policy "inventory: read"  on public.inventory for select using (true);        -- to show stock badges
create policy "inventory: admin" on public.inventory for all    using (public.is_admin()) with check (public.is_admin());

-- ---------- WISHLIST --------------------------------------------------
drop policy if exists "wishlists: owner" on public.wishlists;
drop policy if exists "wishlists: admin" on public.wishlists;
create policy "wishlists: owner" on public.wishlists for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "wishlists: admin" on public.wishlists for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "wishlist_items: owner" on public.wishlist_items;
drop policy if exists "wishlist_items: admin" on public.wishlist_items;
create policy "wishlist_items: owner" on public.wishlist_items for all
  using (exists (select 1 from public.wishlists w where w.id = wishlist_id and w.user_id = auth.uid()))
  with check (exists (select 1 from public.wishlists w where w.id = wishlist_id and w.user_id = auth.uid()));
create policy "wishlist_items: admin" on public.wishlist_items for all using (public.is_admin()) with check (public.is_admin());

-- ---------- CART ------------------------------------------------------
drop policy if exists "carts: owner" on public.carts;
drop policy if exists "carts: admin" on public.carts;
create policy "carts: owner" on public.carts for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
create policy "carts: admin" on public.carts for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "cart_items: owner" on public.cart_items;
drop policy if exists "cart_items: admin" on public.cart_items;
create policy "cart_items: owner" on public.cart_items for all
  using (exists (select 1 from public.carts c where c.id = cart_id and c.user_id = auth.uid()))
  with check (exists (select 1 from public.carts c where c.id = cart_id and c.user_id = auth.uid()));
create policy "cart_items: admin" on public.cart_items for all using (public.is_admin()) with check (public.is_admin());

-- Anonymous session carts are handled server-side via service-role (bypasses RLS)
-- No client-side policy is granted for user_id IS NULL — clients must be signed in
-- to read/write their cart, or the server acts on their behalf.

-- ---------- COUPONS ---------------------------------------------------
drop policy if exists "coupons: read"  on public.coupons;
drop policy if exists "coupons: admin" on public.coupons;
create policy "coupons: read"  on public.coupons for select using (is_active and (ends_at is null or ends_at > now()));
create policy "coupons: admin" on public.coupons for all    using (public.is_admin()) with check (public.is_admin());

drop policy if exists "coupon_usage: owner" on public.coupon_usage;
drop policy if exists "coupon_usage: admin" on public.coupon_usage;
create policy "coupon_usage: owner" on public.coupon_usage for select using (user_id = auth.uid());
create policy "coupon_usage: admin" on public.coupon_usage for all    using (public.is_admin()) with check (public.is_admin());

-- ---------- ORDERS ----------------------------------------------------
drop policy if exists "orders: owner read" on public.orders;
drop policy if exists "orders: admin"      on public.orders;
create policy "orders: owner read" on public.orders for select using (user_id = auth.uid());
create policy "orders: admin"      on public.orders for all    using (public.is_admin()) with check (public.is_admin());
-- Orders are CREATED via server-side service-role (post-payment verification).

drop policy if exists "order_items: owner read" on public.order_items;
drop policy if exists "order_items: admin"      on public.order_items;
create policy "order_items: owner read" on public.order_items for select
  using (exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));
create policy "order_items: admin" on public.order_items for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "osh: owner read" on public.order_status_history;
drop policy if exists "osh: admin"      on public.order_status_history;
create policy "osh: owner read" on public.order_status_history for select
  using (exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));
create policy "osh: admin" on public.order_status_history for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "shipping: owner read" on public.shipping;
drop policy if exists "shipping: admin"      on public.shipping;
create policy "shipping: owner read" on public.shipping for select
  using (exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));
create policy "shipping: admin" on public.shipping for all using (public.is_admin()) with check (public.is_admin());

-- ---------- PAYMENTS --------------------------------------------------
drop policy if exists "payments: owner read" on public.payments;
drop policy if exists "payments: admin"      on public.payments;
create policy "payments: owner read" on public.payments for select
  using (exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));
create policy "payments: admin" on public.payments for all using (public.is_admin()) with check (public.is_admin());
-- payments are created/updated by server-side service-role after Razorpay verify.

-- ---------- REVIEWS ---------------------------------------------------
drop policy if exists "reviews: read"      on public.reviews;
drop policy if exists "reviews: owner rw"  on public.reviews;
drop policy if exists "reviews: admin"     on public.reviews;
create policy "reviews: read"      on public.reviews for select using (is_approved or user_id = auth.uid() or public.is_admin());
create policy "reviews: owner rw"  on public.reviews for all
  using (user_id = auth.uid()
         and exists (select 1 from public.orders o
                     where o.id = order_id and o.user_id = auth.uid() and o.status = 'delivered'))
  with check (user_id = auth.uid()
              and exists (select 1 from public.orders o
                          where o.id = order_id and o.user_id = auth.uid() and o.status = 'delivered'));
create policy "reviews: admin" on public.reviews for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "review_images: read"  on public.review_images;
drop policy if exists "review_images: owner" on public.review_images;
drop policy if exists "review_images: admin" on public.review_images;
create policy "review_images: read"  on public.review_images for select using (true);
create policy "review_images: owner" on public.review_images for all
  using (exists (select 1 from public.reviews r where r.id = review_id and r.user_id = auth.uid()))
  with check (exists (select 1 from public.reviews r where r.id = review_id and r.user_id = auth.uid()));
create policy "review_images: admin" on public.review_images for all using (public.is_admin()) with check (public.is_admin());

-- ---------- NOTIFICATIONS ---------------------------------------------
drop policy if exists "notif: owner read" on public.notifications;
drop policy if exists "notif: admin"      on public.notifications;
create policy "notif: owner read" on public.notifications for select using (user_id = auth.uid());
create policy "notif: admin"      on public.notifications for all    using (public.is_admin()) with check (public.is_admin());
