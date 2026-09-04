import { supabaseServer } from '@/lib/supabase/server';

export type CurrentUser = {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  role: 'customer' | 'admin' | 'staff';
  avatar_url: string | null;
};

export async function getCurrentUser(): Promise<CurrentUser | null> {
  // getCurrentUser() is called from the root layout's Navbar on every single
  // page. If Supabase is unreachable or misconfigured (missing/blank env
  // vars), createServerClient() throws — uncaught, that takes down every
  // route's render, not just auth-dependent ones. Fail safe: treat as
  // signed-out rather than crash the page.
  try {
    const sb = supabaseServer();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return null;
    const { data } = await sb.from('profiles').select('id,email,full_name,phone,role,avatar_url').eq('id', user.id).maybeSingle();
    return (data as CurrentUser | null) ?? null;
  } catch (err) {
    console.error('getCurrentUser failed', err);
    return null;
  }
}

export async function requireUser(): Promise<CurrentUser> {
  const u = await getCurrentUser();
  if (!u) throw new Error('UNAUTHENTICATED');
  return u;
}

export async function requireAdmin(): Promise<CurrentUser> {
  const u = await requireUser();
  if (u.role !== 'admin' && u.role !== 'staff') throw new Error('FORBIDDEN');
  return u;
}
