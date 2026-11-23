import { describe, expect, it } from 'vitest';
import { TOKEN_TTL_DAYS, tokenActionSchema } from '@/lib/validation/tokenAction';
import { buildEntry, logger } from '@/lib/observability/logger';
import { recordRequest, resetMetrics, snapshotMetrics } from '@/lib/observability/metrics';

describe('tokenActionSchema', () => {
  it('menerima aksi rotate dengan alasan opsional', () => {
    expect(tokenActionSchema.parse({ action: 'rotate' })).toEqual({ action: 'rotate' });
    expect(tokenActionSchema.parse({ action: 'rotate', reason: 'Token bocor' })).toEqual({
      action: 'rotate',
      reason: 'Token bocor',
    });
  });

  it('menerima aksi revoke', () => {
    expect(tokenActionSchema.parse({ action: 'revoke' })).toEqual({ action: 'revoke' });
  });

  it('menolak aksi di luar daftar', () => {
    expect(tokenActionSchema.safeParse({ action: 'delete' }).success).toBe(false);
    expect(tokenActionSchema.safeParse({}).success).toBe(false);
    expect(tokenActionSchema.safeParse(null).success).toBe(false);
  });

  it('menolak alasan yang terlalu panjang', () => {
    const parsed = tokenActionSchema.safeParse({ action: 'rotate', reason: 'x'.repeat(501) });
    expect(parsed.success).toBe(false);
  });

  it('memangkas spasi pada alasan', () => {
    const parsed = tokenActionSchema.parse({ action: 'revoke', reason: '  kandidat gugur  ' });
    expect(parsed.reason).toBe('kandidat gugur');
  });

  it('memakai TTL token 30 hari', () => {
    expect(TOKEN_TTL_DAYS).toBe(30);
  });
});

describe('logger', () => {
  it('meredaksi kredensial dan nomor rekening', () => {
    const line = JSON.stringify(
      buildEntry('info', 'auth.login', {
      email: 'budi@example.com',
      password: 'rahasia-sekali',
      token: 'eyJhbGciOi',
      noRekening: '1234567890',
      nested: { password: 'dalam' },
      })
    );

    expect(line).not.toContain('rahasia-sekali');
    expect(line).not.toContain('eyJhbGciOi');
    expect(line).not.toContain('1234567890');
    expect(line).toContain('budi@example.com');
  });

  it('menghasilkan satu baris JSON valid dengan level dan event', () => {
    const parsed = buildEntry('warn', 'authz.denied', { role: 'SEAFARER' });
    expect(parsed.level).toBe('warn');
    expect(parsed.event).toBe('authz.denied');
    expect(parsed.role).toBe('SEAFARER');
    expect(typeof parsed.ts).toBe('string');
    expect(parsed.service).toBeTruthy();
  });

  it('menjaga keluaran tetap satu baris meski event mengandung newline', () => {
    const line = JSON.stringify(buildEntry('info', 'event\npalsu', { a: 1 }));
    expect(line.includes('\n')).toBe(false);
    expect(JSON.parse(line).event).toBe('event\npalsu');
  });

  it('menyediakan empat level log', () => {
    for (const level of ['debug', 'info', 'warn', 'error'] as const) {
      expect(typeof logger[level]).toBe('function');
    }
  });
});

describe('metrics', () => {
  it('mengagregasi jumlah dan durasi per rute/status', () => {
    resetMetrics();
    recordRequest('/api/portal/seafarers', 200, 12);
    recordRequest('/api/portal/seafarers', 200, 8);
    recordRequest('/api/portal/seafarers', 500, 40);

    const snapshot = snapshotMetrics();
    // Rute sama dengan kelas status berbeda disimpan sebagai baris terpisah.
    const rows = snapshot.routes.filter((row) => row.route === '/api/portal/seafarers');
    expect(rows).toHaveLength(2);

    const counts = rows.reduce((sum, row) => sum + row.count, 0);
    const totalMs = rows.reduce((sum, row) => sum + row.totalMs, 0);
    expect(counts).toBe(3);
    expect(totalMs).toBe(60);
    expect(snapshot.totalRequests).toBe(3);
    expect(snapshot.totalServerErrors).toBe(1);
  });

  it('mengelompokkan semua rute dinamis ke pola yang sama', () => {
    resetMetrics();
    recordRequest('/api/portal/applications/:id/token', 200, 5);
    recordRequest('/api/portal/pkl/:id/pdf', 200, 6);

    const routes = snapshotMetrics().routes.map((row) => row.route);
    expect(routes).toContain('/api/portal/applications/:id/token');
    expect(routes).toContain('/api/portal/pkl/:id/pdf');
  });

  it('mengembalikan snapshot kosong setelah reset', () => {
    resetMetrics();
    const snapshot = snapshotMetrics();
    expect(snapshot.totalRequests).toBe(0);
    expect(snapshot.routes).toEqual([]);
  });
});