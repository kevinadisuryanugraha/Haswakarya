import { NextResponse } from 'next/server';
import { ContractStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { guardCapability } from '@/lib/auth/guard';
import {
  contractWindow,
  summarizeFleetCompliance,
  type ContractWindow,
} from '@/lib/maritime/contractCompliance';
import { withApiMetrics } from '@/lib/observability/withApiMetrics';

/**
 * Ringkasan kepatuhan masa kontrak ILO MLC 11 bulan untuk seluruh armada.
 * Dipakai dashboard crewing dan halaman kontrak. Kontrak yang sudah selesai
 * atau diakhiri tidak dihitung: pelanggaran MLC hanya relevan pada kontrak
 * yang masih berjalan.
 */
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const ACTIVE_CONTRACT_STATUSES: readonly ContractStatus[] = [
  ContractStatus.DRAFT,
  ContractStatus.AWAITING_SEAFARER_SIGN,
  ContractStatus.AWAITING_OWNER_SIGN,
  ContractStatus.ENDORSED_SYAHBANDAR,
  ContractStatus.ACTIVE_ONBOARD,
];

async function handleGET() {
  const access = await guardCapability('portal.operations', 'portal.admin');
  if (!access.ok) return access.response;

  const contracts = await prisma.employmentContractPKL.findMany({
    where: { status: { in: [...ACTIVE_CONTRACT_STATUSES] } },
    select: {
      id: true,
      contractNo: true,
      rank: true,
      status: true,
      signOnDate: true,
      durationMonths: true,
      vessel: { select: { id: true, name: true } },
      seafarer: {
        select: {
          id: true,
          seamanBookNo: true,
          user: { select: { fullName: true } },
        },
      },
    },
    orderBy: { signOnDate: 'asc' },
  });

  const rows: Array<{
    contractId: string;
    contractNo: string;
    rank: string;
    status: string;
    seafarerName: string;
    seamanBookNo: string;
    vesselName: string;
    compliance: ContractWindow;
  }> = contracts.map((contract) => ({
    contractId: contract.id,
    contractNo: contract.contractNo,
    rank: contract.rank,
    status: contract.status,
    seafarerName: contract.seafarer.user.fullName,
    seamanBookNo: contract.seafarer.seamanBookNo,
    vesselName: contract.vessel.name,
    compliance: contractWindow(contract.signOnDate, contract.durationMonths),
  }));

  return NextResponse.json(
    {
      success: true,
      summary: summarizeFleetCompliance(rows.map((row) => row.compliance)),
      contracts: rows,
    },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}

// Pembungkus metrics: status akhir hanya diketahui di dalam handler.
export const GET = withApiMetrics('/api/portal/compliance', handleGET);
