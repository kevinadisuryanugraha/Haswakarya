import { describe, expect, it } from 'vitest';
import {
  AUDIT_DEFAULT_LIMIT,
  AUDIT_MAX_LIMIT,
  parseAuditQuery,
  toAuditWhere,
} from '@/lib/validation/auditQuery';

const UUID = '3f0d7c1e-8f2a-4b6d-9c11-2a7b5e9f0c33';

function query(params: Record<string, string>): URLSearchParams {
  return new URLSearchParams(params);
}

describe('parseAuditQuery', () => {
  it('memberi nilai default saat query kosong', () => {
    const result = parseAuditQuery(query({}));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.query.limit).toBe(AUDIT_DEFAULT_LIMIT);
    expect(result.query.entityType).toBeUndefined();
  });

  it('memperlakukan parameter kosong sebagai tanpa filter', () => {
    const result = parseAuditQuery(query({ entityType: '', action: '  ', entityId: '' }));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.query.entityType).toBeUndefined();
    expect(result.query.action).toBeUndefined();
    expect(result.query.entityId).toBeUndefined();
  });

  it('menerima filter lengkap', () => {
    const result = parseAuditQuery(
      query({
        entityType: 'CrewApplication',
        entityId: UUID,
        action: 'STAGE_TRANSITION',
        actorId: UUID,
        from: '2026-11-01T00:00:00Z',
        to: '2026-11-21T00:00:00Z',
        limit: '20',
      })
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.query.entityType).toBe('CrewApplication');
    expect(result.query.limit).toBe(20);
    expect(result.query.from?.toISOString()).toBe('2026-11-01T00:00:00.000Z');
  });

  it('memangkas spasi pada nilai teks', () => {
    const result = parseAuditQuery(query({ action: '  MATRIX_EVALUATED  ' }));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.query.action).toBe('MATRIX_EVALUATED');
  });

  it('menolak limit di luar batas', () => {
    const tooBig = parseAuditQuery(query({ limit: '500' }));
    const zero = parseAuditQuery(query({ limit: '0' }));
    expect(tooBig.ok).toBe(false);
    expect(zero.ok).toBe(false);
    if (tooBig.ok) return;
    expect(tooBig.errors.join(' ')).toContain(`maksimal ${AUDIT_MAX_LIMIT}`);
  });

  it('menolak limit bukan bilangan bulat', () => {
    const result = parseAuditQuery(query({ limit: '12.5' }));
    expect(result.ok).toBe(false);
  });

  it('menolak cursor/actorId yang bukan UUID', () => {
    expect(parseAuditQuery(query({ cursor: 'abc' })).ok).toBe(false);
    expect(parseAuditQuery(query({ actorId: 'user-1' })).ok).toBe(false);
  });

  it('menolak rentang tanggal terbalik', () => {
    const result = parseAuditQuery(
      query({ from: '2026-11-21T00:00:00Z', to: '2026-11-01T00:00:00Z' })
    );
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors.join(' ')).toContain('rentang tanggal terbalik');
  });

  it('menolak tanggal tidak valid', () => {
    expect(parseAuditQuery(query({ from: 'bukan-tanggal' })).ok).toBe(false);
  });
});

describe('toAuditWhere', () => {
  it('mengembalikan objek kosong tanpa filter', () => {
    const result = parseAuditQuery(query({}));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(toAuditWhere(result.query)).toEqual({});
  });

  it('memetakan actorId ke userId', () => {
    const result = parseAuditQuery(query({ actorId: UUID }));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(toAuditWhere(result.query)).toEqual({ userId: UUID });
  });

  it('memetakan rentang tanggal ke createdAt.gte/lte', () => {
    const result = parseAuditQuery(
      query({ from: '2026-11-01T00:00:00Z', to: '2026-11-21T00:00:00Z' })
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const where = toAuditWhere(result.query);
    expect(where.createdAt?.gte?.toISOString()).toBe('2026-11-01T00:00:00.000Z');
    expect(where.createdAt?.lte?.toISOString()).toBe('2026-11-21T00:00:00.000Z');
  });

  it('hanya mengisi batas yang diberikan', () => {
    const result = parseAuditQuery(query({ from: '2026-11-01T00:00:00Z' }));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const where = toAuditWhere(result.query);
    expect(where.createdAt?.gte).toBeInstanceOf(Date);
    expect(where.createdAt?.lte).toBeUndefined();
  });
});