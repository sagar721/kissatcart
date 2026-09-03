'use server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth';

const ProductInput = z.object({
  id:                 z.string().uuid().optional(),
  slug:               z.string().min(2).regex(/^[a-z0-9-]+$/, 'lowercase, digits, dashes only'),
  name:               z.string().min(2),
  brand:              z.string().min(1).default('KismatKart'),
  short_description:  z.string().max(200).nullable().optional(),
  description:        z.string().max(4000).nullable().optional(),
  category_id:        z.string().uuid(),
  price:              z.coerce.number().nonnegative(),
  mrp:                z.coerce.number().nonnegative(),
  sku_prefix:         z.string().min(2),
  tags:               z.array(z.string()).default([]),
  is_active:          z.boolean().default(true),
  is_featured:        z.boolean().default(false),
  is_new_arrival:     z.boolean().default(false)
});

export async function saveProduct(input: unknown) {
  await requireAdmin();
  const parsed = ProductInput.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: parsed.error.issues[0]?.message ?? 'Invalid input' };
  const sb = supabaseAdmin();
  const { id, ...body } = parsed.data;
  if (body.mrp < body.price) return { ok: false as const, error: 'MRP cannot be below price' };
  if (id) {
    const { error } = await sb.from('products').update(body).eq('id', id);
    if (error) return { ok: false as const, error: error.message };
    revalidatePath(`/admin/products/${id}`);
  } else {
    const { data, error } = await sb.from('products').insert(body).select('id').single();
    if (error) return { ok: false as const, error: error.message };
    revalidatePath(`/admin/products`);
    return { ok: true as const, id: data.id };
  }
  revalidatePath('/admin/products');
  revalidatePath(`/product/${body.slug}`);
  return { ok: true as const, id };
}

export async function deleteProduct(id: string) {
  await requireAdmin();
  const sb = supabaseAdmin();
  const { error } = await sb.from('products').delete().eq('id', id);
  if (error) return { ok: false as const, error: error.message };
  revalidatePath('/admin/products');
  return { ok: true as const };
}

export async function upsertVariant(input: {
  id?: string; product_id: string; sku: string;
  size?: string | null; color?: string | null; color_hex?: string | null; price_delta?: number; is_active?: boolean;
  stock_qty?: number; low_stock_at?: number;
}) {
  await requireAdmin();
  const sb = supabaseAdmin();
  const { stock_qty, low_stock_at, ...body } = input;
  if (input.id) {
    const { error } = await sb.from('product_variants').update(body).eq('id', input.id);
    if (error) return { ok: false as const, error: error.message };
    if (stock_qty != null) {
      await sb.from('inventory').upsert({ variant_id: input.id, stock_qty, low_stock_at: low_stock_at ?? 5 });
    }
  } else {
    const { data, error } = await sb.from('product_variants').insert(body).select('id').single();
    if (error) return { ok: false as const, error: error.message };
    await sb.from('inventory').upsert({ variant_id: data.id, stock_qty: stock_qty ?? 0, low_stock_at: low_stock_at ?? 5 });
  }
  revalidatePath(`/admin/products/${input.product_id}`);
  return { ok: true as const };
}

export async function deleteVariant(id: string, product_id: string) {
  await requireAdmin();
  const sb = supabaseAdmin();
  const { error } = await sb.from('product_variants').delete().eq('id', id);
  if (error) return { ok: false as const, error: error.message };
  revalidatePath(`/admin/products/${product_id}`);
  return { ok: true as const };
}
