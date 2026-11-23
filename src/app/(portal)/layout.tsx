import React from 'react';

/**
 * Portal selalu dirender per-request: dua alasan keamanan.
 * 1. CSP ber-nonce hanya bisa disuntikkan ke HTML yang dinamis; halaman statis
 *    tidak punya nonce sehingga script-nya diblokir kebijakan ketat.
 * 2. Halaman ini memuat data personal pelaut/kontrak — tidak boleh di-prerender
 *    lalu dibagikan dari cache.
 */
export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Haswakarya Crewing OS — Enterprise Maritime Portal',
  description: 'Sistem Operasi Manajemen Rekrutmen dan Kepatuhan Awak Kapal Niaga Standar STCW 2010, MLC 2006, dan SIRE 2.0',
};

export default function PortalRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased selection:bg-amber-500/20 selection:text-amber-900">
      {children}
    </div>
  );
}
