'use client';
import Link from 'next/link';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { CartLine } from '@/lib/queries/cart';
import { computeTotals, SHIPPING_FLAT, FREE_SHIPPING_AT } from '@/lib/cart/totals';
import { inr, phFor } from '@/lib/format';

type Coupon = { code: string; discount: number } | null;

export function CartClient({ initialItems }: { initialItems: CartLine[] }) {
  const router = useRouter();
  const [items, setItems] = useState<CartLine[]>(initialItems);
  const [coupon, setCoupon] = useState<Coupon>(null);
  const [couponInput, setCouponInput] = useState('');
  const [couponBusy, setCouponBusy] = useState(false);
  const [couponMsg,  setCouponMsg]  = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);
  const [busy, start] = useTransition();

  const totals = computeTotals(items, coupon?.discount ?? 0);
  const remainingToFree = Math.max(0, FREE_SHIPPING_AT - totals.subtotal);

  async function setQty(id: string, quantity: number) {
    // Optimistic update
    setItems(xs => xs.map(x => x.id === id ? { ...x, quantity } : x));
    const res = await fetch('/api/cart/items', {
      method: 'PATCH', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ item_id: id, quantity })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      alert(err.message ?? 'Could not update quantity');
      router.refresh();
    } else {
      const body = await res.json();
      if (body.clamped) setItems(xs => xs.map(x => x.id === id ? { ...x, quantity: body.quantity } : x));
    }
  }

  async function remove(id: string) {
    const prev = items;
    setItems(xs => xs.filter(x => x.id !== id));
    const res = await fetch(`/api/cart/items?id=${id}`, { method: 'DELETE' });
    if (!res.ok) { setItems(prev); alert('Could not remove item'); }
    router.refresh();
  }

  async function applyCoupon(e: React.FormEvent) {
    e.preventDefault(); setCouponBusy(true); setCouponMsg(null);
    const res = await fetch('/api/cart/coupon', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ code: couponInput.trim() })
    });
    const body = await res.json();
    setCouponBusy(false);
    if (!res.ok || !body.ok) { setCouponMsg({ kind: 'error', text: body.message ?? 'Invalid coupon' }); setCoupon(null); return; }
    setCoupon({ code: body.code, discount: Number(body.discount) });
    setCouponMsg({ kind: 'ok', text: `Applied — you saved ${inr(Number(body.discount))}` });
    setCouponInput('');
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <div className="grid gap-3">
        {items.map(it => (
          <article key={it.id} className="bg-white border border-line rounded-xl2 p-4 flex gap-4">
            <Link href={`/product/${it.product_slug}`} className="w-24 h-32 flex-none rounded-md overflow-hidden">
              <div className={`ph ${phFor(it.product_slug)} w-full h-full`} aria-hidden />
            </Link>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-serif text-maroon font-bold text-sm">{it.brand}<sup>®</sup></div>
                  <Link href={`/product/${it.product_slug}`} className="block font-semibold truncate">{it.product_name}</Link>
                  <div className="text-xs text-muted mt-0.5">
                    {it.size && <>Size: <span className="text-ink font-medium">{it.size}</span></>}
                    {it.size && it.color && <span className="mx-1.5">·</span>}
                    {it.color && <>Color: <span className="text-ink font-medium">{it.color}</span></>}
                  </div>
                  <div className="text-[11px] text-muted font-mono mt-0.5">{it.sku}</div>
                </div>
                <div className="text-right tabular-nums">
                  <div className="font-bold">{inr(it.unit_price * it.quantity)}</div>
                  {it.quantity > 1 && <div className="text-xs text-muted">{inr(it.unit_price)} × {it.quantity}</div>}
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between gap-3">
                <div className="inline-flex items-center border border-line rounded-lg overflow-hidden text-sm">
                  <button onClick={() => setQty(it.id, Math.max(1, it.quantity - 1))} disabled={it.quantity <= 1} className="px-3 py-1.5 disabled:opacity-40">−</button>
                  <span className="px-3 min-w-[36px] text-center">{it.quantity}</span>
                  <button onClick={() => setQty(it.id, Math.min(it.available_qty, it.quantity + 1))} disabled={it.quantity >= it.available_qty} className="px-3 py-1.5 disabled:opacity-40">+</button>
                </div>
                {it.quantity >= it.available_qty && <span className="text-xs text-red-600">Max available</span>}
                <button onClick={() => remove(it.id)} className="text-xs text-muted underline hover:text-red-600">Remove</button>
              </div>
            </div>
          </article>
        ))}
      </div>

      <aside className="bg-white border border-line rounded-xl2 p-5 h-max sticky top-24 space-y-4">
        <h2 className="font-serif text-xl">Order summary</h2>
        <div className="text-sm space-y-1.5">
          <Row label="Subtotal" value={inr(totals.subtotal)} />
          {coupon && <Row label={`Discount (${coupon.code})`} value={`- ${inr(totals.discount)}`} tone="promo" />}
          <Row label="Shipping" value={totals.shipping === 0 ? 'Free' : inr(totals.shipping)} />
          {remainingToFree > 0 && (
            <p className="text-[11px] text-muted italic">Add {inr(remainingToFree)} more for free shipping</p>
          )}
          <div className="h-px bg-line my-2" />
          <div className="flex justify-between text-base font-bold"><span>Grand total</span><span className="tabular-nums">{inr(totals.grand)}</span></div>
          <p className="text-[11px] text-muted">Inclusive of all taxes</p>
        </div>

        <form onSubmit={applyCoupon} className="pt-1">
          <div className="text-[11px] font-bold tracking-widest uppercase text-muted mb-1.5">Have a coupon?</div>
          <div className="flex gap-2">
            <input value={couponInput} onChange={e => setCouponInput(e.target.value.toUpperCase())}
              placeholder="WELCOME10"
              className="flex-1 border border-line rounded-md px-3 py-2 text-sm outline-none focus:border-maroon" />
            <button type="submit" disabled={couponBusy || !couponInput}
              className="bg-maroon text-white rounded-md px-4 text-sm font-semibold disabled:opacity-60">
              {couponBusy ? '…' : 'Apply'}
            </button>
          </div>
          {couponMsg && (
            <p className={`text-xs mt-1.5 ${couponMsg.kind === 'error' ? 'text-red-700' : 'text-emerald-700'}`}>{couponMsg.text}</p>
          )}
        </form>

        <Link href="/checkout" className="block bg-maroon text-white text-center rounded-lg py-3 font-semibold">
          Proceed to checkout →
        </Link>
        <Link href="/shop" className="block text-center text-xs text-muted underline">Continue shopping</Link>
      </aside>
    </div>
  );
}

function Row({ label, value, tone }: { label: string; value: string; tone?: 'promo' }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted">{label}</span>
      <span className={`tabular-nums ${tone === 'promo' ? 'text-promo font-semibold' : ''}`}>{value}</span>
    </div>
  );
}
