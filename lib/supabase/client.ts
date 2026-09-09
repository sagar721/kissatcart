'use client';
import { createBrowserClient } from '@supabase/ssr';

let _client: ReturnType<typeof createBrowserClient> | undefined;

export function supabaseBrowser() {
  if (!_client) {
    // Never let a missing/blank Supabase config crash whatever page calls
    // this — createBrowserClient() throws synchronously on an empty
    // URL/key, and in a component with no error boundary above it that's
    // an uncaught 500 instead of a usable page. Fall back to
    // syntactically-valid placeholder values so construction always
    // succeeds; real auth calls then fail at the network layer, which
    // every caller already handles via `if (error) ...`.
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) console.error('supabaseBrowser: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY is not set');
    _client = createBrowserClient(
      url || 'https://placeholder.supabase.co',
      key || 'placeholder-anon-key'
    );
  }
  return _client;
}
