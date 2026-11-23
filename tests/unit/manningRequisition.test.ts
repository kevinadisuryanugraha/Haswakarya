import { describe, expect, it } from 'vitest';
import {
  MANNING_FALLBACK_ERROR_MESSAGE,
  MANNING_INQUIRY_ENDPOINT,
  MANNING_NETWORK_ERROR_MESSAGE,
  VESSEL_OPTIONS,
  resolveVesselTypeParam,
  submitManningRequisition,
  type ManningRequisitionPayload,
} from '@/lib/public/manningRequisition';

const payload: ManningRequisitionPayload = {
  companyName: 'Samudera Shipping Lines',
  contactPerson: 'Capt. Michael Tan (Crew Manager)',
  workEmail: 'crewing@samudera.example',
  phoneWhatsApp: '+65 9123 4567',
  vesselName: 'MT Samudera Biru',
  imoNumber: '9412345',
  vesselType: 'Oil & Chemical Tanker (SIRE)',
  targetRanks: 'Top 4 Officers (Master / C/E / C/O / 2E)',
  joinPort: 'Batam',
  expectedJoiningDate: '2026-03-01',
  notes: 'Flag state: Panama Maritime Authority. Mobilization window: Within 14 – 30 Days.',
};

function jsonResponse(body: unknown, init: { status: number; ok: boolean }) {
  return {
    ok: init.ok,
    status: init.status,
    json: async () => body,
  } as unknown as Response;
}

describe('submitManningRequisition', () => {
  it('HAPPY_PATH: mengembalikan inquiryId saat API 201', async () => {
    let calledUrl = '';
    let calledBody = '';

    const outcome = await submitManningRequisition(payload, (async (url: string, init: RequestInit) => {
      calledUrl = String(url);
      calledBody = String(init.body);
      return jsonResponse({ success: true, inquiryId: 'inq_abc12345' }, { status: 201, ok: true });
    }) as unknown as typeof fetch);

    expect(calledUrl).toBe(MANNING_INQUIRY_ENDPOINT);
    expect(JSON.parse(calledBody)).toEqual(payload);
    expect(outcome).toEqual({ status: 'ok', receipt: { inquiryId: 'inq_abc12345' } });
  });

  it('VALIDASI: memakai pesan error zod dari API 400', async () => {
    const outcome = await submitManningRequisition(payload, (async () =>
      jsonResponse({ error: 'Nomor IMO harus 7 digit.' }, { status: 400, ok: false })) as unknown as typeof fetch);

    expect(outcome).toEqual({ status: 'error', message: 'Nomor IMO harus 7 digit.' });
  });

  it('RATE_LIMIT: meneruskan pesan 429 apa adanya', async () => {
    const outcome = await submitManningRequisition(payload, (async () =>
      jsonResponse(
        { error: 'Terlalu banyak permintaan dari jaringan ini. Coba lagi beberapa menit lagi.' },
        { status: 429, ok: false },
      )) as unknown as typeof fetch);

    expect(outcome.status).toBe('error');
    if (outcome.status === 'error') {
      expect(outcome.message).toContain('Terlalu banyak permintaan');
    }
  });

  it('JARINGAN: fetch melempar → pesan jaringan', async () => {
    const outcome = await submitManningRequisition(payload, (async () => {
      throw new Error('ECONNREFUSED');
    }) as unknown as typeof fetch);

    expect(outcome).toEqual({ status: 'error', message: MANNING_NETWORK_ERROR_MESSAGE });
  });

  it('BODY_BUKAN_JSON: 201 tanpa body JSON → fallback error', async () => {
    const outcome = await submitManningRequisition(payload, (async () =>
      ({
        ok: true,
        status: 201,
        json: async () => {
          throw new Error('unexpected token');
        },
      }) as unknown as Response) as unknown as typeof fetch);

    expect(outcome).toEqual({ status: 'error', message: MANNING_FALLBACK_ERROR_MESSAGE });
  });

  it('TANPA_INQUIRY_ID: 201 tetapi inquiryId kosong → fallback error (bukan receipt kosong)', async () => {
    const outcome = await submitManningRequisition(payload, (async () =>
      jsonResponse({ success: true, message: 'ok' }, { status: 201, ok: true })) as unknown as typeof fetch);

    expect(outcome).toEqual({ status: 'error', message: MANNING_FALLBACK_ERROR_MESSAGE });
  });

  it('ERROR_5xx: tanpa field error → fallback error', async () => {
    const outcome = await submitManningRequisition(payload, (async () =>
      jsonResponse({}, { status: 500, ok: false })) as unknown as typeof fetch);

    expect(outcome).toEqual({ status: 'error', message: MANNING_FALLBACK_ERROR_MESSAGE });
  });
});

describe('resolveVesselTypeParam', () => {
  it('memetakan id armada beranda ke opsi form', () => {
    expect(resolveVesselTypeParam('tanker')).toBe('Oil & Chemical Tanker (SIRE)');
    expect(resolveVesselTypeParam('bulk')).toBe('Dry Bulk Carrier (RightShip)');
    expect(resolveVesselTypeParam('container')).toBe('Container Vessel (Boxship)');
    expect(resolveVesselTypeParam('tug-barge')).toBe('Harbor & Ocean ASD Tugboat');
  });

  it('menerima label penuh tanpa peduli huruf besar-kecil', () => {
    expect(resolveVesselTypeParam('gas carrier (lpg / lng)')).toBe('Gas Carrier (LPG / LNG)');
  });

  it('mengembalikan undefined untuk nilai kosong atau asing', () => {
    expect(resolveVesselTypeParam(undefined)).toBeUndefined();
    expect(resolveVesselTypeParam(null)).toBeUndefined();
    expect(resolveVesselTypeParam('   ')).toBeUndefined();
    expect(resolveVesselTypeParam('submarine')).toBeUndefined();
  });

  it('setiap hasil pemetaan sah ada di VESSEL_OPTIONS', () => {
    for (const id of ['tanker', 'bulk', 'container', 'tug-barge', 'offshore', 'gas']) {
      const resolved = resolveVesselTypeParam(id);
      expect(resolved).toBeDefined();
      expect(VESSEL_OPTIONS).toContain(resolved);
    }
  });
});