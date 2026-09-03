'use client';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Product, ProductVariant, Inventory } from '@/lib/types';

export function ProductClient({
  product, variants, inventory
}: { product: Product; variants: ProductVariant[]; inventory: Inventory[] }) {
  const router = useRouter();
  const invMap = useMemo(() => new Map(inventory.map(i => [i.variant_id, i])), [inventory]);

  const sizes = useMemo(() => Array.from(new Set(variants.map(v => v.size).filter(Boolean))) as string[], [variants]);
  const colors = useMemo(() => {
    const seen = new Map<string, string | null>();
    for (const v of variants) if (v.color && !seen.has(v.color)) seen.set(v.color, v.color_hex);
    return Array.from(seen, ([name, hex]) => ({ name, hex }));
  }, [variants]);

  const [size, setSize]   = useState<string | null>(sizes[0] ?? null);
  const [color, setColor] = useState<string | null>(colors[0]?.name ?? null);
  const [qty, setQty]     = useState(1);
  const [busy, setBusy]   = useState<'cart' | 'buy' | null>(null);

  const variant = variants.find(v => v.size === size && v.color === color) ?? null;
  const inv     = variant ? invMap.get(variant.id) : undefined;
  const avail   = inv?.available_qty ?? 0;
  const outOfStock = !variant || avail <= 0;

  async function addToCart(buyNow = false) {
    if (!variant) return;
    setBusy(buyNow ? 'buy' : 'cart');
    try {
      const res = await fetch('/api/cart/items', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ variant_id: variant.id, quantity: qty })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(err.message ?? 'Could not add to cart. Please sign in.');
        return;
      }
      router.push(buyNow ? '/checkout' : '/cart');
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="mt-6 space-y-5">
      {colors.length > 0 && (
        <div>
          <div className="text-xs font-bold tracking-widest uppercase text-muted mb-2">Color: <span className="text-ink">{color}</span></div>
          <div className="flex flex-wrap gap-2">
            {colors.map(c => (
              <button key={c.name} type="button" onClick={() => setColor(c.name)}
                className={`w-9 h-9 rounded-full border-2 ${color === c.name ? 'border-maroon ring-2 ring-maroon/20' : 'border-line'}`}
                style={{ background: c.hex ?? '#ccc' }} aria-label={c.name} title={c.name} />
            ))}
          </div>
        </div>
      )}

      {sizes.length > 0 && (
        <div>
          <div className="flex justify-between items-center mb-2">
            <div className="text-xs font-bold tracking-widest uppercase text-muted">Size: <span className="text-ink">{size}</span></div>
            <a href="/size-guide" className="text-xs text-maroon underline">Size guide</a>
          </div>
          <div className="flex flex-wrap gap-2">
            {sizes.map(s => {
              const anyStock = variants.some(v => v.size === s && v.color === color && (invMap.get(v.id)?.available_qty ?? 0) > 0);
              return (
                <button key={s} type="button" onClick={() => setSize(s)} disabled={!anyStock}
                  className={`min-w-[46px] px-3 py-2 rounded border text-sm font-semibold
                    ${size === s ? 'bg-maroon text-white border-maroon' : 'bg-white border-line'}
                    ${!anyStock ? 'line-through opacity-40 cursor-not-allowed' : ''}`}>
                  {s}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div>
        <div className="text-xs font-bold tracking-widest uppercase text-muted mb-2">Quantity</div>
        <div className="inline-flex items-center border border-line rounded-lg overflow-hidden">
          <button type="button" onClick={() => setQty(q => Math.max(1, q - 1))} className="px-3 py-2">−</button>
          <span className="px-4 min-w-[40px] text-center">{qty}</span>
          <button type="button" onClick={() => setQty(q => Math.min(Math.max(1, avail || 10), q + 1))} className="px-3 py-2">+</button>
        </div>
        <span className="ml-3 text-xs text-muted">
          {outOfStock ? <span className="text-red-600 font-semibold">Out of stock</span>
                      : inv?.is_low_stock ? <span className="text-red-600">Only {avail} left</span> : `${avail} available`}
        </span>
      </div>

      <div className="flex gap-3">
        <button type="button" disabled={outOfStock || busy === 'cart'} onClick={() => addToCart(false)}
          className="flex-1 bg-maroon text-white rounded-lg py-3 font-semibold disabled:opacity-50">
          {busy === 'cart' ? 'Adding…' : 'Add to Cart'}
        </button>
        <button type="button" disabled={outOfStock || busy === 'buy'} onClick={() => addToCart(true)}
          className="flex-1 border-2 border-maroon text-maroon rounded-lg py-3 font-semibold disabled:opacity-50">
          {busy === 'buy' ? 'Loading…' : 'Buy Now'}
        </button>
        <button type="button" aria-label="Wishlist"
          className="w-12 rounded-lg border border-line grid place-items-center text-maroon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 21s-7-4.35-9.5-8.5C.7 8.7 3 5 6.5 5 8.7 5 10.5 6.2 12 8c1.5-1.8 3.3-3 5.5-3C21 5 23.3 8.7 21.5 12.5 19 16.65 12 21 12 21z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
