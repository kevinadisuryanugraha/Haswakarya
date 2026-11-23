import { describe, expect, it } from 'vitest';
import {
  NPWP_MAX_DIGITS,
  NPWP_MIN_DIGITS,
  NPWP_PLACEHOLDER,
  isValidNpwp,
  maskNpwp,
  normalizeNpwp,
} from '@/lib/tax/npwp';

describe('normalizeNpwp', () => {
  it('membuang titik dan strip pada NPWP 15 digit lalu menambah nol di depan', () => {
    expect(normalizeNpwp('01.234.567.8-901.000')).toBe('0012345678901000');
    expect(NPWP_MIN_DIGITS).toBe(15);
    expect(NPWP_MAX_DIGITS).toBe(16);
  });

  it('mempertahankan NPWP 16 digit apa adanya', () => {
    expect(normalizeNpwp('1234567890123456')).toBe('1234567890123456');
  });

  it('menerima spasi sebagai pemisah', () => {
    expect(normalizeNpwp(' 123 456 789 012 3456 ')).toBe('1234567890123456');
  });

  it('mengembalikan null untuk panjang yang tidak sah', () => {
    expect(normalizeNpwp('12345')).toBeNull();
    expect(normalizeNpwp('12345678901234567')).toBeNull();
  });

  it('mengembalikan null untuk nilai kosong atau bukan string', () => {
    expect(normalizeNpwp('')).toBeNull();
    expect(normalizeNpwp(null)).toBeNull();
    expect(normalizeNpwp(undefined)).toBeNull();
    expect(normalizeNpwp('tidak-ada-angka')).toBeNull();
  });
});

describe('isValidNpwp', () => {
  it('true untuk 15 dan 16 digit, false untuk sisanya', () => {
    expect(isValidNpwp('012345678901000')).toBe(true);
    expect(isValidNpwp('0123456789010000')).toBe(true);
    expect(isValidNpwp('01234567890100000')).toBe(false);
  });
});

describe('maskNpwp', () => {
  it('hanya menyisakan 4 digit terakhir', () => {
    expect(maskNpwp('0012345678901000')).toBe('*******1000');
  });

  it('null bila NPWP tidak sah', () => {
    expect(maskNpwp('abc')).toBeNull();
  });
});

describe('NPWP_PLACEHOLDER', () => {
  it('16 digit nol dan sah secara bentuk', () => {
    expect(NPWP_PLACEHOLDER).toBe('0000000000000000');
    expect(normalizeNpwp(NPWP_PLACEHOLDER)).toBe(NPWP_PLACEHOLDER);
  });
});
