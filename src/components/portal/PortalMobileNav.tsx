'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Compass, Users, Ship, CreditCard, LayoutGrid } from 'lucide-react';

interface MobileNavItem {
  label: string;
  href: string;
  icon: typeof Compass;
  matchExact?: boolean;
}

const ITEMS: MobileNavItem[] = [
  { label: 'Ringkasan', href: '/portal', icon: Compass, matchExact: true },
  { label: 'Pelaut', href: '/portal/seafarers', icon: Users },
  { label: 'Kapal', href: '/portal/vessels', icon: Ship },
  { label: 'Payroll', href: '/portal/payroll', icon: CreditCard },
];

/**
 * Bilah navigasi bawah khusus ponsel/tablet kecil.
 * Desktop memakai sidebar tetap; di sini hanya 4 tujuan tersering + "Menu"
 * yang membuka drawer berisi seluruh 9 modul.
 */
export function PortalMobileNav({ onOpenNav }: { onOpenNav: () => void }) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navigasi cepat portal"
      className="lg:hidden print:hidden fixed inset-x-0 bottom-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-[0_-6px_18px_-8px_rgba(6,18,42,0.25)]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="mx-auto grid max-w-md grid-cols-5 gap-0.5 px-1.5 pt-1.5 pb-1.5">
        {ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = item.matchExact
            ? pathname === item.href
            : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? 'page' : undefined}
              className={`flex flex-col items-center justify-center gap-1 rounded-lg px-1 py-1.5 text-[10px] font-semibold transition-colors active:scale-95 ${
                isActive
                  ? 'text-[#071b34] bg-slate-100'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Icon className={`w-[18px] h-[18px] ${isActive ? 'text-amber-600' : 'text-slate-400'}`} />
              <span className="leading-none truncate max-w-full">{item.label}</span>
            </Link>
          );
        })}

        <button
          type="button"
          onClick={onOpenNav}
          aria-label="Buka semua menu portal"
          className="flex flex-col items-center justify-center gap-1 rounded-lg px-1 py-1.5 text-[10px] font-semibold text-slate-500 hover:text-slate-900 hover:bg-slate-50 active:scale-95 transition-colors"
        >
          <LayoutGrid className="w-[18px] h-[18px] text-slate-400" />
          <span className="leading-none">Menu</span>
        </button>
      </div>
    </nav>
  );
}
