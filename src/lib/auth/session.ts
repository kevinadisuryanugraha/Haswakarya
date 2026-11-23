import { cookies } from 'next/headers';
import { verifyAuthToken, TokenPayload } from './jwt';
import { prisma } from '../prisma';

export const AUTH_COOKIE_NAME = 'hcos_session';

/**
 * Mendapatkan sesi pengguna yang sedang login dari HTTP-only cookie
 */
export async function getCurrentUser(): Promise<TokenPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    if (!token) return null;

    const payload = await verifyAuthToken(token);
    return payload;
  } catch {
    return null;
  }
}

/**
 * Memverifikasi apakah pengguna memiliki salah satu role yang diizinkan (RBAC)
 */
export async function requireUserRole(allowedRoles: string[]): Promise<TokenPayload> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('UNAUTHORIZED');
  }

  if (!allowedRoles.includes(user.role)) {
    throw new Error('FORBIDDEN');
  }

  return user;
}
