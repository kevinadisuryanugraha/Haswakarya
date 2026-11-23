import type { Metadata } from 'next';
import { absoluteUrl } from '@/lib/seo/siteUrl';
import React from 'react';
import { CheckCircle2, Clock, Mail, Phone, ShieldCheck, Ship } from 'lucide-react';
import { Header, Footer } from '@/components/layout';
import { RecruitFaq, RecruitHero, RecruitProcess, RecruitRequisitionForm } from '@/components/recruit-crew';
import { COMPANY_INFO } from '@/data/haswakarya-data';
import { resolveVesselTypeParam } from '@/lib/public/manningRequisition';

const PAGE_URL = absoluteUrl('/recruit-crew');

export const metadata: Metadata = {
  title: 'Recruit Crew — Fleet Manning Requisition | Haswakarya Crew Agency',
  description:
    'Submit one safe manning requisition for tanker, bulk, container, tug, and offshore fleets. Verified Indonesian officers and ratings with CoC, sea-time, Marlins, and SIRE 2.0 vetting on file. 14-day replacement warranty.',
  alternates: {
    canonical: PAGE_URL,
  },
  openGraph: {
    title: 'Recruit Crew — Haswakarya Fleet Manning Requisition',
    description:
      'One requisition, a ranked shortlist in 30 minutes. SIUKAK licensed crew manning for internationally trading fleets, MLC 2006 compliant, 14-day replacement warranty.',
    url: PAGE_URL,
    type: 'website',
    locale: 'en_US',
    siteName: COMPANY_INFO.brandName,
    images: [
      {
        url: '/images/hero-bg-maritime.jpg',
        width: 1200,
        height: 630,
        alt: `${COMPANY_INFO.brandName} — Fleet manning requisition desk`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Recruit Crew — Haswakarya Fleet Manning Requisition',
    description:
      'Verified Indonesian crews for tanker, bulk, container, tug, and offshore fleets. One requisition, decision-ready shortlist.',
    images: ['/images/hero-bg-maritime.jpg'],
  },
};

const PREPARE_ITEMS = [
  'Vessel particulars: name, IMO number, flag state, and gross tonnage',
  'Rank matrix — which officers and ratings you need, with CoC class',
  'Joining port, target crew-change window, and contract length',
  'Vetting standard your charterer requires (SIRE 2.0, RightShip RISQ, or internal)',
];

const DESK_FACTS = [
  { icon: Clock, label: 'First shortlist within 30 minutes, WIB working hours' },
  { icon: ShieldCheck, label: 'Documents verified against the flag registry before proposal' },
  { icon: Ship, label: '14-day replacement warranty after the crew member boards' },
];

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: absoluteUrl('/') },
    { '@type': 'ListItem', position: 2, name: 'Recruit Crew', item: PAGE_URL },
  ],
};

interface RecruitCrewPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function RecruitCrewPage({ searchParams }: RecruitCrewPageProps) {
  const params = await searchParams;
  const rawVessel = params.vessel;
  const vesselParam = Array.isArray(rawVessel) ? rawVessel[0] : rawVessel;
  const defaultVesselType = resolveVesselTypeParam(vesselParam);

  return (
    <>
      <Header />

      <main>
        <RecruitHero />
        <RecruitProcess />

        <section id="requisition" className="relative bg-surface py-14 sm:py-18 lg:py-24 scroll-mt-24">
          <div className="absolute inset-0 bg-grain opacity-40 pointer-events-none" aria-hidden="true" />

          <div className="relative site-container">
            <div className="max-w-3xl mb-8 sm:mb-10">
              <div className="soe-tag mb-4">
                <Ship className="w-3.5 h-3.5" />
                <span>Fleet Manning Requisition</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-navy mb-3">
                Register a crew requisition
              </h2>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                One submission enters the H-COS requisition queue and returns a reference number you
                can forward to your superintendent, charterer, or auditor.
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
                  <div className="mt-4 space-y-2 border-t border-slate-200 pt-4">
                    <a
                      href={`tel:${COMPANY_INFO.whatsappClean}`}
                      className="flex items-center gap-2 text-xs font-bold text-primary hover:text-navy transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5 shrink-0" />
                      <span>{COMPANY_INFO.phoneWhatsApp}</span>
                    </a>
                    <a
                      href={`mailto:${COMPANY_INFO.email}`}
                      className="flex items-center gap-2 text-xs font-bold text-primary hover:text-navy transition-colors break-all"
                    >
                      <Mail className="w-3.5 h-3.5 shrink-0" />
                      <span>{COMPANY_INFO.email}</span>
                    </a>
                  </div>
                </div>
              </aside>

              <div className="horizonx-card rounded-3xl p-5 sm:p-7">
                <RecruitRequisitionForm defaultVesselType={defaultVesselType} />
              </div>
            </div>
          </div>
        </section>

        <RecruitFaq />
      </main>

      <Footer />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
    </>
  );
}