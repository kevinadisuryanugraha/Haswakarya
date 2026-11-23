'use client';

import React, { useEffect, useState } from 'react';
import {
  CreditCard,
  DollarSign,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Send,
  Loader2,
  Building2,
  Users,
  Calendar,
  X,
  FileCheck2,
  AlertCircle,
  Download,
  ShieldCheck,
} from 'lucide-react';
import { computeMonthlyWithholding, isPtkpStatus, type PtkpStatus } from '@/lib/tax/pph21';

export default function PayrollPage() {
  const [payrolls, setPayrolls] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>({
    totalRecords: 0,
    totalGrossWage: 0,
    totalAllotments: 0,
    totalOnboardPaid: 0,
    disbursedCount: 0,
    totalPph21: 0,
    totalNetWage: 0,
    recordsMissingNpwp: 0,
  });
  const [taxPeriod, setTaxPeriod] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });
  const [loading, setLoading] = useState(true);
  const [seafarers, setSeafarers] = useState<any[]>([]);

  // Create Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    seafarerId: '',
    periodMonth: new Date().getMonth() + 1,
    periodYear: new Date().getFullYear(),
    basicWage: 25000000,
    leavePay: 2000000,
    overtimeAllowance: 3500000,
    dangerBonusCargo: 1500000,
    allotmentPercentage: 80,
    bankAccountTarget: 'Bank Mandiri 109-00-1827364-1 (Istri)',
    isDisbursed: true,
    npwp: '',
    ptkpStatus: '' as PtkpStatus | '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/portal/payroll');
      const json = await res.json();
      if (json.success) {
        setPayrolls(json.data);
        setSummary(json.summary);
      }
    } catch (e) {
      console.error('Failed to load payroll:', e);
    } finally {
      setLoading(false);
    }
  };

  const loadSeafarers = async () => {
    try {
      const res = await fetch('/api/portal/seafarers');
      const json = await res.json();
      if (json.success) {
        setSeafarers(json.data);
      }
    } catch (e) {
      console.error('Failed to load seafarers:', e);
    }
  };

  useEffect(() => {
    loadData();
    loadSeafarers();
  }, []);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/portal/payroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Gagal menyimpan payroll.');

      setIsModalOpen(false);
      loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error';
      setErrorMsg(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const downloadEbupot = () => {
    const url = `/api/portal/payroll/tax-summary?month=${taxPeriod.month}&year=${taxPeriod.year}&format=csv`;
    window.location.href = url;
  };

  const selectedSeafarer = seafarers.find((s) => s.id === formData.seafarerId);
  const previewGross =
    (formData.basicWage || 0) +
    (formData.leavePay || 0) +
    (formData.overtimeAllowance || 0) +
    (formData.dangerBonusCargo || 0);
  const previewWithholding = computeMonthlyWithholding({
    monthlyGross: previewGross,
    status: isPtkpStatus(formData.ptkpStatus)
      ? formData.ptkpStatus
      : isPtkpStatus(selectedSeafarer?.ptkpStatus)
        ? selectedSeafarer.ptkpStatus
        : 'TK0',
    month: formData.periodMonth,
  });

  const toggleDisburse = async (id: string, currentStatus: boolean) => {
    try {
      await fetch('/api/portal/payroll', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isDisbursed: !currentStatus }),
      });
      loadData();
    } catch (e) {
      console.error('Failed to toggle disburse:', e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-slate-200 gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Crew Payroll &amp; Family Remittance Engine
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Kalkulasi kompensasi awak kapal, pemisahan uang saku kapal (onboard cash), dan remitansi alokasi keluarga (family allotment) sesuai MLC 2006 Reg 2.2.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            if (seafarers.length > 0 && !formData.seafarerId) {
              setFormData((p) => ({ ...p, seafarerId: seafarers[0].id }));
            }
            setIsModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-[#071b34] hover:bg-[#0c2b52] text-white text-xs font-bold transition shadow-xs cursor-pointer self-start sm:self-auto w-full sm:w-auto"
        >
          <Plus className="w-4 h-4 text-amber-400" />
          <span>Buat Slip Payroll Baru</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5 gap-3 sm:gap-4">
        <div className="portal-kpi bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">Total Kompensasi Kotor (Gross)</div>
          <div className="text-xl sm:text-2xl font-extrabold text-navy mt-2 break-words">
            Rp {(summary.totalGrossWage || 0).toLocaleString('id-ID')}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Gaji pokok + lembur + tunjangan</div>
        </div>

        <div className="portal-kpi bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">Allotment Keluarga (Darat)</div>
          <div className="text-xl sm:text-2xl font-extrabold text-emerald-700 mt-2 break-words">
            Rp {(summary.totalAllotments || 0).toLocaleString('id-ID')}
          </div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">Ditransfer langsung ke rekening keluarga</div>
        </div>

        <div className="portal-kpi bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">Uang Saku Onboard (Kapal)</div>
          <div className="text-xl sm:text-2xl font-extrabold text-amber-700 mt-2 break-words">
            Rp {(summary.totalOnboardPaid || 0).toLocaleString('id-ID')}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Diberikan tunai di atas kapal</div>
        </div>

        <div className="portal-kpi bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">Status Penyaluran (Disbursed)</div>
          <div className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-2 break-words">
            {summary.disbursedCount} / {summary.totalRecords} Slip
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Sesuai audit Ditjen Hubla &amp; ITF</div>
        </div>

        <div className="portal-kpi bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">PPh 21 Dipotong</div>
          <div className="text-xl sm:text-2xl font-extrabold text-rose-700 mt-2 break-words">
            Rp {(summary.totalPph21 || 0).toLocaleString('id-ID')}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {summary.recordsMissingNpwp > 0
              ? `${summary.recordsMissingNpwp} slip tanpa NPWP`
              : 'Semua slip punya NPWP'}
          </div>
        </div>
      </div>

      {/* Payroll Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="text-xs text-slate-600 font-medium">
            Menampilkan <strong className="text-navy">{payrolls.length}</strong> catatan penggajian awak kapal
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={taxPeriod.month}
              onChange={(e) => setTaxPeriod({ ...taxPeriod, month: parseInt(e.target.value, 10) })}
              className="bg-slate-50 border border-slate-300 rounded-lg px-2 py-1.5 text-xs font-medium"
              aria-label="Masa pajak PPh 21"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
                <option key={m} value={m}>Masa {m}</option>
              ))}
            </select>
            <input
              type="number"
              value={taxPeriod.year}
              onChange={(e) => setTaxPeriod({ ...taxPeriod, year: parseInt(e.target.value, 10) || taxPeriod.year })}
              className="w-[4.75rem] bg-slate-50 border border-slate-300 rounded-lg px-2 py-1.5 text-xs font-mono"
              aria-label="Tahun pajak PPh 21"
            />
            <button
              type="button"
              onClick={downloadEbupot}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Ekspor e-Bupot CSV</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-500">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
            <span>Memuat data payroll &amp; allotment...</span>
          </div>
        ) : payrolls.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            Belum ada catatan payroll di database. Silakan klik tombol &quot;Buat Slip Payroll Baru&quot;.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="mobile-cards w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Awak Kapal (Pelaut)</th>
                  <th className="py-3 px-4">Periode</th>
                  <th className="py-3 px-4">Total Gaji Bruto</th>
                  <th className="py-3 px-4">Allotment Keluarga (80%)</th>
                  <th className="py-3 px-4">Uang Saku Kapal (20%)</th>
                  <th className="py-3 px-4">PPh 21</th>
                  <th className="py-3 px-4">Neto</th>
                  <th className="py-3 px-4">NPWP</th>
                  <th className="py-3 px-4">Rekening Tujuan Keluarga</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {payrolls.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 transition">
                    <td data-label="Awak Kapal" className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{p.seafarer?.user?.fullName}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{p.seafarer?.seamanBookNo}</div>
                    </td>
                    <td data-label="Periode" className="py-3.5 px-4 font-mono font-medium text-slate-800">
                      Bulan {p.periodMonth} / {p.periodYear}
                    </td>
                    <td data-label="Gaji Bruto" className="py-3.5 px-4 font-mono font-bold text-navy">
                      Rp {p.totalGrossWage.toLocaleString('id-ID')}
                    </td>
                    <td data-label="Allotment 80%" className="py-3.5 px-4 font-mono font-bold text-emerald-700">
                      Rp {p.allotmentAmount.toLocaleString('id-ID')}
                    </td>
                    <td data-label="Uang Saku 20%" className="py-3.5 px-4 font-mono text-slate-600">
                      Rp {p.onboardPaidAmount.toLocaleString('id-ID')}
                    </td>
                    <td data-label="PPh 21" className="py-3.5 px-4 font-mono font-bold text-rose-700">
                      Rp {(p.pph21Amount || 0).toLocaleString('id-ID')}
                      <div className="text-[10px] font-normal text-slate-400">
                        PTKP {p.ptkpSnapshot || p.seafarer?.ptkpStatus || 'TK0'}
                        {p.pph21Amount < 0 ? ' (lebih potong)' : ''}
                      </div>
                    </td>
                    <td data-label="Neto" className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      Rp {(p.netWage || p.totalGrossWage - (p.pph21Amount || 0)).toLocaleString('id-ID')}
                    </td>
                    <td data-label="NPWP" className="py-3.5 px-4 font-mono text-[11px] text-slate-600">
                      {p.seafarer?.npwp || <span className="text-rose-600 font-semibold">Belum ada</span>}
                    </td>
                    <td data-label="Rekening Tujuan" className="py-3.5 px-4 text-[11px] text-slate-600">
                      {p.bankAccountTarget || '-'}
                    </td>
                    <td data-label="Status" className="py-3.5 px-4">
                      {p.isDisbursed ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Disbursed</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                          <Clock className="w-3 h-3 text-amber-600" />
                          <span>Pending</span>
                        </span>
                      )}
                    </td>
                    <td data-label="Aksi" className="py-3.5 px-4 sm:text-right mc-actions">
                      <button
                        type="button"
                        onClick={() => toggleDisburse(p.id, p.isDisbursed)}
                        className={`px-2.5 py-1 rounded text-xs font-semibold transition cursor-pointer ${
                          p.isDisbursed
                            ? 'text-slate-500 hover:bg-slate-100'
                            : 'text-white bg-emerald-600 hover:bg-emerald-700 shadow-2xs'
                        }`}
                      >
                        {p.isDisbursed ? 'Buka Kembali' : 'Approve Transfer'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Buat Slip Payroll */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-t-2xl sm:rounded-2xl p-5 sm:p-6 max-w-xl w-full shadow-2xl space-y-4 max-h-[92dvh] sm:max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">Hitung &amp; Terbitkan Slip Payroll</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
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
                      {s.user?.fullName} ({s.primaryRank} - {s.seamanBookNo})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Bulan Periode *</label>
                  <select
                    value={formData.periodMonth}
                    onChange={(e) => setFormData({ ...formData, periodMonth: parseInt(e.target.value, 10) })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-medium"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
                      <option key={m} value={m}>Bulan {m}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Tahun Periode *</label>
                  <input
                    type="number"
                    value={formData.periodYear}
                    onChange={(e) => setFormData({ ...formData, periodYear: parseInt(e.target.value, 10) })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Gaji Pokok (IDR) *</label>
                  <input
                    type="number"
                    required
                    value={formData.basicWage}
                    onChange={(e) => setFormData({ ...formData, basicWage: parseFloat(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Uang Lembur (Overtime)</label>
                  <input
                    type="number"
                    value={formData.overtimeAllowance}
                    onChange={(e) => setFormData({ ...formData, overtimeAllowance: parseFloat(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Uang Cuti (Leave Pay)</label>
                  <input
                    type="number"
                    value={formData.leavePay}
                    onChange={(e) => setFormData({ ...formData, leavePay: parseFloat(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Tunjangan Muatan / Tanker Bonus</label>
                  <input
                    type="number"
                    value={formData.dangerBonusCargo}
                    onChange={(e) => setFormData({ ...formData, dangerBonusCargo: parseFloat(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">NPWP Pelaut</label>
                  <input
                    type="text"
                    placeholder={selectedSeafarer?.npwp ? 'Ikuti profil pelaut' : '15/16 digit'}
                    value={formData.npwp}
                    onChange={(e) => setFormData({ ...formData, npwp: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Status PTKP</label>
                  <select
                    value={formData.ptkpStatus}
                    onChange={(e) =>
                      setFormData({ ...formData, ptkpStatus: e.target.value as PtkpStatus | '' })
                    }
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-medium"
                  >
                    <option value="">
                      Ikuti profil{selectedSeafarer?.ptkpStatus ? ` (${selectedSeafarer.ptkpStatus})` : ''}
                    </option>
                    {(['TK0', 'TK1', 'TK2', 'TK3', 'K0', 'K1', 'K2', 'K3'] as PtkpStatus[]).map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Rekening Transfer Keluarga</label>
                <input
                  type="text"
                  placeholder="e.g. Bank Mandiri 109-00-1827364-1 a.n Siti Fatimah"
                  value={formData.bankAccountTarget}
                  onChange={(e) => setFormData({ ...formData, bankAccountTarget: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono"
                />
              </div>

              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-[11px] text-emerald-800 space-y-1 font-mono">
                <div className="flex justify-between">
                  <span>Estimasi Gaji Bruto:</span>
                  <strong>Rp {(formData.basicWage + formData.overtimeAllowance + formData.leavePay + formData.dangerBonusCargo).toLocaleString('id-ID')}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Transfer Remittance (80%):</span>
                  <strong className="text-emerald-700">Rp {Math.round((formData.basicWage + formData.overtimeAllowance + formData.leavePay + formData.dangerBonusCargo) * 0.8).toLocaleString('id-ID')}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Uang Saku Kapal (20%):</span>
                  <span>Rp {Math.round((formData.basicWage + formData.overtimeAllowance + formData.leavePay + formData.dangerBonusCargo) * 0.2).toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-emerald-200">
                  <span className="inline-flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    PPh 21 ({previewWithholding.status}):
                  </span>
                  <strong className="text-rose-700">
                    Rp {previewWithholding.amount.toLocaleString('id-ID')}
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span>Take-home (neto):</span>
                  <strong className="text-slate-900">
                    Rp {previewWithholding.netWage.toLocaleString('id-ID')}
                  </strong>
                </div>
                <div className="text-[10px] text-emerald-700/80 font-sans">
                  Metode annualisasi Pasal 17. Masa Desember otomatis dikoreksi agar total setahun pas.
                </div>
              </div>

              <div className="flex flex-wrap justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#071b34] text-white font-bold hover:bg-[#0c2b52] disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CreditCard className="w-3.5 h-3.5" />}
                  <span>Simpan Slip Payroll</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
