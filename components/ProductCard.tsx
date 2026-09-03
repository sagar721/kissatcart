import Link from 'next/link';
import type { Product } from '@/lib/types';
import { inr, phFor } from '@/lib/format';
import { WishlistButton } from './WishlistButton';

export function ProductCard({ p }: { p: Product }) {
  const tag = p.tags?.includes('formal') ? 'SLIM FIT'
            : p.category_slug === 'jeans' ? 'REGULAR FIT'
            : p.category_slug === 'cargo-pants' ? 'CARGO FIT'
            : 'OVERSIZED FIT';
  return (
    <article className="bg-card rounded-xl2 overflow-hidden shadow-card flex flex-col">
      <Link href={`/product/${p.slug}`} className="relative block aspect-[3/4] overflow-hidden">
        <div className={`ph ${phFor(p.slug)} absolute inset-0`} aria-hidden />
        <span className="absolute top-3 left-3 bg-white text-ink text-[10.5px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-[4px] shadow-sm">{tag}</span>
        {p.rating_count > 0 && (
          <span className="absolute top-3 right-3 bg-gold text-ink text-[11.5px] font-bold px-2 py-1 rounded-[4px] inline-flex items-center gap-1">
            ★ {p.rating_avg.toFixed(1)}
          </span>
        )}
        <WishlistButton productId={p.id}
          className="absolute bottom-3 left-3 w-[34px] h-[34px] rounded-full bg-white text-maroon grid place-items-center shadow-card" />
      </Link>
      <div className="p-3.5">
        <div className="font-serif font-bold text-maroon text-[15px]">
          {p.brand}<sup>®</sup>
        </div>
        <Link href={`/product/${p.slug}`} className="block text-[13px] text-muted my-0.5 leading-snug line-clamp-2 hover:text-ink">
          {p.name}
        </Link>
        <div className="mt-2 flex items-baseline gap-2 tabular-nums">
          <span className="text-maroon font-bold text-[16px]">{inr(p.price)}</span>
          <span className="text-strike line-through text-[12.5px]">{inr(p.mrp)}</span>
          <span className="text-promo font-bold text-[12px]">{p.discount_percent}% OFF</span>
        </div>
      </div>
    </article>
  );
}
