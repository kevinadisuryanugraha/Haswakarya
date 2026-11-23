'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Users, 
  Search, 
  Ship, 
  Anchor, 
  FileCheck2, 
  ShieldCheck, 
  Clock, 
  ExternalLink,
  ChevronRight,
  ArrowRight,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

interface TriageDraftView {
  summary: string;
  strengths: string[];
  gaps: string[];
  interviewQuestions: string[];
  confidence: 'low' | 'medium' | 'high';
}

interface TriageEntry {
  loading: boolean;
  error?: string;
  draft?: TriageDraftView;
  source?: 'ai' | 'fallback';
  reason?: string | null;
  model?: string | null;
}

interface NarrativeEntry {
  loading: boolean;
  error?: string;
  summary?: string;
  source?: 'ai' | 'fallback';
  reason?: string | null;
  model?: string | null;
  narrativeAt?: string | null;
}

const STAGES = [
  { id: 'APPLIED', title: 'Berkas Masuk', color: 'border-slate-200 bg-slate-50/70', badge: 'bg-slate-100 text-slate-700' },
  { id: 'DOCUMENT_VERIFIED', title: 'STCW Hubla Sah', color: 'border-sky-200 bg-sky-50/40', badge: 'bg-sky-100 text-sky-800' },
  { id: 'TECHNICAL_INTERVIEW', title: 'Interview Port Capt', color: 'border-indigo-200 bg-indigo-50/40', badge: 'bg-indigo-100 text-indigo-800' },
  { id: 'MARLINS_ASSESSMENT', title: 'Ujian Marlins (>=80%)', color: 'border-amber-200 bg-amber-50/40', badge: 'bg-amber-100 text-amber-800' },
  { id: 'OWNER_VETTING', title: 'Shipowner Vetting', color: 'border-purple-200 bg-purple-50/40', badge: 'bg-purple-100 text-purple-800' },
  { id: 'ONBOARD_DEPLOYED', title: 'Onboard Berlayar', color: 'border-emerald-200 bg-emerald-50/40', badge: 'bg-emerald-100 text-emerald-800' },
];

