import { NextResponse } from 'next/server';
import { getCurrentUser } from './session';
import type { TokenPayload } from './jwt';
import { hasAnyCapability, type PortalCapability } from './rbac';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * Haswakarya Crewing OS — Route Guard
 * Satu gerbang untuk semua route portal: autentikasi + otorisasi.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export type AccessGranted = { ok: true; session: TokenPayload };
export type AccessDenied = { ok: false; response: NextResponse };
export type AccessResult = AccessGranted | AccessDenied;

export function unauthorizedResponse(message = 'Unauthorized: sesi tidak valid atau telah berakhir.') {
  return NextResponse.json({ error: message }, { status: 401 });
}

export function forbiddenResponse(message = 'Forbidden: peran Anda tidak berhak atas aksi ini.') {
  return NextResponse.json({ error: message }, { status: 403 });
}

/**
 * Memastikan pengguna login dan memiliki salah satu kapabilitas yang diminta.
 * Gunakan di setiap route handler portal — middleware bukan satu-satunya gerbang.
 */
export async function guardCapability(
  ...required: PortalCapability[]
): Promise<AccessResult> {
  const session = await getCurrentUser();
  if (!session) {
    return { ok: false, response: unauthorizedResponse() };
  }

  if (!hasAnyCapability(session.role, required)) {
    return { ok: false, response: forbiddenResponse() };
  }

  return { ok: true, session };
}

/**
 * Varian untuk data milik sendiri: staf dengan `portal.operations` boleh
 * membaca semua, sementara pemilik data hanya boleh membaca miliknya.
 * Mengembalikan `seafarerId` yang harus dipakai sebagai filter, atau null
 * bila pemanggil boleh membaca seluruh data.
 */
export async function resolveSeafarerScope(
  session: TokenPayload,
  requestedSeafarerId?: string | null
): Promise<{ ok: true; scopeSeafarerId: string | null } | AccessDenied> {
  if (hasAnyCapability(session.role, ['portal.operations'])) {
    return { ok: true, scopeSeafarerId: requestedSeafarerId ?? null };
  }

  if (!hasAnyCapability(session.role, ['portal.read_own'])) {
    return { ok: false, response: forbiddenResponse() };
  }

  const { prisma } = await import('@/lib/prisma');
  const profile = await prisma.seafarerProfile.findUnique({
    where: { userId: session.userId },
    select: { id: true },
  });

  if (!profile) {
    return { ok: false, response: forbiddenResponse('Forbidden: profil pelaut tidak terhubung ke akun ini.') };
  }

  if (requestedSeafarerId && requestedSeafarerId !== profile.id) {
    return { ok: false, response: forbiddenResponse('Forbidden: Anda hanya dapat mengakses data sendiri.') };
  }

  return { ok: true, scopeSeafarerId: profile.id };
}
