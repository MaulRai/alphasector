'use client';

import React from 'react';
import Link from 'next/link';
import { PeerCompanyMetric } from '@/lib/types';
import { CompanyLogo } from '@/components/CompanyLogo';
import { ExternalLink } from 'lucide-react';

interface PeerBattleMatrixProps {
  matrix: PeerCompanyMetric[];
}

const formatVal = (val: any, decimals: number = 2, suffix: string = ''): string => {
  if (val === null || val === undefined || isNaN(Number(val))) return '-';
  return `${Number(val).toFixed(decimals)}${suffix}`;
};

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
            Komparasi rasio valuasi, Piotroski F-Score deterministik, P/E historical band, dan efisiensi modal • Klik ticker untuk profil 360°
          </p>
        </div>
      </div>

      {/* Responsive Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-900/40">
              <th className="py-3 px-4 rounded-l-xl">Emiten</th>
              <th className="py-3 px-4 whitespace-nowrap">Market Cap</th>
              <th className="py-3 px-4 whitespace-nowrap">P/E Ratio</th>
              <th className="py-3 px-4 whitespace-nowrap">PBV Ratio</th>
              <th className="py-3 px-4 whitespace-nowrap">ROE</th>
              <th className="py-3 px-4 whitespace-nowrap">Piotroski Score</th>
              <th className="py-3 px-4 text-center whitespace-nowrap">P/E Band</th>
              <th className="py-3 px-4 rounded-r-xl whitespace-nowrap">DER</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-medium">
            {matrix.map((c, idx) => (
              <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                
                {/* Symbol & Name */}
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2.5">
                    <CompanyLogo symbol={c.symbol} size="sm" />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <Link
                          href={`/company/${c.symbol}`}
                          className="font-bold text-white text-base hover:text-cyan-400 hover:underline transition-colors flex items-center gap-1 group"
                          title={`Buka Profil Emiten 360° untuk ${c.symbol}`}
                        >
                          <span>{c.symbol}</span>
                          <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-cyan-400" />
                        </Link>
                        {c.is_lowest_pe && (
                          <span className="whitespace-nowrap shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            Best PE
                          </span>
                        )}
                        {c.is_highest_roe && (
                          <span className="whitespace-nowrap shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            Top ROE
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
                <td className="py-4 px-4 text-slate-300 whitespace-nowrap font-mono tabular-nums">
                  {c.market_cap ? `Rp ${(Number(c.market_cap) / 1e12).toFixed(1)} T` : '-'}
                </td>

                {/* PE */}
                <td className="py-4 px-4 whitespace-nowrap">
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono tabular-nums ${
                    c.is_lowest_pe 
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                      : 'text-slate-200'
                  }`}>
                    {formatVal(c.pe, 2, 'x')}
                  </span>
                </td>

                {/* PBV */}
                <td className="py-4 px-4 whitespace-nowrap">
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono tabular-nums ${
                    c.is_lowest_pbv 
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' 
                      : 'text-slate-200'
                  }`}>
                    {formatVal(c.pbv, 2, 'x')}
                  </span>
                </td>

                {/* ROE */}
                <td className="py-4 px-4 whitespace-nowrap">
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono tabular-nums ${
                    c.is_highest_roe 
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' 
                      : 'text-slate-200'
                  }`}>
                    {formatVal(c.roe, 2, '%')}
                  </span>
                </td>

                {/* Piotroski Score */}
                <td className="py-4 px-4 whitespace-nowrap">
                  {c.piotroski?.score !== null && c.piotroski?.score !== undefined ? (
                    <div className="flex items-center gap-1.5 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded-lg text-xs font-bold font-mono tabular-nums shrink-0 ${
                        c.piotroski.score >= 8
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : c.piotroski.score >= 5
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-red-500/20 text-red-300 border border-red-500/40'
                      }`}>
                        {c.piotroski.score}/9
                      </span>
                      {c.is_highest_piotroski && (
                        <span className="whitespace-nowrap shrink-0 text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold" title="Kesehatan Fundamental Tertinggi">
                          Top F-Score
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-slate-500">-</span>
                  )}
                </td>

                {/* PE Band */}
                <td className="py-4 px-4 text-center">
                  {c.pe_band?.status && c.pe_band.status !== 'NEUTRAL' ? (
                    <div className={`inline-flex flex-col items-center justify-center px-2.5 py-1 rounded-lg text-center ${
                      c.pe_band.status === 'UNDERVALUED'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : c.pe_band.status === 'FAIR_VALUE'
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    }`}>
                      <span className="text-[11px] font-bold tracking-wide uppercase leading-tight whitespace-nowrap">
                        {c.pe_band.status}
                      </span>
                      {c.pe_band.discount_pct !== null && c.pe_band.discount_pct !== undefined && (
                        <span className="text-[10px] font-mono tabular-nums font-semibold opacity-90 leading-tight mt-0.5 whitespace-nowrap">
                          ({c.pe_band.discount_pct > 0 ? '+' : ''}{c.pe_band.discount_pct}%)
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-slate-500">-</span>
                  )}
                </td>

                {/* DER */}
                <td className="py-4 px-4 text-slate-300 font-mono tabular-nums">
                  {formatVal(c.der, 2, 'x')}
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
