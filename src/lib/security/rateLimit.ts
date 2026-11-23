/**
 * ═══════════════════════════════════════════════════════════════════════════
 * Haswakarya Crewing OS — In-Memory Rate Limiter (sliding window)
 * Dipakai untuk menahan endpoint publik (pendaftaran pelaut, inquiry manning,
 * login) dari banjir submission. Murni + clock injectable agar dapat diuji.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export interface RateLimitOptions {
  limit: number;
  windowMs: number;
  /** Jam yang bisa diinjeksi untuk pengujian. */
  now?: () => number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  limit: number;
  retryAfterSeconds: number;
  resetAt: number;
}

type Store = Map<string, number[]>;

const MAX_TRACKED_KEYS = 10_000;

export function createRateLimiter(options: RateLimitOptions) {
  const { limit, windowMs } = options;
  const now = options.now ?? (() => Date.now());
  const store: Store = new Map();

  function prune(key: string, timestamp: number): number[] {
    const hits = (store.get(key) ?? []).filter((hit) => timestamp - hit < windowMs);
    if (hits.length === 0) {
      store.delete(key);
    } else {
      store.set(key, hits);
    }
    return hits;
  }

  function check(key: string): RateLimitResult {
    const timestamp = now();
    const hits = prune(key, timestamp);

    if (hits.length >= limit) {
      const oldest = hits[0];
      const resetAt = oldest + windowMs;
      return {
        allowed: false,
        remaining: 0,
        limit,
        retryAfterSeconds: Math.max(1, Math.ceil((resetAt - timestamp) / 1000)),
        resetAt,
      };
    }

    return {
      allowed: true,
      remaining: limit - hits.length - 1,
      limit,
      retryAfterSeconds: 0,
      resetAt: timestamp + windowMs,
    };
  }

  function hit(key: string): RateLimitResult {
    const timestamp = now();
    const hits = prune(key, timestamp);

    if (hits.length >= limit) {
      const resetAt = hits[0] + windowMs;
      return {
        allowed: false,
        remaining: 0,
        limit,
        retryAfterSeconds: Math.max(1, Math.ceil((resetAt - timestamp) / 1000)),
        resetAt,
      };
    }

    hits.push(timestamp);
    if (hits.length === 1 && store.size >= MAX_TRACKED_KEYS) {
      // Lindungi memori proses: buang entri paling tua bila map membengkak.
      const oldestKey = store.keys().next().value;
      if (oldestKey !== undefined) store.delete(oldestKey);
    }
    store.set(key, hits);

    return {
      allowed: true,
      remaining: limit - hits.length,
      limit,
      retryAfterSeconds: 0,
      resetAt: timestamp + windowMs,
    };
  }

  function reset(key?: string): void {
    if (key === undefined) {
      store.clear();
      return;
    }
    store.delete(key);
  }

  function size(): number {
    return store.size;
  }

  return { check, hit, reset, size };
}

export type RateLimiter = ReturnType<typeof createRateLimiter>;

/** Konfigurasi setiap bucket rate limit — satu sumber kebenaran untuk
 *  backend memori maupun backend Redis. */
export const RATE_LIMIT_BUCKETS = {
  /** Formulir publik: maksimum 5 kiriman per 10 menit per identitas (IP). */
  'public-form': { limit: 5, windowMs: 10 * 60 * 1000 },
  /** Login: maksimum 10 percobaan per 5 menit per IP + email. */
  login: { limit: 10, windowMs: 5 * 60 * 1000 },
  /** Vetting shipowner: maksimum 20 keputusan per 10 menit per token. */
  'vetting-decision': { limit: 20, windowMs: 10 * 60 * 1000 },
  /**
   * Draf triage AI: maksimum 10 permintaan per jam per pengguna. Kuota gratis
   * provider hanya 50 permintaan/hari untuk seluruh akun, jadi bucket ini yang
   * menjaga agar satu staf tidak menghabiskannya.
   */
  'ai-triage': { limit: 10, windowMs: 60 * 60 * 1000 },
  /**
   * Narasi dossier vetting: bucket terpisah dari triage supaya satu staf yang
   * menyusun banyak dossier tidak menghabiskan kuota triage ATS.
   */
  'ai-dossier': { limit: 10, windowMs: 60 * 60 * 1000 },
  /**
   * Ganti sandi: maksimum 5 percobaan per 15 menit per pengguna. Batas ini
   * melindungi dari penebakan sandi lama lewat sesi yang sudah dicuri.
   */
  'password-change': { limit: 5, windowMs: 15 * 60 * 1000 },
} as const;

export type RateLimitBucket = keyof typeof RATE_LIMIT_BUCKETS;

/** Formulir publik: maksimum 5 kiriman per 10 menit per identitas (IP). */
export const publicFormLimiter = createRateLimiter(RATE_LIMIT_BUCKETS['public-form']);

/** Login: maksimum 10 percobaan per 5 menit per IP + email. */
export const loginLimiter = createRateLimiter(RATE_LIMIT_BUCKETS.login);

/** Vetting shipowner: maksimum 20 keputusan per 10 menit per token. */
export const vettingDecisionLimiter = createRateLimiter(RATE_LIMIT_BUCKETS['vetting-decision']);

/** Draf triage AI: maksimum 10 permintaan per jam per pengguna. */
export const aiTriageLimiter = createRateLimiter(RATE_LIMIT_BUCKETS['ai-triage']);

/** Narasi dossier vetting: maksimum 10 permintaan per jam per pengguna. */
export const aiDossierLimiter = createRateLimiter(RATE_LIMIT_BUCKETS['ai-dossier']);

/** Ganti sandi: maksimum 5 percobaan per 15 menit per pengguna. */
export const passwordChangeLimiter = createRateLimiter(RATE_LIMIT_BUCKETS['password-change']);

/** Limiter memori per bucket, dipakai sebagai fallback backend Redis. */
export const MEMORY_LIMITERS: Record<RateLimitBucket, RateLimiter> = {
  'public-form': publicFormLimiter,
  login: loginLimiter,
  'vetting-decision': vettingDecisionLimiter,
  'ai-triage': aiTriageLimiter,
  'ai-dossier': aiDossierLimiter,
  'password-change': passwordChangeLimiter,
};

/** Mengembalikan header HTTP standar untuk rate limit. */
export function rateLimitHeaders(result: RateLimitResult): Record<string, string> {
  const headers: Record<string, string> = {
    'X-RateLimit-Limit': String(result.limit),
    'X-RateLimit-Remaining': String(result.remaining),
  };
  if (!result.allowed) {
    headers['Retry-After'] = String(result.retryAfterSeconds);
  }
  return headers;
}
