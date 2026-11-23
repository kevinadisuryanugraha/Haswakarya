import { describe, expect, it, vi } from 'vitest';
import {
  buildTriageFacts,
  fallbackTriageDraft,
  findUnsupportedNumbers,
  generateTriageDraft,
  triageDraftSchema,
  type TriageFacts,
  type TriageInput,
} from '@/lib/ai/triage';
import {
  DEFAULT_OPENROUTER_MODEL,
  extractJsonBlock,
  readMaxTokens,
  readTimeoutMs,
  requestJsonCompletion,
  resolveModels,
} from '@/lib/ai/openrouter';

const TEST_ENV = { OPENROUTER_API_KEY: 'test-key' } as unknown as NodeJS.ProcessEnv;

function input(overrides: Partial<TriageInput> = {}): TriageInput {
  return {
    fullName: 'Budi Santoso',
    email: 'budi@example.com',
    phone: '+62 812 3456 7890',
    seamanBookNo: 'H-1234567',
    rank: 'CHIEF_OFFICER',
    cocClass: 'ANT-II (Chief Mate)',
    marlinsPercent: 88,
    seaTimeMonths: 48,
    vesselTypeExperience: 'OIL_CHEMICAL_TANKER',
    readinessDate: null,
    stage: 'DOCUMENT_VERIFIED',
    certificates: [
      { name: 'ANT-II', category: 'COC', expired: false },
      { name: 'Basic Safety Training', category: 'STCW', expired: true },
    ],
    matrix: {
      score: 85,
      recommendation: 'APPROVED_WITH_CONDITIONS',
      sireCompliant: true,
      rightShipCompliant: false,
      marlinsCompliant: true,
      strengths: ['Jam layar tipe kapal kuat (48 bulan).'],
      gaps: ['Masa jabatan 8 bulan, belum memenuhi RightShip 12 bulan.'],
    },
    ...overrides,
  };
}

function facts(overrides: Partial<TriageInput> = {}): TriageFacts {
  return buildTriageFacts(input(overrides));
}

function chatResponse(content: string, status = 200): Response {
  return new Response(
    JSON.stringify({
      choices: [{ message: { content } }],
      usage: { prompt_tokens: 120, completion_tokens: 90 },
    }),
    { status, headers: { 'Content-Type': 'application/json' } }
  );
}

const VALID_DRAFT = {
  summary:
    'Perwira dengan 48 bulan jam layar tipe kapal memenuhi ambang SIRE 2.0, namun masa jabatan 8 bulan belum memenuhi RightShip 12 bulan.',
  strengths: ['Jam layar tipe kapal 48 bulan melampaui ambang minimum.'],
  gaps: ['Masa jabatan 8 bulan perlu konfirmasi bukti tambahan.'],
  interviewQuestions: ['Bagaimana Anda memenuhi syarat 12 bulan di jabatan?'],
  confidence: 'medium' as const,
};

describe('buildTriageFacts — pagar PII', () => {
  it('membuang nama, email, telepon, dan buku pelaut', () => {
    const payload = JSON.stringify(facts());

    expect(payload).not.toContain('Budi Santoso');
    expect(payload).not.toContain('budi@example.com');
    expect(payload).not.toContain('812 3456');
    expect(payload).not.toContain('H-1234567');
    expect(payload).not.toContain('@');
  });

  it('menyalin agregat yang dibutuhkan penilaian', () => {
    const result = facts();

    expect(result.rank).toBe('CHIEF_OFFICER');
    expect(result.cocClass).toBe('ANT-II (Chief Mate)');
    expect(result.marlinsPercent).toBe(88);
    expect(result.seaTimeMonths).toBe(48);
    expect(result.matrix.score).toBe(85);
    expect(result.certificates).toHaveLength(2);
    expect(result.certificates[1].expired).toBe(true);
  });

  it('tidak berbagi referensi array dengan masukan', () => {
    const source = input();
    const result = buildTriageFacts(source);

    result.matrix.gaps.push('tambahan');
    expect(source.matrix.gaps).toHaveLength(1);
  });
});

describe('triageDraftSchema', () => {
  it('menerima draf lengkap', () => {
    expect(triageDraftSchema.safeParse(VALID_DRAFT).success).toBe(true);
  });

  it('menolak daftar kekuatan kosong', () => {
    const parsed = triageDraftSchema.safeParse({ ...VALID_DRAFT, strengths: [] });
    expect(parsed.success).toBe(false);
  });

  it('menolak ringkasan terlalu pendek', () => {
    const parsed = triageDraftSchema.safeParse({ ...VALID_DRAFT, summary: 'Terlalu pendek.' });
    expect(parsed.success).toBe(false);
  });

  it('menolak nilai confidence di luar enum', () => {
    const parsed = triageDraftSchema.safeParse({ ...VALID_DRAFT, confidence: 'sangat yakin' });
    expect(parsed.success).toBe(false);
  });
});

