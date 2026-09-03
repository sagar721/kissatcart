import { ContentPage } from '@/components/ContentPage';
export const metadata = { title: 'Returns & exchanges' };
export default function Page() {
  return (
    <ContentPage eyebrow="Returns" title="Returns &amp; exchanges">
      <h2>15-day easy returns</h2>
      <p>You can request a size exchange or return within 15 days of delivery. The item should be unworn, unwashed, and in its original condition with the tags intact.</p>
      <h2>How to request one</h2>
      <p>Open your order in <a href="/orders">My orders</a>, click <strong>Return / Exchange</strong>, and pick a slot. Our courier will pick it up in 2–3 business days.</p>
      <h2>Refunds</h2>
      <p>Refunds are issued to your original payment method within 5–7 business days of the returned parcel reaching our warehouse.</p>
      <h2>Not returnable</h2>
      <p>Innerwear, socks, and items marked <em>Final Sale</em> at purchase.</p>
    </ContentPage>
  );
}
