# Haswakarya Crewing OS — Real Enterprise Portal & RBAC Overhaul Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Overhaul the portal into a clean, professional, light enterprise dashboard matching the public website aesthetics, completely wired to real PostgreSQL database models, full RBAC authentication, real CRUD mutations, and zero simulated/dummy placeholders.

**Architecture:**
- **UI Design System:** Clean enterprise light theme (`bg-slate-50`, `bg-white`, `border-slate-200`, text `text-slate-900` / `text-slate-600`, Haswakarya Navy `#071b34`, warm brass `#b8860b`). Fixed collapsible left navigation sidebar + top breadcrumb bar.
- **Database & Data Layer:** Real PostgreSQL 14.5 instance on port 5432, managed by Prisma Client. Production-grade database seed (`prisma/seed.ts`) populating real maritime accounts, vessels, seafarers, and requisitions.
- **Authentication & RBAC:** Secure JWT (`jose`) in HTTP-only cookie `hcos_session`, bcrypt password verification, role-based authorization (`SUPERADMIN`, `CREWING_MANAGER`, `CREWING_OFFICER`, `SHIPOWNER_CLIENT`, `CANDIDATE_SEAFARER`).
- **Real Server Handlers & APIs:** Direct database queries for stats, seafarers, vessels, safe manning requisitions, and ATS stage transitions with full audit trails.

---

## Tasks Breakdown

### Task 1: Real Database Seed & Data Modeling
**Files:**
- `prisma/seed.ts`
- `package.json`

- [ ] Write `prisma/seed.ts` inserting real corporate data:
  - Users: `admin@haswakarya.com` (Superadmin), `crewing.manager@haswakarya.com` (Crewing Manager), `owner@pertamina.com` (Shipowner Client).
  - Armada Kapal (Real IMO & Specs): MT Haswa Samudra (IMO 9481920, 6500 DWT), MV Haswa Perkasa (IMO 9238491, 32000 DWT), TB Haswa Pioneer (IMO 9671124, 4200 BHP), MT Haswa Baruna (IMO 9510294, 3800 DWT).
  - Real Seafarers: Capt. Hendra Gunawan (ANT-I), Mualim I Irfan Hakim (ANT-II), Ir. Bambang Triyono (ATT-I), Masinis II Agus Setiawan (ATT-II), Juru Mudi Slamet Riyadi.
  - Real Requisitions & Applications linked in database.
- [ ] Add seed script to `package.json` and execute `npx prisma db seed`.
- [ ] Verification: Verify database records with queries.

---

### Task 2: Real Auth Service & RBAC Middleware
**Files:**
- `src/lib/auth/jwt.ts`
- `src/lib/auth/session.ts`
- `middleware.ts`
- `src/app/api/auth/login/route.ts`
- `src/app/api/auth/logout/route.ts`
- `src/app/api/auth/me/route.ts`

- [ ] Implement `src/lib/auth/jwt.ts` (sign & verify JWT tokens using `jose`).
- [ ] Implement `src/lib/auth/session.ts` (cookie parsing, password comparison with bcrypt).
- [ ] Create API Route `/api/auth/login` (checks email & bcrypt password against `prisma.user`, issues cookie).
- [ ] Create API Route `/api/auth/logout` (clears cookie).
- [ ] Create API Route `/api/auth/me` (returns authenticated user profile & role).
- [ ] Configure `middleware.ts` to protect `/portal/*` (redirecting unauthenticated users to `/portal/login`, with public exemptions for login and share token routes).

---

### Task 3: Real Database API Routes
**Files:**
- `src/app/api/portal/stats/route.ts`
- `src/app/api/portal/seafarers/route.ts`
- `src/app/api/portal/vessels/route.ts`
- `src/app/api/portal/requisitions/route.ts`
- `src/app/api/portal/applications/[id]/stage/route.ts`

- [ ] Implement `/api/portal/stats` fetching real counts: total active vessels, crew onboard, pending requisitions, and expiring certificates.
- [ ] Implement `/api/portal/seafarers` supporting search and rank filters.
- [ ] Implement `/api/portal/vessels` returning real fleet data.
- [ ] Implement `/api/portal/requisitions` returning real safe manning demands.
- [ ] Implement `/api/portal/applications/[id]/stage` executing atomic transaction to update stage, write `AtsHistory`, and record `AuditTrail`.

---

### Task 4: Professional Light Backoffice Layout & Navigation
**Files:**
- `src/app/(portal)/layout.tsx`
- `src/components/portal/PortalSidebar.tsx`
- `src/components/portal/PortalTopBar.tsx`

- [ ] Implement `PortalSidebar.tsx` with light enterprise styling: Haswakarya logo, navigation tree (Overview, Pelaut, Armada Kapal, Requisition, ATS Kanban, Matriks SIRE 2.0), user badge, and quick logout.
- [ ] Implement `PortalTopBar.tsx` with breadcrumbs, system live database indicator, and user profile drawer.
- [ ] Update `src/app/(portal)/layout.tsx` to wrap children in the clean light dashboard framework (`bg-slate-50`).

---

### Task 5: Real Enterprise Portal Pages
**Files:**
- `src/app/(portal)/portal/login/page.tsx`
- `src/app/(portal)/portal/page.tsx`
- `src/app/(portal)/portal/seafarers/page.tsx`
- `src/app/(portal)/portal/vessels/page.tsx`
- `src/app/(portal)/portal/crewing/page.tsx`
- `src/app/(portal)/portal/matrix/page.tsx`

- [ ] Create `/portal/login/page.tsx`: Clean light login card matching enterprise portal styling with real credential verification and instant error feedback.
- [ ] Overhaul `/portal/page.tsx`: Real Overview dashboard fetching live database stats from `/api/portal/stats`.
- [ ] Create `/portal/seafarers/page.tsx`: Real Seafarer Directory table with search, status badges, and view detail modal.
- [ ] Create `/portal/vessels/page.tsx`: Real Fleet Vessel Registry table.
- [ ] Overhaul `/portal/crewing/page.tsx`: Real ATS Kanban Board wired to `/api/portal/applications/[id]/stage`.
- [ ] Overhaul `/portal/matrix/page.tsx`: Clean light SIRE 2.0 compliance evaluator with real officer selection.

---

### Task 6: Typecheck, Build, and Verification
- [ ] Run `npx tsc --noEmit` to verify type safety.
- [ ] Run `npm run build` to verify clean production compile.
- [ ] Verify live endpoints in dev server.
