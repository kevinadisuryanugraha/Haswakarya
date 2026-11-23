'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollText, RefreshCw, Download, Filter, ChevronDown } from 'lucide-react';

interface AuditRow {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  details: unknown;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  actor: { id: string; fullName: string; email: string; role: string } | null;
}

interface AuditFilters {
  entityType: string;
  action: string;
  entityId: string;
  from: string;
  to: string;
}

const EMPTY_FILTERS: AuditFilters = {
  entityType: '',
  action: '',
  entityId: '',
  from: '',
  to: '',
};

const ENTITY_TYPES = [
  'CrewApplication',
  'EmploymentContractPKL',
  'SeafarerProfile',
  'CertificateSTCW',
  'User',
  'Vessel',
  'PayrollRecord',
  'VettingAssessment',
];

const PAGE_SIZE = 50;

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'medium',
  });
}

function shortId(value: string): string {
  return value.length > 13 ? `${value.slice(0, 8)}…${value.slice(-4)}` : value;
}

function csvCell(value: unknown): string {
  const text = value === null || value === undefined ? '' : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

export default function AuditTrailPage() {
  const [rows, setRows] = useState<AuditRow[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [entityType, setEntityType] = useState('');
  const [action, setAction] = useState('');
  const [entityId, setEntityId] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const [applied, setApplied] = useState<AuditFilters>(EMPTY_FILTERS);
  const [reloadKey, setReloadKey] = useState(0);

  const buildQuery = useCallback(
    (cursor?: string) => {
      const params = new URLSearchParams();
      if (applied.entityType) params.set('entityType', applied.entityType);
      if (applied.action.trim()) params.set('action', applied.action.trim());
      if (applied.entityId.trim()) params.set('entityId', applied.entityId.trim());
      if (applied.from) params.set('from', new Date(applied.from).toISOString());
      if (applied.to) params.set('to', new Date(applied.to).toISOString());
      params.set('limit', String(PAGE_SIZE));
      if (cursor) params.set('cursor', cursor);
      return params.toString();
    },
    [applied]
  );

  const load = useCallback(
    async (cursor?: string) => {
      const append = Boolean(cursor);
      if (append) setLoadingMore(true);
      else setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/portal/audit?${buildQuery(cursor)}`, {
          headers: { Accept: 'application/json' },
        });
        const json = await response.json();

        if (!response.ok || !json.success) {
          setError(
            Array.isArray(json.details) && json.details.length > 0
              ? json.details.join(' · ')
              : (json.error ?? 'Gagal memuat jejak audit.')
          );
          if (!append) setRows([]);
          setNextCursor(null);
          return;
        }

        setRows((previous) => (append ? [...previous, ...json.items] : json.items));
        setNextCursor(json.nextCursor ?? null);
      } catch {
        setError('Tidak dapat menghubungi server.');
        if (!append) setRows([]);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [buildQuery]
  );

  useEffect(() => {
    void load();
  }, [load, reloadKey]);

  const handleApply = (event: React.FormEvent) => {
    event.preventDefault();
    const next: AuditFilters = { entityType, action, entityId, from, to };
    if (JSON.stringify(next) === JSON.stringify(applied)) {
      setReloadKey((key) => key + 1);
      return;
    }
    setApplied(next);
  };

  const handleReset = () => {
    setEntityType('');
    setAction('');
    setEntityId('');
    setFrom('');
    setTo('');
    setApplied(EMPTY_FILTERS);
    setReloadKey((key) => key + 1);
  };

  const handleExport = () => {
    const header = ['waktu', 'aksi', 'tiped_entitas', 'id_entitas', 'aktor', 'email', 'peran', 'ip'];
    const lines = [header.map(csvCell).join(',')];
    for (const row of rows) {
      lines.push(
        [
          row.createdAt,
          row.action,
          row.entityType,
          row.entityId,
          row.actor?.fullName ?? 'sistem',
          row.actor?.email ?? '',
          row.actor?.role ?? '',
          row.ipAddress ?? '',
        ]
          .map(csvCell)
          .join(',')
      );
    }
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `jejak-audit-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const summary = useMemo(() => {
    if (loading) return 'Memuat jejak audit…';
    if (rows.length === 0) return 'Tidak ada aktivitas yang cocok dengan filter.';
    return `${rows.length} aktivitas dimuat${nextCursor ? ' (masih ada lagi)' : ''}.`;
  }, [loading, rows.length, nextCursor]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-slate-200 gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <ScrollText className="w-6 h-6 text-amber-600" />
            Jejak Audit
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Catatan siapa melakukan apa dan kapan. Hanya dapat dibaca peran admin (Super Admin,
            Crewing Manager).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setReloadKey((key) => key + 1)}
            className="px-3.5 py-2 text-xs font-bold rounded-lg border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 transition-colors flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Muat ulang</span>
          </button>
          <button
            type="button"
            onClick={handleExport}
            disabled={rows.length === 0}
            className="px-3.5 py-2 text-xs font-bold rounded-lg border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 transition-colors flex items-center gap-1.5 disabled:opacity-40"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Ekspor CSV</span>
          </button>
        </div>
      </div>

      <form
        onSubmit={handleApply}
        className="bg-white border border-slate-200 rounded-xl p-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5"
      >
        <label className="text-xs font-semibold text-slate-600 flex flex-col gap-1">
          Tipe Entitas
          <select
            value={entityType}
            onChange={(event) => setEntityType(event.target.value)}
            className="border border-slate-200 rounded-lg px-2.5 py-2 text-xs text-slate-800 bg-white"
          >
            <option value="">Semua</option>
            {ENTITY_TYPES.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>

        <label className="text-xs font-semibold text-slate-600 flex flex-col gap-1">
          Aksi
          <input
            value={action}
            onChange={(event) => setAction(event.target.value)}
            placeholder="mis. STAGE_TRANSITION"
            className="border border-slate-200 rounded-lg px-2.5 py-2 text-xs text-slate-800"
          />
        </label>

        <label className="text-xs font-semibold text-slate-600 flex flex-col gap-1">
          ID Entitas
          <input
            value={entityId}
            onChange={(event) => setEntityId(event.target.value)}
            placeholder="uuid entitas"
            className="border border-slate-200 rounded-lg px-2.5 py-2 text-xs text-slate-800 font-mono"
          />
        </label>

        <label className="text-xs font-semibold text-slate-600 flex flex-col gap-1">
          Dari
          <input
            type="datetime-local"
            value={from}
            onChange={(event) => setFrom(event.target.value)}
            className="border border-slate-200 rounded-lg px-2.5 py-2 text-xs text-slate-800"
          />
        </label>

        <label className="text-xs font-semibold text-slate-600 flex flex-col gap-1">
          Sampai
          <input
            type="datetime-local"
            value={to}
            onChange={(event) => setTo(event.target.value)}
            className="border border-slate-200 rounded-lg px-2.5 py-2 text-xs text-slate-800"
          />
        </label>

        <div className="sm:col-span-2 lg:col-span-5 flex flex-wrap items-center gap-2 pt-1">
          <button
            type="submit"
            className="px-3.5 py-2 text-xs font-bold rounded-lg bg-[#071b34] text-white hover:bg-[#0d2b52] transition-colors flex items-center gap-1.5"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Terapkan</span>
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="px-3.5 py-2 text-xs font-bold rounded-lg border border-slate-200 text-slate-600 bg-white hover:bg-slate-50"
          >
            Reset
          </button>
          <span className="text-[11px] text-slate-500 w-full sm:w-auto sm:ml-auto">{summary}</span>
        </div>
      </form>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="mobile-cards w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-4 py-3 font-bold">Waktu</th>
                <th className="px-4 py-3 font-bold">Aksi</th>
                <th className="px-4 py-3 font-bold">Entitas</th>
                <th className="px-4 py-3 font-bold">Aktor</th>
                <th className="px-4 py-3 font-bold">IP</th>
                <th className="px-4 py-3 font-bold">Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400" data-label="">
                    Memuat…
                  </td>
                </tr>
              )}

              {!loading && rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400" data-label="">
                    Belum ada catatan audit untuk filter ini.
                  </td>
                </tr>
              )}

              {rows.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/70 align-top">
                  <td data-label="Waktu" className="px-4 py-3 text-slate-600 whitespace-nowrap mc-mono">
                    {formatDate(row.createdAt)}
                  </td>
                  <td data-label="Aksi" className="px-4 py-3">
                    <span className="font-mono text-[11px] font-semibold text-slate-800">
                      {row.action}
                    </span>
                  </td>
                  <td data-label="Entitas" className="px-4 py-3">
                    <div className="font-semibold text-slate-700">{row.entityType}</div>
                    <div className="font-mono text-[10px] text-slate-400" title={row.entityId}>
                      {shortId(row.entityId)}
                    </div>
                  </td>
                  <td data-label="Aktor" className="px-4 py-3">
                    {row.actor ? (
                      <>
                        <div className="font-semibold text-slate-700">{row.actor.fullName}</div>
                        <div className="text-[10px] text-slate-500">
                          {row.actor.role} · {row.actor.email}
                        </div>
                      </>
                    ) : (
                      <span className="text-slate-400 italic">sistem</span>
                    )}
                  </td>
                  <td data-label="IP" className="px-4 py-3 font-mono text-[10px] text-slate-500 mc-mono">
                    {row.ipAddress ?? '—'}
                  </td>
                  <td data-label="Detail" className="px-4 py-3 max-w-xs mc-block">
                    {row.details ? (
                      <details className="group">
                        <summary className="cursor-pointer text-[11px] text-amber-700 font-semibold flex items-center gap-1 list-none">
                          <ChevronDown className="w-3 h-3 group-open:rotate-180 transition-transform" />
                          lihat
                        </summary>
                        <pre className="mt-2 max-h-40 overflow-auto bg-slate-900 text-slate-100 rounded-lg p-2 text-[10px] leading-relaxed">
                          {JSON.stringify(row.details, null, 2)}
                        </pre>
                      </details>
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {nextCursor && (
          <div className="border-t border-slate-100 px-4 py-3 text-center">
            <button
              type="button"
              onClick={() => void load(nextCursor)}
              disabled={loadingMore}
              className="px-4 py-2 text-xs font-bold rounded-lg border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-40"
            >
              {loadingMore ? 'Memuat…' : 'Muat lebih banyak'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}