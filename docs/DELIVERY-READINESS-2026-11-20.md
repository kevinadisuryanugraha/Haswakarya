# Delivery Readiness — Haswakarya Crewing OS (H-COS)

**Tanggal audit:** 20 November 2026
**Ruang lingkup:** repo `Haswakarya` (Next.js 15 App Router + Prisma 6 + PostgreSQL 16 + Redis 7)
**Metode:** audit bukti keras (build, typecheck, unit test, migrasi) + penelusuran kode per functional requirement PRD.

---

## 1. Ringkasan Eksekutif

H-COS saat ini adalah **ATS crewing operasional + portal vetting shipowner yang berfungsi**, bukan lagi demo statis. Seluruh temuan kritis audit sebelumnya (kebocoran `passwordHash`, JWT fallback hardcoded, rank fallback `CHIEF_OFFICER`, angka statistik palsu, dossier vetting hardcoded, tombol endorse tanpa persistensi) sudah ditutup dan diverifikasi otomatis.

| Gate | Perintah | Hasil |
| --- | --- | --- |
| Skema | `npx prisma validate` | PASS |
| Migrasi | `npx prisma migrate diff --from-migrations` | PASS (baseline `20261120000000_init`) |
| Typecheck | `npx tsc --noEmit` | PASS (0 error) |
| Unit test | `npx vitest run` | PASS (5 file, 43 test) |
| Build | `npx next build` | PASS (26 route, 1 middleware) |
| Agregat | `npm run verify` | PASS |

**Kesiapan produksi:** layak untuk pilot operasional internal (crewing desk + shipowner vetting). Belum layak untuk klaim fitur penuh PRD — lihat §4.

---

## 2. Yang Sudah Nyata (Terverifikasi Kode)

### 2.1 Autentikasi & Otorisasi
- `src/lib/auth/rbac.ts` — model kapabilitas (`portal.admin`, `portal.operations`, `portal.read_own`, `vetting.decide`) menggantikan pengecekan string role yang tersebar. `PORTAL_ROUTE_RULES` + `resolveRouteAccess` dipakai middleware untuk halaman **dan** API.
- `src/middleware.ts` — `/portal/*` redirect ke login dengan `?redirect=`, penolakan → `/portal?denied=1`; `/api/portal/*` → `401`/`403` JSON berisi `required`.
- `src/lib/auth/jwt.ts` — `resolveSecret()` fail-fast di produksi (`MIN_SECRET_LENGTH = 32`), fallback hanya untuk non-produksi. Secret hardcoded lama sudah hilang dari kode.
- `src/lib/auth/guard.ts` — `guardCapability`, `resolveSeafarerScope` (pemain non-staf hanya bisa menyentuh data dirinya), helper respons `unauthorized`/`forbidden`.
- Semua route portal memakai `select` eksplisit; `passwordHash` tidak pernah lagi ikut terkirim (`include: { user: true }` sudah dihapus).

### 2.2 ATS & Data Maritim
- `CrewApplication` kini punya `source` (`REQUISITION` | `DIRECT_TALENT_POOL`) dan `requisitionId` opsional — pelamar talent pool tidak lagi dipaksa masuk requisition palsu.
- `ManningInquiry` (model baru) menerima lead shipowner tanpa mencemari registry vessel/IMO.
- `src/lib/maritime/rankMapper.ts` — normalisasi jabatan strict: input tak dikenal → `null` → HTTP 400. Fallback `CHIEF_OFFICER` di endpoint publik sudah dihapus.
- `src/lib/maritime/vesselTypeMapper.ts` — `normalizeVesselType` strict, urutan aturan menjamin `asphalt`/`product` tidak tertelan `tanker` generik.
- `src/lib/ai/matrixMatcher.ts` — `evaluateSingleOfficer` menambah evaluasi satu perwira: SIRE 2.0 (≥24 bln tipe kapal, ≥6 bln jabatan), RightShip (≥36 / ≥12), Marlins ≥80, penalti terukur, skor di-clamp 0–100.
- `src/server/worker.ts` — profil perwira dihitung dari `SeaTimeRecord` nyata (bulan di jabatan, bulan di tipe kapal, total bulan). Profil pasangan simulasi (`'Chief Mate Onboard'`, `marlinsScore: 88`) sudah dihapus.

