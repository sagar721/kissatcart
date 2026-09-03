import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { ProfileForm } from './ProfileForm';
import { SignOutButton } from './SignOutButton';

export const metadata = { title: 'Your profile' };

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login?next=/profile');

  return (
    <section className="max-w-container mx-auto px-6 py-10">
      <div className="grid gap-6 md:grid-cols-[220px_1fr]">
        <aside className="bg-white rounded-xl2 border border-line p-5 h-max">
          <div className="font-serif text-lg">{user.full_name || 'Welcome'}</div>
          <div className="text-xs text-muted mt-0.5 break-all">{user.email}</div>
          <nav className="mt-5 grid gap-1 text-sm">
            <NavLink href="/profile"          active>Profile</NavLink>
            <NavLink href="/profile/addresses">Addresses</NavLink>
            <NavLink href="/orders">Orders</NavLink>
            <NavLink href="/wishlist">Wishlist</NavLink>
          </nav>
          <SignOutButton />
        </aside>

        <div className="bg-white rounded-xl2 border border-line p-6">
          <h1 className="font-serif text-2xl mb-4">Profile details</h1>
          <ProfileForm user={user} />
        </div>
      </div>
    </section>
  );
}

function NavLink({ href, active, children }: { href: string; active?: boolean; children: React.ReactNode }) {
  return (
    <Link href={href}
      className={`px-3 py-2 rounded-md ${active ? 'bg-maroon text-white font-semibold' : 'hover:bg-ground'}`}>
      {children}
    </Link>
  );
}
