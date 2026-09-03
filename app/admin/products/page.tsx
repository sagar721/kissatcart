import Link from 'next/link';
import { supabaseAdmin } from '@/lib/supabase/server';
import { inr } from '@/lib/format';

type SP = { q?: string; page?: string; category?: string };
export default async function AdminProductsList({ searchParams }: { searchParams: SP }) {
  const sb = supabaseAdmin();
  const page = Math.max(1, Number(searchParams.page ?? 1));
  const pageSize = 20;
  const from = (page - 1) * pageSize, to = from + pageSize - 1;

  let q = sb.from('products').select('id,slug,name,price,mrp,is_active,is_featured,is_new_arrival,category_id,updated_at', { count: 'exact' });
  if (searchParams.q)        q = q.ilike('name', `%${searchParams.q}%`);
  if (searchParams.category) q = q.eq('category_id', searchParams.category);
  q = q.order('updated_at', { ascending: false }).range(from, to);

  const [{ data: rows, count }, { data: cats }] = await Promise.all([
    q,
    sb.from('categories').select('id,slug,name').order('sort_order')
  ]);
  const catMap = new Map((cats as any[] ?? []).map((c: any): [string, string] => [c.id, c.name]));
  const pageCount = Math.max(1, Math.ceil((count ?? 0) / pageSize));

  return (
    <>
      <div className="flex items-baseline justify-between mb-5 gap-4">
        <h1 className="font-serif text-3xl">Products <span className="text-muted text-base font-sans">({count ?? 0})</span></h1>
        <Link href="/admin/products/new" className="bg-maroon text-white rounded-lg px-4 py-2.5 font-semibold text-sm">+ New product</Link>
      </div>

      <form action="/admin/products" method="get" className="flex gap-2 mb-4">
        <input name="q" defaultValue={searchParams.q} placeholder="Search product name…"
          className="flex-1 bg-white border border-line rounded-lg px-3 py-2.5 text-sm outline-none focus:border-maroon" />
        <select name="category" defaultValue={searchParams.category ?? ''}
          className="bg-white border border-line rounded-lg px-3 py-2.5 text-sm">
          <option value="">All categories</option>
          {(cats ?? []).map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <button className="bg-maroon text-white rounded-lg px-4 py-2.5 text-sm font-semibold">Search</button>
      </form>

      <div className="bg-white rounded-xl2 border border-line overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-ground">
            <tr className="text-left text-[11px] uppercase tracking-widest text-muted">
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">MRP</th>
              <th className="px-4 py-3">Flags</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {(rows ?? []).length === 0 && (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-muted">No products found.</td></tr>
            )}
            {(rows ?? []).map((p: any) => (
              <tr key={p.id} className="border-t border-line">
                <td className="px-4 py-3">
                  <div className="font-semibold">{p.name}</div>
                  <div className="text-xs text-muted font-mono">{p.slug}</div>
                </td>
                <td className="px-4 py-3 text-muted text-xs">{catMap.get(p.category_id) ?? '—'}</td>
                <td className="px-4 py-3 tabular-nums">{inr(p.price)}</td>
                <td className="px-4 py-3 tabular-nums text-muted line-through">{inr(p.mrp)}</td>
                <td className="px-4 py-3 text-xs">
                  {p.is_featured && <span className="bg-maroon/10 text-maroon px-2 py-0.5 rounded mr-1">Featured</span>}
                  {p.is_new_arrival && <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">New</span>}
                </td>
                <td className="px-4 py-3">{p.is_active
                  ? <span className="text-emerald-700 text-xs font-semibold">Active</span>
                  : <span className="text-muted text-xs">Draft</span>}</td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/products/${p.id}`} className="text-maroon underline text-sm">Edit</Link>
                </td>
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
              <Link key={n} href={`/admin/products?${params.toString()}`}
                className={n === page ? 'bg-maroon text-white px-3 py-1.5 rounded' : 'bg-white border border-line px-3 py-1.5 rounded'}>
                {n}
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
