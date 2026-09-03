'use client';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { saveProduct, deleteProduct } from './actions';

type Cat = { id: string; name: string };
type Initial = {
  id: string; slug: string; name: string; brand: string;
  short_description: string | null; description: string | null;
  category_id: string; price: number; mrp: number; sku_prefix: string;
  tags: string[]; is_active: boolean; is_featured: boolean; is_new_arrival: boolean;
};

export function ProductEditor({ categories, initial }: { categories: Cat[]; initial?: Initial }) {
  const router = useRouter();
  const [busy, start] = useTransition();
  const [f, setF] = useState<Initial>(initial ?? {
    id: '', slug: '', name: '', brand: 'KismatKart',
    short_description: '', description: '', category_id: categories[0]?.id ?? '',
    price: 0, mrp: 0, sku_prefix: '', tags: [],
    is_active: true, is_featured: false, is_new_arrival: false
  });
  const on = <K extends keyof Initial>(k: K, v: Initial[K]) => setF(x => ({ ...x, [k]: v }));
  const [err, setErr] = useState<string | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault(); setErr(null);
    start(async () => {
      const res = await saveProduct(f);
      if (!res.ok) return setErr(res.error);
      if (!initial && res.id) router.push(`/admin/products/${res.id}`);
    });
  }

  return (
    <form onSubmit={submit} className="bg-white rounded-xl2 border border-line p-6 grid gap-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Name"><Input value={f.name} onChange={v => on('name', v)} required /></Field>
        <Field label="Slug"><Input value={f.slug} onChange={v => on('slug', v)} pattern="[a-z0-9-]+" required /></Field>
        <Field label="Brand"><Input value={f.brand} onChange={v => on('brand', v)} required /></Field>
        <Field label="SKU prefix"><Input value={f.sku_prefix} onChange={v => on('sku_prefix', v)} required /></Field>
        <Field label="Category">
          <select value={f.category_id} onChange={e => on('category_id', e.target.value)}
            className="w-full border border-line rounded-md px-3 py-2.5 text-sm">
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </Field>
        <Field label="Tags (comma-separated)">
          <Input value={f.tags.join(', ')} onChange={v => on('tags', v.split(',').map(s => s.trim()).filter(Boolean))} />
        </Field>
        <Field label="Price (₹)"><Input type="number" min={0} step="0.01" value={String(f.price)} onChange={v => on('price', Number(v))} required /></Field>
        <Field label="MRP (₹)"><Input type="number" min={0} step="0.01" value={String(f.mrp)} onChange={v => on('mrp', Number(v))} required /></Field>
      </div>

      <Field label="Short description">
        <Input value={f.short_description ?? ''} onChange={v => on('short_description', v)} maxLength={200} />
      </Field>
      <Field label="Description">
        <textarea value={f.description ?? ''} onChange={e => on('description', e.target.value)}
          rows={6} maxLength={4000}
          className="w-full border border-line rounded-md px-3 py-2.5 text-sm outline-none focus:border-maroon" />
      </Field>

      <div className="flex flex-wrap gap-4 text-sm">
        <label className="flex items-center gap-2"><input type="checkbox" checked={f.is_active}      onChange={e => on('is_active', e.target.checked)} /> Active (public)</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={f.is_featured}    onChange={e => on('is_featured', e.target.checked)} /> Featured</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={f.is_new_arrival} onChange={e => on('is_new_arrival', e.target.checked)} /> New arrival</label>
      </div>

      {err && <div className="text-xs rounded-md px-3 py-2 bg-red-50 text-red-700 border border-red-200">{err}</div>}

      <div className="flex gap-2 pt-2">
        <button type="submit" disabled={busy} className="bg-maroon text-white rounded-lg px-5 py-2.5 font-semibold disabled:opacity-60">
          {busy ? 'Saving…' : (initial ? 'Save changes' : 'Create product')}
        </button>
        {initial && (
          <button type="button" disabled={busy}
            onClick={() => start(async () => { if (!confirm('Delete this product? This cannot be undone.')) return;
              const r = await deleteProduct(initial.id); if (r.ok) router.push('/admin/products'); else setErr(r.error); })}
            className="border border-red-200 text-red-700 rounded-lg px-4 py-2.5 text-sm">
            Delete product
          </button>
        )}
      </div>
      <p className="text-[11px] text-muted">Real product image uploads land in Phase 15b (Supabase Storage). Until then the homepage &amp; cards use placeholder gradients.</p>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[11px] font-bold tracking-widest uppercase text-muted mb-1.5">{label}</span>
      {children}
    </label>
  );
}
function Input(p: { value: string; onChange: (v: string) => void } & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'>) {
  const { value, onChange, ...rest } = p;
  return (
    <input {...rest} value={value} onChange={e => onChange(e.target.value)}
      className="w-full border border-line rounded-md px-3 py-2.5 text-sm outline-none focus:border-maroon" />
  );
}
