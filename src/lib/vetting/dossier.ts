import { evaluateSingleOfficer, type OfficerMatrixProfile } from '@/lib/ai/matrixMatcher';
import { isTankerVesselType } from '@/lib/maritime/vesselTypeMapper';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * Haswakarya Crewing OS — Penyusun Dossier Vetting Shipowner
 * Mengubah data ATS nyata (CrewApplication + SeaTime + STCW + Vessel) menjadi
 * view model yang aman dibagikan ke principal lewat token. Murni & teruji:
 * tidak ada data contoh, tidak ada angka yang dikarang.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export type VettingTokenState = 'INVALID' | 'EXPIRED' | 'VALID';
export type VettingDecisionState = 'PENDING' | 'APPROVED' | 'REPLACEMENT_REQUESTED' | 'REJECTED';

export interface DossierSeaTime {
  vesselName: string;
  imoNumber?: string | null;
  vesselType: string;
  grt?: number | null;
  dwt?: number | null;
  rankServed: string;
  signOnDate: Date | string;
  signOffDate: Date | string;
  totalDays: number;
}

export interface DossierCertificate {
  certName: string;
  category: string;
  issuingAuthority: string;
  expiryDate?: Date | string | null;
  isVerified: boolean;
}

export interface DossierSource {
  token: string;
  tokenExpiresAt?: Date | null;
  seafarer: {
    fullName: string;
    seamanBookNo: string;
    passportNo?: string | null;
    sidNumber?: string | null;
    primaryRank: string;
    totalSeaTimeDays: number;
    marlinsScore?: number | null;
    certificates: DossierCertificate[];
    seaTimes: DossierSeaTime[];
  };
  targetVessel: {
    name: string;
    vesselType: string;
    dwt?: number | null;
    grt?: number | null;
    engineBhp?: number | null;
  } | null;
  vetting?: {
    recommendation: string;
    sireMatrixScore?: number | null;
    /** Catatan keputusan shipowner dari rute endorse — bukan keluaran model. */
    matrixSummary?: string | null;
    /** Narasi dossier hasil model (Wedge B). Tidak pernah menimpa `matrixSummary`. */
    aiNarrative?: string | null;
    aiNarrativeModel?: string | null;
    aiNarrativeAt?: Date | null | string;
    verifiedByMaster?: string | null;
    updatedAt?: Date | null | string;
  } | null;
}

export interface VettingDossier {
  token: string;
  tokenState: VettingTokenState;
  decision: VettingDecisionState;
  expiresAt: string | null;
  expiresInDays: number | null;
  decidedAt: string | null;
  signerName: string | null;
  matrixSummary: string | null;
  candidate: {
    fullName: string;
    rank: string;
    seamanBookNo: string;
    passportNo: string;
    sidNo: string;
    totalSeaTimeYears: number;
    tankerSeaTimeYears: number;
    marlinsScore: number | null;
    matrixScore: number;
    recommendation: string;
    targetVessel: string;
    vesselType: string;
    stcwCertificates: { name: string; authority: string; validUntil: string }[];
    seaTimeRecords: { vessel: string; type: string; grt: string; rank: string; period: string }[];
  };
  audit: {
    sire2Compliant: boolean;
    rightShipCompliant: boolean;
    strengths: string[];
    complianceGaps: string[];
    /** Ringkasan audit: narasi model bila ada, lalu catatan shipowner, lalu matriks. */
    summary: string;
    /** Asal `summary` — ditampilkan di UI supaya pembaca tahu siapa yang menulis. */
    summarySource: 'ai' | 'shipowner' | 'matrix';
    /** Model yang menyusun narasi, null bila sumbernya bukan model. */
    narrativeModel: string | null;
    /** Waktu narasi disusun, null bila tidak ada narasi model. */
    narrativeAt: string | null;
  };
}

const DAY_MS = 24 * 3600 * 1000;

export const RANK_LABEL_ID: Record<string, string> = {
  MASTER: 'Master (Nakhoda)',
  CHIEF_OFFICER: 'Chief Officer (Mualim I)',
  SECOND_OFFICER: 'Second Officer (Mualim II)',
  THIRD_OFFICER: 'Third Officer (Mualim III)',
  DECK_CADET: 'Deck Cadet',
  BOSUN: 'Bosun',
  ABLE_SEAMAN: 'Able Seaman',
  ORDINARY_SEAMAN: 'Ordinary Seaman',
  CHIEF_ENGINEER: 'Chief Engineer (KKM)',
  SECOND_ENGINEER: 'Second Engineer (Masinis II)',
  THIRD_ENGINEER: 'Third Engineer (Masinis III)',
  FOURTH_ENGINEER: 'Fourth Engineer (Masinis IV)',
  ENGINE_CADET: 'Engine Cadet',
  FITTER: 'Fitter',
  OILER: 'Oiler',
  WIPER: 'Wiper',
  CHIEF_COOK: 'Chief Cook',
  MESSMAN: 'Messman',
};

