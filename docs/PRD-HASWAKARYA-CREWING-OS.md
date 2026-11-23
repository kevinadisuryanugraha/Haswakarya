# PRODUCT REQUIREMENT DOCUMENT (PRD)
# HASWAKARYA CREWING OPERATING SYSTEM (H-COS)
## Integrated Enterprise Maritime Human Capital & Manning ERP Platform
**Document Ref:** PRD-HCOS-2026-V1.0  
**Version:** 1.0.0-ENTERPRISE  
**Date:** 2026-11-19  
**Status:** APPROVED FOR IMPLEMENTATION  
**Organization:** PT HASWAKARYA ANDALAN SEDARE  
**Licensing & Authority:** SIUKAK Kemenhub RI • NIB: 0702240024481 • ILO MLC 2006 Reg 1.4  
**Authoring Council:** BMAD Master Council (*BMad, Sally, Winston, Alex, Sarah, Mary*)

---

## 1. Executive Summary & Product Vision

### 1.1 Problem Statement
Industri keagenan awak kapal niaga (*maritime crewing agency*) di Indonesia dan Asia Tenggara saat ini masih menghadapi berbagai inefisiensi kritis:
1. **Verifikasi Kredensial yang Terfragmentasi:** Pengecekan keaslian sertifikat STCW, rekam medis BKKP, dan paspor masih manual, rentan terhadap sertifikat palsu yang dapat memicu penahanan kapal oleh *Port State Control (PSC)*.
2. **Kalkulasi Rumit Matriks Vetting (OCIMF SIRE 2.0 & RightShip):** Shipowner tanker dan bulk carrier sering mengalami kegagalan inspeksi akibat perwira onboard tidak memenuhi jam layar kombinasi (*combined sea-time matrix*).
3. **Visibilitas Nol bagi Shipowner (Principals):** Shipowner luar negeri tidak memiliki akses real-time terhadap *Safe Manning Certificate*, jadwal rotasi kru, dan status dokumen kru di atas kapal mereka.
4. **Resiko Kepatuhan Regulasi & Eksploitasi Biaya:** Masih adanya celah pemungutan biaya calo liar kepada pelaut yang melanggar **Pasal 36 Permenhub PM 59/2021** dan **ILO MLC 2006 Regulation 1.4.5 (Zero Placement Fee Guarantee)**.
5. **Kompleksitas Payroll & Remitansi Keluarga:** Keterlambatan dan ketidaksesuaian transfer uang keluarga (*allotment transfer*) pelaut yang berada di laut lepas.

### 1.2 Product Vision
**Haswakarya Crewing Operating System (H-COS)** adalah platform terintegrasi berbasis web enterprise yang mentransformasikan proses keagenan awak kapal manual menjadi ekosistem digital terpadu:
- Menghubungkan **Pelaut Indonesia**, **Shipowner Internasional**, dan **Superintendent Haswakarya** dalam satu domain terpadu (`haswakarya.com/portal`).
- Menjamin 100% kepatuhan hukum maritim (*zero PSC detention guarantee*).
- Menyediakan *real-time automated vetting calculator* untuk standar SIRE 2.0 dan RightShip.
- Menerapkan arsitektur modern: **Next.js 15, PostgreSQL (Prisma ORM), Redis, Docker Containerization, dan CI/CD Pipeline terotomasi**.

---

## 2. User Personas & Role-Based Access Control (RBAC)

```
┌────────────────────────────────────────────────────────────────────────┐
│                        ROLE HIERARCHY MATRIX                           │
├─────────────────┬───────────────┬──────────────────────────────────────┤
│ Role            │ Scope         │ Access Level & Permissions           │
├─────────────────┼───────────────┼──────────────────────────────────────┤
│ CANDIDATE_SEAMAN│ /portal/seafarer│ Self-dossier, upload STCW, view status│
│ ONBOARD_SEAFARER│ /portal/seafarer│ Contract, allotment slips, relief req│
│ SHIPOWNER_REP   │ /portal/principal│ Fleet view, requisitions, review CVs │
│ FLEET_DIRECTOR  │ /portal/principal│ 1-Click hire approval, contract auth │
│ CREW_OPERATOR   │ /portal/admin │ Candidate screening, vetting pipeline│
│ COMPLIANCE_OFF  │ /portal/admin │ Syahbandar e-PKL, flag state CRA, MCU│
│ TREASURY_FINANCE│ /portal/admin │ Multi-currency payroll & BI-FAST OTP │
│ SUPER_ADMIN     │ /portal/admin │ Full system, RBAC, audit log, devops │
└─────────────────┴───────────────┴──────────────────────────────────────┘
```

