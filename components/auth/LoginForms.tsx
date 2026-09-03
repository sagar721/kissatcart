'use client';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { supabaseBrowser } from '@/lib/supabase/client';
import { cx } from '@/lib/format';

type Tab = 'password' | 'magic' | 'phone';

export function LoginForms({ mode = 'login' }: { mode?: 'login' | 'signup' }) {
  const [tab, setTab] = useState<Tab>('password');
  const sp = useSearchParams();
  const errFromUrl = sp.get('error');

  return (
    <>
      {errFromUrl && <Notice kind="error">{decodeURIComponent(errFromUrl)}</Notice>}

      <div className="flex gap-1 bg-ground rounded-lg p-1 mb-5">
        <TabBtn active={tab === 'password'} onClick={() => setTab('password')}>Password</TabBtn>
        <TabBtn active={tab === 'magic'}    onClick={() => setTab('magic')}>Magic link</TabBtn>
        <TabBtn active={tab === 'phone'}    onClick={() => setTab('phone')}>Phone</TabBtn>
      </div>

      {tab === 'password' && <PasswordForm mode={mode} />}
      {tab === 'magic'    && <MagicLinkForm />}
      {tab === 'phone'    && <PhoneForm />}

      <div className="my-6 flex items-center gap-3 text-xs text-muted">
        <span className="flex-1 h-px bg-line" /> OR <span className="flex-1 h-px bg-line" />
      </div>

      <GoogleButton />
    </>
  );
}

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick}
      className={cx('flex-1 text-sm py-2 rounded-md font-medium transition',
        active ? 'bg-white text-ink shadow-sm' : 'text-muted hover:text-ink')}>
      {children}
    </button>
  );
}

function PasswordForm({ mode }: { mode: 'login' | 'signup' }) {
  const sb = supabaseBrowser();
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get('next') ?? '/';
  const [email, setEmail] = useState(''); const [pw, setPw] = useState(''); const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg,  setMsg]  = useState<{ kind: 'error' | 'ok'; text: string } | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setMsg(null);
    try {
      if (mode === 'signup') {
        const { error } = await sb.auth.signUp({
          email, password: pw,
          options: {
            emailRedirectTo: `${location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
            data: { full_name: name }
          }
        });
        if (error) throw error;
        setMsg({ kind: 'ok', text: 'Check your inbox to confirm your email address.' });
      } else {
        const { error } = await sb.auth.signInWithPassword({ email, password: pw });
        if (error) throw error;
        router.push(next); router.refresh();
      }
    } catch (err: any) {
      setMsg({ kind: 'error', text: err.message ?? 'Something went wrong' });
    } finally { setBusy(false); }
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      {mode === 'signup' && (
        <Input label="Full name" type="text" value={name} onChange={setName} required autoComplete="name" />
      )}
      <Input label="Email" type="email" value={email} onChange={setEmail} required autoComplete="email" />
      <Input label="Password" type="password" value={pw} onChange={setPw} required minLength={8}
             autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} />
      {mode === 'login' && (
        <div className="text-right"><Link href="/forgot-password" className="text-xs text-maroon underline">Forgot password?</Link></div>
      )}
      {msg && <Notice kind={msg.kind}>{msg.text}</Notice>}
      <Submit busy={busy}>{mode === 'signup' ? 'Create account' : 'Sign in'}</Submit>
    </form>
  );
}

function MagicLinkForm() {
  const sb = supabaseBrowser();
  const sp = useSearchParams();
  const next = sp.get('next') ?? '/';
  const [email, setEmail] = useState(''); const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: 'error' | 'ok'; text: string } | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setMsg(null);
    const { error } = await sb.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${location.origin}/auth/callback?next=${encodeURIComponent(next)}` }
    });
    if (error) setMsg({ kind: 'error', text: error.message });
    else       setMsg({ kind: 'ok', text: 'Magic link sent — check your inbox.' });
    setBusy(false);
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <Input label="Email" type="email" value={email} onChange={setEmail} required autoComplete="email" />
      {msg && <Notice kind={msg.kind}>{msg.text}</Notice>}
      <Submit busy={busy}>Send magic link</Submit>
    </form>
  );
}

