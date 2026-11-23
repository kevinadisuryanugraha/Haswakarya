/**
 * ═══════════════════════════════════════════════════════════════════════════
 * Haswakarya Crewing OS — Pembungkus metrics untuk route handler API
 *
 * Middleware tidak bisa melihat status akhir yang dihasilkan route handler:
 * `NextResponse.next()` selalu membawa status 200, sehingga 4xx/5xx dari
 * handler tidak pernah tercatat. Karena itu pencatatan status dilakukan di
 * dalam handler sendiri lewat pembungkus ini, sementara middleware hanya
 * mencatat respons yang ia buat sendiri (redirect, 401, 403).
 *
 * Penyimpanan tetap di `globalThis` (lihat `metrics.ts`) agar semua bundle
 * route dalam satu proses berbagi angka yang sama.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import type { NextRequest } from 'next/server';
import { recordRequest } from './metrics';

type MaybePromise<T> = T | Promise<T>;

export function withApiMetrics<C = unknown>(
  route: string,
  handler: (req: NextRequest, context: C) => MaybePromise<Response>
): (req: NextRequest, context: C) => Promise<Response> {
  return async (req: NextRequest, context: C) => {
    const startedAt = Date.now();
    let status = 500;

    try {
      const response = await handler(req, context);
      status = response.status;
      return response;
    } finally {
      // `finally` juga mencatat handler yang melempar error: Next akan
      // mengubahnya menjadi 500, dan 500 itulah yang kita hitung.
      recordRequest(route, status, Date.now() - startedAt);
    }
  };
}