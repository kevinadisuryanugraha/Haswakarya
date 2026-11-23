# Task 4 Implementation Report: Layout Components

**Executed At:** 2026-11-18T21:45:00+07:00  
**Status:** COMPLETED (0 Errors)  
**TypeScript Check:** PASSED (`npx tsc --noEmit` exit code 0)

---

## 1. Components Created

### `src/components/layout/TopBar.tsx`
- **Design & Layout:** Matches SOE's crisp top bar with angled clip-path shape (`.clip-angled-nav`) in maritime primary blue (`#407997`).
- **Contact Coordinates:**
  - WhatsApp hotline: `+62 859-2205-2112` (clickable `https://wa.me/6285922052112`)
  - Batam Head Office Fax: `(+62778) 326 066`
  - Crewing Inquiries Email: `crewing@haswakarya.com`
- **Right Badges & Links:**
  - `SIUKAK & NIB: 0702240024481` (links directly to `#legals`)
  - `MLC 2006 Compliant` indicator
  - `Batam HQ & Jakarta Branch` location badge (links to `#contact`)

### `src/components/layout/Header.tsx` (`'use client'`)
- **Sticky Behavior:** Dynamically monitors scroll events (`scrollY > 20`); applies smooth `shadow-md`, `backdrop-blur-md`, and background opacity when scrolled, auto-collapsing the utility TopBar for maximum viewport height.
- **Branding:** Displays official logo `/images/logo-haswakarya.png` (PT Haswakarya Andalan Sedare / Crew Manning Agency) with Next.js `Image` optimization.
- **Navigation Dropdowns:** Renders `NAV_MENU_ITEMS` from `@/data/haswakarya-data` with SOE-style clean menu panels, hover transitions, and item descriptions:
  - About Us (Company Profile, Core Values, Strategic Locations)
  - Services (Global Crew Recruitment, Training & Certification Support, Documentation & Compliance, Dedicated Owner Support)
  - Recruitment Pipeline (9-Stage Screening, Marlins Standard, Medical & Vetting)
  - Seafarers (Qualifications & Standards, Career Opportunities)
  - Why Choose Us (6 Strategic Pillars)
  - Legals (SIUKAK Kemenhub RI, NIB 0702240024481, MLC 2006 & STCW)
  - Contact
- **Interactive Quick Search:**
  - Search trigger button with animated icon toggle.
  - Dropdown search bar with live filtering over services, qualifications, pipeline stages, legal certifications, and offices.
  - Keyboard accessible (ESC to dismiss, focus trap, and Enter navigation).
- **Dual Call-to-Actions (CTAs):**
  - "RECRUIT CREW" button (`bg-accent text-white hover:bg-accent/90`)
  - "JOIN AS CREW" button (`border-2 border-primary text-primary hover:bg-primary hover:text-white`)
- **Mobile Menu Trigger:** Integrated hamburger toggle button (`lg:hidden`).

### `src/components/layout/MobileDrawer.tsx` (`'use client'`)
- **Off-Canvas Slide Panel:** High-performance drawer sliding from right on screen widths `< 1024px` with smooth backdrop overlay.
- **Body Scroll Lock:** Automatically locks `body.style.overflow` when open; dismisses on backdrop click or ESC key.
- **Header:** Haswakarya official logo with close button.
- **In-Drawer Search:** Quick search input allowing mobile users to filter navigation links and sections instantly.
- **Accordion Navigation:** Accordion list for menu items with rotating chevrons and structured sub-links with descriptions.
- **Direct Action Buttons:**
  - Direct WhatsApp 24/7 hotline button (`bg-[#25D366]`)
  - Direct Batam Fax coordinate
  - "Recruit Crew" and "Join as Crew" action buttons
- **Footer Summary:** Structured Batam Head Office and Jakarta Branch addresses, plus SIUKAK & NIB `0702240024481` badge.

### `src/components/layout/index.ts`
- Barrel export exporting `TopBar`, `Header`, and `MobileDrawer`.

---

## 2. Verification & Quality Gates
- **TypeScript Verification:** Ran `npx tsc --noEmit` — passed with 0 errors (exit code 0).
- **Data Integration:** Verified exact correspondence with `COMPANY_INFO` and `NAV_MENU_ITEMS` from `src/data/haswakarya-data.ts`.
- **Assets:** Official logo `/images/logo-haswakarya.png` referenced with proper fallbacks and responsive attributes.
