import { describe, expect, it } from 'vitest';
import { createRateLimiter, rateLimitHeaders } from '@/lib/security/rateLimit';

function makeLimiter(limit: number, windowMs: number, clock: { now: number }) {
  return createRateLimiter({ limit, windowMs, now: () => clock.now });
}

describe('Rate limiter — sliding window', () => {
  it('mengizinkan sampai batas lalu menolak', () => {
    const clock = { now: 1_000_000 };
    const limiter = makeLimiter(3, 60_000, clock);

    expect(limiter.hit('ip-1').allowed).toBe(true);
    expect(limiter.hit('ip-1').allowed).toBe(true);
    const third = limiter.hit('ip-1');
    expect(third.allowed).toBe(true);
    expect(third.remaining).toBe(0);

    const fourth = limiter.hit('ip-1');
    expect(fourth.allowed).toBe(false);
    expect(fourth.retryAfterSeconds).toBeGreaterThan(0);
  });

  it('memisahkan kuota per kunci', () => {
    const clock = { now: 0 };
    const limiter = makeLimiter(1, 60_000, clock);

    expect(limiter.hit('ip-a').allowed).toBe(true);
    expect(limiter.hit('ip-a').allowed).toBe(false);
    expect(limiter.hit('ip-b').allowed).toBe(true);
  });

  it('membuka kembali kuota setelah jendela lewat', () => {
    const clock = { now: 0 };
    const limiter = makeLimiter(2, 60_000, clock);

    limiter.hit('ip-1');
    limiter.hit('ip-1');
    expect(limiter.check('ip-1').allowed).toBe(false);

    clock.now = 60_001;
    expect(limiter.check('ip-1').allowed).toBe(true);
    expect(limiter.hit('ip-1').allowed).toBe(true);
  });

  it('check tidak menambah hit', () => {
    const clock = { now: 0 };
    const limiter = makeLimiter(1, 60_000, clock);

    limiter.check('ip-1');
    limiter.check('ip-1');
    limiter.check('ip-1');
    expect(limiter.hit('ip-1').allowed).toBe(true);
  });

  it('reset menghapus kuota', () => {
    const clock = { now: 0 };
    const limiter = makeLimiter(1, 60_000, clock);

    limiter.hit('ip-1');
    expect(limiter.check('ip-1').allowed).toBe(false);
    limiter.reset('ip-1');
    expect(limiter.check('ip-1').allowed).toBe(true);
  });

  it('mengirim header yang benar', () => {
    const clock = { now: 0 };
    const limiter = makeLimiter(1, 60_000, clock);

    const allowed = limiter.hit('ip-1');
    expect(rateLimitHeaders(allowed)).toEqual({
      'X-RateLimit-Limit': '1',
      'X-RateLimit-Remaining': '0',
    });

    const blocked = limiter.hit('ip-1');
    const headers = rateLimitHeaders(blocked);
    expect(headers['X-RateLimit-Remaining']).toBe('0');
    expect(Number(headers['Retry-After'])).toBeGreaterThan(0);
  });
});
