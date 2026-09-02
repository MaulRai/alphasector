'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { PeerBattleMatrix } from '@/components/PeerBattleMatrix';
import { AgentThinkingTrace } from '@/components/AgentThinkingTrace';
import { queryAgent, checkBackendHealth } from '@/lib/api';
import { AgentQueryResponse } from '@/lib/types';
import { Swords, Sparkles, Send, RefreshCw, Zap, Award, CheckCircle2, Plus, X } from 'lucide-react';

export default function PeerBattlePage() {
  const [tickers, setTickers] = useState<string[]>(['BBRI', 'BMRI']);
  const [newTicker, setNewTicker] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [report, setReport] = useState<AgentQueryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [backendOnline, setBackendOnline] = useState(true);

  useEffect(() => {
    checkBackendHealth().then(res => setBackendOnline(res.status === 'healthy'));
    // Initial run
    runBattle(['BBRI', 'BMRI']);
  }, []);

  const runBattle = async (selectedTickers: string[]) => {
    if (selectedTickers.length < 2) {
      setError('Pilih minimal 2 emiten untuk komparasi Peer Battle.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const q = `Bandingkan valuasi, PBV, ROE, dan dividen ${selectedTickers.join(' vs ')}`;
      const res = await queryAgent(q);
      setReport(res);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Gagal mengeksekusi Peer Battle.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTicker = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newTicker.trim().toUpperCase().replace('.JK', '');
    if (!clean) return;
    if (tickers.includes(clean)) {
      setNewTicker('');
      return;
    }
    if (tickers.length >= 4) {
      setError('Maksimal 4 emiten untuk komparasi optimal.');
      return;
    }
    const updated = [...tickers, clean];
    setTickers(updated);
    setNewTicker('');
    runBattle(updated);
  };

  const handleRemoveTicker = (sym: string) => {
    if (tickers.length <= 2) {
      setError('Minimal 2 emiten untuk komparasi.');
      return;
    }
    const updated = tickers.filter(t => t !== sym);
    setTickers(updated);
    runBattle(updated);
  };

  const presetBattles = [
    { title: 'Big 4 Banks', symbols: ['BBCA', 'BBRI', 'BMRI', 'BBNI'] },
    { title: 'Coal & Energy', symbols: ['ADRO', 'PTBA', 'ITMG'] },
    { title: 'Telco Giants', symbols: ['TLKM', 'ISAT', 'EXCL'] },
    { title: 'Consumer Staples', symbols: ['ICBP', 'INDF', 'MYOR'] },
    { title: 'Auto & Industrial', symbols: ['ASII', 'AUTO'] },
  ];

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-black">
      <Navbar backendOnline={backendOnline} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Page Header */}
        <div className="mb-8 pb-6 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Swords className="h-5 w-5" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                ⚔️ Peer Battle & Valuation Terminal
              </h1>
            </div>
            <p className="text-sm text-slate-400">
              Komparasi multi-emiten head-to-head dengan kalkulasi deterministik valuasi gap (P/E & PBV) dan analisis sintetis AI.
            </p>
          </div>

          {/* Quick Presets */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-500 font-medium mr-1">Presets:</span>
            {presetBattles.map((p, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setTickers(p.symbols);
                  runBattle(p.symbols);
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 text-slate-300 text-xs font-semibold transition-all"
              >
                {p.title}
              </button>
            ))}
          </div>
        </div>

        {/* Ticker Management Bar */}
        <div className="rounded-2xl border border-slate-800 bg-[#0d121e]/90 p-4 mb-8 glass-panel flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          
          {/* Active Tickers Chips */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400 font-medium mr-1">Emiten Dipilih:</span>
            {tickers.map(sym => (
              <span
                key={sym}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-bold text-xs"
              >
                <span>{sym}</span>
                <button
                  onClick={() => handleRemoveTicker(sym)}
                  className="p-0.5 rounded hover:bg-cyan-500/20 text-cyan-400"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>

          {/* Add Ticker Input */}
          <form onSubmit={handleAddTicker} className="flex items-center gap-2">
            <input
              type="text"
              value={newTicker}
              onChange={(e) => setNewTicker(e.target.value)}
              placeholder="Tambah kode emiten (misal: BBNI)..."
              className="px-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 uppercase"
              maxLength={6}
            />
            <button
              type="submit"
              disabled={isLoading || !newTicker.trim() || tickers.length >= 4}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs transition-all disabled:opacity-50"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Tambah</span>
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
            <RefreshCw className="h-8 w-8 text-cyan-400 animate-spin mx-auto" />
            <p className="text-sm text-slate-400 font-medium">
              Memproses kalkulasi deterministik & menyintesis data peer matrix dari Sectors API...
            </p>
          </div>
        )}

        {/* Content Section */}
        {report && !isLoading && (
          <div className="space-y-6 animate-in fade-in duration-300">
            
            {/* Live Reasoning Trace */}
            <AgentThinkingTrace
              steps={report.reasoning_trace}
              totalTimeMs={report.total_execution_time_ms}
              creditsConsumed={report.credits_consumed}
            />

            {/* Peer Battle Matrix Table */}
            {report.peer_matrix && (
              <PeerBattleMatrix matrix={report.peer_matrix} />
            )}

            {/* AI Verdict Summary */}
            <div className="rounded-2xl border border-slate-800 bg-[#0d121e]/90 p-6 glass-panel glow-cyan">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-800">
                <Sparkles className="h-4 w-4 text-cyan-400" />
                <h3 className="text-base font-bold text-white">
                  ⚖️ Ringkasan & Valuation Verdict (AI Synthesis)
                </h3>
              </div>
              <p className="text-sm text-slate-200 leading-relaxed mb-4">
                {report.synthesis.executive_summary}
              </p>
              {report.synthesis.valuation_verdict && (
                <div className="p-3.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-xs text-cyan-200">
                  <strong>Valuation Verdict:</strong> {report.synthesis.valuation_verdict}
                </div>
              )}
            </div>

          </div>
        )}

      </main>
    </div>
  );
}
