'use client';
import { useState, useTransition } from 'react';
import { upsertVariant, deleteVariant } from './actions';

type Variant = {
  id: string; product_id: string; sku: string; size: string | null;
  color: string | null; color_hex: string | null; price_delta: number; is_active: boolean;
};
type Inv = { variant_id: string; stock_qty: number; reserved_qty: number; low_stock_at: number };

export function VariantsPanel({ productId, variants, inventory }:
  { productId: string; variants: Variant[]; inventory: Map<string, Inv> }) {
  const [busy, start] = useTransition();

  return (
    <div className="bg-white rounded-xl2 border border-line overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-ground">
          <tr className="text-left text-[11px] uppercase tracking-widest text-muted">
            <th className="px-3 py-2">SKU</th>
            <th className="px-3 py-2">Size</th>
            <th className="px-3 py-2">Color</th>
            <th className="px-3 py-2">Hex</th>
            <th className="px-3 py-2">Stock</th>
            <th className="px-3 py-2">Reserved</th>
            <th className="px-3 py-2">Low@</th>
            <th className="px-3 py-2">Active</th>
            <th className="px-3 py-2"></th>
          </tr>
        </thead>
        <tbody>
          {variants.map(v => <Row key={v.id} v={v} inv={inventory.get(v.id)} />)}
          <NewRow productId={productId} />
        </tbody>
      </table>
    </div>
  );
}

function Row({ v, inv }: { v: Variant; inv?: Inv }) {
  const [busy, start] = useTransition();
  const [s, setS] = useState({
    sku: v.sku, size: v.size ?? '', color: v.color ?? '', color_hex: v.color_hex ?? '',
    is_active: v.is_active, stock_qty: inv?.stock_qty ?? 0, low_stock_at: inv?.low_stock_at ?? 5
  });
  const on = <K extends keyof typeof s>(k: K, val: (typeof s)[K]) => setS(x => ({ ...x, [k]: val }));

  return (
    <tr className="border-t border-line">
      <td className="px-3 py-2"><input value={s.sku}   onChange={e => on('sku', e.target.value)}   className="w-full border border-line rounded px-2 py-1 text-xs" /></td>
      <td className="px-3 py-2"><input value={s.size}  onChange={e => on('size', e.target.value)}  className="w-16 border border-line rounded px-2 py-1 text-xs" /></td>
      <td className="px-3 py-2"><input value={s.color} onChange={e => on('color', e.target.value)} className="w-24 border border-line rounded px-2 py-1 text-xs" /></td>
      <td className="px-3 py-2"><input value={s.color_hex} onChange={e => on('color_hex', e.target.value)} placeholder="#000000" className="w-24 border border-line rounded px-2 py-1 text-xs font-mono" /></td>
      <td className="px-3 py-2"><input type="number" min={0} value={s.stock_qty}    onChange={e => on('stock_qty', Number(e.target.value))} className="w-20 border border-line rounded px-2 py-1 text-xs" /></td>
      <td className="px-3 py-2 text-xs text-muted">{inv?.reserved_qty ?? 0}</td>
      <td className="px-3 py-2"><input type="number" min={0} value={s.low_stock_at} onChange={e => on('low_stock_at', Number(e.target.value))} className="w-16 border border-line rounded px-2 py-1 text-xs" /></td>
      <td className="px-3 py-2"><input type="checkbox" checked={s.is_active} onChange={e => on('is_active', e.target.checked)} /></td>
      <td className="px-3 py-2 text-right whitespace-nowrap">
        <button disabled={busy} onClick={() => start(async () => {
          await upsertVariant({ id: v.id, product_id: v.product_id, ...s });
        })} className="text-maroon text-xs underline mr-3">Save</button>
        <button disabled={busy} onClick={() => start(async () => {
          if (!confirm('Delete variant?')) return;
          await deleteVariant(v.id, v.product_id);
        })} className="text-red-600 text-xs underline">Delete</button>
      </td>
    </tr>
  );
}

function NewRow({ productId }: { productId: string }) {
  const [busy, start] = useTransition();
  const [s, setS] = useState({ sku: '', size: '', color: '', color_hex: '', stock_qty: 0, low_stock_at: 5 });
  const on = <K extends keyof typeof s>(k: K, val: (typeof s)[K]) => setS(x => ({ ...x, [k]: val }));

  return (
    <tr className="border-t border-line bg-ground/50">
      <td className="px-3 py-2"><input value={s.sku}   onChange={e => on('sku', e.target.value)}   placeholder="SKU"   className="w-full border border-line rounded px-2 py-1 text-xs" /></td>
      <td className="px-3 py-2"><input value={s.size}  onChange={e => on('size', e.target.value)}  placeholder="M"     className="w-16 border border-line rounded px-2 py-1 text-xs" /></td>
      <td className="px-3 py-2"><input value={s.color} onChange={e => on('color', e.target.value)} placeholder="Olive" className="w-24 border border-line rounded px-2 py-1 text-xs" /></td>
      <td className="px-3 py-2"><input value={s.color_hex} onChange={e => on('color_hex', e.target.value)} placeholder="#5B6B3A" className="w-24 border border-line rounded px-2 py-1 text-xs font-mono" /></td>
      <td className="px-3 py-2"><input type="number" min={0} value={s.stock_qty}    onChange={e => on('stock_qty', Number(e.target.value))} className="w-20 border border-line rounded px-2 py-1 text-xs" /></td>
      <td className="px-3 py-2 text-xs text-muted">—</td>
      <td className="px-3 py-2"><input type="number" min={0} value={s.low_stock_at} onChange={e => on('low_stock_at', Number(e.target.value))} className="w-16 border border-line rounded px-2 py-1 text-xs" /></td>
      <td className="px-3 py-2">—</td>
      <td className="px-3 py-2 text-right">
        <button disabled={busy || !s.sku} onClick={() => start(async () => {
          await upsertVariant({ product_id: productId, is_active: true, ...s });
          setS({ sku: '', size: '', color: '', color_hex: '', stock_qty: 0, low_stock_at: 5 });
        })} className="bg-maroon text-white rounded px-3 py-1 text-xs font-semibold disabled:opacity-60">Add</button>
      </td>
    </tr>
  );
}
