-- =====================================================================
-- KismatKart :: 0001_schema.sql
-- Complete relational schema for products, users, carts, orders, payments,
-- coupons, reviews, inventory, notifications. Postgres 15+ / Supabase.
-- Idempotent where safe; run once on a fresh database.
-- =====================================================================

create extension if not exists "pgcrypto";
create extension if not exists "citext";
create extension if not exists "pg_trgm";

-- ---------- ENUMS ------------------------------------------------------
do $$ begin
  create type user_role       as enum ('customer','admin','staff');
  create type address_type    as enum ('shipping','billing');
  create type cart_status     as enum ('active','converted','abandoned');
  create type order_status    as enum (
    'pending','confirmed','processing','packed','shipped',
    'out_for_delivery','delivered','cancelled',
    'return_requested','returned','refunded'
  );
  create type payment_status  as enum ('created','authorized','captured','failed','refunded','partial_refund');
  create type payment_method  as enum ('razorpay','cod');
  create type discount_type   as enum ('percent','flat');
  create type coupon_scope    as enum ('cart','product','category');
  create type notif_channel   as enum ('email','sms','push');
  create type notif_status    as enum ('queued','sent','failed');
exception when duplicate_object then null; end $$;

-- ---------- IDENTITY & PROFILE ----------------------------------------
-- In Supabase, auth.users owns credentials. profiles augments it.
create table if not exists public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  email         citext not null unique,
  full_name     text,
  phone         text check (phone ~ '^[6-9][0-9]{9}$' or phone is null),
  role          user_role not null default 'customer',
  avatar_url    text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists idx_profiles_role on public.profiles(role);

-- Auto-provision profile row on new auth user
create or replace function public.handle_new_auth_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles(id, email, full_name)
  values (new.id, coalesce(new.email, ''), coalesce(new.raw_user_meta_data->>'full_name',''))
  on conflict (id) do nothing;
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();

