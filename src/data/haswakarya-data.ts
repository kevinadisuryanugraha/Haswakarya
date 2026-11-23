/**
 * PT HASWAKARYA ANDALAN SEDARE - Structured Data Repository
 * Source of Truth strictly extracted from "Haswakarya crew agency.pdf"
 * 
 * Provides type-safe definitions, corporate identity, contact coordinates,
 * business scopes, recruitment pipeline, qualifications, and credentials.
 */

// ============================================================================
// TypeScript Interfaces
// ============================================================================

export interface CompanyOffice {
  title: string;
  city: string;
  address: string;
  fullAddress: string;
  phone?: string;
  fax?: string;
}

export interface CompanyInfo {
  entityName: string;
  brandName: string;
  subtitle: string;
  since: string;
  presentedBy: string;
  about: string;
  motto: string;
  vision: string;
  mission: string[];
  headOffice: string;
  headOfficeStructured: CompanyOffice;
  branchOffice: string;
  branchOfficeStructured: CompanyOffice;
  phoneWhatsApp: string;
  whatsappClean: string;
  whatsappUrl: string;
  fax: string;
  email: string;
  nib: string;
  licenseSIUKAK: string;
  ctaHeading: string;
  ctaSubheading: string;
}

export interface CoreValueItem {
  id: string;
  number: string;
  title: string;
  description: string;
  iconName: string;
  highlight?: boolean;
}

export interface BusinessScopeItem {
  id: string;
  number: string;
  title: string;
  description: string;
  iconName: string;
  features: string[];
  badge?: string;
}

export interface SeafarerQualificationItem {
  id: string;
  number: number;
  title: string;
  description: string;
  iconName: string;
  category: string;
  criteria: string[];
}

export interface RecruitmentStageItem {
  step: number;
  code: string;
  title: string;
  subtitle: string;
  description: string;
  iconName: string;
  badge?: string;
}

export interface WhyChooseUsItem {
  id: string;
  number: string;
  title: string;
  description: string;
  iconName: string;
  highlights: string[];
}

export interface LegalCredentialItem {
  id: string;
  code: string;
  name: string;
  authority: string;
  referenceNumber: string;
  status: string;
  description: string;
  badge: string;
  previewImage: string;
}

export interface HeroSlideItem {
  id: string;
  index: number;
  tag: string;
  title: string;
  subtitle: string;
  description: string;
  ctaText: string;
  ctaHref: string;
  image: string;
}

export interface NavSubMenuItem {
  label: string;
  href: string;
  description?: string;
}

export interface NavMenuItem {
  label: string;
  href: string;
  isExternal?: boolean;
  children?: NavSubMenuItem[];
}

export interface StatItem {
  id: string;
  value: string;
  label: string;
  sub: string;
  iconName?: string;
}

export interface QuickNavCardItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  href: string;
  ctaText: string;
  badge: string;
  iconName: string;
}

export interface MaritimeStandardItem {
  id: string;
  name: string;
  code: string;
  authority: string;
}

export interface QuickSearchItem {
  title: string;
  category: string;
  href: string;
  isExternal?: boolean;
}

// ============================================================================
// Core Constants & Repository
// ============================================================================

