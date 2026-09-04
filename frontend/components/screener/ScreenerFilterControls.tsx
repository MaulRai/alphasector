'use client';

import React from 'react';
import { 
  Sparkles, ShieldCheck, TrendingUp, Users, Zap, Search, Play, Filter, RefreshCw
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
            onClick={() => onSelectPreset('esg-leaders')}
            className={`p-3.5 rounded-xl border text-left transition-all ${
              activePreset === 'esg-leaders'
                ? 'bg-emerald-500/20 border-emerald-400 text-white shadow-lg shadow-emerald-500/10'
                : 'bg-slate-900/60 border-slate-800 hover:border-emerald-500/40 text-slate-300'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-xs mb-1 text-emerald-400">
              <ShieldCheck className="h-4 w-4" /> ESG Leaders IDX
            </div>
            <p className="text-[11px] text-slate-400">Top rating keberlanjutan & tata kelola</p>
          </button>

          <button
            onClick={() => onSelectPreset('revenue-growth')}
            className={`p-3.5 rounded-xl border text-left transition-all ${
              activePreset === 'revenue-growth'
                ? 'bg-blue-500/20 border-blue-400 text-white shadow-lg shadow-blue-500/10'
                : 'bg-slate-900/60 border-slate-800 hover:border-blue-500/40 text-slate-300'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-xs mb-1 text-blue-400">
              <TrendingUp className="h-4 w-4" /> Revenue Titans
            </div>
            <p className="text-[11px] text-slate-400">Pertumbuhan omset YoY tercepat</p>
          </button>

          <button
            onClick={() => onSelectPreset('large-shareholder')}
            className={`p-3.5 rounded-xl border text-left transition-all ${
              activePreset === 'large-shareholder'
                ? 'bg-amber-500/20 border-amber-400 text-white shadow-lg shadow-amber-500/10'
                : 'bg-slate-900/60 border-slate-800 hover:border-amber-500/40 text-slate-300'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-xs mb-1 text-amber-400">
              <Users className="h-4 w-4" /> Large Shareholder
            </div>
            <p className="text-[11px] text-slate-400">Kepemilikan pengendali ≥ 70%</p>
          </button>

          <button
            onClick={() => onSelectPreset('efficient-operators')}
            className={`p-3.5 rounded-xl border text-left transition-all ${
              activePreset === 'efficient-operators'
                ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-lg shadow-cyan-500/10'
                : 'bg-slate-900/60 border-slate-800 hover:border-cyan-500/40 text-slate-300'
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
          <div className="relative w-full flex-1 flex items-center rounded-xl border border-slate-700 bg-slate-900 px-3 py-2">
            <Search className="h-4 w-4 text-emerald-400 mr-2 shrink-0" />
            <input
              type="text"
              value={nlQuery}
              onChange={(e) => onNlQueryChange(e.target.value)}
              placeholder="Ketik kriteria bebas (misal: 'saham perbankan dividen > 5%' atau 'batu bara PE murah')..."
              className="w-full bg-transparent text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !nlQuery.trim()}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-bold text-xs transition-all disabled:opacity-50 shrink-0 flex items-center justify-center gap-1.5"
          >
            <Play className="h-3.5 w-3.5 fill-black" />
            <span>Saring dengan NLP</span>
          </button>
        </form>

        {/* Structured Filter Row */}
        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-800/80 text-xs">
          <span className="text-slate-400 font-medium flex items-center gap-1">
            <Filter className="h-3.5 w-3.5 text-emerald-400" /> Filter Terstruktur:
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
