import React from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronRight, ShieldCheck, BadgeCheck, Anchor, Clock } from 'lucide-react';

const TRUST_CHIPS = [
  '100% Zero Placement Fee',
  'SIUKAK KEMENHUB RI Certified',
  'MLC 2006 Compliant',
];

const HERO_FACTS = [
  { icon: Clock, label: 'Dossier review', value: '24 hours' },
  { icon: Anchor, label: 'Vessel types', value: '5 fleets' },
  { icon: BadgeCheck, label: 'Selection pipeline', value: '9 stages' },
];

export function JoinHero() {
  return (
    <section id="hero" className="relative overflow-hidden bg-[#06122A]">
      <div className="absolute inset-0 bg-grain opacity-35 pointer-events-none" aria-hidden="true" />

      <div className="relative site-container pt-28 sm:pt-36 lg:pt-40 pb-14 sm:pb-20 lg:pb-24">
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-300">
            <li>
              <Link href="/" className="hover:text-ice transition-colors">
                Home
              </Link>
            </li>
            <li aria-hidden="true">
              <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
            </li>
            <li className="text-sky" aria-current="page">
              Join as Crew
            </li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-[1.35fr_1fr] gap-10 lg:gap-14 items-start">
          <div>
            <div className="soe-tag soe-tag-dark mb-5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Official Crewing Division &bull; H-COS</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-[1.12] mb-5">
              Join the crew behind{' '}
              <span className="block text-sky mt-2">every safe voyage</span>
            </h1>

            <p className="text-slate-200 text-sm sm:text-base lg:text-lg leading-relaxed max-w-2xl mb-8">
              Haswakarya places Indonesian seafarers on internationally trading tankers, bulk
              carriers, container ships, tugboats, and offshore vessels. Submit one verified dossier
              and our crewing desk maps you to fleets that match your CoC, sea-time, and Marlins
              benchmark.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <Link
                href="#apply"
                className="shimmer-btn inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-primary text-white font-bold text-sm shadow-lg hover:bg-primary-dark transition-colors cursor-pointer"
              >
                <span>Start my application</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="#process"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white/10 border border-white/25 text-white font-semibold text-sm hover:bg-white/15 transition-colors cursor-pointer"
              >
                <span>See the selection process</span>
              </Link>
            </div>

            <ul className="flex flex-wrap gap-2">
              {TRUST_CHIPS.map((chip) => (
                <li
                  key={chip}
                  className="inline-flex items-center gap-1.5 rounded-md bg-white/10 border border-white/20 px-2.5 py-1.5 text-[11px] font-semibold text-ice"
                >
                  <BadgeCheck className="w-3.5 h-3.5 text-sky shrink-0" />
                  <span>{chip}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="horizonx-card-dark rounded-2xl p-5 sm:p-6">
            <p className="text-[11px] font-bold uppercase tracking-wider text-sky mb-4">
              What happens after you apply
            </p>
            <dl className="space-y-3">
              {HERO_FACTS.map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center justify-between gap-3">
                  <dt className="flex items-center gap-2 text-xs text-slate-300">
                    <Icon className="w-4 h-4 text-sky shrink-0" />
                    <span>{label}</span>
                  </dt>
                  <dd className="font-mono text-sm font-bold text-white">{value}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-5 border-t border-white/10 pt-4 text-[11px] leading-relaxed text-slate-300">
              No agent fees, no deposit, no&nbsp;broker chain. Your data is processed only by the
              Haswakarya crewing desk under Permenhub PM 59/2021 and ILO MLC 2006 Reg 1.4.5.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default JoinHero;