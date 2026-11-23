import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { guardCapability } from "@/lib/auth/guard";
import { withApiMetrics } from "@/lib/observability/withApiMetrics";
import { buildEbupotCsv, summarizeTaxPeriod } from "@/lib/tax/pph21";
import { maskNpwp } from "@/lib/tax/npwp";

function parsePeriod(rawMonth: string | null, rawYear: string | null): { month: number; year: number } | null {
  const now = new Date();
  const month = rawMonth ? Number.parseInt(rawMonth, 10) : now.getUTCMonth() + 1;
  const year = rawYear ? Number.parseInt(rawYear, 10) : now.getUTCFullYear();

  if (!Number.isInteger(month) || month < 1 || month > 12) return null;
  if (!Number.isInteger(year) || year < 2000 || year > now.getUTCFullYear() + 1) return null;
  return { month, year };
}

async function handleGET(req: NextRequest) {
  const access = await guardCapability("portal.admin");
  if (!access.ok) return access.response;
  const session = access.session;

  const { searchParams } = new URL(req.url);
  const period = parsePeriod(searchParams.get("month"), searchParams.get("year"));
  if (!period) {
    return NextResponse.json(
      { error: "Masa pajak tidak valid. Gunakan month=1..12 dan year=YYYY." },
      { status: 400 }
    );
  }

  const format = searchParams.get("format") ?? "json";
  if (format !== "json" && format !== "csv") {
    return NextResponse.json(
      { error: "Format tidak dikenal. Gunakan format=json atau format=csv." },
      { status: 400 }
    );
  }

  try {
    const records = await prisma.payrollRecord.findMany({
      where: { periodMonth: period.month, periodYear: period.year },
      include: {
        seafarer: {
          select: {
            npwp: true,
            ptkpStatus: true,
            user: { select: { fullName: true } },
          },
        },
      },
      orderBy: [{ seafarer: { user: { fullName: "asc" } } }],
    });

    const rawRows = records.map((record) => ({
      npwp: record.npwpSnapshot ?? record.seafarer.npwp,
      monthlyGross: record.taxableGross || record.totalGrossWage,
      pph21Amount: record.pph21Amount,
    }));

    const rows = records.map((record, index) => ({
      id: record.id,
      name: record.seafarer.user.fullName,
      npwpMasked: maskNpwp(rawRows[index].npwp),
      npwpMissing: !rawRows[index].npwp,
      ptkpStatus: record.ptkpSnapshot ?? record.seafarer.ptkpStatus,
      gross: rawRows[index].monthlyGross,
      pph21Amount: record.pph21Amount,
      netWage: record.netWage || record.totalGrossWage - record.pph21Amount,
      isDisbursed: record.isDisbursed,
    }));

    const summary = summarizeTaxPeriod(rawRows);

    if (format === "csv") {
      const csv = buildEbupotCsv(
        records.map((record) => ({
          npwp: record.npwpSnapshot ?? record.seafarer.npwp,
          name: record.seafarer.user.fullName,
          periodMonth: record.periodMonth,
          periodYear: record.periodYear,
          gross: record.taxableGross || record.totalGrossWage,
          tax: record.pph21Amount,
        }))
      );

      await prisma.auditTrail.create({
        data: {
          userId: session.userId,
          action: "CREW_PAYROLL_TAX_EXPORTED",
          entityType: "PayrollRecord",
          entityId: `period-${period.year}-${String(period.month).padStart(2, "0")}`,
          details: JSON.stringify({
            period: `${period.month}/${period.year}`,
            rows: records.length,
            totalPph21: summary.totalPph21,
          }),
        },
      });

      const filename = `ebupot-pph21-${period.year}-${String(period.month).padStart(2, "0")}.csv`;
      return new NextResponse(csv, {
        status: 200,
        headers: {
          "content-type": "text/csv; charset=utf-8",
          "content-disposition": `attachment; filename="${filename}"`,
          "cache-control": "private, no-store",
          "x-content-type-options": "nosniff",
        },
      });
    }

    return NextResponse.json({
      success: true,
      period: { month: period.month, year: period.year },
      summary,
      data: rows,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Internal Error";
    return NextResponse.json(
      { error: "Gagal menyusun ringkasan PPh 21.", details: errorMsg },
      { status: 500 }
    );
  }
}

export const GET = withApiMetrics("/api/portal/payroll/tax-summary", handleGET);
