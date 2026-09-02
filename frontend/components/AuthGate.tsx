'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { 
  Lock, Sparkles, LogIn, UserPlus, Zap, 
  ShieldCheck, ArrowRight, AlertCircle, RefreshCw,
  CheckCircle2, Eye, EyeOff
} from 'lucide-react';

interface AuthGateProps {
  featureName?: string;
  featureDescription?: string;
  children: React.ReactNode;
}

export const AuthGate: React.FC<AuthGateProps> = ({
  featureName = 'Institutional Research Suite',
  featureDescription = 'Fitur analisis otonom pasar modal Indonesia memerlukan sesi autentikasi analis.',
  children,
}) => {
  const { user, isAuthenticated, isLoading, login, loginDemo, register } = useAuth();
  
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  
  // Password visibility states
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If already authenticated, directly render protected content
  if (isAuthenticated && user) {
    return <>{children}</>;
  }

  // Loading spinner while checking token
  if (isLoading) {
    return (
      <div className="py-24 text-center space-y-3">
        <RefreshCw className="h-8 w-8 text-emerald-400 animate-spin mx-auto" />
        <p className="text-xs text-slate-400 font-medium">Memeriksa sesi autentikasi...</p>
      </div>
    );
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Harap isi email dan password.');
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Email atau password salah.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !confirmPassword || !fullName) {
      setError('Harap lengkapi seluruh kolom pendaftaran.');
      return;
    }
    if (password.length < 6) {
      setError('Password minimal 6 karakter.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Konfirmasi password tidak cocok.');
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      await register(email, password, fullName);
    } catch (err: any) {
      setError(err.message || 'Gagal mendaftarkan akun.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoLogin = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      await loginDemo();
    } catch (err: any) {
      setError(err.message || 'Gagal masuk akun demo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      
      {/* Institutional Access Gate Card */}
      <div className="rounded-3xl border border-slate-800 bg-[#090d16]/90 p-6 sm:p-10 shadow-2xl backdrop-blur-xl relative overflow-hidden">
        
        {/* Ambient Glow */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          
          {/* Left Column: Feature Highlights & Info */}
          <div className="lg:col-span-6 space-y-6">
            
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
                <Lock className="h-3.5 w-3.5" />
                <span>Autentikasi Diperlukan</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {featureName}
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                {featureDescription}
              </p>
            </div>

            {/* Unlocked Capabilities List */}
            <div className="space-y-2.5 pt-2 border-t border-slate-800/80">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Fitur yang Terbuka Setelah Masuk:
              </span>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Autonomous Multi-Step Copilot & LPU Reasoning</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0" />
                  <span>Komparasi Peer Battle Matrix & PBV/PE Multiples</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0" />
                  <span>Smart Money & Institutional Broker Flow Tracker</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-teal-400 shrink-0" />
                  <span>Exportable Equity Research Dossier (PDF/Markdown)</span>
                </li>
              </ul>
            </div>

            {/* 1-Click Instant Demo Login CTA */}
            <div className="pt-2">
              <button
                onClick={handleDemoLogin}
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:brightness-110 active:scale-98 text-black font-bold text-xs transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <RefreshCw className="h-4 w-4 animate-spin text-black" />
                ) : (
                  <>
                    <Zap className="h-4 w-4 fill-black" />
                    <span>⚡ 1-Click Demo Login (Akses Instan)</span>
                  </>
                )}
              </button>
              <p className="text-[10px] text-center text-slate-400 mt-1.5">
                Menggunakan akun demo terverifikasi (<span className="text-slate-300 font-mono">demo@alphasector.id</span>)
              </p>
            </div>

          </div>

          {/* Right Column: In-Page Auth Form */}
          <div className="lg:col-span-6 p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl">
            
            {/* Form Tabs */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-950/80 border border-slate-800 mb-5">
              <button
                type="button"
                onClick={() => { setTab('login'); setError(null); }}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  tab === 'login'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <LogIn className="h-3.5 w-3.5" />
                <span>Masuk</span>
              </button>
              <button
                type="button"
                onClick={() => { setTab('register'); setError(null); }}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  tab === 'register'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <UserPlus className="h-3.5 w-3.5" />
                <span>Daftar Akun</span>
              </button>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="p-3 mb-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Login Form */}
            {tab === 'login' ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Email Analis
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@perusahaan.com"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-400 text-xs focus:outline-none focus:border-emerald-400 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showLoginPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-400 text-xs focus:outline-none focus:border-emerald-400 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1"
                      title={showLoginPassword ? 'Sembunyikan password' : 'Lihat password'}
                    >
                      {showLoginPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-98 border border-slate-700 text-white font-semibold text-xs transition-all disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <RefreshCw className="h-4 w-4 animate-spin text-white" />
                  ) : (
                    <>
                      <LogIn className="h-4 w-4 text-emerald-400" />
                      <span>Masuk ke Workspace</span>
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* Register Form with 2 Password Fields & Eye Peek */
              <form onSubmit={handleRegister} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Budi Pratama"
                    required
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-400 text-xs focus:outline-none focus:border-emerald-400 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="budi@sekuritas.id"
                    required
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-400 text-xs focus:outline-none focus:border-emerald-400 transition-colors"
                  />
                </div>

                {/* Password Field 1 with Eye Icon */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Password (Min 6 karakter)
                  </label>
                  <div className="relative">
                    <input
                      type={showRegisterPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      minLength={6}
                      className="w-full px-3.5 py-2 pr-10 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-400 text-xs focus:outline-none focus:border-emerald-400 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1"
                      title={showRegisterPassword ? 'Sembunyikan password' : 'Lihat password'}
                    >
                      {showRegisterPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Password Field 2 (Konfirmasi Password) with Eye Icon */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Konfirmasi Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      minLength={6}
                      className="w-full px-3.5 py-2 pr-10 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-400 text-xs focus:outline-none focus:border-emerald-400 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1"
                      title={showConfirmPassword ? 'Sembunyikan password' : 'Lihat password'}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-98 border border-slate-700 text-white font-semibold text-xs transition-all disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <RefreshCw className="h-4 w-4 animate-spin text-white" />
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4 text-emerald-400" />
                      <span>Buat Akun & Masuk</span>
                    </>
                  )}
                </button>
              </form>
            )}

          </div>

        </div>

      </div>

    </div>
  );
};