### 2.3 Portal Vetting Shipowner (end-to-end)
- `src/lib/vetting/dossier.ts` — `buildVettingDossier` murni & teruji (11 unit test): masa berlaku token, label bahasa Indonesia, agregasi jam layar tanker, audit SIRE 2.0/RightShip, `complianceGaps`.
- `GET /api/public/vetting/[token]` — dossier nyata dari DB; `404` untuk token tak terdaftar, `410` untuk token kedaluwarsa.
- `POST /api/public/vetting/[token]/endorse` — validasi zod + rate limit; menulis `VettingAssessment`, transisi stage `OWNER_VETTING` → `MCU_CLEARANCE` (approve), `AtsHistory`, dan `AuditTrail` dalam **satu transaksi**.
- `/(portal)/share/vetting/[token]/page.tsx` — dynamic server component; `generateStaticParams` 7 token demo dihapus.
- `src/components/portal/ShipownerVettingView.tsx` — props-driven dari dossier; tombol endorse memanggil API dan menampilkan state hasil server, bukan `useState` lokal.

### 2.4 Endpoint Publik
- `/api/public/apply-seafarer` — zod, rate limit (5 / 10 menit / IP), rank strict, masuk `DIRECT_TALENT_POOL`. `matchScore: 88.5` hardcoded dihapus.
- `/api/public/inquiry-manning` — zod + rate limit, menulis `ManningInquiry` (tidak membuat vessel dengan IMO palsu).
- `/api/auth/login` — rate limit IP + email (10 / 5 menit), kuota di-reset setelah login sukses.

### 2.5 Statistik Dashboard
- `/api/portal/stats` — `safeManningCompliancePercent` dihitung dari vessel ber-requisition `OPEN`; `sireMatrixPassRate` dari `VettingAssessment` (`null` bila belum ada asesmen, bukan `100`).
- `src/app/(portal)/portal/page.tsx` — tidak ada lagi fallback angka demo (`98.4`, `100%`, `4`, `5`, `3`); nilai kosong tampil `—`.

### 2.6 Rekayasa & Operasi
- Migrasi Prisma baseline dibuat dari `prisma migrate diff --from-empty` (475 baris) + `migration_lock.toml`; repo kini punya jalur migrasi versioned, bukan `db push`.
- `vitest` + 5 suite unit test murni (RBAC, rate limit, mapper maritim, matriks SIRE, dossier vetting).
- `.github/workflows/ci-cd.yml` — job `verify`: `prisma validate` → `migrate deploy` ke Postgres 16 ephemeral → drift check → `generate` → `tsc --noEmit` → `vitest run` → `next build`. Deploy hanya jalan bila `verify` hijau; migrasi produksi lewat service `migrate` (profil compose terpisah), health check dengan retry.
- `.gitignore` — `.env`, `.env.*` (kecuali `.env.example`), `/storage`, `/tmp`, `/backups` diabaikan.

---

## 3. Matriks PRD vs Implementasi

Legenda: **ADA** = fitur berfungsi & teruji · **PARSIAL** = sebagian jalur ada, cakupan belum penuh · **BELUM** = belum ada kode.

### FR-1 Candidate & Seafarer Portal

| ID | Requirement | Status | Bukti / Catatan |
| --- | --- | --- | --- |
| FR-1.1 | Digital dossier & identity vault (SID, buku pelaut, paspor, buku kuning) | ADA | Unggah/unduh berkas nyata: `POST`/`GET /api/portal/certificates/[id]/file` menyimpan ke vault di luar `public/`, mendeteksi tipe dari magic bytes (bukan header klien), menolak path traversal, menulis `fileChecksumSha`, dan membalas 409 bila SHA-256 tidak cocok saat diunduh. Verifikasi otomatis ke registry Hubla tetap manual (`HUBLA_SIMKAPEL_API_KEY` kosong). |
| FR-1.2 | STCW management + expiry radar H-90/60/30 & notifikasi WhatsApp | PARSIAL | Manajemen sertifikat + radar kadaluwarsa **ADA** (`/api/portal/certificates`, `CRITICAL_EXPIRED`/`WARNING_EXPIRING_SOON`). Notifikasi WhatsApp/email **BELUM**. |
| FR-1.3 | Verified sea-time ledger (IMO, DWT/GRT, BHP, nakhoda) | ADA | `SeaTimeRecord` lengkap; `isVerifiedHubla` ada. Verifikasi otomatis ke registry belum tersambung. |
| FR-1.4 | BIMCO/Intertanko CV PDF 1 klik | ADA | R3: `src/lib/pdf/bimcoCv.ts` + `GET /api/portal/seafarers/[id]/cv` (Helvetica standar, deterministik, tanpa berkas font eksternal). |
| FR-1.5 | Dual-rail allotment & digital pay slip | PARSIAL | Data allotment (`allotmentPercentage`, `onboardCashAdvance`) + `PayrollRecord` **ADA** dan dibaca `/api/portal/payroll` dengan scope mandiri. Transfer BI-FAST, OTP, dan PDF slip **BELUM**. |

