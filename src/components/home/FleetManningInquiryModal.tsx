'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Ship,
  Users,
  Send,
  Mail,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  MapPin,
  AlertCircle,
  Loader2,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { COMPANY_INFO, getWhatsAppUrl } from '@/data/haswakarya-data';

export interface FleetManningInquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultVesselType?: string;
}

export function FleetManningInquiryModal({
  isOpen,
  onClose,
  defaultVesselType = 'Oil & Chemical Tanker (SIRE)',
}: FleetManningInquiryModalProps) {
  const [formData, setFormData] = useState({
    contactName: '',
    companyName: '',
    email: '',
    phone: '',
    vesselType: defaultVesselType,
    crewScope: 'Top 4 Officers (Master / C/E / C/O / 2E)',
    vesselFlag: 'Panama / Marshall Islands / Liberia / International',
    portOfJoining: 'Singapore / Batam / Intra-Asia',
    joiningDate: 'Within 14 – 30 Days',
    additionalNotes: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submissionSuccess, setSubmissionSuccess] = useState<{
    requisitionNo: string;
    vesselName: string;
  } | null>(null);

  useEffect(() => {
    if (defaultVesselType) {
      setFormData((prev) => ({ ...prev, vesselType: defaultVesselType }));
    }
  }, [defaultVesselType]);

  // Lock body scroll and handle Escape key
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

  const buildStructuredDispatch = (reqNo?: string) => {
    return `*OFFICIAL FLEET MANNING REQUISITION*
----------------------------------------
*Requisition Ref:* ${reqNo ? `#${reqNo}` : 'Registered to H-COS DB'}
*Company / Principal:* ${formData.companyName || 'Not specified'}
*Representative:* ${formData.contactName || 'Shipowner Representative'}
*Contact Email/Phone:* ${formData.email || '-'} / ${formData.phone || '-'}

*ARMADA & CREW SPECIFICATIONS:*
• *Vessel Type:* ${formData.vesselType}
• *Crew Scope Needed:* ${formData.crewScope}
• *Target Flag State:* ${formData.vesselFlag}
• *Estimated Joining Port:* ${formData.portOfJoining}
• *Mobilization Timeline:* ${formData.joiningDate}
${formData.additionalNotes ? `• *Special Requirements:* ${formData.additionalNotes}` : ''}
----------------------------------------
_Dispatched via Haswakarya Crew Agency Digital Requisition Console (SIUKAK & MLC 2006 Compliant)_`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/public/inquiry-manning', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: formData.companyName,
          contactPerson: formData.contactName,
          workEmail: formData.email,
          phoneWhatsApp: formData.phone,
          vesselName: `${formData.companyName} Vessel`,
          vesselType: formData.vesselType,
          targetRanks: formData.crewScope,
          joinPort: formData.portOfJoining,
          expectedJoiningDate: new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString(),
          notes: `Flag: ${formData.vesselFlag}. Mobilization: ${formData.joiningDate}. Notes: ${formData.additionalNotes}`,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Gagal meregistrasikan permintaan manning.');
      }

      setSubmissionSuccess({
        requisitionNo: data.requisitionNo,
        vesselName: data.vesselName,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan sistem.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDispatchWhatsApp = () => {
    const message = buildStructuredDispatch(submissionSuccess?.requisitionNo);
    const url = getWhatsAppUrl(message);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="inquiry-modal-title"
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
              <span>SIUKAK Regulated • Direct Fleet Requisition</span>
            </div>
            <h3 id="inquiry-modal-title" className="text-lg sm:text-xl font-extrabold text-white">
              Principal Crewing Requisition Console
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body or Success State */}
        {submissionSuccess ? (
          <div className="p-6 sm:p-8 text-center space-y-5 animate-in fade-in duration-200">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-2">
              <h4 className="text-xl font-bold text-navy">
                Safe Manning Requisition Berhasil Dibuat
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
                Permintaan penugasan awak kapal Anda telah tercatat secara resmi di database H-COS. Crewing superintendent kami sedang menyiapkan rekomendasi pairing matrix.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 max-w-md mx-auto text-left text-xs space-y-1.5 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">Requisition No:</span>
                <span className="font-bold text-navy font-mono">{submissionSuccess.requisitionNo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">Registered Vessel:</span>
                <span className="font-bold text-navy">{submissionSuccess.vesselName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">Target Rank Scope:</span>
                <span className="font-bold text-primary font-sans">{formData.crewScope}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">Status Requisition:</span>
                <span className="text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded">OPEN (Active)</span>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
              <button
                type="button"
                onClick={handleDispatchWhatsApp}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-accent hover:bg-accent/90 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Hubungi Crewing Superintendent (WhatsApp)</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-80" />
              </button>

              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-navy font-semibold text-xs border border-slate-300 transition-all cursor-pointer"
              >
                <span>Tutup Console</span>
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 sm:p-7 space-y-4 text-navy">
            {errorMessage && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2.5 text-xs text-rose-700 font-medium">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Tentukan kriteria kebutuhan safe manning armada kapal Anda. Superintendent kami akan memproses matching profil perwira dan rating berstandar SIRE 2.0 / RightShip dalam waktu <strong>30 menit</strong>.
            </p>

            {/* Grid 1: Company & Contact */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-1.5">
                  Shipowner / Management Company *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Samudera Shipping Lines / OSG"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-1.5">
                  Representative Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Capt. Michael Tan (Crew Manager)"
                  value={formData.contactName}
                  onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition"
                />
              </div>
            </div>

            {/* Grid 2: Email & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-1.5">
                  Corporate Work Email *
                </label>
                <input
                  type="email"
                  required
                  placeholder="crewing@shipowner.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-1.5">
                  Direct Phone / WhatsApp
                </label>
                <input
                  type="tel"
                  placeholder="+65 9123 4567 / +62 811..."
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition font-mono"
                />
              </div>
            </div>

            {/* Grid 3: Vessel Type & Crew Scope */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-1.5">
                  Armada Vessel Type
                </label>
                <select
                  value={formData.vesselType}
                  onChange={(e) => setFormData({ ...formData, vesselType: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition font-medium"
                >
                  <option value="Oil & Chemical Tanker (SIRE)">Oil &amp; Chemical Tanker (SIRE 2.0)</option>
                  <option value="Dry Bulk Carrier (RightShip)">Dry Bulk Carrier (RightShip RISQ)</option>
                  <option value="Container Vessel (Boxship)">Container Vessel (Feeder / Ultra-Large)</option>
                  <option value="Harbor & Ocean ASD Tugboat">Harbor &amp; Ocean ASD Tugboat (BHP 3,200+)</option>
                  <option value="Offshore AHTS / Crew Boat">Offshore AHTS / Crew Boat</option>
                  <option value="Gas Carrier (LPG / LNG)">Gas Carrier (LPG / LNG)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-1.5">
                  Crew Manning Scope
                </label>
                <select
                  value={formData.crewScope}
                  onChange={(e) => setFormData({ ...formData, crewScope: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition font-medium"
                >
                  <option value="Top 4 Officers (Master / C/E / C/O / 2E)">Top 4 Officers (Master / C/E / C/O / 2E)</option>
                  <option value="Full Indonesian Complement (Officers & Ratings)">Full Complement (Officers &amp; Ratings 100%)</option>
                  <option value="Senior Deck Officers (Master / C/O)">Senior Deck Officers (Master / C/O)</option>
                  <option value="Senior Engine Officers (C/E / 2E)">Senior Engine Officers (C/E / 2E)</option>
                  <option value="Support Level Ratings (Bosun, AB, Oiler, Cook)">Support Level Ratings (Bosun, AB, Oiler, Cook)</option>
                </select>
              </div>
            </div>

            {/* Grid 4: Flag & Port */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-1.5">
                  Flag State Administration
                </label>
                <select
                  value={formData.vesselFlag}
                  onChange={(e) => setFormData({ ...formData, vesselFlag: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition font-medium"
                >
                  <option value="Indonesia (Hubla RI)">Indonesia (Hubla RI)</option>
                  <option value="Panama Maritime Authority">Panama Maritime Authority</option>
                  <option value="Marshall Islands (IRI)">Marshall Islands (IRI)</option>
                  <option value="Liberia (LISCR)">Liberia (LISCR)</option>
                  <option value="Singapore (MPA)">Singapore (MPA)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-1.5">
                  Target Mobilization Port
                </label>
                <input
                  type="text"
                  placeholder="e.g. Batam / Singapore OPL / Tanjung Priok"
                  value={formData.portOfJoining}
                  onChange={(e) => setFormData({ ...formData, portOfJoining: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition"
                />
              </div>
            </div>

            {/* Guarantee Notice */}
            <div className="p-3 bg-ice/40 rounded-xl border border-primary/20 flex items-start gap-2.5 text-[11px] text-navy">
              <ShieldCheck className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <span>
                <strong>14-Day Performance Warranty</strong>: Haswakarya menjamin penggantian awak kapal tanpa biaya agensi tambahan jika terjadi ketidaksesuaian kompetensi atau hasil evaluasi nakhoda.
              </span>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-accent hover:bg-accent/90 text-white font-bold text-sm shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Mendaftarkan Safe Manning Requisition...</span>
                  </>
                ) : (
                  <>
                    <Ship className="w-4 h-4" />
                    <span>Daftarkan Requisition Armada ke H-COS</span>
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

export default FleetManningInquiryModal;
