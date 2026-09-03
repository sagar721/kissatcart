import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { supabaseServer } from '@/lib/supabase/server';
import { inr } from '@/lib/format';
import { StatusPill } from '@/components/StatusPill';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'My orders' };

export default async function OrdersPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login?next=/orders');
  const sb = supabaseServer();
  const { data: orders } = await sb.from('orders').select('*')
    .eq('user_id', user.id).order('placed_at', { ascending: false });

  return (
    <section className="max-w-container mx-auto px-6 py-10">
      <h1 className="font-serif text-3xl mb-6">My orders</h1>
      {(orders ?? []).length === 0 ? (
        <div className="bg-white border border-line rounded-xl2 p-12 text-center">
          <p className="font-serif text-2xl">No orders yet</p>
          <p className="text-muted text-sm mt-2 mb-5">When you place an order, you&rsquo;ll see it here.</p>
          <Link href="/shop" className="inline-block bg-maroon text-white rounded-lg px-5 py-3 font-semibold">Start shopping</Link>
        </div>
      ) : (
        <div className="grid gap-3">
          {(orders ?? []).map((o: any) => (
            <Link href={`/orders/${o.id}`} key={o.id}
              className="bg-white border border-line rounded-xl2 p-5 flex flex-wrap justify-between items-center gap-3 hover:border-maroon transition">
              <div>
                <div className="font-mono text-sm font-semibold">{o.order_number}</div>
                <div className="text-xs text-muted mt-0.5">Placed {new Date(o.placed_at).toLocaleString('en-IN')}</div>
              </div>
              <StatusPill status={o.status} />
              <div className="text-right tabular-nums">
                <div className="font-bold">{inr(Number(o.grand_total))}</div>
                {o.estimated_delivery && o.status !== 'delivered' && o.status !== 'cancelled' && (
                  <div className="text-xs text-muted">Arriving by {new Date(o.estimated_delivery).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
