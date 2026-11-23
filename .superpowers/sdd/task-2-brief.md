# Task 2 Brief: Design Tokens & Tailwind Theme Configuration

## Files:
- Modify: `tailwind.config.ts`
- Create: `src/app/globals.css`

## Requirements:
1. In `tailwind.config.ts`, define the exact SOE reference colors:
   - `primary`: `#407997` (Maritime Steel Blue)
   - `primary-dark`: `#002057`
   - `navy`: `#06122A` (Deep Oceanic Navy)
   - `ice`: `#DCEDF3` (Light Ice Blue matching Logo emblem)
   - `sky`: `#BEDDEE` (Soft Sky Blue)
   - `accent`: `#E4572E` (Dynamic Coral Orange)
   - `surface`: `#F8F9FA`
   - `border-light`: `#EBEDF2`
   - `muted`: `#616161`
2. Configure font family:
   - sans: ['Roboto', 'Plus Jakarta Sans', 'sans-serif']
3. In `src/app/globals.css`, include:
   - `@tailwind base;` `@tailwind components;` `@tailwind utilities;`
   - CSS variables in `:root` for design tokens
   - Custom utility classes matching SOE:
     - `.angled-nav`: `clip-path: polygon(0 0, 100% 0, 95% 100%, 0 100%);`
     - `.cta-split`: layout and `.cta-left__shape` clip-path: `clip-path: polygon(0 0, 95% 0, 100% 100%, 0 100%);` (or responsive polygon)
     - `.card-lift`: `transition: transform 0.3s ease, box-shadow 0.3s ease;` with hover `transform: translateY(-6px);`
     - `.corner-arrow`: `transform: rotateZ(-45deg);`
     - `.logo-marquee`: container with gradient masks `::before` and `::after` and `@keyframes logo-marquee-scroll` (from `translateX(0)` to `translateX(-50%)`)
     - `.highlight-progress`: progress bar with `@keyframes highlightProgress` (from `width: 0%` to `width: 100%`) using CSS variable `--highlight-duration: 10000ms;`
     - Smooth scrolling, clean resets, custom scrollbars.
4. Verify by checking compilation or syntax with `npx tailwindcss --help` or building a dummy CSS parse.
5. Write full report to `c:\laragon\www\kevin-work\Haswakarya\.superpowers\sdd\task-2-report.md`.
