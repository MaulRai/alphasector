'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { BrokerFlowTracker } from '@/components/BrokerFlowTracker';
import { AgentThinkingTrace } from '@/components/AgentThinkingTrace';
import { CompanyLogo } from '@/components/CompanyLogo';
import { IdxBrokerLeaderboardCard } from '@/components/smart-money/IdxBrokerLeaderboardCard';
import { SmartMoneyExplainerCard } from '@/components/smart-money/SmartMoneyExplainerCard';
import { InsiderFilingsCard } from '@/components/smart-money/InsiderFilingsCard';
import { InstitutionalOwnershipCard } from '@/components/smart-money/InstitutionalOwnershipCard';
import { RegulatorySuspensionsCard } from '@/components/smart-money/RegulatorySuspensionsCard';
import { useBackendHealth } from '@/hooks/useBackendHealth';
import { fetchBrokerSummary, fetchTopBrokers, queryAgent } from '@/lib/api';
import { AgentQueryResponse } from '@/lib/types';
import { Users, RefreshCw, Sparkles, Play, Zap, ArrowRight, ShieldCheck, Landmark, Lock, BarChart3 } from 'lucide-react';
import { AuthGate } from '@/components/AuthGate';
import { TickerAutocompleteInput } from '@/components/TickerAutocompleteInput';
import { AlphaAgentLogo } from '@/components/AlphaAgentLogo';

const POPULAR_TICKERS = ['TLKM', 'BBCA', 'BBRI', 'BMRI', 'ASII', 'BUMI', 'ADRO', 'ANTM', 'GOTO', 'AMMN', 'BREN', 'CUAN', 'MEDC', 'PTBA'];

