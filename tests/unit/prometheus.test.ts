import { beforeEach, describe, expect, it } from 'vitest';
import {
  recordRequest,
  resetMetrics,
  snapshotMetrics,
  type MetricsSnapshot,
} from '@/lib/observability/metrics';
import { escapeLabelValue, renderPrometheus } from '@/lib/observability/prometheus';
import {
  createRequestId,
  resolveRequestId,
  sanitizeRequestId,
} from '@/lib/observability/requestId';

function emptySnapshot(overrides: Partial<MetricsSnapshot> = {}): MetricsSnapshot {
  return {
    uptimeSeconds: 42,
    totalRequests: 0,
    totalServerErrors: 0,
    routes: [],
    ...overrides,
  };
}

describe('escapeLabelValue', () => {
  it('meloloskan backslash, kutip, dan newline', () => {
    expect(escapeLabelValue('a\\b"c\nd')).toBe('a\\\\b\\"c\\nd');
  });

  it('membiarkan teks biasa apa adanya', () => {
    expect(escapeLabelValue('/portal/audit')).toBe('/portal/audit');
  });
});

describe('renderPrometheus', () => {
  beforeEach(() => {
    resetMetrics();
  });

  it('memuat HELP dan TYPE untuk setiap metrik', () => {
    recordRequest('/portal', 200, 40);
    const text = renderPrometheus(snapshotMetrics(), { version: '1.2.3', revision: 'abcdef123456' });

    expect(text).toContain('# HELP hcos_http_requests_total');
    expect(text).toContain('# TYPE hcos_http_requests_total counter');
    expect(text).toContain('# TYPE hcos_http_server_errors_total counter');
    expect(text).toContain('# TYPE hcos_http_request_duration_seconds summary');
    expect(text).toContain('# TYPE hcos_process_uptime_seconds gauge');
    expect(text).toContain('# TYPE hcos_build_info gauge');
  });

  it('memberi label route dan kelas status yang benar', () => {
    recordRequest('/portal', 200, 10);
    recordRequest('/portal', 403, 5);
    recordRequest('/portal', 500, 7);

    const text = renderPrometheus(snapshotMetrics());
    expect(text).toContain('hcos_http_requests_total{route="/portal",status="ok"} 1');
    expect(text).toContain('hcos_http_requests_total{route="/portal",status="4xx"} 1');
    expect(text).toContain('hcos_http_requests_total{route="/portal",status="5xx"} 1');
  });

  it('hanya menghitung galat 5xx pada metrik galat server', () => {
    recordRequest('/api/x', 200, 10);
    recordRequest('/api/x', 404, 10);
    recordRequest('/api/x', 503, 10);

    const text = renderPrometheus(snapshotMetrics());
    const errorLines = text
      .split('\n')
      .filter((row) => row.startsWith('hcos_http_server_errors_total{'));
    expect(errorLines).toEqual(['hcos_http_server_errors_total{route="/api/x"} 1']);
  });

  it('mengubah durasi milidetik menjadi detik', () => {
    recordRequest('/slow', 200, 1500);
    const text = renderPrometheus(snapshotMetrics());
    expect(text).toContain('hcos_http_request_duration_seconds_sum{route="/slow",status="ok"} 1.5');
    expect(text).toContain('hcos_http_request_duration_seconds_count{route="/slow",status="ok"} 1');
  });

  it('mengurutkan route agar keluaran deterministik', () => {
    recordRequest('/zebra', 200, 1);
    recordRequest('/alpha', 200, 1);
    const text = renderPrometheus(snapshotMetrics());
    expect(text.indexOf('route="/alpha"')).toBeLessThan(text.indexOf('route="/zebra"'));
  });

  it('tetap menghasilkan metrik valid saat belum ada request', () => {
    const text = renderPrometheus(emptySnapshot());
    expect(text).toContain('hcos_http_requests_total{route="none",status="ok"} 0');
    expect(text).toContain('hcos_process_uptime_seconds 42');
    expect(text.endsWith('\n')).toBe(true);
  });

  it('menulis build info tanpa merek-rekik nilai rahasia', () => {
    const text = renderPrometheus(emptySnapshot(), {
      service: 'hcos-test',
      version: '9.9.9',
      revision: 'deadbeefcafe1234',
      env: 'ci',
    });
    expect(text).toContain('service="hcos-test"');
    expect(text).toContain('version="9.9.9"');
    expect(text).toContain('revision="deadbeefcafe"');
    expect(text).toContain('env="ci"');
  });

  it('mengganti revisi kosong dengan "unknown"', () => {
    const text = renderPrometheus(emptySnapshot(), { revision: null });
    expect(text).toContain('revision="unknown"');
  });
});

describe('requestId', () => {
  it('menerima UUID dan token heksadesimal', () => {
    expect(sanitizeRequestId('3f2504e0-4f89-41d3-9a0c-0305e82c3301')).toBe(
      '3f2504e0-4f89-41d3-9a0c-0305e82c3301'
    );
    expect(sanitizeRequestId('abcdef1234567890')).toBe('abcdef1234567890');
  });

  it('memangkas spasi di tepi', () => {
    expect(sanitizeRequestId('  abcdef1234  ')).toBe('abcdef1234');
  });

  it('menolak nilai kosong, terlalu pendek, atau beraksara aneh', () => {
    expect(sanitizeRequestId('')).toBeNull();
    expect(sanitizeRequestId('short')).toBeNull();
    expect(sanitizeRequestId(null)).toBeNull();
    expect(sanitizeRequestId('id dengan spasi')).toBeNull();
    expect(sanitizeRequestId('id"quote-inject')).toBeNull();
    expect(sanitizeRequestId('x'.repeat(65))).toBeNull();
    expect(sanitizeRequestId('{"$ne":1}')).toBeNull();
  });

  it('membuat ID 32 heksadesimal dari byte yang diberikan', () => {
    const fixed = new Uint8Array(16).fill(0xab);
    expect(createRequestId(() => fixed)).toBe('ab'.repeat(16));
  });

  it('membuat ID acak yang berbeda setiap panggilan', () => {
    const a = createRequestId();
    const b = createRequestId();
    expect(a).toHaveLength(32);
    expect(a).not.toBe(b);
  });

  it('memakai ID masuk bila sah dan membuat baru bila tidak', () => {
    expect(resolveRequestId('abcdef123456')).toBe('abcdef123456');
    const generated = resolveRequestId('bukan id!');
    expect(generated).toHaveLength(32);
    expect(generated).not.toBe('bukan id!');
  });
});