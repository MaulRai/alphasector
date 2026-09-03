'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { 
  getCustomSectorsKey, 
  saveCustomSectorsApiKey, 
  verifySectorsApiKey, 
  fetchUserCredits 
} from '@/lib/api';
import { ConfirmModal } from '@/components/ConfirmModal';
import { 
  Settings, Key, ShieldCheck, User, LogOut, 
  Eye, EyeOff, CheckCircle2, AlertCircle, 
  ExternalLink, Sparkles, HelpCircle, Loader2,
  X, RefreshCw, Layers, Zap
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogoutConfirm?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onLogoutConfirm,
}) => {
  const { user, logout } = useAuth();
  
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

  // Load existing key & credits when modal opens
  useEffect(() => {
    if (isOpen) {
      const savedKey = getCustomSectorsKey() || '';
      setApiKeyInput(savedKey);
      setHasCustomKey(!!savedKey);
      setStatusMessage(null);
      loadCredits();
    }
  }, [isOpen]);

  const loadCredits = async () => {
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

  if (!isOpen) return null;

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

  const handleLogout = () => {
    setIsLogoutModalOpen(true);
  };

  const handleConfirmLogout = () => {
    setIsLogoutModalOpen(false);
    onClose();
    if (onLogoutConfirm) {
      onLogoutConfirm();
    } else {
      logout();
    }
  };

  const quotaPercent = Math.max(0, Math.min(100, (credits / 50) * 100));

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
        
        {/* Settings Modal Container */}
        <div 
          className="w-full max-w-2xl rounded-2xl border border-slate-800 bg-[#0a0d16] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-card-reveal"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Header */}
          <div className="p-4 sm:p-5 border-b border-slate-800 bg-[#080b13] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <Settings className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white tracking-wide">
                  Pengaturan Analis & Sectors API Key
                </h3>
                <p className="text-xs text-slate-400">
                  Konfigurasi kuota demo, personal API key (BYOK), dan profil analis
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Modal Body (Scrollable) */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 custom-scrollbar">
            
            {/* 1. SECTORS API KEY & BYOK SECTION */}
            <div className="rounded-2xl border border-slate-800 bg-[#0d121e]/90 p-4 sm:p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800/80">
                <div className="flex items-center gap-2">
                  <Key className="h-4 w-4 text-emerald-400" />
                  <span className="text-sm font-bold text-white">Sectors Financial API Key</span>
                </div>

                {hasCustomKey ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Key Pribadi Aktif
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-semibold border border-cyan-500/20">
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                    Kuota Server Demo
                  </span>
                )}
              </div>

              {/* Demo Credit Meter */}
              {!hasCustomKey && (
                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium">Sisa Kuota Demo Server:</span>
                    <span className="font-mono font-bold text-emerald-400">
                      {credits} / 50 Credit
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ${
                        credits > 20 
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-400' 
                          : credits > 5 
                          ? 'bg-amber-500' 
                          : 'bg-red-500'
                      }`}
                      style={{ width: `${quotaPercent}%` }}
                    />
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Setiap riset memakai kuota server demo. Jika habis, masukkan API Key pribadi Anda di bawah untuk melanjutkan riset tanpa batas!
                  </p>
                </div>
              )}

              {/* API Key Input Form */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300">
                  Masukkan Sectors API Key Anda (Opsional / BYOK):
                </label>

                <div className="relative flex items-center">
                  <input
                    type={showKey ? 'text' : 'password'}
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                    placeholder="Contoh: dbae3d04c9d166167ef3462d80155e5..."
                    className="w-full pl-3 pr-10 py-2.5 text-xs bg-slate-900 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 font-mono focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-3 p-1 text-slate-400 hover:text-white transition-colors"
                  >
                    {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Status Alert Banner */}
              {statusMessage && (
                <div className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
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
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleTestConnection}
                    disabled={isVerifying || !apiKeyInput.trim()}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 hover:border-slate-600 transition-all disabled:opacity-40"
                  >
                    {isVerifying ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-400" />
                        <span>Menguji...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="h-3.5 w-3.5 text-cyan-400" />
                        <span>Tes Koneksi</span>
                      </>
                    )}
                  </button>

                  {hasCustomKey && (
                    <button
                      type="button"
                      onClick={handleResetKey}
                      className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-red-500/10 text-xs font-semibold text-slate-400 hover:text-red-400 border border-slate-800 hover:border-red-500/30 transition-all"
                    >
                      Hapus Key
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleSaveKey}
                  disabled={isSaving}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-black text-xs font-bold hover:brightness-110 active:scale-95 transition-all shadow-md shadow-emerald-500/10 disabled:opacity-40"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <span>Simpan Pengaturan</span>
                  )}
                </button>
              </div>

              {/* Step-by-Step Tutorial Box */}
              <div className="p-3.5 rounded-xl bg-[#090d16] border border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                    <HelpCircle className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Cara Mendapatkan Sectors API Key:</span>
                  </span>
                  <a
                    href="https://sectors.app"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1 font-semibold"
                  >
                    <span>Buka sectors.app</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>

                <ol className="space-y-1 text-[11px] text-slate-400 list-decimal list-inside leading-relaxed">
                  <li>Buka portal resmi <strong className="text-slate-200">sectors.app</strong> dan login/register gratis.</li>
                  <li>Selesaikan proses onboarding akun di portal Sectors.</li>
                  <li>Buka tab <strong className="text-slate-200">API Keys</strong>, klik <em>Generate Key</em>, lalu salin key Anda ke form di atas.</li>
                </ol>
              </div>

            </div>

            {/* 2. ANALYST PROFILE & LOGOUT SECTION */}
            <div className="rounded-2xl border border-slate-800 bg-[#0d121e]/90 p-4 sm:p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-cyan-400" />
                  <span className="text-sm font-bold text-white">Profil Analis</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  ID: #{user?.id || 1}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Nama Lengkap</span>
                  <span className="font-semibold text-white mt-0.5 block">{user?.full_name || 'Demo Analyst'}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Email Analis</span>
                  <span className="font-semibold text-white mt-0.5 block truncate">{user?.email || 'demo@alphasector.id'}</span>
                </div>
              </div>

              {/* Logout Button */}
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-semibold transition-all active:scale-95"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Keluar dari Akun (Logout)</span>
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>

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
    </>
  );
};
