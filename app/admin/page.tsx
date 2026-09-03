import Link from 'next/link';
import { supabaseAdmin } from '@/lib/supabase/server';
import { inr } from '@/lib/format';
import { StatusPill } from '@/components/StatusPill';

export default async function AdminDashboard() {
  const sb = supabaseAdmin();
  const today = new Date(); today.setHours(0, 0, 0, 0);

  const [
    { count: orderCount },
    { count: pendingCount },
    { count: deliveredCount },
    { count: customerCount },
    { count: productCount },
    { data: allRevenue },
    { data: todayRevenue },
    { data: recentOrders },
    { data: lowStock }
  ] = await Promise.all([
    sb.from('orders').select('id', { count: 'exact', head: true }),
    sb.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    sb.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'delivered'),
    sb.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'customer'),
    sb.from('products').select('id', { count: 'exact', head: true }).eq('is_active', true),
    sb.from('orders').select('grand_total').in('status', ['confirmed','processing','packed','shipped','out_for_delivery','delivered']),
    sb.from('orders').select('grand_total').gte('placed_at', today.toISOString()),
    sb.from('orders').select('id,order_number,grand_total,status,placed_at,user_id').order('placed_at', { ascending: false }).limit(8),
    sb.from('v_inventory_available').select('*').lte('available_qty', 5).order('available_qty').limit(8)
  ]);

  const revTotal = (allRevenue ?? []).reduce((s: number, r: any) => s + Number(r.grand_total ?? 0), 0);
  const revToday = (todayRevenue ?? []).reduce((s: number, r: any) => s + Number(r.grand_total ?? 0), 0);

  const tiles = [
    { label: 'Total sales',        value: inr(revTotal),              sub: 'All-time (successful)' },
    { label: "Today's sales",       value: inr(revToday),              sub: new Date().toDateString() },
    { label: 'Total orders',       value: (orderCount ?? 0).toString(),  sub: `${pendingCount ?? 0} pending · ${deliveredCount ?? 0} delivered` },
    { label: 'Customers',          value: (customerCount ?? 0).toString(), sub: 'Registered users' },
    { label: 'Active products',    value: (productCount ?? 0).toString(),  sub: 'Across all categories' },
    { label: 'Low-stock variants', value: (lowStock ?? []).length.toString(), sub: '≤ 5 available' }
  ];

  return (
    <>
      <h1 className="font-serif text-3xl mb-6">Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tiles.map(t => (
          <div key={t.label} className="bg-white rounded-xl2 border border-line p-5">
            <div className="text-[11px] uppercase tracking-widest text-muted">{t.label}</div>
            <div className="font-serif text-3xl mt-1 tabular-nums">{t.value}</div>
            <div className="text-xs text-muted mt-1">{t.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2 mt-8">
        <div className="bg-white rounded-xl2 border border-line p-5">
          <div className="flex justify-between items-baseline mb-3">
            <h2 className="font-serif text-xl">Recent orders</h2>
            <Link href="/admin/orders" className="text-xs text-maroon underline">View all</Link>
          </div>
          {(recentOrders ?? []).length === 0
            ? <div className="text-sm text-muted py-6 text-center">No orders yet.</div>
            : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-muted uppercase tracking-widest text-left">
                    <th className="pb-2">Order</th><th className="pb-2">Total</th><th className="pb-2">Status</th><th className="pb-2">Placed</th>
                  </tr>
                </thead>
                <tbody>
                  {(recentOrders as any[]).map(o => (
                    <tr key={o.id} className="border-t border-line">
                      <td className="py-2"><Link href={`/admin/orders/${o.id}`} className="text-maroon underline">{o.order_number}</Link></td>
                      <td className="py-2 tabular-nums">{inr(o.grand_total)}</td>
                      <td className="py-2"><StatusPill status={o.status} /></td>
                      <td className="py-2 text-muted text-xs">{new Date(o.placed_at).toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
        </div>

        <div className="bg-white rounded-xl2 border border-line p-5">
          <div className="flex justify-between items-baseline mb-3">
            <h2 className="font-serif text-xl">Low-stock variants</h2>
            <Link href="/admin/inventory" className="text-xs text-maroon underline">Manage inventory</Link>
          </div>
          {(lowStock ?? []).length === 0
            ? <div className="text-sm text-muted py-6 text-center">All variants are healthy.</div>
            : (
              <ul className="text-sm divide-y divide-line">
                {(lowStock as any[]).map(v => (
                  <li key={v.variant_id} className="py-2 flex justify-between">
                    <span className="font-mono text-xs text-muted">{v.variant_id.slice(0, 8)}…</span>
                    <span className="font-semibold">{v.available_qty} left</span>
                  </li>
                ))}
              </ul>
            )}
        </div>
      </div>
    </>
  );
}
