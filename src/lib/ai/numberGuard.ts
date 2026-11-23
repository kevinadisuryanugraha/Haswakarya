/**
 * ═══════════════════════════════════════════════════════════════════════════
 * Haswakarya Crewing OS — Penjaga Angka Keluaran Model
 *
 * Model gratis suka menyebut angka yang tidak ada pada fakta ("42 bulan di
 * atas kapal"). Bagi agensi crewing itu bukan salah tulis, melainkan klaim
 * yang bisa dibawa ke audit SIRE. Karena itu setiap angka pada keluaran model
 * dicocokkan ke fakta server sebelum dipakai.
 *
 * Dipakai bersama oleh triage ATS dan narasi dossier vetting supaya aturannya
 * hanya ada di satu tempat.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/**
 * Angka 0–5 selalu diizinkan: dipakai untuk penomoran, jumlah item, dan bagian
 * istilah baku seperti "SIRE 2.0" atau "MLC 2006" (2006 sendiri harus ada di
 * fakta, tetapi 2 dan 0 pada "2.0" aman).
 */
export const ALWAYS_ALLOWED_NUMBERS: ReadonlySet<number> = new Set([0, 1, 2, 3, 4, 5]);

/**
 * Pola angka pada teks: bilangan bulat atau desimal dengan koma/titik.
 * Model menulis "9,4 tahun" mengikuti kaidah Indonesia, sementara fakta
 * menyimpan 9.4 — tanpa pola ini, koma desimal akan terbaca sebagai dua angka
 * terpisah dan draf yang benar ikut dibatalkan.
 */
const NUMBER_TOKEN = /\d+(?:[.,]\d+)?/g;

/** Mengubah token angka menjadi nilai numerik ("9,4" → 9.4). */
function toNumber(token: string): number {
  return Number(token.replace(',', '.'));
}

/** Mengumpulkan seluruh angka (number dan digit pada string) dari sebuah nilai. */
export function collectNumbers(value: unknown, target: Set<number> = new Set()): Set<number> {
  if (typeof value === 'number' && Number.isFinite(value)) {
    target.add(value);
    // Bagian bulat ikut diizinkan supaya "6 tahun" sah untuk fakta 6,1 tahun.
    if (!Number.isInteger(value)) target.add(Math.trunc(value));
    return target;
  }
  if (typeof value === 'string') {
    for (const match of value.matchAll(NUMBER_TOKEN)) {
      const parsed = toNumber(match[0]);
      if (Number.isFinite(parsed)) {
        target.add(parsed);
        if (!Number.isInteger(parsed)) target.add(Math.trunc(parsed));
      }
    }
    return target;
  }
  if (Array.isArray(value)) {
    value.forEach((item) => collectNumbers(item, target));
    return target;
  }
  if (value && typeof value === 'object') {
    Object.values(value as Record<string, unknown>).forEach((item) =>
      collectNumbers(item, target)
    );
  }
  return target;
}

/**
 * Angka pada teks keluaran model yang tidak didukung fakta.
 * Mengembalikan daftar kosong bila semuanya sah.
 */
export function findUnsupportedNumbersInTexts(
  texts: readonly string[],
  facts: unknown
): number[] {
  const allowed = new Set(ALWAYS_ALLOWED_NUMBERS);
  collectNumbers(facts, allowed);

  const offenders = new Set<number>();
  for (const text of texts) {
    for (const match of text.matchAll(NUMBER_TOKEN)) {
      const number = toNumber(match[0]);
      if (!Number.isFinite(number)) continue;
      if (allowed.has(number) || allowed.has(Math.trunc(number))) continue;
      offenders.add(number);
    }
  }
  return [...offenders];
}