'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

export function CancelOrderButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [busy, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  return (
    <button
      onClick={() => start(async () => {
        if (!confirm('Cancel this order? Any charged amount will be refunded (usually 5–7 business days).')) return;
        setErr(null);
        const r = await fetch(`/api/orders/${orderId}/cancel`, { method: 'POST' });
        const b = await r.json();
        if (!r.ok || !b.ok) return setErr(b.message ?? 'Could not cancel order.');
        router.refresh();
      })}
      disabled={busy}
      className="w-full border border-red-200 text-red-700 rounded-lg py-2.5 text-sm font-semibold hover:bg-red-50 disabled:opacity-60">
      {busy ? 'Cancelling…' : 'Cancel order'}
      {err && <div className="text-xs mt-1 font-normal">{err}</div>}
    </button>
  );
}
