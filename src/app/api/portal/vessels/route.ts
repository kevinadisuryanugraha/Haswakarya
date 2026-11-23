import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { guardCapability } from '@/lib/auth/guard';
import { normalizeVesselType, supportedVesselTypes } from '@/lib/maritime/vesselTypeMapper';
import { withApiMetrics } from '@/lib/observability/withApiMetrics';

async function handleGET() {
  const access = await guardCapability('portal.operations', 'portal.read_own');
  if (!access.ok) return access.response;

  try {
    const vessels = await prisma.vessel.findMany({
      select: {
        id: true,
        name: true,
        imoNumber: true,
        callSign: true,
        flag: true,
        vesselType: true,
        dwt: true,
        grt: true,
        engineBhp: true,
        engineType: true,
        tradingArea: true,
        ownerName: true,
        safeManningTotal: true,
        createdAt: true,
        requisitions: {
          where: { status: 'OPEN' },
          select: {
            id: true,
            requisitionNo: true,
            rank: true,
            requiredQuantity: true,
            targetJoinDate: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ success: true, count: vessels.length, data: vessels });
  } catch (error) {
    console.error('[API Vessels GET Error]', error);
    return NextResponse.json({ error: 'Gagal memuat armada kapal.' }, { status: 500 });
  }
}

async function handlePOST(req: NextRequest) {
  const access = await guardCapability('portal.operations');
  if (!access.ok) return access.response;

  try {
    const body = await req.json();
    const {
      name,
      imoNumber,
      callSign,
      flag,
      vesselType,
      dwt,
      grt,
      engineBhp,
      engineType,
      tradingArea,
      ownerName,
      safeManningTotal,
    } = body ?? {};

    if (!name || !imoNumber || !vesselType || !dwt || !engineBhp) {
      return NextResponse.json(
        { error: 'Nama kapal, Nomor IMO, Tipe Kapal, DWT, dan BHP wajib diisi.' },
        { status: 400 }
      );
    }

    const normalizedType = normalizeVesselType(vesselType);
    if (!normalizedType) {
      return NextResponse.json(
        {
          error: `Tipe kapal tidak dikenal: "${vesselType}".`,
          supported: supportedVesselTypes(),
        },
        { status: 400 }
      );
    }

    const imo = String(imoNumber).replace(/^IMO\s*/i, '').trim();
    if (!/^\d{7}$/.test(imo)) {
      return NextResponse.json({ error: 'Nomor IMO harus 7 digit angka.' }, { status: 400 });
    }

    const parsedDwt = Number.parseFloat(String(dwt));
    const parsedBhp = Number.parseFloat(String(engineBhp));
    if (Number.isNaN(parsedDwt) || parsedDwt <= 0 || Number.isNaN(parsedBhp) || parsedBhp <= 0) {
      return NextResponse.json({ error: 'DWT dan BHP harus berupa angka positif.' }, { status: 400 });
    }

    const parsedGrt = grt ? Number.parseFloat(String(grt)) : Number.NaN;
    const manning = Number.parseInt(String(safeManningTotal ?? 14), 10);

    const vessel = await prisma.vessel.create({
      data: {
        name: String(name).toUpperCase().trim(),
        imoNumber: imo,
        callSign: callSign ? String(callSign).toUpperCase().trim() : null,
        flag: flag ? String(flag).toUpperCase().trim() : 'ID',
        vesselType: normalizedType,
        dwt: parsedDwt,
        grt: Number.isNaN(parsedGrt) ? Math.round(parsedDwt * 0.65 * 100) / 100 : parsedGrt,
        engineBhp: parsedBhp,
        engineType: engineType ? String(engineType).trim() : null,
        tradingArea: tradingArea ? String(tradingArea).trim() : 'Near Coastal Voyages (NCV)',
        ownerName: ownerName ? String(ownerName).trim() : 'PT Haswakarya Perdana Samudra',
        safeManningTotal: Number.isNaN(manning) || manning < 1 ? 14 : manning,
      },
      select: {
        id: true,
        name: true,
        imoNumber: true,
        vesselType: true,
        dwt: true,
        grt: true,
        engineBhp: true,
        ownerName: true,
      },
    });

    await prisma.auditTrail.create({
      data: {
        userId: access.session.userId,
        action: 'CREATE_VESSEL_REGISTRY',
        entityType: 'Vessel',
        entityId: vessel.id,
        details: `Pendaftaran armada kapal baru: ${vessel.name} (IMO: ${vessel.imoNumber})`,
      },
    });

    return NextResponse.json({ success: true, data: vessel }, { status: 201 });
  } catch (error: unknown) {
    console.error('[API Vessels POST Error]', error);
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002') {
      return NextResponse.json({ error: 'Nomor IMO ini sudah terdaftar di armada.' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Gagal mendaftarkan armada kapal.' }, { status: 500 });
  }
}

// Pembungkus metrics: status akhir hanya diketahui di dalam handler.
export const GET = withApiMetrics('/api/portal/vessels', handleGET);
export const POST = withApiMetrics('/api/portal/vessels', handlePOST);
