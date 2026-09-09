import { Suspense } from 'react';
import Link from 'next/link';
import { AuthCard } from '@/components/auth/AuthCard';
import { LoginForms } from '@/components/auth/LoginForms';

// See app/login/page.tsx — LoginForms creates a Supabase browser client at
// render time, which must not run during next build's static generation.
export const dynamic = 'force-dynamic';
export const metadata = { title: 'Create your account' };

export default function SignupPage() {
  return (
    <AuthCard
      title="Create your account"
      subtitle="Join KismatKart in less than a minute"
      footer={<>Already registered? <Link href="/login" className="text-maroon font-semibold underline">Sign in</Link></>}
    >
      <Suspense><LoginForms mode="signup" /></Suspense>
    </AuthCard>
  );
}
