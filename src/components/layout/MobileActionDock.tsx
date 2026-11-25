'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  MessageSquare,
  Ship,
  Users,
  ShieldCheck,
} from 'lucide-react';
import { getWhatsAppUrl } from '@/data/haswakarya-data';

export function MobileActionDock() {
  const pathname = usePathname();

  // Jangan render dock di halaman portal internal atau halaman share vetting
  if (pathname?.startsWith('/portal') || pathname?.startsWith('/share')) {
    return null;
  }

  const isHome = pathname === '/';
  const isJoin = pathname === '/join-as-crew';
  const isRecruit = pathname === '/recruit-crew';
  const isPortal = pathname?.startsWith('/portal') ?? false;

  return (
    <nav
      aria-label="Bilah Navigasi Utama Ponsel"
      className="fixed bottom-0 inset-x-0 z-40 lg:hidden print:hidden pointer-events-auto"
    >
      <div className="bg-[#06122A]/95 backdrop-blur-xl border-t border-sky-500/20 shadow-[0_-8px_30px_rgba(2,6,23,0.6)] px-2 pt-1 pb-[calc(env(safe-area-inset-bottom,0px)+0.4rem)]">
        <div className="max-w-md mx-auto grid grid-cols-5 items-end text-center">
          {/* 1. Beranda / Home */}
          <Link
            href="/"
            aria-current={isHome ? 'page' : undefined}
            className="flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition-all group active:scale-95"
          >
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                isHome
                  ? 'text-sky-400 bg-sky-500/20 shadow-sm shadow-sky-500/20'
                  : 'text-slate-400 group-hover:text-white group-hover:bg-white/5'
              }`}
            >
              <Home className="w-4.5 h-4.5 stroke-[1.8]" />
            </div>
            <span
              className={`text-[9.5px] tracking-tight leading-none mt-1 transition-colors ${
                isHome
                  ? 'text-sky-300 font-semibold'
                  : 'text-slate-400 group-hover:text-slate-200 font-medium'
              }`}
            >
              Home
            </span>
          </Link>

          {/* 2. Karir Pelaut / Join Crew */}
          <Link
            href="/join-as-crew"
            aria-current={isJoin ? 'page' : undefined}
            className="flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition-all group active:scale-95"
          >
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                isJoin
                  ? 'text-sky-400 bg-sky-500/20 shadow-sm shadow-sky-500/20'
                  : 'text-slate-400 group-hover:text-white group-hover:bg-white/5'
              }`}
            >
              <Users className="w-4.5 h-4.5 stroke-[1.8]" />
            </div>
            <span
              className={`text-[9.5px] tracking-tight leading-none mt-1 transition-colors ${
                isJoin
                  ? 'text-sky-300 font-semibold'
                  : 'text-slate-400 group-hover:text-slate-200 font-medium'
              }`}
            >
              Karir Pelaut
            </span>
          </Link>

          {/* 3. Pusat Aksi Hero: Recruit Crew (Untuk Principal / Shipowner) */}
          <Link
            href="/recruit-crew"
            aria-label="Ajukan Kebutuhan Kru Kapal (Recruit Crew)"
            aria-current={isRecruit ? 'page' : undefined}
            className="relative -top-2 flex flex-col items-center justify-center group focus:outline-none"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#EA580C] via-[#F97316] to-[#FB923C] text-white flex items-center justify-center shadow-[0_6px_20px_rgba(234,88,12,0.45)] border-2 border-[#06122A] group-active:scale-95 group-hover:scale-105 transition-all">
              <Ship className="w-5 h-5 text-white drop-shadow-xs stroke-[2]" />
            </div>
            <span className="text-[9.5px] font-bold text-white tracking-tight mt-0.5 whitespace-nowrap">
              Recruit Crew
            </span>
          </Link>

          {/* 4. Portal H-COS (Verifikasi Dokumen & Enterprise Portal) */}
          <Link
            href="/portal"
            aria-current={isPortal ? 'page' : undefined}
            className="flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition-all group active:scale-95"
          >
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                isPortal
                  ? 'text-sky-400 bg-sky-500/20 shadow-sm shadow-sky-500/20'
                  : 'text-slate-400 group-hover:text-white group-hover:bg-white/5'
              }`}
            >
              <ShieldCheck className="w-4.5 h-4.5 stroke-[1.8]" />
            </div>
            <span
              className={`text-[9.5px] tracking-tight leading-none mt-1 transition-colors ${
                isPortal
                  ? 'text-sky-300 font-semibold'
                  : 'text-slate-400 group-hover:text-slate-200 font-medium'
              }`}
            >
              H-COS
            </span>
          </Link>

          {/* 5. WhatsApp 24/7 Ops Desk */}
          <a
            href={getWhatsAppUrl('Halo Haswakarya Crew Agency, saya ingin terhubung dengan tim operasional 24/7.')}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Hubungi WhatsApp Operasional 24/7"
            className="flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition-all group active:scale-95"
          >
            <div className="relative w-8 h-8 rounded-xl flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500/10 transition-all">
              <MessageSquare className="w-4.5 h-4.5 stroke-[1.8] group-hover:scale-110 transition-transform" />
              {/* Status Live Indicator Pulsa 24/7 */}
              <span className="absolute top-1 right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
              </span>
            </div>
            <span className="text-[9.5px] font-medium tracking-tight leading-none mt-1 text-slate-400 group-hover:text-emerald-300 transition-colors">
              WhatsApp
            </span>
          </a>
        </div>
      </div>
    </nav>
  );
}
