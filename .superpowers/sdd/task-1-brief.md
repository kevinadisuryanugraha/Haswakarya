# Task 1 Brief: Scaffolding Next.js App & Asset Preparation

## Files:
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.mjs`
- Create: `postcss.config.mjs`
- Create: `tailwind.config.ts`
- Assets: Copy `logo-haswakarya.png` to `public/images/logo-haswakarya.png`
- Assets: Curate and create maritime fallback placeholders and SVG document representations in `public/images/`

## Requirements:
1. Initialize `package.json` with Next.js 15, React 19, React-DOM 19, TypeScript, Tailwind CSS, Autoprefixer, PostCSS, Lucide-React.
2. Run `npm install` cleanly in `c:\laragon\www\kevin-work\Haswakarya`.
3. Create `tsconfig.json` with `"paths": { "@/*": ["./src/*"] }` and strict mode.
4. Create `next.config.mjs` with `output: 'export'` option ready (or standard Next.js config with unoptimized images if needed for static export, e.g. `images: { unoptimized: true }`).
5. Ensure `public/images/` directory exists and has `logo-haswakarya.png` copied from `c:\laragon\www\kevin-work\Haswakarya\logo-haswakarya.png`.
6. Ensure `src/` directory exists with `src/app/` ready.
