import Link from 'next/link';
import { supabaseServer } from '@/lib/supabase/server';
import { ProductCard } from '@/components/ProductCard';

export const dynamic = 'force-dynamic';
export async function generateMetadata({ searchParams }: { searchParams: { q?: string } }) {
  return { title: searchParams.q ? `Search: ${searchParams.q}` : 'Search' };
}

export default async function SearchPage({ searchParams }: { searchParams: { q?: string } }) {
  const q = (searchParams.q ?? '').trim();
  const sb = supabaseServer();
  const { data: rows } = q.length >= 2
    ? await sb.rpc('search_products', { p_q: q, p_limit: 48, p_offset: 0 })
    : { data: [] as any[] };

  return (
    <section className="max-w-container mx-auto px-6 py-10">
      <div className="mb-6">
        <div className="text-[11px] tracking-[0.4em] text-maroon font-semibold uppercase">Search</div>
        <h1 className="font-serif text-3xl mt-2">
          {q ? <>Results for <span className="italic">&ldquo;{q}&rdquo;</span></> : 'What are you looking for?'}
        </h1>
        {q && <p className="text-muted text-sm mt-1">{(rows ?? []).length} match{(rows ?? []).length === 1 ? '' : 'es'}</p>}
      </div>

      <form action="/search" method="get" className="max-w-lg mb-8 flex items-center bg-white border border-line rounded-full pl-4 pr-1 py-1">
        <input name="q" defaultValue={q} placeholder="Search shirts, jeans, hoodies…"
          className="flex-1 border-0 outline-none bg-transparent text-sm placeholder:italic placeholder:text-muted" autoFocus />
        <button className="bg-maroon text-white rounded-full px-4 py-2 text-sm font-semibold">Search</button>
      </form>

      {q && (rows ?? []).length === 0 && (
        <div className="bg-white border border-line rounded-xl2 p-12 text-center">
          <p className="font-serif text-2xl mb-2">Nothing matched &ldquo;{q}&rdquo;</p>
          <p className="text-muted text-sm mb-5">Try a shorter word or a different category.</p>
          <div className="flex justify-center gap-2 flex-wrap">
            {['Shirts','T-Shirts','Jeans','Hoodies','Cargo Pants','Formal Shirts'].map(c => (
              <Link key={c} href={`/category/${c.toLowerCase().replace(/ /g,'-')}`}
                className="border border-line rounded-full px-3 py-1.5 text-xs hover:border-maroon">{c}</Link>
            ))}
          </div>
        </div>
      )}
      {(rows ?? []).length > 0 && (
        <div className="grid gap-5 grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
          {(rows as any[]).map(p => <ProductCard key={p.id} p={p} />)}
        </div>
      )}
    </section>
  );
}
