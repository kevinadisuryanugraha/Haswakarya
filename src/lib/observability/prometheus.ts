/**
 * ═══════════════════════════════════════════════════════════════════════════
 * Haswakarya Crewing OS — Perender teks Prometheus
 * Murni (tanpa dependensi, tanpa I/O) agar bisa diuji dan dipakai baik oleh
 * proses web maupun oleh skrip. Format mengikuti exposition format 0.0.4:
 * setiap metrik didahului `# HELP` dan `# TYPE`, label di-escape sesuai
 * spesifikasi Prometheus.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import type { MetricsSnapshot } from './metrics';

export interface PrometheusContext {
  /** Nama service untuk metrik build info. */
  service?: string;
  version?: string;
  revision?: string | null;
  env?: string;
}

/** Escape nilai label sesuai format Prometheus (backslash, kutip, newline). */
export function escapeLabelValue(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n');
}

function line(name: string, labels: Record<string, string>, value: number): string {
  const entries = Object.entries(labels);
  const suffix = entries
    .map(([key, raw]) => `${key}="${escapeLabelValue(raw)}"`)
    .join(',');
  const rendered = Number.isFinite(value) ? String(value) : '0';
  return suffix ? `${name}{${suffix}} ${rendered}` : `${name} ${rendered}`;
}

function header(name: string, help: string, type: 'counter' | 'gauge' | 'summary'): string[] {
  return [`# HELP ${name} ${help}`, `# TYPE ${name} ${type}`];
}

/**
 * Mengubah snapshot in-process menjadi teks Prometheus yang deterministik:
 * route diurutkan menurut nama sehingga dua snapshot identik menghasilkan
 * keluaran yang identik (memudahkan diff pada mata manusia).
 */
export function renderPrometheus(
  snapshot: MetricsSnapshot,
  context: PrometheusContext = {}
): string {
  const out: string[] = [];

  out.push(...header('hcos_http_requests_total', 'Total HTTP requests handled.', 'counter'));
  const routes = [...snapshot.routes].sort((a, b) => a.route.localeCompare(b.route));
  for (const route of routes) {
    out.push(
      line(
        'hcos_http_requests_total',
        { route: route.route, status: route.statusClass },
        route.count
      )
    );
  }
  if (routes.length === 0) {
    out.push(line('hcos_http_requests_total', { route: 'none', status: 'ok' }, 0));
  }

  out.push(
    ...header('hcos_http_server_errors_total', 'Total HTTP 5xx responses.', 'counter')
  );
  for (const route of routes) {
    if (route.statusClass !== '5xx') continue;
    out.push(line('hcos_http_server_errors_total', { route: route.route }, route.count));
  }

  out.push(
    ...header(
      'hcos_http_request_duration_seconds',
      'Request duration summary per route.',
      'summary'
    )
  );
  for (const route of routes) {
    const seconds = Math.round((route.totalMs / 1000) * 1e6) / 1e6;
    const labels = { route: route.route, status: route.statusClass };
    out.push(line('hcos_http_request_duration_seconds_sum', labels, seconds));
    out.push(line('hcos_http_request_duration_seconds_count', labels, route.count));
  }

  out.push(...header('hcos_process_uptime_seconds', 'Process uptime in seconds.', 'gauge'));
  out.push(line('hcos_process_uptime_seconds', {}, snapshot.uptimeSeconds));

  out.push(
    ...header('hcos_build_info', 'Build metadata; value is always 1.', 'gauge')
  );
  out.push(
    line(
      'hcos_build_info',
      {
        service: context.service ?? process.env.OTEL_SERVICE_NAME ?? 'haswakarya-web',
        version: context.version ?? process.env.APP_VERSION ?? 'dev',
        revision: (context.revision ?? process.env.GIT_SHA ?? '').slice(0, 12) || 'unknown',
        env: context.env ?? process.env.NODE_ENV ?? 'development',
      },
      1
    )
  );

  return `${out.join('\n')}\n`;
}