import { prisma } from '../prisma';
import { evaluateSingleOfficer, type OfficerMatrixProfile } from './matrixMatcher';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * Haswakarya Crewing OS — Evaluasi Matriks untuk satu lamaran
 * Diekstrak dari worker agar dapat dipanggil dari dua jalur:
 *   1. antrean BullMQ (produksi, durable + retry),
 *   2. eksekusi inline (tanpa Redis, mis. lingkungan pengembangan).
 * PII tidak pernah dicetak ke log; hanya id lamaran dan skor.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export type MatrixEvaluationOutcome =
  | { status: 'evaluated'; applicationId: string; score: number; recommendation: string }
  | { status: 'skipped'; applicationId: string; reason: 'not_found' | 'already_scored' };

export async function evaluateApplicationMatrix(
  applicationId: string
): Promise<MatrixEvaluationOutcome> {
  const application = await prisma.crewApplication.findUnique({
    where: { id: applicationId },
    include: {
      seafarer: {
        include: {
          seaTimes: true,
          certificates: true,
          user: { select: { fullName: true } },
        },
      },
      requisition: { include: { vessel: true } },
    },
  });

  if (!application) {
    return { status: 'skipped', applicationId, reason: 'not_found' };
  }
  if (application.matchScore !== null) {
    return { status: 'skipped', applicationId, reason: 'already_scored' };
  }

  const app = application;
  const seaTimes = app.seafarer.seaTimes;

  // Profil perwira dihitung dari data jam layar nyata (bukan angka simulasi).
  // Pasangan perwira tidak dikarang: evaluasi pasangan hanya relevan bila
  // benar-benar ada perwira pendamping pada requisition yang sama.
  const targetVesselType = app.requisition?.vessel.vesselType ?? null;
  const monthsFor = (predicate: (record: (typeof seaTimes)[number]) => boolean) =>
    Math.round(
      seaTimes.filter(predicate).reduce((total, record) => total + Math.max(0, record.totalDays), 0) / 30
    );

  const seafarerProfile: OfficerMatrixProfile = {
    fullName: app.seafarer.user.fullName,
    rank: app.seafarer.primaryRank,
    vesselType: targetVesselType ?? seaTimes[0]?.vesselType ?? 'GENERAL_CARGO',
    timeInRankMonths: monthsFor((record) => record.rankServed === app.seafarer.primaryRank),
    timeOnVesselTypeMonths: targetVesselType
      ? monthsFor((record) => record.vesselType === targetVesselType)
      : monthsFor(() => true),
    timeWithOperatorMonths: monthsFor(() => true),
    marlinsScore: app.seafarer.marlinsScore ?? undefined,
  };

  const evalResult = evaluateSingleOfficer(seafarerProfile);

  await prisma.$transaction(async (tx) => {
    await tx.crewApplication.update({
      where: { id: app.id },
      data: {
        matchScore: evalResult.matrixScore,
        currentStage: 'DOCUMENT_VERIFIED',
      },
    });

    await tx.vettingAssessment.upsert({
      where: { applicationId: app.id },
      create: {
        applicationId: app.id,
        sireMatrixScore: evalResult.matrixScore,
        timeInRankMonths: seafarerProfile.timeInRankMonths,
        timeOnVesselTypeMos: seafarerProfile.timeOnVesselTypeMonths,
        timeWithOperatorMos: seafarerProfile.timeWithOperatorMonths,
        marlinsPercent: seafarerProfile.marlinsScore ?? null,
        pairedOfficerSeaTime: null,
        recommendation: evalResult.recommendation,
        matrixSummary: evalResult.auditSummary,
      },
      update: {
        sireMatrixScore: evalResult.matrixScore,
        recommendation: evalResult.recommendation,
        matrixSummary: evalResult.auditSummary,
      },
    });

    await tx.auditTrail.create({
      data: {
        action: 'AI_MATRIX_EVALUATED',
        entityType: 'CrewApplication',
        entityId: app.id,
        details: `Evaluasi SIRE 2.0 selesai dengan skor ${evalResult.matrixScore}. Rekomendasi: ${evalResult.recommendation}`,
      },
    });
  });

  return {
    status: 'evaluated',
    applicationId: app.id,
    score: evalResult.matrixScore,
    recommendation: evalResult.recommendation,
  };
}

/** Mengambil satu lamaran yang belum dinilai (fallback polling tanpa Redis). */
export async function findPendingApplicationId(): Promise<string | null> {
  const pending = await prisma.crewApplication.findFirst({
    where: { matchScore: null, currentStage: 'APPLIED' },
    select: { id: true },
    orderBy: { createdAt: 'asc' },
  });
  return pending?.id ?? null;
}