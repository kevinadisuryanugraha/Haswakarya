'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Search,
  Database,
  ExternalLink,
  ChevronRight,
  Menu,
} from 'lucide-react';

const BREADCRUMBS: Array<{ prefix: string; label: string; exact?: boolean }> = [
  { prefix: '/portal/seafarers', label: 'Awak Kapal (Seafarers)' },
  { prefix: '/portal/vessels', label: 'Armada Kapal (Vessels)' },
  { prefix: '/portal/requisitions', label: 'Safe Manning Requisitions' },
  { prefix: '/portal/crewing', label: 'Maritime ATS Kanban' },
  { prefix: '/portal/matrix', label: 'SIRE 2.0 Matrix Simulator' },
  { prefix: '/portal/contracts', label: 'Kontrak PKL Tripartit' },
  { prefix: '/portal/payroll', label: 'Payroll & Remittance' },
  { prefix: '/portal/audit', label: 'Jejak Audit' },
  { prefix: '/portal', label: 'Ringkasan Armada', exact: true },
];

function resolveBreadcrumb(pathname: string | null): string {
  if (!pathname) return 'Portal';
  const match = BREADCRUMBS.find((item) =>
    item.exact ? pathname === item.prefix : pathname.startsWith(item.prefix)
  );
  return match ? match.label : 'Portal';
}

export function PortalTopBar({ onOpenNav }: { onOpenNav?: () => void }) {
  const pathname = usePathname();
  const breadcrumb = resolveBreadcrumb(pathname);

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-3 sm:px-5 lg:px-6 flex items-center justify-between gap-3 sticky top-0 z-30">
      {/* Left: hamburger (mobile) + breadcrumbs */}
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <button
          type="button"
          onClick={onOpenNav}
          aria-label="Buka menu navigasi portal"
          aria-controls="portal-sidebar"
          className="lg:hidden shrink-0 p-2 -ml-1 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 active:scale-95 transition"
        >
          <Menu className="w-5 h-5" />
        </button>

        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs min-w-0">
          <Link
            href="/portal"
            className="hidden sm:inline text-slate-500 hover:text-slate-800 font-medium whitespace-nowrap"
          >
            H-COS Portal
          </Link>
          <ChevronRight className="hidden sm:block w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="font-bold text-slate-900 truncate" title={breadcrumb}>
            {breadcrumb}
          </span>
        </nav>
      </div>

      {/* Right: search, DB badge, website link */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <div className="relative hidden lg:block w-56 xl:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="search"
            placeholder="Cari kapal, pelaut, IMO..."
            aria-label="Cari kapal, pelaut, atau IMO"
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:bg-white transition-colors"
          />
        </div>

        <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-mono font-medium whitespace-nowrap">
          <Database className="w-3.5 h-3.5" />
          <span>haswakarya_db</span>
        </div>

        <Link
          href="/"
          aria-label="Buka website publik Haswakarya"
          className="px-2 sm:px-3 py-1.5 text-xs font-semibold rounded-md border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-colors flex items-center gap-1.5 whitespace-nowrap"
        >
          <span className="hidden sm:inline">Website</span>
          <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
        </Link>
      </div>
    </header>
  );
}
