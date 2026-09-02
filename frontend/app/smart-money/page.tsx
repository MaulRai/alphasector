'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { BrokerFlowTracker } from '@/components/BrokerFlowTracker';
import { AgentThinkingTrace } from '@/components/AgentThinkingTrace';
import { fetchBrokerSummary, fetchForeignFlow, fetchTopBrokers, queryAgent, checkBackendHealth } from '@/lib/api';
import { BrokerSummaryInfo, AgentQueryResponse } from '@/lib/types';
import { 
  Users, TrendingUp, TrendingDown, Search, ArrowUpRight, 
  ArrowDownRight, RefreshCw, ShieldAlert, Sparkles, Building2 
} from 'lucide-react';

export default function SmartMoneyPage() {
  const [ticker, setTicker] = useState('TLKM');
  const [inputTicker, setInputTicker] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [brokerSummary, setBrokerSummary] = useState<any>(null);
  const [foreignFlow, setForeignFlow] = useState<any>(null);
  const [topBrokers, setTopBrokers] = useState<any[]>([]);
  const [agentReport, setAgentReport] = useState<AgentQueryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [backendOnline, setBackendOnline] = useState(true);

  useEffect(() => {
    checkBackendHealth().then(res => setBackendOnline(res.status === 'healthy'));
    loadTickerData('TLKM');
    loadTopBrokers();
  }, []);

  const loadTopBrokers = async () => {
    try {
      const res = await fetchTopBrokers('all', 'gross');
      if (res && res.data && Array.isArray(res.data)) {
        setTopBrokers(res.data.slice(0, 8));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadTickerData = async (sym: string) => {
    const cleanSym = sym.trim().toUpperCase().replace('.JK', '');
    if (!cleanSym) return;
    setIsLoading(true);
    setError(null);
    setTicker(cleanSym);

    try {
      // 1. Fetch Broker Summary
      const bRes = await fetchBrokerSummary(cleanSym);
      setBrokerSummary(bRes.data);

      // 2. Fetch Foreign Flow
      try {
        const fRes = await fetchForeignFlow(cleanSym);
        setForeignFlow(fRes.data);
      } catch (fe) {
        setForeignFlow(null);
      }

      // 3. Query Agent for Smart Money Synthesis
      const aRes = await queryAgent(`Analisis smart money dan broker flow ${cleanSym}`);
      setAgentReport(aRes);

    } catch (err: any) {
      console.error(err);
      setError(err.message || `Gagal memuat data smart money untuk ${cleanSym}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputTicker.trim()) return;
    loadTickerData(inputTicker);
    setInputTicker('');
  };

  const popularTickers = ['TLKM', 'BBCA', 'BBRI', 'BMRI', 'ASII', 'AMMN', 'BREN', 'ADRO'];

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col selection:bg-amber-500 selection:text-black">
      <Navbar backendOnline={backendOnline} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8 pb-6 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Users className="h-5 w-5" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                🏛️ Smart Money & Institutional Flow Tracker
              </h1>
            </div>
            <p className="text-sm text-slate-400">
              Lacak aliran akumulasi broker institusi, foreign net buy/sell, dan deteksi pergerakan smart money di BEI.
            </p>
          </div>

          {/* Quick Popular Ticker Chips */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-slate-500 font-medium mr-1">Populer:</span>
            {popularTickers.map((sym) => (
              <button
                key={sym}
                onClick={() => loadTickerData(sym)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all border ${
                  ticker === sym
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                {sym}
              </button>
            ))}
          </div>
        </div>

        {/* Ticker Search Bar */}
        <div className="rounded-2xl border border-slate-800 bg-[#0d121e]/90 p-4 mb-8 glass-panel flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold text-base">
              {ticker.slice(0, 2)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-white">{ticker}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                  Data 14 Hari Terakhir
                </span>
              </div>
              <p className="text-xs text-slate-400">Sectors Broker Summary & Foreign Flow API</p>
            </div>
          </div>

          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <input
              type="text"
              value={inputTicker}
              onChange={(e) => setInputTicker(e.target.value)}
              placeholder="Cari kode saham (misal: BBCA)..."
              className="px-3.5 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 uppercase w-48"
              maxLength={6}
            />
            <button
              type="submit"
              disabled={isLoading || !inputTicker.trim()}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition-all disabled:opacity-50"
            >
              <Search className="h-3.5 w-3.5" />
              <span>Lacak Flow</span>
            </button>
          </form>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Loading Spinner */}
        {isLoading && (
          <div className="py-16 text-center space-y-3">
            <RefreshCw className="h-8 w-8 text-amber-400 animate-spin mx-auto" />
            <p className="text-sm text-slate-400 font-medium">
              Mengambil ringkasan broker summary & aliran dana asing untuk {ticker}...
            </p>
          </div>
        )}

        {/* Content Body */}
        {!isLoading && (
          <div className="space-y-6">
            
            {/* BrokerFlowTracker Component */}
            {brokerSummary && (
              <BrokerFlowTracker brokerSummary={brokerSummary} ticker={ticker} />
            )}

            {/* Agent Live Reasoning Trace if query performed */}
            {agentReport && agentReport.reasoning_trace && (
              <AgentThinkingTrace
                steps={agentReport.reasoning_trace}
                totalTimeMs={agentReport.total_execution_time_ms}
                creditsConsumed={agentReport.credits_consumed}
              />
            )}

            {/* AI Smart Money Insight Card */}
            {agentReport && agentReport.synthesis && (
              <div className="rounded-2xl border border-slate-800 bg-[#0d121e]/90 p-6 glass-panel glow-emerald">
                <div className="flex items-center gap-2 mb-3 pb-3 border-b border-slate-800">
                  <Sparkles className="h-4 w-4 text-amber-400" />
                  <h3 className="text-base font-bold text-white">
                    Sintesis Smart Money {ticker} (Bahasa Indonesia)
                  </h3>
                </div>
                <p className="text-sm text-slate-200 leading-relaxed mb-4">
                  {agentReport.synthesis.executive_summary}
                </p>
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200">
                  <strong>Deteksi Flow:</strong> {agentReport.synthesis.smart_money_flow}
                </div>
              </div>
            )}

            {/* Top Brokers Exchange Leaderboard */}
            {topBrokers.length > 0 && (
              <div className="rounded-2xl border border-slate-800 bg-[#0d121e]/90 p-6 glass-panel">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
                  <div>
                    <h3 className="text-base font-bold text-white">
                      🏆 IDX Broker Leaderboard (Top Gross Members)
                    </h3>
                    <p className="text-xs text-slate-400">Anggota Bursa (AB) dengan volume transaksi pasar terbesar</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {topBrokers.map((b, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800 border border-slate-700 text-xs font-bold text-emerald-400 font-mono">
                        {b.broker_code || b.code || `#${idx+1}`}
                      </div>
                      <div className="truncate">
                        <div className="text-xs font-bold text-white truncate">
                          {b.broker_name || b.name || `Broker ${b.broker_code}`}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {b.total_value ? `Rp ${(b.total_value / 1e12).toFixed(1)} T` : 'Aktif'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

      </main>
    </div>
  );
}
