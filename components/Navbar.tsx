import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import { cartCount } from '@/lib/queries/cart';
import { BrandMark } from './BrandMark';
import { NavSearch } from './NavSearch';

export async function Navbar() {
  const user = await getCurrentUser();
  const accountHref = user ? '/profile' : '/login';
  const bagQty = user ? await cartCount(user.id) : 0;

  return (
    <header className="bg-white border-b border-line sticky top-0 z-50">
      <div className="max-w-container mx-auto px-6 py-3.5 grid grid-cols-[auto_1fr_auto] gap-7 items-center">
        <BrandMark />

        <nav className="hidden lg:flex justify-center gap-6 text-[14.5px] font-medium">
          <Link href="/" className="hover:text-maroon">⌂ Home</Link>
          <Link href="/shop" className="hover:text-maroon">Categories ▾</Link>
          <Link href="/shop?new=1" className="hover:text-maroon">New Arrivals ▾</Link>
          <Link href="/about-us" className="hover:text-maroon">About Us</Link>
          <Link href="/track-order" className="hover:text-maroon">Track Order</Link>
          <Link href="/help" className="hover:text-maroon">Help &amp; Support</Link>
        </nav>

        <div className="flex items-center gap-2.5">
          <NavSearch />
          <IconBtn label={user ? 'Your account' : 'Sign in'} href={accountHref} initial={user?.full_name?.[0]}><UserIcon /></IconBtn>
          <IconBtn label="Wishlist" href={user ? '/wishlist' : '/login?next=/wishlist'}><HeartIcon /></IconBtn>
          <IconBtn label="Cart" href="/cart" badge={bagQty || undefined}><BagIcon /></IconBtn>
        </div>
      </div>
    </header>
  );
}

function IconBtn({ children, label, href, initial, badge }:
  { children: React.ReactNode; label: string; href: string; initial?: string; badge?: number }) {
  return (
    <Link href={href} aria-label={label} title={label}
      className="w-9 h-9 rounded-full grid place-items-center text-maroon-ink hover:bg-ground relative">
      {initial ? (
        <span className="w-8 h-8 rounded-full bg-maroon text-white grid place-items-center font-bold text-sm">{initial.toUpperCase()}</span>
      ) : children}
      {badge != null && badge > 0 && (
        <span className="absolute -top-0.5 -right-0.5 bg-maroon text-white text-[10px] font-bold min-w-[18px] h-[18px] px-1 rounded-full grid place-items-center">
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </Link>
  );
}
const UserIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="12" cy="8" r="4" /><path d="M4 21c1.5-4 5-6 8-6s6.5 2 8 6" />
  </svg>
);
const HeartIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 21s-7-4.35-9.5-8.5C.7 8.7 3 5 6.5 5 8.7 5 10.5 6.2 12 8c1.5-1.8 3.3-3 5.5-3C21 5 23.3 8.7 21.5 12.5 19 16.65 12 21 12 21z" />
  </svg>
);
const BagIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M4 6h16l-1.5 10a2 2 0 0 1-2 1.7H7.5a2 2 0 0 1-2-1.7L4 6z" /><path d="M9 6V4a3 3 0 0 1 6 0v2" />
  </svg>
);
