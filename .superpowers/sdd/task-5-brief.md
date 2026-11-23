# Task 5 Brief: Hero Highlight Slider (10s Progress Bar & Synchronized Media)

## Files:
- Create: `src/components/home/HeroSlider.tsx`

## Requirements:
1. Replicate 100% of the SOE highlights slider mechanics:
   - Left side: List of tabs (`.highlights-left` / `.highlight-item`)
     - Badge/Category tag (`.soe-tag`)
     - Large bold title (`.highlight-title`)
     - Expandable description snippet (`.highlight-content`) that smoothly expands for the active slide (`max-h-[200px] opacity-100`) and collapses for inactive (`max-h-0 opacity-0`)
     - Action link ("Explore Requirement / Learn More" with arrow icon)
     - Animated progress bar (`.highlight-progress`): 10,000ms CSS linear timer from `0%` to `100%` on the active slide, resets when active slide changes.
   - Right side: Synchronized media display (`.highlights-right` / `.highlight-media`)
     - Stack of images corresponding to each slide from `HERO_SLIDES` (e.g. `/images/hero-vessel.svg`, `/images/crew-training.svg`, `/images/doc-mlc2006.svg`, `/images/world-routes.svg`)
     - Fade & subtle scale zoom effect on active image (`opacity-100 scale-100`, inactive `opacity-0 scale-105`)
     - Angled SVG polygon overlay accent on corner (SOE signature `triangle-top-right` / `Polygon-3.svg` style)
     - Floating badge on the media frame displaying the active slide tag and number (`01 / 04`, etc.)
     - Manual previous/next arrow controls (`.splide__arrow--prev`, `.splide__arrow--next`) for accessible navigation.

2. Above the slider:
   - Primary Hero Header & Value Proposition:
     - Badge: "PT HASWAKARYA ANDALAN SEDARE • SIUKAK KEMENHUB RI"
     - H1: "HASWAKARYA CREW AGENCY"
     - Subtitle / Lead Paragraph:
       "Your Trusted Global Crew Manning Partner. Connecting Indonesia's Finest, Fully-Certified Seafarers with World-Class Fleets across Global Waters."
     - Dual CTA buttons:
       - "Request Qualified Crew" (Primary Coral `#E4572E`)
       - "Apply as Seafarer" (Outline/Ghost `#407997`)
       - "Direct WhatsApp Hotline"

3. State Machine & Interactivity:
   - 10-second autoplay interval (`10000ms`).
   - Pause autoplay on mouse hover over the slider container.
   - Clicking any tab immediately selects that slide, resets the progress bar animation, and restarts the 10s timer.
   - Touch swipe support on mobile devices.
   - Full responsiveness (`grid grid-cols-1 lg:grid-cols-12` or `lg:grid-cols-2`).

4. Verification:
   - Run `npx tsc --noEmit` and confirm 0 errors.
   - Write report to `c:\laragon\www\kevin-work\Haswakarya\.superpowers\sdd\task-5-report.md`.
   - Update `progress.md` marking Task 5 complete.
