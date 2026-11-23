/**
 * Haswakarya Crew Agency — Service Worker
 *
 * Prinsip:
 *  - Hanya aset statis publik (gambar/ikon) yang di-cache-first.
 *  - Rute terautentikasi (`/portal/*`, `/share/*`) dan seluruh `/api/*` TIDAK
 *    pernah masuk Cache Storage: isinya data pribadi dan cepat berubah.
 *  - Navigasi publik memakai network-first dengan fallback offline.
 */

const CACHE_VERSION = 'v2';
const STATIC_CACHE = `haswakarya-static-${CACHE_VERSION}`;
const PAGE_CACHE = `haswakarya-page-${CACHE_VERSION}`;

const PRECACHE_ASSETS = [
  '/manifest.webmanifest',
  '/icons/icon-192.png',
  '/images/hero-bg-maritime.jpg',
  '/images/hero-vessel.svg',
  '/images/crew-training.svg',
  '/images/doc-mlc2006.svg',
  '/images/world-routes.svg',
  '/images/doc-siupak.svg',
  '/images/doc-iso9001.svg',
  '/images/vessel-bulk.svg',
  '/images/vessel-container.svg',
  '/images/vessel-tanker.svg',
  '/images/vessel-tug.svg',
];

/** Rute yang tidak boleh disentuh cache sama sekali. */
function isPrivateRoute(pathname) {
  return (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/portal') ||
    pathname.startsWith('/share/')
  );
}

function isStaticAsset(pathname) {
  return (
    pathname.startsWith('/images/') ||
    pathname.startsWith('/_next/static/') ||
    pathname.endsWith('.png') ||
    pathname.endsWith('.jpg') ||
    pathname.endsWith('.svg') ||
    pathname.endsWith('.woff2') ||
    pathname.endsWith('.webp') ||
    pathname.endsWith('.avif')
  );
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      // Satu berkas yang hilang tidak boleh menggagalkan seluruh instalasi.
      .then((cache) => Promise.allSettled(PRECACHE_ASSETS.map((url) => cache.add(url))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((names) =>
        Promise.all(
          names
            .filter((name) => name !== STATIC_CACHE && name !== PAGE_CACHE)
            .map((name) => caches.delete(name))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (isPrivateRoute(url.pathname)) return; // biarkan lewat jaringan murni

  // Cache-first hanya untuk aset statis.
  if (isStaticAsset(url.pathname)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response && response.status === 200 && response.type === 'basic') {
            const copy = response.clone();
            caches.open(STATIC_CACHE).then((cache) => cache.put(request, copy));
          }
          return response;
        });
      })
    );
    return;
  }

  // Navigasi publik: network-first, fallback ke salinan offline halaman itu.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(PAGE_CACHE).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          return cached || caches.match('/');
        })
    );
  }
});
