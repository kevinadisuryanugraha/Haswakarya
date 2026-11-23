/**
 * ═══════════════════════════════════════════════════════════════════════════
 * Haswakarya Crewing OS — Aturan Sandi
 *
 * Modul murni (tanpa Prisma, tanpa Next) supaya aturan bisa diuji langsung.
 * Dipakai dua tempat: rute ganti sandi dan pengujian.
 *
 * Alasan aturan ini ada: seluruh akun produksi hasil seed berbagi satu sandi
 * yang dicetak di dokumen rilis. Tanpa jalur ganti sandi, sandi itu berlaku
 * selamanya.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const PASSWORD_MIN_LENGTH = 12;
export const PASSWORD_MAX_LENGTH = 200;

/** Sandi yang sering muncul pada data bocor; ditolak walau panjangnya cukup. */
export const COMMON_WEAK_PASSWORDS: readonly string[] = [
  'password',
  'password123',
  'password1234',
  'passw0rd1234',
  'qwerty123456',
  '123456789012',
  'administrator',
  'letmein12345',
  'welcome12345',
  'changeme1234',
  'haswakarya2026',
];

export type PasswordChangeInput = {
  currentPassword?: unknown;
  newPassword?: unknown;
  confirmPassword?: unknown;
};

export type PasswordChangeValidation =
  | { ok: true; currentPassword: string; newPassword: string }
  | { ok: false; field: 'currentPassword' | 'newPassword' | 'confirmPassword'; message: string };

function asText(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

/**
 * Memvalidasi permintaan ganti sandi. Urutan pemeriksaan penting: sandi lama
 * diperiksa lebih dulu supaya pesan tentang sandi baru tidak membocorkan apa
 * pun tentang kecocokan sandi lama.
 */
export function validatePasswordChange(input: PasswordChangeInput): PasswordChangeValidation {
  const currentPassword = asText(input.currentPassword);
  const newPassword = asText(input.newPassword);
  const confirmPassword = asText(input.confirmPassword);

  if (!currentPassword) {
    return { ok: false, field: 'currentPassword', message: 'Sandi saat ini wajib diisi.' };
  }

  if (newPassword.length < PASSWORD_MIN_LENGTH) {
    return {
      ok: false,
      field: 'newPassword',
      message: `Sandi baru minimal ${PASSWORD_MIN_LENGTH} karakter.`,
    };
  }

  if (newPassword.length > PASSWORD_MAX_LENGTH) {
    return {
      ok: false,
      field: 'newPassword',
      message: `Sandi baru maksimal ${PASSWORD_MAX_LENGTH} karakter.`,
    };
  }

  if (newPassword !== confirmPassword) {
    return {
      ok: false,
      field: 'confirmPassword',
      message: 'Konfirmasi sandi baru tidak sama.',
    };
  }

  if (newPassword === currentPassword) {
    return {
      ok: false,
      field: 'newPassword',
      message: 'Sandi baru harus berbeda dari sandi saat ini.',
    };
  }

  if (COMMON_WEAK_PASSWORDS.includes(newPassword.toLowerCase())) {
    return {
      ok: false,
      field: 'newPassword',
      message: 'Sandi ini terlalu umum dan mudah ditebak. Pilih kombinasi lain.',
    };
  }

  return { ok: true, currentPassword, newPassword };
}

/** Kekuatan kasar untuk umpan balik UI — bukan gerbang keamanan. */
export function passwordStrength(password: string): 'empty' | 'weak' | 'fair' | 'strong' {
  if (password.length === 0) return 'empty';

  const classes = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter((pattern) =>
    pattern.test(password)
  ).length;

  if (password.length < PASSWORD_MIN_LENGTH || classes <= 1) return 'weak';
  if (classes === 2 || password.length < 16) return 'fair';
  return 'strong';
}