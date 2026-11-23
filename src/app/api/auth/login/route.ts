import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { signAuthToken } from '@/lib/auth/jwt';
import { AUTH_COOKIE_NAME } from '@/lib/auth/session';
import { getClientIp, rateLimitKey } from '@/lib/security/clientIp';
import { rateLimitHeaders } from '@/lib/security/rateLimit';
import { consume, resetBucket } from '@/lib/security/limiter';
import { withApiMetrics } from '@/lib/observability/withApiMetrics';

async function handlePOST(req: NextRequest) {
  const ip = getClientIp(req);
  let emailForLimit = 'anonymous';

  try {
    const body = await req.json();
    const { email, password } = body ?? {};

    if (!email || !password) {
      return NextResponse.json({ error: 'Email dan password wajib diisi.' }, { status: 400 });
    }

    emailForLimit = String(email).toLowerCase().trim();

    const limiter = await consume('login', rateLimitKey(ip, emailForLimit));
    const headers = rateLimitHeaders(limiter);
    if (!limiter.allowed) {
      return NextResponse.json(
        {
          error: 'Terlalu banyak percobaan login. Tunggu beberapa menit sebelum mencoba lagi.',
          retryAfterSeconds: limiter.retryAfterSeconds,
        },
        { status: 429, headers }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: emailForLimit },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        passwordHash: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive) {
      return NextResponse.json(
        { error: 'Email atau password salah, atau akun dinonaktifkan.' },
        { status: 401, headers }
      );
    }

    const isPasswordValid = await bcrypt.compare(String(password), user.passwordHash);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Email atau password salah.' },
        { status: 401, headers }
      );
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const token = await signAuthToken({
      userId: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
    });

    await prisma.auditTrail.create({
      data: {
        userId: user.id,
        action: 'USER_LOGIN',
        entityType: 'User',
        entityId: user.id,
        details: `Login berhasil sebagai ${user.role}`,
        ipAddress: ip,
        userAgent: req.headers.get('user-agent') ?? 'Browser',
      },
    });

    // Setelah login sukses, buka kuota agar sesi sah tidak terganggu.
    await resetBucket('login', rateLimitKey(ip, emailForLimit));

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    });

    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error) {
    console.error('[H-COS Auth Error]', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan sistem saat otentikasi.' },
      { status: 500 }
    );
  }
}

// Pembungkus metrics: status akhir hanya diketahui di dalam handler.
export const POST = withApiMetrics('/api/auth/login', handlePOST);
