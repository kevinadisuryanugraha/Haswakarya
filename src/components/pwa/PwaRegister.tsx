'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import {
  Download,
  X,
  CheckCircle2,
  WifiOff,
  Wifi,
  Share2,
  PlusSquare,
  ShieldCheck,
  Ship,
} from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

const DISMISS_KEY = 'hcos_pwa_prompt_dismissed_until';
const DISMISS_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export function PwaRegister() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [showReconnected, setShowReconnected] = useState(false);
  const [installedToast, setInstalledToast] = useState(false);

  // 1. Check standalone display mode and register Service Worker
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Detect standalone mode
    const standaloneMedia = window.matchMedia('(display-mode: standalone)');
    const isIosStandalone = (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    if (standaloneMedia.matches || isIosStandalone) {
      setIsStandalone(true);
    }

    const onMediaChange = (e: MediaQueryListEvent) => {
      setIsStandalone(e.matches);
    };
    standaloneMedia.addEventListener('change', onMediaChange);

    // Initial online/offline status
    setIsOffline(!navigator.onLine);

    // Register Service Worker
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((reg) => {
            if (process.env.NODE_ENV !== 'production') {
              console.log('[H-COS PWA] Service Worker registered successfully with scope:', reg.scope);
            }
          })
          .catch((err) => {
            console.warn('[H-COS PWA] Service Worker registration failed:', err);
          });
      });
    }

    return () => {
      standaloneMedia.removeEventListener('change', onMediaChange);
    };
  }, []);

  // 2. Connectivity Listeners (Online / Offline)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = () => {
      setIsOffline(false);
      setShowReconnected(true);
      const timer = setTimeout(() => setShowReconnected(false), 3500);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOffline(true);
      setShowReconnected(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // 3. Listen for beforeinstallprompt event
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);

      // Check if user previously dismissed banner
      const dismissedUntil = localStorage.getItem(DISMISS_KEY);
      const isDismissed = dismissedUntil && Date.now() < parseInt(dismissedUntil, 10);

      if (!isDismissed && !isStandalone) {
        // Show after subtle delay for polite UX
        const timer = setTimeout(() => {
          setShowInstallBanner(true);
        }, 3500);
        return () => clearTimeout(timer);
      }
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setShowInstallBanner(false);
      setIsStandalone(true);
      setInstalledToast(true);
      setTimeout(() => setInstalledToast(false), 4500);
    };

    // Custom event to trigger PWA installation from any button
    const handleCustomPrompt = () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choice) => {
          if (choice.outcome === 'accepted') {
            setShowInstallBanner(false);
          }
          setDeferredPrompt(null);
        });
      } else {
        // Check if iOS Safari
        const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as unknown as { MSStream?: unknown }).MSStream;
        if (isIos && !isStandalone) {
          setShowIosGuide(true);
        } else {
          // If already installed or unsupported, show brief feedback
          setShowInstallBanner(true);
        }
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('haswakarya:prompt-pwa-install', handleCustomPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('haswakarya:prompt-pwa-install', handleCustomPrompt);
    };
  }, [deferredPrompt, isStandalone]);

  const handleInstallClick = useCallback(async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setShowInstallBanner(false);
      }
      setDeferredPrompt(null);
    } else {
      const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent);
      if (isIos) {
        setShowInstallBanner(false);
        setShowIosGuide(true);
      } else {
        setShowInstallBanner(false);
      }
    }
  }, [deferredPrompt]);

  const handleDismissBanner = useCallback(() => {
    setShowInstallBanner(false);
    try {
      localStorage.setItem(DISMISS_KEY, (Date.now() + DISMISS_DURATION_MS).toString());
    } catch {
      // localStorage may fail in strict private mode
    }
  }, []);

  return (
    <>
      {/* ── Offline Banner ──────────────────────────────────────────────── */}
      {isOffline && (
        <aside
          aria-live="polite"
          className="fixed top-0 inset-x-0 z-50 bg-amber-600 text-white px-3 py-1.5 text-xs font-semibold flex items-center justify-center gap-2 shadow-md animate-in slide-in-from-top duration-200"
        >
          <WifiOff className="w-4 h-4 shrink-0 text-amber-200" />
          <span>Mode Offline Maritim Aktif — Menampilkan arsip cache data &amp; dokumen lokal.</span>
        </aside>
      )}

      {/* ── Reconnected Toast ───────────────────────────────────────────── */}
      {showReconnected && (
        <aside
          aria-live="polite"
          className="fixed top-2 inset-x-4 max-w-sm mx-auto z-50 bg-emerald-600 text-white px-4 py-2 text-xs font-bold rounded-xl shadow-xl flex items-center justify-center gap-2 animate-in fade-in duration-200"
        >
          <Wifi className="w-4 h-4 shrink-0 text-emerald-200" />
          <span>Koneksi Maritim Tersambung Kembali</span>
        </aside>
      )}

      {/* ── App Installed Toast ─────────────────────────────────────────── */}
      {installedToast && (
        <aside
          aria-live="polite"
          className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50 bg-[#06122A] text-white border border-emerald-500/40 p-4 rounded-2xl shadow-2xl flex items-center gap-3 max-w-sm animate-in slide-in-from-bottom duration-300"
        >
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">Aplikasi H-COS Berhasil Diinstal</h4>
            <p className="text-[11px] text-slate-300">
              Ikon Haswakarya kini aktif di beranda perangkat Anda.
            </p>
          </div>
        </aside>
      )}

      {/* ── Interactive PWA Install Banner ──────────────────────────────── */}
      {showInstallBanner && !isStandalone && (
        <section
          aria-label="Pemberitahuan Instalasi Aplikasi PWA"
          className="fixed bottom-24 sm:bottom-6 left-3 right-3 sm:left-auto sm:right-6 max-w-md z-40 bg-[#06122A]/95 backdrop-blur-xl border border-sky-400/30 rounded-2xl p-4 text-white shadow-[0_12px_40px_rgba(6,18,42,0.6)] animate-in slide-in-from-bottom duration-300"
        >
          <div className="flex items-start justify-between gap-3 mb-2.5">
            <div className="flex items-center gap-2.5">
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-[#0c2b52] to-[#071b34] border border-sky-300/30 flex items-center justify-center shadow-inner overflow-hidden shrink-0">
                <Image
                  src="/icons/icon-192.png"
                  alt="H-COS App Icon"
                  width={36}
                  height={36}
                  className="rounded-lg object-contain"
                />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs font-extrabold tracking-tight text-white">
                    Haswakarya H-COS App
                  </h3>
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30 font-mono">
                    PWA
                  </span>
                </div>
                <p className="text-[11px] text-sky-200/90 leading-tight">
                  Aplikasi Operasional &amp; Crewing Maritim
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleDismissBanner}
              aria-label="Tutup saran instalasi"
              className="text-white/60 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-[11px] text-slate-300 leading-relaxed mb-3">
            Pasang di perangkat untuk akses kilat data awak kapal, verifikasi SIUKAK / MLC 2006, dan kesiapan offline saat berlayar.
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleInstallClick}
              className="flex-1 py-2 px-3.5 rounded-xl bg-accent hover:bg-accent/90 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-accent/25 active:scale-95 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 shrink-0" />
              <span>Instal Sekarang</span>
            </button>
            <button
              type="button"
              onClick={handleDismissBanner}
              className="py-2 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 hover:text-white font-semibold text-xs active:scale-95 transition-all"
            >
              Nanti
            </button>
          </div>
        </section>
      )}

      {/* ── iOS Safari PWA Installation Sheet Guide ─────────────────────── */}
      {showIosGuide && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Petunjuk Instalasi iOS"
          className="fixed inset-0 z-50 bg-navy/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-3 sm:p-4"
        >
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl text-slate-800 animate-in slide-in-from-bottom duration-200">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#06122A] text-amber-400 flex items-center justify-center font-bold text-sm">
                  <Ship className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-[#06122A]">Instal di iPhone / iPad</h4>
                  <p className="text-[11px] text-slate-500">Petunjuk Apple Safari PWA</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowIosGuide(false)}
                aria-label="Tutup petunjuk"
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <ol className="space-y-3 text-xs text-slate-600 mb-4">
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-sky-100 text-sky-800 font-bold flex items-center justify-center shrink-0 text-[10px]">
                  1
                </span>
                <span>
                  Ketuk tombol <strong>Bagikan (Share)</strong>{' '}
                  <Share2 className="w-3.5 h-3.5 inline text-sky-600" /> pada bilah menu Safari di bawah layar.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-sky-100 text-sky-800 font-bold flex items-center justify-center shrink-0 text-[10px]">
                  2
                </span>
                <span>
                  Gulir ke bawah lalu pilih menu <strong>&quot;Tambahkan ke Layar Utama&quot; (Add to Home Screen)</strong>{' '}
                  <PlusSquare className="w-3.5 h-3.5 inline text-slate-800" />.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-sky-100 text-sky-800 font-bold flex items-center justify-center shrink-0 text-[10px]">
                  3
                </span>
                <span>
                  Ketuk <strong>&quot;Tambah&quot; (Add)</strong> di sudut kanan atas. Ikon H-COS akan langsung tersedia di beranda Anda.
                </span>
              </li>
            </ol>

            <button
              type="button"
              onClick={() => setShowIosGuide(false)}
              className="w-full py-2.5 rounded-xl bg-[#06122A] text-white text-xs font-bold hover:bg-[#0c2b52] transition active:scale-98"
            >
              Saya Mengerti
            </button>
          </div>
        </div>
      )}
    </>
  );
}
