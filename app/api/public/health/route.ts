import { NextResponse } from 'next/server';
import { appUrl } from '@/lib/format';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  const rawAppUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();

  let isSupabaseUrlValid = false;
  if (supabaseUrl) {
    try {
      const parsed = new URL(supabaseUrl);
      isSupabaseUrlValid = parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      isSupabaseUrlValid = false;
    }
  }

  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: {
      NEXT_PUBLIC_SUPABASE_URL: {
        defined: Boolean(supabaseUrl),
        length: supabaseUrl?.length ?? 0,
        validUrl: isSupabaseUrlValid,
      },
      NEXT_PUBLIC_SUPABASE_ANON_KEY: {
        defined: Boolean(supabaseAnonKey),
        length: supabaseAnonKey?.length ?? 0,
      },
      NEXT_PUBLIC_APP_URL: {
        defined: Boolean(rawAppUrl),
        length: rawAppUrl?.length ?? 0,
        resolved: appUrl(),
      },
    },
  });
}
