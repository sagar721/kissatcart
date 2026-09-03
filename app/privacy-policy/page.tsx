import { ContentPage } from '@/components/ContentPage';
export const metadata = { title: 'Privacy policy' };
export default function Page() {
  return (
    <ContentPage eyebrow="Privacy" title="Privacy policy">
      <p>Effective date: {new Date().getFullYear()}-01-01. This policy explains what personal information KismatKart Retail Pvt Ltd (&ldquo;we&rdquo;) collects when you use kismatkart.com, and how we use it.</p>
      <h2>What we collect</h2>
      <p>Name, email, phone, saved addresses, and orders. Payment details are handled by Razorpay and never touch our servers.</p>
      <h2>How we use it</h2>
      <p>To process and deliver your orders, keep your account secure, notify you about your order status, and — only if you opt in — send you occasional marketing emails.</p>
      <h2>Who we share it with</h2>
      <p>Only the third parties needed to run the service: Razorpay (payments), our delivery partners, and email providers. We do not sell your data.</p>
      <h2>Your rights</h2>
      <p>You can update your profile any time from <a href="/profile">Your profile</a>. To delete your account permanently, email <a href="mailto:privacy@kismatkart.com">privacy@kismatkart.com</a>.</p>
      <h2>Cookies</h2>
      <p>We use essential cookies to keep you signed in and remember your cart. We do not use third-party ad-tracking cookies.</p>
    </ContentPage>
  );
}
