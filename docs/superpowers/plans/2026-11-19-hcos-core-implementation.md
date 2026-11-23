# Haswakarya Crewing Operating System (H-COS) Core Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the enterprise-grade maritime recruitment & crewing platform infrastructure, database layer, atomic storage vault, AI matrix matching engine, and portal UI in Haswakarya, elevated from the production-proven patterns of `talent-gateway`.

**Architecture:** 
- Next.js 15 (App Router) + React 19 + TypeScript strict.
- PostgreSQL 16 managed via Prisma ORM (11 core maritime tables).
- Multi-stage Docker containerization (`app`, `worker`, `postgres`, `redis`, `storage`).
- GitHub Actions CI/CD with self-hosted runner (Zero SSH ingress).
- Atomic File Storage with UUID obfuscation, `.tmp` staging, and SHA-256 verification.
- Deterministic AI Officer Pairing & Matrix Screening Engine (SIRE 2.0 / RightShip).

**Tech Stack:** Next.js 15, Prisma ORM, PostgreSQL 16, Redis, Tailwind CSS, Lucide Icons, TypeScript, Docker, GitHub Actions.

---

## Global Constraints
- Follow clean TypeScript without `any` shortcuts where strict types are known.
- Keep dev server and builds passing with zero errors.
- Preserve existing company landing page routes (`/`, `/about`, `/services`, `/for-owners`, `/for-seafarers`, `/contact`) while mounting crewing OS under `/portal` and `/api`.

---

## Task Breakdown

### Task 1: Docker Containerization & CI/CD Pipeline
**Files:**
- `Dockerfile`
- `docker-compose.yml`
- `.dockerignore`
- `.env.example`
- `.github/workflows/ci-cd.yml`

- [x] Create `.dockerignore` ignoring node_modules, .next, .git, and local secrets.
- [x] Create production multi-stage `Dockerfile` (deps, builder, runner with node:20-alpine and non-root user).
- [x] Create `docker-compose.yml` orchestrating `haswakarya-app`, `postgres:16-alpine`, `redis:7-alpine`, `haswakarya-worker`, and persistent storage volume `haswakarya_vault`.
- [x] Create `.env.example` documenting all DB, Redis, Auth, and Storage environment variables.
- [x] Create `.github/workflows/ci-cd.yml` defining automated linting, typecheck, Prisma validation, and self-hosted deploy step.
- [x] Verification: Validate Dockerfile syntax and docker-compose structure.

---

### Task 2: Maritime Database Architecture (Prisma + PostgreSQL 16)
**Files:**
- `prisma/schema.prisma`
- `package.json`
- `src/lib/prisma.ts`

- [x] Install `@prisma/client` and `prisma` as devDependency.
- [x] Author `prisma/schema.prisma` with 11 maritime domain models:
  - `User` & `Account` with roles (`SUPERADMIN`, `CREWING_MANAGER`, `CREWING_OFFICER`, `SHIPOWNER_CLIENT`, `CANDIDATE_SEAFARER`)
  - `Vessel` & `VesselType` (IMO, BHP, DWT, Flag, Trading Area)
  - `CrewRequisition` (Safe manning demands, rank, matrix experience criteria)
  - `SeafarerProfile` (Seaman book, passport, SID, rank, status)
  - `SeaTimeRecord` (Vessel name, IMO, rank, sign-on/off, DWT, BHP, engine type)
  - `CertificateSTCW` (CoC, CoP, issue date, expiry, verification status)
  - `MedicalRecord` (P&I clinic, fit status, expiration)
  - `CrewApplication` & `AtsHistory` (10-stage maritime lifecycle from APPLIED to ONBOARD & SIGN_OFF)
  - `VettingAssessment` (SIRE 2.0 / RightShip Matrix score, Marlins English score, technical rating)
  - `EmploymentContractPKL` (Hubla / Syahbandar tripartite e-PKL, MLC 2006 compliance)
  - `PayrollRecord` (Dual-rail basic wage, onboard advance, shore allotment)
  - `AuditTrail` (Immutable audit log)
- [x] Run `npx prisma generate` to build typed client.
- [x] Create singleton `src/lib/prisma.ts` to manage global connection pooling in Next.js.
- [x] Verification: Run `npx prisma validate` and verify generated client types.

---

### Task 3: Secure Storage Vault & Atomic File Management
**Files:**
- `src/lib/storage/vault.ts`

- [x] Implement `src/lib/storage/vault.ts` with:
  - MIME type whitelist for maritime documents (PDF, JPG, PNG, WEBP).
  - Maximum size limits (15MB for certificates, 5MB for photos).
  - SHA-256 checksum calculation from Buffer.
  - Atomic writing via temporary staging (`.tmp`) and rename to final UUID path.
  - Storage directory resolver for local dev and Docker volume.
- [x] Verification: Test file write and checksum utility with sample buffer.

---

### Task 4: AI Maritime Matrix & Seafarer Parser Engine
**Files:**
- `src/lib/ai/matrixMatcher.ts`
- `src/lib/ai/seafarerParser.ts`
- `src/server/worker.ts`

- [x] Create `src/lib/ai/matrixMatcher.ts`:
  - Calculate combined officer sea-time (Master + Chief Mate, Chief Engineer + 2nd Engineer).
  - Verify SIRE 2.0 / RightShip matrix compliance (years on tanker/bulk, time in rank, time with operator).
  - Deterministic scoring function (0 - 100) and recommendation tags.
- [x] Create `src/lib/ai/seafarerParser.ts`:
  - Structured extraction schema for STCW certificates and sea-time discharge records.
  - Prompt injection defense delimiters (`<seafarer_dossier>`).
- [x] Create `src/server/worker.ts`:
  - Worker polling loop pattern matching `talent-gateway` worker with atomic lock, retry backoff, and watchdog timeout.
- [x] Verification: Verify matrix calculations and worker file compile cleanly.

---

### Task 5: Maritime ATS Portal & Shipowner Vetting UI
**Files:**
- `src/app/(portal)/layout.tsx`
- `src/app/(portal)/portal/page.tsx`
- `src/app/(portal)/portal/crewing/page.tsx`
- `src/app/(portal)/portal/matrix/page.tsx`
- `src/components/portal/ShipownerVettingView.tsx`
- `src/app/(portal)/share/vetting/[token]/page.tsx`
- `src/components/layout/Header.tsx`

- [x] Create shared layout `src/app/(portal)/layout.tsx` with clean SOE enterprise maritime design.
- [x] Create Portal Overview Dashboard `src/app/(portal)/portal/page.tsx` (active vessels, crew on board, expiring certificates, urgent safe manning requisitions).
- [x] Create Crewing ATS Board `src/app/(portal)/portal/crewing/page.tsx` showing candidates across maritime stages.
- [x] Create Matrix Compliance Screen `src/app/(portal)/portal/matrix/page.tsx` for visual officer pairing and SIRE 2.0 audit readiness.
- [x] Create Tokenized Shipowner Vetting View `src/app/(portal)/share/vetting/[token]/page.tsx` enabling principals to review and 1-click approve crew candidates.
- [x] Update Header with direct quick-link to `H-COS Portal`.
- [x] Verification: Browse portal routes in dev server to ensure clean layout rendering.

---

### Task 6: Final Typecheck, Build, and Verification
- [x] Run `npx tsc --noEmit` and `npm run build` to verify zero build errors.
- [x] Verify existing landing pages (`/`, `/for-owners`, `/for-seafarers`, `/services`) remain 100% operational.
- [x] Present completed system report to user.
