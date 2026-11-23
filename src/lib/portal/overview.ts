import { prisma } from '@/lib/prisma';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * Haswakarya Crewing OS — Agregator Ringkasan Operasional
 * ═══════════════════════════════════════════════════════════════════════════
 * Satu sumber kebenaran untuk angka dashboard. Dipakai oleh:
 *   • `GET /api/portal/stats` (klien lain / integrasi)
 *   • `app/(portal)/portal/page.tsx` (render server, tanpa skeleton)
 *
 * Semua query dijalankan paralel dalam satu gelombang `Promise.all`, sehingga
 * latensi halaman = latensi query terlambat, bukan jumlah seluruh query.
 */

/** Ambang peringatan sertifikat STCW (hari). */
export const CERT_WARNING_DAYS = 90;
export const CERT_CRITICAL_DAYS = 30;

const PASSING_RECOMMENDATIONS = ['STRONGLY_APPROVED', 'APPROVED_WITH_CONDITIONS'];

export type CertificateHealth = 'LIFETIME' | 'VALID' | 'WARNING_EXPIRING_SOON' | 'CRITICAL_EXPIRED';

/** Tentukan status kedaluwarsa dari selisih hari (murni, tanpa I/O). */
export function classifyCertificateExpiry(
  expiryDate: Date | string | null | undefined,
  now: Date = new Date()
): { daysRemaining: number | null; expiryStatus: CertificateHealth } {
  if (!expiryDate) {
    return { daysRemaining: null, expiryStatus: 'LIFETIME' };
  }
  const daysRemaining = Math.ceil(
    (new Date(expiryDate).getTime() - now.getTime()) / (1000 * 3600 * 24)
  );
  if (daysRemaining <= CERT_CRITICAL_DAYS) {
    return { daysRemaining, expiryStatus: 'CRITICAL_EXPIRED' };
  }
  if (daysRemaining <= CERT_WARNING_DAYS) {
    return { daysRemaining, expiryStatus: 'WARNING_EXPIRING_SOON' };
  }
  return { daysRemaining, expiryStatus: 'VALID' };
}

export interface PortalStats {
  totalVessels: number;
  totalSeafarers: number;
  activeRequisitions: number;
  vesselsWithVacancy: number;
  safeManningCompliancePercent: number;
  sireMatrixPassRate: number | null;
  sireMatrixAssessedCount: number;
  stages: Record<string, number>;
  urgentRequisitions: unknown[];
  recentAudits: unknown[];
  generatedAt: string;
}

export async function computePortalStats(): Promise<PortalStats> {
  const [
    totalVessels,
    totalSeafarers,
    activeRequisitions,
    urgentRequisitions,
    stageCounts,
    recentAudits,
    openRequisitionSlots,
    vettingTotal,
    vettingPassing,
  ] = await Promise.all([
    prisma.vessel.count(),
    prisma.seafarerProfile.count(),
    prisma.crewRequisition.count({ where: { status: 'OPEN' } }),
    prisma.crewRequisition.findMany({
      take: 5,
      where: { status: 'OPEN' },
      orderBy: { targetJoinDate: 'asc' },
      select: {
        id: true,
        requisitionNo: true,
        rank: true,
        requiredQuantity: true,
        targetJoinDate: true,
        targetPort: true,
        status: true,
        vessel: { select: { id: true, name: true, vesselType: true, dwt: true } },
      },
    }),
    prisma.crewApplication.groupBy({
      by: ['currentStage'],
      _count: { _all: true },
    }),
    prisma.auditTrail.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        action: true,
        entityType: true,
        entityId: true,
        details: true,
        createdAt: true,
        ipAddress: true,
        user: { select: { id: true, fullName: true, email: true, role: true } },
      },
    }),
    prisma.crewRequisition.findMany({
      where: { status: 'OPEN' },
      select: { vesselId: true },
      distinct: ['vesselId'],
    }),
    prisma.vettingAssessment.count(),
    prisma.vettingAssessment.count({
      where: { recommendation: { in: PASSING_RECOMMENDATIONS as never[] } },
    }),
  ]);

  const stages: Record<string, number> = {};
  stageCounts.forEach((row) => {
    stages[row.currentStage] = row._count._all;
  });

  const vesselsWithVacancy = openRequisitionSlots.length;
  const safeManningCompliancePercent =
    totalVessels === 0
      ? 0
      : Math.round(((totalVessels - vesselsWithVacancy) / totalVessels) * 1000) / 10;

  const sireMatrixPassRate =
    vettingTotal === 0 ? null : Math.round((vettingPassing / vettingTotal) * 1000) / 10;

  return {
    totalVessels,
    totalSeafarers,
    activeRequisitions,
    vesselsWithVacancy,
    safeManningCompliancePercent,
    sireMatrixPassRate,
    sireMatrixAssessedCount: vettingTotal,
    stages,
    urgentRequisitions,
    recentAudits,
    generatedAt: new Date().toISOString(),
  };
}

export interface CertificateAlert {
  id: string;
  seafarerName: string;
  certName: string;
  certificateNo: string;
  expiryDate: Date | null;
  daysRemaining: number | null;
  expiryStatus: CertificateHealth;
}

/**
 * Sertifikat yang kedaluwarsa atau akan habis dalam `CERT_WARNING_DAYS` hari.
 * Hanya kolom yang dipakai dashboard yang diambil — bukan seluruh tabel.
 */
export async function computeCertificateAlerts(
  seafarerId?: string | null,
  now: Date = new Date()
): Promise<CertificateAlert[]> {
  const certs = await prisma.certificateSTCW.findMany({
    where: {
      ...(seafarerId ? { seafarerId } : {}),
      expiryDate: {
        not: null,
        // Ambang dihitung di SQL: baris yang masih jauh tidak perlu dikirim.
        lte: new Date(now.getTime() + CERT_WARNING_DAYS * 24 * 3600 * 1000),
      },
    },
    orderBy: { expiryDate: 'asc' },
    select: {
      id: true,
      certName: true,
      certificateNo: true,
      expiryDate: true,
      seafarer: { select: { user: { select: { fullName: true } } } },
    },
  });

  return certs.map((c) => {
    const { daysRemaining, expiryStatus } = classifyCertificateExpiry(c.expiryDate, now);
    return {
      id: c.id,
      seafarerName: c.seafarer?.user?.fullName || 'Unknown Seafarer',
      certName: c.certName,
      certificateNo: c.certificateNo,
      expiryDate: c.expiryDate,
      daysRemaining,
      expiryStatus,
    };
  });
}

/** Muat seluruh data yang dibutuhkan halaman ringkasan dalam satu gelombang. */
export async function loadPortalOverview(): Promise<{
  stats: PortalStats;
  certificates: CertificateAlert[];
}> {
  const [stats, certificates] = await Promise.all([
    computePortalStats(),
    computeCertificateAlerts(),
  ]);
  return { stats, certificates };
}