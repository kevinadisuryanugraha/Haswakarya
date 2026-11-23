'use client';

import React from 'react';

/**
 * Batas galat terakhir: dipakai bila root layout sendiri gagal dirender,
 * sehingga komponen ini wajib memuat <html> dan <body> sendiri serta tidak
 * boleh bergantung pada Tailwind (CSS globals mungkin tidak termuat).
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="id">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f8fafc',
          color: '#0f172a',
          fontFamily:
            'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
          padding: '24px',
        }}
      >
        <div style={{ maxWidth: '440px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '20px', fontWeight: 800, margin: '0 0 8px' }}>
            Sistem tidak dapat memuat aplikasi
          </h1>
          <p style={{ fontSize: '14px', lineHeight: 1.6, color: '#475569', margin: '0 0 20px' }}>
            Terjadi kegagalan pada kerangka aplikasi. Muat ulang halaman; bila masih gagal, hubungi
            operasional Haswakarya dan sertakan kode kejadian di bawah.
          </p>
          {error.digest && (
            <p
              style={{
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                fontSize: '12px',
                color: '#475569',
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '8px 12px',
                margin: '0 0 20px',
              }}
            >
              kode kejadian: {error.digest}
            </p>
          )}
          <button
            type="button"
            onClick={reset}
            style={{
              background: '#071b34',
              color: '#ffffff',
              border: 'none',
              borderRadius: '10px',
              padding: '10px 20px',
              fontSize: '14px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Muat ulang
          </button>
        </div>
      </body>
    </html>
  );
}