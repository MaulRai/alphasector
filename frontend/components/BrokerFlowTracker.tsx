'use client';

import React from 'react';
import { BrokerSummaryInfo } from '@/lib/types';
import { getBrokerInfo } from '@/lib/idx-brokers';
import { Users, TrendingUp, TrendingDown, ShieldAlert, ArrowUpRight, ArrowDownRight, Globe } from 'lucide-react';

interface BrokerFlowTrackerProps {
  brokerSummary: Partial<BrokerSummaryInfo> & {
    top_buyers?: any[];
    top_sellers?: any[];
  };
  ticker?: string;
}

const getNetVal = (item: any): number => {
  if (!item) return 0;
  const val = item.net_idr ?? item.net_buy_value ?? item.net_sell_value ?? item.net_val ?? item.buy_idr ?? item.sell_idr ?? item.buy_val ?? item.sell_val ?? 0;
  return Number(val) || 0;
};

const formatIdr = (val: number, isBuy: boolean = true): string => {
  if (val === 0 || isNaN(val)) return '-';
  const absVal = Math.abs(val);
  const prefix = isBuy ? '+Rp ' : '-Rp ';
  if (absVal >= 1e12) {
    return `${prefix}${(absVal / 1e12).toFixed(2)} T`;
  }
  if (absVal >= 1e9) {
    return `${prefix}${(absVal / 1e9).toFixed(1)} M`;
  }
  return `${prefix}${(absVal / 1e6).toFixed(0)} Jt`;
};

export const BrokerFlowTracker: React.FC<BrokerFlowTrackerProps> = ({ brokerSummary, ticker }) => {
  if (!brokerSummary) return null;

  const topBuyers = brokerSummary.top_buyers || [];
  const topSellers = brokerSummary.top_sellers || [];

  let sentiment = brokerSummary.sentiment || 'NEUTRAL';
  let buyerConcentration = brokerSummary.buyer_concentration;

  // Auto-calculate sentiment & concentration from actual broker summary values
  const totalBuyVal = topBuyers.slice(0, 3).reduce((acc: number, b: any) => acc + Math.abs(getNetVal(b)), 0);
  const totalSellVal = topSellers.slice(0, 3).reduce((acc: number, s: any) => acc + Math.abs(getNetVal(s)), 0);

  if (!brokerSummary.sentiment || brokerSummary.sentiment === 'NEUTRAL') {
    if (totalBuyVal > totalSellVal * 1.25 && totalBuyVal > 0) {
      sentiment = 'STRONG_ACCUMULATION';
    } else if (totalBuyVal > totalSellVal * 1.05 && totalBuyVal > 0) {
      sentiment = 'MODERATE_ACCUMULATION';
    } else if (totalSellVal > totalBuyVal * 1.25 && totalSellVal > 0) {
      sentiment = 'STRONG_DISTRIBUTION';
    } else if (totalSellVal > totalBuyVal * 1.05 && totalSellVal > 0) {
      sentiment = 'MODERATE_DISTRIBUTION';
    } else {
      sentiment = 'NEUTRAL';
    }
  }

  if (buyerConcentration === undefined || buyerConcentration === null || buyerConcentration === 50) {
    const sum = totalBuyVal + totalSellVal;
    buyerConcentration = sum > 0 ? Math.round((totalBuyVal / sum) * 100) : 50;
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
            Analisis konsentrasi transaksi broker institusi, asing, dan ritel 14–30 hari terakhir
          </p>
        </div>

        {/* Buyer Concentration meter */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs text-slate-400 font-medium">Buyer Concentration</div>
            <div className="text-sm font-bold font-mono tabular-nums text-emerald-400">
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
            <span className="text-[10px] text-slate-400">Broker Exchange Member</span>
          </div>
          <div className="space-y-2">
            {topBuyers.length > 0 ? (
              topBuyers.slice(0, 4).map((b: any, idx: number) => {
                const brokerCode = (b.broker_code || b.broker_name || 'BK').toUpperCase();
                const brokerInfo = getBrokerInfo(brokerCode);
                const netVal = getNetVal(b);
                const displayVal = formatIdr(netVal, true);

                return (
                  <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs hover:border-emerald-500/30 transition-colors">
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold font-mono text-xs">
                        {brokerCode}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="text-slate-200 font-semibold truncate">
                            {brokerInfo.name}
                          </span>
                          {brokerInfo.is_foreign && (
                            <span className="px-1 py-0.2 rounded bg-cyan-500/10 text-cyan-400 text-[9px] font-mono shrink-0">
                              Foreign
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 capitalize">
                          {brokerInfo.cohort} cohort
                        </div>
                      </div>
                    </div>
                    <span className="font-mono tabular-nums font-bold text-emerald-400 shrink-0 text-xs">
                      {displayVal}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="text-xs text-slate-400 py-3 text-center">Data buyer tidak tersedia</div>
            )}
          </div>
        </div>

        {/* Top Sellers */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
          <div className="flex items-center justify-between mb-3 text-xs font-semibold text-red-400">
            <span className="flex items-center gap-1.5">
              <ArrowDownRight className="h-4 w-4" /> Top Net Sellers (Distribusi)
            </span>
            <span className="text-[10px] text-slate-400">Broker Exchange Member</span>
          </div>
          <div className="space-y-2">
            {topSellers.length > 0 ? (
              topSellers.slice(0, 4).map((s: any, idx: number) => {
                const brokerCode = (s.broker_code || s.broker_name || 'SL').toUpperCase();
                const brokerInfo = getBrokerInfo(brokerCode);
                const netVal = getNetVal(s);
                const displayVal = formatIdr(netVal, false);

                return (
                  <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs hover:border-red-500/30 transition-colors">
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 font-bold font-mono text-xs">
                        {brokerCode}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="text-slate-200 font-semibold truncate">
                            {brokerInfo.name}
                          </span>
                          {brokerInfo.is_foreign && (
                            <span className="px-1 py-0.2 rounded bg-cyan-500/10 text-cyan-400 text-[9px] font-mono shrink-0">
                              Foreign
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 capitalize">
                          {brokerInfo.cohort} cohort
                        </div>
                      </div>
                    </div>
                    <span className="font-mono tabular-nums font-bold text-red-400 shrink-0 text-xs">
                      {displayVal}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="text-xs text-slate-500 py-3 text-center">Data seller tidak tersedia</div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
