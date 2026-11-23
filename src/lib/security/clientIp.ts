import type { NextRequest } from 'next/server';

/**
 * Mengambil alamat IP klien dari header proxy tepercaya.
 * Catatan: header `x-forwarded-for` dapat dipalsukan bila aplikasi tidak
 * berada di belakang reverse proxy yang menimpanya. Nilai ini hanya dipakai
 * untuk rate limiting dan audit, bukan untuk otorisasi.
 */
export function getClientIp(req: NextRequest, fallback = 'unknown'): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim();
    if (first) return first;
  }

  const realIp = req.headers.get('x-real-ip');
  if (realIp) return realIp.trim();

  return fallback;
}

/** Kunci rate limit gabungan IP + identitas tambahan (mis. email). */
export function rateLimitKey(ip: string, suffix?: string | null): string {
  return suffix ? `${ip}:${suffix.trim().toLowerCase()}` : ip;
}
