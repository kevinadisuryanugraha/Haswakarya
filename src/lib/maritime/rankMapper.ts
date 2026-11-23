import type { MaritimeRank } from '@prisma/client';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * Haswakarya Crewing OS — Pemetaan Jabatan Pelaut (Strict)
 * Tidak ada fallback "default rank". String yang tidak dikenali mengembalikan
 * null sehingga endpoint dapat menolak dengan 400, bukan menebak jabatan.
 * ═══════════════════════════════════════════════════════════════════════════
 */

interface RankRule {
  rank: MaritimeRank;
  patterns: readonly RegExp[];
}

/**
 * Urutan penting: jabatan mesin diperiksa lebih dulu agar "Chief Engineer"
 * tidak pernah terbaca sebagai "Chief Officer" atau "Master".
 */
export const RANK_RULES: readonly RankRule[] = [
  { rank: 'CHIEF_ENGINEER', patterns: [/\bchief\s*engineer\b/i, /\bkkm\b/i, /\bmasinis\s*(i|1)\b/i] },
  { rank: 'SECOND_ENGINEER', patterns: [/\b(second|2nd)\s*engineer\b/i, /\bmasinis\s*(ii|2)\b/i] },
  { rank: 'THIRD_ENGINEER', patterns: [/\b(third|3rd)\s*engineer\b/i, /\bmasinis\s*(iii|3)\b/i] },
  { rank: 'FOURTH_ENGINEER', patterns: [/\b(fourth|4th)\s*engineer\b/i, /\bmasinis\s*(iv|4)\b/i] },
  { rank: 'ENGINE_CADET', patterns: [/\bengine\s*cadet\b/i, /\bcadet\s*mesin\b/i] },
  { rank: 'FITTER', patterns: [/\bfitter\b/i] },
  { rank: 'OILER', patterns: [/\boiler\b/i] },
  { rank: 'WIPER', patterns: [/\bwiper\b/i] },
  { rank: 'MASTER', patterns: [/\bmaster\b/i, /\bnakhoda\b/i] },
  {
    rank: 'CHIEF_OFFICER',
    patterns: [/\bchief\s*officer\b/i, /\bchief\s*mate\b/i, /\bmualim\s*(i|1)\b/i],
  },
  {
    rank: 'SECOND_OFFICER',
    patterns: [/\b(second|2nd)\s*officer\b/i, /\bmualim\s*(ii|2)\b/i],
  },
  {
    rank: 'THIRD_OFFICER',
    patterns: [/\b(third|3rd)\s*officer\b/i, /\bmualim\s*(iii|3)\b/i],
  },
  { rank: 'DECK_CADET', patterns: [/\bdeck\s*cadet\b/i, /\bcadet\s*dek\b/i] },
  { rank: 'BOSUN', patterns: [/\bbosun\b/i, /\bboatswain\b/i] },
  {
    rank: 'ABLE_SEAMAN',
    patterns: [/\bable\s*seaman\b/i, /\bjuru\s*mudi\b/i, /\bjurumudi\b/i, /\bab\b/i],
  },
  { rank: 'ORDINARY_SEAMAN', patterns: [/\bordinary\s*seaman\b/i, /\bkelasi\b/i] },
  { rank: 'CHIEF_COOK', patterns: [/\bchief\s*cook\b/i, /\bkoki\b/i, /\bcook\b/i] },
  { rank: 'MESSMAN', patterns: [/\bmessman\b/i, /\bmess\s*boy\b/i] },
];

/**
 * Mengubah teks jabatan bebas (Indonesia/Inggris) menjadi enum MaritimeRank.
 * @returns rank yang cocok, atau null bila tidak dikenali.
 */
export function normalizeRank(input: unknown): MaritimeRank | null {
  if (typeof input !== 'string') return null;
  const value = input.trim();
  if (value.length === 0) return null;

  for (const rule of RANK_RULES) {
    if (rule.patterns.some((pattern) => pattern.test(value))) {
      return rule.rank;
    }
  }

  return null;
}

/** Daftar jabatan yang didukung, untuk pesan validasi. */
export function supportedRanks(): MaritimeRank[] {
  return RANK_RULES.map((rule) => rule.rank);
}

/** True bila input adalah nilai enum yang sah (bukan sekadar teks cocok). */
export function isKnownRank(value: unknown): value is MaritimeRank {
  return typeof value === 'string' && supportedRanks().includes(value as MaritimeRank);
}
