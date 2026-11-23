import { z } from 'zod';
import {
  requestJsonCompletion,
  type AiFailureReason,
  type AiMeta,
} from './openrouter';
import { findUnsupportedNumbersInTexts } from './numberGuard';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * Haswakarya Crewing OS — Draf Triage ATS
 *
 * Modul ini menyiapkan bahan untuk staf crewing: ringkasan, kekuatan, gap, dan
 * pertanyaan wawancara. Tiga pagar yang tidak boleh dilepas:
 *
 * 1. PII tidak pernah keluar. `buildTriageFacts` hanya menyalin agregat;
 *    nama, email, telepon, dan buku pelaut dibuang di pintu masuk.
 * 2. Skor tetap milik `matrixMatcher`. LLM hanya merangkai bahasa dari fakta
 *    yang sudah dihitung server; tidak ada kolom database yang ditulis.
 * 3. Angka yang tidak ada di fakta membatalkan draf. Halusinasi kuantitatif
 *    (mis. "42 bulan") jauh lebih berbahaya daripada draf kaku, jadi draf
 *    seperti itu diganti fallback deterministik.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export interface TriageCertificateFact {
  name: string;
  category: string;
  expired: boolean;
}

export interface TriageMatrixFact {
  score: number;
  recommendation: string;
  sireCompliant: boolean;
  rightShipCompliant: boolean;
  marlinsCompliant: boolean;
  strengths: string[];
  gaps: string[];
}

export interface TriageFacts {
  rank: string;
  cocClass: string | null;
  marlinsPercent: number | null;
  seaTimeMonths: number;
  vesselTypeExperience: string | null;
  readinessDate: string | null;
  stage: string;
  certificates: TriageCertificateFact[];
  matrix: TriageMatrixFact;
}

/**
 * Bentuk masukan mentah. Field PII ada di tipe ini supaya pemanggil tidak
 * perlu memangkas objek sendiri — fungsi yang membuangnya, dan test menahan
 * janji itu.
 */
export interface TriageInput {
  fullName?: string | null;
  email?: string | null;
  phone?: string | null;
  seamanBookNo?: string | null;
  rank: string;
  cocClass?: string | null;
  marlinsPercent?: number | null;
  seaTimeMonths: number;
  vesselTypeExperience?: string | null;
  readinessDate?: string | null;
  stage: string;
  certificates?: TriageCertificateFact[];
  matrix: TriageMatrixFact;
}

export const triageDraftSchema = z.object({
  summary: z.string().trim().min(20).max(700),
  strengths: z.array(z.string().trim().min(3).max(200)).min(1).max(4),
  gaps: z.array(z.string().trim().min(3).max(200)).max(4),
  interviewQuestions: z.array(z.string().trim().min(5).max(220)).min(1).max(5),
  confidence: z.enum(['low', 'medium', 'high']),
});

export type TriageDraft = z.infer<typeof triageDraftSchema>;

export interface TriageOutcome {
  draft: TriageDraft;
  source: 'ai' | 'fallback';
  reason?: AiFailureReason | 'invalid_response' | 'unsupported_numbers';
  meta?: AiMeta;
}

export const TRIAGE_SYSTEM_PROMPT = [
  'Anda asisten triage kru kapal untuk agensi crewing Indonesia.',
  'Jawab HANYA dengan satu objek JSON valid, tanpa pagar kode dan tanpa kalimat pengantar.',
  'Kunci wajib: summary (string), strengths (array string), gaps (array string), interviewQuestions (array string), confidence ("low"|"medium"|"high").',
  'Gunakan bahasa Indonesia profesional maritim (istilah seperti CoC, SIRE 2.0, RightShip, Marlins dibiarkan apa adanya).',
  'ATURAN KERAS:',
  '1. Hanya gunakan fakta pada pesan pengguna. Jangan menambah pengalaman, kapal, sertifikat, atau angka baru.',
  '2. Setiap angka yang Anda tulis wajib muncul pada fakta, kecuali angka 1 sampai 5 sebagai penomoran dan istilah baku seperti SIRE 2.0.',
  '3. Jangan memutuskan diterima atau ditolak. Anda menyusun bahan pertimbangan, bukan keputusan.',
  '4. Bila data kurang, tulis "data belum tersedia" pada gap; jangan menebak.',
  '5. summary maksimum 700 karakter. strengths maksimum 4, gaps maksimum 4, interviewQuestions maksimum 5.',
  '6. interviewQuestions harus berupa pertanyaan yang dapat diajukan verifikator, bukan pernyataan.',
].join('\n');

