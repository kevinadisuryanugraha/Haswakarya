/**
 * Utilitas NPWP untuk bukti potong PPh 21.
 *
 * NPWP pribadi sejak 2024 memakai 16 digit (NIK + checksum) dan wajib
 * dilaporkan tanpa pemisah pada e-Bupot. Data lama sering tersimpan
 * 15 digit dengan format `01.234.567.8-901.000`, sehingga normalisasi
 * dilakukan sebelum disimpan agar tidak ada dua bentuk untuk satu wajib pajak.
 */

const DIGITS_ONLY = /\D/g;

/** Panjang NPWP yang diterima: 15 digit (lama) dan 16 digit (NIK-based). */
export const NPWP_MIN_DIGITS = 15;
export const NPWP_MAX_DIGITS = 16;

/**
 * Normalisasi NPWP ke bentuk kanonik 16 digit tanpa pemisah.
 * Mengembalikan `null` bila isi tidak dapat dijadikan NPWP valid.
 */
export function normalizeNpwp(raw: string | null | undefined): string | null {
  if (typeof raw !== "string") return null;
  const digits = raw.replace(DIGITS_ONLY, "");
  if (digits.length === NPWP_MAX_DIGITS) return digits;
  if (digits.length === NPWP_MIN_DIGITS) return `0${digits}`;
  return null;
}

export function isValidNpwp(raw: string | null | undefined): boolean {
  return normalizeNpwp(raw) !== null;
}

/** Bentuk tampil `00.000.000.0-000.000`; dipakai di tabel agar NPWP tidak terbaca penuh. */
export function maskNpwp(raw: string | null | undefined): string | null {
  const normalized = normalizeNpwp(raw);
  if (!normalized) return null;
  return `*******${normalized.slice(-4)}`;
}

/** NPWP fiktif untuk CSV saat pelaut belum menyerahkan NPWP (kolom tak boleh kosong). */
export const NPWP_PLACEHOLDER = "0000000000000000";
