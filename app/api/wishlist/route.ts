import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { getCurrentUser } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase/server';

const Body = z.object({ product_id: z.string().uuid() });

async function getOrCreateWishlist(userId: string) {
  const sb = supabaseAdmin();
  const { data } = await sb.from('wishlists').select('id').eq('user_id', userId).maybeSingle();
  if (data) return data.id;
  const { data: c } = await sb.from('wishlists').insert({ user_id: userId }).select('id').single();
  return c!.id;
}

/** Toggle a product into/out of the current user's wishlist. */
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ ok: false, message: 'Please sign in.' }, { status: 401 });
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false, message: 'Invalid input' }, { status: 400 });

  const sb = supabaseAdmin();
  const wid = await getOrCreateWishlist(user.id);
  const { data: existing } = await sb.from('wishlist_items').select('product_id')
    .eq('wishlist_id', wid).eq('product_id', parsed.data.product_id).maybeSingle();

  if (existing) {
    await sb.from('wishlist_items').delete().eq('wishlist_id', wid).eq('product_id', parsed.data.product_id);
    return NextResponse.json({ ok: true, state: 'removed' });
  }
  const { error } = await sb.from('wishlist_items').insert({ wishlist_id: wid, product_id: parsed.data.product_id });
  if (error) return NextResponse.json({ ok: false, message: 'That product could not be added to your wishlist.' }, { status: 400 });
  return NextResponse.json({ ok: true, state: 'added' });
}

/** DELETE ?product_id=<uuid> */
export async function DELETE(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ ok: false, message: 'Please sign in.' }, { status: 401 });
  const product_id = new URL(req.url).searchParams.get('product_id');
  if (!product_id) return NextResponse.json({ ok: false, message: 'Missing product_id' }, { status: 400 });
  const sb = supabaseAdmin();
  const wid = await getOrCreateWishlist(user.id);
  await sb.from('wishlist_items').delete().eq('wishlist_id', wid).eq('product_id', product_id);
  return NextResponse.json({ ok: true });
}
