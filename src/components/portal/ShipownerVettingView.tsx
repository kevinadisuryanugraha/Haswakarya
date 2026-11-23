'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Ship,
  Anchor,
  ShieldCheck,
  FileCheck2,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  ChevronRight,
  Loader2,
  ShieldAlert,
  XCircle,
} from 'lucide-react';
import type { VettingDossier, VettingDecisionState } from '@/lib/vetting/dossier';

interface ShipownerVettingViewProps {
  dossier: VettingDossier;
}

const DECISION_LABEL: Record<VettingDecisionState, string> = {
  PENDING: 'Menunggu Keputusan Shipowner',
  APPROVED: 'Disetujui Shipowner',
  REPLACEMENT_REQUESTED: 'Diminta Pengganti',
  REJECTED: 'Ditolak',
};

export function ShipownerVettingView({ dossier }: ShipownerVettingViewProps) {
  const [decision, setDecision] = useState<VettingDecisionState>(dossier.decision);
  const [signerName, setSignerName] = useState(dossier.signerName ?? '');
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState<'APPROVE' | 'REQUEST_REPLACEMENT' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [decidedAt, setDecidedAt] = useState<string | null>(dossier.decidedAt);

  const candidate = dossier.candidate;
  const isExpired = dossier.tokenState === 'EXPIRED';
  const isInvalid = dossier.tokenState === 'INVALID';
  const decided = decision !== 'PENDING';

  async function submitDecision(kind: 'APPROVE' | 'REQUEST_REPLACEMENT') {
    if (signerName.trim().length < 3) {
      setError('Nama penandatangan wajib diisi (minimal 3 karakter).');
      return;
    }

    setSubmitting(kind);
    setError(null);

    try {
      const response = await fetch(`/api/public/vetting/${dossier.token}/endorse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decision: kind,
          signerName: signerName.trim(),
          remarks: remarks.trim() || undefined,
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        setError(payload?.error ?? 'Gagal menyimpan keputusan vetting.');
        return;
      }

      setDecision(kind === 'APPROVE' ? 'APPROVED' : 'REPLACEMENT_REQUESTED');
      setDecidedAt(payload?.data?.decidedAt ?? new Date().toISOString());
    } catch {
      setError('Gagal menghubungi server. Periksa koneksi Anda lalu coba lagi.');
    } finally {
      setSubmitting(null);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between pb-2">
          <Link
            href="/portal"
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1"
          >
            <ChevronRight className="w-3.5 h-3.5 rotate-180" />
            <span>Kembali ke Portal Haswakarya</span>
          </Link>
          <div className="text-xs text-slate-500 font-mono">
            Shipowner Vetting Gate • Token: <strong className="text-slate-900">{dossier.token}</strong>
          </div>
        </div>

        {(isExpired || isInvalid) && (
          <div className="p-6 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h2 className="text-sm font-bold text-rose-900">
                {isExpired ? 'Tautan Vetting Kedaluwarsa' : 'Tautan Vetting Tidak Sah'}
              </h2>
              <p className="text-xs text-rose-800">
                {isExpired
                  ? 'Masa berlaku tautan ini sudah berakhir. Hubungi crewing manager Haswakarya untuk menerbitkan tautan baru.'
                  : 'Token tidak terdaftar pada sistem. Periksa kembali tautan yang Anda terima.'}
              </p>
              <p className="text-[11px] text-rose-700 font-mono pt-1">
                Kedaluwarsa: {dossier.expiresAt ? new Date(dossier.expiresAt).toLocaleString('id-ID') : '—'}
              </p>
            </div>
          </div>
        )}

        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-amber-900">
            <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              Tinjauan Berkas Resmi Calon Perwira Kapal — Disiapkan untuk Komite Vetting Pemilik Kapal
              (Shipowner).
            </span>
          </div>
          <span className="font-mono text-amber-800 text-[11px] font-semibold whitespace-nowrap">
            {dossier.expiresInDays !== null
              ? `Kedaluwarsa dalam ${dossier.expiresInDays} hari`
              : 'Tanpa masa berlaku'}
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          <div className="p-6 sm:p-8 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-slate-50/50">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-xl bg-[#071b34] text-amber-400 flex items-center justify-center font-bold text-xl shrink-0 shadow-sm">
                <Anchor className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                    {candidate.fullName}
                  </h1>
                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                      dossier.audit.sire2Compliant
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}
                  >
                    {candidate.matrixScore}% Matriks SIRE 2.0
                  </span>
                </div>
                <div className="text-sm font-semibold text-amber-700 flex items-center gap-2">
                  <span>{candidate.rank}</span>
                  <span className="text-slate-400">•</span>
                  <span className="text-slate-600 font-normal">{candidate.recommendation}</span>
                </div>
                <div className="text-xs text-slate-500 font-mono flex flex-wrap items-center gap-4 pt-1">
                  <span>
                    Buku Pelaut: <strong className="text-slate-800">{candidate.seamanBookNo}</strong>
                  </span>
                  <span>
                    SID: <strong className="text-slate-800">{candidate.sidNo}</strong>
                  </span>
                  <span>
                    Paspor: <strong className="text-slate-800">{candidate.passportNo}</strong>
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:items-end gap-1 sm:text-right">
              <span className="text-xs text-slate-500 font-medium">Penugasan Target:</span>
              <div className="text-sm font-bold text-slate-900 flex items-center gap-1 sm:justify-end">
                <Ship className="w-4 h-4 text-amber-600" />
                <span>{candidate.targetVessel}</span>
              </div>
              <span className="text-[11px] text-slate-500 max-w-xs">{candidate.vesselType}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-slate-100 bg-white border-b border-slate-100">
            <div className="p-4 text-center">
              <span className="text-[11px] text-slate-500 uppercase tracking-wider block font-semibold">
                Total Jam Layar
              </span>
              <span className="text-xl font-extrabold text-slate-900 mt-1 block">
                {candidate.totalSeaTimeYears} Tahun
              </span>
            </div>
            <div className="p-4 text-center">
              <span className="text-[11px] text-slate-500 uppercase tracking-wider block font-semibold">
                Jam Layar Tanker
              </span>
              <span className="text-xl font-extrabold text-amber-600 mt-1 block">
                {candidate.tankerSeaTimeYears} Tahun
              </span>
            </div>
            <div className="p-4 text-center">
              <span className="text-[11px] text-slate-500 uppercase tracking-wider block font-semibold">
                Ujian Marlins English
              </span>
              <span className="text-xl font-extrabold text-sky-600 mt-1 block">
                {candidate.marlinsScore !== null ? `${candidate.marlinsScore}%` : 'Belum ada'}
              </span>
            </div>
            <div className="p-4 text-center">
              <span className="text-[11px] text-slate-500 uppercase tracking-wider block font-semibold">
                Status Vetting
              </span>
              <span className="text-xs font-bold text-slate-800 mt-2 block px-2 py-0.5 rounded bg-slate-50 border border-slate-200 inline-block">
                {DECISION_LABEL[decision]}
              </span>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-8">
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 mb-3">
                <Ship className="w-4 h-4 text-amber-600" />
                Riwayat Jam Layar Resmi (Official Sea-Time Discharge Log)
              </h3>
              {candidate.seaTimeRecords.length === 0 ? (
                <p className="text-xs text-slate-500 p-4 rounded-lg bg-slate-50 border border-slate-200">
                  Belum ada catatan jam layar terverifikasi. Dossier ini belum dapat dipakai untuk
                  keputusan akhir.
                </p>
              ) : (
                <div className="overflow-x-auto border border-slate-200 rounded-lg">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-4">Nama Kapal</th>
                        <th className="py-2.5 px-4">Tipe Kapal</th>
                        <th className="py-2.5 px-4">Tonase / GT</th>
                        <th className="py-2.5 px-4">Jabatan</th>
                        <th className="py-2.5 px-4">Masa Tugas</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {candidate.seaTimeRecords.map((record, index) => (
                        <tr key={`${record.vessel}-${index}`} className="hover:bg-slate-50/60">
                          <td className="py-2.5 px-4 font-bold text-slate-900">{record.vessel}</td>
                          <td className="py-2.5 px-4 text-amber-700 font-medium">{record.type}</td>
                          <td className="py-2.5 px-4 font-mono text-slate-600">{record.grt}</td>
                          <td className="py-2.5 px-4 font-semibold text-slate-800">{record.rank}</td>
                          <td className="py-2.5 px-4 font-mono text-slate-500">{record.period}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 mb-3">
                <FileCheck2 className="w-4 h-4 text-sky-600" />
                Sertifikat STCW (Terverifikasi Vault Hublik)
              </h3>
              {candidate.stcwCertificates.length === 0 ? (
                <p className="text-xs text-slate-500 p-4 rounded-lg bg-slate-50 border border-slate-200">
                  Belum ada sertifikat STCW yang diunggah ke vault dokumen.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {candidate.stcwCertificates.map((cert, index) => (
                    <div
                      key={`${cert.name}-${index}`}
                      className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between"
                    >
                      <div>
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{cert.name}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{cert.authority}</div>
                      </div>
                      <span className="text-[11px] font-mono text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                        {cert.validUntil}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 mb-3">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Audit Matriks SIRE 2.0 / RightShip
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                  <div className="font-bold text-slate-900">Kepatuhan</div>
                  <div className="flex items-center gap-2 text-slate-700">
                    {dossier.audit.sire2Compliant ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-rose-600" />
                    )}
                    <span>SIRE 2.0 {dossier.audit.sire2Compliant ? 'terpenuhi' : 'belum terpenuhi'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    {dossier.audit.rightShipCompliant ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-rose-600" />
                    )}
                    <span>
                      RightShip {dossier.audit.rightShipCompliant ? 'terpenuhi' : 'belum terpenuhi'}
                    </span>
                  </div>
                  {dossier.audit.strengths.length > 0 && (
                    <ul className="pt-1 space-y-1 text-[11px] text-emerald-800 list-disc list-inside">
                      {dossier.audit.strengths.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 space-y-2">
                  <div className="font-bold text-amber-900">Catatan Kepatuhan</div>
                  {dossier.audit.complianceGaps.length === 0 ? (
                    <p className="text-[11px] text-amber-800">
                      Tidak ada gap matriks yang terdeteksi pada dossier ini.
                    </p>
                  ) : (
                    <ul className="space-y-1 text-[11px] text-amber-900 list-disc list-inside">
                      {dossier.audit.complianceGaps.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-200">
              {decided ? (
                <div
                  className={`p-6 rounded-xl border space-y-2 ${
                    decision === 'APPROVED'
                      ? 'bg-emerald-50 border-emerald-200'
                      : 'bg-rose-50 border-rose-200'
                  }`}
                >
                  <div
                    className={`flex items-center gap-2 font-bold text-sm ${
                      decision === 'APPROVED' ? 'text-emerald-800' : 'text-rose-800'
                    }`}
                  >
                    {decision === 'APPROVED' ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-rose-600" />
                    )}
                    {DECISION_LABEL[decision]}
                  </div>
                  <p className="text-xs text-slate-600">
                    {decision === 'APPROVED'
                      ? 'Keputusan tersimpan di sistem Haswakarya. Kandidat dilanjutkan ke tahap MCU & penandatanganan PKL.'
                      : 'Tim crewing akan menyiapkan kandidat alternatif dengan kualifikasi matriks yang setara.'}
                  </p>
                  <div className="text-[11px] text-slate-500 font-mono pt-1">
                    Penandatangan: {signerName || dossier.signerName || '—'} • Waktu:{' '}
                    {decidedAt ? new Date(decidedAt).toLocaleString('id-ID') : '—'}
                  </div>
                </div>
              ) : (
                <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      Keputusan Vetting Pemilik Kapal (Shipowner Action)
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Dengan menyetujui, Anda memberikan otorisasi resmi untuk penandatanganan Perjanjian
                      Kerja Laut (PKL) dan mobilisasi awak kapal.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label className="text-xs font-semibold text-slate-700 space-y-1">
                      <span>Nama Penandatangan *</span>
                      <input
                        type="text"
                        value={signerName}
                        onChange={(event) => setSignerName(event.target.value)}
                        placeholder="mis. Capt. Henrik Lindqvist"
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-amber-500 focus:outline-none"
                        disabled={isExpired || isInvalid || submitting !== null}
                      />
                    </label>
                    <label className="text-xs font-semibold text-slate-700 space-y-1">
                      <span>Catatan (opsional)</span>
                      <input
                        type="text"
                        value={remarks}
                        onChange={(event) => setRemarks(event.target.value)}
                        placeholder="mis. Perlu briefing armada sebelum sign-on"
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-amber-500 focus:outline-none"
                        disabled={isExpired || isInvalid || submitting !== null}
                      />
                    </label>
                  </div>

                  {error && (
                    <p className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
                      {error}
                    </p>
                  )}

                  <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                    <button
                      onClick={() => submitDecision('APPROVE')}
                      disabled={isExpired || isInvalid || submitting !== null}
                      className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer"
                    >
                      {submitting === 'APPROVE' ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4" />
                      )}
                      Setujui & Endorsement Kru (Approve for Joining)
                    </button>
                    <button
                      onClick={() => submitDecision('REQUEST_REPLACEMENT')}
                      disabled={isExpired || isInvalid || submitting !== null}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-white hover:bg-slate-50 disabled:opacity-50 text-rose-700 border border-rose-200 font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      {submitting === 'REQUEST_REPLACEMENT' ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-rose-600" />
                      )}
                      Minta Kandidat Alternatif (Request Replacement)
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <p className="text-center text-[11px] text-slate-400 flex items-center justify-center gap-1">
          <ExternalLink className="w-3 h-3" />
          Dokumen ini dihasilkan otomatis dari basis data ATS Haswakarya dan bukan contoh statis.
        </p>
      </div>
    </div>
  );
}
