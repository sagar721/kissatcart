import { NextResponse, type NextRequest } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';

/** GET /api/search?q=…&limit=&offset=  Returns product rows for the search page.
 *  suggest=1 returns just id/name/slug for the header autocomplete. */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const q = (url.searchParams.get('q') ?? '').trim();
  const limit = Math.min(48, Number(url.searchParams.get('limit') ?? 24));
  const offset = Math.max(0, Number(url.searchParams.get('offset') ?? 0));
  if (!q || q.length < 2) return NextResponse.json({ ok: true, rows: [], total: 0 });

  const sb = supabaseServer();
  const { data, error } = await sb.rpc('search_products', { p_q: q, p_limit: limit, p_offset: offset });
  if (error) return NextResponse.json({ ok: false, message: error.message }, { status: 500 });

  if (url.searchParams.get('suggest') === '1') {
    return NextResponse.json({
      ok: true, rows: (data ?? []).slice(0, 6).map((r: any) => ({ id: r.id, slug: r.slug, name: r.name, price: r.price, category_slug: r.category_slug }))
    });
  }
  return NextResponse.json({ ok: true, rows: data ?? [], total: data?.length ?? 0 });
}
