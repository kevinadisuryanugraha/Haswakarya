# Task 4 Brief: Layout Components (TopBar, Header & MobileDrawer)

## Files:
- Create: `src/components/layout/TopBar.tsx`
- Create: `src/components/layout/Header.tsx`
- Create: `src/components/layout/MobileDrawer.tsx`

## Requirements:
1. `TopBar.tsx` (Client component or Server component):
   - Background: `bg-navy` or `bg-primary` with crisp white text.
   - Display:
     - WhatsApp hotline: `+62 859-2205-2112` (clickable `https://wa.me/6285922052112`)
     - Batam Head Office Fax: `(+62778) 326 066`
     - Email: `crewing@haswakarya.com`
     - Right side: Quick links / badges:
       - "SIUKAK & NIB: 0702240024481" (Link to `#legals`)
       - "MLC 2006 Compliant"
       - "Batam HQ & Jakarta Branch"
   - Match SOE top-bar styling (clean, compact, high-contrast, hidden on mobile small if needed).

2. `Header.tsx` ('use client'):
   - Sticky navigation header with scroll effect (shadow & background blur).
   - Display official logo: `/images/logo-haswakarya.png` (PT Haswakarya Andalan Sedare / Crew Manning Agency).
   - Navigation links using `NAV_MENU_ITEMS` from `@/data/haswakarya-data`:
     - "About Us" (Dropdown: Vision & Mission, Core Values, Office Network)
     - "Services" (Dropdown: Global Crew Recruitment, Training & Certification, Documentation & MLC, 24/7 Owner Support)
     - "Seafarers" (Dropdown: 5 Core Qualifications, 9 Stages of Recruitment, CBT & Marlins Test, Join as Crew)
     - "Ship Owners" (Dropdown: Why Choose Us, Verified Pool, 24/7 Operations, Request Manning)
     - "Legals & Compliance" (Anchor to `#legals`)
     - "Contact" (Anchor to `#contact`)
   - Interactive dropdowns with SOE-style clean menu panels and hover transitions.
   - Angled accent button or primary CTA:
     - Button 1: "RECRUIT CREW" (`bg-accent text-white hover:bg-accent/90`)
     - Button 2: "JOIN AS CREW" (`border border-primary text-primary hover:bg-primary hover:text-white`)
   - Search trigger button (toggles quick search input/modal or bar).
   - Mobile hamburger button (toggles `MobileDrawer`).

3. `MobileDrawer.tsx` ('use client'):
   - Slide-in side drawer for tablet/mobile screen (`< 1024px`).
   - Backdrop overlay with smooth transition.
   - Header with Haswakarya logo and close button.
   - Accordion collapsible sections for each menu item with chevron icons.
   - Direct action buttons (WhatsApp, Recruit Crew, Call Batam HQ).
   - Office addresses summary in drawer footer.

4. Quality Gates:
   - Run `npx tsc --noEmit` and ensure 0 TypeScript errors.
   - Write report to `c:\laragon\www\kevin-work\Haswakarya\.superpowers\sdd\task-4-report.md`.
