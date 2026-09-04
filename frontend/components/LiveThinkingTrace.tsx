'use client';

import React, { useState, useEffect } from 'react';
import { 
  Bot, Cpu, Database, Calculator, FileText, 
  Loader2, CheckCircle2, Sparkles, Clock, Zap
} from 'lucide-react';
import { AlphaAgentLogo } from '@/components/AlphaAgentLogo';

interface LiveStep {
  id: number;
  title: string;
  phase: 'PLANNING' | 'FETCHING' | 'COMPARING' | 'SYNTHESIZING';
  description: string;
  delayMs: number;
}

const DEFAULT_STEPS: LiveStep[] = [
  {
    id: 1,
    title: 'Intent Classification & Plan Generation',
    phase: 'PLANNING',
    description: 'Mengklasifikasikan intent analisis, parsing target emiten, dan merancang execution plan DAG...',
    delayMs: 700,
  },
  {
    id: 2,
    title: 'Sectors Financial API Data Ingestion',
    phase: 'FETCHING',
    description: 'Mengambil laporan keuangan resmi, valuasi terkini, dan data emiten IDX via Sectors API...',
    delayMs: 2200,
  },
  {
    id: 3,
    title: 'Calculating Multiples & Financial Health Matrix',
    phase: 'COMPARING',
    description: 'Menghitung rasio PE, PBV, ROE, laba bersih, dan metrik komparatif multi-emiten...',
    delayMs: 3800,
  },
  {
    id: 4,
    title: 'Smart Money & Institutional Flow Tracking',
    phase: 'COMPARING',
    description: 'Menganalisis akumulasi/distribusi broker dan pola arus dana institusi asing...',
    delayMs: 5400,
  },
  {
    id: 5,
    title: 'Autonomous Equity Research Synthesis',
    phase: 'SYNTHESIZING',
    description: 'Menyusun ringkasan eksekutif, temuan kunci, katalis, dan memorandum riset terstruktur...',
    delayMs: 7000,
  },
];

interface LiveThinkingTraceProps {
  query?: string;
}