describe('findUnsupportedNumbers — penjaga halusinasi kuantitatif', () => {
  it('menerima angka yang ada pada fakta', () => {
    const offenders = findUnsupportedNumbers(
      { ...VALID_DRAFT, summary: 'Skor matriks 85 dengan 48 bulan layar.' },
      facts()
    );
    expect(offenders).toEqual([]);
  });

  it('menolak angka karangan', () => {
    const offenders = findUnsupportedNumbers(
      { ...VALID_DRAFT, summary: 'Kandidat memiliki 120 bulan layar di 7 kapal.' },
      facts()
    );
    expect(offenders).toContain(120);
    expect(offenders).toContain(7);
  });

  it('mengizinkan angka 1 sampai 5 untuk penomoran', () => {
    const offenders = findUnsupportedNumbers(
      { ...VALID_DRAFT, interviewQuestions: ['1. Jelaskan 2 alasan 3 bulan terakhir.'] },
      facts()
    );
    expect(offenders).toEqual([]);
  });
});

describe('fallbackTriageDraft — deterministik', () => {
  it('memakai kekuatan dan gap dari mesin matriks', () => {
    const draft = fallbackTriageDraft(facts());

    expect(draft.summary).toContain('85/100');
    expect(draft.strengths[0]).toContain('48 bulan');
    expect(draft.gaps[0]).toContain('RightShip');
    expect(draft.interviewQuestions.length).toBeGreaterThan(0);
  });

  it('menurunkan keyakinan saat skor rendah', () => {
    const draft = fallbackTriageDraft(
      facts({
        matrix: {
          ...facts().matrix,
          score: 40,
          recommendation: 'MATRIX_NON_COMPLIANT',
          gaps: ['Defisit jam layar tipe kapal.'],
        },
      })
    );
    expect(draft.confidence).toBe('low');
  });

  it('menandai data kosong tanpa mengarang', () => {
    const draft = fallbackTriageDraft(
      facts({
        matrix: { ...facts().matrix, strengths: [], gaps: [] },
      })
    );
    expect(draft.strengths[0]).toContain('Belum ada');
    expect(draft.gaps[0]).toContain('Tidak ada gap');
  });
});

