import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { supabaseServer } from '@/lib/supabase/server';
import { inr } from '@/lib/format';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Order confirmed' };

export default async function OrderSuccessPage({ searchParams }: { searchParams: { id?: string } }) {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  if (!searchParams.id) notFound();

  const sb = supabaseServer();
  const { data: order } = await sb.from('orders').select('*')
    .eq('id', searchParams.id).eq('user_id', user.id).maybeSingle();
  if (!order) notFound();
  const { data: items } = await sb.from('order_items').select('*').eq('order_id', order.id);

  return (
    <section className="max-w-container mx-auto px-6 py-14">
      <div className="max-w-2xl mx-auto bg-white border border-line rounded-xl2 p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 grid place-items-center mx-auto mb-4">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
        </div>
        <div className="text-[11px] tracking-[0.4em] text-maroon font-semibold uppercase">Order confirmed</div>
        <h1 className="font-serif text-4xl mt-2">Thank you, {user.full_name || 'friend'}!</h1>
        <p className="text-muted mt-2">Your order <span className="font-mono text-ink font-semibold">{order.order_number}</span> has been received. A confirmation email is on its way.</p>

        <div className="mt-6 grid grid-cols-2 gap-3 text-left text-sm bg-ground rounded-xl p-4">
          <Row label="Grand total"        value={inr(Number(order.grand_total))} />
          <Row label="Items"              value={String((items ?? []).reduce((s, i) => s + i.quantity, 0))} />
          <Row label="Estimated delivery" value={order.estimated_delivery ? new Date(order.estimated_delivery).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'} />
          <Row label="Payment"            value="Captured" />
        </div>

        <div className="mt-6 flex justify-center gap-3">
          <Link href={`/orders/${order.id}`} className="bg-maroon text-white rounded-lg px-5 py-3 font-semibold">View order</Link>
          <Link href="/shop" className="border border-line rounded-lg px-5 py-3 font-semibold">Continue shopping</Link>
        </div>
      </div>
    </section>
  );
}
function Row({ label, value }: { label: string; value: string }) {
  return (<><div className="text-muted">{label}</div><div className="text-right font-semibold tabular-nums">{value}</div></>);
}