export const LiveThinkingTrace: React.FC<LiveThinkingTraceProps> = ({ query }) => {
  const [elapsedMs, setElapsedMs] = useState(0);
  // Default is immediately at Step 1 (PLANNING)
  const [currentStepIdx, setCurrentStepIdx] = useState(0);

  // Live Timer & Step Progression
  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const now = Date.now();
      const diff = now - startTime;
      setElapsedMs(diff);

      // Advance step based on elapsed time
      let activeIdx = 0;
      for (let i = 0; i < DEFAULT_STEPS.length; i++) {
        if (diff >= DEFAULT_STEPS[i].delayMs) {
          activeIdx = Math.min(i + 1, DEFAULT_STEPS.length - 1);
        }
      }
      setCurrentStepIdx(activeIdx);
    }, 100);

    return () => clearInterval(interval);
  }, []);

  const getPhaseIcon = (phase: string, isCurrent: boolean, isDone: boolean) => {
    if (isDone) {
      return <CheckCircle2 className="h-4 w-4 text-emerald-400" />;
    }
    if (isCurrent) {
      return <Loader2 className="h-4 w-4 text-emerald-400 animate-spin" />;
    }

    switch (phase) {
      case 'PLANNING':
        return <Cpu className="h-4 w-4 text-purple-400/60" />;
      case 'FETCHING':
        return <Database className="h-4 w-4 text-blue-400/60" />;
      case 'COMPARING':
        return <Calculator className="h-4 w-4 text-amber-400/60" />;
      case 'SYNTHESIZING':
        return <FileText className="h-4 w-4 text-emerald-400/60" />;
      default:
        return <Cpu className="h-4 w-4 text-slate-500" />;
    }
  };

  const getPhaseBadge = (phase: string) => {
    switch (phase) {
      case 'PLANNING':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'FETCHING':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'COMPARING':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'SYNTHESIZING':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  const getStatusText = (phase: string) => {
    switch (phase) {
      case 'PLANNING':
        return 'Planning intent & DAG...';
      case 'FETCHING':
        return 'Fetching Sectors API...';
      case 'COMPARING':
        return 'Calculating metrics...';
      case 'SYNTHESIZING':
        return 'Synthesizing report...';
      default:
        return 'Running...';
    }
  };

  return (
    <div className="flex flex-col items-start max-w-4xl mx-auto w-full animate-card-reveal">
      
      {/* Sender Header */}
      <div className="flex items-center gap-2 mb-2 text-[11px] text-emerald-400 font-semibold">
        <div className="p-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center animate-pulse">
          <AlphaAgentLogo size={16} />
        </div>
        <span className="flex items-center gap-1.5">
          <span>AlphaAgent sedang bernalar...</span>
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
        </span>
      </div>

      {/* Main Live Multi-Step Reasoning Box */}
      <div className="w-full rounded-2xl border border-emerald-500/30 bg-[#0a0f1d] shadow-2xl overflow-hidden glass-panel">
        
        {/* Live Header Bar */}
        <div className="px-4 sm:px-5 py-3.5 bg-slate-900/80 border-b border-slate-800/90 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="relative p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-bold text-white tracking-wide">
                  Live Agent Multi-Step Reasoning DAG
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 animate-pulse">
                  Step {Math.min(currentStepIdx + 1, DEFAULT_STEPS.length)} of {DEFAULT_STEPS.length}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Mengeksekusi tool calling Sectors Financial API & penalaran otonom
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono font-semibold text-slate-400 bg-slate-950/80 px-2.5 py-1 rounded-lg border border-slate-800">
            <Clock className="h-3.5 w-3.5 text-emerald-400 animate-spin" />
            <span>{(elapsedMs / 1000).toFixed(1)}s</span>
          </div>
        </div>

        {/* Steps Pipeline Timeline */}
        <div className="p-4 sm:p-5 space-y-3.5">
          {DEFAULT_STEPS.map((step, idx) => {
            const isDone = idx < currentStepIdx;
            const isCurrent = idx === currentStepIdx;

            return (
              <div
                key={step.id}
                className={`relative flex items-start gap-3.5 p-3 rounded-xl transition-all duration-300 ${
                  isCurrent
                    ? 'bg-emerald-500/10 border border-emerald-500/30 shadow-md shadow-emerald-500/5'
                    : isDone
                    ? 'bg-slate-900/40 border border-slate-800/80 opacity-90'
                    : 'bg-transparent border border-transparent opacity-35'
                }`}
              >
                {/* Step Icon Indicator */}
                <div
                  className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 border transition-all ${
                    isDone
                      ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                      : isCurrent
                      ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-sm shadow-emerald-500/20 scale-105'
                      : 'bg-slate-900 border-slate-800 text-slate-500'
                  }`}
                >
                  {getPhaseIcon(step.phase, isCurrent, isDone)}
                </div>

                {/* Step Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-bold transition-colors ${
                          isCurrent
                            ? 'text-emerald-300'
                            : isDone
                            ? 'text-slate-200'
                            : 'text-slate-500'
                        }`}
                      >
                        Step {step.id}: {step.title}
                      </span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.2 rounded border uppercase tracking-wider ${getPhaseBadge(
                          step.phase
                        )}`}
                      >
                        {step.phase}
                      </span>
                    </div>

                    {isCurrent && (
                      <span className="text-[10px] font-mono font-semibold text-emerald-400 flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                        <span>{getStatusText(step.phase)}</span>
                      </span>
                    )}

                    {isDone && (
                      <span className="text-[10px] font-mono text-slate-500">
                        Completed
                      </span>
                    )}
                  </div>

                  <p
                    className={`text-[11px] mt-1 leading-relaxed ${
                      isCurrent
                        ? 'text-slate-300'
                        : isDone
                        ? 'text-slate-400'
                        : 'text-slate-600'
                    }`}
                  >
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Live Active Footer Shimmer Bar */}
        <div className="px-4 py-2.5 bg-[#070b14] border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <Zap className="h-3.5 w-3.5 text-emerald-400" />
            <span>Sectors Financial API Connected (Live Stream)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-emerald-400 font-semibold font-mono text-[10px]">AKTIF</span>
          </div>
        </div>

      </div>

    </div>
  );
};
