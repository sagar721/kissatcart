import Link from 'next/link';
import type { Category } from '@/lib/types';
import { phFor } from '@/lib/format';

export function CategoryCard({ c }: { c: Category }) {
  return (
    <Link href={`/category/${c.slug}`}
      className="group bg-white rounded-xl2 overflow-hidden shadow-card relative pb-14">
      <div className="relative aspect-[3/4]">
        <div className={`ph ${phFor(c.slug)} absolute inset-0`} aria-hidden />
      </div>
      <div className="absolute left-4 right-4 bottom-4 bg-maroon text-white px-3.5 py-3 rounded-lg flex items-center justify-between font-semibold text-[14.5px] tracking-wide">
        <span>{c.name}</span>
        <span className="transition-transform group-hover:translate-x-1">→</span>
      </div>
    </Link>
  );
}
