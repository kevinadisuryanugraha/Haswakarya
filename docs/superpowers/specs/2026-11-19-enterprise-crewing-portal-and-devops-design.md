# Technical Design: Haswakarya Enterprise Crewing Portal, Database & DevOps (H-COS)
**Date:** 2026-11-19  
**Status:** PROPOSED (Awaiting User Approval)  
**Authors:** BMAD Master Council (*BMad, Sally, Winston, Alex, Sarah, Mary*)

---

## 1. Context & Business Goals

PT HASWAKARYA ANDALAN SEDARE requires an enterprise-grade, integrated digital platform expanding from the existing corporate landing page into a comprehensive **Maritime Human Capital Operating System (H-COS)**.

### User Decisions:
1. **Domain Topology:** Option B — Integrated unified domain using Next.js App Router route groups (`/portal/...`).
2. **Platform Scope:** Dual-sided comprehensive ecosystem launched simultaneously:
   - **Candidate & Seafarer Portal (`/portal/seafarer`)**
   - **Shipowner & Principal Cockpit (`/portal/principal`)**
   - **Crewing Operations Admin Desk (`/portal/admin`)**
3. **Database Engine:** Enterprise PostgreSQL with Prisma ORM (relational, typed, ACID-compliant).
4. **DevOps Mandate:** Full Docker containerization (multi-stage `Dockerfile` + `docker-compose.yml` with Postgres & Redis) and automated CI/CD pipelines (`.github/workflows/ci-cd.yml`).

---

## 2. System Architecture & Next.js Routing Blueprint

```
src/
├── app/
│   ├── (marketing)/                # Existing sovereign landing page & public routes
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── not-found.tsx
│   ├── (portal)/portal/            # Authenticated Enterprise Cockpit
│   │   ├── layout.tsx              # Portal shell with responsive sidebar & top cockpit
│   │   ├── page.tsx                # Role-based dispatch (redirects to seafarer/principal/admin)
│   │   ├── login/                  # Unified corporate login & OTP verification
│   │   ├── seafarer/               # Mariner Candidate & Crew Portal
│   │   │   ├── page.tsx            # Seafarer Dashboard (readiness, alerts, current vessel)
│   │   │   ├── dossier/            # Digital Dossier & CV Generator (BIMCO format)
│   │   │   ├── certificates/       # STCW, CoC, CoP & expiry warning radar
│   │   │   ├── sea-time/           # Verified sea-time history & vessel particulars
│   │   │   └── allotments/         # Family remittance & salary disbursement slips
│   │   ├── principal/              # Shipowner & Charterer B2B Console
│   │   │   ├── page.tsx            # Fleet Overview & Safe Manning monitor
│   │   │   ├── requisitions/       # Active crewing requests & candidate review
│   │   │   ├── matrix-matcher/     # OCIMF SIRE 2.0 & RightShip officer pairing calculator
│   │   │   └── fleet/              # Live vessel roster & contract countdowns
│   │   └── admin/                  # Haswakarya Crewing Superintendents Desk
│   │       ├── page.tsx            # Operations command center (KPIs, active tours)
│   │       ├── candidates/         # 12-stage vetting pipeline Kanban board
│   │       ├── pkl-generator/      # Tripartite Syahbandar PKL digital drafter
│   │       └── emergency-pool/     # Batam/Singapore 24/7 Riding Gang roster
│   └── api/portal/                 # REST & Server Actions API endpoints
│       ├── auth/                   # Authentication & session token management
│       ├── seafarer/               # Candidate profile, document upload & sea-time APIs
│       ├── principal/              # Requisition dispatch & fleet telemetry APIs
│       └── admin/                  # Vetting approvals, PKL issuance & payroll APIs
├── prisma/
│   └── schema.prisma               # Enterprise PostgreSQL relational schema
├── lib/
│   ├── prisma.ts                   # Singleton Prisma client instance
│   ├── auth.ts                     # JWT / Session security & RBAC helpers
│   └── icons.tsx                   # Centralized maritime Lucide icon mapper
```

---

## 3. Data Model Architecture (PostgreSQL via Prisma ORM)

### Key Entities:
1. **User & Auth:**
   - `User` (`id`, `email`, `phone`, `role`: `SEAFARER` | `PRINCIPAL` | `SUPERINTENDENT` | `ADMIN`, `passwordHash`, `isActive`, `createdAt`).
   - `AuditLog` (`id`, `userId`, `action`, `resource`, `ipAddress`, `metadata`, `timestamp`).
