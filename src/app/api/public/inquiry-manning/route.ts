import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  formatZodError,
  manningInquirySchema,
  readJson,
} from '@/lib/validation/publicForms';
import { getClientIp, rateLimitKey } from '@/lib/security/clientIp';
import { rateLimitHeaders } from '@/lib/security/rateLimit';
import { consume } from '@/lib/security/limiter';
import { withApiMetrics } from '@/lib/observability/withApiMetrics';

/**
 * Inquiry manning dari shipowner/principal.
 * - Dicatat sebagai lead (ManningInquiry), BUKAN vessel + requisition palsu.
 * - Nomor IMO tidak lagi dikarang; lead dikonversi manual oleh tim crewing
 *   setelah verifikasi dokumen.
 */
async function handlePOST(req: NextRequest) {
  const ip = getClientIp(req);
  const limiter = await consume('public-form', rateLimitKey(ip, 'inquiry-manning'));
  const headers = rateLimitHeaders(limiter);

  if (!limiter.allowed) {
    return NextResponse.json(
      {
        error: 'Terlalu banyak permintaan dari jaringan ini. Coba lagi beberapa menit lagi.',
        retryAfterSeconds: limiter.retryAfterSeconds,
      },
      { status: 429, headers }
    );
  }

  const payload = await readJson(req);
  const parsed = manningInquirySchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: formatZodError(parsed.error), details: parsed.error.issues.map((i) => i.path.join('.')) },
      { status: 400, headers }
    );
  }

  const input = parsed.data;

  try {
    const joiningDate = input.expectedJoiningDate ? new Date(input.expectedJoiningDate) : null;

    const inquiry = await prisma.manningInquiry.create({
      data: {
        companyName: input.companyName,
        contactPerson: input.contactPerson,
        workEmail: input.workEmail,
        phoneWhatsApp: input.phoneWhatsApp ?? null,
        vesselName: input.vesselName ?? null,
        imoNumber: input.imoNumber ? input.imoNumber.replace(/^IMO\s*/i, '') : null,
        vesselType: input.vesselType ?? null,
        targetRanks: input.targetRanks ?? null,
        joinPort: input.joinPort ?? null,
        expectedJoiningDate:
          joiningDate && !Number.isNaN(joiningDate.getTime()) ? joiningDate : null,
        notes: input.notes ?? null,
        status: 'NEW',
      },
      select: { id: true, companyName: true, workEmail: true, createdAt: true },
    });

    await prisma.auditTrail.create({
      data: {
        action: 'PUBLIC_MANNING_INQUIRY',
        entityType: 'ManningInquiry',
        entityId: inquiry.id,
        ipAddress: ip,
        userAgent: req.headers.get('user-agent') ?? 'Web Browser',
        details: JSON.stringify({
          companyName: inquiry.companyName,
          workEmail: inquiry.workEmail,
          vesselName: input.vesselName ?? null,
          targetRanks: input.targetRanks ?? null,
        }),
      },
    });

    return NextResponse.json(
      {
        success: true,
        message:
          'Permintaan manning Anda sudah kami terima. Tim crewing Haswakarya akan menghubungi Anda dalam 1x24 jam kerja.',
        inquiryId: inquiry.id,
      },
      { status: 201, headers }
    );
  } catch (error) {
    console.error('[Public Manning Inquiry Error]', error);
    return NextResponse.json(
      { error: 'Gagal memproses permintaan manning. Silakan coba lagi.' },
      { status: 500, headers }
    );
  }
}

// Pembungkus metrics: status akhir hanya diketahui di dalam handler.
export const POST = withApiMetrics('/api/public/inquiry-manning', handlePOST);
