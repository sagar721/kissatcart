import Link from 'next/link';
import { BrandMark } from './BrandMark';
import { NavSearch } from './NavSearch';
import { NavAccount } from './NavAccount';

export function Navbar() {
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
          <NavAccount />
        </div>
      </div>
    </header>
  );
}
