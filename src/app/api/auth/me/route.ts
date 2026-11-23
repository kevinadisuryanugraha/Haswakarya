import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { withApiMetrics } from '@/lib/observability/withApiMetrics';

async function handleGET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      id: user.userId,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
    },
  });
}

// Pembungkus metrics: status akhir hanya diketahui di dalam handler.
export const GET = withApiMetrics('/api/auth/me', handleGET);
