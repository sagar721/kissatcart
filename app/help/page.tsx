import Link from 'next/link';
import { ContentPage } from '@/components/ContentPage';
export const metadata = { title: 'Help & Support' };
const tiles = [
  ['Track my order',    '/track-order', 'See where your parcel is in real time.'],
  ['Return an item',    '/return-policy', 'Free 15-day size exchanges &amp; returns.'],
  ['Size &amp; fit',    '/size-guide',   'Chart, measuring tips, fit notes per style.'],
  ['Shipping',          '/shipping-policy', 'Delivery windows &amp; charges.'],
  ['FAQs',              '/faq',           'The most-asked questions in one place.'],
  ['Contact us',        '/contact-us',    'Reach a human. We reply within a business day.']
];
export default function Page() {
  return (
    <ContentPage eyebrow="Help centre" title="How can we help?">
      <div className="grid gap-3 md:grid-cols-2 not-prose">
        {tiles.map(([t, href, desc]) => (
          <Link key={href} href={href} className="border border-line rounded-xl p-4 bg-ground/60 hover:border-maroon transition">
            <div className="font-serif text-lg">{t}</div>
            <p className="text-sm text-muted mt-1" dangerouslySetInnerHTML={{ __html: desc }} />
          </Link>
        ))}
      </div>
    </ContentPage>
  );
}
