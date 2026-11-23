'use client';

import React, { useEffect, useState } from 'react';
import {
  FileCheck2,
  Plus,
  Search,
  Filter,
  Ship,
  Users,
  ShieldCheck,
  Calendar,
  Printer,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  FileText,
  DollarSign,
} from 'lucide-react';
import type { PklContractData } from '@/components/portal/PklDocumentViewer';
import dynamic from 'next/dynamic';

// Viewer PKL baru dirender setelah kontrak dipilih; pisahkan dari bundel awal.
const PklDocumentViewer = dynamic(
  () => import('@/components/portal/PklDocumentViewer').then((m) => m.PklDocumentViewer),
  { ssr: false }
);


interface ContractCompliance {
  status: 'ON_TRACK' | 'DUE_SOON' | 'MLC_BREACH' | 'UNKNOWN';
  daysToScheduledEnd: number;
  daysToMlcLimit: number;
  mlcLimitDate: string;
}

const MLC_BADGE: Record<string, string> = {
  ON_TRACK: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  DUE_SOON: 'bg-amber-50 text-amber-700 border-amber-200',
  MLC_BREACH: 'bg-rose-50 text-rose-700 border-rose-200',
  UNKNOWN: 'bg-slate-50 text-slate-600 border-slate-200',
};

function MlcBadge({ compliance }: { compliance: ContractCompliance | null }) {
  if (!compliance) {
    return <span className="text-[11px] text-slate-400">—</span>;
  }

  const label =
    compliance.status === 'ON_TRACK'
      ? `Aman · ${compliance.daysToMlcLimit} hari lagi`
      : compliance.status === 'DUE_SOON'
        ? `Segera · ${Math.min(compliance.daysToMlcLimit, compliance.daysToScheduledEnd)} hari`
        : compliance.status === 'MLC_BREACH'
          ? 'Lewat batas 11 bulan'
          : 'Tidak diketahui';

  return (
    <span
      className={`inline-flex flex-col gap-0.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border ${
        MLC_BADGE[compliance.status] ?? MLC_BADGE.UNKNOWN
      }`}
      title={`Batas ILO MLC 11 bulan: ${new Date(compliance.mlcLimitDate).toLocaleDateString('id-ID')}`}
    >
      <span>{label}</span>
      <span className="font-mono font-normal opacity-70">
        limit {new Date(compliance.mlcLimitDate).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: '2-digit' })}
      </span>
    </span>
  );
}

