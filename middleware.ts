import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

// Routes that require any signed-in user
const PROTECTED = [/^\/profile/, /^\/orders/, /^\/checkout/, /^\/wishlist/];
// Routes that require role in ('admin','staff')
const ADMIN_ONLY = [/^\/admin(\/|$)/];

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (n: string) => req.cookies.get(n)?.value,
        set: (n: string, v: string, o: CookieOptions) => { res.cookies.set({ name: n, value: v, ...o }); },
        remove: (n: string, o: CookieOptions) => { res.cookies.set({ name: n, value: '', ...o }); }
      }
    }
  );

  // Refresh the session cookie on every request
  const { data: { user } } = await supabase.auth.getUser();
  const path = req.nextUrl.pathname;

  const needsAuth  = PROTECTED.some(r => r.test(path));
  const needsAdmin = ADMIN_ONLY.some(r => r.test(path));

  if ((needsAuth || needsAdmin) && !user) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', path);
    return NextResponse.redirect(url);
  }

  if (needsAdmin && user) {
    const { data: prof } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
    if (!prof || (prof.role !== 'admin' && prof.role !== 'staff')) {
      const url = req.nextUrl.clone(); url.pathname = '/'; return NextResponse.redirect(url);
    }
  }
  return res;
}

export const config = {
  matcher: [
    // Skip Next internals, static files, and public API
    '/((?!_next/static|_next/image|favicon.ico|api/public|img|.*\\..*).*)'
  ]
};
