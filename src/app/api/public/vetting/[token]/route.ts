import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { buildVettingDossier } from '@/lib/vetting/dossier';
import { withApiMetrics } from '@/lib/observability/withApiMetrics';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * Endpoint publik dossier vetting shipowner.
 * Token adalah kredensial satu-satunya; tidak perlu login. Semua data diambil
 * dari ATS nyata (CrewApplication + SeaTime + STCW + Vessel).
 */
async function handleGET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const cleanToken = token?.trim();

  if (!cleanToken || cleanToken.length < 6) {
    return NextResponse.json(
      { error: 'Token vetting tidak valid.', tokenState: 'INVALID' },
      { status: 400 }
    );
  }

  try {
    const application = await prisma.crewApplication.findUnique({
      where: { vettingToken: cleanToken },
      select: {
        id: true,
        vettingToken: true,
        tokenExpiresAt: true,
        currentStage: true,
        seafarer: {
          select: {
            user: { select: { fullName: true } },
            seamanBookNo: true,
            passportNo: true,
            sidNumber: true,
            primaryRank: true,
            totalSeaTimeDays: true,
            marlinsScore: true,
            certificates: {
              orderBy: { expiryDate: 'asc' },
              select: {
                certName: true,
                category: true,
                issuingAuthority: true,
                expiryDate: true,
                isVerified: true,
              },
            },
            seaTimes: {
              orderBy: { signOnDate: 'desc' },
              select: {
                vesselName: true,
                imoNumber: true,
                vesselType: true,
                grt: true,
                dwt: true,
                rankServed: true,
                signOnDate: true,
                signOffDate: true,
                totalDays: true,
              },
            },
          },
        },
        requisition: {
          select: {
            vessel: {
              select: {
                name: true,
                vesselType: true,
                dwt: true,
                grt: true,
                engineBhp: true,
              },
            },
          },
        },
        vetting: {
          select: {
            recommendation: true,
            sireMatrixScore: true,
            matrixSummary: true,
            verifiedByMaster: true,
            updatedAt: true,
          },
        },
      },
    });

    if (!application) {
      return NextResponse.json(
        { error: 'Token vetting tidak terdaftar pada sistem.', tokenState: 'INVALID' },
        { status: 404 }
      );
    }

    const dossier = buildVettingDossier(
      {
        token: cleanToken,
        tokenExpiresAt: application.tokenExpiresAt,
        seafarer: {
          fullName: application.seafarer.user.fullName,
          seamanBookNo: application.seafarer.seamanBookNo,
          passportNo: application.seafarer.passportNo,
          sidNumber: application.seafarer.sidNumber,
          primaryRank: application.seafarer.primaryRank,
          totalSeaTimeDays: application.seafarer.totalSeaTimeDays,
          marlinsScore: application.seafarer.marlinsScore,
          certificates: application.seafarer.certificates,
          seaTimes: application.seafarer.seaTimes,
        },
        targetVessel: application.requisition?.vessel ?? null,
        vetting: application.vetting,
      },
      new Date()
    );

    return NextResponse.json(
      { success: true, dossier },
      {
        status: dossier.tokenState === 'EXPIRED' ? 410 : 200,
        headers: { 'Cache-Control': 'no-store' },
      }
    );
  } catch (error) {
    console.error('[API Vetting Dossier Error]', error);
    return NextResponse.json({ error: 'Gagal memuat dossier vetting.' }, { status: 500 });
  }
}

// Pembungkus metrics: status akhir hanya diketahui di dalam handler.
export const GET = withApiMetrics('/api/public/vetting/:token', handleGET);
