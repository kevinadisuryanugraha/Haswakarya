import { PWAInstaller, MobileActionDock, FloatingBackToTop } from '@/components/layout';

/**
 * Layout situs publik (beranda).
 *
 * Widget pemasaran (dock aksi mobile, tombol back-to-top, registrasi service
 * worker) hanya relevan di halaman publik. Sebelumnya ketiganya dipasang di
 * `app/layout.tsx` sehingga JavaScript-nya ikut terkirim ke seluruh halaman
 * portal — termasuk dua modal formulir besar yang tidak pernah dirender di
 * sana. Sekarang beban itu hanya ada di rute yang benar-benar memakainya.
 */
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PWAInstaller />
      {children}
      <MobileActionDock />
      <FloatingBackToTop />
    </>
  );
}