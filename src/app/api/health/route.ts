import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { probeRedis } from '@/lib/redis/client';
import { limiterBackend } from '@/lib/security/limiter';
import { queueBackend } from '@/lib/queue/matrixQueue';
import { logger } from '@/lib/observability/logger';
import { withApiMetrics } from '@/lib/observability/withApiMetrics';

/**
 * Health check untuk load balancer / CI deploy gate.
 * - 200 `ok`      : seluruh dependensi wajib hidup.
 * - 503 `degraded`: database tidak dapat dihubungi.
 * Redis bersifat opsional: `disabled`/`down` tidak menurunkan status,
 * tetapi dilaporkan agar operator tahu backend limiter sedang aktif.
 */
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

async function probeDatabase(): Promise<'up' | 'down'> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return 'up';
  } catch {
    return 'down';
  }
}

async function handleGET() {
  const [db, redis] = await Promise.all([probeDatabase(), probeRedis()]);
  const healthy = db === 'up';

  const body = {
    status: healthy ? 'ok' : 'degraded',
    version: process.env.APP_VERSION ?? 'dev',
    revision: (process.env.GIT_SHA ?? '').slice(0, 12) || null,
    // Uptime proses Node sebenarnya, bukan uptime modul bundle route ini.
    uptimeSeconds: Math.round(process.uptime()),
    checks: {
      db,
      redis,
      rateLimiter: limiterBackend(),
      queue: queueBackend(),
    },
  };

  if (!healthy) {
    logger.error('health.degraded', {
      event_detail: 'database_unreachable',
      checks: body.checks,
    });
  }

  return NextResponse.json(body, {
    status: healthy ? 200 : 503,
    headers: { 'Cache-Control': 'no-store' },
  });
}

// Pembungkus metrics: status akhir hanya diketahui di dalam handler.
export const GET = withApiMetrics('/api/health', handleGET);
