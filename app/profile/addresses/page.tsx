import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { supabaseServer } from '@/lib/supabase/server';
import { AddressList } from './AddressList';
import { SignOutButton } from '../SignOutButton';

export const metadata = { title: 'Saved addresses' };

export default async function AddressesPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login?next=/profile/addresses');
  const sb = supabaseServer();
  const { data: addrs } = await sb.from('addresses').select('*')
    .eq('user_id', user.id).order('is_default', { ascending: false }).order('updated_at', { ascending: false });

  return (
    <section className="max-w-container mx-auto px-6 py-10">
      <div className="grid gap-6 md:grid-cols-[220px_1fr]">
        <aside className="bg-white rounded-xl2 border border-line p-5 h-max">
          <div className="font-serif text-lg">{user.full_name || 'Welcome'}</div>
          <div className="text-xs text-muted mt-0.5 break-all">{user.email}</div>
          <nav className="mt-5 grid gap-1 text-sm">
            <Link href="/profile" className="px-3 py-2 rounded-md hover:bg-ground">Profile</Link>
            <Link href="/profile/addresses" className="px-3 py-2 rounded-md bg-maroon text-white font-semibold">Addresses</Link>
            <Link href="/orders" className="px-3 py-2 rounded-md hover:bg-ground">Orders</Link>
            <Link href="/wishlist" className="px-3 py-2 rounded-md hover:bg-ground">Wishlist</Link>
          </nav>
          <SignOutButton />
        </aside>

        <div>
          <div className="flex items-baseline justify-between mb-4">
            <h1 className="font-serif text-2xl">Saved addresses</h1>
            <span className="text-xs text-muted">{addrs?.length ?? 0} saved</span>
          </div>
          <AddressList addresses={addrs ?? []} />
        </div>
      </div>
    </section>
  );
}
