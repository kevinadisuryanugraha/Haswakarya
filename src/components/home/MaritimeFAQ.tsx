'use client';

import React, { useState } from 'react';
import {
  HelpCircle,
  ChevronDown,
  Ship,
  Users,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Phone,
  FileCheck2,
} from 'lucide-react';
import { COMPANY_INFO, getWhatsAppUrl } from '@/data/haswakarya-data';

interface FAQItem {
  id: string;
  category: 'owners' | 'seafarers';
  question: string;
  answer: string;
  badge: string;
}

export const FAQ_DATA: FAQItem[] = [
  // ==========================================
  // SHIPOWNERS & PRINCIPALS
  // ==========================================
  {
    id: 'owner-mobilization',
    category: 'owners',
    badge: 'Mobilization Speed',
    question: 'How fast can Haswakarya mobilize emergency crew replacements in Southeast Asia?',
    answer:
      'For Southeast Asian ports (Singapore OPL, Batam, Tanjung Priok, Port Klang), we can mobilize pre-vetted ready-to-board officers and ratings within 24 to 72 hours. Our strategic dual hubs in Batam (adjacent to Singapore) and Jakarta maintain an active standby pool with valid medicals, transit visas, and flag state endorsements.',
  },
  {
    id: 'owner-warranty',
    category: 'owners',
    badge: '14-Day Warranty',
    question: 'What performance guarantee does Haswakarya provide if a crew member underperforms?',
    answer:
      'We provide a contractual 14-Day Performance & Medical Warranty. If any crew member fails to meet the technical competency standards agreed with the Principal or develops a disqualifying medical condition within 14 days of embarkation, Haswakarya supplies an immediate qualified replacement at zero additional agency service fee.',
  },
  {
    id: 'owner-vetting',
    category: 'owners',
    badge: 'SIRE & RightShip',
    question: 'Does Haswakarya screen crew according to OCIMF SIRE 2.0 and RightShip matrix guidelines?',
    answer:
      'Yes. For tanker fleets, officers are vetted strictly against OCIMF SIRE 2.0 experience matrices (minimum combined sea-time for Master + Chief Officer and Chief Engineer + 2nd Engineer). For bulk carriers, vetting complies with RightShip Dry Inspection Standards and IMSBC cargo care protocols.',
  },
  {
    id: 'owner-mlc',
    category: 'owners',
    badge: 'MLC 2006 Reg 1.4',
    question: 'How does Haswakarya protect vessel operators against Port State Control (PSC) detentions?',
    answer:
      'All Haswakarya crew contracts are formulated under standard Tripartite PKL agreements endorsed by Indonesian Syahbandar and comply strictly with ILO MLC 2006 Regulation 1.4. We verify P&I Club repatriation insurance, flag state endorsements, and medical fitness certificates (DGST approved), guaranteeing 100% legal protection during PSC inspections worldwide.',
  },
  {
    id: 'owner-salary',
    category: 'owners',
    badge: 'Payroll & Remittance',
    question: 'Can Haswakarya manage all-inclusive crew payroll and family remittances in Indonesia?',
    answer:
      'Yes. We offer turnkey crew payroll management, including direct multi-currency wire transfers, compliant seafarer allotments/family remittances through Indonesian central banking rails, and tax administration with transparent financial auditing.',
  },
  {
    id: 'owner-custom-matrix',
    category: 'owners',
    badge: 'Tailored Fleets',
    question: 'Can Principals conduct direct live video interviews and technical assessments before hiring?',
    answer:
      'Absolutely. After our Master Mariner panel completes initial screening (DGST verification, Marlins English test, and psychological evaluation), the shortlisted candidates are presented with complete digital dossiers for direct live video interview and final rank authorization by the shipowner.',
  },

  // ==========================================
  // SEAFARERS & CANDIDATES
  // ==========================================
  {
    id: 'crew-zero-fee',
    category: 'seafarers',
    badge: 'Ethical Charter',
    question: 'Apakah ada pungutan biaya pendaftaran, administrasi, atau penempatan untuk pelaut?',
    answer:
      'SAMA SEKALI TIDAK ADA (100% GRATIS). Berdasarkan ILO MLC 2006 Regulation 1.4.5 dan Pasal 36 Permenhub RI No. PM 59/2021 (SIUKAK), PT Haswakarya Andalan Sedare melarang keras segala bentuk pungutan biaya rekrutmen atau penempatan kepada pelaut. Seluruh biaya penempatan dan keagenan ditanggung sepenuhnya oleh Shipowner resmi.',
  },
  {
    id: 'crew-marlins',
    category: 'seafarers',
    badge: 'Standar Marlins',
    question: 'Berapa standar nilai Marlins English Test yang disyaratkan untuk bergabung?',
    answer:
      'Untuk perwira (Deck & Engine Officers: Management & Operational Level), skor minimal Marlins adalah 80%. Untuk rating (AB, Oiler, Bosun, Cook), standar minimal adalah 70%. Jika nilai Marlins Anda belum memenuhi atau kedaluwarsa, kami menyediakan fasilitas pengujian persiapan di kantor kami.',
  },
  {
    id: 'crew-pkl',
    category: 'seafarers',
    badge: 'Legalitas PKL',
    question: 'Bagaimana keabsahan kontrak kerja laut (PKL) dan perlindungan asuransi kru?',
    answer:
      'Setiap pelaut Haswakarya menandatangani Perjanjian Kerja Laut (PKL) berstandar Tripartit resmi yang disahkan oleh Pejabat Syahbandar/KSOP Kemenhub RI. Hak gaji, uang lembur, jaminan asuransi kesehatan, dan asuransi P&I Club untuk repatriasi darurat terjamin secara hukum internasional.',
  },
  {
    id: 'crew-medical',
    category: 'seafarers',
    badge: 'Medical Check-Up',
    question: 'Di klinik mana pelaut harus melakukan pemeriksaan kesehatan (MCU)?',
    answer:
      'Medical Check-Up wajib dilakukan di Balai Kesehatan Kerja Pelayaran (BKKP) atau rumah sakit/laboratorium medis yang memiliki akreditasi resmi Kemenhub RI (DGST Approved) serta disetujui oleh negara bendera kapal (Flag State). MCU meliputi tes bebas narkoba/alkohol dan uji fisik kelayakan laut.',
  },
  {
    id: 'crew-sea-time',
    category: 'seafarers',
    badge: 'Pengalaman Berlayar',
    question: 'Apakah pelaut dengan jam layar terbatas atau rating pemula bisa mendaftar?',
    answer:
      'Bisa. Walaupun posisi perwira senior membutuhkan riwayat jam layar (sea-time) minimal 12–24 bulan di tipe kapal sejenis, Haswakarya juga membuka rekrutmen untuk perwira junior, cadet berprestasi, dan rating berpengalaman (AB/Oiler/Cook) yang memiliki sertifikat STCW 2010 lengkap dan sikap profesional.',
  },
  {
    id: 'crew-salary-pay',
    category: 'seafarers',
    badge: 'Kepastian Gaji',
    question: 'Bagaimana kepastian pembayaran gaji bulanan dan pengiriman uang ke keluarga?',
    answer:
      'Gaji dibayarkan tepat waktu secara langsung melalui transfer bank resmi (allotment transfer) sesuai klausul PKL MLC 2006. Pelaut dapat mengatur alokasi pengiriman uang bulanan langsung ke rekening keluarga di Indonesia tanpa potongan yang tidak sah.',
  },
];

