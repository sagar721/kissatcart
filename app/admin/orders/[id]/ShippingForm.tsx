'use client';
import { useState, useTransition } from 'react';
import { updateShipping } from '../actions';

export function ShippingForm({ orderId, initial }: {
  orderId: string;
  initial?: { carrier?: string | null; tracking_number?: string | null; tracking_url?: string | null } | null;
}) {
  const [carrier, setCarrier] = useState(initial?.carrier ?? '');
  const [num, setNum]         = useState(initial?.tracking_number ?? '');
  const [url, setUrl]         = useState(initial?.tracking_url ?? '');
  const [busy, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  return (
    <form onSubmit={e => { e.preventDefault(); start(async () => {
      setMsg(null);
      const r = await updateShipping(orderId, { carrier, tracking_number: num, tracking_url: url });
      setMsg(r.ok ? 'Saved.' : r.error);
    }); }} className="space-y-2 text-sm">
      <label className="block"><span className="text-[11px] uppercase tracking-widest text-muted">Carrier</span>
        <input value={carrier} onChange={e => setCarrier(e.target.value)} className="w-full mt-1 border border-line rounded-md px-3 py-2" placeholder="Delhivery, BlueDart, …" />
      </label>
      <label className="block"><span className="text-[11px] uppercase tracking-widest text-muted">Tracking number</span>
        <input value={num} onChange={e => setNum(e.target.value)} className="w-full mt-1 border border-line rounded-md px-3 py-2 font-mono text-xs" />
      </label>
      <label className="block"><span className="text-[11px] uppercase tracking-widest text-muted">Tracking URL</span>
        <input value={url} onChange={e => setUrl(e.target.value)} className="w-full mt-1 border border-line rounded-md px-3 py-2 text-xs" placeholder="https://…" />
      </label>
      {msg && <div className="text-xs text-muted">{msg}</div>}
      <button disabled={busy} className="w-full bg-maroon text-white rounded-lg py-2 font-semibold disabled:opacity-60">
        {busy ? 'Saving…' : 'Save tracking'}
      </button>
    </form>
  );
}