function PhoneForm() {
  const sb = supabaseBrowser();
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get('next') ?? '/';
  const [phone, setPhone] = useState(''); const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'send' | 'verify'>('send');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: 'error' | 'ok'; text: string } | null>(null);

  async function sendOtp(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setMsg(null);
    const p = '+91' + phone.replace(/\D/g, '').slice(-10);
    const { error } = await sb.auth.signInWithOtp({ phone: p });
    if (error) setMsg({ kind: 'error', text: error.message });
    else { setStep('verify'); setMsg({ kind: 'ok', text: `OTP sent to ${p}` }); }
    setBusy(false);
  }
  async function verifyOtp(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setMsg(null);
    const p = '+91' + phone.replace(/\D/g, '').slice(-10);
    const { error } = await sb.auth.verifyOtp({ phone: p, token: otp, type: 'sms' });
    if (error) setMsg({ kind: 'error', text: error.message });
    else { router.push(next); router.refresh(); return; }
    setBusy(false);
  }
  return step === 'send' ? (
    <form onSubmit={sendOtp} className="space-y-3">
      <Input label="Mobile number (10 digits)" type="tel" value={phone} onChange={setPhone}
             pattern="[6-9][0-9]{9}" required autoComplete="tel-national" prefix="+91" />
      {msg && <Notice kind={msg.kind}>{msg.text}</Notice>}
      <Submit busy={busy}>Send OTP</Submit>
    </form>
  ) : (
    <form onSubmit={verifyOtp} className="space-y-3">
      <Input label="Enter 6-digit OTP" type="text" value={otp} onChange={setOtp} pattern="[0-9]{6}" required />
      {msg && <Notice kind={msg.kind}>{msg.text}</Notice>}
      <Submit busy={busy}>Verify &amp; sign in</Submit>
      <button type="button" onClick={() => setStep('send')} className="text-xs text-muted underline">Change number</button>
    </form>
  );
}

function GoogleButton() {
  const sb = supabaseBrowser();
  const sp = useSearchParams();
  const next = sp.get('next') ?? '/';
  const [busy, setBusy] = useState(false);
  async function go() {
    setBusy(true);
    const { error } = await sb.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${location.origin}/auth/callback?next=${encodeURIComponent(next)}` }
    });
    if (error) { alert(error.message); setBusy(false); }
  }
  return (
    <button type="button" onClick={go} disabled={busy}
      className="w-full flex items-center justify-center gap-2.5 border border-line bg-white rounded-lg py-3 font-medium hover:bg-ground disabled:opacity-60">
      <GoogleIcon /> {busy ? 'Redirecting…' : 'Continue with Google'}
    </button>
  );
}

/* ---------- shared bits ---------- */

function Input({ label, value, onChange, prefix, ...rest }:
  { label: string; value: string; onChange: (v: string) => void; prefix?: string } & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'>) {
  return (
    <label className="block">
      <span className="block text-[11px] font-bold tracking-widest uppercase text-muted mb-1.5">{label}</span>
      <span className="flex items-stretch border border-line rounded-md overflow-hidden focus-within:border-maroon">
        {prefix && <span className="bg-ground px-3 grid place-items-center text-sm text-muted">{prefix}</span>}
        <input {...rest} value={value} onChange={e => onChange(e.target.value)}
               className="flex-1 px-3 py-2.5 text-sm outline-none" />
      </span>
    </label>
  );
}
function Submit({ busy, children }: { busy: boolean; children: React.ReactNode }) {
  return (
    <button type="submit" disabled={busy}
      className="w-full bg-maroon text-white rounded-lg py-3 font-semibold disabled:opacity-60">
      {busy ? 'Please wait…' : children}
    </button>
  );
}
function Notice({ kind, children }: { kind: 'error' | 'ok'; children: React.ReactNode }) {
  return (
    <div className={cx('text-xs rounded-md px-3 py-2',
      kind === 'error' ? 'bg-red-50 text-red-700 border border-red-200'
                       : 'bg-emerald-50 text-emerald-700 border border-emerald-200')}>
      {children}
    </div>
  );
}
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48">
      <path fill="#EA4335" d="M24 9.5c3.5 0 6.5 1.3 8.9 3.5l6.6-6.6C35.4 2.5 30 0 24 0 14.6 0 6.5 5.4 2.7 13.3l7.7 6C12.3 13.5 17.7 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.6-4.9 7.3l7.5 5.8c4.4-4.1 7.2-10 7.2-17.6z"/>
      <path fill="#FBBC05" d="M10.4 28.7c-.5-1.5-.8-3-.8-4.7s.3-3.2.8-4.7l-7.7-6C1.1 16.6 0 20.2 0 24s1.1 7.4 2.7 10.7l7.7-6z"/>
      <path fill="#34A853" d="M24 48c6 0 11.4-2 15.2-5.4l-7.5-5.8c-2 1.4-4.6 2.3-7.7 2.3-6.3 0-11.7-4-13.6-9.7l-7.7 6C6.5 42.6 14.6 48 24 48z"/>
    </svg>
  );
}
