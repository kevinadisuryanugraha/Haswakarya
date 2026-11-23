# Haswakarya Crew Agency Next.js Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a world-class, enterprise Next.js (App Router, TypeScript, Tailwind CSS) website for Haswakarya Crew Agency (PT HASWAKARYA ANDALAN SEDARE) replicating 100% of the UI/UX layout, design system, and micro-interactions of `referensi/soe.org.uk` while integrating all corporate content from `Haswakarya crew agency.pdf` and official branding `logo-haswakarya.png`.

**Architecture:** Component-driven Next.js App Router application with atomic layout units (`TopBar`, `Header`, `HeroSlider`, `StatsOverlap`, `QuickNavCards`, `BusinessScope`, `RecruitmentPipeline`, `QualificationsBento`, `WhyChooseUs`, `LegalModalViewer`, `PartnerMarquee`, `SplitCTA`, `Footer`). All data is strictly typed in `src/data/haswakarya-data.ts`. Custom styling extends Tailwind CSS with the exact SOE Bricks design tokens (`#407997`, `#06122A`, `#DCEDF3`, `#E4572E`, polygon clip-paths, and smooth transitions).

**Tech Stack:** Next.js 15, React 19, TypeScript 5, Tailwind CSS, Lucide React icons.

## Global Constraints

- **Source of Truth for Content:** `Haswakarya crew agency.pdf` (Company profile, vision, mission, core values, 4 business scopes, 5 seafarer qualifications, 9 recruitment stages, SIUKAK & NIB 0702240024481, Batam & Jakarta offices).
- **Source of Truth for Design/Layout:** `referensi/soe.org.uk` (100% matched geometry, clip-paths, navigation hierarchy, 10s hero progress bar slider, -83px overlap stats, card-lift hover states, split CTA shape, infinite logo marquee, multi-column footer).
- **Official Branding:** `logo-haswakarya.png` placed in `public/images/logo-haswakarya.png`.
- **Zero-Error Standard:** Zero runtime errors, zero TypeScript errors, clean production build with static export capability (`output: 'export'`).

---

