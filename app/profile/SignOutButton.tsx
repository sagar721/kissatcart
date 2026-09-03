'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function SignOutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  async function go() {
    setBusy(true);
    await fetch('/api/auth/signout', { method: 'POST' });
    router.push('/'); router.refresh();
  }
  return (
    <button onClick={go} disabled={busy}
      className="mt-5 w-full border border-line rounded-md py-2 text-sm text-maroon font-semibold hover:bg-ground">
      {busy ? 'Signing out…' : 'Sign out'}
    </button>
  );
}
