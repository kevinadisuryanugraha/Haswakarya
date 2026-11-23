import { z } from 'zod';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * Haswakarya Crewing OS — Kontrak manifest backup
 * Manifest ditulis `scripts/backup.sh` dan diperiksa ulang oleh
 * `npm run backup:verify` (`src/server/backupVerify.ts`).
 * Modul murni: tanpa filesystem, mudah diuji unit.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const backupArtifactSchema = z.object({
  name: z.string().min(1).max(200),
  bytes: z.number().int().nonnegative(),
  sha256: z
    .string()
    .regex(/^[a-f0-9]{64}$/, 'sha256 harus 64 karakter heksadesimal huruf kecil'),
});

export const backupManifestSchema = z.object({
  version: z.literal(1),
  stem: z.string().regex(/^hcos-\d{8}T\d{6}Z$/, 'stem harus berbentuk hcos-YYYYMMDDTHHMMSSZ'),
  createdAt: z.string().datetime({ offset: false }),
  database: z.string().min(1).max(120),
  serverVersion: z.string().min(1).max(40),
  clientVersion: z.string().min(1).max(40),
  tables: z.number().int().nonnegative(),
  retentionDays: z.number().int().positive().max(3650),
  artifacts: z.array(backupArtifactSchema).min(1),
});

export type BackupArtifact = z.infer<typeof backupArtifactSchema>;
export type BackupManifest = z.infer<typeof backupManifestSchema>;

/** Membaca manifest dari teks JSON; `null` bila tidak valid. */
export function parseManifest(raw: string): BackupManifest | null {
  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    return null;
  }
  const parsed = backupManifestSchema.safeParse(json);
  return parsed.success ? parsed.data : null;
}

/** Tanggal dari stem `hcos-YYYYMMDDTHHMMSSZ`; `null` bila bentuknya salah. */
export function parseStemDate(stem: string): Date | null {
  const match = /^hcos-(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/.exec(stem);
  if (!match) return null;

  const [, year, month, day, hour, minute, second] = match;
  const date = new Date(
    Date.UTC(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(hour),
      Number(minute),
      Number(second)
    )
  );
  return Number.isNaN(date.getTime()) ? null : date;
}

/** Umur arsip dalam hari (pecahan). */
export function manifestAgeDays(createdAt: string, now: Date): number | null {
  const created = new Date(createdAt);
  if (Number.isNaN(created.getTime())) return null;
  return (now.getTime() - created.getTime()) / 86_400_000;
}

/**
 * Memilih stem arsip yang melewati retensi (dan karenanya boleh dihapus).
 * Stem tanpa tanggal valid dilewati — lebih aman tidak menghapus apa pun.
 */
export function selectStaleStems(stems: readonly string[], retentionDays: number, now: Date): string[] {
  if (retentionDays <= 0) return [];
  return stems.filter((stem) => {
    const date = parseStemDate(stem);
    if (!date) return false;
    return (now.getTime() - date.getTime()) / 86_400_000 > retentionDays;
  });
}

export interface ManifestCheckOptions {
  /** Umur maksimum arsip terbaru sebelum dianggap basi. */
  maxAgeDays: number;
  now: Date;
}

export interface ManifestCheckResult {
  ok: boolean;
  errors: string[];
  warnings: string[];
}

/** Pemeriksaan isi manifest tanpa menyentuh disk. */
export function checkManifest(
  manifest: BackupManifest,
  options: ManifestCheckOptions
): ManifestCheckResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (manifest.tables < 1) errors.push('manifest.tables kosong: dump tidak berisi tabel');

  const age = manifestAgeDays(manifest.createdAt, options.now);
  if (age === null) {
    errors.push('manifest.createdAt tidak dapat diurai');
  } else if (age > options.maxAgeDays) {
    errors.push(
      `backup terbaru berumur ${age.toFixed(1)} hari, melebihi batas ${options.maxAgeDays} hari`
    );
  } else if (age < -1) {
    warnings.push('manifest.createdAt berada di masa depan (jam server tidak sinkron?)');
  }

  if (!manifest.artifacts.some((artifact) => artifact.name.endsWith('.dump'))) {
    errors.push('manifest tidak memuat arsip .dump');
  }

  const names = new Set<string>();
  for (const artifact of manifest.artifacts) {
    if (names.has(artifact.name)) errors.push(`artefak duplikat: ${artifact.name}`);
    names.add(artifact.name);
    if (artifact.bytes === 0) errors.push(`artefak kosong: ${artifact.name}`);
  }

  if (manifest.clientVersion !== manifest.serverVersion) {
    warnings.push(
      `versi pg_dump (${manifest.clientVersion}) berbeda dengan server (${manifest.serverVersion})`
    );
  }

  return { ok: errors.length === 0, errors, warnings };
}

/** Ukuran byte dalam bentuk yang mudah dibaca manusia. */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ['KB', 'MB', 'GB', 'TB'];
  let value = bytes / 1024;
  let index = 0;
  while (value >= 1024 && index < units.length - 1) {
    value /= 1024;
    index += 1;
  }
  return `${value.toFixed(1)} ${units[index]}`;
}