/**
 * Resolusi href untuk menu berbasis anchor.
 *
 * Seluruh navigasi beranda memakai href hash (`#about`, `#services`, ...).
 * Anchor seperti itu hanya valid di beranda (`/`). Begitu ada rute publik
 * kedua, `#about` dari rute tersebut akan mencari elemen di halaman yang
 * salah dan berakhir sebagai 404. Helper ini mengubahnya menjadi `/#about`
 * saat dipakai di luar beranda.
 */
export function resolveNavHref(href: string, pathname: string | null | undefined): string {
  if (!href) return href;
  if (!href.startsWith('#')) return href;
  if (!pathname || pathname === '/') return href;
  return `/${href}`;
}