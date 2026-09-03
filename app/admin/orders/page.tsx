import Link from 'next/link';
import { supabaseAdmin } from '@/lib/supabase/server';
import { inr } from '@/lib/format';
import { StatusPill } from '@/components/StatusPill';

const STATUSES = ['','pending','confirmed','processing','packed','shipped','out_for_delivery','delivered','cancelled','returned','refunded'] as const;

export default async function AdminOrdersList({ searchParams }: { searchParams: { q?: string; status?: string; page?: string } }) {
  const sb = supabaseAdmin();
  const page = Math.max(1, Number(searchParams.page ?? 1));
  const pageSize = 25; const from = (page - 1) * pageSize, to = from + pageSize - 1;

  let q = sb.from('orders').select('id,order_number,grand_total,status,placed_at,user_id', { count: 'exact' });
  if (searchParams.status) q = q.eq('status', searchParams.status);
  if (searchParams.q)      q = q.ilike('order_number', `%${searchParams.q}%`);
  q = q.order('placed_at', { ascending: false }).range(from, to);
  const { data: rows, count } = await q;
  const pageCount = Math.max(1, Math.ceil((count ?? 0) / pageSize));

  return (
    <>
      <h1 className="font-serif text-3xl mb-5">Orders <span className="text-muted text-base font-sans">({count ?? 0})</span></h1>

      <form action="/admin/orders" method="get" className="flex gap-2 mb-4">
        <input name="q" defaultValue={searchParams.q} placeholder="Search order number (KK-YYYY-…)"
          className="flex-1 bg-white border border-line rounded-lg px-3 py-2.5 text-sm" />
        <select name="status" defaultValue={searchParams.status ?? ''}
          className="bg-white border border-line rounded-lg px-3 py-2.5 text-sm">
          {STATUSES.map(s => <option key={s} value={s}>{s ? s.replace('_',' ') : 'All statuses'}</option>)}
        </select>
        <button className="bg-maroon text-white rounded-lg px-4 py-2.5 text-sm font-semibold">Filter</button>
      </form>

      <div className="bg-white rounded-xl2 border border-line overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-ground">
            <tr className="text-left text-[11px] uppercase tracking-widest text-muted">
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Placed</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {(rows ?? []).length === 0 && <tr><td colSpan={5} className="px-4 py-10 text-center text-muted">No orders yet.</td></tr>}
            {(rows ?? []).map((o: any) => (
              <tr key={o.id} className="border-t border-line">
                <td className="px-4 py-3 font-mono text-xs">{o.order_number}</td>
                <td className="px-4 py-3 tabular-nums">{inr(o.grand_total)}</td>
                <td className="px-4 py-3"><StatusPill status={o.status} /></td>
                <td className="px-4 py-3 text-xs text-muted">{new Date(o.placed_at).toLocaleString('en-IN')}</td>
                <td className="px-4 py-3 text-right"><Link href={`/admin/orders/${o.id}`} className="text-maroon underline text-sm">Open</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pageCount > 1 && (
        <div className="flex justify-center gap-1.5 mt-6 text-sm">
          {Array.from({ length: pageCount }, (_, i) => i + 1).map(n => {
            const params = new URLSearchParams(searchParams as any); params.set('page', String(n));
            return (
              <Link key={n} href={`/admin/orders?${params.toString()}`}
                className={n === page ? 'bg-maroon text-white px-3 py-1.5 rounded' : 'bg-white border border-line px-3 py-1.5 rounded'}>{n}</Link>
            );
          })}
        </div>
      )}
    </>
  );
}
