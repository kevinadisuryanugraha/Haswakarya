"use client";

import dynamic from 'next/dynamic';

const FleetManningInquiryModal = dynamic(
  () => import("./FleetManningInquiryModal").then((m) => m.FleetManningInquiryModal),
  { ssr: false }
);
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Ship,
  Users,
  ShieldCheck,
  CheckCircle2,
  Anchor,
  Compass,
} from "lucide-react";
import { COMPANY_INFO, getWhatsAppUrl } from "@/data/haswakarya-data";

export interface HeroSliderProps {
  // Retained interface for backward compatibility
  autoplayDuration?: number;
}

export const HeroSlider: React.FC<HeroSliderProps> = () => {
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);

  return (
    <section
      aria-label="Haswakarya Maritime Crew Agency Sovereign Hero"
      className="relative bg-navy text-white min-h-[85vh] lg:min-h-[90vh] flex items-center overflow-hidden"
    >
      {/* ------------------------------------------------------------- */}
      {/* Layer 1: Full-Bleed Realistic Maritime Ocean Vessel Photo      */}
      {/* ------------------------------------------------------------- */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/hero-bg-maritime.jpg"
          alt="International commercial cargo container vessel sailing in deep ocean waters"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />

        {/* Left-Heavy Dark Gradient Overlay: High Contrast for Text on Left, Lets Ship Breathe on Right */}
        <div
          className="absolute inset-0 bg-gradient-to-r from-navy via-navy/90 to-navy/35 hidden lg:block"
          aria-hidden="true"
        />

        {/* Mobile / Tablet Uniform Contrast Overlay */}
        <div
          className="absolute inset-0 bg-navy/85 lg:hidden"
          aria-hidden="true"
        />

        {/* Grainient Analog Texture Overlay (Zero AI Plasticity) */}
        <div
          className="absolute inset-0 bg-grain opacity-35 pointer-events-none"
          aria-hidden="true"
        />
      </div>

      {/* ------------------------------------------------------------- */}
      {/* Layer 2: Signature SOE Angled Maritime Accent Geometry        */}
      {/* ------------------------------------------------------------- */}
      <svg
        className="absolute bottom-0 left-0 w-full pointer-events-none z-1 opacity-20 hidden md:block"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1440 661"
        fill="none"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path d="M1440 0L1440 661H0L1440 0Z" fill="#407997" />
      </svg>

      {/* ------------------------------------------------------------- */}
      {/* Layer 3: Main Calm Sovereign Content Container                */}
      {/* ------------------------------------------------------------- */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10 w-full pt-28 sm:pt-36 lg:pt-40 pb-20 sm:pb-28 lg:pb-36">
        <div className="max-w-3xl lg:max-w-3xl">
          
          {/* Institutional Government & Regulatory Accreditation Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md bg-white/10 border border-white/20 text-sky text-xs font-semibold tracking-wide mb-6 shadow-sm">
            <ShieldCheck className="w-4 h-4 text-sky shrink-0" />
            <span className="font-bold text-white tracking-wider">
              PT HASWAKARYA ANDALAN SEDARE
            </span>
            <span className="text-white/40 hidden sm:inline">•</span>
            <span className="text-sky font-medium hidden sm:inline">
              SIUKAK KEMENHUB RI &amp; NIB 0702240024481
            </span>
          </div>

          {/* Monumental Primary H1 Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-6xl xl:text-7xl font-extrabold tracking-tight text-white mb-5 leading-[1.1] drop-shadow-md">
            {COMPANY_INFO.brandName}
            <span className="block text-sky text-xl sm:text-2xl md:text-3xl lg:text-3xl font-medium mt-3 leading-snug drop-shadow-sm">
              Connecting Indonesia&apos;s Finest Seafarers with World-Class Fleets
            </span>
          </h1>

          {/* Authoritative Core Narrative / Value Proposition */}
          <p className="text-slate-200 text-base sm:text-lg lg:text-xl font-normal leading-relaxed max-w-2xl mb-8 sm:mb-10 text-balance drop-shadow">
            Your Trusted Global Crew Manning Partner. Managing recruitment with
            uncompromising integrity, DGST/Marlins verification, full MLC 2006
            compliance, and dedicated 24/7 owner support across international
            waters.
          </p>

          {/* Dual Strategic Action Buttons (Ship Owners & Seafarers) */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 sm:gap-4 mb-10">
            {/* Primary Coral Button for Ship Owners & Principals: Opens Direct Requisition Console */}
            <button
              type="button"
              onClick={() => setIsInquiryOpen(true)}
              className="shimmer-btn inline-flex items-center justify-center gap-2.5 px-7 py-3.5 sm:py-4 text-sm sm:text-base font-bold text-white bg-accent hover:bg-accent/90 rounded-xl shadow-lg shadow-accent/25 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 group text-center whitespace-nowrap cursor-pointer"
            >
              <Ship className="w-5 h-5 group-hover:scale-110 transition-transform shrink-0" />
              <span className="whitespace-nowrap">Request Qualified Crew</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform shrink-0" />
            </button>

            {/* Outline Action Button for Seafarers Career Portal */}
            <Link
              href="/join-as-crew"
              className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 sm:py-4 text-sm sm:text-base font-bold text-ice hover:text-white border-2 border-primary bg-primary/20 hover:bg-primary/40 hover:border-sky rounded-xl shadow-sm hover:-translate-y-0.5 transition-all duration-200 group text-center whitespace-nowrap"
            >
              <Users className="w-5 h-5 group-hover:scale-110 transition-transform shrink-0" />
              <span className="whitespace-nowrap">Apply as Seafarer</span>
            </Link>
          </div>

          {/* Institutional Trust & Compliance Row (Zero Clutter) */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-6 border-t border-white/15 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-semibold text-white">SIUKAK Kemenhub RI</span>
              <span className="text-white/50 text-[11px] hidden xs:inline">Authorized Agency</span>
            </div>

            <span className="text-white/20 hidden sm:inline">•</span>

            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-semibold text-white">ILO MLC 2006</span>
              <span className="text-white/50 text-[11px] hidden xs:inline">Reg 1.4 Compliant</span>
            </div>

            <span className="text-white/20 hidden sm:inline">•</span>

            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-semibold text-white">DGST &amp; Marlins</span>
              <span className="text-white/50 text-[11px] hidden xs:inline">Vetted Pool</span>
            </div>
          </div>

        </div>
      </div>

      {/* Direct Principal Crewing Requisition Console */}
      <FleetManningInquiryModal
        isOpen={isInquiryOpen}
        onClose={() => setIsInquiryOpen(false)}
        defaultVesselType="Oil & Chemical Tanker (SIRE)"
      />
    </section>
  );
};

export default HeroSlider;
