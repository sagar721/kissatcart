# KismatKart — Production Readiness Report

Follow-up to `INTEGRATION_TEST_REPORT.md`. Covers Resend, the Razorpay
webhook, Supabase Storage, a final build check, and a security re-audit.
No UI or architecture changes. Razorpay stays in TEST mode. No destructive
database changes were made.

## 1. Resend — verified, not changed

Checked live with an isolated test send (no queue/DB writes involved) using
the exact `EMAIL_FROM` value already in `.env.local`. Current result,
unchanged since the last report:

```
403 — "The kismatkart.com domain is not verified.
       Please, add and verify your domain on https://resend.com/domains"
```

`EMAIL_FROM` was **not** touched — you said not to change it blindly, and
there's no way to guess the right value; only you know which domain you
actually control.

**Exact Resend configuration required:**
1. Go to **resend.com/domains** → Add Domain → enter `kismatkart.com` (or whichever domain you want `orders@` to send from).
2. Resend gives you 3 DNS records (SPF `TXT`, DKIM `CNAME`/`TXT`, and a `TXT` for domain verification). Add them at your domain registrar / DNS host.
3. Wait for propagation, then click "Verify" in Resend (usually minutes, can take longer depending on DNS TTL).
4. No code or env change needed once verified — `EMAIL_FROM="KismatKart <orders@kismatkart.com>"` will start working as-is.
- If you don't own `kismatkart.com` yet or want to keep testing sooner: set `EMAIL_FROM` to Resend's sandbox sender (`onboarding@resend.dev`) temporarily — that requires no domain verification at all, but can only send to your own Resend account email.

