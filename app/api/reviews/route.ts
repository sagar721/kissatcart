import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { getCurrentUser } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase/server';

const Body = z.object({
  product_id: z.string().uuid(),
  order_id:   z.string().uuid(),
  rating:     z.number().int().min(1).max(5),
  title:      z.string().max(120).optional(),
  body:       z.string().max(2000).optional()
});

/** POST — submit a review. RLS also requires the order to be `delivered` and
 *  owned by the user, so a hostile client can't game this. */
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ ok: false, message: 'Please sign in.' }, { status: 401 });
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false, message: 'Invalid input' }, { status: 400 });

  const sb = supabaseAdmin();

  // Verify: user actually purchased & received the item
  const { data: order } = await sb.from('orders').select('id, status').eq('id', parsed.data.order_id).eq('user_id', user.id).maybeSingle();
  if (!order || order.status !== 'delivered') return NextResponse.json({ ok: false, message: 'You can review only delivered orders.' }, { status: 403 });
  const { data: item } = await sb.from('order_items').select('id').eq('order_id', order.id).eq('product_id', parsed.data.product_id).maybeSingle();
  if (!item) return NextResponse.json({ ok: false, message: 'That product isn’t in the selected order.' }, { status: 400 });

  const { data, error } = await sb.from('reviews').upsert({
    product_id: parsed.data.product_id,
    user_id:    user.id,
    order_id:   parsed.data.order_id,
    rating:     parsed.data.rating,
    title:      parsed.data.title  ?? null,
    body:       parsed.data.body   ?? null,
    is_approved: true
  }, { onConflict: 'product_id,user_id,order_id' }).select('id').single();
  if (error) return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, id: data.id });
}

/** DELETE ?id=…  Only the review's own author (or admin) can delete;
 *  we rely on the profile-scoped RLS on reviews for that check. */
export async function DELETE(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ ok: false, message: 'Please sign in.' }, { status: 401 });
  const id = new URL(req.url).searchParams.get('id');
  if (!id) return NextResponse.json({ ok: false, message: 'Missing id' }, { status: 400 });
  const sb = supabaseAdmin();
  await sb.from('reviews').delete().eq('id', id).eq('user_id', user.id);
  return NextResponse.json({ ok: true });
}
