# Haswakarya Enterprise Crewing OS — Full Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform Haswakarya into an end-to-end maritime operating ecosystem where public applications flow directly into real PostgreSQL ATS Kanban, certificates are tracked with STCW expiry alerts, digital PKL contracts are generated under PM 59/2021 & MLC 2006, and payroll allotments are managed with real audit trails.

**Architecture:** Next.js 15 App Router with TypeScript, PostgreSQL 14.5 / 16 via Prisma ORM, Jose JWT session auth with HTTP-only cookies, Tailwind CSS clean enterprise light design system, RESTful JSON API endpoints with real database mutations and audit logging.

**Tech Stack:** Next.js 15, React 19, TypeScript 5, Prisma 6, PostgreSQL 14.5, Tailwind CSS 3, Lucide React, Jose.

## Global Constraints
- 100% Real PostgreSQL database operations — ZERO mock/dummy fallback simulations.
- Light Enterprise UI matching Haswakarya public brand (Deep Oceanic Navy `#06122A`, Slate-50, Slate-100, warm brass, emerald active pills, zero dark AI-slop).
- Strict RBAC enforcement via JWT cookies and middleware (`SUPERADMIN`, `CREWING_MANAGER`, `SHIPOWNER_CLIENT`).
- Zero build or type errors (`npx tsc --noEmit` and `npm run build` must pass cleanly).

---

### Task 1: Public-to-Database Real ATS Pipeline Integration
**Files:**
- Create: `src/app/api/public/apply-seafarer/route.ts`
- Create: `src/app/api/public/inquiry-manning/route.ts`
- Modify: `src/components/home/SeafarerApplicationModal.tsx`
- Modify: `src/components/home/FleetManningInquiryModal.tsx`
- Test: API POST verification with real database records

**Interfaces:**
- Produces: `POST /api/public/apply-seafarer` (body: candidate dossier) -> returns `{ success: true, seafarerId, applicationId }`
- Produces: `POST /api/public/inquiry-manning` (body: requisition details) -> returns `{ success: true, requisitionId, requisitionNo }`
- Consumes: Prisma `SeafarerProfile`, `CrewApplication`, `CrewRequisition`, `AuditTrail`

- [ ] **Step 1: Create `POST /api/public/apply-seafarer` endpoint**
  Accept candidate data (fullName, email, phoneWhatsApp, seamanBookNo, departmentRank, cocClass, marlinsScore, seaTimeMonths, vesselTypeExperience, readinessDate, additionalNotes).
  Create or upsert `SeafarerProfile` and insert a new `CrewApplication` with stage `APPLICATION_SUBMITTED`, write `AuditTrail`.

- [ ] **Step 2: Create `POST /api/public/inquiry-manning` endpoint**
  Accept shipowner inquiry data (companyName, contactPerson, workEmail, phoneWhatsApp, vesselName, vesselType, targetRanks, joinPort, expectedJoiningDate, notes).
  Create a new `CrewRequisition` in `haswakarya_db`, write `AuditTrail`.

- [ ] **Step 3: Update `SeafarerApplicationModal.tsx`**
  Add async submission to `/api/public/apply-seafarer` before launching WhatsApp / showing success state.

- [ ] **Step 4: Update `FleetManningInquiryModal.tsx`**
  Add async submission to `/api/public/inquiry-manning` with real database insertion and confirmation.

- [ ] **Step 5: Verify real pipeline integration**
  Submit a test dossier from the modal, verify record in PostgreSQL `CrewApplication` and `/portal/crewing` Kanban.

---

### Task 2: STCW Document Vault & Expiry Alert Engine
**Files:**
- Create: `src/app/api/portal/certificates/route.ts`
- Create: `src/components/portal/CertificateVaultModal.tsx`
- Modify: `src/app/(portal)/portal/seafarers/page.tsx`
- Modify: `src/app/(portal)/portal/page.tsx` (Add live Expiring Certificates widget)

**Interfaces:**
- Produces: `GET /api/portal/certificates?seafarerId=...` -> returns list of STCW certs with computed expiry status (`VALID`, `WARNING_EXPIRING_SOON`, `CRITICAL_EXPIRED`).
- Produces: `POST /api/portal/certificates` -> creates new STCW certificate entry with issue and expiry date.

- [ ] **Step 1: Create Certificate API route**
  Implement GET and POST for `CertificateSTCW` with expiry date computation (days remaining, status tag).

- [ ] **Step 2: Build `CertificateVaultModal.tsx`**
  Modal to view, add, and inspect seafarer certificates (Buku Pelaut, BST, CoC, CoP, MCU Fit-to-Work, Yellow Fever) with status badges.

- [ ] **Step 3: Integrate with Seafarer Directory**
  Add "Inspect Certificates" action button on each seafarer row in `/portal/seafarers`.

- [ ] **Step 4: Add live Certificate Expiry warning banner on `/portal` Dashboard**
  Real-time counter and table of certificates expiring within 30-90 days.

---

### Task 3: Digital PKL (Perjanjian Kerja Laut) Contract Generator
**Files:**
- Create: `src/app/api/portal/pkl/route.ts`
- Create: `src/app/(portal)/portal/contracts/page.tsx`
- Create: `src/components/portal/PklDocumentViewer.tsx`
- Modify: `src/components/portal/PortalSidebar.tsx` (Add Contracts nav item)

**Interfaces:**
- Produces: `GET /api/portal/pkl` -> list of employment contracts (PKL).
- Produces: `POST /api/portal/pkl` -> creates compliant PKL record linking seafarer, vessel, wages, and MLC insurance.
- Produces: Printable/Exportable official Kemenhub/MLC 2006 document view.

- [ ] **Step 1: Create PKL API route**
  Implement GET and POST for `EmploymentContractPKL` in Prisma.

- [ ] **Step 2: Build `PklDocumentViewer.tsx`**
  Component rendering the official Indonesian / English tripartite maritime agreement with formal layout, Ministry citation, wage matrix, and sign-off blocks.

- [ ] **Step 3: Create `/portal/contracts/page.tsx`**
  Dashboard page to list contracts, filter by vessel, and generate new PKLs.

- [ ] **Step 4: Update Portal Sidebar navigation**
  Add "Kontrak PKL" link in `PortalSidebar.tsx`.

---

### Task 4: Crew Payroll & Family Remittance Engine
**Files:**
- Create: `src/app/api/portal/payroll/route.ts`
- Create: `src/app/(portal)/portal/payroll/page.tsx`
- Modify: `src/components/portal/PortalSidebar.tsx` (Add Payroll nav item)

**Interfaces:**
- Produces: `GET /api/portal/payroll` -> list of payroll records with calculations.
- Produces: `POST /api/portal/payroll` -> create payroll run with Onboard Cash and Family Allotment split.

- [ ] **Step 1: Create Payroll API route**
  Implement GET and POST for `PayrollRecord`.

- [ ] **Step 2: Create `/portal/payroll/page.tsx`**
  Payroll dashboard showing monthly salary runs, family bank allotment breakdowns, and payment status flags (`PENDING`, `DISBURSED`, `AUDITED`).

- [ ] **Step 3: Update Portal Sidebar navigation**
  Add "Payroll & Allotment" link in `PortalSidebar.tsx`.

---

### Task 5: Final Production Verification
- [ ] Run `npx tsc --noEmit` to verify type integrity.
- [ ] Run `npm run build` to verify all 28+ routes generate without warnings.
- [ ] Verify database state and live API responses.