export const VESSEL_TYPE_LABEL_ID: Record<string, string> = {
  OIL_CHEMICAL_TANKER: 'Oil & Chemical Tanker',
  PRODUCT_TANKER: 'Product Tanker',
  BULK_CARRIER: 'Bulk Carrier',
  CONTAINER_FEEDER: 'Container Feeder',
  HARBOR_OCEAN_TUG: 'Harbor / Ocean Tug',
  ASPHALT_BITUMEN_TANKER: 'Asphalt / Bitumen Tanker',
  GENERAL_CARGO: 'General Cargo',
  OFFSHORE_CREW_BOAT: 'Offshore Crew Boat',
};

export const COC_BY_RANK: Record<string, string> = {
  MASTER: 'ANT-I (Master Mariner)',
  CHIEF_OFFICER: 'ANT-II (Chief Mate)',
  SECOND_OFFICER: 'ANT-III (Officer of the Watch)',
  THIRD_OFFICER: 'ANT-III (Officer of the Watch)',
  CHIEF_ENGINEER: 'ATT-I (Chief Engineer)',
  SECOND_ENGINEER: 'ATT-II (Second Engineer)',
  THIRD_ENGINEER: 'ATT-III (Engineer of the Watch)',
  FOURTH_ENGINEER: 'ATT-III (Engineer of the Watch)',
};

const MONTHS_ID = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