### FR-2 Shipowner / Principal Cockpit

| ID | Requirement | Status | Bukti / Catatan |
| --- | --- | --- | --- |
| FR-2.1 | Live fleet manning & safe manning monitor + countdown ILO MLC 11 bulan | ADA | `/api/portal/stats` + halaman `/portal` menampilkan armada, vacancy, kepatuhan manning; R14 menambah `src/lib/maritime/contractCompliance.ts`, `GET /api/portal/compliance` (ringkasan armada), dan kolom countdown di `/portal/contracts` dengan status `ON_TRACK`/`DUE_SOON`/`MLC_BREACH`. |
| FR-2.2 | Structured crew requisition builder | ADA | `/portal/requisitions` + `POST /api/portal/requisitions`, penomoran `REQ-{tahun}-{rank}-###`, IMO 7 digit divalidasi, `P2002` → 409. |
| FR-2.3 | OCIMF SIRE 2.0 / RightShip matrix calculator | ADA | `src/lib/ai/matrixMatcher.ts` (pairing) + `evaluateSingleOfficer` (tunggal), `/portal/matrix` sebagai simulator; 7 unit test. |
| FR-2.4 | Candidate dossier review + 1-click authorization | ADA | Jalur vetting lengkap: dossier publik bertoken, audit matriks, keputusan approve/replacement tersimpan ke DB + audit trail. Perbandingan side-by-side & video wawancara belum ada. |
| FR-2.5 | Compliance audit pack ZIP ber-watermark | BELUM | — |
| FR-2.6 | Batam/Singapore 24/7 riding squad request | PARSIAL | Lead masuk lewat `/api/public/inquiry-manning` → `ManningInquiry`. Alur dispatch/SLA belum ada. |

### FR-3 Crewing Operations Admin Desk

| ID | Requirement | Status | Bukti / Catatan |
| --- | --- | --- | --- |
| FR-3.1 | 12-stage visual vetting kanban | ADA | `CrewStage` (enum 12 tahap) + `/portal/crewing` + `POST /api/portal/applications/[id]/stage` dengan `AtsHistory`. |
| FR-3.2 | Automated tripartite PKL drafter | ADA | `EmploymentContractPKL` + `/api/portal/pkl`, R3 menambah PDF resmi `GET /api/portal/pkl/[id]/pdf` (format PM 59/2021). Tanda tangan digital pihak ketiga masih **BELUM**. |
| FR-3.3 | Travel & port logistics dispatcher | BELUM | — |
| FR-3.4 | 14-day performance & medical warranty tracking | BELUM | — |

### FR-4 Financial Engineering & Dual-Rail Payroll

| ID | Requirement | Status | Bukti / Catatan |
| --- | --- | --- | --- |
| FR-4.1 | Multi-currency salary calculation | PARSIAL | `PayrollRecord` menyimpan basic/leave/overtime/bonus + total gross; `monthlyBasicWageIdr`/`Usd` di kontrak. Mesin kalkulasi CBA/ITF belum ada. |
| FR-4.2 | Automated family allotment split 60–80% | PARSIAL | Field allotment/onboard ada dan konsisten; eksekusi transfer BI-FAST **BELUM**. |
| FR-4.3 | PPh 21 pelaut + bukti potong elektronik | PARSIAL | `src/lib/tax/pph21.ts` — PTKP, biaya jabatan 5%/maks 6 jt, progresif Pasal 17 (5–35%), annualisasi bulanan + koreksi Desember; `npwp`/`ptkpStatus` di profil pelaut; kolom `taxableGross`/`pph21Amount`/`netWage`/snapshot di `PayrollRecord`; `GET /api/portal/payroll/tax-summary` (JSON + CSV e-Bupot, `portal.admin`); UI payroll menampilkan PPh 21/neto + ekspor. **TER PP 58/2023 belum** (lampiran resmi tak tersedia — ditunda, bukan ditebak). Ekspor multi-valuta & kurs KMK belum. |

