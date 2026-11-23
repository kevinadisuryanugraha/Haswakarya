'use client';

import React, { useState } from 'react';
import { X, Ship, Anchor, Send, CheckCircle2, Phone, Mail, MessageSquare } from 'lucide-react';
import { COMPANY_INFO, getWhatsAppUrl } from '@/data/haswakarya-data';

interface MobileInquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultRole?: 'owner' | 'seafarer';
}

export function MobileInquiryModal({ isOpen, onClose, defaultRole = 'owner' }: MobileInquiryModalProps) {
  const [role, setRole] = useState<'owner' | 'seafarer'>(defaultRole);
  const [vesselType, setVesselType] = useState('Bulk Carrier');
  const [crewRank, setCrewRank] = useState('Deck Officer');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleWhatsAppSend = () => {
    let msg = '';
    if (role === 'owner') {
      msg = `Halo Haswakarya Crew Agency, saya Ship Owner/Manager. Saya memerlukan kru untuk kapal: ${vesselType}. Posisi yang dibutuhkan: ${crewRank}. Catatan: ${notes || 'Mohon informasi ketersediaan kualifikasi kru.'}`;
    } else {
      msg = `Halo Haswakarya Crew Agency, saya Pelaut ingin mendaftar. Posisi/Rank: ${crewRank}. Tipe kapal pengalaman: ${vesselType}. Catatan: ${notes || 'Mohon informasi prosedur rekrutmen.'}`;
    }
    window.open(getWhatsAppUrl(msg), '_blank');
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-lg bg-navy text-white rounded-t-3xl sm:rounded-2xl border border-primary/30 p-6 shadow-2xl max-h-[92vh] overflow-y-auto animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle bar on mobile */}
        <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-4 sm:hidden" />

        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-accent/20 flex items-center justify-center text-accent">
              <Ship className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                Quick Maritime Inquiry Desk
              </h3>
              <p className="text-xs text-sky">PT HASWAKARYA ANDALAN SEDARE</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors"
            aria-label="Tutup modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Role Switcher */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-white/5 rounded-xl border border-white/10 mb-5">
          <button
            type="button"
            onClick={() => setRole('owner')}
            className={`py-2.5 px-3 rounded-lg text-xs font-bold transition-all ${
              role === 'owner'
                ? 'bg-accent text-white shadow-md'
                : 'text-white/70 hover:text-white'
            }`}
          >
            <Ship className="inline-block w-3.5 h-3.5 mr-1 -mt-0.5" aria-hidden="true" />
            Ship Owner / Principal
          </button>
          <button
            type="button"
            onClick={() => setRole('seafarer')}
            className={`py-2.5 px-3 rounded-lg text-xs font-bold transition-all ${
              role === 'seafarer'
                ? 'bg-primary text-white shadow-md'
                : 'text-white/70 hover:text-white'
            }`}
          >
            <Anchor className="inline-block w-3.5 h-3.5 mr-1 -mt-0.5" aria-hidden="true" />
            Calon Pelaut / Seafarer
          </button>
        </div>

        {/* Form fields */}
        <div className="space-y-4 text-sm">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {role === 'owner' ? 'Tipe Kapal Armada Anda:' : 'Pengalaman di Tipe Kapal:'}
            </label>
            <select
              value={vesselType}
              onChange={(e) => setVesselType(e.target.value)}
              className="w-full bg-slate-900 border border-primary/30 rounded-xl px-3.5 py-2.5 text-white text-xs sm:text-sm focus:outline-none focus:border-sky transition-colors"
            >
              <option value="Bulk Carrier">Bulk Carrier (Curah)</option>
              <option value="Oil / Chemical Tanker">Oil / Chemical Tanker</option>
              <option value="Container Vessel">Container Vessel</option>
              <option value="Tug Boat & Barge">Tug Boat &amp; Barge</option>
              <option value="General Cargo">General Cargo</option>
              <option value="Offshore / Supply Vessel">Offshore / AHTS / Supply</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {role === 'owner' ? 'Posisi Awak yang Dibutuhkan:' : 'Posisi / Ijazah Terakhir:'}
            </label>
            <select
              value={crewRank}
              onChange={(e) => setCrewRank(e.target.value)}
              className="w-full bg-slate-900 border border-primary/30 rounded-xl px-3.5 py-2.5 text-white text-xs sm:text-sm focus:outline-none focus:border-sky transition-colors"
            >
              <option value="Master / Captain">Master / Captain</option>
              <option value="Chief Officer / Deck Officer">Chief Officer / Deck Officer</option>
              <option value="Chief Engineer / Engine Officer">Chief Engineer / 2nd / 3rd Eng</option>
              <option value="Bosun / Able Seaman (AB)">Bosun / Able Seaman (AB)</option>
              <option value="Oiler / Fitter">Oiler / Fitter</option>
              <option value="Cook / Messman">Cook / Messman</option>
              <option value="Full Complement Fleet">Full Complement (Satu Set Kru Lengkap)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Catatan Khusus / Kebutuhan Tambahan:
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Butuh kru dengan sertifikat Marlins skor minimal 80%, kontrak 6 bulan..."
              className="w-full bg-slate-900 border border-primary/30 rounded-xl px-3.5 py-2.5 text-white text-xs sm:text-sm focus:outline-none focus:border-sky transition-colors placeholder:text-white/30"
            />
          </div>

          <button
            type="button"
            onClick={handleWhatsAppSend}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-accent hover:bg-accent/90 text-white font-bold rounded-xl shadow-lg shadow-accent/20 transition-all hover:scale-[1.02] active:scale-95"
          >
            <MessageSquare className="w-4 h-4 text-emerald-300" />
            <span>Kirim via WhatsApp Resmi (Respon Cepat)</span>
          </button>

          <div className="pt-2 flex items-center justify-center gap-4 text-[11px] text-white/50">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-sky" /> SIUKAK Berizin Resmi
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-sky" /> MLC 2006 Standard
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
