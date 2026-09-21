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

  // Compute display step directly from real SSE stream data
  const displayStep = useMemo(() => {
    if (liveStep) {
      const num = liveStep.step_number;
      const total = totalSteps && totalSteps >= num ? totalSteps : num;
      // Strip any existing "Step X: " prefix to prevent duplicate numbering
      const cleanTitle = liveStep.title.replace(/^Step\s*\d+\s*:\s*/i, '');
      const formattedTitle = `Step ${num}: ${cleanTitle}`;
      
      let phaseClass = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      let icon: 'cpu' | 'database' | 'calculator' | 'file' | 'sparkles' = 'sparkles';

      if (cleanTitle.startsWith('Sub-Agent:')) {
        phaseClass = 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30';
        icon = 'sparkles';
      } else if (cleanTitle.includes('Lead Arbiter') || cleanTitle.includes('Multi-Agent')) {
        phaseClass = 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
        icon = 'cpu';
      } else if (liveStep.phase === 'PLANNING') {
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
        isInitializing: false,
        number: num,
        total,
        title: formattedTitle,
        phase: liveStep.phase,
        detail: liveStep.detail,
        phaseClass,
        icon,
        progressPercent,
      };
    }

    // Initial state before the first SSE step arrives from the server
    return {
      key: 'initializing',
      isInitializing: true,
      number: 0,
      total: totalSteps || 0,
      title: 'Intent Classification & Plan Generation',
      phase: 'PLANNING',
      detail: 'Menganalisis kueri bursa & merancang execution DAG...',
      phaseClass: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      icon: 'cpu' as const,
      progressPercent: 12,
    };
  }, [liveStep, totalSteps]);

  const elapsedSec = (elapsedMs / 1000).toFixed(1);

  const renderIcon = (iconName: 'cpu' | 'database' | 'calculator' | 'file' | 'sparkles') => {
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
          {displayStep.isInitializing ? (
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 font-medium flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-purple-400 animate-ping" />
              Merancang Plan...
            </span>
          ) : (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800/80 border border-slate-700 text-slate-300 font-medium">
              Step {displayStep.number} dari {displayStep.total}
            </span>
          )}
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
