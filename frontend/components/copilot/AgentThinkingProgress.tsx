'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { AlphaAgentLogo } from '@/components/AlphaAgentLogo';
import { Cpu, Database, Calculator, FileText, Sparkles, RefreshCw } from 'lucide-react';

export interface LiveThinkingStep {
  step_number: number;
  phase: 'PLANNING' | 'FETCHING' | 'COMPARING' | 'SYNTHESIZING' | 'ERROR' | string;
  title: string;
  detail: string;
}

interface AgentThinkingProgressProps {
  lastQuery?: string;
  liveStep?: LiveThinkingStep | null;
  totalSteps?: number;
}

interface StepConfig {
  number: number;
  title: string;
  phase: 'PLANNING' | 'FETCHING' | 'COMPARING' | 'SYNTHESIZING';
  detail: string;
  triggerMs: number;
  progressPercent: number;
  phaseClass: string;
  icon: 'cpu' | 'database' | 'calculator' | 'file' | 'sparkles';
}

export const AgentThinkingProgress: React.FC<AgentThinkingProgressProps> = ({ 
  lastQuery = '',
  liveStep = null,
  totalSteps
}) => {
  const [elapsedMs, setElapsedMs] = useState(0);

  // Setup interval to track elapsed time while loading
  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      setElapsedMs(Date.now() - startTime);
    }, 150);

    return () => clearInterval(interval);
  }, []);

  // Determine query flavor to tailor step names exactly matching backend DAG planner
  const steps: StepConfig[] = useMemo(() => {
    const q = lastQuery.toLowerCase().trim();
    const isSuspension = ['suspensi', 'gembok', 'uma', 'unusual market activity', 'notasi khusus'].some(k => q.includes(k));
    const isInstitutional = ['dapen', 'dana pensiun', 'reksadana', 'mutual fund', 'ksei', 'asuransi', 'shareholder', 'pemegang saham', 'kepemilikan'].some(k => q.includes(k));
    const isInsider = ['insider', 'orang dalam', 'direksi', 'komisaris', 'filings', 'pengendali'].some(k => q.includes(k));
    const isScreening = ['cari', 'screen', 'filter', 'growth', 'karyawan', 'esg'].some(k => q.includes(k));
    const isPeerBattle = ['vs', 'versus', 'banding', 'komparasi', 'compare'].some(k => q.includes(k));

    if (isSuspension) {
      return [
        {
          number: 1,
          title: 'Step 1: Intent Classification & Plan Generation',
          phase: 'PLANNING',
          detail: 'Mengidentifikasi cakupan suspensi BEI & radar pengawasan pasar...',
          triggerMs: 0,
          progressPercent: 28,
          phaseClass: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
          icon: 'cpu'
        },
        {
          number: 2,
          title: 'Step 2: Fetch BEI Suspension Radar & UMA Notices',
          phase: 'FETCHING',
          detail: 'Mengambil catatan penghentian sementara perdagangan & surat resmi BEI...',
          triggerMs: 1800,
          progressPercent: 68,
          phaseClass: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
          icon: 'database'
        },
        {
          number: 3,
          title: 'Step 3: Institutional Autonomous Synthesis',
          phase: 'SYNTHESIZING',
          detail: 'Menyusun evaluasi risiko regulasi, going-concern, dan likuiditas bursa...',
          triggerMs: 4000,
          progressPercent: 96,
          phaseClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
          icon: 'sparkles'
        }
      ];
    } else if (isInstitutional) {
      return [
        {
          number: 1,
          title: 'Step 1: Intent Classification & Plan Generation',
          phase: 'PLANNING',
          detail: 'Menganalisis kueri & merancang dekomposisi pemegang saham KSEI...',
          triggerMs: 0,
          progressPercent: 16,
          phaseClass: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
          icon: 'cpu'
        },
        {
          number: 2,
          title: 'Step 2: Fetch Company Report & Multiples',
          phase: 'FETCHING',
          detail: 'Mengambil laporan fundamental, valuasi P/E, PBV, dan profitabilitas emiten...',
          triggerMs: 1500,
          progressPercent: 34,
          phaseClass: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
          icon: 'database'
        },
        {
          number: 3,
          title: 'Step 3: Fetch Institutional Ownership Breakdown',
          phase: 'FETCHING',
          detail: 'Mengambil data registri bulanan KSEI (Dana Pensiun, Reksadana, Asuransi, Ritel)...',
          triggerMs: 3200,
          progressPercent: 52,
          phaseClass: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
          icon: 'database'
        },
        {
          number: 4,
          title: 'Step 4: Fetch Historical Net Foreign Flow',
          phase: 'FETCHING',
          detail: 'Memeriksa tren akumulasi modal asing harian emiten...',
          triggerMs: 5000,
          progressPercent: 70,
          phaseClass: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
          icon: 'database'
        },
        {
          number: 5,
          title: 'Step 5: Deterministic Financial Intelligence Engine',
          phase: 'COMPARING',
          detail: 'Menghitung Piotroski F-Score (0-9) & P/E Historical Standard Deviation Bands...',
          triggerMs: 7200,
          progressPercent: 86,
          phaseClass: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
          icon: 'calculator'
        },
        {
          number: 6,
          title: 'Step 6: Institutional Autonomous Synthesis',
          phase: 'SYNTHESIZING',
          detail: 'Menyintesis tesis smart money, stabilitas kepemilikan, dan putusan valuasi...',
          triggerMs: 9500,
          progressPercent: 96,
          phaseClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
          icon: 'sparkles'
        }
      ];
    } else if (isInsider) {
      return [
        {
          number: 1,
          title: 'Step 1: Intent Classification & Plan Generation',
          phase: 'PLANNING',
          detail: 'Menganalisis kueri & merancang pelacakan transaksi orang dalam BEI...',
          triggerMs: 0,
          progressPercent: 20,
          phaseClass: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
          icon: 'cpu'
        },
        {
          number: 2,
          title: 'Step 2: Fetch Fundamental Overview & Multiples',
          phase: 'FETCHING',
          detail: 'Mengambil data keuangan resmi, rasio valuasi, dan profil emiten...',
          triggerMs: 1600,
          progressPercent: 40,
          phaseClass: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
          icon: 'database'
        },
        {
          number: 3,
          title: 'Step 3: Fetch Insider Filings (Direksi/Komisaris)',
          phase: 'FETCHING',
          detail: 'Mengambil laporan keterbukaan transaksi insider resmi dari BEI/KSEI...',
          triggerMs: 3400,
          progressPercent: 62,
          phaseClass: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
          icon: 'database'
        },
        {
          number: 4,
          title: 'Step 4: Smart Money & Broker Flow Analysis',
          phase: 'FETCHING',
          detail: 'Menganalisis akumulasi broker institusi penggerak transaksi orang dalam...',
          triggerMs: 5500,
          progressPercent: 82,
          phaseClass: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
          icon: 'database'
        },
        {
          number: 5,
          title: 'Step 5: Institutional Autonomous Synthesis',
          phase: 'SYNTHESIZING',
          detail: 'Menyintesis sinyal keyakinan manajemen, volume transaksi, dan tesis AI...',
          triggerMs: 8000,
          progressPercent: 96,
          phaseClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
          icon: 'sparkles'
        }
      ];
    } else if (isScreening) {
      return [
        {
          number: 1,
          title: 'Step 1: Intent Classification & Plan Generation',
          phase: 'PLANNING',
          detail: 'Mengidentifikasi kriteria skrining & menyusun execution plan...',
          triggerMs: 0,
          progressPercent: 18,
          phaseClass: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
          icon: 'cpu'
        },
        {
          number: 2,
          title: 'Step 2: Screen Companies Universe',
          phase: 'FETCHING',
          detail: 'Menyaring semesta emiten IDX via Sectors Financial API...',
          triggerMs: 1600,
          progressPercent: 35,
          phaseClass: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
          icon: 'database'
        },
        {
          number: 3,
          title: 'Step 3: Fetch Market Momentum & Top Movers',
          phase: 'FETCHING',
          detail: 'Mengambil data pergerakan 7 hari & likuiditas transaksi...',
          triggerMs: 3200,
          progressPercent: 52,
          phaseClass: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
          icon: 'database'
        },
        {
          number: 4,
          title: 'Step 4: Auto-Enrich Top Screened Emitens',
          phase: 'FETCHING',
          detail: 'Menarik rasio valuasi & fundamental lengkap untuk top emiten pemenang...',
          triggerMs: 5200,
          progressPercent: 72,
          phaseClass: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
          icon: 'database'
        },
        {
          number: 5,
          title: 'Step 5: Deterministic Financial Intelligence Engine',
          phase: 'COMPARING',
          detail: 'Menghitung Piotroski F-Score (0-9) & P/E Historical Deviation Bands...',
          triggerMs: 8800,
          progressPercent: 88,
          phaseClass: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
          icon: 'calculator'
        },
        {
          number: 6,
          title: 'Step 6: Institutional Autonomous Synthesis',
          phase: 'SYNTHESIZING',
          detail: 'Menyintesis tesis investasi, valuasi komparatif, dan rekomendasi AI...',
          triggerMs: 11000,
          progressPercent: 96,
          phaseClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
          icon: 'sparkles'
        }
      ];
    } else if (isPeerBattle) {
      return [
        {
          number: 1,
          title: 'Step 1: Intent Classification & Target Parsing',
          phase: 'PLANNING',
          detail: 'Mengidentifikasi ticker emiten pembanding & menyusun matriks komparasi...',
          triggerMs: 0,
          progressPercent: 20,
          phaseClass: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
          icon: 'cpu'
        },
        {
          number: 2,
          title: 'Step 2: Fetch Peer Company Reports & Multiples',
          phase: 'FETCHING',
          detail: 'Mengambil laporan fundamental, laba rugi, dan rasio keuangan lengkap...',
          triggerMs: 1800,
          progressPercent: 42,
          phaseClass: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
          icon: 'database'
        },
        {
          number: 3,
          title: 'Step 3: Smart Money & Broker Flow Analysis',
          phase: 'FETCHING',
          detail: 'Menganalisis akumulasi broker institusi & arus net foreign flow...',
          triggerMs: 3800,
          progressPercent: 64,
          phaseClass: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
          icon: 'database'
        },
        {
          number: 4,
          title: 'Step 4: Deterministic Peer Battle Matrix',
          phase: 'COMPARING',
          detail: 'Menghitung skor Piotroski, P/E Bands, ROE, dan deviasi valuasi...',
          triggerMs: 6500,
          progressPercent: 84,
          phaseClass: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
          icon: 'calculator'
        },
        {
          number: 5,
          title: 'Step 5: Institutional Autonomous Synthesis',
          phase: 'SYNTHESIZING',
          detail: 'Menyintesis analisis komparasi head-to-head & putusan valuasi AI...',
          triggerMs: 9500,
          progressPercent: 96,
          phaseClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
          icon: 'sparkles'
        }
      ];
    } else {
      return [
        {
          number: 1,
          title: 'Step 1: Intent Classification & Plan Generation',
          phase: 'PLANNING',
          detail: 'Menganalisis kueri & menyusun kerangka penalaran riset...',
          triggerMs: 0,
          progressPercent: 20,
          phaseClass: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
          icon: 'cpu'
        },
        {
          number: 2,
          title: 'Step 2: Fetch Fundamental Overview & Financials',
          phase: 'FETCHING',
          detail: 'Mengambil data keuangan resmi emiten dari Sectors Financial API...',
          triggerMs: 1600,
          progressPercent: 42,
          phaseClass: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
          icon: 'database'
        },
        {
          number: 3,
          title: 'Step 3: Smart Money & Institutional Flow Tracker',
          phase: 'FETCHING',
          detail: 'Memeriksa akumulasi broker institusi dan arus modal asing harian...',
          triggerMs: 3800,
          progressPercent: 64,
          phaseClass: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
          icon: 'database'
        },
        {
          number: 4,
          title: 'Step 4: Deterministic Valuation & Accounting Audit',
          phase: 'COMPARING',
          detail: 'Menghitung Piotroski F-Score & P/E Historical Standard Deviation Bands...',
          triggerMs: 6500,
          progressPercent: 84,
          phaseClass: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
          icon: 'calculator'
        },
        {
          number: 5,
          title: 'Step 5: Institutional Autonomous Synthesis',
          phase: 'SYNTHESIZING',
          detail: 'Menyusun dossier riset komprehensif, evaluasi risiko, dan tesis AI...',
          triggerMs: 9500,
          progressPercent: 96,
          phaseClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
          icon: 'sparkles'
        }
      ];
    }
  }, [lastQuery]);

  // Determine current active step index based on elapsedMs
  const currentStepIndex = useMemo(() => {
    let activeIdx = 0;
    for (let i = 0; i < steps.length; i++) {
      if (elapsedMs >= steps[i].triggerMs) {
        activeIdx = i;
      }
    }
    return activeIdx;
  }, [elapsedMs, steps]);

  const currentStep = steps[currentStepIndex];

  // Compute final displayStep: prioritizing real liveStep pushed directly from server
  const displayStep = useMemo(() => {
    if (liveStep) {
      const num = liveStep.step_number;
      const total = totalSteps && totalSteps >= num ? totalSteps : num;
      const title = liveStep.title.startsWith('Step ') ? liveStep.title : `Step ${num}: ${liveStep.title}`;
      
      let phaseClass = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      let icon: StepConfig['icon'] = 'sparkles';

      if (liveStep.phase === 'PLANNING') {
        phaseClass = 'bg-purple-500/10 text-purple-400 border-purple-500/20';
        icon = 'cpu';
      } else if (liveStep.phase === 'FETCHING') {
        phaseClass = 'bg-blue-500/10 text-blue-400 border-blue-500/20';
        icon = 'database';
      } else if (liveStep.phase === 'COMPARING') {
        phaseClass = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
        icon = 'calculator';
      } else if (liveStep.phase === 'ERROR') {
        phaseClass = 'bg-rose-500/10 text-rose-400 border-rose-500/20';
        icon = 'file';
      }

      const progressPercent = Math.min(96, Math.max(18, Math.round((num / total) * 96)));

      return {
        key: `live-${num}`,
        number: num,
        total,
        title,
        phase: liveStep.phase,
        detail: liveStep.detail,
        phaseClass,
        icon,
        progressPercent,
      };
    }

    return {
      key: `sim-${currentStepIndex}`,
      number: currentStep.number,
      total: steps.length,
      title: currentStep.title,
      phase: currentStep.phase,
      detail: currentStep.detail,
      phaseClass: currentStep.phaseClass,
      icon: currentStep.icon,
      progressPercent: currentStep.progressPercent,
    };
  }, [liveStep, totalSteps, currentStep, currentStepIndex, steps.length]);

  const elapsedSec = (elapsedMs / 1000).toFixed(1);

  const renderIcon = (iconName: StepConfig['icon']) => {
    switch (iconName) {
      case 'cpu':
        return <Cpu className="h-4 w-4 text-purple-400 animate-pulse" />;
      case 'database':
        return <Database className="h-4 w-4 text-blue-400 animate-bounce" style={{ animationDuration: '2s' }} />;
      case 'calculator':
        return <Calculator className="h-4 w-4 text-amber-400 animate-pulse" />;
      case 'sparkles':
      case 'file':
        return <Sparkles className="h-4 w-4 text-emerald-400 animate-pulse" style={{ animationDuration: '1.2s' }} />;
      default:
        return <RefreshCw className="h-4 w-4 text-emerald-400 animate-spin" />;
    }
  };

  return (
    <div className="flex flex-col items-start max-w-4xl mx-auto w-full animate-card-reveal">
      {/* Header with Agent Logo and Step Counter */}
      <div className="flex items-center justify-between w-full mb-1.5 px-1 text-[11px] text-slate-400">
        <div className="flex items-center gap-2">
          <div className="p-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
            <AlphaAgentLogo size={16} />
          </div>
          <span className="font-semibold text-emerald-400">AlphaAgent</span>
          <span className="text-[10px] text-slate-400 font-mono">
            ({elapsedSec}s)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800/80 border border-slate-700 text-slate-300 font-medium">
            Step {displayStep.number} dari {displayStep.total}
          </span>
          <span className="flex space-x-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" style={{ animationDelay: '0ms' }} />
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" style={{ animationDelay: '200ms' }} />
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" style={{ animationDelay: '400ms' }} />
          </span>
        </div>
      </div>

      {/* Main Thinking Bubble with Vertical Slide-Fade Animation */}
      <div className="w-full rounded-2xl rounded-tl-none bg-[#0d121e]/95 border border-slate-800/90 shadow-2xl p-4 sm:p-4.5 glass-panel overflow-hidden relative">
        <div className="flex items-start gap-3.5">
          {/* Phase Icon Bubble */}
          <div className="h-9 w-9 rounded-xl bg-slate-900/90 border border-slate-700/60 flex items-center justify-center shrink-0 shadow-inner mt-0.5">
            {renderIcon(displayStep.icon)}
          </div>

          {/* Vertical Transition Container */}
          <div className="flex-1 min-w-0 overflow-hidden relative min-h-[44px] flex flex-col justify-center">
            <div
              key={displayStep.key}
              className="animate-step-vertical-fade flex flex-col gap-1 w-full"
            >
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs sm:text-sm font-bold text-white tracking-wide">
                  {displayStep.title}
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${displayStep.phaseClass}`}>
                  {displayStep.phase}
                </span>
              </div>
              <p className="text-xs text-slate-300/90 leading-relaxed truncate">
                {displayStep.detail}
              </p>
            </div>
          </div>
        </div>

        {/* Micro Progress Bar at the bottom of the card */}
        <div className="w-full h-1 bg-slate-800/80 rounded-full overflow-hidden mt-3.5">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 transition-all duration-300 ease-out"
            style={{ width: `${displayStep.progressPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
};