The API key itself is a **send-only restricted key** (confirmed — it can't list/manage domains via API), which is good least-privilege practice and needs no change.

## 2. Razorpay webhook — verified correct, not faked

Re-read `app/api/webhooks/razorpay/route.ts` and `verifyWebhookSignature()`
in `lib/razorpay/client.ts` line by line:

- Reads the **raw** request body (`req.text()`) before any JSON parsing — required, because Razorpay signs the exact raw bytes.
- Computes `HMAC-SHA256(rawBody, RAZORPAY_WEBHOOK_SECRET)` and compares to the `X-Razorpay-Signature` header using `crypto.timingSafeEqual` (constant-time — no timing side-channel).
- **Fails closed**: if `RAZORPAY_WEBHOOK_SECRET` is unset, `verifyWebhookSignature` returns `false` immediately rather than skipping the check (unlike the cron-secret bug fixed in the last report).
- Handles `payment.captured` (idempotent — checks `payment.status !== 'captured'` before acting), `payment.failed` (releases stock, cancels order), `refund.processed` (restores stock, marks refunded) — matches the DB functions verified live in the previous report.

This is correctly implemented. `RAZORPAY_WEBHOOK_SECRET` is confirmed **still the placeholder** (`set-in-razorpay-dashboard`) — I did not fabricate a value, since a wrong secret would make the endpoint reject every real webhook.

**Exact Razorpay dashboard configuration required:**
1. Razorpay Dashboard → **Settings → Webhooks** → **Add New Webhook**.
2. Webhook URL: `https://<your-production-domain>/api/webhooks/razorpay` (must be publicly reachable — `localhost` won't work; for local testing, tunnel it, e.g. with ngrok, and use that URL instead).
3. Active events to enable: `payment.captured`, `payment.failed`, `refund.processed` (the three the code handles — enabling others is harmless, they're just ignored).
4. Razorpay shows you a **webhook secret** after creation — copy it into `RAZORPAY_WEBHOOK_SECRET` in `.env.local` (and in your production environment's env vars).
5. Still on TEST keys, so this webhook will only fire for TEST-mode payments until you switch to live keys (not done, per your instruction).

## 3. Supabase Storage — bucket created, upload/read/delete verified live

The `product-images` bucket **did not exist** — zero storage buckets existed
in the project at all, which meant `/api/upload` would have failed on its
very first real use. Creating a bucket is purely additive (no existing rows
or tables touched), so I created it with the same constraints already
hard-coded into `/api/upload`'s validation (5 MB limit, JPEG/PNG/WebP/AVIF
only), then tested the full path live:

| Check | Result |
|---|---|
| Bucket exists, public, correct MIME/size limits | ✅ created & confirmed |
| Upload as admin (real file, real product) | ✅ `200`, DB row + storage object created |
| Public read of the uploaded file (no auth) | ✅ `200`, correct `content-type` |
| Upload with no session | ✅ correctly rejected, `403 Forbidden` |
| Upload as a signed-in non-admin (customer role) | ✅ correctly rejected, `403 Forbidden` |
| Delete as admin | ✅ DB row + storage object both removed |

All test rows/files were deleted afterward — `product_images` for the test
product is back to exactly 5 rows (the original seed thumbnail + 4 gallery
placeholders), no test data left in any table.

**Nothing further required** for this feature — it's fully wired and working.

## 4. Application build

```
npx tsc --noEmit   → 0 errors
npm run build      → ✓ Compiled successfully, 0 errors
```

All ~60 routes build (dynamic server-rendered pages + the 2 static ones,
`robots.txt`/`sitemap.xml`). No UI files were touched in this pass — every
change since the last report was to API routes, a DB migration, and a
storage bucket. Confirmed no `.tsx`/CSS/Tailwind edits: the fixes were
`lib/queries/cart.ts`, `app/api/wishlist/route.ts`,
`app/api/cron/notifications/route.ts`, and the three migration files
(all from the previous report), plus Storage bucket creation (infra, not
code) this round. Existing UI and component structure are unchanged.

## 5. Security re-audit

- Grepped every `'use client'` file in `app/` and `components/` for
  `SERVICE_ROLE`, `RAZORPAY_KEY_SECRET`, `RESEND_API_KEY`, `WEBHOOK_SECRET`,
  `CRON_SECRET` — **zero matches**.
- Grepped the actual built client bundle (`.next/static`) for the literal
  service-role key, Razorpay secret, and Resend key — **zero matches**.
- `SUPABASE_SERVICE_ROLE_KEY`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`,
  `RESEND_API_KEY` are read only in server-only files (`lib/supabase/server.ts`,
  `lib/razorpay/client.ts`, `lib/email/resend.ts`) — none imported from any
  client component.
- No `.env.local` values were printed in this session's output; where a var
  needed confirming (e.g. `RAZORPAY_WEBHOOK_SECRET`), only a redacted
  placeholder marker was shown.
- The Resend API key was independently confirmed to be a **restricted,
  send-only key** (can't manage domains) — good defense-in-depth even if it
  ever leaked.

No new exposure introduced; nothing found to fix.

---

## Deployment checklist

- [ ] Verify `kismatkart.com` in Resend (§1) — until then, order-confirmation emails will fail (loudly, not silently — already confirmed).
- [ ] Create the Razorpay webhook and set the real `RAZORPAY_WEBHOOK_SECRET` (§2).
- [ ] Set all of `.env.local`'s variables in your hosting provider's environment settings (Vercel/etc.) — not just locally. Double check `NEXT_PUBLIC_APP_URL` gets updated to the real production URL (currently `http://localhost:3000`), since it's used in email links.
- [ ] Confirm the `product-images` bucket (§3) exists in whichever Supabase project production points at — if production is a **different** Supabase project than the one just tested, this bucket (and all 5 migrations) need to be (re)applied there too.
- [ ] Set up a scheduled trigger (Vercel Cron, GitHub Actions, etc.) to hit `/api/cron/notifications` every 1–2 minutes with the `x-cron-secret` header, so queued order-status emails actually get drained — nothing calls this automatically.
- [ ] Rotate the Supabase DB password used for this session's migration run (Dashboard → Database → Reset password) — it was shared in this chat, so treat it as no longer private.
- [ ] Review Supabase Auth settings (Dashboard → Authentication → Settings) for production: confirm email-confirmation requirements, redirect URLs (`NEXT_PUBLIC_APP_URL`-based), and rate limits are what you want for real users.
- [ ] When ready to accept real money: swap `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` / `NEXT_PUBLIC_RAZORPAY_KEY_ID` for live keys, and create a **second**, separate live-mode webhook in Razorpay with its own secret (test and live webhooks are configured independently).

## Final pre-launch test checklist

Repeat the live walkthrough from `INTEGRATION_TEST_REPORT.md` once against
whatever Supabase/Razorpay/Resend project production actually points at
(don't assume it's this same one):

- [ ] Signup → confirm a real inbox receives Supabase's confirmation email (this session used `email_confirm:true` via the admin API, which **skips** that email — never actually tested Supabase's own confirmation-email delivery)
- [ ] Login, logout, session persists across a page reload
- [ ] Add address, edit it, delete it
- [ ] Add to cart, change quantity, remove, apply/remove a coupon
- [ ] Full checkout with a **real Razorpay test card** through the actual Checkout modal in a browser (this session verified the server-side contract — order creation, signature verification, idempotency — via direct API calls with a computed signature; the Checkout.js modal opening and a human completing a test-card payment has not been visually confirmed)
- [ ] Confirm the order-confirmation email actually lands in an inbox once the domain is verified (§1)
- [ ] Cancel an order as a customer; verify stock/status
- [ ] Admin: create/edit/delete a product, upload a real image, change an order's status, create/edit a coupon
- [ ] Trigger a real webhook by completing a TEST payment after the Razorpay webhook is configured (§2) — confirm it correctly no-ops when `/api/checkout/verify` already processed the same payment (idempotency across both paths, not just repeated calls to one)
- [ ] Load the site on a phone-width viewport and confirm nothing regressed visually (no visual changes were made, but worth a final look before launch)
