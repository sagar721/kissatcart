import { ContentPage } from '@/components/ContentPage';
export const metadata = { title: 'About us' };
export default function Page() {
  return (
    <ContentPage eyebrow="Our story" title="Premium menswear, made honestly in India">
      <p>KismatKart is built on a simple belief: a great outfit shouldn&rsquo;t cost a small fortune, and it shouldn&rsquo;t hide behind a marketing budget. We design in-house, cut in Bengaluru, sew in Tirupur, and ship from our own warehouse — no middlemen, no fluff.</p>
      <h2>What we make</h2>
      <p>Everyday menswear for people who want to look put-together without thinking about it. Oversized tees, straight-fit jeans, structured shirts, and hoodies you&rsquo;ll actually keep — cotton-heavy fabrics, real stitching, sizes S through XXL.</p>
      <h2>How we price</h2>
      <p>Our T-shirts are ₹649. Our jeans are ₹1,299. Not because we ran a sale — that&rsquo;s the cost of good fabric plus a fair margin. Any discount you see on the site is real; the MRP shown is what you&rsquo;d pay at a traditional retail markup.</p>
      <h2>Where to reach us</h2>
      <p>Support: hello@kismatkart.com · Wholesale: b2b@kismatkart.com · Careers: careers@kismatkart.com</p>
    </ContentPage>
  );
}
