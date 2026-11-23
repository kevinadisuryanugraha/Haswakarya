import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { forbiddenResponse, guardCapability } from '@/lib/auth/guard';
import { hasCapability } from '@/lib/auth/rbac';
import { buildPklDocument } from '@/lib/pdf/pkl';
import { renderPdf } from '@/lib/pdf/pdfWriter';
import { logger } from '@/lib/observability/logger';
import { withApiMetrics } from '@/lib/observability/withApiMetrics';

/**
 * Unduh Perjanjian Kerja Laut (PKL) sebagai PDF.
 * Staf operasi/admin boleh mengunduh semua kontrak; pelaut hanya miliknya.
 */
export const runtime = 'nodejs';

async function handleGET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const access = await guardCapability('portal.operations', 'portal.admin', 'portal.read_own');
  if (!access.ok) return access.response;

  const { id } = await params;

  const contract = await prisma.employmentContractPKL.findUnique({
    where: { id },
    select: {
      id: true,
      contractNo: true,
      status: true,
      signOnDate: true,
      durationMonths: true,
      rank: true,
      monthlyBasicWageIdr: true,
      monthlyBasicWageUsd: true,
      allotmentPercentage: true,
      onboardCashAdvance: true,
      insurancePolicyNo: true,
      seafarer: {
        select: {
          userId: true,
          seamanBookNo: true,
          passportNo: true,
          dateOfBirth: true,
          placeOfBirth: true,
          homeAddress: true,
          user: { select: { fullName: true, email: true, phone: true } },
        },
      },
      vessel: {
        select: {
          name: true,
          imoNumber: true,
          callSign: true,
          flag: true,
          vesselType: true,
          grt: true,
          dwt: true,
          engineBhp: true,
          engineType: true,
          tradingArea: true,
          ownerName: true,
        },
      },
    },
  });

  if (!contract) {
    return NextResponse.json({ error: 'Kontrak PKL tidak ditemukan.' }, { status: 404 });
  }

  const isStaff = hasCapability(access.session.role, 'portal.operations');
  if (!isStaff && contract.seafarer.userId !== access.session.userId) {
    return forbiddenResponse('Forbidden: Anda hanya dapat mengunduh kontrak sendiri.');
  }

  const bytes = renderPdf(
    buildPklDocument({
      contractNo: contract.contractNo,
      status: contract.status,
      signOnDate: contract.signOnDate,
      durationMonths: contract.durationMonths,
      rank: contract.rank,
      monthlyBasicWageIdr: contract.monthlyBasicWageIdr,
      monthlyBasicWageUsd: contract.monthlyBasicWageUsd,
      allotmentPercentage: contract.allotmentPercentage,
      onboardCashAdvance: contract.onboardCashAdvance,
      insurancePolicyNo: contract.insurancePolicyNo,
      seafarer: {
        fullName: contract.seafarer.user.fullName,
        email: contract.seafarer.user.email,
        phone: contract.seafarer.user.phone,
        seamanBookNo: contract.seafarer.seamanBookNo,
        passportNo: contract.seafarer.passportNo,
        dateOfBirth: contract.seafarer.dateOfBirth,
        placeOfBirth: contract.seafarer.placeOfBirth,
        homeAddress: contract.seafarer.homeAddress,
      },
      vessel: contract.vessel,
    })
  );

  logger.info('pdf.pkl_generated', {
    contractId: contract.id,
    contractNo: contract.contractNo,
    bytes: bytes.length,
    actorId: access.session.userId,
  });

  return new NextResponse(new Uint8Array(bytes), {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${contract.contractNo}.pdf"`,
      'Content-Length': String(bytes.length),
      'Cache-Control': 'no-store',
    },
  });
}

// Pembungkus metrics: status akhir hanya diketahui di dalam handler.
export const GET = withApiMetrics('/api/portal/pkl/:id/pdf', handleGET);
