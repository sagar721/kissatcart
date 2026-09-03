'use server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { supabaseServer } from '@/lib/supabase/server';
import { requireUser } from '@/lib/auth';

const AddressInput = z.object({
  id: z.string().uuid().optional(),
  full_name: z.string().min(2).max(80),
  phone:     z.string().regex(/^[6-9][0-9]{9}$/, 'Enter a valid 10-digit mobile'),
  line1:     z.string().min(3).max(120),
  line2:     z.string().max(120).optional().nullable(),
  landmark:  z.string().max(80).optional().nullable(),
  city:      z.string().min(2).max(60),
  state:     z.string().min(2).max(60),
  pincode:   z.string().regex(/^[1-9][0-9]{5}$/, 'Enter a valid 6-digit PIN'),
  is_default: z.boolean().optional().default(false),
  type:       z.enum(['shipping', 'billing']).default('shipping')
});

export type AddressActionResult = { ok: true } | { ok: false; error: string; fields?: string[] };

export async function saveAddress(input: unknown): Promise<AddressActionResult> {
  try {
    const user = await requireUser();
    const parsed = AddressInput.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid input',
               fields: parsed.error.issues.map(i => String(i.path[0])) };
    }
    const sb = supabaseServer();

    if (parsed.data.is_default) {
      // Clear existing default of same type first (unique index enforces one default)
      await sb.from('addresses').update({ is_default: false })
        .eq('user_id', user.id).eq('type', parsed.data.type);
    }

    if (parsed.data.id) {
      const { error } = await sb.from('addresses').update({
        ...parsed.data, user_id: user.id
      }).eq('id', parsed.data.id).eq('user_id', user.id);
      if (error) return { ok: false, error: error.message };
    } else {
      const { error } = await sb.from('addresses').insert({ ...parsed.data, user_id: user.id });
      if (error) return { ok: false, error: error.message };
    }
    revalidatePath('/profile/addresses');
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e.message ?? 'Something went wrong' };
  }
}

export async function deleteAddress(id: string): Promise<AddressActionResult> {
  try {
    const user = await requireUser();
    const sb = supabaseServer();
    const { error } = await sb.from('addresses').delete().eq('id', id).eq('user_id', user.id);
    if (error) return { ok: false, error: error.message };
    revalidatePath('/profile/addresses');
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e.message ?? 'Something went wrong' };
  }
}

export async function setDefaultAddress(id: string): Promise<AddressActionResult> {
  try {
    const user = await requireUser();
    const sb = supabaseServer();
    const { data: addr } = await sb.from('addresses').select('type').eq('id', id).eq('user_id', user.id).maybeSingle();
    if (!addr) return { ok: false, error: 'Address not found' };
    await sb.from('addresses').update({ is_default: false }).eq('user_id', user.id).eq('type', addr.type);
    const { error } = await sb.from('addresses').update({ is_default: true }).eq('id', id).eq('user_id', user.id);
    if (error) return { ok: false, error: error.message };
    revalidatePath('/profile/addresses');
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e.message ?? 'Something went wrong' };
  }
}
