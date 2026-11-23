# Runbook Operasi — Haswakarya Crewing OS (H-COS)

Dokumen ini untuk operator yang menjalankan H-COS di produksi: cara menyalakan,
memeriksa kesehatan, mencadangkan, dan memulihkan. Setiap perintah menyebut
kondisi yang harus terlihat agar hasilnya bisa dinilai, bukan sekadar dijalankan.

---

## 1. Topologi runtime

| Service | Image | Port publik | Peran |
|---------|-------|-------------|-------|
| `web` | `Dockerfile` stage `runner` (node:20-alpine, uid 1001) | 3000 | Next.js standalone |
| `worker` | `Dockerfile` stage `worker` (uid 1001, tsx) | — | Konsumen BullMQ `hcos-matrix-evaluation` + polling fallback |
| `postgres` | `postgres:16-alpine` | — | Data utama |
| `redis` | `redis:7-alpine` | — | Rate limiter + antrean |
| `migrate` | profil `migrate` | — | `prisma migrate deploy` sekali jalan |
| `backup` | profil `ops` | — | `scripts/backup.sh` (pg_dump + tar vault) |

Hanya `web` yang diekspos. `worker`, `postgres`, dan `redis` berada di jaringan
internal compose.

Worker **wajib** berjalan bila `REDIS_URL` disetel. Tanpa worker, lamaran tetap
masuk antrean tetapi `matchScore` tidak pernah terisi — dashboard matriks akan
kosong tanpa pesan galat. Cek cepat: `docker compose ps worker` harus `healthy`.

---

## 2. Deploy dan verifikasi

```bash
docker compose --profile migrate build migrate
docker compose --profile migrate run --rm migrate   # migrasi skema
docker compose up -d --build                        # web, worker, postgres, redis
docker compose ps                                   # semua state: running (healthy)
```

Verifikasi setelah deploy:

```bash
# 1. Health endpoint — 200 dan status ok
curl -fsS http://127.0.0.1:3000/api/health | jq .
#    {"status":"ok","checks":{"db":"up","redis":"up","limiter":"redis","queue":"redis"}}

# 2. Header keamanan hadir di respons HTML
curl -sSI http://127.0.0.1:3000/portal/login | grep -iE 'content-security-policy|strict-transport|x-frame'

# 3. Nonce berbeda antar request (bukti CSP per-request, bukan statis)
curl -sS http://127.0.0.1:3000/portal/login | grep -o 'nonce="[a-f0-9]*"' | head -1
curl -sS http://127.0.0.1:3000/portal/login | grep -o 'nonce="[a-f0-9]*"' | head -1

# 4. Worker benar-benar mengonsumsi antrean
docker compose logs --tail=20 worker | grep -E 'worker|matrix'

# 5. Metrics terjangkau dengan token (harus 200, bukan 404)
curl -fsS -H "Authorization: Bearer $METRICS_TOKEN" \
  http://127.0.0.1:3000/api/metrics | grep '^hcos_build_info'
```

Arti `checks` pada `/api/health`:

| Nilai | Arti |
|-------|------|
| `db: up` | `SELECT 1` berhasil — satu-satunya syarat status `ok` |
| `redis: down` | Redis tidak terjangkau; limiter turun ke memori, antrean menjadi inline |
| `limiter: memory` | Batas tetap berlaku, tetapi per-proses (tidak lintas replika) |
| `queue: inline` | Evaluasi matriks dijalankan di request, bukan worker |

---

## 3. Kebijakan keamanan HTTP

`next.config.mjs` memasang header berikut untuk semua rute:

