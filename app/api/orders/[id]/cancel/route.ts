import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase/server';

const CANCELABLE = new Set(['pending','confirmed','processing']);

/** Customer-initiated cancel. Refund is manual for now (Phase 12 will
 *  push refund to Razorpay). Stock is released so it's available to others. */
export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ ok: false, message: 'Please sign in.' }, { status: 401 });
  const sb = supabaseAdmin();

  const { data: order } = await sb.from('orders').select('id, user_id, status').eq('id', params.id).maybeSingle();
  if (!order || order.user_id !== user.id) return NextResponse.json({ ok: false, message: 'Not found' }, { status: 404 });
  if (!CANCELABLE.has(order.status)) return NextResponse.json({ ok: false, message: 'This order can no longer be cancelled.' }, { status: 409 });

  const { data: items } = await sb.from('order_items').select('variant_id,quantity').eq('order_id', order.id);
  for (const it of items ?? []) {
    // For "confirmed" onwards, the stock was already committed (stock_qty -= qty).
    // For "pending" it was only reserved. In both cases we restore what's needed.
    if (order.status === 'pending') {
      await sb.rpc('release_stock', { p_variant_id: it.variant_id, p_qty: it.quantity });
    } else {
      await sb.rpc('restore_stock', { p_variant_id: it.variant_id, p_qty: it.quantity });
    }
  }
  await sb.rpc('set_order_status', { p_order_id: order.id, p_status: 'cancelled', p_note: 'Cancelled by customer' });
  return NextResponse.json({ ok: true });
}
