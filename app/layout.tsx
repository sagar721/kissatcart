import type { Metadata } from 'next';
import './globals.css';
import { PromoBar } from '@/components/PromoBar';
import { Navbar }   from '@/components/Navbar';
import { Footer }   from '@/components/Footer';
import { ScrollTopFab } from '@/components/ScrollTopFab';

export const metadata: Metadata = {
  title: { default: 'KismatKart — Wear Your Confidence', template: '%s · KismatKart' },
  description: 'Premium menswear — shirts, tees, jeans, hoodies, cargos and more.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'),
  openGraph: {
    title: 'KismatKart',
    description: 'Premium menswear for the modern gentleman.',
    siteName: 'KismatKart',
    type: 'website'
  },
  icons: { icon: '/favicon.ico' }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700&family=Inter:wght@400;500;600;700&family=Dancing+Script:wght@700&display=swap" />
      </head>
      <body>
        <PromoBar />
        <Navbar />
        <main>{children}</main>
        <Footer />
        <ScrollTopFab />
      </body>
    </html>
  );
}
