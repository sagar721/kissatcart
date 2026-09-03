import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { loadWishlistForUser } from '@/lib/queries/cart';
import { ProductCard } from '@/components/ProductCard';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Your wishlist' };

export default async function WishlistPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login?next=/wishlist');
  const { items } = await loadWishlistForUser(user.id);

  return (
    <section className="max-w-container mx-auto px-6 py-10">
      <h1 className="font-serif text-3xl mb-6">Your wishlist</h1>
      {items.length === 0 ? (
        <div className="bg-white border border-line rounded-xl2 p-12 text-center">
          <p className="font-serif text-2xl">No favourites yet</p>
          <p className="text-muted text-sm mt-2 mb-5">Tap the heart on any product to save it here.</p>
          <Link href="/shop" className="inline-block bg-maroon text-white rounded-lg px-5 py-3 font-semibold">Browse the shop</Link>
        </div>
      ) : (
        <div className="grid gap-5 grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
          {items.map((p: any) => <ProductCard key={p.id} p={p as any} />)}
        </div>
      )}
    </section>
  );
}
