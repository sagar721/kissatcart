# KismatKart — Production Readiness Report

Final completion pass. Supersedes the "Deployment checklist" section of the
previous version of this file (kept below in spirit, not literally — see
`INTEGRATION_TEST_REPORT.md` for the original Phase-2-through-20 live
integration test this builds on). Razorpay stayed in TEST mode throughout;
no live payment credentials were used at any point. No UI/layout/design
changes were made in this pass — only bug fixes, a merge of a parallel fix
branch, and verification.

Git commit at time of writing: `742042b95c5b4e9b8f0473be0c7ecbf71c5b462f`
(merge commit, `main`, pushed to `github.com/sagar721/kissatcart`).

---

## 1. Overall status

**READY WITH MANUAL STEPS.** All application-level bugs found across two full
QA passes are fixed and verified live against the real Supabase project. The
one blocking production issue (homepage/shop 500s) was root-caused to a
stale Vercel build compiled before/without `NEXT_PUBLIC_SUPABASE_URL` and
`NEXT_PUBLIC_SUPABASE_ANON_KEY` — not an application bug — and a fresh
deploy was triggered by this session's push (see §7). Razorpay Checkout.js
(the actual browser payment modal) and real Resend email delivery remain
genuinely un-testable in this environment (no browser automation, and both
providers still have placeholder credentials) — see §4 and §5 for exact
manual steps.

## 2. Completed functionality (this pass)

- **Found and fixed a real inventory-integrity bug**: admin-cancelling any
  order past `pending` (confirmed/processing/packed/shipped) called
  `release_stock` (a no-op past `pending`, since that stock was already
  moved into a `stock_qty` decrement at payment capture) instead of
  `restore_stock`. Every admin cancellation of a *paid* order silently lost
  that stock from inventory forever. Fixed in
  [app/admin/orders/actions.ts](app/admin/orders/actions.ts); live-verified
  before and after (stock now correctly restored), and re-verified again in
  this pass with a fresh order to confirm no regression.
- **Merged a parallel fix branch** (5 commits already on `origin/main`,
  authored directly against GitHub, independently diagnosing and fixing the
  exact same class of production bug this session was asked to verify — see
  §7) with this session's local fixes. One real merge conflict
  (`middleware.ts`, two different valid fixes for the same problem) resolved
  by keeping the more complete version (modern `getAll`/`setAll` cookie API
  with correct cookie propagation on redirects, since the alternate version
  would have silently dropped a refreshed session cookie on any redirect)
  and folding in the other side's `console.error` diagnostics for
  operational visibility.
- Fixed 6 TypeScript errors in `middleware.ts` (implicit `any` on the cookie
  chunking callback).
- Added `app/api/public/health/route.ts` — a lightweight, unauthenticated,
  secret-free diagnostic endpoint (booleans/lengths only) for exactly this
  class of "is Supabase config present" question in production. Was
  previously written but never committed; committed in this pass.

## 3. Local QA result

Two full local QA passes were run against the real (non-production)
Supabase project this session was given credentials for, covering auth,
RLS, cart, wishlist, coupons, checkout, the full paid-order lifecycle,
cancellation, admin CRUD, reviews, uploads, and edge cases — **~165 live
assertions total, all passing** after the one bug above was fixed. All test
data (accounts, orders, addresses, products, coupons) was created and then
fully deleted; the database is back to exactly the seeded baseline (6
categories, 60 products, 3 coupons, 0 orders, 0 profiles) both times this
was checked.

Not testable in this environment: literal browser click-through (no headless
browser tool available). Substituted with real HTTP requests carrying
genuine Supabase session cookies, direct RLS verification via the
`@supabase/supabase-js` client, and an HTML sanity sweep for rendering
errors — this verifies functional/security correctness but is not
pixel-level visual QA.

## 4. Razorpay TEST result

**NOT VERIFIED: the actual Checkout.js browser modal + a human/test-card
payment.** `.env.local` still has placeholder Razorpay keys
(`rzp_test_xxx` / `xxxxxxxx`), and no browser automation tool is available
in this environment — exactly the two things needed for that specific test.
Do not treat this as passed.

**Verified (server-side, live):**
- Order creation → Razorpay call → graceful failure path (502, not a
  crash) when keys are placeholders, with correct rollback: pending order
  cancelled, reserved stock released, no leak — PASS
