import Link from 'next/link';
import { Compass, Home, Phone } from 'lucide-react';
import { getWhatsAppUrl } from '@/data/haswakarya-data';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-navy text-white flex flex-col justify-center items-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none bg-grain opacity-40 z-0" aria-hidden="true" />
      
      <div className="max-w-md w-full text-center relative z-10 py-16">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-white/10 border border-white/20 text-sky text-xs font-bold uppercase tracking-widest mb-6">
          <Compass className="w-4 h-4 text-sky" />
          <span>Navigation Off-Course • Error 404</span>
        </div>

        <h1 className="text-6xl font-extrabold text-white tracking-tight mb-4">
          404
        </h1>

        <h2 className="text-xl sm:text-2xl font-bold text-ice mb-3">
          Halaman Tidak Ditemukan
        </h2>

        <p className="text-slate-300 text-sm leading-relaxed mb-8">
          Rute yang Anda tuju berada di luar koordinat navigasi resmi PT Haswakarya Andalan Sedare. Silakan kembali ke beranda utama atau hubungi operasional 24/7 kami.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-white font-semibold text-sm transition-all shadow-md"
          >
            <Home className="w-4 h-4" />
            <span>Kembali ke Beranda</span>
          </Link>

          <a
            href={getWhatsAppUrl('Halo Haswakarya, saya memerlukan bantuan navigasi website.')}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm border border-white/20 transition-all"
          >
            <Phone className="w-4 h-4 text-sky" />
            <span>Hubungi Operasional</span>
          </a>
        </div>
      </div>
    </div>
  );
}
