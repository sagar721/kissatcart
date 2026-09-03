import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { getCurrentUser } from '@/lib/auth';
import { getOrCreateCartId } from '@/lib/queries/cart';
import { supabaseAdmin } from '@/lib/supabase/server';

const AddSchema    = z.object({ variant_id: z.string().uuid(), quantity: z.number().int().min(1).max(20) });
const UpdateSchema = z.object({ item_id: z.string().uuid(), quantity: z.number().int().min(1).max(20) });

/** Add an item to the cart, or bump quantity if the variant is already in it.
 *  Snapshots unit_price at add-time (matches Phase-2 cart_items shape). */
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ ok: false, message: 'Please sign in to add to cart.' }, { status: 401 });

  const parsed = AddSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false, message: 'Invalid input' }, { status: 400 });

  const sb = supabaseAdmin();
  const cartId = await getOrCreateCartId(user.id);

  // Look up variant + product for stock check and unit_price snapshot
  const { data: v } = await sb.from('product_variants')
    .select('id, price_delta, is_active, products(price, is_active), inventory(stock_qty, reserved_qty)')
    .eq('id', parsed.data.variant_id).maybeSingle();
  if (!v || !v.is_active || !(v as any).products?.is_active)
    return NextResponse.json({ ok: false, message: 'This item is no longer available.' }, { status: 410 });

  const avail = Math.max(0, ((v as any).inventory?.stock_qty ?? 0) - ((v as any).inventory?.reserved_qty ?? 0));
  const unit_price = Number((v as any).products.price) + Number(v.price_delta ?? 0);

  // Upsert-like: if a row exists, add to quantity but clamp to available stock
  const { data: existing } = await sb.from('cart_items')
    .select('id, quantity').eq('cart_id', cartId).eq('variant_id', parsed.data.variant_id).maybeSingle();

  if (existing) {
    const nextQty = Math.min(avail, existing.quantity + parsed.data.quantity);
    if (nextQty <= existing.quantity && avail <= existing.quantity)
      return NextResponse.json({ ok: false, message: `Only ${avail} in stock.` }, { status: 409 });
    await sb.from('cart_items').update({ quantity: nextQty, unit_price }).eq('id', existing.id);
    return NextResponse.json({ ok: true, item_id: existing.id, quantity: nextQty });
  }

  if (avail < parsed.data.quantity)
    return NextResponse.json({ ok: false, message: avail === 0 ? 'Out of stock.' : `Only ${avail} in stock.` }, { status: 409 });

  const { data: created, error } = await sb.from('cart_items').insert({
    cart_id: cartId, variant_id: parsed.data.variant_id, quantity: parsed.data.quantity, unit_price
  }).select('id').single();
  if (error) return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, item_id: created.id, quantity: parsed.data.quantity });
}

/** Update quantity on an existing line. */
export async function PATCH(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ ok: false, message: 'Please sign in.' }, { status: 401 });
  const parsed = UpdateSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false, message: 'Invalid input' }, { status: 400 });

  const sb = supabaseAdmin();
  const { data: item } = await sb.from('cart_items')
    .select('id, variant_id, carts!inner(user_id)').eq('id', parsed.data.item_id).maybeSingle();
  if (!item || (item as any).carts.user_id !== user.id)
    return NextResponse.json({ ok: false, message: 'Not found' }, { status: 404 });

  // Stock check
  const { data: inv } = await sb.from('v_inventory_available').select('available_qty').eq('variant_id', item.variant_id).maybeSingle();
  const avail = inv?.available_qty ?? 0;
  const q = Math.min(parsed.data.quantity, avail);
  if (q <= 0) return NextResponse.json({ ok: false, message: 'Out of stock.' }, { status: 409 });

  await sb.from('cart_items').update({ quantity: q }).eq('id', parsed.data.item_id);
  return NextResponse.json({ ok: true, quantity: q, clamped: q !== parsed.data.quantity });
}

/** DELETE ?id=<cart_item_id> */
export async function DELETE(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ ok: false, message: 'Please sign in.' }, { status: 401 });
  const id = new URL(req.url).searchParams.get('id');
  if (!id) return NextResponse.json({ ok: false, message: 'Missing id' }, { status: 400 });

  const sb = supabaseAdmin();
  const { data: item } = await sb.from('cart_items').select('id, carts!inner(user_id)').eq('id', id).maybeSingle();
  if (!item || (item as any).carts.user_id !== user.id)
    return NextResponse.json({ ok: false, message: 'Not found' }, { status: 404 });

  await sb.from('cart_items').delete().eq('id', id);
  return NextResponse.json({ ok: true });
}
