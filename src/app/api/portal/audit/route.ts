import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { guardCapability } from '@/lib/auth/guard';
import { parseAuditQuery, toAuditWhere } from '@/lib/validation/auditQuery';
import { logger } from '@/lib/observability/logger';
import { withApiMetrics } from '@/lib/observability/withApiMetrics';

/**
 * GET /api/portal/audit — Jejak audit yang dapat dibaca auditor.
 *
 * Hanya `portal.admin` (SUPERADMIN, CREWING_MANAGER). Paginasi cursor
 * (`?cursor=<uuid>`), urut terbaru dulu. `details` disimpan sebagai string
 * JSON di database dan dikembalikan sebagai objek agar mudah dibaca UI.
 */
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const MAX_DETAILS_LENGTH = 2_000;

function parseDetails(raw: string | null): unknown {
  if (!raw) return null;
  if (raw.length > MAX_DETAILS_LENGTH) {
    return { truncated: true, preview: raw.slice(0, MAX_DETAILS_LENGTH) };
  }
  try {
    return JSON.parse(raw);
  } catch {
    return { raw };
  }
}

async function handleGET(req: NextRequest) {
  const access = await guardCapability('portal.admin');
  if (!access.ok) return access.response;

  const parsed = parseAuditQuery(req.nextUrl.searchParams);
  if (!parsed.ok) {
    return NextResponse.json(
      { success: false, error: 'Filter jejak audit tidak valid.', details: parsed.errors },
      { status: 400 }
    );
  }

  const { cursor, limit, ...filters } = parsed.query;

  try {
    const rows = await prisma.auditTrail.findMany({
      where: toAuditWhere(filters),
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      include: {
        user: { select: { id: true, fullName: true, email: true, role: true } },
      },
    });

    const hasMore = rows.length > limit;
    const page = hasMore ? rows.slice(0, limit) : rows;

    const items = page.map((row) => ({
      id: row.id,
      action: row.action,
      entityType: row.entityType,
      entityId: row.entityId,
      details: parseDetails(row.details),
      ipAddress: row.ipAddress,
      userAgent: row.userAgent ? row.userAgent.slice(0, 180) : null,
      createdAt: row.createdAt,
      actor: row.user
        ? {
            id: row.user.id,
            fullName: row.user.fullName,
            email: row.user.email,
            role: row.user.role,
          }
        : null,
    }));

    return NextResponse.json(
      {
        success: true,
        items,
        nextCursor: hasMore ? (page.at(-1)?.id ?? null) : null,
        filters: {
          entityType: filters.entityType ?? null,
          entityId: filters.entityId ?? null,
          action: filters.action ?? null,
          actorId: filters.actorId ?? null,
          from: filters.from ?? null,
          to: filters.to ?? null,
          limit,
        },
      },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error) {
    logger.error('audit.list_failed', {
      message: error instanceof Error ? error.message : String(error),
      actorId: access.session.userId,
    });
    return NextResponse.json(
      { success: false, error: 'Gagal membaca jejak audit.' },
      { status: 500 }
    );
  }
}

// Pembungkus metrics: status akhir hanya diketahui di dalam handler.
export const GET = withApiMetrics('/api/portal/audit', handleGET);
