'use client';

import dynamic from 'next/dynamic';

const FleetManningInquiryModal = dynamic(
  () => import('@/components/home/FleetManningInquiryModal').then((m) => m.FleetManningInquiryModal),
  { ssr: false }
);
const SeafarerApplicationModal = dynamic(
  () => import('@/components/home/SeafarerApplicationModal').then((m) => m.SeafarerApplicationModal),
  { ssr: false }
);

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import {
  MessageSquare,
  PhoneCall,
  Ship,
  Users,
} from 'lucide-react';
import { COMPANY_INFO, getWhatsAppUrl } from '@/data/haswakarya-data';

export function MobileActionDock() {
  const pathname = usePathname();
  const [isOwnerModalOpen, setIsOwnerModalOpen] = useState(false);
  const [isSeafarerModalOpen, setIsSeafarerModalOpen] = useState(false);

  if (pathname?.startsWith('/portal') || pathname?.startsWith('/share')) {
    return null;
  }

  return (
    <>
      <aside
        aria-label="Mobile Quick Action Dock"
        className="fixed bottom-0 left-0 right-0 z-40 lg:hidden print:hidden"
      >
        {/* Status mini bar */}
        <div className="bg-navy-950/90 backdrop-blur-md border-t border-primary/20 px-3 py-1 flex items-center justify-between text-[11px] text-white/70">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-sm bg-emerald-400 shrink-0" />
            <span className="text-white font-medium">Ops Desk 24/7 Active</span>
          </div>
          <span className="text-sky/80 text-[10px]">
            SIUKAK: Kemenhub RI • NIB {COMPANY_INFO.nib}
          </span>
        </div>

        {/* Primary action dock */}
        <div className="bg-navy/95 backdrop-blur-xl border-t border-primary/30 px-3 pt-2 pb-[calc(env(safe-area-inset-bottom,0px)+0.5rem)] shadow-[0_-10px_25px_-5px_rgba(0,0,0,0.5)]">
          <div className="grid grid-cols-4 gap-1.5 max-w-md mx-auto">
            {/* 1. Direct WhatsApp */}
            <a
              href={getWhatsAppUrl('Halo Haswakarya Crew Agency, saya ingin terhubung dengan tim operasional.')}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center py-1.5 px-1 rounded-xl text-white/80 hover:text-white hover:bg-white/10 active:scale-95 transition-all text-center group"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                <MessageSquare className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-semibold tracking-tight text-white leading-none">
                WhatsApp
              </span>
            </a>

            {/* 2. Request Crew (Principal) with 21st.dev shimmer */}
            <button
              type="button"
              onClick={() => setIsOwnerModalOpen(true)}
              className="shimmer-btn flex flex-col items-center justify-center py-1.5 px-1 rounded-xl bg-accent text-white active:scale-95 transition-all text-center group shadow-md shadow-accent/25 cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-white/20 text-white flex items-center justify-center mb-1 group-hover:scale-110 transition-transform shadow-xs">
                <Ship className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold tracking-tight text-white leading-none whitespace-nowrap">
                Request Crew
              </span>
            </button>

            {/* 3. Seafarer Apply */}
            <button
              type="button"
              onClick={() => setIsSeafarerModalOpen(true)}
              className="flex flex-col items-center justify-center py-1.5 px-1 rounded-xl text-white/80 hover:text-white hover:bg-white/10 active:scale-95 transition-all text-center group cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-primary/30 text-sky flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                <Users className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-semibold tracking-tight text-white leading-none">
                Pelaut Karir
              </span>
            </button>

            {/* 4. Direct Call Batam/Jakarta */}
            <a
              href={`tel:${COMPANY_INFO.whatsappClean}`}
              className="flex flex-col items-center justify-center py-1.5 px-1 rounded-xl text-white/80 hover:text-white hover:bg-white/10 active:scale-95 transition-all text-center group"
            >
              <div className="w-8 h-8 rounded-lg bg-white/10 text-slate-200 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                <PhoneCall className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-semibold tracking-tight text-white leading-none">
                Telepon
              </span>
            </a>
          </div>
        </div>
      </aside>

      {/* Unified Principal Crewing Requisition Console */}
      <FleetManningInquiryModal
        isOpen={isOwnerModalOpen}
        onClose={() => setIsOwnerModalOpen(false)}
        defaultVesselType="Oil & Chemical Tanker (SIRE)"
      />

      {/* Unified Seafarer Candidate Dossier Portal */}
      <SeafarerApplicationModal
        isOpen={isSeafarerModalOpen}
        onClose={() => setIsSeafarerModalOpen(false)}
      />
    </>
  );
}
