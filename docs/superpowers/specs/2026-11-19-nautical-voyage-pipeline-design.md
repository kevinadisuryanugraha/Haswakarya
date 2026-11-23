# Design Specification: The Nautical Voyage Roadmap (9-Stage Recruitment Pipeline)

**Document ID:** `2026-11-19-nautical-voyage-pipeline-design`  
**Status:** Approved by User  
**Author:** BMAD Master Council  
**Target Component:** `src/components/home/ServicesAndPipeline.tsx` (`RecruitmentPipeline` component)  
**Related Files:** `src/data/haswakarya-data.ts`, `src/app/globals.css`  

---

## 1. Context & Motivation

The existing Recruitment Pipeline section employed a master-detail vertical layout (9 button tabs on the left, 1 active detail card on the right). While functional, this design suffered from:
- **Click Fatigue:** Users were forced to click 9 individual tabs to understand the full recruitment journey.
- **Admin Dashboard Aesthetic:** Felt like a CRM/settings panel rather than an institutional maritime journey.
- **Scroll Clipping:** On desktop viewports, stages 08 and 09 were cut off with a vertical scrollbar.
- **Lack of Pipeline Metaphor:** Lacked a cohesive visual flow representing a seafarer's progression from port to sea.

### Approved Solution: "The Nautical Voyage Roadmap" (Approach A)
Transform the 9 stages into **3 Strategic Operational Phases**, each presenting 3 progression cards simultaneously in a high-contrast, animated, maritime roadmap layout.

---

## 2. Information Architecture: 3-Phase Structure

The 9 recruitment stages in `src/data/haswakarya-data.ts` are logically partitioned into 3 operational phases:

### Phase 1: Screening & Competency Vetting (Stages 01 – 03)
- **Subtitle:** Initial Talent Discovery & Credential Authentication
- **Stages:**
  1. `01` Crew Database Check / Candidate Sourcing via Social Media (Talent Discovery • Day 1-2)
  2. `02` Document Verification (Credential Authentication • Day 2-3)
  3. `03` Marlins English Test (Maritime English Assessment • Day 3-4)
- **Key Outcome:** Verified talent pool meeting DGST, STCW, and Marlins standards.

### Phase 2: Technical & Principal Authorization (Stages 04 – 06)
- **Subtitle:** Expert Vetting, Client Approval & Medical Clearance
- **Stages:**
  4. `04` Technical Interview with Our Team (Senior Master Mariner / Chief Engineer • Day 4-5)
  5. `05` Principal / Owner Direct Interview (Shipowner Approval • Day 6-7)
  6. `06` Comprehensive Medical Check-Up (Approved Maritime Hospital / DOH • Day 8-9)
- **Key Outcome:** 100% principal authorization and zero medical discrepancies.

### Phase 3: Compliance & Deployment (Stages 07 – 09)
- **Subtitle:** Legal Mobilization, Sign-on Briefing & Onboard Monitoring
- **Stages:**
  7. `07` Visa & Flag State Endorsement Processing (Consular & Flag State Clearance • Day 10-12)
  8. `08` Pre-Departure Briefing & CBA Signing (MLC 2006 Employment Agreement • Day 13-14)
  9. `09` Onboard 14-Day Performance Evaluation (Post-Deployment Quality Assurance • Day 14-28)
- **Key Outcome:** Safe, compliant embarkation with guaranteed crew performance warranty.

---

## 3. UI Component Architecture & Wireframe

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ SECTION HEADER                                                                         │
│ [SOE Tag: Key Stages of Recruitment]                                                   │
│ Rigorous 9-Stage Vetting Pipeline                                                      │
│ Every candidate is screened with zero compromise — from talent sourcing to onboard eval │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ PHASE SELECTOR TABS (Horizontal Nautical Track)                                        │
│ ┌──────────────────────┐  ┌──────────────────────┐  ┌──────────────────────┐          │
│ │ FASE 01 (Tahap 01-03)│──│ FASE 02 (Tahap 04-06)│──│ FASE 03 (Tahap 07-09)│          │
│ │ Screening & Vetting  │  │ Client Authorization │  │ Deployment & Onboard │          │
│ └──────────────────────┘  └──────────────────────┘  └──────────────────────┘          │
│ (Active Tab has animated coral progress underline + glowing nautical coordinate dot)   │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ 3-CARD PROGRESSION DECK (Simultaneous 3-Stage Visibility)                              │
│                                                                                        │
│ ┌─────────────────────┐  ─(Nautical)─>  ┌─────────────────────┐  ──> ┌───────────────┐ │
│ │ 01 [Icon] [Badge]   │    [Connector]  │ 02 [Icon] [Badge]   │      │ 03 [Icon] ... │ │
│ │ Candidate Sourcing  │                 │ Document Audit      │      │ Marlins Test  │ │
│ │ Day 1-2             │                 │ Day 2-3             │      │ Day 3-4       │ │
│ │ Description...      │                 │ Description...      │      │ Description.. │ │
│ │ ─────────────────── │                 │ ─────────────────── │      │ ───────────── │ │
│ │ Quality Checks:     │                 │ Quality Checks:     │      │ Quality Check │ │
│ │ • STCW Registry     │                 │ • DGST Seaman Book  │      │ • Marlins 80%+│ │
│ │ • Criminal Cleared  │                 │ • Medical Fit       │      │ • IMO Safety  │ │
│ └─────────────────────┘                 └─────────────────────┘      └───────────────┘ │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ FOOTER CONTROLS                                                                        │
│ [< Fase Sebelumnya]            [Fase 1 dari 3]                     [Fase Lanjut >]     │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Key Interactive & Animation Specifications

1. **Phase Transition Animation:**
   - Smooth slide-and-fade crossfade (`transition-all duration-400 ease-out`) when switching between Phase 1, Phase 2, and Phase 3.
2. **Nautical Line Connector:**
   - On desktop, cards are linked via horizontal connector lines with subtle chevron arrows indicating unidirectional progress.
3. **Card Micro-Interactions:**
   - `hover:-translate-y-1` elevation with subtle maritime border highlight (`border-sky/40`).
   - Monospace stage number with crisp contrast (`font-mono font-black text-2xl`).
4. **Mobile Responsiveness:**
   - Phase tabs horizontally scrollable (`overflow-x-auto no-scrollbar`).
   - Cards stack cleanly or can be navigated via touch swipe.
5. **Zero AI Slop Compliance:**
   - No pulsing dots (`animate-pulse`/`animate-ping`).
   - No floating rounded-full capsule pills.
   - Clean rectangular tags (`rounded-md`, `border-white/20`).
   - Deep solid navy background (`#06122A`) with Grainient analog noise texture.

---

## 5. Verification Plan
1. `npx tsc --noEmit` — 0 errors.
2. `npm run build` — Clean static production build.
3. DOM verification: Check HTTP status 200, 0 pulse animations, all 9 stages accessible.