export const COMPANY_INFO: CompanyInfo = {
  entityName: "PT HASWAKARYA ANDALAN SEDARE",
  brandName: "HASWAKARYA CREW AGENCY",
  subtitle: "Crew Manning Agency",
  since: "February 2026",
  presentedBy: "Jakarta Office",
  about:
    "Haswakarya crew agency was founded on a simple belief Indonesian seafarers are among the best in the world and deserve the best bridge to the global stage. As a Crew Manning Agency, we are committed to delivering a recruitment process that is transparent, professional, and with integrity. We manage every aspect to international standards — from certification and experience to crew welfare. To us, every seafarer is an ambassador of the nation, and every vessel that sails is a trust that we must uphold.",
  motto:
    "To us, every seafarer is ambassador of the nation, and every vessel that sails is a trust that we must uphold.",
  vision:
    "To become a trusted and reliable global crew manning partner, connecting qualified seafarers with leading maritime companies through excellence, integrity, and sustainable partnership.",
  mission: [
    "Professional Recruitment",
    "Safety & Compliance",
    "Client Partnership",
    "Seafarer Development",
    "Sustainable Growth",
  ],
  headOffice:
    "Ruko Tiban Mas blok A no. 59-60, Jl. Gajah mada, Tiban Lama, Batam, Kepulauan Riau, Indonesia",
  headOfficeStructured: {
    title: "Head Office (Batam)",
    city: "Batam, Kepulauan Riau",
    address: "Ruko Tiban Mas blok A no. 59-60, Jl. Gajah mada, Tiban Lama",
    fullAddress:
      "Ruko Tiban Mas blok A no. 59-60, Jl. Gajah mada, Tiban Lama, Batam, Kepulauan Riau, Indonesia",
    fax: "(+62778) 326 066",
  },
  branchOffice:
    "Jl. Prof. Dr. Latumeten no. 33, Apartemen Seasons City Unit A 29 Bj, Jembatan Besi, Tambora, Jakarta Barat, DKI Jakarta",
  branchOfficeStructured: {
    title: "Branch Office (Jakarta)",
    city: "Jakarta Barat, DKI Jakarta",
    address:
      "Jl. Prof. Dr. Latumeten no. 33, Apartemen Seasons City Unit A 29 Bj, Jembatan Besi, Tambora",
    fullAddress:
      "Jl. Prof. Dr. Latumeten no. 33, Apartemen Seasons City Unit A 29 Bj, Jembatan Besi, Tambora, Jakarta Barat, DKI Jakarta",
    phone: "+62 859-2205-2112",
  },
  phoneWhatsApp: "+62 859-2205-2112",
  whatsappClean: "6285922052112",
  whatsappUrl:
    "https://wa.me/6285922052112?text=Hello%20Haswakarya%20Crew%20Agency,%20I%20would%20like%20to%20inquire%20about%20your%20services.",
  fax: "(+62778) 326 066",
  email: "crewing@haswakarya.com",
  nib: "0702240024481",
  licenseSIUKAK:
    "SIUKAK (Surat Izin Usaha Keagenan Awak Kapal) - Ditjen Perhubungan Laut Kemenhub RI",
  ctaHeading: "Let's Build Synergy",
  ctaSubheading:
    "Partner with Indonesia's premier crew manning agency for certified, reliable, and compliant maritime personnel worldwide.",
};

export const CORE_VALUES: CoreValueItem[] = [
  {
    id: "care",
    number: "01",
    title: "Care*",
    description: "Seafarers' safety and happiness are our top priority.",
    iconName: "HeartHandshake",
    highlight: true,
  },
  {
    id: "communication",
    number: "02",
    title: "Communication*",
    description: "We put great emphasis on open, timely communication.",
    iconName: "MessageSquare",
    highlight: true,
  },
  {
    id: "improvement",
    number: "03",
    title: "Improvement",
    description:
      "We acknowledge and correct mistakes, and continuously improve our operations.",
    iconName: "TrendingUp",
    highlight: false,
  },
];

export const BUSINESS_SCOPES: BusinessScopeItem[] = [
  {
    id: "crew-recruitment",
    number: "01",
    title: "Global Crew Recruitment*",
    description:
      "Connecting qualified Indonesian seafarers with reputable vessel owners worldwide.",
    iconName: "Users",
    badge: "Core Service",
    features: [
      "Rigorous pre-selection and database screening",
      "Officers (Deck & Engine) and Ratings placement",
      "Specialized vessels: Bulk, Tanker, Container, and Tug & Barge",
      "Tailored crewing solutions for international ship owners",
    ],
  },
  {
    id: "training-certification",
    number: "02",
    title: "Training & Certification Support*",
    description:
      "Ensuring every crew member is certified, competent, and ready to perform.",
    iconName: "GraduationCap",
    badge: "Competency Assurance",
    features: [
      "Collaboration with DGST-accredited training centers",
      "STCW 2010 Manila Amendments compliance verification",
      "Pre-joining briefing and safety protocol refreshers",
      "Vessel-specific Computer Based Training (CBT)",
    ],
  },
  {
    id: "documentation-compliance",
    number: "03",
    title: "Documentation & Compliance*",
    description:
      "Complete handling of visas, contracts, and compliance with MLC 2006 & STCW standards.",
    iconName: "FileCheck2",
    badge: "Legal Compliance",
    features: [
      "Full compliance with MLC 2006 Seafarer Employment Agreements (SEA)",
      "Flag state endorsement and visa processing management",
      "Standardized medical check-ups at accredited clinics",
      "Transparent and audited crewing administration",
    ],
  },
  {
    id: "owner-support",
    number: "04",
    title: "Dedicated Owner Support*",
    description:
      "One point of contact, 24/7 — fast, transparent, and committed to your vessel's success.",
    iconName: "Headphones",
    badge: "24/7 Availability",
    features: [
      "Single designated point of contact for ship owners",
      "Emergency crew replacement and dispatch support",
      "Real-time operational updates and crew travel tracking",
      "Post-joining crew performance and welfare liaison",
    ],
  },
];

