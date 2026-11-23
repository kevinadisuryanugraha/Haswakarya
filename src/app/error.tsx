'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

/**
 * Batas galat tingkat root. Menangkap kegagalan render halaman publik maupun
 * portal tanpa membocorkan stack trace ke pengguna. `digest` sengaja
 * ditampilkan karena itu satu-satunya penanda yang bisa dicocokkan operator
 * dengan log server (`http.request` / `app.error`).
 */
export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log ke console klien; server sudah mencatat versi lengkapnya.
    console.error('app.render_error', error.message, error.digest ?? '');
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-16">
      <div className="max-w-lg w-full bg-white border border-slate-200 rounded-2xl shadow-sm p-8 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 mb-5">
          <AlertTriangle className="w-6 h-6 text-amber-600" />
        </div>

        <h1 className="text-lg font-extrabold text-slate-900 tracking-tight">
          Halaman gagal dimuat
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed mt-2">
          Terjadi gangguan saat merender halaman ini. Data Anda tidak berubah. Coba muat ulang;
          bila tetap gagal, sampaikan kode kejadian di bawah ke tim operasional.
        </p>

        {error.digest && (
          <p className="mt-4 text-[11px] font-mono text-slate-500 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
            kode kejadian: {error.digest}
          </p>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
          <button
            type="button"
            onClick={reset}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#071b34] hover:bg-[#0d2b52] text-white font-semibold text-sm transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Coba lagi</span>
          </button>
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-sm transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>Ke beranda</span>
          </Link>
        </div>
      </div>
    </div>
  );
}