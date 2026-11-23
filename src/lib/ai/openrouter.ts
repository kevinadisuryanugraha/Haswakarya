/**
 * ═══════════════════════════════════════════════════════════════════════════
 * Haswakarya Crewing OS — Klien LLM (OpenRouter)
 *
 * Satu-satunya pintu keluar ke provider model. Tujuan modul ini bukan
 * "memanggil AI", melainkan memastikan kegagalan provider tidak pernah
 * merusak alur kerja portal:
 *
 * 1. Tanpa `OPENROUTER_API_KEY` modul berhenti sebelum jaringan disentuh.
 * 2. Timeout dijaga `AbortController`; timeout tidak di-retry (kuota gratis
 *    hanya 50 permintaan/hari).
 * 3. 429 dan 5xx di-retry sekali per model, lalu model berikutnya dicoba.
 *    Model gratis OpenRouter memakai kolam bersama; 429 dari provider hulu
 *    sering hilang hanya dengan berpindah model.
 * 4. `OPENROUTER_MODEL` menerima daftar dipisah koma, urut prioritas.
 * 5. Tidak ada log isi prompt — payload hanya agregat tanpa PII.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export type AiFailureReason =
  | 'disabled'
  | 'timeout'
  | 'rate_limited'
  | 'http_error'
  | 'invalid_response';

export interface AiMeta {
  model: string;
  durationMs: number;
  promptTokens?: number;
  completionTokens?: number;
}

export type AiResult =
  | { ok: true; json: unknown; meta: AiMeta }
  | { ok: false; reason: AiFailureReason; status?: number };

export interface JsonCompletionOptions {
  system: string;
  user: string;
  maxTokens?: number;
  temperature?: number;
  timeoutMs?: number;
  retryDelayMs?: number;
  fetchImpl?: typeof fetch;
  env?: NodeJS.ProcessEnv;
}

export const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

/**
 * Default konservatif: model gratis berukuran sedang dengan konteks besar.
 * Ganti lewat `OPENROUTER_MODEL` tanpa menyentuh kode.
 */
export const DEFAULT_OPENROUTER_MODEL =
  'particle-ai/particle-1:free,baidu/ernie-5.5-flash-preview:free,nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free';

/**
 * Model gratis sekarang hampir semuanya model penalaran: token habis untuk
 * "berpikir" sebelum menjawab. Batas 20 detik membuat mereka selalu gagal,
 * jadi default dinaikkan dan dapat diatur lewat env.
 */
const DEFAULT_TIMEOUT_MS = 40_000;
const DEFAULT_MAX_TOKENS = 1_500;
const RETRY_DELAY_MS = 900;

export function aiConfigured(env: NodeJS.ProcessEnv = process.env): boolean {
  return Boolean(env.OPENROUTER_API_KEY?.trim());
}

/** Daftar model urut prioritas; entri kosong dan duplikat dibuang. */
export function resolveModels(env: NodeJS.ProcessEnv = process.env): string[] {
  const raw = env.OPENROUTER_MODEL?.trim() || DEFAULT_OPENROUTER_MODEL;

  const models = raw
    .split(',')
    .map((model) => model.trim())
    .filter((model) => model.length > 0);

  return models.length > 0 ? [...new Set(models)] : [DEFAULT_OPENROUTER_MODEL.split(',')[0]];
}

export function resolveModel(env: NodeJS.ProcessEnv = process.env): string {
  return resolveModels(env)[0];
}

