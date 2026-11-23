import { Queue, Worker, type Job } from 'bullmq';
import type { Redis } from 'ioredis';
import { createRedisConnection, isRedisConfigured } from '../redis/client';
import { evaluateApplicationMatrix } from '../ai/matrixEvaluation';
import { logger } from '../observability/logger';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * Haswakarya Crewing OS — Antrean Evaluasi Matriks
 * BullMQ dipakai bila `REDIS_URL` tersedia: job durable, ada retry, dan
 * konsumsi dapat dipisah ke container worker. Tanpa Redis, evaluasi dijalankan
 * inline agar skor lamaran tetap terisi (bukan menggantung selamanya).
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const MATRIX_QUEUE_NAME = 'hcos-matrix-evaluation';

export type QueueBackend = 'bullmq' | 'inline';
export type EnqueueOutcome = 'queued' | 'evaluated_inline' | 'failed_inline';

interface MatrixJobData {
  applicationId: string;
}

let queue: Queue<MatrixJobData> | null = null;
let worker: Worker<MatrixJobData> | null = null;
let queueConnection: Redis | null = null;
let workerConnection: Redis | null = null;

export function queueBackend(): QueueBackend {
  return isRedisConfigured() ? 'bullmq' : 'inline';
}

function getQueue(): Queue<MatrixJobData> | null {
  if (queue) return queue;
  if (!isRedisConfigured()) return null;

  queueConnection = createRedisConnection();
  if (!queueConnection) return null;

  queue = new Queue<MatrixJobData>(MATRIX_QUEUE_NAME, {
    connection: queueConnection,
    defaultJobOptions: {
      attempts: 3,
      backoff: { type: 'exponential', delay: 5_000 },
      removeOnComplete: { age: 24 * 3600, count: 500 },
      removeOnFail: { age: 7 * 24 * 3600 },
    },
  });
  return queue;
}

/**
 * Menjadwalkan evaluasi matriks untuk satu lamaran.
 * Tidak pernah melempar error: kegagalan antrean turun ke eksekusi inline.
 */
export async function enqueueMatrixEvaluation(applicationId: string): Promise<EnqueueOutcome> {
  const activeQueue = getQueue();

  if (activeQueue) {
    try {
      await activeQueue.add('evaluate', { applicationId }, { jobId: `matrix-${applicationId}` });
      return 'queued';
    } catch (error) {
      logger.warn('queue.enqueue_failed', {
        applicationId,
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }

  try {
    const outcome = await evaluateApplicationMatrix(applicationId);
    if (outcome.status === 'evaluated') {
      logger.info('matrix.evaluated_inline', {
        applicationId,
        score: outcome.score,
        recommendation: outcome.recommendation,
      });
    }
    return 'evaluated_inline';
  } catch (error) {
    logger.error('matrix.inline_failed', {
      applicationId,
      message: error instanceof Error ? error.message : String(error),
    });
    return 'failed_inline';
  }
}

async function processJob(job: Job<MatrixJobData>): Promise<void> {
  const outcome = await evaluateApplicationMatrix(job.data.applicationId);
  if (outcome.status === 'evaluated') {
    logger.info('matrix.evaluated', {
      applicationId: outcome.applicationId,
      score: outcome.score,
      recommendation: outcome.recommendation,
      jobId: job.id,
    });
  } else {
    logger.debug('matrix.skipped', { applicationId: outcome.applicationId, reason: outcome.reason });
  }
}

/** Menyalakan konsumen BullMQ. `null` bila Redis tidak dikonfigurasi. */
export function startMatrixQueueWorker(): Worker<MatrixJobData> | null {
  if (worker) return worker;
  if (!isRedisConfigured()) return null;

  workerConnection = createRedisConnection();
  if (!workerConnection) return null;

  worker = new Worker<MatrixJobData>(MATRIX_QUEUE_NAME, processJob, {
    connection: workerConnection,
    concurrency: 4,
  });

  worker.on('failed', (job, error) => {
    logger.error('matrix.job_failed', {
      jobId: job?.id ?? null,
      applicationId: job?.data.applicationId ?? null,
      message: error.message,
    });
  });

  logger.info('queue.worker_started', { queue: MATRIX_QUEUE_NAME });
  return worker;
}

/** Menutup worker & koneksi antrean (dipakai shutdown dan test). */
export async function stopMatrixQueueWorker(): Promise<void> {
  if (worker) {
    await worker.close();
    worker = null;
  }
  if (workerConnection) {
    workerConnection.disconnect();
    workerConnection = null;
  }
}

export async function closeMatrixQueue(): Promise<void> {
  await stopMatrixQueueWorker();
  if (queue) {
    await queue.close();
    queue = null;
  }
  if (queueConnection) {
    queueConnection.disconnect();
    queueConnection = null;
  }
}

export interface QueueSnapshot {
  backend: QueueBackend;
  waiting: number;
  active: number;
  failed: number;
}

/** Ringkasan antrean untuk health check; aman saat Redis mati. */
export async function snapshotQueue(): Promise<QueueSnapshot> {
  const activeQueue = getQueue();
  if (!activeQueue) return { backend: 'inline', waiting: 0, active: 0, failed: 0 };

  try {
    const counts = await activeQueue.getJobCounts('waiting', 'active', 'failed');
    return {
      backend: 'bullmq',
      waiting: counts.waiting ?? 0,
      active: counts.active ?? 0,
      failed: counts.failed ?? 0,
    };
  } catch {
    return { backend: 'bullmq', waiting: 0, active: 0, failed: 0 };
  }
}