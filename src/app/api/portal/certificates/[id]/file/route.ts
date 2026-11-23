import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { guardCapability, forbiddenResponse } from '@/lib/auth/guard';
import { hasCapability } from '@/lib/auth/rbac';
import { logger } from '@/lib/observability/logger';
import {
  MAX_FILE_SIZE_BYTES,
  VaultError,
  readMaritimeDocument,
  saveMaritimeDocument,
} from '@/lib/storage/vault';
import { withApiMetrics } from '@/lib/observability/withApiMetrics';

/**
 * Unggah & unduh berkas fisik sertifikat STCW.
 *
 * Model keamanan:
 * - Unggah hanya `portal.admin` (staf yang berwenang menerbitkan berkas).
 * - Unduh: staf operasi boleh semua; pelaut hanya sertifikatnya sendiri.
 * - Tipe berkas dideteksi dari isi (magic bytes), bukan dari header klien.
 * - Checksum SHA-256 diperiksa sebelum berkas dikirim; ketidakcocokan adalah
 *   409, bukan 200 dengan berkas yang sudah diubah.
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MIME_BY_EXTENSION: Record<string, string> = {
  '.pdf': 'application/pdf',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
};

function contentTypeFor(storedPath: string, fallback: string | null): string {
  const ext = storedPath.slice(storedPath.lastIndexOf('.')).toLowerCase();
  const byExtension = MIME_BY_EXTENSION[ext];
  if (byExtension) return byExtension;
  return fallback && fallback !== 'application/octet-stream'
    ? fallback
    : 'application/octet-stream';
}

function downloadName(storedPath: string, certificateNo: string): string {
  const ext = storedPath.slice(storedPath.lastIndexOf('.')).toLowerCase();
  const safeNo = certificateNo.replace(/[^A-Za-z0-9_-]/g, '_').slice(0, 60) || 'sertifikat';
  return `${safeNo}${MIME_BY_EXTENSION[ext] ? ext : '.bin'}`;
}

interface RouteParams {
  params: Promise<{ id: string }>;
}

async function handlePOST(req: NextRequest, { params }: RouteParams) {
  const access = await guardCapability('portal.admin');
  if (!access.ok) return access.response;
  const session = access.session;
  const { id } = await params;

  const certificate = await prisma.certificateSTCW.findUnique({
    where: { id },
    select: { id: true, seafarerId: true, certificateNo: true, certName: true },
  });

  if (!certificate) {
    return NextResponse.json({ error: 'Sertifikat tidak ditemukan.' }, { status: 404 });
  }

  // Tolak lebih awal dari header, sebelum badan dibaca: Next.js memotong badan
  // request di middleware (10 MB default) sehingga berkas 10–15 MB akan tiba
  // dalam keadaan terpotong dan gagal di-parse. Batas itu dinaikkan lewat
  // `middlewareClientMaxBodySize` di next.config.mjs; penjaga di sini memastikan
  // berkas yang benar-benar kebesaran dibalas 413, bukan 400 yang membingungkan.
  const declaredLength = Number(req.headers.get('content-length') ?? '0');
  if (Number.isFinite(declaredLength) && declaredLength > MAX_FILE_SIZE_BYTES) {
    return NextResponse.json(
      { error: `Ukuran berkas melebihi batas ${MAX_FILE_SIZE_BYTES / (1024 * 1024)} MB.` },
      { status: 413 }
    );
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json(
      { error: 'Badan unggah tidak dapat dibaca. Kirim multipart/form-data dengan ukuran di bawah batas.' },
      { status: 400 }
    );
  }

  const file = form.get('file');
  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: 'Berkas wajib dikirim pada field "file".' },
      { status: 400 }
    );
  }

  if (file.size === 0) {
    return NextResponse.json({ error: 'Berkas kosong tidak dapat diunggah.' }, { status: 400 });
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return NextResponse.json(
      { error: 'Ukuran berkas melebihi batas 15 MB.' },
      { status: 413 }
    );
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const saved = await saveMaritimeDocument(
      buffer,
      file.name,
      file.type,
      `certs/${certificate.seafarerId}`
    );

    const updated = await prisma.certificateSTCW.update({
      where: { id: certificate.id },
      data: {
        fileVaultPath: saved.storedPath,
        fileChecksumSha: saved.checksumSha256,
      },
      select: { id: true, fileVaultPath: true, fileChecksumSha: true, updatedAt: true },
    });

    await prisma.auditTrail.create({
      data: {
        userId: session.userId,
        action: 'STCW_DOCUMENT_UPLOADED',
        entityType: 'CertificateSTCW',
        entityId: certificate.id,
        details: JSON.stringify({
          certName: certificate.certName,
          certificateNo: certificate.certificateNo,
          mimeType: saved.mimeType,
          sizeBytes: saved.sizeBytes,
          checksumSha256: saved.checksumSha256,
        }),
        ipAddress: req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null,
        userAgent: req.headers.get('user-agent')?.slice(0, 300) ?? null,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Berkas sertifikat tersimpan di vault.',
      file: {
        storedPath: updated.fileVaultPath,
        checksumSha256: updated.fileChecksumSha,
        mimeType: saved.mimeType,
        sizeBytes: saved.sizeBytes,
        updatedAt: updated.updatedAt,
      },
    });
  } catch (err: unknown) {
    if (err instanceof VaultError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    const message = err instanceof Error ? err.message : 'Internal Error';
    logger.error('stcw.upload_failed', { certificateId: id, error: message });
    return NextResponse.json(
      { error: 'Gagal menyimpan berkas sertifikat.' },
      { status: 500 }
    );
  }
}

async function handleGET(req: NextRequest, { params }: RouteParams) {
  const access = await guardCapability('portal.operations', 'portal.read_own', 'portal.admin');
  if (!access.ok) return access.response;

  const session = access.session;
  const { id } = await params;

  const certificate = await prisma.certificateSTCW.findUnique({
    where: { id },
    select: {
      id: true,
      seafarerId: true,
      certificateNo: true,
      certName: true,
      fileVaultPath: true,
      fileChecksumSha: true,
      seafarer: { select: { userId: true } },
    },
  });

  if (!certificate) {
    return NextResponse.json({ error: 'Sertifikat tidak ditemukan.' }, { status: 404 });
  }

  // Pelaut (bukan staf) hanya boleh mengunduh berkas miliknya sendiri.
  const isStaff = hasCapability(session.role, 'portal.operations');
  if (!isStaff && certificate.seafarer.userId !== session.userId) {
    logger.warn('stcw.file_forbidden', {
      certificateId: id,
      requesterId: session.userId,
      ownerId: certificate.seafarer.userId,
    });
    return forbiddenResponse('Forbidden: sertifikat ini bukan milik akun Anda.');
  }

  if (!certificate.fileVaultPath) {
    return NextResponse.json(
      { error: 'Sertifikat ini belum memiliki berkas di vault.' },
      { status: 404 }
    );
  }

  try {
    const { buffer, checksumMatches } = await readMaritimeDocument(
      certificate.fileVaultPath,
      certificate.fileChecksumSha
    );

    if (!checksumMatches) {
      logger.error('stcw.integrity_failed', {
        certificateId: certificate.id,
        storedPath: certificate.fileVaultPath,
      });
      await prisma.auditTrail.create({
        data: {
          userId: session.userId,
          action: 'STCW_DOCUMENT_INTEGRITY_FAILED',
          entityType: 'CertificateSTCW',
          entityId: certificate.id,
          details: JSON.stringify({
            certificateNo: certificate.certificateNo,
            expectedChecksum: certificate.fileChecksumSha,
          }),
          ipAddress: req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null,
        },
      });
      return NextResponse.json(
        {
          error:
            'Integritas berkas tidak cocok dengan sidik jari SHA-256 yang tercatat. Unduhan dibatalkan.',
        },
        { status: 409 }
      );
    }

    const body = new Uint8Array(buffer);
    return new NextResponse(body, {
      status: 200,
      headers: {
        'Content-Type': contentTypeFor(certificate.fileVaultPath, null),
        'Content-Length': String(body.byteLength),
        'Content-Disposition': `inline; filename="${downloadName(
          certificate.fileVaultPath,
          certificate.certificateNo
        )}"`,
        'Cache-Control': 'private, no-store',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (err: unknown) {
    if (err instanceof VaultError) {
      logger.warn('stcw.file_unreadable', {
        certificateId: certificate.id,
        detail: err.message,
      });
      return NextResponse.json({ error: err.message }, { status: 404 });
    }
    const message = err instanceof Error ? err.message : 'Internal Error';
    logger.error('stcw.download_failed', { certificateId: id, error: message });
    return NextResponse.json({ error: 'Gagal membaca berkas sertifikat.' }, { status: 500 });
  }
}

// Pembungkus metrics: status akhir hanya diketahui di dalam handler.
export const GET = withApiMetrics('/api/portal/certificates/:id/file', handleGET);
export const POST = withApiMetrics('/api/portal/certificates/:id/file', handlePOST);
