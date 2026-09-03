import Link from 'next/link';
import { supabaseAdmin } from '@/lib/supabase/server';
import { inr } from '@/lib/format';

export const metadata = { title: 'Coupons' };

export default async function AdminCouponsPage() {
  const sb = supabaseAdmin();
  const { data } = await sb.from('coupons').select('*').order('created_at', { ascending: false });
  return (
    <>
      <div className="flex items-baseline justify-between mb-5 gap-4">
        <h1 className="font-serif text-3xl">Coupons</h1>
        <Link href="/admin/coupons/new" className="bg-maroon text-white rounded-lg px-4 py-2.5 font-semibold text-sm">+ New coupon</Link>
      </div>
      <div className="bg-white rounded-xl2 border border-line overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-ground">
            <tr className="text-left text-[11px] uppercase tracking-widest text-muted">
              <th className="px-3 py-2">Code</th><th className="px-3 py-2">Type</th><th className="px-3 py-2">Value</th>
              <th className="px-3 py-2">Min order</th><th className="px-3 py-2">Cap</th>
              <th className="px-3 py-2">Ends</th><th className="px-3 py-2">Active</th>
            </tr>
          </thead>
          <tbody>
            {(data ?? []).length === 0 && (
              <tr><td colSpan={7} className="px-3 py-8 text-center text-muted">No coupons yet.</td></tr>
            )}
            {(data ?? []).map((c: any) => (
              <tr key={c.id} className="border-t border-line">
                <td className="px-3 py-2 font-mono">{c.code}</td>
                <td className="px-3 py-2">{c.discount_type}</td>
                <td className="px-3 py-2 tabular-nums">{c.discount_type === 'percent' ? `${c.discount_value}%` : inr(c.discount_value)}</td>
                <td className="px-3 py-2 tabular-nums">{inr(c.min_order_amount)}</td>
                <td className="px-3 py-2 tabular-nums">{c.max_discount_amount ? inr(c.max_discount_amount) : '—'}</td>
                <td className="px-3 py-2 text-xs text-muted">{c.ends_at ? new Date(c.ends_at).toLocaleDateString('en-IN') : 'no end'}</td>
                <td className="px-3 py-2 text-xs">{c.is_active ? <span className="text-emerald-700 font-semibold">Active</span> : <span className="text-muted">Off</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