export const SEAFARER_QUALIFICATIONS: SeafarerQualificationItem[] = [
  {
    id: "fitness-resilience",
    number: 1,
    title: "Fitness & Resilience*",
    description: "Physically fit and strong enough to work at sea",
    iconName: "ShieldAlert",
    category: "Physical & Mental Readiness",
    criteria: [
      "DGST / ILO-approved Maritime Medical Examination clearance",
      "High stamina and resilience for extreme sea conditions",
      "Substance-free and verified drug testing records",
    ],
  },
  {
    id: "continuous-learning",
    number: 2,
    title: "Continuous Learning*",
    description: "Willing to learn and improve skills",
    iconName: "BookOpenCheck",
    category: "Professional Growth",
    criteria: [
      "Commitment to ongoing maritime skills advancement",
      "Familiarity with modern electronic bridge and engine automation",
      "Participation in ongoing safety and CBT refresher modules",
    ],
  },
  {
    id: "leadership-teamwork",
    number: 3,
    title: "Leadership & Teamwork*",
    description: "Can work well with others, even under pressure",
    iconName: "Users2",
    category: "Bridge & Engine Synergy",
    criteria: [
      "Exceptional teamwork in multicultural crew environments",
      "Effective crisis communication and situational leadership",
      "Conflict resolution and collaborative duty execution",
    ],
  },
  {
    id: "adaptability",
    number: 4,
    title: "Adaptability*",
    description: "Can adapt to different cultures and situations",
    iconName: "Compass",
    category: "Global Readiness",
    criteria: [
      "Fluency in Maritime English (verified by Marlins Test)",
      "High cultural sensitivity and mutual respect",
      "Agility in rotating routes, trade zones, and vessel types",
    ],
  },
  {
    id: "loyalty-commitment",
    number: 5,
    title: "Loyalty & Commitment*",
    description: "Loyal to the company, the vessel, and the crew",
    iconName: "Anchor",
    category: "Professional Dedication",
    criteria: [
      "Uncompromising dedication to vessel safety and cargo integrity",
      "Respect for shipowner assets and onboard hierarchy",
      "High contract completion and re-hiring rate",
    ],
  },
];

export const RECRUITMENT_STAGES: RecruitmentStageItem[] = [
  {
    step: 1,
    code: "01",
    title: "Crew Database Check / Candidate Sourcing via Social Media",
    subtitle: "Talent Discovery",
    description:
      "Active candidate sourcing from our verified maritime database, alumni networks, and targeted social media campaigns.",
    iconName: "Search",
    badge: "Initial Screening",
  },
  {
    step: 2,
    code: "02",
    title: "Document Verification",
    subtitle: "Credential Authentication",
    description:
      "Thorough validation of Seaman Books, Passports, STCW Competency & Proficiency Certificates against national and international registries.",
    iconName: "FileCheck",
    badge: "Strict Audit",
  },
  {
    step: 3,
    code: "03",
    title: "Marlins Test",
    subtitle: "Maritime English Assessment",
    description:
      "Standardized Marlins English Language Test to ensure clear, flawless maritime communication and safety comprehension onboard.",
    iconName: "Award",
    badge: "Standardized",
  },
  {
    step: 4,
    code: "04",
    title: "Interview with Our Team",
    subtitle: "Technical & Behavioral Vetting",
    description:
      "Rigorous technical assessment and behavioral interview conducted by senior Master Mariners and Chief Engineers.",
    iconName: "UserCheck",
    badge: "Internal Vetting",
  },
  {
    step: 5,
    code: "05",
    title: "Interview by Owner",
    subtitle: "Principal Direct Selection",
    description:
      "Coordination of direct candidate interview with the shipowner or crewing superintendent for final technical authorization.",
    iconName: "Video",
    badge: "Client Approval",
  },
  {
    step: 6,
    code: "06",
    title: "Medical Check-Up",
    subtitle: "Fitness for Sea Duty",
    description:
      "Comprehensive medical examination at DGST and flag-state approved maritime hospitals ensuring full fitness for seafaring service.",
    iconName: "Stethoscope",
    badge: "Health Clearance",
  },
  {
    step: 7,
    code: "07",
    title: "Visa Processing (if required)",
    subtitle: "Immigration & Consular Clearance",
    description:
      "Full handling of flag state endorsements, transit visas, seafarer transit documents, and immigration authorizations.",
    iconName: "Stamp",
    badge: "Consular Handling",
  },
  {
    step: 8,
    code: "08",
    title: "Pre-Departure Document Processing & Briefing",
    subtitle: "Pre-Joining Readiness",
    description:
      "Seafarer's Employment Agreement (SEA) execution under MLC 2006 terms, owner-specific CBT, and comprehensive departure briefing.",
    iconName: "Briefcase",
    badge: "Deployment Ready",
  },
  {
    step: 9,
    code: "09",
    title: "Onboard Evaluation (14 Days)",
    subtitle: "Continuous Performance Review",
    description:
      "Active monitoring and liaison with vessel command during the seafarer's first 14 days onboard to ensure seamless operational integration.",
    iconName: "CheckCircle2",
    badge: "Quality Guarantee",
  },
];