### Persona 1: Kapten Ahmad Fauzi (Master Mariner - Candidate/Active Seafarer)
- **Karakter:** Perwira senior berpengalaman 15 tahun di kapal tanker minyak/kimia.
- **Kebutuhan:** Mengunggah sertifikat CoC/CoP sekali klik, memantau riwayat jam layar (*Sea-Time*), membagikan CV berstandar BIMCO ke shipowner, dan memastikan transfer gaji bulanan (*allotment*) ke rekening istrinya di Batam terkirim tepat waktu tanpa potongan.

### Persona 2: Capt. Henrik Lindqvist (Fleet Manning Director - Shipowner Principal)
- **Karakter:** Principal perkapalan berbasis di Singapura/Eropa yang mengoperasikan 18 kapal tanker MR Chemical.
- **Kebutuhan:** Memeriksa kesiapan kru secara real-time, memastikan pasangan Master + C/O memenuhi matriks OCIMF SIRE 2.0 sebelum kapal sandar di terminal ExxonMobil, dan melakukan otorisasi kontrak pengganti (*relief crew*) dalam 1 klik.

### Persona 3: Sarah Wijaya (Senior Crewing Superintendent - Haswakarya HQ)
- **Karakter:** Manajer operasional Haswakarya yang menangani mobilisasi harian dan koordinasi KSOP/Syahbandar.
- **Kebutuhan:** Kanban board terintegrasi untuk melacak status pelaut di 12 tahapan rekrutmen, mencetak draf Perjanjian Kerja Laut (PKL) otomatis, serta menyiapkan *Emergency Riding Gang* untuk kebutuhan kapal di Selat Malaka dalam kurun 24 jam.

---

## 3. Detailed Functional Requirements (FR)

