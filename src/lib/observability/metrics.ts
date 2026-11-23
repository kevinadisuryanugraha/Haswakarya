/**
 * ═══════════════════════════════════════════════════════════════════════════
 * Haswakarya Crewing OS — Metrics in-process
 *
 * Counter dan histogram sederhana tanpa dependensi, diekspos lewat
 * `GET /api/metrics` (teks Prometheus) dan `/api/health` (ringkasan).
 *
 * Penyimpanan diletakkan di `globalThis`, bukan variabel modul. Next.js
 * membundel setiap route handler sebagai modul terpisah di proses yang sama;
 * variabel modul akan menghasilkan satu salinan per route sehingga
 * `/api/metrics` selalu membaca nol. `globalThis` dipakai bersama oleh semua
 * bundle dalam satu proses. Middleware berjalan di runtime Node
 * (`experimental.nodeMiddleware`) supaya ikut menulis ke penyimpanan yang sama.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export type StatusClass = 'ok' | '4xx' | '5xx';

export interface RouteMetric {
  route: string;
  /** Kelas status agar label Prometheus tidak kehilangan informasi. */
  statusClass: StatusClass;
  count: number;
  errors: number;
  totalMs: number;
  maxMs: number;
}

const MAX_ROUTES = 200;

interface MetricsStore {
  routes: Map<string, RouteMetric>;
  startedAt: number;
}

const STORE_KEY = '__hcosMetricsStore';

function store(): MetricsStore {
  const holder = globalThis as typeof globalThis & {
    [STORE_KEY]?: MetricsStore;
  };
  let current = holder[STORE_KEY];
  if (!current) {
    current = { routes: new Map<string, RouteMetric>(), startedAt: Date.now() };
    holder[STORE_KEY] = current;
  }
  return current;
}

/** Batas atas jumlah route yang dilacak agar memori tetap datar. */
function guardCardinality(routes: Map<string, RouteMetric>): void {
  if (routes.size <= MAX_ROUTES) return;
  let smallestKey: string | null = null;
  let smallestCount = Number.POSITIVE_INFINITY;
  for (const [key, metric] of routes) {
    if (metric.count < smallestCount) {
      smallestCount = metric.count;
      smallestKey = key;
    }
  }
  if (smallestKey) routes.delete(smallestKey);
}

export function recordRequest(route: string, status: number, durationMs: number): void {
  const { routes } = store();
  const statusClass: StatusClass = status >= 500 ? '5xx' : status >= 400 ? '4xx' : 'ok';
  const key = `${route}|${statusClass}`;
  const existing = routes.get(key);

  if (existing) {
    existing.count += 1;
    existing.totalMs += durationMs;
    existing.maxMs = Math.max(existing.maxMs, durationMs);
    if (status >= 500) existing.errors += 1;
    return;
  }

  guardCardinality(routes);
  routes.set(key, {
    route,
    statusClass,
    count: 1,
    errors: status >= 500 ? 1 : 0,
    totalMs: durationMs,
    maxMs: durationMs,
  });
}

export interface MetricsSnapshot {
  uptimeSeconds: number;
  totalRequests: number;
  totalServerErrors: number;
  routes: Array<RouteMetric & { avgMs: number }>;
}

export function snapshotMetrics(): MetricsSnapshot {
  const { routes, startedAt } = store();
  let totalRequests = 0;
  let totalServerErrors = 0;
  const list: Array<RouteMetric & { avgMs: number }> = [];

  for (const metric of routes.values()) {
    totalRequests += metric.count;
    totalServerErrors += metric.errors;
    list.push({
      ...metric,
      avgMs: metric.count === 0 ? 0 : Math.round((metric.totalMs / metric.count) * 10) / 10,
    });
  }

  list.sort((a, b) => b.count - a.count);

  return {
    // Umur proses sebenarnya; `startedAt` hanya cadangan bila `process.uptime`
    // tidak tersedia (mis. runtime non-Node), karena store dibuat saat bundle
    // pertama kali dimuat — bukan saat proses lahir.
    uptimeSeconds: Math.round(
      typeof process !== 'undefined' && typeof process.uptime === 'function'
        ? process.uptime()
        : (Date.now() - startedAt) / 1000
    ),
    totalRequests,
    totalServerErrors,
    routes: list,
  };
}

/** Reset khusus pengujian. */
export function resetMetrics(): void {
  const { routes } = store();
  routes.clear();
}