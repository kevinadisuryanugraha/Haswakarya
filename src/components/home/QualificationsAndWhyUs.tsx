'use client';

import React from 'react';
import Link from 'next/link';
import { SEAFARER_QUALIFICATIONS, WHY_CHOOSE_US, CORE_VALUES, getWhatsAppUrl } from '@/data/haswakarya-data';
import {
  CheckCircle2, Award, Shield, ShieldCheck
} from 'lucide-react';
import { getMaritimeIcon } from '@/lib/icons';

export function QualificationsBento() {
  return (
    <section id="qualifications" className="py-20 px-4 sm:px-6 lg:px-8 bg-surface relative overflow-hidden scroll-mt-24 md:scroll-mt-28">
      {/* Grainient Texture Overlay */}
      <div className="absolute inset-0 pointer-events-none bg-grain opacity-40 z-0" aria-hidden="true" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Section header */}
        <div className="text-center mb-10 sm:mb-14">
          <span className="soe-tag mb-4 inline-block text-xs tracking-widest uppercase shadow-xs">Seafarer Standards</span>
          <h2 className="text-3xl lg:text-4xl font-bold text-navy mb-4">
            What Makes a Haswakarya Seafarer
          </h2>
          <p className="text-muted text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Five core pillars define our elite seafarer pool — rigorously vetted for international vessel deployment under uncompromising maritime standards.
          </p>
        </div>

        {/* Haswakarya Competency Benchmark Bar */}
        <div className="mb-10 p-4 sm:p-5 bg-white rounded-2xl border border-slate-200/80 shadow-md">
          <div className="flex items-center gap-2 mb-3 pb-2.5 border-b border-slate-100 text-xs font-bold text-navy uppercase tracking-wider">
            <Award className="w-4 h-4 text-accent" />
            <span>Haswakarya Seafarer Vetting Benchmarks (Zero Compromise):</span>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-xs">
            <div className="p-2.5 rounded-lg bg-surface border border-border-light">
              <span className="block text-[10px] uppercase font-bold text-slate-400">Marlins English Test</span>
              <strong className="text-navy text-xs sm:text-sm">Officers 80%+ • Ratings 70%+</strong>
            </div>
            <div className="p-2.5 rounded-lg bg-surface border border-border-light">
              <span className="block text-[10px] uppercase font-bold text-slate-400">Documented Sea-Time</span>
              <strong className="text-navy text-xs sm:text-sm">Min. 12-24 Mo. Same Vessel Type</strong>
            </div>
            <div className="p-2.5 rounded-lg bg-surface border border-border-light">
              <span className="block text-[10px] uppercase font-bold text-slate-400">Medical Fitness</span>
              <strong className="text-navy text-xs sm:text-sm">100% Fit for Sea (DGST Hospital)</strong>
            </div>
            <div className="p-2.5 rounded-lg bg-surface border border-border-light">
              <span className="block text-[10px] uppercase font-bold text-slate-400">STCW 2010 Certification</span>
              <strong className="text-navy text-xs sm:text-sm">White-List Validated &amp; Audited</strong>
            </div>
          </div>
        </div>

        {/* Bento grid with HorizonX cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SEAFARER_QUALIFICATIONS.map((qual, idx) => (
            <div
              key={qual.id}
              className={`horizonx-card rounded-2xl p-6 sm:p-7 relative overflow-hidden group ${
                idx === 0 ? 'lg:col-span-1 md:col-span-2' : ''
              }`}
            >
              {/* Number & Category */}
              <div className="flex items-center justify-between mb-5">
                <span className="text-5xl font-black text-primary/10 leading-none select-none font-mono">
                  0{qual.number}
                </span>
                <span className="soe-tag text-xs tracking-wide uppercase">{qual.category}</span>
              </div>

              {/* Icon */}
              <div className="text-primary mb-4 group-hover:text-accent transition-colors duration-300">
                {getMaritimeIcon(qual.iconName, 'w-7 h-7')}
              </div>

              {/* Title & description */}
              <h3 className="text-lg font-bold text-navy mb-2 group-hover:text-primary transition-colors duration-300">
                {qual.title}
              </h3>
              <p className="text-muted text-sm mb-5 leading-relaxed">{qual.description}</p>

              {/* Criteria */}
              <ul className="space-y-2">
                {qual.criteria.map((criterion, ci) => (
                  <li key={ci} className="flex items-start gap-2 text-xs text-muted">
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="font-medium text-slate-700">{criterion}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Core values compact card with HorizonX dark (Symmetric full-span on tablet) */}
          <div
            id="core-values"
            className="horizonx-card-dark rounded-2xl p-6 sm:p-7 text-white relative overflow-hidden border border-white/15 md:col-span-2 lg:col-span-1 scroll-mt-28"
          >
            <h3 className="text-lg font-bold mb-4 sm:mb-5 text-ice flex items-center gap-2">
              <Shield className="w-4 h-4 text-sky" />
              <span>Our Core Values &amp; Maritime Code</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-1 gap-4 relative z-10">
              {CORE_VALUES.map((v) => (
                <div key={v.id} className="flex items-start gap-3 p-2.5 rounded-xl bg-white/[0.04] border border-white/10">
                  <div className="w-8 h-8 rounded-lg bg-primary/30 border border-primary/40 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-ice font-mono">{v.number}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-white text-sm">{v.title}</p>
                    <p className="text-slate-300 text-xs leading-relaxed">{v.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Winston Ethical Recruitment Charter Banner (MLC 2006 Reg 1.4.5) */}
        <div className="mt-8 p-4 sm:p-5 rounded-2xl bg-white border border-primary/25 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center shrink-0 shadow-sm">
              <ShieldCheck className="w-5 h-5 text-ice" />
            </div>
            <div>
              <div className="inline-flex items-center gap-2 text-primary text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-0.5">
                <span>Permenhub PM 59/2021 Pasal 36</span>
                <span className="text-slate-300">•</span>
                <span>ILO MLC 2006</span>
                <span className="text-slate-300">•</span>
                <span className="text-accent font-mono">Reg 1.4.5 Compliant</span>
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-navy">
                Strict Zero Placement Fee Guarantee to All Seafarers
              </h4>
              <p className="text-[11px] sm:text-xs text-muted leading-relaxed mt-0.5">
                PT Haswakarya Andalan Sedare strictly prohibits recruitment or placement fees to seafarers pursuant to Pasal 36 Permenhub RI No. PM 59/2021 and ILO MLC 2006 Reg 1.4.5. All manning mobilization expenses are strictly borne by verified shipowners.
              </p>
            </div>
          </div>
          <Link
            href="/join-as-crew"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary hover:bg-navy text-white text-xs font-bold shadow-sm transition-all whitespace-nowrap shrink-0 self-end sm:self-auto"
          >
            <span>Apply Free</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-ice" />
          </Link>
        </div>
      </div>
    </section>
  );
}

const WHY_US_KPIS: Record<string, string> = {
  "rapid-deployment": "Zero Flight Miss SLA",
  "transparency-compliance": "100% MLC 2006 Insured",
  "rigorous-vetting": "Ready-to-Board Roster",
  "legal-certainty": "Direct Kemenhub Audit",
  "quality-retention": "Strict Zero-Discrepancy",
  "strategic-support": "< 30-Min Ops Response",
};

export function WhyChooseUs() {
  return (
    <section id="why-us" className="py-20 px-4 sm:px-6 lg:px-8 bg-white relative overflow-hidden bg-grid-lines scroll-mt-24 md:scroll-mt-28">
      {/* Grainient Texture Overlay */}
      <div className="absolute inset-0 pointer-events-none bg-grain opacity-35 z-0" aria-hidden="true" />

      {/* Geospatial Coordinate Watermark (Subtle Command Atmosphere) */}
      <div
        className="absolute top-8 left-6 text-left font-mono text-[10px] sm:text-xs text-slate-300 pointer-events-none select-none tracking-widest uppercase hidden lg:block z-0"
        aria-hidden="true"
      >
        <span>INDONESIAN ARCHIPELAGO // 06°09&apos;12&quot;S 106°47&apos;33&quot;E</span>
        <span className="block text-slate-400 font-bold">JAKARTA OPERATIONS &amp; DGST AUDIT DESK</span>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-14">
          <span className="soe-tag mb-4 inline-block text-xs tracking-widest uppercase shadow-xs">Why Haswakarya</span>
          <h2 className="text-3xl lg:text-4xl font-bold text-navy mb-4">
            6 Reasons Global Ship Owners Trust Us
          </h2>
          <p className="text-muted text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            From agile crew deployment to long-term partnership, our strategic advantages are built on integrity, compliance, and excellence.
          </p>
        </div>

        {/* Grid with HorizonX cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {WHY_CHOOSE_US.map((item) => (
            <div
              key={item.id}
              className="horizonx-card rounded-2xl p-7 relative overflow-hidden group flex flex-col justify-between"
            >
              <div>
                {/* Number & KPI Guarantee Badge */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-5xl font-black text-primary/15 leading-none select-none font-mono">
                    {item.number}
                  </span>
                  <span className="soe-tag text-[10px] uppercase font-bold tracking-wider">
                    {WHY_US_KPIS[item.id] || "Audited Standard"}
                  </span>
                </div>

                {/* Icon */}
                <div className="w-12 h-12 rounded-xl bg-ice flex items-center justify-center mb-5 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-xs">
                  {getMaritimeIcon(item.iconName, 'w-6 h-6')}
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-navy mb-3 group-hover:text-primary transition-colors duration-300">
                  {item.title}
                </h3>
                <p className="text-muted text-sm leading-relaxed mb-5">{item.description}</p>
              </div>

              {/* Highlights */}
              <ul className="space-y-1.5 pt-3 border-t border-slate-100">
                {item.highlights.map((h, hi) => (
                  <li key={hi} className="flex items-center gap-2 text-xs text-slate-700">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
                    <span className="font-medium">{h}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