### FR-1: Candidate & Seafarer Portal (`/portal/seafarer`)
1. **FR-1.1: Digital Dossier & Identity Vault**
   - Input dan enkripsi nomor identitas maritim nasional & internasional: SID (Seafarers' Identity Document), Buku Pelaut (Seaman Book), Paspor, dan Buku Kuning Vaksin Internasional.
   - Pengecekan otomatis QR / nomor pelaut ke registry Ditjen Perhubungan Laut Kemenhub RI.
2. **FR-1.2: STCW 2010 Certificate Management & Expiry Radar**
   - Manajemen sertifikat CoC (Class I / II / III) dan CoP (BST, PSCRB, AFF, MEFA, MC, BRM/ERM, ECDIS, SSO, Oil/Chemical Tanker Endorsement).
   - **Smart Expiry Radar:** Peringatan berkala otomatis (H-90, H-60, H-30 hari) via WhatsApp API & Email sebelum sertifikat kadaluwarsa.
3. **FR-1.3: Verified Sea-Time Ledger**
   - Pencatatan buku harian jam layar: Nama kapal, IMO number, Tipe kapal, DWT, GRT, Tipe Mesin Utama (BHP / kW), Posisi/Pangkat, Tanggal Sign-On, Tanggal Sign-Off, serta nama Nakhoda yang menandatangani.
4. **FR-1.4: BIMCO Standard CV Generator**
   - Pembuatan Curriculum Vitae maritim resmi format PDF standar internasional (BIMCO / Intertanko format) dalam 1 kali klik.
5. **FR-1.5: Dual-Rail Allotment & Digital Pay Slip**
   - Penentuan rekening bank keluarga di Indonesia untuk transfer uang bulanan (*allotment* 60%–80%).
   - Akses unduh slip gaji bulanan resmi (*digital pay slip*) terenkripsi.

---

### FR-2: Shipowner / Principal B2B Cockpit (`/portal/principal`)
1. **FR-2.1: Live Fleet Manning & Safe Manning Monitor**
   - Tampilan visual armada kapal Principal dengan daftar perwira dan rating aktif di setiap kapal.
   - Penghitung waktu mundur masa kontrak (*contract countdown*) per kru untuk mencegah kelelahan (*crew fatigue*) sesuai batasan ILO MLC 2006 (maksimal 11 bulan onboard berturut-turut).
2. **FR-2.2: Structured Crew Requisition Builder**
   - Konsol pemesanan kru kapal baru: Pilihan jenis kapal, bendera (*flag state*), pelabuhan embarkasi (*joining port*), tanggal sandar, dan scope jabatan yang dibutuhkan (Full Crew, Top 4 Officers, Ratings, atau Urgent Relief).
3. **FR-2.3: OCIMF SIRE 2.0 & RightShip Matrix Calculator**
   - Algoritma simulator pengalaman perwira:
     - `Master Tanker Sea-Time + Chief Officer Tanker Sea-Time` (Ambang batas minimum: 36 bulan kombinasi).
     - `Chief Engineer Sea-Time + 2nd Engineer Sea-Time` (Ambang batas minimum: 36 bulan kombinasi pada tipe mesin sejenis).
     - Indikator status: `PASSED (SIRE 2.0 Compliant)` warna hijau atau `WARNING (Deficiency Risk)` warna merah dengan rekomendasi kandidat alternatif.
4. **FR-2.4: Candidate Dossier Review & 1-Click Authorization**
   - Tampilan perbandingan kandidat (*side-by-side comparison*) dengan skor Marlins English Test, catatan riwayat jam layar, hasil MCU BKKP, dan video rekaman wawancara bahasa Inggris.
   - Tombol otorisasi instan: `Approve Candidate for Mobilization` atau `Request Live Video Panel`.
5. **FR-2.5: Compliance Audit Pack Download (One-Click PSC Shield)**
   - Unduh bundel dokumen lengkap kapal dalam 1 file ZIP ber-watermark untuk pemeriksaan inspeksi *Port State Control (Paris MoU / Tokyo MoU)*: PKL resmi, Endorsement Bendera Kapal (CRA), Polis Asuransi P&I Club repatriasi, dan Sertifikat Medis DGST.
6. **FR-2.6: Batam/Singapore 24/7 Emergency Riding Squad Request**
   - Pemesanan cepat tenaga darurat: *Tank Cleaning Squad*, *Voyage Repair Fitters*, dan *Overhaul Mechanics* untuk rendezvous di OPL Singapura / Selat Malaka dalam kurun 24–72 jam.

---

### FR-3: Crewing Operations Admin Desk (`/portal/admin`)
1. **FR-3.1: 12-Stage Visual Vetting Kanban Board**
   - Pelacakan alur rekrutmen: `1. Intake` ➔ `2. Audit` ➔ `3. Marlins` ➔ `4. Interview` ➔ `5. Principal Auth` ➔ `6. MCU BKKP` ➔ `7. Flag State & Visa` ➔ `8. Tripartite PKL` ➔ `9. Pre-Joining Briefing` ➔ `10. Mobilization` ➔ `11. Onboard Active` ➔ `12. Sign-Off & Debriefing`.
2. **FR-3.2: Automated Tripartite PKL Drafter**
   - Generator otomatis draf Perjanjian Kerja Laut (PKL) tiga pihak berstandar Ditjen Hubla Kemenhub RI sesuai **Permenhub PM 59/2021 Pasal 36**.
   - Integrasi tanda tangan digital pelaut dan segel keagenan resmi Haswakarya.
3. **FR-3.3: Travel & Port Logistics Dispatcher**
   - Manajemen tiket pesawat tarif pelaut (*marine seaman fares*), koordinasi penjemputan agen pelabuhan lokal (*port agent*), dan pengurusan visa transit (US C1/D, Schengen, Australia MCV).
4. **FR-3.4: 14-Day Performance & Medical Warranty Tracking**
   - Pelacakan otomatis masa garansi 14 hari pasca-sign-on. Jika nakhoda kapal melaporkan ketidakmampuan teknis atau masalah medis dalam 14 hari pertama, sistem memicu pengiriman kru pengganti gratis (*zero agency service fee*).

---

### FR-4: Financial Engineering & Dual-Rail Payroll
1. **FR-4.1: Multi-Currency Salary Calculation**
   - Perhitungan otomatis gaji pokok USD, uang lembur tetap (*fixed overtime*), uang cuti (*leave pay*), dan tunjangan operasional sesuai standar CBA/ITF.
2. **FR-4.2: Automated Family Allotment Split**
   - Pembagian otomatis:
     - 60%–80% dikonversi ke IDR dan disalurkan ke rekening bank keluarga di Indonesia via real-time banking rails (BI-FAST).
     - 20%–40% dialokasikan sebagai *Cash to Master (CTM)* dalam mata uang USD di atas kapal.
3. **FR-4.3: Tax Compliance (PPh 21 Pelaut)**
   - Laporan pemotongan pajak penghasilan pelaut sesuai regulasi perpajakan Republik Indonesia dengan bukti potong elektronik.

---

## 4. Non-Functional Requirements (NFR)

```
┌────────────────────────────────────────────────────────────────────────┐
│                      NON-FUNCTIONAL STANDARDS                          │
├─────────────────┬───────────────────┬──────────────────────────────────┤
│ Attribute       │ Benchmark / Target│ Implementation Architecture       │
├─────────────────┼───────────────────┼──────────────────────────────────┤
│ Performance     │ P95 TTFB < 200ms  │ Next.js Standalone, Redis Cache │
│ Mobile Speed    │ LCP < 1.8s on 3G  │ Responsive Alpine Docker, WebP   │
│ Availability    │ 99.9% Uptime SLA  │ Docker Compose / Cloud Restart   │
│ Security        │ Zero Data Leak    │ AES-256 Vault, JWT, RBAC, SSL    │
│ Compliance      │ 100% Audit Ready  │ Immutable AuditLog Table         │
│ Database ACID   │ Zero Corruption   │ PostgreSQL 16 Foreign Key Engine │
└─────────────────┴───────────────────┴──────────────────────────────────┘
```

1. **NFR-1: Kecepatan dan Efisiensi Bandwidth:**
   - Karena diakses oleh nakhoda dan pelaut di atas kapal dengan koneksi internet satelit (Starlink Maritim / VSAT kuota terbatas), seluruh antarmuka portal dioptimalkan tanpa asset berat (*zero bloat*), CSS utilitas terkompresi, dan SVG iconography ringan.
2. **NFR-2: Keamanan Data & Kerahasiaan Dokumen Pelaut:**
   - Seluruh salinan paspor, buku pelaut, dan rekam medis dienkripsi menggunakan algoritma **AES-256** pada media penyimpanan.
   - Sesi terautentikasi menggunakan cookie `HttpOnly`, `SameSite=Strict`, dan `Secure`.
3. **NFR-3: Audit Trail Tidak Dapat Dimanipulasi (Immutable Audit Log):**
   - Setiap aksi penambahan kru, perubahan tanggal kontrak, pengesahan PKL, dan transaksi keuangan dicatat pada tabel `AuditLog` dengan IP address, user agent, dan timestamp untuk audit verifikasi ISM Code dan ISO 9001.

---

## 5. Data Model Schema (Prisma PostgreSQL)

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum UserRole {
  CANDIDATE_SEAFARER
  ACTIVE_SEAFARER
  SHIPOWNER_PRINCIPAL
  CREWING_SUPERINTENDENT
  COMPLIANCE_OFFICER
  FINANCE_OFFICER
  SUPER_ADMIN
}

enum VesselCategory {
  OIL_CHEMICAL_TANKER
  BULK_ORE_CARRIER
  CONTAINER_FEEDER
  OFFSHORE_AHTS_TUG
  GENERAL_CARGO
}

enum RequisitionStatus {
  PENDING_REVIEW
  CANDIDATES_PROPOSED
  AUTHORIZED_BY_PRINCIPAL
  MOBILIZATION_IN_PROGRESS
  ONBOARD_COMPLETED
  CANCELLED
}

enum ContractStatus {
  DRAFT
  SYAHBANDAR_ENDORSED
  ACTIVE_ONBOARD
  COMPLETED_LEAVE
  TERMINATED_WARRANTY
}

model User {
  id            String    @id @default(uuid())
  email         String    @unique
  phoneNumber   String    @unique
  passwordHash  String
  role          UserRole  @default(CANDIDATE_SEAFARER)
  isActive      Boolean   @default(true)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  seafarerProfile  SeafarerProfile?
  principalProfile PrincipalProfile?
  auditLogs        AuditLog[]
}

model SeafarerProfile {
  id              String    @id @default(uuid())
  userId          String    @unique
  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  seafarerCode    String    @unique // e.g. HSW-SEA-2024-001
  fullName        String
  passportNo      String?   @unique
  passportExpiry  DateTime?
  seamanBookNo    String?   @unique
  seamanBookExpiry DateTime?
  sidNumber       String?   @unique
  rankCode        String    // e.g. MASTER, CHIEF_OFFICER, 2ND_ENGINEER, AB
  department      String    // DECK, ENGINE, STEWARD
  cocClass        String?   // Class I, II, III
  marlinsScore    Int?      // 0 - 100%
  readinessDate   DateTime?
  status          String    @default("AVAILABLE") // AVAILABLE, ONBOARD, ON_LEAVE
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  certificates    Certificate[]
  seaTimeLogs     SeaTimeLog[]
  contracts       CrewContract[]
  allotments      AllotmentBeneficiary[]
}

model Certificate {
  id               String          @id @default(uuid())
  seafarerId       String
  seafarer         SeafarerProfile @relation(fields: [seafarerId], references: [id], onDelete: Cascade)
  certificateType  String          // STCW_BST, ADV_TANKER, ECDIS, etc.
  certificateNo    String          @unique
  issuingAuthority String
  issueDate        DateTime
  expiryDate       DateTime?
  documentVaultUrl String
  isDgstVerified   Boolean         @default(false)
  createdAt        DateTime        @default(now())
}

model SeaTimeLog {
  id             String          @id @default(uuid())
  seafarerId     String
  seafarer       SeafarerProfile @relation(fields: [seafarerId], references: [id], onDelete: Cascade)
  vesselName     String
  vesselType     VesselCategory
  dwt            Int
  engineModel    String?
  engineKw       Int?
  rankServed     String
  signOnDate     DateTime
  signOffDate    DateTime
  masterName     String?
  dischargePort  String?
}

model PrincipalProfile {
  id              String    @id @default(uuid())
  userId          String    @unique
  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  companyName     String
  registrationNo  String?
  countryCode     String
  headquarters    String
  contactPerson   String
  directPhone     String
  isVerified      Boolean   @default(false)
  createdAt       DateTime  @default(now())

  vessels         Vessel[]
  requisitions    CrewRequisition[]
}

model Vessel {
  id              String          @id @default(uuid())
  principalId     String
  principal       PrincipalProfile @relation(fields: [principalId], references: [id], onDelete: Cascade)
  imoNumber       String          @unique
  name            String
  category        VesselCategory
  flagState       String          // Panama, Singapore, Marshall Islands, Liberia, Indonesia
  dwt             Int
  engineBhp       Int?
  safeManningCert String?
  createdAt       DateTime        @default(now())

  contracts       CrewContract[]
}

model CrewRequisition {
  id              String            @id @default(uuid())
  principalId     String
  principal       PrincipalProfile  @relation(fields: [principalId], references: [id], onDelete: Cascade)
  requisitionRef  String            @unique // e.g. REQ-2024-001
  vesselType      VesselCategory
  crewScope       String
  joiningPort     String
  targetDate      DateTime
  urgencyLevel    String            @default("STANDARD") // STANDARD, URGENT_48H
  status          RequisitionStatus @default(PENDING_REVIEW)
  notes           String?
  createdAt       DateTime          @default(now())
  updatedAt       DateTime          @updatedAt
}

model CrewContract {
  id               String          @id @default(uuid())
  contractNo       String          @unique // PKL-HSW-2024-001
  seafarerId       String
  seafarer         SeafarerProfile @relation(fields: [seafarerId], references: [id], onDelete: Cascade)
  vesselId         String
  vessel           Vessel          @relation(fields: [vesselId], references: [id], onDelete: Cascade)
  startDate        DateTime
  endDate          DateTime
  basicSalaryUsd   Decimal         @db.Decimal(10, 2)
  fixedOvertimeUsd Decimal         @db.Decimal(10, 2)
  leavePayUsd      Decimal         @db.Decimal(10, 2)
  pklSyahbandarRef String?
  status           ContractStatus  @default(DRAFT)
  createdAt        DateTime        @default(now())
  updatedAt        DateTime        @updatedAt

  payrollRecords   PayrollRecord[]
}

model AllotmentBeneficiary {
  id             String          @id @default(uuid())
  seafarerId     String
  seafarer       SeafarerProfile @relation(fields: [seafarerId], references: [id], onDelete: Cascade)
  fullName       String
  relationship   String          // SPOUSE, PARENT, CHILD
  bankName       String          // BCA, MANDIRI, BNI, BRI, BSI
  accountNumber  String
  splitPercent   Int             @default(80) // e.g. 80% to family, 20% CTM
  createdAt      DateTime        @default(now())
}

model PayrollRecord {
  id             String        @id @default(uuid())
  contractId     String
  contract       CrewContract  @relation(fields: [contractId], references: [id], onDelete: Cascade)
  periodMonth    String        // e.g. 2024-11
  grossSalaryUsd Decimal       @db.Decimal(10, 2)
  allotmentIdr   Decimal       @db.Decimal(15, 2)
  cashToMasterUsd Decimal      @db.Decimal(10, 2)
  exchangeRate   Decimal       @db.Decimal(10, 2)
  transferRef    String?
  paidAt         DateTime?
  status         String        @default("PENDING") // PENDING, DISBURSED
}

model AuditLog {
  id         String   @id @default(uuid())
  userId     String?
  user       User?    @relation(fields: [userId], references: [id], onDelete: SetNull)
  action     String
  resource   String
  ipAddress  String?
  userAgent  String?
  details    String?
  timestamp  DateTime @default(now())
}
```

---

## 6. Docker Containerization & Infrastructure Architecture

### 6.1 Multi-Stage Dockerfile (Next.js 15 Standalone)
Dirancang untuk ukuran image super kecil (< 140MB), keamanan non-root user, dan efisiensi caching layer.

```dockerfile
# Stage 1: Base & Dependencies
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
RUN npx prisma generate
RUN npm run build

# Stage 3: Runner
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]
```

### 6.2 docker-compose.yml (Local & Production Server Stack)
```yaml
version: '3.8'

