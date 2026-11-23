'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Ship, 
  Info,
  ChevronRight,
  RotateCcw
} from 'lucide-react';
import { evaluateOfficerPairing, OfficerMatrixProfile, PairMatrixEvaluation } from '@/lib/ai/matrixMatcher';

export default function SireMatrixSimulatorPage() {
  const [senior, setSenior] = useState<OfficerMatrixProfile>({
    fullName: 'Capt. Hendra Gunawan, M.Mar',
    rank: 'MASTER',
    vesselType: 'OIL_CHEMICAL_TANKER',
    timeInRankMonths: 24,
    timeOnVesselTypeMonths: 48,
    timeWithOperatorMonths: 18,
    marlinsScore: 89,
  });

  const [junior, setJunior] = useState<OfficerMatrixProfile>({
    fullName: 'Mualim I Irfan Hakim, S.Tr.Pel',
    rank: 'CHIEF_OFFICER',
    vesselType: 'OIL_CHEMICAL_TANKER',
    timeInRankMonths: 14,
    timeOnVesselTypeMonths: 26,
    timeWithOperatorMonths: 12,
    marlinsScore: 84,
  });

  const evaluation: PairMatrixEvaluation = evaluateOfficerPairing(senior, junior);

  const handleLoadCompliant = () => {
    setSenior({
      fullName: 'Capt. Hendra Gunawan, M.Mar',
      rank: 'MASTER',
      vesselType: 'OIL_CHEMICAL_TANKER',
      timeInRankMonths: 24,
      timeOnVesselTypeMonths: 48,
      timeWithOperatorMonths: 18,
      marlinsScore: 89,
    });
    setJunior({
      fullName: 'Mualim I Irfan Hakim, S.Tr.Pel',
      rank: 'CHIEF_OFFICER',
      vesselType: 'OIL_CHEMICAL_TANKER',
      timeInRankMonths: 14,
      timeOnVesselTypeMonths: 26,
      timeWithOperatorMonths: 12,
      marlinsScore: 84,
    });
  };

  const handleLoadDeficit = () => {
    setSenior({
      fullName: 'Capt. Rudy Susanto',
      rank: 'MASTER',
      vesselType: 'OIL_CHEMICAL_TANKER',
      timeInRankMonths: 4,
      timeOnVesselTypeMonths: 12,
      timeWithOperatorMonths: 3,
      marlinsScore: 76,
    });
    setJunior({
      fullName: 'Mualim I Dwi Cahyono',
      rank: 'CHIEF_OFFICER',
      vesselType: 'OIL_CHEMICAL_TANKER',
      timeInRankMonths: 2,
      timeOnVesselTypeMonths: 8,
      timeWithOperatorMonths: 2,
      marlinsScore: 72,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-slate-200 gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Simulator Kepatuhan Officer Matrix Pairing (OCIMF SIRE 2.0)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Validasi jam layar perwira kunci sesuai standar migas internasional Pertamina, Chevron, Shell, dan terminal tanker.
          </p>
          <p className="text-[11px] text-amber-700 mt-1">
            Alat bantu skenario: nilai awal terisi contoh (contoh nama fiktif), semua field dapat diubah dan hasil dihitung ulang secara lokal.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleLoadCompliant}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors cursor-pointer"
          >
            Load Preset Lolos (Compliant)
          </button>
          <button
            onClick={handleLoadDeficit}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition-colors cursor-pointer"
          >
            Load Preset Defisit (Gapped)
          </button>
        </div>
      </div>

      {/* Grid: Inputs vs Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form Inputs (7 Cols) */}
        <div className="lg:col-span-7 min-w-0 space-y-6">
          {/* Senior Officer */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Ship className="w-4 h-4 text-amber-600" />
                Perwira Senior (Nakhoda / Chief Engineer)
              </span>
              <span className="text-xs text-slate-400 font-mono">Rank: MASTER</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="text-slate-600 block mb-1 font-semibold">Nama Lengkap & Gelar</label>
                <input
                  type="text"
                  value={senior.fullName}
                  onChange={(e) => setSenior({ ...senior, fullName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="text-slate-600 block mb-1 font-semibold">Jam di Jabatan (Time in Rank)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={senior.timeInRankMonths}
                    onChange={(e) => setSenior({ ...senior, timeInRankMonths: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white font-mono"
                  />
                  <span className="text-slate-500">Bulan</span>
                </div>
              </div>

              <div>
                <label className="text-slate-600 block mb-1 font-semibold">Jam di Tipe Kapal</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={senior.timeOnVesselTypeMonths}
                    onChange={(e) => setSenior({ ...senior, timeOnVesselTypeMonths: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white font-mono"
                  />
                  <span className="text-slate-500">Bulan</span>
                </div>
              </div>

              <div>
                <label className="text-slate-600 block mb-1 font-semibold">Skor Ujian Marlins (%)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={senior.marlinsScore}
                    onChange={(e) => setSenior({ ...senior, marlinsScore: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white font-mono"
                  />
                  <span className="text-slate-500">%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Junior Officer */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Ship className="w-4 h-4 text-sky-600" />
                Perwira Partner (Chief Officer / Second Engineer)
              </span>
              <span className="text-xs text-slate-400 font-mono">Rank: CHIEF_OFFICER</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="text-slate-600 block mb-1 font-semibold">Nama Lengkap & Gelar</label>
                <input
                  type="text"
                  value={junior.fullName}
                  onChange={(e) => setJunior({ ...junior, fullName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="text-slate-600 block mb-1 font-semibold">Jam di Jabatan (Time in Rank)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={junior.timeInRankMonths}
                    onChange={(e) => setJunior({ ...junior, timeInRankMonths: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white font-mono"
                  />
                  <span className="text-slate-500">Bulan</span>
                </div>
              </div>

              <div>
                <label className="text-slate-600 block mb-1 font-semibold">Jam di Tipe Kapal</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={junior.timeOnVesselTypeMonths}
                    onChange={(e) => setJunior({ ...junior, timeOnVesselTypeMonths: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white font-mono"
                  />
                  <span className="text-slate-500">Bulan</span>
                </div>
              </div>

              <div>
                <label className="text-slate-600 block mb-1 font-semibold">Skor Ujian Marlins (%)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={junior.marlinsScore}
                    onChange={(e) => setJunior({ ...junior, marlinsScore: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white font-mono"
                  />
                  <span className="text-slate-500">%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Evaluation Result (5 Cols) */}
        <div className="lg:col-span-5 min-w-0 space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
            <div className="flex flex-col gap-3 pb-4 border-b border-slate-100 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <span className="text-xs text-slate-500 uppercase tracking-wider block font-semibold">
                  Skor Matriks Kepatuhan
                </span>
                <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-1">
                  {evaluation.matrixScore}
                  <span className="text-xl text-slate-400 font-normal"> / 100</span>
                </div>
              </div>

              <div>
                <span
                  className={`text-xs font-bold px-3 py-1.5 rounded-lg border inline-flex items-center gap-1.5 ${
                    evaluation.recommendation === 'STRONGLY_APPROVED'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : evaluation.recommendation === 'APPROVED_WITH_CONDITIONS'
                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                      : 'bg-rose-50 text-rose-800 border-rose-200'
                  }`}
                >
                  {evaluation.recommendation === 'STRONGLY_APPROVED' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                  {evaluation.recommendation === 'APPROVED_WITH_CONDITIONS' && <Info className="w-4 h-4 text-amber-600" />}
                  {evaluation.recommendation === 'MATRIX_NON_COMPLIANT' && <AlertTriangle className="w-4 h-4 text-rose-600" />}
                  {evaluation.recommendation.replace(/_/g, ' ')}
                </span>
              </div>
            </div>

            {/* Threshold Indicators */}
            <div className="space-y-2.5 text-xs">
              <div className="flex flex-col gap-1 p-2.5 rounded bg-slate-50 border border-slate-100 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                <span className="text-slate-600 min-w-0">Gabungan Jam Layar Tipe Kapal:</span>
                <span className="font-bold text-slate-900 font-mono">
                  {evaluation.combinedVesselTypeSeaTimeMonths} Bulan{' '}
                  <span className={evaluation.combinedVesselTypeSeaTimeMonths >= 36 ? 'text-emerald-600' : 'text-rose-600'}>
                    (Min. 36 Bln)
                  </span>
                </span>
              </div>

              <div className="flex flex-col gap-1 p-2.5 rounded bg-slate-50 border border-slate-100 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                <span className="text-slate-600">Kepatuhan OCIMF SIRE 2.0:</span>
                <span className={`font-bold font-mono ${evaluation.sire2Compliant ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {evaluation.sire2Compliant ? 'PASSED (LOLOS)' : 'FAILED (DEFISIT)'}
                </span>
              </div>

              <div className="flex flex-col gap-1 p-2.5 rounded bg-slate-50 border border-slate-100 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                <span className="text-slate-600">Kepatuhan RightShip Matrix:</span>
                <span className={`font-bold font-mono ${evaluation.rightShipCompliant ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {evaluation.rightShipCompliant ? 'PASSED (LOLOS)' : 'CONDITIONAL'}
                </span>
              </div>
            </div>

            {/* Strengths & Gaps */}
            <div className="space-y-4 pt-2 border-t border-slate-100">
              {evaluation.strengths.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2">
                    Keunggulan Matriks:
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-700">
                    {evaluation.strengths.map((s, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {evaluation.complianceGaps.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-rose-800 uppercase tracking-wider mb-2">
                    Defisit Regulasi:
                  </h4>
                  <ul className="space-y-1.5 text-xs text-rose-700">
                    {evaluation.complianceGaps.map((g, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                        <span>{g}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Audit Summary Box */}
            <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900">
              <span className="font-bold block mb-1 text-amber-950">Ringkasan Audit AI SIRE:</span>
              <p className="leading-relaxed">{evaluation.auditSummary}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
