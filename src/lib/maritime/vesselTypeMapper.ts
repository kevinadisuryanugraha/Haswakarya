import type { VesselType } from '@prisma/client';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * Haswakarya Crewing OS — Pemetaan Tipe Kapal (Strict)
 * Urutan penting: aspal dan produk diperiksa sebelum tanker generik.
 * Nilai tak dikenal mengembalikan null — bukan menebak tipe armada.
 * ═══════════════════════════════════════════════════════════════════════════
 */

interface VesselRule {
  type: VesselType;
  patterns: readonly RegExp[];
}

export const VESSEL_TYPE_RULES: readonly VesselRule[] = [
  { type: 'ASPHALT_BITUMEN_TANKER', patterns: [/asphalt/i, /bitumen/i] },
  { type: 'PRODUCT_TANKER', patterns: [/product\s*tanker/i, /product\s*carrier/i] },
  { type: 'OIL_CHEMICAL_TANKER', patterns: [/oil/i, /chemical/i, /tanker/i, /crude/i] },
  { type: 'CONTAINER_FEEDER', patterns: [/container/i, /feeder/i] },
  { type: 'BULK_CARRIER', patterns: [/bulk/i] },
  { type: 'HARBOR_OCEAN_TUG', patterns: [/\btug\b/i, /tugboat/i, /\bbarge\b/i, /\basd\b/i] },
  { type: 'OFFSHORE_CREW_BOAT', patterns: [/offshore/i, /crew\s*boat/i, /\bosv\b/i] },
  { type: 'GENERAL_CARGO', patterns: [/general\s*cargo/i, /\bcargo\b/i] },
];

export function normalizeVesselType(input: unknown): VesselType | null {
  if (typeof input !== 'string') return null;
  const value = input.trim();
  if (value.length === 0) return null;

  for (const rule of VESSEL_TYPE_RULES) {
    if (rule.patterns.some((pattern) => pattern.test(value))) {
      return rule.type;
    }
  }

  return null;
}

export function supportedVesselTypes(): VesselType[] {
  return VESSEL_TYPE_RULES.map((rule) => rule.type);
}

/** Keluarga tanker dipakai untuk menghitung jam layar tanker pada vetting. */
export const TANKER_VESSEL_TYPES = [
  'OIL_CHEMICAL_TANKER',
  'PRODUCT_TANKER',
  'ASPHALT_BITUMEN_TANKER',
] as const;

export function isTankerVesselType(value: unknown): boolean {
  return typeof value === 'string' && (TANKER_VESSEL_TYPES as readonly string[]).includes(value);
}
