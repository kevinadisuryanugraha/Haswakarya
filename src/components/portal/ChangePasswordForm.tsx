'use client';

import React, { useMemo, useState } from 'react';
import { KeyRound, ShieldCheck, AlertTriangle, Loader2, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { PASSWORD_MIN_LENGTH, passwordStrength } from '@/lib/auth/password';

type FieldName = 'currentPassword' | 'newPassword' | 'confirmPassword';

const STRENGTH_LABEL: Record<ReturnType<typeof passwordStrength>, { text: string; className: string }> = {
  empty: { text: '—', className: 'text-slate-400' },
  weak: { text: 'Lemah', className: 'text-rose-600' },
  fair: { text: 'Cukup', className: 'text-amber-600' },
  strong: { text: 'Kuat', className: 'text-emerald-600' },
};

export function ChangePasswordForm() {
  const [values, setValues] = useState<Record<FieldName, string>>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [reveal, setReveal] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [field, setField] = useState<FieldName | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [sessionNote, setSessionNote] = useState<string | null>(null);

  const strength = useMemo(() => passwordStrength(values.newPassword), [values.newPassword]);
  const strengthMeta = STRENGTH_LABEL[strength];

  const setFieldValue = (name: FieldName, value: string) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    if (field === name) setField(null);
    if (error) setError(null);
    if (success) setSuccess(null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setSuccess(null);
    setSessionNote(null);

    try {
      const response = await fetch('/api/auth/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const json = (await response.json().catch(() => ({}))) as {
        error?: string;
        field?: FieldName;
        message?: string;
        otherSessionsNote?: string;
      };

      if (!response.ok) {
        setError(json.error ?? 'Gagal mengganti sandi.');
        setField(json.field ?? null);
        return;
      }

      setValues({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setSuccess(json.message ?? 'Sandi berhasil diganti.');
      setSessionNote(json.otherSessionsNote ?? null);
    } catch (err) {
      console.error('Change password failed:', err);
      setError('Jaringan gagal. Coba lagi.');
    } finally {
      setBusy(false);
    }
  };

  const inputType = reveal ? 'text' : 'password';

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-5 shadow-xs"
      noValidate
    >
      <div className="flex items-start gap-3 pb-4 border-b border-slate-100">
        <div className="w-9 h-9 rounded-lg bg-[#071b34] text-amber-400 flex items-center justify-center shrink-0">
          <KeyRound className="w-4 h-4" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-slate-900">Ganti Sandi Akun</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Sandi lama wajib benar. Sandi baru minimal {PASSWORD_MIN_LENGTH} karakter.
          </p>
        </div>
      </div>

      {[
        { name: 'currentPassword' as FieldName, label: 'Sandi saat ini', autoComplete: 'current-password' },
        { name: 'newPassword' as FieldName, label: 'Sandi baru', autoComplete: 'new-password' },
        { name: 'confirmPassword' as FieldName, label: 'Ulangi sandi baru', autoComplete: 'new-password' },
      ].map((entry) => (
        <div key={entry.name} className="space-y-1.5">
          <label
            htmlFor={entry.name}
            className="block text-xs font-bold text-slate-700 uppercase tracking-wide"
          >
            {entry.label}
          </label>
          <div className="relative">
            <input
              id={entry.name}
              name={entry.name}
              type={inputType}
              autoComplete={entry.autoComplete}
              value={values[entry.name]}
              onChange={(event) => setFieldValue(entry.name, event.target.value)}
              disabled={busy}
              aria-invalid={field === entry.name}
              aria-describedby={field === entry.name ? `${entry.name}-error` : undefined}
              className={`w-full px-3.5 py-2.5 pr-11 text-sm rounded-lg border bg-white text-slate-900 outline-none transition-colors disabled:bg-slate-50 ${
                field === entry.name
                  ? 'border-rose-300 focus:border-rose-400 focus:ring-2 focus:ring-rose-100'
                  : 'border-slate-200 focus:border-[#071b34] focus:ring-2 focus:ring-[#071b34]/10'
              }`}
            />
            {entry.name !== 'currentPassword' && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-bold">
                <span className={strengthMeta.className}>{strengthMeta.text}</span>
              </span>
            )}
          </div>
          {field === entry.name && error && (
            <p id={`${entry.name}-error`} className="text-xs text-rose-600 font-medium flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              {error}
            </p>
          )}
        </div>
      ))}

      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <button
          type="button"
          onClick={() => setReveal((prev) => !prev)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          {reveal ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          {reveal ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
        </button>

        <button
          type="submit"
          disabled={busy}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-lg bg-[#071b34] hover:bg-[#0c2b52] text-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-xs"
        >
          {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />}
          {busy ? 'Menyimpan...' : 'Simpan Sandi Baru'}
        </button>
      </div>

      {error && !field && (
        <div
          role="alert"
          className="flex items-start gap-2 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2.5"
        >
          <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div
          role="status"
          className="space-y-1.5 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2.5"
        >
          <p className="flex items-start gap-2 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 shrink-0" aria-hidden="true" />
            <span>{success}</span>
          </p>
          {sessionNote && <p className="text-emerald-700/80 pl-5">{sessionNote}</p>}
        </div>
      )}

      <p className="text-[11px] text-slate-400 leading-relaxed pt-1 border-t border-slate-100">
        Sandi disimpan sebagai hash bcrypt dan tidak pernah dicatat di log maupun jejak audit.
        Permintaan dibatasi lima percobaan per 15 menit.
      </p>
    </form>
  );
}