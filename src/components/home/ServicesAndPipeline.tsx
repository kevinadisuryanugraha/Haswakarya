'use client';

import React, { useState } from 'react';
import { BUSINESS_SCOPES, RECRUITMENT_STAGES, getWhatsAppUrl } from '@/data/haswakarya-data';
import {
  CheckCircle2, ArrowRight,
  ChevronRight, ChevronLeft, ShieldCheck,
  Compass, Ship
} from 'lucide-react';
import { getMaritimeIcon } from '@/lib/icons';

export function BusinessScope() {
  return (
    <section id="services" className="py-14 sm:py-18 lg:py-24 bg-white relative overflow-hidden bg-grid-lines scroll-mt-24 md:scroll-mt-28">
      {/* Grainient Analog Texture Overlay */}
      <div className="absolute inset-0 pointer-events-none bg-grain opacity-40 z-0" aria-hidden="true" />

      <div className="site-container relative z-10">
        {/* Section Header */}
        <div className="text-center mb-10 sm:mb-14">
          <span className="soe-tag mb-3 inline-block text-xs font-bold tracking-widest uppercase shadow-xs">
            Our Business Scope
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-navy mb-3 tracking-tight">
            Integrated Crew Manning Services
          </h2>
          <p className="text-muted text-sm sm:text-base lg:text-lg max-w-2xl mx-auto leading-relaxed">
            Four interconnected pillars that ensure your fleet is always manned by the most qualified, certified, and compliant seafarers in the maritime industry.
          </p>
        </div>

        {/* Services Grid with HorizonX Card Craft */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {BUSINESS_SCOPES.map((scope) => (
            <div
              key={scope.id}
              className="horizonx-card rounded-2xl p-6 sm:p-8 flex flex-col justify-between group relative overflow-hidden"
            >
              <div>
                {/* Number & badge */}
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <span className="text-4xl sm:text-5xl font-black text-primary/15 leading-none select-none font-mono">
                    {scope.number}
                  </span>
                  {scope.badge && (
                    <span className="soe-tag text-[10px] sm:text-xs font-bold tracking-wide uppercase">
                      {scope.badge}
                    </span>
                  )}
                </div>

                {/* Icon */}
                <div className="text-primary mb-3 sm:mb-4 group-hover:text-accent group-hover:scale-110 transition-all duration-300">
                  {getMaritimeIcon(scope.iconName, 'w-7 h-7 sm:w-8 sm:h-8')}
                </div>

                {/* Title & Description */}
                <h3 className="text-lg sm:text-xl font-bold text-navy mb-2 sm:mb-3 group-hover:text-primary transition-colors duration-300 leading-snug">
                  {scope.title}
                </h3>
                <p className="text-muted text-xs sm:text-sm leading-relaxed mb-6">
                  {scope.description}
                </p>
              </div>

              {/* Features list */}
              <ul className="space-y-2.5 pt-4 border-t border-slate-200/60 mb-5">
                {scope.features.map((feature, fi) => (
                  <li key={fi} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                    <span className="leading-tight font-medium">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Direct Service Consultation Trigger */}
              <div className="pt-3.5 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">
                  SIUKAK Verified Service
                </span>
                <a
                  href={getWhatsAppUrl(`Halo Haswakarya, saya ingin meminta penawaran & konsultasi untuk layanan: ${scope.title}.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-accent transition-colors group/link"
                >
                  <span>Inquire Service</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover/link:translate-x-1 transition-transform" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// =========================================================================
// THE NAUTICAL VOYAGE ROADMAP: 3 STRATEGIC OPERATIONAL PHASES
// Replaces the clunky master-detail 9-tab list with an interactive
// simultaneous 3-card milestone progression deck.
// =========================================================================

interface PipelinePhase {
  id: number;
  code: string;
  title: string;
  subtitle: string;
  stageIndices: [number, number, number];
  badge: string;
  description: string;
}

const PIPELINE_PHASES: PipelinePhase[] = [
  {
    id: 1,
    code: "FASE 01",
    title: "Screening & Vetting",
    subtitle: "Talent Discovery, Document Audit & English Assessment",
    stageIndices: [0, 1, 2],
    badge: "DGST & Marlins Vetted",
    description: "Penyaringan awal dari database pelaut terverifikasi, audit keabsahan sertifikat STCW, dan uji Marlins English Test berstandar internasional.",
  },
  {
    id: 2,
    code: "FASE 02",
    title: "Technical & Owner Selection",
    subtitle: "Master Mariner Interview, Owner Authorization & Medical",
    stageIndices: [3, 4, 5],
    badge: "Principal Authorization",
    description: "Evaluasi teknis langsung oleh Master Mariner senior, wawancara kandidat bersama Ship Owner, dan uji kesehatan ketat di rumah sakit rujukan resmi.",
  },
  {
    id: 3,
    code: "FASE 03",
    title: "Compliance & Mobilization",
    subtitle: "Visa Processing, Pre-Joining Briefing & Onboard QA",
    stageIndices: [6, 7, 8],
    badge: "MLC 2006 Standard",
    description: "Pengurusan visa & endorsement bendera kapal, penandatanganan PKL berstandar ILO MLC 2006, pembekalan pra-keberangkatan, dan monitoring 14 hari pertama.",
  },
];

// Quality check points for each stage to display inside the roadmap card
const STAGE_QUALITY_CHECKS: Record<string, string[]> = {
  "01": ["DGST & SID Verified", "Targeted Seafarer Sourcing"],
  "02": ["STCW 2010 White-List Audit", "Seaman Book Authenticated"],
  "03": ["Marlins English Benchmark 80%+", "Maritime Safety Vocabulary"],
  "04": ["Technical Master Mariner Panel", "Behavioral & Vessel Aptitude"],
  "05": ["Direct Owner Video / Live Interview", "Rank Authorization by Principal"],
  "06": ["Flag-State Approved Medical Lab", "Drug, Alcohol & Fit-for-Sea Test"],
  "07": ["Transit & Seafarer Visa Facilitation", "Flag State Endorsement Validated"],
  "08": ["MLC 2006 Reg 1.4 Seafarer Agreement", "Pre-Joining Safety & CBT Briefing"],
  "09": ["14-Day Onboard Integration Audit", "Master Feedback & Performance Warranty"],
};

export function RecruitmentPipeline() {
  const [activePhaseIndex, setActivePhaseIndex] = useState(0);
  const currentPhase = PIPELINE_PHASES[activePhaseIndex];

  const nextPhase = () => {
    setActivePhaseIndex((prev) => (prev + 1) % PIPELINE_PHASES.length);
  };

  const prevPhase = () => {
    setActivePhaseIndex((prev) => (prev - 1 + PIPELINE_PHASES.length) % PIPELINE_PHASES.length);
  };

  return (
    <section id="pipeline" className="py-14 sm:py-18 lg:py-24 bg-navy relative overflow-hidden text-white scroll-mt-24 md:scroll-mt-28">
      {/* Grainient Organic Analog Texture Overlay */}
      <div className="absolute inset-0 pointer-events-none bg-grain opacity-40 z-0" aria-hidden="true" />

      {/* Subtle SOE Geometric Angled Accent in Background */}
      <svg
        className="absolute bottom-0 right-0 w-96 h-auto pointer-events-none z-0 opacity-15 hidden lg:block"
        viewBox="0 0 263 298"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path d="M0 0L263 298V1.20973L0 0Z" fill="#407997" />
      </svg>

      <div className="site-container relative z-10">
        
        {/* ============================================================= */}
        {/* SECTION HEADER                                                */}
        {/* ============================================================= */}
        <div className="text-center mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-white/10 border border-white/20 text-sky text-xs font-bold tracking-widest uppercase mb-3 sm:mb-4 shadow-sm">
            <Compass className="w-3.5 h-3.5 text-sky shrink-0" />
            <span>Key Stages of Recruitment</span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white mb-3 tracking-tight">
            The Nautical Voyage Roadmap
            <span className="block text-sky text-base sm:text-lg lg:text-xl font-medium mt-1.5">
              Rigorous 9-Stage Vetting Pipeline Structured in 3 Operational Milestones
            </span>
          </h2>

          <p className="text-slate-300 text-xs sm:text-sm lg:text-base max-w-3xl mx-auto leading-relaxed">
            Every crew member undergoes an uncompromising screening protocol — ensuring zero discrepancies from initial talent discovery to onboard vessel integration.
          </p>
        </div>

        {/* ============================================================= */}
        {/* 1. HORIZONTAL NAUTICAL PHASE SELECTOR (3 STRATEGIC MILESTONES) */}
        {/* ============================================================= */}
        <div
          className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 mb-8 sm:mb-12"
          role="tablist"
          aria-label="3 Strategic Recruitment Phases"
        >
          {PIPELINE_PHASES.map((phase, idx) => {
            const isActive = idx === activePhaseIndex;

            return (
              <button
                key={phase.code}
                role="tab"
                aria-selected={isActive}
                onClick={() => setActivePhaseIndex(idx)}
                className={`text-left p-4 sm:p-5 rounded-2xl border transition-all duration-300 flex flex-col justify-between group relative overflow-hidden ${
                  isActive
                    ? 'bg-primary border-sky text-white shadow-xl shadow-primary/25 -translate-y-0.5'
                    : 'bg-navy-950/70 border-white/15 text-white/70 hover:bg-white/10 hover:border-white/25 hover:text-white'
                }`}
              >
                {/* Phase Number & Badge */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span
                    className={`font-mono text-xs sm:text-sm font-black tracking-wider uppercase px-2.5 py-1 rounded-md border ${
                      isActive
                        ? 'bg-white text-navy border-white shadow-xs'
                        : 'bg-white/10 text-white border-white/15'
                    }`}
                  >
                    {phase.code}
                  </span>

                  <span
                    className={`text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-md ${
                      isActive
                        ? 'bg-navy/80 text-sky border border-sky/30'
                        : 'bg-white/5 text-white/60'
                    }`}
                  >
                    {phase.badge}
                  </span>
                </div>

                {/* Phase Title & Subtitle */}
                <div>
                  <h3
                    className={`text-base sm:text-lg font-bold leading-snug mb-1 transition-colors ${
                      isActive ? 'text-white' : 'text-slate-200 group-hover:text-white'
                    }`}
                  >
                    {phase.title}
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-300 line-clamp-1 leading-normal">
                    {phase.subtitle}
                  </p>
                </div>

                {/* Synchronized Nautical Progress Line */}
                <div
                  className="w-full h-1 bg-white/15 rounded-full mt-3 overflow-hidden"
                  aria-hidden="true"
                >
                  <div
                    className={`h-full transition-all duration-500 rounded-full ${
                      isActive ? 'w-full bg-accent' : 'w-0 bg-transparent'
                    }`}
                  />
                </div>
              </button>
            );
          })}
        </div>

        {/* Phase Context Banner */}
        <div className="mb-6 p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-xs bg-accent shrink-0" />
            <span className="font-semibold text-white uppercase tracking-wider">{currentPhase.code}:</span>
            <span className="text-slate-200">{currentPhase.description}</span>
          </div>
          <span className="text-sky font-mono font-bold shrink-0 self-end sm:self-auto">
            Stages {currentPhase.stageIndices[0] + 1} – {currentPhase.stageIndices[2] + 1} of 9
          </span>
        </div>

        {/* ============================================================= */}
        {/* 2. 3-CARD SIMULTANEOUS STAGE PROGRESSION DECK (THE ROADMAP)    */}
        {/* ============================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6 items-stretch mb-8 sm:mb-12">
          {currentPhase.stageIndices.map((stageIndex, posIdx) => {
            const stage = RECRUITMENT_STAGES[stageIndex];
            if (!stage) return null;

            const qualityChecks = STAGE_QUALITY_CHECKS[stage.code] || [
              "Compliance Check Verified",
              "Authorized Protocol Standard"
            ];

            return (
              <div
                key={stage.code}
                className="bg-navy-950/80 border border-white/15 rounded-2xl p-5 sm:p-6 flex flex-col justify-between hover:border-sky/40 hover:-translate-y-1 transition-all duration-300 relative group shadow-xl"
              >
                {/* Nautical Connector Arrow between cards on desktop */}
                {posIdx < 2 && (
                  <div
                    className="hidden md:flex absolute -right-3.5 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-primary border border-white/20 items-center justify-center text-white shadow-md pointer-events-none"
                    aria-hidden="true"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                )}

                <div>
                  {/* Card Header: Monospace Stage Code & Duration Badge */}
                  <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-white/10">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-xl sm:text-2xl font-black text-white bg-primary/30 border border-primary/50 px-2.5 py-1 rounded-md shadow-inner">
                        {stage.code}
                      </span>
                      <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-ice text-navy font-semibold">
                        {stage.badge || "Gate"}
                      </span>
                    </div>

                  </div>

                  {/* Stage Icon & Subtitle Tag */}
                  <div className="flex items-center gap-2.5 mb-2.5">
                    <div className="p-2 rounded-lg bg-primary/20 text-sky border border-primary/30 group-hover:text-accent group-hover:scale-105 transition-all">
                      {getMaritimeIcon(stage.iconName, 'w-5 h-5')}
                    </div>
                    <span className="text-[11px] font-bold text-accent uppercase tracking-wider">
                      {stage.subtitle}
                    </span>
                  </div>

                  {/* Stage Title */}
                  <h4 className="text-base sm:text-lg font-bold text-white mb-2 leading-snug group-hover:text-sky transition-colors">
                    {stage.title}
                  </h4>

                  {/* Stage Narrative Description */}
                  <p className="text-slate-300 text-xs leading-relaxed mb-4">
                    {stage.description}
                  </p>
                </div>

                {/* Key Quality & Compliance Check Points */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-3 mt-2">
                  <p className="text-[10px] font-bold text-sky uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <ShieldCheck className="w-3 h-3 text-accent shrink-0" />
                    <span>Quality Checkpoints:</span>
                  </p>
                  <ul className="space-y-1.5">
                    {qualityChecks.map((check, ci) => (
                      <li key={ci} className="flex items-center gap-2 text-[11px] text-slate-200">
                        <span className="w-1.5 h-1.5 rounded-xs bg-primary shrink-0" />
                        <span className="leading-tight font-medium">{check}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        {/* ============================================================= */}
        {/* 3. STEPPERS & INTERACTIVE ROADMAP CONTROLS                    */}
        {/* ============================================================= */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-white/15">
          {/* Previous Phase Button */}
          <button
            type="button"
            onClick={prevPhase}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-semibold transition-all border border-white/15 active:scale-95"
            aria-label="Kembali ke Fase Sebelumnya"
          >
            <ChevronLeft className="w-4 h-4 shrink-0" />
            <span>Fase Sebelumnya</span>
          </button>

          {/* Phase Dot Indicators & Label */}
          <div className="flex items-center gap-2 text-xs text-white/80">
            <span className="font-semibold text-sky uppercase tracking-wide">
              Fase {activePhaseIndex + 1} dari {PIPELINE_PHASES.length}
            </span>
            <div className="flex items-center gap-1.5 ml-1">
              {PIPELINE_PHASES.map((_, dotIdx) => (
                <button
                  key={dotIdx}
                  type="button"
                  onClick={() => setActivePhaseIndex(dotIdx)}
                  className={`h-2 transition-all rounded-full ${
                    dotIdx === activePhaseIndex
                      ? 'w-6 bg-accent'
                      : 'w-2 bg-white/25 hover:bg-white/50'
                  }`}
                  aria-label={`Buka Fase ${dotIdx + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Next Phase Button */}
          <button
            type="button"
            onClick={nextPhase}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-accent hover:bg-accent/90 text-white text-xs sm:text-sm font-bold shadow-md shadow-accent/25 transition-all active:scale-95"
            aria-label="Lanjut ke Fase Berikutnya"
          >
            <span>Fase Selanjutnya</span>
            <ChevronRight className="w-4 h-4 shrink-0" />
          </button>
        </div>

        {/* Regulatory Compliance Footnote Banner */}
        <div className="mt-8 p-3.5 rounded-xl bg-white/5 border border-white/10 text-center text-xs text-white/70">
          Every Haswakarya recruitment and placement stage runs transparently under the licence <strong>SIUKAK Kemenhub RI &amp; NIB 0702240024481</strong> and worker protection standard <strong>ILO MLC 2006 Regulation 1.4</strong>.
        </div>

      </div>
    </section>
  );
}