export const WHY_CHOOSE_US: WhyChooseUsItem[] = [
  {
    id: "agile-agency",
    number: "01",
    title: "Agile & Dedicated Crew Agency",
    description:
      "As a new-generation agency, we focus 100% on your needs — faster response, flexible service, and dedicated support for every vessel.",
    iconName: "Zap",
    highlights: [
      "100% focused on vessel owner specifications",
      "Rapid turnaround response times",
      "Flexible and bespoke crewing models",
    ],
  },
  {
    id: "partnership-network",
    number: "02",
    title: "Strong Maritime Partnership Network",
    description:
      "Backed by strategic partners from both private shipping companies and state-owned maritime institutions, ensuring wide access to qualified seafarers and training facilities.",
    iconName: "Network",
    highlights: [
      "Alliances with state-owned maritime academies",
      "Extensive network across Indonesian maritime hubs",
      "Direct pipeline of certified deck and engine ratings",
    ],
  },
  {
    id: "verified-pool",
    number: "03",
    title: "Curated & Verified Seafarer Pool",
    description:
      "We don't chase quantity, we ensure quality — every candidate passes strict screening, document verification, and competency assessment.",
    iconName: "ShieldCheck",
    highlights: [
      "Zero-compromise vetting standards",
      "Verified sea-time records and logbook audits",
      "Comprehensive criminal background checks",
    ],
  },
  {
    id: "systematic-training",
    number: "04",
    title: "Systematic Training & Readiness Program",
    description:
      "Collaborating with certified maritime training centers to deliver pre-joining briefing, safety awareness, and owner-specific CBT.",
    iconName: "MonitorPlay",
    highlights: [
      "DGST-certified simulator and safety drills",
      "Owner-tailored Computer-Based Training (CBT)",
      "Strict ISM and ISPS code compliance indoctrination",
    ],
  },
  {
    id: "transparent-process",
    number: "05",
    title: "Transparent & Compliant Process",
    description:
      "Fully aligned with MLC 2006, STCW, and Flag State requirements — clear documentation, visa handling, and 24/7 owner liaison.",
    iconName: "FileCheck2",
    highlights: [
      "100% compliance with MLC 2006 and STCW 2010",
      "Zero recruitment fee charging policy for seafarers",
      "Open, audited wage contracts and insurance",
    ],
  },
  {
    id: "long-term-partner",
    number: "06",
    title: "Growth-Oriented & Long-Term Partner",
    description:
      "We are building our reputation from day one — your vessel's performance and crew satisfaction is our best portfolio for the future.",
    iconName: "Handshake",
    highlights: [
      "Long-term partnership approach over transactional deals",
      "Dedicated account manager for every shipowner",
      "Continuous crew retention and career development path",
    ],
  },
];

