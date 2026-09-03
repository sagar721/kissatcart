import { NextResponse, type NextRequest } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';

/** Callback for:
 *  - OAuth (Google, ...) → ?code=...
 *  - Email confirm / magic link → ?code=... or #access_token=... (SSR only handles ?code=)
 *  - Password recovery → ?code=... + type=recovery (Supabase adds ?type)
 */
export async function GET(req: NextRequest) {
  const url  = new URL(req.url);
  const code = url.searchParams.get('code');
  const type = url.searchParams.get('type');
  const next = url.searchParams.get('next') ?? '/';
  const sb   = supabaseServer();

  if (code) {
    const { error } = await sb.auth.exchangeCodeForSession(code);
    if (error) {
      const back = new URL('/login', url.origin);
      back.searchParams.set('error', error.message);
      return NextResponse.redirect(back);
    }
  }

  // Password-recovery flow → send them to reset form
  if (type === 'recovery') {
    return NextResponse.redirect(new URL('/reset-password', url.origin));
  }

  return NextResponse.redirect(new URL(next.startsWith('/') ? next : '/', url.origin));
}
