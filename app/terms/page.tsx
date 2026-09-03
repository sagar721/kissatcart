import { ContentPage } from '@/components/ContentPage';
export const metadata = { title: 'Terms & conditions' };
export default function Page() {
  return (
    <ContentPage eyebrow="Legal" title="Terms &amp; conditions">
      <p>By using kismatkart.com you agree to these terms. If you don&rsquo;t agree, please do not use the site.</p>
      <h2>Accounts</h2>
      <p>Keep your login credentials safe. You are responsible for activity on your account.</p>
      <h2>Orders</h2>
      <p>Prices are in INR and inclusive of GST. We reserve the right to cancel an order if a product is mispriced, out of stock, or if fraud is suspected — in which case any charged amount is refunded in full.</p>
      <h2>Intellectual property</h2>
      <p>The KismatKart name, logo, product photography and site content are our property. You may not reproduce them without written permission.</p>
      <h2>Governing law</h2>
      <p>These terms are governed by the laws of India. Disputes fall under the exclusive jurisdiction of the courts of Bengaluru, Karnataka.</p>
    </ContentPage>
  );
}
