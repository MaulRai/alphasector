'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { PeerBattleMatrix } from '@/components/PeerBattleMatrix';
import { AgentThinkingTrace } from '@/components/AgentThinkingTrace';
import { CompanyLogo } from '@/components/CompanyLogo';
import { queryAgent, checkBackendHealth } from '@/lib/api';
import { AgentQueryResponse } from '@/lib/types';
import { 
  Swords, Sparkles, Play, RefreshCw, Zap, Award, 
  CheckCircle2, Plus, X, ArrowRight, ShieldCheck, Database, Layers, Bot, MessageSquare
} from 'lucide-react';
import { AuthGate } from '@/components/AuthGate';
import { TickerAutocompleteInput } from '@/components/TickerAutocompleteInput';
import { AlphaAgentLogo } from '@/components/AlphaAgentLogo';

export default function PeerBattlePage() {
  const router = useRouter();
  const [tickers, setTickers] = useState<string[]>(['BBRI', 'BMRI']);
  const [isLoading, setIsLoading] = useState(false);
  const [report, setReport] = useState<AgentQueryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [backendOnline, setBackendOnline] = useState(true);

  useEffect(() => {
    checkBackendHealth().then(res => setBackendOnline(res.status === 'healthy'));
  }, []);

  const runBattle = async (selectedTickers: string[] = tickers) => {
    if (selectedTickers.length < 2) {
      setError('Pilih minimal 2 emiten untuk komparasi Peer Battle.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const query = `Bandingkan valuasi dan dividen ${selectedTickers.join(' vs ')}`;
      const res = await queryAgent(query);
      setReport(res);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Gagal mengeksekusi analisis komparasi.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectTicker = (sym: string) => {
    const cleanSym = sym.trim().toUpperCase();
    if (!cleanSym) return;
    if (tickers.includes(cleanSym)) {
      setError(`Emiten ${cleanSym} sudah ada di dalam list.`);
      return;
    }
    if (tickers.length >= 4) {
      setError('Maksimal 4 emiten untuk satu sesi battle.');
      return;
    }
    setTickers([...tickers, cleanSym]);
    setError(null);
  };

  const handleRemoveTicker = (symbolToRemove: string) => {
    setTickers(tickers.filter(t => t !== symbolToRemove));
    setError(null);
  };

  const presetBattles = [
    { title: 'The Big 4 Banks', symbols: ['BBCA', 'BBRI', 'BMRI', 'BBNI'] },
    { title: 'Telco Giants', symbols: ['TLKM', 'ISAT', 'EXCL'] },
    { title: 'Nickel & Metals', symbols: ['INCO', 'MBMA', 'NCKL'] },
    { title: 'Consumer Staples', symbols: ['ICBP', 'INDF', 'MYOR'] },
    { title: 'Auto & Industrial', symbols: ['ASII', 'AUTO'] },
  ];

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-black">
      <Navbar backendOnline={backendOnline} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-12">
        <AuthGate
          featureName="Peer Battle & Valuation Terminal"
          featureDescription="Bandingkan rasio valuasi P/E, PBV, ROE, laba bersih, dan konsistensi dividen antar emiten secara instan dengan akun analis."
        >
        
        {/* Page Header */}
        <div className="mb-8 pb-6 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Swords className="h-5 w-5" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Peer Battle & Valuation Terminal
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
                  setReport(null);
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 text-slate-300 text-xs font-semibold transition-all"
              >
                {p.title}
              </button>
            ))}
          </div>
        </div>

        {/* Ticker Management Bar & Execute Trigger */}
        <div className="rounded-2xl border border-slate-800 bg-[#0d121e]/90 p-5 mb-8 glass-panel space-y-4">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Active Tickers Chips */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-400 font-medium mr-1">Emiten Dipilih:</span>
              {tickers.length === 0 ? (
                <span className="text-xs text-slate-500 italic">Belum ada emiten. Silakan tambahkan minimal 2 emiten.</span>
              ) : (
                tickers.map(sym => (
                  <span
                    key={sym}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-bold text-xs"
                  >
                    <CompanyLogo symbol={sym} size="xs" />
                    <span>{sym}</span>
                    <button
                      onClick={() => handleRemoveTicker(sym)}
                      className="p-0.5 rounded hover:bg-cyan-500/20 text-cyan-400"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))
              )}
            </div>

            {/* Add Ticker Input with Focus Suggestions & Live Search */}
            <TickerAutocompleteInput
              onSelectTicker={handleSelectTicker}
              selectedTickers={tickers}
              maxSelected={4}
              disabled={isLoading}
              placeholder="Tambah kode emiten..."
              buttonText="Tambah"
            />
          </div>

          {/* Action Trigger Row */}
          <div className="pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Zap className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
              <span>{tickers.length} Sectors API • 1 AI Synthesis</span>
            </div>

            <button
              onClick={() => runBattle(tickers)}
              disabled={isLoading || tickers.length < 2}
              className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:brightness-110 active:scale-95 text-black font-bold text-xs sm:text-sm transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:brightness-100"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Memproses Battle...</span>
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 fill-black" />
                  <span>
                    {tickers.length >= 2 
                      ? `Jalankan Peer Battle (${tickers.join(' vs ')})`
                      : tickers.length === 1
                      ? 'Pilih 1 Emiten Lagi (Min. 2)'
                      : 'Pilih Minimal 2 Emiten'}
                  </span>
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

        {/* Onboarding & Pipeline Explanation (Shown before analysis is run) */}
        {!report && !isLoading && (
          <div className="rounded-2xl border border-slate-800 bg-[#0d121e]/70 p-6 glass-panel mb-8">
            <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <Zap className="h-4 w-4 text-cyan-400" />
              Bagaimana Peer Battle Bekerja?
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              Fitur ini mengomparasikan metrik fundamental beberapa emiten secara objektif tanpa bias. Klik tombol <strong>&quot;Jalankan Peer Battle&quot;</strong> di atas untuk memulai siklus analisis 3-langkah berikut:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="flex items-center gap-2 font-bold text-xs text-blue-400 mb-1.5">
                  <Database className="h-4 w-4" /> 1. Data Fetching
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Mengambil data laporan keuangan resmi, valuasi historis, dan ringkasan overview setiap emiten langsung dari Sectors Financial API.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="flex items-center gap-2 font-bold text-xs text-cyan-400 mb-1.5">
                  <Layers className="h-4 w-4" /> 2. Deterministik Matrix
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Menghitung rasio P/E gap, PBV gap, profitabilitas ROE, margin NPM, rasio leverage DER, dan menentukan badge Best-in-Class secara matematis.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="flex items-center gap-2 font-bold text-xs text-emerald-400 mb-1.5">
                  <Sparkles className="h-4 w-4" /> 3. AI Valuation Verdict
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Menyintesis kesimpulan komparatif, menyaring emiten yang terdiskon, dan mengidentifikasi katalis utama.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
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
                  Ringkasan & Valuation Verdict (AI Synthesis)
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

            {/* Follow-Up Chat Room CTA Card */}
            <div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-cyan-950/40 via-slate-900 to-[#0d121e] p-6 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-5 glass-panel">
              <div className="flex items-center gap-4">
                <div className="p-2.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 shrink-0 flex items-center justify-center">
                  <AlphaAgentLogo size={26} glow />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white flex items-center gap-2">
                    Lanjutkan Diskusi di AlphaAgent Chat
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold">
                      Follow-Up Room Baru
                    </span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Buka room chat interaktif baru untuk membahas rekomendasi alokasi bobot portofolio, sentimen prospek, dan model komparasi {tickers.join(', ')}.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  if (report?.session_id) {
                    router.push(`/copilot?session_id=${encodeURIComponent(report.session_id)}`);
                  } else {
                    const query = `Bandingkan valuasi dan dividen ${tickers.join(' vs ')}`;
                    router.push(`/copilot?initial_query=${encodeURIComponent(query)}`);
                  }
                }}
                className="w-full md:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all hover:scale-105 active:scale-95 shrink-0 cursor-pointer"
              >
                <span>Buka Chat Room AlphaAgent</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

          </div>
        )}

        </AuthGate>

      </main>
    </div>
  );
}
