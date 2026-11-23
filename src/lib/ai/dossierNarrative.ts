import { z } from 'zod';
import { requestJsonCompletion, type AiFailureReason, type AiMeta } from './openrouter';
import { findUnsupportedNumbersInTexts } from './numberGuard';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * Haswakarya Crewing OS — Narasi Dossier Vetting (Wedge B)
 *
 * `VettingAssessment.matrixSummary` punya dua pemilik: rute endorse menulisnya
 * sebagai catatan keputusan shipowner, sementara dossier membacanya sebagai
 * ringkasan audit. Menimpanya dengan keluaran model akan menghapus alasan
 * keputusan manusia. Karena itu narasi model punya kolom sendiri
 * (`aiNarrative*`) dan hanya dibaca sebagai tambahan.
 *
 * Pagar sama seperti triage ATS:
 * 1. Tidak ada PII keluar — nama, nomor buku pelaut, paspor, dan SID dibuang
 *    sebelum dikirim (nol identitas pelaut pada payload).
 * 2. Skor, keputusan, dan status kepatuhan tetap milik `matrixMatcher` dan
 *    keputusan shipowner; modul ini tidak menulis apa pun selain tiga kolom
 *    narasi.
 * 3. Angka yang tidak ada di fakta membatalkan narasi → fallback deterministik.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export interface DossierNarrativeCertificateFact {
  name: string;
  category: string;
  expired: boolean;
  verified: boolean;
}

export interface DossierNarrativeFacts {
  rank: string;
  targetVesselType: string | null;
  totalSeaTimeYears: number;
  tankerSeaTimeYears: number;
  seaTimeRecordCount: number;
  matrixScore: number;
  recommendation: string;
  sire2Compliant: boolean;
  rightShipCompliant: boolean;
  marlinsScore: number | null;
  strengths: string[];
  complianceGaps: string[];
  certificates: DossierNarrativeCertificateFact[];
  decision: string;
}

export interface DossierNarrativeInput {
  rank: string;
  targetVesselType?: string | null;
  totalSeaTimeYears: number;
  tankerSeaTimeYears: number;
  seaTimeRecordCount: number;
  matrixScore: number;
  recommendation: string;
  sire2Compliant: boolean;
  rightShipCompliant: boolean;
  marlinsScore?: number | null;
  strengths?: string[];
  complianceGaps?: string[];
  certificates?: DossierNarrativeCertificateFact[];
  decision: string;
}

export const dossierNarrativeSchema = z.object({
  summary: z.string().trim().min(20).max(800),
  strengths: z.array(z.string().trim().min(3).max(200)).min(1).max(4),
  gaps: z.array(z.string().trim().min(3).max(200)).max(4),
  confidence: z.enum(['low', 'medium', 'high']),
});

export type DossierNarrative = z.infer<typeof dossierNarrativeSchema>;

export interface DossierNarrativeOutcome {
  narrative: DossierNarrative;
  source: 'ai' | 'fallback';
  reason?: AiFailureReason | 'invalid_response' | 'unsupported_numbers';
  meta?: AiMeta;
}

export const DOSSIER_SYSTEM_PROMPT = [
  'Anda asisten kepatuhan kru kapal untuk agensi crewing Indonesia (SIRE 2.0, RightShip, MLC 2006).',
  'Jawab HANYA dengan satu objek JSON valid, tanpa pagar kode dan tanpa kalimat pengantar.',
  'Kunci wajib: summary (string), strengths (array string), gaps (array string), confidence ("low"|"medium"|"high").',
  'Gunakan bahasa Indonesia profesional maritim; nama sertifikat, SIRE 2.0, RightShip, Marlins ditulis apa adanya.',
  'ATURAN KERAS:',
  '1. Hanya gunakan fakta pada pesan pengguna. Jangan menambah pengalaman, kapal, sertifikat, atau angka baru.',
  '2. Setiap angka yang Anda tulis wajib muncul pada fakta, kecuali angka 1 sampai 5 sebagai penomoran dan istilah baku seperti SIRE 2.0.',
  '3. Jangan menyebut nama orang, nomor buku pelaut, paspor, atau SID. Tulis jabatan saja.',
  '4. Jangan mengubah skor, rekomendasi, atau keputusan. Anda menjelaskan bahan yang sudah dihitung server.',
  '5. Bila data kurang, tulis "data belum tersedia" pada gaps; jangan menebak.',
  '6. summary maksimum 800 karakter. strengths maksimum 4, gaps maksimum 4.',
].join('\n');