function readPositiveInt(value: string | undefined, fallback: number): number {
  const parsed = Number.parseInt(value ?? '', 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function readTimeoutMs(env: NodeJS.ProcessEnv = process.env): number {
  return readPositiveInt(env.OPENROUTER_TIMEOUT_MS, DEFAULT_TIMEOUT_MS);
}

export function readMaxTokens(env: NodeJS.ProcessEnv = process.env): number {
  return readPositiveInt(env.OPENROUTER_MAX_TOKENS, DEFAULT_MAX_TOKENS);
}

/**
 * Mengambil blok JSON pertama dari keluaran model. Model gratis sering
 * membungkus jawaban dengan pagar kode atau kalimat pengantar; parser harus
 * sabar, tetapi tetap menolak keluaran yang bukan objek.
 */
export function extractJsonBlock(content: string): unknown {
  const trimmed = content.trim().replace(/^```(?:json)?/i, '').replace(/```$/, '');
  const start = trimmed.indexOf('{');
  const end = trimmed.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) {
    throw new Error('Tidak ada objek JSON pada keluaran model.');
  }
  return JSON.parse(trimmed.slice(start, end + 1));
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Meminta satu jawaban JSON. Tidak pernah melempar error: seluruh kegagalan
 * diterjemahkan menjadi `{ ok: false, reason }` agar pemanggil dapat memakai
 * jalur deterministik tanpa `try/catch` tambahan.
 */
export async function requestJsonCompletion(
  options: JsonCompletionOptions
): Promise<AiResult> {
  const env = options.env ?? process.env;
  if (!aiConfigured(env)) {
    return { ok: false, reason: 'disabled' };
  }

  const models = resolveModels(env);
  const reasoningEffort = env.OPENROUTER_REASONING_EFFORT?.trim() || 'low';
  const fetchImpl = options.fetchImpl ?? fetch;
  const timeoutMs = options.timeoutMs ?? readTimeoutMs(env);
  const retryDelayMs = options.retryDelayMs ?? RETRY_DELAY_MS;
  const startedAt = Date.now();
  const appUrl =
    env.OPENROUTER_APP_URL?.trim() ||
    env.NEXT_PUBLIC_APP_URL?.trim() ||
    'https://haswakarya.com';

  let lastReason: AiFailureReason = 'http_error';
  let lastStatus: number | undefined;

  for (const model of models) {
    const body = JSON.stringify({
      model,
      temperature: options.temperature ?? 0.2,
      max_tokens: options.maxTokens ?? readMaxTokens(env),
      ...(reasoningEffort === 'off' ? {} : { reasoning: { effort: reasoningEffort } }),
      messages: [
        { role: 'system', content: options.system },
        { role: 'user', content: options.user },
      ],
    });

    for (let attempt = 0; attempt < 2; attempt += 1) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);

      try {
        const response = await fetchImpl(`${OPENROUTER_BASE_URL}/chat/completions`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${env.OPENROUTER_API_KEY?.trim()}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': appUrl,
            'X-Title': 'Haswakarya Crewing OS',
          },
          body,
          signal: controller.signal,
        });

        if (!response.ok) {
          lastStatus = response.status;
          lastReason = response.status === 429 ? 'rate_limited' : 'http_error';
          const retryable = response.status === 429 || response.status >= 500;
          if (retryable && attempt === 0) {
            clearTimeout(timer);
            await sleep(retryDelayMs);
            continue;
          }
          // Model ini menyerah; coba model berikutnya bila ada.
          break;
        }

        const payload = (await response.json()) as {
          choices?: Array<{ message?: { content?: string } }>;
          usage?: { prompt_tokens?: number; completion_tokens?: number };
        };
        const content = payload.choices?.[0]?.message?.content;
        if (typeof content !== 'string' || content.trim().length === 0) {
          lastReason = 'invalid_response';
          lastStatus = response.status;
          break;
        }

        let json: unknown;
        try {
          json = extractJsonBlock(content);
        } catch {
          lastReason = 'invalid_response';
          lastStatus = response.status;
          break;
        }

        return {
          ok: true,
          json,
          meta: {
            model,
            durationMs: Date.now() - startedAt,
            promptTokens: payload.usage?.prompt_tokens,
            completionTokens: payload.usage?.completion_tokens,
          },
        };
      } catch (error) {
        const aborted = error instanceof Error && error.name === 'AbortError';
        if (aborted) {
          return { ok: false, reason: 'timeout' };
        }
        lastReason = 'http_error';
        if (attempt === 0) {
          await sleep(retryDelayMs);
          continue;
        }
        break;
      } finally {
        clearTimeout(timer);
      }
    }
  }

  return { ok: false, reason: lastReason, status: lastStatus };
}