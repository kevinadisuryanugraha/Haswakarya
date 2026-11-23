import { NextResponse } from 'next/server';
import { AUTH_COOKIE_NAME } from '@/lib/auth/session';
import { withApiMetrics } from '@/lib/observability/withApiMetrics';

async function handlePOST() {
  const response = NextResponse.json({ success: true, message: 'Logout berhasil.' });
  response.cookies.delete(AUTH_COOKIE_NAME);
  return response;
}

// Pembungkus metrics: status akhir hanya diketahui di dalam handler.
export const POST = withApiMetrics('/api/auth/logout', handlePOST);
