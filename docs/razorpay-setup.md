# Phase 7–9 — Razorpay setup

## Get test-mode keys
Dashboard → Settings → API Keys → Generate Test Key. Copy Key ID (`rzp_test_…`) and Key Secret into `.env.local`:

```
RAZORPAY_KEY_ID=rzp_test_xxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxx
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxx
```

Never commit the secret. `NEXT_PUBLIC_RAZORPAY_KEY_ID` is the key that ships to the browser — it's designed to be public (Razorpay checks it against your secret server-side).

## Webhook (optional but recommended)
Dashboard → Webhooks → Add. URL: `https://YOUR-APP/api/webhooks/razorpay`. Events: `payment.captured`, `payment.failed`, `refund.processed`. Set a secret and paste it into `.env.local`:

```
RAZORPAY_WEBHOOK_SECRET=whsec_from_dashboard
```

`app/api/webhooks/razorpay/route.ts` verifies the `X-Razorpay-Signature` header using this secret. The endpoint is idempotent, so a duplicate webhook after an in-band verify won't double-commit stock.

## Payment flow (what the code does)

```
Customer → /checkout
     |
     |  POST /api/checkout/create-order
     v
Server:
  - loadCartForUser(user)
  - re-validate coupon (apply_coupon RPC)
  - create_order() RPC        ← reserves stock atomically
  - createRazorpayOrder()     ← Razorpay REST /orders
  - insert payments (status: created)
  - return { order_id, razorpay: {key_id, order_id, amount, currency} }
     |
     |  window.Razorpay(...).open()  ← Checkout.js modal
     v
Razorpay handler → POST /api/checkout/verify
     |
     v
Server:
  - verifyCheckoutSignature() ← HMAC-SHA256(rzp_order_id|rzp_payment_id, secret)
  - if signature ok:
      payments.status = 'captured'
      set_order_status(confirmed)
      commit_stock() for each item ← reserved → deducted
      empty cart, mark converted
      enqueue notifications
  - return { ok: true } → client navigates to /order/success?id=…
```

## Testing without a card

Razorpay test-mode test values (docs.razorpay.com/docs/test-payments):

- Card `4111 1111 1111 1111`, any future expiry, any CVV, any name
- UPI success: `success@razorpay`
- UPI failure: `failure@razorpay`
- Netbanking success: any bank, click "Success" on the sim page

## What is verified where

| Check | Where |
|---|---|
| Prices, discount, address ownership | server (never trust the client) |
| Stock availability | `create_order()` RPC (row-locked) |
| Razorpay callback authenticity | HMAC in `/api/checkout/verify` |
| Webhook authenticity | HMAC in `/api/webhooks/razorpay` |
| Idempotency | verify checks `payments.status = 'captured'` before committing again |

## Failure paths

- **User closes the modal** → `modal.ondismiss` → nothing is captured. Order is `pending` with reserved stock; a nightly job (Phase 16) can auto-cancel stale pending orders and release stock.
- **Payment fails at gateway** → webhook `payment.failed` → payment marked failed, order cancelled, stock released.
- **Verify signature mismatch** → server returns 400 without capturing. Same auto-cleanup as above.
- **Duplicate verify** (customer refreshes) → server detects `captured` status → returns `alreadyProcessed: true`; no double-commit.

## Refunds

Not yet wired to the Razorpay refunds API. `payments.status='refunded'` today is manual (via the webhook when you refund from the dashboard). Phase 12 will add an admin "Refund" button that calls Razorpay's refunds endpoint and marks it locally.
