import React from 'react';
import { CheckCircle2, FileCheck2, ShieldCheck, Ship, Users2 } from 'lucide-react';

const STEPS = [
  {
    code: '01',
    icon: Ship,
    title: 'Requisition registered',
    description:
      'Submit vessel particulars, rank matrix, flag state, and target joining date. The request lands in the H-COS requisition queue with a reference number you can forward internally.',
  },
  {
    code: '02',
    icon: Users2,
    title: 'Deterministic shortlist',
    description:
      'Our matrix matcher ranks the verified pool against your rank matrix — CoC class, documented sea-time, vessel-type experience, Marlins score, and availability window, in that order.',
  },
  {
    code: '03',
    icon: ShieldCheck,
    title: 'Document & vetting verification',
    description:
      'Seaman Book, passport, STCW, DGST/ILO medical, and flag-state endorsements are checked against the issuing registry before a name reaches your inbox.',
  },
  {
    code: '04',
    icon: FileCheck2,
    title: 'Mobilization & warranty',
    description:
      'We coordinate ticketing, joining instructions, and contract signing, then hold a 14-day replacement warranty after the crew member boards.',
  },
];

const DELIVERABLES = [
  'Ranked shortlist with CoC class, sea-time, Marlins score, and last vessel type',
  'Wage scale and manning rate sheet in your currency of choice',
  'Mobilization plan: joining port, flight routing, visa, and crew change window',
  'Compliance pack — SIUKAK, NIB, MLC 2006 declaration, and insurance certificates',
];

export function RecruitProcess() {
  return (
    <section id="matching" className="relative bg-white py-14 sm:py-18 lg:py-24">
      <div className="absolute inset-0 bg-grain opacity-40 pointer-events-none" aria-hidden="true" />

      <div className="relative site-container">
        <div className="max-w-3xl mb-10 sm:mb-14">
          <div className="soe-tag mb-4">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Requisition Pipeline</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-navy mb-4">
            Four stages between your requisition and a boarded crew
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            The same audited sequence runs for every owner, whether you need the top four officers on
            one tanker or a full complement for a feeder fleet.
          </p>
        </div>

        <ol className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-12 sm:mb-16">
          {STEPS.map(({ code, icon: Icon, title, description }) => (
            <li key={code} className="horizonx-card rounded-2xl p-5 sm:p-6 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono text-2xl font-extrabold text-primary/25">{code}</span>
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-ice text-primary">
                  <Icon className="w-5 h-5" />
                </span>
              </div>
              <h3 className="text-base font-bold text-navy mb-2 leading-snug">{title}</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{description}</p>
            </li>
          ))}
        </ol>

        <div className="rounded-3xl border border-slate-200 bg-surface p-6 sm:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-6 lg:gap-10 items-start">
            <div>
              <div className="soe-tag mb-4">
                <FileCheck2 className="w-3.5 h-3.5" />
                <span>Shortlist Packet</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight text-navy mb-3">
                What reaches your inbox
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Every proposal is a decision-ready document, not a CV dump. Numbers come from our
                matrix evaluation, so the same inputs always produce the same ranking.
              </p>
            </div>

            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {DELIVERABLES.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 leading-relaxed">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

export default RecruitProcess;