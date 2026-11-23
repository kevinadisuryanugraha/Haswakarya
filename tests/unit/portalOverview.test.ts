import { describe, expect, it } from 'vitest';
import {
  CERT_CRITICAL_DAYS,
  CERT_WARNING_DAYS,
  classifyCertificateExpiry,
} from '@/lib/portal/overview';

const DAY = 24 * 3600 * 1000;
const NOW = new Date('2026-06-01T00:00:00.000Z');

function daysFromNow(days: number) {
  return new Date(NOW.getTime() + days * DAY);
}

describe('classifyCertificateExpiry', () => {
  it('menandai sertifikat tanpa tanggal kedaluwarsa sebagai LIFETIME', () => {
    expect(classifyCertificateExpiry(null, NOW)).toEqual({
      daysRemaining: null,
      expiryStatus: 'LIFETIME',
    });
    expect(classifyCertificateExpiry(undefined, NOW).expiryStatus).toBe('LIFETIME');
  });

  it('memakai batas kritis tepat di ambang hari', () => {
    expect(classifyCertificateExpiry(daysFromNow(CERT_CRITICAL_DAYS), NOW).expiryStatus).toBe(
      'CRITICAL_EXPIRED'
    );
    expect(
      classifyCertificateExpiry(daysFromNow(CERT_CRITICAL_DAYS + 1), NOW).expiryStatus
    ).toBe('WARNING_EXPIRING_SOON');
  });

  it('memakai batas peringatan tepat di ambang hari', () => {
    expect(classifyCertificateExpiry(daysFromNow(CERT_WARNING_DAYS), NOW).expiryStatus).toBe(
      'WARNING_EXPIRING_SOON'
    );
    expect(
      classifyCertificateExpiry(daysFromNow(CERT_WARNING_DAYS + 1), NOW).expiryStatus
    ).toBe('VALID');
  });

  it('menghitung sisa hari dibulatkan ke atas', () => {
    const almostThreeDays = new Date(NOW.getTime() + 2.2 * DAY);
    expect(classifyCertificateExpiry(almostThreeDays, NOW).daysRemaining).toBe(3);
  });

  it('menghasilkan sisa hari negatif untuk sertifikat yang sudah kedaluwarsa', () => {
    const result = classifyCertificateExpiry(daysFromNow(-10), NOW);
    expect(result.daysRemaining).toBe(-10);
    expect(result.expiryStatus).toBe('CRITICAL_EXPIRED');
  });

  it('menerima string ISO dari JSON', () => {
    expect(classifyCertificateExpiry(daysFromNow(200).toISOString(), NOW).expiryStatus).toBe(
      'VALID'
    );
  });
});
