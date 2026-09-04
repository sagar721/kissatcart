import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm';

// See app/forgot-password/page.tsx — same reason for force-dynamic plus
// the client logic living in its own component file.
export const dynamic = 'force-dynamic';
export const metadata = { title: 'Set a new password' };

export default function ResetPasswordPage() {
  return <ResetPasswordForm />;
}
