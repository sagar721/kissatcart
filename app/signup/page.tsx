import { Suspense } from 'react';
import Link from 'next/link';
import { AuthCard } from '@/components/auth/AuthCard';
import { LoginForms } from '@/components/auth/LoginForms';

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
