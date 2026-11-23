'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  Award,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  FileCheck2,
  Plus,
  Loader2,
  FileText,
  Clock,
  ExternalLink,
} from 'lucide-react';

export interface CertificateItem {
  id: string;
  category: string;
  certName: string;
  certificateNo: string;
  issuingAuthority: string;
  issueDate: string;
  expiryDate: string | null;
  daysRemaining: number | null;
  expiryStatus: 'LIFETIME' | 'VALID' | 'WARNING_EXPIRING_SOON' | 'CRITICAL_EXPIRED';
  isVerified: boolean;
  /** Path vault tidak lagi dikirim ke klien; API hanya memberi tahu ada/tidak. */
  hasFile: boolean;
}

export interface CertificateVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  seafarerId: string | null;
  seafarerName: string;
  seamanBookNo: string;
}

export function CertificateVaultModal({
  isOpen,
  onClose,
  seafarerId,
  seafarerName,
  seamanBookNo,
}: CertificateVaultModalProps) {
  const [certificates, setCertificates] = useState<CertificateItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [newCert, setNewCert] = useState({
    category: 'COP',
    certName: '',
    certificateNo: '',
    issuingAuthority: 'Direktorat Jenderal Perhubungan Laut RI',
    issueDate: new Date().toISOString().split('T')[0],
    expiryDate: '',
  });
  const [submitLoading, setSubmitLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && seafarerId) {
      fetchCertificates();
    } else {
      setCertificates([]);
      setIsAdding(false);
      setStatusMessage(null);
    }
  }, [isOpen, seafarerId]);

  const fetchCertificates = async () => {
    if (!seafarerId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/portal/certificates?seafarerId=${seafarerId}`);
      const data = await res.json();
      if (data.success) {
        setCertificates(data.certificates);
      }
    } catch (e) {
      console.error('Error fetching certificates:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!seafarerId) return;
    setSubmitLoading(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/portal/certificates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          seafarerId,
          ...newCert,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menambahkan sertifikat.');

      setStatusMessage('Sertifikat berhasil ditambahkan ke Vault.');
      setIsAdding(false);
      setNewCert({
        category: 'COP',
        certName: '',
        certificateNo: '',
        issuingAuthority: 'Direktorat Jenderal Perhubungan Laut RI',
        issueDate: new Date().toISOString().split('T')[0],
        expiryDate: '',
      });
      fetchCertificates();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error';
      setStatusMessage(`Gagal: ${msg}`);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleFileUpload = async (certificateId: string, file: File | undefined) => {
    if (!file) return;
    setUploadingId(certificateId);
    setStatusMessage(null);

    try {
      const body = new FormData();
      body.append('file', file);
      const res = await fetch(`/api/portal/certificates/${certificateId}/file`, {
        method: 'POST',
        body,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Gagal mengunggah berkas.');
      setStatusMessage('Berkas sertifikat tersimpan di vault dengan sidik jari SHA-256.');
      await fetchCertificates();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error';
      setStatusMessage(`Gagal: ${msg}`);
    } finally {
      setUploadingId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6"
      role="dialog"
      aria-modal="true"
    >
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={onClose} />

      <div
        className="relative bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 z-10 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#06122A] text-white px-6 py-4 flex items-center justify-between border-b border-navy-800">
          <div>
            <div className="flex items-center gap-2 text-sky-400 text-xs font-bold uppercase tracking-wider mb-0.5">
              <ShieldCheck className="w-4 h-4" />
              <span>STCW Document Vault &amp; Expiry Monitor</span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white">
              {seafarerName} — <span className="font-mono text-slate-300 text-sm">{seamanBookNo}</span>
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Action Bar */}
          <div className="flex items-center justify-between">
            <div className="text-xs text-slate-500">
              Menampilkan <strong className="text-navy font-bold">{certificates.length}</strong> dokumen tersertifikasi STCW
            </div>
            <button
              type="button"
              onClick={() => setIsAdding(!isAdding)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary hover:bg-[#06122A] text-white font-semibold text-xs shadow-xs transition cursor-pointer"
            >
              {isAdding ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
              <span>{isAdding ? 'Batal Tambah' : 'Tambah Sertifikat STCW'}</span>
            </button>
          </div>

          {statusMessage && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700">
              {statusMessage}
            </div>
          )}

          {/* Add Certificate Form */}
          {isAdding && (
            <form onSubmit={handleAddSubmit} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 animate-in fade-in duration-150">
              <div className="font-bold text-xs text-navy uppercase tracking-wider">
                Registrasi Sertifikat STCW Baru
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Kategori Dokumen *</label>
                  <select
                    value={newCert.category}
                    onChange={(e) => setNewCert({ ...newCert, category: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-primary"
                  >
                    <option value="COC">CoC — Certificate of Competency (ANT / ATT)</option>
                    <option value="COP">CoP — Certificate of Proficiency (BST, AFF, dll)</option>
                    <option value="FLAG_ENDORSEMENT">Flag State Endorsement</option>
                    <option value="TRAVEL_DOCUMENT">Buku Pelaut / Paspor / SID</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Nama Sertifikat *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Basic Safety Training (BST) / ANT-II"
                    value={newCert.certName}
                    onChange={(e) => setNewCert({ ...newCert, certName: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Nomor Sertifikat *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 62.012345.BST.2024"
                    value={newCert.certificateNo}
                    onChange={(e) => setNewCert({ ...newCert, certificateNo: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg font-mono focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Tanggal Terbit *</label>
                  <input
                    type="date"
                    required
                    value={newCert.issueDate}
                    onChange={(e) => setNewCert({ ...newCert, issueDate: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg font-mono focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Tanggal Expire (Kosongkan jika Lifetime)</label>
                  <input
                    type="date"
                    value={newCert.expiryDate}
                    onChange={(e) => setNewCert({ ...newCert, expiryDate: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg font-mono focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200 rounded-lg transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-primary hover:bg-[#06122A] text-white text-xs font-bold rounded-lg transition cursor-pointer disabled:opacity-50"
                >
                  {submitLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                  <span>Simpan Sertifikat</span>
                </button>
              </div>
            </form>
          )}

          {/* Certificate Table List */}
          {loading ? (
            <div className="py-10 text-center text-xs text-slate-500">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
              <span>Memuat arsip sertifikat dari Vault...</span>
            </div>
          ) : certificates.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500 border border-dashed border-slate-300 rounded-xl">
              Belum ada sertifikat terdaftar untuk pelaut ini. Klik tombol di atas untuk menambahkan.
            </div>
          ) : (
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Kategori</th>
                    <th className="py-2.5 px-3">Nama Sertifikat</th>
                    <th className="py-2.5 px-3">Nomor STCW</th>
                    <th className="py-2.5 px-3">Masa Berlaku</th>
                    <th className="py-2.5 px-3">Status Kepatuhan</th>
                    <th className="py-2.5 px-3 text-right">Berkas Vault</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {certificates.map((c) => {
                    let badge = (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Valid ({c.daysRemaining} hari)</span>
                      </span>
                    );

                    if (c.expiryStatus === 'LIFETIME') {
                      badge = (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full">
                          <span>Seumur Hidup</span>
                        </span>
                      );
                    } else if (c.expiryStatus === 'WARNING_EXPIRING_SOON') {
                      badge = (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                          <Clock className="w-3 h-3 text-amber-600" />
                          <span>Warning ({c.daysRemaining} hari)</span>
                        </span>
                      );
                    } else if (c.expiryStatus === 'CRITICAL_EXPIRED') {
                      badge = (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-800 bg-rose-100 px-2 py-0.5 rounded-full">
                          <AlertTriangle className="w-3 h-3 text-rose-600" />
                          <span>Expired / Kritis ({c.daysRemaining} hari)</span>
                        </span>
                      );
                    }

                    return (
                      <tr key={c.id} className="hover:bg-slate-50 transition">
                        <td className="py-2.5 px-3">
                          <span className="font-mono text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                            {c.category}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-navy">
                          {c.certName}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-600">
                          {c.certificateNo}
                        </td>
                        <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">
                          {c.expiryDate ? new Date(c.expiryDate).toLocaleDateString('id-ID') : 'Lifetime'}
                        </td>
                        <td className="py-2.5 px-3">
                          {badge}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            {c.hasFile && (
                              <a
                                href={`/api/portal/certificates/${c.id}/file`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 transition"
                                title="Unduh berkas dari vault (SHA-256 diverifikasi)"
                              >
                                <ExternalLink className="w-3 h-3" />
                                <span>Unduh</span>
                              </a>
                            )}
                            <label
                              className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold border transition cursor-pointer ${
                                uploadingId === c.id
                                  ? 'text-slate-400 bg-slate-50 border-slate-200'
                                  : 'text-slate-700 bg-white hover:bg-slate-50 border-slate-300'
                              }`}
                              title="Unggah PDF/JPG/PNG/WebP maksimal 15 MB"
                            >
                              {uploadingId === c.id ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <FileCheck2 className="w-3 h-3" />
                              )}
                              <span>{c.hasFile ? 'Ganti' : 'Unggah'}</span>
                              <input
                                type="file"
                                accept="application/pdf,image/jpeg,image/png,image/webp"
                                className="sr-only"
                                disabled={uploadingId === c.id}
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  e.target.value = '';
                                  void handleFileUpload(c.id, file);
                                }}
                              />
                            </label>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CertificateVaultModal;
