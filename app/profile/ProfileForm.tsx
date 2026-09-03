'use client';
import { useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase/client';
import type { CurrentUser } from '@/lib/auth';

export function ProfileForm({ user }: { user: CurrentUser }) {
  const sb = supabaseBrowser();
  const [name, setName]   = useState(user.full_name ?? '');
  const [phone, setPhone] = useState(user.phone ?? '');
  const [busy, setBusy]   = useState(false);
  const [msg, setMsg]     = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);

  async function save(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setMsg(null);
    const cleanPhone = phone.replace(/\D/g, '').slice(-10) || null;
    if (cleanPhone && !/^[6-9][0-9]{9}$/.test(cleanPhone)) {
      setMsg({ kind: 'error', text: 'Enter a valid 10-digit Indian mobile number.' });
      setBusy(false); return;
    }
    const { error } = await sb.from('profiles').update({ full_name: name, phone: cleanPhone }).eq('id', user.id);
    setBusy(false);
    setMsg(error ? { kind: 'error', text: error.message } : { kind: 'ok', text: 'Profile saved.' });
  }

  return (
    <form onSubmit={save} className="grid gap-4 max-w-lg">
      <Field label="Full name">
        <input value={name} onChange={e => setName(e.target.value)} required
          className="w-full border border-line rounded-md px-3 py-2.5 text-sm outline-none focus:border-maroon" />
      </Field>
      <Field label="Email">
        <input value={user.email} disabled
          className="w-full border border-line rounded-md px-3 py-2.5 text-sm bg-ground text-muted" />
        <p className="text-[11px] text-muted mt-1">Contact support to change your email.</p>
      </Field>
      <Field label="Mobile (10 digits, India)">
        <div className="flex border border-line rounded-md overflow-hidden focus-within:border-maroon">
          <span className="bg-ground px-3 grid place-items-center text-sm text-muted">+91</span>
          <input value={phone} onChange={e => setPhone(e.target.value)} inputMode="numeric" placeholder="9XXXXXXXXX"
            className="flex-1 px-3 py-2.5 text-sm outline-none" />
        </div>
      </Field>
      {msg && (
        <div className={`text-xs rounded-md px-3 py-2 ${msg.kind === 'error'
          ? 'bg-red-50 text-red-700 border border-red-200'
          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>{msg.text}</div>
      )}
      <button type="submit" disabled={busy}
        className="w-max bg-maroon text-white rounded-lg py-2.5 px-6 font-semibold disabled:opacity-60">
        {busy ? 'Saving…' : 'Save changes'}
      </button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[11px] font-bold tracking-widest uppercase text-muted mb-1.5">{label}</span>
      {children}
    </label>
  );
}
