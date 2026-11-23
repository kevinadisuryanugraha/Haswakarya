import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { CrewStage } from '@prisma/client';
import {
  formatZodError,
  readJson,
  vettingDecisionSchema,
} from '@/lib/validation/publicForms';
import { getClientIp, rateLimitKey } from '@/lib/security/clientIp';
import { rateLimitHeaders } from '@/lib/security/rateLimit';
import { consume } from '@/lib/security/limiter';
import { withApiMetrics } from '@/lib/observability/withApiMetrics';

/**
 * Keputusan shipowner atas dossier vetting.
 * APPROVE → kandidat maju ke MCU_CLEARANCE.
 * REQUEST_REPLACEMENT → tahap tetap, catatan alasan penggantian disimpan.
 * Semua keputusan dijalankan dalam satu transaksi (vetting + ATS + audit).
 */
async function handlePOST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const cleanToken = token?.trim() ?? '';
  const ip = getClientIp(req);

  const limiter = await consume(
    'vetting-decision',
    rateLimitKey(ip, cleanToken.slice(0, 24))
  );
  const headers = rateLimitHeaders(limiter);
  if (!limiter.allowed) {
    return NextResponse.json(
      {
        error: 'Terlalu banyak keputusan vetting untuk tautan ini. Coba lagi nanti.',
        retryAfterSeconds: limiter.retryAfterSeconds,
      },
      { status: 429, headers }
    );
  }

  if (cleanToken.length < 6) {
    return NextResponse.json({ error: 'Token vetting tidak valid.' }, { status: 400, headers });
  }

  const parsed = vettingDecisionSchema.safeParse(await readJson(req));
  if (!parsed.success) {
    return NextResponse.json(
      { error: formatZodError(parsed.error) },
      { status: 400, headers }
    );
  }

  const input = parsed.data;

  try {
    const application = await prisma.crewApplication.findUnique({
      where: { vettingToken: cleanToken },
      select: {
        id: true,
        currentStage: true,
        tokenExpiresAt: true,
        seafarer: { select: { user: { select: { fullName: true } } } },
        requisition: { select: { vessel: { select: { name: true } } } },
      },
    });

    if (!application) {
      return NextResponse.json(
        { error: 'Token vetting tidak terdaftar pada sistem.' },
        { status: 404, headers }
      );
    }

    if (!application.tokenExpiresAt) {
      return NextResponse.json(
        { error: 'Tautan vetting ini tidak memiliki masa berlaku yang sah.' },
        { status: 403, headers }
      );
    }

    if (application.tokenExpiresAt.getTime() <= Date.now()) {
      return NextResponse.json(
        { error: 'Tautan vetting sudah kedaluwarsa. Minta tautan baru ke crewing manager.' },
        { status: 410, headers }
      );
    }

    if (application.currentStage === CrewStage.REJECTED) {
      return NextResponse.json(
        { error: 'Aplikasi ini sudah ditolak dan tidak dapat di-endorse.' },
        { status: 409, headers }
      );
    }

    const approved = input.decision === 'APPROVE';
    const candidateName = application.seafarer.user.fullName;
    const vesselName = application.requisition?.vessel?.name ?? 'Talent Pool (tanpa requisition)';
    const nextStage = approved ? CrewStage.MCU_CLEARANCE : application.currentStage;

    const decisionDetails = [
      approved ? 'Shipowner menyetujui kandidat.' : 'Shipowner meminta kandidat pengganti.',
      `Penandatangan: ${input.signerName}.`,
      input.signerRole ? `Jabatan: ${input.signerRole}.` : null,
      input.remarks ? `Catatan: ${input.remarks}` : null,
    ]
      .filter(Boolean)
      .join(' ');

    const result = await prisma.$transaction(async (tx) => {
      const vetting = await tx.vettingAssessment.upsert({
        where: { applicationId: application.id },
        create: {
          applicationId: application.id,
          recommendation: approved ? 'STRONGLY_APPROVED' : 'REJECTED',
          matrixSummary: decisionDetails,
          verifiedByMaster: input.signerName,
        },
        update: {
          recommendation: approved ? 'STRONGLY_APPROVED' : 'REJECTED',
          matrixSummary: decisionDetails,
          verifiedByMaster: input.signerName,
        },
        select: { id: true, recommendation: true, updatedAt: true },
      });

      if (nextStage !== application.currentStage) {
        await tx.crewApplication.update({
          where: { id: application.id },
          data: { currentStage: nextStage },
        });

        await tx.atsHistory.create({
          data: {
            applicationId: application.id,
            fromStage: application.currentStage,
            toStage: nextStage,
            remarks: decisionDetails.slice(0, 1000),
          },
        });
      }

      await tx.auditTrail.create({
        data: {
          action: approved ? 'SHIPOWNER_VETTING_APPROVED' : 'SHIPOWNER_VETTING_REPLACEMENT',
          entityType: 'CrewApplication',
          entityId: application.id,
          ipAddress: ip,
          userAgent: 'Shipowner Vetting Gate',
          details: `${candidateName} (${vesselName}): ${decisionDetails}`.slice(0, 1000),
        },
      });

      return vetting;
    });

    return NextResponse.json(
      {
        success: true,
        message: approved
          ? 'Kandidat disetujui. Dilanjutkan ke tahap MCU & penandatanganan PKL.'
          : 'Permintaan kandidat pengganti tercatat.',
        data: {
          token: cleanToken,
          decision: approved ? 'APPROVED' : 'REPLACEMENT_REQUESTED',
          stage: nextStage,
          signerName: input.signerName,
          decidedAt: result.updatedAt.toISOString(),
        },
      },
      { status: 200, headers }
    );
  } catch (error) {
    console.error('[API Vetting Endorse Error]', error);
    return NextResponse.json(
      { error: 'Gagal menyimpan keputusan vetting.' },
      { status: 500, headers }
    );
  }
}

// Pembungkus metrics: status akhir hanya diketahui di dalam handler.
export const POST = withApiMetrics('/api/public/vetting/:token/endorse', handlePOST);
