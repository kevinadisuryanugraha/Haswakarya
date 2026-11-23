/**
 * ═══════════════════════════════════════════════════════════════════════════
 * Haswakarya Crewing OS — Structured Logger (JSON satu baris)
 * Aman dipakai di Node maupun Edge runtime: tanpa dependensi Node API.
 * Setiap entri memuat `ts`, `level`, `event`, `service`, dan `requestId`
 * sehingga log dapat dikorelasi di agregator (Loki/CloudWatch/Datadog).
 * ═══════════════════════════════════════════════════════════════════════════
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export type LogFields = Record<string, unknown>;

const LEVEL_WEIGHT: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

/** Kunci yang isinya tidak boleh muncul di log. */
const REDACTED_KEYS = [
  'password',
  'passwordhash',
  'passphrase',
  'token',
  'authorization',
  'cookie',
  'secret',
  'apikey',
  'api_key',
  'norek',
  'accountnumber',
];

const REDACTED = '[redacted]';
const MAX_STRING = 500;
const MAX_DEPTH = 4;

function minLevel(): LogLevel {
  const raw = (process.env.LOG_LEVEL ?? 'info').toLowerCase();
  return raw === 'debug' || raw === 'info' || raw === 'warn' || raw === 'error'
    ? (raw as LogLevel)
    : 'info';
}

export function shouldLog(level: LogLevel): boolean {
  return LEVEL_WEIGHT[level] >= LEVEL_WEIGHT[minLevel()];
}

function isSensitiveKey(key: string): boolean {
  const lower = key.toLowerCase().replace(/[_-]/g, '');
  return REDACTED_KEYS.some((candidate) => lower.includes(candidate));
}

/** Membersihkan nilai agar aman dan berukuran wajar untuk log. */
export function sanitize(value: unknown, depth = 0): unknown {
  if (value === null || value === undefined) return value;
  if (typeof value === 'string') {
    return value.length > MAX_STRING ? `${value.slice(0, MAX_STRING)}…` : value;
  }
  if (typeof value === 'number' || typeof value === 'boolean') return value;
  if (value instanceof Date) return value.toISOString();
  if (value instanceof Error) {
    return { name: value.name, message: value.message };
  }
  if (depth >= MAX_DEPTH) return '[truncated]';

  if (Array.isArray(value)) {
    return value.slice(0, 50).map((item) => sanitize(item, depth + 1));
  }

  if (typeof value === 'object') {
    const output: Record<string, unknown> = {};
    for (const [key, raw] of Object.entries(value as Record<string, unknown>)) {
      output[key] = isSensitiveKey(key) ? REDACTED : sanitize(raw, depth + 1);
    }
    return output;
  }

  return String(value);
}

export interface LogEntry {
  ts: string;
  level: LogLevel;
  event: string;
  service: string;
  env: string;
  [key: string]: unknown;
}

export function buildEntry(
  level: LogLevel,
  event: string,
  fields: LogFields = {},
  now: Date = new Date()
): LogEntry {
  const sanitized = sanitize(fields) as LogFields;
  return {
    ts: now.toISOString(),
    level,
    event,
    service: process.env.OTEL_SERVICE_NAME ?? 'haswakarya-web',
    env: process.env.NODE_ENV ?? 'development',
    ...sanitized,
  };
}

function emit(level: LogLevel, event: string, fields?: LogFields): void {
  if (!shouldLog(level)) return;

  const line = JSON.stringify(buildEntry(level, event, fields));
  if (level === 'error') {
    console.error(line);
  } else if (level === 'warn') {
    console.warn(line);
  } else {
    console.log(line);
  }
}

export const logger = {
  debug: (event: string, fields?: LogFields) => emit('debug', event, fields),
  info: (event: string, fields?: LogFields) => emit('info', event, fields),
  warn: (event: string, fields?: LogFields) => emit('warn', event, fields),
  error: (event: string, fields?: LogFields) => emit('error', event, fields),
};

/**
 * Normalisasi path agar tidak membuat ledakan kardinalitas metrics/log:
 * segmen UUID, angka, dan ID panjang diganti `:id`.
 */
export function normalizePath(pathname: string): string {
  return pathname
    .split('?')[0]
    .split('/')
    .map((segment) => {
      if (segment === '') return segment;
      if (/^\d+$/.test(segment)) return ':id';
      if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(segment)) {
        return ':id';
      }
      if (segment.length >= 16 && /^[A-Za-z0-9_-]+$/.test(segment)) return ':id';
      if (/^(c[a-z0-9]{20,})$/i.test(segment)) return ':id';
      return segment;
    })
    .join('/');
}