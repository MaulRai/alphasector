'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Key, X, ArrowRight, Sparkles } from 'lucide-react';

export const ApiKeySetupTooltip: React.FC = () => {
  const pathname = usePathname();
  const { user, isAuthenticated, isFreshLogin, dismissApiKeyTooltip } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Condition:
  // 1. Mounted on client
  // 2. User is authenticated
  // 3. User does not have a custom Sectors API key yet
  // 4. Fresh login token is active
  // 5. Not already on the /settings page
  const shouldShow =
    mounted &&
    isAuthenticated &&
    user &&
    !user.has_custom_sectors_key &&
    isFreshLogin &&
    pathname !== '/settings';

  if (!shouldShow) return null;

  return (
    <div 
      className="absolute right-0 top-full mt-3 z-50 w-72 sm:w-84 animate-in fade-in slide-in-from-top-2 duration-300"
      role="tooltip"
      aria-label="Panduan Pengaturan Sectors API Key"
    >
      {/* Upward-pointing caret arrow pointing straight to Settings icon */}
      <div className="absolute -top-1.5 right-3 w-3 h-3 bg-[#0a0f1d] border-t border-l border-emerald-500/40 rotate-45 z-10" />

      {/* Main Glassmorphism Tooltip Container */}
      <div className="relative rounded-2xl border border-emerald-500/35 bg-[#0a0f1d]/95 backdrop-blur-2xl p-4 shadow-2xl shadow-emerald-950/60 ring-1 ring-emerald-500/20 text-left">
        {/* Header: Key Icon, Title, Pulsing Glow, and Close Button */}
        <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/25 text-emerald-400">
              <Key className="h-3.5 w-3.5" />
            </div>
            <span className="text-xs font-bold text-white tracking-wide">
              Koneksi Sectors API
            </span>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
          </div>

          <button
            type="button"
            onClick={dismissApiKeyTooltip}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors cursor-pointer"
            aria-label="Tutup petunjuk"
            title="Tutup petunjuk"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Tooltip Content Body */}
        <p className="text-xs text-slate-300 mt-2.5 leading-relaxed">
          Akun Anda saat ini memakai <span className="text-emerald-400 font-semibold">kuota server demo</span>. Pasang personal Sectors API Key di Pengaturan untuk riset emiten tanpa batas kuota.
        </p>

        {/* Action Button Row */}
        <div className="flex items-center justify-between gap-2 mt-3.5 pt-2 border-t border-slate-800/60">
          <button
            type="button"
            onClick={dismissApiKeyTooltip}
            className="px-2.5 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs font-medium border border-slate-800 transition-colors cursor-pointer"
          >
            Nanti saja
          </button>

          <Link
            href="/settings"
            onClick={dismissApiKeyTooltip}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition-all active:scale-95 cursor-pointer"
          >
            <Sparkles className="h-3 w-3" />
            <span>Atur API Key</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </div>
  );
};
