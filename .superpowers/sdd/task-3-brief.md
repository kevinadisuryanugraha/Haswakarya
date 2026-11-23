# Task 3 Brief: Structured Data Repository (From PDF)

## Files:
- Create: `src/data/haswakarya-data.ts`

## Requirements:
1. Define comprehensive TypeScript interfaces:
   - `CompanyInfo`
   - `CoreValueItem`
   - `BusinessScopeItem`
   - `SeafarerQualificationItem`
   - `RecruitmentStageItem`
   - `WhyChooseUsItem`
   - `LegalCredentialItem`
   - `HeroSlideItem`
   - `NavMenuItem`
   - `StatItem`

2. Populate all data strictly from `Haswakarya crew agency.pdf`:
   - `COMPANY_INFO`:
     - entityName: "PT HASWAKARYA ANDALAN SEDARE"
     - brandName: "HASWAKARYA CREW AGENCY"
     - subtitle: "Crew Manning Agency"
     - since: "February 2026"
     - presentedBy: "Jakarta Office"
     - about: "Haswakarya crew agency was founded on a simple belief Indonesian seafarers are among the best in the world and deserve the best bridge to the global stage. As a Crew Manning Agency, we are committed to delivering a recruitment process that is transparent, professional, and with integrity. We manage every aspect to international standards — from certification and experience to crew welfare. To us, every seafarer is an ambassador of the nation, and every vessel that sails is a trust that we must uphold."
     - motto: "To us, every seafarer is ambassador of the nation, and every vessel that sails is a trust that we must uphold."
     - vision: "To become a trusted and reliable global crew manning partner, connecting qualified seafarers with leading maritime companies through excellence, integrity, and sustainable partnership."
     - mission: ["Professional Recruitment", "Safety & Compliance", "Client Partnership", "Seafarer Development", "Sustainable Growth"]
     - headOffice: "Ruko Tiban Mas blok A no. 59-60, Jl. Gajah mada, Tiban Lama, Batam, Kepulauan Riau, Indonesia"
     - branchOffice: "Jl. Prof. Dr. Latumeten no. 33, Apartemen Seasons City Unit A 29 Bj, Jembatan Besi, Tambora, Jakarta Barat, DKI Jakarta"
     - phoneWhatsApp: "+62 859-2205-2112"
     - whatsappClean: "6285922052112"
     - fax: "(+62778) 326 066"
     - email: "crewing@haswakarya.com"
     - nib: "0702240024481"
     - licenseSIUKAK: "SIUKAK (Surat Izin Usaha Keagenan Awak Kapal) - Ditjen Perhubungan Laut Kemenhub RI"

   - `CORE_VALUES`:
     1. Care* ("Seafarers' safety and happiness are our top priority.")
     2. Communication* ("We put great emphasis on open, timely communication.")
     3. Improvement ("We acknowledge and correct mistakes, and continuously improve our operations.")

   - `BUSINESS_SCOPES`:
     1. Global Crew Recruitment* ("Connecting qualified Indonesian seafarers with reputable vessel owners worldwide.")
     2. Training & Certification Support* ("Ensuring every crew member is certified, competent, and ready to perform.")
     3. Documentation & Compliance* ("Complete handling of visas, contracts, and compliance with MLC 2006 & STCW standards.")
     4. Dedicated Owner Support* ("One point of contact, 24/7 — fast, transparent, and committed to your vessel's success.")

   - `SEAFARER_QUALIFICATIONS`:
     1. Fitness & Resilience* ("Physically fit and strong enough to work at sea")
     2. Continuous Learning* ("Willing to learn and improve skills")
     3. Leadership & Teamwork* ("Can work well with others, even under pressure")
     4. Adaptability* ("Can adapt to different cultures and situations")
     5. Loyalty & Commitment* ("Loyal to the company, the vessel, and the crew")

   - `RECRUITMENT_STAGES`: (9 stages)
     1. Crew Database Check / Candidate Sourcing via Social Media
     2. Document Verification
     3. Marlins Test
     4. Interview with Our Team
     5. Interview by Owner
     6. Medical Check-Up
     7. Visa Processing (if required)
     8. Pre-Departure Document Processing & Briefing
     9. Onboard Evaluation (14 Days)

   - `WHY_CHOOSE_US`: (6 pillars)
     1. Agile & Dedicated Crew Agency
     2. Strong Maritime Partnership Network
     3. Curated & Verified Seafarer Pool
     4. Systematic Training & Readiness Program
     5. Transparent & Compliant Process (MLC 2006, STCW, Flag State)
     6. Growth-Oriented & Long-Term Partner

   - `LEGAL_CREDENTIALS`:
     - SIUKAK (Kemenhub RI)
     - NIB: 0702240024481 (Perizinan Berusaha Berbasis Risiko)
     - MLC 2006 (Maritime Labour Convention)
     - STCW 2010

   - `HERO_SLIDES`: (4 slides for the interactive hero slider)
     1. Title: "Global Crew Recruitment & Deployment" / Subtitle: "Connecting qualified Indonesian seafarers with reputable vessel owners worldwide." / Tag: "Recruitment" / Image: "/images/hero-vessel.svg"
     2. Title: "Rigorous 9-Stage Screening & Marlins Standard" / Subtitle: "Comprehensive English Marlins test, technical assessment, medical check-up, and owner interview." / Tag: "Quality Vetting" / Image: "/images/crew-training.svg"
     3. Title: "100% Certified MLC 2006 & SIUKAK Compliant" / Subtitle: "Fully licensed by Ministry of Transportation RI with strict international maritime labor compliance." / Tag: "Compliance" / Image: "/images/doc-mlc2006.svg"
     4. Title: "Dedicated 24/7 Owner Support & Operational Liaison" / Subtitle: "Single point of contact for vessel owners, transparent coordination, and onboard monitoring." / Tag: "24/7 Support" / Image: "/images/world-routes.svg"

   - `STATS_DATA`: (4 metrics)
     1. Value: "100%", Label: "Compliance Standard", Sub: "MLC 2006 & STCW Certified"
     2. Value: "9 Steps", Label: "Strict Vetting Pipeline", Sub: "Zero-Compromise Screening"
     3. Value: "24/7", Label: "Dedicated Owner Liaison", Sub: "Single Point of Contact"
     4. Value: "2 Hubs", Label: "Strategic Offices", Sub: "Batam HQ & Jakarta Branch"

   - `MARITIME_STANDARDS`:
     List of accreditation badges / names: ["SIUKAK KEMENHUB RI", "MLC 2006 COMPLIANT", "STCW 2010 STANDARD", "MARLINS ENGLISH APPROVED", "NIB 0702240024481", "IMO CONVENTION", "FLAG STATE ALIGNED", "CBT VERIFIED"]

3. Ensure strict TypeScript types and export all constants.
4. Verify by running `npx tsc --noEmit`.
5. Write report to `c:\laragon\www\kevin-work\Haswakarya\.superpowers\sdd\task-3-report.md`.
