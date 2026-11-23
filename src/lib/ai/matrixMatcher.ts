/**
 * ═══════════════════════════════════════════════════════════════════════════
 * Haswakarya Crewing OS — OCIMF SIRE 2.0 & RightShip Matrix Engine
 * Evaluasi Kepatuhan Jam Layar Perwira (Officer Matrix Pairing Compliance)
 * ═══════════════════════════════════════════════════════════════════════════
 */

export interface OfficerMatrixProfile {
  fullName: string;
  rank: 'MASTER' | 'CHIEF_OFFICER' | 'CHIEF_ENGINEER' | 'SECOND_ENGINEER' | string;
  vesselType: string;
  timeInRankMonths: number;
  timeOnVesselTypeMonths: number;
  timeWithOperatorMonths: number;
  marlinsScore?: number;
}

export interface OfficerEvaluation {
  matrixScore: number;
  recommendation: PairMatrixEvaluation['recommendation'];
  sire2Compliant: boolean;
  rightShipCompliant: boolean;
  marlinsCompliant: boolean;
  strengths: string[];
  complianceGaps: string[];
  auditSummary: string;
}

export interface PairMatrixEvaluation {
  matrixScore: number; // 0 - 100
  recommendation: 'STRONGLY_APPROVED' | 'APPROVED_WITH_CONDITIONS' | 'MATRIX_NON_COMPLIANT' | 'REJECTED';
  combinedVesselTypeSeaTimeMonths: number;
  sire2Compliant: boolean;
  rightShipCompliant: boolean;
  strengths: string[];
  complianceGaps: string[];
  auditSummary: string;
}

/**
 * Mengevaluasi pasangan perwira kunci (Master + Chief Mate atau Chief Eng + 2nd Eng)
 * berdasarkan standar internasional RightShip & OCIMF SIRE 2.0:
 * - Standar SIRE 2.0: Minimal gabungan pengalaman di tipe kapal sejenis >= 36 bulan (3 tahun).
 * - Standar Minimal Rank: Perwira senior minimal 12 bulan di jabatannya.
 * - Marlins English Test: Minimal 80% untuk perwira operasional & manajemen.
 */
export function evaluateOfficerPairing(
  seniorOfficer: OfficerMatrixProfile,
  juniorOfficer: OfficerMatrixProfile
): PairMatrixEvaluation {
  const gaps: string[] = [];
  const strengths: string[] = [];

  const combinedMonths = seniorOfficer.timeOnVesselTypeMonths + juniorOfficer.timeOnVesselTypeMonths;
  let score = 100;

  // 1. Evaluasi Gabungan Jam Layar di Tipe Kapal Sejenis (RightShip Threshold = 36 Bulan)
  if (combinedMonths >= 48) {
    strengths.push(`Kombinasi jam layar tipe kapal luar biasa (${(combinedMonths / 12).toFixed(1)} tahun), jauh melampaui standar 3 tahun RightShip.`);
  } else if (combinedMonths >= 36) {
    strengths.push(`Kombinasi jam layar tipe kapal (${(combinedMonths / 12).toFixed(1)} tahun) memenuhi ambang batas minimum RightShip Matrix (36 bulan).`);
  } else {
    score -= 35;
    gaps.push(`Defisit jam layar tipe kapal: Gabungan ${combinedMonths} bulan (syarat minimum SIRE 2.0 / RightShip adalah 36 bulan).`);
  }

  // 2. Evaluasi Waktu di Jabatan (Time in Rank)
  if (seniorOfficer.timeInRankMonths < 12) {
    score -= 20;
    gaps.push(`${seniorOfficer.rank} memiliki jam jabatan baru (${seniorOfficer.timeInRankMonths} bulan < 12 bulan disyaratkan).`);
  } else {
    strengths.push(`${seniorOfficer.rank} memiliki stabilitas jabatan tinggi (${seniorOfficer.timeInRankMonths} bulan).`);
  }

  if (juniorOfficer.timeInRankMonths < 6) {
    score -= 10;
    gaps.push(`${juniorOfficer.rank} baru dipromosikan (${juniorOfficer.timeInRankMonths} bulan).`);
  }

  // 3. Evaluasi Waktu Bersama Operator / Perusahaan (Time with Operator)
  const combinedOperator = seniorOfficer.timeWithOperatorMonths + juniorOfficer.timeWithOperatorMonths;
  if (combinedOperator < 12) {
    score -= 15;
    gaps.push(`Kedua perwira relatif baru di armada perusahaan (gabungan ${combinedOperator} bulan). Membutuhkan safety briefing intensif.`);
  } else {
    strengths.push(`Familiaritas armada perusahaan kuat (${combinedOperator} bulan total masa dinas).`);
  }

  // 4. Marlins English Assessment Check
  if (seniorOfficer.marlinsScore && seniorOfficer.marlinsScore < 80) {
    score -= 15;
    gaps.push(`Skor Marlins ${seniorOfficer.rank} (${seniorOfficer.marlinsScore}%) di bawah batas aman komunikasi perwira (80%).`);
  }
  if (juniorOfficer.marlinsScore && juniorOfficer.marlinsScore < 75) {
    score -= 10;
    gaps.push(`Skor Marlins ${juniorOfficer.rank} (${juniorOfficer.marlinsScore}%) di bawah standar minimum operasional (75%).`);
  }

  // Batasi rentang skor 0 - 100
  const finalScore = Math.max(0, Math.min(100, score));

  // Tentukan Kategori Rekomendasi
  let recommendation: PairMatrixEvaluation['recommendation'];
  const sire2Compliant = combinedMonths >= 36 && seniorOfficer.timeInRankMonths >= 6;
  const rightShipCompliant = combinedMonths >= 36 && seniorOfficer.timeInRankMonths >= 12;

  if (finalScore >= 85 && rightShipCompliant) {
    recommendation = 'STRONGLY_APPROVED';
  } else if (finalScore >= 65 && sire2Compliant) {
    recommendation = 'APPROVED_WITH_CONDITIONS';
  } else if (combinedMonths < 36) {
    recommendation = 'MATRIX_NON_COMPLIANT';
  } else {
    recommendation = 'REJECTED';
  }

  const auditSummary = `Evaluasi Pasangan ${seniorOfficer.rank} (${seniorOfficer.fullName}) & ${juniorOfficer.rank} (${juniorOfficer.fullName}): ` +
    `Skor ${finalScore}/100. Status SIRE 2.0: ${sire2Compliant ? 'COMPLIANT' : 'NON-COMPLIANT'}. ` +
    `Total jam layar bersama di kapal ${seniorOfficer.vesselType}: ${combinedMonths} bulan.`;

  return {
    matrixScore: finalScore,
    recommendation,
    combinedVesselTypeSeaTimeMonths: combinedMonths,
    sire2Compliant,
    rightShipCompliant,
    strengths,
    complianceGaps: gaps,
    auditSummary,
  };
}

