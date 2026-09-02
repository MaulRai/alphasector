'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { CommandPalette } from '@/components/CommandPalette';
import { AgentThinkingTrace } from '@/components/AgentThinkingTrace';
import { Company360Card } from '@/components/Company360Card';
import { PeerBattleMatrix } from '@/components/PeerBattleMatrix';
import { BrokerFlowTracker } from '@/components/BrokerFlowTracker';
import { TradeIdeasRadar } from '@/components/TradeIdeasRadar';
import { ResearchDossierModal } from '@/components/ResearchDossierModal';
import { queryAgent, checkBackendHealth, fetchTopMovers } from '@/lib/api';
import { AgentQueryResponse } from '@/lib/types';
import { 
  Sparkles, Search, Send, Swords, Users, Building2, 
  TrendingUp, TrendingDown, ArrowRight, BookOpen, AlertCircle, RefreshCw, Zap
} from 'lucide-react';

export default function Home() {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentReport, setCurrentReport] = useState<AgentQueryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isDossierOpen, setIsDossierOpen] = useState(false);
  const [backendOnline, setBackendOnline] = useState(true);
  const [topMovers, setTopMovers] = useState<any[]>([]);

  // Health check & top movers
  useEffect(() => {
    checkBackendHealth().then(res => setBackendOnline(res.status === 'healthy'));
    fetchTopMovers('7d', 4).then(res => {
      if (res && res.data && Array.isArray(res.data)) {
        setTopMovers(res.data);
      }
    }).catch(() => {});
  }, []);

  const handleRunQuery = async (queryText: string) => {
    if (!queryText.trim()) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await queryAgent(queryText);
      setCurrentReport(response);
    } catch (err: any) {
      console.error('Query error:', err);
      setError(err.message || 'Gagal mengeksekusi analisis agent. Pastikan backend FastAPI aktif.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleRunQuery(query);
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-black">
      
      {/* Navigation */}
      <Navbar
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onOpenDossier={() => setIsDossierOpen(true)}
        hasActiveReport={!!currentReport}
        backendOnline={backendOnline}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Hero Section */}
        <section className="text-center max-w-3xl mx-auto pt-2 sm:pt-6 mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-4">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Sectors Hackathon 2026 • Track 01 Autonomous AI Agent</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-3 leading-tight">
            Autonomous Equity Copilot <br />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              Pasar Modal Indonesia (IDX)
            </span>
          </h1>

          <p className="text-slate-400 text-sm sm:text-base leading-relaxed mb-6 max-w-2xl mx-auto">
            Riset fundamental, valuasi peer group, dan lacak akumulasi broker institusi 
            dalam hitungan detik dengan AI Agent otonom bertenaga Sectors Financial API.
          </p>

          {/* Main Query Bar */}
          <form onSubmit={handleSubmit} className="relative w-full max-w-2xl mx-auto">
            <div className="relative flex items-center rounded-2xl border border-slate-700/70 bg-[#0d121e]/90 p-2 shadow-2xl focus-within:border-emerald-500/80 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all glow-emerald">
              <Search className="h-5 w-5 text-emerald-400 ml-3 mr-2 shrink-0" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Tanya analisis saham (contoh: Bandingkan BBRI vs BMRI atau Analisis BBCA)..."
                className="w-full bg-transparent text-sm sm:text-base text-white placeholder-slate-500 focus:outline-none px-2 py-1"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !query.trim()}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-black text-xs sm:text-sm font-bold hover:brightness-110 active:scale-95 disabled:opacity-50 disabled:pointer-events-none transition-all shrink-0"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Menganalisis...</span>
                  </>
                ) : (
                  <>
                    <span>Riset Sekarang</span>
                    <Send className="h-3.5 w-3.5" />
                  </>
                )}
              </button>
            </div>
          </form>

        </section>

        {/* Quick Module Navigation Hub */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mb-8">
          <Link
            href="/battle"
            className="p-4 rounded-xl border border-slate-800 bg-slate-900/40 hover:bg-slate-800/60 hover:border-cyan-500/40 transition-all group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Swords className="h-4 w-4" />
              </div>
              <ArrowRight className="h-4 w-4 text-slate-600 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">Peer Battle</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Komparasi multi-emiten & valuasi gap</p>
            </div>
          </Link>

          <Link
            href="/smart-money"
            className="p-4 rounded-xl border border-slate-800 bg-slate-900/40 hover:bg-slate-800/60 hover:border-amber-500/40 transition-all group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Users className="h-4 w-4" />
              </div>
              <ArrowRight className="h-4 w-4 text-slate-600 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">Smart Money</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Lacak akumulasi broker & foreign flow</p>
            </div>
          </Link>

          <Link
            href="/screener"
            className="p-4 rounded-xl border border-slate-800 bg-slate-900/40 hover:bg-slate-800/60 hover:border-emerald-500/40 transition-all group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Search className="h-4 w-4" />
              </div>
              <ArrowRight className="h-4 w-4 text-slate-600 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">Screener Pro</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Natural language & structured filter</p>
            </div>
          </Link>

          <Link
            href="/company/BBCA"
            className="p-4 rounded-xl border border-slate-800 bg-slate-900/40 hover:bg-slate-800/60 hover:border-blue-500/40 transition-all group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <Building2 className="h-4 w-4" />
              </div>
              <ArrowRight className="h-4 w-4 text-slate-600 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors">Emiten 360°</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Dossier laporan, rasio, & segmen</p>
            </div>
          </Link>
        </section>

        {/* 1-Click Trade Ideas Presets */}
        <TradeIdeasRadar onSelectPreset={handleRunQuery} />

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-3">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* Live Analysis Output */}
        {currentReport && (
          <div className="space-y-6 animate-in fade-in duration-300">
            
            {/* Live Agent Thinking Trace Accordion */}
            <AgentThinkingTrace
              steps={currentReport.reasoning_trace}
              totalTimeMs={currentReport.total_execution_time_ms}
              creditsConsumed={currentReport.credits_consumed}
              isLoading={isLoading}
            />

            {/* Executive Synthesis Summary Card */}
            <div className="rounded-2xl border border-slate-800 bg-[#0d121e]/90 p-6 shadow-2xl glass-panel">
              <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-800 mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <h3 className="text-base font-bold text-white">
                    Sintesis Riset Otonom (Groq OpenAI 120b)
                  </h3>
                </div>
                <button
                  onClick={() => setIsDossierOpen(true)}
                  className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-semibold transition-colors"
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  <span>Lihat Full Dossier</span>
                </button>
              </div>

              {/* Summary text */}
              <p className="text-sm text-slate-200 leading-relaxed mb-4">
                {currentReport.synthesis.executive_summary}
              </p>

              {/* Key Findings list */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-800/60">
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Key Findings & Highlights
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {currentReport.synthesis.key_findings.map((f, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-emerald-400 mt-0.5">•</span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Valuasi & Sinyal Smart Money
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 text-slate-300">
                      <strong className="text-cyan-400">Valuasi:</strong> {currentReport.synthesis.valuation_verdict || 'N/A'}
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 text-slate-300">
                      <strong className="text-amber-400">Smart Money:</strong> {currentReport.synthesis.smart_money_flow || 'N/A'}
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* If Single Ticker: Display Company360Card */}
            {currentReport.metrics_summary && (
              <Company360Card data={currentReport.metrics_summary} />
            )}

            {/* If Peer Battle / Multiple Tickers: Display PeerBattleMatrix */}
            {currentReport.peer_matrix && currentReport.peer_matrix.length > 0 && (
              <PeerBattleMatrix matrix={currentReport.peer_matrix} />
            )}

            {/* If Broker Summary Available: Display BrokerFlowTracker */}
            {currentReport.broker_summary && (
              <BrokerFlowTracker
                brokerSummary={currentReport.broker_summary}
                ticker={currentReport.primary_ticker}
              />
            )}

          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-800/80 bg-[#07090e] py-6 px-4 sm:px-6 lg:px-8 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-4xl mx-auto space-y-2">
          <p>
            <strong>AlphaSector</strong> • Developed for Sectors Hackathon 2026 (Track 01: AI Agents & Assistants).
          </p>
          <p className="text-[11px] text-slate-600">
            ⚠️ Disclaimer: AlphaSector adalah alat bantu analisis dan riset finansial otonom berbasis data resmi Sectors Financial API. 
            Informasi ini bersifat edukatif dan bukan merupakan rekomendasi jual/beli efek.
          </p>
        </div>
      </footer>

      {/* Command Palette Modal (⌘K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSubmitQuery={handleRunQuery}
      />

      {/* Exportable Research Dossier Modal */}
      {currentReport && (
        <ResearchDossierModal
          isOpen={isDossierOpen}
          onClose={() => setIsDossierOpen(false)}
          report={currentReport}
        />
      )}

    </div>
  );
}
