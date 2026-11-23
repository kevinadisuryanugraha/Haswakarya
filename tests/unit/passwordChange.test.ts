import { describe, expect, it } from 'vitest';
import {
  COMMON_WEAK_PASSWORDS,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  passwordStrength,
  validatePasswordChange,
} from '@/lib/auth/password';

const CURRENT = 'Haswa-Prod-Crew-2026#Z7q';

function validate(newPassword: string, confirmPassword = newPassword, currentPassword = CURRENT) {
  return validatePasswordChange({ currentPassword, newPassword, confirmPassword });
}

describe('validatePasswordChange — pagar ganti sandi', () => {
  it('menerima sandi panjang yang wajar', () => {
    const result = validate('Batam-Hubla-2026#Pelaut');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.newPassword).toBe('Batam-Hubla-2026#Pelaut');
      expect(result.currentPassword).toBe(CURRENT);
    }
  });

  it('menolak sandi saat ini kosong', () => {
    const result = validatePasswordChange({ currentPassword: '', newPassword: 'Batam-Hubla-2026#P' });
    expect(result).toEqual({
      ok: false,
      field: 'currentPassword',
      message: 'Sandi saat ini wajib diisi.',
    });
  });

  it('menolak badan permintaan yang bukan string', () => {
    const result = validatePasswordChange({ currentPassword: 123, newPassword: null });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.field).toBe('currentPassword');
  });

  it('menolak sandi baru lebih pendek dari batas', () => {
    const short = 'a'.repeat(PASSWORD_MIN_LENGTH - 1);
    const result = validate(short);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.field).toBe('newPassword');
      expect(result.message).toContain(String(PASSWORD_MIN_LENGTH));
    }
  });

  it('menerima tepat pada batas minimum', () => {
    expect(validate('a'.repeat(PASSWORD_MIN_LENGTH)).ok).toBe(true);
  });

  it('menolak sandi baru lebih panjang dari batas', () => {
    const result = validate('a'.repeat(PASSWORD_MAX_LENGTH + 1));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.field).toBe('newPassword');
  });

  it('menolak konfirmasi yang tidak sama', () => {
    const result = validate('Batam-Hubla-2026#Pelaut', 'Batam-Hubla-2026#Pelau');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.field).toBe('confirmPassword');
  });

  it('menolak sandi baru sama dengan sandi lama', () => {
    const result = validate(CURRENT);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.field).toBe('newPassword');
  });

  it('menolak sandi umum tanpa peduli huruf besar-kecil', () => {
    for (const weak of COMMON_WEAK_PASSWORDS) {
      expect(validate(weak).ok).toBe(false);
      expect(validate(weak.toUpperCase()).ok).toBe(false);
    }
  });

  it('daftar sandi lemah tidak memuat duplikat', () => {
    const unique = new Set(COMMON_WEAK_PASSWORDS.map((item) => item.toLowerCase()));
    expect(unique.size).toBe(COMMON_WEAK_PASSWORDS.length);
  });
});

describe('passwordStrength — umpan balik UI', () => {
  it('kosong', () => {
    expect(passwordStrength('')).toBe('empty');
  });

  it('lemah bila terlalu pendek atau hanya satu kelas karakter', () => {
    expect(passwordStrength('abc')).toBe('weak');
    expect(passwordStrength('abcdefghijklmnop')).toBe('weak');
  });

  it('cukup untuk dua kelas karakter', () => {
    expect(passwordStrength('Abcdefghijkl')).toBe('fair');
  });

  it('kuat untuk empat kelas dan panjang', () => {
    expect(passwordStrength('Batam-Hubla-2026#Pelaut')).toBe('strong');
  });
});