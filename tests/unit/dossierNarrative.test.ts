import { describe, expect, it, vi } from 'vitest';
import {
  DOSSIER_SYSTEM_PROMPT,
  buildDossierNarrativeFacts,
  dossierNarrativeSchema,
  fallbackDossierNarrative,
  generateDossierNarrative,
  type DossierNarrativeInput,
} from '@/lib/ai/dossierNarrative';
import { resolveModels } from '@/lib/ai/openrouter';

const TEST_ENV = { OPENROUTER_API_KEY: 'test-key' } as unknown as NodeJS.ProcessEnv;

function input(overrides: Partial<DossierNarrativeInput> = {}): DossierNarrativeInput {
  return {
    rank: 'CHIEF_OFFICER',
    targetVesselType: 'OIL_CHEMICAL_TANKER',
    totalSeaTimeYears: 9.4,
    tankerSeaTimeYears: 6.1,
    seaTimeRecordCount: 4,
    matrixScore: 82,
    recommendation: 'APPROVED_WITH_CONDITIONS',
    sire2Compliant: true,
    rightShipCompliant: false,
    marlinsScore: 86,
    strengths: ['Jam layar tanker kuat.'],
    complianceGaps: ['Masa jabatan 8 bulan belum memenuhi RightShip 12 bulan.'],
    certificates: [
      { name: 'ANT-II', category: 'COC', expired: false, verified: true },
      { name: 'Advanced Fire Fighting', category: 'STCW', expired: true, verified: false },
    ],
    decision: 'APPROVED_WITH_CONDITIONS',
    ...overrides,
  };
}

function facts(overrides: Partial<DossierNarrativeInput> = {}) {
  return buildDossierNarrativeFacts(input(overrides));
}

function chatResponse(content: string, status = 200): Response {
  return new Response(
    JSON.stringify({
      choices: [{ message: { content } }],
      usage: { prompt_tokens: 210, completion_tokens: 130 },
    }),
    { status, headers: { 'Content-Type': 'application/json' } }
  );
}

const VALID_NARRATIVE = {
  summary:
    'Perwira dengan 9,4 tahun jam layar dan 6,1 tahun pada tanker memenuhi ambang SIRE 2.0, dengan catatan masa jabatan 8 bulan pada RightShip.',
  strengths: ['Jam layar tanker 6,1 tahun melampaui ambang matriks.'],
  gaps: ['Masa jabatan 8 bulan perlu bukti tambahan untuk RightShip.'],
  confidence: 'medium' as const,
};

describe('buildDossierNarrativeFacts — pagar PII', () => {
  it('tidak memuat identitas pelaut apa pun', () => {
    const payload = JSON.stringify(facts());
    expect(payload).not.toContain('@');
    expect(payload).not.toContain('Budi');
    expect(payload).not.toMatch(/seamanBook|passport|sid/i);
  });

  it('menyalin agregat yang dibutuhkan narasi', () => {
    const result = facts();
    expect(result.rank).toBe('CHIEF_OFFICER');
    expect(result.totalSeaTimeYears).toBe(9.4);
    expect(result.tankerSeaTimeYears).toBe(6.1);
    expect(result.matrixScore).toBe(82);
    expect(result.certificates).toHaveLength(2);
    expect(result.certificates[1].expired).toBe(true);
    expect(result.decision).toBe('APPROVED_WITH_CONDITIONS');
  });

  it('tidak berbagi referensi array dengan masukan', () => {
    const source = input();
    const result = buildDossierNarrativeFacts(source);

    result.complianceGaps.push('tambahan');
    result.certificates[0].name = 'berubah';

    expect(source.complianceGaps).toHaveLength(1);
    expect(source.certificates?.[0].name).toBe('ANT-II');
  });

  it('menormalkan field opsional yang tidak diisi', () => {
    const result = buildDossierNarrativeFacts({
      rank: 'ABLE_SEAMAN',
      totalSeaTimeYears: 2,
      tankerSeaTimeYears: 0,
      seaTimeRecordCount: 1,
      matrixScore: 70,
      recommendation: 'APPROVED_WITH_CONDITIONS',
      sire2Compliant: true,
      rightShipCompliant: true,
      decision: 'PENDING',
    });

    expect(result.targetVesselType).toBeNull();
    expect(result.marlinsScore).toBeNull();
    expect(result.strengths).toEqual([]);
    expect(result.certificates).toEqual([]);
  });
});

describe('dossierNarrativeSchema', () => {
  it('menerima narasi lengkap', () => {
    expect(dossierNarrativeSchema.safeParse(VALID_NARRATIVE).success).toBe(true);
  });

  it('menolak daftar kekuatan kosong', () => {
    expect(dossierNarrativeSchema.safeParse({ ...VALID_NARRATIVE, strengths: [] }).success).toBe(
      false
    );
  });

  it('menolak ringkasan di atas 800 karakter', () => {
    const tooLong = 'a'.repeat(801);
    expect(dossierNarrativeSchema.safeParse({ ...VALID_NARRATIVE, summary: tooLong }).success).toBe(
      false
    );
  });
});

