import React from 'react';

/**
 * Kerangka muat untuk seluruh segmen portal. Ditampilkan oleh Next.js saat
 * segmen halaman masih dirender, sehingga transisi tidak terasa "beku".
 */
export default function PortalLoading() {
  return (
    <div className="space-y-6 animate-pulse" aria-busy="true" aria-live="polite">
      <span className="sr-only">Memuat data portal…</span>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-slate-200 gap-4">
        <div className="space-y-2">
          <div className="h-6 w-64 bg-slate-200 rounded-md" />
          <div className="h-3 w-80 bg-slate-100 rounded-md" />
        </div>
        <div className="h-9 w-40 bg-slate-100 rounded-lg" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((index) => (
          <div key={index} className="h-24 bg-white border border-slate-200 rounded-xl p-4 space-y-3">
            <div className="h-3 w-24 bg-slate-100 rounded-md" />
            <div className="h-6 w-16 bg-slate-200 rounded-md" />
          </div>
        ))}
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
        {[0, 1, 2, 3, 4, 5].map((index) => (
          <div key={index} className="h-10 bg-slate-50 rounded-lg" />
        ))}
      </div>
    </div>
  );
}