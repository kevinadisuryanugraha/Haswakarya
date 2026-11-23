/**
 * ═══════════════════════════════════════════════════════════════════════════
 * Haswakarya Crewing OS — Content Security Policy ber-nonce
 * Modul murni (tanpa Next) agar kebijakan dapat diuji unit dan dipakai ulang
 * oleh middleware maupun probe operasional.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/** Nonce acak 128-bit dalam bentuk heksadesimal (aman untuk atribut HTML). */
export function createNonce(): string {
  return crypto.randomUUID().replace(/-/g, '');
}

/**
 * Kebijakan CSP, sadar-rute.
 *
 * Halaman BERSESI (portal, dossier vetting) dirender dinamis sehingga Next.js
 * menyuntikkan nonce ke setiap `<script>`; di sana `strict-dynamic` dipakai
 * penuh — browser mengabaikan `'self'` dan hanya memercayai script ber-nonce
 * beserta chunk yang dimuatnya.
 *
 * Halaman publik statis (landing, 404) di-prerender saat build: HTML-nya tidak
 * pernah ditulis ulang per request, jadi tidak mungkin berisi nonce. Untuk rute
 * itu `script-src` memakai `'self' 'unsafe-inline'` — batasan yang sama dengan
 * aplikasi Next.js standar — sementara direktif lain tetap ketat.
 *
 * `style-src` selalu butuh `'unsafe-inline'` karena Tailwind dan `next/font`
 * menyuntikkan `<style>` inline. Blok data `application/ld+json` bukan script
 * eksekutabel sehingga tidak terpengaruh `script-src`.
 */
export function buildContentSecurityPolicy(
  nonce: string,
  isDev: boolean,
  options: { strictScripts?: boolean } = {}
): string {
  const strictScripts = options.strictScripts ?? true;
  const scriptSrc = strictScripts
    ? `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ''}`
    : `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`;

  const directives = [
    "default-src 'self'",
    scriptSrc,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    `connect-src 'self'${isDev ? ' ws: wss:' : ''}`,
    "worker-src 'self' blob:",
    "manifest-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ];

  if (!isDev) directives.push('upgrade-insecure-requests');

  return directives.join('; ');
}

/** Rute yang HTML-nya baru ditulis saat request (boleh memakai nonce ketat). */
export function requiresStrictScripts(pathname: string): boolean {
  return (
    pathname === '/portal' ||
    pathname.startsWith('/portal/') ||
    pathname.startsWith('/share/')
  );
}

/** Apakah kebijakan memuat direktif tertentu (dipakai test & health probe). */
export function cspHasDirective(policy: string, directive: string): boolean {
  return policy.split(';').some((part) => part.trim().startsWith(directive));
}