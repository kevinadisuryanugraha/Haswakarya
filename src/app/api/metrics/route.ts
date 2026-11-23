import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { snapshotMetrics } from '@/lib/observability/metrics';
import { renderPrometheus } from '@/lib/observability/prometheus';
import { logger } from '@/lib/observability/logger';
import { withApiMetrics } from '@/lib/observability/withApiMetrics';

/**
 * Endpoint scrape Prometheus.
 *
 * Cakupan yang jujur: angka di sini berasal dari `withApiMetrics`, yaitu
 * handler API yang benar-benar dieksekusi. Middleware tidak menulis counter
 * (registri modulnya terpisah dan `NextResponse.next()` selalu 200), jadi
 * penolakan di middleware — redirect halaman, 401/403 API — hanya terlihat di
 * log `authz.denied`, bukan di sini. Halaman RSC juga tidak dihitung.
 *
 * Keamanan: metrik memuat nama rute internal, jadi rute ini tertutup secara
 * default. Tanpa `METRICS_TOKEN`, endpoint hanya hidup di non-produksi dan
 * mengembalikan 404 di produksi — bukan 200 berisi data kosong, agar tidak
 * memberi sinyal bahwa rute ini ada.
 */
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function configuredToken(): string | null {
  const raw = process.env.METRICS_TOKEN?.trim();
  return raw && raw.length > 0 ? raw : null;
}

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a, 'utf8');
  const bufB = Buffer.from(b, 'utf8');
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

function notFound(): NextResponse {
  return new NextResponse('Not Found', {
    status: 404,
    headers: { 'Cache-Control': 'no-store', 'Content-Type': 'text/plain; charset=utf-8' },
  });
}

async function handleGET(req: NextRequest) {
  const token = configuredToken();
  const isProduction = process.env.NODE_ENV === 'production';

  if (!token) {
    if (isProduction) return notFound();
  } else {
    const header = req.headers.get('authorization') ?? '';
    const presented = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
    if (!safeEqual(presented, token)) {
      logger.warn('metrics.denied', { route: '/api/metrics' });
      return notFound();
    }
  }

  const body = renderPrometheus(snapshotMetrics());

  return new NextResponse(body, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; version=0.0.4; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}

// Pembungkus metrics: status akhir hanya diketahui di dalam handler.
export const GET = withApiMetrics('/api/metrics', handleGET);
