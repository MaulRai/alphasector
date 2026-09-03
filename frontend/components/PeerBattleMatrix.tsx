'use client';

import React from 'react';
import { PeerCompanyMetric } from '@/lib/types';
import { Award, Zap, TrendingDown, CheckCircle } from 'lucide-react';

interface PeerBattleMatrixProps {
  matrix: PeerCompanyMetric[];
}

export const PeerBattleMatrix: React.FC<PeerBattleMatrixProps> = ({ matrix }) => {
  if (!matrix || matrix.length === 0) return null;

  return (
    <div className="rounded-2xl border border-slate-800 bg-[#0d121e]/90 p-6 shadow-2xl glass-panel glow-cyan mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-white tracking-tight">
              Peer Battle & Valuation Matrix
            </h3>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              {matrix.length} Emiten Head-to-Head
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Komparasi rasio valuasi, efisiensi modal, dan performa keuangan dalam satu subsektor
          </p>
        </div>
      </div>

      {/* Responsive Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-900/40">
              <th className="py-3 px-4 rounded-l-xl">Emiten</th>
              <th className="py-3 px-4">Market Cap</th>
              <th className="py-3 px-4">P/E Ratio</th>
              <th className="py-3 px-4">PBV Ratio</th>
              <th className="py-3 px-4">ROE</th>
              <th className="py-3 px-4">NPM</th>
              <th className="py-3 px-4 rounded-r-xl">DER</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-medium">
            {matrix.map((c, idx) => (
              <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                
                {/* Symbol & Name */}
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 border border-slate-700 text-xs font-bold text-white">
                      {c.symbol.slice(0, 2)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-white text-base">
                          {c.symbol}
                        </span>
                        {c.is_lowest_pe && (
                          <span className="flex items-center gap-0.5 text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <Zap className="h-2.5 w-2.5" /> Best PE
                          </span>
                        )}
                        {c.is_highest_roe && (
                          <span className="flex items-center gap-0.5 text-[10px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            <Award className="h-2.5 w-2.5" /> Top ROE
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 truncate max-w-[160px]">
                        {c.company_name}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Market Cap */}
                <td className="py-4 px-4 text-slate-300">
                  {c.market_cap ? `Rp ${(c.market_cap / 1e12).toFixed(1)} T` : '-'}
                </td>

                {/* PE */}
                <td className="py-4 px-4">
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                    c.is_lowest_pe 
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                      : 'text-slate-200'
                  }`}>
                    {c.pe ? `${c.pe}x` : '-'}
                  </span>
                </td>

                {/* PBV */}
                <td className="py-4 px-4">
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                    c.is_lowest_pbv 
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' 
                      : 'text-slate-200'
                  }`}>
                    {c.pbv ? `${c.pbv}x` : '-'}
                  </span>
                </td>

                {/* ROE */}
                <td className="py-4 px-4">
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                    c.is_highest_roe 
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' 
                      : 'text-slate-200'
                  }`}>
                    {c.roe !== null && c.roe !== undefined ? `${c.roe}%` : '-'}
                  </span>
                </td>

                {/* NPM */}
                <td className="py-4 px-4 text-slate-300">
                  {c.npm !== null && c.npm !== undefined ? `${c.npm}%` : '-'}
                </td>

                {/* DER */}
                <td className="py-4 px-4 text-slate-300">
                  {c.der !== null && c.der !== undefined ? `${c.der}x` : '-'}
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
