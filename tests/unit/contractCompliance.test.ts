import { describe, expect, it } from 'vitest';
import {
  ILO_MAX_CONTRACT_MONTHS,
  addMonthsUtc,
  contractWindow,
  summarizeFleetCompliance,
} from '@/lib/maritime/contractCompliance';

const SIGN_ON = '2026-01-15T00:00:00.000Z';

describe('addMonthsUtc', () => {
  it('menambah bulan kalender sederhana', () => {
    expect(addMonthsUtc(new Date('2026-01-15T00:00:00Z'), 6).toISOString()).toBe(
      '2026-07-15T00:00:00.000Z'
    );
  });

  it('mengunci tanggal 31 ke akhir bulan target', () => {
    expect(addMonthsUtc(new Date('2026-01-31T00:00:00Z'), 1).toISOString()).toBe(
      '2026-02-28T00:00:00.000Z'
    );
    expect(addMonthsUtc(new Date('2024-01-31T00:00:00Z'), 1).toISOString()).toBe(
      '2024-02-29T00:00:00.000Z'
    );
  });

  it('melewati pergantian tahun', () => {
    expect(addMonthsUtc(new Date('2026-11-30T00:00:00Z'), 3).toISOString()).toBe(
      '2027-02-28T00:00:00.000Z'
    );
  });

  it('menangani penambahan negatif', () => {
    expect(addMonthsUtc(new Date('2026-03-15T00:00:00Z'), -3).toISOString()).toBe(
      '2025-12-15T00:00:00.000Z'
    );
  });
});

describe('contractWindow', () => {
  it('menandai kontrak 6 bulan sebagai ON_TRACK', () => {
    const window = contractWindow(SIGN_ON, 6, '2026-02-01T00:00:00Z');
    expect(window.status).toBe('ON_TRACK');
    expect(window.scheduledEndDate).toBe('2026-07-15T00:00:00.000Z');
    expect(window.mlcLimitDate).toBe('2026-12-15T00:00:00.000Z');
    expect(window.monthsContracted).toBe(6);
  });

  it('menghitung sisa hari menuju akhir kontrak dan batas MLC', () => {
    const window = contractWindow(SIGN_ON, 6, '2026-06-15T00:00:00Z');
    expect(window.daysToScheduledEnd).toBe(30);
    expect(window.daysToMlcLimit).toBe(183);
  });

  it('memberi DUE_SOON ketika akhir kontrak ≤ 30 hari', () => {
    const window = contractWindow(SIGN_ON, 6, '2026-06-20T00:00:00Z');
    expect(window.status).toBe('DUE_SOON');
  });

  it('memberi DUE_SOON ketika batas MLC ≤ 30 hari', () => {
    const window = contractWindow(SIGN_ON, 11, '2026-11-20T00:00:00Z');
    expect(window.status).toBe('DUE_SOON');
    expect(window.daysToMlcLimit).toBe(25);
  });

  it('memberi MLC_BREACH ketika batas 11 bulan sudah lewat', () => {
    const window = contractWindow(SIGN_ON, 9, '2026-12-20T00:00:00Z');
    expect(window.status).toBe('MLC_BREACH');
    expect(window.daysToMlcLimit).toBeLessThan(0);
  });

  it('memberi MLC_BREACH bila kontrak sendiri dijadwalkan > 11 bulan', () => {
    const window = contractWindow(SIGN_ON, 12, '2026-02-01T00:00:00Z');
    expect(window.status).toBe('MLC_BREACH');
    expect(window.monthsContracted).toBe(12);
  });

  it('memberi MLC_BREACH tepat pada durasi 11 bulan + 1 hari? tidak: 11 bulan pas masih sah', () => {
    const window = contractWindow(SIGN_ON, ILO_MAX_CONTRACT_MONTHS, '2026-02-01T00:00:00Z');
    expect(window.status).toBe('ON_TRACK');
  });

  it('memberi UNKNOWN untuk data tidak masuk akal', () => {
    expect(contractWindow(null, 6, SIGN_ON).status).toBe('UNKNOWN');
    expect(contractWindow('bukan tanggal', 6, SIGN_ON).status).toBe('UNKNOWN');
    expect(contractWindow(SIGN_ON, 0, SIGN_ON).status).toBe('UNKNOWN');
    expect(contractWindow(SIGN_ON, Number.NaN, SIGN_ON).status).toBe('UNKNOWN');
  });

  it('memakai jam sekarang bila `now` tidak diberikan', () => {
    const window = contractWindow(SIGN_ON, 6);
    expect(['ON_TRACK', 'DUE_SOON', 'MLC_BREACH']).toContain(window.status);
    expect(window.scheduledEndDate).toBe('2026-07-15T00:00:00.000Z');
  });
});

describe('summarizeFleetCompliance', () => {
  it('menghitung tiap status', () => {
    const summary = summarizeFleetCompliance([
      { status: 'ON_TRACK' },
      { status: 'ON_TRACK' },
      { status: 'DUE_SOON' },
      { status: 'MLC_BREACH' },
      { status: 'UNKNOWN' },
    ]);
    expect(summary).toEqual({
      total: 5,
      onTrack: 2,
      dueSoon: 1,
      breach: 1,
      unknown: 1,
      worst: 'MLC_BREACH',
    });
  });

  it('memakai status terburuk yang ada', () => {
    expect(
      summarizeFleetCompliance([{ status: 'ON_TRACK' }, { status: 'DUE_SOON' }]).worst
    ).toBe('DUE_SOON');
    expect(summarizeFleetCompliance([{ status: 'ON_TRACK' }]).worst).toBe('ON_TRACK');
    expect(summarizeFleetCompliance([]).worst).toBe('ON_TRACK');
  });

  it('menandai UNKNOWN hanya bila semua tidak diketahui', () => {
    expect(summarizeFleetCompliance([{ status: 'UNKNOWN' }]).worst).toBe('UNKNOWN');
    expect(
      summarizeFleetCompliance([{ status: 'UNKNOWN' }, { status: 'ON_TRACK' }]).worst
    ).toBe('ON_TRACK');
  });
});