2. **Seafarer Domain:**
   - `SeafarerProfile` (`userId`, `seafarerCode`, `fullName`, `passportNo`, `seamanBookNo`, `sidNo`, `rank`, `department`, `marlinsScore`, `readinessDate`, `status`).
   - `Certificate` (`seafarerId`, `type`, `certNumber`, `issuingAuthority`, `issueDate`, `expiryDate`, `documentUrl`, `isDgstVerified`).
   - `SeaTimeLog` (`seafarerId`, `vesselName`, `vesselType`, `dwt`, `engineMake`, `engineKw`, `rankServed`, `signOnDate`, `signOffDate`, `masterName`).
   - `AllotmentBeneficiary` (`seafarerId`, `beneficiaryName`, `relation`, `bankName`, `accountNumber`, `percentageAllocation`).
3. **Principal & Vessel Domain:**
   - `PrincipalProfile` (`userId`, `companyName`, `billingAddress`, `country`, `contactPerson`, `phone`, `verifiedStatus`).
   - `Vessel` (`principalId`, `imoNumber`, `name`, `type`, `flagState`, `dwt`, `engineModel`, `safeManningCertNo`).
   - `CrewRequisition` (`principalId`, `vesselType`, `targetVesselId`, `joiningPort`, `joiningDate`, `urgencyLevel`, `status`).
   - `RequisitionItem` (`requisitionId`, `rankNeeded`, `quantity`, `specialRequirements`).
4. **Contract & Operations Domain:**
   - `CrewContract` (`seafarerId`, `vesselId`, `contractNumber`, `startDate`, `endDate`, `basicSalaryUsd`, `pklSyahbandarRef`, `status`).
   - `PayrollDisbursement` (`contractId`, `period`, `grossSalaryUsd`, `allotmentAmountIdr`, `cashToMasterUsd`, `status`).
   - `PerformanceAppraisal` (`contractId`, `evaluatorName`, `technicalCompetencyScore`, `safetyAdherenceScore`, `rehireRecommended`, `comments`).

---

## 4. Docker Containerization Architecture

### Multi-Stage `Dockerfile` (Node.js 20 Alpine):
- **Stage 1 (`deps`):** Install build tools and clean dependencies with `npm ci`.
- **Stage 2 (`builder`):** Generate Prisma client (`npx prisma generate`) and compile Next.js in standalone mode (`output: 'standalone'`).
- **Stage 3 (`runner`):** Minimal Alpine image (~120MB), non-root security user (`nextjs:nodejs`), exposes port 3000, runs Next.js server via `node server.js`.

### `docker-compose.yml` Stack:
```yaml
services:
  app:
    build: .
    ports: ["3000:3000"]
    environment:
      - DATABASE_URL=postgresql://haswa_user:haswa_secret@postgres:5432/haswakarya_db?schema=public
      - REDIS_URL=redis://redis:6379
      - NEXTAUTH_SECRET=super-secret-jwt-key
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_started

  postgres:
    image: postgres:16-alpine
    restart: always
    environment:
      POSTGRES_DB: haswakarya_db
      POSTGRES_USER: haswa_user
      POSTGRES_PASSWORD: haswa_secret
    ports: ["5432:5432"]
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U haswa_user -d haswakarya_db"]
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    restart: always
    ports: ["6379:6379"]
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

---

## 5. CI/CD Methodology (.github/workflows/ci-cd.yml)

### Automated Pipeline Stages:
1. **Lint & Static Typecheck:** `npm run lint` and `npx tsc --noEmit`.
2. **Prisma Schema Validation:** Validates schema syntax and verifies test migration.
3. **Build Verification:** Executes `npm run build` in standalone mode.
4. **Docker Image Build & Security Scan:** Builds multi-architecture container and runs vulnerability scan with Trivy.
5. **Continuous Deployment (CD):** Triggers automated zero-downtime deployment (via SSH / Docker Compose pull & rolling restart).

---

## 6. Implementation Sequence & Boundaries

1. **Step 1:** Enable `output: 'standalone'` support in `next.config.mjs` while maintaining compatibility.
2. **Step 2:** Scaffold `Dockerfile`, `docker-compose.yml`, and `.dockerignore`.
3. **Step 3:** Scaffold `.github/workflows/ci-cd.yml` for automated testing and builds.
4. **Step 4:** Configure Prisma ORM with PostgreSQL database schema (`prisma/schema.prisma`).
5. **Step 5:** Build Portal Shell Layout (`src/app/(portal)/layout.tsx`) with SOE-standard responsive maritime sidebar, topbar command bar, and role badges.
6. **Step 6:** Implement Seafarer Candidate Portal (`/portal/seafarer`) with Digital Dossier, Sea-Time Log, and Document Radar.
7. **Step 7:** Implement Shipowner B2B Cockpit (`/portal/principal`) with Fleet Manning Monitor, SIRE 2.0 Matrix Matcher, and Candidate Requisition Console.
8. **Step 8:** Implement Admin Crewing Desk (`/portal/admin`) with Vetting Pipeline Kanban and Syahbandar PKL Drafter.
9. **Step 9:** Execute verification suite (`tsc`, `build`, Docker healthcheck, and HTTP responses).
