import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { forbiddenResponse, guardCapability } from '@/lib/auth/guard';
import { hasCapability } from '@/lib/auth/rbac';
import { buildBimcoCvDocument } from '@/lib/pdf/bimcoCv';
import { renderPdf } from '@/lib/pdf/pdfWriter';
import { logger } from '@/lib/observability/logger';
import { withApiMetrics } from '@/lib/observability/withApiMetrics';

/**
 * Unduh CV pelaut dalam format PDF (kerangka BIMCO).
 * Staf operasi boleh mengunduh semua; pelaut hanya miliknya sendiri.
 */
export const runtime = 'nodejs';

function fileNameFor(fullName: string, seamanBookNo: string): string {
  const slug = fullName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Za-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
  return `cv-${slug || 'pelaut'}-${seamanBookNo}.pdf`;
}

async function handleGET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const access = await guardCapability('portal.operations', 'portal.read_own');
  if (!access.ok) return access.response;

  const { id } = await params;

  const profile = await prisma.seafarerProfile.findUnique({
    where: { id },
    select: {
      id: true,
      userId: true,
      seamanBookNo: true,
      passportNo: true,
      sidNumber: true,
      primaryRank: true,
      dateOfBirth: true,
      placeOfBirth: true,
      homeAddress: true,
      emergencyContact: true,
      emergencyPhone: true,
      totalSeaTimeDays: true,
      marlinsScore: true,
      user: { select: { fullName: true, email: true, phone: true } },
      seaTimes: {
        select: {
          vesselName: true,
          imoNumber: true,
          vesselType: true,
          rankServed: true,
          signOnDate: true,
          signOffDate: true,
          totalDays: true,
        },
        orderBy: { signOnDate: 'desc' },
      },
      certificates: {
        select: {
          certName: true,
          category: true,
          certificateNo: true,
          issuingAuthority: true,
          expiryDate: true,
          isVerified: true,
        },
        orderBy: { expiryDate: 'asc' },
      },
      medicals: {
        select: {
          clinicName: true,
          examinationDate: true,
          expiryDate: true,
          overallStatus: true,
        },
        orderBy: { examinationDate: 'desc' },
        take: 3,
      },
    },
  });

  if (!profile) {
    return NextResponse.json({ error: 'Profil pelaut tidak ditemukan.' }, { status: 404 });
  }

  const isStaff = hasCapability(access.session.role, 'portal.operations');
  if (!isStaff && profile.userId !== access.session.userId) {
    return forbiddenResponse('Forbidden: Anda hanya dapat mengunduh CV sendiri.');
  }

  const document = buildBimcoCvDocument({
    fullName: profile.user.fullName,
    email: profile.user.email,
    phone: profile.user.phone,
    seamanBookNo: profile.seamanBookNo,
    passportNo: profile.passportNo,
    sidNumber: profile.sidNumber,
    primaryRank: profile.primaryRank,
    dateOfBirth: profile.dateOfBirth,
    placeOfBirth: profile.placeOfBirth,
    homeAddress: profile.homeAddress,
    emergencyContact: profile.emergencyContact,
    emergencyPhone: profile.emergencyPhone,
    totalSeaTimeDays: profile.totalSeaTimeDays,
    marlinsScore: profile.marlinsScore,
    seaTimes: profile.seaTimes,
    certificates: profile.certificates,
    medicals: profile.medicals.map((record) => ({
      clinicName: record.clinicName,
      examDate: record.examinationDate,
      validUntil: record.expiryDate,
      status: record.overallStatus,
    })),
  });

  const bytes = renderPdf(document);

  logger.info('pdf.cv_generated', {
    seafarerId: profile.id,
    bytes: bytes.length,
    actorId: access.session.userId,
  });

  return new NextResponse(new Uint8Array(bytes), {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${fileNameFor(
        profile.user.fullName,
        profile.seamanBookNo
      )}"`,
      'Content-Length': String(bytes.length),
      'Cache-Control': 'no-store',
    },
  });
}

// Pembungkus metrics: status akhir hanya diketahui di dalam handler.
export const GET = withApiMetrics('/api/portal/seafarers/:id/cv', handleGET);
