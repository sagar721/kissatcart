# KismatKart — full setup, deploy, and production checklist

## Complete .env.local

```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

RAZORPAY_KEY_ID=rzp_test_xxx
RAZORPAY_KEY_SECRET=xxxxxxxx
RAZORPAY_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxx

RESEND_API_KEY=re_...
EMAIL_FROM="KismatKart <orders@kismatkart.com>"

CRON_SECRET=long-random-string
NEXT_PUBLIC_APP_URL=https://kismatkart.com
NEXT_PUBLIC_APP_NAME=KismatKart
```

## 1. Supabase (one-time)

1. Create a new project. Copy URL + anon key + service-role key into `.env.local`.
2. Run migrations in order:
   ```
   psql "$DATABASE_URL" -f db/migrations/0001_schema.sql
   psql "$DATABASE_URL" -f db/migrations/0002_rls.sql
   psql "$DATABASE_URL" -f db/migrations/0003_functions.sql
   psql "$DATABASE_URL" -f db/migrations/0004_search.sql
   psql "$DATABASE_URL" -f db/migrations/0099_seed.sql
   ```
3. Create the storage bucket for product images:
   - Supabase Dashboard → Storage → New bucket → name `product-images` → Public.
4. Enable Auth providers you want (see `docs/auth-setup.md`).
5. Promote your first admin after signing up:
   ```sql
   update public.profiles set role='admin' where email='you@example.com';
   ```

## 2. Razorpay

- `docs/razorpay-setup.md` walks through test-mode keys + webhook.
- For production, generate a live-mode API key and swap the values.

## 3. Resend

1. Create a Resend account, verify your sending domain.
2. Copy the API key. Set `EMAIL_FROM` to a verified `From` address.
3. Add a cron trigger (Vercel Cron, or any external cron) that hits
   `GET /api/cron/notifications?secret=<CRON_SECRET>` every 1–2 minutes.

## 4. Local dev

```
npm install
npm run dev   # http://localhost:3000
```

## 5. Deploy (Vercel)

- Push to GitHub. Import into Vercel. Set every env var in the Project settings.
- Add a Cron: `/api/cron/notifications?secret=$CRON_SECRET` at `*/2 * * * *`.
- In Razorpay Dashboard → Webhooks, set URL to `https://YOUR-DOMAIN/api/webhooks/razorpay`.
- In Supabase → Auth → URL Config, add `https://YOUR-DOMAIN/auth/callback` to redirect URLs.

## Production checklist

- [ ] All 8 env vars set in prod (Supabase × 3, Razorpay × 3, Resend × 2, plus cron & app URL)
- [ ] Supabase RLS enabled on every user-owned table (already in 0002)
- [ ] Storage bucket `product-images` created and set to Public
- [ ] Razorpay webhook configured and delivering (test with a test payment)
- [ ] Email domain verified in Resend
- [ ] `robots.ts` / `sitemap.ts` respond correctly at `/robots.txt` and `/sitemap.xml`
- [ ] First admin promoted; test all admin CRUD once end-to-end
- [ ] Backup schedule enabled in Supabase → Database → Backups
- [ ] Google OAuth credentials use the production domain
- [ ] All test-mode Razorpay keys swapped to live-mode

## Known limitations

- Product images: placeholder gradients until you upload real photos via `/admin/products/<id>` → Images.
- Refunds are triggered manually from Razorpay dashboard; the webhook records them but there's no admin "Refund" button yet.
- Content pages are placeholder copy — replace with your final legal / brand text before launch.
- No mobile-app-style shopping list search suggestions (autocomplete). The header search hits `/search` — full page results.
- Wishlist merge on login: anonymous carts are not yet merged into the signed-in cart (the current cart flow requires sign-in from the start).

## Full route map

**Public:** `/`, `/shop`, `/search`, `/category/[slug]`, `/product/[slug]`, `/track-order`, `/about-us`, `/contact-us`, `/help`, `/faq`, `/size-guide`, `/shipping-policy`, `/return-policy`, `/privacy-policy`, `/terms`.

**Auth:** `/login`, `/signup`, `/forgot-password`, `/reset-password`, `/auth/callback`.

**Customer (signed-in):** `/profile`, `/profile/addresses`, `/cart`, `/wishlist`, `/checkout`, `/orders`, `/orders/[id]`, `/order/success`.

**Admin (role='admin' or 'staff'):** `/admin`, `/admin/products`, `/admin/products/new`, `/admin/products/[id]`, `/admin/categories`, `/admin/orders`, `/admin/orders/[id]`, `/admin/customers`, `/admin/inventory`, `/admin/reviews`, `/admin/coupons`, `/admin/coupons/new`.

**API:** `/api/cart/items`, `/api/cart/coupon`, `/api/wishlist`, `/api/reviews`, `/api/upload`, `/api/checkout/create-order`, `/api/checkout/verify`, `/api/orders/[id]/cancel`, `/api/track`, `/api/search`, `/api/webhooks/razorpay`, `/api/cron/notifications`, `/api/auth/signout`.
