'use server';
import { revalidatePath } from 'next/cache';
import { supabaseAdmin } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth';

export async function setReviewApproved(id: string, approved: boolean) {
  await requireAdmin();
  const sb = supabaseAdmin();
  await sb.from('reviews').update({ is_approved: approved }).eq('id', id);
  revalidatePath('/admin/reviews');
  return { ok: true as const };
}
export async function deleteReview(id: string) {
  await requireAdmin();
  const sb = supabaseAdmin();
  await sb.from('reviews').delete().eq('id', id);
  revalidatePath('/admin/reviews');
  return { ok: true as const };
}
