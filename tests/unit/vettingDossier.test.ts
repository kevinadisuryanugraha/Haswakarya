import { describe, expect, it } from 'vitest';
import {
  buildVettingDossier,
  cocLabelForRank,
  evaluateTokenState,
  formatDateId,
  type DossierSource,
} from '@/lib/vetting/dossier';

const NOW = new Date('2026-11-20T00:00:00.000Z');

function source(overrides: Partial<DossierSource> = {}): DossierSource {
  return {
    token: 'tok-abc123',
    tokenExpiresAt: new Date('2026-11-30T00:00:00.000Z'),
    seafarer: {
      fullName: 'Capt. Budi Santoso',
      seamanBookNo: 'B.0999888',
      passportNo: 'C.1234567',
      sidNumber: 'IDN-SID-111222',
      primaryRank: 'MASTER',
      totalSeaTimeDays: 3650,
      marlinsScore: 88,
      certificates: [
        {
          certName: 'ANT-I (Master Mariner)',
          category: 'COC',
          issuingAuthority: 'Ditjen Hubla',
          expiryDate: new Date('2030-05-18T00:00:00.000Z'),
          isVerified: true,
        },
      ],
      seaTimes: [
        {
          vesselName: 'MT PERMATA',
          vesselType: 'PRODUCT_TANKER',
          grt: 4200,
          rankServed: 'MASTER',
          signOnDate: new Date('2024-01-01T00:00:00.000Z'),
          signOffDate: new Date('2025-03-01T00:00:00.000Z'),
          totalDays: 420,
        },
        {
          vesselName: 'MV BULK JAYA',
          vesselType: 'BULK_CARRIER',
          grt: 9000,
          rankServed: 'CHIEF_OFFICER',
          signOnDate: new Date('2022-01-01T00:00:00.000Z'),
          signOffDate: new Date('2022-09-01T00:00:00.000Z'),
          totalDays: 240,
        },
      ],
    },
    targetVessel: {
      name: 'MT HASWA SAMUDRA',
      vesselType: 'OIL_CHEMICAL_TANKER',
      dwt: 6500,
      grt: 3800,
      engineBhp: 4200,
    },
    vetting: null,
    ...overrides,
  };
}

describe('evaluateTokenState', () => {
  it('menandai token kedaluwarsa', () => {
    const state = evaluateTokenState(new Date('2026-11-19T00:00:00.000Z'), NOW);
    expect(state.state).toBe('EXPIRED');
    expect(state.expiresInDays).toBeLessThan(0);
  });

  it('menandai token aktif beserta sisa hari', () => {
    const state = evaluateTokenState(new Date('2026-11-30T00:00:00.000Z'), NOW);
    expect(state.state).toBe('VALID');
    expect(state.expiresInDays).toBe(10);
  });

  it('token tanpa masa berlaku dianggap tidak sah', () => {
    expect(evaluateTokenState(null, NOW).state).toBe('INVALID');
    expect(evaluateTokenState(undefined, NOW).state).toBe('INVALID');
  });
});

describe('buildVettingDossier — data nyata, bukan contoh', () => {
  it('memakai identitas pelaut dari sumber', () => {
    const dossier = buildVettingDossier(source(), NOW);
    expect(dossier.candidate.fullName).toBe('Capt. Budi Santoso');
    expect(dossier.candidate.seamanBookNo).toBe('B.0999888');
    expect(dossier.candidate.targetVessel).toBe('MT HASWA SAMUDRA');
    expect(dossier.tokenState).toBe('VALID');
    expect(dossier.decision).toBe('PENDING');
  });

  it('menghitung jam layar total dan jam layar tanker dari catatan', () => {
    const dossier = buildVettingDossier(source(), NOW);
    expect(dossier.candidate.totalSeaTimeYears).toBe(10);
    // Tanker: 420 hari = 1.15 tahun; non-tanker tidak dihitung.
    expect(dossier.candidate.tankerSeaTimeYears).toBe(1.2);
  });

  it('menghitung jam layar tipe kapal sesuai penugasan tanker', () => {
    const dossier = buildVettingDossier(source(), NOW);
    expect(dossier.audit.summary).toContain('Skor');
    // 420 hari = 14 bulan di keluarga tanker -> defisit SIRE 2.0 (min 24 bulan)
    expect(dossier.audit.sire2Compliant).toBe(false);
    expect(dossier.audit.complianceGaps.join(' ')).toContain('Defisit jam layar');
  });

  it('memetakan keputusan vetting tersimpan', () => {
    const approved = buildVettingDossier(
      source({
        vetting: {
          recommendation: 'STRONGLY_APPROVED',
          sireMatrixScore: 92,
          matrixSummary: 'Disetujui komite vetting.',
          verifiedByMaster: 'Capt. Henrik Lindqvist',
          updatedAt: new Date('2026-11-21T00:00:00.000Z'),
        },
      }),
      NOW
    );
    expect(approved.decision).toBe('APPROVED');
    expect(approved.candidate.matrixScore).toBe(92);
    expect(approved.signerName).toBe('Capt. Henrik Lindqvist');
    expect(approved.decidedAt).toBe('2026-11-21T00:00:00.000Z');
  });

  it('menandai permintaan pengganti sebagai REJECTED', () => {
    const replaced = buildVettingDossier(
      source({ vetting: { recommendation: 'REJECTED', matrixSummary: 'Owner minta kandidat lain.' } }),
      NOW
    );
    expect(replaced.decision).toBe('REJECTED');
  });

  it('tidak melempar error untuk data kosong', () => {
    const empty = buildVettingDossier(
      {
        token: 'tok-empty',
        tokenExpiresAt: new Date('2026-12-01T00:00:00.000Z'),
        seafarer: {
          fullName: 'Pelaut Baru',
          seamanBookNo: 'SB-TEMP-1',
          primaryRank: 'ABLE_SEAMAN',
          totalSeaTimeDays: 0,
          marlinsScore: null,
          certificates: [],
          seaTimes: [],
        },
        targetVessel: null,
      },
      NOW
    );
    expect(empty.candidate.totalSeaTimeYears).toBe(0);
    expect(empty.candidate.targetVessel).toContain('Talent Pool');
    expect(empty.candidate.stcwCertificates).toHaveLength(0);
  });
});

describe('util format', () => {
  it('memformat tanggal Indonesia', () => {
    expect(formatDateId(new Date('2026-05-18T00:00:00.000Z'))).toBe('18 Mei 2026');
    expect(formatDateId(null)).toBe('—');
  });

  it('memberi label CoC per jabatan', () => {
    expect(cocLabelForRank('MASTER')).toContain('ANT-I');
    expect(cocLabelForRank('ABLE_SEAMAN')).toContain('Sertifikat');
  });
});
