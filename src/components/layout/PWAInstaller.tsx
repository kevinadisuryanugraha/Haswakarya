'use client';

import { useEffect } from 'react';

/**
 * PWA Service Worker Registration
 * Runs silently in the background without any annoying floating popup banners.
 * Follows enterprise PWA standards: browser handles install prompts natively.
 */
export function PWAInstaller() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch((err) => {
          console.warn('Service Worker registration skipped:', err);
        });
      });
    }
  }, []);

  // Returns null - zero intrusive banners, zero layout collisions!
  return null;
}