export function MaritimeFAQ() {
  const [activeCategory, setActiveCategory] = useState<'owners' | 'seafarers'>('owners');
  const [openAccordionId, setOpenAccordionId] = useState<string | null>('owner-mobilization');

  const filteredFAQs = FAQ_DATA.filter((faq) => faq.category === activeCategory);

  const toggleAccordion = (id: string) => {
    setOpenAccordionId(openAccordionId === id ? null : id);
  };

  return (
    <section
      id="faq"
      className="py-16 sm:py-20 lg:py-28 bg-surface relative overflow-hidden scroll-mt-24 md:scroll-mt-28"
      aria-label="Frequently Asked Questions on Crew Manning & Maritime Compliance"
    >
      {/* Grainient Analog Texture Overlay */}
      <div className="absolute inset-0 pointer-events-none bg-grain opacity-40 z-0" aria-hidden="true" />

      <div className="site-container relative z-10">
        
        {/* ============================================================= */}
        {/* Section Header                                                */}
        {/* ============================================================= */}
        <div className="text-center mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-3 sm:mb-4 shadow-xs">
            <HelpCircle className="w-3.5 h-3.5 text-primary shrink-0" />
            <span>Compliance &amp; Operational Knowledge Base</span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-navy mb-3 tracking-tight">
            Frequently Asked Questions
          </h2>

          <p className="text-muted text-sm sm:text-base lg:text-lg max-w-2xl mx-auto leading-relaxed">
            Essential answers on emergency mobilization, 14-day warranty, zero placement fee policy, and international maritime regulatory compliance.
          </p>
        </div>

        {/* ============================================================= */}
        {/* Category Filter Tabs (Shipowners vs Seafarers)                */}
        {/* ============================================================= */}
        <div
          className="flex justify-center mb-8 sm:mb-10"
          role="tablist"
          aria-label="FAQ Audience Selection"
        >
          <div className="inline-flex p-1.5 bg-white rounded-2xl border border-slate-200/80 shadow-md max-w-md w-full">
            <button
              type="button"
              role="tab"
              aria-selected={activeCategory === 'owners'}
              onClick={() => {
                setActiveCategory('owners');
                setOpenAccordionId('owner-mobilization');
              }}
              className={`flex-1 py-2.5 sm:py-3 px-3 sm:px-5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
                activeCategory === 'owners'
                  ? 'bg-navy text-white shadow-md'
                  : 'text-slate-600 hover:text-navy hover:bg-slate-50'
              }`}
            >
              <Ship className="w-4 h-4 text-sky shrink-0" />
              <span>For Shipowners</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeCategory === 'seafarers'}
              onClick={() => {
                setActiveCategory('seafarers');
                setOpenAccordionId('crew-zero-fee');
              }}
              className={`flex-1 py-2.5 sm:py-3 px-3 sm:px-5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
                activeCategory === 'seafarers'
                  ? 'bg-navy text-white shadow-md'
                  : 'text-slate-600 hover:text-navy hover:bg-slate-50'
              }`}
            >
              <Users className="w-4 h-4 text-accent shrink-0" />
              <span>Untuk Pelaut</span>
            </button>
          </div>
        </div>

        {/* ============================================================= */}
        {/* Accordion Questions List                                      */}
        {/* ============================================================= */}
        <div className="space-y-3.5 mb-10 sm:mb-14">
          {filteredFAQs.map((faq) => {
            const isOpen = openAccordionId === faq.id;

            return (
              <div
                key={faq.id}
                className={`rounded-2xl border transition-all duration-300 overflow-hidden bg-white ${
                  isOpen
                    ? 'border-primary shadow-lg ring-1 ring-primary/20'
                    : 'border-slate-200/80 hover:border-slate-300 shadow-xs'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleAccordion(faq.id)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${faq.id}`}
                  className="w-full text-left p-4 sm:p-6 flex items-start justify-between gap-4 cursor-pointer group"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-primary px-2 py-0.5 rounded bg-primary/10">
                        {faq.badge}
                      </span>
                    </div>

                    <h3 className="text-sm sm:text-base font-bold text-navy group-hover:text-primary transition-colors leading-snug">
                      {faq.question}
                    </h3>
                  </div>

                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-transform duration-300 mt-1 ${
                      isOpen
                        ? 'bg-primary text-white rotate-180'
                        : 'bg-slate-100 text-slate-500 group-hover:bg-ice group-hover:text-primary'
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {/* Animated Answer Body using Grid CSS */}
                <div
                  id={`faq-answer-${faq.id}`}
                  className={`grid transition-all duration-300 ease-in-out px-4 sm:px-6 ${
                    isOpen ? 'grid-rows-[1fr] opacity-100 pb-5 sm:pb-6' : 'grid-rows-[0fr] opacity-0 pb-0'
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="pt-3 border-t border-slate-100 text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {faq.answer}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ============================================================= */}
        {/* Unanswered Questions Callout Banner                           */}
        {/* ============================================================= */}
        <div className="horizonx-card-dark rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 border border-white/15">
          <div className="text-center sm:text-left">
            <span className="text-[10px] font-mono uppercase font-bold text-sky tracking-wider block mb-1">
              Have Specific Fleet Inquiries?
            </span>
            <h4 className="text-base sm:text-lg font-bold text-white mb-1">
              Speak Directly with Our Senior Crewing Superintendents
            </h4>
            <p className="text-slate-300 text-xs leading-relaxed max-w-md">
              We provide tailored consultation on wage scales, flag state dispensations, and turnkey fleet manning contracts.
            </p>
          </div>

          <a
            href={getWhatsAppUrl("Halo Haswakarya Crew Agency, saya memiliki pertanyaan khusus mengenai prosedur keagenan dan penempatan kru.")}
            target="_blank"
            rel="noopener noreferrer"
            className="shimmer-btn inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-accent hover:bg-accent/90 text-white font-bold text-xs sm:text-sm shadow-md transition-all whitespace-nowrap shrink-0"
          >
            <Phone className="w-4 h-4" />
            <span>Consult Operations Desk 24/7</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>

      </div>
    </section>
  );
}

export default MaritimeFAQ;
