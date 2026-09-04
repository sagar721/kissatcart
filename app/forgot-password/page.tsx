import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';

// ForgotPasswordForm creates a Supabase browser client at render time —
// that must not run during next build's static-generation attempt (throws
// if Supabase env vars aren't present in the build environment, failing
// the whole build). A `dynamic` export only reliably opts a route out of
// prerendering from a Server Component file, so the client logic lives in
// its own component and this page stays a plain server component wrapper.
export const dynamic = 'force-dynamic';
export const metadata = { title: 'Reset your password' };

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