### NFR

| Area | Status | Catatan |
| --- | --- | --- |
| AuthN/AuthZ | ADA | Capability-based, middleware menutup halaman & API, scope mandiri untuk pelaut. |
| Rate limiting | ADA | R1: sliding window Redis ZSET (`rl:{bucket}:{key}`) dengan fallback memori; bucket form publik 5/10m, login 10/5m, vetting 20/10m; header `X-RateLimit-Limit`/`Remaining`/`Retry-After` dikirim pada rute yang dibatasi. |
| Audit trail | ADA | `AuditTrail` ditulis pada keputusan vetting, transisi stage, evaluasi AI, seed. |
| Rahasia/PII | ADA | Secret fail-fast, `select` eksplisit, `.env` + `/storage` di-`.gitignore`, log worker menyamarkan email/telepon/NIK. |
| Observability | ADA | R5+R12: log JSON satu baris dengan redaksi dan `requestId` korelasi, metrics per-route in-process, `GET /api/health`, dan `GET /api/metrics` (teks Prometheus, wajib `METRICS_TOKEN`; 404 di produksi bila token kosong). Counter diisi dari handler API (`withApiMetrics`) — penolakan di middleware hanya terlihat di log `authz.denied`, bukan di metrik. |
| Redis / job queue | ADA | R1+R6: BullMQ (`hcos-matrix-evaluation`) dikonsumsi container `worker` terpisah; tanpa `REDIS_URL` evaluasi berjalan inline dan worker jatuh ke polling DB. |

### Gap model data
PRD menyebut 8 role; skema memakai 5 (`SUPERADMIN`, `CREWING_MANAGER`, `CREWING_OFFICER`, `SHIPOWNER_CLIENT`, `CANDIDATE_SEAFARER`). Pemetaan PRD → kode perlu diputuskan sebelum fitur treasury/compliance dipisah.

---

## 4. Risiko Terbuka (Berurut Prioritas)

> Status per 2026-11-20 (remediasi R1–R5): risiko #1, #2, #3, #4 sebagian, dan #6 sudah ditutup. Bukti ada di §7.

1. ~~**Rate limit in-memory**~~ — **TERTUTUP (R1).** `src/lib/security/limiter.ts` memakai ZSET sliding window Redis dengan fallback memori; batas berlaku lintas replika.
2. ~~**Worker polling DB**~~ — **TERTUTUP (R1).** `src/lib/queue/matrixQueue.ts` + `src/server/worker.ts` memakai BullMQ bila `REDIS_URL` disetel; polling 5 detik hanya fallback tanpa Redis.
3. ~~**Token vetting = kredensial tunggal**~~ — **TERTUTUP (R2).** `POST /api/portal/applications/[id]/token` mendukung `rotate`/`revoke`, TTL 30 hari, audit `VETTING_TOKEN_ROTATED`/`VETTING_TOKEN_REVOKED`, plus tombol di `/portal/crewing`.
4. **Verifikasi Hubla/RightShip masih manual** — `isVerifiedHubla` diisi manusia; tidak ada integrasi registry. **Masih terbuka** (butuh kredensial mitra registry).
5. ~~**Belum ada backup/restore teruji**~~ — **TERTUTUP (R8).** `scripts/backup.sh` + `scripts/restore.sh` menulis manifest SHA-256 dan sudah diuji round-trip nyata ke PostgreSQL (14 tabel, 190 kolom, 55 indeks, 28 constraint, 11 enum identik). Rincian: `docs/RUNBOOK-OPERATIONS.md` §10.
6. ~~**Observability nol**~~ — **TERTUTUP (R5).** `src/lib/observability/logger.ts` (JSON satu baris + redaksi), `metrics.ts` (per-route count/error/durasi), `GET /api/health` (DB + Redis + backend limiter/queue), dan logging request di `src/middleware.ts`.