export default function CrewingAtsPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [tokenBusyId, setTokenBusyId] = useState<string | null>(null);
  const [triage, setTriage] = useState<Record<string, TriageEntry>>({});
  const [narrative, setNarrative] = useState<Record<string, NarrativeEntry>>({});

  const loadApplications = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/portal/applications');
      const json = await res.json();
      if (json.success) {
        setApplications(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, []);

  const handleAdvanceStage = async (appId: string, currentStage: string) => {
    const stageOrder = ['APPLIED', 'DOCUMENT_VERIFIED', 'TECHNICAL_INTERVIEW', 'MARLINS_ASSESSMENT', 'OWNER_VETTING', 'ONBOARD_DEPLOYED'];
    const currentIndex = stageOrder.indexOf(currentStage);
    if (currentIndex >= stageOrder.length - 1) return;

    const nextStage = stageOrder[currentIndex + 1];

    try {
      setUpdatingId(appId);
      const res = await fetch(`/api/portal/applications/${appId}/stage`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nextStage }),
      });

      if (res.ok) {
        loadApplications();
      }
    } catch (err) {
      console.error('Failed to advance stage:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleTokenAction = async (appId: string, action: 'rotate' | 'revoke') => {
    const confirmed =
      action === 'revoke'
        ? window.confirm('Cabut tautan vetting ini? Principal tidak akan bisa membuka dossier lagi.')
        : window.confirm('Terbitkan tautan baru? Tautan lama langsung tidak berlaku.');
    if (!confirmed) return;

    try {
      setTokenBusyId(appId);
      const res = await fetch(`/api/portal/applications/${appId}/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        window.alert(json.error || 'Gagal memperbarui tautan vetting.');
        return;
      }

      loadApplications();
    } catch (err) {
      console.error('Failed to change vetting token:', err);
    } finally {
      setTokenBusyId(null);
    }
  };

  const handleGenerateTriage = async (appId: string) => {
    setTriage((prev) => ({ ...prev, [appId]: { loading: true } }));

    try {
      const res = await fetch(`/api/portal/applications/${appId}/triage`, {
        method: 'POST',
      });
      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        setTriage((prev) => ({
          ...prev,
          [appId]: {
            loading: false,
            error: json.error || 'Gagal menyusun draf triage.',
          },
        }));
        return;
      }

      setTriage((prev) => ({
        ...prev,
        [appId]: {
          loading: false,
          draft: json.data?.draft,
          source: json.data?.source,
          reason: json.data?.reason ?? null,
          model: json.data?.meta?.model ?? json.data?.ai?.model ?? null,
        },
      }));
    } catch (err) {
      console.error('Failed to generate triage draft:', err);
      setTriage((prev) => ({
        ...prev,
        [appId]: { loading: false, error: 'Jaringan gagal. Coba lagi.' },
      }));
    }
  };

  const handleGenerateNarrative = async (appId: string) => {
    setNarrative((prev) => ({ ...prev, [appId]: { loading: true } }));

    try {
      const res = await fetch(`/api/portal/applications/${appId}/dossier-narrative`, {
        method: 'POST',
      });
      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        setNarrative((prev) => ({
          ...prev,
          [appId]: { loading: false, error: json.error || 'Gagal menyusun narasi dossier.' },
        }));
        return;
      }

      setNarrative((prev) => ({
        ...prev,
        [appId]: {
          loading: false,
          summary: json.data?.stored ?? json.data?.narrative?.summary,
          source: json.data?.source,
          reason: json.data?.reason ?? null,
          model: json.data?.ai?.answeredBy ?? null,
          narrativeAt: new Date().toISOString(),
        },
      }));
    } catch (err) {
      console.error('Failed to generate dossier narrative:', err);
      setNarrative((prev) => ({
        ...prev,
        [appId]: { loading: false, error: 'Jaringan gagal. Coba lagi.' },
      }));
    }
  };

  const tokenLabel = (expiresAt: string | null | undefined) => {
    if (!expiresAt) return 'dicabut';
    const date = new Date(expiresAt);
    if (Number.isNaN(date.getTime())) return 'tidak diketahui';
    if (date.getTime() <= Date.now()) return 'kedaluwarsa';
    return `aktif s.d. ${date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-slate-200 gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Pipeline Penugasan Awak Kapal (Maritime ATS)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Data riil dari tabel database PostgreSQL <code className="font-mono text-slate-700">CrewApplication</code> dengan pembaruan status atomik
          </p>
        </div>

        <Link
          href="/portal/requisitions"
          className="px-3.5 py-2 text-xs font-bold rounded-lg bg-[#071b34] hover:bg-[#0c2b52] text-white transition-colors flex items-center justify-center gap-1.5 shadow-xs self-start sm:self-auto w-full sm:w-auto"
        >
          <Ship className="w-3.5 h-3.5 text-amber-400" />
          <span>Lihat Formasi Manning</span>
        </Link>
      </div>

      {/* Kanban Board Columns */}
      <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-6 snap-x snap-mandatory md:mx-0 md:grid md:grid-cols-2 md:items-start md:overflow-visible md:px-0 md:pb-8 lg:grid-cols-3 xl:grid-cols-6">
        {STAGES.map((col) => {
          const colApps = applications.filter((a) => a.currentStage === col.id);

          return (
            <div
              key={col.id}
              className={`flex w-[78vw] max-w-[300px] shrink-0 snap-start flex-col rounded-xl border p-3 md:w-auto md:max-w-none md:min-w-0 ${col.color}`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 mb-3">
                <span className="text-xs font-bold text-slate-800">{col.title}</span>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${col.badge}`}>
                  {colApps.length}
                </span>
              </div>

              {/* Cards List */}
              <div className="space-y-3 flex-1 min-h-0 md:min-h-[380px]">
                {colApps.map((app) => {
                  const seafarer = app.seafarer;
                  const req = app.requisition;
                  const isUpdating = updatingId === app.id;

                  return (
                    <div
                      key={app.id}
                      className="p-3.5 rounded-lg bg-white border border-slate-200 hover:border-slate-300 transition-all shadow-xs space-y-2.5 group"
                    >
                      {/* Name & Score */}
                      <div className="flex items-start justify-between gap-1.5">
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 group-hover:text-amber-700 transition-colors">
                            {seafarer?.user?.fullName}
                          </h4>
                          <span className="text-[11px] font-semibold text-amber-600 block">
                            {seafarer?.primaryRank?.replace(/_/g, ' ')}
                          </span>
                        </div>
                        {app.matchScore && (
                          <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap">
                            {app.matchScore}% SIRE
                          </span>
                        )}
                      </div>

                      {/* Buku Pelaut & Target Vessel */}
                      <div className="text-[11px] text-slate-500 space-y-0.5 bg-slate-50 p-2 rounded border border-slate-100">
                        <div className="flex items-center justify-between">
                          <span>Buku Pelaut:</span>
                          <span className="font-mono text-slate-800 font-medium">{seafarer?.seamanBookNo}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Kapal Target:</span>
                          <span className="font-semibold text-slate-800 truncate max-w-[110px]">{req?.vessel?.name}</span>
                        </div>
                      </div>

                      {/* Marlins Score & Sea Time */}
                      <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-100">
                        <span>Layar: {Math.floor((seafarer?.totalSeaTimeDays || 0) / 365)} Thn</span>
                        <span className="text-sky-700 font-mono font-semibold">
                          Marlins: {seafarer?.marlinsScore ? `${seafarer.marlinsScore}%` : '-'}
                        </span>
                      </div>

                      {/* Kontrol tautan vetting */}
                      <div className="pt-1.5 border-t border-slate-100 space-y-1.5">
                        <div className="flex items-center justify-between text-[10px] text-slate-500">
                          <span>Tautan principal:</span>
                          <span
                            className={
                              app.tokenExpiresAt
                                ? 'font-semibold text-emerald-700'
                                : 'font-semibold text-rose-600'
                            }
                          >
                            {tokenLabel(app.tokenExpiresAt)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleTokenAction(app.id, 'rotate')}
                            disabled={tokenBusyId === app.id}
                            title="Terbitkan token vetting baru dan matikan yang lama"
                            className="flex-1 px-2 py-1 rounded border border-slate-300 hover:border-slate-400 text-slate-700 text-[10px] font-bold transition-colors disabled:opacity-50 cursor-pointer"
                          >
                            {tokenBusyId === app.id ? '...' : 'Terbitkan ulang'}
                          </button>
                          <button
                            onClick={() => handleTokenAction(app.id, 'revoke')}
                            disabled={tokenBusyId === app.id || !app.vettingToken}
                            title="Cabut akses dossier untuk principal"
                            className="px-2 py-1 rounded border border-rose-200 text-rose-700 hover:bg-rose-50 text-[10px] font-bold transition-colors disabled:opacity-40 cursor-pointer"
                          >
                            Revoke
                          </button>
                        </div>
                      </div>

                      {/* Draf triage: bahan pertimbangan, bukan keputusan */}
                      <div className="pt-1.5 border-t border-slate-100 space-y-1.5">
                        <button
                          onClick={() => handleGenerateTriage(app.id)}
                          disabled={triage[app.id]?.loading}
                          title="Susun ringkasan, kekuatan, gap, dan pertanyaan wawancara dari data server"
                          className="w-full px-2 py-1 rounded border border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100 text-[10px] font-bold flex items-center justify-center gap-1 transition-colors disabled:opacity-50 cursor-pointer"
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>{triage[app.id]?.loading ? 'Menyusun...' : 'AI Ringkasan'}</span>
                        </button>

                        {triage[app.id]?.error && (
                          <p className="text-[10px] text-rose-600 leading-snug">
                            {triage[app.id]?.error}
                          </p>
                        )}

                        {triage[app.id]?.draft && (
                          <div className="rounded border border-slate-200 bg-slate-50 p-2 space-y-1.5">
                            <div className="flex items-center justify-between gap-1">
                              <span
                                className={
                                  triage[app.id]?.source === 'ai'
                                    ? 'text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-sky-100 text-sky-800 border border-sky-200'
                                    : 'text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 border border-slate-300'
                                }
                              >
                                {triage[app.id]?.source === 'ai' ? 'AI' : 'DETERMINISTIK'}
                              </span>
                              <span
                                className="text-[9px] text-slate-400 truncate max-w-[90px]"
                                title={triage[app.id]?.model ?? ''}
                              >
                                {triage[app.id]?.model ?? 'matrix engine'}
                              </span>
                            </div>

                            <p className="text-[10px] text-slate-700 leading-snug">
                              {triage[app.id]?.draft?.summary}
                            </p>

                            {(triage[app.id]?.draft?.strengths?.length ?? 0) > 0 && (
                              <div>
                                <span className="text-[9px] font-bold text-emerald-700 uppercase tracking-wide">
                                  Kekuatan
                                </span>
                                <ul className="list-disc pl-3.5 text-[10px] text-slate-600 leading-snug">
                                  {triage[app.id]?.draft?.strengths.map((item, index) => (
                                    <li key={`s-${index}`}>{item}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {(triage[app.id]?.draft?.gaps?.length ?? 0) > 0 && (
                              <div>
                                <span className="text-[9px] font-bold text-rose-700 uppercase tracking-wide">
                                  Gap
                                </span>
                                <ul className="list-disc pl-3.5 text-[10px] text-slate-600 leading-snug">
                                  {triage[app.id]?.draft?.gaps.map((item, index) => (
                                    <li key={`g-${index}`}>{item}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {(triage[app.id]?.draft?.interviewQuestions?.length ?? 0) > 0 && (
                              <div>
                                <span className="text-[9px] font-bold text-indigo-700 uppercase tracking-wide">
                                  Pertanyaan
                                </span>
                                <ul className="list-disc pl-3.5 text-[10px] text-slate-600 leading-snug">
                                  {triage[app.id]?.draft?.interviewQuestions.map((item, index) => (
                                    <li key={`q-${index}`}>{item}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            <p className="text-[9px] text-slate-400 leading-snug border-t border-slate-200 pt-1">
                              Bahan pertimbangan. Keputusan tetap milik verifikator.
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Narasi dossier vetting (Wedge B) */}
                      <div className="pt-1.5 border-t border-slate-100 space-y-1.5">
                        <button
                          onClick={() => handleGenerateNarrative(app.id)}
                          disabled={narrative[app.id]?.loading}
                          title="Susun narasi dossier untuk principal dari data server (skor tidak diubah)"
                          className="w-full px-2 py-1 rounded border border-sky-300 bg-sky-50 text-sky-800 hover:bg-sky-100 text-[10px] font-bold flex items-center justify-center gap-1 transition-colors disabled:opacity-50 cursor-pointer"
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>{narrative[app.id]?.loading ? 'Menyusun...' : 'AI Narasi'}</span>
                        </button>

                        {narrative[app.id]?.error && (
                          <p className="text-[10px] text-rose-600 leading-snug">
                            {narrative[app.id]?.error}
                          </p>
                        )}

                        {narrative[app.id]?.summary && (
                          <div className="rounded border border-slate-200 bg-slate-50 p-2 space-y-1.5">
                            <div className="flex items-center justify-between gap-1">
                              <span
                                className={
                                  narrative[app.id]?.source === 'ai'
                                    ? 'text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-sky-100 text-sky-800 border border-sky-200'
                                    : 'text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 border border-slate-300'
                                }
                              >
                                {narrative[app.id]?.source === 'ai' ? 'AI' : 'DETERMINISTIK'}
                              </span>
                              <span
                                className="text-[9px] text-slate-400 truncate max-w-[90px]"
                                title={narrative[app.id]?.model ?? ''}
                              >
                                {narrative[app.id]?.model ?? 'matrix engine'}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-700 leading-snug whitespace-pre-line">
                              {narrative[app.id]?.summary}
                            </p>
                            <p className="text-[9px] text-slate-400 leading-snug border-t border-slate-200 pt-1">
                              Tersimpan di dossier principal. Skor dan keputusan tidak berubah.
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Action Advance Stage Button */}
                      <div className="pt-1 flex items-center justify-between gap-2">
                        <Link
                          href={`/share/vetting/${app.vettingToken || 'demo'}`}
                          className="text-[10px] text-amber-700 hover:text-amber-800 font-semibold flex items-center gap-1"
                        >
                          <span>Review</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>

                        {col.id !== 'ONBOARD_DEPLOYED' && (
                          <button
                            onClick={() => handleAdvanceStage(app.id, app.currentStage)}
                            disabled={isUpdating}
                            title="Lanjutkan ke tahap selanjutnya"
                            className="px-2 py-1 rounded bg-[#071b34] hover:bg-[#0c2b52] text-white text-[10px] font-bold flex items-center gap-1 transition-colors disabled:opacity-50 cursor-pointer"
                          >
                            <span>{isUpdating ? '...' : 'Lanjut'}</span>
                            <ArrowRight className="w-3 h-3 text-amber-400" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}

                {colApps.length === 0 && (
                  <div className="h-28 rounded-lg border border-dashed border-slate-200 flex items-center justify-center text-xs text-slate-400">
                    Kosong
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
