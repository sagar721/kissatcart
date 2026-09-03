'use server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth';

const CatInput = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/),
  name: z.string().min(2),
  description: z.string().nullable().optional(),
  sort_order: z.coerce.number().int().default(0),
  is_active: z.boolean().default(true)
});

export async function saveCategory(input: unknown) {
  await requireAdmin();
  const p = CatInput.safeParse(input);
  if (!p.success) return { ok: false as const, error: p.error.issues[0]?.message ?? 'Invalid' };
  const sb = supabaseAdmin();
  if (p.data.id) {
    const { error } = await sb.from('categories').update(p.data).eq('id', p.data.id);
    if (error) return { ok: false as const, error: error.message };
  } else {
    const { error } = await sb.from('categories').insert(p.data);
    if (error) return { ok: false as const, error: error.message };
  }
  revalidatePath('/admin/categories');
  return { ok: true as const };
}

export async function deleteCategory(id: string) {
  await requireAdmin();
  const sb = supabaseAdmin();
  const { count } = await sb.from('products').select('id', { count: 'exact', head: true }).eq('category_id', id);
  if ((count ?? 0) > 0) return { ok: false as const, error: `Cannot delete — ${count} product(s) still in this category.` };
  const { error } = await sb.from('categories').delete().eq('id', id);
  if (error) return { ok: false as const, error: error.message };
  revalidatePath('/admin/categories');
  return { ok: true as const };
}
