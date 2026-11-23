import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'node:crypto';
import { prisma } from '@/lib/prisma';
import { guardCapability } from '@/lib/auth/guard';
import { getClientIp } from '@/lib/security/clientIp';
import { logger } from '@/lib/observability/logger';
import { TOKEN_TTL_DAYS, tokenActionSchema } from '@/lib/validation/tokenAction';
import { withApiMetrics } from '@/lib/observability/withApiMetrics';

/**
 * Rotasi / revokasi token dossier vetting.
 * - `rotate`: token lama langsung mati, token baru + masa berlaku baru diterbitkan.
 * - `revoke`: tautan dimatikan tanpa pengganti (mis. kandidat gugur).
 * Setiap aksi tercatat di AuditTrail beserta pelaku dan alasannya.
 */

async function handlePOST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const access = await guardCapability('portal.operations');
  if (!access.ok) return access.response;

  const { id } = await params;

  const parsed = tokenActionSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Aksi tidak valid. Gunakan "rotate" atau "revoke".' },
      { status: 400 }
    );
  }

  const application = await prisma.crewApplication.findUnique({
    where: { id },
    select: { id: true, currentStage: true, vettingToken: true },
  });

  if (!application) {
    return NextResponse.json({ error: 'Lamaran tidak ditemukan.' }, { status: 404 });
  }

  const { action, reason } = parsed.data;
  const expiresAt =
    action === 'rotate' ? new Date(Date.now() + TOKEN_TTL_DAYS * 24 * 3600 * 1000) : null;
  const newToken = action === 'rotate' ? randomBytes(24).toString('base64url') : null;

  const updated = await prisma.$transaction(async (tx) => {
    const record = await tx.crewApplication.update({
      where: { id: application.id },
      data: { vettingToken: newToken, tokenExpiresAt: expiresAt },
      select: { id: true, vettingToken: true, tokenExpiresAt: true },
    });

    await tx.auditTrail.create({
      data: {
        userId: access.session.userId,
        action: action === 'rotate' ? 'VETTING_TOKEN_ROTATED' : 'VETTING_TOKEN_REVOKED',
        entityType: 'CrewApplication',
        entityId: application.id,
        ipAddress: getClientIp(req),
        userAgent: req.headers.get('user-agent') ?? 'Portal',
        details:
          action === 'rotate'
            ? `Token vetting diterbitkan ulang, berlaku sampai ${expiresAt?.toISOString()}.${reason ? ` Alasan: ${reason}` : ''}`
            : `Token vetting dicabut.${reason ? ` Alasan: ${reason}` : ''}`,
      },
    });

    return record;
  });

  logger.info('vetting_token.changed', {
    applicationId: application.id,
    action,
    actorId: access.session.userId,
    hadToken: Boolean(application.vettingToken),
  });

  return NextResponse.json(
    {
      success: true,
      action,
      applicationId: updated.id,
      vettingToken: updated.vettingToken,
      tokenExpiresAt: updated.tokenExpiresAt,
    },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}

// Pembungkus metrics: status akhir hanya diketahui di dalam handler.
export const POST = withApiMetrics('/api/portal/applications/:id/token', handlePOST);
