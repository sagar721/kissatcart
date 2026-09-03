'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

type Img = { id: string; url: string; alt: string | null; is_thumbnail: boolean; sort_order: number };

export function ImageUploader({ productId, initial }: { productId: string; initial: Img[] }) {
  const router = useRouter();
  const [imgs, setImgs] = useState<Img[]>(initial);
  const [busy, setBusy] = useState(false);
  const [err, setErr]   = useState<string | null>(null);

  async function upload(file: File, isThumb: boolean) {
    setBusy(true); setErr(null);
    const fd = new FormData();
    fd.append('file', file);
    fd.append('product_id', productId);
    if (isThumb) fd.append('is_thumbnail', '1');
    const r = await fetch('/api/upload', { method: 'POST', body: fd });
    const b = await r.json();
    setBusy(false);
    if (!r.ok || !b.ok) return setErr(b.message ?? 'Upload failed');
    setImgs(x => [...x, { id: b.id, url: b.url, alt: file.name, is_thumbnail: isThumb, sort_order: 100 }]);
    router.refresh();
  }

  async function remove(id: string) {
    if (!confirm('Delete this image?')) return;
    const r = await fetch(`/api/upload?id=${id}`, { method: 'DELETE' });
    if (r.ok) setImgs(x => x.filter(y => y.id !== id));
  }

  return (
    <div className="bg-white rounded-xl2 border border-line p-5 mt-6">
      <h2 className="font-serif text-2xl mb-3">Images</h2>
      <div className="grid gap-3 grid-cols-2 md:grid-cols-4 lg:grid-cols-6">
        {imgs.map(img => (
          <div key={img.id} className="relative aspect-square rounded-md overflow-hidden border border-line group">
            <img src={img.url} alt={img.alt ?? ''} className="w-full h-full object-cover" />
            {img.is_thumbnail && <span className="absolute top-1 left-1 bg-maroon text-white text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-widest">Thumb</span>}
            <button type="button" onClick={() => remove(img.id)}
              className="absolute top-1 right-1 bg-white/90 text-red-700 rounded-full w-6 h-6 text-xs opacity-0 group-hover:opacity-100">×</button>
          </div>
        ))}
      </div>
      <div className="flex gap-2 mt-4 flex-wrap">
        <label className="cursor-pointer bg-maroon text-white rounded-lg px-4 py-2.5 text-sm font-semibold">
          + Upload image
          <input type="file" accept="image/*" className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) upload(f, false); e.target.value=''; }} />
        </label>
        <label className="cursor-pointer border border-line rounded-lg px-4 py-2.5 text-sm font-semibold">
          + Set new thumbnail
          <input type="file" accept="image/*" className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) upload(f, true); e.target.value=''; }} />
        </label>
        {busy && <span className="text-xs text-muted self-center">Uploading…</span>}
      </div>
      {err && <div className="mt-3 text-xs bg-red-50 text-red-700 border border-red-200 rounded-md px-3 py-2">{err}</div>}
      <p className="text-[11px] text-muted mt-3">JPEG / PNG / WebP / AVIF · up to 5 MB · public bucket <code>product-images</code>.</p>
    </div>
  );
}
