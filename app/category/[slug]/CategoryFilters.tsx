'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import type { CategoryFilter } from '@/lib/queries/catalog';

const SIZES  = ['S','M','L','XL','XXL'];
const COLORS = ['Black','White','Olive','Sage','Mocha','Navy','Rust','Ivory'];

export function CategoryFilters({ slug, initial }: { slug: string; initial: CategoryFilter }) {
  const router = useRouter();
  const sp = useSearchParams();
  const [q, setQ]           = useState(initial.q ?? '');
  const [min, setMin]       = useState(initial.minPrice?.toString() ?? '');
  const [max, setMax]       = useState(initial.maxPrice?.toString() ?? '');
  const [sizes, setSizes]   = useState<string[]>(initial.sizes ?? []);
  const [colors, setColors] = useState<string[]>(initial.colors ?? []);
  const [rating, setRating] = useState<number | undefined>(initial.minRating);
  const [off, setOff]       = useState<number | undefined>(initial.minDiscount);
  const [stock, setStock]   = useState(!!initial.inStockOnly);

  useEffect(() => { /* sync when nav changes */ }, [sp]);

  function apply() {
    const p = new URLSearchParams();
    if (q)          p.set('q', q);
    if (min)        p.set('min', min);
    if (max)        p.set('max', max);
    if (sizes.length)  p.set('size', sizes.join(','));
    if (colors.length) p.set('color', colors.join(','));
    if (rating)     p.set('rating', String(rating));
    if (off)        p.set('off', String(off));
    if (stock)      p.set('stock', '1');
    const sort = sp.get('sort'); if (sort) p.set('sort', sort);
    router.push(`/category/${slug}?${p.toString()}`);
  }
  const toggle = (arr: string[], v: string) => arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v];

  return (
    <div className="bg-white rounded-xl border border-line p-4 space-y-5 text-sm">
      <FilterBlock title="Search in category">
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search…"
          className="w-full border border-line rounded-md px-3 py-2" />
      </FilterBlock>

      <FilterBlock title="Price (₹)">
        <div className="flex gap-2">
          <input inputMode="numeric" value={min} onChange={e => setMin(e.target.value)} placeholder="Min"
            className="w-full border border-line rounded-md px-3 py-2" />
          <input inputMode="numeric" value={max} onChange={e => setMax(e.target.value)} placeholder="Max"
            className="w-full border border-line rounded-md px-3 py-2" />
        </div>
      </FilterBlock>

      <FilterBlock title="Size">
        <div className="flex flex-wrap gap-1.5">
          {SIZES.map(s => (
            <button key={s} type="button" onClick={() => setSizes(a => toggle(a, s))}
              className={`px-3 py-1.5 rounded border text-xs ${sizes.includes(s) ? 'bg-maroon text-white border-maroon' : 'bg-white border-line'}`}>
              {s}
            </button>
          ))}
        </div>
      </FilterBlock>

      <FilterBlock title="Color">
        <div className="flex flex-wrap gap-1.5">
          {COLORS.map(c => (
            <button key={c} type="button" onClick={() => setColors(a => toggle(a, c))}
              className={`px-3 py-1.5 rounded border text-xs ${colors.includes(c) ? 'bg-maroon text-white border-maroon' : 'bg-white border-line'}`}>
              {c}
            </button>
          ))}
        </div>
      </FilterBlock>

      <FilterBlock title="Rating">
        <div className="flex flex-wrap gap-1.5">
          {[4, 3, 2].map(r => (
            <button key={r} type="button" onClick={() => setRating(rating === r ? undefined : r)}
              className={`px-3 py-1.5 rounded border text-xs ${rating === r ? 'bg-maroon text-white border-maroon' : 'bg-white border-line'}`}>
              {r}★ &amp; up
            </button>
          ))}
        </div>
      </FilterBlock>

      <FilterBlock title="Discount">
        <div className="flex flex-wrap gap-1.5">
          {[10, 25, 40, 60].map(o => (
            <button key={o} type="button" onClick={() => setOff(off === o ? undefined : o)}
              className={`px-3 py-1.5 rounded border text-xs ${off === o ? 'bg-maroon text-white border-maroon' : 'bg-white border-line'}`}>
              {o}%+ off
            </button>
          ))}
        </div>
      </FilterBlock>

      <label className="flex items-center gap-2 text-xs">
        <input type="checkbox" checked={stock} onChange={e => setStock(e.target.checked)} /> In stock only
      </label>

      <div className="flex gap-2 pt-1">
        <button onClick={apply} className="flex-1 bg-maroon text-white rounded-lg py-2 font-semibold">Apply</button>
        <button onClick={() => router.push(`/category/${slug}`)} className="px-3 border border-line rounded-lg">Clear</button>
      </div>
    </div>
  );
}

function FilterBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[11px] font-bold tracking-[0.18em] uppercase text-muted mb-2">{title}</div>
      {children}
    </div>
  );
}