### Task 1: Scaffolding Next.js App & Asset Preparation

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.mjs`
- Create: `postcss.config.mjs`
- Create: `tailwind.config.ts`
- Assets: Copy `logo-haswakarya.png` to `public/images/logo-haswakarya.png`
- Assets: Curate and create maritime fallback placeholders and SVG document representations in `public/images/`

**Interfaces:**
- Produces: Runnable Next.js project with Tailwind CSS configuration and assets ready for import.

- [ ] **Step 1: Initialize package.json and install dependencies**
Run `npm init -y` and install `next`, `react`, `react-dom`, `lucide-react`, and dev dependencies (`typescript`, `@types/node`, `@types/react`, `@types/react-dom`, `tailwindcss`, `postcss`, `autoprefixer`).

- [ ] **Step 2: Configure tsconfig.json and next.config.mjs**
Set up path alias `@/*` resolving to `./src/*`, strict TypeScript mode, and standard App Router configuration.

- [ ] **Step 3: Setup public assets directory**
Ensure `public/images/logo-haswakarya.png` is populated from the root logo, and prepare maritime vessel and certification image assets.

- [ ] **Step 4: Verify initial setup with clean check**
Verify config files syntax and directory layout.

- [ ] **Step 5: Commit**
`git add package.json tsconfig.json next.config.mjs tailwind.config.ts public/`

---

### Task 2: Design Tokens & Tailwind Theme Configuration

**Files:**
- Create/Modify: `tailwind.config.ts`
- Create: `src/app/globals.css`

**Interfaces:**
- Consumes: SOE design tokens (`#407997`, `#06122A`, `#002057`, `#DCEDF3`, `#BEDDEE`, `#E4572E`, `#EBEDF2`, `#F8F9FA`).
- Produces: Tailwind utility classes (`bg-maritime-primary`, `bg-maritime-navy`, `clip-angled-nav`, `clip-cta-shape`, `card-lift`, `animate-marquee`, etc.).

- [ ] **Step 1: Define color tokens and clip-paths in tailwind.config.ts**
Configure custom theme extensions matching SOE variables:
`maritime-primary: '#407997'`, `maritime-navy: '#06122A'`, `maritime-dark: '#002057'`, `maritime-ice: '#DCEDF3'`, `maritime-accent: '#E4572E'`, `maritime-sky: '#BEDDEE'`.

- [ ] **Step 2: Implement custom CSS in src/app/globals.css**
Implement keyframes for `highlightProgress`, `logo-marquee-scroll`, `.angled-nav`, `.cta-split`, `.card-lift`, and typography resets.

- [ ] **Step 3: Verify CSS tokens**
Ensure build or test step parses `globals.css` without errors.

---

### Task 3: Structured Data Repository (From PDF)

**Files:**
- Create: `src/data/haswakarya-data.ts`

**Interfaces:**
- Produces: Type-safe interfaces and data objects:
  - `COMPANY_INFO` (legal name, founded date, philosophy, addresses, contacts)
  - `CORE_VALUES` (Care, Communication, Improvement)
  - `BUSINESS_SCOPES` (4 scopes with detailed points)
  - `SEAFARER_QUALIFICATIONS` (5 qualifications)
  - `RECRUITMENT_STAGES` (9 key stages with icons and descriptions)
  - `WHY_CHOOSE_US` (6 strategic pillars)
  - `LEGAL_CREDENTIALS` (SIUKAK, NIB, MLC 2006, STCW)
  - `HERO_SLIDES` (4 slides for the interactive hero slider)

- [ ] **Step 1: Write TypeScript interfaces**
Define `BusinessScopeItem`, `RecruitmentStageItem`, `SeafarerQualificationItem`, `WhyChooseUsItem`, `HeroSlideItem`.

- [ ] **Step 2: Populate exact data verbatim from PDF**
Write complete content without missing any item or abbreviation.

- [ ] **Step 3: Verify data integrity**
Run `tsc --noEmit` to ensure zero type errors.

---

### Task 4: Layout Components (TopBar, Header & MobileDrawer)

**Files:**
- Create: `src/components/layout/TopBar.tsx`
- Create: `src/components/layout/Header.tsx`
- Create: `src/components/layout/MobileDrawer.tsx`

**Interfaces:**
- Consumes: `COMPANY_INFO`, `LEGAL_CREDENTIALS` from `@/data/haswakarya-data`.
- Produces: Sticky header with official logo, navigation dropdowns, contact hotlines, search trigger, and responsive mobile drawer.

- [ ] **Step 1: Implement TopBar.tsx**
Top utility bar with WhatsApp hotline (`0859-2205-2112`), Batam Fax (`+62778 326 066`), email (`crewing@haswakarya.com`), and legal verification badge.

- [ ] **Step 2: Implement Header.tsx**
Sticky navbar with logo (`logo-haswakarya.png`), full dropdown mega-menu (About Us, Services, Seafarers, Ship Owners, Legals, Contact), search toggle, and primary CTA buttons ("RECRUIT CREW" & "JOIN AS SEAFARER").

- [ ] **Step 3: Implement MobileDrawer.tsx**
Slide-in mobile menu drawer with smooth backdrop and accordion-style sub-menus.

- [ ] **Step 4: Verify navigation responsiveness**
Verify all interactive states (hover dropdowns, mobile toggle).

---

### Task 5: Hero Highlight Slider (10s Progress Bar & Synchronized Media)

**Files:**
- Create: `src/components/home/HeroSlider.tsx`

**Interfaces:**
- Consumes: `HERO_SLIDES` from `@/data/haswakarya-data`.
- Produces: 1:1 replica of SOE's `highlights-slider`: left side interactive tabs with 10-second animated progress bars; right side synchronized high-resolution maritime image display with smooth fade/scale and polygon accents.

- [ ] **Step 1: Implement HeroSlider state machine**
Timer interval (10,000ms), active slide index, pause on hover, manual tab click override, animated CSS progress line.

- [ ] **Step 2: Implement Left Tab Column**
Tab titles, description snippet, explore link with arrow transition, and animated progress bar (`.highlight-progress`).

- [ ] **Step 3: Implement Right Media Column**
Layered maritime background image, angled polygon overlay (`Polygon-3.svg` style), and active slide badge.

- [ ] **Step 4: Verify slider transitions**
Test autoplay cycle, manual click switching, and responsiveness on tablet/mobile.

---

### Task 6: Floating Stats Overlap & Dual-Audience Navigation Cards

**Files:**
- Create: `src/components/home/StatsOverlap.tsx`
- Create: `src/components/home/QuickNavCards.tsx`

**Interfaces:**
- Consumes: Metrics and quick navigation links.
- Produces:
  - `StatsOverlap`: Floating banner with `-83px` negative margin overlapping hero and body section (100% MLC 2006 Compliant, 9-Stage Vetting, 24/7 Support, 2 Strategic Hubs).
  - `QuickNavCards`: 4-column card grid ("Know where you'd like to go?") with `.card-lift` hover elevation and diagonal arrows.

- [ ] **Step 1: Implement StatsOverlap.tsx**
Responsive grid of 4 metrics with dark navy background, large bold stats numbers, and ice blue accents.

- [ ] **Step 2: Implement QuickNavCards.tsx**
Cards for: (1) Ship Owners & Principals, (2) Seafarer Careers & Marlins Prep, (3) SIUKAK & Legal Verification, (4) 24/7 Operations Support.

- [ ] **Step 3: Verify layout and negative margin on desktop/mobile**
Ensure no overlapping collisions on smaller screens (`@media (max-width: 767px)` margin reset).

---

### Task 7: Core Business Scope & 9-Stage Recruitment Pipeline

**Files:**
- Create: `src/components/home/BusinessScope.tsx`
- Create: `src/components/home/RecruitmentPipeline.tsx`

**Interfaces:**
- Consumes: `BUSINESS_SCOPES`, `RECRUITMENT_STAGES` from `@/data/haswakarya-data`.
- Produces:
  - `BusinessScope`: 4 detailed service cards with icon badges, checklist items, and maritime background overlay.
  - `RecruitmentPipeline`: Interactive 9-step recruitment workflow showing candidate vetting from Social Sourcing to Onboard Evaluation.

- [ ] **Step 1: Implement BusinessScope.tsx**
Global Crew Recruitment, Training & Certification Support, Documentation & Compliance, Dedicated Owner Support.

- [ ] **Step 2: Implement RecruitmentPipeline.tsx**
Visual pipeline with numbered badge steppers (1 to 9), active step details, and maritime vetting indicators (Marlins test, MCU, Onboard 14-day evaluation).

- [ ] **Step 3: Verify content accuracy against PDF Pages 5 & 7**

---

### Task 8: Seafarer Qualifications Bento & Why Choose Us (6 Pillars)

**Files:**
- Create: `src/components/home/QualificationsBento.tsx`
- Create: `src/components/home/WhyChooseUs.tsx`

**Interfaces:**
- Consumes: `SEAFARER_QUALIFICATIONS`, `WHY_CHOOSE_US` from `@/data/haswakarya-data`.
- Produces:
  - `QualificationsBento`: 5 core seafarer qualities (Fitness & Resilience, Continuous Learning, Leadership, Adaptability, Loyalty) with core company values (Care, Communication, Improvement).
  - `WhyChooseUs`: 6 strategic pillars in a high-contrast card grid with hover lifts.

- [ ] **Step 1: Implement QualificationsBento.tsx**
Modern bento box layout combining seafarer qualifications with Haswakarya's motto.

- [ ] **Step 2: Implement WhyChooseUs.tsx**
6 pillars from PDF Page 9 with icon accents and structured bullet points.

- [ ] **Step 3: Verify visual balance and responsive wrapping**

---

### Task 9: Legal Certifications Showcase & Interactive Modal Viewer

**Files:**
- Create: `src/components/home/LegalModalViewer.tsx`

**Interfaces:**
- Consumes: `LEGAL_CREDENTIALS` from `@/data/haswakarya-data`.
- Produces: Dedicated trust section displaying SIUKAK (Kemenhub), NIB (`0702240024481`), and OSS Risk-Based licensing documents with click-to-zoom modal preview.

- [ ] **Step 1: Implement LegalModalViewer.tsx**
Interactive document cards with preview frames, official government badges, and a full-screen zoom modal with ESC key and backdrop click dismissal.

- [ ] **Step 2: Verify modal accessibility and keyboard navigation**

---

### Task 10: Infinite Partner Marquee & Split Diagonal CTA Banner

**Files:**
- Create: `src/components/home/PartnerMarquee.tsx`
- Create: `src/components/home/SplitCTA.tsx`

**Interfaces:**
- Consumes: International maritime regulatory badges (MLC 2006, STCW 2010, IMO, Kemenhub, Marlins, Flag State).
- Produces:
  - `PartnerMarquee`: Continuous smooth scrolling ticker with left/right gradient masks and pause on hover.
  - `SplitCTA`: Diagonal polygon split banner ("Let's Build Synergy") with dual-funnel actions.

- [ ] **Step 1: Implement PartnerMarquee.tsx**
Double-buffered track for seamless CSS translateX infinite loop.

- [ ] **Step 2: Implement SplitCTA.tsx**
Diagonal shape split with high-contrast text and direct WhatsApp / Request Crew action triggers.

- [ ] **Step 3: Verify animation smoothness and performance**

---

### Task 11: Multi-Column Maritime Footer & Root Assembly

**Files:**
- Create: `src/components/layout/Footer.tsx`
- Create: `src/app/page.tsx`
- Create: `src/app/layout.tsx`

**Interfaces:**
- Consumes: All section components and `COMPANY_INFO`.
- Produces:
  - `Footer`: Comprehensive corporate footer with Batam Head Office, Jakarta Branch, direct contacts, quick navigation, and legal disclaimers.
  - `layout.tsx`: Root HTML with Google Fonts (Roboto), SEO Metadata, OpenGraph, Schema.org JSON-LD.
  - `page.tsx`: Seamlessly assembled homepage.

- [ ] **Step 1: Implement Footer.tsx**
Dual office addresses (Batam & Jakarta), direct phone/fax/WhatsApp, official email, quick links, copyright, and back-to-top button.

- [ ] **Step 2: Implement layout.tsx with Schema.org JSON-LD**
Inject structured data for `EmploymentAgency` and `Corporation`.

- [ ] **Step 3: Assemble page.tsx**
Mount all sections in exact semantic sequence.

---

### Task 12: Production Build & Zero-Error Quality Verification

**Files:**
- Test execution across the built application.

**Interfaces:**
- Runs: `npm run build` / `npx next build`
- Verifies: Clean compilation, 0 TypeScript errors, 0 ESLint warnings, all assets present, 100% responsive layout, perfect visual parity with SOE reference.

- [ ] **Step 1: Run TypeScript check**
Run `npx tsc --noEmit` and confirm 0 errors.

- [ ] **Step 2: Run Production Build**
Run `npm run build` and ensure successful static generation.

- [ ] **Step 3: Verify static export output**
Confirm production assets and HTML render cleanly.

- [ ] **Step 4: Final verification report**
Document verification results and deliver live review instructions.
