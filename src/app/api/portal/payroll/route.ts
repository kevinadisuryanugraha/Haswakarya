import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { guardCapability, forbiddenResponse } from "@/lib/auth/guard";
import { hasCapability } from "@/lib/auth/rbac";
import { withApiMetrics } from '@/lib/observability/withApiMetrics';
import { computeMonthlyWithholding, isPtkpStatus, summarizeTaxPeriod } from '@/lib/tax/pph21';
import { maskNpwp, normalizeNpwp } from '@/lib/tax/npwp';

async function handleGET(req: NextRequest) {
  const access = await guardCapability("portal.admin", "portal.read_own");
  if (!access.ok) return access.response;

  const isStaff = hasCapability(access.session.role, "portal.admin");

  try {
    const { searchParams } = new URL(req.url);
    const month = searchParams.get("month");
    const year = searchParams.get("year");
    let seafarerId = searchParams.get("seafarerId");

    if (!isStaff) {
      const own = await prisma.seafarerProfile.findUnique({
        where: { userId: access.session.userId },
        select: { id: true },
      });
      if (!own) {
        return forbiddenResponse("Forbidden: profil pelaut tidak terhubung ke akun ini.");
      }
      seafarerId = own.id;
    }

    const whereClause: Record<string, unknown> = {};
    if (month) whereClause.periodMonth = parseInt(month, 10);
    if (year) whereClause.periodYear = parseInt(year, 10);
    if (seafarerId) whereClause.seafarerId = seafarerId;

    const payrolls = await prisma.payrollRecord.findMany({
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
      },
      orderBy: [
        { periodYear: "desc" },
        { periodMonth: "desc" },
        { createdAt: "desc" },
      ],
    });

    const tax = summarizeTaxPeriod(
      payrolls.map((p) => ({
        monthlyGross: p.taxableGross || p.totalGrossWage,
        pph21Amount: p.pph21Amount,
        npwp: p.npwpSnapshot,
      }))
    );

    const summary = {
      totalRecords: payrolls.length,
      totalGrossWage: payrolls.reduce((sum, p) => sum + p.totalGrossWage, 0),
      totalAllotments: payrolls.reduce((sum, p) => sum + p.allotmentAmount, 0),
      totalOnboardPaid: payrolls.reduce((sum, p) => sum + p.onboardPaidAmount, 0),
      disbursedCount: payrolls.filter((p) => p.isDisbursed).length,
      totalPph21: tax.totalPph21,
      totalNetWage: tax.totalNet,
      recordsMissingNpwp: tax.missingNpwpCount,
    };

    return NextResponse.json({
      success: true,
      summary,
      data: payrolls.map((p) => ({
        ...p,
        // NPWP penuh tidak pernah keluar ke klien; hanya bentuk ter-mask.
        npwpSnapshot: maskNpwp(p.npwpSnapshot),
        seafarer: {
          ...p.seafarer,
          npwp: maskNpwp(p.seafarer.npwp),
        },
      })),
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Internal Error";
    return NextResponse.json(
      { error: "Gagal mengambil data payroll & remittance.", details: errorMsg },
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
      periodMonth,
      periodYear,
      basicWage,
      leavePay = 0,
      overtimeAllowance = 0,
      dangerBonusCargo = 0,
      allotmentPercentage = 80,
      bankAccountTarget,
      isDisbursed = false,
    } = body;

    if (!seafarerId || !periodMonth || !periodYear || !basicWage) {
      return NextResponse.json(
        { error: "Pelaut, Periode Bulan/Tahun, dan Gaji Pokok wajib diisi." },
        { status: 400 }
      );
    }

    // Masa pajak harus 1..12; nilai di luar itu akan memicu koreksi Desember
    // palsu dan menyimpan baris payroll dengan bulan mustahil.
    const parsedMonth = parseInt(periodMonth.toString(), 10);
    const parsedYear = parseInt(periodYear.toString(), 10);
    if (!Number.isInteger(parsedMonth) || parsedMonth < 1 || parsedMonth > 12) {
      return NextResponse.json(
        { error: "Bulan periode tidak valid. Gunakan 1 sampai 12." },
        { status: 400 }
      );
    }
    if (!Number.isInteger(parsedYear) || parsedYear < 2000 || parsedYear > 2100) {
      return NextResponse.json(
        { error: "Tahun periode tidak valid. Gunakan 2000 sampai 2100." },
        { status: 400 }
      );
    }

    const parsedBasic = parseFloat(basicWage.toString());
    const parsedLeave = parseFloat(leavePay.toString()) || 0;
    const parsedOT = parseFloat(overtimeAllowance.toString()) || 0;
    const parsedDanger = parseFloat(dangerBonusCargo.toString()) || 0;
    const totalGrossWage = parsedBasic + parsedLeave + parsedOT + parsedDanger;

    const pct = Math.min(Math.max(parseFloat(allotmentPercentage.toString()) || 80, 0), 100);
    const allotmentAmount = Math.round(totalGrossWage * (pct / 100));
    const onboardPaidAmount = totalGrossWage - allotmentAmount;

    // ── PPh 21 ──────────────────────────────────────────────────────────────
    // Status pajak diambil dari profil pelaut (sumber kebenaran), tetapi boleh
    // ditimpa per-slip bila operator perlu koreksi satu masa saja.
    const profile = await prisma.seafarerProfile.findUnique({
      where: { id: seafarerId },
      select: { npwp: true, ptkpStatus: true },
    });
    if (!profile) {
      return NextResponse.json(
        { error: "Pelaut tidak ditemukan untuk perhitungan PPh 21." },
        { status: 400 }
      );
    }

    const npwpRaw = typeof body.npwp === "string" && body.npwp.trim() ? body.npwp : profile.npwp;
    const npwp = normalizeNpwp(npwpRaw);
    if (typeof npwpRaw === "string" && npwpRaw.trim() && !npwp) {
      return NextResponse.json(
        { error: "NPWP harus 15 atau 16 digit angka." },
        { status: 400 }
      );
    }

    if (body.ptkpStatus !== undefined && body.ptkpStatus !== null && body.ptkpStatus !== '' && !isPtkpStatus(body.ptkpStatus)) {
      return NextResponse.json(
        { error: "Status PTKP tidak dikenal. Gunakan TK0–TK3 atau K0–K3." },
        { status: 400 }
      );
    }
    const ptkpStatus = isPtkpStatus(body.ptkpStatus) ? body.ptkpStatus : profile.ptkpStatus;

    // Koreksi masa Desember butuh total yang sudah dipotong pada masa 1–11.
    const priorRecords =
      parsedMonth === 12
        ? await prisma.payrollRecord.findMany({
            where: { seafarerId, periodYear: parsedYear, periodMonth: { lt: 12 } },
            select: { pph21Amount: true },
          })
        : [];
    const priorWithheldTotal = priorRecords.reduce((sum, r) => sum + r.pph21Amount, 0);

    const withholding = computeMonthlyWithholding({
      monthlyGross: totalGrossWage,
      status: ptkpStatus,
      month: parsedMonth,
      priorWithheldTotal,
    });
    const pph21Amount = withholding.amount;
    const netWage = totalGrossWage - pph21Amount;

    const record = await prisma.payrollRecord.upsert({
      where: {
        seafarerId_periodMonth_periodYear: {
          seafarerId,
          periodMonth: parsedMonth,
          periodYear: parsedYear,
        },
      },
      update: {
        basicWage: parsedBasic,
        leavePay: parsedLeave,
        overtimeAllowance: parsedOT,
        dangerBonusCargo: parsedDanger,
        totalGrossWage,
        allotmentAmount,
        onboardPaidAmount,
        taxableGross: totalGrossWage,
        pph21Amount,
        netWage,
        npwpSnapshot: npwp,
        ptkpSnapshot: ptkpStatus,
        bankAccountTarget: bankAccountTarget?.trim() || "Bank Mandiri 109-00-1827364-1 (Istri)",
        isDisbursed: Boolean(isDisbursed),
        disbursedAt: isDisbursed ? new Date() : null,
      },
      create: {
        seafarerId,
        periodMonth: parsedMonth,
        periodYear: parsedYear,
        basicWage: parsedBasic,
        leavePay: parsedLeave,
        overtimeAllowance: parsedOT,
        dangerBonusCargo: parsedDanger,
        totalGrossWage,
        allotmentAmount,
        onboardPaidAmount,
        taxableGross: totalGrossWage,
        pph21Amount,
        netWage,
        npwpSnapshot: npwp,
        ptkpSnapshot: ptkpStatus,
        bankAccountTarget: bankAccountTarget?.trim() || "Bank Mandiri 109-00-1827364-1 (Istri)",
        isDisbursed: Boolean(isDisbursed),
        disbursedAt: isDisbursed ? new Date() : null,
      },
      include: {
        seafarer: {
          include: {
            user: { select: { fullName: true } },
          },
        },
      },
    });

    await prisma.auditTrail.create({
      data: {
        userId: session.userId,
        action: "CREW_PAYROLL_GENERATED",
        entityType: "PayrollRecord",
        entityId: record.id,
        details: JSON.stringify({
          seafarer: record.seafarer.user.fullName,
          period: `${record.periodMonth}/${record.periodYear}`,
          grossWage: record.totalGrossWage,
          allotment: record.allotmentAmount,
          pph21: record.pph21Amount,
          netWage: record.netWage,
          ptkpStatus: record.ptkpSnapshot,
          hasNpwp: Boolean(record.npwpSnapshot),
          correction: withholding.isCorrection,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      message: `Slip payroll & PPh 21 (${withholding.status}) berhasil dihitung. PPh 21 masa ini: Rp${pph21Amount.toLocaleString("id-ID")}.`,
      data: { ...record, npwpSnapshot: maskNpwp(record.npwpSnapshot) },
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Internal Error";
    return NextResponse.json(
      { error: "Gagal menyimpan perhitungan payroll.", details: errorMsg },
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
    const { id, isDisbursed } = body;

    if (!id) {
      return NextResponse.json({ error: "ID Payroll Record wajib disertakan." }, { status: 400 });
    }

    const updated = await prisma.payrollRecord.update({
      where: { id },
      data: {
        isDisbursed: Boolean(isDisbursed),
        disbursedAt: isDisbursed ? new Date() : null,
      },
      include: {
        seafarer: { include: { user: { select: { fullName: true } } } },
      },
    });

    await prisma.auditTrail.create({
      data: {
        userId: session.userId,
        action: isDisbursed ? "CREW_PAYROLL_DISBURSED" : "CREW_PAYROLL_REOPENED",
        entityType: "PayrollRecord",
        entityId: updated.id,
        details: JSON.stringify({
          seafarer: updated.seafarer.user.fullName,
          allotment: updated.allotmentAmount,
          isDisbursed,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      message: isDisbursed
        ? "Remittance keluarga pelaut berhasil disetujui & disalurkan (Disbursed)."
        : "Status payroll dikembalikan ke antrian pending.",
      data: updated,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Internal Error";
    return NextResponse.json(
      { error: "Gagal memperbarui status disbursement.", details: errorMsg },
      { status: 500 }
    );
  }
}

// Pembungkus metrics: status akhir hanya diketahui di dalam handler.
export const GET = withApiMetrics('/api/portal/payroll', handleGET);
export const POST = withApiMetrics('/api/portal/payroll', handlePOST);
export const PATCH = withApiMetrics('/api/portal/payroll', handlePATCH);
