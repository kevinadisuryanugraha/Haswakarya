'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Anchor, 
  Compass, 
  Users, 
  Ship, 
  FileCheck2, 
  ShieldCheck, 
  LogOut, 
  ExternalLink,
  ChevronRight,
  ClipboardList,
  FileText,
  CreditCard,
  ScrollText,
  KeyRound,
  X,
} from 'lucide-react';

export interface PortalSidebarProps {
  /** Drawer mobile terbuka? Di desktop sidebar selalu tampil. */
  open?: boolean;
  onClose?: () => void;
}

export function PortalSidebar({ open = false, onClose }: PortalSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const navItems = [
    {
      label: 'Ringkasan Armada',
      href: '/portal',
      icon: Compass,
      matchExact: true,
    },
    {
      label: 'Awak Kapal (Seafarers)',
      href: '/portal/seafarers',
      icon: Users,
    },
    {
      label: 'Armada Kapal (Vessels)',
      href: '/portal/vessels',
      icon: Ship,
    },
    {
      label: 'Safe Manning Requisition',
      href: '/portal/requisitions',
      icon: ClipboardList,
    },
    {
      label: 'Maritime ATS Kanban',
      href: '/portal/crewing',
      icon: FileCheck2,
    },
    {
      label: 'SIRE 2.0 Matrix Engine',
      href: '/portal/matrix',
      icon: ShieldCheck,
    },
    {
      label: 'Kontrak PKL Tripartit',
      href: '/portal/contracts',
      icon: FileText,
    },
    {
      label: 'Payroll & Remittance',
      href: '/portal/payroll',
      icon: CreditCard,
    },
    {
      label: 'Jejak Audit',
      href: '/portal/audit',
      icon: ScrollText,
    },
    {
      label: 'Keamanan Akun',
      href: '/portal/settings',
      icon: KeyRound,
    },
  ];

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/portal/login');
      router.refresh();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <aside
      id="portal-sidebar"
      aria-label="Navigasi portal"
      className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[86vw] bg-white border-r border-slate-200 flex flex-col select-none transition-transform duration-200 ease-out lg:sticky lg:top-0 lg:z-20 lg:h-screen lg:w-64 lg:max-w-none lg:shrink-0 lg:translate-x-0 ${
        open ? 'translate-x-0 shadow-2xl lg:shadow-none' : '-translate-x-full'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 border-b border-slate-200 px-4 sm:px-5 flex items-center justify-between gap-2">
        <Link href="/portal" className="flex items-center gap-2.5 min-w-0" onClick={onClose}>
          <div className="w-9 h-9 rounded-lg bg-[#071b34] flex items-center justify-center text-amber-400 shadow-sm">
            <Anchor className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
              HASWAKARYA
              <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-amber-50 text-amber-700 border border-amber-200">
                H-COS
              </span>
            </div>
            <div className="text-[10px] text-slate-500 font-mono truncate">Crewing Operating System</div>
          </div>
        </Link>

        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup menu navigasi"
          className="lg:hidden p-2 -mr-1 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Navigasi Utama
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.matchExact
            ? pathname === item.href
            : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              aria-current={isActive ? 'page' : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-slate-100 text-[#071b34] border-l-4 border-amber-500 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-amber-600' : 'text-slate-400'}`} />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}

        <div className="pt-5 px-3 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Portal Eksternal
        </div>

        <Link
          href="/share/vetting/demo"
          onClick={onClose}
          className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors group"
        >
          <span className="flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="truncate">Shipowner Review</span>
          </span>
          <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700" />
        </Link>

        <Link
          href="/"
          onClick={onClose}
          className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors group"
        >
          <span className="flex items-center gap-2.5">
            <Compass className="w-4 h-4 text-sky-600" />
            <span className="truncate">Website Publik</span>
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700" />
        </Link>
      </nav>

      {/* Database Status & User Session Card */}
      <div className="p-3 pb-[calc(env(safe-area-inset-bottom,0px)+0.75rem)] lg:pb-3 border-t border-slate-200 bg-slate-50/60">
        <div className="flex items-center gap-1.5 px-2 py-1 mb-2 text-[10px] text-emerald-700 font-mono bg-emerald-50 border border-emerald-200 rounded">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>PostgreSQL 14.5: LIVE</span>
        </div>

        <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-7 h-7 rounded-full bg-[#071b34] text-white text-xs font-bold flex items-center justify-center shrink-0">
              Capt
            </div>
            <div className="overflow-hidden">
              <div className="text-xs font-bold text-slate-900 truncate">Capt. Sulaeman</div>
              <div className="text-[10px] font-mono text-slate-500 truncate">SUPERADMIN</div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            disabled={loggingOut}
            title="Keluar dari Portal"
            className="p-1.5 rounded hover:bg-slate-100 text-slate-500 hover:text-rose-600 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
