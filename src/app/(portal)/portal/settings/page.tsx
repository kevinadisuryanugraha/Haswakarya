import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ShieldCheck, UserRound, BadgeCheck, ArrowLeft } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';
import { ROLE_LABEL, normalizeRole } from '@/lib/auth/rbac';
import { ChangePasswordForm } from '@/components/portal/ChangePasswordForm';

export const dynamic = 'force-dynamic';

/**
 * Halaman keamanan akun: satu-satunya jalan bagi pengguna mengganti sandi
 * sendiri. Sebelumnya delapan akun produksi berbagi satu sandi seed yang
 * tercatat pada dokumen rilis.
 */
export default async function AccountSettingsPage() {
  const session = await getCurrentUser();
  if (!session) redirect('/portal/login');

  const user = await prisma.user
    .findUnique({
      where: { id: session.userId },
      select: {
        fullName: true,
        email: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
      },
    })
    .catch((error) => {
      console.error('[Portal Settings] gagal membaca user', error);
      return null;
    });

  const role = normalizeRole(user?.role ?? session.role);
  const roleLabel = role ? ROLE_LABEL[role] : 'Pengguna Portal';

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-slate-200 gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Keamanan Akun</h1>
          <p className="text-xs text-slate-500 mt-1">
            Kelola sandi akun portal Anda sendiri. Perubahan berlaku pada login berikutnya.
          </p>
        </div>
        <Link
          href="/portal"
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors self-start"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Ringkasan</span>
        </Link>
      </div>

      <section className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <UserRound className="w-4 h-4 text-slate-400" aria-hidden="true" />
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500">Identitas Akun</h2>
        </div>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Nama Lengkap</dt>
            <dd className="text-slate-900 font-semibold mt-0.5">{user?.fullName ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Email</dt>
            <dd className="text-slate-900 font-mono text-xs mt-1 break-all">{user?.email ?? session.email}</dd>
          </div>
          <div>
            <dt className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Peran</dt>
            <dd className="inline-flex items-center gap-1.5 mt-1 text-xs font-bold px-2 py-1 rounded-md bg-[#071b34]/5 text-[#071b34] border border-[#071b34]/10">
              <BadgeCheck className="w-3.5 h-3.5" aria-hidden="true" />
              {roleLabel}
            </dd>
          </div>
          <div>
            <dt className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Login Terakhir</dt>
            <dd className="text-slate-700 text-xs mt-1">
              {user?.lastLoginAt
                ? new Date(user.lastLoginAt).toLocaleString('id-ID', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })
                : 'Belum pernah tercatat'}
            </dd>
          </div>
        </dl>
      </section>

      <ChangePasswordForm />

      <section className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-xs text-slate-600 space-y-2">
        <p className="flex items-center gap-2 font-bold text-slate-800">
          <ShieldCheck className="w-4 h-4 text-emerald-600" aria-hidden="true" />
          Catatan keamanan
        </p>
        <ul className="list-disc pl-5 space-y-1 leading-relaxed">
          <li>Portal tidak pernah mengirim sandi lewat email; ganti sandi hanya dari halaman ini.</li>
          <li>
            Sesi di perangkat lain tetap aktif sampai kedaluwarsa (maksimal 7 hari). Jika perangkat
            tersebut bukan milik Anda, segera ganti sandi lagi setelah memastikan akses fisik aman.
          </li>
          <li>Jangan bagikan sandi akun portal ke pihak luar, termasuk kepada kandidat pelaut.</li>
        </ul>
      </section>
    </div>
  );
}