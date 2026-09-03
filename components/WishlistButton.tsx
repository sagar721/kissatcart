'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function WishlistButton({ productId, className }: { productId: string; className?: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [state, setState] = useState<'idle' | 'added' | 'removed'>('idle');

  async function toggle(e: React.MouseEvent) {
    e.preventDefault(); e.stopPropagation();
    setBusy(true);
    const res = await fetch('/api/wishlist', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ product_id: productId })
    });
    if (res.status === 401) { router.push(`/login?next=${encodeURIComponent(location.pathname)}`); return; }
    const body = await res.json().catch(() => ({}));
    if (res.ok) setState(body.state);
    setBusy(false);
  }

  return (
    <button type="button" aria-label="Add to wishlist" onClick={toggle} disabled={busy}
      className={className}
      title={state === 'added' ? 'Added to wishlist' : state === 'removed' ? 'Removed' : 'Add to wishlist'}>
      <svg width="16" height="16" viewBox="0 0 24 24"
        fill={state === 'added' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8">
        <path d="M12 21s-7-4.35-9.5-8.5C.7 8.7 3 5 6.5 5 8.7 5 10.5 6.2 12 8c1.5-1.8 3.3-3 5.5-3C21 5 23.3 8.7 21.5 12.5 19 16.65 12 21 12 21z" />
      </svg>
    </button>
  );
}
