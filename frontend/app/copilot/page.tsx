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
import { queryAgent, checkBackendHealth } from '@/lib/api';
import { AgentQueryResponse } from '@/lib/types';
import { 
  Sparkles, Search, Send, RefreshCw, 
  BookOpen, AlertCircle, Terminal, Zap, ShieldCheck
} from 'lucide-react';

export default function CopilotPage() {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentReport, setCurrentReport] = useState<AgentQueryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isDossierOpen, setIsDossierOpen] = useState(false);
  const [backendOnline, setBackendOnline] = useState(true);

  useEffect(() => {
    checkBackendHealth().then(res => setBackendOnline(res.status === 'healthy'));
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
        
        {/* Workspace Header */}
        <section className="max-w-3xl mx-auto pt-2 sm:pt-6 mb-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-4">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Autonomous AI Research Copilot • Groq OpenAI 120b</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white mb-3 leading-tight">
            Research Copilot Terminal
          </h1>

          <p className="text-slate-400 text-xs sm:text-sm leading-relaxed mb-6 max-w-xl mx-auto">
            Ketik pertanyaan riset pasar modal atau pilih preset radar di bawah untuk mengeksekusi reasoning multi-langkah.
          </p>

          {/* Main Query Bar */}
          <form onSubmit={handleSubmit} className="relative w-full max-w-2xl mx-auto">
            <div className="relative flex items-center rounded-2xl border border-slate-700/70 bg-[#0d121e]/90 p-2 shadow-2xl focus-within:border-emerald-500/80 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all glow-emerald">
              <Search className="h-5 w-5 text-emerald-400 ml-3 mr-2 shrink-0" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Tanya emiten (misal: Bandingkan BBRI vs BMRI atau Analisis Valuasi BBCA)..."
                className="w-full bg-transparent text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none px-2 py-1"
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
            <strong>AlphaSector Copilot</strong> • Track 01 Autonomous AI Agent.
          </p>
          <p className="text-[11px] text-slate-600">
            ⚠️ Disclaimer: Data disajikan untuk kebutuhan edukasi dan analisis riset berbasis Sectors API. Bukan ajakan jual/beli efek.
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
