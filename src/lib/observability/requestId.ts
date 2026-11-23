/**
 * ═══════════════════════════════════════════════════════════════════════════
 * Haswakarya Crewing OS — Korelasi request
 * ID masuk dari klien/proxy diterima hanya bila bentuknya aman, sehingga
 * header `X-Request-Id` tidak bisa dipakai untuk menyuntik log (log injection)
 * atau membanjiri agregator dengan nilai tak terbatas.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/** UUID v4, hex 8–64, atau token pendek beraksara aman. */
const REQUEST_ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._-]{7,63}$/;

export const REQUEST_ID_HEADER = 'x-request-id';

/** Mengembalikan ID yang sudah ada bila sah, atau null. */
export function sanitizeRequestId(value: string | null | undefined): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!REQUEST_ID_PATTERN.test(trimmed)) return null;
  return trimmed;
}

/** Membuat ID acak 16 byte (32 heksadesimal). */
export function createRequestId(random: () => Uint8Array = defaultRandom): string {
  const bytes = random();
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

function defaultRandom(): Uint8Array {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return bytes;
}

/** ID masuk bila sah, selain itu ID baru. */
export function resolveRequestId(inbound: string | null | undefined): string {
  return sanitizeRequestId(inbound) ?? createRequestId();
}