export function buildTriageFacts(input: TriageInput): TriageFacts {
  // Field PII sengaja tidak disalin ke keluaran.
  return {
    rank: input.rank,
    cocClass: input.cocClass ?? null,
    marlinsPercent: input.marlinsPercent ?? null,
    seaTimeMonths: input.seaTimeMonths,
    vesselTypeExperience: input.vesselTypeExperience ?? null,
    readinessDate: input.readinessDate ?? null,
    stage: input.stage,
    certificates: (input.certificates ?? []).map((certificate) => ({
      name: certificate.name,
      category: certificate.category,
      expired: certificate.expired,
    })),
    matrix: {
      score: input.matrix.score,
      recommendation: input.matrix.recommendation,
      sireCompliant: input.matrix.sireCompliant,
      rightShipCompliant: input.matrix.rightShipCompliant,
      marlinsCompliant: input.matrix.marlinsCompliant,
      strengths: [...input.matrix.strengths],
      gaps: [...input.matrix.gaps],
    },
  };
}

/**
 * Angka pada draf yang tidak didukung fakta. Aturan bersama ada di
 * `numberGuard.ts`; fungsi ini mempertahankan nama lama untuk pemanggil dan
 * test yang sudah ada.
 */
export function findUnsupportedNumbers(
  draft: TriageDraft,
  facts: TriageFacts
): number[] {
  return findUnsupportedNumbersInTexts(
    [draft.summary, ...draft.strengths, ...draft.gaps, ...draft.interviewQuestions],
    facts
  );
}

export function fallbackTriageDraft(facts: TriageFacts): TriageDraft {
  const { matrix } = facts;
  const gapSummary =
    matrix.gaps.length > 0
      ? `Tercatat ${matrix.gaps.length} gap kepatuhan yang perlu dikonfirmasi.`
      : 'Tidak ada gap matriks yang tercatat pada data server.';

  return {
    summary: `Draf deterministik (tanpa model): ${facts.rank} memperoleh skor matriks ${matrix.score}/100 dengan rekomendasi ${matrix.recommendation}. ${gapSummary} Susunan kalimat ini berasal dari mesin matriks, bukan dari bahasa model.`,
    strengths:
      matrix.strengths.length > 0
        ? matrix.strengths.slice(0, 4)
        : ['Belum ada kekuatan yang tercatat pada matriks.'],
    gaps:
      matrix.gaps.length > 0
        ? matrix.gaps.slice(0, 4)
        : ['Tidak ada gap matriks; verifikasi dokumen tetap wajib.'],
    interviewQuestions: buildFallbackQuestions(matrix.gaps),
    confidence: matrix.gaps.length === 0 && matrix.score >= 85 ? 'high' : matrix.score >= 60 ? 'medium' : 'low',
  };
}

function buildFallbackQuestions(gaps: string[]): string[] {
  const questions = gaps.slice(0, 4).map(
    (gap) => `Mohon jelaskan bukti pendukung untuk hal berikut: ${trimSentence(gap)}`
  );
  questions.push('Mohon konfirmasi kesiapan dokumen asli dan tanggal bergabung terbaru.');
  return questions.slice(0, 5);
}

function trimSentence(text: string): string {
  const single = text.replace(/\s+/g, ' ').trim();
  return single.length > 140 ? `${single.slice(0, 137)}...` : single;
}

export interface GenerateTriageOptions {
  fetchImpl?: typeof fetch;
  env?: NodeJS.ProcessEnv;
  timeoutMs?: number;
  retryDelayMs?: number;
}

/**
 * Menyusun draf. Kegagalan apa pun (kunci kosong, 429, timeout, JSON rusak,
 * angka halusinasi) berakhir pada fallback deterministik — bukan pada error.
 */
export async function generateTriageDraft(
  facts: TriageFacts,
  options: GenerateTriageOptions = {}
): Promise<TriageOutcome> {
  const result = await requestJsonCompletion({
    system: TRIAGE_SYSTEM_PROMPT,
    user: `FAKTA APLIKASI (JSON):\n${JSON.stringify(facts, null, 2)}`,
    fetchImpl: options.fetchImpl,
    env: options.env,
    timeoutMs: options.timeoutMs,
    retryDelayMs: options.retryDelayMs,
  });

  if (!result.ok) {
    return { draft: fallbackTriageDraft(facts), source: 'fallback', reason: result.reason };
  }

  const parsed = triageDraftSchema.safeParse(result.json);
  if (!parsed.success) {
    return { draft: fallbackTriageDraft(facts), source: 'fallback', reason: 'invalid_response' };
  }

  const unsupported = findUnsupportedNumbers(parsed.data, facts);
  if (unsupported.length > 0) {
    return {
      draft: fallbackTriageDraft(facts),
      source: 'fallback',
      reason: 'unsupported_numbers',
    };
  }

  return { draft: parsed.data, source: 'ai', meta: result.meta };
}