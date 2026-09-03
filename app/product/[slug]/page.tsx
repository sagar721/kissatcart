import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { loadProductBySlug } from '@/lib/queries/catalog';
import { ProductCard } from '@/components/ProductCard';
import { ProductClient } from './ProductClient';
import { ReviewsSection } from '@/components/ReviewsSection';
import { inr, phFor } from '@/lib/format';

type Params = { slug: string };

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const data = await loadProductBySlug(params.slug);
  if (!data) return { title: 'Product not found' };
  const { product } = data;
  return {
    title: product.name,
    description: product.short_description ?? product.description?.slice(0, 160) ?? undefined,
    alternates: { canonical: `/product/${product.slug}` },
    openGraph: {
      title: product.name,
      description: product.short_description ?? undefined,
      type: 'website'
    }
  };
}

export default async function ProductPage({ params }: { params: Params }) {
  const data = await loadProductBySlug(params.slug);
  if (!data) notFound();
  const { product, images, variants, inventory, related } = data;

  // JSON-LD for SEO
  const jsonLd = {
    '@context': 'https://schema.org', '@type': 'Product',
    name: product.name, description: product.description ?? undefined,
    brand: { '@type': 'Brand', name: product.brand },
    sku: product.sku_prefix,
    aggregateRating: product.rating_count > 0 ? {
      '@type': 'AggregateRating', ratingValue: product.rating_avg, reviewCount: product.rating_count
    } : undefined,
    offers: { '@type': 'Offer', price: product.price, priceCurrency: 'INR', availability: 'https://schema.org/InStock' }
  };

  const gallery = images.length ? images : [{ id: 'ph', url: '', alt: product.name, is_thumbnail: true, sort_order: 0, product_id: product.id }];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="max-w-container mx-auto px-6 pt-8 pb-4">
        <nav className="text-[12.5px] text-muted">
          <Link href="/">Home</Link> <span className="mx-1.5">/</span>
          <Link href={`/category/${product.category_slug}`}>{product.category_name}</Link> <span className="mx-1.5">/</span>
          <span className="text-ink">{product.name}</span>
        </nav>
      </section>

      <section className="max-w-container mx-auto px-6 pb-14 grid gap-10 lg:grid-cols-2">
        {/* Gallery */}
        <div>
          <div className={`aspect-[3/4] rounded-xl2 overflow-hidden shadow-card ph ${phFor(product.slug)}`} />
          <div className="grid grid-cols-4 gap-3 mt-3">
            {gallery.slice(0, 4).map(img => (
              <div key={img.id} className={`aspect-square rounded-lg overflow-hidden ph ${phFor(product.slug + img.id)}`} aria-hidden />
            ))}
          </div>
        </div>

        {/* Meta + selector */}
        <div>
          <div className="font-serif text-maroon font-bold text-lg">{product.brand}<sup>®</sup></div>
          <h1 className="font-serif text-3xl md:text-4xl mt-1 leading-tight">{product.name}</h1>

          <div className="flex items-center gap-3 mt-3">
            {product.rating_count > 0 ? (
              <span className="inline-flex items-center gap-1 bg-gold text-ink text-xs font-bold px-2 py-1 rounded">
                ★ {product.rating_avg.toFixed(1)}
              </span>
            ) : <span className="text-muted text-xs">No reviews yet</span>}
            <span className="text-muted text-xs">({product.rating_count} review{product.rating_count === 1 ? '' : 's'})</span>
          </div>

          <div className="mt-4 flex items-baseline gap-3 tabular-nums">
            <span className="text-maroon font-bold text-3xl">{inr(product.price)}</span>
            <span className="text-strike line-through">{inr(product.mrp)}</span>
            <span className="text-promo font-bold">{product.discount_percent}% OFF</span>
          </div>
          <div className="text-xs text-muted mt-1">Inclusive of all taxes</div>

          <ProductClient product={product} variants={variants} inventory={Array.from(inventory.values())} />

          {product.short_description && (
            <p className="mt-6 text-sm text-ink/85 leading-relaxed">{product.short_description}</p>
          )}
        </div>
      </section>

      {/* Description + specs */}
      <section className="max-w-container mx-auto px-6 pb-14 grid gap-8 md:grid-cols-2">
        <div className="bg-white rounded-xl2 border border-line p-6">
          <h3 className="font-serif text-xl mb-3">Product Description</h3>
          <p className="text-sm text-ink/85 leading-relaxed whitespace-pre-line">{product.description}</p>
        </div>
        <div className="bg-white rounded-xl2 border border-line p-6">
          <h3 className="font-serif text-xl mb-3">Specifications</h3>
          <dl className="grid grid-cols-[140px_1fr] gap-y-2.5 text-sm">
            <dt className="text-muted">Brand</dt><dd>{product.brand}</dd>
            <dt className="text-muted">Category</dt><dd>{product.category_name}</dd>
            <dt className="text-muted">SKU</dt><dd>{product.sku_prefix}</dd>
            <dt className="text-muted">Fit</dt><dd>{product.tags?.includes('formal') ? 'Slim' : 'Regular / Oversized'}</dd>
            <dt className="text-muted">Fabric care</dt><dd>Machine wash cold, tumble dry low</dd>
            <dt className="text-muted">Country of origin</dt><dd>India</dd>
          </dl>
          <Link href="/size-guide" className="inline-block text-sm text-maroon underline mt-4">View size guide →</Link>
        </div>
      </section>

      <ReviewsSection productId={product.id} />

      {/* Related */}
      {related.length > 0 && (
        <section className="max-w-container mx-auto px-6 pb-16">
          <h3 className="font-serif text-2xl mb-5">You may also like</h3>
          <div className="grid gap-5 grid-cols-2 md:grid-cols-4">
            {related.map(p => <ProductCard key={p.id} p={p} />)}
          </div>
        </section>
      )}
    </>
  );
}
