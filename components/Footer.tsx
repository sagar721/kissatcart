import Link from 'next/link';
import { BrandMark } from './BrandMark';

const shop = [
  ['Shirts', '/category/shirts'], ['T-Shirts', '/category/t-shirts'],
  ['Jeans', '/category/jeans'],   ['Hoodies', '/category/hoodies'],
  ['Cargo Pants', '/category/cargo-pants'], ['Formal Shirts', '/category/formal-shirts']
] as const;
const service = [
  ['Track Order', '/track-order'], ['Returns & Exchanges', '/return-policy'],
  ['Shipping Policy', '/shipping-policy'], ['Terms & Conditions', '/terms'],
  ['Privacy Policy', '/privacy-policy'], ['Help & Support', '/help']
] as const;
const company = [
  ['About Us', '/about-us'], ['Contact Us', '/contact-us'],
  ['Size Guide', '/size-guide'], ['FAQs', '/faq'], ['Careers', '/careers']
] as const;

export function Footer() {
  return (
    <footer className="bg-maroon-deep text-[#EFE4DE]">
      <div className="max-w-container mx-auto px-6 pt-14 pb-6 grid gap-9 grid-cols-1 md:grid-cols-3 lg:grid-cols-[1.2fr_1fr_1fr_1fr_1.4fr]">
        <div>
          <BrandMark onDark />
          <p className="my-4 text-[13px] leading-relaxed max-w-[280px] text-[#E9D8D1]">
            Premium menswear for the modern gentleman. Style that speaks for you.
          </p>
          <div className="flex gap-2.5">
            {['instagram','facebook','twitter','youtube'].map(s => (
              <a key={s} href="#" aria-label={s}
                className="w-8.5 h-8.5 w-[34px] h-[34px] rounded-full grid place-items-center bg-white/10 hover:bg-white hover:text-maroon-deep transition">
                <SocialIcon name={s} />
              </a>
            ))}
          </div>
        </div>
        <FootCol title="Shop"             items={shop} />
        <FootCol title="Customer Service" items={service} />
        <FootCol title="Company"          items={company} />
        <div>
          <h5 className="font-bold text-[12.5px] tracking-[0.24em] uppercase text-white mb-3.5">Newsletter</h5>
          <p className="text-[13px] leading-normal opacity-90 mb-3.5">
            Subscribe to receive updates on new arrivals, offers &amp; exclusive deals.
          </p>
          <form className="flex gap-2">
            <input placeholder="Enter your email"
              className="bg-white/10 border border-white/20 text-white placeholder:text-white/60 rounded-lg px-3.5 py-3 w-full text-sm" />
            <button type="submit" aria-label="Subscribe"
              className="bg-white text-maroon-deep font-bold px-4 rounded-lg">↓</button>
          </form>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="max-w-container mx-auto px-6 py-4 flex flex-wrap justify-between items-center gap-4 text-[12.5px] text-[#E9D8D1]">
          <div>© {new Date().getFullYear()} KismatKart. All Rights Reserved. Made with ♥ in India.</div>
          <div className="flex items-center gap-2.5">
            <span className="opacity-85 mr-1.5">Secure Payments</span>
            <PayChip label="VISA" />
            <PayChip label="MC"   bg="#EB001B" fg="#fff" />
            <PayChip label="GPay" />
            <PayChip label="Paytm" bg="#012E5B" fg="#fff" />
            <PayChip label="UPI" />
          </div>
        </div>
      </div>
    </footer>
  );
}

function FootCol({ title, items }: { title: string; items: readonly (readonly [string, string])[] }) {
  return (
    <div>
      <h5 className="font-bold text-[12.5px] tracking-[0.24em] uppercase text-white mb-3.5">{title}</h5>
      <ul className="grid gap-2 text-[13.5px] text-[#E9D8D1]">
        {items.map(([label, href]) => (
          <li key={href}><Link href={href} className="hover:text-white hover:underline underline-offset-2">{label}</Link></li>
        ))}
      </ul>
    </div>
  );
}
function PayChip({ label, bg = '#fff', fg = '#1A1A1A' }: { label: string; bg?: string; fg?: string }) {
  return (
    <span style={{ background: bg, color: fg }} className="px-2 py-1 rounded-md text-[10.5px] font-extrabold tracking-wider">
      {label}
    </span>
  );
}
function SocialIcon({ name }: { name: string }) {
  const common = { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'currentColor' } as const;
  switch (name) {
    case 'instagram': return (<svg {...common} fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>);
    case 'facebook':  return (<svg {...common}><path d="M13 22v-8h3l1-4h-4V7.5c0-1.1.4-2 2-2h2V2h-3c-3 0-5 1.8-5 5v3H6v4h3v8h4z"/></svg>);
    case 'twitter':   return (<svg {...common}><path d="M4 4l7.5 10L4.5 20h2.2l6-6 4.5 6H22l-7.9-10.5L21.4 4h-2.2L14 9.2 10.1 4H4z"/></svg>);
    case 'youtube':   return (<svg {...common}><path d="M23 7.5s-.2-1.5-.9-2.2c-.8-.9-1.7-.9-2.1-1C17 4 12 4 12 4s-5 0-8 .3c-.4.1-1.3.1-2.1 1C1.2 6 1 7.5 1 7.5S.8 9.4.8 11.3v1.4C.8 14.6 1 16.5 1 16.5s.2 1.5.9 2.2c.8.9 1.9.9 2.4 1C6 20 12 20 12 20s5 0 8-.3c.4-.1 1.3-.1 2.1-1 .7-.7.9-2.2.9-2.2s.2-1.9.2-3.8v-1.4c0-1.9-.2-3.8-.2-3.8zM9.8 15.2V8.5l6.2 3.3-6.2 3.4z"/></svg>);
    default:          return null;
  }
}
