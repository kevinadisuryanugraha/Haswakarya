'use client';

import React from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { COMPANY_INFO, getWhatsAppUrl } from '@/data/haswakarya-data';
import { resolveNavHref } from '@/lib/navigation/anchors';
import { Phone, Mail, MapPin, ExternalLink, MessageCircle, ArrowUp, Ship, ShieldCheck, Building2 } from 'lucide-react';

export function SplitCTA() {
  return (
    <section className="relative overflow-hidden bg-white py-12 sm:py-16">
      {/* Grainient Texture Overlay */}
      <div className="absolute inset-0 pointer-events-none bg-grain opacity-40 z-0" aria-hidden="true" />

      <div className="site-container relative z-10">
        <div className="cta-split grid grid-cols-1 lg:grid-cols-12 rounded-3xl overflow-hidden shadow-xl border border-slate-200">
          {/* Left: Action & Narrative shape */}
          <div className="lg:col-span-7 cta-left__shape bg-navy text-white p-7 sm:p-10 lg:p-14 flex flex-col justify-center relative z-10">
            <span className="inline-block bg-white/10 text-sky text-[10px] sm:text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-md mb-4 self-start border border-white/15">
              Let&apos;s Build Synergy
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold leading-tight mb-3 tracking-tight">
              {COMPANY_INFO.ctaHeading}
            </h2>
            <p className="text-slate-200 text-xs sm:text-sm lg:text-base leading-relaxed mb-6 sm:mb-8 max-w-xl">
              {COMPANY_INFO.ctaSubheading}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <a
                href={getWhatsAppUrl('Halo Haswakarya Crew Agency, saya Ship Owner ingin meminta portofolio dan penawaran kru kapal.')}
                target="_blank"
                rel="noopener noreferrer"
                className="shimmer-btn inline-flex items-center justify-center gap-2.5 bg-accent hover:bg-accent/90 text-white px-6 py-3.5 rounded-xl font-bold text-xs sm:text-sm shadow-md transition-all duration-200 hover:-translate-y-0.5 active:scale-95 text-center whitespace-nowrap"
              >
                <Phone className="w-4 h-4" />
                <span className="whitespace-nowrap">Request Crew Now</span>
              </a>
              <a
                href={getWhatsAppUrl('Halo Haswakarya Crew Agency, saya Pelaut ingin mendaftar ke database kandidat resmi.')}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2.5 border-2 border-primary text-ice hover:text-white bg-primary/20 hover:bg-primary/40 px-6 py-3.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 hover:-translate-y-0.5 active:scale-95 text-center whitespace-nowrap"
              >
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                <span className="whitespace-nowrap">Join as Seafarer</span>
              </a>
            </div>
          </div>

          {/* Right: Maritime Operations Hub info */}
          <div className="lg:col-span-5 bg-surface p-6 sm:p-8 lg:p-10 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-slate-200 relative">
            <div>
              <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider mb-1.5">
                <Ship className="w-3.5 h-3.5 text-primary" />
                <span>Strategic Maritime Hubs</span>
              </div>
              <h3 className="text-xl font-extrabold text-navy mb-3">
                HASWAKARYA CREW AGENCY
              </h3>

              {/* Global Shipping Corridors Map Snippet */}
              <div className="relative w-full h-24 mb-4 rounded-xl overflow-hidden border border-slate-200/80 shadow-xs bg-navy">
                <Image
                  src="/images/world-routes.svg"
                  alt="Haswakarya Global Maritime Trading Routes: Malacca Strait, Intra-Asia, Middle East"
                  fill
                  sizes="400px"
                  className="object-cover opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy/90 via-transparent to-navy/30 pointer-events-none" />
                <div className="absolute bottom-2 left-2.5 z-10 flex items-center gap-1.5 text-[10px] text-sky font-mono font-bold tracking-wider uppercase">
                  <span className="w-1.5 h-1.5 rounded-xs bg-emerald-400 shrink-0" />
                  <span>Strait of Malacca • Intra-Asia • Global</span>
                </div>
              </div>

              {/* Dual Hub Structured Cards */}
              <div className="space-y-3.5 text-xs">
                {/* Batam HQ Card */}
                <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-xs">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-bold text-navy flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span>Batam Head Office (HQ)</span>
                    </span>
                    <span className="font-mono text-[10px] text-primary/70 bg-ice/40 px-1.5 py-0.5 rounded">
                      1°06&apos;44&quot;N 103°58&apos;28&quot;E
                    </span>
                  </div>
                  <p className="text-slate-600 leading-relaxed mb-2">
                    Ruko Tiban Mas Blok A No. 59-60, Tiban Lama, Batam, Kepulauan Riau
                  </p>
                  <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-slate-100">
                    <span className="text-slate-500">Fax: <strong className="text-navy">{COMPANY_INFO.fax}</strong></span>
                    <a
                      href="https://maps.google.com/?q=Tiban+Mas+Batam"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary font-bold hover:text-accent transition-colors flex items-center gap-1"
                    >
                      <span>Google Maps</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                {/* Jakarta Branch Card */}
                <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-xs">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-bold text-navy flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-accent shrink-0" />
                      <span>Jakarta Branch Office</span>
                    </span>
                    <span className="font-mono text-[10px] text-accent/80 bg-accent/10 px-1.5 py-0.5 rounded">
                      6°09&apos;12&quot;S 106°47&apos;33&quot;E
                    </span>
                  </div>
                  <p className="text-slate-600 leading-relaxed mb-2">
                    Seasons City Unit A 29 Bj, Jl. Prof. Dr. Latumeten No. 33, Jakarta Barat
                  </p>
                  <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-slate-100">
                    <span className="text-slate-500">Hotline: <strong className="text-navy">{COMPANY_INFO.phoneWhatsApp}</strong></span>
                    <a
                      href="https://maps.google.com/?q=Seasons+City+Jakarta"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent font-bold hover:underline transition-all flex items-center gap-1"
                    >
                      <span>Google Maps</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Email Inquiry */}
            <div className="pt-3.5 mt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-primary" />
                <span>{COMPANY_INFO.email}</span>
              </span>
              <span className="text-emerald-700 font-mono font-semibold text-[11px] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                24/7 Ops (GMT+7) Active
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  const pathname = usePathname();
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer id="contact" className="bg-navy text-white relative overflow-hidden scroll-mt-24 md:scroll-mt-28">
      {/* Grainient Texture Overlay */}
      <div className="absolute inset-0 pointer-events-none bg-grain opacity-50 z-0" aria-hidden="true" />

      {/* Main Footer Container */}
      <div className="site-container pt-16 pb-12 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
          {/* Col 1: Identity & Legal Foundation */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="bg-white p-2.5 rounded-lg inline-flex items-center justify-center mb-4 shadow-sm border border-slate-200">
              <Image
                src="/images/logo-transparent.png"
                alt="Haswakarya Crew Agency Logo"
                width={160}
                height={48}
                className="h-10 w-auto object-contain"
              />
            </div>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-4">
              {COMPANY_INFO.motto}
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="text-[11px] bg-white/10 border border-white/20 text-ice px-2.5 py-1 rounded-md font-semibold">
                SIUKAK Kemenhub RI
              </span>
              <span className="text-[11px] bg-white/10 border border-white/20 text-ice px-2.5 py-1 rounded-md font-semibold">
                NIB: {COMPANY_INFO.nib}
              </span>
            </div>
            <a
              href={getWhatsAppUrl("Halo Haswakarya, mohon kirimkan Official Company Profile & Crewing Matrix (PDF Deck) PT Haswakarya Andalan Sedare.")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent/20 hover:bg-accent/30 text-sky hover:text-white border border-sky/30 transition-all text-xs font-semibold"
            >
              <span>Request Official PDF Deck</span>
              <ExternalLink className="w-3 h-3 text-accent" />
            </a>
          </div>

          {/* Col 2: Batam Head Office */}
          <div>
            <h4 className="text-ice font-bold text-xs uppercase tracking-widest mb-3.5 flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-sky" />
              <span>Head Office (Batam)</span>
            </h4>
            <div className="space-y-2 text-xs sm:text-sm text-slate-300">
              <p className="font-semibold text-white">Ruko Tiban Mas Blok A No. 59-60</p>
              <p className="text-white/60 leading-relaxed">
                Jl. Gajah Mada, Tiban Lama, Batam, Kepulauan Riau, Indonesia
              </p>
              <p className="text-white/60 pt-1">
                Fax: <span className="font-mono">{COMPANY_INFO.fax}</span>
              </p>
              <a
                href="https://maps.google.com/?q=Tiban+Mas+Batam"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-sky hover:underline pt-1"
              >
                <span>Google Maps Coordinate</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Col 3: Jakarta Branch Office */}
          <div>
            <h4 className="text-ice font-bold text-xs uppercase tracking-widest mb-3.5 flex items-center gap-2">
              <Building2 className="w-3.5 h-3.5 text-sky" />
              <span>Branch Office (Jakarta)</span>
            </h4>
            <div className="space-y-2 text-xs sm:text-sm text-slate-300">
              <p className="font-semibold text-white">Apartemen Seasons City Unit A 29 Bj</p>
              <p className="text-white/60 leading-relaxed">
                Jl. Prof. Dr. Latumeten No. 33, Jembatan Besi, Tambora, Jakarta Barat, DKI Jakarta
              </p>
              <p className="text-white/60 pt-1">
                WhatsApp: <a href={COMPANY_INFO.whatsappUrl} className="text-ice hover:underline">{COMPANY_INFO.phoneWhatsApp}</a>
              </p>
              <p className="text-white/60">
                Email: <a href={`mailto:${COMPANY_INFO.email}`} className="text-ice hover:underline">{COMPANY_INFO.email}</a>
              </p>
              <a
                href="https://maps.google.com/?q=Seasons+City+Jakarta"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-accent hover:underline pt-1"
              >
                <span>Google Maps Coordinate</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Col 4: Fast Navigation */}
          <div>
            <h4 className="text-ice font-bold text-xs uppercase tracking-widest mb-3.5">
              Struktur Navigasi
            </h4>
            <ul className="space-y-1.5 text-xs sm:text-sm">
              {[
                { label: 'Company Profile & Vision', href: '#about' },
                { label: '4 Business Scopes', href: '#services' },
                { label: 'Commercial Fleet Types', href: '#fleet' },
                { label: '9-Stage Recruitment Pipeline', href: '#pipeline' },
                { label: '5 Seafarer Qualifications', href: '#qualifications' },
                { label: 'Why Choose Us (6 Pillars)', href: '#why-us' },
                { label: 'Legal & SIUKAK Verification', href: '#legals' },
                { label: 'Maritime Compliance & FAQ', href: '#faq' },
                { label: 'Offices & Contact Coordinates', href: '#contact' },
              ].map((link) => (
                <li key={link.href}>
                  <a
                    href={resolveNavHref(link.href, pathname)}
                    className="text-white/60 hover:text-ice transition-colors flex items-center gap-1.5 py-0.5 group"
                  >
                    <span className="text-primary text-[10px] group-hover:translate-x-0.5 transition-transform">›</span>
                    <span>{link.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Sub-Footer Copyright & Safe-Area Padding for Mobile Dock */}
      <div className="border-t border-white/10 pb-28 sm:pb-32 lg:pb-10 pt-6">
        <div className="site-container flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/50 text-center sm:text-left">
          <p>
            © {currentYear} <strong>PT HASWAKARYA ANDALAN SEDARE</strong>. All rights reserved. Registered under Ministry of Transportation RI (SIUKAK) &amp; MLC 2006 Standard.
          </p>
          <button
            type="button"
            onClick={scrollToTop}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-all text-xs font-semibold"
          >
            <span>Back to top</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
}
