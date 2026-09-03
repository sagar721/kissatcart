import { ContentPage } from '@/components/ContentPage';
export const metadata = { title: 'FAQs' };
const faqs = [
  ['How long does delivery take?', 'Metro cities: 2–4 business days. Rest of India: 4–7 business days. You&rsquo;ll get a tracking link by email as soon as your order ships.'],
  ['Do you deliver to my PIN code?', 'We deliver to every serviceable PIN in India. If your PIN is not serviceable at checkout, we&rsquo;ll offer a nearby pickup point.'],
  ['What if the fit is off?', 'Free size exchange within 15 days of delivery. Start it from your order page or email returns@kismatkart.com.'],
  ['Are your discounts real?', 'Yes — the MRP shown is the real MRP the item would carry through a traditional retailer. Our price is what we charge, always.'],
  ['Can I pay on delivery?', 'COD is coming soon. For now we accept UPI, cards, netbanking, and wallets via Razorpay.'],
  ['How do I use a coupon?', 'Enter it in the coupon field in your cart or on the checkout page. Each coupon lists its own minimum order and validity.']
];
export default function Page() {
  return (
    <ContentPage eyebrow="Answers" title="Frequently asked questions">
      <div className="grid gap-3 not-prose">
        {faqs.map(([q, a]) => (
          <details key={q} className="border border-line rounded-xl p-4 bg-ground/60">
            <summary className="font-semibold cursor-pointer">{q}</summary>
            <p className="text-sm text-ink/85 mt-2" dangerouslySetInnerHTML={{ __html: a }} />
          </details>
        ))}
      </div>
    </ContentPage>
  );
}