-- ---------- ADDRESSES --------------------------------------------------
create table if not exists public.addresses (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles(id) on delete cascade,
  type          address_type not null default 'shipping',
  is_default    boolean not null default false,
  full_name     text not null,
  phone         text not null check (phone ~ '^[6-9][0-9]{9}$'),
  line1         text not null,
  line2         text,
  landmark      text,
  city          text not null,
  state         text not null,
  pincode       text not null check (pincode ~ '^[1-9][0-9]{5}$'),
  country       text not null default 'IN',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists idx_addresses_user on public.addresses(user_id);
-- Only one default per user per type
create unique index if not exists uq_addresses_default
  on public.addresses(user_id, type) where is_default;

-- ---------- CATEGORIES -------------------------------------------------
create table if not exists public.categories (
  id            uuid primary key default gen_random_uuid(),
  slug          citext not null unique,
  name          text not null,
  description   text,
  parent_id     uuid references public.categories(id) on delete set null,
  image_url     text,
  sort_order    int not null default 0,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists idx_categories_parent on public.categories(parent_id);

-- ---------- PRODUCTS ---------------------------------------------------
create table if not exists public.products (
  id                  uuid primary key default gen_random_uuid(),
  slug                citext not null unique,
  name                text not null,
  brand               text not null default 'KismatKart',
  short_description   text,
  description         text,
  category_id         uuid not null references public.categories(id) on delete restrict,
  subcategory_id      uuid references public.categories(id) on delete set null,
  price               numeric(10,2) not null check (price >= 0),
  mrp                 numeric(10,2) not null check (mrp >= 0),
  discount_percent    int generated always as
    (case when mrp > 0 then greatest(0, round(((mrp - price) / mrp) * 100)::int) else 0 end) stored,
  sku_prefix          text not null,
  tags                text[] not null default '{}',
  is_active           boolean not null default true,
  is_featured         boolean not null default false,
  is_new_arrival      boolean not null default false,
  rating_avg          numeric(3,2) not null default 0 check (rating_avg between 0 and 5),
  rating_count        int not null default 0 check (rating_count >= 0),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);
create index if not exists idx_products_category on public.products(category_id);
create index if not exists idx_products_active   on public.products(is_active);
create index if not exists idx_products_new      on public.products(is_new_arrival) where is_new_arrival;
create index if not exists idx_products_featured on public.products(is_featured) where is_featured;
create index if not exists idx_products_tags_gin on public.products using gin(tags);
create index if not exists idx_products_name_trgm on public.products using gin(name gin_trgm_ops);

-- ---------- PRODUCT IMAGES --------------------------------------------
create table if not exists public.product_images (
  id            uuid primary key default gen_random_uuid(),
  product_id    uuid not null references public.products(id) on delete cascade,
  url           text not null,
  alt           text,
  is_thumbnail  boolean not null default false,
  sort_order    int not null default 0,
  created_at    timestamptz not null default now()
);
create index if not exists idx_product_images_product on public.product_images(product_id);
create unique index if not exists uq_product_thumbnail
  on public.product_images(product_id) where is_thumbnail;

-- ---------- VARIANTS (size × color) + INVENTORY -----------------------
create table if not exists public.product_variants (
  id            uuid primary key default gen_random_uuid(),
  product_id    uuid not null references public.products(id) on delete cascade,
  sku           text not null unique,
  size          text,
  color         text,
  color_hex     text check (color_hex ~ '^#[0-9A-Fa-f]{6}$' or color_hex is null),
  price_delta   numeric(10,2) not null default 0,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now(),
  unique (product_id, size, color)
);
create index if not exists idx_variants_product on public.product_variants(product_id);

create table if not exists public.inventory (
  variant_id        uuid primary key references public.product_variants(id) on delete cascade,
  stock_qty         int not null default 0 check (stock_qty >= 0),
  reserved_qty      int not null default 0 check (reserved_qty >= 0),
  low_stock_at      int not null default 5,
  updated_at        timestamptz not null default now(),
  check (reserved_qty <= stock_qty)
);
-- available = stock_qty - reserved_qty (compute in views/functions)

-- ---------- WISHLIST ---------------------------------------------------
create table if not exists public.wishlists (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null unique references public.profiles(id) on delete cascade,
  created_at  timestamptz not null default now()
);
create table if not exists public.wishlist_items (
  wishlist_id uuid not null references public.wishlists(id) on delete cascade,
  product_id  uuid not null references public.products(id)  on delete cascade,
  added_at    timestamptz not null default now(),
  primary key (wishlist_id, product_id)
);

-- ---------- CART -------------------------------------------------------
create table if not exists public.carts (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid unique references public.profiles(id) on delete cascade,
  session_id  text unique,               -- for anonymous carts (server-side cookie)
  status      cart_status not null default 'active',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  check (user_id is not null or session_id is not null)
);
create table if not exists public.cart_items (
  id          uuid primary key default gen_random_uuid(),
  cart_id     uuid not null references public.carts(id) on delete cascade,
  variant_id  uuid not null references public.product_variants(id) on delete restrict,
  quantity    int  not null check (quantity > 0),
  unit_price  numeric(10,2) not null,      -- snapshot at add-time
  added_at    timestamptz not null default now(),
  unique (cart_id, variant_id)
);

-- ---------- COUPONS ----------------------------------------------------
create table if not exists public.coupons (
  id                    uuid primary key default gen_random_uuid(),
  code                  citext not null unique,
  discount_type         discount_type not null,
  discount_value        numeric(10,2) not null check (discount_value > 0),
  min_order_amount      numeric(10,2) not null default 0,
  max_discount_amount   numeric(10,2),                -- caps percent coupons
  scope                 coupon_scope not null default 'cart',
  category_id           uuid references public.categories(id) on delete set null,
  product_id            uuid references public.products(id)   on delete set null,
  starts_at             timestamptz not null default now(),
  ends_at               timestamptz,
  usage_limit           int,                          -- total uses across all users
  per_user_limit        int not null default 1,
  is_active             boolean not null default true,
  created_at            timestamptz not null default now()
);
create table if not exists public.coupon_usage (
  id          uuid primary key default gen_random_uuid(),
  coupon_id   uuid not null references public.coupons(id) on delete cascade,
  user_id     uuid not null references public.profiles(id) on delete cascade,
  order_id    uuid,                        -- FK added after orders table
  used_at     timestamptz not null default now()
);
create index if not exists idx_coupon_usage_coupon on public.coupon_usage(coupon_id);
create index if not exists idx_coupon_usage_user   on public.coupon_usage(user_id);

-- ---------- ORDERS -----------------------------------------------------
create table if not exists public.orders (
  id                    uuid primary key default gen_random_uuid(),
  order_number          text not null unique,        -- e.g., KK-2026-000123
  user_id               uuid not null references public.profiles(id) on delete restrict,
  status                order_status not null default 'pending',
  subtotal              numeric(10,2) not null,
  discount_total        numeric(10,2) not null default 0,
  shipping_total        numeric(10,2) not null default 0,
  tax_total             numeric(10,2) not null default 0,
  grand_total           numeric(10,2) not null,
  currency              text not null default 'INR',
  coupon_id             uuid references public.coupons(id) on delete set null,
  coupon_code           text,
  shipping_address_id   uuid references public.addresses(id) on delete set null,
  shipping_address_snap jsonb not null,              -- frozen at checkout
  billing_address_snap  jsonb,
  placed_at             timestamptz not null default now(),
  estimated_delivery    timestamptz,
  cancelled_at          timestamptz,
  cancel_reason         text,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);
create index if not exists idx_orders_user on public.orders(user_id);
create index if not exists idx_orders_status on public.orders(status);

-- Now link coupon_usage -> orders
alter table public.coupon_usage
  drop constraint if exists coupon_usage_order_id_fkey,
  add  constraint coupon_usage_order_id_fkey
       foreign key (order_id) references public.orders(id) on delete set null;

create table if not exists public.order_items (
  id            uuid primary key default gen_random_uuid(),
  order_id      uuid not null references public.orders(id) on delete cascade,
  product_id    uuid not null references public.products(id) on delete restrict,
  variant_id    uuid not null references public.product_variants(id) on delete restrict,
  product_name  text not null,   -- snapshot
  variant_label text,             -- e.g., "M / Olive"
  sku           text not null,
  quantity      int  not null check (quantity > 0),
  unit_price    numeric(10,2) not null,
  line_total    numeric(10,2) not null
);
create index if not exists idx_order_items_order on public.order_items(order_id);

create table if not exists public.order_status_history (
  id          uuid primary key default gen_random_uuid(),
  order_id    uuid not null references public.orders(id) on delete cascade,
  status      order_status not null,
  note        text,
  changed_by  uuid references public.profiles(id) on delete set null,
  changed_at  timestamptz not null default now()
);
create index if not exists idx_osh_order on public.order_status_history(order_id);

create table if not exists public.shipping (
  order_id            uuid primary key references public.orders(id) on delete cascade,
  carrier             text,
  tracking_number     text,
  tracking_url        text,
  shipped_at          timestamptz,
  delivered_at        timestamptz,
  updated_at          timestamptz not null default now()
);

-- ---------- PAYMENTS ---------------------------------------------------
create table if not exists public.payments (
  id                    uuid primary key default gen_random_uuid(),
  order_id              uuid not null references public.orders(id) on delete cascade,
  method                payment_method not null default 'razorpay',
  status                payment_status not null default 'created',
  amount                numeric(10,2) not null,
  currency              text not null default 'INR',
  razorpay_order_id     text unique,
  razorpay_payment_id   text unique,
  razorpay_signature    text,
  failure_code          text,
  failure_reason        text,
  raw_payload           jsonb,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);
create index if not exists idx_payments_order on public.payments(order_id);

-- ---------- REVIEWS ----------------------------------------------------
create table if not exists public.reviews (
  id            uuid primary key default gen_random_uuid(),
  product_id    uuid not null references public.products(id) on delete cascade,
  user_id       uuid not null references public.profiles(id) on delete cascade,
  order_id      uuid not null references public.orders(id) on delete cascade,   -- verified purchase
  rating        int  not null check (rating between 1 and 5),
  title         text,
  body          text,
  is_approved   boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (product_id, user_id, order_id)
);
create index if not exists idx_reviews_product on public.reviews(product_id);
create table if not exists public.review_images (
  id          uuid primary key default gen_random_uuid(),
  review_id   uuid not null references public.reviews(id) on delete cascade,
  url         text not null,
  sort_order  int  not null default 0
);

-- ---------- NOTIFICATIONS (queue-shaped) ------------------------------
create table if not exists public.notifications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references public.profiles(id) on delete cascade,
  channel     notif_channel not null default 'email',
  template    text not null,               -- e.g. 'order_confirmed'
  payload     jsonb not null default '{}'::jsonb,
  status      notif_status not null default 'queued',
  attempts    int not null default 0,
  last_error  text,
  scheduled_at timestamptz not null default now(),
  sent_at     timestamptz,
  created_at  timestamptz not null default now()
);
create index if not exists idx_notif_status on public.notifications(status, scheduled_at);

-- ---------- updated_at trigger ---------------------------------------
create or replace function public.tg_touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

do $$
declare t text;
begin
  for t in
    select unnest(array[
      'profiles','addresses','categories','products','carts',
      'orders','payments','reviews','shipping','inventory'
    ])
  loop
    execute format(
      'drop trigger if exists tg_touch_%1$s on public.%1$s;
       create trigger tg_touch_%1$s before update on public.%1$s
         for each row execute function public.tg_touch_updated_at();', t);
  end loop;
end $$;

-- ---------- HELPFUL VIEWS ---------------------------------------------
create or replace view public.v_products_public as
  select p.*,
         c.slug as category_slug,
         c.name as category_name,
         (select url from public.product_images i
            where i.product_id = p.id and i.is_thumbnail limit 1) as thumbnail_url
  from public.products p
  join public.categories c on c.id = p.category_id
  where p.is_active;

create or replace view public.v_inventory_available as
  select variant_id,
         stock_qty,
         reserved_qty,
         (stock_qty - reserved_qty) as available_qty,
         (stock_qty - reserved_qty) <= low_stock_at as is_low_stock,
         stock_qty = 0 as is_out_of_stock
  from public.inventory;
