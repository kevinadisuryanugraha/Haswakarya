/**
 * Klien requisition principal → endpoint publik manning inquiry.
 *
 * Logika fetch dipisah dari komponen agar perilaku 201 / 400 / 429 / gagal
 * jaringan bisa diuji tanpa DOM dan tanpa server. Pola mengikuti
 * `seafarerApplication.ts` supaya dua kanal publik berperilaku sama.
 */

export interface ManningRequisitionPayload {
  companyName: string;
  contactPerson: string;
  workEmail: string;
  phoneWhatsApp: string;
  vesselName: string;
  imoNumber: string;
  vesselType: string;
  targetRanks: string;
  joinPort: string;
  expectedJoiningDate: string;
  notes: string;
}

export interface ManningRequisitionReceipt {
  inquiryId: string;
}

export type ManningRequisitionOutcome =
  | { status: 'ok'; receipt: ManningRequisitionReceipt }
  | { status: 'error'; message: string };

export const MANNING_INQUIRY_ENDPOINT = '/api/public/inquiry-manning';

export const MANNING_NETWORK_ERROR_MESSAGE =
  'Unable to reach the Haswakarya crewing desk. Check your connection and submit again.';

export const MANNING_FALLBACK_ERROR_MESSAGE =
  'The requisition could not be registered. Please try again in a moment.';

/** Opsi vessel type — nilai inilah yang tersimpan di `ManningInquiry.vesselType`. */
export const VESSEL_OPTIONS = [
  'Oil & Chemical Tanker (SIRE)',
  'Dry Bulk Carrier (RightShip)',
  'Container Vessel (Boxship)',
  'Harbor & Ocean ASD Tugboat',
  'Offshore AHTS / Crew Boat',
  'Gas Carrier (LPG / LNG)',
] as const;

export const CREW_SCOPE_OPTIONS = [
  'Top 4 Officers (Master / C/E / C/O / 2E)',
  'Full Complement (Officers & Ratings 100%)',
  'Senior Deck Officers (Master / C/O)',
  'Senior Engine Officers (C/E / 2E)',
  'Support Level Ratings (Bosun, AB, Oiler, Cook)',
] as const;

export const FLAG_OPTIONS = [
  'Indonesia (Hubla RI)',
  'Panama Maritime Authority',
  'Marshall Islands (IRI)',
  'Liberia (LISCR)',
  'Singapore (MPA)',
] as const;

export const MOBILIZATION_OPTIONS = [
  'Within 14 – 30 Days',
  'Immediate (Within 7 Days)',
  'Within 31 – 60 Days',
  'Planning Only (60+ Days)',
] as const;

export const DEFAULT_VESSEL_TYPE: string = VESSEL_OPTIONS[0];
export const DEFAULT_CREW_SCOPE: string = CREW_SCOPE_OPTIONS[0];
export const DEFAULT_FLAG: string = FLAG_OPTIONS[0];
export const DEFAULT_MOBILIZATION: string = MOBILIZATION_OPTIONS[0];

/**
 * Peta id armada di beranda (`VESSEL_TYPES_DATA.id`) ke opsi vessel type form.
 * Dipakai tautan `/recruit-crew?vessel=<id>` dari kartu armada.
 */
const VESSEL_PARAM_ALIASES: Record<string, string> = {
  tanker: 'Oil & Chemical Tanker (SIRE)',
  bulk: 'Dry Bulk Carrier (RightShip)',
  container: 'Container Vessel (Boxship)',
  'tug-barge': 'Harbor & Ocean ASD Tugboat',
  offshore: 'Offshore AHTS / Crew Boat',
  gas: 'Gas Carrier (LPG / LNG)',
};

/**
 * Mengubah parameter query menjadi label opsi form yang sah.
 * Id armada, label penuh, atau variasi huruf besar-kecil semuanya diterima;
 * nilai asing diabaikan supaya `<select>` tidak pernah menunjuk opsi hilang.
 */
export function resolveVesselTypeParam(value?: string | null): string | undefined {
  if (!value) return undefined;
  const key = value.trim().toLowerCase();
  if (!key) return undefined;

  const byAlias = VESSEL_PARAM_ALIASES[key];
  if (byAlias) return byAlias;

  return VESSEL_OPTIONS.find((option) => option.toLowerCase() === key);
}

function readErrorMessage(body: unknown): string | null {
  if (!body || typeof body !== 'object') return null;
  const candidate = (body as { error?: unknown }).error;
  if (typeof candidate !== 'string') return null;
  const trimmed = candidate.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export async function submitManningRequisition(
  payload: ManningRequisitionPayload,
  fetchImpl: typeof fetch = fetch,
): Promise<ManningRequisitionOutcome> {
  let response: Response;

  try {
    response = await fetchImpl(MANNING_INQUIRY_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch {
    return { status: 'error', message: MANNING_NETWORK_ERROR_MESSAGE };
  }

  let body: unknown = null;
  try {
    body = await response.json();
  } catch {
    body = null;
  }

  if (!response.ok) {
    return {
      status: 'error',
      message: readErrorMessage(body) ?? MANNING_FALLBACK_ERROR_MESSAGE,
    };
  }

  const inquiryId = (body as { inquiryId?: unknown } | null)?.inquiryId;
  if (typeof inquiryId !== 'string' || inquiryId.trim().length === 0) {
    return { status: 'error', message: MANNING_FALLBACK_ERROR_MESSAGE };
  }

  return { status: 'ok', receipt: { inquiryId } };
}