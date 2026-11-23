'use client';

import React from 'react';
import {
  Compass,
  ShieldCheck,
  Target,
  Anchor,
  Users,
  Award,
  ArrowRight,
  CheckCircle2,
  Flag,
  Globe2,
  Briefcase,
  Quote,
  FileText,
} from 'lucide-react';
import { COMPANY_INFO, getWhatsAppUrl } from '@/data/haswakarya-data';

export function AboutAndVision() {
  const missionPillars = [
    {
      title: "Professional Recruitment",
      code: "PILAR 01",
      description: "Rigorous vetting of seafarers through DGST-certified databases, STCW white-list validation, and technical competency boards.",
      icon: Users,
    },
    {
      title: "Safety & Compliance",
      code: "PILAR 02",
      description: "Strict adherence to ILO MLC 2006, IMO STCW Manila Amendments, Flag State regulations, and Indonesian SIUKAK requirements.",
      icon: ShieldCheck,
    },
    {
      title: "Client Partnership",
      code: "PILAR 03",
      description: "Building long-term transparent alliances with international shipowners through zero flight-miss SLAs and 24/7 crewing operations.",
      icon: Briefcase,
    },
    {
      title: "Seafarer Development",
      code: "PILAR 04",
      description: "Continual career coaching, Marlins English proficiency benchmarks, and welfare protection for crew and their families.",
      icon: Award,
    },
  ];

  return (
    <section
      id="about"
      className="py-16 sm:py-20 lg:py-28 px-4 sm:px-6 lg:px-8 bg-surface relative overflow-hidden scroll-mt-24 md:scroll-mt-28"
      aria-label="About Haswakarya Crew Agency & Corporate Vision"
    >
      {/* Grainient Analog Texture Overlay */}
      <div className="absolute inset-0 pointer-events-none bg-grain opacity-40 z-0" aria-hidden="true" />

      {/* Geospatial Coordinate Watermark (Subtle Command Atmosphere) */}
      <div
        className="absolute top-8 right-6 text-right font-mono text-[10px] sm:text-xs text-slate-300 pointer-events-none select-none tracking-widest uppercase hidden lg:block z-0"
        aria-hidden="true"
      >
        <span>01°06&apos;44&quot;N 103°58&apos;28&quot;E</span>
        <span className="block text-slate-400 font-bold">STRAIT OF MALACCA OPERATIONAL HUB</span>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* ============================================================= */}
        {/* Section Header                                                */}
        {/* ============================================================= */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-3 sm:mb-4 shadow-xs">
            <Compass className="w-3.5 h-3.5 text-primary shrink-0" />
            <span>Company Mandate &amp; Philosophy</span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-navy mb-4 tracking-tight">
            Institutional Commitment to Maritime Excellence
          </h2>

          <p className="text-muted text-sm sm:text-base lg:text-lg max-w-2xl mx-auto leading-relaxed">
            Founded with the unwavering conviction that Indonesian mariners are among the world&apos;s finest, we bridge elite seafaring talent with premier international vessel fleets.
          </p>
        </div>

        {/* ============================================================= */}
        {/* Sovereign Mandate Banner: The National Ambassador Manifesto  */}
        {/* ============================================================= */}
        <div className="horizonx-card-dark rounded-3xl p-6 sm:p-10 lg:p-12 mb-12 sm:mb-16 border border-white/20 shadow-2xl relative overflow-hidden">
          {/* Subtle Background Accent */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-primary/20 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            {/* Quote Icon & Headline (7 Cols) */}
            <div className="lg:col-span-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white/10 text-sky text-xs font-bold uppercase tracking-wider mb-4 border border-white/15">
                <Flag className="w-3.5 h-3.5 text-accent" />
                <span>The Haswakarya Credo</span>
              </div>

              <blockquote className="text-lg sm:text-2xl lg:text-3xl font-extrabold text-white leading-snug tracking-tight mb-6">
                &ldquo;To us, every seafarer is an ambassador of the nation, and every vessel that sails is a sacred trust that we must uphold.&rdquo;
              </blockquote>

              <p className="text-slate-300 text-xs sm:text-sm lg:text-base leading-relaxed mb-6">
                {COMPANY_INFO.about}
              </p>

              {/* Regulatory Sign-off Tag */}
              <div className="flex flex-wrap items-center gap-3 text-xs text-ice/90">
                <span className="font-mono font-bold text-sky">{COMPANY_INFO.entityName}</span>
                <span className="text-white/40">•</span>
                <span>Ministry of Transportation SIUKAK Authorized</span>
                <span className="text-white/40">•</span>
                <span className="font-mono text-accent">NIB: {COMPANY_INFO.nib}</span>
              </div>
            </div>

            {/* Vision Highlight Card (4 Cols Offset) */}
            <div className="lg:col-span-4 bg-navy-950/70 rounded-2xl p-6 border border-white/15 shadow-inner flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-primary/40 border border-sky/40 flex items-center justify-center text-sky mb-4">
                  <Target className="w-5 h-5" />
                </div>

                <span className="text-[10px] font-mono uppercase font-bold text-sky tracking-widest block mb-1">
                  Corporate Vision
                </span>
                <h3 className="text-base sm:text-lg font-bold text-white mb-3">
                  Global Manning Partner of Choice
                </h3>
                <p className="text-slate-300 text-xs leading-relaxed mb-6">
                  {COMPANY_INFO.vision}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5">
                <a
                  href={getWhatsAppUrl("Halo Haswakarya, kami ingin mendiskusikan peluang kemitraan manning kapal jangka panjang.")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shimmer-btn flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-accent hover:bg-accent/90 text-white font-bold text-xs shadow-md transition-all group"
                >
                  <span>Initiate Partnership</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </a>

                <a
                  href={getWhatsAppUrl("Halo Haswakarya, mohon kirimkan Official Company Profile & Crewing Matrix (PDF Deck) PT Haswakarya Andalan Sedare.")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition-all shrink-0"
                  title="Request Official Corporate Deck PDF"
                >
                  <FileText className="w-3.5 h-3.5 text-sky" />
                  <span>PDF Deck</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================= */}
        {/* 4 Mission Pillars Grid                                        */}
        {/* ============================================================= */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="text-xs font-bold text-primary uppercase tracking-widest block">Operational Roadmap</span>
              <h3 className="text-xl sm:text-2xl font-extrabold text-navy">
                Four Pillars of Our Manning Mission
              </h3>
            </div>
            <span className="hidden sm:inline-block font-mono text-xs text-slate-400 font-semibold">
              ISO 9001 &amp; MLC 2006 Standard
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {missionPillars.map((pillar, idx) => {
              const IconComponent = pillar.icon;
              return (
                <div
                  key={idx}
                  className="horizonx-card rounded-2xl p-5 sm:p-6 flex flex-col justify-between group hover:border-primary/40"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-mono text-xs font-black text-primary px-2 py-0.5 rounded-md bg-primary/10 border border-primary/20">
                        {pillar.code}
                      </span>
                      <div className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center text-primary group-hover:text-accent group-hover:scale-110 transition-all">
                        <IconComponent className="w-4 h-4" />
                      </div>
                    </div>

                    <h4 className="text-base font-bold text-navy mb-2 group-hover:text-primary transition-colors leading-snug">
                      {pillar.title}
                    </h4>

                    <p className="text-xs text-muted leading-relaxed mb-4">
                      {pillar.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-border-light flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                    <span>Audited Protocol</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
}
export default AboutAndVision;