function toDate(value: Date | string | null | undefined): Date | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDateId(value: Date | string | null | undefined): string {
  const date = toDate(value);
  if (!date) return '—';
  return `${date.getUTCDate()} ${MONTHS_ID[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

function seaTimeMonths(record: DossierSeaTime): number {
  if (record.totalDays > 0) return record.totalDays / 30;
  const start = toDate(record.signOnDate);
  const end = toDate(record.signOffDate);
  if (!start || !end) return 0;
  return Math.max(0, (end.getTime() - start.getTime()) / (DAY_MS * 30));
}

export function evaluateTokenState(
  tokenExpiresAt: Date | string | null | undefined,
  now: Date
): { state: VettingTokenState; expiresInDays: number | null } {
  const expiry = toDate(tokenExpiresAt);
  if (!expiry) return { state: 'INVALID', expiresInDays: null };

  const diffMs = expiry.getTime() - now.getTime();
  const days = Math.ceil(diffMs / DAY_MS);

  if (diffMs <= 0) return { state: 'EXPIRED', expiresInDays: days };
  return { state: 'VALID', expiresInDays: days };
}

function decisionFromRecommendation(
  recommendation: string | null | undefined
): VettingDecisionState {
  switch (recommendation) {
    case 'STRONGLY_APPROVED':
    case 'APPROVED_WITH_CONDITIONS':
      return 'APPROVED';
    case 'REJECTED':
    case 'MATRIX_NON_COMPLIANT':
      return 'REJECTED';
    default:
      return 'PENDING';
  }
}

/**
 * Urutan sumber ringkasan audit:
 * 1. Narasi model (`aiNarrative`) — disusun dari fakta server, boleh berubah.
 * 2. Catatan keputusan shipowner (`matrixSummary`) — pernyataan manusia.
 * 3. Ringkasan matriks deterministik — selalu tersedia.
 * Narasi model tidak pernah menimpa catatan shipowner; keduanya kolom berbeda.
 */
export function resolveAuditSummarySource(
  source: DossierSource
): 'ai' | 'shipowner' | 'matrix' {
  if (source.vetting?.aiNarrative?.trim()) return 'ai';
  if (source.vetting?.matrixSummary?.trim()) return 'shipowner';
  return 'matrix';
}

function resolveAuditSummary(source: DossierSource): string {
  const aiNarrative = source.vetting?.aiNarrative?.trim();
  if (aiNarrative) return aiNarrative;
  const ownerNote = source.vetting?.matrixSummary?.trim();
  if (ownerNote) return ownerNote;
  return ''; // diisi pemanggil dari evaluasi matriks
}

/** Menyusun dossier. Mengembalikan null bila token tidak punya data sama sekali. */
export function buildVettingDossier(source: DossierSource, now: Date): VettingDossier {
  const { seafarer } = source;
  const tokenState = evaluateTokenState(source.tokenExpiresAt, now);

  const totalDaysFromRecords = seafarer.seaTimes.reduce(
    (total, record) => total + Math.max(0, record.totalDays),
    0
  );
  const effectiveDays = seafarer.totalSeaTimeDays > 0 ? seafarer.totalSeaTimeDays : totalDaysFromRecords;

  const vesselTypeOfAssignment = source.targetVessel?.vesselType ?? null;
  const targetIsTanker = vesselTypeOfAssignment ? isTankerVesselType(vesselTypeOfAssignment) : false;

  const matchingTypeDays = seafarer.seaTimes
    .filter((record) => {
      if (!vesselTypeOfAssignment) return true;
      return record.vesselType === vesselTypeOfAssignment || (targetIsTanker && isTankerVesselType(record.vesselType));
    })
    .reduce((total, record) => total + Math.max(0, record.totalDays), 0);

  const tankerDays = seafarer.seaTimes
    .filter((record) => isTankerVesselType(record.vesselType))
    .reduce((total, record) => total + Math.max(0, record.totalDays), 0);

  const monthsInRank = seafarer.seaTimes
    .filter((record) => record.rankServed === seafarer.primaryRank)
    .reduce((total, record) => total + seaTimeMonths(record), 0);

  const monthsOnVesselType = Math.round(
    (matchingTypeDays > 0 ? matchingTypeDays : 0) / 30
  );

  const officerProfile: OfficerMatrixProfile = {
    fullName: seafarer.fullName,
    rank: seafarer.primaryRank,
    vesselType: vesselTypeOfAssignment ?? seafarer.seaTimes[0]?.vesselType ?? 'GENERAL_CARGO',
    timeInRankMonths: Math.round(monthsInRank),
    timeOnVesselTypeMonths: monthsOnVesselType,
    timeWithOperatorMonths: Math.round(effectiveDays / 30),
    marlinsScore: seafarer.marlinsScore ?? undefined,
  };

  const evaluation = evaluateSingleOfficer(officerProfile);

  return {
    token: source.token,
    tokenState: tokenState.state,
    decision: decisionFromRecommendation(source.vetting?.recommendation),
    expiresAt: toDate(source.tokenExpiresAt)?.toISOString() ?? null,
    expiresInDays: tokenState.expiresInDays,
    decidedAt: toDate(source.vetting?.updatedAt)?.toISOString() ?? null,
    signerName: source.vetting?.verifiedByMaster ?? null,
    matrixSummary: source.vetting?.matrixSummary ?? null,
    candidate: {
      fullName: seafarer.fullName,
      rank: RANK_LABEL_ID[seafarer.primaryRank] ?? seafarer.primaryRank,
      seamanBookNo: seafarer.seamanBookNo,
      passportNo: seafarer.passportNo ?? '—',
      sidNo: seafarer.sidNumber ?? '—',
      totalSeaTimeYears: round1(effectiveDays / 365),
      tankerSeaTimeYears: round1(tankerDays / 365),
      marlinsScore: seafarer.marlinsScore ?? null,
      matrixScore:
        typeof source.vetting?.sireMatrixScore === 'number'
          ? source.vetting.sireMatrixScore
          : evaluation.matrixScore,
      recommendation: source.vetting?.recommendation ?? evaluation.recommendation,
      targetVessel: source.targetVessel?.name ?? 'Belum ditugaskan (Talent Pool)',
      vesselType: source.targetVessel
        ? `${VESSEL_TYPE_LABEL_ID[source.targetVessel.vesselType] ?? source.targetVessel.vesselType}` +
          (source.targetVessel.dwt ? ` (${source.targetVessel.dwt.toLocaleString('id-ID')} DWT)` : '') +
          (source.targetVessel.engineBhp ? ` / ${source.targetVessel.engineBhp.toLocaleString('id-ID')} BHP` : '')
        : 'Penempatan menunggu requisition aktif',
      stcwCertificates: seafarer.certificates.map((cert) => ({
        name: cert.certName,
        authority: cert.issuingAuthority,
        validUntil: cert.expiryDate ? formatDateId(cert.expiryDate) : 'Berlaku seumur hidup',
      })),
      seaTimeRecords: seafarer.seaTimes.map((record) => ({
        vessel: record.vesselName,
        type: VESSEL_TYPE_LABEL_ID[record.vesselType] ?? record.vesselType,
        grt: record.grt ? `${record.grt.toLocaleString('id-ID')} GT` : '—',
        rank: RANK_LABEL_ID[record.rankServed] ?? record.rankServed,
        period: `${formatDateId(record.signOnDate)} – ${formatDateId(record.signOffDate)} (${Math.round(
          seaTimeMonths(record)
        )} bulan)`,
      })),
    },
    audit: {
      sire2Compliant: evaluation.sire2Compliant,
      rightShipCompliant: evaluation.rightShipCompliant,
      strengths: evaluation.strengths,
      complianceGaps: evaluation.complianceGaps,
      summary: resolveAuditSummary(source) || evaluation.auditSummary,
      summarySource: resolveAuditSummarySource(source),
      narrativeModel: source.vetting?.aiNarrative?.trim()
        ? (source.vetting.aiNarrativeModel ?? null)
        : null,
      narrativeAt: source.vetting?.aiNarrative?.trim()
        ? (toDate(source.vetting.aiNarrativeAt)?.toISOString() ?? null)
        : null,
    },
  };
}

/** Label CoC yang wajar untuk sebuah jabatan (dipakai UI vetting). */
export function cocLabelForRank(rank: string): string {
  return COC_BY_RANK[rank] ?? 'Sertifikat kompetensi sesuai jabatan';
}
