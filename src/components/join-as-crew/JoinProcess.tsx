import React from 'react';
import { FileText, ShieldCheck, Users2, ArrowRight, CheckCircle2 } from 'lucide-react';
import { SEAFARER_QUALIFICATIONS } from '@/data/haswakarya-data';
import { getMaritimeIcon } from '@/lib/icons';

const STEPS = [
  {
    code: '01',
    icon: FileText,
    title: 'Submit one verified dossier',
    description:
      'Complete the form below with your rank, CoC class, Marlins benchmark, documented sea-time, and readiness date. One submission keeps your profile in the H-COS talent pool.',
  },
  {
    code: '02',
    icon: ShieldCheck,
    title: 'Document verification & Marlins test',
    description:
      'Our crewing desk validates your Seaman Book, passport, and STCW certificates against national registries, then schedules the standardized Marlins English assessment.',
  },
  {
    code: '03',
    icon: Users2,
    title: 'Technical interview & vessel matching',
    description:
      'A structured interview with our marine team follows. Your dossier is then mapped to live principal requisitions across tanker, bulk, container, tug, and offshore fleets.',
  },
];

export function JoinProcess() {
  return (
    <section id="process" className="relative bg-white py-14 sm:py-18 lg:py-24">
      <div className="absolute inset-0 bg-grain opacity-40 pointer-events-none" aria-hidden="true" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-10 sm:mb-14">
          <div className="soe-tag mb-4">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Selection Pipeline</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-navy mb-4">
            Three stages between your dossier and the gangway
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Every application passes the same audited sequence. No shortcut, no broker chain, no
            placement fee at any stage.
          </p>
        </div>

        <ol className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-14 sm:mb-18">
          {STEPS.map(({ code, icon: Icon, title, description }) => (
            <li key={code} className="horizonx-card rounded-2xl p-5 sm:p-6 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono text-2xl font-extrabold text-primary/25">{code}</span>
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-ice text-primary">
                  <Icon className="w-5 h-5" />
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-navy mb-2 leading-snug">{title}</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{description}</p>
            </li>
          ))}
        </ol>

        <div id="requirements" className="scroll-mt-28">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
            <div>
              <div className="soe-tag mb-3">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>What We Screen For</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-navy">
                Five non-negotiables on every Haswakarya vessel
              </h3>
            </div>
            <p className="text-xs text-slate-500 max-w-xs sm:text-right">
              Derived from owner vetting feedback, SIRE observations, and MLC 2006 requirements.
            </p>
          </div>

          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {SEAFARER_QUALIFICATIONS.map((qualification) => (
              <li
                key={qualification.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 flex gap-3.5"
              >
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-ice text-primary">
                  {getMaritimeIcon(qualification.iconName, 'w-5 h-5')}
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] font-bold text-primary/60">
                      {String(qualification.number).padStart(2, '0')}
                    </span>
                    <h4 className="text-sm font-bold text-navy leading-snug">{qualification.title}</h4>
                  </div>
                  <p className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    {qualification.category}
                  </p>
                  <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                    {qualification.criteria[0]}
                  </p>
                </div>
              </li>
            ))}

            <li className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 flex flex-col justify-between">
              <div>
                <h4 className="text-sm font-bold text-emerald-900 mb-1.5">
                  Zero Placement Fee, guaranteed
                </h4>
                <p className="text-xs text-emerald-800 leading-relaxed">
                  Sesuai Permenhub PM 59/2021 dan ILO MLC 2006 Reg 1.4.5, pelaut tidak dipungut
                  biaya pendaftaran, deposit, maupun komisi penempatan.
                </p>
              </div>
              <a
                href="#apply"
                className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-900 transition-colors"
              >
                <span>Continue to the application form</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}

export default JoinProcess;