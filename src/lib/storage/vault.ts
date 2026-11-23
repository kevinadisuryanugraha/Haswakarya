import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * Haswakarya Crewing OS — Vault dokumen maritim
 * Berkas disimpan di luar `public/` dan hanya bisa diambil lewat rute API yang
 * memeriksa sesi. Setiap berkas diberi sidik jari SHA-256 agar integritasnya
 * dapat dibuktikan ulang saat diunduh.
 *
 * Dua pertahanan penting di sini:
 * 1. MIME dari klien tidak dipercaya; tipe asli dideteksi dari magic bytes.
 * 2. Path dari database tidak dipercaya; `resolveVaultPath` menolak path
 *    absolut, `..`, dan pemisah Windows sehingga berkas di luar root vault
 *    tidak bisa dibaca walau baris database diubah.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export interface SavedDocumentMeta {
  storedPath: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  checksumSha256: string;
}

export const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
];

export const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024; // 15 MB

/** Galat vault yang aman ditampilkan ke pengguna (tanpa path filesystem). */
export class VaultError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'VaultError';
  }
}

/**
 * Mendeteksi MIME dari magic bytes. `null` berarti berkas tidak dikenali.
 * Dipakai agar `Content-Type` kiriman klien tidak bisa dipakai menyelundupkan
 * berkas non-dokumen (mis. HTML berisi skrip) ke dalam vault.
 */
export function sniffMimeType(buffer: Buffer): string | null {
  if (!buffer || buffer.length < 12) return null;

  const head = buffer.subarray(0, 12);

  if (head.subarray(0, 5).toString('latin1') === '%PDF-') return 'application/pdf';
  if (head[0] === 0xff && head[1] === 0xd8 && head[2] === 0xff) return 'image/jpeg';
  if (
    head[0] === 0x89 &&
    head[1] === 0x50 &&
    head[2] === 0x4e &&
    head[3] === 0x47 &&
    head[4] === 0x0d &&
    head[5] === 0x0a &&
    head[6] === 0x1a &&
    head[7] === 0x0a
  ) {
    return 'image/png';
  }
  if (
    head.subarray(0, 4).toString('latin1') === 'RIFF' &&
    head.subarray(8, 12).toString('latin1') === 'WEBP'
  ) {
    return 'image/webp';
  }

  return null;
}

/** Subfolder hanya boleh beraksara aman; mencegah keluar dari root vault. */
export function sanitizeSubFolder(subFolder: string): string {
  const normalized = subFolder.replace(/\\/g, '/').replace(/^\/+|\/+$/g, '');
  if (normalized.length === 0) return 'general';
  if (normalized.length > 120) {
    throw new VaultError('Subfolder vault terlalu panjang.');
  }
  if (!/^[A-Za-z0-9_-]+(\/[A-Za-z0-9_-]+)*$/.test(normalized)) {
    throw new VaultError('Subfolder vault memuat aksara yang tidak diizinkan.');
  }
  return normalized;
}

/** Mendapatkan direktori root penyimpanan dokumen maritim */
export function getVaultRoot(): string {
  const customPath = process.env.VAULT_STORAGE_PATH;
  if (customPath) {
    return path.isAbsolute(customPath) ? customPath : path.resolve(process.cwd(), customPath);
  }
  return path.resolve(process.cwd(), 'storage', 'vault');
}

/**
 * Mengubah path relatif tersimpan menjadi path absolut yang terjamin berada di
 * dalam root vault. Melempar `VaultError` untuk setiap bentuk traversal.
 */
export function resolveVaultPath(relativeStoredPath: string): string {
  if (typeof relativeStoredPath !== 'string' || relativeStoredPath.trim().length === 0) {
    throw new VaultError('Path dokumen kosong.');
  }

  const raw = relativeStoredPath.trim();

  if (raw.includes('\0')) throw new VaultError('Path dokumen tidak valid.');
  if (raw.includes('\\')) throw new VaultError('Path dokumen tidak valid.');
  if (path.isAbsolute(raw) || /^[A-Za-z]:/.test(raw)) {
    throw new VaultError('Path dokumen tidak boleh absolut.');
  }

  const root = getVaultRoot();
  const resolved = path.resolve(root, raw);
  const relative = path.relative(root, resolved);

  if (relative.length === 0 || relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new VaultError('Path dokumen berada di luar vault.');
  }

  return resolved;
}

/**
 * Menyimpan dokumen maritim secara atomik (.tmp rename) dengan sidik jari SHA-256
 */
