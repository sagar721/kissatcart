'use client';
import { useState } from 'react';
import Link from 'next/link';
import { AuthCard } from '@/components/auth/AuthCard';
import { supabaseBrowser } from '@/lib/supabase/client';

export function ForgotPasswordForm() {
  const sb = supabaseBrowser();
  const [email, setEmail] = useState(''); const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setMsg(null);
    const { error } = await sb.auth.resetPasswordForEmail(email, {
      redirectTo: `${location.origin}/auth/callback?type=recovery`
    });
    if (error) setMsg({ kind: 'error', text: error.message });
    else setMsg({ kind: 'ok', text: 'Reset link sent — check your inbox.' });
    setBusy(false);
  }

  return (
    <AuthCard title="Reset your password"
      subtitle="We'll email you a link to set a new password"
      footer={<><Link href="/login" className="text-maroon underline">Back to sign in</Link></>}>
      <form onSubmit={submit} className="space-y-3">
        <label className="block">
          <span className="block text-[11px] font-bold tracking-widest uppercase text-muted mb-1.5">Email</span>
          <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
            className="w-full border border-line rounded-md px-3 py-2.5 text-sm outline-none focus:border-maroon" />
        </label>
        {msg && (
          <div className={`text-xs rounded-md px-3 py-2 ${msg.kind === 'error'
            ? 'bg-red-50 text-red-700 border border-red-200'
            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
            {msg.text}
          </div>
        )}
        <button type="submit" disabled={busy}
          className="w-full bg-maroon text-white rounded-lg py-3 font-semibold disabled:opacity-60">
          {busy ? 'Sending…' : 'Send reset link'}
        </button>
      </form>
    </AuthCard>
  );
}
