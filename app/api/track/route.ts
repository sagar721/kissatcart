import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase/server';

const Body = z.object({
  order_number: z.string().min(4),
  contact:      z.string().min(4)   // email OR 10-digit phone
});

/** Guest order lookup. We match order_number AND ( customer email OR shipping-address phone ),
 *  so knowing the number alone isn't enough — a returning customer can look up an order
 *  without a full account, but a scraper who guesses IDs cannot see them.
 *  Response is deliberately minimal (no payment ids, no addresses beyond city). */
export async function POST(req: NextRequest) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false, message: 'Invalid input' }, { status: 400 });

  const sb = supabaseAdmin();
  const isEmail = parsed.data.contact.includes('@');
  const contactNorm = isEmail ? parsed.data.contact.trim().toLowerCase() : parsed.data.contact.replace(/\D/g,'').slice(-10);

  const { data: order } = await sb.from('orders')
    .select('id, order_number, status, placed_at, estimated_delivery, shipping_address_snap, profiles(email), shipping(carrier,tracking_number,tracking_url,shipped_at,delivered_at)')
    .eq('order_number', parsed.data.order_number.trim().toUpperCase())
    .maybeSingle();
  if (!order) return NextResponse.json({ ok: false, message: 'We couldn’t find an order with those details.' }, { status: 404 });

  const emailMatch = isEmail && ((order as any).profiles?.email ?? '').toLowerCase() === contactNorm;
  const phoneMatch = !isEmail && (order.shipping_address_snap?.phone ?? '') === contactNorm;
  if (!emailMatch && !phoneMatch) {
    return NextResponse.json({ ok: false, message: 'We couldn’t find an order with those details.' }, { status: 404 });
  }

  const { data: hist } = await sb.from('order_status_history').select('status,note,changed_at').eq('order_id', order.id).order('changed_at');

  return NextResponse.json({
    ok: true,
    order: {
      order_number: order.order_number,
      status: order.status,
      placed_at: order.placed_at,
      estimated_delivery: order.estimated_delivery,
      shipping_city: order.shipping_address_snap?.city ?? null,
      shipping: (order as any).shipping ?? null,
      history: hist ?? []
    }
  });
}
