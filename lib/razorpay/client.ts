/** Minimal Razorpay REST client — no SDK dependency.
 *  Server-side only. Never imports from a client component. */
import { createHmac, timingSafeEqual } from 'node:crypto';

const KEY_ID     = process.env.RAZORPAY_KEY_ID!;
const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET!;
const BASE       = 'https://api.razorpay.com/v1';

function basicAuth() {
  return 'Basic ' + Buffer.from(`${KEY_ID}:${KEY_SECRET}`).toString('base64');
}

export type RazorpayOrder = {
  id: string; entity: 'order'; amount: number; amount_paid: number; amount_due: number;
  currency: string; receipt?: string; status: string; created_at: number;
};

/** Amount is in the smallest unit — paise for INR. */
export async function createRazorpayOrder(input: {
  amount: number; currency?: 'INR'; receipt: string; notes?: Record<string, string>;
}): Promise<RazorpayOrder> {
  const res = await fetch(`${BASE}/orders`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: basicAuth() },
    body: JSON.stringify({
      amount: Math.round(input.amount),
      currency: input.currency ?? 'INR',
      receipt: input.receipt,
      payment_capture: 1,
      notes: input.notes ?? {}
    })
  });
  if (!res.ok) throw new Error(`Razorpay order create failed: ${res.status} ${await res.text()}`);
  return res.json();
}

/** Constant-time HMAC verification of the checkout callback. */
export function verifyCheckoutSignature(input: {
  razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string;
}) {
  const expected = createHmac('sha256', KEY_SECRET)
    .update(`${input.razorpay_order_id}|${input.razorpay_payment_id}`)
    .digest('hex');
  const a = Buffer.from(expected, 'hex');
  const b = Buffer.from(input.razorpay_signature, 'hex');
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

/** Verify a webhook payload signature. Razorpay sends X-Razorpay-Signature. */
export function verifyWebhookSignature(rawBody: string, signature: string) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) return false;
  const expected = createHmac('sha256', secret).update(rawBody).digest('hex');
  const a = Buffer.from(expected, 'hex');
  const b = Buffer.from(signature, 'hex');
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
