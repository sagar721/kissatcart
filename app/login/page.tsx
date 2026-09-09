import { Suspense } from 'react';
import Link from 'next/link';
import { AuthCard } from '@/components/auth/AuthCard';
import { LoginForms } from '@/components/auth/LoginForms';

// Renders LoginForms, which creates a Supabase browser client at render
// time — that must not run during next build's static-generation attempt
// (it throws if Supabase env vars aren't present in the build environment,
// which fails the whole build, not just this route).
export const dynamic = 'force-dynamic';
export const metadata = { title: 'Sign in' };

export default function LoginPage() {
  return (
    <AuthCard
      title="Welcome back"
      subtitle="Sign in to continue shopping with KismatKart"
      footer={<>Don&apos;t have an account? <Link href="/signup" className="text-maroon font-semibold underline">Sign up</Link></>}
    >
      <Suspense><LoginForms mode="login" /></Suspense>
    </AuthCard>
  );
}
