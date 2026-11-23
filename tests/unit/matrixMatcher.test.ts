import { describe, expect, it } from 'vitest';
import {
  evaluateOfficerPairing,
  evaluateSingleOfficer,
  type OfficerMatrixProfile,
} from '@/lib/ai/matrixMatcher';

function officer(overrides: Partial<OfficerMatrixProfile> = {}): OfficerMatrixProfile {
  return {
    fullName: 'Capt. Uji Coba',
    rank: 'MASTER',
    vesselType: 'OIL_CHEMICAL_TANKER',
    timeInRankMonths: 24,
    timeOnVesselTypeMonths: 40,
    timeWithOperatorMonths: 30,
    marlinsScore: 90,
    ...overrides,
  };
}

describe('evaluateSingleOfficer — ambang SIRE 2.0 / RightShip', () => {
  it('memberi skor penuh untuk perwira berpengalaman', () => {
    const result = evaluateSingleOfficer(officer());
    expect(result.matrixScore).toBe(100);
    expect(result.recommendation).toBe('STRONGLY_APPROVED');
    expect(result.sire2Compliant).toBe(true);
    expect(result.rightShipCompliant).toBe(true);
    expect(result.marlinsCompliant).toBe(true);
    expect(result.complianceGaps).toHaveLength(0);
  });

  it('menandai non-compliant bila jam layar tipe kapal defisit', () => {
    const result = evaluateSingleOfficer(
      officer({ timeOnVesselTypeMonths: 12, timeInRankMonths: 3, timeWithOperatorMonths: 6, marlinsScore: 70 })
    );
    expect(result.sire2Compliant).toBe(false);
    expect(result.rightShipCompliant).toBe(false);
    expect(result.recommendation).toBe('MATRIX_NON_COMPLIANT');
    expect(result.matrixScore).toBeLessThan(40);
    expect(result.complianceGaps.length).toBeGreaterThanOrEqual(4);
  });

  it('memberi persetujuan bersyarat saat SIRE lolos tapi RightShip belum', () => {
    const result = evaluateSingleOfficer(
      officer({ timeOnVesselTypeMonths: 30, timeInRankMonths: 8 })
    );
    expect(result.sire2Compliant).toBe(true);
    expect(result.rightShipCompliant).toBe(false);
    expect(result.matrixScore).toBe(90);
    expect(result.recommendation).toBe('APPROVED_WITH_CONDITIONS');
    expect(result.complianceGaps.join(' ')).toContain('RightShip');
  });

  it('menangani Marlins yang belum diisi sebagai gap, bukan crash', () => {
    const result = evaluateSingleOfficer(officer({ marlinsScore: undefined }));
    expect(result.marlinsCompliant).toBe(false);
    expect(result.complianceGaps.join(' ')).toContain('Marlins');
  });

  it('tidak pernah menghasilkan skor di luar 0..100', () => {
    const worst = evaluateSingleOfficer(
      officer({
        timeOnVesselTypeMonths: 0,
        timeInRankMonths: 0,
        timeWithOperatorMonths: 0,
        marlinsScore: 0,
      })
    );
    expect(worst.matrixScore).toBeGreaterThanOrEqual(0);
    expect(worst.matrixScore).toBeLessThanOrEqual(100);
  });
});

describe('evaluateOfficerPairing — regresi perilaku lama', () => {
  it('menerima pasangan kuat', () => {
    const result = evaluateOfficerPairing(officer(), officer({ rank: 'CHIEF_OFFICER', timeInRankMonths: 18 }));
    expect(result.sire2Compliant).toBe(true);
    expect(result.combinedVesselTypeSeaTimeMonths).toBe(80);
    expect(result.recommendation).toBe('STRONGLY_APPROVED');
  });

  it('menolak pasangan dengan jam layar gabungan kurang dari 36 bulan', () => {
    const result = evaluateOfficerPairing(
      officer({ timeOnVesselTypeMonths: 10 }),
      officer({ rank: 'CHIEF_OFFICER', timeOnVesselTypeMonths: 10 })
    );
    expect(result.combinedVesselTypeSeaTimeMonths).toBe(20);
    expect(result.recommendation).toBe('MATRIX_NON_COMPLIANT');
  });
});