/** Menyalin hanya agregat; identitas pelaut tidak pernah masuk ke fakta. */
export function buildDossierNarrativeFacts(
  input: DossierNarrativeInput
): DossierNarrativeFacts {
  return {
    rank: input.rank,
    targetVesselType: input.targetVesselType ?? null,
    totalSeaTimeYears: input.totalSeaTimeYears,
    tankerSeaTimeYears: input.tankerSeaTimeYears,
    seaTimeRecordCount: input.seaTimeRecordCount,
    matrixScore: input.matrixScore,
    recommendation: input.recommendation,
    sire2Compliant: input.sire2Compliant,
    rightShipCompliant: input.rightShipCompliant,
    marlinsScore: input.marlinsScore ?? null,
    strengths: [...(input.strengths ?? [])],
    complianceGaps: [...(input.complianceGaps ?? [])],
    certificates: (input.certificates ?? []).map((certificate) => ({
      name: certificate.name,
      category: certificate.category,
      expired: certificate.expired,
      verified: certificate.verified,
    })),
    decision: input.decision,
  };
}

function closenessConfidence(facts: DossierNarrativeFacts): DossierNarrative['confidence'] {
  if (facts.complianceGaps.length === 0 && facts.matrixScore >= 85) return 'high';
  if (facts.matrixScore >= 60) return 'medium';
  return 'low';
}

export function fallbackDossierNarrative(
  facts: DossierNarrativeFacts
): DossierNarrative {
  const gapCount = facts.complianceGaps.length;
  const expired = facts.certificates.filter((certificate) => certificate.expired).length;

  const gapSummary =
    gapCount > 0
      ? `Tercatat ${gapCount} gap kepatuhan pada matriks.`
      : 'Tidak ada gap kepatuhan pada matriks; verifikasi dokumen asli tetap wajib.';
  const certificateSummary =
    expired > 0
      ? ` Sebanyak ${expired} sertifikat tercatat kedaluwarsa dan harus diperbarui sebelum penempatan.`
      : ' Seluruh sertifikat pada data server tercatat masih berlaku.';

  return {
    summary: `Ringkasan deterministik (tanpa model): ${facts.rank} memperoleh skor matriks ${facts.matrixScore}/100 dengan rekomendasi ${facts.recommendation} dan keputusan shipowner ${facts.decision}. ${gapSummary}${certificateSummary}`,
    strengths:
      facts.strengths.length > 0
        ? facts.strengths.slice(0, 4)
        : ['Belum ada kekuatan yang tercatat pada matriks.'],
    gaps:
      facts.complianceGaps.length > 0
        ? facts.complianceGaps.slice(0, 4)
        : ['Tidak ada gap matriks; verifikasi dokumen tetap wajib.'],
    confidence: closenessConfidence(facts),
  };
}

export interface GenerateDossierNarrativeOptions {
  fetchImpl?: typeof fetch;
  env?: NodeJS.ProcessEnv;
  timeoutMs?: number;
  retryDelayMs?: number;
}

/**
 * Menyusun narasi. Kegagalan apa pun berakhir pada fallback deterministik —
 * halaman dossier tidak boleh kosong hanya karena provider model sedang down.
 */
export async function generateDossierNarrative(
  facts: DossierNarrativeFacts,
  options: GenerateDossierNarrativeOptions = {}
): Promise<DossierNarrativeOutcome> {
  const result = await requestJsonCompletion({
    system: DOSSIER_SYSTEM_PROMPT,
    user: `FAKTA DOSSIER (JSON):\n${JSON.stringify(facts, null, 2)}`,
    fetchImpl: options.fetchImpl,
    env: options.env,
    timeoutMs: options.timeoutMs,
    retryDelayMs: options.retryDelayMs,
  });

  if (!result.ok) {
    return {
      narrative: fallbackDossierNarrative(facts),
      source: 'fallback',
      reason: result.reason,
    };
  }

  const parsed = dossierNarrativeSchema.safeParse(result.json);
  if (!parsed.success) {
    return {
      narrative: fallbackDossierNarrative(facts),
      source: 'fallback',
      reason: 'invalid_response',
    };
  }

  const unsupported = findUnsupportedNumbersInTexts(
    [
      parsed.data.summary,
      ...parsed.data.strengths,
      ...parsed.data.gaps,
    ],
    facts
  );

  if (unsupported.length > 0) {
    return {
      narrative: fallbackDossierNarrative(facts),
      source: 'fallback',
      reason: 'unsupported_numbers',
    };
  }

  return { narrative: parsed.data, source: 'ai', meta: result.meta };
}