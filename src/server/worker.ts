/**
 * ═══════════════════════════════════════════════════════════════════════════
 * Haswakarya Crewing OS — Background Maritime AI Worker
 * Dua mode:
 *   1. `REDIS_URL` ada  → konsumen BullMQ (job durable, retry, concurrency 4).
 *   2. `REDIS_URL` kosong → polling DB tiap 5 detik (mode pengembangan).
 * Semua log memakai logger JSON yang mem-redaksi PII.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { logger } from '../lib/observability/logger';
import { queueBackend, startMatrixQueueWorker, stopMatrixQueueWorker } from '../lib/queue/matrixQueue';
import {
  evaluateApplicationMatrix,
  findPendingApplicationId,
} from '../lib/ai/matrixEvaluation';
import { closeRedis } from '../lib/redis/client';

const POLL_INTERVAL_MS = 5_000;

let isRunning = true;

/** Mode polling: mengambil satu lamaran yang belum dinilai lalu mengevaluasi. */
export async function processSingleMaritimeJob(): Promise<boolean> {
  const applicationId = await findPendingApplicationId();
  if (!applicationId) return false;

  try {
    const outcome = await evaluateApplicationMatrix(applicationId);
    if (outcome.status === 'evaluated') {
      logger.info('matrix.evaluated', {
        applicationId: outcome.applicationId,
        score: outcome.score,
        recommendation: outcome.recommendation,
        mode: 'polling',
      });
    }
    return true;
  } catch (error) {
    logger.error('matrix.polling_failed', {
      applicationId,
      message: error instanceof Error ? error.message : String(error),
    });
    return false;
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Loop polling untuk lingkungan tanpa Redis. */
export async function runPollingLoop(): Promise<void> {
  logger.info('worker.started', { mode: 'polling', pollIntervalMs: POLL_INTERVAL_MS });

  while (isRunning) {
    try {
      const processed = await processSingleMaritimeJob();
      if (!processed) await sleep(POLL_INTERVAL_MS);
    } catch (error) {
      logger.error('worker.loop_error', {
        message: error instanceof Error ? error.message : String(error),
      });
      await sleep(POLL_INTERVAL_MS);
    }
  }
}

/**
 * Titik masuk worker. BullMQ bila Redis tersedia; selain itu polling.
 * Tidak pernah mengembalikan Promise yang selesai selama proses hidup.
 */
export async function startMaritimeWorker(): Promise<void> {
  if (queueBackend() === 'bullmq') {
    const consumer = startMatrixQueueWorker();
    if (consumer) {
      logger.info('worker.started', { mode: 'bullmq', concurrency: 4 });
      await new Promise<void>((resolve) => {
        const shutdown = () => resolve();
        process.once('SIGTERM', shutdown);
        process.once('SIGINT', shutdown);
      });
      await shutdownMaritimeWorker();
      return;
    }

    logger.warn('worker.queue_unavailable', { fallback: 'polling' });
  }

  await runPollingLoop();
}

/** Menghentikan worker dan menutup koneksi. */
export async function shutdownMaritimeWorker(): Promise<void> {
  isRunning = false;
  await stopMatrixQueueWorker();
  await closeRedis();
  logger.info('worker.stopped', {});
}

// Eksekusi bila dijalankan langsung lewat CLI.
if (process.argv[1]?.endsWith('worker.ts') || process.argv[1]?.endsWith('worker.js')) {
  startMaritimeWorker().catch((error: unknown) => {
    logger.error('worker.fatal', {
      message: error instanceof Error ? error.message : String(error),
    });
    process.exitCode = 1;
  });
}