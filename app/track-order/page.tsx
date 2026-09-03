'use client';
import { useState } from 'react';

const STEPS = ['pending','confirmed','processing','packed','shipped','out_for_delivery','delivered'] as const;

type TrackResult = {
  order_number: string; status: string; placed_at: string;
  estimated_delivery: string | null; shipping_city: string | null;
  shipping: { carrier?: string; tracking_number?: string; tracking_url?: string; shipped_at?: string; delivered_at?: string } | null;
  history: { status: string; note: string | null; changed_at: string }[];
};

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState('');
  const [contact, setContact] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<TrackResult | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setErr(null); setResult(null);
    const r = await fetch('/api/track', { method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ order_number: orderNumber, contact }) });
    const b = await r.json();
    setBusy(false);
    if (!r.ok || !b.ok) setErr(b.message ?? 'Could not fetch order');
    else setResult(b.order);
  }
  const idx = result ? STEPS.indexOf(result.status as any) : -1;

  return (
    <section className="max-w-container mx-auto px-6 py-10">
      <div className="max-w-xl mx-auto">
        <div className="text-[11px] tracking-[0.4em] text-maroon font-semibold uppercase">Order status</div>
        <h1 className="font-serif text-4xl mt-2 mb-2">Track your order</h1>
        <p className="text-muted text-sm mb-6">Enter your order number and the email address or mobile number you used at checkout.</p>

        <form onSubmit={submit} className="bg-white border border-line rounded-xl2 p-5 grid gap-3">
          <label className="block">
            <span className="block text-[11px] font-bold tracking-widest uppercase text-muted mb-1.5">Order number</span>
            <input required value={orderNumber} onChange={e => setOrderNumber(e.target.value.toUpperCase())}
              placeholder="KK-2026-000123" className="w-full border border-line rounded-md px-3 py-2.5 text-sm font-mono outline-none focus:border-maroon" />
          </label>
          <label className="block">
            <span className="block text-[11px] font-bold tracking-widest uppercase text-muted mb-1.5">Email or 10-digit mobile</span>
            <input required value={contact} onChange={e => setContact(e.target.value)}
              className="w-full border border-line rounded-md px-3 py-2.5 text-sm outline-none focus:border-maroon" />
          </label>
          {err && <div className="text-xs bg-red-50 text-red-700 border border-red-200 rounded-md px-3 py-2">{err}</div>}
          <button type="submit" disabled={busy}
            className="bg-maroon text-white rounded-lg py-3 font-semibold disabled:opacity-60">
            {busy ? 'Looking up…' : 'Track order'}
          </button>
        </form>

        {result && (
          <div className="mt-8 bg-white border border-line rounded-xl2 p-5">
            <div className="flex justify-between items-baseline mb-4 flex-wrap gap-2">
              <div>
                <div className="font-mono text-sm font-semibold">{result.order_number}</div>
                <div className="text-xs text-muted mt-0.5">Placed {new Date(result.placed_at).toLocaleString('en-IN')}</div>
                {result.shipping_city && <div className="text-xs text-muted">Delivering to {result.shipping_city}</div>}
              </div>
              <span className="inline-block px-2 py-0.5 rounded text-[10.5px] font-bold uppercase tracking-widest bg-maroon/10 text-maroon">
                {result.status.replace('_',' ')}
              </span>
            </div>

            {['cancelled','refunded','return_requested','returned'].includes(result.status) ? (
              <p className="text-sm text-muted">This order is {result.status.replace('_',' ')}.</p>
            ) : (
              <ol className="grid grid-cols-7 gap-2 text-[10px] font-semibold uppercase tracking-widest">
                {STEPS.map((s, i) => (
                  <li key={s} className="text-center">
                    <div className={`h-2 rounded-full ${i <= idx ? 'bg-maroon' : 'bg-line'}`} />
                    <div className={`mt-2 ${i <= idx ? 'text-maroon' : 'text-muted'}`}>{s.replace('_',' ')}</div>
                  </li>
                ))}
              </ol>
            )}
            {result.estimated_delivery && (
              <div className="mt-4 text-sm text-center text-muted">
                Estimated delivery: <span className="text-ink font-semibold">
                  {new Date(result.estimated_delivery).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                </span>
              </div>
            )}
            {result.shipping?.tracking_number && (
              <div className="mt-4 text-sm">
                Shipped via <span className="font-semibold">{result.shipping.carrier}</span>{' '}
                — tracking # <span className="font-mono">{result.shipping.tracking_number}</span>
                {result.shipping.tracking_url && <> · <a className="text-maroon underline" href={result.shipping.tracking_url} target="_blank" rel="noopener noreferrer">Open with carrier →</a></>}
              </div>
            )}

            {result.history.length > 0 && (
              <details className="mt-4">
                <summary className="text-xs text-muted cursor-pointer">Full history</summary>
                <ul className="mt-2 text-xs divide-y divide-line">
                  {result.history.map((h, i) => (
                    <li key={i} className="py-1.5 flex gap-3">
                      <span className="text-muted whitespace-nowrap w-40">{new Date(h.changed_at).toLocaleString('en-IN')}</span>
                      <span className="uppercase">{h.status.replace('_',' ')}</span>
                      {h.note && <span className="text-muted italic">— {h.note}</span>}
                    </li>
                  ))}
                </ul>
              </details>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
