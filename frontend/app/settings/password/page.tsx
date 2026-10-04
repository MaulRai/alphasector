'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { AuthGate } from '@/components/AuthGate';
import { useAuth } from '@/lib/auth-context';
import { changeUserPassword } from '@/lib/api';
import { 
  KeyRound, 
  ArrowLeft, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Lock, 
  Check, 
  X,
  ShieldAlert
} from 'lucide-react';

export default function ChangePasswordPage() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();

  // Form states
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Visibility states
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Status & loading
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Dynamic validation checks
  const isMinLength = newPassword.length >= 6;
  const isDifferent = newPassword.length > 0 && oldPassword.length > 0 && newPassword !== oldPassword;
  const isMatch = newPassword.length > 0 && confirmPassword.length > 0 && newPassword === confirmPassword;
  const isFormValid = oldPassword.length > 0 && isMinLength && isMatch && isDifferent;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!oldPassword) {
      setStatusMessage({ type: 'error', text: 'Masukkan password lama Anda.' });
      return;
    }

    if (!isMinLength) {
      setStatusMessage({ type: 'error', text: 'Password baru minimal harus 6 karakter.' });
      return;
    }

    if (newPassword === oldPassword) {
      setStatusMessage({ type: 'error', text: 'Password baru tidak boleh sama dengan password lama.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setStatusMessage({ type: 'error', text: 'Konfirmasi password baru tidak cocok.' });
      return;
    }

    try {
      setIsSubmitting(true);
      setStatusMessage(null);

      const res = await changeUserPassword(oldPassword, newPassword, confirmPassword);
      setStatusMessage({ 
        type: 'success', 
        text: res.message || 'Password berhasil diperbarui! Keamanan akun Anda telah terproteksi.' 
      });

      // Clear fields on success
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');

      // Auto redirect to /settings after 2 seconds
      setTimeout(() => {
        router.push('/settings');
      }, 2000);
    } catch (err: any) {
      setStatusMessage({ 
        type: 'error', 
        text: err.message || 'Gagal mengubah password. Pastikan password lama sesuai.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-emerald-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 pt-24 pb-16 space-y-8 animate-card-reveal">
        <AuthGate
          featureName="Pengaturan Keamanan & Ganti Password"
          featureDescription="Halaman ganti password hanya dapat diakses oleh analis yang telah terautentikasi."
        >
          {/* Back to Settings Link & Header */}
          <div className="space-y-3">
            <Link
              href="/settings"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer group"
            >
              <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
              <span>Kembali ke Pengaturan</span>
            </Link>

            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shadow-md shadow-emerald-500/5">
                <KeyRound className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-wide">
                  Ganti Password Akun Analis
                </h1>
                <p className="text-xs sm:text-sm text-slate-400">
                  Perbarui kata sandi akun analis institusional Anda secara aman
                </p>
              </div>
            </div>
          </div>

          {/* Change Password Card */}
          <form 
            onSubmit={handleSubmit}
            className="rounded-2xl border border-slate-800 bg-[#0a0f1d]/90 backdrop-blur-xl p-5 sm:p-7 space-y-6 shadow-2xl glass-panel"
          >
            {/* Card Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-white">Kredensial Autentikasi</h2>
                  <p className="text-xs text-slate-400">
                    Akun: <span className="text-slate-200 font-semibold">{user?.email || 'analyst@alphasector.com'}</span>
                  </p>
                </div>
              </div>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20">
                <Lock className="h-3 w-3" />
                Terenkripsi PBKDF2-SHA256
              </span>
            </div>

            {/* Input 1: Old Password */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-200 flex items-center justify-between">
                <span>Password Saat Ini (Old Password):</span>
                <span className="text-[11px] text-slate-500 font-normal">Wajib diisi</span>
              </label>
              <div className="relative flex items-center">
                <input
                  type={showOld ? 'text' : 'password'}
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="Masukkan password saat ini..."
                  required
                  autoComplete="current-password"
                  className="w-full pl-4 pr-11 py-3 text-xs sm:text-sm bg-slate-900/90 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowOld(!showOld)}
                  className="absolute right-3.5 p-1 text-slate-400 hover:text-white transition-colors"
                  aria-label={showOld ? "Sembunyikan password" : "Tampilkan password"}
                >
                  {showOld ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Input 2: New Password */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-200 flex items-center justify-between">
                <span>Password Baru (New Password):</span>
                <span className="text-[11px] text-slate-500 font-normal">Minimal 6 karakter</span>
              </label>
              <div className="relative flex items-center">
                <input
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimal 6 karakter yang kuat..."
                  required
                  autoComplete="new-password"
                  className="w-full pl-4 pr-11 py-3 text-xs sm:text-sm bg-slate-900/90 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3.5 p-1 text-slate-400 hover:text-white transition-colors"
                  aria-label={showNew ? "Sembunyikan password" : "Tampilkan password"}
                >
                  {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Input 3: Confirm Password */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-200 flex items-center justify-between">
                <span>Konfirmasi Password Baru (Confirm Password):</span>
                {confirmPassword.length > 0 && (
                  <span className={`text-[11px] flex items-center gap-1 ${isMatch ? 'text-emerald-400 font-semibold' : 'text-red-400'}`}>
                    {isMatch ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                    {isMatch ? 'Cocok' : 'Tidak cocok'}
                  </span>
                )}
              </label>
              <div className="relative flex items-center">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ketik ulang password baru Anda..."
                  required
                  autoComplete="new-password"
                  className={`w-full pl-4 pr-11 py-3 text-xs sm:text-sm bg-slate-900/90 border rounded-xl text-white placeholder-slate-500 focus:outline-none transition-all font-mono ${
                    confirmPassword.length > 0 && !isMatch 
                      ? 'border-red-500/80 focus:border-red-500 focus:ring-1 focus:ring-red-500' 
                      : 'border-slate-700/80 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3.5 p-1 text-slate-400 hover:text-white transition-colors"
                  aria-label={showConfirm ? "Sembunyikan password" : "Tampilkan password"}
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Validation Checklist Box */}
            <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800/80 space-y-1.5 text-xs text-slate-400">
              <span className="font-semibold text-slate-300 block mb-1">Ketentuan Kata Sandi:</span>
              <div className="flex items-center gap-2">
                {isMinLength ? (
                  <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                ) : (
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-600 shrink-0 ml-1 mr-1" />
                )}
                <span className={isMinLength ? 'text-slate-200' : 'text-slate-500'}>
                  Panjang minimal 6 karakter
                </span>
              </div>
              <div className="flex items-center gap-2">
                {isDifferent ? (
                  <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                ) : (
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-600 shrink-0 ml-1 mr-1" />
                )}
                <span className={isDifferent ? 'text-slate-200' : 'text-slate-500'}>
                  Berbeda dari password lama
                </span>
              </div>
              <div className="flex items-center gap-2">
                {isMatch ? (
                  <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                ) : (
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-600 shrink-0 ml-1 mr-1" />
                )}
                <span className={isMatch ? 'text-slate-200' : 'text-slate-500'}>
                  Konfirmasi password cocok
                </span>
              </div>
            </div>

            {/* Status Alert Banner */}
            {statusMessage && (
              <div className={`p-4 rounded-xl border text-xs sm:text-sm flex items-start gap-3 animate-fadeIn ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-red-500/10 border-red-500/30 text-red-400'
              }`}>
                {statusMessage.type === 'success' ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-emerald-400" />
                ) : (
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-400" />
                )}
                <div className="space-y-1">
                  <p>{statusMessage.text}</p>
                  {statusMessage.type === 'success' && (
                    <p className="text-[11px] text-emerald-400/80">Mengalihkan kembali ke halaman Pengaturan...</p>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <Link
                href="/settings"
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs sm:text-sm font-semibold text-slate-300 border border-slate-700 hover:border-slate-600 transition-all cursor-pointer"
              >
                Batal
              </Link>

              <button
                type="submit"
                disabled={isSubmitting || !isFormValid}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 shadow-lg shadow-emerald-500/20 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Memperbarui...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Simpan Password Baru</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Security Best Practices Card */}
          <div className="rounded-2xl border border-slate-800/80 bg-[#080d1a]/80 p-5 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
              <ShieldAlert className="h-4 w-4 text-emerald-400" />
              <span>Praktik Keamanan Akun Riset Institusional</span>
            </div>
            <ul className="text-xs text-slate-400 space-y-1.5 list-disc list-inside leading-relaxed">
              <li>Gunakan kombinasi huruf besar, huruf kecil, angka, dan simbol untuk proteksi optimal.</li>
              <li>Jangan menggunakan password yang sama dengan akun personal atau email pribadi Anda.</li>
              <li>Sesi login saat ini tetap valid setelah penggantian password tanpa perlu login ulang.</li>
            </ul>
          </div>
        </AuthGate>
      </main>
    </div>
  );
}