export const LEGAL_CREDENTIALS: LegalCredentialItem[] = [
  {
    id: "siukak",
    code: "SIUKAK",
    name: "Surat Izin Usaha Keagenan Awak Kapal (SIUKAK)",
    authority:
      "Direktorat Jenderal Perhubungan Laut, Kementerian Perhubungan RI",
    referenceNumber: "Ditjen Hubla Kemenhub RI",
    status: "Active & Verified",
    description:
      "Official government authorization for crew manning agencies to recruit, document, and deploy Indonesian seafarers to domestic and international flagged vessels.",
    badge: "Official Kemenhub License",
    previewImage: "/images/doc-siupak.svg",
  },
  {
    id: "nib",
    code: "NIB",
    name: "Nomor Induk Berusaha (Perizinan Berusaha Berbasis Risiko)",
    authority: "Pemerintah Republik Indonesia - OSS BKPM",
    referenceNumber: "0702240024481",
    status: "Active & Verified",
    description:
      "Risk-Based Business Identification Number officially issued by the Republic of Indonesia confirming legal establishment and operational compliance of PT HASWAKARYA ANDALAN SEDARE.",
    badge: "NIB: 0702240024481",
    previewImage: "/images/doc-iso9001.svg",
  },
  {
    id: "mlc2006",
    code: "MLC 2006",
    name: "Maritime Labour Convention (MLC 2006) Compliance",
    authority: "International Labour Organization (ILO)",
    referenceNumber: "MLC 2006 Regulation 1.4 Standard",
    status: "Fully Compliant",
    description:
      "Rigorous adherence to international standards governing recruitment, placement, seafarer employment agreements, welfare, medical coverage, and fair working conditions.",
    badge: "ILO Standard Compliant",
    previewImage: "/images/doc-mlc2006.svg",
  },
  {
    id: "stcw2010",
    code: "STCW 2010",
    name: "STCW 1978 as Amended (Manila 2010)",
    authority: "International Maritime Organization (IMO)",
    referenceNumber: "IMO STCW 2010 Standards",
    status: "Standard Aligned",
    description:
      "Standard of Training, Certification and Watchkeeping for Seafarers governing all qualifications, competency certifications, and continuous professional readiness.",
    badge: "IMO STCW Standard",
    previewImage: "/images/crew-training.svg",
  },
];

export const HERO_SLIDES: HeroSlideItem[] = [
  {
    id: "slide-1",
    index: 0,
    tag: "Recruitment",
    title: "Global Crew Recruitment & Deployment",
    subtitle:
      "Connecting qualified Indonesian seafarers with reputable vessel owners worldwide.",
    description:
      "Delivering transparent, ethical, and professionally vetted Indonesian crew members across all vessel types and international trade lanes.",
    ctaText: "Recruit Crew Now",
    ctaHref: "#services",
    image: "/images/hero-vessel.svg",
  },
  {
    id: "slide-2",
    index: 1,
    tag: "Quality Vetting",
    title: "Rigorous 9-Stage Screening & Marlins Standard",
    subtitle:
      "Comprehensive English Marlins test, technical assessment, medical check-up, and owner interview.",
    description:
      "Every candidate is verified through a rigorous 9-stage pipeline to ensure zero operational failure and immediate vessel readiness.",
    ctaText: "Explore Pipeline",
    ctaHref: "#pipeline",
    image: "/images/crew-training.svg",
  },
  {
    id: "slide-3",
    index: 2,
    tag: "Compliance",
    title: "100% Certified MLC 2006 & SIUKAK Compliant",
    subtitle:
      "Fully licensed by Ministry of Transportation RI with strict international maritime labor compliance.",
    description:
      "Operating with complete transparency, valid SIUKAK licensing, and strict adherence to ILO MLC 2006 labor protection guidelines.",
    ctaText: "View Legals",
    ctaHref: "#legals",
    image: "/images/doc-mlc2006.svg",
  },
  {
    id: "slide-4",
    index: 3,
    tag: "24/7 Support",
    title: "Dedicated 24/7 Owner Support & Operational Liaison",
    subtitle:
      "Single point of contact for vessel owners, transparent coordination, and onboard monitoring.",
    description:
      "Round-the-clock emergency dispatch, visa logistics, flight arrangements, and dedicated owner assistance for continuous vessel performance.",
    ctaText: "Contact Hubs",
    ctaHref: "#contact",
    image: "/images/world-routes.svg",
  },
];

export const STATS_DATA: StatItem[] = [
  {
    id: "compliance",
    value: "100%",
    label: "Compliance Standard",
    sub: "MLC 2006 & STCW Certified",
    iconName: "ShieldCheck",
  },
  {
    id: "vetting",
    value: "9 Steps",
    label: "Strict Vetting Pipeline",
    sub: "Zero-Compromise Screening",
    iconName: "GitMerge",
  },
  {
    id: "support",
    value: "24/7",
    label: "Dedicated Owner Liaison",
    sub: "Single Point of Contact",
    iconName: "Clock",
  },
  {
    id: "strategic-hubs",
    value: "2 Hubs",
    label: "Strategic Offices",
    sub: "Batam HQ & Jakarta Branch",
    iconName: "MapPin",
  },
];

export const MARITIME_STANDARDS: string[] = [
  "SIUKAK KEMENHUB RI",
  "MLC 2006 COMPLIANT",
  "STCW 2010 STANDARD",
  "MARLINS ENGLISH APPROVED",
  "NIB 0702240024481",
  "IMO CONVENTION",
  "FLAG STATE ALIGNED",
  "CBT VERIFIED",
];

