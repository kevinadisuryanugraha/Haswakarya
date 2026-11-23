import type { MetadataRoute } from 'next';
import { CRAWLER_DISALLOW_PATHS, absoluteUrl } from '@/lib/seo/siteUrl';

/**
 * Portal, API, dan tautan vetting bertoken tidak boleh masuk indeks mesin pencari.
 * Sitemap ditunjuk secara absolut supaya crawler tidak menebak lokasinya.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [...CRAWLER_DISALLOW_PATHS],
      },
    ],
    sitemap: absoluteUrl('/sitemap.xml'),
    host: absoluteUrl('/'),
  };
}