import { describe, expect, it } from 'vitest';
import {
  checkManifest,
  formatBytes,
  manifestAgeDays,
  parseManifest,
  parseStemDate,
  selectStaleStems,
  type BackupManifest,
} from '@/lib/ops/backupManifest';

const SHA = 'a'.repeat(64);
const NOW = new Date('2026-11-21T12:00:00.000Z');

function manifest(overrides: Partial<BackupManifest> = {}): BackupManifest {
  return {
    version: 1,
    stem: 'hcos-20261121T030000Z',
    createdAt: '2026-11-21T03:00:00Z',
    database: 'haswakarya_db',
    serverVersion: '16.4',
    clientVersion: '16.4',
    tables: 24,
    retentionDays: 14,
    artifacts: [{ name: 'hcos-20261121T030000Z.dump', bytes: 1_048_576, sha256: SHA }],
    ...overrides,
  };
}

function rawManifest(overrides: Record<string, unknown> = {}): string {
  return JSON.stringify({ ...manifest(), ...overrides });
}

describe('parseManifest', () => {
  it('menerima manifest lengkap', () => {
    const parsed = parseManifest(rawManifest());
    expect(parsed).not.toBeNull();
    expect(parsed?.database).toBe('haswakarya_db');
    expect(parsed?.artifacts).toHaveLength(1);
  });

  it('menerima manifest dengan arsip dump + vault', () => {
    const parsed = parseManifest(
      rawManifest({
        artifacts: [
          { name: 'hcos-20261121T030000Z.dump', bytes: 100, sha256: SHA },
          { name: 'hcos-20261121T030000Z-vault.tar.gz', bytes: 20, sha256: 'b'.repeat(64) },
        ],
      })
    );
    expect(parsed?.artifacts).toHaveLength(2);
  });

  it('menolak JSON rusak', () => {
    expect(parseManifest('{bukan json')).toBeNull();
  });

  it('menolak versi manifest asing', () => {
    expect(parseManifest(rawManifest({ version: 2 }))).toBeNull();
  });

  it('menolak checksum bukan heksadesimal 64 karakter', () => {
    expect(
      parseManifest(rawManifest({ artifacts: [{ name: 'x.dump', bytes: 1, sha256: 'XYZ' }] }))
    ).toBeNull();
  });

  it('menolak stem dengan bentuk salah', () => {
    expect(parseManifest(rawManifest({ stem: 'backup-2026' }))).toBeNull();
  });

  it('menolak daftar artefak kosong', () => {
    expect(parseManifest(rawManifest({ artifacts: [] }))).toBeNull();
  });
});

describe('parseStemDate', () => {
  it('mengurai stem menjadi UTC', () => {
    const date = parseStemDate('hcos-20261121T030000Z');
    expect(date?.toISOString()).toBe('2026-11-21T03:00:00.000Z');
  });

  it('mengembalikan null untuk bentuk lain', () => {
    expect(parseStemDate('hcos-2026-11-21.dump')).toBeNull();
    expect(parseStemDate('lain-20261121T030000Z')).toBeNull();
  });
});

describe('manifestAgeDays', () => {
  it('menghitung umur pecahan hari', () => {
    expect(manifestAgeDays('2026-11-21T00:00:00Z', NOW)).toBeCloseTo(0.5, 3);
  });

  it('mengembalikan null untuk tanggal tidak valid', () => {
    expect(manifestAgeDays('kemarin', NOW)).toBeNull();
  });
});

describe('selectStaleStems', () => {
  it('memilih hanya stem yang melewati retensi', () => {
    const stems = ['hcos-20261101T000000Z', 'hcos-20261120T000000Z', 'hcos-20261121T000000Z'];
    expect(selectStaleStems(stems, 14, NOW)).toEqual(['hcos-20261101T000000Z']);
  });

  it('melewati stem tanpa tanggal valid', () => {
    expect(selectStaleStems(['hcos-rusak', 'manual-backup'], 1, NOW)).toEqual([]);
  });

  it('tidak menghapus apa pun saat retensi nol', () => {
    expect(selectStaleStems(['hcos-20200101T000000Z'], 0, NOW)).toEqual([]);
  });
});

describe('checkManifest', () => {
  it('lolos untuk arsip segar dengan tabel', () => {
    const result = checkManifest(manifest(), { maxAgeDays: 2, now: NOW });
    expect(result.ok).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('menolak backup basi', () => {
    const result = checkManifest(manifest({ createdAt: '2026-11-01T00:00:00Z' }), {
      maxAgeDays: 2,
      now: NOW,
    });
    expect(result.ok).toBe(false);
    expect(result.errors.join(' ')).toContain('melebihi batas');
  });

  it('menolak dump tanpa tabel', () => {
    const result = checkManifest(manifest({ tables: 0 }), { maxAgeDays: 2, now: NOW });
    expect(result.ok).toBe(false);
    expect(result.errors.join(' ')).toContain('tidak berisi tabel');
  });

  it('menolak manifest tanpa artefak .dump', () => {
    const result = checkManifest(
      manifest({ artifacts: [{ name: 'hcos-20261121T030000Z-vault.tar.gz', bytes: 1, sha256: SHA }] }),
      { maxAgeDays: 2, now: NOW }
    );
    expect(result.ok).toBe(false);
    expect(result.errors.join(' ')).toContain('.dump');
  });

  it('menolak artefak duplikat dan artefak kosong', () => {
    const result = checkManifest(
      manifest({
        artifacts: [
          { name: 'a.dump', bytes: 0, sha256: SHA },
          { name: 'a.dump', bytes: 10, sha256: SHA },
        ],
      }),
      { maxAgeDays: 2, now: NOW }
    );
    expect(result.ok).toBe(false);
    expect(result.errors.join(' ')).toContain('duplikat');
    expect(result.errors.join(' ')).toContain('kosong');
  });

  it('memberi peringatan bila versi pg_dump berbeda dari server', () => {
    const result = checkManifest(manifest({ clientVersion: '14.5' }), {
      maxAgeDays: 2,
      now: NOW,
    });
    expect(result.ok).toBe(true);
    expect(result.warnings.join(' ')).toContain('berbeda');
  });

  it('memberi peringatan untuk tanggal di masa depan', () => {
    const result = checkManifest(manifest({ createdAt: '2026-11-25T00:00:00Z' }), {
      maxAgeDays: 2,
      now: NOW,
    });
    expect(result.warnings.join(' ')).toContain('masa depan');
  });
});

describe('formatBytes', () => {
  it('menampilkan satuan yang sesuai', () => {
    expect(formatBytes(512)).toBe('512 B');
    expect(formatBytes(2048)).toBe('2.0 KB');
    expect(formatBytes(1024 * 1024 * 3)).toBe('3.0 MB');
  });
});