import type { MetadataRoute } from 'next';
import { appUrl } from '@/lib/format';

export default function robots(): MetadataRoute.Robots {
  const base = appUrl();
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/admin', '/api', '/checkout', '/profile', '/orders', '/cart', '/wishlist', '/auth'] }
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base
  };
}
