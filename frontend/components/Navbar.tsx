'use client';

import React from 'react';
import { Sparkles, Terminal, Activity, BookOpen, ShieldCheck } from 'lucide-react';

interface NavbarProps {
  onOpenCommandPalette: () => void;
  onOpenDossier?: () => void;
  hasActiveReport?: boolean;
  backendOnline?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenCommandPalette,
  onOpenDossier,
  hasActiveReport,
  backendOnline = true,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/5 bg-[#07090e]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Brand Logo & Tag */}
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 via-cyan-500/20 to-blue-600/20 border border-emerald-500/30 glow-emerald">
            <Sparkles className="h-5 w-5 text-emerald-400" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-white">
                Alpha<span className="text-emerald-400">Sector</span>
              </span>
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20">
                Track 01 Agent
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Autonomous Equity Research Copilot for IDX
            </p>
          </div>
        </div>

        {/* Center Quick Search Trigger */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <button
            onClick={onOpenCommandPalette}
            className="w-full flex items-center justify-between px-3.5 py-2 text-sm text-slate-400 bg-slate-900/60 hover:bg-slate-800/80 border border-slate-700/50 hover:border-emerald-500/40 rounded-xl transition-all shadow-inner group"
          >
            <div className="flex items-center gap-2.5 truncate">
              <Terminal className="h-4 w-4 text-emerald-400" />
              <span className="text-slate-400 group-hover:text-slate-200 truncate">
                Tanya analisis emiten atau peer comparison...
              </span>
            </div>
            <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded bg-slate-800 px-2 py-0.5 text-[11px] font-medium text-slate-400 border border-slate-700">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right Status Actions */}
        <div className="flex items-center gap-3">
          {/* Backend Status Pill */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/60 border border-slate-800 text-xs">
            <span className={`h-2 w-2 rounded-full ${backendOnline ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`}></span>
            <span className="text-slate-300 hidden sm:inline">
              {backendOnline ? 'Sectors API v2 Active' : 'Connecting...'}
            </span>
          </div>

          {/* Export Dossier Button if report is active */}
          {hasActiveReport && onOpenDossier && (
            <button
              onClick={onOpenDossier}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-semibold transition-all hover:scale-105"
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span>Export Dossier</span>
            </button>
          )}
        </div>

      </div>
    </header>
  );
};