7. ~~**Worker tidak punya container**~~ — **TERTUTUP (R6).** Service `worker` (stage `worker`, uid 1001, healthcheck `pgrep`) memastikan antrean BullMQ benar-benar dikonsumsi; sebelumnya `enqueueMatrixEvaluation` mengembalikan `queued` ke ruang hampa sehingga `matchScore` tak pernah terisi.
8. ~~**Tidak ada header keamanan / CSP**~~ — **TERTUTUP (R7).** HSTS, `nosniff`, `DENY`, `Referrer-Policy`, `Permissions-Policy`, COOP/CORP di `next.config.mjs`; CSP nonce per-request di `src/middleware.ts`.
9. ~~**Jejak audit hanya ditulis, tak pernah dibaca**~~ — **TERTUTUP (R9).** `GET /api/portal/audit` (`portal.admin`, paginasi cursor) + halaman `/portal/audit` dengan filter dan ekspor CSV.
10. ~~**Tidak ada batas galat UI**~~ — **TERTUTUP (R10).** `error.tsx`, `global-error.tsx`, `(portal)/portal/loading.tsx`.
11. ~~**Verifikasi restore belum otomatis di CI**~~ — **TERTUTUP (R11).** Job `backup-roundtrip` menjalankan dump, restore ke database kedua, verifikasi manifest, dan `diff` jumlah baris per tabel pada setiap push; job `backup-verify-production` berjalan harian pada runner produksi.
12. **`/portal` prefetch memicu galat konsol** — prefetch RSC ke rute terproteksi menerima redirect sehingga router jatuh ke navigasi biasa. Kosmetik, tidak memblokir. **Terbuka, rendah.**
13. **`METRICS_TOKEN` belum disetel di produksi** — tanpa token, `/api/metrics` sengaja 404 sehingga tidak ada seri metrics yang dikumpulkan. **Terbuka sampai operator mengisi `.env`.**
14. **Metrik tidak mencakup penolakan middleware** — redirect halaman portal dan 401/403 `/api/portal/*` terjadi sebelum handler, sehingga tidak masuk `hcos_http_requests_total`. **Diterima & didokumentasikan** (`docs/RUNBOOK-OPERATIONS.md` §7); mitigasi: agregasi log `authz.denied`.

---

## 5. Cara Menjalankan & Memverifikasi

```bash
npm ci
npx prisma validate
npx prisma migrate deploy      # butuh DATABASE_URL aktif
npx prisma generate
npm run verify                 # typecheck + 246 unit test + next build
```

Deploy produksi (self-hosted runner):

```bash
docker compose --profile migrate build migrate
docker compose --profile migrate run --rm migrate   # prisma migrate deploy
docker compose up -d --build
```

Health check container menembak `http://127.0.0.1:3000/api/health` (bukan `/`),
sehingga status yang dinilai adalah status nyata DB/Redis/antrean:

```bash
curl -fsS http://127.0.0.1:3000/api/health   # {"status":"ok","checks":{...}}
```

Backup & restore:

```bash
docker compose --profile ops run --rm backup          # dump + vault + manifest
npm run backup:verify -- --dir ./backups --max-age-days 2
sh scripts/restore.sh --archive <dump> --target-db <db> --create --yes   # latih di DB sementara
```

Scrape metrics (Prometheus):

```bash
curl -fsS -H "Authorization: Bearer $METRICS_TOKEN" http://127.0.0.1:3000/api/metrics
# hcos_http_requests_total{route="/portal",status="ok"} 12
# hcos_http_request_duration_seconds_sum{route="/portal",status="ok"} 0.84
```

Setiap respons membawa `X-Request-Id` yang juga muncul di setiap baris log
(`{"event":"http.request","requestId":"..."}`), sehingga satu keluhan pengguna
dapat dilacak ke satu permintaan konkret.

Runbook lengkap: `docs/RUNBOOK-OPERATIONS.md`.

---

## 6. Rekomendasi Urutan Lanjutan

Semua rekomendasi 1–3 dan 5 sudah dieksekusi (§7). Sisa pekerjaan:

1. ~~**Redis-backed rate limiter + BullMQ worker**~~ — selesai (R1).
2. ~~**Revokasi/rotasi token vetting** di `/portal/crewing`~~ — selesai (R2).
3. ~~**Generator PDF** untuk PKL dan CV BIMCO (FR-1.4, FR-3.2)~~ — selesai (R3).
4. **Integrasi pembayaran BI-FAST** (FR-4.2) — **ditunda**, lihat `_bmad-output/deferred-work.md`. Blocker: kredensial mitra bank belum tersedia. **PPh 21** (FR-4.3) kini PARSIAL: mesin potong + e-Bupot CSV sudah jalan (R4a), sisa TER PP 58/2023 dan impor DJP sungguhan.
5. ~~**Observability**~~ — selesai (R5).
6. ~~**Worker container, header keamanan/CSP, backup teruji, jejak audit, ketahanan UI**~~ — selesai (R6–R10).
7. ~~**CI backup-verify otomatis + gerbang deploy ke `/api/health`**~~ — selesai (R11).
8. ~~**Prometheus `/api/metrics` + korelasi `X-Request-Id`**~~ — selesai (R12).
9. ~~**Vault dokumen sertifikat (FR-1.1)**~~ — selesai (R13).
10. ~~**Countdown kontrak ILO MLC 11 bulan (FR-2.1)**~~ — selesai (R14).
11. ~~**PPh 21 pelaut + bukti potong e-Bupot (FR-4.3)**~~ — selesai sebagian (R4a): mesin pajak, kolom payroll, ringkasan masa, CSV. Sisa: TER PP 58/2023, verifikasi format impor DJP, kurs KMK.

---

## 7. Status Remediasi R1–R15

| ID | Lingkup | Modul kunci | Status |
|----|---------|-------------|--------|
| R1 | Limiter Redis + antrean BullMQ | `src/lib/security/limiter.ts`, `src/lib/redis/client.ts`, `src/lib/queue/matrixQueue.ts`, `src/lib/ai/matrixEvaluation.ts`, `src/server/worker.ts` | Selesai |
| R5 | Observability | `src/lib/observability/logger.ts`, `src/lib/observability/metrics.ts`, `src/app/api/health/route.ts`, `src/middleware.ts` | Selesai |
| R2 | Rotasi/revokasi token vetting | `src/app/api/portal/applications/[id]/token/route.ts`, `src/lib/validation/tokenAction.ts`, `/portal/crewing` | Selesai |
| R3 | PDF PKL + CV BIMCO | `src/lib/pdf/pdfWriter.ts`, `bimcoCv.ts`, `pkl.ts`, `api/portal/pkl/[id]/pdf`, `api/portal/seafarers/[id]/cv` | Selesai |
| R4 | BI-FAST + PPh 21 | — | Ditunda (kredensial mitra belum ada) |
| R6 | Container worker antrean | `Dockerfile` (stage `worker`), `docker-compose.yml`, `src/server/worker.ts`, `package.json` | Selesai |
| R7 | Header keamanan + CSP nonce | `next.config.mjs`, `src/lib/security/csp.ts`, `src/middleware.ts`, `src/app/(portal)/layout.tsx` | Selesai |
| R8 | Backup/restore teruji + manifest | `scripts/backup.sh`, `scripts/restore.sh`, `scripts/libpq-url.sh`, `src/lib/ops/backupManifest.ts`, `src/server/backupVerify.ts` | Selesai |
| R9 | Jejak audit terbaca | `src/app/api/portal/audit/route.ts`, `src/lib/validation/auditQuery.ts`, `/portal/audit`, `src/lib/auth/rbac.ts` | Selesai |
| R10 | Ketahanan UI + kebersihan env | `src/app/error.tsx`, `src/app/global-error.tsx`, `src/app/(portal)/portal/loading.tsx`, `.env.example` | Selesai |
| R11 | CI: backup-roundtrip, gerbang health, cek sintaks skrip | `.github/workflows/ci-cd.yml` | Selesai |
| R12 | Metrics Prometheus + korelasi request | `src/lib/observability/prometheus.ts`, `requestId.ts`, `src/app/api/metrics/route.ts`, `src/middleware.ts` | Selesai |
| R13 | Vault dokumen sertifikat | `src/lib/storage/vault.ts`, `src/app/api/portal/certificates/[id]/file/route.ts`, `CertificateVaultModal.tsx` | Selesai |
| R14 | Countdown ILO MLC 11 bulan | `src/lib/maritime/contractCompliance.ts`, `src/app/api/portal/compliance/route.ts`, `src/app/(portal)/portal/contracts/page.tsx` | Selesai |
| R15 | Sinkronisasi dokumen | `docs/DELIVERY-READINESS-2026-11-20.md`, `docs/RUNBOOK-OPERATIONS.md` | Selesai |

