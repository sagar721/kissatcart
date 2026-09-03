'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function ReviewForm({ productId, orderId }: { productId: string; orderId: string }) {
  const router = useRouter();
  const [rating, setRating] = useState(5);
  const [title, setTitle]   = useState('');
  const [body, setBody]     = useState('');
  const [busy, setBusy]     = useState(false);
  const [err, setErr]       = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setErr(null);
    const r = await fetch('/api/reviews', { method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ product_id: productId, order_id: orderId, rating, title, body }) });
    const b = await r.json();
    setBusy(false);
    if (!r.ok || !b.ok) return setErr(b.message ?? 'Could not save review');
    router.refresh();
  }
  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="flex gap-1">
        {[1,2,3,4,5].map(n => (
          <button key={n} type="button" onClick={() => setRating(n)}
            className={n <= rating ? 'text-2xl text-gold' : 'text-2xl text-line'}>★</button>
        ))}
      </div>
      <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Summary (optional)"
        maxLength={120} className="w-full border border-line rounded-md px-3 py-2 text-sm" />
      <textarea value={body} onChange={e => setBody(e.target.value)} rows={4} placeholder="How does it fit? What did you like?"
        maxLength={2000} className="w-full border border-line rounded-md px-3 py-2 text-sm" />
      {err && <div className="text-xs bg-red-50 text-red-700 border border-red-200 rounded-md px-3 py-2">{err}</div>}
      <button disabled={busy} className="bg-maroon text-white rounded-lg px-5 py-2.5 font-semibold text-sm disabled:opacity-60">
        {busy ? 'Posting…' : 'Post review'}
      </button>
    </form>
  );
}
