# Task 6 Brief: Floating Stats Overlap & Dual-Audience Navigation Cards

## Files:
- Create: `src/components/home/StatsOverlap.tsx`
- Create: `src/components/home/QuickNavCards.tsx`
- Update: `src/components/home/index.ts`

## Requirements:
1. `StatsOverlap.tsx`:
   - Layout: Floating banner with SOE signature overlap (`-mt-16 md:-mt-20 lg:-mt-24` / `margin-top: -83px` equivalent) positioning it across the bottom boundary of the hero section.
   - Styling:
     - Rounded corners (`rounded-2xl` or `border-radius-15px`)
     - Deep navy background (`bg-navy` / `#06122A`) with subtle border (`border border-primary/20`) and heavy drop shadow (`shadow-2xl`)
     - Subtle maritime background pattern or glow
   - Metrics (from `STATS_DATA` in `@/data/haswakarya-data`):
     - Metric 1: `100%` — "Compliance Standard" (MLC 2006 & STCW Certified)
     - Metric 2: `9 Steps` — "Strict Vetting Pipeline" (Zero-Compromise Screening)
     - Metric 3: `24/7` — "Dedicated Owner Liaison" (Single Point of Contact)
     - Metric 4: `2 Hubs` — "Strategic Maritime Hubs" (Batam HQ & Jakarta Branch)
   - Visual details: Large bold numbers (`text-4xl lg:text-5xl font-bold text-white tracking-tight`), ice blue subtitles (`text-ice font-semibold text-sm`), and icon badges for each metric.

2. `QuickNavCards.tsx`:
   - Section heading matching SOE: "Know where you'd like to go?" (`text-h2` / `text-3xl lg:text-4xl font-bold text-navy text-center mb-12`)
   - 4-Column responsive grid (`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6`)
   - 4 Cards (from `QUICK_NAV_CARDS` in `@/data/haswakarya-data` or defined specifically):
     - Card 1: **"For Ship Owners & Principals"**
       - Badge: `PRINCIPALS`
       - Title: "Request Qualified Fleet Manning"
       - Description: "Deploy certified deck & engine officers and ratings vetted through our rigorous 9-stage screening protocol."
       - Link: `#services` / `#contact`
     - Card 2: **"For Seafarers & Crew"**
       - Badge: `CAREERS`
       - Title: "Join Indonesia's Elite Seafarer Pool"
       - Description: "Access transparent global placements with reputable vessel owners, fair contracts, and welfare protection."
       - Link: `#seafarers`
     - Card 3: **"Legals & Accreditation"**
       - Badge: `COMPLIANCE`
       - Title: "SIUKAK & NIB Verification"
       - Description: "Review our official operating licenses from the Ministry of Transportation RI (NIB: 0702240024481)."
       - Link: `#legals`
     - Card 4: **"24/7 Operations Hub"**
       - Badge: `SUPPORT`
       - Title: "Dedicated Owner & Crew Support"
       - Description: "Immediate emergency response, crew welfare monitoring, and operational coordination round the clock."
       - Link: `https://wa.me/6285922052112`
   - Interaction & Design:
     - `.card-lift`: Smooth hover translation `hover:-translate-y-2` with elevated shadow.
     - Background: Pure white with ice-blue accent header or soft slate tint (`bg-white border border-border-light hover:border-primary/40`).
     - Corner arrow icon with `-45deg` rotation that translates on hover (`group-hover:translate-x-1 group-hover:-translate-y-1`).
     - Tag badge (`.soe-tag`) in primary/ice blue.

3. Export components in `src/components/home/index.ts`.
4. Run `npx tsc --noEmit` and confirm zero errors.
5. Write report to `c:\laragon\www\kevin-work\Haswakarya\.superpowers\sdd\task-6-report.md`.
6. Update `progress.md` marking Task 6 complete.