export const MARITIME_STANDARDS_DETAILED: MaritimeStandardItem[] = [
  {
    id: "siukak",
    name: "SIUKAK KEMENHUB RI",
    code: "SIUKAK",
    authority: "Ditjen Perhubungan Laut Kemenhub RI",
  },
  {
    id: "mlc2006",
    name: "MLC 2006 COMPLIANT",
    code: "MLC 2006",
    authority: "International Labour Organization (ILO)",
  },
  {
    id: "stcw2010",
    name: "STCW 2010 STANDARD",
    code: "STCW 2010",
    authority: "International Maritime Organization (IMO)",
  },
  {
    id: "marlins",
    name: "MARLINS ENGLISH APPROVED",
    code: "MARLINS",
    authority: "Maritime English Testing System",
  },
  {
    id: "nib",
    name: "NIB 0702240024481",
    code: "NIB-OSS",
    authority: "Pemerintah Republik Indonesia (OSS)",
  },
  {
    id: "imo",
    name: "IMO CONVENTION",
    code: "IMO",
    authority: "International Maritime Organization",
  },
  {
    id: "flag-state",
    name: "FLAG STATE ALIGNED",
    code: "FLAG STATE",
    authority: "Panama, Liberia, Singapore, Marshall Islands",
  },
  {
    id: "cbt",
    name: "CBT VERIFIED",
    code: "CBT",
    authority: "Computer Based Training Certification",
  },
];

export const NAV_MENU_ITEMS: NavMenuItem[] = [
  {
    label: "Home",
    href: "#hero",
  },
  {
    label: "About Us",
    href: "#about",
    children: [
      {
        label: "Company Profile",
        href: "#about",
        description: "Vision, mission, and national crewing commitment",
      },
      {
        label: "Core Values",
        href: "#core-values",
        description: "Care, Communication, and Continuous Improvement",
      },
      {
        label: "Why Choose Us",
        href: "#why-us",
        description: "6 strategic pillars of Haswakarya service excellence",
      },
      {
        label: "Strategic Locations",
        href: "#contact",
        description: "Batam Head Office & Jakarta Operations Branch",
      },
    ],
  },
  {
    label: "Services",
    href: "#services",
    children: [
      {
        label: "Global Crew Recruitment",
        href: "#services",
        description: "Officers and ratings for all commercial vessel types",
      },
      {
        label: "Training & Certification",
        href: "#services",
        description: "STCW compliance and pre-joining readiness programs",
      },
      {
        label: "Documentation & Visas",
        href: "#services",
        description: "Visas, MLC 2006 contracts, and flag state handling",
      },
      {
        label: "Commercial Fleet Types",
        href: "#fleet",
        description: "Manning for Tanker, Bulk, Container & Tug Fleets",
      },
      {
        label: "Dedicated Owner Support",
        href: "#services",
        description: "Single point of contact with 24/7 emergency dispatch",
      },
    ],
  },
  {
    label: "Recruitment",
    href: "#pipeline",
    children: [
      {
        label: "9-Stage Screening",
        href: "#pipeline",
        description: "From database check to onboard 14-day evaluation",
      },
      {
        label: "Marlins Standard",
        href: "#pipeline",
        description: "Verified English proficiency for maritime safety",
      },
      {
        label: "Medical & Vetting",
        href: "#pipeline",
        description: "Approved maritime clinic fitness evaluations",
      },
      {
        label: "Compliance & FAQ",
        href: "#faq",
        description: "Answers on emergency mobilization, 14-day warranty, and MLC compliance",
      },
    ],
  },
  {
    label: "Seafarers",
    href: "#qualifications",
    children: [
      {
        label: "Qualifications & Standards",
        href: "#qualifications",
        description: "5 core pillars of Haswakarya seafarers",
      },
      {
        label: "Seafarer FAQ & Zero Fee",
        href: "#faq",
        description: "Zero placement fee guarantee and recruitment guidelines",
      },
      {
        label: "Career Opportunities",
        href: "#qualifications",
        description: "Submit dossier for international vessel placement",
      },
    ],
  },
  {
    label: "Legals",
    href: "#legals",
    children: [
      {
        label: "SIUKAK (Kemenhub RI)",
        href: "#legals",
        description: "Official crew manning agency license",
      },
      {
        label: "NIB: 0702240024481",
        href: "#legals",
        description: "Risk-based business registration",
      },
      {
        label: "MLC 2006 & STCW",
        href: "#legals",
        description: "International maritime labor compliance",
      },
    ],
  },
  {
    label: "Contact",
    href: "#contact",
  },
];

