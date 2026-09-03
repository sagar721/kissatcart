# KismatKart — Database (Phase 2)

Supabase (Postgres 15+). Migrations are idempotent and ordered by filename.

## Files

| File | Purpose |
|------|---------|
| `migrations/0001_schema.sql` | Tables, enums, indexes, triggers, `v_products_public` view |
| `migrations/0002_rls.sql`    | Row-level security policies + `public.is_admin()` helper |
| `migrations/0003_functions.sql` | Atomic checkout (`create_order`), stock reservation, coupon validation |
| `migrations/0099_seed.sql`   | 6 categories, 60 products, variants, inventory, 3 coupons |

## Table map

**Identity** — `profiles`, `addresses`
**Catalog** — `categories`, `products`, `product_images`, `product_variants`, `inventory`
**Shopping** — `wishlists`, `wishlist_items`, `carts`, `cart_items`
**Ordering** — `orders`, `order_items`, `order_status_history`, `shipping`, `payments`
**Marketing** — `coupons`, `coupon_usage`, `reviews`, `review_images`
**Ops** — `notifications`

## Local setup

1. Create a Supabase project → copy the DB URL (Project settings → Database → Connection string, "URI" mode).
2. Install the Supabase CLI or use `psql`:

```bash
export DATABASE_URL="postgres://postgres:PASSWORD@db.PROJECT.supabase.co:5432/postgres"
psql "$DATABASE_URL" -f db/migrations/0001_schema.sql
psql "$DATABASE_URL" -f db/migrations/0002_rls.sql
psql "$DATABASE_URL" -f db/migrations/0003_functions.sql
psql "$DATABASE_URL" -f db/migrations/0099_seed.sql
```

3. Promote your first admin:

```sql
update public.profiles set role='admin' where email='admin@example.com';
```

## Security model (RLS at a glance)

- **Catalog** (`products`, `categories`, `product_images`, `variants`, `inventory`) — public read; admin write.
- **User-owned** (`addresses`, `wishlist*`, `cart*`, `notifications`) — only the row's `user_id` can read/write.
- **Orders / order_items / status_history / shipping / payments** — user can READ their own; only server-side service-role writes them (post-payment verification).
- **Reviews** — user may INSERT/UPDATE only for products they have a `delivered` order for (verified purchase).
- **Coupons** — public read of active + unexpired; write is admin-only. Validation happens server-side in `apply_coupon`.

## Concurrency & inventory

Race-free stock updates use row-level `FOR UPDATE` locks:

```
reserve_stock(variant, qty) → sets reserved_qty += qty  (checks available first)
commit_stock(variant, qty)  → stock_qty -= qty; reserved_qty -= qty   (on payment success)
release_stock(variant, qty) → reserved_qty -= qty                     (on failure/cancel)
restore_stock(variant, qty) → stock_qty += qty                        (on refund)
```

`create_order()` reserves stock, writes the order + items, and records history — all in one transaction. If any variant is out of stock the whole transaction rolls back (Postgres semantics), so partial reservations never leak.

## Order lifecycle

`pending → confirmed → processing → packed → shipped → out_for_delivery → delivered`
Branches: `cancelled`, `return_requested → returned → refunded`.

Every transition writes an `order_status_history` row via `set_order_status()` (admin only), so we get an audit trail for free.

## What Phase 3 will need from this

- `v_products_public` view for the shop pages (already includes thumbnail + category info)
- `list carts` / `list wishlist_items` queries scoped by `auth.uid()` (RLS handles the rest)
- `create_order()` RPC as the single checkout entrypoint

## Known limitations (to revisit)

- Anonymous carts store `session_id`; a "merge on login" routine will be added when Phase 4 (auth) lands.
- `notifications` is a simple queue table; Phase 16 will add a Postgres LISTEN/NOTIFY worker or a scheduled Edge Function that drains it via Resend.
- No full-text search index yet — Phase 6 will add `tsvector` on `products(name, description, tags)`.
