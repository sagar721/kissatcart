'use client';
import Link from 'next/link';
import { useTransition } from 'react';
import { setReviewApproved, deleteReview } from './actions';

type R = {
  id: string; rating: number; title: string | null; body: string | null; is_approved: boolean;
  created_at: string; products: { name: string; slug: string }; profiles: { email: string; full_name: string | null };
};

export function ReviewsModeration({ initial }: { initial: R[] }) {
  const [busy, start] = useTransition();
  return (
    <div className="grid gap-3">
      {initial.length === 0 && <div className="bg-white border border-line rounded-xl2 p-8 text-center text-muted">No reviews yet.</div>}
      {initial.map(r => (
        <article key={r.id} className="bg-white border border-line rounded-xl2 p-5">
          <div className="flex justify-between items-baseline flex-wrap gap-2">
            <div>
              <span className="bg-gold text-ink font-bold text-xs px-2 py-0.5 rounded mr-2">★ {r.rating}</span>
              <Link href={`/product/${r.products.slug}`} className="font-semibold hover:text-maroon">{r.products.name}</Link>
              <span className="text-xs text-muted ml-2">{r.profiles.full_name ?? r.profiles.email}</span>
            </div>
            <span className={`text-[10.5px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${r.is_approved ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
              {r.is_approved ? 'Approved' : 'Hidden'}
            </span>
          </div>
          {r.title && <div className="font-serif text-lg mt-2">{r.title}</div>}
          {r.body && <p className="text-sm text-ink/85 mt-1 whitespace-pre-line">{r.body}</p>}
          <div className="flex gap-3 mt-3 text-xs">
            <button disabled={busy} onClick={() => start(() => setReviewApproved(r.id, !r.is_approved).then(() => {}))}
              className="text-maroon underline">{r.is_approved ? 'Hide' : 'Approve'}</button>
            <button disabled={busy} onClick={() => start(async () => {
              if (confirm('Delete this review?')) await deleteReview(r.id);
            })} className="text-red-600 underline">Delete</button>
            <span className="text-muted ml-auto">{new Date(r.created_at).toLocaleString('en-IN')}</span>
          </div>
        </article>
      ))}
    </div>
  );
}
