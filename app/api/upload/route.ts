import { NextResponse, type NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth';

const BUCKET = 'product-images';
const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = new Set(['image/jpeg','image/png','image/webp','image/avif']);

/** POST multipart/form-data with fields: file, product_id, is_thumbnail?
 *  Uploads to Supabase Storage bucket 'product-images' and inserts a
 *  product_images row. Admins only. */
export async function POST(req: NextRequest) {
  try { await requireAdmin(); } catch { return NextResponse.json({ ok: false, message: 'Forbidden' }, { status: 403 }); }
  const form = await req.formData();
  const file = form.get('file') as File | null;
  const productId = form.get('product_id') as string | null;
  const isThumb   = form.get('is_thumbnail') === '1';
  if (!file || !productId) return NextResponse.json({ ok: false, message: 'Missing file or product_id' }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ ok: false, message: 'File too large (max 5 MB)' }, { status: 413 });
  if (!ALLOWED.has(file.type)) return NextResponse.json({ ok: false, message: 'Unsupported image type' }, { status: 415 });

  const sb = supabaseAdmin();
  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
  const path = `${productId}/${Date.now()}-${Math.random().toString(36).slice(2,8)}.${ext}`;
  const buf = Buffer.from(await file.arrayBuffer());

  const { error: upErr } = await sb.storage.from(BUCKET).upload(path, buf, { contentType: file.type, upsert: false });
  if (upErr) return NextResponse.json({ ok: false, message: upErr.message }, { status: 500 });
  const { data: pub } = sb.storage.from(BUCKET).getPublicUrl(path);
  const url = pub.publicUrl;

  if (isThumb) await sb.from('product_images').update({ is_thumbnail: false }).eq('product_id', productId).eq('is_thumbnail', true);

  const { data, error } = await sb.from('product_images')
    .insert({ product_id: productId, url, alt: file.name, is_thumbnail: isThumb, sort_order: 100 })
    .select('id, url').single();
  if (error) return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, id: data.id, url });
}

export async function DELETE(req: NextRequest) {
  try { await requireAdmin(); } catch { return NextResponse.json({ ok: false, message: 'Forbidden' }, { status: 403 }); }
  const id = new URL(req.url).searchParams.get('id');
  if (!id) return NextResponse.json({ ok: false, message: 'Missing id' }, { status: 400 });
  const sb = supabaseAdmin();
  const { data: img } = await sb.from('product_images').select('url,product_id').eq('id', id).maybeSingle();
  if (img?.url) {
    const path = img.url.split(`/${BUCKET}/`)[1];
    if (path) await sb.storage.from(BUCKET).remove([path]);
  }
  await sb.from('product_images').delete().eq('id', id);
  return NextResponse.json({ ok: true });
}