export const QUICK_SEARCH_INDEX: QuickSearchItem[] = [
  { title: "Global Crew Recruitment", category: "Services", href: "#services" },
  { title: "Emergency Riding Gang & Voyage Repair Squad", category: "Services", href: "#services" },
  { title: "Training & Certification Support", category: "Services", href: "#services" },
  { title: "Documentation & MLC Compliance", category: "Services", href: "#services" },
  { title: "Dedicated 24/7 Owner Support", category: "Services", href: "#services" },
  { title: "9-Stage Recruitment Pipeline", category: "Pipeline", href: "#pipeline" },
  { title: "Marlins English Language Test (80%+ Officers)", category: "Pipeline", href: "#pipeline" },
  { title: "Medical Check-Up Standards (DGST Approved)", category: "Pipeline", href: "#pipeline" },
  { title: "5 Core Seafarer Qualifications", category: "Seafarers", href: "#qualifications" },
  { title: "Why Choose Us (6 Strategic Pillars)", category: "About Us", href: "#why-us" },
  { title: "Offshore Support Vessels & ASD Tugboats", category: "Fleet", href: "#fleet" },
  { title: "Oil & Chemical Tankers (SIRE 2.0)", category: "Fleet", href: "#fleet" },
  { title: "Emergency Crew Mobilization Speed (24-72 hrs)", category: "FAQ", href: "#faq" },
  { title: "14-Day Performance & Medical Warranty", category: "FAQ", href: "#faq" },
  { title: "Strict Zero Placement Fee Guarantee (PM 59/2021)", category: "FAQ", href: "#faq" },
  { title: "OCIMF SIRE 2.0 & RightShip Matrix Vetting", category: "FAQ", href: "#faq" },
  { title: "Compliant Payroll & Family Allotments", category: "FAQ", href: "#faq" },
  { title: "SIUKAK Kemenhub RI Authorization", category: "Legals", href: "#legals" },
  { title: "NIB: 0702240024481 Risk-Based License", category: "Legals", href: "#legals" },
  { title: "Batam Head Office Coordinate (01°06'44\"N 103°58'28\"E)", category: "Contact", href: "#contact" },
  { title: "Jakarta Branch Office Coordinate (06°09'12\"S 106°47'33\"E)", category: "Contact", href: "#contact" },
  {
    title: "WhatsApp 24/7 Crewing Hotline",
    category: "Hotline",
    href: COMPANY_INFO.whatsappUrl,
    isExternal: true,
  },
];

export const QUICK_NAV_CARDS: QuickNavCardItem[] = [
  {
    id: "owners-principals",
    title: "Ship Owners & Principals",
    subtitle: "Crew Manning Solutions",
    description:
      "Request certified Indonesian deck and engine officers, ratings, and specialized offshore crew tailored to your vessel requirements.",
    href: "#services",
    ctaText: "Request Crew Portfolio",
    badge: "For Employers",
    iconName: "Ship",
  },
  {
    id: "seafarers-careers",
    title: "Seafarer Careers & Marlins",
    subtitle: "Global Deployment",
    description:
      "Join our verified talent pool for international deployments with transparent, zero-fee ethical recruitment and continuous training.",
    href: "/join-as-crew",
    ctaText: "Join as Seafarer",
    badge: "For Crew",
    iconName: "UserPlus",
  },
  {
    id: "legal-verification",
    title: "SIUKAK & Legal Verification",
    subtitle: "Government Certified",
    description:
      "Inspect our official SIUKAK license from the Ministry of Transportation, NIB 0702240024481, and MLC 2006 certified standards.",
    href: "#legals",
    ctaText: "Verify Credentials",
    badge: "100% Verified",
    iconName: "FileCheck",
  },
  {
    id: "operations-support",
    title: "24/7 Operations Support",
    subtitle: "Direct Dispatch & Liaison",
    description:
      "Connect immediately with our Batam headquarters or Jakarta branch office for crew travel logistics, visas, and 24/7 support.",
    href: "#contact",
    ctaText: "Contact Ops Desk",
    badge: "Always On",
    iconName: "Headphones",
  },
];

// ============================================================================
// Specialized Fleet Types Data (Vessels Manned by Haswakarya)
// ============================================================================

export interface VesselTypeItem {
  id: string;
  name: string;
  category: string;
  image: string;
  description: string;
  keyRanks: string[];
  certifications: string[];
  deadweightTonnage: string;
  tradeRoutes: string;
  badge: string;
}

