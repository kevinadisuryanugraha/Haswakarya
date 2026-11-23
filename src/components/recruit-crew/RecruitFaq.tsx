'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle, MessageSquare } from 'lucide-react';
import { getWhatsAppUrl } from '@/data/haswakarya-data';

const FAQ_ITEMS = [
  {
    id: 'fees',
    question: 'What does Haswakarya charge for a crew requisition?',
    answer:
      'A single agency manning fee per placed crew member, quoted up front in your currency of choice and fixed for the contract duration. No registration fee, no shortlist fee, and no charge for replacements made inside the 14-day performance warranty.',
  },
  {
    id: 'speed',
    question: 'How fast is a shortlist returned?',
    answer:
      'For ranks already inside the verified pool, a first shortlist reaches your inbox within 30 minutes during WIB working hours. Rarer combinations — gas carrier engineers, DP-certified offshore crews, or flag endorsements we do not hold on file — typically take one to three working days because the endorsement has to be issued first.',
  },
  {
    id: 'vetting',
    question: 'How are candidates vetted before they are proposed?',
    answer:
      'Documents are checked against the originating registry: Seaman Book, passport, CoC and STCW certificates, DGST or ILO medical, and flag-state endorsements. Sea-time is reconciled with the discharge book, and the Marlins English result is verified within its 24-month validity. Only candidates with a clean verification pass are proposed.',
  },
  {
    id: 'nationality',
    question: 'Can you supply mixed-nationality or non-Indonesian crews?',
    answer:
      'The verified pool is Indonesian officers and ratings placed under SIUKAK. For mixed-nationality complements we can coordinate partner agencies under a joint manning agreement, and the requisition notes field is the right place to state the nationality mix your flag state or charterer requires.',
  },
  {
    id: 'warranty',
    question: 'What does the 14-day replacement warranty cover?',
    answer:
      'If a placed crew member fails your competency evaluation, the master’s handover assessment, or does not meet the medical and certification standard declared in the dossier, Haswakarya supplies a replacement at no additional agency fee. Travel and repatriation costs are handled case by case under the manning agreement.',
  },
  {
    id: 'data',
    question: 'Where is our requisition data stored?',
    answer:
      'Requisitions are stored in the H-COS database operated by Haswakarya and visible only to the crewing desk and superintendents handling your account. Each submission is written to the audit trail with timestamp and source address, so you can request the full record for your own compliance file.',
  },
];

export function RecruitFaq() {
  const [openId, setOpenId] = useState<string | null>('fees');

  return (
    <section id="faq" className="relative bg-white py-14 sm:py-18 lg:py-24">
      <div className="site-container">
        <div className="mb-8 sm:mb-10">
          <div className="soe-tag mb-4">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Principal FAQ</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-navy mb-3">
            What shipowners ask before the first requisition
          </h2>
          <p className="text-sm text-slate-600">
            Still unsure about vetting or warranty terms? Talk to the crewing desk directly.
          </p>
        </div>

        <div className="divide-y divide-slate-200 border-y border-slate-200">
          {FAQ_ITEMS.map((item) => {
            const isOpen = openId === item.id;
            return (
              <div key={item.id}>
                <h3>
                  <button
                    type="button"
                    onClick={() => setOpenId(isOpen ? null : item.id)}
                    aria-expanded={isOpen}
                    aria-controls={`recruit-faq-panel-${item.id}`}
                    id={`recruit-faq-button-${item.id}`}
                    className="w-full flex items-start justify-between gap-4 py-4 text-left cursor-pointer group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-md"
                  >
                    <span
                      className={`text-sm sm:text-base font-bold transition-colors ${
                        isOpen ? 'text-primary' : 'text-navy group-hover:text-primary'
                      }`}
                    >
                      {item.question}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 mt-0.5 shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-primary' : 'text-slate-400'
                      }`}
                    />
                  </button>
                </h3>
                <div
                  id={`recruit-faq-panel-${item.id}`}
                  role="region"
                  aria-labelledby={`recruit-faq-button-${item.id}`}
                  hidden={!isOpen}
                  className="pb-5 pr-8"
                >
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{item.answer}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
          <div>
            <p className="text-sm font-bold text-navy">Need a direct answer?</p>
            <p className="text-xs text-slate-600 mt-0.5">
              The crewing desk answers requisition questions on WIB working hours, with WhatsApp
              fallback for urgent crew-change windows.
            </p>
          </div>
          <a
            href={getWhatsAppUrl(
              'Halo Haswakarya Crew Agency, saya ingin bertanya tentang requisition kru untuk armada kami.',
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shrink-0"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Chat the crewing desk</span>
          </a>
        </div>
      </div>
    </section>
  );
}

export default RecruitFaq;