'use client';
import { useState, useTransition } from 'react';
import { saveAddress, deleteAddress, setDefaultAddress } from './actions';

type Address = {
  id: string; full_name: string; phone: string; line1: string; line2: string | null;
  landmark: string | null; city: string; state: string; pincode: string;
  type: 'shipping' | 'billing'; is_default: boolean;
};

export function AddressList({ addresses }: { addresses: Address[] }) {
  const [editing, setEditing] = useState<Address | 'new' | null>(null);

  return (
    <div className="grid gap-4">
      {addresses.length === 0 && editing !== 'new' && (
        <div className="bg-white border border-line rounded-xl2 p-8 text-center">
          <p className="text-muted mb-4">You haven&rsquo;t saved any addresses yet.</p>
          <button onClick={() => setEditing('new')}
            className="bg-maroon text-white rounded-lg px-5 py-2.5 font-semibold">Add address</button>
        </div>
      )}

      {addresses.map(a => editing === a ? (
        <AddressEditor key={a.id} initial={a} onDone={() => setEditing(null)} />
      ) : (
        <AddressCard key={a.id} a={a} onEdit={() => setEditing(a)} />
      ))}

      {editing === 'new' && <AddressEditor onDone={() => setEditing(null)} />}
      {editing !== 'new' && addresses.length > 0 && (
        <button onClick={() => setEditing('new')}
          className="border-2 border-dashed border-line rounded-xl2 py-6 text-muted hover:border-maroon hover:text-maroon transition font-semibold">
          + Add another address
        </button>
      )}
    </div>
  );
}

function AddressCard({ a, onEdit }: { a: Address; onEdit: () => void }) {
  const [busy, start] = useTransition();
  return (
    <div className="bg-white border border-line rounded-xl2 p-5">
      <div className="flex justify-between items-start gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold">{a.full_name}</span>
            {a.is_default && <span className="bg-maroon/10 text-maroon text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-widest">Default</span>}
            <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-widest bg-ground text-muted">{a.type}</span>
          </div>
          <div className="text-sm mt-1.5 text-ink/85">
            {a.line1}{a.line2 && `, ${a.line2}`}<br/>
            {a.landmark && <>Landmark: {a.landmark}<br/></>}
            {a.city}, {a.state} — {a.pincode}<br/>
            <span className="text-muted">+91 {a.phone}</span>
          </div>
        </div>
        <div className="flex flex-col gap-1.5 text-xs">
          <button onClick={onEdit} className="text-maroon underline">Edit</button>
          {!a.is_default && (
            <button disabled={busy} onClick={() => start(async () => { await setDefaultAddress(a.id); })}
              className="text-muted underline">Set default</button>
          )}
          <button disabled={busy} onClick={() => start(async () => {
            if (confirm('Delete this address?')) await deleteAddress(a.id);
          })} className="text-red-600 underline">Delete</button>
        </div>
      </div>
    </div>
  );
}

function AddressEditor({ initial, onDone }: { initial?: Address; onDone: () => void }) {
  const [f, setF] = useState({
    full_name: initial?.full_name ?? '',
    phone:     initial?.phone ?? '',
    line1:     initial?.line1 ?? '',
    line2:     initial?.line2 ?? '',
    landmark:  initial?.landmark ?? '',
    city:      initial?.city ?? '',
    state:     initial?.state ?? '',
    pincode:   initial?.pincode ?? '',
    type:      initial?.type ?? 'shipping',
    is_default: initial?.is_default ?? false
  });
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const on = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF(x => ({ ...x, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setErr(null);
    const res = await saveAddress({ ...f, id: initial?.id });
    setBusy(false);
    if (!res.ok) return setErr(res.error);
    onDone();
  }

  return (
    <form onSubmit={submit} className="bg-white border border-line rounded-xl2 p-5 grid gap-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="Full name"><Input value={f.full_name} onChange={v => on('full_name', v)} required /></Field>
        <Field label="Mobile (10 digits)"><Input value={f.phone} onChange={v => on('phone', v.replace(/\D/g,'').slice(0,10))} pattern="[6-9][0-9]{9}" required /></Field>
        <Field label="Address line 1" full><Input value={f.line1} onChange={v => on('line1', v)} required /></Field>
        <Field label="Apartment / Flat"><Input value={f.line2 ?? ''} onChange={v => on('line2', v)} /></Field>
        <Field label="Landmark"><Input value={f.landmark ?? ''} onChange={v => on('landmark', v)} /></Field>
        <Field label="City"><Input value={f.city} onChange={v => on('city', v)} required /></Field>
        <Field label="State"><Input value={f.state} onChange={v => on('state', v)} required /></Field>
        <Field label="PIN code"><Input value={f.pincode} onChange={v => on('pincode', v.replace(/\D/g,'').slice(0,6))} pattern="[1-9][0-9]{5}" required /></Field>
        <Field label="Type">
          <select value={f.type} onChange={e => on('type', e.target.value as 'shipping' | 'billing')}
            className="w-full border border-line rounded-md px-3 py-2.5 text-sm">
            <option value="shipping">Shipping</option>
            <option value="billing">Billing</option>
          </select>
        </Field>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={f.is_default} onChange={e => on('is_default', e.target.checked)} />
        Set as default {f.type} address
      </label>
      {err && <div className="text-xs rounded-md px-3 py-2 bg-red-50 text-red-700 border border-red-200">{err}</div>}
      <div className="flex gap-2 pt-1">
        <button type="submit" disabled={busy} className="bg-maroon text-white rounded-lg px-5 py-2.5 font-semibold disabled:opacity-60">
          {busy ? 'Saving…' : (initial ? 'Save changes' : 'Add address')}
        </button>
        <button type="button" onClick={onDone} className="border border-line rounded-lg px-4 py-2.5 text-sm">Cancel</button>
      </div>
    </form>
  );
}

function Field({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <label className={`block ${full ? 'sm:col-span-2' : ''}`}>
      <span className="block text-[11px] font-bold tracking-widest uppercase text-muted mb-1.5">{label}</span>
      {children}
    </label>
  );
}
function Input(p: { value: string; onChange: (v: string) => void } & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'>) {
  const { value, onChange, ...rest } = p;
  return (
    <input {...rest} value={value} onChange={e => onChange(e.target.value)}
      className="w-full border border-line rounded-md px-3 py-2.5 text-sm outline-none focus:border-maroon" />
  );
}
