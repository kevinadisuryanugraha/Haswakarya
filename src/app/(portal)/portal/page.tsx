import React from 'react';
import Link from 'next/link';
import {
  Ship,
  Users,
  ShieldCheck,
  AlertTriangle,
  ClipboardList,
  Clock,
  ChevronRight,
  Activity,
} from 'lucide-react';
import { guardCapability } from '@/lib/auth/guard';
import { loadPortalOverview } from '@/lib/portal/overview';

/**
 * Ringkasan Operasional Armada.
 *
 * Dahulu halaman ini komponen klien yang memanggil dua API setelah hidrasi,
 * sehingga pengguna melihat kerangka "—" lebih dahulu lalu angka muncul
 * belakangan. Sekarang data diambil di server (satu gelombang query paralel)
 * dan HTML pertama sudah berisi angka final — tidak ada kedipan data.
 */
export default async function PortalOverviewPage() {
  const access = await guardCapability('portal.operations', 'portal.read_own');
  if (!access.ok) {
    // Middleware sudah menjaga rute ini; ini lapis kedua bila sesi kedaluwarsa
    // di antara middleware dan render.
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
        Sesi Anda tidak lagi valid. Silakan masuk kembali melalui halaman login portal.
      </div>
    );
  }

  const { stats, certificates } = await loadPortalOverview();

  const totalVessels = stats.totalVessels;
  const totalSeafarers = stats.totalSeafarers;
  const activeRequisitions = stats.activeRequisitions;
  const compliance = stats.safeManningCompliancePercent;
  const sirePassRate = stats.sireMatrixPassRate;
  const sireAssessedCount = stats.sireMatrixAssessedCount;
  const urgentList = stats.urgentRequisitions as Array<{
    id: string;
    requisitionNo: string;
    rank: string;
    targetPort: string;
    targetJoinDate: string | Date;
    status: string;
    vessel?: { name?: string; vesselType?: string } | null;
  }>;
  const audits = stats.recentAudits as Array<{
    id: string;
    action: string;
    details?: string | null;
    createdAt: string | Date;
    ipAddress?: string | null;
    user?: { fullName?: string | null } | null;
  }>;
  const expiringCerts = certificates.filter(
    (c) => c.expiryStatus === 'CRITICAL_EXPIRED' || c.expiryStatus === 'WARNING_EXPIRING_SOON'
  );

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-slate-200 gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Ringkasan Operasional Armada (Fleet Overview)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Pengawasan kelaiklautan, pemenuhan awak kapal (safe manning), dan verifikasi kepatuhan maritim real-time.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/portal/requisitions"
            className="px-3.5 py-2 text-xs font-bold rounded-lg border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <ClipboardList className="w-3.5 h-3.5 text-slate-500" />
            <span>Permintaan Awak</span>
          </Link>
          <Link
            href="/portal/crewing"
            className="px-3.5 py-2 text-xs font-bold rounded-lg bg-[#071b34] hover:bg-[#0c2b52] text-white transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Users className="w-3.5 h-3.5 text-amber-400" />
            <span>Buka ATS Kanban</span>
          </Link>
        </div>
      </div>

      {/* Metric KPI Cards (Clean Light Theme) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Armada Aktif</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
              Live DB
            </span>
          </div>
          <div className="flex items-baseline gap-3 mt-3">
            <span className="text-3xl font-extrabold text-slate-900">{totalVessels}</span>
            <Ship className="w-5 h-5 text-sky-600" />
          </div>
          <p className="text-[11px] text-slate-500 mt-2">Tanker, Bulk Carrier, Tugboat</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Awak Terdaftar</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Hubla Verified
            </span>
          </div>
          <div className="flex items-baseline gap-3 mt-3">
            <span className="text-3xl font-extrabold text-slate-900">{totalSeafarers}</span>
            <Users className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-[11px] text-slate-500 mt-2">Perwira &amp; Rating Terverifikasi</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Safe Manning Open</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
              {compliance === null ? 'Belum dihitung' : `${compliance}% patuh`}
            </span>
          </div>
          <div className="flex items-baseline gap-3 mt-3">
            <span className="text-3xl font-extrabold text-slate-900">{activeRequisitions}</span>
            <ClipboardList className="w-5 h-5 text-amber-600" />
          </div>
          <p className="text-[11px] text-slate-500 mt-2">Voyage target bulan ini</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Kepatuhan SIRE 2.0</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
              Audit Ready
            </span>
          </div>
          <div className="flex items-baseline gap-3 mt-3">
            <span className="text-3xl font-extrabold text-slate-900">
              {sirePassRate === null ? '—' : `${sirePassRate}%`}
            </span>
            <ShieldCheck className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            {sireAssessedCount === 0
              ? 'Belum ada asesmen matriks'
              : `${sireAssessedCount} asesmen matriks terekam`}
          </p>
        </div>
      </div>

      {/* Main Grid: Real Urgent Requisitions & Real Audit Trail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (8 Cols): Urgent Requisitions Table */}
        <div className="lg:col-span-8 min-w-0 bg-white border border-slate-200 rounded-xl p-4 sm:p-6 shadow-xs space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between pb-4 border-b border-slate-100">
            <div className="min-w-0">
              <h2 className="text-sm font-bold text-slate-900">
                Permintaan Awak Kapal Mendesak (Safe Manning Requisitions)
              </h2>
              <p className="text-xs text-slate-500">
                Data real dari tabel database PostgreSQL <code className="font-mono text-slate-700">CrewRequisition</code>
              </p>
            </div>
            <Link
              href="/portal/requisitions"
              className="text-xs font-semibold text-amber-700 hover:text-amber-800 flex items-center gap-1 shrink-0"
            >
              <span>Semua Permintaan</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="mobile-cards w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">No. Requisition</th>
                  <th className="py-2.5 px-3">Armada Kapal</th>
                  <th className="py-2.5 px-3">Jabatan</th>
                  <th className="py-2.5 px-3">Pelabuhan Join</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {urgentList.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                    <td data-label="No. Requisition" className="py-3 px-3 font-mono font-medium text-slate-900">
                      {req.requisitionNo}
                    </td>
                    <td data-label="Armada Kapal" className="py-3 px-3">
                      <div className="font-bold text-slate-900">{req.vessel?.name}</div>
                      <div className="text-[11px] text-slate-400">{req.vessel?.vesselType?.replace(/_/g, ' ')}</div>
                    </td>
                    <td data-label="Jabatan" className="py-3 px-3 font-semibold text-slate-800">
                      {req.rank?.replace(/_/g, ' ')}
                    </td>
                    <td data-label="Pelabuhan Join" className="py-3 px-3 text-slate-600">
                      <div className="truncate max-w-[180px]">{req.targetPort}</div>
                      <div className="text-[10px] text-slate-400">
                        Join: {new Date(req.targetJoinDate).toLocaleDateString('id-ID', { timeZone: 'Asia/Jakarta' })}
                      </div>
                    </td>
                    <td data-label="Status" className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        {req.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {urgentList.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400" data-label="">
                      Belum ada requisition aktif di database.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* STCW Expiry Alert Engine Mini-Table */}
          <div className="pt-4 border-t border-slate-100">
            <div className="flex flex-col gap-1.5 pb-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-1.5 text-xs font-bold text-slate-900 min-w-0">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <span>Peringatan Dokumen STCW Kritis / Menjelang Habis (&lt; 90 Hari)</span>
              </div>
              <Link href="/portal/seafarers" className="text-[11px] font-semibold text-primary hover:underline shrink-0">
                Kelola di Vault Pelaut
              </Link>
            </div>

            {expiringCerts.length === 0 ? (
              <div className="p-3 bg-emerald-50/60 border border-emerald-200/60 rounded-lg text-emerald-800 text-xs flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Seluruh sertifikat pelaut aktif dalam status valid (Zero Port State Control Risk).</span>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden">
                {expiringCerts.map((c) => (
                  <div key={c.id} className="p-2.5 flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between bg-slate-50/50 hover:bg-slate-50 text-xs">
                    <div className="min-w-0">
                      <div className="font-bold text-navy">{c.seafarerName}</div>
                      <div className="text-[11px] text-slate-500 font-mono break-words">
                        {c.certName} ({c.certificateNo})
                      </div>
                    </div>
                    <div className="sm:text-right shrink-0">
                      {c.expiryStatus === 'CRITICAL_EXPIRED' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                          <AlertTriangle className="w-3 h-3 text-rose-600" />
                          <span>Mendesak: {c.daysRemaining} hari</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800">
                          <Clock className="w-3 h-3 text-amber-600" />
                          <span>Peringatan: {c.daysRemaining} hari</span>
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (4 Cols): Real Audit Trail */}
        <div className="lg:col-span-4 min-w-0 bg-white border border-slate-200 rounded-xl p-4 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
            <Activity className="w-4 h-4 text-slate-700" />
            <h2 className="text-sm font-bold text-slate-900">Audit Trail Terverifikasi</h2>
          </div>

          <div className="space-y-3">
            {audits.map((a) => (
              <div key={a.id} className="p-3 rounded-lg bg-slate-50 border border-slate-100 space-y-1">
                <div className="flex items-center justify-between gap-2 text-[11px]">
                  <span className="font-bold text-slate-900 font-mono truncate">{a.action}</span>
                  <span className="text-[10px] text-slate-400">
                    {new Date(a.createdAt).toLocaleTimeString('id-ID', {
                      hour: '2-digit',
                      minute: '2-digit',
                      timeZone: 'Asia/Jakarta',
                    })}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-tight">{a.details}</p>
                <div className="text-[10px] text-slate-400 pt-0.5 flex items-center justify-between gap-2">
                  <span className="truncate">IP: {a.ipAddress || '127.0.0.1'}</span>
                  <span className="truncate">{a.user?.fullName || 'Sistem'}</span>
                </div>
              </div>
            ))}
            {audits.length === 0 && (
              <div className="py-8 text-center text-slate-400 text-xs">
                Belum ada aktivitas tercatat.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}