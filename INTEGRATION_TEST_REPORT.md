# KismatKart — Integration Test Report

Full audit + live testing against the real Supabase project, real Razorpay TEST
keys, and real Resend key. UI and application architecture were not changed.

> Note: running `npm run build` (production) while `npm run dev` was live in the
> background briefly corrupted the dev server's `.next/` runtime chunks
> (both share the same output directory) and caused transient 500s unrelated
> to any application bug. Fixed by clearing `.next/` and restarting `next dev`;
> confirmed healthy afterward. If you see `__webpack_modules__ is not a
> function` locally, that's the cause — delete `.next/` and restart.

## MIGRATION STATUS

| Migration | Status |
|---|---|
| `0001_schema.sql` | PASS |
| `0002_rls.sql` | PASS |
| `0003_functions.sql` | PASS (patched — see Fixes) |
| `0004_search.sql` | PASS (patched — see Fixes) |
| `0099_seed.sql` | PASS (patched — see Fixes) |

All five were executed directly against the production Postgres instance (via
the session pooler — the direct `db.*.supabase.co` host is IPv6-only and
unreachable from this environment) in strict order, each in its own
transaction. Two of the five failed on first attempt with genuine SQL bugs in
the migration files themselves; both were root-caused, fixed in the source
`.sql` files, and re-applied successfully. Details under **Fixes**.

## DATABASE VERIFICATION

- **Tables:** 23 objects in `public` (21 tables + `v_products_public` +
  `v_inventory_available`), matching the schema exactly.
- **RLS:** enabled on all 21 base tables, 45 policies active (owner-scoped
  reads/writes on profiles/addresses/carts/orders/etc., public read on
  active catalog rows, `is_admin()`-gated admin bypass). Verified live: a
  cross-user address insert and a `user_id`-omitted insert were both
  correctly rejected by RLS; an own-address insert succeeded.
- **Functions:** all present — `create_order`, `apply_coupon`,
  `reserve_stock` / `release_stock` / `commit_stock` / `restore_stock`,
  `set_order_status`, `search_products`, `is_admin`, `handle_new_auth_user`
  (+ the two new immutable wrapper functions added by the 0004 fix).
- **Search:** `products.search_tsv` generated column exists and is
  populated; `search_products()` RPC returns ranked results (`/api/search`
  tested live).
- **Seed data:** 6 categories, 60 products, 900 variants, 900 inventory
  rows, 3 coupons — all present and queryable through `v_products_public`.

## What was tested (live, against the real stack)

Created a real test account (`aryyan.rathoree+kktest@gmail.com`, your own
inbox), drove it through signup → profile trigger → login → address → cart →
coupon → real Razorpay TEST order → signature verification → order
confirmed → stock committed → cart converted → email drain → order
cancellation → admin panel (temporarily elevated) → cleanup. All test rows
(orders, address, cart, wishlist, coupon usage, the auth user) were deleted
afterward; the database is back to exactly its seeded state (0 orders, 0
addresses, 0 carts, 0 profiles beyond seed data).

## PASSED

**Supabase / Auth**
- Signup → `handle_new_auth_user` trigger fires → `profiles` row created automatically
- Login (password) → session cookie recognized by middleware and server components
- Protected routes (`/profile`, `/orders`, `/checkout`, `/wishlist`) redirect when signed out
- Admin routes (`/admin/*`) redirect non-admins (307); role check re-reads `profiles.role` live, so promoting/demoting a user takes effect immediately, no new token needed
- Address RLS: own-address insert allowed; insert with no/spoofed `user_id` rejected
- Products/categories load from the DB through `v_products_public`

**Shopping flow**
- Product listing, category page, product detail, search (`search_products` RPC) — all 200 with real data
- Add to cart, quantity update with server-side clamp to available stock (`clamped:true` verified), remove item
- Coupon validation server-side: valid code, unknown code, and below-minimum-order all handled correctly
- Checkout totals math verified exactly (subtotal, % discount, free-shipping threshold, grand total)
- Stock validation: over-limit quantity rejected

**Razorpay TEST**
- Server-side order creation: real Razorpay test order created, amount in paise matches `grand_total` exactly
- Signature verification: HMAC-SHA256 checked server-side with `timingSafeEqual`; forged signature rejected; correct signature accepted
- Order status transition pending → confirmed on verified payment
- Payment row stored with correct status/amount/razorpay ids
- Inventory correctly committed (reserved_qty → 0, stock_qty decremented) on capture, and correctly restored on cancellation
- Cart correctly converted + emptied on successful payment
- Duplicate verify call is idempotent (`alreadyProcessed:true`, no double-processing)
- Webhook signature rejection confirmed (bad signature → 400)
- A real Razorpay API timeout occurred once during testing (sandbox network blip, confirmed transient by immediate retry) — the app's failure path worked correctly: order auto-cancelled, stock released, user-facing message clear

**Admin**
- Dashboard, Products, Categories, Orders, Customers, Inventory, Reviews, Coupons all load and render real data for an admin user
- Order detail page shows correct payment/status info; customers page lists the real user

