import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

// Routes that require any signed-in user
const PROTECTED = [/^\/profile/, /^\/orders/, /^\/checkout/, /^\/wishlist/];
// Routes that require role in ('admin','staff')
const ADMIN_ONLY = [/^\/admin(\/|$)/];

function isValidUrl(urlString: string | undefined | null): boolean {
  if (!urlString) return false;
  try {
    const parsed = new URL(urlString);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export async function middleware(req: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: req.headers,
    },
  });

  const path = req.nextUrl.pathname;
  const needsAuth = PROTECTED.some(r => r.test(path));
  const needsAdmin = ADMIN_ONLY.some(r => r.test(path));

  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  // If Supabase environment variables are missing or invalid
  if (!rawUrl || !rawKey || !isValidUrl(rawUrl)) {
    if (needsAuth || needsAdmin) {
      const loginUrl = req.nextUrl.clone();
      loginUrl.pathname = '/login';
      loginUrl.searchParams.set('next', path);
      return NextResponse.redirect(loginUrl);
    }
    response.headers.set('x-middleware-status', 'ok');
    return response;
  }

  let user = null;
  let supabase = null;

  try {
    supabase = createServerClient(
      rawUrl,
      rawKey,
      {
        cookies: {
          getAll() {
            return req.cookies.getAll();
          },
          setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
            cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value));
            response = NextResponse.next({
              request: {
                headers: req.headers,
              },
            });
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    const { data, error } = await supabase.auth.getUser();
    if (!error && data?.user) {
      user = data.user;
    }
  } catch {
    user = null;
  }

  // Redirect unauthenticated users away from protected routes
  if ((needsAuth || needsAdmin) && !user) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = '/login';
    loginUrl.searchParams.set('next', path);
    const redirectRes = NextResponse.redirect(loginUrl);
    response.cookies.getAll().forEach((c) => {
      redirectRes.cookies.set(c.name, c.value, c);
    });
    return redirectRes;
  }

  // Enforce admin/staff roles for admin routes
  if (needsAdmin && user && supabase) {
    try {
      const { data: prof, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();

      if (error || !prof || (prof.role !== 'admin' && prof.role !== 'staff')) {
        const homeUrl = req.nextUrl.clone();
        homeUrl.pathname = '/';
        const redirectRes = NextResponse.redirect(homeUrl);
        response.cookies.getAll().forEach((c) => {
          redirectRes.cookies.set(c.name, c.value, c);
        });
        return redirectRes;
      }
    } catch {
      const homeUrl = req.nextUrl.clone();
      homeUrl.pathname = '/';
      return NextResponse.redirect(homeUrl);
    }
  }

  response.headers.set('x-middleware-status', 'ok');
  return response;
}

export const config = {
  matcher: [
    // Skip Next internals, static files, and public API
    '/((?!_next/static|_next/image|favicon.ico|api/public|img|.*\\..*).*)'
  ]
};

