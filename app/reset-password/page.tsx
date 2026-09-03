'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthCard } from '@/components/auth/AuthCard';
import { supabaseBrowser } from '@/lib/supabase/client';

export default function ResetPasswordPage() {
  const sb = supabaseBrowser();
  const router = useRouter();
  const [pw, setPw]   = useState('');
  const [pw2, setPw2] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr]   = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (pw.length < 8) return setErr('Password must be at least 8 characters.');
    if (pw !== pw2)    return setErr('Passwords do not match.');
    setBusy(true);
    const { error } = await sb.auth.updateUser({ password: pw });
    setBusy(false);
    if (error) return setErr(error.message);
    router.push('/profile');
  }

  return (
    <AuthCard title="Set a new password" subtitle="Choose a password of at least 8 characters">
      <form onSubmit={submit} className="space-y-3">
        <label className="block">
          <span className="block text-[11px] font-bold tracking-widest uppercase text-muted mb-1.5">New password</span>
          <input type="password" required minLength={8} value={pw} onChange={e => setPw(e.target.value)}
            className="w-full border border-line rounded-md px-3 py-2.5 text-sm outline-none focus:border-maroon" />
        </label>
        <label className="block">
          <span className="block text-[11px] font-bold tracking-widest uppercase text-muted mb-1.5">Confirm password</span>
          <input type="password" required minLength={8} value={pw2} onChange={e => setPw2(e.target.value)}
            className="w-full border border-line rounded-md px-3 py-2.5 text-sm outline-none focus:border-maroon" />
        </label>
        {err && <div className="text-xs rounded-md px-3 py-2 bg-red-50 text-red-700 border border-red-200">{err}</div>}
        <button type="submit" disabled={busy}
          className="w-full bg-maroon text-white rounded-lg py-3 font-semibold disabled:opacity-60">
          {busy ? 'Saving…' : 'Save password'}
        </button>
      </form>
    </AuthCard>
  );
}
