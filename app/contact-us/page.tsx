import { ContentPage } from '@/components/ContentPage';
export const metadata = { title: 'Contact us' };
export default function Page() {
  return (
    <ContentPage eyebrow="Talk to us" title="How can we help?">
      <p>Our support team replies to every email within one business day.</p>
      <h2>Order questions</h2>
      <p><strong>hello@kismatkart.com</strong> — cancellations, size issues, delivery updates. Please include your order number (<code>KK-YYYY-NNNNNN</code>).</p>
      <h2>Returns &amp; exchanges</h2>
      <p><strong>returns@kismatkart.com</strong> — see our <a href="/return-policy">return policy</a> before writing.</p>
      <h2>Wholesale &amp; press</h2>
      <p><strong>b2b@kismatkart.com</strong> · <strong>press@kismatkart.com</strong></p>
      <h2>Address</h2>
      <p>KismatKart Retail Pvt Ltd, 4th Floor, HSR Layout, Bengaluru 560102, Karnataka, India · GSTIN available on request.</p>
    </ContentPage>
  );
}
