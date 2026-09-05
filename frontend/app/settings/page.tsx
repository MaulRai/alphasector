'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { AuthGate } from '@/components/AuthGate';
import { useAuth } from '@/lib/auth-context';
import { 
  getCustomSectorsKey, 
  saveCustomSectorsApiKey, 
  verifySectorsApiKey, 
  fetchUserCredits,
  fetchCustomSectorsApiKey
} from '@/lib/api';
import { ConfirmModal } from '@/components/ConfirmModal';
import { ApiKeyManagerCard } from '@/components/settings/ApiKeyManagerCard';
import { ProfileOverviewCard } from '@/components/settings/ProfileOverviewCard';
import { Settings, ArrowLeft, Loader2 } from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const { user, logout, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  
  // States
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // Credits state
  const [credits, setCredits] = useState<number>(50);
  const [hasCustomKey, setHasCustomKey] = useState<boolean>(false);
  const [, setIsLoadingCredits] = useState(false);

  // Modals
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isDeleteKeyModalOpen, setIsDeleteKeyModalOpen] = useState(false);

  // Load existing key & credits from DB when authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      loadDataFromDB();
    } else {
      setApiKeyInput('');
      setHasCustomKey(false);
    }
  }, [isAuthenticated, user]);

  const loadDataFromDB = async () => {
    if (!isAuthenticated) return;
    try {
      setIsLoadingCredits(true);
      const [savedKey, creditsData] = await Promise.all([
        fetchCustomSectorsApiKey().catch(() => getCustomSectorsKey() || ''),
        fetchUserCredits().catch(() => ({ demo_credits: 50, has_custom_sectors_key: false }))
      ]);

      const effectiveKey = savedKey || getCustomSectorsKey() || '';
      setApiKeyInput(effectiveKey);
      setHasCustomKey(!!effectiveKey || creditsData.has_custom_sectors_key);
      setCredits(creditsData.demo_credits ?? 50);
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

          {/* 1. SECTORS FINANCIAL API KEY (BYOK) CARD */}
          <ApiKeyManagerCard
            apiKeyInput={apiKeyInput}
            onApiKeyChange={setApiKeyInput}
            hasCustomKey={hasCustomKey}
            credits={credits}
            isVerifying={isVerifying}
            isSaving={isSaving}
            statusMessage={statusMessage}
            onTestConnection={handleTestConnection}
            onSaveKey={handleSaveKey}
            onRequestDeleteKey={() => setIsDeleteKeyModalOpen(true)}
          />

          {/* 2. ANALYST PROFILE OVERVIEW CARD */}
          <ProfileOverviewCard
            user={user}
            onRequestLogout={() => setIsLogoutModalOpen(true)}
          />
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

      {/* Confirmation Modal for Deleting API Key */}
      <ConfirmModal
        isOpen={isDeleteKeyModalOpen}
        onClose={() => setIsDeleteKeyModalOpen(false)}
        onConfirm={async () => {
          setIsDeleteKeyModalOpen(false);
          await handleResetKey();
        }}
        title="Hapus Sectors API Key"
        description="Apakah Anda yakin ingin menghapus API Key pribadi Anda? Sistem akan kembali menggunakan kuota demo server bersama jika tersedia."
        confirmText="Hapus Key"
        cancelText="Batal"
        variant="danger"
      />
    </div>
  );
}
