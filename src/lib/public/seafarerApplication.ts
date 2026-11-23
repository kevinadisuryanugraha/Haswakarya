/**
 * Klien pengiriman dossier pelaut ke endpoint publik.
 *
 * Logika fetch dipisah dari komponen agar perilaku 200 / 400 / 429 / gagal
 * jaringan bisa diuji tanpa DOM dan tanpa server.
 */

export interface SeafarerApplicationPayload {
  fullName: string;
  phoneWhatsApp: string;
  email: string;
  seamanBookNo: string;
  departmentRank: string;
  cocClass: string;
  marlinsScore: string;
  seaTimeMonths: string;
  vesselTypeExperience: string;
  readinessDate: string;
  additionalNotes: string;
}

export interface SeafarerApplicationReceipt {
  applicationId: string;
  seamanBookNo: string;
}

export type SeafarerApplicationOutcome =
  | { status: 'ok'; receipt: SeafarerApplicationReceipt }
  | { status: 'error'; message: string };

export const APPLY_SEAFARER_ENDPOINT = '/api/public/apply-seafarer';

export const NETWORK_ERROR_MESSAGE =
  'Tidak dapat menghubungi server Haswakarya. Periksa koneksi lalu kirim ulang.';

export const FALLBACK_ERROR_MESSAGE =
  'Pendaftaran gagal diproses. Silakan coba lagi beberapa saat lagi.';

function readErrorMessage(body: unknown): string | null {
  if (!body || typeof body !== 'object') return null;
  const candidate = (body as { error?: unknown }).error;
  if (typeof candidate !== 'string') return null;
  const trimmed = candidate.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export async function submitSeafarerApplication(
  payload: SeafarerApplicationPayload,
  fetchImpl: typeof fetch = fetch,
): Promise<SeafarerApplicationOutcome> {
  let response: Response;

  try {
    response = await fetchImpl(APPLY_SEAFARER_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch {
    return { status: 'error', message: NETWORK_ERROR_MESSAGE };
  }

  let body: unknown = null;
  try {
    body = await response.json();
  } catch {
    body = null;
  }

  if (!response.ok) {
    return { status: 'error', message: readErrorMessage(body) ?? FALLBACK_ERROR_MESSAGE };
  }

  const record = (body ?? {}) as { applicationId?: unknown; seamanBookNo?: unknown };
  const applicationId = typeof record.applicationId === 'string' ? record.applicationId : '';
  if (!applicationId) {
    return { status: 'error', message: FALLBACK_ERROR_MESSAGE };
  }

  return {
    status: 'ok',
    receipt: {
      applicationId,
      seamanBookNo:
        typeof record.seamanBookNo === 'string' && record.seamanBookNo.trim().length > 0
          ? record.seamanBookNo
          : payload.seamanBookNo,
    },
  };
}