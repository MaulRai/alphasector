'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { BrokerFlowTracker } from '@/components/BrokerFlowTracker';
import { AgentThinkingTrace } from '@/components/AgentThinkingTrace';
import { CompanyLogo } from '@/components/CompanyLogo';
import { fetchBrokerSummary, fetchForeignFlow, fetchTopBrokers, queryAgent, checkBackendHealth } from '@/lib/api';
import { AgentQueryResponse } from '@/lib/types';
import { 
  Users, TrendingUp, TrendingDown, Search, ArrowUpRight, 
  ArrowDownRight, RefreshCw, ShieldAlert, Sparkles, Building2, Play, Zap, Database, Activity,
  Bot, ArrowRight
} from 'lucide-react';
import { AuthGate } from '@/components/AuthGate';
import { TickerAutocompleteInput } from '@/components/TickerAutocompleteInput';
import { AlphaAgentLogo } from '@/components/AlphaAgentLogo';

export default function SmartMoneyPage() {
  const router = useRouter();
  const [ticker, setTicker] = useState('TLKM');
  const [isLoading, setIsLoading] = useState(false);
  const [brokerSummary, setBrokerSummary] = useState<any>(null);
  const [topBrokers, setTopBrokers] = useState<any[]>([]);
  const [agentReport, setAgentReport] = useState<AgentQueryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [backendOnline, setBackendOnline] = useState(true);

  useEffect(() => {
    checkBackendHealth().then(res => setBackendOnline(res.status === 'healthy'));
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

  const executeSmartMoneyAnalysis = async (sym: string = ticker) => {
    const cleanSym = sym.trim().toUpperCase().replace('.JK', '');
    if (!cleanSym) return;
    setIsLoading(true);
    setError(null);
    setTicker(cleanSym);

    try {
      // 1. Fetch Broker Summary
      const bRes = await fetchBrokerSummary(cleanSym);
      setBrokerSummary(bRes.data);

      // 2. Query Agent for Smart Money Synthesis
      const aRes = await queryAgent(`Analisis smart money dan broker flow ${cleanSym}`);
      setAgentReport(aRes);

    } catch (err: any) {
      console.error(err);
      setError(err.message || `Gagal memuat data smart money untuk ${cleanSym}`);
    } finally {
      setIsLoading(false);
    }
  };

  const popularTickers = ['TLKM', 'BBCA', 'BBRI', 'BMRI', 'ASII', 'AMMN', 'BREN', 'ADRO'];

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col selection:bg-amber-500 selection:text-black">
      <Navbar backendOnline={backendOnline} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-12">
        <AuthGate
          featureName="Smart Money & Institutional Flow Tracker"
          featureDescription="Lacak konsentrasi akumulasi broker bandar dan pergerakan aliran dana asing (Foreign Flow) dengan akun analis."
        >
        
        {/* Header */}
        <div className="mb-8 pb-6 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Users className="h-5 w-5" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Smart Money & Institutional Flow Tracker
              </h1>
            </div>
            <p className="text-sm text-slate-400">
              Lacak aliran akumulasi broker institusi, foreign net buy/sell, dan deteksi pergerakan smart money di BEI.
            </p>
          </div>

          {/* Quick Popular Ticker Chips */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-slate-500 font-medium mr-1">Pilih Emiten:</span>
            {popularTickers.map((sym) => (
              <button
                key={sym}
                onClick={() => {
                  setTicker(sym);
                  setBrokerSummary(null);
                  setAgentReport(null);
                }}
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

        {/* Ticker Search & Execution Bar */}
        <div className="rounded-2xl border border-slate-800 bg-[#0d121e]/90 p-5 mb-8 glass-panel space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <CompanyLogo symbol={ticker} size="lg" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold text-white">{ticker}</span>
                </div>
                <p className="text-xs text-slate-400">Pilih kode saham di bawah atau ketik kode baru</p>
              </div>
            </div>

            {/* Ticker Autocomplete Input with Focus & Live Search */}
            <TickerAutocompleteInput
              onSelectTicker={(selected) => {
                setTicker(selected);
                executeSmartMoneyAnalysis(selected);
              }}
              selectedTickers={[ticker]}
              maxSelected={2}
              disabled={isLoading}
              placeholder="Ganti emiten (misal: BBCA)..."
              buttonText="Pilih"
            />
          </div>

          {/* Action Trigger Row */}
          <div className="pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Zap className="h-3.5 w-3.5 text-amber-400 shrink-0" />
              <span>1 Sectors API • 1 AI Synthesis</span>
            </div>

            <button
              onClick={() => executeSmartMoneyAnalysis(ticker)}
              disabled={isLoading || !ticker}
              className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:brightness-110 active:scale-95 text-black font-bold text-xs sm:text-sm transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Menganalisis Flow {ticker}...</span>
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 fill-black" />
                  <span>Jalankan Analisis Smart Money ({ticker})</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Onboarding & Pipeline Explanation (Shown before analysis) */}
        {!brokerSummary && !isLoading && (
          <div className="rounded-2xl border border-slate-800 bg-[#0d121e]/70 p-6 glass-panel mb-8">
            <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-400" />
              Mengapa Melacak Smart Money & Broker Flow?
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              Di pasar modal Indonesia (IDX), pergerakan harga sering didahului oleh akumulasi tersembunyi dari investor institusi dan asing. Klik <strong>&quot;Jalankan Analisis Smart Money&quot;</strong> di atas untuk memproses:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="flex items-center gap-2 font-bold text-xs text-amber-400 mb-1.5">
                  <Database className="h-4 w-4" /> 1. Top Broker Registry
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Mengambil data agregat transaksi anggota bursa (AB) 14 hari terakhir untuk emiten {ticker}.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="flex items-center gap-2 font-bold text-xs text-orange-400 mb-1.5">
                  <TrendingUp className="h-4 w-4" /> 2. Konsentrasi Akumulasi
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Menghitung rasio beli vs jual 3 broker teratas untuk mendeteksi sinyal Strong Accumulation atau Distribution.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="flex items-center gap-2 font-bold text-xs text-emerald-400 mb-1.5">
                  <Sparkles className="h-4 w-4" /> 3. Narasi Sintesis AI
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Menghasilkan ulasan mendalam mengenai sentimen bandar/institusi dalam Bahasa Indonesia yang lugas.
                </p>
              </div>
            </div>
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

            {/* Follow-Up Chat Room CTA Card */}
            <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-[#0d121e] p-6 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-5 glass-panel">
              <div className="flex items-center gap-4">
                <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0 flex items-center justify-center">
                  <AlphaAgentLogo size={26} glow />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white flex items-center gap-2">
                    Lanjutkan Diskusi di AlphaAgent Chat
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                      Follow-Up Room Baru
                    </span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Buka room chat interaktif baru untuk membedah pola akumulasi broker, flow asing, dan strategi entry/exit emiten {ticker}.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  if (agentReport?.session_id) {
                    router.push(`/copilot?session_id=${encodeURIComponent(agentReport.session_id)}`);
                  } else {
                    const query = `Analisis smart money dan broker flow ${ticker}`;
                    router.push(`/copilot?initial_query=${encodeURIComponent(query)}`);
                  }
                }}
                className="w-full md:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95 shrink-0 cursor-pointer"
              >
                <span>Buka Chat Room AlphaAgent</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            {/* Top Brokers Exchange Leaderboard */}
            {topBrokers.length > 0 && (
              <div className="rounded-2xl border border-slate-800 bg-[#0d121e]/90 p-6 glass-panel">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
                  <div>
                    <h3 className="text-base font-bold text-white">
                      IDX Broker Leaderboard (Top Gross Members)
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

        </AuthGate>

      </main>
    </div>
  );
}
