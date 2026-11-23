/**
 * Header keamanan statis untuk seluruh respons.
 * CSP (dengan nonce per-request) dipasang oleh `src/middleware.ts`; header di
 * sini adalah lapisan yang tetap berlaku untuk aset dan API yang tidak melewati
 * middleware (mis. `/api/health`, berkas di `/images`).
 */

const SECURITY_HEADERS = [
  // Paksa HTTPS selama dua tahun, termasuk subdomain.
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  // Cegah MIME sniffing (penting untuk unduhan PDF/CSV dari portal).
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Portal tidak boleh di-embed; klikjacking pada aksi payroll/vetting berbahaya.
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=()',
  },
  { key: 'X-DNS-Prefetch-Control', value: 'off' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  { key: 'Cross-Origin-Resource-Policy', value: 'same-origin' },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  output:
    process.env.NEXT_EXPORT === 'true'
      ? 'export'
      : process.env.STANDALONE === 'true'
        ? 'standalone'
        : undefined,
  poweredByHeader: false,
  // Kompresi balasan (gzip/br) aktif default di `next start`, ditulis eksplisit
  // supaya perilakunya tidak bergantung pada default versi Next.
  compress: true,
  images: {
    // Optimizer gambar dimatikan HANYA untuk ekspor statis (hosting yang tidak
    // punya server Next). Pada `next start`/standalone optimizer dipakai:
    // hero 192 KB dan kartu armada 250 KB dikirim sebagai AVIF/WebP terukur
    // (~25-45 KB) alih-alih JPEG ukuran penuh.
    unoptimized: process.env.NEXT_EXPORT === 'true',
    formats: ['image/avif', 'image/webp'],
    // Gambar di /public jarang berubah; simpan hasil optimasi sebulan.
    minimumCacheTTL: 2678400,
    deviceSizes: [360, 420, 640, 768, 828, 1024, 1280, 1600, 1920],
    imageSizes: [96, 128, 192, 256, 384, 512],
  },
  // Repo ini hidup di dalam monorepo longgar (C:/laragon/www punya lockfile
  // sendiri). Tanpa root eksplisit, Next.js salah menebak dan tracing output
  // standalone bisa melewatkan berkas.
  outputFileTracingRoot: process.cwd(),
  // Driver Redis/antrean dimuat saat runtime dari node_modules, bukan di-bundle
  // (bullmq punya peer opsional yang tidak terpasang, mis. @valkey/valkey-glide).
  serverExternalPackages: ['bullmq', 'ioredis', '@prisma/client'],
  experimental: {
    // Vault menerima berkas sampai 15 MB. Default 10 MB memotong badan request
    // di middleware sehingga berkas 10–15 MB tiba rusak; beri ruang untuk
    // overhead multipart.
    middlewareClientMaxBodySize: '17mb',
    // `lucide-react` dan `motion` mengekspor ribuan simbol dari satu barrel
    // file. Tanpa petunjuk ini, bundler ikut menarik modul yang tidak dipakai
    // dan build memindai seluruh barrel.
    optimizePackageImports: ['lucide-react', 'motion'],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: SECURITY_HEADERS,
      },
      {
        // Aset statis: cache panjang di CDN/browser, tetap boleh revalidasi.
        source: '/images/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=604800' },
        ],
      },
      {
        // Ikon aplikasi (favicon/PWA) berubah sangat jarang.
        source: '/icons/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=604800, immutable' }],
      },
      {
        source: '/manifest.webmanifest',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=3600' }],
      },
    ];
  },
};

// `output: 'export'` menolak blok `headers()`, jadi mode ekspor statis memakai
// header dari hosting (Netlify/Vercel) alih-alih dari Next.
if (process.env.NEXT_EXPORT === 'true') {
  delete nextConfig.headers;
}

export default nextConfig;