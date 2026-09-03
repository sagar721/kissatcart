import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { getCurrentUser } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase/server';
import { verifyCheckoutSignature } from '@/lib/razorpay/client';

const Body = z.object({
  order_id:            z.string().uuid(),                   // KismatKart order id
  razorpay_order_id:   z.string().min(3),
  razorpay_payment_id: z.string().min(3),
  razorpay_signature:  z.string().min(3)
});

/** Server-side verification. Only after this succeeds do we mark payment
 *  captured, confirm the order, and commit the previously-reserved stock. */
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ ok: false, message: 'Please sign in.' }, { status: 401 });

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false, message: 'Invalid input' }, { status: 400 });

  // Verify signature FIRST — never trust the frontend
  const ok = verifyCheckoutSignature({
    razorpay_order_id:   parsed.data.razorpay_order_id,
    razorpay_payment_id: parsed.data.razorpay_payment_id,
    razorpay_signature:  parsed.data.razorpay_signature
  });
  if (!ok) return NextResponse.json({ ok: false, message: 'Signature check failed.' }, { status: 400 });

  const sb = supabaseAdmin();

  // Ensure the order belongs to this user
  const { data: order } = await sb.from('orders')
    .select('id, user_id, status').eq('id', parsed.data.order_id).maybeSingle();
  if (!order || order.user_id !== user.id)
    return NextResponse.json({ ok: false, message: 'Order not found.' }, { status: 404 });

  // Idempotent: if already captured, don't double-commit
  const { data: existing } = await sb.from('payments')
    .select('id, status').eq('order_id', parsed.data.order_id).eq('razorpay_order_id', parsed.data.razorpay_order_id).maybeSingle();
  if (!existing) return NextResponse.json({ ok: false, message: 'Payment record missing.' }, { status: 500 });
  if (existing.status === 'captured') {
    return NextResponse.json({ ok: true, alreadyProcessed: true, order_id: order.id });
  }

  // Mark payment captured, order confirmed, commit stock, clear cart
  await sb.from('payments').update({
    status: 'captured',
    razorpay_payment_id: parsed.data.razorpay_payment_id,
    razorpay_signature:  parsed.data.razorpay_signature,
    updated_at: new Date().toISOString()
  }).eq('id', existing.id);

  await sb.rpc('set_order_status', { p_order_id: order.id, p_status: 'confirmed', p_note: 'Payment captured' });

  const { data: items } = await sb.from('order_items').select('variant_id,quantity').eq('order_id', order.id);
  for (const it of items ?? []) {
    await sb.rpc('commit_stock', { p_variant_id: it.variant_id, p_qty: it.quantity });
  }

  // Empty the cart
  const { data: cart } = await sb.from('carts').select('id').eq('user_id', user.id).eq('status', 'active').maybeSingle();
  if (cart) {
    await sb.from('cart_items').delete().eq('cart_id', cart.id);
    await sb.from('carts').update({ status: 'converted' }).eq('id', cart.id);
  }

  // Queue confirmation notification (Phase 16 drains this)
  await sb.from('notifications').insert({
    user_id: user.id, channel: 'email', template: 'order_confirmed',
    payload: { order_id: order.id }
  });

  return NextResponse.json({ ok: true, order_id: order.id });
}
