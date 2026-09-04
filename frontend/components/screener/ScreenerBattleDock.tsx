'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Swords, X } from 'lucide-react';

interface ScreenerBattleDockProps {
  selectedTickers: string[];
  onToggleTicker: (sym: string) => void;
  onClear: () => void;
}

export const ScreenerBattleDock: React.FC<ScreenerBattleDockProps> = ({
  selectedTickers,
  onToggleTicker,
  onClear,
}) => {
  const router = useRouter();

  if (!selectedTickers || selectedTickers.length === 0) return null;

  return (
    <div className="fixed bottom-6 inset-x-0 mx-auto max-w-2xl px-4 z-40 animate-in slide-in-from-bottom-5 duration-200">
      <div className="rounded-2xl border border-cyan-500/40 bg-[#090e1a]/95 backdrop-blur-xl p-4 shadow-2xl shadow-cyan-950/60 flex flex-col sm:flex-row items-center justify-between gap-4 glass-panel">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="p-2 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 shrink-0">
            <Swords className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-white">
                {selectedTickers.length}/4 Emiten Dipilih
              </span>
              <div className="flex items-center gap-1 flex-wrap">
                {selectedTickers.map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-cyan-500/20 border border-cyan-500/30 text-[11px] font-bold text-cyan-300"
                  >
                    {s}
                    <button
                      onClick={() => onToggleTicker(s)}
                      className="text-cyan-400 hover:text-white cursor-pointer ml-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {selectedTickers.length < 2
                ? 'Pilih minimal 1 emiten lagi untuk memulai perbandingan'
                : 'Siap dikomparasikan head-to-head di arena Peer Battle'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
          <button
            onClick={onClear}
            className="px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-white text-xs font-semibold border border-slate-700/60 transition-all cursor-pointer"
          >
            Reset
          </button>

          <button
            disabled={selectedTickers.length < 2}
            onClick={() => {
              router.push(`/battle?tickers=${selectedTickers.join(',')}&autorun=true`);
            }}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-40 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-cyan-500/20 transition-all hover:scale-105 active:scale-95 cursor-pointer disabled:cursor-not-allowed"
          >
            <Swords className="h-3.5 w-3.5" />
            <span>Adu di Peer Battle ({selectedTickers.length})</span>
          </button>
        </div>
      </div>
    </div>
  );
};
