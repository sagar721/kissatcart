import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

// Routes that require any signed-in user
const PROTECTED = [/^\/profile/, /^\/orders/, /^\/checkout/, /^\/wishlist/];
// Routes that require role in ('admin','staff')
const ADMIN_ONLY = [/^\/admin(\/|$)/];

function redirectToLogin(req: NextRequest, path: string) {
  const url = req.nextUrl.clone();
  url.pathname = '/login';
  url.searchParams.set('next', path);
  return NextResponse.redirect(url);
}

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const path = req.nextUrl.pathname;
  const needsAuth  = PROTECTED.some(r => r.test(path));
  const needsAdmin = ADMIN_ONLY.some(r => r.test(path));

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // A missing/blank Supabase config must never take down the whole site —
  // createServerClient() throws synchronously on an empty URL/key, which
  // (uncaught) crashes middleware for *every* route, public pages included.
  // Fail safe instead: deny protected/admin routes (can't verify identity),
  // let public routes through untouched.
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('middleware: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY is not set');
    return (needsAuth || needsAdmin) ? redirectToLogin(req, path) : res;
  }

  try {
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        get: (n: string) => req.cookies.get(n)?.value,
        set: (n: string, v: string, o: CookieOptions) => { res.cookies.set({ name: n, value: v, ...o }); },
        remove: (n: string, o: CookieOptions) => { res.cookies.set({ name: n, value: '', ...o }); }
      }
    });

    // Refresh the session cookie on every request
    const { data: { user } } = await supabase.auth.getUser();

    if ((needsAuth || needsAdmin) && !user) {
      return redirectToLogin(req, path);
    }

    if (needsAdmin && user) {
      const { data: prof } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
      if (!prof || (prof.role !== 'admin' && prof.role !== 'staff')) {
        const url = req.nextUrl.clone(); url.pathname = '/'; return NextResponse.redirect(url);
      }
    }
    return res;
  } catch (err) {
    // Same fail-safe as above: an unexpected auth-check error (network
    // blip to Supabase, malformed cookie, etc.) must not become a global
    // outage — deny protected/admin routes, let public routes through.
    console.error('middleware: auth check failed', err);
    return (needsAuth || needsAdmin) ? redirectToLogin(req, path) : res;
  }
}

export const config = {
  matcher: [
    // Skip Next internals, static files, and public API
    '/((?!_next/static|_next/image|favicon.ico|api/public|img|.*\\..*).*)'
  ]
};
