import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { supabaseServer } from '@/lib/supabase/server';
import { inr, phFor } from '@/lib/format';
import { StatusPill } from '@/components/StatusPill';
import { CancelOrderButton } from './CancelOrderButton';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Order' };

const STEPS = ['pending','confirmed','processing','packed','shipped','out_for_delivery','delivered'] as const;

export default async function CustomerOrderPage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const sb = supabaseServer();
  const [{ data: order }, { data: items }, { data: history }, { data: ship }] = await Promise.all([
    sb.from('orders').select('*').eq('id', params.id).eq('user_id', user.id).maybeSingle(),
    sb.from('order_items').select('*').eq('order_id', params.id),
    sb.from('order_status_history').select('*').eq('order_id', params.id).order('changed_at'),
    sb.from('shipping').select('*').eq('order_id', params.id).maybeSingle()
  ]);
  if (!order) notFound();

  const addr = order.shipping_address_snap ?? {};
  const idx = STEPS.indexOf(order.status as any);
  const cancelable = ['pending','confirmed','processing'].includes(order.status);

  return (
    <section className="max-w-container mx-auto px-6 py-10">
      <div className="mb-6 flex justify-between items-baseline flex-wrap gap-3">
        <div>
          <h1 className="font-serif text-3xl">Order {order.order_number}</h1>
          <div className="text-xs text-muted mt-1">Placed {new Date(order.placed_at).toLocaleString('en-IN')}</div>
        </div>
        <StatusPill status={order.status} />
      </div>

      {/* Tracker */}
      {['cancelled','refunded','return_requested','returned'].includes(order.status) ? (
        <div className="bg-white border border-line rounded-xl2 p-4 text-sm text-muted mb-6">
          Order was <StatusPill status={order.status} />{order.cancel_reason ? <> — {order.cancel_reason}</> : null}.
        </div>
      ) : (
        <div className="bg-white border border-line rounded-xl2 p-5 mb-6">
          <ol className="grid grid-cols-7 gap-2 text-[10px] font-semibold uppercase tracking-widest">
            {STEPS.map((s, i) => (
              <li key={s} className="text-center">
                <div className={`h-2 rounded-full ${i <= idx ? 'bg-maroon' : 'bg-line'}`} />
                <div className={`mt-2 ${i <= idx ? 'text-maroon' : 'text-muted'}`}>{s.replace('_',' ')}</div>
              </li>
            ))}
          </ol>
          {order.estimated_delivery && idx < STEPS.length - 1 && (
            <div className="mt-4 text-sm text-muted text-center">
              Estimated delivery: <span className="text-ink font-semibold">
              {new Date(order.estimated_delivery).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
            </div>
          )}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <div className="bg-white border border-line rounded-xl2 p-5">
            <h2 className="font-serif text-lg mb-3">Items</h2>
            <ul className="divide-y divide-line">
              {(items ?? []).map((i: any) => (
                <li key={i.id} className="py-3 flex gap-3 items-center">
                  <Link href={`/product/${i.product_id}`} className={`w-14 h-16 rounded ph ${phFor(i.product_id)} flex-none`} />
                  <div className="flex-1">
                    <div className="font-semibold text-sm">{i.product_name}</div>
                    <div className="text-xs text-muted">{i.variant_label} · Qty {i.quantity}</div>
                    <div className="text-[11px] text-muted font-mono">{i.sku}</div>
                  </div>
                  <div className="tabular-nums font-semibold text-sm">{inr(Number(i.line_total))}</div>
                </li>
              ))}
            </ul>
          </div>

          {ship && (ship.tracking_number || ship.carrier) && (
            <div className="bg-white border border-line rounded-xl2 p-5">
              <h2 className="font-serif text-lg mb-2">Tracking</h2>
              <div className="text-sm">
                {ship.carrier && <div>Carrier: <span className="font-semibold">{ship.carrier}</span></div>}
                {ship.tracking_number && <div>Tracking #: <span className="font-mono">{ship.tracking_number}</span></div>}
                {ship.tracking_url && <a href={ship.tracking_url} target="_blank" rel="noopener noreferrer" className="text-maroon underline text-sm">Open tracking →</a>}
              </div>
            </div>
          )}

          {(history ?? []).length > 0 && (
            <div className="bg-white border border-line rounded-xl2 p-5">
              <h2 className="font-serif text-lg mb-3">Status history</h2>
              <ul className="text-sm divide-y divide-line">
                {(history ?? []).map((h: any) => (
                  <li key={h.id} className="py-2 flex gap-3 items-baseline">
                    <span className="text-xs text-muted w-40">{new Date(h.changed_at).toLocaleString('en-IN')}</span>
                    <StatusPill status={h.status} />
                    {h.note && <span className="text-xs text-muted italic">— {h.note}</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <aside className="space-y-4">
          <div className="bg-white border border-line rounded-xl2 p-5">
            <h2 className="font-serif text-lg mb-2">Summary</h2>
            <div className="text-sm space-y-1">
              <Row label="Subtotal" value={inr(Number(order.subtotal))} />
              {Number(order.discount_total) > 0 && <Row label={order.coupon_code ? `Discount (${order.coupon_code})` : 'Discount'} value={`- ${inr(Number(order.discount_total))}`} />}
              <Row label="Shipping" value={Number(order.shipping_total) === 0 ? 'Free' : inr(Number(order.shipping_total))} />
              <div className="h-px bg-line my-2" />
              <div className="flex justify-between font-bold"><span>Grand total</span><span className="tabular-nums">{inr(Number(order.grand_total))}</span></div>
            </div>
          </div>
          <div className="bg-white border border-line rounded-xl2 p-5">
            <h2 className="font-serif text-lg mb-2">Shipping to</h2>
            <div className="text-sm">
              <div className="font-semibold">{addr.full_name}</div>
              <div className="mt-1 text-ink/85">
                {addr.line1}{addr.line2 && `, ${addr.line2}`}<br />
                {addr.city}, {addr.state} — {addr.pincode}<br />
                <span className="text-muted text-xs">+91 {addr.phone}</span>
              </div>
            </div>
          </div>
          {cancelable && <CancelOrderButton orderId={order.id} />}
        </aside>
      </div>
    </section>
  );
}
function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between"><span className="text-muted">{label}</span><span className="tabular-nums">{value}</span></div>;
}
