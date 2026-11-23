import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { guardCapability } from '@/lib/auth/guard';
import { isKnownRank } from '@/lib/maritime/rankMapper';
import { RequisitionStatus } from '@prisma/client';
import { withApiMetrics } from '@/lib/observability/withApiMetrics';

/** Membuat nomor requisition sekuensial per tahun + prefix jabatan. */
async function nextRequisitionNo(rank: string): Promise<string> {
  const year = new Date().getUTCFullYear();
  const prefix = `REQ-${year}-${rank.slice(0, 3)}-`;

  const latest = await prisma.crewRequisition.findFirst({
    where: { requisitionNo: { startsWith: prefix } },
    orderBy: { requisitionNo: 'desc' },
    select: { requisitionNo: true },
  });

  const lastSeq = latest ? Number.parseInt(latest.requisitionNo.slice(prefix.length), 10) : 0;
  const nextSeq = (Number.isNaN(lastSeq) ? 0 : lastSeq) + 1;
  return `${prefix}${String(nextSeq).padStart(3, '0')}`;
}

async function handleGET() {
  const access = await guardCapability('portal.operations');
  if (!access.ok) return access.response;

  try {
    const requisitions = await prisma.crewRequisition.findMany({
      select: {
        id: true,
        requisitionNo: true,
        rank: true,
        requiredQuantity: true,
        minSeaTimeMonths: true,
        targetJoinDate: true,
        targetPort: true,
        status: true,
        notes: true,
        createdAt: true,
        vessel: { select: { id: true, name: true, vesselType: true, dwt: true, grt: true } },
        applications: {
          select: {
            id: true,
            currentStage: true,
            matchScore: true,
            seafarer: {
              select: {
                id: true,
                primaryRank: true,
                user: { select: { id: true, fullName: true, email: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, count: requisitions.length, data: requisitions });
  } catch (error) {
    console.error('[API Requisitions GET Error]', error);
    return NextResponse.json({ error: 'Gagal memuat daftar permintaan awak kapal.' }, { status: 500 });
  }
}

async function handlePOST(req: NextRequest) {
  const access = await guardCapability('portal.operations');
  if (!access.ok) return access.response;

  try {
    const body = await req.json();
    const {
      vesselId,
      rank,
      requiredQuantity,
      minSeaTimeMonths,
      targetJoinDate,
      targetPort,
      salaryBudgetIdr,
      salaryBudgetUsd,
      notes,
    } = body ?? {};

    if (!vesselId || !rank || !targetJoinDate || !targetPort) {
      return NextResponse.json(
        { error: 'Kapal, Jabatan, Tanggal Join, dan Pelabuhan wajib ditentukan.' },
        { status: 400 }
      );
    }

    if (!isKnownRank(rank)) {
      return NextResponse.json(
        { error: `Jabatan tidak dikenal: "${rank}". Gunakan salah satu jabatan maritim yang valid.` },
        { status: 400 }
      );
    }

    const vessel = await prisma.vessel.findUnique({
      where: { id: String(vesselId) },
      select: { id: true, name: true },
    });
    if (!vessel) {
      return NextResponse.json({ error: 'Kapal tidak ditemukan di registry.' }, { status: 404 });
    }

    const joinDate = new Date(targetJoinDate);
    if (Number.isNaN(joinDate.getTime())) {
      return NextResponse.json({ error: 'Tanggal join tidak valid.' }, { status: 400 });
    }

    const quantity = Number.parseInt(String(requiredQuantity ?? 1), 10);
    const minSeaTime = Number.parseInt(String(minSeaTimeMonths ?? 12), 10);

    const reqRecord = await prisma.crewRequisition.create({
      data: {
        requisitionNo: await nextRequisitionNo(rank),
        vesselId: vessel.id,
        rank,
        requiredQuantity: Number.isNaN(quantity) || quantity < 1 ? 1 : quantity,
        minSeaTimeMonths: Number.isNaN(minSeaTime) || minSeaTime < 0 ? 12 : minSeaTime,
        targetJoinDate: joinDate,
        targetPort: String(targetPort).trim(),
        salaryBudgetIdr: salaryBudgetIdr ? Number.parseFloat(String(salaryBudgetIdr)) : null,
        salaryBudgetUsd: salaryBudgetUsd ? Number.parseFloat(String(salaryBudgetUsd)) : null,
        status: RequisitionStatus.OPEN,
        notes: notes ? String(notes).trim().slice(0, 1000) : null,
      },
      select: {
        id: true,
        requisitionNo: true,
        rank: true,
        targetPort: true,
        targetJoinDate: true,
        requiredQuantity: true,
        status: true,
        vessel: { select: { id: true, name: true } },
      },
    });

    await prisma.auditTrail.create({
      data: {
        userId: access.session.userId,
        action: 'CREATE_CREW_REQUISITION',
        entityType: 'CrewRequisition',
        entityId: reqRecord.id,
        details: `Permintaan awak baru: ${reqRecord.requisitionNo} (${vessel.name} - ${rank})`,
      },
    });

    return NextResponse.json({ success: true, data: reqRecord }, { status: 201 });
  } catch (error) {
    console.error('[API Requisitions POST Error]', error);
    return NextResponse.json({ error: 'Gagal membuat safe manning requisition.' }, { status: 500 });
  }
}

// Pembungkus metrics: status akhir hanya diketahui di dalam handler.
export const GET = withApiMetrics('/api/portal/requisitions', handleGET);
export const POST = withApiMetrics('/api/portal/requisitions', handlePOST);
