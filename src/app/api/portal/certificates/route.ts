import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { CertCategory } from "@prisma/client";
import { guardCapability, forbiddenResponse } from "@/lib/auth/guard";
import { hasCapability } from "@/lib/auth/rbac";
import { withApiMetrics } from '@/lib/observability/withApiMetrics';
import { classifyCertificateExpiry } from '@/lib/portal/overview';

async function handleGET(req: NextRequest) {
  const access = await guardCapability("portal.operations", "portal.read_own");
  if (!access.ok) return access.response;

  const isStaff = hasCapability(access.session.role, "portal.operations");

  try {
    const { searchParams } = new URL(req.url);
    let seafarerId = searchParams.get("seafarerId");
    const filterStatus = searchParams.get("status"); // "critical", "warning", "all"

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
    if (seafarerId) {
      whereClause.seafarerId = seafarerId;
    }

    const certs = await prisma.certificateSTCW.findMany({
      where: whereClause,
      include: {
        seafarer: {
          include: {
            user: {
              select: { fullName: true, email: true },
            },
          },
        },
      },
      orderBy: { expiryDate: "asc" },
    });

    const now = new Date();
    const formatted = certs.map((c) => {
      // Ambang dan klasifikasi tinggal di satu modul bersama dashboard.
      const { daysRemaining, expiryStatus } = classifyCertificateExpiry(c.expiryDate, now);

      return {
        id: c.id,
        seafarerId: c.seafarerId,
        seafarerName: c.seafarer?.user?.fullName || "Unknown Seafarer",
        category: c.category,
        certName: c.certName,
        certificateNo: c.certificateNo,
        issuingAuthority: c.issuingAuthority,
        issueDate: c.issueDate,
        expiryDate: c.expiryDate,
        daysRemaining,
        expiryStatus,
        isVerified: c.isVerified,
        // Path vault tidak diekspos ke klien; cukup ketahui ada atau tidak.
        hasFile: Boolean(c.fileVaultPath),
      };
    });

    let result = formatted;
    if (filterStatus === "critical") {
      result = formatted.filter((c) => c.expiryStatus === "CRITICAL_EXPIRED");
    } else if (filterStatus === "warning") {
      result = formatted.filter((c) => c.expiryStatus === "WARNING_EXPIRING_SOON");
    }

    return NextResponse.json({
      success: true,
      total: result.length,
      certificates: result,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Internal Error";
    return NextResponse.json(
      { error: "Gagal mengambil data sertifikat STCW.", details: errorMsg },
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
      category,
      certName,
      certificateNo,
      issuingAuthority,
      issueDate,
      expiryDate,
    } = body;

    if (!seafarerId || !certName || !certificateNo || !issueDate) {
      return NextResponse.json(
        { error: "Seafarer ID, Nama Sertifikat, Nomor, dan Tanggal Terbit wajib diisi." },
        { status: 400 }
      );
    }

    const validCategory = Object.values(CertCategory).includes(category)
      ? (category as CertCategory)
      : CertCategory.COP;

    const cert = await prisma.certificateSTCW.create({
      data: {
        seafarerId,
        category: validCategory,
        certName: certName.trim(),
        certificateNo: certificateNo.trim(),
        issuingAuthority: issuingAuthority?.trim() || "Direktorat Jenderal Perhubungan Laut RI",
        issueDate: new Date(issueDate),
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        isVerified: true,
        verifiedAt: new Date(),
        // `fileVaultPath` sengaja tidak diisi di sini: berkas hanya boleh
        // berasal dari unggahan nyata (POST .../file) agar tidak ada rujukan
        // ke dokumen yang tidak pernah ada.
      },
    });

    await prisma.auditTrail.create({
      data: {
        userId: session.userId,
        action: "STCW_CERTIFICATE_REGISTERED",
        entityType: "CertificateSTCW",
        entityId: cert.id,
        details: JSON.stringify({
          certName: cert.certName,
          certificateNo: cert.certificateNo,
          expiryDate: cert.expiryDate,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Sertifikat STCW berhasil ditambahkan ke Vault Dokumen.",
      certificate: cert,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Internal Error";
    return NextResponse.json(
      { error: "Gagal mendaftarkan sertifikat STCW.", details: errorMsg },
      { status: 500 }
    );
  }
}

// Pembungkus metrics: status akhir hanya diketahui di dalam handler.
export const GET = withApiMetrics('/api/portal/certificates', handleGET);
export const POST = withApiMetrics('/api/portal/certificates', handlePOST);