export async function saveMaritimeDocument(
  fileBuffer: Buffer,
  originalFilename: string,
  mimeType: string,
  subFolder: string = 'general'
): Promise<SavedDocumentMeta> {
  // 1. Validasi isi berkas, bukan hanya header dari klien.
  if (fileBuffer.length === 0) {
    throw new VaultError('Berkas kosong tidak dapat disimpan.');
  }

  if (fileBuffer.length > MAX_FILE_SIZE_BYTES) {
    throw new VaultError(
      `Ukuran berkas (${(fileBuffer.length / (1024 * 1024)).toFixed(2)} MB) melebihi batas maksimal 15 MB.`
    );
  }

  const detected = sniffMimeType(fileBuffer);
  if (!detected || !ALLOWED_MIME_TYPES.includes(detected)) {
    throw new VaultError(
      'Isi berkas bukan PDF, JPG, PNG, atau WebP yang sah. Tipe berkas tidak boleh dipalsukan.'
    );
  }

  const declared = (mimeType || '').toLowerCase();
  if (declared && ALLOWED_MIME_TYPES.includes(declared) && declared !== detected) {
    throw new VaultError(
      `Tipe berkas yang dikirim (${declared}) tidak cocok dengan isi berkas (${detected}).`
    );
  }

  // 2. Kalkulasi sidik jari kriptografis SHA-256
  const hashSum = crypto.createHash('sha256');
  hashSum.update(fileBuffer);
  const checksumSha256 = hashSum.digest('hex');

  // 3. Siapkan direktori target & penamaan UUID
  const vaultRoot = getVaultRoot();
  const safeFolder = sanitizeSubFolder(subFolder);
  const targetDir = path.join(vaultRoot, 'documents', safeFolder);
  const tmpDir = path.join(vaultRoot, '.tmp');

  await fs.promises.mkdir(targetDir, { recursive: true });
  await fs.promises.mkdir(tmpDir, { recursive: true });

  const extensionFor: Record<string, string> = {
    'application/pdf': '.pdf',
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
  };
  const ext = extensionFor[detected] ?? '.bin';
  const fileUuid = crypto.randomUUID();
  const finalFilename = `${fileUuid}${ext}`;

  const tmpFilePath = path.join(tmpDir, `${fileUuid}.tmp`);
  const finalFilePath = path.join(targetDir, finalFilename);

  // 4. Tulis berkas fisik atomik (.tmp lalu rename)
  await fs.promises.writeFile(tmpFilePath, fileBuffer);
  await fs.promises.rename(tmpFilePath, finalFilePath);

  // 5. Kembalikan metadata lengkap; nama asli hanya disimpan sebagai metadata,
  //    tidak pernah dipakai sebagai nama berkas di disk.
  const relativeStoredPath = path.relative(vaultRoot, finalFilePath).replace(/\\/g, '/');

  return {
    storedPath: relativeStoredPath,
    originalName: sanitizeOriginalName(originalFilename),
    mimeType: detected,
    sizeBytes: fileBuffer.length,
    checksumSha256,
  };
}

/** Nama asli hanya untuk tampilan; buang karakter kendali dan batasi panjang. */
export function sanitizeOriginalName(name: string | undefined | null): string {
  const fallback = 'dokumen';
  if (!name) return fallback;
  const cleaned = name
    // Buang jejak `..` lebih dulu supaya nama seperti "../../etc/passwd"
    // tidak tersisa sebagai nama tampilan yang menyesatkan.
    .replace(/\.{2,}/g, ' ')
    .replace(/[\\/:*?"<>|\r\n\t]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (cleaned.length === 0) return fallback;
  return cleaned.length > 120 ? cleaned.slice(0, 120) : cleaned;
}

export interface LoadedDocument {
  buffer: Buffer;
  checksumMatches: boolean;
}

/**
 * Membaca berkas dari vault dan membandingkan SHA-256 dengan yang tercatat.
 * Melempar `VaultError` bila berkas hilang atau path tidak sah.
 */
export async function readMaritimeDocument(
  relativeStoredPath: string,
  expectedChecksum: string | null
): Promise<LoadedDocument> {
  const fullPath = resolveVaultPath(relativeStoredPath);

  let buffer: Buffer;
  try {
    buffer = await fs.promises.readFile(fullPath);
  } catch {
    throw new VaultError('Berkas dokumen tidak ditemukan di vault.');
  }

  const hashSum = crypto.createHash('sha256');
  hashSum.update(buffer);
  const actualChecksum = hashSum.digest('hex');

  return {
    buffer,
    checksumMatches: expectedChecksum
      ? actualChecksum.toLowerCase() === expectedChecksum.toLowerCase()
      : true,
  };
}

/**
 * Verifikasi integritas berkas fisik terhadap checksum SHA-256 di database
 */
export async function verifyDocumentIntegrity(
  relativeStoredPath: string,
  expectedChecksum: string
): Promise<boolean> {
  try {
    const { checksumMatches } = await readMaritimeDocument(relativeStoredPath, expectedChecksum);
    return checksumMatches;
  } catch {
    return false;
  }
}