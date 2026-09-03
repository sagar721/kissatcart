'use client';
import { useState, useTransition } from 'react';
import { saveCoupon, deleteCoupon } from './actions';
import { useRouter } from 'next/navigation';

export function CouponForm({ initial }: { initial?: any }) {
  const router = useRouter();
  const [f, setF] = useState({
    id:                  initial?.id,
    code:                initial?.code ?? '',
    discount_type:       initial?.discount_type ?? 'percent',
    discount_value:      initial?.discount_value ?? 10,
    min_order_amount:    initial?.min_order_amount ?? 0,
    max_discount_amount: initial?.max_discount_amount ?? '',
    starts_at:           initial?.starts_at?.slice(0,16) ?? '',
    ends_at:             initial?.ends_at?.slice(0,16) ?? '',
    usage_limit:         initial?.usage_limit ?? '',
    per_user_limit:      initial?.per_user_limit ?? 1,
    is_active:           initial?.is_active ?? true
  });
  const on = (k: keyof typeof f, v: any) => setF(x => ({ ...x, [k]: v }));
  const [busy, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  return (
    <form onSubmit={e => { e.preventDefault(); start(async () => {
      setErr(null);
      const payload = {
        ...f,
        max_discount_amount: f.max_discount_amount === '' ? null : Number(f.max_discount_amount),
        usage_limit:         f.usage_limit === '' ? null : Number(f.usage_limit),
        starts_at:           f.starts_at || undefined,
        ends_at:             f.ends_at || null
      };
      const r = await saveCoupon(payload);
      if (!r.ok) return setErr(r.error);
      router.push('/admin/coupons');
    }); }}
      className="bg-white rounded-xl2 border border-line p-6 grid gap-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Code"><Input value={f.code} onChange={v => on('code', v.toUpperCase())} required /></Field>
        <Field label="Type">
          <select value={f.discount_type} onChange={e => on('discount_type', e.target.value)} className="w-full border border-line rounded-md px-3 py-2.5 text-sm">
            <option value="percent">Percentage off</option><option value="flat">Flat amount off</option>
          </select>
        </Field>
        <Field label={f.discount_type === 'percent' ? 'Discount %' : 'Flat discount (₹)'}>
          <Input type="number" min="1" value={String(f.discount_value)} onChange={v => on('discount_value', Number(v))} required />
        </Field>
        <Field label="Minimum order (₹)"><Input type="number" min="0" value={String(f.min_order_amount)} onChange={v => on('min_order_amount', Number(v))} /></Field>
        <Field label="Max discount cap (₹)"><Input type="number" min="0" value={String(f.max_discount_amount)} onChange={v => on('max_discount_amount', v)} /></Field>
        <Field label="Per-user usage limit"><Input type="number" min="1" value={String(f.per_user_limit)} onChange={v => on('per_user_limit', Number(v))} /></Field>
        <Field label="Total usage limit (blank = unlimited)"><Input type="number" min="1" value={String(f.usage_limit)} onChange={v => on('usage_limit', v)} /></Field>
        <Field label="Starts at"><Input type="datetime-local" value={f.starts_at} onChange={v => on('starts_at', v)} /></Field>
        <Field label="Ends at (blank = no end)"><Input type="datetime-local" value={f.ends_at} onChange={v => on('ends_at', v)} /></Field>
      </div>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={f.is_active} onChange={e => on('is_active', e.target.checked)} /> Active</label>
      {err && <div className="text-xs bg-red-50 text-red-700 border border-red-200 rounded-md px-3 py-2">{err}</div>}
      <div className="flex gap-2 pt-1">
        <button disabled={busy} className="bg-maroon text-white rounded-lg px-5 py-2.5 font-semibold disabled:opacity-60">{busy ? 'Saving…' : 'Save coupon'}</button>
        {initial && (
          <button type="button" disabled={busy} onClick={() => start(async () => {
            if (!confirm('Delete coupon?')) return;
            await deleteCoupon(initial.id); router.push('/admin/coupons');
          })} className="border border-red-200 text-red-700 rounded-lg px-4 py-2.5 text-sm">Delete</button>
        )}
      </div>
    </form>
  );
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="block text-[11px] font-bold tracking-widest uppercase text-muted mb-1.5">{label}</span>{children}</label>;
}
function Input(p: { value: string; onChange: (v: string) => void } & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'>) {
  const { value, onChange, ...rest } = p;
  return <input {...rest} value={value} onChange={e => onChange(e.target.value)} className="w-full border border-line rounded-md px-3 py-2.5 text-sm outline-none focus:border-maroon" />;
}
