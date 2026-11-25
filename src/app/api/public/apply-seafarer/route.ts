import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { CrewStage, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'node:crypto';
import { normalizeRank, supportedRanks } from '@/lib/maritime/rankMapper';
import {
  formatZodError,
  readJson,
  seafarerApplicationSchema,
} from '@/lib/validation/publicForms';
import { getClientIp, rateLimitKey } from '@/lib/security/clientIp';
import { rateLimitHeaders } from '@/lib/security/rateLimit';
import { consume } from '@/lib/security/limiter';
import { enqueueMatrixEvaluation } from '@/lib/queue/matrixQueue';
import { logger } from '@/lib/observability/logger';
import { withApiMetrics } from '@/lib/observability/withApiMetrics';

/**
 * Pendaftaran pelaut mandiri (portal karier publik).
 * - Validasi ketat (zod) + rate limit per IP.
 * - Jabatan tak dikenal ditolak 400; tidak ada fallback "Chief Officer".
 * - Kandidat masuk sebagai DIRECT_TALENT_POOL tanpa requisition palsu,
 *   sehingga registry kapal & requisition tidak tercemar data pendaftar.
 */
async function handlePOST(req: NextRequest) {
  const ip = getClientIp(req);
  const limiter = await consume('public-form', rateLimitKey(ip, 'apply-seafarer'));
  const headers = rateLimitHeaders(limiter);

  if (!limiter.allowed) {
    return NextResponse.json(
      {
        error: 'Terlalu banyak pendaftaran dari jaringan ini. Coba lagi beberapa menit lagi.',
        retryAfterSeconds: limiter.retryAfterSeconds,
      },
      { status: 429, headers }
    );
  }

  const payload = await readJson(req);
  const parsed = seafarerApplicationSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: formatZodError(parsed.error), details: parsed.error.issues.map((i) => i.path.join('.')) },
      { status: 400, headers }
    );
  }

  const input = parsed.data;
  const rank = normalizeRank(input.departmentRank);
  if (!rank) {
    return NextResponse.json(
      {
        error: `Jabatan "${input.departmentRank}" tidak dikenali sistem.`,
        supportedRanks: supportedRanks(),
      },
      { status: 400, headers }
    );
  }

  try {
    const normalizedEmail = input.email;

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true, role: true, seafarerProfile: { select: { id: true, seamanBookNo: true } } },
    });

    const created = await prisma.$transaction(async (tx) => {
      const user =
        existingUser ??
        (await tx.user.create({
          data: {
            email: normalizedEmail,
            fullName: input.fullName,
            phone: input.phoneWhatsApp,
            passwordHash: await bcrypt.hash(randomBytes(18).toString('base64url'), 10),
            role: UserRole.CANDIDATE_SEAFARER,
          },
          select: { id: true, role: true, seafarerProfile: { select: { id: true, seamanBookNo: true } } },
        }));

      const profile =
        user.seafarerProfile ??
        (await tx.seafarerProfile.create({
          data: {
            userId: user.id,
            seamanBookNo:
              input.seamanBookNo ?? `SB-TEMP-${randomBytes(3).toString('hex').toUpperCase()}`,
            primaryRank: rank,
            dateOfBirth: new Date('1992-01-01'),
            placeOfBirth: 'Indonesia',
            homeAddress: 'Pendaftar Mandiri Online',
            emergencyContact: 'Keluarga Inti',
            emergencyPhone: input.phoneWhatsApp,
            totalSeaTimeDays: (input.seaTimeMonths ?? 0) * 30,
            marlinsScore: input.marlinsScore ?? null,
          },
          select: { id: true, seamanBookNo: true },
        }));

      // Satu pendaftaran aktif per pelaut; hindari duplikasi talent pool.
      const existingApplication = await tx.crewApplication.findFirst({
        where: { seafarerId: profile.id, currentStage: { notIn: [CrewStage.REJECTED] } },
        select: { id: true },
      });

      if (existingApplication) {
        return {
          seafarerId: profile.id,
          applicationId: existingApplication.id,
          seamanBookNo: profile.seamanBookNo,
          isExisting: true,
        };
      }

      const application = await tx.crewApplication.create({
        data: {
          seafarerId: profile.id,
          requisitionId: null,
          source: 'DIRECT_TALENT_POOL',
          currentStage: CrewStage.APPLIED,
          matchScore: null,
          vettingToken: randomBytes(24).toString('base64url'),
          tokenExpiresAt: new Date(Date.now() + 30 * 24 * 3600 * 1000),
        },
        select: { id: true },
      });

      await tx.atsHistory.create({
        data: {
          applicationId: application.id,
          fromStage: CrewStage.APPLIED,
          toStage: CrewStage.APPLIED,
          changedByUserId: user.id,
          remarks: [
            'Pendaftaran mandiri via Portal Karier Pelaut Haswakarya.',
            input.cocClass ? `CoC: ${input.cocClass}.` : null,
            input.vesselTypeExperience ? `Pengalaman: ${input.vesselTypeExperience}.` : null,
            input.readinessDate ? `Kesiapan layar: ${input.readinessDate}.` : null,
            input.additionalNotes ? `Catatan: ${input.additionalNotes}` : null,
          ]
            .filter(Boolean)
            .join(' ')
            .slice(0, 1000),
        },
      });

      await tx.auditTrail.create({
        data: {
          userId: user.id,
          action: 'PUBLIC_SEAFARER_APPLICATION',
          entityType: 'CrewApplication',
          entityId: application.id,
          ipAddress: ip,
          userAgent: req.headers.get('user-agent') ?? 'Web Browser',
          details: JSON.stringify({
            fullName: input.fullName,
            email: normalizedEmail,
            rank,
            source: 'DIRECT_TALENT_POOL',
          }),
        },
      });

      return {
        seafarerId: profile.id,
        applicationId: application.id,
        seamanBookNo: profile.seamanBookNo,
        isExisting: false,
      };
    });

    // Evaluasi matriks: masuk antrean bila Redis tersedia, selain itu inline.
    // Kegagalan antrean tidak boleh menggagalkan pendaftaran yang sudah tersimpan.
    let queueOutcome: string | null = null;
    if (created.applicationId && !created.isExisting) {
      queueOutcome = await enqueueMatrixEvaluation(created.applicationId);
    }

    return NextResponse.json(
      {
        success: true,
        message: created.isExisting
          ? 'Berkas Anda sudah aktif dalam Talent Pool Haswakarya. Data profil Anda telah diperbarui.'
          : 'Pendaftaran tersimpan di Talent Pool Haswakarya. Tim crewing akan menghubungi Anda via WhatsApp.',
        applicationId: created.applicationId,
        seamanBookNo: created.seamanBookNo,
        seafarerId: created.seafarerId,
        matrixEvaluation: queueOutcome,
      },
      { status: 201, headers }
    );
  } catch (error) {
    logger.error('public_apply.failed', {
      message: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: 'Gagal memproses pendaftaran pelaut. Silakan coba lagi.' },
      { status: 500, headers }
    );
  }
}

// Pembungkus metrics: status akhir hanya diketahui di dalam handler.
export const POST = withApiMetrics('/api/public/apply-seafarer', handlePOST);
