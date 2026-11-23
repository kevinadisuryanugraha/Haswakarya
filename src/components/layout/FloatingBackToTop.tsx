'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { ArrowUp } from 'lucide-react';

export function FloatingBackToTop() {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 450) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (pathname?.startsWith('/portal') || pathname?.startsWith('/share')) {
    return null;
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <button
      type="button"
      onClick={scrollToTop}
      className={`fixed bottom-8 right-8 z-40 hidden lg:inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-navy/90 hover:bg-navy text-white text-xs font-semibold shadow-xl border border-white/20 backdrop-blur-md hover:-translate-y-0.5 transition-all duration-300 print:hidden group cursor-pointer ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
      aria-label="Scroll back to top"
    >
      <span>Top</span>
      <ArrowUp className="w-3.5 h-3.5 text-sky group-hover:-translate-y-0.5 transition-transform" />
    </button>
  );
}

export default FloatingBackToTop;
