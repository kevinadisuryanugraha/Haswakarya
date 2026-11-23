'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { PortalSidebar } from './PortalSidebar';
import { PortalTopBar } from './PortalTopBar';
import { PortalMobileNav } from './PortalMobileNav';

export function PortalShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/portal/login';
  const [navOpen, setNavOpen] = useState(false);

  const openNav = useCallback(() => setNavOpen(true), []);
  const closeNav = useCallback(() => setNavOpen(false), []);

  // Tutup drawer setiap kali rute berubah agar tidak menutupi halaman tujuan.
  useEffect(() => {
    setNavOpen(false);
  }, [pathname]);

  // Kunci scroll latar saat drawer terbuka (mobile) supaya tidak "berdempetan".
  useEffect(() => {
    if (isLoginPage) return;
    const previous = document.body.style.overflow;
    if (navOpen) document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [navOpen, isLoginPage]);

  // Escape menutup drawer.
  useEffect(() => {
    if (isLoginPage) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setNavOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isLoginPage]);

  // Tutup drawer bila viewport melebar ke desktop (hindari sisa state).
  useEffect(() => {
    if (isLoginPage) return;
    const media = window.matchMedia('(min-width: 1024px)');
    const onChange = () => {
      if (media.matches) setNavOpen(false);
    };
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, [isLoginPage]);

  if (isLoginPage) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full min-w-0 flex justify-center">{children}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <PortalSidebar open={navOpen} onClose={closeNav} />

      {navOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden"
          onClick={closeNav}
          aria-hidden="true"
        />
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <PortalTopBar onOpenNav={openNav} />
        <main
          id="portal-main"
          className="flex-1 w-full min-w-0 mx-auto max-w-7xl px-4 pt-5 pb-28 sm:px-6 sm:pt-6 lg:px-8 lg:py-8"
        >
          {children}
        </main>
      </div>

      <PortalMobileNav onOpenNav={openNav} />
    </div>
  );
}