services:
  haswa_app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: haswakarya_core_app
    restart: always
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://haswa_admin:SovereignMarine2026@haswa_postgres:5432/haswakarya_prod?schema=public
      - REDIS_URL=redis://haswa_redis:6379
      - NEXTAUTH_SECRET=haswakarya_marine_secret_jwt_key_2026
      - NEXTAUTH_URL=http://localhost:3000
    depends_on:
      haswa_postgres:
        condition: service_healthy
      haswa_redis:
        condition: service_started
    networks:
      - haswa_network

  haswa_postgres:
    image: postgres:16-alpine
    container_name: haswakarya_db_postgres
    restart: always
    environment:
      POSTGRES_DB: haswakarya_prod
      POSTGRES_USER: haswa_admin
      POSTGRES_PASSWORD: SovereignMarine2026
    ports:
      - "5432:5432"
    volumes:
      - postgres_marine_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U haswa_admin -d haswakarya_prod"]
      interval: 5s
      timeout: 5s
      retries: 5
    networks:
      - haswa_network

  haswa_redis:
    image: redis:7-alpine
    container_name: haswakarya_cache_redis
    restart: always
    ports:
      - "6379:6379"
    volumes:
      - redis_marine_data:/data
    networks:
      - haswa_network

volumes:
  postgres_marine_data:
    driver: local
  redis_marine_data:
    driver: local