describe('generateTriageDraft — kegagalan provider tidak merusak fitur', () => {
  it('memakai fallback saat kunci belum diisi', async () => {
    const outcome = await generateTriageDraft(facts(), { env: {} as unknown as NodeJS.ProcessEnv });

    expect(outcome.source).toBe('fallback');
    expect(outcome.reason).toBe('disabled');
    expect(outcome.draft.summary).toContain('tanpa model');
  });

  it('memakai fallback saat provider membalas 429', async () => {
    const fetchImpl = vi.fn(async () => chatResponse('{}', 429)) as unknown as typeof fetch;
    const outcome = await generateTriageDraft(facts(), {
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
    const outcome = await generateTriageDraft(facts(), {
      env: TEST_ENV,
      fetchImpl,
      retryDelayMs: 0,
    });

    expect(outcome.source).toBe('fallback');
    expect(outcome.reason).toBe('rate_limited');
    expect(fetchImpl).toHaveBeenCalledTimes(resolveModels(TEST_ENV).length * 2);
  });

  it('memakai fallback saat keluaran bukan JSON', async () => {
    const fetchImpl = vi.fn(async () =>
      chatResponse('Maaf, saya tidak bisa membantu.')
    ) as unknown as typeof fetch;
    const outcome = await generateTriageDraft(facts(), { env: TEST_ENV, fetchImpl });

    expect(outcome.source).toBe('fallback');
    expect(outcome.reason).toBe('invalid_response');
  });

  it('memakai fallback saat model mengarang angka', async () => {
    const fetchImpl = vi.fn(async () =>
      chatResponse(
        JSON.stringify({
          ...VALID_DRAFT,
          summary: 'Kandidat memiliki 300 bulan layar dan 9 sertifikat.',
        })
      )
    ) as unknown as typeof fetch;
    const outcome = await generateTriageDraft(facts(), { env: TEST_ENV, fetchImpl });

    expect(outcome.source).toBe('fallback');
    expect(outcome.reason).toBe('unsupported_numbers');
  });

  it('menerima draf valid walau dibungkus pagar kode', async () => {    const fetchImpl = vi.fn(async () =>
      chatResponse('```json\n' + JSON.stringify(VALID_DRAFT) + '\n```')
    ) as unknown as typeof fetch;
    const outcome = await generateTriageDraft(facts(), { env: TEST_ENV, fetchImpl });

    expect(outcome.source).toBe('ai');
    expect(outcome.draft.summary).toContain('48 bulan');
    expect(outcome.meta?.model).toBe(resolveModels({} as unknown as NodeJS.ProcessEnv)[0]);
    expect(outcome.meta?.completionTokens).toBe(90);
  });
});

describe('requestJsonCompletion — ketahanan transport', () => {
  it('retry sekali setelah 5xx lalu berhasil', async () => {
    let calls = 0;
    const fetchImpl = vi.fn(async () => {
      calls += 1;
      return calls === 1 ? chatResponse('{}', 503) : chatResponse('{"ok":true}');
    }) as unknown as typeof fetch;

    const result = await requestJsonCompletion({
      system: 's',
      user: 'u',
      env: TEST_ENV,
      fetchImpl,
      retryDelayMs: 0,
    });

    expect(result.ok).toBe(true);
    expect(calls).toBe(2);
  });

  it('tidak melempar error saat koneksi putus', async () => {
    const fetchImpl = vi.fn(async () => {
      throw new Error('ECONNRESET');
    }) as unknown as typeof fetch;

    const result = await requestJsonCompletion({
      system: 's',
      user: 'u',
      env: TEST_ENV,
      fetchImpl,
      retryDelayMs: 0,
    });

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('http_error');
  });

  it('melaporkan timeout tanpa retry', async () => {
    const abortError = new Error('aborted');
    abortError.name = 'AbortError';
    const fetchImpl = vi.fn(async () => {
      throw abortError;
    }) as unknown as typeof fetch;

    const result = await requestJsonCompletion({
      system: 's',
      user: 'u',
      env: TEST_ENV,
      fetchImpl,
      timeoutMs: 50,
      retryDelayMs: 0,
    });

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('timeout');
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it('mengambil objek JSON meski ada kalimat pengantar', () => {
    expect(extractJsonBlock('Berikut hasilnya: {"a":1} semoga membantu')).toEqual({ a: 1 });
  });

  it('menolak keluaran tanpa objek JSON', () => {
    expect(() => extractJsonBlock('tidak ada data')).toThrow();
  });
});
describe('resolveModels — rantai model cadangan', () => {
  it('memakai rantai default saat env kosong', () => {
    const models = resolveModels({} as unknown as NodeJS.ProcessEnv);
    expect(models.length).toBeGreaterThan(1);
    expect(models[0]).toBe(DEFAULT_OPENROUTER_MODEL.split(',')[0]);
  });

  it('memecah daftar koma dan membuang duplikat', () => {
    const models = resolveModels({
      OPENROUTER_MODEL: 'a:free, b:free ,a:free,',
    } as unknown as NodeJS.ProcessEnv);
    expect(models).toEqual(['a:free', 'b:free']);
  });

  it('berpindah ke model kedua saat model pertama kena 429', async () => {
    const seen: string[] = [];
    const fetchImpl = vi.fn(async (_url: string, init: RequestInit) => {
      const body = JSON.parse(String(init.body)) as { model: string };
      seen.push(body.model);
      return body.model === 'lambat:free'
        ? chatResponse('{}', 429)
        : chatResponse(JSON.stringify({ ok: true }));
    }) as unknown as typeof fetch;

    const result = await requestJsonCompletion({
      system: 's',
      user: 'u',
      env: {
        OPENROUTER_API_KEY: 'k',
        OPENROUTER_MODEL: 'lambat:free,cepat:free',
      } as unknown as NodeJS.ProcessEnv,
      fetchImpl,
      retryDelayMs: 0,
    });

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.meta.model).toBe('cepat:free');
    expect(seen).toEqual(['lambat:free', 'lambat:free', 'cepat:free']);
  });
});

describe('parameter provider dari env', () => {
  it('memakai anggaran token dan timeout yang cukup untuk model penalaran', () => {
    expect(readMaxTokens({} as unknown as NodeJS.ProcessEnv)).toBe(1500);
    expect(readTimeoutMs({} as unknown as NodeJS.ProcessEnv)).toBe(40000);
    expect(
      readMaxTokens({ OPENROUTER_MAX_TOKENS: '900' } as unknown as NodeJS.ProcessEnv)
    ).toBe(900);
    expect(
      readTimeoutMs({ OPENROUTER_TIMEOUT_MS: 'nonsense' } as unknown as NodeJS.ProcessEnv)
    ).toBe(40000);
  });

  it('mengirim effort penalaran rendah dan dapat dimatikan', async () => {
    const bodies: Array<Record<string, unknown>> = [];
    const fetchImpl = vi.fn(async (_url: string, init: RequestInit) => {
      bodies.push(JSON.parse(String(init.body)) as Record<string, unknown>);
      return chatResponse('{"ok":true}');
    }) as unknown as typeof fetch;

    await requestJsonCompletion({ system: 's', user: 'u', env: TEST_ENV, fetchImpl });
    await requestJsonCompletion({
      system: 's',
      user: 'u',
      env: {
        OPENROUTER_API_KEY: 'k',
        OPENROUTER_REASONING_EFFORT: 'off',
      } as unknown as NodeJS.ProcessEnv,
      fetchImpl,
    });

    expect(bodies[0].reasoning).toEqual({ effort: 'low' });
    expect(bodies[0].max_tokens).toBe(1500);
    expect(bodies[1].reasoning).toBeUndefined();
  });
});