- `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
- `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy` — kamera, mikrofon, geolokasi, payment, usb, magnetometer dimatikan
- `Cross-Origin-Opener-Policy: same-origin`, `Cross-Origin-Resource-Policy: same-origin`

CSP dibuat per-request di `src/middleware.ts` dengan nonce acak
(`src/lib/security/csp.ts`). Kebijakannya sadar-rute:

| Rute | `script-src` | Alasan |
|------|--------------|--------|
| `/portal/*`, `/share/*` | `'self' 'nonce-…' 'strict-dynamic'` | Halaman dirender dinamis; Next.js menyuntikkan nonce ke setiap script |
| sisanya (landing, 404) | `'self' 'unsafe-inline'` | Halaman diprerender saat build; HTML tidak ditulis ulang per request sehingga tidak mungkin memuat nonce |

`style-src` selalu menyertakan `'unsafe-inline'` karena Tailwind dan `next/font`
menyuntikkan `<style>` inline. Blok `application/ld+json` (JSON-LD) tidak diberi
nonce dan tidak perlu: ia data, bukan script eksekutabel.

Karena nonce mensyaratkan rendering dinamis, `src/app/(portal)/layout.tsx`
menjalankan `export const dynamic = 'force-dynamic'`. Jangan dihapus tanpa
mengganti strategi CSP — halaman portal akan kehilangan nonce dan script-nya
diblokir.

---

## 4. Backup

```bash
# Jadwal harian lewat cron host, atau profil compose:
docker compose --profile ops run --rm backup

# Pratinjau tanpa menyentuh apa pun:
docker compose --profile ops run --rm backup --dry-run
```

Satu arsip = tiga berkas dengan stem sama `hcos-<UTC>Z`:

| Berkas | Isi |
|--------|-----|
| `hcos-…Z.dump` | `pg_dump -Fc` database |
| `hcos-…Z-vault.tar.gz` | isi volume vault dokumen (`SKIP_VAULT=1` untuk melewati) |
| `hcos-…Z.manifest.json` | versi, waktu, tabel, retensi, `bytes` + `sha256` tiap artefak |

Retensi: `RETENTION_DAYS` (default 14). Berkas `hcos-*` yang lebih tua dihapus
setelah arsip baru tertulis. Log berupa JSON satu baris per peristiwa
(`backup.started`, `backup.artifact`, `backup.manifest`, `backup.retention`,
`backup.completed`) sehingga bisa langsung masuk agregator log.

Verifikasi arsip terbaru (menghitung ulang SHA-256, memeriksa ukuran, umur, dan
bahwa dump bisa dibaca):

```bash
npm run backup:verify -- --dir ./backups --max-age-days 2
# exit 0 = semua artefak cocok; exit 1 = ada missing/size_mismatch/checksum_mismatch
```

Jalankan ini sebagai langkah CI/jadwal terpisah. Backup yang tidak pernah
diverifikasi sama dengan tidak punya backup.

---

## 5. Restore

Restore **menimpa** database target (`--clean --if-exists`). Tanpa `--yes` skrip
hanya mencetak rencana dan keluar dengan kode 3.

```bash
# 1. Latih di database sementara, bukan produksi
DATABASE_URL="postgresql://user:pass@postgres:5432/haswakarya_db" \
  sh scripts/restore.sh --archive /backups/hcos-…Z.dump \
                        --target-db haswakarya_restore --create --yes
#    {"event":"restore.completed","target":"haswakarya_restore","tables":14}

# 2. Bandingkan jumlah baris tiap tabel sumber vs hasil restore
#    (lihat §10 untuk perintah siap pakai)

# 3. Baru setelah cocok, restore ke database produksi
```

Arsip vault dipulihkan terpisah:

```bash
tar -xzf /backups/hcos-…Z-vault.tar.gz -C /path/ke/vault
```

---

## 6. Jejak audit

`GET /api/portal/audit` (butuh kapabilitas `portal.admin`) menyajikan
`AuditTrail` dengan paginasi cursor dan filter `entityType`, `entityId`,
`action`, `actorId`, `from`, `to`, `limit` (maks 100, default 50). UI-nya di
`/portal/audit`, termasuk ekspor CSV.

```bash
curl -sS "http://127.0.0.1:3000/api/portal/audit?action=STAGE_TRANSITION&limit=20" \
  -H "Cookie: hcos_session=…" | jq '.items[].action, .nextCursor'
```

Aksi yang tercatat antara lain `STAGE_TRANSITION`, `MATRIX_EVALUATED`,
`VETTING_TOKEN_ROTATED`, `VETTING_TOKEN_REVOKED`, `VETTING_DECISION`. `details`
disimpan sebagai string JSON dan dipotong pada 2000 karakter saat dibaca.

---

## 7. Metrics dan korelasi request

`GET /api/metrics` menyajikan snapshot in-process dalam format teks Prometheus
(`text/plain; version=0.0.4`). Rute ini **wajib** diberi token di produksi:

```bash
# .env
METRICS_TOKEN="<32+ karakter acak>"
```

```bash
curl -fsS -H "Authorization: Bearer $METRICS_TOKEN" \
  http://127.0.0.1:3000/api/metrics | grep '^hcos_http_requests_total'
```

Tanpa `METRICS_TOKEN`, rute membalas **404** di produksi (bukan 200 kosong) agar
tidak ada yang mengira metrics sudah aktif. Di non-produksi rute terbuka supaya
mudah diperiksa saat pengembangan.

Seri yang tersedia:

| Metrik | Tipe | Label |
|--------|------|-------|
| `hcos_http_requests_total` | counter | `route`, `status` (`ok`/`4xx`/`5xx`) |
| `hcos_http_server_errors_total` | counter | `route` |
| `hcos_http_request_duration_seconds_sum` / `_count` | summary | `route`, `status` |
| `hcos_process_uptime_seconds` | gauge | — |
| `hcos_build_info` | gauge (selalu 1) | `service`, `version`, `revision`, `env` |

Metrik disimpan di memori proses dengan batas 200 rute (`MAX_ROUTES`); pada
deploy multi-replika setiap replika punya seri sendiri, jadi agregasi dilakukan
di Prometheus (`sum by (route) (...)`), bukan di aplikasi.

**Cakupan yang harus dipahami saat membaca grafik:** counter diisi di dalam
handler API (`withApiMetrics`), bukan di middleware. Middleware berjalan di
registri modul terpisah dan `NextResponse.next()` selalu berstatus 200, jadi
status akhir handler tidak terlihat dari sana. Konsekuensinya:

- Semua `/api/*` yang sampai ke handler tercatat, termasuk 4xx/5xx-nya.
- Penolakan yang terjadi **di middleware** — redirect halaman portal, 401/403
  untuk `/api/portal/*` tanpa sesi — **tidak** muncul di metrik. Lacak lewat
  log `authz.denied` (sudah memuat `route`, `role`, `required`).
- Render halaman (RSC) tidak dihitung sebagai request; status halaman dinilai
  dari probe `/api/health` dan uptime sintetis di sisi Prometheus.

`hcos_process_uptime_seconds` memakai `process.uptime()` sehingga bernilai
umur proses Node sebenarnya, bukan umur modul bundle.

### Melacak satu keluhan pengguna

Setiap respons membawa `X-Request-Id`. Nilai dari klien dipakai ulang bila sah
(`^[A-Za-z0-9][A-Za-z0-9._-]{7,63}$`), selain itu dibuat baru (16 byte acak,
32 heksadesimal). Header yang sama muncul di log:

```bash
grep '"requestId":"3f1a9c2e8b7d4a05"' /var/log/hcos/app.log
```

---

## 8. Vault dokumen sertifikat

Berkas STCW disimpan di `VAULT_STORAGE_PATH` (default `./storage/vault`), di
luar `public/`, dengan nama berkas UUID — nama asli hanya disimpan sebagai
metadata. Alur HTTP:

| Aksi | Rute | Kapabilitas |
|------|------|-------------|
| Unggah | `POST /api/portal/certificates/{id}/file` (multipart, field `file`) | `portal.admin` |
| Unduh | `GET /api/portal/certificates/{id}/file` | `portal.operations`, `portal.read_own`, `portal.admin` |

Batasan dan perilaku yang disengaja:

- Maksimal **15 MB** (`MAX_FILE_SIZE_BYTES`), balasan **413** bila lebih.
  Next.js memotong badan request di middleware pada 10 MB secara default, jadi
  `next.config.mjs` menaikkan `experimental.middlewareClientMaxBodySize` ke
  `17mb`. Tanpa itu, berkas 10–15 MB tiba terpotong dan gagal di-parse. Batas
  15 MB tetap ditegakkan handler lewat header `Content-Length` sebelum badan
  dibaca, sehingga berkas kebesaran dibalas 413 (bukan 400).
- Tipe ditentukan dari **magic bytes**, bukan `Content-Type` klien: hanya PDF,
  JPEG, PNG, WebP. Berkas yang menyamar (HTML berekstensi `.pdf`) ditolak 400.
- `Content-Disposition: inline` + `X-Content-Type-Options: nosniff` +
  `Cache-Control: private, no-store`.
- Checksum SHA-256 dihitung saat simpan; saat unduh dihitung ulang. Bila tidak
  cocok → **409** dan audit `STCW_DOCUMENT_INTEGRITY_FAILED`.
- Pelaut hanya boleh mengunduh berkas miliknya; staf boleh semua. Pelanggaran
  dibalas 403, bukan 404 palsu.
- Path divalidasi: absolut, `..`, backslash, dan null byte ditolak sebelum
  menyentuh disk.

Pemeriksaan cepat di server:

```bash
find "$VAULT_STORAGE_PATH" -type f -newermt '-1 day' | head
```

Backup ikut menyertakan direktori ini (`SKIP_VAULT=1` hanya untuk latihan).

---

## 9. Kepatuhan ILO MLC 11 bulan

`src/lib/maritime/contractCompliance.ts` menghitung jendela kontrak dari
`signOnDate` + `durationMonths`:

- `ON_TRACK` — masih jauh dari batas.
- `DUE_SOON` — sisa ≤ 30 hari menuju akhir kontrak **atau** batas 11 bulan.
- `MLC_BREACH` — kontrak dijadwalkan > 11 bulan, atau batas 11 bulan sudah lewat.
- `UNKNOWN` — tanggal/durasi tidak masuk akal (data kotor).

Perhitungan memakai UTC dan mengunci tanggal (31 Jan + 1 bulan = 28/29 Feb),
sehingga hasil tidak bergantung zona waktu server. Kontrak berstatus `COMPLETED`
atau `TERMINATED_EARLY` tidak dihitung sebagai pelanggaran.

```bash
curl -sS http://127.0.0.1:3000/api/portal/compliance \
  -H "Cookie: hcos_session=…" | jq '.summary'
# {"total":12,"onTrack":8,"dueSoon":3,"breach":1,"unknown":0,"worst":"MLC_BREACH"}
```

Respons 503/degraded tidak berlaku di sini: ini perhitungan murni, bukan
ketergantungan eksternal. Yang perlu dijaga adalah **kualitas data** —
`signOnDate` dan `durationMonths` wajib terisi saat kontrak dibuat; bila kosong,
baris akan muncul sebagai `UNKNOWN` di `/portal/contracts`.

---

## 10. Verifikasi restore end-to-end (latihan yang pernah dijalankan)

Prosedur ini pernah dijalankan penuh pada 2026-11-22 dengan PostgreSQL 14.5
lokal di port 55432. Hasilnya: 14 tabel, 190 kolom, 55 indeks, 28 constraint,
11 enum — identik antara database sumber dan hasil restore, termasuk baris uji
yang disisipkan.

```bash
export PGBIN=/path/ke/pg/bin
"$PGBIN/initdb" -D /tmp/pgtest/data -U postgres -A trust
"$PGBIN/postgres" -D /tmp/pgtest/data -p 55432 -h 127.0.0.1 &
"$PGBIN/createdb" -h 127.0.0.1 -p 55432 -U postgres hcos_src
"$PGBIN/psql" -h 127.0.0.1 -p 55432 -U postgres -d hcos_src -f prisma/migrations/20261120000000_init/migration.sql

DATABASE_URL="postgresql://postgres@127.0.0.1:55432/hcos_src?schema=public" \
BACKUP_DIR=/tmp/hcos-backups VAULT_DIR=/tmp/vault sh scripts/backup.sh

DATABASE_URL="postgresql://postgres@127.0.0.1:55432/hcos_src?schema=public" \
PGHOST=127.0.0.1 PGPORT=55432 PGUSER=postgres \
sh scripts/restore.sh --archive /tmp/hcos-backups/hcos-…Z.dump \
                      --target-db hcos_restore --create --yes

# Bandingkan per tabel
Q="select c.relname||'='||(xpath('/row/c/text()', query_to_xml(format('select count(*) as c from public.%I', c.relname), false, true, '')))[1]::text
   from pg_class c join pg_namespace n on n.oid=c.relnamespace
   where n.nspname='public' and c.relkind='r' order by 1"
diff <(psql -X -t -A -c "$Q" hcos_src) <(psql -X -t -A -c "$Q" hcos_restore) && echo IDENTICAL
```

---

## 11. Jebakan yang sudah menimpa kami

Empat temuan ini muncul saat menguji skrip backup/restore pertama kali. Semua
sudah diperbaiki; dicatat agar tidak terulang saat skrip diubah.

1. **`pg_dump` menolak `?schema=public`.** `DATABASE_URL` gaya Prisma membawa
   parameter kueri yang tidak dikenal libpq:
   `pg_dump: error: invalid URI query parameter: "schema"`.
   Perbaikan: `scripts/libpq-url.sh` menyisakan hanya parameter yang dipahami
   libpq (`sslmode`, `connect_timeout`, `application_name`, …). Skrip backup dan
   restore sama-sama memakainya — jangan menyerahkan `DATABASE_URL` mentah.
2. **Build `psql` di Windows berhenti mem-parse opsi setelah argumen posisional.**
   `psql "$URL" -t -A -c 'select 1'` mengabaikan `-t`, `-A`, dan `-c` (hanya
   peringatan "extra command-line argument ignored", exit 0, keluaran kosong).
   Akibatnya manifest sempat berisi `"serverVersion": ""` dan `"tables": 0`.
   Urutan yang benar: `psql -X -t -A -c 'select 1' "$URL"`.
3. **`tr -d ' \r'` bukan escape yang sah.** Karakter kembali menjadi CR literal di
   dalam berkas shell. Gunakan `tr -d '[:space:]'`.
4. **CSP nonce mengunci halaman statis.** Halaman yang diprerender tidak memuat
   nonce sehingga semua script diblokir `strict-dynamic`. Karena itu portal
   dipaksa dinamis dan halaman publik memakai `'unsafe-inline'` untuk
   `script-src` saja (§3).

---

## 12. PPh 21 pelaut dan bukti potong (e-Bupot)

Potongan pajak dihitung di dalam aplikasi, bukan di spreadsheet. Modulnya
`src/lib/tax/pph21.ts` (fungsi murni, teruji di `tests/unit/pph21.test.ts`) dan
dipakai langsung oleh `POST /api/portal/payroll` serta halaman `/portal/payroll`.

**Dasar aturan.**

| Komponen | Nilai | Sumber |
|----------|-------|--------|
| PTKP TK/0 | Rp54.000.000/tahun | PMK 101/PMK.010/2016 |
| Tambahan kawin | Rp4.500.000/tahun | idem |
| Tambahan per tanggungan | Rp4.500.000/tahun, maks 3 | idem |
| Biaya jabatan | 5% bruto, maks Rp6.000.000/tahun | PMK 250/PMK.03/2008 |
| Tarif progresif | 5% / 15% / 25% / 30% / 35% | UU HPP (UU 7/2021) Pasal 17 |

**Metode pemotongan yang dipakai: annualisasi Pasal 17.**
Bruto bulan berjalan disetahunkan (×12), dikurangi biaya jabatan dan PTKP,
dihitung tarif progresif, lalu dibagi 12. Pada masa Desember potongan tidak
memakai angka bulanan, melainkan `pajak tahunan − total yang sudah dipotong
masa 1–11`, sehingga total setahun selalu sama dengan pajak terutang. Selisih
negatif berarti lebih potong dan muncul di slip sebagai nilai negatif.

> **TER (PP 58/2023) belum aktif.** Tabel Tarif Efektif Rata-rata kategori A/B/C
> belum tersedia di repo dalam bentuk resmi. Angka tabel tidak boleh dikarang,
> jadi mekanismenya sengaja ditunda (lihat `_bmad-output/deferred-work.md`).
> Bila lampiran resmi diperoleh, tambahkan sebagai data tabel baru dan pilih
> lewat parameter `scheme` — jangan menambal fungsi yang ada.

**Yang disimpan per slip.** `taxableGross`, `pph21Amount`, `netWage`, plus
snapshot `npwpSnapshot` dan `ptkpSnapshot`. Snapshot wajib: kalau pelaut pindah
PTKP tahun depan, bukti potong tahun lalu tidak boleh ikut berubah.

**Alur operator.**

1. Isi NPWP dan status PTKP di profil pelaut (menu Pelaut → tambah pelaut;
   NPWP 15 digit otomatis dinormalisasi menjadi 16 digit dengan nol di depan).
2. Buat slip payroll. Pratinjau PPh 21 dan take-home muncul sebelum disimpan.
   Field NPWP/PTKP di modal hanya untuk menimpa satu masa bila perlu.
3. Unduh bukti potong: tombol **Ekspor e-Bupot CSV** di halaman payroll, pilih
   masa dan tahun. Berkas `ebupot-pph21-YYYY-MM.csv` berisi kolom NPWP, nama,
   masa, tahun, kode objek `21-100-01`, bruto, tarif efektif, dan PPh 21.
4. Impor CSV ke e-Bupot/DJP. **Kolom mengikuti konvensi umum e-Bupot 21, belum
   diverifikasi terhadap versi formulir DJP yang berlaku** — cocokkan sekali
   dengan template unduhan DJP sebelum impor massal pertama.

**Ringkasan tanpa unduh berkas.**

```
GET /api/portal/payroll/tax-summary?month=1&year=2026          # JSON
GET /api/portal/payroll/tax-summary?month=1&year=2026&format=csv
```

Keduanya hanya untuk `portal.admin`; shipowner dan pelaut mendapat 403. Ekspor
CSV menulis audit `CREW_PAYROLL_TAX_EXPORTED` berisi masa, jumlah baris, dan
total PPh 21. NPWP di JSON selalu ter-mask (`*******1234`); hanya CSV yang
membawa NPWP penuh karena dibutuhkan untuk pelaporan.

**Batas yang diketahui.**

- Pelaut tanpa NPWP tetap dihitung; CSV memakai `0000000000000000` dan
  ringkasan menaikkan `missingNpwpCount`. Lengkapi NPWP sebelum lapor.
- Potongan memakai bruto dalam rupiah. Payroll multi-valuta (USD → IDR) belum
  ada di modul ini; kurs KMK dan konversi masih di luar lingkup.
- `allotmentAmount` tetap dihitung dari bruto (aturan MLC), bukan dari neto.

---

## 13. Insiden umum

| Gejala | Periksa | Tindakan |
|--------|---------|----------|
| Dashboard matriks kosong, `matchScore` null | `docker compose ps worker`, `logs worker` | Nyalakan worker; tanpa worker antrean tidak dikonsumsi |
| `/api/health` 503 `db: down` | `docker compose logs postgres` | Pastikan volume `haswakarya_pgdata` ter-mount dan migrasi sudah jalan |
| `/api/metrics` 404 | `METRICS_TOKEN` di environment container | Isi token pada `.env`, jalankan ulang `docker compose up -d web`; 404 memang jawaban saat token kosong di produksi |
| Unggah berkas sertifikat 400/413 | isi berkas & ukuran | 400 = bukan PDF/JPG/PNG/WebP asli (dicek dari magic bytes); 413 = lebih dari 15 MB |
| Unduh berkas sertifikat 409 | audit `STCW_DOCUMENT_INTEGRITY_FAILED` | Berkas di vault berubah di luar aplikasi; pulihkan dari backup vault, lalu unggah ulang |
| Login lambat / rate limit tidak konsisten | `checks.redis` di `/api/health` | Redis mati → limiter per-proses; nyalakan `redis` |
| Halaman portal putih, console penuh CSP violation | nonce di HTML vs header | Pastikan `dynamic = 'force-dynamic'` di `src/app/(portal)/layout.tsx` masih ada |
| `backup:verify` exit 1 | keluaran JSON `failedArtifacts` | `size_mismatch`/`checksum_mismatch` = arsip rusak, ambil arsip sebelumnya |
| PPh 21 terlihat 0 padahal gaji besar | status PTKP pelaut + bruto slip | Periksa `ptkpSnapshot` di slip; bruto di bawah PTKP memang 0. Cek juga apakah masa Desember (koreksi tahunan) |
| `missingNpwpCount > 0` di ringkasan masa | profil pelaut | Lengkapi NPWP (15/16 digit); slip memakai placeholder `0000000000000000` sampai diisi |
| Prefetch `/portal` gagal di console | `Failed to fetch RSC payload` | Normal: prefetch ke rute terproteksi menerima redirect; router jatuh ke navigasi biasa |