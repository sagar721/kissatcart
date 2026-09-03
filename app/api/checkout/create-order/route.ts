import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { getCurrentUser } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase/server';
import { loadCartForUser } from '@/lib/queries/cart';
import { computeTotals } from '@/lib/cart/totals';
import { createRazorpayOrder } from '@/lib/razorpay/client';

const Body = z.object({
  shipping_address_id: z.string().uuid(),
  coupon_code:         z.string().optional().nullable()
});

/** Creates a KismatKart order (status: pending) via create_order() and a matching
 *  Razorpay order. Reserves inventory in the same transaction (create_order does it).
 *  Returns the ids the frontend needs to open Razorpay Checkout. */
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ ok: false, message: 'Please sign in.' }, { status: 401 });

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false, message: 'Invalid input' }, { status: 400 });

  const { items } = await loadCartForUser(user.id);
  if (items.length === 0) return NextResponse.json({ ok: false, message: 'Your cart is empty.' }, { status: 400 });

  const sb = supabaseAdmin();

  // Validate coupon fresh (client value is not trusted)
  const subtotal = items.reduce((s, i) => s + i.unit_price * i.quantity, 0);
  let discount = 0;
  if (parsed.data.coupon_code) {
    const { data: d, error } = await sb.rpc('apply_coupon', {
      p_code: parsed.data.coupon_code.toUpperCase(), p_user_id: user.id, p_subtotal: subtotal
    });
    if (error) return NextResponse.json({ ok: false, message: `Coupon: ${error.message}` }, { status: 400 });
    discount = Number(d);
  }
  const totals = computeTotals(items, discount);

  // Verify address ownership
  const { data: addr } = await sb.from('addresses').select('id')
    .eq('id', parsed.data.shipping_address_id).eq('user_id', user.id).maybeSingle();
  if (!addr) return NextResponse.json({ ok: false, message: 'Address not found' }, { status: 400 });

  // Create the KismatKart order + reserve stock atomically
  const { data: orderId, error: createErr } = await sb.rpc('create_order', {
    p_user_id: user.id,
    p_shipping_address: parsed.data.shipping_address_id,
    p_items: items.map(i => ({ variant_id: i.variant_id, quantity: i.quantity, unit_price: i.unit_price })),
    p_coupon_code:  parsed.data.coupon_code?.toUpperCase() ?? null,
    p_shipping_total: totals.shipping,
    p_tax_total:      totals.tax
  });
  if (createErr) {
    const msg = createErr.message.includes('OUT_OF_STOCK')
      ? 'One of the items just went out of stock. Please review your cart.'
      : createErr.message;
    return NextResponse.json({ ok: false, message: msg }, { status: 409 });
  }

  // Create Razorpay order for the SAME grand total (in paise)
  const { data: order } = await sb.from('orders').select('order_number, grand_total').eq('id', orderId).single();
  let rzp;
  try {
    rzp = await createRazorpayOrder({
      amount: Math.round(Number(order!.grand_total) * 100),
      currency: 'INR',
      receipt:  order!.order_number,
      notes:    { order_id: orderId as unknown as string, user_id: user.id }
    });
  } catch (e: any) {
    // Rollback: cancel the pending order and release stock
    await sb.rpc('set_order_status', { p_order_id: orderId, p_status: 'cancelled', p_note: 'Razorpay order create failed' });
    const { data: its } = await sb.from('order_items').select('variant_id,quantity').eq('order_id', orderId);
    for (const it of its ?? []) await sb.rpc('release_stock', { p_variant_id: it.variant_id, p_qty: it.quantity });
    return NextResponse.json({ ok: false, message: 'Payment gateway unavailable. Please try again.' }, { status: 502 });
  }

  // Insert payment record (status: created)
  await sb.from('payments').insert({
    order_id: orderId, method: 'razorpay', status: 'created',
    amount: order!.grand_total, currency: 'INR', razorpay_order_id: rzp.id
  });

  return NextResponse.json({
    ok: true,
    order_id: orderId,
    order_number: order!.order_number,
    razorpay: {
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      order_id: rzp.id, amount: rzp.amount, currency: rzp.currency
    },
    totals
  });
}
