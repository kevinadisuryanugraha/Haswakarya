'use client';

import React from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { COMPANY_INFO, getWhatsAppUrl } from '@/data/haswakarya-data';
import { resolveNavHref } from '@/lib/navigation/anchors';
import { CTA_TRUST_MARKS, HUB_OFFICES } from '@/data/siteHubs';
import { Phone, Mail, MapPin, ExternalLink, MessageCircle, ArrowUp, Ship, Building2, CheckCircle2 } from 'lucide-react';

export function SplitCTA() {
  return (
    <section className="relative overflow-hidden bg-white py-12 sm:py-16 lg:py-20">
      <div className="absolute inset-0 z-0 pointer-events-none bg-grain opacity-40" aria-hidden="true" />

      <div className="site-container relative z-10">
        <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-xl sm:rounded-3xl">
          {/* ── Pita ajakan bertindak ─────────────────────────────────── */}
          <div className="relative bg-navy px-6 py-8 text-white sm:px-9 sm:py-10 lg:px-12 lg:py-12">
            <div
              aria-hidden="true"
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage:
                  'radial-gradient(circle at 92% -10%, rgba(190,221,238,0.20), transparent 46%), radial-gradient(circle at 0% 110%, rgba(228,87,46,0.16), transparent 52%)',
              }}
            />

            <div className="relative grid items-center gap-6 lg:grid-cols-12 lg:gap-10">
              <div className="lg:col-span-7">
                <p className="mb-3.5 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-sky">
                  <span className="h-px w-7 bg-accent" aria-hidden="true" />
                  Crew Manning Partnership
                </p>
                <h2 className="text-balance text-[1.65rem] font-extrabold leading-[1.14] tracking-tight sm:text-3xl lg:text-[2.4rem]">
                  {COMPANY_INFO.ctaHeading}
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base">
                  {COMPANY_INFO.ctaSubheading}
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row lg:col-span-5 lg:flex-col">
                <a
                  href={getWhatsAppUrl('Halo Haswakarya Crew Agency, saya Ship Owner ingin meminta portofolio dan penawaran kru kapal.')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shimmer-btn inline-flex min-h-12 items-center justify-center gap-2.5 rounded-xl bg-accent px-6 text-sm font-bold text-navy shadow-lg shadow-accent/25 transition-all duration-200 hover:-translate-y-0.5 hover:brightness-110 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky sm:flex-1 lg:min-h-[3.25rem]"
                >
                  <Phone className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>Request Crew Now</span>
                </a>
                <a
                  href={getWhatsAppUrl('Halo Haswakarya Crew Agency, saya Pelaut ingin mendaftar ke database kandidat resmi.')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-12 items-center justify-center gap-2.5 rounded-xl border border-white/25 bg-white/5 px-6 text-sm font-bold text-ice transition-all duration-200 hover:-translate-y-0.5 hover:border-white/45 hover:bg-white/10 hover:text-white active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky sm:flex-1 lg:min-h-[3.25rem]"
                >
                  <MessageCircle className="h-4 w-4 shrink-0 text-emerald-400" aria-hidden="true" />
                  <span>Join as Seafarer</span>
                </a>
              </div>
            </div>

            <ul className="relative mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-white/10 pt-5 text-[11px] font-semibold text-slate-300 sm:text-xs">
              {CTA_TRUST_MARKS.map((mark) => (
                <li key={mark} className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-400" aria-hidden="true" />
                  <span>{mark}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Panel hub operasional ─────────────────────────────────── */}
          <div className="border-t border-slate-200 bg-surface">
            <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2 px-6 pt-6 sm:px-8 lg:px-9 lg:pt-7">
              <div className="min-w-0">
                <p className="mb-1.5 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-primary">
                  <Ship className="h-3.5 w-3.5" aria-hidden="true" />
                  Strategic Maritime Hubs
                </p>
                <h3 className="text-sm font-extrabold uppercase tracking-[0.08em] text-navy sm:text-base">
                  HASWAKARYA CREW AGENCY
                </h3>
              </div>
              <p className="text-[11px] font-medium text-slate-500 sm:text-xs">
                Batam HQ · Jakarta Branch
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5 p-6 sm:p-8 lg:grid-cols-12 lg:gap-6 lg:px-9 lg:pb-8 lg:pt-5">
              {/* Peta jalur */}
              <figure className="relative isolate m-0 overflow-hidden rounded-xl border border-slate-200 bg-navy shadow-sm lg:col-span-4 lg:min-h-[13rem]">
                <div className="relative h-32 w-full sm:h-36 lg:h-full lg:min-h-[13rem]">
                  <Image
                    src="/images/world-routes.svg"
                    alt="Haswakarya Global Maritime Trading Routes: Malacca Strait, Intra-Asia, Middle East"
                    fill
                    sizes="(max-width: 1023px) 100vw, 380px"
                    className="object-cover opacity-80"
                  />
                  <div
                    className="absolute inset-0 pointer-events-none bg-gradient-to-t from-navy/95 via-navy/15 to-navy/45"
                    aria-hidden="true"
                  />
                </div>
                <figcaption className="absolute inset-x-0 bottom-0 flex min-w-0 items-center gap-1.5 px-3.5 pb-3 font-mono text-[10px] font-bold uppercase tracking-wide text-sky">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" aria-hidden="true" />
                  <span className="min-w-0 truncate">Strait of Malacca • Intra-Asia • Global</span>
                </figcaption>
              </figure>

              {/* Dua kantor */}
              <div className="grid gap-4 sm:grid-cols-2 lg:col-span-8 lg:gap-5">
                {HUB_OFFICES.map((office) => (
                  <article
                    key={office.id}
                    className="flex min-w-0 flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-5"
                  >
                    <div className="flex min-w-0 items-start justify-between gap-2">
                      <h3 className="flex min-w-0 items-center gap-2 text-sm font-extrabold leading-snug text-navy">
                        <MapPin
                          className={`h-4 w-4 shrink-0 ${office.tone === 'hq' ? 'text-primary' : 'text-[#BF4318]'}`}
                          aria-hidden="true"
                        />
                        <span className="min-w-0 break-words">{office.name}</span>
                      </h3>
                      <span
                        className={`shrink-0 rounded-md border px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                          office.tone === 'hq'
                            ? 'border-primary/20 bg-ice/50 text-primary'
                            : 'border-[#BF4318]/20 bg-[#FDF1EC] text-[#BF4318]'
                        }`}
                      >
                        {office.role}
                      </span>
                    </div>

                    <p className="mt-2.5 break-words text-xs leading-relaxed text-slate-600">{office.address}</p>

                    <p className="mt-2 font-mono text-[11px] leading-none tracking-wide text-slate-500">
                      {office.coordinates}
                    </p>

                    <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 text-[11px] sm:text-xs">
                      <span className="min-w-0 text-slate-500">
                        {office.contactLabel}:{' '}
                        <strong className="break-words font-semibold text-navy">{office.contactValue}</strong>
                      </span>
                      <a
                        href={office.mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${office.name} on Google Maps`}
                        className={`inline-flex min-h-10 shrink-0 items-center justify-center gap-1.5 rounded-lg border px-2.5 text-[11px] font-bold transition-colors ${
                          office.tone === 'hq'
                            ? 'border-primary/30 bg-ice/30 text-primary hover:border-primary/50 hover:bg-ice/60'
                            : 'border-[#BF4318]/30 bg-[#FDF1EC] text-[#BF4318] hover:border-[#BF4318]/50 hover:bg-[#FBE4DA]'
                        }`}
                      >
                        <span>Google Maps</span>
                        <ExternalLink className="h-3 w-3" aria-hidden="true" />
                      </a>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            {/* Kontak cepat */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-6 py-4 text-[11px] sm:px-8 sm:text-xs lg:px-9">
              <a
                href={`mailto:${COMPANY_INFO.email}`}
                className="inline-flex min-h-9 min-w-0 items-center gap-1.5 break-all font-semibold text-slate-600 transition-colors hover:text-primary"
              >
                <Mail className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
                <span>{COMPANY_INFO.email}</span>
              </a>
              <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 font-mono text-[10px] font-semibold text-emerald-700">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" aria-hidden="true" />
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
              Site Navigation
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
