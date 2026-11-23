'use client';

import React, { useEffect, useState } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Filter, 
  FileCheck2, 
  Ship, 
  Phone, 
  Mail, 
  CheckCircle2, 
  X,
  Award,
  ShieldCheck,
  FileText,
} from 'lucide-react';
import dynamic from 'next/dynamic';

// Modal vault STCW hanya dibuka per baris; jangan ikut bundel awal halaman.
const CertificateVaultModal = dynamic(
  () => import('@/components/portal/CertificateVaultModal').then((m) => m.CertificateVaultModal),
  { ssr: false }
);

export default function SeafarersPage() {
  const [seafarers, setSeafarers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVaultSeafarer, setSelectedVaultSeafarer] = useState<any | null>(null);

  // New Seafarer Form State
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    seamanBookNo: '',
    passportNo: '',
    sidNumber: '',
    primaryRank: 'MASTER',
    placeOfBirth: 'Jakarta',
    dateOfBirth: '1985-06-15',
    homeAddress: '',
    emergencyContact: '',
    emergencyPhone: '',
    npwp: '',
    ptkpStatus: 'TK0',
  });
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const loadSeafarers = async () => {
    try {
      setLoading(true);
      const url = query ? `/api/portal/seafarers?q=${encodeURIComponent(query)}` : '/api/portal/seafarers';
      const res = await fetch(url);
      const json = await res.json();
      if (json.success) {
        setSeafarers(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSeafarers();
  }, [query]);

  const handleCreateSeafarer = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);
    setSubmitting(true);

    try {
      const res = await fetch('/api/portal/seafarers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Gagal menambahkan pelaut.');
      }

      setIsModalOpen(false);
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        seamanBookNo: '',
        passportNo: '',
        sidNumber: '',
        primaryRank: 'MASTER',
        placeOfBirth: 'Jakarta',
        dateOfBirth: '1985-06-15',
        homeAddress: '',
        emergencyContact: '',
        emergencyPhone: '',
        npwp: '',
        ptkpStatus: 'TK0',
      });
      loadSeafarers();
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
            Direktori Awak Kapal (Seafarer Profiles)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Data riil seluruh perwira dan rating terdaftar di database PostgreSQL <code className="font-mono text-slate-700">SeafarerProfile</code>
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 text-xs font-bold rounded-lg bg-[#071b34] hover:bg-[#0c2b52] text-white transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer self-start sm:self-auto w-full sm:w-auto"
        >
          <Plus className="w-4 h-4 text-amber-400" />
          <span>Tambah Pelaut Baru</span>
        </button>
      </div>

      {/* Toolbar Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
        <div className="relative w-full sm:w-80 min-w-0">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari nama, buku pelaut, atau paspor..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:bg-white"
          />
        </div>

        <div className="text-xs text-slate-500 shrink-0">
          Total Pelaut: <strong className="text-slate-900">{seafarers.length}</strong> Awak
        </div>
      </div>

      {/* Real Seafarer Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs min-w-0">
        <div className="overflow-x-auto">
          <table className="mobile-cards w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Nama Pelaut</th>
                <th className="py-3 px-4">Jabatan (Rank)</th>
                <th className="py-3 px-4">No. Buku Pelaut</th>
                <th className="py-3 px-4">NPWP / PTKP</th>
                <th className="py-3 px-4">Skor Marlins</th>
                <th className="py-3 px-4">Jam Layar (Hari)</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {seafarers.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                  <td data-label="Nama Pelaut" className="py-3.5 px-4">
                    <div className="font-bold text-slate-900">{s.user?.fullName}</div>
                    <div className="text-[11px] text-slate-400 flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5">
                      <span className="break-all">{s.user?.email}</span>
                      {s.user?.phone && <span>• {s.user?.phone}</span>}
                    </div>
                  </td>
                  <td data-label="Jabatan" className="py-3.5 px-4 font-semibold text-slate-800">
                    {s.primaryRank?.replace(/_/g, ' ')}
                  </td>
                  <td data-label="Buku Pelaut" className="py-3.5 px-4 font-mono font-medium text-slate-900">
                    {s.seamanBookNo}
                  </td>
                  <td data-label="NPWP / PTKP" className="py-3.5 px-4 font-mono text-[11px] text-slate-700">
                    {s.npwp ? (
                      <>
                        <div>{s.npwp}</div>
                        <div className="text-[10px] text-slate-400 font-sans">
                          PTKP {s.ptkpStatus || 'TK0'}
                        </div>
                      </>
                    ) : (
                      <span className="text-rose-600 font-semibold font-sans">NPWP belum ada</span>
                    )}
                  </td>
                  <td data-label="Skor Marlins" className="py-3.5 px-4">
                    {s.marlinsScore ? (
                      <span className="px-2 py-0.5 rounded font-mono text-[11px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
                        {s.marlinsScore}%
                      </span>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>
                  <td data-label="Jam Layar" className="py-3.5 px-4 font-mono text-slate-800">
                    {s.totalSeaTimeDays ? `${s.totalSeaTimeDays} hari` : '0 hari'}
                  </td>
                  <td data-label="Status" className="py-3.5 px-4">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {s.currentStatus?.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td data-label="Aksi" className="py-3.5 px-4 sm:text-right mc-actions">
                    <div className="mc-action-row inline-flex items-center gap-2 sm:justify-end">
                      <button
                        type="button"
                        onClick={() => setSelectedVaultSeafarer(s)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-primary bg-sky-50 hover:bg-sky-100 border border-sky-200 transition cursor-pointer"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Vault STCW</span>
                      </button>
                      <a
                        href={`/api/portal/seafarers/${s.id}/cv`}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 transition"
                        title="Unduh CV pelaut (PDF, kerangka BIMCO)"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>CV</span>
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
              {seafarers.length === 0 && !loading && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400" data-label="">
                    Tidak ditemukan data pelaut yang sesuai pencarian.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tambah Pelaut Nyata */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-t-2xl sm:rounded-2xl p-5 sm:p-6 max-w-xl w-full shadow-xl space-y-4 max-h-[92dvh] sm:max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Tambah Profil Pelaut Baru (PostgreSQL)</h3>
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

            <form onSubmit={handleCreateSeafarer} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Nama Lengkap & Gelar</label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="contoh: Capt. Agus Salim, M.Mar"
                  className="w-full bg-slate-50 border border-slate-200 rounded p-2 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="email@pelaut.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded p-2 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">No. WhatsApp</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+6281..."
                    className="w-full bg-slate-50 border border-slate-200 rounded p-2 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">No. Buku Pelaut Resmi Hubla</label>
                  <input
                    type="text"
                    required
                    value={formData.seamanBookNo}
                    onChange={(e) => setFormData({ ...formData, seamanBookNo: e.target.value })}
                    placeholder="contoh: B.0918237"
                    className="w-full bg-slate-50 border border-slate-200 rounded p-2 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Jabatan Utama (Rank)</label>
                  <select
                    value={formData.primaryRank}
                    onChange={(e) => setFormData({ ...formData, primaryRank: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded p-2 focus:outline-none focus:border-amber-500"
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
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">NPWP (opsional)</label>
                  <input
                    type="text"
                    value={formData.npwp}
                    onChange={(e) => setFormData({ ...formData, npwp: e.target.value })}
                    placeholder="15 atau 16 digit"
                    className="w-full bg-slate-50 border border-slate-200 rounded p-2 font-mono focus:outline-none focus:border-amber-500"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Dipakai untuk memotong PPh 21 dan bukti potong e-Bupot.
                  </p>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Status PTKP</label>
                  <select
                    value={formData.ptkpStatus}
                    onChange={(e) => setFormData({ ...formData, ptkpStatus: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded p-2 focus:outline-none focus:border-amber-500"
                  >
                    {['TK0', 'TK1', 'TK2', 'TK3', 'K0', 'K1', 'K2', 'K3'].map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
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
                  {submitting ? 'Menyimpan...' : 'Simpan ke Database'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Modal Vault STCW */}
      <CertificateVaultModal
        isOpen={!!selectedVaultSeafarer}
        onClose={() => setSelectedVaultSeafarer(null)}
        seafarerId={selectedVaultSeafarer?.id || null}
        seafarerName={selectedVaultSeafarer?.user?.fullName || ''}
        seamanBookNo={selectedVaultSeafarer?.seamanBookNo || ''}
      />
    </div>
  );
}
