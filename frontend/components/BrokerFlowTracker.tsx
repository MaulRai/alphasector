'use client';

import React from 'react';
import { BrokerSummaryInfo } from '@/lib/types';
import { Users, TrendingUp, TrendingDown, ShieldAlert, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface BrokerFlowTrackerProps {
  brokerSummary: Partial<BrokerSummaryInfo> & {
    top_buyers?: any[];
    top_sellers?: any[];
  };
  ticker?: string;
}

export const BrokerFlowTracker: React.FC<BrokerFlowTrackerProps> = ({ brokerSummary, ticker }) => {
  if (!brokerSummary) return null;

  const topBuyers = brokerSummary.top_buyers || [];
  const topSellers = brokerSummary.top_sellers || [];

  let sentiment = brokerSummary.sentiment || 'NEUTRAL';
  let buyerConcentration = brokerSummary.buyer_concentration;

  // Auto-calculate sentiment & concentration if not provided (e.g. from direct Sectors API response)
  if (!brokerSummary.sentiment) {
    const totalBuyVal = topBuyers.slice(0, 3).reduce((acc: number, b: any) => acc + (b.net_buy_value || b.buy_val || b.net_val || 0), 0);
    const totalSellVal = Math.abs(topSellers.slice(0, 3).reduce((acc: number, s: any) => acc + (s.net_sell_value || s.sell_val || s.net_val || 0), 0));

    if (totalBuyVal > totalSellVal * 1.25) {
      sentiment = 'STRONG_ACCUMULATION';
    } else if (totalBuyVal > totalSellVal * 1.05) {
      sentiment = 'MODERATE_ACCUMULATION';
    } else if (totalSellVal > totalBuyVal * 1.25) {
      sentiment = 'STRONG_DISTRIBUTION';
    } else if (totalSellVal > totalBuyVal * 1.05) {
      sentiment = 'MODERATE_DISTRIBUTION';
    } else {
      sentiment = 'NEUTRAL';
    }

    if (buyerConcentration === undefined || buyerConcentration === null) {
      const sum = totalBuyVal + totalSellVal;
      buyerConcentration = sum > 0 ? Math.round((totalBuyVal / sum) * 100) : 50;
    }
  }

  const isAccumulation = String(sentiment).includes('ACCUMULATION');
  const isDistribution = String(sentiment).includes('DISTRIBUTION');

  const getSentimentBadge = () => {
    if (sentiment === 'STRONG_ACCUMULATION') {
      return {
        text: 'Strong Accumulation',
        bg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
      };
    }
    if (sentiment === 'MODERATE_ACCUMULATION') {
      return {
        text: 'Moderate Accumulation',
        bg: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
      };
    }
    if (sentiment === 'STRONG_DISTRIBUTION') {
      return {
        text: 'Strong Distribution',
        bg: 'bg-red-500/20 text-red-400 border-red-500/30'
      };
    }
    if (sentiment === 'MODERATE_DISTRIBUTION') {
      return {
        text: 'Moderate Distribution',
        bg: 'bg-red-500/10 text-red-300 border-red-500/20'
      };
    }
    return {
      text: 'Neutral Flow',
      bg: 'bg-slate-500/10 text-slate-300 border-slate-500/20'
    };
  };

  const badge = getSentimentBadge();

  return (
    <div className="rounded-2xl border border-slate-800 bg-[#0d121e]/90 p-6 shadow-2xl glass-panel glow-emerald mb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-white tracking-tight">
              Smart Money & Broker Flow Tracker {ticker ? `(${ticker})` : ''}
            </h3>
            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${badge.bg}`}>
              {badge.text}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Analisis konsentrasi transaksi broker institusi, asing, dan ritel 14 hari terakhir
          </p>
        </div>

        {/* Buyer Concentration meter */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs text-slate-400 font-medium">Buyer Concentration</div>
            <div className="text-sm font-bold text-emerald-400">
              {buyerConcentration ?? 50}%
            </div>
          </div>
          <div className="w-20 h-2 rounded-full bg-slate-800 overflow-hidden">
            <div 
              className={`h-full rounded-full ${isAccumulation ? 'bg-emerald-400' : isDistribution ? 'bg-red-400' : 'bg-slate-400'}`}
              style={{ width: `${Math.min(100, buyerConcentration ?? 50)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Side-by-side Top Buyers vs Top Sellers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Top Buyers */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
          <div className="flex items-center justify-between mb-3 text-xs font-semibold text-emerald-400">
            <span className="flex items-center gap-1.5">
              <ArrowUpRight className="h-4 w-4" /> Top Net Buyers (Akumulasi)
            </span>
            <span className="text-[10px] text-slate-500">Broker Exchange Member</span>
          </div>
          <div className="space-y-2">
            {topBuyers.length > 0 ? (
              topBuyers.slice(0, 4).map((b: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-900/80 border border-slate-800 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded bg-emerald-500/10 text-emerald-400 font-bold font-mono">
                      {b.broker_code || b.broker_name || 'BK'}
                    </span>
                    <span className="text-slate-300 font-medium truncate max-w-[140px]">
                      {b.broker_name || `Broker ${b.broker_code}`}
                    </span>
                  </div>
                  <span className="font-semibold text-emerald-400">
                    {b.net_buy_value ? `+Rp ${(b.net_buy_value / 1e9).toFixed(1)} M` : b.buy_val ? `Rp ${(b.buy_val / 1e9).toFixed(1)} M` : b.net_val ? `Rp ${(b.net_val / 1e9).toFixed(1)} M` : '-'}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-xs text-slate-500 py-3 text-center">Data buyer tidak tersedia</div>
            )}
          </div>
        </div>

        {/* Top Sellers */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
          <div className="flex items-center justify-between mb-3 text-xs font-semibold text-red-400">
            <span className="flex items-center gap-1.5">
              <ArrowDownRight className="h-4 w-4" /> Top Net Sellers (Distribusi)
            </span>
            <span className="text-[10px] text-slate-500">Broker Exchange Member</span>
          </div>
          <div className="space-y-2">
            {topSellers.length > 0 ? (
              topSellers.slice(0, 4).map((s: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-900/80 border border-slate-800 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded bg-red-500/10 text-red-400 font-bold font-mono">
                      {s.broker_code || s.broker_name || 'SL'}
                    </span>
                    <span className="text-slate-300 font-medium truncate max-w-[140px]">
                      {s.broker_name || `Broker ${s.broker_code}`}
                    </span>
                  </div>
                  <span className="font-semibold text-red-400">
                    {s.net_sell_value ? `-Rp ${(Math.abs(s.net_sell_value) / 1e9).toFixed(1)} M` : s.sell_val ? `Rp ${(s.sell_val / 1e9).toFixed(1)} M` : s.net_val ? `Rp ${(s.net_val / 1e9).toFixed(1)} M` : '-'}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-xs text-slate-500 py-3 text-center">Data seller tidak tersedia</div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
