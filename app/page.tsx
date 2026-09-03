import { loadHomeData } from '@/lib/queries/catalog';
import { CategoryCard } from '@/components/CategoryCard';
import { ProductCard }  from '@/components/ProductCard';
import { PromoBanner }  from '@/components/PromoBanner';
import { TrustBar }     from '@/components/TrustBar';
import { phFor } from '@/lib/format';

export const revalidate = 60;

export default async function HomePage() {
  const { categories, arrivals, loved } = await loadHomeData();
  const thumbs = arrivals.slice(0, 7);

  return (
    <>
      {/* HERO */}
      <section className="max-w-container mx-auto px-6 pt-14 pb-12 text-center">
        <div className="text-[11px] tracking-[0.4em] text-maroon font-semibold uppercase">New Collection</div>
        <h1 className="font-serif font-bold text-[clamp(44px,6vw,78px)] leading-[1.02] mt-3.5 mb-2.5 tracking-tight text-balance">
          Fashion For Every You
        </h1>
        <div className="text-[12.5px] tracking-[0.42em] text-muted uppercase">Unleash Your Style</div>
        <div className="mt-9 grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-4 max-w-[1100px] mx-auto">
          {thumbs.map(p => (
            <div key={p.id} className="aspect-[3/4] rounded-[10px] overflow-hidden shadow-card">
              <div className={`ph ${phFor(p.slug)} w-full h-full`} aria-hidden />
            </div>
          ))}
        </div>
      </section>

      {/* TRENDING CATEGORIES */}
      <Section tag="Shop by Category" title="Trending Categories">
        <div className="grid gap-5 grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {categories.slice(0, 5).map(c => <CategoryCard key={c.id} c={c} />)}
        </div>
      </Section>

      {/* NEW ARRIVALS (horizontal rail) */}
      <Section tag="Fresh Drop" title="New Arrivals">
        <div className="rail grid grid-flow-col auto-cols-[minmax(238px,1fr)] gap-5 overflow-x-auto pb-5 snap-x snap-mandatory">
          {arrivals.map(p => (
            <div key={p.id} className="snap-start"><ProductCard p={p} /></div>
          ))}
        </div>
      </Section>

      <PromoBanner />

      {/* MOST LOVED (grid) */}
      <Section tag="Best Sellers" title="Most Loved Products">
        <div className="grid gap-5 grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {loved.slice(0, 5).map(p => <ProductCard key={p.id} p={p} />)}
        </div>
      </Section>

      <TrustBar />
    </>
  );
}

function Section({ tag, title, children }: { tag: string; title: string; children: React.ReactNode }) {
  return (
    <section className="max-w-container mx-auto px-6 mt-16">
      <div className="text-center mb-7">
        <div className="text-[11px] tracking-[0.4em] text-maroon uppercase font-semibold">{tag}</div>
        <h2 className="font-serif text-[clamp(30px,3.4vw,44px)] mt-2 tracking-tight">{title}</h2>
      </div>
      {children}
    </section>
  );
}
