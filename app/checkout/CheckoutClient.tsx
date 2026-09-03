'use client';
import Link from 'next/link';
import Script from 'next/script';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { CartLine } from '@/lib/queries/cart';
import { computeTotals } from '@/lib/cart/totals';
import { inr, phFor } from '@/lib/format';

type Address = {
  id: string; full_name: string; phone: string; line1: string; line2: string | null;
  landmark: string | null; city: string; state: string; pincode: string; is_default: boolean; type: string;
};

declare global { interface Window { Razorpay: any } }

export function CheckoutClient({
  items, addresses, userEmail, userName, userPhone
}: {
  items: CartLine[]; addresses: Address[];
  userEmail: string; userName: string | null; userPhone: string | null;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(addresses.find(a => a.is_default)?.id ?? addresses[0]?.id ?? null);
  const [coupon, setCoupon]     = useState<{ code: string; discount: number } | null>(null);
  const [couponInput, setCouponInput] = useState('');
  const [couponMsg,  setCouponMsg]  = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [err,  setErr]  = useState<string | null>(null);

  const totals = computeTotals(items, coupon?.discount ?? 0);

  async function applyCoupon() {
    setCouponMsg(null);
    const res = await fetch('/api/cart/coupon', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ code: couponInput.trim() })
    });
    const body = await res.json();
    if (!res.ok || !body.ok) { setCoupon(null); setCouponMsg(body.message ?? 'Invalid coupon'); return; }
    setCoupon({ code: body.code, discount: Number(body.discount) });
    setCouponMsg(`Applied — you saved ${inr(Number(body.discount))}`);
  }

  async function payNow() {
    setErr(null);
    if (!selected) { setErr('Please choose a shipping address.'); return; }
    setBusy(true);
    try {
      // 1. Create KismatKart order + Razorpay order (reserves stock)
      const res = await fetch('/api/checkout/create-order', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ shipping_address_id: selected, coupon_code: coupon?.code ?? null })
      });
      const body = await res.json();
      if (!res.ok || !body.ok) { setErr(body.message ?? 'Could not start checkout.'); setBusy(false); return; }

      // 2. Open Razorpay Checkout
      const rzp = new window.Razorpay({
        key: body.razorpay.key_id,
        order_id: body.razorpay.order_id,
        amount: body.razorpay.amount,
        currency: body.razorpay.currency,
        name: 'KismatKart',
        description: `Order ${body.order_number}`,
        image: '/logo-mark.png',
        prefill: { name: userName ?? '', email: userEmail, contact: userPhone ?? '' },
        theme: { color: '#7A1E2B' },
        handler: async (resp: {
          razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string;
        }) => {
          const v = await fetch('/api/checkout/verify', {
            method: 'POST', headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ order_id: body.order_id, ...resp })
          });
          const vb = await v.json();
          if (!v.ok || !vb.ok) { setErr(vb.message ?? 'Payment could not be verified.'); setBusy(false); return; }
          router.push(`/order/success?id=${body.order_id}`);
        },
        modal: { ondismiss: () => { setBusy(false); setErr('Payment cancelled. Your order is on hold and stock has been released.'); } }
      });
      rzp.on('payment.failed', (r: any) => {
        setBusy(false);
        setErr(`Payment failed${r?.error?.description ? ': ' + r.error.description : ''}. Please try again.`);
      });
      rzp.open();
    } catch (e: any) {
      setErr(e.message ?? 'Something went wrong.'); setBusy(false);
    }
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <Card title="Shipping address">
            {addresses.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-muted text-sm mb-3">You need a saved address to place an order.</p>
                <Link href="/profile/addresses" className="inline-block bg-maroon text-white rounded-lg px-4 py-2.5 font-semibold text-sm">Add address</Link>
              </div>
            ) : (
              <div className="grid gap-3">
                {addresses.map(a => (
                  <label key={a.id}
                    className={`border rounded-xl p-4 flex gap-3 items-start cursor-pointer transition ${selected === a.id ? 'border-maroon bg-maroon/5' : 'border-line hover:border-maroon/50'}`}>
                    <input type="radio" name="addr" className="mt-1"
                           checked={selected === a.id} onChange={() => setSelected(a.id)} />
                    <div className="text-sm">
                      <div className="flex items-center gap-2"><span className="font-semibold">{a.full_name}</span>
                        {a.is_default && <span className="bg-maroon/10 text-maroon text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-widest">Default</span>}
                      </div>
                      <div className="mt-1 text-ink/85">
                        {a.line1}{a.line2 && `, ${a.line2}`}, {a.city}, {a.state} — {a.pincode}
                        <span className="text-muted"> · +91 {a.phone}</span>
                      </div>
                    </div>
                  </label>
                ))}
                <Link href="/profile/addresses" className="text-xs text-maroon underline">Manage addresses →</Link>
              </div>
            )}
          </Card>

          <Card title="Delivery method">
            <label className="flex items-center gap-3 border border-maroon bg-maroon/5 rounded-xl p-4">
              <input type="radio" name="delivery" defaultChecked />
              <div>
                <div className="font-semibold text-sm">Standard delivery</div>
                <div className="text-xs text-muted">Estimated 3–5 business days · {totals.shipping === 0 ? 'FREE' : inr(totals.shipping)}</div>
              </div>
            </label>
          </Card>

          <Card title="Payment method">
            <label className="flex items-center gap-3 border border-maroon bg-maroon/5 rounded-xl p-4">
              <input type="radio" name="pay" defaultChecked />
              <div>
                <div className="font-semibold text-sm">Razorpay Secure</div>
                <div className="text-xs text-muted">UPI · Cards · Netbanking · Wallets</div>
              </div>
            </label>
            <p className="text-[11px] text-muted mt-2">Cash on Delivery coming soon.</p>
          </Card>
        </div>

        <aside className="bg-white border border-line rounded-xl2 p-5 h-max sticky top-24 space-y-4">
          <h2 className="font-serif text-xl">Order summary</h2>
          <div className="text-sm max-h-64 overflow-auto rail pr-1 space-y-3">
            {items.map(i => (
              <div key={i.id} className="flex gap-3">
                <div className={`w-14 h-16 flex-none rounded ph ${phFor(i.product_slug)}`} aria-hidden />
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-maroon font-serif font-bold">{i.brand}</div>
                  <div className="text-xs truncate">{i.product_name}</div>
                  <div className="text-[11px] text-muted">
                    {i.size && `${i.size}`}{i.size && i.color && ' · '}{i.color && i.color}{' · '}Qty {i.quantity}
                  </div>
                </div>
                <div className="tabular-nums text-sm font-semibold">{inr(i.unit_price * i.quantity)}</div>
              </div>
            ))}
          </div>

          <div>
            <div className="text-[11px] font-bold tracking-widest uppercase text-muted mb-1.5">Coupon</div>
            <div className="flex gap-2">
              <input value={couponInput} onChange={e => setCouponInput(e.target.value.toUpperCase())}
                placeholder="WELCOME10"
                className="flex-1 border border-line rounded-md px-3 py-2 text-sm outline-none focus:border-maroon" />
              <button type="button" onClick={applyCoupon} disabled={!couponInput}
                className="bg-maroon text-white rounded-md px-4 text-sm font-semibold disabled:opacity-60">Apply</button>
            </div>
            {couponMsg && <p className={`text-xs mt-1.5 ${coupon ? 'text-emerald-700' : 'text-red-700'}`}>{couponMsg}</p>}
          </div>

          <div className="text-sm space-y-1.5">
            <Row label="Subtotal" value={inr(totals.subtotal)} />
            {coupon && <Row label={`Discount (${coupon.code})`} value={`- ${inr(totals.discount)}`} tone="promo" />}
            <Row label="Shipping" value={totals.shipping === 0 ? 'Free' : inr(totals.shipping)} />
            <div className="h-px bg-line my-2" />
            <div className="flex justify-between text-base font-bold">
              <span>Grand total</span><span className="tabular-nums">{inr(totals.grand)}</span>
            </div>
          </div>

          {err && <div className="text-xs rounded-md px-3 py-2 bg-red-50 text-red-700 border border-red-200">{err}</div>}

          <button onClick={payNow} disabled={busy || !selected}
            className="w-full bg-maroon text-white rounded-lg py-3 font-semibold disabled:opacity-60">
            {busy ? 'Opening payment…' : `Pay ${inr(totals.grand)} securely`}
          </button>
          <p className="text-[11px] text-muted text-center">Payments processed by Razorpay. Your card details never touch our servers.</p>
        </aside>
      </div>
    </>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-line rounded-xl2 p-5">
      <h2 className="font-serif text-xl mb-3">{title}</h2>
      {children}
    </div>
  );
}
function Row({ label, value, tone }: { label: string; value: string; tone?: 'promo' }) {
  return <div className="flex justify-between"><span className="text-muted">{label}</span>
    <span className={`tabular-nums ${tone === 'promo' ? 'text-promo font-semibold' : ''}`}>{value}</span></div>;
}