### Perilaku baru yang bisa diverifikasi

- **Rate limit lintas replika** — dengan `REDIS_URL` disetel, kuota dihitung di Redis (`rl:{bucket}:{key}`); tanpa Redis, batas tetap berlaku lewat backend memori (bukan tanpa batas).
- **Antrean durable** — lamaran baru menyentuh `enqueueMatrixEvaluation`; worker BullMQ (concurrency 4, 3 percobaan, backoff eksponensial 5 s) mengisi `matchScore`. Tanpa Redis, evaluasi dijalankan inline setelah transaksi.
- **Health check** — `GET /api/health` mengembalikan 200 `{status:'ok'}` atau 503 `{status:'degraded'}` dengan `checks.db`, `checks.redis`, `checks.limiter`, `checks.queue`.
- **Rotasi/revokasi token** — `POST /api/portal/applications/{id}/token` dengan `{action:'rotate'|'revoke'}`; tautan lama langsung mati saat rotasi.
- **Worker hidup** — `docker compose up` kini menjalankan `worker` (uid 1001, tanpa port publik, healthcheck `pgrep -f 'src/server/worker.ts'`); dengan `REDIS_URL` disetel, `matchScore` benar-benar terisi.
- **Header keamanan** — semua rute mengembalikan HSTS, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy`, COOP/CORP; `poweredByHeader: false`.
- **CSP per-request** — rute `/portal/*` dan `/share/*` memakai `script-src 'self' 'nonce-…' 'strict-dynamic'` dengan nonce acak tiap request (diverifikasi: dua request menghasilkan nonce berbeda, dan nonce di HTML sama dengan yang ada di header). Halaman publik statis memakai `script-src 'self' 'unsafe-inline'` karena HTML-nya tidak ditulis ulang per request; direktif lain tetap ketat.
- **Backup ber-manifest** — `npm run backup` menulis `.dump`, `-vault.tar.gz`, dan `.manifest.json` (sha256 + bytes + tabel + retensi); `npm run backup:verify` menghitung ulang checksum dan keluar 1 saat `missing`/`size_mismatch`/`checksum_mismatch`.
- **Restore bergerbang** — `scripts/restore.sh` tanpa `--yes` hanya mencetak rencana (exit 3); round-trip nyata menghasilkan 14 tabel dan sidik skema identik dengan sumber.
- **Jejak audit terbaca** — `GET /api/portal/audit` menolak peran non-admin (403), mendukung filter + cursor, `Cache-Control: no-store`; UI `/portal/audit` punya filter, muat-lebih-banyak, dan ekspor CSV.
- **Ketahanan UI** — galat render menampilkan `digest` (bukan stack trace) di `error.tsx`, kerangka muat di segmen portal, dan `global-error.tsx` mandiri tanpa Tailwind.
- **PDF resmi** — `GET /api/portal/pkl/{id}/pdf` (PKL, PM 59/2021) dan `GET /api/portal/seafarers/{id}/cv` (CV kerangka BIMCO), keluaran `application/pdf`, deterministik (tanpa timestamp), font standar Helvetica tanpa berkas eksternal.
- **Backup teruji di CI** — job `backup-roundtrip` membuat dump, me-restore ke database kedua, memverifikasi manifest (sha256/bytes/tabel), lalu membandingkan jumlah baris setiap tabel; `deploy-production` kini menembak `/api/health` sehingga container dengan DB mati tidak lolos gerbang.
- **Metrics Prometheus** — pencatatan dilakukan `withApiMetrics` di setiap handler API (33 handler, 22 rute) agar status 4xx/5xx yang sebenarnya ikut terhitung; middleware sengaja tidak mencatat karena berada di registri modul terpisah dan `NextResponse.next()` selalu 200. `GET /api/metrics` mengembalikan `text/plain; version=0.0.4` berisi `hcos_http_requests_total{route,status}`, `hcos_http_server_errors_total`, `hcos_http_request_duration_seconds_sum/_count`, `hcos_process_uptime_seconds`, `hcos_build_info`. Tanpa `METRICS_TOKEN` rute ini 404 di produksi.
- **Korelasi request** — `X-Request-Id` dari klien dipakai ulang bila bentuknya sah (`[A-Za-z0-9][A-Za-z0-9._-]{7,63}`), selain itu dibuat baru (32 heksadesimal); nilai sama muncul di header respons dan di log.
- **Vault dokumen** — unggah hanya `portal.admin`, unduh staf-atau-pemilik; tipe dideteksi dari magic bytes, nama asli tidak dipakai sebagai nama berkas di disk, checksum diperiksa sebelum kirim (409 bila berubah), path traversal ditolak `VaultError`.
- **Countdown MLC** — `contractWindow()` memberi `ON_TRACK`/`DUE_SOON` (<=30 hari)/`MLC_BREACH` (kontrak >11 bulan atau batas lewat), dihitung UTC dengan penguncian tanggal 31; `/api/portal/compliance` merangkum armada dan `/portal/contracts` menampilkan sisa hari + tanggal limit.

### Cakupan uji

246 unit test pada 18 suite: `rbac`, `rateLimit`, `limiter`, `maritimeMappers`, `matrixMatcher`, `vettingDossier`, `pdfWriter`, `pdfDocuments`, `observability`, `csp`, `auditQuery`, `backupManifest`, `prometheus`, `vault`, `contractCompliance`, `apiMetrics`, `pph21`, `npwp`.

Verifikasi manual yang dijalankan di luar suite (bukan mock): `next start` + `curl` untuk header/CSP dan `/api/metrics`, browser sungguhan untuk landing & login tanpa pelanggaran CSP, unggah/unduh berkas sertifikat lewat HTTP nyata, dan round-trip `pg_dump`/`pg_restore` ke PostgreSQL 14.5 (lihat `docs/RUNBOOK-OPERATIONS.md` §10).

## 8. Status Optimasi Performa Web (2026-11-24)

Anggaran lengkap: `docs/PERFORMANCE-BUDGET.md`.

- **Delivery** — `compress` eksplisit, `next/image` optimizer hidup di `next start` (AVIF/WebP, `minimumCacheTTL` 31 hari), header cache untuk `/images` dan `/icons`, `deviceSizes`/`imageSizes` diperkecil agar tidak menghasilkan varian yang tak pernah dipakai.
- **Payload JS** — widget pemasaran pindah ke route group `(public)` (portal tidak lagi mengunduhnya), lima modal berat jadi `next/dynamic`, `priority` tinggal di hero dan logo header.
- **Font** — Roboto variable satu berkas latin (37.5 kB, sebelumnya 90.5 kB di tiga subset). Glyph langka (`≥`, `✓`, `⚓`, `🚢`) diganti ikon `lucide-react`; aturan ini masuk `docs/UI-RESPONSIVE-GUIDE.md` §7.
- **Ikon aplikasi** — `/icons/*` (1–46 kB) untuk favicon/PWA; logo 178 kB tidak lagi diunduh dua kali pada muat pertama.
- **Render** — animasi shimmer hanya saat hover/focus, `transition: all` dihapus, `content-visibility: auto` di seksi bawah lipatan, service worker membatasi cache ke aset statis (`/api`, `/portal`, `/share` dikecualikan).
- **Data** — `AuditTrail` diberi indeks `(action, createdAt)` dan `(userId, createdAt)`; `/portal` jadi server component yang memakai `src/lib/portal/overview.ts` (satu gelombang query paralel) — angka KPI ada di HTML pertama, dua permintaan `fetch` hilang dari jalur muat.
- **Hasil terukur (Chromium headless, `next start`)** — transfer awal `/` 158.771 B → 105.787 B; font 90.5 kB → 37.5 kB; CLS 0.2 → 0; LCP pindah ke `h1`; TTFB `/portal` terautentikasi 32–70 ms; build 0 warning, `/portal` First Load JS 108 kB.
- **Belum** — delapan halaman portal lain masih mengambil data di klien (gelombang 2, lihat `_bmad-output/deferred-work.md`).

---

*Dokumen ini dihasilkan dari audit kode langsung; setiap klaim status dapat ditelusuri ke path yang disebutkan.*