import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { loadCategoryBySlug, loadCategoryProducts, type CategoryFilter } from '@/lib/queries/catalog';
import { ProductCard } from '@/components/ProductCard';
import { CategoryFilters } from './CategoryFilters';
import type { SortKey } from '@/lib/types';

type Params = { slug: string };
type Search = { [k: string]: string | string[] | undefined };

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const cat = await loadCategoryBySlug(params.slug);
  if (!cat) return { title: 'Category not found' };
  return {
    title: `${cat.name} — Shop online`,
    description: cat.description ?? `Shop the latest ${cat.name} at KismatKart.`,
    alternates: { canonical: `/category/${cat.slug}` }
  };
}

function parseFilters(sp: Search): CategoryFilter {
  const arr = (v: string | string[] | undefined) => v ? (Array.isArray(v) ? v : v.split(',')).filter(Boolean) : undefined;
  const num = (v: string | string[] | undefined) => v && !Array.isArray(v) ? Number(v) : undefined;
  return {
    q:           typeof sp.q === 'string' ? sp.q : undefined,
    minPrice:    num(sp.min),
    maxPrice:    num(sp.max),
    sizes:       arr(sp.size),
    colors:      arr(sp.color),
    minRating:   num(sp.rating),
    minDiscount: num(sp.off),
    inStockOnly: sp.stock === '1',
    sort:        (typeof sp.sort === 'string' ? sp.sort : 'featured') as SortKey,
    page:        num(sp.page) ?? 1,
    pageSize:    12
  };
}

export default async function CategoryPage({ params, searchParams }: { params: Params; searchParams: Search }) {
  const category = await loadCategoryBySlug(params.slug);
  if (!category) notFound();

  const filters = parseFilters(searchParams);
  const { rows, total, page, pageSize } = await loadCategoryProducts(category.id, filters);
  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  return (
    <>
      <section className="max-w-container mx-auto px-6 pt-10 pb-6">
        <nav className="text-[12.5px] text-muted mb-3">
          <Link href="/">Home</Link> <span className="mx-1.5">/</span>
          <span className="text-ink">{category.name}</span>
        </nav>
        <h1 className="font-serif text-4xl md:text-5xl">{category.name}</h1>
        {category.description && <p className="text-muted mt-2 max-w-2xl">{category.description}</p>}
        <div className="text-[12.5px] text-muted mt-3">{total.toLocaleString('en-IN')} product{total === 1 ? '' : 's'}</div>
      </section>

      <section className="max-w-container mx-auto px-6 pb-16 grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside className="hidden lg:block">
          <CategoryFilters slug={category.slug} initial={filters} />
        </aside>

        <div>
          {/* Mobile filters trigger + sort */}
          <div className="flex justify-between items-center mb-4 gap-3">
            <details className="lg:hidden bg-white rounded-lg border border-line px-4 py-3 flex-1">
              <summary className="font-semibold text-sm cursor-pointer">Filters</summary>
              <div className="mt-3"><CategoryFilters slug={category.slug} initial={filters} /></div>
            </details>
            <SortSelect slug={category.slug} value={filters.sort ?? 'featured'} />
          </div>

          {rows.length === 0 ? (
            <div className="bg-white border border-line rounded-xl p-10 text-center text-muted">
              <p className="font-serif text-2xl text-ink mb-2">No products match these filters</p>
              <p className="text-sm">Try clearing a filter or widening your price range.</p>
              <Link href={`/category/${category.slug}`} className="inline-block mt-4 px-4 py-2 bg-maroon text-white rounded-lg text-sm">Clear filters</Link>
            </div>
          ) : (
            <div className="grid gap-5 grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
              {rows.map(p => <ProductCard key={p.id} p={p} />)}
            </div>
          )}

          {pageCount > 1 && (
            <Pagination slug={category.slug} page={page} pageCount={pageCount} sp={searchParams} />
          )}
        </div>
      </section>
    </>
  );
}

function SortSelect({ slug, value }: { slug: string; value: string }) {
  // GET-only form so sort survives shareable URLs
  return (
    <form action={`/category/${slug}`} method="get" className="ml-auto">
      <select name="sort" defaultValue={value}
        className="bg-white border border-line rounded-lg px-3 py-2.5 text-sm">
        <option value="featured">Featured</option>
        <option value="newest">Newest</option>
        <option value="price_asc">Price: Low to High</option>
        <option value="price_desc">Price: High to Low</option>
        <option value="rating">Top Rated</option>
        <option value="discount">Biggest Discount</option>
      </select>
      <button type="submit" className="ml-2 bg-maroon text-white rounded-lg px-3 py-2.5 text-sm">Apply</button>
    </form>
  );
}

function Pagination({ slug, page, pageCount, sp }: { slug: string; page: number; pageCount: number; sp: Search }) {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) {
    if (k === 'page' || v == null) continue;
    if (Array.isArray(v)) v.forEach(x => q.append(k, x));
    else q.set(k, v);
  }
  const link = (p: number) => { q.set('page', String(p)); return `/category/${slug}?${q.toString()}`; };
  return (
    <nav className="mt-8 flex items-center justify-center gap-1.5 text-sm">
      {page > 1 && <Link className="px-3 py-2 bg-white rounded-lg border border-line" href={link(page - 1)}>← Prev</Link>}
      {Array.from({ length: pageCount }).map((_, i) => {
        const n = i + 1;
        const active = n === page;
        return (
          <Link key={n} href={link(n)}
            className={active ? 'px-3 py-2 bg-maroon text-white rounded-lg' : 'px-3 py-2 bg-white rounded-lg border border-line'}>
            {n}
          </Link>
        );
      })}
      {page < pageCount && <Link className="px-3 py-2 bg-white rounded-lg border border-line" href={link(page + 1)}>Next →</Link>}
    </nav>
  );
}
