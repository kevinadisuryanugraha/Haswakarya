'use client';

import React from 'react';
import { STATS_DATA, QUICK_NAV_CARDS } from '@/data/haswakarya-data';
import { 
  ArrowRight, Anchor, Users, FileCheck, Headphones
} from 'lucide-react';
import { getMaritimeIcon } from '@/lib/icons';

export function StatsOverlap() {
  const statIcons = ['CheckCircle2', 'Shield', 'Clock', 'Building2'];

  return (
    <section 
      aria-label="Haswakarya Key Metrics & Compliance Standards" 
      className="relative z-20 px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-12 md:-mt-16 lg:-mt-20 transition-all"
    >
      <div className="max-w-6xl mx-auto">
        <div className="bg-navy border border-white/20 rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden">
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-white/10">
            {STATS_DATA.map((stat, idx) => (
              <div
                key={stat.id}
                className="p-4 sm:p-6 lg:p-8 flex flex-col items-center text-center group relative overflow-hidden hover:bg-white/[0.04] transition-colors duration-300"
              >
                {/* Icon */}
                <div className="mb-2 sm:mb-3 text-sky group-hover:text-ice transition-all duration-300">
                  {getMaritimeIcon(statIcons[idx] ?? 'CheckCircle2', 'w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7')}
                </div>

                {/* Metric Value with Monospace Precision */}
                <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight mb-1 group-hover:text-ice transition-colors duration-300 font-mono">
                  {stat.value}
                </div>

                {/* Metric Label */}
                <div className="text-ice font-bold text-xs sm:text-sm mb-0.5 sm:mb-1">
                  {stat.label}
                </div>

                {/* Subtitle / Standard with Enhanced Outdoor Contrast */}
                <div className="text-slate-200 text-[11px] sm:text-xs leading-tight font-semibold">
                  {stat.sub}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function QuickNavCards() {
  const cardIcons: Record<string, React.ReactNode> = {
    'owners-principals': <Anchor className="w-7 h-7 sm:w-8 sm:h-8" />,
    'seafarers-careers': <Users className="w-7 h-7 sm:w-8 sm:h-8" />,
    'legal-verification': <FileCheck className="w-7 h-7 sm:w-8 sm:h-8" />,
    'operations-support': <Headphones className="w-7 h-7 sm:w-8 sm:h-8" />,
  };

  return (
    <section className="py-14 sm:py-18 lg:py-24 px-4 sm:px-6 lg:px-8 bg-surface relative overflow-hidden">
      {/* Grainient subtle texture */}
      <div className="absolute inset-0 pointer-events-none bg-grain opacity-40 z-0" aria-hidden="true" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Section Heading */}
        <div className="text-center mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-3 shadow-xs">
            Strategic Gateway
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-navy mb-3 sm:mb-4 tracking-tight">
            Direct Gateways for Shipowners &amp; Seafarers
          </h2>
          <p className="text-muted text-sm sm:text-base lg:text-lg max-w-2xl mx-auto leading-relaxed">
            Dedicated operational pathways structured for immediate fleet manning inquiries, verified compliance auditing, and certified mariner career advancement.
          </p>
        </div>

        {/* Cards Grid with HorizonX card elevation */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {QUICK_NAV_CARDS.map((card) => (
            <a
              key={card.id}
              href={card.href}
              className="horizonx-card rounded-2xl p-5 sm:p-6 flex flex-col group relative overflow-hidden"
            >
              {/* Badge */}
              <span className="soe-tag self-start mb-3 sm:mb-4 text-[10px] sm:text-xs tracking-wider uppercase font-bold">
                {card.badge}
              </span>

              {/* Icon */}
              <div className="text-primary mb-3 sm:mb-4 group-hover:text-accent group-hover:scale-110 transition-all duration-300">
                {cardIcons[card.id] ?? <Anchor className="w-8 h-8" />}
              </div>

              {/* Content */}
              <h3 className="text-navy font-bold text-base sm:text-lg leading-snug mb-2 group-hover:text-primary transition-colors duration-300">
                {card.title}
              </h3>
              <p className="text-muted text-xs sm:text-sm leading-relaxed flex-grow mb-4">
                {card.description}
              </p>

              {/* CTA link with corner arrow */}
              <div className="flex items-center gap-2 text-primary font-bold text-xs sm:text-sm group-hover:text-accent transition-colors duration-300 pt-2 border-t border-slate-100">
                <span>{card.ctaText}</span>
                <ArrowRight className="w-4 h-4 corner-arrow group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