networks:
  haswa_network:
    driver: bridge
```

---

## 7. CI/CD Pipeline Automation (.github/workflows/ci-cd.yml)

```yaml
name: Haswakarya CI/CD Automated Maritime Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  quality-gate:
    name: Code Quality & Type Integrity
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code Repository
        uses: actions/checkout@v4

      - name: Setup Node.js 20
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install Dependencies
        run: npm ci

      - name: Run Prisma Schema Validation
        run: npx prisma validate

      - name: Strict TypeScript Compilation Check
        run: npx tsc --noEmit

      - name: Production Build Test
        run: npm run build
        env:
          DATABASE_URL: "postgresql://mock_user:mock_pass@localhost:5432/mock_db?schema=public"

  docker-build-verify:
    name: Docker Container Build Verification
    needs: quality-gate
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code Repository
        uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Build Docker Image
        uses: docker/build-push-action@v5
        with:
          context: .
          push: false
          tags: haswakarya/h-cos:test
```

---

## 8. Milestone Pelaksanaan & Rencana Rilis

- **Milestone 1 (Fondasi & DevOps):** Konfigurasi Docker, Docker Compose, GitHub Actions, dan Prisma PostgreSQL schema.
- **Milestone 2 (Portal Shell & RBAC):** Layout navigasi terintegrasi `/portal`, sistem otentikasi peran, dan guard middleware.
- **Milestone 3 (Pelaut Hub):** Digital Dossier, input Sea-Time, pengunggah sertifikat STCW, dan radar peringatan kedaluwarsa.
- **Milestone 4 (Shipowner Cockpit):** Dashboard armada aktif, kalkulator matriks SIRE 2.0, dan peninjauan kandidat 1-klik.
- **Milestone 5 (Admin Ops & Legal Vault):** Kanban 12-tahap rekrutmen, generator Tripartit e-PKL Syahbandar, dan manajemen Standby Pool 24/7 Batam/Singapura.
- **Milestone 6 (Verifikasi & Uji Ketahanan):** Pengujian penetrasi, audit performa Docker, dan pengesahan fungsional penuh.

---
*Dokumen ini merupakan spesifikasi kebutuhan produk resmi (PRD) yang disahkan oleh Dewan Master BMAD untuk PT HASWAKARYA ANDALAN SEDARE.*
