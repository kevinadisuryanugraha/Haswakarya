# Anggaran Performa Web — Haswakarya Crewing OS

Dokumen ini mencatat anggaran (budget), aturan, dan angka terukur untuk jalur
kritis halaman publik dan portal. Tujuannya agar optimasi tidak berulang dari
nol setiap gelombang: setiap perubahan wajib diukur terhadap angka di §4.

Terakhir diperbarui: 2026-11-24 (gelombang optimasi performa P0).

## 1. Anggaran

| Metrik | Anggaran | Catatan |
|---|---|---|
| First Load JS halaman publik `/` | ≤ 170 kB | shared 103 kB + halaman |
| First Load JS halaman portal | ≤ 115 kB | widget pemasaran tidak ikut |
| Transfer awal `/` (aset, non-HTML) | ≤ 120 kB | sebelum gzip dokumen |
| Font web | 1 berkas latin | subset lain tidak boleh terunduh |
| CLS halaman publik | ≤ 0.01 | target 0 |
| LCP `/` (jaringan lokal headless) | ≤ 1500 ms | `h1`, bukan gambar latar |
| TTFB `/` | ≤ 100 ms | cache HIT harus < 30 ms |
| TTFB halaman portal (SSR terautentikasi) | ≤ 150 ms | 9 query paralel |

## 2. Aturan yang mengikat

1. **`priority` hanya untuk hero.** Logo header, logo drawer, dan gambar kartu
   tidak boleh memakai `priority`; preload gambar bersaing dengan font dan
   dokumen pada jalur kritis.
2. **Modal berat wajib `next/dynamic { ssr: false }`.** Komponen > 300 baris yang
   hanya tampil setelah interaksi tidak boleh masuk bundel awal, dan karena itu
   tidak boleh memakai hook Next tingkat halaman (`useRouter`, dsb.) di berkas
   yang sama dengan halamannya.
3. **Widget pemasaran hidup di route group `(public)`.** `PWAInstaller`,
   `MobileActionDock`, dan `FloatingBackToTop` dipasang di
   `src/app/(public)/layout.tsx`, bukan di root layout — JS portal tidak boleh
   membawa widget publik.
4. **Teks yang dirender tidak boleh memakai glyph langka.** Roboto membagi
   dirinya ke sembilan subset `unicode-range`. Karakter di luar blok latin
   (mis. `≥`, `✓`, `⚓`, `🚢`, `→`) memicu unduhan subset 17–36 kB meski hanya
   satu karakter yang tampil. Gunakan ikon `lucide-react` atau ASCII.
   Boilerplate komentar (`═══`, `──`) boleh tetap ada: komentar tidak pernah
   dirender.
5. **`font-display: swap` + `adjustFontFallback`.** Metrik fallback wajib
   diselaraskan agar FOUT tidak menggeser tata letak.
6. **`content-visibility: auto` hanya di bawah lipatan.** Seksi yang terlihat
   saat muat pertama tidak boleh memakainya (risiko lompatan scroll).
7. **Animasi berkelanjutan dilarang.** `animation` hanya pada `:hover` /
   `:focus-visible`; `will-change` hanya pada elemen yang benar-benar bergerak.
8. **`transition: all` dilarang.** Sebutkan properti: `transform`, `box-shadow`,
   `border-color`.
9. **Service worker tidak menyentuh data pribadi.** `/api/`, `/portal`, dan
   `/share/` dikecualikan dari cache; menaikkan `CACHE_VERSION` wajib saat
   strategi berubah.
10. **Halaman ringkasan portal dirender server.** Data dashboard diambil lewat
    `src/lib/portal/overview.ts` (satu gelombang `Promise.all`), dipakai bersama
    oleh halaman dan `GET /api/portal/stats` agar angkanya tidak pernah berbeda.
11. **Optimizer `next/image` tetap hidup di `next start`.** Hanya ekspor statis
    (`NEXT_EXPORT=true`) memakai `unoptimized`.
12. **Favicon/PWA memakai ikon khusus** di `/icons/` (1–46 kB), bukan logo penuh
    178 kB; logo asli hanya dipakai sebagai gambar konten.

## 3. Bukti pengukuran (jalur kritis `/`)

Alat: `agent_browser` `vitals` + `network requests` pada `next start -p 3121`,
Chromium headless, sesi baru (cache kosong).

| Item | Sebelum gelombang | Sesudah |
|---|---|---|
| Font terunduh | 90.504 B (3 subset) | 37.520 B (1 subset latin) |
| Ikon/favicon | 178.149 B × 2 | 11.495 B |
| Total transfer awal | 158.771 B | 105.787 B |
| Permintaan | 29 | 27 |
| `hero-bg` AVIF `w=828` | — | 24.827 B (dari JPEG 196.433 B) |
| `hero-bg` AVIF `w=1280` | — | 52.108 B |
| HTML `/` gzip | — | 38.275 B |
| CLS `/` | 0.2 | 0 |
| LCP `/` | elemen `img` | `h1` |

Build (`next build`, exit 0, 0 warning):

```
┌ ○ /                    28 kB    163 kB
├ ƒ /portal            180 B     108 kB
+ First Load JS shared by all    103 kB
ƒ Middleware                    41.7 kB
```

`/portal` sebagai server component menghapus dua permintaan `fetch`
(`/api/portal/stats`, `/api/portal/certificates`) dari jalur muat; angka KPI
sudah ada di HTML pertama (tanpa kerangka "—").

## 4. Cara mengukur ulang

```bash
# 1. Build produksi (jangan saat `next dev` memakai .next yang sama)
npx next build && npx next start -p 3121

# 2. Vitals jalur kritis (sesi baru = cold-ish)
#    agent_browser: { args: ["vitals", "http://localhost:3121/"] }

# 3. Daftar permintaan + ukuran
#    agent_browser: { args: ["network", "requests"] }

# 4. TTFB berulang
for i in 1 2 3 4 5; do curl -s -o /dev/null -w "%{time_starttransfer} " \
  http://127.0.0.1:3121/; done
```

Pengukuran `agent_browser` berjalan headless dan mengunci lebar viewport 762 px;
angka LCP/FCP absolut dipakai sebagai perbandingan antar-gelombang, bukan SLA
lapangan. Untuk lebar desktop nyata pakai `--headed --window-size=1440,900`.

## 5. Sisa pekerjaan (gelombang 2)

Delapan halaman portal lain (`seafarers`, `payroll`, `contracts`, `vessels`,
`requisitions`, `crewing`, `matrix`, `audit`) masih mengambil data lewat `fetch`
di klien, sehingga pengguna melihat status "memuat" sebelum tabel terisi.
Pola yang dipakai `/portal` bisa direplikasi per halaman dengan mengekstrak
query ke `src/lib/portal/*.ts`. Lihat `_bmad-output/deferred-work.md`.
