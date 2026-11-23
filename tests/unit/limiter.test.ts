import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { MEMORY_LIMITERS, RATE_LIMIT_BUCKETS } from '@/lib/security/rateLimit';
import { consume, limiterBackend, resetBucket } from '@/lib/security/limiter';
import { closeRedis, isRedisConfigured, probeRedis } from '@/lib/redis/client';

/**
 * Redis tidak dikonfigurasi di lingkungan uji, sehingga seluruh kasus di sini
 * menguji jalur fallback memori: batas tetap ditegakkan tanpa Redis.
 */
const originalRedisUrl = process.env.REDIS_URL;

beforeEach(() => {
  delete process.env.REDIS_URL;
  for (const bucket of Object.keys(MEMORY_LIMITERS) as Array<keyof typeof MEMORY_LIMITERS>) {
    MEMORY_LIMITERS[bucket].reset('');
  }
});

afterEach(async () => {
  await closeRedis();
  if (originalRedisUrl === undefined) {
    delete process.env.REDIS_URL;
  } else {
    process.env.REDIS_URL = originalRedisUrl;
  }
});

describe('limiter — deteksi konfigurasi', () => {
  it('melaporkan Redis tidak dikonfigurasi tanpa REDIS_URL', () => {
    expect(isRedisConfigured()).toBe(false);
    expect(limiterBackend()).toBe('memory');
  });

  it('probeRedis melaporkan disabled tanpa REDIS_URL', async () => {
    await expect(probeRedis()).resolves.toBe('disabled');
  });
});

describe('limiter — fallback memori', () => {
  it('mengizinkan percobaan sampai batas bucket lalu menolak', async () => {
    const { limit } = RATE_LIMIT_BUCKETS.login;
    const key = 'login:unit-test';

    for (let index = 0; index < limit; index += 1) {
      const result = await consume('login', key);
      expect(result.allowed).toBe(true);
      expect(result.backend).toBe('memory');
      expect(result.limit).toBe(limit);
    }

    const blocked = await consume('login', key);
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
  });

  it('memisahkan kuota antar kunci yang berbeda', async () => {
    const { limit } = RATE_LIMIT_BUCKETS['public-form'];
    for (let index = 0; index < limit; index += 1) {
      await consume('public-form', '198.51.100.7');
    }

    expect((await consume('public-form', '198.51.100.7')).allowed).toBe(false);
    expect((await consume('public-form', '203.0.113.9')).allowed).toBe(true);
  });

  it('memakai batas per bucket, bukan batas global', async () => {
    const loginLimit = RATE_LIMIT_BUCKETS.login.limit;
    for (let index = 0; index < loginLimit; index += 1) {
      await consume('login', 'shared-key');
    }

    expect((await consume('login', 'shared-key')).allowed).toBe(false);
    expect((await consume('vetting-decision', 'shared-key')).allowed).toBe(true);
  });

  it('resetBucket memulihkan kuota', async () => {
    const key = 'reset:unit-test';
    const { limit } = RATE_LIMIT_BUCKETS.login;
    for (let index = 0; index < limit; index += 1) {
      await consume('login', key);
    }
    expect((await consume('login', key)).allowed).toBe(false);

    await resetBucket('login', key);
    expect((await consume('login', key)).allowed).toBe(true);
  });

  it('mengembalikan remaining yang menurun setiap percobaan', async () => {
    const key = 'remaining:unit-test';
    const first = await consume('login', key);
    const second = await consume('login', key);

    expect(first.remaining).toBeGreaterThan(second.remaining);
    expect(second.remaining).toBe(first.remaining - 1);
    expect(first.retryAfterSeconds).toBe(0);
  });

  it('melaporkan retryAfterSeconds yang masuk akal saat diblokir', async () => {
    const key = 'retry-after:unit-test';
    const { limit, windowMs } = RATE_LIMIT_BUCKETS.login;
    for (let index = 0; index < limit; index += 1) {
      await consume('login', key);
    }

    const blocked = await consume('login', key);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
    expect(blocked.retryAfterSeconds).toBeLessThanOrEqual(Math.ceil(windowMs / 1000));
    expect(blocked.resetAt).toBeGreaterThan(Date.now());
  });
});