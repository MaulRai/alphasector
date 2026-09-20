'use client';

import React, { useRef, useEffect, useState } from 'react';
import { 
  Sparkles, ShieldCheck, TrendingUp, Users, Zap, Search, Play, Filter, RefreshCw, CheckCircle2
} from 'lucide-react';

interface ScreenerFilterControlsProps {
  activePreset: string | null;
  onSelectPreset: (slug: string) => void;
  nlQuery: string;
  onNlQueryChange: (val: string) => void;
  onNlSearch: (e?: React.FormEvent) => void;
  selectedSubsector: string;
  onSubsectorChange: (val: string) => void;
  subsectors: string[];
  orderBy: string;
  onOrderByChange: (val: string) => void;
  onFilterSearch: () => void;
  onReset: () => void;
  isLoading: boolean;
}

export const ScreenerFilterControls: React.FC<ScreenerFilterControlsProps> = ({
  activePreset,
  onSelectPreset,
  nlQuery,
  onNlQueryChange,
  onNlSearch,
  selectedSubsector,
  onSubsectorChange,
  subsectors,
  orderBy,
  onOrderByChange,
  onFilterSearch,
  onReset,
  isLoading,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isAnimatingPreset, setIsAnimatingPreset] = useState(false);
  const [animKey, setAnimKey] = useState(0);

  // Auto focus input field on page mount
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 150);
    return () => clearTimeout(timer);
  }, []);

  const handlePresetClick = (slug: string) => {
    setIsAnimatingPreset(true);
    setAnimKey((prev) => prev + 1);
    onSelectPreset(slug);

    // Keep focus and smoothly highlight
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);

    setTimeout(() => {
      setIsAnimatingPreset(false);
    }, 850);
  };

  return (
    <>
      {/* 1-Click Trade Ideas Radar Presets */}
      <div className="mb-8">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
          Preset Trade Ideas Populer (1-Click Run)
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            onClick={() => handlePresetClick('esg-leaders')}
            className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
              activePreset === 'esg-leaders'
                ? 'bg-emerald-500/20 border-emerald-400 text-white shadow-lg shadow-emerald-500/10 scale-[1.01]'
                : 'bg-slate-900/60 border-slate-800 hover:border-emerald-500/40 text-slate-300 hover:bg-slate-800/50'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-xs mb-1 text-emerald-400">
              <ShieldCheck className="h-4 w-4" /> ESG Leaders IDX
            </div>
            <p className="text-[11px] text-slate-400">Top rating keberlanjutan & tata kelola</p>
          </button>

          <button
            onClick={() => handlePresetClick('revenue-growth')}
            className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
              activePreset === 'revenue-growth'
                ? 'bg-blue-500/20 border-blue-400 text-white shadow-lg shadow-blue-500/10 scale-[1.01]'
                : 'bg-slate-900/60 border-slate-800 hover:border-blue-500/40 text-slate-300 hover:bg-slate-800/50'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-xs mb-1 text-blue-400">
              <TrendingUp className="h-4 w-4" /> Revenue Titans
            </div>
            <p className="text-[11px] text-slate-400">Pertumbuhan omset YoY tercepat</p>
          </button>

          <button
            onClick={() => handlePresetClick('large-shareholder')}
            className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
              activePreset === 'large-shareholder'
                ? 'bg-amber-500/20 border-amber-400 text-white shadow-lg shadow-amber-500/10 scale-[1.01]'
                : 'bg-slate-900/60 border-slate-800 hover:border-amber-500/40 text-slate-300 hover:bg-slate-800/50'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-xs mb-1 text-amber-400">
              <Users className="h-4 w-4" /> Large Shareholder
            </div>
            <p className="text-[11px] text-slate-400">Kepemilikan pengendali ≥ 70%</p>
          </button>

          <button
            onClick={() => handlePresetClick('efficient-operators')}
            className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
              activePreset === 'efficient-operators'
                ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-lg shadow-cyan-500/10 scale-[1.01]'
                : 'bg-slate-900/60 border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:bg-slate-800/50'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-xs mb-1 text-cyan-400">
              <Zap className="h-4 w-4" /> Efficient Operators
            </div>
            <p className="text-[11px] text-slate-400">Laba bersih per karyawan tertinggi</p>
          </button>
        </div>
      </div>

      {/* Search Bar & Filters Form */}
      <div className="rounded-2xl border border-slate-800 bg-[#0d121e]/90 p-5 mb-8 glass-panel space-y-4">
        {/* Natural Language Form */}
        <form onSubmit={onNlSearch} className="flex flex-col sm:flex-row items-center gap-2">
          <div 
            className={`relative w-full flex-1 flex items-center rounded-xl border px-3 py-2 transition-all duration-500 ${
              isAnimatingPreset
                ? 'border-emerald-400 bg-emerald-950/30 ring-2 ring-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.25)]'
                : 'border-slate-700 bg-slate-900 focus-within:border-emerald-500/80 focus-within:ring-1 focus-within:ring-emerald-500/40'
            }`}
          >
            <Search className={`h-4 w-4 mr-2 shrink-0 transition-colors ${isAnimatingPreset ? 'text-emerald-300' : 'text-emerald-400'}`} />
            <input
              ref={inputRef}
              key={animKey}
              type="text"
              value={nlQuery}
              onChange={(e) => onNlQueryChange(e.target.value)}
              placeholder="Ketik kriteria bebas (misal: 'saham perbankan dividen > 5%' atau 'batu bara PE murah')..."
              className={`w-full bg-transparent text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none transition-all ${
                isAnimatingPreset ? 'animate-in fade-in slide-in-from-left-1 duration-300' : ''
              }`}
            />
            {isAnimatingPreset && (
              <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-300 bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.5 rounded-full animate-in fade-in zoom-in-95 duration-200 shrink-0 ml-2">
                <Sparkles className="w-2.5 h-2.5" />
                <span>Preset Terisi</span>
              </div>
            )}
          </div>
          <button
            type="submit"
            disabled={isLoading || !nlQuery.trim()}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-bold text-xs transition-all disabled:opacity-50 shrink-0 flex items-center justify-center gap-1.5 cursor-pointer shadow-md hover:shadow-emerald-500/20 hover:brightness-105"
          >
            <Play className="h-3.5 w-3.5 fill-black" />
            <span>Jalankan Skrining</span>
          </button>
        </form>

        {/* Structured Filter Row */}
        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-800/80 text-xs">
          <span className="text-slate-400 font-medium flex items-center gap-1">
            <Filter className="h-3.5 w-3.5 text-emerald-400" /> Filter Sektor & Urutan:
          </span>

          {/* Subsector Select */}
          <select
            value={selectedSubsector}
            onChange={(e) => onSubsectorChange(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="">Semua Subsektor</option>
            {subsectors.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          {/* Order By Select */}
          <select
            value={orderBy}
            onChange={(e) => onOrderByChange(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="-market_cap">Urutkan: Market Cap Terbesar</option>
            <option value="market_cap">Urutkan: Market Cap Terkecil</option>
            <option value="-pe">Urutkan: P/E Tertinggi</option>
            <option value="pe">Urutkan: P/E Terendah (Murah)</option>
            <option value="-pb">Urutkan: PBV Tertinggi</option>
            <option value="pb">Urutkan: PBV Terendah</option>
          </select>

          <button
            onClick={onFilterSearch}
            disabled={isLoading}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold transition-all"
          >
            Terapkan Filter
          </button>

          {(selectedSubsector || nlQuery || activePreset) && (
            <button
              onClick={onReset}
              className="text-xs text-slate-400 hover:text-white underline ml-auto transition-colors"
            >
              Reset Semua
            </button>
          )}
        </div>
      </div>
    </>
  );
};
