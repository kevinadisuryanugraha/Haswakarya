import { z } from 'zod';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * Haswakarya Crewing OS — Validasi filter Jejak Audit
 * Dipakai `GET /api/portal/audit`. Modul murni agar dapat diuji tanpa server.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/** Parameter kosong (`?a=`) diperlakukan sebagai "tidak memfilter". */
const optionalText = (max: number) =>
  z.preprocess(
    (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
    z.string().trim().min(1).max(max).optional()
  );

const optionalDate = z.preprocess(
  (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
  z.coerce.date({ invalid_type_error: 'tanggal tidak valid' }).optional()
);

export const AUDIT_DEFAULT_LIMIT = 50;
export const AUDIT_MAX_LIMIT = 100;

export const auditQuerySchema = z
  .object({
    entityType: optionalText(80),
    entityId: optionalText(120),
    action: optionalText(80),
    actorId: z
      .preprocess(
        (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
        z.string().uuid('actorId harus UUID').optional()
      ),
    from: optionalDate,
    to: optionalDate,
    cursor: z
      .preprocess(
        (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
        z.string().uuid('cursor harus UUID').optional()
      ),
    limit: z.preprocess(
      (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
      z.coerce
        .number()
        .int('limit harus bilangan bulat')
        .min(1, 'limit minimal 1')
        .max(AUDIT_MAX_LIMIT, `limit maksimal ${AUDIT_MAX_LIMIT}`)
        .default(AUDIT_DEFAULT_LIMIT)
    ),
  })
  .refine((value) => !value.from || !value.to || value.from.getTime() <= value.to.getTime(), {
    message: 'rentang tanggal terbalik: `from` harus lebih awal dari `to`',
    path: ['from'],
  });

export type AuditQuery = z.infer<typeof auditQuerySchema>;

export type AuditQueryParseResult =
  | { ok: true; query: AuditQuery }
  | { ok: false; errors: string[] };

/** Mengurai query string menjadi filter tervalidasi. */
export function parseAuditQuery(params: URLSearchParams): AuditQueryParseResult {
  const raw: Record<string, string> = {};
  for (const key of ['entityType', 'entityId', 'action', 'actorId', 'from', 'to', 'cursor', 'limit']) {
    const value = params.get(key);
    if (value !== null) raw[key] = value;
  }

  const parsed = auditQuerySchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      errors: parsed.error.issues.map((issue) => {
        const field = issue.path.join('.') || 'query';
        return `${field}: ${issue.message}`;
      }),
    };
  }

  return { ok: true, query: parsed.data };
}

/** Filter siap pakai untuk `prisma.auditTrail.findMany`. */
export function toAuditWhere(query: Omit<AuditQuery, 'limit' | 'cursor'>): {
  entityType?: string;
  entityId?: string;
  action?: string;
  userId?: string;
  createdAt?: { gte?: Date; lte?: Date };
} {
  const where: ReturnType<typeof toAuditWhere> = {};
  if (query.entityType) where.entityType = query.entityType;
  if (query.entityId) where.entityId = query.entityId;
  if (query.action) where.action = query.action;
  if (query.actorId) where.userId = query.actorId;

  if (query.from || query.to) {
    where.createdAt = {};
    if (query.from) where.createdAt.gte = query.from;
    if (query.to) where.createdAt.lte = query.to;
  }

  return where;
}