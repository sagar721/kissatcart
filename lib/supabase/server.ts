import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

// A missing OR malformed (non-empty but not a valid http(s) URL) value both
// make createServerClient()/createClient() throw synchronously. A truthy
// check alone (`url || fallback`) only catches the missing case — a
// malformed value passes straight through and still crashes. Validate
// well-formedness too, same as middleware.ts already does.
function safeUrl(value: string | undefined): string {
  if (value) {
    try {
      const parsed = new URL(value);
      if (parsed.protocol === 'http:' || parsed.protocol === 'https:') return value;
    } catch {}
  }
  return 'https://placeholder.supabase.co';
}

/** Server-side Supabase client bound to the current request's cookies.
 *  RLS applies; queries run as the signed-in user (or anonymous). */
export function supabaseServer() {
  const cookieStore = cookies();
  return createServerClient(
    safeUrl(process.env.NEXT_PUBLIC_SUPABASE_URL),
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key',
    {
      cookies: {
        get: (name: string) => cookieStore.get(name)?.value,
        set: (name: string, value: string, options: CookieOptions) => {
          try { cookieStore.set({ name, value, ...options }); } catch {}
        },
        remove: (name: string, options: CookieOptions) => {
          try { cookieStore.set({ name, value: '', ...options }); } catch {}
        }
      }
    }
  );
}

/** Service-role client for privileged server ops (orders, payments, admin).
 *  NEVER import from a client component. */
export function supabaseAdmin() {
  const { createClient } = require('@supabase/supabase-js');
  return createClient(
    safeUrl(process.env.NEXT_PUBLIC_SUPABASE_URL),
    process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-role-key',
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}
