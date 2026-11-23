import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { guardCapability, forbiddenResponse } from "@/lib/auth/guard";
import { hasCapability } from "@/lib/auth/rbac";
import { MaritimeRank, ContractStatus } from "@prisma/client";
import { contractWindow } from "@/lib/maritime/contractCompliance";
import { withApiMetrics } from '@/lib/observability/withApiMetrics';

/** Kontrak yang sudah selesai/diakhiri tidak lagi dihitung untuk MLC 11 bulan. */
const TERMINAL_CONTRACT_STATUSES: readonly ContractStatus[] = [
  ContractStatus.COMPLETED,
  ContractStatus.TERMINATED_EARLY,
];

async function handleGET(req: NextRequest) {
  const access = await guardCapability("portal.admin", "portal.read_own");
  if (!access.ok) return access.response;

  const isStaff = hasCapability(access.session.role, "portal.admin");

  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") as ContractStatus | null;
    const vesselId = searchParams.get("vesselId");

    const whereClause: Record<string, unknown> = {};
    if (status && Object.values(ContractStatus).includes(status)) {
      whereClause.status = status;
    }
    if (vesselId) {
      whereClause.vesselId = vesselId;
    }

    if (!isStaff) {
      const own = await prisma.seafarerProfile.findUnique({
        where: { userId: access.session.userId },
        select: { id: true },
      });
      if (!own) {
        return forbiddenResponse("Forbidden: profil pelaut tidak terhubung ke akun ini.");
      }
      whereClause.seafarerId = own.id;
    }

    const contracts = await prisma.employmentContractPKL.findMany({
      where: whereClause,
      include: {
        seafarer: {
          include: {
            user: {
              select: {
                fullName: true,
                email: true,
                phone: true,
              },
            },
          },
        },
        vessel: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const data = contracts.map((contract) => ({
      ...contract,
      compliance: TERMINAL_CONTRACT_STATUSES.includes(contract.status)
        ? null
        : contractWindow(contract.signOnDate, contract.durationMonths),
    }));

    return NextResponse.json({
      success: true,
      total: data.length,
      data,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Internal Error";
    return NextResponse.json(
      { error: "Gagal mengambil data kontrak PKL.", details: errorMsg },
      { status: 500 }
    );
  }
}

async function handlePOST(req: NextRequest) {
  const access = await guardCapability("portal.admin");
  if (!access.ok) return access.response;
  const session = access.session;

  try {
    const body = await req.json();
    const {
      seafarerId,
      vesselId,
      rank,
      signOnDate,
      durationMonths = 6,
      monthlyBasicWageUsd,
      monthlyBasicWageIdr,
      allotmentPercentage = 80,
      onboardCashAdvance = 20,
      insurancePolicyNo,
      status = ContractStatus.DRAFT,
    } = body;

    if (!seafarerId || !vesselId || !rank || !signOnDate) {
      return NextResponse.json(
        { error: "Pelaut, Kapal, Jabatan, dan Tanggal Sign-On wajib diisi." },
        { status: 400 }
      );
    }

    const contractNo = `PKL-2026-HWK-${Date.now().toString().slice(-4)}`;

    const contract = await prisma.employmentContractPKL.create({
      data: {
        contractNo,
        seafarerId,
        vesselId,
        rank: rank as MaritimeRank,
        signOnDate: new Date(signOnDate),
        durationMonths: parseInt(durationMonths.toString(), 10) || 6,
        monthlyBasicWageUsd: monthlyBasicWageUsd ? parseFloat(monthlyBasicWageUsd.toString()) : null,
        monthlyBasicWageIdr: monthlyBasicWageIdr ? parseFloat(monthlyBasicWageIdr.toString()) : null,
        allotmentPercentage: parseFloat(allotmentPercentage.toString()) || 80,
        onboardCashAdvance: parseFloat(onboardCashAdvance.toString()) || 20,
        insurancePolicyNo: insurancePolicyNo?.trim() || `PI-WAR-HWK-${Date.now().toString().slice(-5)}`,
        status: Object.values(ContractStatus).includes(status) ? status : ContractStatus.DRAFT,
        pklPdfVaultPath: `/storage/vault/pkl/${contractNo}.pdf`,
      },
      include: {
        seafarer: {
          include: {
            user: { select: { fullName: true } },
          },
        },
        vessel: true,
      },
    });

    await prisma.auditTrail.create({
      data: {
        userId: session.userId,
        action: "PKL_CONTRACT_GENERATED",
        entityType: "EmploymentContractPKL",
        entityId: contract.id,
        details: JSON.stringify({
          contractNo: contract.contractNo,
          seafarer: contract.seafarer.user.fullName,
          vessel: contract.vessel.name,
          rank: contract.rank,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Kontrak Perjanjian Kerja Laut (PKL) berhasil digenerate.",
      data: contract,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Internal Error";
    return NextResponse.json(
      { error: "Gagal membuat kontrak PKL.", details: errorMsg },
      { status: 500 }
    );
  }
}

async function handlePATCH(req: NextRequest) {
  const access = await guardCapability("portal.admin");
  if (!access.ok) return access.response;
  const session = access.session;

  try {
    const body = await req.json();
    const { id, status } = body;

    if (!id || !status || !Object.values(ContractStatus).includes(status)) {
      return NextResponse.json(
        { error: "ID Kontrak dan status baru yang valid wajib disertakan." },
        { status: 400 }
      );
    }

    const updated = await prisma.employmentContractPKL.update({
      where: { id },
      data: { status },
      include: {
        seafarer: { include: { user: { select: { fullName: true } } } },
        vessel: true,
      },
    });

    await prisma.auditTrail.create({
      data: {
        userId: session.userId,
        action: "PKL_CONTRACT_STATUS_UPDATED",
        entityType: "EmploymentContractPKL",
        entityId: updated.id,
        details: JSON.stringify({
          contractNo: updated.contractNo,
          newStatus: status,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      message: `Status kontrak berhasil diubah menjadi ${status}.`,
      data: updated,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Internal Error";
    return NextResponse.json(
      { error: "Gagal memperbarui status kontrak PKL.", details: errorMsg },
      { status: 500 }
    );
  }
}

// Pembungkus metrics: status akhir hanya diketahui di dalam handler.
export const GET = withApiMetrics('/api/portal/pkl', handleGET);
export const POST = withApiMetrics('/api/portal/pkl', handlePOST);
export const PATCH = withApiMetrics('/api/portal/pkl', handlePATCH);
