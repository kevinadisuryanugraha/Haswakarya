'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Anchor, Lock, Mail, AlertCircle, ArrowRight, ShieldCheck, UserCheck, Ship } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/portal';

  // Login 1-klik hanya aktif bila demo dinyalakan eksplisit lewat env.
  // Tanpa itu, tidak ada kredensial yang tampil atau terisi otomatis.
  const demoLoginEnabled = process.env.NEXT_PUBLIC_DEMO_LOGIN === 'true';
  const demoPassword = process.env.NEXT_PUBLIC_DEMO_PASSWORD ?? '';
  const showDemoLogin = demoLoginEnabled && demoPassword.length > 0;

  const [email, setEmail] = useState(showDemoLogin ? 'admin@haswakarya.com' : '');
  const [password, setPassword] = useState(showDemoLogin ? demoPassword : '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const executeLogin = async (loginEmail: string, loginPass: string) => {
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPass }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Login gagal.');
      }

      router.push(redirectPath);
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeLogin(email, password);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
      {/* Header Logo */}
      <div className="text-center space-y-2 mb-8">
        <div className="w-12 h-12 rounded-xl bg-[#071b34] text-amber-400 flex items-center justify-center mx-auto shadow-md">
          <Anchor className="w-6 h-6" />
        </div>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
          Haswakarya Crewing OS
        </h1>
        <p className="text-xs text-slate-500">
          Masuk ke portal operasional manajemen rekrutmen & kepatuhan maritim (H-COS v2.0)
        </p>
      </div>

      {/* Error Alert Box */}
      {error && (
        <div className="mb-6 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Real Login Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Alamat Email Resmi
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@haswakarya.com"
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:bg-white transition-colors"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              Kata Sandi
            </label>
            {showDemoLogin && (
              <span className="text-[11px] text-slate-400 font-mono">{demoPassword}</span>
            )}
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:bg-white transition-colors"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 px-4 bg-[#071b34] hover:bg-[#0c2b52] text-white text-xs font-bold rounded-lg transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer mt-2"
        >
          {loading ? (
            <span>Memverifikasi Akun di PostgreSQL...</span>
          ) : (
            <>
              <span>Masuk ke Portal</span>
              <ArrowRight className="w-4 h-4 text-amber-400" />
            </>
          )}
        </button>
      </form>

      {/* 1-Click Instant Login Roles */}
      {showDemoLogin && (
      <div className="mt-8 pt-6 border-t border-slate-100 space-y-2.5">
        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center">
          Login 1-Klik Otentikasi Nyata (Real RBAC)
        </div>
        <p className="text-[10px] text-slate-400 text-center">
          Pilih salah satu role untuk langsung masuk dan menguji hak akses RBAC:
        </p>

        <div className="space-y-1.5 pt-1">
          <button
            type="button"
            disabled={loading}
            onClick={() => executeLogin('admin@haswakarya.com', demoPassword)}
            className="w-full p-2.5 rounded-lg border border-slate-200 hover:border-amber-500 hover:bg-amber-50/50 text-slate-800 text-xs font-semibold transition-all flex items-center justify-between group cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              <div className="text-left">
                <div className="text-slate-900 font-bold">Capt. H. Sulaeman Noor, M.Mar</div>
                <div className="text-[10px] text-slate-500 font-mono">Role: SUPERADMIN (Akses Penuh)</div>
              </div>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-600 transition-colors" />
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={() => executeLogin('crewing.manager@haswakarya.com', demoPassword)}
            className="w-full p-2.5 rounded-lg border border-slate-200 hover:border-sky-500 hover:bg-sky-50/50 text-slate-800 text-xs font-semibold transition-all flex items-center justify-between group cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-sky-600" />
              <div className="text-left">
                <div className="text-slate-900 font-bold">Raden Hendro Wibowo, S.T.</div>
                <div className="text-[10px] text-slate-500 font-mono">Role: CREWING_MANAGER</div>
              </div>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-sky-600 transition-colors" />
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={() => executeLogin('owner@pertamina.com', demoPassword)}
            className="w-full p-2.5 rounded-lg border border-slate-200 hover:border-purple-500 hover:bg-purple-50/50 text-slate-800 text-xs font-semibold transition-all flex items-center justify-between group cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Ship className="w-4 h-4 text-purple-600" />
              <div className="text-left">
                <div className="text-slate-900 font-bold">VP Fleet Marine Pertamina</div>
                <div className="text-[10px] text-slate-500 font-mono">Role: SHIPOWNER_CLIENT</div>
              </div>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-purple-600 transition-colors" />
          </button>
        </div>
      </div>
      )}
    </div>
  );
}

export default function PortalLoginPage() {
  return (
    <div className="w-full max-w-md">
      <Suspense fallback={<div className="bg-white p-8 rounded-2xl border text-center text-xs text-slate-400">Memuat portal login...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
