/**
 * ═══════════════════════════════════════════════════════════════════════════
 * Haswakarya Crewing OS — Verifikator arsip backup
 *
 * Memeriksa manifest terbaru yang ditulis `scripts/backup.sh`:
 *   1. Bentuk manifest sesuai skema.
 *   2. Setiap artefak benar-benar ada di disk.
 *   3. Ukuran byte dan SHA-256 cocok (deteksi arsip rusak/terpotong).
 *   4. Arsip terbaru tidak lebih tua dari `--max-age-days`.
 *
 * Keluar 0 bila sehat, 1 bila ada kegagalan. Dipakai CI/cron:
 *   npm run backup:verify -- --dir /backups --max-age-days 2
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { createHash } from 'node:crypto';
import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { logger } from '../lib/observability/logger';
import {
  checkManifest,
  formatBytes,
  parseManifest,
  selectStaleStems,
  type BackupManifest,
} from '../lib/ops/backupManifest';

interface CliOptions {
  dir: string;
  maxAgeDays: number;
  json: boolean;
}

function parseArgs(argv: readonly string[]): CliOptions {
  const options: CliOptions = {
    dir: process.env.BACKUP_DIR ?? path.resolve('backups'),
    maxAgeDays: Number(process.env.BACKUP_MAX_AGE_DAYS ?? 2),
    json: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--dir') {
      options.dir = path.resolve(argv[++index] ?? options.dir);
    } else if (arg === '--max-age-days') {
      const value = Number(argv[++index]);
      if (Number.isFinite(value) && value > 0) options.maxAgeDays = value;
    } else if (arg === '--json') {
      options.json = true;
    } else if (arg === '--help' || arg === '-h') {
      console.log(
        'Pemakaian: backup:verify [--dir <folder>] [--max-age-days <n>] [--json]\n' +
          'Membaca manifest backup terbaru, menghitung ulang SHA-256, dan memastikan arsip tidak basi.'
      );
      process.exit(0);
    }
  }

  return options;
}

async function sha256File(filePath: string): Promise<string> {
  const buffer = await readFile(filePath);
  return createHash('sha256').update(buffer).digest('hex');
}

interface ArtifactCheck {
  name: string;
  status: 'ok' | 'missing' | 'size_mismatch' | 'checksum_mismatch';
  expectedBytes: number;
  actualBytes: number | null;
}

async function checkArtifacts(
  dir: string,
  manifest: BackupManifest
): Promise<ArtifactCheck[]> {
  const results: ArtifactCheck[] = [];

  for (const artifact of manifest.artifacts) {
    const filePath = path.join(dir, artifact.name);
    try {
      const info = await stat(filePath);
      if (info.size !== artifact.bytes) {
        results.push({
          name: artifact.name,
          status: 'size_mismatch',
          expectedBytes: artifact.bytes,
          actualBytes: info.size,
        });
        continue;
      }
      const digest = await sha256File(filePath);
      results.push({
        name: artifact.name,
        status: digest === artifact.sha256 ? 'ok' : 'checksum_mismatch',
        expectedBytes: artifact.bytes,
        actualBytes: info.size,
      });
    } catch {
      results.push({
        name: artifact.name,
        status: 'missing',
        expectedBytes: artifact.bytes,
        actualBytes: null,
      });
    }
  }

  return results;
}

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));
  const now = new Date();

  let files: string[];
  try {
    files = await readdir(options.dir);
  } catch (error) {
    logger.error('backup.verify_dir_missing', {
      dir: options.dir,
      message: error instanceof Error ? error.message : String(error),
    });
    process.exitCode = 1;
    return;
  }

  const manifests = files.filter((name) => name.endsWith('.manifest.json')).sort();
  const latest = manifests.at(-1);

  if (!latest) {
    logger.error('backup.verify_no_manifest', { dir: options.dir });
    process.exitCode = 1;
    return;
  }

  const raw = await readFile(path.join(options.dir, latest), 'utf8');
  const manifest = parseManifest(raw);

  if (!manifest) {
    logger.error('backup.verify_invalid_manifest', { file: latest });
    process.exitCode = 1;
    return;
  }

  const structural = checkManifest(manifest, {
    maxAgeDays: options.maxAgeDays,
    now,
  });
  const artifacts = await checkArtifacts(options.dir, manifest);
  const failedArtifacts = artifacts.filter((artifact) => artifact.status !== 'ok');

  const stems = manifests.map((name) => name.replace('.manifest.json', ''));
  const pruneCandidates = selectStaleStems(stems, manifest.retentionDays, now);

  const report = {
    dir: options.dir,
    manifest: latest,
    ok: structural.ok && failedArtifacts.length === 0,
    errors: structural.errors,
    warnings: structural.warnings,
    artifacts: artifacts.map((artifact) => ({
      ...artifact,
      expectedHuman: formatBytes(artifact.expectedBytes),
      actualHuman: artifact.actualBytes === null ? null : formatBytes(artifact.actualBytes),
    })),
    pruneCandidates,
  };

  if (options.json) {
    console.log(JSON.stringify(report, null, 2));
  } else if (report.ok) {
    logger.info('backup.verify_ok', {
      manifest: latest,
      database: manifest.database,
      tables: manifest.tables,
      artifacts: artifacts.length,
      pruneCandidates: pruneCandidates.length,
    });
    for (const artifact of artifacts) {
      console.log(`  ok ${artifact.name} (${formatBytes(artifact.expectedBytes)})`);
    }
    for (const warning of structural.warnings) console.log(`  ! ${warning}`);
  } else {
    logger.error('backup.verify_failed', {
      manifest: latest,
      errors: structural.errors,
      failedArtifacts,
    });
    for (const error of structural.errors) console.error(`  x ${error}`);
    for (const artifact of failedArtifacts) {
      console.error(`  x ${artifact.name}: ${artifact.status}`);
    }
  }

  if (!report.ok) process.exitCode = 1;
}

main().catch((error: unknown) => {
  logger.error('backup.verify_crashed', {
    message: error instanceof Error ? error.message : String(error),
  });
  process.exitCode = 1;
});