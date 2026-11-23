import React from 'react';
import Link from 'next/link';
import { ShieldAlert } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { buildVettingDossier, type VettingDossier } from '@/lib/vetting/dossier';
import { ShipownerVettingView } from '@/components/portal/ShipownerVettingView';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function loadDossier(token: string): Promise<VettingDossier | null> {
  const application = await prisma.crewApplication.findUnique({
    where: { vettingToken: token },
    select: {
      vettingToken: true,
      tokenExpiresAt: true,
      seafarer: {
        select: {
          seamanBookNo: true,
          passportNo: true,
          sidNumber: true,
          primaryRank: true,
          totalSeaTimeDays: true,
          marlinsScore: true,
          user: { select: { fullName: true } },
          certificates: {
            orderBy: { expiryDate: 'asc' },
            select: {
              certName: true,
              category: true,
              issuingAuthority: true,
              expiryDate: true,
              isVerified: true,
            },
          },
          seaTimes: {
            orderBy: { signOnDate: 'desc' },
            select: {
              vesselName: true,
              imoNumber: true,
              vesselType: true,
              grt: true,
              dwt: true,
              rankServed: true,
              signOnDate: true,
              signOffDate: true,
              totalDays: true,
            },
          },
        },
      },
      requisition: {
        select: {
          vessel: {
            select: { name: true, vesselType: true, dwt: true, grt: true, engineBhp: true },
          },
        },
      },
      vetting: {
        select: {
          recommendation: true,
          sireMatrixScore: true,
          matrixSummary: true,
          verifiedByMaster: true,
          updatedAt: true,
        },
      },
    },
  });

  if (!application || !application.vettingToken) return null;

  return buildVettingDossier(
    {
      token: application.vettingToken,
      tokenExpiresAt: application.tokenExpiresAt,
      seafarer: {
        fullName: application.seafarer.user.fullName,
        seamanBookNo: application.seafarer.seamanBookNo,
        passportNo: application.seafarer.passportNo,
        sidNumber: application.seafarer.sidNumber,
        primaryRank: application.seafarer.primaryRank,
        totalSeaTimeDays: application.seafarer.totalSeaTimeDays,
        marlinsScore: application.seafarer.marlinsScore,
        certificates: application.seafarer.certificates,
        seaTimes: application.seafarer.seaTimes,
      },
      targetVessel: application.requisition?.vessel ?? null,
      vetting: application.vetting,
    },
    new Date()
  );
}

export default async function ShipownerVettingTokenPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const dossier = await loadDossier(token).catch((error) => {
    console.error('[Vetting Page Error]', error);
    return null;
  });

  if (!dossier) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-16 font-sans">
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl p-8 space-y-4 text-center">
          <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h1 className="text-lg font-bold text-slate-900">Tautan Vetting Tidak Ditemukan</h1>
          <p className="text-sm text-slate-600">
            Token <span className="font-mono text-slate-800">{token}</span> tidak terdaftar pada
            sistem Haswakarya, atau sudah tidak aktif. Hubungi crewing manager untuk tautan terbaru.
          </p>
          <Link
            href="/portal/login"
            className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-[#071b34] text-white text-xs font-bold hover:bg-[#0c2b52] transition-colors"
          >
            Masuk ke Portal
          </Link>
        </div>
      </div>
    );
  }

  return <ShipownerVettingView dossier={dossier} />;
}
