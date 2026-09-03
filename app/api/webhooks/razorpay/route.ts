import { NextResponse, type NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { verifyWebhookSignature } from '@/lib/razorpay/client';

/** Razorpay webhook handler. Configure the endpoint in Razorpay Dashboard →
 *  Webhooks with RAZORPAY_WEBHOOK_SECRET as the secret. Events we care about:
 *   - payment.captured    → mirror /verify (idempotent) as a safety net
 *   - payment.failed      → mark payment failed, release stock, cancel order
 *   - refund.processed    → mark payment refunded, restore stock */
export async function POST(req: NextRequest) {
  const raw = await req.text();
  const sig = req.headers.get('x-razorpay-signature') ?? '';
  if (!verifyWebhookSignature(raw, sig)) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const event = JSON.parse(raw);
  const sb = supabaseAdmin();
  const rzpOrderId = event?.payload?.payment?.entity?.order_id ?? event?.payload?.order?.entity?.id;
  if (!rzpOrderId) return NextResponse.json({ ok: true, ignored: true });

  const { data: payment } = await sb.from('payments').select('id, order_id, status')
    .eq('razorpay_order_id', rzpOrderId).maybeSingle();
  if (!payment) return NextResponse.json({ ok: true, ignored: true });

  switch (event.event) {
    case 'payment.captured':
      if (payment.status !== 'captured') {
        await sb.from('payments').update({
          status: 'captured',
          razorpay_payment_id: event.payload.payment.entity.id,
          raw_payload: event, updated_at: new Date().toISOString()
        }).eq('id', payment.id);
        await sb.rpc('set_order_status', { p_order_id: payment.order_id, p_status: 'confirmed', p_note: 'Payment captured (webhook)' });
        const { data: items } = await sb.from('order_items').select('variant_id,quantity').eq('order_id', payment.order_id);
        for (const it of items ?? []) await sb.rpc('commit_stock', { p_variant_id: it.variant_id, p_qty: it.quantity });
      }
      break;

    case 'payment.failed':
      await sb.from('payments').update({
        status: 'failed',
        failure_code: event.payload.payment.entity.error_code ?? null,
        failure_reason: event.payload.payment.entity.error_description ?? null,
        raw_payload: event, updated_at: new Date().toISOString()
      }).eq('id', payment.id);
      await sb.rpc('set_order_status', { p_order_id: payment.order_id, p_status: 'cancelled', p_note: 'Payment failed' });
      const { data: itemsF } = await sb.from('order_items').select('variant_id,quantity').eq('order_id', payment.order_id);
      for (const it of itemsF ?? []) await sb.rpc('release_stock', { p_variant_id: it.variant_id, p_qty: it.quantity });
      break;

    case 'refund.processed':
      await sb.from('payments').update({
        status: 'refunded', raw_payload: event, updated_at: new Date().toISOString()
      }).eq('id', payment.id);
      await sb.rpc('set_order_status', { p_order_id: payment.order_id, p_status: 'refunded', p_note: 'Refund processed' });
      const { data: itemsR } = await sb.from('order_items').select('variant_id,quantity').eq('order_id', payment.order_id);
      for (const it of itemsR ?? []) await sb.rpc('restore_stock', { p_variant_id: it.variant_id, p_qty: it.quantity });
      break;
  }
  return NextResponse.json({ ok: true });
}
