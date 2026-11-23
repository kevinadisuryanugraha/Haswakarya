import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { guardCapability, forbiddenResponse } from '@/lib/auth/guard';
import { hasCapability } from '@/lib/auth/rbac';
import { isKnownRank, supportedRanks } from '@/lib/maritime/rankMapper';
import { SeafarerStatus, UserRole, type PtkpStatus } from '@prisma/client';
import { withApiMetrics } from '@/lib/observability/withApiMetrics';
import { isPtkpStatus } from '@/lib/tax/pph21';
import { maskNpwp, normalizeNpwp } from '@/lib/tax/npwp';

async function handleGET(req: NextRequest) {
  const access = await guardCapability('portal.operations', 'portal.read_own');
  if (!access.ok) return access.response;

  const isStaff = hasCapability(access.session.role, 'portal.operations');

  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q')?.trim() ?? '';
    const rank = searchParams.get('rank');
    const status = searchParams.get('status');

    let ownSeafarerId: string | null = null;
    if (!isStaff) {
      const own = await prisma.seafarerProfile.findUnique({
        where: { userId: access.session.userId },
        select: { id: true },
      });
      if (!own) {
        return forbiddenResponse('Forbidden: profil pelaut tidak terhubung ke akun ini.');
      }
      ownSeafarerId = own.id;
    }

    if (rank && !isKnownRank(rank)) {
      return NextResponse.json({ error: `Parameter rank tidak dikenal: "${rank}".` }, { status: 400 });
    }

    const validRank = rank && isKnownRank(rank) ? rank : null;

    if (status && !(Object.values(SeafarerStatus) as string[]).includes(status)) {
      return NextResponse.json({ error: `Parameter status tidak dikenal: "${status}".` }, { status: 400 });
    }

    const seafarers = await prisma.seafarerProfile.findMany({
      where: {
        AND: [
          ownSeafarerId ? { id: ownSeafarerId } : {},
          query
            ? {
                OR: [
                  { user: { fullName: { contains: query, mode: 'insensitive' } } },
                  { seamanBookNo: { contains: query, mode: 'insensitive' } },
                  // Pencarian paspor hanya untuk staf internal.
                  ...(isStaff
                    ? [{ passportNo: { contains: query, mode: 'insensitive' } as never }]
                    : []),
                ],
              }
            : {},
          validRank ? { primaryRank: validRank } : {},
          status ? { currentStatus: status as SeafarerStatus } : {},
        ],
      },
      select: {
        id: true,
        seamanBookNo: true,
        passportNo: isStaff,
        sidNumber: isStaff,
        npwp: isStaff,
        ptkpStatus: true,
        primaryRank: true,
        currentStatus: true,
        totalSeaTimeDays: true,
        marlinsScore: true,
        bloodType: true,
        createdAt: true,
        user: { select: { id: true, fullName: true, email: true, phone: true } },
        certificates: {
          select: {
            id: true,
            certName: true,
            category: true,
            certificateNo: true,
            expiryDate: true,
            isVerified: true,
          },
        },
        seaTimes: {
          select: {
            id: true,
            vesselName: true,
            vesselType: true,
            rankServed: true,
            signOnDate: true,
            signOffDate: true,
            totalDays: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // NPWP hanya boleh tampil ter-mask di daftar; bentuk penuh ada di e-Bupot.
    const masked = seafarers.map((row) => ({ ...row, npwp: maskNpwp(row.npwp) }));

    return NextResponse.json({ success: true, count: masked.length, data: masked });
  } catch (error) {
    console.error('[API Seafarers GET Error]', error);
    return NextResponse.json({ error: 'Gagal memuat data pelaut.' }, { status: 500 });
  }
}

async function handlePOST(req: NextRequest) {
  const access = await guardCapability('portal.operations');
  if (!access.ok) return access.response;

  try {
    const body = await req.json();
    const {
      fullName,
      email,
      phone,
      seamanBookNo,
      passportNo,
      sidNumber,
      primaryRank,
      dateOfBirth,
      placeOfBirth,
      homeAddress,
      emergencyContact,
      emergencyPhone,
      npwp,
      ptkpStatus,
    } = body ?? {};

    if (!fullName || !email || !seamanBookNo || !primaryRank) {
      return NextResponse.json(
        { error: 'Nama, Email, Nomor Buku Pelaut, dan Jabatan wajib diisi.' },
        { status: 400 }
      );
    }

    if (!isKnownRank(primaryRank)) {
      return NextResponse.json(
        { error: `Jabatan tidak dikenal: "${primaryRank}".`, supported: supportedRanks() },
        { status: 400 }
      );
    }

    const normalizedNpwp = npwp ? normalizeNpwp(String(npwp)) : null;
    if (npwp && !normalizedNpwp) {
      return NextResponse.json({ error: 'NPWP harus 15 atau 16 digit angka.' }, { status: 400 });
    }
    if (ptkpStatus && !isPtkpStatus(String(ptkpStatus))) {
      return NextResponse.json(
        { error: 'Status PTKP tidak dikenal. Gunakan TK0–TK3 atau K0–K3.' },
        { status: 400 }
      );
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return NextResponse.json({ error: 'Format email tidak valid.' }, { status: 400 });
    }

    // Password awal unik per pelaut; dikembalikan sekali agar staf dapat
    // menyerahkannya, dan tidak pernah disimpan dalam bentuk terang.
    const initialPassword = `Hwk-${randomBytes(6).toString('base64url')}`;
    const passwordHash = await bcrypt.hash(initialPassword, 10);

    const result = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          fullName: String(fullName).trim(),
          email: normalizedEmail,
          phone: phone ? String(phone).trim() : null,
          passwordHash,
          role: UserRole.CANDIDATE_SEAFARER,
        },
        select: { id: true, fullName: true, email: true, phone: true },
      });

      const profile = await tx.seafarerProfile.create({
        data: {
          userId: newUser.id,
          seamanBookNo: String(seamanBookNo).trim().toUpperCase(),
          passportNo: passportNo ? String(passportNo).trim().toUpperCase() : null,
          sidNumber: sidNumber ? String(sidNumber).trim() : null,
          npwp: normalizedNpwp,
          ptkpStatus: ptkpStatus ? (String(ptkpStatus) as PtkpStatus) : undefined,
          primaryRank,
          dateOfBirth: dateOfBirth ? new Date(String(dateOfBirth)) : new Date('1990-01-01'),
          placeOfBirth: placeOfBirth ? String(placeOfBirth).trim() : 'Indonesia',
          homeAddress: homeAddress ? String(homeAddress).trim() : 'Alamat Domisili',
          emergencyContact: emergencyContact ? String(emergencyContact).trim() : 'Keluarga',
          emergencyPhone: emergencyPhone
            ? String(emergencyPhone).trim()
            : phone
              ? String(phone).trim()
              : '-',
          currentStatus: SeafarerStatus.STANDBY_POOL,
        },
        select: {
          id: true,
          seamanBookNo: true,
          primaryRank: true,
          currentStatus: true,
          ptkpStatus: true,
          user: { select: { id: true, fullName: true, email: true, phone: true } },
        },
      });

      await tx.auditTrail.create({
        data: {
          userId: access.session.userId,
          action: 'CREATE_SEAFARER_PROFILE',
          entityType: 'SeafarerProfile',
          entityId: profile.id,
          details: `Pembuatan profil pelaut baru: ${profile.user.fullName} (${profile.seamanBookNo})`,
        },
      });

      return profile;
    });

    return NextResponse.json(
      {
        success: true,
        data: result,
        initialPassword,
        notice:
          'Password awal hanya ditampilkan sekali. Serahkan ke pelaut dan minta segera menggantinya.',
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('[API Seafarers POST Error]', error);
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Email atau Nomor Buku Pelaut sudah terdaftar di sistem.' },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: 'Gagal membuat profil pelaut.' }, { status: 500 });
  }
}

// Pembungkus metrics: status akhir hanya diketahui di dalam handler.
export const GET = withApiMetrics('/api/portal/seafarers', handleGET);
export const POST = withApiMetrics('/api/portal/seafarers', handlePOST);
