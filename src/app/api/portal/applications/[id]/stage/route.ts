import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth/session';
import { CrewStage } from '@prisma/client';
import { hasCapability } from '@/lib/auth/rbac';
import { withApiMetrics } from '@/lib/observability/withApiMetrics';
import { crewStageDirection } from '@/lib/ats/stageOrder';

async function handlePATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized: sesi tidak valid.' }, { status: 401 });
  }
  if (!hasCapability(user.role, 'portal.operations')) {
    return NextResponse.json({ error: 'Forbidden: peran Anda tidak berhak memindahkan tahap ATS.' }, { status: 403 });
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const { nextStage, remarks } = body ?? {};

    if (!nextStage) {
      return NextResponse.json(
        { error: 'Tahap selanjutnya (nextStage) wajib ditentukan.' },
        { status: 400 }
      );
    }

    const validStages = Object.values(CrewStage) as string[];
    if (!validStages.includes(nextStage)) {
      return NextResponse.json(
        { error: `Tahap tidak dikenal: "${nextStage}".`, validStages },
        { status: 400 }
      );
    }

    const application = await prisma.crewApplication.findUnique({
      where: { id },
      select: {
        id: true,
        currentStage: true,
        seafarer: { select: { user: { select: { fullName: true } } } },
        requisition: {
          select: { vessel: { select: { name: true } } },
        },
      },
    });

    if (!application) {
      return NextResponse.json({ error: 'Aplikasi pelamar tidak ditemukan.' }, { status: 404 });
    }

    const previousStage = application.currentStage;
    if (previousStage === nextStage) {
      return NextResponse.json(
        { error: `Kandidat sudah berada pada tahap ${nextStage}.` },
        { status: 409 }
      );
    }

    // Arah perpindahan dihitung dari modul bersama, sumber yang sama dengan
    // kolom kanban, supaya urutan tahap tidak pernah berbeda antar tempat.
    const direction = crewStageDirection(previousStage, nextStage);
    const isBackward = direction === 'backward';

    if (isBackward && !hasCapability(user.role, 'portal.admin')) {
      return NextResponse.json(
        { error: 'Forbidden: hanya admin crewing yang boleh memundurkan tahap kandidat.' },
        { status: 403 }
      );
    }

    const vesselName = application.requisition?.vessel?.name ?? 'Talent Pool (tanpa requisition)';
    const candidateName = application.seafarer.user.fullName;

    const updated = await prisma.$transaction(async (tx) => {
      const app = await tx.crewApplication.update({
        where: { id },
        data: { currentStage: nextStage as CrewStage },
        select: { id: true, currentStage: true, updatedAt: true },
      });

      await tx.atsHistory.create({
        data: {
          applicationId: id,
          fromStage: previousStage,
          toStage: nextStage as CrewStage,
          changedByUserId: user.userId,
          remarks:
            remarks && String(remarks).trim().length > 0
              ? String(remarks).trim().slice(0, 1000)
              : `Status diubah dari ${previousStage} ke ${nextStage}`,
        },
      });

      await tx.auditTrail.create({
        data: {
          userId: user.userId,
          action: isBackward ? 'ATS_STAGE_ROLLBACK' : 'ATS_STAGE_MIGRATION',
          entityType: 'CrewApplication',
          entityId: id,
          details: `Kandidat ${candidateName} dipindahkan ke ${nextStage} (${vesselName})`,
        },
      });

      return app;
    });

    return NextResponse.json({
      success: true,
      message: `Status kandidat berhasil dipindahkan ke ${nextStage}.`,
      data: updated,
    });
  } catch (error) {
    console.error('[API Stage Mutation Error]', error);
    return NextResponse.json({ error: 'Gagal memperbarui status kandidat.' }, { status: 500 });
  }
}

// Pembungkus metrics: status akhir hanya diketahui di dalam handler.
export const PATCH = withApiMetrics('/api/portal/applications/:id/stage', handlePATCH);
