import fs from 'fs';
import os from 'os';
import path from 'path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import {
  MAX_FILE_SIZE_BYTES,
  VaultError,
  readMaritimeDocument,
  resolveVaultPath,
  sanitizeOriginalName,
  sanitizeSubFolder,
  saveMaritimeDocument,
  sniffMimeType,
  verifyDocumentIntegrity,
} from '@/lib/storage/vault';

const PDF_BYTES = Buffer.concat([
  Buffer.from('%PDF-1.7\n'),
  Buffer.from('Haswakarya test document\n'),
]);

let tmpRoot = '';

beforeAll(() => {
  tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'hcos-vault-'));
  process.env.VAULT_STORAGE_PATH = tmpRoot;
});

afterAll(() => {
  delete process.env.VAULT_STORAGE_PATH;
  fs.rmSync(tmpRoot, { recursive: true, force: true });
});

describe('sniffMimeType', () => {
  it('mengenali PDF dari magic bytes', () => {
    expect(sniffMimeType(PDF_BYTES)).toBe('application/pdf');
  });

  it('mengenali PNG', () => {
    const png = Buffer.concat([
      Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
      Buffer.alloc(8),
    ]);
    expect(sniffMimeType(png)).toBe('image/png');
  });

  it('mengenali JPEG', () => {
    const jpeg = Buffer.concat([Buffer.from([0xff, 0xd8, 0xff, 0xe0]), Buffer.alloc(12)]);
    expect(sniffMimeType(jpeg)).toBe('image/jpeg');
  });

  it('mengenali WebP', () => {
    const webp = Buffer.concat([
      Buffer.from('RIFF'),
      Buffer.from([0x20, 0x00, 0x00, 0x00]),
      Buffer.from('WEBPVP8 '),
    ]);
    expect(sniffMimeType(webp)).toBe('image/webp');
  });

  it('menolak HTML dan berkas terlalu pendek', () => {
    expect(sniffMimeType(Buffer.from('<html><script>alert(1)</script></html>'))).toBeNull();
    expect(sniffMimeType(Buffer.from('%PDF'))).toBeNull();
    expect(sniffMimeType(Buffer.alloc(0))).toBeNull();
  });
});

describe('resolveVaultPath', () => {
  it('menerima path relatif normal', () => {
    const resolved = resolveVaultPath('documents/certs/abc.pdf');
    expect(resolved).toBe(path.join(tmpRoot, 'documents', 'certs', 'abc.pdf'));
  });

  it('menolak traversal dengan ..', () => {
    expect(() => resolveVaultPath('../etc/passwd')).toThrow(VaultError);
    expect(() => resolveVaultPath('documents/../../secret.pdf')).toThrow(VaultError);
    expect(() => resolveVaultPath('..')).toThrow(VaultError);
  });

  it('menolak path absolut dan drive letter', () => {
    expect(() => resolveVaultPath('/etc/passwd')).toThrow(VaultError);
    expect(() => resolveVaultPath('C:\\Windows\\System32\\config')).toThrow(VaultError);
  });

  it('menolak pemisah Windows dan null byte', () => {
    expect(() => resolveVaultPath('documents\\certs\\abc.pdf')).toThrow(VaultError);
    expect(() => resolveVaultPath('documents/abc\0.pdf')).toThrow(VaultError);
  });

  it('menolak path kosong', () => {
    expect(() => resolveVaultPath('')).toThrow(VaultError);
    expect(() => resolveVaultPath('   ')).toThrow(VaultError);
  });
});

describe('sanitizeSubFolder', () => {
  it('mengizinkan subfolder beraksara aman', () => {
    expect(sanitizeSubFolder('certs/123e4567-e89b-12d3-a456-426614174000')).toBe(
      'certs/123e4567-e89b-12d3-a456-426614174000'
    );
  });

  it('memakai "general" untuk nilai kosong', () => {
    expect(sanitizeSubFolder('')).toBe('general');
    expect(sanitizeSubFolder('///')).toBe('general');
  });

  it('menolak traversal dan aksara aneh', () => {
    expect(() => sanitizeSubFolder('../../etc')).toThrow(VaultError);
    expect(() => sanitizeSubFolder('certs baru')).toThrow(VaultError);
    expect(() => sanitizeSubFolder('certs/./x')).toThrow(VaultError);
  });
});