export default function ContractsPage() {
  const [contracts, setContracts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [seafarers, setSeafarers] = useState<any[]>([]);
  const [vessels, setVessels] = useState<any[]>([]);

  // Modal State
  const [selectedContract, setSelectedContract] = useState<PklContractData | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    seafarerId: '',
    vesselId: '',
    rank: 'MASTER',
    signOnDate: new Date().toISOString().split('T')[0],
    durationMonths: 6,
    monthlyBasicWageUsd: 2800,
    monthlyBasicWageIdr: 0,
    allotmentPercentage: 80,
    onboardCashAdvance: 20,
    insurancePolicyNo: 'PI-WAR-HWK-2026',
    status: 'ACTIVE_ONBOARD',
  });
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadContracts = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/portal/pkl');
      const json = await res.json();
      if (json.success) {
        setContracts(json.data);
      }
    } catch (e) {
      console.error('Failed to load PKL contracts:', e);
    } finally {
      setLoading(false);
    }
  };

  const loadOptions = async () => {
    try {
      const [resS, resV] = await Promise.all([
        fetch('/api/portal/seafarers'),
        fetch('/api/portal/vessels'),
      ]);
      const jsonS = await resS.json();
      const jsonV = await resV.json();
      if (jsonS.success) setSeafarers(jsonS.data);
      if (jsonV.success) setVessels(jsonV.data);
    } catch (e) {
      console.error('Failed to load options:', e);
    }
  };

  useEffect(() => {
    loadContracts();
    loadOptions();
  }, []);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/portal/pkl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Gagal membuat kontrak PKL.');

      setIsCreateOpen(false);
      loadContracts();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error';
      setErrorMsg(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const openViewer = (c: any) => {
    setSelectedContract(c);
    setIsViewerOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-slate-200 gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Perjanjian Kerja Laut (PKL) Digital
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manajemen kontrak kerja tripartit resmi Ditjen Perhubungan Laut RI &amp; standar ILO MLC 2006 Standard A2.1.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            if (seafarers.length > 0 && !formData.seafarerId) {
              setFormData((p) => ({ ...p, seafarerId: seafarers[0].id }));
            }
            if (vessels.length > 0 && !formData.vesselId) {
              setFormData((p) => ({ ...p, vesselId: vessels[0].id }));
            }
            setIsCreateOpen(true);
          }}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-[#071b34] hover:bg-[#0c2b52] text-white text-xs font-bold transition shadow-xs cursor-pointer self-start sm:self-auto w-full sm:w-auto"
        >
          <Plus className="w-4 h-4 text-amber-400" />
          <span>Buat Kontrak PKL Baru</span>
        </button>
      </div>

      {/* Contracts Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs min-w-0">
        <div className="p-4 border-b border-slate-100 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-xs text-slate-600 font-medium">
            Total <strong className="text-navy">{contracts.length}</strong> kontrak PKL terdaftar di database
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-500">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
            <span>Memuat data kontrak PKL...</span>
          </div>
        ) : contracts.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            Belum ada kontrak PKL yang tercatat. Silakan klik tombol &quot;Buat Kontrak PKL Baru&quot;.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="mobile-cards w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">No. Kontrak</th>
                  <th className="py-3 px-4">Nama Pelaut</th>
                  <th className="py-3 px-4">Armada Kapal</th>
                  <th className="py-3 px-4">Jabatan</th>
                  <th className="py-3 px-4">Upah / Allotment</th>
                  <th className="py-3 px-4">Masa Kontrak (ILO MLC)</th>
                  <th className="py-3 px-4">Status PKL</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {contracts.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 transition">
                    <td data-label="No. Kontrak" className="py-3.5 px-4 font-mono font-bold text-navy">
                      {c.contractNo}
                    </td>
                    <td data-label="Nama Pelaut" className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{c.seafarer?.user?.fullName}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{c.seafarer?.seamanBookNo}</div>
                    </td>
                    <td data-label="Armada Kapal" className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{c.vessel?.name}</div>
                      <div className="text-[11px] text-slate-400">{c.vessel?.vesselType?.replace(/_/g, ' ')}</div>
                    </td>
                    <td data-label="Jabatan" className="py-3.5 px-4 font-semibold text-slate-800">
                      {c.rank?.replace(/_/g, ' ')}
                    </td>
                    <td data-label="Upah / Allotment" className="py-3.5 px-4 font-mono text-xs">
                      <div className="font-bold text-slate-900">
                        {c.monthlyBasicWageUsd ? `$${c.monthlyBasicWageUsd.toLocaleString()}` : `Rp ${c.monthlyBasicWageIdr?.toLocaleString()}`}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {c.allotmentPercentage}% Allotment
                      </div>
                    </td>
                    <td data-label="Masa Kontrak (MLC)" className="py-3.5 px-4">
                      <MlcBadge compliance={c.compliance ?? null} />
                    </td>
                    <td data-label="Status PKL" className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {c.status?.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td data-label="Aksi" className="py-3.5 px-4 sm:text-right mc-actions">
                      <div className="mc-action-row inline-flex items-center gap-2 sm:justify-end">
                        <button
                          type="button"
                          onClick={() => openViewer(c)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-primary bg-sky-50 hover:bg-sky-100 border border-sky-200 transition cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Lihat &amp; Cetak PKL</span>
                        </button>
                        <a
                          href={`/api/portal/pkl/${c.id}/pdf`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 transition"
                          title="Unduh PKL sebagai berkas PDF"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>PDF</span>
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Buat PKL Baru */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-t-2xl sm:rounded-2xl p-5 sm:p-6 max-w-xl w-full shadow-2xl space-y-4 max-h-[92dvh] sm:max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-bold text-slate-900">Generate Kontrak PKL Tripartit</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 font-medium">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Pilih Pelaut *</label>
                  <select
                    required
                    value={formData.seafarerId}
                    onChange={(e) => setFormData({ ...formData, seafarerId: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-medium"
                  >
                    <option value="">-- Pilih Pelaut --</option>
                    {seafarers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.user?.fullName} ({s.seamanBookNo})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Pilih Armada Kapal *</label>
                  <select
                    required
                    value={formData.vesselId}
                    onChange={(e) => setFormData({ ...formData, vesselId: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-medium"
                  >
                    <option value="">-- Pilih Kapal --</option>
                    {vessels.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name} ({v.vesselType})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Jabatan / Rank di Kapal *</label>
                  <select
                    value={formData.rank}
                    onChange={(e) => setFormData({ ...formData, rank: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-medium"
                  >
                    <option value="MASTER">Master (Nakhoda)</option>
                    <option value="CHIEF_OFFICER">Chief Officer (Mualim I)</option>
                    <option value="SECOND_OFFICER">Second Officer (Mualim II)</option>
                    <option value="THIRD_OFFICER">Third Officer (Mualim III)</option>
                    <option value="CHIEF_ENGINEER">Chief Engineer (KKM)</option>
                    <option value="SECOND_ENGINEER">Second Engineer (Masinis II)</option>
                    <option value="BOSUN">Bosun (Serang)</option>
                    <option value="ABLE_SEAMAN">Able Seaman (Juru Mudi)</option>
                    <option value="OILER">Oiler (Juru Minyak)</option>
                    <option value="CHIEF_COOK">Chief Cook</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Tanggal Sign-On *</label>
                  <input
                    type="date"
                    required
                    value={formData.signOnDate}
                    onChange={(e) => setFormData({ ...formData, signOnDate: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Durasi Kontrak (Bulan)</label>
                  <input
                    type="number"
                    min={1}
                    max={12}
                    value={formData.durationMonths}
                    onChange={(e) => setFormData({ ...formData, durationMonths: parseInt(e.target.value, 10) })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Gaji Pokok (USD)</label>
                  <input
                    type="number"
                    value={formData.monthlyBasicWageUsd}
                    onChange={(e) => setFormData({ ...formData, monthlyBasicWageUsd: parseFloat(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Allotment Keluarga (%)</label>
                  <input
                    type="number"
                    min={50}
                    max={90}
                    value={formData.allotmentPercentage}
                    onChange={(e) => setFormData({ ...formData, allotmentPercentage: parseFloat(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-[11px] text-slate-600">
                Kontrak akan dibuat sesuai format standar Ditjen Hubla &amp; ILO MLC 2006 Reg 1.4, mencakup klausul zero placement fee, asuransi P&amp;I War Risk, dan jaminan repatriasi.
              </div>

              <div className="flex flex-wrap justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#071b34] text-white font-bold hover:bg-[#0c2b52] disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileCheck2 className="w-3.5 h-3.5" />}
                  <span>Generate PKL Resmi</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PKL Document Viewer & Print Modal */}
      <PklDocumentViewer
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
        contract={selectedContract}
      />
    </div>
  );
}
