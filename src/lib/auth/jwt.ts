import { SignJWT, jwtVerify } from 'jose';

const MIN_SECRET_LENGTH = 32;
const DEV_FALLBACK_SECRET = 'haswakarya-dev-only-jwt-secret-not-for-production-use';

let cachedSecret: Uint8Array | null = null;

/**
 * Mengambil kunci JWT dari environment.
 * - Produksi: wajib ada dan minimal 32 karakter, jika tidak → gagal keras.
 * - Non-produksi: memakai fallback yang jelas-jelas hanya untuk pengembangan.
 * Resolusi dilakukan lazy agar build tidak gagal, tetapi runtime tetap aman.
 */
function resolveSecret(): Uint8Array {
  if (cachedSecret) return cachedSecret;

  const raw = process.env.JWT_SECRET?.trim();

  if (raw && raw.length >= MIN_SECRET_LENGTH) {
    cachedSecret = new TextEncoder().encode(raw);
    return cachedSecret;
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'JWT_SECRET wajib diisi dan minimal 32 karakter pada lingkungan produksi. ' +
        'Aplikasi menolak menandatangani token dengan kunci default.'
    );
  }

  console.warn(
    '[H-COS Security] JWT_SECRET tidak di-set atau terlalu pendek. Memakai kunci pengembangan. ' +
      'Jangan gunakan konfigurasi ini di produksi.'
  );
  cachedSecret = new TextEncoder().encode(DEV_FALLBACK_SECRET);
  return cachedSecret;
}

export interface TokenPayload {
  userId: string;
  email: string;
  fullName: string;
  role: string;
  [key: string]: unknown;
}

/**
 * Menandatangani token JWT dengan masa berlaku 7 hari
 */
export async function signAuthToken(payload: TokenPayload): Promise<string> {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(resolveSecret());
}

/**
 * Memverifikasi validitas token JWT
 */
export async function verifyAuthToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, resolveSecret());
    if (typeof payload.userId !== 'string' || typeof payload.role !== 'string') {
      return null;
    }
    return payload as TokenPayload;
  } catch {
    return null;
  }
}
