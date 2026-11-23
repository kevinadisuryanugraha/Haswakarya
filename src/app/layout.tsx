import type { Metadata, Viewport } from 'next';
import { Roboto } from 'next/font/google';
import './globals.css';
import { COMPANY_INFO } from '@/data/haswakarya-data';

const roboto = Roboto({
  subsets: ['latin'],
  // Roboto tersedia sebagai variable font: satu berkas menutup seluruh rentang
  // bobot 400-900, jadi tidak perlu mengunduh satu berkas per bobot.
  weight: 'variable',
  variable: '--font-roboto',
  display: 'swap',
  // Metrik fallback diselaraskan otomatis supaya teks tidak bergeser saat
  // font web selesai dimuat (penyebab CLS klasik pada FOUT).
  adjustFontFallback: true,
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
  themeColor: '#06122A',
};

export const metadata: Metadata = {
  metadataBase: new URL('https://haswakarya.com'),
  title: `${COMPANY_INFO.brandName} | Official Crew Manning Agency Indonesia`,
  description: `${COMPANY_INFO.brandName} (${COMPANY_INFO.entityName}) is an official Crew Manning Agency delivering qualified, certified, and MLC 2006 compliant Indonesian seafarers to vessel owners worldwide. SIUKAK licensed by Ministry of Transportation RI. NIB: ${COMPANY_INFO.nib}.`,
  keywords: [
    'crew manning agency indonesia', 'haswakarya crew', 'manning agency batam',
    'SIUKAK kemenhub', 'MLC 2006 crew', 'Indonesian seafarers', 'vessel manning',
    'maritime crew recruitment', 'STCW certified crew', 'crew agency jakarta',
  ],
  alternates: {
    canonical: 'https://haswakarya.com',
  },
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: COMPANY_INFO.brandName,
  },
  icons: {
    // Ikon 1-2 KB, bukan logo 178 KB: favicon tidak boleh jadi permintaan
    // terberat di halaman.
    icon: [
      { url: '/icons/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: '/icons/apple-touch-icon.png',
  },
  openGraph: {
    title: `${COMPANY_INFO.brandName} — Global Crew Manning Partner`,
    description: `Trusted maritime crew manning agency in Indonesia. SIUKAK licensed, MLC 2006 compliant, with offices in Batam & Jakarta.`,
    url: 'https://haswakarya.com',
    type: 'website',
    locale: 'en_US',
    siteName: COMPANY_INFO.brandName,
    images: [
      {
        url: '/images/hero-bg-maritime.jpg',
        width: 1200,
        height: 630,
        alt: `${COMPANY_INFO.brandName} — Official Indonesian Crew Manning Agency`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: COMPANY_INFO.brandName,
    description: 'Licensed crew manning agency — connecting qualified Indonesian seafarers with global vessel operators.',
    images: ['/images/hero-bg-maritime.jpg'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

const schemaOrg = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'EmploymentAgency',
      '@id': 'https://haswakarya.com/#agency',
      name: COMPANY_INFO.brandName,
      legalName: COMPANY_INFO.entityName,
      description: COMPANY_INFO.about,
      foundingDate: '2024-02',
      address: [
        {
          '@type': 'PostalAddress',
          name: 'Head Office — Batam',
          streetAddress: 'Ruko Tiban Mas blok A no. 59-60, Jl. Gajah mada, Tiban Lama',
          addressLocality: 'Batam',
          addressRegion: 'Kepulauan Riau',
          addressCountry: 'ID',
        },
        {
          '@type': 'PostalAddress',
          name: 'Branch Office — Jakarta',
          streetAddress: 'Jl. Prof. Dr. Latumeten no. 33, Apartemen Seasons City Unit A 29 Bj, Jembatan Besi, Tambora',
          addressLocality: 'Jakarta Barat',
          addressRegion: 'DKI Jakarta',
          addressCountry: 'ID',
        },
      ],
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: COMPANY_INFO.phoneWhatsApp,
        email: COMPANY_INFO.email,
        contactType: 'customer support',
        availableLanguage: ['Indonesian', 'English'],
        hoursAvailable: { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] },
      },
      identifier: { '@type': 'PropertyValue', name: 'NIB', value: COMPANY_INFO.nib },
      knowsAbout: ['Crew Manning', 'Maritime Labour Convention', 'STCW', 'SIUKAK', 'Seafarer Recruitment', 'MLC 2006'],
    },
    {
      '@type': 'Corporation',
      '@id': 'https://haswakarya.com/#corporation',
      name: COMPANY_INFO.entityName,
      legalName: COMPANY_INFO.entityName,
      taxID: COMPANY_INFO.nib,
      foundingDate: '2024-02',
      areaServed: { '@type': 'GeoCircle', geoMidpoint: { '@type': 'GeoCoordinates', latitude: 1.11222, longitude: 103.97444 } },
      knowsAbout: ['Maritime Industry', 'Crew Manning', 'Seafarer Welfare', 'Indonesian Maritime'],
    },
    {
      '@type': 'WebSite',
      '@id': 'https://haswakarya.com/#website',
      url: 'https://haswakarya.com',
      name: `${COMPANY_INFO.brandName} — Official Indonesian Crew Manning Agency`,
      description: 'SIUKAK licensed and MLC 2006 compliant crew manning agency connecting qualified Indonesian seafarers with global vessel fleets.',
      publisher: { '@id': 'https://haswakarya.com/#agency' },
      potentialAction: {
        '@type': 'SearchAction',
        target: 'https://haswakarya.com/#services',
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@type': 'BreadcrumbList',
      '@id': 'https://haswakarya.com/#breadcrumbs',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://haswakarya.com/#hero' },
        { '@type': 'ListItem', position: 2, name: 'Company Profile & Vision', item: 'https://haswakarya.com/#about' },
        { '@type': 'ListItem', position: 3, name: 'Business Scope', item: 'https://haswakarya.com/#services' },
        { '@type': 'ListItem', position: 4, name: 'Commercial Fleets', item: 'https://haswakarya.com/#fleet' },
        { '@type': 'ListItem', position: 5, name: '9-Stage Vetting Pipeline', item: 'https://haswakarya.com/#pipeline' },
        { '@type': 'ListItem', position: 6, name: 'Seafarer Qualifications', item: 'https://haswakarya.com/#qualifications' },
        { '@type': 'ListItem', position: 7, name: 'Why Choose Us', item: 'https://haswakarya.com/#why-us' },
        { '@type': 'ListItem', position: 8, name: 'Legal SIUKAK Verification', item: 'https://haswakarya.com/#legals' },
        { '@type': 'ListItem', position: 9, name: 'Compliance & Manning FAQ', item: 'https://haswakarya.com/#faq' },
        { '@type': 'ListItem', position: 10, name: 'Offices & Contact Coordinates', item: 'https://haswakarya.com/#contact' },
      ],
    },
    {
      '@type': 'Service',
      '@id': 'https://haswakarya.com/#service-recruitment',
      name: 'Global Crew Recruitment & Sourcing',
      provider: { '@id': 'https://haswakarya.com/#agency' },
      serviceType: 'Maritime Crew Manning',
      description: 'End-to-end recruitment for certified officers and ratings on commercial vessels under strict DGST and MLC 2006 protocols.',
    },
    {
      '@type': 'Service',
      '@id': 'https://haswakarya.com/#service-compliance',
      name: 'Documentation & MLC 2006 Compliance Management',
      provider: { '@id': 'https://haswakarya.com/#agency' },
      serviceType: 'Maritime Legal Facilitation',
      description: 'Flag State endorsements, Tripartite PKL agreements, medical fitness clearances, and transit seafarer visa processing.',
    },
    {
      '@type': 'FAQPage',
      '@id': 'https://haswakarya.com/#faq',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'How fast can Haswakarya mobilize emergency crew replacements in Southeast Asia?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'For Southeast Asian ports (Singapore OPL, Batam, Tanjung Priok, Port Klang), Haswakarya can mobilize pre-vetted ready-to-board officers and ratings within 24 to 72 hours via our strategic dual hubs in Batam and Jakarta.',
          },
        },
        {
          '@type': 'Question',
          name: 'What performance guarantee does Haswakarya provide if a crew member underperforms?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Haswakarya provides a contractual 14-Day Performance & Medical Warranty. If any crew member fails to meet agreed technical competencies or develops medical disqualifications, Haswakarya supplies an immediate qualified replacement at zero additional agency service fee.',
          },
        },
        {
          '@type': 'Question',
          name: 'Are there any registration or placement fees charged to seafarers?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Zero placement fee (100% free). Under ILO MLC 2006 Regulation 1.4.5 and Indonesian SIUKAK regulations, PT Haswakarya Andalan Sedare strictly prohibits recruitment or placement fees to seafarers. All expenses are borne by verified shipowners.',
          },
        },
        {
          '@type': 'Question',
          name: 'What are the minimum Marlins English test requirements?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'For Management and Operational Level Officers (Deck & Engine), the minimum benchmark is 80%. For Support Level Ratings, the minimum standard is 70%.',
          },
        },
      ],
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="manifest" href="/manifest.webmanifest" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="apple-touch-icon" href="/images/logo-haswakarya.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrg) }}
        />
      </head>
      <body className={`${roboto.variable} font-sans antialiased text-navy bg-white selection:bg-primary selection:text-white`}>
        {children}
      </body>
    </html>
  );
}
