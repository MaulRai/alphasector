'use client';

import React from 'react';
import { PeerCompanyMetric } from '@/lib/types';
import { CompanyLogo } from '@/components/CompanyLogo';
import { Building2, TrendingUp, DollarSign, Award, Layers, AlertTriangle } from 'lucide-react';

interface Company360CardProps {
  data: PeerCompanyMetric;
}

const formatVal = (val: any, decimals: number = 2, suffix: string = ''): string => {
  if (val === null || val === undefined || isNaN(Number(val))) return '-';
  return `${Number(val).toFixed(decimals)}${suffix}`;
};

export const Company360Card: React.FC<Company360CardProps> = ({ data }) => {
  if (!data) return null;

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
