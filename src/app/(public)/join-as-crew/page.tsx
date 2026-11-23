import type { Metadata } from 'next';
import React from 'react';
import { CheckCircle2, Phone, ShieldCheck, FileText, Clock } from 'lucide-react';
import { Header, Footer } from '@/components/layout';
import { JoinFaq, JoinHero, JoinProcess, SeafarerApplicationForm } from '@/components/join-as-crew';
import { COMPANY_INFO } from '@/data/haswakarya-data';

const PAGE_URL = 'https://haswakarya.com/join-as-crew';

export const metadata: Metadata = {
  title: 'Join as Crew — Seafarer Application | Haswakarya Crew Agency',
  description:
    'Apply online to join Haswakarya crew. Submit one verified dossier for tanker, bulk, container, tugboat, and offshore fleets. Zero placement fee, SIUKAK licensed, MLC 2006 compliant.',
  alternates: {
    canonical: PAGE_URL,
  },
  openGraph: {
    title: 'Join as Crew — Haswakarya Seafarer Application',
    description:
      'One verified dossier, nine-stage selection, zero placement fee. Indonesian seafarers placed on internationally trading fleets by a SIUKAK licensed crew manning agency.',
    url: PAGE_URL,
    type: 'website',
    locale: 'en_US',
    siteName: COMPANY_INFO.brandName,
    images: [
      {
        url: '/images/hero-bg-maritime.jpg',
        width: 1200,
        height: 630,
        alt: `${COMPANY_INFO.brandName} — Seafarer application desk`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Join as Crew — Haswakarya Seafarer Application',
    description:
      'Submit one verified dossier to the Haswakarya crewing desk. Zero placement fee, MLC 2006 compliant.',
    images: ['/images/hero-bg-maritime.jpg'],
  },
};

const PREPARE_ITEMS = [
  'Seaman Book (Buku Pelaut) and valid passport',
  'CoC, STCW basic safety, and DGST/ILO medical certificate',
  'Latest discharge book or sea-service testimonials',
  'Marlins result if issued within the last 24 months',
];

const DESK_FACTS = [
  { icon: Clock, label: 'Dossier review within 24 working hours' },
  { icon: ShieldCheck, label: 'Zero placement fee — PM 59/2021 & MLC 2006' },
  { icon: FileText, label: 'One profile, all live vessel requisitions' },
];

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://haswakarya.com' },
    { '@type': 'ListItem', position: 2, name: 'Join as Crew', item: PAGE_URL },
  ],
};

export default function JoinAsCrewPage() {
  return (
    <>
      <Header />

      <main>
        <JoinHero />
        <JoinProcess />

        <section id="apply" className="relative bg-surface py-14 sm:py-18 lg:py-24 scroll-mt-24">
          <div className="absolute inset-0 bg-grain opacity-40 pointer-events-none" aria-hidden="true" />

          <div className="relative site-container">
            <div className="max-w-3xl mb-8 sm:mb-10">
              <div className="soe-tag mb-4">
                <FileText className="w-3.5 h-3.5" />
                <span>Application Dossier</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-navy mb-3">
                Register your seafarer dossier
              </h2>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                Eleven fields, one submission. Your data enters the H-COS ATS immediately and stays
                active for future requisitions that match your rank and sea-time.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.6fr] gap-6 lg:gap-8 items-start">
              <aside className="space-y-4 lg:sticky lg:top-24">
                <div className="horizonx-card rounded-2xl p-5 sm:p-6">
                  <h3 className="text-sm font-bold text-navy mb-3">Prepare before you submit</h3>
                  <ul className="space-y-2.5">
                    {PREPARE_ITEMS.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-xs text-slate-600 leading-relaxed">
                        <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
                  <h3 className="text-sm font-bold text-navy mb-3">Crewing desk</h3>
                  <ul className="space-y-3">
                    {DESK_FACTS.map(({ icon: Icon, label }) => (
                      <li key={label} className="flex items-start gap-2 text-xs text-slate-600 leading-relaxed">
                        <Icon className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <span>{label}</span>
                      </li>
                    ))}
                  </ul>
                  <a
                    href={`tel:${COMPANY_INFO.whatsappClean}`}
                    className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-primary hover:text-navy transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>{COMPANY_INFO.phoneWhatsApp}</span>
                  </a>
                </div>
              </aside>

              <div className="horizonx-card rounded-3xl p-5 sm:p-7">
                <SeafarerApplicationForm />
              </div>
            </div>
          </div>
        </section>

        <JoinFaq />
      </main>

      <Footer />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
    </>
  );
}