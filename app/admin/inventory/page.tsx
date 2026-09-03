import Link from 'next/link';
import { supabaseAdmin } from '@/lib/supabase/server';

export const metadata = { title: 'Inventory' };

export default async function AdminInventoryPage() {
  const sb = supabaseAdmin();
  const [{ data: low }, { data: out }] = await Promise.all([
    sb.from('v_inventory_available').select('*').lte('available_qty', 5).gt('available_qty', 0).order('available_qty').limit(100),
    sb.from('v_inventory_available').select('*').eq('available_qty', 0).limit(100)
  ]);
  // Look up variants -> product name
  const ids = [...(low ?? []), ...(out ?? [])].map((v: any) => v.variant_id);
  const variantsRes = ids.length
    ? await sb.from('product_variants').select('id,sku,size,color,product_id, products(id,name,slug)').in('id', ids)
    : { data: [] as any[] };
  const variants = variantsRes.data as any[] | null;
  const vMap = new Map((variants ?? []).map((v: any): [string, any] => [v.id, v]));

  const render = (rows: any[]) => (
    <div className="bg-white rounded-xl2 border border-line overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-ground">
          <tr className="text-left text-[11px] uppercase tracking-widest text-muted">
            <th className="px-3 py-2">Product</th><th className="px-3 py-2">SKU</th><th className="px-3 py-2">Size/Color</th>
            <th className="px-3 py-2">Stock</th><th className="px-3 py-2">Reserved</th><th className="px-3 py-2">Available</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r: any) => {
            const v = vMap.get(r.variant_id);
            return (
              <tr key={r.variant_id} className="border-t border-line">
                <td className="px-3 py-2">
                  {v?.products
                    ? <Link href={`/admin/products/${v.products.id}`} className="text-maroon underline">{v.products.name}</Link>
                    : <span className="font-mono text-xs">{r.variant_id.slice(0, 8)}…</span>}
                </td>
                <td className="px-3 py-2 text-xs font-mono">{v?.sku ?? '—'}</td>
                <td className="px-3 py-2 text-xs">{v ? `${v.size ?? ''} / ${v.color ?? ''}` : '—'}</td>
                <td className="px-3 py-2 tabular-nums">{r.stock_qty}</td>
                <td className="px-3 py-2 tabular-nums text-muted">{r.reserved_qty}</td>
                <td className="px-3 py-2 tabular-nums font-semibold">{r.available_qty}</td>
              </tr>
            );
          })}
          {rows.length === 0 && <tr><td colSpan={6} className="px-3 py-6 text-center text-muted">Nothing here.</td></tr>}
        </tbody>
      </table>
    </div>
  );

  return (
    <>
      <h1 className="font-serif text-3xl mb-5">Inventory</h1>
      <h2 className="font-serif text-xl mb-2">Out of stock ({(out ?? []).length})</h2>
      {render(out ?? [])}
      <h2 className="font-serif text-xl mt-6 mb-2">Low stock ({(low ?? []).length})</h2>
      {render(low ?? [])}
      <p className="text-xs text-muted mt-4">Edit stock counts inline from each product&rsquo;s <em>Variants &amp; inventory</em> panel.</p>
    </>
  );
}
