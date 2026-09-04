import type { MetadataRoute } from 'next';
import { supabaseServer } from '@/lib/supabase/server';
import { appUrl } from '@/lib/format';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = appUrl();
  const sb = supabaseServer();
  const [{ data: cats }, { data: products }] = await Promise.all([
    sb.from('categories').select('slug,updated_at').eq('is_active', true),
    sb.from('products').select('slug,updated_at').eq('is_active', true)
  ]);
  const staticUrls = [
    '/', '/shop', '/about-us', '/contact-us', '/help', '/faq',
    '/size-guide', '/shipping-policy', '/return-policy', '/privacy-policy', '/terms', '/track-order'
  ];
  return [
    ...staticUrls.map(p => ({ url: `${base}${p}`, changeFrequency: 'weekly' as const, priority: p === '/' ? 1 : 0.7 })),
    ...(cats ?? []).map((c: any) => ({ url: `${base}/category/${c.slug}`, lastModified: c.updated_at, priority: 0.8 })),
    ...(products ?? []).map((p: any) => ({ url: `${base}/product/${p.slug}`, lastModified: p.updated_at, priority: 0.6 }))
  ];
}
