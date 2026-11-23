import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth/session';
import { validatePasswordChange, type PasswordChangeInput } from '@/lib/auth/password';
import { rateLimitHeaders } from '@/lib/security/rateLimit';
import { consume } from '@/lib/security/limiter';
import { withApiMetrics } from '@/lib/observability/withApiMetrics';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * Haswakarya Crewing OS — Ganti sandi akun sendiri
 *
 * POST /api/auth/password
 *
 * Kenapa rute ini ada: seluruh akun produksi hasil seed memakai satu sandi
 * yang tercatat di dokumen rilis, dan sebelumnya tidak ada jalan menggantinya.
 *
 * Pagar:
 * - Sesi wajib; rute tidak menerima `userId` dari badan permintaan.
 * - Sandi lama wajib benar (bcrypt.compare) sebelum apa pun ditulis.
 * - Bucket `password-change` mencegah penebakan sandi lama dari sesi curian.
 * - Sandi tidak pernah dicatat ke log maupun AuditTrail.
 * - Sesi lain tetap berlaku sampai kedaluwarsa (7 hari) karena token bersifat
 *   stateless; ini dinyatakan jujur pada respons, bukan disembunyikan.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const BCRYPT_ROUNDS = 10;

async function handlePOST(req: NextRequest) {
  const session = await getCurrentUser();
  if (!session) {
    return NextResponse.json(
      { error: 'Unauthorized: sesi tidak valid atau telah berakhir.' },
      { status: 401 }
    );
  }

  const limit = await consume('password-change', session.userId);
  const headers = rateLimitHeaders(limit);
  if (!limit.allowed) {
    return NextResponse.json(
      {
        error: 'Terlalu banyak percobaan ganti sandi. Tunggu beberapa menit lagi.',
        retryAfterSeconds: limit.retryAfterSeconds,
      },
      { status: 429, headers }
    );
  }

  let body: PasswordChangeInput;
  try {
    body = (await req.json()) as PasswordChangeInput;
  } catch {
    return NextResponse.json({ error: 'Badan permintaan tidak valid.' }, { status: 400, headers });
  }

  const validation = validatePasswordChange(body ?? {});
  if (!validation.ok) {
    return NextResponse.json(
      { error: validation.message, field: validation.field },
      { status: 400, headers }
    );
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { id: true, passwordHash: true, isActive: true },
    });

    if (!user || !user.isActive) {
      return NextResponse.json(
        { error: 'Akun tidak ditemukan atau sudah dinonaktifkan.' },
        { status: 401, headers }
      );
    }

    const matches = await bcrypt.compare(validation.currentPassword, user.passwordHash);
    if (!matches) {
      return NextResponse.json(
        { error: 'Sandi saat ini salah.' },
        { status: 401, headers }
      );
    }

    const passwordHash = await bcrypt.hash(validation.newPassword, BCRYPT_ROUNDS);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { passwordHash },
      }),
      prisma.auditTrail.create({
        data: {
          userId: user.id,
          action: 'USER_PASSWORD_CHANGED',
          entityType: 'User',
          entityId: user.id,
          details: 'Pengguna mengganti sandi sendiri lewat portal.',
        },
      }),
    ]);

    return NextResponse.json(
      {
        success: true,
        message: 'Sandi berhasil diganti.',
        otherSessionsNote:
          'Sesi lain di perangkat berbeda tetap aktif sampai kedaluwarsa (maksimal 7 hari).',
      },
      { headers }
    );
  } catch (error) {
    console.error('[H-COS Password Error]', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan sistem saat mengganti sandi.' },
      { status: 500, headers }
    );
  }
}

export const POST = withApiMetrics('/api/auth/password', handlePOST);