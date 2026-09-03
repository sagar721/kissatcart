import Link from 'next/link';
import { requireAdmin } from '@/lib/auth';
import { SignOutButton } from '../profile/SignOutButton';

export const metadata = { title: 'Admin' };
export const dynamic  = 'force-dynamic';

const nav = [
  ['/admin',            'Dashboard'],
  ['/admin/products',   'Products'],
  ['/admin/categories', 'Categories'],
  ['/admin/orders',     'Orders'],
  ['/admin/customers',  'Customers'],
  ['/admin/inventory',  'Inventory'],
  ['/admin/reviews',    'Reviews'],
  ['/admin/coupons',    'Coupons']
] as const;

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();
  return (
    <div className="min-h-[70vh] bg-ground">
      <div className="max-w-container mx-auto px-6 py-8 grid gap-6 lg:grid-cols-[220px_1fr]">
        <aside className="bg-white rounded-xl2 border border-line p-4 h-max sticky top-24">
          <div className="text-[11px] tracking-[0.3em] uppercase text-maroon font-semibold px-2">KismatKart Admin</div>
          <div className="text-sm mt-1 px-2 break-all">{user.email}</div>
          <div className="text-[11px] uppercase tracking-widest text-muted px-2 mt-0.5">{user.role}</div>
          <nav className="mt-4 grid gap-0.5 text-sm">
            {nav.map(([href, label]) => (
              <Link key={href} href={href} className="px-3 py-2 rounded-md hover:bg-ground">{label}</Link>
            ))}
          </nav>
          <SignOutButton />
        </aside>
        <div>{children}</div>
      </div>
    </div>
  );
}
