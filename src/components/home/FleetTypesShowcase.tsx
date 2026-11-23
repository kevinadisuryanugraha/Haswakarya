'use client';

import dynamic from 'next/dynamic';

const FleetManningInquiryModal = dynamic(
  () => import('./FleetManningInquiryModal').then((m) => m.FleetManningInquiryModal),
  { ssr: false }
);

import React, { useState } from 'react';
import Image from 'next/image';
import {
  VESSEL_TYPES_DATA,
  VesselTypeItem,
  getWhatsAppUrl
} from '@/data/haswakarya-data';
import {
  Ship,
  Anchor,
  ShieldCheck,
  Award,
  Globe,
  ArrowRight,
  CheckCircle2,
  Users,
  Compass,
  FileCheck2,
  FileSpreadsheet,
} from 'lucide-react';

export function FleetTypesShowcase() {
  const [activeVesselId, setActiveVesselId] = useState<string>(VESSEL_TYPES_DATA[0].id);
  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);
  const activeVessel = VESSEL_TYPES_DATA.find((v) => v.id === activeVesselId) || VESSEL_TYPES_DATA[0];

  return (
    <section
      id="fleet"
      aria-label="Haswakarya Specialized Fleet Manning Capabilities"
      className="py-14 sm:py-18 lg:py-24 px-4 sm:px-6 lg:px-8 bg-surface relative overflow-hidden scroll-mt-24 md:scroll-mt-28"
    >
      {/* Grainient Analog Texture Overlay */}
      <div className="absolute inset-0 pointer-events-none bg-grain opacity-40 z-0" aria-hidden="true" />

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* ============================================================= */}
        {/* Section Header                                                */}
        {/* ============================================================= */}
        <div className="text-center mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-3 sm:mb-4 shadow-xs">
            <Ship className="w-3.5 h-3.5 text-primary shrink-0" />
            <span>Fleet Specialization</span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-navy mb-3 tracking-tight">
            Commercial Vessel Fleets Manned by Haswakarya
          </h2>

          <p className="text-muted text-xs sm:text-sm lg:text-base max-w-2xl mx-auto leading-relaxed">
            From deep-sea crude tankers to agile harbor towage, we deploy certified officers and ratings rigorously vetted for specific vessel architectures and cargo handling protocols.
          </p>
        </div>

        {/* ============================================================= */}
        {/* Fleet Horizontal Tab Selector                                 */}
        {/* ============================================================= */}
        <div
          className="flex overflow-x-auto gap-2.5 pb-2 mb-8 no-scrollbar scroll-smooth w-full max-w-3xl mx-auto"
          role="tablist"
          aria-label="Vessel Type Selector"
        >
          {VESSEL_TYPES_DATA.map((vessel) => {
            const isActive = vessel.id === activeVesselId;

            return (
              <button
                key={vessel.id}
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveVesselId(vessel.id)}
                className={`flex-1 min-w-[150px] sm:min-w-[170px] p-3 rounded-xl border text-left transition-all duration-200 flex items-center gap-3 shrink-0 ${
                  isActive
                    ? 'bg-navy border-navy text-white shadow-lg -translate-y-0.5'
                    : 'bg-white border-border-light text-navy/80 hover:bg-ice/20 hover:border-primary/30'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                    isActive ? 'bg-primary text-white' : 'bg-slate-100 text-primary'
                  }`}
                >
                  <Ship className="w-4 h-4" />
                </div>

                <div className="min-w-0">
                  <span
                    className={`block text-[10px] uppercase tracking-wider font-bold truncate ${
                      isActive ? 'text-sky' : 'text-slate-400'
                    }`}
                  >
                    {vessel.category.split(' ')[0]}
                  </span>
                  <p className="text-xs font-bold truncate leading-tight">
                    {vessel.name.split('&')[0].trim()}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* ============================================================= */}
        {/* Active Vessel Interactive Presentation Card                   */}
        {/* ============================================================= */}
        <div
          key={activeVessel.id}
          className="horizonx-card rounded-3xl p-6 sm:p-8 lg:p-10 border border-slate-200/80 shadow-xl overflow-hidden relative animate-fade-in"
        >
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Column (5 Cols): Real Commercial Vessel Photography */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center">
              <div className="relative w-full aspect-[4/3] max-w-md rounded-2xl border border-primary/30 overflow-hidden shadow-xl group bg-navy">
                <Image
                  src={activeVessel.image}
                  alt={activeVessel.name}
                  fill
                  sizes="(max-width: 1024px) 100vw, 450px"
                  className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
                />

                {/* Subtle vignette gradient for text overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-navy/80 via-transparent to-navy/30 pointer-events-none" />

                {/* Floating Category Tag */}
                <div className="absolute top-3 left-3 z-10">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-navy/85 backdrop-blur-md text-sky text-[10px] font-bold tracking-wider uppercase border border-white/20 shadow-md">
                    {activeVessel.category}
                  </span>
                </div>

                {/* Inspection Standard Badge */}
                <div className="absolute bottom-3 right-3 z-10">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-navy/90 backdrop-blur-md text-white text-[10px] font-bold tracking-wider uppercase border border-white/20 shadow-md">
                    <ShieldCheck className="w-3 h-3 text-sky" />
                    <span>{activeVessel.badge}</span>
                  </span>
                </div>
              </div>

              {/* Vessel Spec Snippet */}
              <div className="w-full mt-4 p-3 bg-surface rounded-xl border border-border-light flex items-center justify-between text-xs text-slate-600">
                <span className="font-semibold text-navy">Tonnage / Fleet Scale:</span>
                <span className="font-mono font-bold text-primary">{activeVessel.deadweightTonnage}</span>
              </div>
            </div>

            {/* Right Column (7 Cols): Technical Crew Requirements & Ranks */}
            <div className="lg:col-span-7 flex flex-col justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-accent/10 border border-accent/20 text-accent text-[11px] font-bold uppercase tracking-wider">
                    {activeVessel.badge}
                  </span>
                  <span className="text-slate-400 text-xs">•</span>
                  <span className="text-muted text-xs font-medium">
                    Trading Area: <strong className="text-navy">{activeVessel.tradeRoutes}</strong>
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-navy mb-3 tracking-tight">
                  {activeVessel.name}
                </h3>

                <p className="text-muted text-xs sm:text-sm leading-relaxed mb-6">
                  {activeVessel.description}
                </p>

                {/* Key Ranks & Required Certifications Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 pt-5 border-t border-slate-200">
                  {/* Key Ranks */}
                  <div>
                    <h4 className="text-xs font-bold text-navy uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-primary" />
                      <span>Key Crew Ranks Supplied:</span>
                    </h4>
                    <ul className="space-y-1.5">
                      {activeVessel.keyRanks.map((rank, ri) => (
                        <li key={ri} className="flex items-center gap-2 text-xs text-slate-700">
                          <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                          <span className="font-medium">{rank}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Certifications */}
                  <div>
                    <h4 className="text-xs font-bold text-navy uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-accent" />
                      <span>Mandatory Qualifications:</span>
                    </h4>
                    <ul className="space-y-1.5">
                      {activeVessel.certifications.map((cert, ci) => (
                        <li key={ci} className="flex items-start gap-2 text-xs text-slate-700">
                          <span className="w-1.5 h-1.5 rounded-xs bg-accent shrink-0 mt-1.5" />
                          <span className="leading-tight">{cert}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Bottom Action Triggers */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-5 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsInquiryModalOpen(true)}
                  className="shimmer-btn inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-accent hover:bg-accent/90 text-white font-bold text-xs sm:text-sm shadow-md shadow-accent/20 transition-all hover:-translate-y-0.5 active:scale-95 text-center whitespace-nowrap cursor-pointer"
                >
                  <Ship className="w-4 h-4 shrink-0" />
                  <span>Request Crew for {activeVessel.name.split('&')[0].trim()}</span>
                  <ArrowRight className="w-4 h-4 shrink-0" />
                </button>

                <a
                  href="#pipeline"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-primary/40 text-primary font-bold text-xs sm:text-sm hover:bg-ice/30 transition-all text-center whitespace-nowrap"
                >
                  <Compass className="w-4 h-4 text-primary shrink-0" />
                  <span>View 9-Stage Vetting Pipeline</span>
                </a>
              </div>

            </div>

          </div>

        </div>

      </div>

      {/* Structured Fleet Manning Requisition Modal */}
      <FleetManningInquiryModal
        isOpen={isInquiryModalOpen}
        onClose={() => setIsInquiryModalOpen(false)}
        defaultVesselType={activeVessel.name}
      />
    </section>
  );
}

export default FleetTypesShowcase;
