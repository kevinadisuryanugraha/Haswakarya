import { describe, expect, it, beforeEach } from 'vitest';
import type { NextRequest } from 'next/server';
import { resetMetrics, snapshotMetrics } from '@/lib/observability/metrics';
import { withApiMetrics } from '@/lib/observability/withApiMetrics';

const fakeRequest = {} as NextRequest;

function counts(route: string) {
  const snapshot = snapshotMetrics();
  return snapshot.routes
    .filter((entry) => entry.route === route)
    .map((entry) => [entry.statusClass, entry.count] as const);
}

describe('withApiMetrics', () => {
  beforeEach(() => {
    resetMetrics();
  });

  it('mencatat status 200 sebagai ok', async () => {
    const handler = withApiMetrics('/api/test', async () => new Response('ok', { status: 200 }));
    const response = await handler(fakeRequest, undefined);
    expect(response.status).toBe(200);
    expect(counts('/api/test')).toEqual([['ok', 1]]);
  });

  it('mencatat 4xx sebagai kelas 4xx, bukan ok', async () => {
    const handler = withApiMetrics(
      '/api/test',
      async () => new Response('bad', { status: 413 })
    );
    await handler(fakeRequest, undefined);
    expect(counts('/api/test')).toEqual([['4xx', 1]]);
  });

  it('mencatat 5xx dari handler', async () => {
    const handler = withApiMetrics(
      '/api/test',
      async () => new Response('boom', { status: 500 })
    );
    await handler(fakeRequest, undefined);
    expect(counts('/api/test')).toEqual([['5xx', 1]]);
  });

  it('menghitung handler yang melempar error sebagai 5xx lalu meneruskan error', async () => {
    const handler = withApiMetrics('/api/test', async () => {
      throw new Error('kegagalan tak terduga');
    });
    await expect(handler(fakeRequest, undefined)).rejects.toThrow('kegagalan tak terduga');
    expect(counts('/api/test')).toEqual([['5xx', 1]]);
  });

  it('meneruskan argumen context ke handler (params dinamis)', async () => {
    const handler = withApiMetrics<{ params: Promise<{ id: string }> }>(
      '/api/test/:id',
      async (_req, { params }) => {
        const { id } = await params;
        return new Response(id);
      }
    );
    const response = await handler(fakeRequest, {
      params: Promise.resolve({ id: 'abc-123' }),
    });
    expect(await response.text()).toBe('abc-123');
    expect(counts('/api/test/:id')).toEqual([['ok', 1]]);
  });
});