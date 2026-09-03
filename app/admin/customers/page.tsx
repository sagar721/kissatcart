import { supabaseAdmin } from '@/lib/supabase/server';

export const metadata = { title: 'Customers' };

export default async function AdminCustomersPage({ searchParams }: { searchParams: { q?: string } }) {
  const sb = supabaseAdmin();
  let q = sb.from('profiles').select('id,email,full_name,phone,role,created_at').order('created_at', { ascending: false }).limit(100);
  if (searchParams.q) q = q.ilike('email', `%${searchParams.q}%`);
  const { data } = await q;
  return (
    <>
      <h1 className="font-serif text-3xl mb-5">Customers</h1>
      <form action="/admin/customers" method="get" className="flex gap-2 mb-4">
        <input name="q" defaultValue={searchParams.q} placeholder="Search by email…"
          className="flex-1 bg-white border border-line rounded-lg px-3 py-2.5 text-sm" />
        <button className="bg-maroon text-white rounded-lg px-4 py-2.5 text-sm font-semibold">Search</button>
      </form>
      <div className="bg-white rounded-xl2 border border-line overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-ground">
            <tr className="text-left text-[11px] uppercase tracking-widest text-muted">
              <th className="px-3 py-2">Email</th><th className="px-3 py-2">Name</th><th className="px-3 py-2">Phone</th>
              <th className="px-3 py-2">Role</th><th className="px-3 py-2">Joined</th>
            </tr>
          </thead>
          <tbody>
            {(data ?? []).map((u: any) => (
              <tr key={u.id} className="border-t border-line">
                <td className="px-3 py-2 break-all">{u.email}</td>
                <td className="px-3 py-2">{u.full_name || '—'}</td>
                <td className="px-3 py-2 text-xs text-muted">{u.phone ? `+91 ${u.phone}` : '—'}</td>
                <td className="px-3 py-2 text-xs">{u.role}</td>
                <td className="px-3 py-2 text-xs text-muted">{new Date(u.created_at).toLocaleDateString('en-IN')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