export const VESSEL_TYPES_DATA: VesselTypeItem[] = [
  {
    id: "tanker",
    name: "Oil & Chemical Tankers",
    category: "Liquid Cargo Fleet",
    image: "/images/vessel-tanker.jpg",
    description: "Specialized crew manning for crude oil tankers, chemical carriers, and product tankers complying with strict OCIMF SIRE inspection standards.",
    keyRanks: ["Master / Chief Officer", "Chief Engineer / 1AE", "Pumpman / Gas Engineer", "Able Seaman / Oiler"],
    certifications: ["Basic & Advanced Oil/Chemical Tanker Endorsement (STCW V/1-1)", "IGS & COW Certificate", "BOSIET / OPITO (Offshore)"],
    deadweightTonnage: "10,000 – 320,000 DWT (Handy to VLCC)",
    tradeRoutes: "Middle East, Far East, Intra-Asia & US Gulf",
    badge: "OCIMF SIRE Compliant",
  },
  {
    id: "bulk",
    name: "Bulk Carriers & Ore Carriers",
    category: "Dry Bulk Fleet",
    image: "/images/vessel-bulk.jpg",
    description: "Experienced officers and ratings for bulk carriers handling grain, coal, bauxite, and iron ore with IMSBC & BLU Code expertise.",
    keyRanks: ["Master / Chief Mate", "Chief Engineer / 2nd Eng", "Bosun / Deck Fitter", "Ordinary Seaman / Wiper"],
    certifications: ["IMSBC Code Dangerous Cargo Cargo Handling", "Crane & Grab Operational Competency", "Enclosed Space Entry & Rescue"],
    deadweightTonnage: "25,000 – 210,000 DWT (Handymax to Capesize)",
    tradeRoutes: "Australia, China, Brazil, India & Southeast Asia",
    badge: "RightShip Inspection Standard",
  },
  {
    id: "container",
    name: "Container & Feeder Vessels",
    category: "Liner Cargo Fleet",
    image: "/images/vessel-container.jpg",
    description: "Fast-turnaround crewing for container feeder and deep-sea boxships requiring precise cargo lashing, reefer monitoring, and agile port handling.",
    keyRanks: ["Master / Navigation Officer", "Electrical Engineer (ETO)", "Reefer Technician", "Able Seaman / Watchkeeper"],
    certifications: ["Electronic Chart Display (ECDIS Type-Specific)", "Reefer Cargo Monitoring & Troubleshooting", "High-Voltage Safety Certificate"],
    deadweightTonnage: "1,000 – 18,000 TEU (Feeder to Ultra-Large)",
    tradeRoutes: "Trans-Pacific, Asia-Europe & Regional Feeder Hubs",
    badge: "High-Speed Port Turnaround",
  },
  {
    id: "tug-barge",
    name: "Offshore Support & ASD Tugboats",
    category: "Offshore Towage & AHTS Fleet",
    image: "/images/vessel-tug.jpg",
    description: "Expert crews for Anchor Handling Tug Supply (AHTS), harbor ASD tugs, and ocean towing barges with exceptional maneuvering, towing gear inspection, and rig assist expertise.",
    keyRanks: ["Tug Master (ASD / AHTS)", "Chief Engineer (High-Speed Diesel)", "Towage Bosun / Deckhand", "Rigger / Crane Operator"],
    certifications: ["Azimuth Stern Drive (ASD) & Towing Endorsement", "Anchor Handling & Towing Safety Protocol", "BOSIET / OPITO Offshore Certification"],
    deadweightTonnage: "2,000 – 12,000 BHP (Bollard Pull 40–150T)",
    tradeRoutes: "Strait of Malacca, Natuna Basin, Java Sea & ASEAN Waters",
    badge: "AHTS & ASD Towage Certified",
  },
];

// ============================================================================
// Helper Functions
// ============================================================================

export function getWhatsAppUrl(customMessage?: string): string {
  const cleanPhone = COMPANY_INFO.whatsappClean;
  const message = customMessage || "Hello Haswakarya Crew Agency, I would like to inquire about your crew manning services.";
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

export function getEmailMailto(customSubject?: string, customBody?: string): string {
  const email = COMPANY_INFO.email;
  const subject = customSubject || `Inquiry: Haswakarya Crew Manning Services`;
  const body = customBody || `Dear Haswakarya Crewing Team,\n\nI am writing to inquire regarding crew placement and partnership opportunities.\n\nBest regards,`;
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function getPhoneTelUrl(): string {
  return `tel:${COMPANY_INFO.whatsappClean}`;
}