describe('sanitizeOriginalName', () => {
  it('membuang pemisah path dan karakter kendali', () => {
    expect(sanitizeOriginalName('../../etc/passwd')).toBe('etc passwd');
    expect(sanitizeOriginalName('sertif\nbaru.pdf')).toBe('sertif baru.pdf');
  });

  it('memakai fallback untuk nama kosong', () => {
    expect(sanitizeOriginalName('')).toBe('dokumen');
    expect(sanitizeOriginalName(null)).toBe('dokumen');
  });

  it('memotong nama yang terlalu panjang', () => {
    expect(sanitizeOriginalName('a'.repeat(200)).length).toBe(120);
  });
});

describe('saveMaritimeDocument', () => {
  it('menyimpan berkas dengan path relatif dan checksum SHA-256', async () => {
    const saved = await saveMaritimeDocument(
      PDF_BYTES,
      'sertifikat COP.pdf',
      'application/pdf',
      'certs/seafarer-1'
    );

    expect(saved.mimeType).toBe('application/pdf');
    expect(saved.sizeBytes).toBe(PDF_BYTES.length);
    expect(saved.checksumSha256).toMatch(/^[a-f0-9]{64}$/);
    expect(saved.storedPath.startsWith('documents/certs/seafarer-1/')).toBe(true);
    expect(fs.existsSync(path.join(tmpRoot, saved.storedPath))).toBe(true);
    // Nama asli tidak dipakai sebagai nama berkas di disk.
    expect(saved.storedPath).not.toContain('sertifikat');
  });

  it('menolak berkas kosong', async () => {
    await expect(
      saveMaritimeDocument(Buffer.alloc(0), 'kosong.pdf', 'application/pdf')
    ).rejects.toThrow(VaultError);
  });

  it('menolak berkas melebihi 15 MB', async () => {
    const big = Buffer.concat([PDF_BYTES, Buffer.alloc(MAX_FILE_SIZE_BYTES)]);
    await expect(
      saveMaritimeDocument(big, 'besar.pdf', 'application/pdf')
    ).rejects.toThrow(/melebihi batas/);
  });

  it('menolak berkas yang menyamar sebagai PDF', async () => {
    const html = Buffer.from('<html>'.padEnd(64, ' ') + '</html>');
    await expect(
      saveMaritimeDocument(html, 'palsu.pdf', 'application/pdf')
    ).rejects.toThrow(/bukan PDF, JPG, PNG, atau WebP/);
  });

  it('menolak MIME deklarasi yang tidak cocok dengan isi', async () => {
    await expect(
      saveMaritimeDocument(PDF_BYTES, 'sertifikat.pdf', 'image/png')
    ).rejects.toThrow(/tidak cocok dengan isi berkas/);
  });
});

describe('readMaritimeDocument', () => {
  it('mengembalikan berkas dan menyatakan checksum cocok', async () => {
    const saved = await saveMaritimeDocument(PDF_BYTES, 'a.pdf', 'application/pdf', 'certs/x');
    const { buffer, checksumMatches } = await readMaritimeDocument(
      saved.storedPath,
      saved.checksumSha256
    );
    expect(buffer.equals(PDF_BYTES)).toBe(true);
    expect(checksumMatches).toBe(true);
  });

  it('mendeteksi perubahan isi berkas', async () => {
    const saved = await saveMaritimeDocument(PDF_BYTES, 'b.pdf', 'application/pdf', 'certs/x');
    const full = path.join(tmpRoot, saved.storedPath);
    fs.writeFileSync(full, Buffer.from('%PDF-1.7 dimodifikasi jahat'));

    const { checksumMatches } = await readMaritimeDocument(saved.storedPath, saved.checksumSha256);
    expect(checksumMatches).toBe(false);
    expect(await verifyDocumentIntegrity(saved.storedPath, saved.checksumSha256)).toBe(false);
  });

  it('melempar VaultError bila berkas hilang', async () => {
    await expect(
      readMaritimeDocument('documents/certs/x/tidak-ada.pdf', null)
    ).rejects.toThrow(/tidak ditemukan/);
  });

  it('melempar VaultError untuk path traversal, bukan membaca berkas luar', async () => {
    await expect(readMaritimeDocument('../../etc/passwd', null)).rejects.toThrow(VaultError);
  });
});