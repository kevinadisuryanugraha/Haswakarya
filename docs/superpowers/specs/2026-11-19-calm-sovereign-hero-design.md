# Design Specification: "Calm Sovereign" Hero Section

**Document ID:** `2026-11-19-calm-sovereign-hero-design`  
**Status:** Approved by User  
**Author:** BMAD Master Council  
**Target Component:** `src/components/home/HeroSlider.tsx` (simplified into a majestic, calm, institutional Hero)  
**Related Components:** `src/app/globals.css`, `src/components/home/StatsAndQuickNav.tsx`  

---

## 1. Problem Statement & Motivation

The previous Hero layout suffered from **visual clutter ("terlalu ramai")** due to competing elements:
1. **Dual Messaging:** The left side had an H1, subtitle, description, 2 CTAs, and 4 tab console buttons; the right side had another card with its own title, subtitle, another CTA button, and arrow buttons.
2. **Information Overload:** Two heroes were essentially fighting for attention side-by-side.
3. **Cockpit Aesthetic:** The 4 bottom tab boxes with progress bars looked like a software dashboard rather than a prestigious international maritime institution.

### The Approved Direction: "Calm Sovereign" (SOE / Maersk Standard)
A grand, calm, single-canvas Hero section with:
- **One Singular Authoritative Voice:** Clear hierarchy with generous negative space.
- **Heroic Visual Scale:** The full-bleed maritime cargo vessel photograph is allowed to breathe without being blocked by redundant cards.
- **Immediate Dual-Audience Action:** 2 prominent CTA buttons (*Request Qualified Crew* & *Apply as Seafarer*).
- **Accreditation Trust Row:** Clean verified badges (*SIUKAK Kemenhub*, *MLC 2006*, *Marlins Vetted*).

---

## 2. Layout & Visual Composition

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ FULL-BLEED REALISTIC MARITIME VESSEL BACKGROUND (hero-bg-maritime.jpg)                 │
│ Dark left-heavy gradient overlay (from-navy via-navy/85 to-transparent)               │
│                                                                                        │
│  [SHIELD] PT HASWAKARYA ANDALAN SEDARE • SIUKAK KEMENHUB RI & NIB 0702240024481       │
│                                                                                        │
│  HASWAKARYA CREW AGENCY                                   (Generous open negative      │
│  Connecting Indonesia's Finest Seafarers                   space letting the           │
│  with World-Class Fleets                                   ocean vessel photo          │
│                                                            shine with prestige)        │
│  Your Trusted Global Crew Manning Partner. Managing                                    │
│  recruitment with uncompromising integrity, DGST/Marlins                               │
│  verification, full MLC 2006 compliance, and dedicated                                 │
│  24/7 owner support across international waters.                                       │
│                                                                                        │
│  ┌─────────────────────────┐  ┌───────────────────────┐                                │
│  │ 🚢 Request Qualified Crew │  │ ⚓ Apply as Seafarer   │                                │
│  └─────────────────────────┘  └───────────────────────┘                                │
│                                                                                        │
│  ✓ SIUKAK & NIB Licensed   •   ✓ ILO MLC 2006 Compliant   •   ✓ DGST & Marlins Vetted  │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Component Architecture & Props

- File: `src/components/home/HeroSlider.tsx` (retaining the exported name `HeroSlider` so imports in `src/components/home/index.ts` and `src/app/page.tsx` remain backward-compatible).
- Clean, semantic HTML `<section>` with high contrast and full accessibility attributes (`aria-label`, headings hierarchy).
- Responsive:
  - Desktop: Left 60% text content with gradient fade, right 40% open sea view.
  - Mobile: Clean single-column stack with strong dark backdrop for 100% legibility.

---

## 4. Verification Plan
1. `npx tsc --noEmit` — 0 errors.
2. `npm run build` — Clean static production build.
3. DOM verification: Confirm HTTP 200, 0 clutter, full contrast.
