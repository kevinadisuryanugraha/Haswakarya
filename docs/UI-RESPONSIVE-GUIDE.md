# H-COS — Panduan Lapisan Responsif Portal

Dokumen ini menjelaskan lapisan responsif yang dipakai seluruh dashboard `/portal/*`.
Tujuannya: satu sumber kebenaran, tanpa duplikasi markup, dan tanpa regresi ke
layout yang berdempetan/bertabrakan di layar sempit.

## 1. Breakpoint acuan

| Rentang | Nama internal | Tata letak portal |
| --- | --- | --- |
| < 768 px | ponsel / tablet kecil | sidebar = drawer, tabel = kartu, bottom tab bar tampil |
| 768–1023 px | tablet | sidebar masih drawer, tabel tetap kartu, bottom tab bar tampil |
| ≥ 1024 px (`lg:`) | desktop | sidebar `sticky` setinggi layar, tabel asli, bottom bar hilang |

Tailwind ditulis **mobile-first**: kelas tanpa prefiks adalah aturan ponsel,
`sm:`/`md:`/`lg:` hanya penambah. Jangan menaruh perbaikan tata letak hanya di
prefiks `sm:`, karena itu tidak menolong layar 375 px.

## 2. Kerangka (`src/components/portal`)

- `PortalShell.tsx` — pemilik state drawer (`navOpen`), backdrop, scroll lock
  `document.body.style.overflow = 'hidden'`, tutup saat `Escape`, tutup saat rute
  berubah, dan tutup otomatis saat `matchMedia('(min-width: 1024px)')` cocok.
  `<main>` memakai `pb-28` sampai `lg` supaya konten terakhir tidak tertutup
  bottom tab bar.
- `PortalSidebar.tsx` — `fixed inset-y-0 left-0 z-50 w-72 max-w-[86vw]` di
  bawah `lg`, berubah jadi `lg:sticky lg:top-0 lg:h-screen lg:w-64` di desktop.
  Setiap tautan memanggil `onClose` agar drawer menutup setelah navigasi.
- `PortalTopBar.tsx` — tombol "Buka menu navigasi portal" (`lg:hidden`,
  `aria-controls="portal-sidebar"`), breadcrumb `truncate`, search hanya `lg`,
  pill status DB hanya `xl`.
- `PortalMobileNav.tsx` — bottom tab bar 4 tujuan (Ringkasan, Pelaut, Kapal,
  Payroll) + tombol Menu, `lg:hidden print:hidden`, sadar
  `env(safe-area-inset-bottom)`.

## 3. Tabel → kartu (`.mobile-cards`)

Didefinisikan di `src/app/globals.css` §10. Dipakai dengan tiga langkah:

1. `<table className="mobile-cards w-full text-left text-xs">`
2. Setiap `<td>` wajib punya `data-label="Nama Kolom"` — dipakai sebagai label
   kartu lewat `td::before { content: attr(data-label) }`.
3. Baris `<td colSpan={N}>` untuk empty state memakai `data-label=""` agar tidak
   memunculkan label kosong.

Varian kolom:

| Kelas | Efek di < 768 px |
| --- | --- |
| `mc-flat` / `mc-block` | satu kolom penuh, tanpa label (untuk JSON, detail panjang) |
| `mc-actions` | selebar kartu, dipisah garis putus-putus, label tetap tampil |
| `mc-action-row` | deret tombol di dalam sel aksi: `flex-wrap`, rata kiri |
| `mc-mono` | paksa font mono + `overflow-wrap: anywhere` |

Aturan CSS-nya: `thead`/`tfoot` disembunyikan, `tr` menjadi kartu
(`border-radius: .75rem`, shadow tipis, margin antar kartu), `td` menjadi grid
`minmax(0,8.5rem) minmax(0,1fr)` dengan `overflow-wrap: anywhere`.

Karena hanya memakai CSS, tidak ada markup kartu duplikat yang bisa melenceng
dari versi tabel.

## 4. Aturan wajib saat menambah halaman

