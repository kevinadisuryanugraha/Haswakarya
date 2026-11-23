import type { MetadataRoute } from 'next';
import { PUBLIC_SITEMAP_PATHS, absoluteUrl } from '@/lib/seo/siteUrl';

/**
 * Sitemap hanya memuat rute publik yang boleh diindeks.
 * `lastModified` sengaja tidak diisi: nilai `new Date()` membuat keluaran build
 * berubah setiap deploy tanpa ada konten yang benar-benar berubah.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return PUBLIC_SITEMAP_PATHS.map((entry) => ({
    url: absoluteUrl(entry.path),
    changeFrequency: entry.changeFrequency,
    priority: entry.priority,
  }));
}