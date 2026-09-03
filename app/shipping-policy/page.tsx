import { ContentPage } from '@/components/ContentPage';
export const metadata = { title: 'Shipping policy' };
export default function Page() {
  return (
    <ContentPage eyebrow="Shipping" title="Shipping policy">
      <h2>Free shipping</h2>
      <p>All orders above ₹599 ship free anywhere in India. Below ₹599, shipping is a flat ₹79.</p>
      <h2>Delivery time</h2>
      <p>Metro cities: 2–4 business days. Rest of India: 4–7 business days. Orders placed before 2 PM are usually dispatched the same day.</p>
      <h2>Tracking</h2>
      <p>You&rsquo;ll receive a tracking link by email as soon as your parcel is picked up. You can also track your order any time from <a href="/track-order">Track order</a>.</p>
      <h2>Undeliverable / RTO</h2>
      <p>If a parcel is returned to origin because it couldn&rsquo;t be delivered after three attempts, we&rsquo;ll email you to arrange re-delivery. Repeated non-delivery may attract a ₹100 re-shipping charge.</p>
    </ContentPage>
  );
}
