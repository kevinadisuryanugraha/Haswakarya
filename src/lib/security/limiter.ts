import {
  MEMORY_LIMITERS,
  RATE_LIMIT_BUCKETS,
  type RateLimitBucket,
  type RateLimitResult,
} from './rateLimit';
import { getRedis } from '../redis/client';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * Haswakarya Crewing OS — Rate Limiter (Redis + fallback memori)
 * Sliding window disimpan di Redis agar kuota berlaku lintas replika/instance.
 * Bila Redis tidak tersedia, backend memori dipakai sehingga batas tetap ada.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export type LimiterBackend = 'redis' | 'memory';

export interface ConsumeResult extends RateLimitResult {
  backend: LimiterBackend;
}

/**
 * Lua menjaga operasi tetap atomik: prune → hitung → tambah → set TTL.
 * Mengembalikan {allowed(0|1), remaining, resetAt}.
 */
const SLIDING_WINDOW_SCRIPT = `
local key = KEYS[1]
local now = tonumber(ARGV[1])
local window = tonumber(ARGV[2])
local limit = tonumber(ARGV[3])
local member = ARGV[4]

redis.call('ZREMRANGEBYSCORE', key, 0, now - window)
local count = redis.call('ZCARD', key)

if count >= limit then
  local oldest = redis.call('ZRANGE', key, 0, 0, 'WITHSCORES')
  local resetAt = now + window
  if oldest[2] then
    resetAt = tonumber(oldest[2]) + window
  end
  return { 0, 0, resetAt }
end

redis.call('ZADD', key, now, member)
redis.call('PEXPIRE', key, window)
return { 1, limit - count - 1, now + window }
`;

function redisKey(bucket: RateLimitBucket, key: string): string {
  return `rl:${bucket}:${key}`;
}

function memoryFallback(bucket: RateLimitBucket, key: string): ConsumeResult {
  return { ...MEMORY_LIMITERS[bucket].hit(key), backend: 'memory' };
}

function toResult(
  raw: unknown,
  bucket: RateLimitBucket,
  now: number
): ConsumeResult | null {
  if (!Array.isArray(raw) || raw.length < 3) return null;

  const allowed = Number(raw[0]) === 1;
  const remaining = Number(raw[1]);
  const resetAt = Number(raw[2]);
  const { limit } = RATE_LIMIT_BUCKETS[bucket];

  if (!Number.isFinite(remaining) || !Number.isFinite(resetAt)) return null;

  return {
    allowed,
    remaining: Math.max(0, remaining),
    limit,
    retryAfterSeconds: allowed
      ? 0
      : Math.max(1, Math.ceil((resetAt - now) / 1000)),
    resetAt,
    backend: 'redis',
  };
}

/**
 * Mencatat satu percobaan untuk `bucket`/`key`.
 * Tidak pernah melempar error: kegagalan Redis jatuh ke backend memori.
 */
export async function consume(
  bucket: RateLimitBucket,
  key: string,
  now: number = Date.now()
): Promise<ConsumeResult> {
  const redis = getRedis();
  if (!redis) return memoryFallback(bucket, key);

  const { limit, windowMs } = RATE_LIMIT_BUCKETS[bucket];
  // Suffix acak menjaga dua hit pada milidetik yang sama tidak saling menimpa.
  const member = `${now}-${Math.random().toString(36).slice(2, 10)}`;

  try {
    const raw = await redis.eval(
      SLIDING_WINDOW_SCRIPT,
      1,
      redisKey(bucket, key),
      String(now),
      String(windowMs),
      String(limit),
      member
    );
    return toResult(raw, bucket, now) ?? memoryFallback(bucket, key);
  } catch {
    return memoryFallback(bucket, key);
  }
}

/** Mengosongkan kuota untuk satu kunci (mis. setelah login berhasil). */
export async function resetBucket(
  bucket: RateLimitBucket,
  key: string
): Promise<void> {
  MEMORY_LIMITERS[bucket].reset(key);

  const redis = getRedis();
  if (!redis) return;

  try {
    await redis.del(redisKey(bucket, key));
  } catch {
    // Kegagalan pembersihan tidak boleh menggagalkan alur pemanggil.
  }
}

/** Backend efektif saat ini; dipakai health check dan log. */
export function limiterBackend(): LimiterBackend {
  return getRedis() ? 'redis' : 'memory';
}