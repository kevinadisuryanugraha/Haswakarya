'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Users,
  Send,
  Mail,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Loader2,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { COMPANY_INFO, getWhatsAppUrl } from '@/data/haswakarya-data';

export interface SeafarerApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultRank?: string;
}

export function SeafarerApplicationModal({
  isOpen,
  onClose,
  defaultRank = 'Deck Officer (3rd / 2nd / Chief Mate)',
}: SeafarerApplicationModalProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    phoneWhatsApp: '',
    email: '',
    seamanBookNo: '',
    departmentRank: defaultRank,
    cocClass: 'Class II / III (Management / Operational)',
    marlinsScore: '80% – 89% (Verified Test)',
    seaTimeMonths: '12 – 24 Months on Specific Vessel',
    vesselTypeExperience: 'Oil & Chemical Tanker (SIRE)',
    readinessDate: 'Immediate (Within 7 Days)',
    additionalNotes: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submissionSuccess, setSubmissionSuccess] = useState<{
    applicationId: string;
    seamanBookNo: string;
  } | null>(null);

  useEffect(() => {
    if (defaultRank) {
      setFormData((prev) => ({ ...prev, departmentRank: defaultRank }));
    }
  }, [defaultRank]);

  // Handle ESC and body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = '';
      setSubmissionSuccess(null);
      setErrorMessage(null);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const buildApplicationDispatch = (appId?: string) => {
    return `*OFFICIAL SEAFARER CANDIDATE DOSSIER*
----------------------------------------
*Tracking Ref:* ${appId ? `#${appId.slice(0, 8)}` : 'Submitted to H-COS DB'}
*Candidate Name:* ${formData.fullName || 'Not specified'}
*WhatsApp / Phone:* ${formData.phoneWhatsApp || '-'}
*Email:* ${formData.email || '-'}
*Seaman Book / SID Ref:* ${formData.seamanBookNo || 'Registered Online'}

*MARITIME QUALIFICATIONS & COMPETENCY:*
• *Target Rank:* ${formData.departmentRank}
• *Certificate of Competency (CoC):* ${formData.cocClass}
• *Marlins English Benchmark:* ${formData.marlinsScore}
• *Documented Sea-Time:* ${formData.seaTimeMonths}
• *Primary Vessel Experience:* ${formData.vesselTypeExperience}
• *Availability / Ready-to-Board:* ${formData.readinessDate}
${formData.additionalNotes ? `• *Endorsements & Notes:* ${formData.additionalNotes}` : ''}
----------------------------------------
_Dispatched via Haswakarya Seafarer Career Portal (100% Zero Placement Fee • Permenhub PM 59/2021 & MLC 2006 Reg 1.4.5)_`;
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/public/apply-seafarer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Gagal menyimpan aplikasi ke database.');
      }

      setSubmissionSuccess({
        applicationId: data.applicationId,
        seamanBookNo: data.seamanBookNo,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan sistem.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDispatchWhatsApp = () => {
    const message = buildApplicationDispatch(submissionSuccess?.applicationId);
    const url = getWhatsAppUrl(message);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="seafarer-modal-title"
    >
      {/* Dark Maritime Backdrop */}
      <div
        className="fixed inset-0 bg-navy/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Card */}
      <div
        className="relative bg-white rounded-2xl sm:rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 z-10 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-[#06122A] text-white px-5 sm:px-7 py-4 sm:py-5 flex items-center justify-between border-b border-white/10 z-20">
          <div>
            <div className="inline-flex items-center gap-2 text-sky-300 text-[11px] font-bold uppercase tracking-wider mb-1">
              <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
              <span>Official Recruitment Desk • Zero Fee Guarantee</span>
            </div>
            <h3 id="seafarer-modal-title" className="text-lg sm:text-xl font-extrabold text-white">
              Seafarer Career Application Portal
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
            aria-label="Close application modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        {submissionSuccess ? (
          <div className="p-6 sm:p-8 text-center space-y-5 animate-in fade-in duration-200">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-2">
              <h4 className="text-xl font-bold text-navy">
                Dossier Berhasil Terdaftar di Database H-COS
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
                Profil kompetensi Anda telah tersimpan secara resmi ke dalam antrian ATS Haswakarya dan sedang direview oleh Tim Crewing.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 max-w-md mx-auto text-left text-xs space-y-1.5 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">Application ID:</span>
                <span className="font-bold text-navy">#{submissionSuccess.applicationId.slice(0, 12)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">Buku Pelaut / SID:</span>
                <span className="font-bold text-navy">{submissionSuccess.seamanBookNo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">Target Rank:</span>
                <span className="font-bold text-primary">{formData.departmentRank}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">Status ATS:</span>
                <span className="text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded">APPLIED (Stage 1)</span>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
              <button
                type="button"
                onClick={handleDispatchWhatsApp}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Kirim Notifikasi via WhatsApp Hotline</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-80" />
              </button>

              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-navy font-semibold text-xs border border-slate-300 transition-all cursor-pointer"
              >
                <span>Selesai &amp; Tutup</span>
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleFormSubmit} className="p-5 sm:p-7 space-y-4">
            {errorMessage && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2.5 text-xs text-rose-700 font-medium">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Grid 1: Basic Identifiers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-1.5">
                  Full Name (Sesuai Buku Pelaut) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Capt. Hendra Gunawan"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-1.5">
                  WhatsApp Number (Active Hotline) *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+62 812-xxxx-xxxx"
                  value={formData.phoneWhatsApp}
                  onChange={(e) => setFormData({ ...formData, phoneWhatsApp: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition font-mono"
                />
              </div>
            </div>

            {/* Grid 2: Email & Seaman Book Number */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-1.5">
                  Personal Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="seafarer@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-1.5">
                  Seaman Book No. / SID Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. C.0123456 (Hubla RI)"
                  value={formData.seamanBookNo}
                  onChange={(e) => setFormData({ ...formData, seamanBookNo: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition font-mono"
                />
              </div>
            </div>

            {/* Grid 3: Rank & CoC */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-1.5">
                  Applying Rank / Department *
                </label>
                <select
                  value={formData.departmentRank}
                  onChange={(e) => setFormData({ ...formData, departmentRank: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition font-medium"
                >
                  <optgroup label="Deck Department">
                    <option value="Master (Nakhoda)">Master (Nakhoda) - ANT I</option>
                    <option value="Chief Officer (Mualim I)">Chief Officer (Mualim I) - ANT II</option>
                    <option value="Second Officer (Mualim II)">Second Officer (Mualim II) - ANT III</option>
                    <option value="Third Officer (Mualim III)">Third Officer (Mualim III) - ANT III</option>
                    <option value="Bosun (Serang)">Bosun (Serang)</option>
                    <option value="Able Seaman (Juru Mudi)">Able Seaman (Juru Mudi)</option>
                  </optgroup>
                  <optgroup label="Engine Department">
                    <option value="Chief Engineer (KKM)">Chief Engineer (KKM) - ATT I</option>
                    <option value="Second Engineer (Masinis II)">Second Engineer (Masinis II) - ATT II</option>
                    <option value="Third Engineer (Masinis III)">Third Engineer (Masinis III) - ATT III</option>
                    <option value="Oiler (Juru Minyak)">Oiler (Juru Minyak)</option>
                  </optgroup>
                  <optgroup label="Catering & Support">
                    <option value="Chief Cook (Koki Kapal)">Chief Cook (Koki Kapal)</option>
                  </optgroup>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-1.5">
                  Certificate of Competency (CoC)
                </label>
                <select
                  value={formData.cocClass}
                  onChange={(e) => setFormData({ ...formData, cocClass: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition font-medium"
                >
                  <option value="Class I (ANT-I / ATT-I) Management">Class I (ANT-I / ATT-I) Management</option>
                  <option value="Class II (ANT-II / ATT-II) Management">Class II (ANT-II / ATT-II) Management</option>
                  <option value="Class III (ANT-III / ATT-III) Operational">Class III (ANT-III / ATT-III) Operational</option>
                  <option value="Class IV / V (ANT-IV / ANT-V) Near Coastal">Class IV / V (ANT-IV / ANT-V) Near Coastal</option>
                  <option value="Rating Able Seafarer (STCW II/5 or III/5)">Rating Able Seafarer (STCW II/5 or III/5)</option>
                </select>
              </div>
            </div>

            {/* Grid 4: Marlins & Vessel Experience */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-1.5">
                  Marlins English Benchmark
                </label>
                <select
                  value={formData.marlinsScore}
                  onChange={(e) => setFormData({ ...formData, marlinsScore: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition font-medium"
                >
                  <option value="90% – 100% (High Proficiency)">90% – 100% (High Proficiency)</option>
                  <option value="80% – 89% (Verified Standard)">80% – 89% (Verified Standard)</option>
                  <option value="70% – 79% (Operational Level)">70% – 79% (Operational Level)</option>
                  <option value="Ready to take Haswakarya Marlins Test">Ready to take Haswakarya Marlins Test</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-1.5">
                  Primary Vessel Experience
                </label>
                <select
                  value={formData.vesselTypeExperience}
                  onChange={(e) => setFormData({ ...formData, vesselTypeExperience: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition font-medium"
                >
                  <option value="Oil & Chemical Tanker (SIRE)">Oil &amp; Chemical Tanker (SIRE)</option>
                  <option value="Dry Bulk Carrier (RightShip)">Dry Bulk Carrier (RightShip)</option>
                  <option value="Container Vessel (Boxship)">Container Vessel (Boxship)</option>
                  <option value="Harbor & Ocean ASD Tugboat">Harbor &amp; Ocean ASD Tugboat</option>
                  <option value="Offshore AHTS / Supply Vessel">Offshore AHTS / Supply Vessel</option>
                </select>
              </div>
            </div>

            {/* Grid 5: Sea-Time & Readiness */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-1.5">
                  Documented Sea-Time Experience
                </label>
                <select
                  value={formData.seaTimeMonths}
                  onChange={(e) => setFormData({ ...formData, seaTimeMonths: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition font-medium"
                >
                  <option value="More than 36 Months">More than 36 Months</option>
                  <option value="24 – 36 Months">24 – 36 Months</option>
                  <option value="12 – 24 Months">12 – 24 Months</option>
                  <option value="Under 12 Months (Junior / Rating)">Under 12 Months (Junior / Rating)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-1.5">
                  Readiness Date (Ready to Join)
                </label>
                <select
                  value={formData.readinessDate}
                  onChange={(e) => setFormData({ ...formData, readinessDate: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition font-medium"
                >
                  <option value="Immediate (Within 7 Days)">Immediate (Within 7 Days)</option>
                  <option value="Within 14 – 30 Days">Within 14 – 30 Days</option>
                  <option value="Next Month (Notice Period)">Next Month (Notice Period)</option>
                </select>
              </div>
            </div>

            {/* Additional Notes */}
            <div>
              <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-1.5">
                Specific Endorsements / Visas / Notes
              </label>
              <input
                type="text"
                placeholder="e.g. Valid US C1/D Visa, Panama Endorsement, Tanker Familiarization (OTF/CTF)..."
                value={formData.additionalNotes}
                onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition"
              />
            </div>

            {/* Zero Fee Protection Banner */}
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-start gap-2.5 text-[11px] text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>Perlindungan Biaya Nol (Zero Placement Fee)</strong>: Sesuai Permenhub PM 59/2021 dan ILO MLC 2006 Reg 1.4.5, pelaut tidak dipungut biaya pendaftaran atau penempatan apapun.
              </span>
            </div>

            {/* Submission Action */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-primary hover:bg-[#06122A] text-white font-bold text-sm shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Mendaftarkan Dossier ke Database...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Daftarkan Dossier Pelaut ke Sistem ATS</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default SeafarerApplicationModal;