describe('fallbackDossierNarrative', () => {
  it('menyebut sumber deterministik dan tidak mengarang keputusan', () => {
    const narrative = fallbackDossierNarrative(facts());
    expect(narrative.summary).toContain('tanpa model');
    expect(narrative.summary).toContain('82');
    expect(narrative.summary).toContain('APPROVED_WITH_CONDITIONS');
    expect(narrative.confidence).toBe('medium');
  });

  it('menghitung sertifikat kedaluwarsa', () => {
    const narrative = fallbackDossierNarrative(facts());
    expect(narrative.summary).toContain('1 sertifikat tercatat kedaluwarsa');
  });

  it('memakai kalimat aman saat tidak ada gap dan sertifikat', () => {
    const narrative = fallbackDossierNarrative(
      facts({ complianceGaps: [], strengths: [], certificates: [], matrixScore: 91 })
    );
    expect(narrative.gaps[0]).toContain('Tidak ada gap');
    expect(narrative.strengths[0]).toContain('Belum ada');
    expect(narrative.confidence).toBe('high');
  });
});

describe('generateDossierNarrative — kegagalan provider tidak merusak dossier', () => {
  it('memakai fallback saat kunci belum diisi', async () => {
    const outcome = await generateDossierNarrative(facts(), {
      env: {} as unknown as NodeJS.ProcessEnv,
    });
    expect(outcome.source).toBe('fallback');
    expect(outcome.reason).toBe('disabled');
  });

  it('memakai fallback saat provider membalas 429', async () => {
    const fetchImpl = vi.fn(async () => chatResponse('{}', 429)) as unknown as typeof fetch;
    const outcome = await generateDossierNarrative(facts(), {
      env: { OPENROUTER_API_KEY: 'k', OPENROUTER_MODEL: 'satu:free' } as unknown as NodeJS.ProcessEnv,
      fetchImpl,
      retryDelayMs: 0,
    });

    expect(outcome.source).toBe('fallback');
    expect(outcome.reason).toBe('rate_limited');
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it('mencoba seluruh rantai model sebelum menyerah', async () => {
    const fetchImpl = vi.fn(async () => chatResponse('{}', 429)) as unknown as typeof fetch;
    const outcome = await generateDossierNarrative(facts(), {
      env: TEST_ENV,
      fetchImpl,
      retryDelayMs: 0,
    });

    expect(outcome.source).toBe('fallback');
    expect(fetchImpl).toHaveBeenCalledTimes(resolveModels(TEST_ENV).length * 2);
  });

  it('memakai fallback saat keluaran bukan JSON', async () => {
    const fetchImpl = vi.fn(async () =>
      chatResponse('Maaf, tidak bisa membantu.')
    ) as unknown as typeof fetch;
    const outcome = await generateDossierNarrative(facts(), { env: TEST_ENV, fetchImpl });

    expect(outcome.source).toBe('fallback');
    expect(outcome.reason).toBe('invalid_response');
  });

  it('memakai fallback saat model mengarang angka', async () => {
    const fetchImpl = vi.fn(async () =>
      chatResponse(
        JSON.stringify({
          ...VALID_NARRATIVE,
          summary: 'Kandidat memiliki 240 bulan layar dan 17 sertifikat tambahan.',
        })
      )
    ) as unknown as typeof fetch;
    const outcome = await generateDossierNarrative(facts(), { env: TEST_ENV, fetchImpl });

    expect(outcome.source).toBe('fallback');
    expect(outcome.reason).toBe('unsupported_numbers');
  });

  it('menerima narasi valid dan melaporkan model yang menjawab', async () => {
    const fetchImpl = vi.fn(async () =>
      chatResponse(JSON.stringify(VALID_NARRATIVE))
    ) as unknown as typeof fetch;
    const outcome = await generateDossierNarrative(facts(), { env: TEST_ENV, fetchImpl });

    expect(outcome.source).toBe('ai');
    expect(outcome.narrative.summary).toContain('9,4 tahun');
    expect(outcome.meta?.model).toBe(resolveModels(TEST_ENV)[0]);
    expect(outcome.meta?.completionTokens).toBe(130);
  });

  it('prompt sistem melarang menyebut nama dan mengubah skor', () => {
    expect(DOSSIER_SYSTEM_PROMPT).toContain('Jangan menyebut nama orang');
    expect(DOSSIER_SYSTEM_PROMPT).toContain('Jangan mengubah skor');
  });

  it('mengirim fakta agregat, bukan identitas, ke provider', async () => {
    const spy = vi.fn(async () => chatResponse(JSON.stringify(VALID_NARRATIVE)));

    await generateDossierNarrative(facts(), {
      env: TEST_ENV,
      fetchImpl: spy as unknown as typeof fetch,
    });

    const serialized = String((spy.mock.calls[0] as unknown as [string, RequestInit])[1].body);
    expect(serialized).not.toContain('seamanBookNo');
    expect(serialized).not.toContain('passportNo');
    expect(serialized).not.toContain('fullName');
  });
});