'use client';
import { useState, useTransition } from 'react';
import { updateOrderStatus } from '../actions';

const STATUSES = ['pending','confirmed','processing','packed','shipped','out_for_delivery','delivered','cancelled','return_requested','returned','refunded'] as const;

export function OrderStatusForm({ orderId, current }: { orderId: string; current: string }) {
  const [next, setNext] = useState(current);
  const [note, setNote] = useState('');
  const [busy, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  return (
    <form onSubmit={e => { e.preventDefault(); start(async () => {
      setErr(null);
      const r = await updateOrderStatus(orderId, next, note.trim() || undefined);
      if (!r.ok) setErr(r.error); else setNote('');
    }); }} className="space-y-3">
      <select value={next} onChange={e => setNext(e.target.value)}
        className="w-full border border-line rounded-md px-3 py-2 text-sm">
        {STATUSES.map(s => <option key={s} value={s}>{s.replace('_',' ')}</option>)}
      </select>
      <textarea value={note} onChange={e => setNote(e.target.value)} rows={2} placeholder="Note (optional)"
        className="w-full border border-line rounded-md px-3 py-2 text-sm" />
      {err && <div className="text-xs rounded-md px-3 py-2 bg-red-50 text-red-700 border border-red-200">{err}</div>}
      <button type="submit" disabled={busy || next === current}
        className="w-full bg-maroon text-white rounded-lg py-2 font-semibold text-sm disabled:opacity-60">
        {busy ? 'Updating…' : 'Update status'}
      </button>
    </form>
  );
}