- Full paid-order lifecycle simulated end-to-end using the real
  `create_order` RPC plus a self-computed HMAC-SHA256 signature (using the
  exact secret value present in `.env.local`, run through the same
  `verifyCheckoutSignature()` code the app uses) standing in for a real
  Razorpay callback: forged signature rejected, correct signature accepts,
  duplicate verify is idempotent, stock committed, cart converted, order
  confirmed — PASS
- Razorpay webhook (`/api/webhooks/razorpay`): rejects forged signature
  (400), rejects missing signature header (400), accepts a correctly-signed
  payload (200) — PASS
- Coupon usage-limit enforcement via real order creation (`WELCOME10`,
  `per_user_limit=1`): first use succeeds and is recorded in
  `coupon_usage`, second use by the same user correctly rejected — PASS

**Manual action required:** put real Razorpay TEST keys in Vercel's
environment (and locally if you want it tested again here), then complete
one real checkout in a browser with a Razorpay test card to confirm the
Checkout.js modal itself opens and completes correctly — that specific path
has never been visually confirmed in any session.

## 5. Resend result

**NOT VERIFIED: real email delivery.** `RESEND_API_KEY` is still a
placeholder locally. Confirmed (again, this pass touched nothing here) that
the app fails **loudly and correctly** — a queued send attempt returns a
real `401 API key is invalid` from Resend's API, recorded in
`notifications.last_error`, not silently swallowed or faked as sent.

**Exact manual steps still required** (unchanged from the prior report):
1. Verify a domain in the Resend dashboard (resend.com/domains) that you
   actually control, and point `EMAIL_FROM` at it — or use Resend's sandbox
   sender (`onboarding@resend.dev`) for further testing without domain
   verification (limited to sending to your own Resend account email).
2. No code changes needed once a real, valid key + verified domain are in
   place — the send path is already correct.

## 6. Supabase result

- Schema, RLS (45 policies across 21 tables), and seed data confirmed
  present and correct in the live project (unchanged from
  `INTEGRATION_TEST_REPORT.md`, re-verified this session via direct
  `product_variants`/`coupons` queries).
- RLS verified live (this session): cross-user address read/update/delete
  blocked; anonymous client can't read `orders`/`payments`; non-admin can't
  write `products`/`coupons`; non-admin calling privileged RPCs
  (`set_order_status`, `restore_stock`, etc.) directly has no effect,
  because those functions aren't `SECURITY DEFINER` and RLS on the
  underlying tables still gates the write even when called outside the app.
- **Vercel production environment variables**: confirmed present via
  `vercel env ls production` — `NEXT_PUBLIC_SUPABASE_URL`,
  `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`,
  `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`,
  `NEXT_PUBLIC_RAZORPAY_KEY_ID`, `RESEND_API_KEY`, `EMAIL_FROM`,
  `CRON_SECRET`, `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_APP_NAME` all present
  for Production (most also for Preview). Names/types checked only — actual
  secret values were never pulled or printed, per your instruction.
- **Whether the Razorpay/Resend values in Vercel are still placeholders
  cannot be confirmed without reading them**, which this session
  deliberately avoided. Given production Razorpay order-creation has not
  been observed succeeding, they are likely still placeholders there too —
  worth confirming directly in the Vercel dashboard.

## 7. Vercel production result

**Root cause found and fixed this session.** Live production
(`https://kissatcart.vercel.app`) was tested read-only (page loads only, no
writes) before any push:

| Route | Before this session's push |
|---|---|
| `/`, `/shop` | **500** |
| `/forgot-password`, `/reset-password` | **500** |
| `/login`, `/signup`, `/terms` | 200 (but likely non-functional client-side Supabase calls — same root cause) |
| `/profile`, `/orders`, `/wishlist`, `/checkout`, `/admin` | 307 → `/login` (correct) |

Pulled live Vercel runtime logs (read-only, no secrets printed) and found
the exact error: `Error: Your project's URL and Key are required to create
a Supabase client!` — `NEXT_PUBLIC_SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_ANON_KEY`
were empty **in the currently-deployed build**, even though they are
correctly configured in the Vercel project now (§6). This is the classic
Next.js/Vercel gotcha: `NEXT_PUBLIC_*` variables are inlined at **build
time**; adding or fixing them in the dashboard does not retroactively
affect an already-built deployment — only a fresh build picks them up.

