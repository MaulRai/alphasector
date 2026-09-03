'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { AuthGate } from '@/components/AuthGate';
import { useAuth } from '@/lib/auth-context';
import { 
  getCustomSectorsKey, 
  saveCustomSectorsApiKey, 
  verifySectorsApiKey, 
  fetchUserCredits 
} from '@/lib/api';
import { ConfirmModal } from '@/components/ConfirmModal';
import { 
  Settings, Key, User, LogOut, 
  Eye, EyeOff, CheckCircle2, AlertCircle, 
  ExternalLink, Sparkles, HelpCircle, Loader2,
  Zap, ArrowLeft, ShieldCheck, Database
} from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const { user, logout, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  
  // States
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // Credits state
  const [credits, setCredits] = useState<number>(50);
  const [hasCustomKey, setHasCustomKey] = useState<boolean>(false);
  const [isLoadingCredits, setIsLoadingCredits] = useState(false);

  // Logout confirm modal
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  // Load existing key & credits only if authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      const savedKey = getCustomSectorsKey() || '';
      setApiKeyInput(savedKey);
      setHasCustomKey(!!savedKey);
      loadCredits();
    } else {
      setApiKeyInput('');
      setHasCustomKey(false);
    }
  }, [isAuthenticated, user]);

  const loadCredits = async () => {
    if (!isAuthenticated) return;
    try {
      setIsLoadingCredits(true);
      const data = await fetchUserCredits();
      setCredits(data.demo_credits);
      if (data.has_custom_sectors_key) {
        setHasCustomKey(true);
      }
    } catch {
      // fallback
    } finally {
      setIsLoadingCredits(false);
    }
  };

  const handleTestConnection = async () => {
    if (!apiKeyInput.trim()) {
      setStatusMessage({ type: 'error', text: 'Masukkan API key sebelum melakukan uji koneksi.' });
      return;
    }
    try {
      setIsVerifying(true);
      setStatusMessage(null);
      const res = await verifySectorsApiKey(apiKeyInput.trim());
      setStatusMessage({ 
        type: 'success', 
        text: `Koneksi Berhasil! ${res.message} (Latensi: ${res.latency_ms}ms)` 
      });
    } catch (err: any) {
      setStatusMessage({ 
        type: 'error', 
        text: err.message || 'API key tidak valid atau gagal terhubung ke Sectors API.' 
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSaveKey = async () => {
    try {
      setIsSaving(true);
      setStatusMessage(null);
      const cleanKey = apiKeyInput.trim();
      await saveCustomSectorsApiKey(cleanKey || null);
      setHasCustomKey(!!cleanKey);
      setStatusMessage({ 
        type: 'success', 
        text: cleanKey 
          ? 'API Key pribadi berhasil disimpan dan aktif!' 
          : 'API Key dihapus. Anda kembali menggunakan kuota server demo.' 
      });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Gagal menyimpan API key.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetKey = async () => {
    setApiKeyInput('');
    await saveCustomSectorsApiKey(null);
    setHasCustomKey(false);
    setStatusMessage({ type: 'success', text: 'Kembali menggunakan kuota server demo default.' });
  };

  const handleConfirmLogout = () => {
    setIsLogoutModalOpen(false);
    logout();
    router.push('/copilot');
  };

  const quotaPercent = Math.max(0, Math.min(100, (credits / 50) * 100));

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
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-black">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 pt-24 pb-16 space-y-8 animate-card-reveal">
        <AuthGate
          featureName="Pengaturan Analis & Sectors API Key"
          featureDescription="Halaman pengaturan dan pengelolaan personal API key (BYOK) hanya dapat diakses oleh analis yang telah login."
        >
        {/* Back Link & Page Title */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => {
              if (typeof window !== 'undefined' && window.history.length > 1) {
                router.back();
              } else {
                router.push('/copilot');
              }
            }}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer group"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
            <span>Kembali ke Halaman Sebelumnya</span>
          </button>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shadow-md shadow-emerald-500/5">
              <Settings className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-wide">
                Pengaturan Analis & Sectors API Key
              </h1>
              <p className="text-xs sm:text-sm text-slate-400">
                Kelola personal API key (BYOK), kuota server demo, dan profil riset institucional
              </p>
            </div>
          </div>
        </div>

        {/* 1. SECTORS FINANCIAL API KEY (BYOK) SECTION */}
        <div className="rounded-2xl border border-slate-800 bg-[#0a0f1d]/90 backdrop-blur-xl p-5 sm:p-7 space-y-6 shadow-2xl glass-panel">
          
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                <Key className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-white">Sectors Financial API Key</h2>
                <p className="text-xs text-slate-400">Koneksi data fundamental & kuota riset</p>
              </div>
            </div>

            {hasCustomKey && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Key Pribadi Aktif
              </span>
            )}
          </div>

          {/* Demo Credit Meter */}
          {!hasCustomKey && (
            <div className="p-4 sm:p-5 rounded-2xl bg-[#080d1a] border border-slate-800/90 space-y-3">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="text-slate-300 font-semibold">Sisa Kuota Demo Server:</span>
                <span className="font-mono font-bold text-emerald-400">
                  {credits} / 50 Credit
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2.5 rounded-full bg-slate-900 border border-slate-800 overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 rounded-full ${
                    credits > 20 
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-400' 
                      : credits > 5 
                      ? 'bg-amber-500' 
                      : 'bg-red-500'
                  }`}
                  style={{ width: `${quotaPercent}%` }}
                />
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                Setiap riset memakai kuota server demo. Jika habis, masukkan API Key pribadi Anda di bawah untuk melanjutkan riset tanpa batas!
              </p>
            </div>
          )}

          {/* API Key Input Form */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-200">
              Masukkan Sectors API Key Anda (Opsional / BYOK):
            </label>

            <div className="relative flex items-center">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder="Contoh: dbae3d04c9d166167ef3462d80155e5..."
                className="w-full pl-4 pr-11 py-3 text-xs sm:text-sm bg-slate-900/90 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 font-mono focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3.5 p-1 text-slate-400 hover:text-white transition-colors"
              >
                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Status Alert Banner */}
          {statusMessage && (
            <div className={`p-4 rounded-xl border text-xs sm:text-sm flex items-start gap-3 ${
              statusMessage.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-red-500/10 border-red-500/30 text-red-400'
            }`}>
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-emerald-400" />
              ) : (
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-400" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* Actions Button Group */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isVerifying || !apiKeyInput.trim()}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-slate-200 border border-slate-700 hover:border-slate-600 transition-all disabled:opacity-40 active:scale-95"
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-emerald-400" />
                    <span>Menguji...</span>
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 text-cyan-400" />
                    <span>Tes Koneksi</span>
                  </>
                )}
              </button>

              {hasCustomKey && (
                <button
                  type="button"
                  onClick={handleResetKey}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-red-500/10 text-xs font-semibold text-slate-400 hover:text-red-400 border border-slate-800 hover:border-red-500/30 transition-all"
                >
                  Hapus Key
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={handleSaveKey}
              disabled={isSaving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-black text-xs sm:text-sm font-bold hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-emerald-500/10 disabled:opacity-40"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <span>Simpan Pengaturan</span>
              )}
            </button>
          </div>

          {/* Step-by-Step Tutorial Box */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#080d1a] border border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-emerald-400" />
                <span>Panduan Mendapatkan Sectors API Key:</span>
              </span>
              <a
                href="https://sectors.app/api"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1 font-semibold"
              >
                <span>Buka sectors.app/api</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>

            <ol className="space-y-2 text-xs text-slate-400 list-decimal list-inside leading-relaxed">
              <li>
                Kunjungi halaman resmi{' '}
                <a
                  href="https://sectors.app/api"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-400 hover:text-emerald-300 font-semibold underline underline-offset-2 inline-flex items-center gap-0.5"
                >
                  sectors.app/api
                  <ExternalLink className="h-2.5 w-2.5 inline" />
                </a>{' '}
                dan pastikan Anda sudah login ke akun Sectors Anda.
              </li>
              <li>
                Klik dan masuk ke tab <strong className="text-slate-200">API Key Management</strong> di bagian atas dashboard.
              </li>
              <li>
                Klik tombol <strong className="text-emerald-300">Create Key</strong> untuk membuat key baru, lalu salin (*copy*) nilai API Key tersebut dan tempelkan ke form input di atas.
              </li>
            </ol>
          </div>

        </div>

        {/* 2. ANALYST PROFILE & LOGOUT SECTION */}
        <div className="rounded-2xl border border-slate-800 bg-[#0a0f1d]/90 backdrop-blur-xl p-5 sm:p-7 space-y-6 shadow-2xl glass-panel">
          
          <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
                <User className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-white">Profil Analis</h2>
                <p className="text-xs text-slate-400">Informasi akun dan hak akses institutional</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-slate-500 block text-[11px] uppercase font-bold tracking-wider">Nama Lengkap</span>
              <span className="font-semibold text-white mt-1 block">{user?.full_name || 'Demo Analyst'}</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-slate-500 block text-[11px] uppercase font-bold tracking-wider">Email Analis</span>
              <span className="font-semibold text-white mt-1 block truncate">{user?.email || 'demo@alphasector.id'}</span>
            </div>
          </div>

          {/* Logout Button */}
          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={() => setIsLogoutModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs sm:text-sm font-semibold transition-all active:scale-95"
            >
              <LogOut className="h-4 w-4" />
              <span>Keluar dari Akun (Logout)</span>
            </button>
          </div>

        </div>
        </AuthGate>
      </main>

      {/* Confirmation Modal for Logout */}
      <ConfirmModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleConfirmLogout}
        title="Konfirmasi Logout"
        description="Apakah Anda yakin ingin keluar dari sesi analis AlphaSector?"
        confirmText="Keluar (Logout)"
        cancelText="Batal"
        variant="danger"
      />
    </div>
  );
}
