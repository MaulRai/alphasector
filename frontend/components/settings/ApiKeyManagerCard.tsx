'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Key, Eye, EyeOff, CheckCircle2, AlertCircle, Loader2, Zap, Trash2, ExternalLink
} from 'lucide-react';

interface ApiKeyManagerCardProps {
  apiKeyInput: string;
  onApiKeyChange: (val: string) => void;
  hasCustomKey: boolean;
  credits: number;
  isVerifying: boolean;
  isSaving: boolean;
  statusMessage: { type: 'success' | 'error'; text: string } | null;
  onTestConnection: () => void;
  onSaveKey: () => void;
  onRequestDeleteKey: () => void;
}

export const ApiKeyManagerCard: React.FC<ApiKeyManagerCardProps> = ({
  apiKeyInput,
  onApiKeyChange,
  hasCustomKey,
  credits,
  isVerifying,
  isSaving,
  statusMessage,
  onTestConnection,
  onSaveKey,
  onRequestDeleteKey,
}) => {
  const [showKey, setShowKey] = useState(false);
  const quotaPercent = Math.min(100, Math.max(0, (credits / 50) * 100));

  return (
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
            <span className="font-mono tabular-nums font-bold text-emerald-400">
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
            onChange={(e) => onApiKeyChange(e.target.value)}
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
            onClick={onTestConnection}
            disabled={isVerifying || !apiKeyInput.trim()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-slate-200 border border-slate-700 hover:border-slate-600 transition-all disabled:opacity-40 active:scale-95 cursor-pointer"
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
              onClick={onRequestDeleteKey}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-xs font-semibold text-red-400 border border-red-500/30 hover:border-red-500/50 transition-all active:scale-95 cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5 text-red-400" />
              <span>Hapus Key</span>
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={onSaveKey}
          disabled={isSaving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-black text-xs sm:text-sm font-bold hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-emerald-500/10 disabled:opacity-40 cursor-pointer"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Menyimpan...</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4" />
              <span>Simpan Pengaturan</span>
            </>
          )}
        </button>
      </div>

      {/* Guide Link */}
      <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/20 text-xs text-emerald-200/90 flex items-center justify-between gap-3">
        <span>Belum punya API key Sectors? Daftar dan dapatkan key gratis di portal resmi.</span>
        <a
          href="https://sectors.app"
          target="_blank"
          rel="noopener noreferrer"
          className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 shrink-0"
        >
          <span>Buka Sectors.app</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
    </div>
  );
};