Independently of that, `origin/main` already had 5 commits (not yet in this
session's local checkout) directly addressing this same failure chain
(middleware crash → root-layout crash via unguarded `getCurrentUser()` →
build-time prerender crash on auth pages → `supabaseBrowser()` runtime
crash) — evidence of prior, separate debugging effort against the same
issue. This session merged that work with its own fixes (§2), verified the
merge compiles, builds (including a build with deliberately blank Supabase
env vars, reproducing Vercel's exact prior failure — confirmed 0 prerender
errors), and runs correctly both with blank config (auth/static pages 200,
protected routes 307, only data pages 500 as expected) and with real
config (everything 200), then pushed to `origin/main`.

That push triggered a new Vercel production deployment. After it went live,
re-testing found `/forgot-password` and `/reset-password` **still** 500ing
— fresh Vercel logs showed a different error this time:
`Error: Invalid supabaseUrl: Must be a valid HTTP or HTTPS URL`. Root cause:
the existing fallbacks in `supabaseBrowser()` and `getCurrentUser()` only
checked *truthiness* (`url || fallback`), which catches a missing value but
not a non-empty, malformed one — and `supabaseServer()`'s direct callers
(outside `getCurrentUser()`) had no fallback at all. Fixed in
[lib/supabase/client.ts](lib/supabase/client.ts) and
[lib/supabase/server.ts](lib/supabase/server.ts) to validate the URL
actually parses as http(s) (same check `middleware.ts` already uses)
before trusting it. Verified locally against both failure modes (empty;
non-empty-but-malformed) with full rebuilds, committed, and pushed
(`424a120`), triggering a second new deployment.

**After that second deployment, production is fixed**: every route in the
table above now returns the correct status (200 for public pages including
`/` and `/shop`, 307 for protected routes) — verified live post-deploy.

**Newly found, separate issue**: `/` and `/shop` no longer crash, but they
render with **no real product data** — checked the live homepage HTML for
`inr(p.price)`-formatted prices (the actual product-card price format) and
found zero; the one `₹` present is the static "Free Shipping on Orders
Above ₹599" promo-bar text, not a product. This means either production's
Supabase project has no seeded catalog, or it's a different Supabase
project than the one this session was given local credentials for — it
was not investigated further, since that requires knowing which Supabase
project production actually points to and, if it needs seeding, running
migrations against a live production database, which needs your explicit
say-so first (see §13).

## 8. Security / RLS result

- Grepped every `'use client'` file and the fresh `.next/static` build
  output for `SERVICE_ROLE`, `RAZORPAY_KEY_SECRET`, `RESEND_API_KEY`,
  `WEBHOOK_SECRET`, `CRON_SECRET` — zero matches, both this pass and the
  prior one.
- Cron endpoint (`/api/cron/notifications`) fails closed with no/wrong
  `x-cron-secret` — re-verified.
- Razorpay webhook rejects invalid/missing signatures, accepts valid ones —
  verified live this pass (not directly tested in the previous QA pass).
- No secret values were printed anywhere in this session's output, logs, or
  this report.

## 9. Admin result

Promoted a test account to `admin` via the documented `db/README.md`
procedure (no credentials guessed or assumed). All 10 admin pages + order
detail loaded correctly for the admin session; non-admin and logged-out
access correctly blocked at both the middleware and page (`requireAdmin()`)
layers. Product create/edit, category create, coupon create (including an
expired coupon, correctly rejected at checkout), customer listing, and
order status updates (including the stock-restore fix, §2) all verified via
the same `is_admin()` RLS layer the admin server actions rely on. All admin
test data deleted afterward.

## 10. Inventory / order integrity result

Full chain verified live end-to-end, twice (initial QA pass + this pass's
regression check): stock reservation → Razorpay order → signature
verification → stock commit → cart conversion → order confirmed →
cancellation → stock correctly restored. Coupon usage-limit enforcement
verified via real order creation. No stock leaks found after the fix in
§2; the fix was specifically re-tested this pass to confirm no regression
from the merge.

## 11. Responsive / UI result

No UI/layout/design changes were made in either QA pass or this one, per
your explicit instruction. No headless browser is available in this
environment, so pixel-level responsive testing (390/1280/1440px) was not
performed — only verified at the code level that responsive Tailwind
breakpoints exist on the shop/category grids and checkout layout.

**Known, unfixed UX gap** (reported previously, not touched): `Navbar`'s
primary nav links are wrapped in `hidden lg:flex` with no hamburger/mobile
menu — below 1024px, Shop/Categories/New Arrivals/About/Track
Order/Help are not reachable from the header. Left exactly as-is per your
"do not redesign" instruction; still your call.

## 12. Remaining issues

1. **Production shows no product catalog** (§7) — `/` and `/shop` no longer
   crash but render with zero real products. Needs your input: confirm
   whether production's Supabase project is the same one seeded for this
   session's local testing, or a different one that still needs migrations
   + seed data run against it.
2. Razorpay Checkout.js browser modal + real test-card payment — never
   visually confirmed in any session (needs real keys + a browser).
3. Resend domain not verified / key still a placeholder — real email
   delivery never confirmed.
4. Mobile navigation has no menu below 1024px (§11) — reported, not fixed.
5. `CRON_SECRET` is still the literal placeholder value from
   `.env.example` (functionally fine — it's non-empty so the endpoint isn't
   open — but worth rotating to a real random value before relying on it).
6. Whether Razorpay/Resend values *in Vercel* are real or still placeholders
   was not confirmed (§6) — values were never pulled to avoid exposing
   secrets; check directly in the Vercel dashboard.

## 13. Exact manual steps still required

1. **Confirm which Supabase project production points to** (§7, §12.1). If
   it's a different project than the one used for local testing this
   session, run the four migrations + seed in `db/migrations/` against it
   (see `db/README.md` for the exact `psql` commands) — same as was already
   done once for the local/staging project per `INTEGRATION_TEST_REPORT.md`.
   If it's meant to be the *same* project, double-check
   `NEXT_PUBLIC_SUPABASE_URL` in Vercel actually matches it.
2. In the Razorpay dashboard: confirm/replace TEST key ID + secret in
   Vercel's environment variables if they're still placeholders, then
   complete one real TEST checkout in a browser to confirm Checkout.js
   itself works.
3. In the Razorpay dashboard: create a webhook pointing at
   `https://<your-domain>/api/webhooks/razorpay` for events
   `payment.captured`, `payment.failed`, `refund.processed`, and put the
   real secret it gives you into `RAZORPAY_WEBHOOK_SECRET`.
4. In Resend: verify a domain you control (or switch `EMAIL_FROM` to the
   sandbox sender for now), then confirm a real order-confirmation email
   lands in an inbox.
5. Rotate `CRON_SECRET` to a real random value and set up a scheduler
   (Vercel Cron, GitHub Actions, etc.) to hit `/api/cron/notifications`
   with it every 1–2 minutes.
6. Decide on the mobile-navigation gap (§11) — separate task if you want it
   addressed, since it's a UI addition, not a bug fix.
7. Do one final manual pass on the live production URL from a real
   phone/browser to confirm what automated checks can't: the Razorpay
   modal, actual email inboxes, and visual responsive layout — once §13.1
   is resolved and the catalog is showing.

## 14. Final build / typecheck result

- `npx tsc --noEmit` → **0 errors** (both before and after the merge)
- `npm run build` → **✓ Compiled successfully**, all routes, including a
  build with deliberately blank `NEXT_PUBLIC_SUPABASE_URL`/`ANON_KEY`/
  `APP_URL` (reproducing Vercel's prior failing condition) — **0 prerender
  errors**
- Local dev server console: no errors/warnings across the entire session
- Post-cleanup DB check: seed baseline exactly restored (6 categories, 60
  products, 3 coupons, 0 orders, 0 profiles)

## 15. Git commit hash

`424a1207` (short) / full history this session added, in order:
1. `742042b` — merge of this session's fixes with the 5
   independently-authored fix commits already on `origin/main`.
2. `424a120` — fix for the malformed-URL crash found after the first
   deploy (§7).

Both pushed to `github.com/sagar721/kissatcart`, branch `main`.

---

## Post-deploy verification

Two production deployments happened during this session (each auto-triggered
by a push above). Final state, checked live against
`https://kissatcart.vercel.app` after the second deployment:

| Route | Status |
|---|---|
| `/`, `/shop` | 200 (page renders; catalog is empty — §12.1) |
| `/login`, `/signup`, `/forgot-password`, `/reset-password`, `/terms` | 200 |
| `/profile`, `/orders`, `/wishlist`, `/checkout`, `/admin` | 307 → `/login` (correct) |

No 500s anywhere. The crash this session was asked to verify/fix is fixed.
The empty-catalog finding (§12.1) is new and separate — flagged for your
decision, not fixed, since it may require running migrations against a
production database this session doesn't have confirmed access to.
