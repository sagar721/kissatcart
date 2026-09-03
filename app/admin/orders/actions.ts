'use server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth';

const StatusSchema = z.enum([
  'pending','confirmed','processing','packed','shipped',
  'out_for_delivery','delivered','cancelled',
  'return_requested','returned','refunded'
]);

export async function updateOrderStatus(orderId: string, status: string, note?: string) {
  const admin = await requireAdmin();
  const parsed = StatusSchema.safeParse(status);
  if (!parsed.success) return { ok: false as const, error: 'Invalid status' };
  const sb = supabaseAdmin();
  const { error } = await sb.rpc('set_order_status', {
    p_order_id: orderId, p_status: parsed.data, p_note: note ?? null
  });
  if (error) return { ok: false as const, error: error.message };

  // Fetch order + user for notification enqueue
  const { data: order } = await sb.from('orders').select('id, user_id').eq('id', orderId).maybeSingle();

  if (parsed.data === 'cancelled') {
    const { data: items } = await sb.from('order_items').select('variant_id,quantity').eq('order_id', orderId);
    for (const it of items ?? []) {
      await sb.rpc('release_stock', { p_variant_id: it.variant_id, p_qty: it.quantity });
    }
  }

  // Enqueue email notifications for milestone statuses (Phase 16 worker drains)
  const template = ({
    shipped: 'order_shipped', delivered: 'order_delivered', cancelled: 'order_cancelled'
  } as any)[parsed.data];
  if (template && order) {
    await sb.from('notifications').insert({
      user_id: order.user_id, channel: 'email', template, payload: { order_id: order.id }
    });
  }
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath('/admin/orders');
  revalidatePath('/admin');
  return { ok: true as const };
}

export async function updateShipping(orderId: string, input: { carrier?: string; tracking_number?: string; tracking_url?: string }) {
  await requireAdmin();
  const sb = supabaseAdmin();
  const { error } = await sb.from('shipping').upsert({
    order_id: orderId, ...input, updated_at: new Date().toISOString()
  });
  if (error) return { ok: false as const, error: error.message };
  revalidatePath(`/admin/orders/${orderId}`);
  return { ok: true as const };
}
