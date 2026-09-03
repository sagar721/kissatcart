import { Suspense } from 'react';
import Link from 'next/link';
import { AuthCard } from '@/components/auth/AuthCard';
import { LoginForms } from '@/components/auth/LoginForms';

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
