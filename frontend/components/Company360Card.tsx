'use client';

import React from 'react';
import { PeerCompanyMetric } from '@/lib/types';
import { CompanyLogo } from '@/components/CompanyLogo';
import { Building2, TrendingUp, DollarSign, Award, Layers, AlertTriangle, ShieldCheck, Activity } from 'lucide-react';

interface Company360CardProps {
  data: PeerCompanyMetric;
}

const formatVal = (val: any, decimals: number = 2, suffix: string = ''): string => {
  if (val === null || val === undefined || isNaN(Number(val))) return '-';
  return `${Number(val).toFixed(decimals)}${suffix}`;
};

export const Company360Card: React.FC<Company360CardProps> = ({ data }) => {
  if (!data || (!data.symbol && !data.last_close_price && !data.pe && !data.pbv)) return null;

  return (
    <div className="rounded-2xl border border-slate-800 bg-[#0d121e]/90 p-6 shadow-2xl glass-panel glow-emerald mb-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div className="flex items-center gap-3.5">
          <CompanyLogo symbol={data.symbol} size="lg" />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white tracking-tight">
                {data.symbol}
              </h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                {data.sub_sector}
              </span>
            </div>
            <p className="text-sm text-slate-400 font-medium mt-0.5">
              {data.company_name}
            </p>
          </div>
        </div>

        {/* Price & Cap */}
        <div className="text-left sm:text-right">
          <div className="text-xs text-slate-400 font-medium">Harga Penutupan Terakhir</div>
          <div className="text-2xl font-bold text-emerald-400">
            Rp {data.last_close_price ? Number(data.last_close_price).toLocaleString('id-ID') : '-'}
          </div>
          <div className="text-xs text-slate-500 mt-0.5">
            Market Cap: Rp {data.market_cap ? (Number(data.market_cap) / 1e12).toFixed(1) + ' T' : '-'}
          </div>
        </div>
      </div>

      {/* Grid Multiples & Key Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6">
        
        {/* PE Ratio */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
          <div className="text-xs text-slate-400 font-medium mb-1 flex items-center justify-between">
            <span>Price to Earnings (P/E)</span>
            <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-white">
            {formatVal(data.pe, 2, 'x')}
          </div>
          {data.pe_peer_avg !== null && data.pe_peer_avg !== undefined && (
            <div className="text-[11px] text-slate-500 mt-1">
              Peer Avg: {formatVal(data.pe_peer_avg, 2, 'x')}
            </div>
          )}
        </div>

        {/* PBV Ratio */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
          <div className="text-xs text-slate-400 font-medium mb-1 flex items-center justify-between">
            <span>Price to Book (PBV)</span>
            <Layers className="h-3.5 w-3.5 text-cyan-400" />
          </div>
          <div className="text-xl font-bold text-white">
            {formatVal(data.pbv, 2, 'x')}
          </div>
          {data.pb_peer_avg !== null && data.pb_peer_avg !== undefined && (
            <div className="text-[11px] text-slate-500 mt-1">
              Peer Avg: {formatVal(data.pb_peer_avg, 2, 'x')}
            </div>
          )}
        </div>

        {/* ROE Profitability */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
          <div className="text-xs text-slate-400 font-medium mb-1 flex items-center justify-between">
            <span>Return on Equity (ROE)</span>
            <Award className="h-3.5 w-3.5 text-amber-400" />
          </div>
          <div className="text-xl font-bold text-amber-400">
            {formatVal(data.roe, 2, '%')}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            NPM: {formatVal(data.npm, 2, '%')}
          </div>
        </div>

        {/* Leverage / DER */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
          <div className="text-xs text-slate-400 font-medium mb-1 flex items-center justify-between">
            <span>Debt to Equity (DER)</span>
            <DollarSign className="h-3.5 w-3.5 text-blue-400" />
          </div>
          <div className="text-xl font-bold text-white">
            {formatVal(data.der, 2, 'x')}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Leverage Ratio
          </div>
        </div>

      </div>

      {/* Deterministic Financial Intelligence Panel */}
      {((data.piotroski?.score !== null && data.piotroski?.score !== undefined) || data.pe_band?.status) && (
        <div className="pt-4 pb-2 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Piotroski F-Score Card */}
          {data.piotroski?.score !== null && data.piotroski?.score !== undefined && (
            <div className="p-3.5 rounded-xl bg-[#090f1d] border border-slate-800/90 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-lg ${data.piotroski.score >= 8 ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : data.piotroski.score >= 5 ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' : 'bg-red-500/15 text-red-400 border border-red-500/30'}`}>
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                    <span>Piotroski F-Score</span>
                    <span className="text-[10px] text-slate-500 font-normal">(Stanford Model)</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {data.piotroski.score >= 8 ? 'Kesehatan Fundamental Prima' : data.piotroski.score >= 5 ? 'Kondisi Keuangan Moderat' : 'Risiko Tekanan Finansial'}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-base font-bold text-white font-mono">
                  {data.piotroski.score}<span className="text-xs text-slate-500">/9</span>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${data.piotroski.score >= 8 ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : data.piotroski.score >= 5 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'}`}>
                  {data.piotroski.rating}
                </span>
              </div>
            </div>
          )}

          {/* Historical PE Band Card */}
          {data.pe_band?.status && (
            <div className="p-3.5 rounded-xl bg-[#090f1d] border border-slate-800/90 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-lg ${data.pe_band.status === 'UNDERVALUED' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : data.pe_band.status === 'FAIR_VALUE' ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30' : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'}`}>
                  <Activity className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                    <span>P/E Historical Band</span>
                    <span className="text-[10px] text-slate-500 font-normal">({data.pe_band.years_analyzed || '3'} Thn SD)</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Mean: {data.pe_band.mean_pe ? `${data.pe_band.mean_pe}x` : '-'} | Deviasi: {data.pe_band.discount_pct !== null && data.pe_band.discount_pct !== undefined ? `${data.pe_band.discount_pct}%` : '-'}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${data.pe_band.status === 'UNDERVALUED' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : data.pe_band.status === 'FAIR_VALUE' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'}`}>
                  {data.pe_band.status}
                </span>
                <div className="text-[10px] text-slate-500 mt-1 font-mono">
                  Batas: {data.pe_band.minus_1sd ? `${data.pe_band.minus_1sd}x` : '-'} ~ {data.pe_band.plus_1sd ? `${data.pe_band.plus_1sd}x` : '-'}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tags list */}
      {data.tags && data.tags.length > 0 && (
        <div className="pt-4 border-t border-slate-800/80 flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-500 font-medium mr-1">Sectors Tags:</span>
          {data.tags.map((tag, idx) => (
            <span
              key={idx}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-900 text-slate-300 border border-slate-800"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

    </div>
  );
};