/**
 * Evaluasi satu perwira (dipakai pada dossier vetting shipowner ketika
 * pasangan perwira belum ditentukan). Ambang batas konservatif:
 * - SIRE 2.0   : >= 24 bulan di tipe kapal & >= 6 bulan di jabatan
 * - RightShip  : >= 36 bulan di tipe kapal & >= 12 bulan di jabatan
 * - Marlins    : >= 80% untuk perwira
 */
export function evaluateSingleOfficer(officer: OfficerMatrixProfile): OfficerEvaluation {
  const gaps: string[] = [];
  const strengths: string[] = [];
  let score = 100;

  if (officer.timeOnVesselTypeMonths >= 36) {
    strengths.push(
      `Jam layar tipe kapal ${officer.vesselType} kuat (${officer.timeOnVesselTypeMonths} bulan, melampaui 36 bulan RightShip).`
    );
  } else if (officer.timeOnVesselTypeMonths >= 24) {
    strengths.push(
      `Jam layar tipe kapal ${officer.vesselType} memenuhi ambang SIRE 2.0 (${officer.timeOnVesselTypeMonths} bulan, minimum 24 bulan).`
    );
  } else {
    score -= 35;
    gaps.push(
      `Defisit jam layar tipe kapal: ${officer.timeOnVesselTypeMonths} bulan (minimum SIRE 2.0 adalah 24 bulan).`
    );
  }

  if (officer.timeInRankMonths < 6) {
    score -= 25;
    gaps.push(`Masa jabatan ${officer.rank} baru ${officer.timeInRankMonths} bulan (minimum 6 bulan).`);
  } else if (officer.timeInRankMonths < 12) {
    score -= 10;
    gaps.push(
      `${officer.rank} memiliki ${officer.timeInRankMonths} bulan di jabatan — memenuhi SIRE 2.0 namun belum memenuhi RightShip 12 bulan.`
    );
  } else {
    strengths.push(`${officer.rank} stabil di jabatan (${officer.timeInRankMonths} bulan).`);
  }

  if (officer.timeWithOperatorMonths < 12) {
    score -= 10;
    gaps.push(
      `Masa dinas bersama operator ${officer.timeWithOperatorMonths} bulan — butuh safety briefing armada.`
    );
  } else {
    strengths.push(`Familiaritas armada operator kuat (${officer.timeWithOperatorMonths} bulan).`);
  }

  const marlinsCompliant = typeof officer.marlinsScore === 'number' && officer.marlinsScore >= 80;
  if (!marlinsCompliant) {
    score -= 15;
    gaps.push(
      officer.marlinsScore === undefined
        ? 'Skor Marlins English belum tersedia — wajib dilengkapi sebelum sign-on.'
        : `Skor Marlins ${officer.marlinsScore}% di bawah ambang perwira 80%.`
    );
  } else {
    strengths.push(`Marlins English ${officer.marlinsScore}% memenuhi ambang perwira.`);
  }

  const finalScore = Math.max(0, Math.min(100, score));
  const sire2Compliant =
    officer.timeOnVesselTypeMonths >= 24 && officer.timeInRankMonths >= 6;
  const rightShipCompliant =
    officer.timeOnVesselTypeMonths >= 36 && officer.timeInRankMonths >= 12;

  let recommendation: PairMatrixEvaluation['recommendation'];
  if (finalScore >= 85 && rightShipCompliant) {
    recommendation = 'STRONGLY_APPROVED';
  } else if (finalScore >= 65 && sire2Compliant) {
    recommendation = 'APPROVED_WITH_CONDITIONS';
  } else if (!sire2Compliant) {
    recommendation = 'MATRIX_NON_COMPLIANT';
  } else {
    recommendation = 'REJECTED';
  }

  const auditSummary =
    `Evaluasi Perwira ${officer.rank} (${officer.fullName}): Skor ${finalScore}/100. ` +
    `SIRE 2.0 ${sire2Compliant ? 'COMPLIANT' : 'NON-COMPLIANT'}, ` +
    `RightShip ${rightShipCompliant ? 'COMPLIANT' : 'NON-COMPLIANT'}, ` +
    `Marlins ${marlinsCompliant ? 'COMPLIANT' : 'NON-COMPLIANT'}. ` +
    `Jam layar ${officer.vesselType}: ${officer.timeOnVesselTypeMonths} bulan.`;

  return {
    matrixScore: finalScore,
    recommendation,
    sire2Compliant,
    rightShipCompliant,
    marlinsCompliant,
    strengths,
    complianceGaps: gaps,
    auditSummary,
  };
}
