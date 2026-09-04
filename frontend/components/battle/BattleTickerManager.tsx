'use client';

import React from 'react';
import { Zap, Play, RefreshCw, X } from 'lucide-react';
import { CompanyLogo } from '@/components/CompanyLogo';
import { TickerAutocompleteInput } from '@/components/TickerAutocompleteInput';

interface BattleTickerManagerProps {
  tickers: string[];
  isLoading: boolean;
  onSelectTicker: (sym: string) => void;
  onRemoveTicker: (sym: string) => void;
  onRunBattle: () => void;
}

export const BattleTickerManager: React.FC<BattleTickerManagerProps> = ({
  tickers,
  isLoading,
  onSelectTicker,
  onRemoveTicker,
  onRunBattle,
}) => {
  return (
    <div className="rounded-2xl border border-slate-800 bg-[#0d121e]/90 p-5 mb-8 glass-panel space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Active Tickers Chips */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400 font-medium mr-1">Emiten Dipilih:</span>
          {tickers.length === 0 ? (
            <span className="text-xs text-slate-500 italic">
              Belum ada emiten. Silakan tambahkan minimal 2 emiten.
            </span>
          ) : (
            tickers.map((sym) => (
              <span
                key={sym}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-bold text-xs"
              >
                <CompanyLogo symbol={sym} size="xs" />
                <span>{sym}</span>
                <button
                  onClick={() => onRemoveTicker(sym)}
                  className="p-0.5 rounded hover:bg-cyan-500/20 text-cyan-400 cursor-pointer"
                  title={`Hapus ${sym}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))
          )}
        </div>

        {/* Add Ticker Input with Focus Suggestions & Live Search */}
        <TickerAutocompleteInput
          onSelectTicker={onSelectTicker}
          selectedTickers={tickers}
          maxSelected={4}
          disabled={isLoading}
          placeholder="Tambah kode emiten..."
          buttonText="Tambah"
        />
      </div>

      {/* Action Trigger Row */}
      <div className="pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <Zap className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
          <span>{tickers.length} Sectors API • 1 AI Synthesis</span>
        </div>

        <button
          onClick={onRunBattle}
          disabled={isLoading || tickers.length < 2}
          className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:brightness-110 active:scale-95 text-black font-bold text-xs sm:text-sm transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:brightness-100 cursor-pointer"
        >
          {isLoading ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>Memproses Battle...</span>
            </>
          ) : (
            <>
              <Play className="h-4 w-4 fill-black" />
              <span>
                {tickers.length >= 2 
                  ? `Jalankan Peer Battle (${tickers.join(' vs ')})`
                  : tickers.length === 1
                  ? 'Pilih 1 Emiten Lagi (Min. 2)'
                  : 'Pilih Minimal 2 Emiten'}
              </span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
