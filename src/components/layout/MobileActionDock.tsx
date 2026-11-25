'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  MessageSquare,
  PhoneCall,
  Ship,
  Users,
  Download,
  ShieldCheck,
} from 'lucide-react';
import { COMPANY_INFO, getWhatsAppUrl } from '@/data/haswakarya-data';

export function MobileActionDock() {
  const pathname = usePathname();
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const isStandaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsStandalone(isStandaloneMode);
  }, []);

  if (pathname?.startsWith('/portal') || pathname?.startsWith('/share')) {
    return null;
  }

  const handleInstallClick = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('haswakarya:prompt-pwa-install'));
    }
  };

  return (
    <aside
      aria-label="Bilah Aksi Cepat Ponsel (Mobile Action Dock)"
      className="fixed bottom-0 left-0 right-0 z-40 lg:hidden print:hidden"
    >
      {/* Status mini bar with Institutional SIUKAK & MLC 2006 Trust Marks */}
      <div className="bg-[#040c1c]/95 backdrop-blur-md border-t border-sky-500/20 px-3 py-1 flex items-center justify-between text-[10px] text-white/80">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          <span className="text-white font-medium">Ops Desk 24/7 Active</span>
        </div>
        <div className="flex items-center gap-1 text-sky-300/90 text-[10px]">
          <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />
          <span>SIUKAK &amp; MLC 2006 Official</span>
        </div>
      </div>

      {/* Primary 5-Zone Mobile Action Dock */}
      <div className="bg-[#06122A]/95 backdrop-blur-xl border-t border-white/10 px-2 pt-2 pb-[calc(env(safe-area-inset-bottom,0px)+0.5rem)] shadow-[0_-10px_25px_-5px_rgba(0,0,0,0.5)]">
        <div className="grid grid-cols-5 gap-1 max-w-lg mx-auto">
          {/* 1. Direct WhatsApp Hotline */}
          <a
            href={getWhatsAppUrl('Halo Haswakarya Crew Agency, saya ingin terhubung dengan tim operasional 24/7.')}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center py-1.5 px-0.5 rounded-xl text-white/80 hover:text-white hover:bg-white/10 active:scale-95 transition-all text-center group"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
              <MessageSquare className="w-4 h-4" />
            </div>
            <span className="text-[9px] font-semibold tracking-tight text-white leading-none">
              WhatsApp
            </span>
          </a>

          {/* 2. Request Crew (Principal / Shipowner) — High-Visibility Anchor Button */}
          <Link
            href="/recruit-crew"
            className="shimmer-btn flex flex-col items-center justify-center py-1.5 px-0.5 rounded-xl bg-accent text-white active:scale-95 transition-all text-center group shadow-md shadow-accent/25 cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-white/20 text-white flex items-center justify-center mb-1 group-hover:scale-110 transition-transform shadow-xs">
              <Ship className="w-4 h-4" />
            </div>
            <span className="text-[9px] font-bold tracking-tight text-white leading-none whitespace-nowrap">
              Recruit Crew
            </span>
          </Link>

          {/* 3. Seafarer Apply / Karir Pelaut */}
          <Link
            href={pathname === '/join-as-crew' ? '#apply' : '/join-as-crew'}
            className="flex flex-col items-center justify-center py-1.5 px-0.5 rounded-xl text-white/80 hover:text-white hover:bg-white/10 active:scale-95 transition-all text-center group"
          >
            <div className="w-8 h-8 rounded-lg bg-primary/30 text-sky flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
              <Users className="w-4 h-4" />
            </div>
            <span className="text-[9px] font-semibold tracking-tight text-white leading-none">
              Pelaut Karir
            </span>
          </Link>

          {/* 4. Direct Call Batam/Jakarta Operations Desk */}
          <a
            href={`tel:${COMPANY_INFO.whatsappClean}`}
            className="flex flex-col items-center justify-center py-1.5 px-0.5 rounded-xl text-white/80 hover:text-white hover:bg-white/10 active:scale-95 transition-all text-center group"
          >
            <div className="w-8 h-8 rounded-lg bg-white/10 text-slate-200 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
              <PhoneCall className="w-4 h-4" />
            </div>
            <span className="text-[9px] font-semibold tracking-tight text-white leading-none">
              Hotline
            </span>
          </a>

          {/* 5. PWA Install / H-COS Portal Toggle */}
          {isStandalone ? (
            <Link
              href="/portal"
              className="flex flex-col items-center justify-center py-1.5 px-0.5 rounded-xl text-amber-300 hover:text-amber-200 hover:bg-amber-400/10 active:scale-95 transition-all text-center group"
            >
              <div className="w-8 h-8 rounded-lg bg-amber-400/20 text-amber-300 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="text-[9px] font-bold tracking-tight text-amber-300 leading-none">
                H-COS
              </span>
            </Link>
          ) : (
            <button
              type="button"
              onClick={handleInstallClick}
              aria-label="Instal Aplikasi PWA Haswakarya"
              className="flex flex-col items-center justify-center py-1.5 px-0.5 rounded-xl text-sky-200 hover:text-white hover:bg-sky-400/10 active:scale-95 transition-all text-center group cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-300 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                <Download className="w-4 h-4" />
              </div>
              <span className="text-[9px] font-bold tracking-tight text-sky-200 leading-none whitespace-nowrap">
                Instal App
              </span>
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
