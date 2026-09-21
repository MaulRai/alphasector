'use client';

import React from 'react';
import { Briefcase } from 'lucide-react';

interface InsiderFilingsMiniGridProps {
  insiderFilings: any[];
  primaryTicker?: string;
}

export const InsiderFilingsMiniGrid: React.FC<InsiderFilingsMiniGridProps> = ({
  insiderFilings,
  primaryTicker,
}) => {
  if (!insiderFilings || insiderFilings.length === 0) return null;

  return (
    <div className="rounded-2xl border border-slate-800 bg-[#0d121e]/90 p-5 sm:p-6 shadow-2xl glass-panel glow-cyan animate-card-reveal-delay-1">
      <div className="flex items-center justify-between gap-4 pb-3 border-b border-slate-800 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <Briefcase className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">
              Keterbukaan Transaksi Orang Dalam (Insider Filings) {primaryTicker ? `(${primaryTicker})` : ''}
            </h3>
            <p className="text-[11px] text-slate-400">
              Laporan transaksi resmi Direksi, Komisaris, dan Pemegang Saham Pengendali BEI
            </p>
          </div>
        </div>
        <span className="text-[10px] px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-300 font-semibold border border-cyan-500/20 shrink-0">
          {insiderFilings.length} Laporan Resmi
        </span>
      </div>

      {/* Mini Filings List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {insiderFilings.slice(0, 4).map((fil: any, fIdx: number) => {
          const isBuy = (fil.transaction_type || '').toUpperCase() === 'BUY';
          return (
            <div key={fIdx} className="p-3 rounded-xl bg-[#090d16] border border-slate-800 hover:border-cyan-500/30 transition-colors">
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="font-bold text-white text-xs truncate">{fil.name || 'Orang Dalam'}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                  isBuy ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                }`}>
                  {isBuy ? 'Akumulasi Beli' : 'Divestasi Jual'}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>{fil.position || 'Manajemen Kunci'}</span>
                <span className="font-mono text-slate-300">{fil.date || '-'}</span>
              </div>
              {(fil.shares || fil.value) && (
                <div className="mt-1.5 pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                  <span className="text-slate-500">Volume:</span>
                  <span className="font-mono text-cyan-300 font-semibold">
                    {Number(fil.shares || 0).toLocaleString('id-ID')} lembar
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
