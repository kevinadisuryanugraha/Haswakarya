# Task 5 Report: Hero Highlight Slider (10s Progress Bar & Synchronized Media)

**Executed By:** Subagent (Task 5 Lead)  
**Date:** 2026-11-18  
**Component:** `src/components/home/HeroSlider.tsx` (`use client`)  
**Status:** COMPLETE (Verification Succeeded with 0 Errors)

---

## 1. Summary of Work Executed

We built and verified the primary `HeroSlider.tsx` client component for Haswakarya Crew Agency, replicating 100% of the architecture, geometry, and micro-interactions of the SOE (`referensi/soe.org.uk`) `highlights-slider`.

### Key Features Implemented:
1. **Primary Hero Header & Dual Funnel Value Proposition:**
   - Legal Authorization Badge: `"PT HASWAKARYA ANDALAN SEDARE • SIUKAK KEMENHUB RI & NIB 0702240024481"` with glowing status dot.
   - H1 Heading: `"HASWAKARYA CREW AGENCY - Connecting Indonesia's Finest Seafarers with World-Class Fleets"`.
   - Lead Paragraph: Accurate value proposition emphasizing integrity, DGST/Marlins vetting, MLC 2006 compliance, and 24/7 dedicated support.
   - Dual-Funnel Action CTAs:
     - Primary Coral (`#E4572E`): `"Request Qualified Crew"` targeting vessel owners & principals.
     - Outline/Ghost (`#407997` / `#DCEDF3`): `"Apply as Seafarer"` targeting candidates.
     - Hotline Action: `"Direct WhatsApp Hotline"` linking to `getWhatsAppUrl()`.

2. **10-Second Progress Bar Timer & State Machine (`.highlights-left`):**
   - 4 Interactive tabs directly driven by `HERO_SLIDES`:
     1. *Global Crew Recruitment & Deployment* (`Recruitment`)
     2. *Rigorous 9-Stage Screening & Marlins Standard* (`Quality Vetting`)
     3. *100% Certified MLC 2006 & SIUKAK Compliant* (`Compliance`)
     4. *Dedicated 24/7 Owner Support & Operational Liaison* (`24/7 Support`)
   - Expandable content accordion (`.highlight-content`) that transitions smoothly between active and inactive states.
   - Linear 10,000ms CSS progress bar (`.highlight-progress`) using `@keyframes highlightProgress`, reset cleanly across slide switches via dynamic keying.
   - Pause on hover: Mouse enter pauses both the JS autoplay interval and the CSS progress bar animation via `.slider-paused .highlight-progress::before { animation-play-state: paused; }`.

3. **Synchronized Media Stack (`.highlights-right`):**
   - Stack of high-resolution maritime SVG illustrations (`hero-vessel.svg`, `crew-training.svg`, `doc-mlc2006.svg`, `world-routes.svg`).
   - Smooth 700ms opacity fade and subtle scale zoom (`scale-100` active vs `scale-105` inactive).
   - Corner angled polygon accents: Dual SOE signature `triangle-top-right` polygon SVGs (`#407997` teal fill at 55% opacity and dark shadow fill at 32% opacity).
   - Bottom ambient gradient overlay for readability.
   - Top floating badge with slide category tag and index counter (`01 / 04`).
   - Bottom caption with active title, subtitle, and instant CTA button.
   - Accessible navigation controls (`splide__arrow--prev` and `splide__arrow--next`) with keyboard navigation (`ArrowLeft` / `ArrowRight`) and mobile touch swipe gesture support.

4. **Background Decorative Accents:**
   - Signature SOE bottom-left angled polygon (`triangle-bottom-left`) across the base of the section.
   - Radial gradients creating oceanic depth behind the header.

---

## 2. File Artifacts Created & Modified

| File | Status | Description |
|---|---|---|
| `src/components/home/HeroSlider.tsx` | Created | Full client component with state machine, tabs, media stack, touch gestures, and dual CTAs |
| `src/components/home/index.ts` | Created | Re-export index for home components |
| `src/app/globals.css` | Updated | Added `.slider-paused` pause-on-hover rule for `.highlight-progress::before` |

---

## 3. Verification & Quality Check

```bash
npx tsc --noEmit
# Exit code: 0
# Diagnostic: 0 errors found across entire project
```

- Verified all imports from `@/data/haswakarya-data` (`HERO_SLIDES`, `COMPANY_INFO`, `getWhatsAppUrl`).
- Verified responsive grid behavior and touch swipe threshold (`45px`).
- Verified ARIA attributes (`role="region"`, `role="tablist"`, `role="tab"`, `role="tabpanel"`, `aria-selected`, `aria-controls`).

---

## 4. Next Step Handoff

Task 5 is 100% complete. Ready for **Task 6: Floating Stats Overlap & Dual-Audience Navigation Cards** (`StatsOverlap.tsx` with `-83px` negative margin and `QuickNavCards.tsx`).