1. Setiap anak `flex`/`grid` yang berisi tabel atau teks panjang diberi
   `min-w-0`. Tanpa itu, track melebar ke min-content dan `overflow-x-auto`
   tidak menolong (ini akar overflow lama: `docScrollW 1101` vs `vw 762`).
2. Toolbar filter: `flex flex-col sm:flex-row` + `gap-3`; input pencarian
   `w-full sm:w-80`; baris tombol aksi `flex flex-wrap`.
3. Tombol utama di header: `self-start sm:self-auto w-full sm:w-auto` supaya
   selebar layar di ponsel dan kembali normal di `sm`.
4. Grid KPI: mulai `grid-cols-1 sm:grid-cols-2`, jangan langsung 5 kolom.
   Pakai `.portal-kpi` agar label panjang tidak menabrak angka.
5. Modal: `fixed inset-0 z-50 flex items-end sm:items-center` +
   panel `rounded-t-2xl sm:rounded-2xl max-h-[92dvh] sm:max-h-[90vh]
   overflow-y-auto`. Pola bottom sheet memberi ruang tombol di ponsel.
6. Kanban/lane horizontal: `-mx-4 flex snap-x snap-mandatory overflow-x-auto px-4`
   di ponsel, `md:grid` di atasnya, tiap lane `w-[78vw] max-w-[300px] shrink-0`.
7. Teks panjang (email, nama kapal, nomor kontrak) diberi `break-words` atau
   `break-all`, jangan `truncate` pada data yang harus terbaca utuh.

## 5. Verifikasi

Tidak ada device emulation di harness Windows (`--device` hanya macOS), jadi
bukti diambil pada dua viewport nyata:

- **Mobile** `vw = 762` (di bawah `md` 768) — memastikan jalur kartu benar-benar
  dipakai: `.mobile-cards` harus `display: block`, `thead` harus `none`.
- **Desktop** `vw = 1036` (di atas `lg` 1024, butuh `--headed`) — memastikan
  sidebar `sticky` 256 px dan tabel kembali `display: table`.

Kriteria lulus untuk setiap halaman:

```
document.documentElement.scrollWidth === window.innerWidth
```

Selain itu tidak boleh ada elemen dengan `getBoundingClientRect().right` lebih
besar dari lebar viewport, kecuali yang memang berada di dalam kontainer scroll
horizontal (marquee logo, lane kanban).

Titik ukur tambahan: `<main>` harus punya `padding-bottom: 112px` di bawah `lg`
(tidak tertutup bottom tab bar), dan modal tidak boleh melebihi lebar viewport.

## 6. Jebakan yang pernah terjadi

- `pb-28 sm:pb-6` membuat konten tertutup bottom bar pada 640–1023 px; sekarang
  `pb-28` bertahan sampai `lg`.
- Panggilan `.click()` lewat `eval` bisa gagal bila React belum hidrasi;
  tunggu teks target muncul (`wait --text`) sebelum mengklik.
- `next dev` menampilkan skeleton "Memuat data portal…" lebih lama; ukur setelah
  `wait --load networkidle` atau setelah teks tabel muncul.

## 7. Glyph, font, dan ikon

Roboto dimuat sebagai satu variable font latin (37.5 kB). Next.js tetap
mendeklarasikan sembilan subset `unicode-range`; setiap karakter di luar blok
latin memicu unduhan subset tambahan 17–36 kB walaupun hanya satu karakter yang
tampil.

- Jangan menulis `≥`, `≤`, `✓`, `⚓`, `🚢`, `→`, `—` (em dash boleh, ada di
  subset latin) di teks yang dirender. Pakai ikon `lucide-react` atau ASCII
  (`80%+`, `min. 80%`, `OK`).
- Karakter kotak `═`/`─` hanya untuk komentar kode, bukan teks UI.
- Ikon aplikasi (favicon/PWA) ada di `/icons/` dan dipakai lewat
  `metadata.icons` + `manifest.webmanifest`; jangan menunjuk logo konten
  (178 kB) sebagai favicon.
- Anggaran performa lengkap: `docs/PERFORMANCE-BUDGET.md`.
