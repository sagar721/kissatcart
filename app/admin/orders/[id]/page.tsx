import Link from 'next/link';
import { notFound } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabase/server';
import { inr } from '@/lib/format';
import { StatusPill } from '@/components/StatusPill';
import { OrderStatusForm } from './OrderStatusForm';
import { ShippingForm } from './ShippingForm';

export const metadata = { title: 'Order' };

export default async function AdminOrderDetail({ params }: { params: { id: string } }) {
  const sb = supabaseAdmin();
  const [{ data: order }, { data: items }, { data: history }, { data: ship }, { data: payment }] = await Promise.all([
    sb.from('orders').select('*, profiles(full_name,email,phone)').eq('id', params.id).maybeSingle(),
    sb.from('order_items').select('*').eq('order_id', params.id),
    sb.from('order_status_history').select('*').eq('order_id', params.id).order('changed_at', { ascending: false }),
    sb.from('shipping').select('*').eq('order_id', params.id).maybeSingle(),
    sb.from('payments').select('*').eq('order_id', params.id).order('created_at', { ascending: false }).limit(1).maybeSingle()
  ]);
  if (!order) notFound();
  const addr = order.shipping_address_snap ?? {};
  const cust = (order as any).profiles ?? {};

  return (
    <>
      <div className="flex items-baseline justify-between mb-5 gap-4 flex-wrap">
        <div>
          <h1 className="font-serif text-3xl">Order {order.order_number}</h1>
          <div className="text-xs text-muted mt-1">Placed {new Date(order.placed_at).toLocaleString('en-IN')}</div>
        </div>
        <StatusPill status={order.status} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="grid gap-4">
          <Card title="Items">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[11px] uppercase tracking-widest text-muted text-left">
                  <th className="pb-2">Product</th><th className="pb-2">SKU</th><th className="pb-2">Qty</th><th className="pb-2 text-right">Line total</th>
                </tr>
              </thead>
              <tbody>
                {(items ?? []).map((i: any) => (
                  <tr key={i.id} className="border-t border-line">
                    <td className="py-2">
                      <div className="font-semibold">{i.product_name}</div>
                      <div className="text-xs text-muted">{i.variant_label}</div>
                    </td>
                    <td className="py-2 font-mono text-xs">{i.sku}</td>
                    <td className="py-2 tabular-nums">{i.quantity}</td>
                    <td className="py-2 text-right tabular-nums">{inr(i.line_total)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="text-sm">
                <TotalRow label="Subtotal"          value={order.subtotal} />
                <TotalRow label={order.coupon_code ? `Discount (${order.coupon_code})` : 'Discount'} value={-Number(order.discount_total ?? 0)} />
                <TotalRow label="Shipping"          value={order.shipping_total} />
                <TotalRow label="Tax"               value={order.tax_total} />
                <TotalRow label="Grand total"       value={order.grand_total} bold />
              </tfoot>
            </table>
          </Card>

          <Card title="Status history">
            <ul className="text-sm divide-y divide-line">
              {(history ?? []).map((h: any) => (
                <li key={h.id} className="py-2 flex gap-3 items-baseline">
                  <span className="text-xs text-muted whitespace-nowrap w-40">{new Date(h.changed_at).toLocaleString('en-IN')}</span>
                  <StatusPill status={h.status} />
                  {h.note && <span className="text-muted text-xs italic">— {h.note}</span>}
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <div className="grid gap-4">
          <Card title="Update status"><OrderStatusForm orderId={order.id} current={order.status} /></Card>
          <Card title="Shipping / tracking">
            <ShippingForm orderId={order.id} initial={ship as any} />
          </Card>
          <Card title="Customer">
            <div className="text-sm">
              <div className="font-semibold">{cust.full_name || addr.full_name}</div>
              <div className="text-xs text-muted break-all">{cust.email}</div>
              {cust.phone && <div className="text-xs text-muted">+91 {cust.phone}</div>}
              <Link href={`/admin/customers?q=${encodeURIComponent(cust.email ?? '')}`} className="text-maroon underline text-xs mt-2 inline-block">View customer →</Link>
            </div>
          </Card>
          <Card title="Shipping address">
            <div className="text-sm text-ink/85">
              {addr.full_name}<br />
              {addr.line1}{addr.line2 && `, ${addr.line2}`}<br />
              {addr.city}, {addr.state} — {addr.pincode}<br />
              <span className="text-muted text-xs">+91 {addr.phone}</span>
            </div>
          </Card>
          <Card title="Payment">
            {payment ? (
              <div className="text-sm space-y-1">
                <div>Method: <span className="font-semibold">{payment.method}</span></div>
                <div>Status: <StatusPill status={payment.status} /></div>
                <div className="text-xs text-muted">Amount {inr(payment.amount)}</div>
                {payment.razorpay_payment_id && <div className="text-xs text-muted font-mono break-all">Razorpay: {payment.razorpay_payment_id}</div>}
              </div>
            ) : <div className="text-sm text-muted">No payment recorded yet.</div>}
          </Card>
        </div>
      </div>
    </>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl2 border border-line p-5">
      <h2 className="font-serif text-lg mb-3">{title}</h2>
      {children}
    </div>
  );
}
function TotalRow({ label, value, bold }: { label: string; value: number | string; bold?: boolean }) {
  return (
    <tr className={bold ? 'border-t border-line' : ''}>
      <td colSpan={3} className={`pt-2 pr-2 text-right text-muted ${bold ? 'font-semibold text-ink' : ''}`}>{label}</td>
      <td className={`pt-2 text-right tabular-nums ${bold ? 'font-bold' : ''}`}>{inr(Number(value))}</td>
    </tr>
  );
}
