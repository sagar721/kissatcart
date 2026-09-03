import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { supabaseServer } from '@/lib/supabase/server';
import { loadCartForUser } from '@/lib/queries/cart';
import { CheckoutClient } from './CheckoutClient';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Checkout' };

export default async function CheckoutPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login?next=/checkout');

  const { items } = await loadCartForUser(user.id);
  if (items.length === 0) redirect('/cart');

  const sb = supabaseServer();
  const { data: addrs } = await sb.from('addresses').select('*')
    .eq('user_id', user.id).order('is_default', { ascending: false }).order('updated_at', { ascending: false });

  return (
    <section className="max-w-container mx-auto px-6 py-10">
      <div className="mb-6">
        <h1 className="font-serif text-3xl">Checkout</h1>
        <nav className="text-xs text-muted mt-1"><Link href="/cart">Cart</Link> / Checkout</nav>
      </div>
      <CheckoutClient
        items={items}
        addresses={addrs ?? []}
        userEmail={user.email}
        userName={user.full_name}
        userPhone={user.phone}
      />
    </section>
  );
}
