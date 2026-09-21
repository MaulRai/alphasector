'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { PeerBattleMatrix } from '@/components/PeerBattleMatrix';
import { AgentThinkingTrace } from '@/components/AgentThinkingTrace';
import { BattleExplainerCard } from '@/components/battle/BattleExplainerCard';
import { BattleTickerManager } from '@/components/battle/BattleTickerManager';
import { useBackendHealth } from '@/hooks/useBackendHealth';
import { queryAgent } from '@/lib/api';
import { AgentQueryResponse } from '@/lib/types';
import { Swords, Sparkles, RefreshCw, ArrowRight } from 'lucide-react';
import { AuthGate } from '@/components/AuthGate';
import { AlphaAgentLogo } from '@/components/AlphaAgentLogo';

const PRESET_BATTLES = [
  { title: 'The Big 4 Banks', symbols: ['BBCA', 'BBRI', 'BMRI', 'BBNI'] },
  { title: 'Telco Giants', symbols: ['TLKM', 'ISAT', 'EXCL'] },
  { title: 'Nickel & Metals', symbols: ['INCO', 'MBMA', 'NCKL'] },
  { title: 'Consumer Staples', symbols: ['ICBP', 'INDF', 'MYOR'] },
  { title: 'Auto & Industrial', symbols: ['ASII', 'AUTO'] },
];

function PeerBattleContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tickersParam = searchParams.get('tickers');
  const autoRunParam = searchParams.get('autorun');

  const [tickers, setTickers] = useState<string[]>(['BBRI', 'BMRI']);
  const [isLoading, setIsLoading] = useState(false);
  const [report, setReport] = useState<AgentQueryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { backendOnline } = useBackendHealth();

  // Randomly animated hint for presets to encourage user engagement
  // 1s active animation with 3s pause interval; permanently turned off once a preset is selected
  const [suggestedPresetIdx, setSuggestedPresetIdx] = useState<number | null>(null);
  const [hasUserSelectedPreset, setHasUserSelectedPreset] = useState<boolean>(false);
  const [isHoveringPresets, setIsHoveringPresets] = useState<boolean>(false);

  const isPresetActive = (symbols: string[]) => {
    if (tickers.length !== symbols.length) return false;
    return symbols.every((s) => tickers.includes(s));
  };

  const isAnyPresetActive = PRESET_BATTLES.some((p) => isPresetActive(p.symbols));
  const isAnimationEnabled = !hasUserSelectedPreset && !isAnyPresetActive && !isHoveringPresets;

  useEffect(() => {
    if (!isAnimationEnabled) {
      setSuggestedPresetIdx(null);
      return;
    }

    let activeTimeout: NodeJS.Timeout;
    let pauseTimeout: NodeJS.Timeout;
    let isCancelled = false;

    const triggerHint = () => {
      if (isCancelled) return;

      // Pick a random preset
      setSuggestedPresetIdx((prev) => {
        const candidates = PRESET_BATTLES.map((_, i) => i).filter((i) => i !== prev);
        return candidates[Math.floor(Math.random() * candidates.length)] ?? 0;
      });

      // Keep animation active for exactly 1s
      activeTimeout = setTimeout(() => {
        if (isCancelled) return;
        setSuggestedPresetIdx(null); // turn off hint for 3s jeda

        // Jeda 3s before next animation
        pauseTimeout = setTimeout(() => {
          if (!isCancelled) {
            triggerHint();
          }
        }, 3000);
      }, 1000);
    };

    // Initial 3s pause on mount before first hint
    const initialDelay = setTimeout(() => {
      triggerHint();
    }, 3000);

    return () => {
      isCancelled = true;
      clearTimeout(initialDelay);
      clearTimeout(activeTimeout);
      clearTimeout(pauseTimeout);
    };
  }, [isAnimationEnabled]);

  useEffect(() => {
    if (tickersParam) {
      const parsed = tickersParam
        .split(',')
        .map(s => s.trim().toUpperCase())
        .filter(Boolean)
        .slice(0, 4);
      if (parsed.length >= 2) {
        setTickers(parsed);
        if (autoRunParam === 'true') {
          runBattle(parsed);
        }
      }
    }
  }, [tickersParam, autoRunParam]);

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

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col">
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

            {/* Quick Presets with Random Elegant Hint Animation */}
            <div 
              className="flex flex-wrap items-center gap-2"
              onMouseEnter={() => setIsHoveringPresets(true)}
              onMouseLeave={() => setIsHoveringPresets(false)}
            >
              <div className="flex items-center gap-1.5 mr-0.5">
                <span className="text-xs text-slate-500 font-medium">Presets:</span>
              </div>
              {PRESET_BATTLES.map((p, idx) => {
                const isActive = isPresetActive(p.symbols);
                const isSuggested = suggestedPresetIdx === idx && !isActive && isAnimationEnabled;

                return (
                  <button
                    key={idx}
                    onClick={() => {
                      setHasUserSelectedPreset(true);
                      setSuggestedPresetIdx(null);
                      setTickers(p.symbols);
                      setReport(null);
                    }}
                    title={`Muat preset ${p.title} (${p.symbols.join(', ')})`}
                    className={`relative group px-2.5 py-1 rounded-lg text-xs font-semibold transition-all duration-500 cursor-pointer overflow-hidden border ${
                      isActive
                        ? 'bg-cyan-500/20 text-cyan-200 border-cyan-500/70 shadow-[0_0_12px_rgba(6,182,212,0.25)] ring-1 ring-cyan-500/30'
                        : isSuggested
                        ? 'bg-slate-900/90 text-cyan-300 border-cyan-500/60 shadow-[0_0_14px_rgba(6,182,212,0.2)] animate-preset-hint'
                        : 'bg-slate-900 hover:bg-slate-800 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {/* Subtle Ambient Background for Suggested Hint */}
                    <div 
                      className={`absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent pointer-events-none transition-opacity duration-500 ${
                        isSuggested ? 'opacity-100' : 'opacity-0'
                      }`} 
                    />

                    {/* Elegant Shimmer Light Beam for Randomly Hinted Preset */}
                    {isSuggested && (
                      <span className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden rounded-lg">
                        <span className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-cyan-400/25 to-transparent animate-shimmer-slide" />
                      </span>
                    )}

                    <span className="relative z-10 transition-colors duration-300">{p.title}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Ticker Management Bar & Execute Trigger */}
          <BattleTickerManager
            tickers={tickers}
            isLoading={isLoading}
            onSelectTicker={handleSelectTicker}
            onRemoveTicker={handleRemoveTicker}
            onRunBattle={() => runBattle(tickers)}
          />

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Onboarding & Pipeline Explanation */}
          {!report && !isLoading && <BattleExplainerCard />}

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
                    <h4 className="text-base font-bold text-white">
                      Lanjutkan Diskusi di AlphaAgent Chat
                    </h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Buka room chat interaktif baru untuk membahas rekomendasi alokasi bobot portofolio, sentimen prospek, dan model komparasi {tickers.join(', ')}.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (report?.session_id) {
                      router.push(`/alpha-agent?session_id=${encodeURIComponent(report.session_id)}`);
                    } else {
                      const query = `Bandingkan valuasi dan dividen ${tickers.join(' vs ')}`;
                      router.push(`/alpha-agent?initial_query=${encodeURIComponent(query)}`);
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

export default function PeerBattlePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <RefreshCw className="h-6 w-6 text-cyan-400 animate-spin" />
            <p className="text-xs text-slate-400 font-medium animate-pulse">Memuat Peer Battle arena...</p>
          </div>
        </div>
      </div>
    }>
      <PeerBattleContent />
    </Suspense>
  );
}
