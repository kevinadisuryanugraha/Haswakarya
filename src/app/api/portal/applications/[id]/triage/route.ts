import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { guardCapability } from '@/lib/auth/guard';
import { withApiMetrics } from '@/lib/observability/withApiMetrics';
import { consume } from '@/lib/security/limiter';
import { rateLimitHeaders } from '@/lib/security/rateLimit';
import { evaluateSingleOfficer } from '@/lib/ai/matrixMatcher';
import { buildTriageFacts, generateTriageDraft } from '@/lib/ai/triage';
import { aiConfigured, resolveModel } from '@/lib/ai/openrouter';
import { COC_BY_RANK } from '@/lib/vetting/dossier';
import { isTankerVesselType } from '@/lib/maritime/vesselTypeMapper';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * Haswakarya Crewing OS — Draf triage ATS (on-demand)
 *
 * POST /api/portal/applications/:id/triage
 *
 * Sifat rute ini:
 * - Hanya staf dengan `portal.operations`.
 * - Read-only terhadap database: tidak menulis skor, stage, atau dossier.
 * - Kegagalan provider bukan kegagalan fitur; jawaban selalu berisi draf,
 *   dengan `source` yang jujur menyebut asalnya.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const DAY_MS = 24 * 60 * 60 * 1000;

function seaTimeDays(record: {
  totalDays: number;
  signOnDate: Date;
  signOffDate: Date;
}): number {
  if (record.totalDays > 0) return record.totalDays;
  const diff = record.signOffDate.getTime() - record.signOnDate.getTime();
  return diff > 0 ? diff / DAY_MS : 0;
}

async function handlePOST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const access = await guardCapability('portal.operations');
  if (!access.ok) return access.response;

  const { id } = await params;

  const limit = await consume('ai-triage', access.session.userId);
  if (!limit.allowed) {
    return NextResponse.json(
      {
        error: `Batas draf AI tercapai. Coba lagi dalam ${limit.retryAfterSeconds} detik.`,
        retryAfterSeconds: limit.retryAfterSeconds,
      },
      { status: 429, headers: rateLimitHeaders(limit) }
    );
  }

  const application = await prisma.crewApplication.findUnique({
    where: { id },
    select: {
      id: true,
      currentStage: true,
      matchScore: true,
      seafarer: {
        select: {
          primaryRank: true,
          totalSeaTimeDays: true,
          marlinsScore: true,
          seaTimes: {
            select: {
              vesselType: true,
              rankServed: true,
              totalDays: true,
              signOnDate: true,
              signOffDate: true,
            },
          },
          certificates: {
            select: { certName: true, category: true, expiryDate: true },
          },
        },
      },
      requisition: {
        select: { vessel: { select: { vesselType: true } } },
      },
    },
  });

  if (!application) {
    return NextResponse.json({ error: 'Aplikasi tidak ditemukan.' }, { status: 404 });
  }

  const seafarer = application.seafarer;
  const now = new Date();

  const totalDaysFromRecords = seafarer.seaTimes.reduce(
    (total, record) => total + Math.max(0, seaTimeDays(record)),
    0
  );
  const effectiveDays =
    seafarer.totalSeaTimeDays > 0 ? seafarer.totalSeaTimeDays : totalDaysFromRecords;

  const assignmentVesselType = application.requisition?.vessel?.vesselType ?? null;
  const targetIsTanker = assignmentVesselType
    ? isTankerVesselType(assignmentVesselType)
    : false;

  const matchingTypeDays = seafarer.seaTimes
    .filter((record) => {
      if (!assignmentVesselType) return true;
      return (
        record.vesselType === assignmentVesselType ||
        (targetIsTanker && isTankerVesselType(record.vesselType))
      );
    })
    .reduce((total, record) => total + Math.max(0, seaTimeDays(record)), 0);

  const inRankDays = seafarer.seaTimes
    .filter((record) => record.rankServed === seafarer.primaryRank)
    .reduce((total, record) => total + Math.max(0, seaTimeDays(record)), 0);

  // Nama sengaja diganti placeholder: matriks hanya memakai rank dan angka,
  // dan payload ke provider tidak boleh membawa identitas pelaut.
  const evaluation = evaluateSingleOfficer({
    fullName: 'KANDIDAT',
    rank: seafarer.primaryRank,
    vesselType: assignmentVesselType ?? seafarer.seaTimes[0]?.vesselType ?? 'GENERAL_CARGO',
    timeInRankMonths: Math.round(inRankDays / 30),
    timeOnVesselTypeMonths: Math.round(matchingTypeDays / 30),
    timeWithOperatorMonths: Math.round(effectiveDays / 30),
    marlinsScore: seafarer.marlinsScore ?? undefined,
  });

  const facts = buildTriageFacts({
    rank: seafarer.primaryRank,
    cocClass: COC_BY_RANK[seafarer.primaryRank] ?? null,
    marlinsPercent: seafarer.marlinsScore ?? null,
    seaTimeMonths: Math.round(effectiveDays / 30),
    vesselTypeExperience: assignmentVesselType ?? null,
    readinessDate: null,
    stage: application.currentStage,
    certificates: seafarer.certificates.map((certificate) => ({
      name: certificate.certName,
      category: certificate.category,
      expired: Boolean(certificate.expiryDate && certificate.expiryDate.getTime() < now.getTime()),
    })),
    matrix: {
      score: evaluation.matrixScore,
      recommendation: evaluation.recommendation,
      sireCompliant: evaluation.sire2Compliant,
      rightShipCompliant: evaluation.rightShipCompliant,
      marlinsCompliant: evaluation.marlinsCompliant,
      strengths: evaluation.strengths,
      gaps: evaluation.complianceGaps,
    },
  });

  const outcome = await generateTriageDraft(facts);

  return NextResponse.json({
    success: true,
    data: {
      applicationId: application.id,
      draft: outcome.draft,
      source: outcome.source,
      reason: outcome.reason ?? null,
      meta: outcome.meta ?? null,
      ai: {
        configured: aiConfigured(),
        model: resolveModel(),
      },
    },
  });
}

export const POST = withApiMetrics<{ params: Promise<{ id: string }> }>(
  '/api/portal/applications/[id]/triage',
  handlePOST
);