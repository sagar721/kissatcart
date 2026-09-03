import Link from 'next/link';
import { supabaseServer } from '@/lib/supabase/server';
import { ProductCard } from '@/components/ProductCard';
import { CategoryCard } from '@/components/CategoryCard';

export const revalidate = 60;
export const metadata = { title: 'Shop' };

export default async function ShopPage({ searchParams }: { searchParams: { new?: string } }) {
  const sb = supabaseServer();
  const [{ data: cats }, { data: rows }] = await Promise.all([
    sb.from('categories').select('*').eq('is_active', true).order('sort_order'),
    searchParams.new
      ? sb.from('v_products_public').select('*').eq('is_new_arrival', true).limit(24)
      : sb.from('v_products_public').select('*').order('is_featured', { ascending: false }).order('created_at', { ascending: false }).limit(24)
  ]);

  return (
    <section className="max-w-container mx-auto px-6 py-10">
      <div className="text-center mb-8">
        <div className="text-[11px] tracking-[0.4em] text-maroon font-semibold uppercase">The Shop</div>
        <h1 className="font-serif text-4xl mt-2">{searchParams.new ? 'New Arrivals' : 'Fresh from KismatKart'}</h1>
        <p className="text-muted text-sm mt-2">Browse by category or dive straight into the latest drop.</p>
      </div>

      <div className="grid gap-5 grid-cols-2 md:grid-cols-3 lg:grid-cols-6 mb-10">
        {(cats ?? []).map((c: any) => <CategoryCard key={c.id} c={c} />)}
      </div>

      <h2 className="font-serif text-2xl mb-4">{searchParams.new ? 'Latest arrivals' : 'Featured picks'}</h2>
      <div className="grid gap-5 grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
        {(rows ?? []).map((p: any) => <ProductCard key={p.id} p={p} />)}
      </div>
      <div className="text-center mt-8">
        <Link href="/category/shirts" className="text-maroon underline text-sm">Explore all categories →</Link>
      </div>
    </section>
  );
}
