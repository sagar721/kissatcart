'use client';
import { useState, useTransition } from 'react';
import { saveCategory, deleteCategory } from './actions';

type Cat = { id: string; slug: string; name: string; description: string | null; sort_order: number; is_active: boolean };

export function CategoriesEditor({ initial }: { initial: Cat[] }) {
  const [rows, setRows] = useState<Cat[]>(initial);
  const [busy, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  function updateRow(i: number, patch: Partial<Cat>) {
    setRows(r => r.map((x, idx) => idx === i ? { ...x, ...patch } : x));
  }

  return (
    <div className="bg-white rounded-xl2 border border-line overflow-hidden">
      {err && <div className="text-xs bg-red-50 text-red-700 px-4 py-2">{err}</div>}
      <table className="w-full text-sm">
        <thead className="bg-ground">
          <tr className="text-left text-[11px] uppercase tracking-widest text-muted">
            <th className="px-3 py-2">Name</th>
            <th className="px-3 py-2">Slug</th>
            <th className="px-3 py-2">Sort</th>
            <th className="px-3 py-2">Active</th>
            <th className="px-3 py-2"></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((c, i) => (
            <tr key={c.id || i} className="border-t border-line">
              <td className="px-3 py-2"><input value={c.name} onChange={e => updateRow(i, { name: e.target.value })} className="w-full border border-line rounded px-2 py-1 text-sm" /></td>
              <td className="px-3 py-2"><input value={c.slug} onChange={e => updateRow(i, { slug: e.target.value })} className="w-full border border-line rounded px-2 py-1 text-sm font-mono text-xs" /></td>
              <td className="px-3 py-2"><input type="number" value={c.sort_order} onChange={e => updateRow(i, { sort_order: Number(e.target.value) })} className="w-16 border border-line rounded px-2 py-1 text-sm" /></td>
              <td className="px-3 py-2"><input type="checkbox" checked={c.is_active} onChange={e => updateRow(i, { is_active: e.target.checked })} /></td>
              <td className="px-3 py-2 text-right whitespace-nowrap">
                <button disabled={busy} onClick={() => start(async () => {
                  setErr(null);
                  const r = await saveCategory(c);
                  if (!r.ok) setErr(r.error);
                })} className="text-maroon text-xs underline mr-3">Save</button>
                <button disabled={busy} onClick={() => start(async () => {
                  setErr(null);
                  if (!confirm(`Delete "${c.name}"?`)) return;
                  const r = await deleteCategory(c.id);
                  if (!r.ok) setErr(r.error);
                  else setRows(rs => rs.filter((_, idx) => idx !== i));
                })} className="text-red-600 text-xs underline">Delete</button>
              </td>
            </tr>
          ))}
          <tr className="border-t border-line bg-ground/50">
            <td colSpan={5} className="px-3 py-2 text-right">
              <button disabled={busy} onClick={() => setRows(r => [...r, { id: '', slug: '', name: '', description: null, sort_order: r.length + 1, is_active: true }])}
                className="text-maroon text-xs underline">+ Add category</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
