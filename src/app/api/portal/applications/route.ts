import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { guardCapability } from '@/lib/auth/guard';
import { withApiMetrics } from '@/lib/observability/withApiMetrics';

/**
 * Direktori aplikasi ATS. Hanya staf internal yang boleh membaca seluruh
 * pipeline; data user dikirim dengan `select` eksplisit agar `passwordHash`
 * tidak pernah keluar dari server.
 */
async function handleGET() {
  const access = await guardCapability('portal.operations');
  if (!access.ok) return access.response;

  try {
    const applications = await prisma.crewApplication.findMany({
      select: {
        id: true,
        currentStage: true,
        source: true,
        matchScore: true,
        vettingToken: true,
        tokenExpiresAt: true,
        createdAt: true,
        updatedAt: true,
        seafarer: {
          select: {
            id: true,
            seamanBookNo: true,
            primaryRank: true,
            currentStatus: true,
            totalSeaTimeDays: true,
            marlinsScore: true,
            user: { select: { id: true, fullName: true, email: true, phone: true } },
            certificates: {
              select: {
                id: true,
                certName: true,
                category: true,
                expiryDate: true,
                isVerified: true,
              },
            },
          },
        },
        requisition: {
          select: {
            id: true,
            requisitionNo: true,
            rank: true,
            status: true,
            targetJoinDate: true,
            targetPort: true,
            vessel: { select: { id: true, name: true, vesselType: true, dwt: true, grt: true } },
          },
        },
        vetting: {
          select: {
            id: true,
            sireMatrixScore: true,
            recommendation: true,
            matrixSummary: true,
            verifiedByMaster: true,
            updatedAt: true,
          },
        },
        atsHistories: {
          orderBy: { createdAt: 'desc' },
          take: 5,
          select: {
            id: true,
            fromStage: true,
            toStage: true,
            remarks: true,
            createdAt: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json({ success: true, count: applications.length, data: applications });
  } catch (error) {
    console.error('[API Applications GET Error]', error);
    return NextResponse.json({ error: 'Gagal memuat aplikasi pelaut.' }, { status: 500 });
  }
}

// Pembungkus metrics: status akhir hanya diketahui di dalam handler.
export const GET = withApiMetrics('/api/portal/applications', handleGET);
