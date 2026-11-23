import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthToken } from '@/lib/auth/jwt';
import { AUTH_COOKIE_NAME } from '@/lib/auth/session';
import { resolveRouteAccess } from '@/lib/auth/rbac';
import { logger, normalizePath } from '@/lib/observability/logger';
import { REQUEST_ID_HEADER, resolveRequestId } from '@/lib/observability/requestId';
import {
  buildContentSecurityPolicy,
  createNonce,
  requiresStrictScripts,
} from '@/lib/security/csp';

/**
 * Middleware H-COS: autentikasi portal, otorisasi per-rute, CSP ber-nonce,
 * dan observability (metric + satu baris log JSON per request).
 *
 * Nonce dibuat per request. Nilainya dikirim ke Next.js lewat header request
 * `Content-Security-Policy` + `x-nonce`, sehingga Next menempelkan nonce ke
 * seluruh tag <script> hasil render (termasuk bootstrap RSC). Aturan
 * `strict-dynamic` lalu mengizinkan chunk yang dimuat oleh script ber-nonce.
 *
 * Setiap request juga membawa satu ID korelasi (`X-Request-Id`): ID dari
 * proxy dipakai ulang bila bentuknya sah, selain itu dibuat baru. ID yang sama
 * muncul di header respons dan di setiap baris log, sehingga keluhan pengguna
 * bisa dilacak ke satu permintaan konkret.
 *
 * Metrics: middleware tidak mencatat apa pun, dan itu disengaja. Middleware
 * berjalan di registri modul terpisah dari route handler, sehingga counter yang
 * ia tulis tidak pernah terlihat oleh `/api/metrics`; lebih buruk lagi,
 * `NextResponse.next()` selalu berstatus 200 sehingga status akhir handler
 * tidak diketahui di sini. Pencatatan karena itu dilakukan di dalam handler
 * lewat `withApiMetrics`. Konsekuensi yang diterima dan didokumentasikan:
 * penolakan yang terjadi di middleware (redirect halaman, 401/403 API) tidak
 * masuk metrik; gunakan agregasi log `authz.denied` untuk itu.
 */
export async function middleware(req: NextRequest) {
  const startedAt = Date.now();
  const { pathname } = req.nextUrl;
  const requestId = resolveRequestId(req.headers.get(REQUEST_ID_HEADER));

  const nonce = createNonce();
  const csp = buildContentSecurityPolicy(nonce, process.env.NODE_ENV !== 'production', {
    // Hanya halaman dinamis yang bisa memuat nonce; halaman statis memakai
    // 'unsafe-inline' agar script prerender tidak diblokir.
    strictScripts: requiresStrictScripts(pathname),
  });
  const response = await handleRequest(req, nonce, csp, requestId);

  response.headers.set('Content-Security-Policy', csp);
  response.headers.set('x-nonce', nonce);
  response.headers.set(REQUEST_ID_HEADER, requestId);

  const route = normalizePath(pathname);
  logger.info('http.request', {
    requestId,
    method: req.method,
    route,
    status: response.status,
    durationMs: Date.now() - startedAt,
  });

  return response;
}

function nextWithNonce(
  req: NextRequest,
  nonce: string,
  csp: string,
  requestId: string
): NextResponse {
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('Content-Security-Policy', csp);
  requestHeaders.set(REQUEST_ID_HEADER, requestId);
  return NextResponse.next({ request: { headers: requestHeaders } });
}

async function handleRequest(
  req: NextRequest,
  nonce: string,
  csp: string,
  requestId: string
): Promise<NextResponse> {
  const { pathname } = req.nextUrl;

  const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  const user = token ? await verifyAuthToken(token) : null;

  // 1. Halaman login portal
  if (pathname === '/portal/login') {
    if (user) {
      return NextResponse.redirect(new URL('/portal', req.url));
    }
    return nextWithNonce(req, nonce, csp, requestId);
  }

  // 2. Halaman portal: wajib login + otorisasi per-rute
  if (pathname === '/portal' || pathname.startsWith('/portal/')) {
    if (!user) {
      const loginUrl = new URL('/portal/login', req.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    const access = resolveRouteAccess(pathname, user.role);
    if (!access.allowed) {
      logger.warn('authz.denied', {
        route: normalizePath(pathname),
        role: user.role,
        surface: 'page',
        required: access.required,
      });
      return NextResponse.redirect(new URL('/portal?denied=1', req.url));
    }

    return nextWithNonce(req, nonce, csp, requestId);
  }

  // 3. API internal portal: wajib login + otorisasi per-rute
  if (pathname.startsWith('/api/portal')) {
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized: Sesi tidak valid atau telah berakhir.' },
        { status: 401 }
      );
    }

    const access = resolveRouteAccess(pathname.replace('/api', ''), user.role);
    if (!access.allowed) {
      logger.warn('authz.denied', {
        route: normalizePath(pathname),
        role: user.role,
        surface: 'api',
        required: access.required,
      });
      return NextResponse.json(
        {
          error: 'Forbidden: peran Anda tidak berhak mengakses sumber daya ini.',
          required: access.required,
        },
        { status: 403 }
      );
    }

    return nextWithNonce(req, nonce, csp, requestId);
  }

  return nextWithNonce(req, nonce, csp, requestId);
}

export const config = {
  matcher: [
    /*
     * Semua rute dokumen & API, kecuali aset statis Next dan berkas publik
     * (gambar/manifest) yang tidak dirender sebagai HTML.
     */
    '/((?!_next/static|_next/image|images|assets|favicon.ico|manifest.webmanifest|sw.js|workbox-).*)',
  ],
};