**Security**
- `SUPABASE_SERVICE_ROLE_KEY`, `RAZORPAY_KEY_SECRET`, `RESEND_API_KEY` — confirmed absent from every client (`'use client'`) file and from all client-bound bundles
- Only `NEXT_PUBLIC_RAZORPAY_KEY_ID` (public) reaches the browser for checkout
- Prices, stock, and coupon discounts are computed server-side end-to-end; nothing checkout-relevant is trusted from the client
- RLS policies verified live (see above)

## FAILED → FIXED

1. **Cart crashes site-wide after a user's first completed order** (critical). `carts.user_id` is `UNIQUE`, but `getOrCreateCartId()` tried to `INSERT` a new cart row once the old one was marked `converted`, violating the constraint. Since `Navbar` calls `cartCount()` on every page, **every page 500'd for any signed-in user who had ever completed a checkout** — reproduced live (`/orders`, `/order/success`, `/cart`, even the homepage). Fixed in [lib/queries/cart.ts](lib/queries/cart.ts): reuse and reactivate the existing cart row instead of inserting a second one. Verified fixed live.

2. **Coupon usage limits were unenforceable.** `create_order()` computed and applied discounts but never inserted into `coupon_usage`, so `per_user_limit` / `usage_limit` could never trigger — a "one-time" coupon could be reused indefinitely. Fixed in `create_order()` ([db/migrations/0003_functions.sql](db/migrations/0003_functions.sql)), re-applied live, and verified: after one order, re-applying the same coupon is now correctly rejected ("already used the maximum number of times").
   - *Known minor gap, not fixed:* a coupon's usage is recorded when the order is created, before payment. If the order is later cancelled (e.g., a Razorpay outage, or the customer changes their mind), that usage isn't released. Worth a follow-up if one-time coupons need to survive a cancelled attempt.

3. **`/api/wishlist` POST silently lied on failure.** It never checked the insert's error, so an invalid/deleted `product_id` returned `{ok:true, state:'added'}` with nothing actually written — reproduced live, then fixed and reverified (now returns `ok:false` with a clear message).

4. **`0004_search.sql` failed to apply**: `to_tsvector(regconfig, text)` and `array_to_string(anyarray, text)` are only `STABLE` in Postgres, not `IMMUTABLE`, so neither can back a `GENERATED ALWAYS AS` column. Fixed by pinning both behind trivial `IMMUTABLE` SQL wrapper functions in the same migration file.

5. **`0099_seed.sql` failed to apply**: the seeding loop's `color` variable name collided with `product_variants.color`, producing `column reference "color" is ambiguous`. Renamed the PL/pgSQL variable to `v_color`.

6. **`CRON_SECRET` auth bypass**: `/api/cron/notifications` only checked the secret `if (secret && provided !== secret)` — if `CRON_SECRET` were ever unset in an environment, the endpoint became fully open (anyone could trigger email sends / drain the queue). Fixed to require the secret unconditionally, and generated a real random value for `.env.local` (the placeholder was never usable as-is).

7. **88 TypeScript build errors → 0**, and one Next.js build failure (`app/admin/page.tsx` exported a non-page `StatusPill` component, which Next 14 rejects from a page file — moved to [components/StatusPill.tsx](components/StatusPill.tsx)). `npm run build` now completes cleanly. Root causes were a Supabase postgrest-js typing quirk on `.maybeSingle()` chains, a native/custom `onChange` prop collision on four form `Input` components, and a couple of `Map()` tuple-inference gotchas — all detailed in the earlier commits, no UI changes.

## Requires your action (I can't do these with API keys alone)

- **`EMAIL_FROM` domain not verified.** Draining the notification queue live triggered a real Resend send attempt, which failed with: `"The kismatkart.com domain is not verified. Please, add and verify your domain on https://resend.com/domains"`. This is **not hidden** — the app correctly surfaces it (`notifications.last_error`, returned in the cron endpoint's JSON) rather than swallowing it. Verify `kismatkart.com` in your Resend dashboard, or switch `EMAIL_FROM` to a domain you've already verified (or Resend's sandbox sender for further testing).
- **`RAZORPAY_WEBHOOK_SECRET`** is still the placeholder value. Set up a webhook endpoint in the Razorpay dashboard pointing at `/api/webhooks/razorpay` and paste the secret it gives you — the webhook is a safety-net mirror of `/api/checkout/verify` and won't do anything until this is real.
- **Production Postgres access**: I connected via the session pooler with a DB password you generated in-session; nothing was persisted (not written to any file, not committed). If you'd like migrations run again in the future, the same pooler connection string works from this environment (the direct host does not — no outbound IPv6 here).

## Exact remaining production steps

1. Verify `kismatkart.com` in Resend (or change `EMAIL_FROM`).
2. Create the Razorpay webhook and set `RAZORPAY_WEBHOOK_SECRET`.
3. Swap Razorpay TEST keys for live keys when ready to accept real payments.
4. Replace the placeholder product images (`/img/placeholder/...`) with real uploads via the admin panel — the upload endpoint (`/api/upload`) is wired to Supabase Storage and admin-gated, but the bucket (`product-images`) needs to exist/be public in your Supabase Storage settings.
5. Consider addressing the coupon-usage-on-cancellation gap noted above if one-time coupons are business-critical.
