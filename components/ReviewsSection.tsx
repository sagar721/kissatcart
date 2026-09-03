import { supabaseServer } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth';
import { ReviewForm } from './ReviewForm';

export async function ReviewsSection({ productId }: { productId: string }) {
  const sb = supabaseServer();
  const [{ data: reviews }, user] = await Promise.all([
    sb.from('reviews').select('id,rating,title,body,created_at, profiles(full_name)').eq('product_id', productId).eq('is_approved', true).order('created_at', { ascending: false }),
    getCurrentUser()
  ]);

  // Eligible order for this user (delivered order containing this product)
  let eligibleOrderId: string | null = null;
  if (user) {
    const { data } = await sb.from('order_items')
      .select('order_id, orders!inner(id,user_id,status)')
      .eq('product_id', productId)
      .eq('orders.user_id', user.id)
      .eq('orders.status', 'delivered')
      .limit(1);
    eligibleOrderId = (data ?? [])[0]?.order_id ?? null;
  }

  const dist = [0,0,0,0,0]; // 1..5
  for (const r of reviews ?? []) dist[r.rating - 1]++;
  const total = reviews?.length ?? 0;

  return (
    <section className="max-w-container mx-auto px-6 pb-14">
      <h3 className="font-serif text-2xl mb-5">Reviews</h3>

      <div className="grid gap-6 md:grid-cols-[280px_1fr]">
        <div className="bg-white rounded-xl2 border border-line p-5">
          {total === 0 ? (
            <p className="text-muted text-sm">No reviews yet.</p>
          ) : (
            <>
              <div className="text-4xl font-bold text-maroon tabular-nums">
                {(reviews!.reduce((s, r) => s + r.rating, 0) / total).toFixed(1)}
                <span className="text-base text-muted font-normal"> / 5</span>
              </div>
              <div className="text-xs text-muted mb-3">{total} review{total === 1 ? '' : 's'}</div>
              <div className="space-y-1.5">
                {[5,4,3,2,1].map(n => {
                  const pct = total ? Math.round((dist[n-1] / total) * 100) : 0;
                  return (
                    <div key={n} className="flex items-center gap-2 text-xs">
                      <span className="w-4">{n}★</span>
                      <div className="flex-1 h-1.5 bg-line rounded-full overflow-hidden">
                        <div className="h-full bg-maroon" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="w-8 text-right text-muted">{dist[n-1]}</span>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        <div className="space-y-4">
          {eligibleOrderId && (
            <div className="bg-white rounded-xl2 border border-line p-5">
              <h4 className="font-serif text-lg mb-2">Write a review</h4>
              <p className="text-xs text-muted mb-3">You bought this — thanks! Share how it fit.</p>
              <ReviewForm productId={productId} orderId={eligibleOrderId} />
            </div>
          )}
          {(reviews ?? []).map((r: any) => (
            <article key={r.id} className="bg-white rounded-xl2 border border-line p-5">
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-gold text-ink font-bold text-xs px-2 py-0.5 rounded">★ {r.rating}</span>
                <span className="text-sm font-semibold">{r.profiles?.full_name ?? 'Verified buyer'}</span>
                <span className="text-xs text-muted ml-auto">{new Date(r.created_at).toLocaleDateString('en-IN')}</span>
              </div>
              {r.title && <div className="font-serif text-lg">{r.title}</div>}
              {r.body && <p className="text-sm text-ink/85 mt-1 whitespace-pre-line">{r.body}</p>}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
