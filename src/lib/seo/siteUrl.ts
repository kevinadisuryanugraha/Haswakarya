/**
 * ═══════════════════════════════════════════════════════════════════════════
 * Haswakarya — Satu sumber URL situs
 *
 * Sebelumnya `metadataBase`, canonical halaman, dan sitemap menulis
 * `https://haswakarya.com` sendiri-sendiri. Ketika domain itu belum aktif,
 * tiga tempat harus diubah. Modul ini menjadikannya satu keputusan.
 *
 * Aturan:
 * 1. `NEXT_PUBLIC_APP_URL` boleh menimpa origin, tetapi hanya bila berupa URL
 *    http(s) yang sah — nilai kosong di `.env.production.local` adalah kasus
 *    nyata yang dulu membuat `new URL('')` melempar saat build.
 * 2. Di produksi, nilai `localhost` diabaikan supaya canonical tidak pernah
 *    menunjuk mesin developer.
 * 3. Selain itu selalu jatuh ke origin kanonik.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const CANONICAL_ORIGIN = 'https://haswakarya.com';

function isHttpUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

function isLocalhost(value: string): boolean {
  try {
    const { hostname } = new URL(value);
    return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]';
  } catch {
    return false;
  }
}

/** Origin situs tanpa trailing slash. Tidak pernah melempar error. */
export function resolveSiteUrl(env: NodeJS.ProcessEnv = process.env): string {
  const configured = env.NEXT_PUBLIC_APP_URL?.trim();
  if (!configured || !isHttpUrl(configured)) return CANONICAL_ORIGIN;

  if (env.NODE_ENV === 'production' && isLocalhost(configured)) return CANONICAL_ORIGIN;

  return configured.replace(/\/+$/, '');
}

/** URL absolut untuk sebuah path. `path` boleh dengan atau tanpa garis miring depan. */
export function absoluteUrl(path: string, env: NodeJS.ProcessEnv = process.env): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${resolveSiteUrl(env)}${normalized === '/' ? '' : normalized}`;
}

/** Kebijakan indeks untuk crawler. Portal, API, dan tautan bertoken tidak boleh diindeks. */
export const CRAWLER_DISALLOW_PATHS = ['/portal', '/api', '/share'] as const;

/** Rute publik yang layak masuk sitemap — urut prioritas bisnis. */
export const PUBLIC_SITEMAP_PATHS = [
  { path: '/', priority: 1, changeFrequency: 'weekly' as const },
  { path: '/join-as-crew', priority: 0.9, changeFrequency: 'weekly' as const },
  { path: '/recruit-crew', priority: 0.9, changeFrequency: 'weekly' as const },
];