'use client';

import React, { useEffect, useState } from 'react';
import { 
  ClipboardList, 
  Search, 
  Plus, 
  Ship, 
  Calendar, 
  MapPin, 
  DollarSign, 
  X,
  Users,
  CheckCircle2
} from 'lucide-react';

export default function RequisitionsPage() {
  const [requisitions, setRequisitions] = useState<any[]>([]);
  const [vessels, setVessels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Requisition Form State
  const [formData, setFormData] = useState({
    vesselId: '',
    rank: 'MASTER',
    requiredQuantity: '1',
    minSeaTimeMonths: '24',
    targetJoinDate: '2026-12-15',
    targetPort: 'Pelabuhan Tanjung Priok, Jakarta',
    salaryBudgetIdr: '85000000',
    salaryBudgetUsd: '5500',
    notes: 'Kandidat wajib memiliki pengalaman kapal tanker sejenis min. 2 tahun.',
  });
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [resReq, resVes] = await Promise.all([
        fetch('/api/portal/requisitions'),
        fetch('/api/portal/vessels'),
      ]);
      const jsonReq = await resReq.json();
      const jsonVes = await resVes.json();

      if (jsonReq.success) setRequisitions(jsonReq.data);
      if (jsonVes.success) {
        setVessels(jsonVes.data);
        if (jsonVes.data.length > 0 && !formData.vesselId) {
          setFormData((prev) => ({ ...prev, vesselId: jsonVes.data[0].id }));
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateRequisition = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);
    setSubmitting(true);

    try {
      const res = await fetch('/api/portal/requisitions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Gagal membuat requisition.');
      }

      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      setModalError(err.message || 'Terjadi kesalahan.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-slate-200 gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Permintaan Awak Kapal (Safe Manning Requisitions)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Data riil seluruh formasi safe manning yang membutuhkan perwira/rating di database PostgreSQL <code className="font-mono text-slate-700">CrewRequisition</code>
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 text-xs font-bold rounded-lg bg-[#071b34] hover:bg-[#0c2b52] text-white transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4 text-amber-400" />
          <span>Buat Permintaan Awak Baru</span>
        </button>
      </div>

      {/* Requisitions Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs min-w-0">
        <div className="overflow-x-auto">
          <table className="mobile-cards w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">No. Permintaan</th>
                <th className="py-3 px-4">Armada Kapal</th>
                <th className="py-3 px-4">Jabatan (Rank)</th>
                <th className="py-3 px-4">Pelabuhan & Tanggal Join</th>
                <th className="py-3 px-4">Anggaran Gaji</th>
                <th className="py-3 px-4">Kandidat</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {requisitions.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                  <td data-label="No. Permintaan" className="py-3.5 px-4 font-mono font-bold text-slate-900">
                    {r.requisitionNo}
                  </td>
                  <td data-label="Armada Kapal" className="py-3.5 px-4">
                    <div className="font-bold text-slate-900 flex items-center gap-1">
                      <Ship className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span className="break-words">{r.vessel?.name}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {r.vessel?.vesselType?.replace(/_/g, ' ')}
                    </div>
                  </td>
                  <td data-label="Jabatan" className="py-3.5 px-4 font-semibold text-slate-800">
                    {r.rank?.replace(/_/g, ' ')}
                  </td>
                  <td data-label="Pelabuhan / Join" className="py-3.5 px-4 text-slate-600">
                    <div className="truncate max-w-[180px] font-medium text-slate-900">{r.targetPort}</div>
                    <div className="text-[11px] text-slate-400">
                      Target: {new Date(r.targetJoinDate).toLocaleDateString('id-ID')}
                    </div>
                  </td>
                  <td data-label="Anggaran Gaji" className="py-3.5 px-4 font-mono text-slate-800">
                    {r.salaryBudgetUsd ? `$${r.salaryBudgetUsd.toLocaleString()}` : ''}
                    {r.salaryBudgetIdr && r.salaryBudgetUsd ? ' / ' : ''}
                    {r.salaryBudgetIdr ? `Rp ${(r.salaryBudgetIdr / 1000000).toFixed(0)}jt` : '-'}
                  </td>
                  <td data-label="Kandidat" className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded-md font-mono text-[11px] font-bold bg-slate-100 text-slate-700">
                      {r.applications?.length || 0} Pelamar
                    </span>
                  </td>
                  <td data-label="Status" className="py-3.5 px-4">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
              {requisitions.length === 0 && !loading && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400" data-label="">
                    Belum ada permintaan safe manning aktif.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tambah Permintaan Awak */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-t-2xl sm:rounded-2xl p-5 sm:p-6 max-w-xl w-full shadow-xl space-y-4 max-h-[92dvh] sm:max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Buat Permintaan Safe Manning Baru</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="p-3 rounded-lg bg-rose-50 text-rose-700 text-xs border border-rose-200">
                {modalError}
              </div>
            )}

            <form onSubmit={handleCreateRequisition} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Pilih Kapal Armada</label>
                <select
                  value={formData.vesselId}
                  onChange={(e) => setFormData({ ...formData, vesselId: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded p-2 focus:outline-none focus:border-amber-500 font-medium"
                >
                  {vessels.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.vesselType.replace(/_/g, ' ')}) - IMO {v.imoNumber}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Posisi Jabatan (Rank)</label>
                  <select
                    value={formData.rank}
                    onChange={(e) => setFormData({ ...formData, rank: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded p-2 focus:outline-none focus:border-amber-500 font-medium"
                  >
                    <option value="MASTER">Master (Nakhoda)</option>
                    <option value="CHIEF_OFFICER">Chief Officer (Mualim I)</option>
                    <option value="SECOND_OFFICER">Second Officer (Mualim II)</option>
                    <option value="THIRD_OFFICER">Third Officer (Mualim III)</option>
                    <option value="CHIEF_ENGINEER">Chief Engineer (KKM)</option>
                    <option value="SECOND_ENGINEER">Second Engineer (Masinis II)</option>
                    <option value="ABLE_SEAMAN">Able Seaman (Juru Mudi)</option>
                    <option value="OILER">Oiler (Juru Minyak)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Target Tanggal Join</label>
                  <input
                    type="date"
                    required
                    value={formData.targetJoinDate}
                    onChange={(e) => setFormData({ ...formData, targetJoinDate: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded p-2 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Pelabuhan Tempat Join (Sign-On)</label>
                <input
                  type="text"
                  required
                  value={formData.targetPort}
                  onChange={(e) => setFormData({ ...formData, targetPort: e.target.value })}
                  placeholder="Pelabuhan Tanjung Priok, Jakarta"
                  className="w-full bg-slate-50 border border-slate-200 rounded p-2 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex flex-wrap items-center justify-end gap-2 pt-4 border-t border-slate-100">
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
                  className="px-4 py-2 rounded-lg bg-[#071b34] text-white font-bold hover:bg-[#0c2b52] disabled:opacity-50"
                >
                  {submitting ? 'Membuat...' : 'Terbitkan Permintaan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
