import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { guardCapability } from '@/lib/auth/guard';
import { withApiMetrics } from '@/lib/observability/withApiMetrics';
import { computePortalStats } from '@/lib/portal/overview';

async function handleGET() {
  const access = await guardCapability('portal.operations', 'portal.read_own');
  if (!access.ok) return access.response;

  try {
    // Seluruh agregasi tinggal di satu modul agar halaman server-render dan
    // endpoint ini tidak pernah berbeda angka.
    const stats = await computePortalStats();
    return NextResponse.json({ success: true, stats });
  } catch (error) {
    console.error('[API Portal Stats Error]', error);
    return NextResponse.json({ error: 'Gagal mengambil statistik database.' }, { status: 500 });
  }
}

// Pembungkus metrics: status akhir hanya diketahui di dalam handler.
export const GET = withApiMetrics('/api/portal/stats', handleGET);
