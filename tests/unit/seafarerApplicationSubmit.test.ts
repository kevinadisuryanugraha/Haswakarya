import { describe, expect, it } from 'vitest';
import {
  APPLY_SEAFARER_ENDPOINT,
  FALLBACK_ERROR_MESSAGE,
  NETWORK_ERROR_MESSAGE,
  submitSeafarerApplication,
  type SeafarerApplicationPayload,
} from '@/lib/public/seafarerApplication';

const payload: SeafarerApplicationPayload = {
  fullName: 'Capt. Hendra Gunawan',
  phoneWhatsApp: '+62 812-3456-7890',
  email: 'hendra@example.com',
  seamanBookNo: 'C.0123456',
  departmentRank: 'Master (Nakhoda)',
  cocClass: 'Class I (ANT-I / ATT-I) Management',
  marlinsScore: '90% – 100% (High Proficiency)',
  seaTimeMonths: 'More than 36 Months',
  vesselTypeExperience: 'Oil & Chemical Tanker (SIRE)',
  readinessDate: 'Immediate (Within 7 Days)',
  additionalNotes: 'US C1/D visa',
};

function jsonResponse(body: unknown, init: { status: number; ok: boolean }) {
  return {
    ok: init.ok,
    status: init.status,
    json: async () => body,
  } as unknown as Response;
}

describe('submitSeafarerApplication', () => {
  it('HAPPY_PATH: mengembalikan receipt saat API 200', async () => {
    let calledUrl = '';
    let calledBody = '';

    const outcome = await submitSeafarerApplication(payload, (async (url: string, init: RequestInit) => {
      calledUrl = String(url);
      calledBody = String(init.body);
      return jsonResponse({ applicationId: 'app_123456789', seamanBookNo: 'C.0123456' }, { status: 200, ok: true });
    }) as unknown as typeof fetch);

    expect(calledUrl).toBe(APPLY_SEAFARER_ENDPOINT);
    expect(JSON.parse(calledBody)).toEqual(payload);
    expect(outcome).toEqual({
      status: 'ok',
      receipt: { applicationId: 'app_123456789', seamanBookNo: 'C.0123456' },
    });
  });

  it('HAPPY_PATH: memakai nomor buku pelaut dari form bila API tidak mengembalikannya', async () => {
    const outcome = await submitSeafarerApplication(payload, (async () =>
      jsonResponse({ applicationId: 'app_1' }, { status: 200, ok: true })) as unknown as typeof fetch);

    expect(outcome.status).toBe('ok');
    expect(outcome.status === 'ok' && outcome.receipt.seamanBookNo).toBe('C.0123456');
  });

  it('VALIDATION_400: meneruskan pesan validasi dari API', async () => {
    const outcome = await submitSeafarerApplication(payload, (async () =>
      jsonResponse(
        { error: 'Nomor WhatsApp tidak valid.' },
        { status: 400, ok: false },
      )) as unknown as typeof fetch);

    expect(outcome).toEqual({ status: 'error', message: 'Nomor WhatsApp tidak valid.' });
  });

  it('VALIDATION_400: jatuh ke pesan umum bila body bukan JSON', async () => {
    const outcome = await submitSeafarerApplication(payload, (async () =>
      ({
        ok: false,
        status: 400,
        json: async () => {
          throw new Error('not json');
        },
      }) as unknown as Response) as unknown as typeof fetch);

    expect(outcome).toEqual({ status: 'error', message: FALLBACK_ERROR_MESSAGE });
  });

  it('RATE_LIMIT_429: menampilkan pesan batas pendaftaran dari API', async () => {
    const rateLimitMessage =
      'Terlalu banyak pendaftaran dari jaringan ini. Coba lagi beberapa menit lagi.';

    const outcome = await submitSeafarerApplication(payload, (async () =>
      jsonResponse({ error: rateLimitMessage }, { status: 429, ok: false })) as unknown as typeof fetch);

    expect(outcome).toEqual({ status: 'error', message: rateLimitMessage });
  });

  it('NETWORK_FAIL: mengembalikan pesan jaringan, bukan melempar error', async () => {
    const outcome = await submitSeafarerApplication(payload, (async () => {
      throw new TypeError('fetch failed');
    }) as unknown as typeof fetch);

    expect(outcome).toEqual({ status: 'error', message: NETWORK_ERROR_MESSAGE });
  });

  it('menolak respons 200 tanpa applicationId', async () => {
    const outcome = await submitSeafarerApplication(payload, (async () =>
      jsonResponse({ seamanBookNo: 'C.0123456' }, { status: 200, ok: true })) as unknown as typeof fetch);

    expect(outcome).toEqual({ status: 'error', message: FALLBACK_ERROR_MESSAGE });
  });
});