import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { guardCapability } from '@/lib/auth/guard';
import { withApiMetrics } from '@/lib/observability/withApiMetrics';
import { consume } from '@/lib/security/limiter';
import { rateLimitHeaders } from '@/lib/security/rateLimit';
import { evaluateSingleOfficer } from '@/lib/ai/matrixMatcher';
import {
  buildDossierNarrativeFacts,
  generateDossierNarrative,
} from '@/lib/ai/dossierNarrative';
import { aiConfigured, resolveModel } from '@/lib/ai/openrouter';
import { isTankerVesselType } from '@/lib/maritime/vesselTypeMapper';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * Haswakarya Crewing OS — Narasi dossier vetting (Wedge B, on-demand)
 *
 * POST /api/portal/applications/:id/dossier-narrative
 *
 * Sifat rute ini:
 * - Hanya staf dengan `portal.operations`.
 * - Menulis TEPAT tiga kolom: `aiNarrative`, `aiNarrativeModel`, `aiNarrativeAt`.
 *   Skor, rekomendasi, dan `matrixSummary` (catatan keputusan shipowner) tidak
 *   disentuh.
 * - Kegagalan provider bukan kegagalan fitur: fallback deterministik tetap
 *   disimpan supaya halaman dossier tidak kosong.
 * - Satu baris `AuditTrail` per penyusunan, tanpa isi narasi dan tanpa PII.
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

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

async function handlePOST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const access = await guardCapability('portal.operations');
  if (!access.ok) return access.response;

  const { id } = await params;

  const limit = await consume('ai-dossier', access.session.userId);
  if (!limit.allowed) {
    return NextResponse.json(
      {
        error: `Batas narasi AI tercapai. Coba lagi dalam ${limit.retryAfterSeconds} detik.`,
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
            select: { certName: true, category: true, expiryDate: true, isVerified: true },
          },
        },
      },
      requisition: {
        select: { vessel: { select: { vesselType: true } } },
      },
      vetting: {
        select: { recommendation: true, sireMatrixScore: true },
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

  const tankerDays = seafarer.seaTimes
    .filter((record) => isTankerVesselType(record.vesselType))
    .reduce((total, record) => total + Math.max(0, seaTimeDays(record)), 0);

  const inRankDays = seafarer.seaTimes
    .filter((record) => record.rankServed === seafarer.primaryRank)
    .reduce((total, record) => total + Math.max(0, seaTimeDays(record)), 0);

  // Placeholder nama: matriks hanya butuh jabatan + angka, dan payload ke
  // provider tidak boleh membawa identitas pelaut.
  const evaluation = evaluateSingleOfficer({
    fullName: 'KANDIDAT',
    rank: seafarer.primaryRank,
    vesselType: assignmentVesselType ?? seafarer.seaTimes[0]?.vesselType ?? 'GENERAL_CARGO',
    timeInRankMonths: Math.round(inRankDays / 30),
    timeOnVesselTypeMonths: Math.round(matchingTypeDays / 30),
    timeWithOperatorMonths: Math.round(effectiveDays / 30),
    marlinsScore: seafarer.marlinsScore ?? undefined,
  });

  const decision = application.vetting?.recommendation ?? evaluation.recommendation;

  const facts = buildDossierNarrativeFacts({
    rank: seafarer.primaryRank,
    targetVesselType: assignmentVesselType,
    totalSeaTimeYears: round1(effectiveDays / 365),
    tankerSeaTimeYears: round1(tankerDays / 365),
    seaTimeRecordCount: seafarer.seaTimes.length,
    matrixScore:
      typeof application.vetting?.sireMatrixScore === 'number'
        ? application.vetting.sireMatrixScore
        : evaluation.matrixScore,
    recommendation: decision,
    sire2Compliant: evaluation.sire2Compliant,
    rightShipCompliant: evaluation.rightShipCompliant,
    marlinsScore: seafarer.marlinsScore ?? null,
    strengths: evaluation.strengths,
    complianceGaps: evaluation.complianceGaps,
    certificates: seafarer.certificates.map((certificate) => ({
      name: certificate.certName,
      category: certificate.category,
      expired: Boolean(certificate.expiryDate && certificate.expiryDate.getTime() < now.getTime()),
      verified: certificate.isVerified,
    })),
    decision,
  });

  const outcome = await generateDossierNarrative(facts);
  const modelLabel = outcome.source === 'ai' ? (outcome.meta?.model ?? resolveModel()) : 'deterministik';
  const narrativeText = [
    outcome.narrative.summary,
    ...outcome.narrative.strengths.map((item) => `+ ${item}`),
    ...outcome.narrative.gaps.map((item) => `- ${item}`),
  ].join('\n');

  try {
    // Nilai matriks disalin apa adanya dari evaluasi server; rute ini tidak
    // pernah boleh mengubah skor atau rekomendasi.
    await prisma.$transaction([
      prisma.vettingAssessment.upsert({
        where: { applicationId: application.id },
        create: {
          applicationId: application.id,
          sireMatrixScore: facts.matrixScore,
          timeInRankMonths: Math.round(inRankDays / 30),
          timeOnVesselTypeMos: Math.round(matchingTypeDays / 30),
          timeWithOperatorMos: Math.round(effectiveDays / 30),
          marlinsPercent: seafarer.marlinsScore ?? null,
          recommendation: evaluation.recommendation,
          aiNarrative: narrativeText,
          aiNarrativeModel: modelLabel,
          aiNarrativeAt: now,
        },
        update: {
          aiNarrative: narrativeText,
          aiNarrativeModel: modelLabel,
          aiNarrativeAt: now,
        },
      }),
      prisma.auditTrail.create({
        data: {
          userId: access.session.userId,
          action: 'AI_DOSSIER_NARRATIVE',
          entityType: 'CrewApplication',
          entityId: application.id,
          details: `Narasi dossier disusun (${outcome.source}${outcome.reason ? `: ${outcome.reason}` : ''}).`,
        },
      }),
    ]);
  } catch (error) {
    console.error('[H-COS Dossier Narrative Error]', error);
    return NextResponse.json(
      { error: 'Narasi tersusun tetapi gagal disimpan. Coba lagi.' },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    data: {
      applicationId: application.id,
      narrative: outcome.narrative,
      stored: narrativeText,
      source: outcome.source,
      reason: outcome.reason ?? null,
      meta: outcome.meta ?? null,
      ai: {
        configured: aiConfigured(),
        model: resolveModel(),
        answeredBy: modelLabel,
      },
    },
  });
}

export const POST = withApiMetrics<{ params: Promise<{ id: string }> }>(
  '/api/portal/applications/[id]/dossier-narrative',
  handlePOST
);