function SmartMoneyWorkspace() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const tickerParam = searchParams.get('ticker') || searchParams.get('symbol');

  const [ticker, setTicker] = useState(() => {
    if (tickerParam) return tickerParam.trim().toUpperCase().replace('.JK', '');
    return 'TLKM';
  });

  const [activeTab, setActiveTab] = useState<'bandarmology' | 'insider' | 'institutional' | 'suspensions'>(() => {
    if (tabParam && ['bandarmology', 'insider', 'institutional', 'suspensions'].includes(tabParam)) {
      return tabParam as any;
    }
    return 'bandarmology';
  });

  const [isLoading, setIsLoading] = useState(false);
  const [brokerSummary, setBrokerSummary] = useState<any>(null);
  const [topBrokers, setTopBrokers] = useState<any[]>([]);
  const [agentReport, setAgentReport] = useState<AgentQueryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { backendOnline } = useBackendHealth();

  useEffect(() => {
    if (tabParam && ['bandarmology', 'insider', 'institutional', 'suspensions'].includes(tabParam)) {
      setActiveTab(tabParam as any);
    }
    if (tickerParam) {
      setTicker(tickerParam.trim().toUpperCase().replace('.JK', ''));
    }
  }, [tabParam, tickerParam]);

  const handleTabChange = (newTab: 'bandarmology' | 'insider' | 'institutional' | 'suspensions') => {
    setActiveTab(newTab);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('tab', newTab);
      if (ticker) url.searchParams.set('ticker', ticker);
      window.history.replaceState(null, '', url.pathname + url.search);
    }
  };

  useEffect(() => {
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
      const bRes = await fetchBrokerSummary(cleanSym);
      setBrokerSummary(bRes.data);

      const aRes = await queryAgent(`Analisis smart money dan broker flow ${cleanSym}`);
      setAgentReport(aRes);
    } catch (err: any) {
      console.error(err);
      setError(err.message || `Gagal memuat data smart money untuk ${cleanSym}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col">
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
              <span className="text-xs text-slate-500 font-medium mr-1">Emiten Populer:</span>
              {POPULAR_TICKERS.map((sym) => (
                <button
                  key={sym}
                  onClick={() => {
                    setTicker(sym);
                    setBrokerSummary(null);
                    setAgentReport(null);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
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

          {/* Global Ticker Selector Bar across all tabs */}
          <div className="rounded-2xl border border-slate-800 bg-[#0d121e]/90 p-4 sm:p-5 mb-6 glass-panel flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <CompanyLogo symbol={ticker} size="lg" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold text-white">{ticker}</span>
                </div>
                <p className="text-xs text-slate-400">
                  Cari & analisis data smart money untuk <strong>seluruh 900+ emiten</strong> di Bursa Efek Indonesia
                </p>
              </div>
            </div>

            {/* Global Autocomplete Input */}
            <div className="w-full sm:w-80">
              <TickerAutocompleteInput
                onSelectTicker={(selected) => {
                  setTicker(selected);
                  setBrokerSummary(null);
                  setAgentReport(null);
                  setError(null);
                }}
                selectedTickers={[ticker]}
                singleSelect={true}
                showItemPlusIcon={false}
                disabled={isLoading}
                placeholder="Cari emiten apa saja (misal: BUMI, PTBA)..."
                showActionButton={false}
                showSearchIcon={true}
                accentColor="amber"
              />
            </div>
          </div>

          {/* Institutional Smart Money Tabs Switcher */}
          <div className="flex flex-wrap items-center gap-2 mb-6 p-1.5 rounded-2xl bg-slate-950/80 border border-slate-800/90 w-fit">
            <button
              onClick={() => handleTabChange('bandarmology')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'bandarmology'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-black shadow-lg shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <BarChart3 className="h-3.5 w-3.5" />
              <span>Bandarmology & Broker Flow</span>
            </button>

            <button
              onClick={() => handleTabChange('insider')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'insider'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-black shadow-lg shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Insider Filings (Direksi/Komisaris)</span>
            </button>

            <button
              onClick={() => handleTabChange('institutional')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'institutional'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-black shadow-lg shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Landmark className="h-3.5 w-3.5" />
              <span>Kepemilikan Institusi (Dapen/Reksadana)</span>
            </button>

            <button
              onClick={() => handleTabChange('suspensions')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'suspensions'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-black shadow-lg shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Lock className="h-3.5 w-3.5" />
              <span>Radar Suspensi BEI & UMA</span>
            </button>
          </div>

          {/* TAB 1: BANDARMOLOGY & BROKER FLOW */}
          {activeTab === 'bandarmology' && (
            <>
              {/* Action Trigger Row */}
              <div className="rounded-2xl border border-slate-800 bg-[#0d121e]/90 p-4 sm:p-5 mb-8 glass-panel flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Zap className="h-4 w-4 text-amber-400 shrink-0" />
                  <span>Sintesis Bandarmology otomatis: Top 5 Broker Akumulasi vs Distribusi & Net Foreign Flow</span>
                </div>

                <button
                  onClick={() => executeSmartMoneyAnalysis(ticker)}
                  disabled={isLoading || !ticker}
                  className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:brightness-110 active:scale-95 text-black font-bold text-xs sm:text-sm transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 cursor-pointer shrink-0"
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

              {/* Error Alert */}
              {error && (
                <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                  {error}
                </div>
              )}

              {/* Onboarding & Pipeline Explanation */}
              {!brokerSummary && !isLoading && (
                <SmartMoneyExplainerCard ticker={ticker} />
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

              {/* Content Body - Only shown after analysis is executed */}
              {(agentReport || brokerSummary) && !isLoading && (
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
                          router.push(`/alpha-agent?session_id=${encodeURIComponent(agentReport.session_id)}`);
                        } else {
                          const query = `Analisis smart money dan broker flow ${ticker}`;
                          router.push(`/alpha-agent?initial_query=${encodeURIComponent(query)}`);
                        }
                      }}
                      className="w-full md:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95 shrink-0 cursor-pointer"
                    >
                      <span>Buka Chat Room AlphaAgent</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Top Brokers Exchange Leaderboard */}
              {!isLoading && (
                <IdxBrokerLeaderboardCard topBrokers={topBrokers} />
              )}
            </>
          )}

          {/* TAB 2: INSIDER FILINGS (DIREKSI & KOMISARIS) */}
          {activeTab === 'insider' && (
            <div className="space-y-6">
              <InsiderFilingsCard
                initialTicker={ticker}
                onTickerChange={(newTicker) => setTicker(newTicker)}
              />
            </div>
          )}

          {/* TAB 3: INSTITUTIONAL OWNERSHIP (DAPEN, REKSADANA, ASURANSI) */}
          {activeTab === 'institutional' && (
            <div className="space-y-6">
              <InstitutionalOwnershipCard
                initialTicker={ticker}
                onTickerChange={(newTicker) => setTicker(newTicker)}
              />
            </div>
          )}

          {/* TAB 4: BEI SUSPENSIONS & UMA RADAR */}
          {activeTab === 'suspensions' && (
            <div className="space-y-6">
              <RegulatorySuspensionsCard initialTicker={ticker} />
            </div>
          )}
        </AuthGate>
      </main>
    </div>
  );
}

export default function SmartMoneyPage() {
  return (
    <Suspense fallback={
      <div className="h-screen w-full bg-[#07090e] text-slate-100 flex items-center justify-center">
        <RefreshCw className="h-6 w-6 text-amber-400 animate-spin" />
      </div>
    }>
      <SmartMoneyWorkspace />
    </Suspense>
  );
}

