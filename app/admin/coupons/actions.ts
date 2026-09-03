'use server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth';

const CouponInput = z.object({
  id:                    z.string().uuid().optional(),
  code:                  z.string().min(3).max(40).transform(s => s.toUpperCase()),
  discount_type:         z.enum(['percent', 'flat']),
  discount_value:        z.coerce.number().positive(),
  min_order_amount:      z.coerce.number().nonnegative().default(0),
  max_discount_amount:   z.coerce.number().nonnegative().nullable().optional(),
  starts_at:             z.string().optional(),
  ends_at:               z.string().nullable().optional(),
  usage_limit:           z.coerce.number().int().positive().nullable().optional(),
  per_user_limit:        z.coerce.number().int().positive().default(1),
  is_active:             z.boolean().default(true)
});

export async function saveCoupon(input: unknown) {
  await requireAdmin();
  const p = CouponInput.safeParse(input);
  if (!p.success) return { ok: false as const, error: p.error.issues[0]?.message ?? 'Invalid input' };
  if (p.data.discount_type === 'percent' && (p.data.discount_value <= 0 || p.data.discount_value > 100))
    return { ok: false as const, error: 'Percentage must be between 1 and 100' };
  const sb = supabaseAdmin();
  const { id, ...body } = p.data;
  if (id) {
    const { error } = await sb.from('coupons').update(body).eq('id', id);
    if (error) return { ok: false as const, error: error.message };
  } else {
    const { error } = await sb.from('coupons').insert({ ...body, scope: 'cart' });
    if (error) return { ok: false as const, error: error.message };
  }
  revalidatePath('/admin/coupons');
  return { ok: true as const };
}
export async function deleteCoupon(id: string) {
  await requireAdmin();
  const sb = supabaseAdmin();
  await sb.from('coupons').delete().eq('id', id);
  revalidatePath('/admin/coupons');
  return { ok: true as const };
}
