'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle, MessageSquare } from 'lucide-react';
import { getWhatsAppUrl } from '@/data/haswakarya-data';

const FAQ_ITEMS = [
  {
    id: 'fees',
    question: 'Do I have to pay anything to apply or to be placed?',
    answer:
      'No. Haswakarya operates a 100% zero placement fee policy under Permenhub PM 59/2021 and ILO MLC 2006 Reg 1.4.5. Application, Marlins testing, medical coordination, and deployment processing carry no charge to the seafarer. Any party requesting payment on our behalf should be reported to our crewing desk immediately.',
  },
  {
    id: 'documents',
    question: 'Which documents should I prepare before the interview?',
    answer:
      'Bring your Seaman Book (Buku Pelaut), valid passport, CoC and STCW basic safety certificates, DGST/ILO medical certificate, Marlins result if already taken, and the latest discharge book or sea-service testimonials. Scanned copies are enough for stage two; originals are verified before any contract is signed.',
  },
  {
    id: 'marlins',
    question: 'Is the Marlins English test mandatory?',
    answer:
      'Yes for every rank we place. If you already hold a Marlins result issued within the last 24 months we accept it during verification; otherwise our desk schedules the standardized assessment after document screening. Ratings and officers take the same benchmark because owner vetting requires it fleet-wide.',
  },
  {
    id: 'timeline',
    question: 'How fast will I hear back after submitting the form?',
    answer:
      'Your dossier is reviewed within 24 working hours. Document verification and the Marlins stage typically complete inside a week, then interviews are scheduled against live requisitions. Your profile stays active in the H-COS talent pool, so you may be contacted later for a vessel matching your rank and sea-time.',
  },
];

export function JoinFaq() {
  const [openId, setOpenId] = useState<string | null>('fees');

  return (
    <section id="faq" className="relative bg-white py-14 sm:py-18 lg:py-24">
      <div className="site-container">
        <div className="mb-8 sm:mb-10">
          <div className="soe-tag mb-4">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Applicant FAQ</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-navy mb-3">
            Questions seafarers ask before applying
          </h2>
          <p className="text-sm text-slate-600">
            Still unsure about a requirement? Talk to the crewing desk directly.
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
                    aria-controls={`join-faq-panel-${item.id}`}
                    id={`join-faq-button-${item.id}`}
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
                  id={`join-faq-panel-${item.id}`}
                  role="region"
                  aria-labelledby={`join-faq-button-${item.id}`}
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
              The crewing hotline is staffed on WIB working hours, with WhatsApp fallback for urgent
              document questions.
            </p>
          </div>
          <a
            href={getWhatsAppUrl(
              'Halo Haswakarya Crew Agency, saya ingin bertanya tentang proses pendaftaran pelaut.',
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

export default JoinFaq;