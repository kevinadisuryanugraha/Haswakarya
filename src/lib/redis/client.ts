import type { Redis } from 'ioredis';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * Haswakarya Crewing OS — Koneksi Redis Tunggal (lazy)
 * Redis dipakai untuk rate limiter lintas replika dan antrean BullMQ.
 * Bila `REDIS_URL` tidak disetel, seluruh fitur tetap berjalan dengan
 * fallback in-process (limiter memori, evaluasi matriks inline).
 * ═══════════════════════════════════════════════════════════════════════════
 */

type RedisFactory = (url: string, options: Record<string, unknown>) => Redis;

let client: Redis | null = null;
let initialised = false;
let lastErrorLoggedAt = 0;

function redisUrl(): string | null {
  const url = process.env.REDIS_URL?.trim();
  return url ? url : null;
}

export function isRedisConfigured(): boolean {
  return redisUrl() !== null;
}

/**
 * Membuat koneksi BullMQ. `maxRetriesPerRequest: null` wajib untuk worker
 * BullMQ; `enableOfflineQueue: false` membuat perintah gagal cepat saat Redis
 * mati sehingga limiter bisa langsung jatuh ke backend memori.
 */
export function createRedisConnection(): Redis | null {
  const url = redisUrl();
  if (!url) return null;

  // Import lazy: modul ini ikut ter-bundle di edge middleware-free runtime,
  // jadi ioredis hanya dimuat saat benar-benar dikonfigurasi.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const RedisCtor = require('ioredis') as unknown as new (
    url: string,
    options: Record<string, unknown>
  ) => Redis;

  const connection = new RedisCtor(url, {
    maxRetriesPerRequest: null,
    enableOfflineQueue: false,
    lazyConnect: false,
    connectTimeout: 3000,
  });

  connection.on('error', (error: Error) => {
    const now = Date.now();
    // Hindari banjir log saat Redis mati: catat maksimum sekali per menit.
    if (now - lastErrorLoggedAt > 60_000) {
      lastErrorLoggedAt = now;
      console.error(
        JSON.stringify({
          level: 'error',
          event: 'redis.connection_error',
          message: error.message,
          at: new Date(now).toISOString(),
        })
      );
    }
  });

  return connection;
}

/** Klien Redis bersama; `null` bila `REDIS_URL` tidak disetel. */
export function getRedis(): Redis | null {
  if (initialised) return client;
  initialised = true;
  client = createRedisConnection();
  return client;
}

export type RedisProbe = 'disabled' | 'up' | 'down';

/** Probe ringan untuk health check. Tidak melempar error. */
export async function probeRedis(): Promise<RedisProbe> {
  const redis = getRedis();
  if (!redis) return 'disabled';

  try {
    const pong = await redis.ping();
    return pong === 'PONG' ? 'up' : 'down';
  } catch {
    return 'down';
  }
}

/** Menutup koneksi (dipakai test dan shutdown worker). */
export async function closeRedis(): Promise<void> {
  if (!client) return;
  const current = client;
  client = null;
  initialised = false;
  try {
    await current.quit();
  } catch {
    current.disconnect();
  }
}