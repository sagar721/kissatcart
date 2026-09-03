import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { loadCartForUser } from '@/lib/queries/cart';
import { CartClient } from './CartClient';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Your cart' };

export default async function CartPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login?next=/cart');
  const { items } = await loadCartForUser(user.id);

  return (
    <section className="max-w-container mx-auto px-6 py-10">
      <h1 className="font-serif text-3xl mb-6">Your cart</h1>
      {items.length === 0 ? (
        <div className="bg-white border border-line rounded-xl2 p-12 text-center">
          <p className="font-serif text-2xl">Your cart is empty</p>
          <p className="text-muted text-sm mt-2 mb-5">Discover our latest drop and add something you love.</p>
          <Link href="/shop" className="inline-block bg-maroon text-white rounded-lg px-5 py-3 font-semibold">Continue shopping</Link>
        </div>
      ) : (
        <CartClient initialItems={items} />
      )}
    </section>
  );
}
