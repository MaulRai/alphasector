'use client';

import React, { useState } from 'react';
import { ReasoningStep, ExecutionPhase } from '@/lib/types';
import { 
  ChevronDown, ChevronUp, Cpu, CheckCircle2, 
  Loader2, Database, Calculator, FileText, AlertCircle 
} from 'lucide-react';

interface AgentThinkingTraceProps {
  steps: ReasoningStep[];
  totalTimeMs?: number;
  creditsConsumed?: number;
  isLoading?: boolean;
}

export const AgentThinkingTrace: React.FC<AgentThinkingTraceProps> = ({
  steps,
  totalTimeMs = 0,
  creditsConsumed = 0,
  isLoading = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!steps || steps.length === 0) return null;

  const getPhaseIcon = (phase: ExecutionPhase) => {
    switch (phase) {
      case 'PLANNING':
        return <Cpu className="h-4 w-4 text-purple-400" />;
      case 'FETCHING':
        return <Database className="h-4 w-4 text-blue-400" />;
      case 'COMPARING':
        return <Calculator className="h-4 w-4 text-amber-400" />;
      case 'SYNTHESIZING':
        return <FileText className="h-4 w-4 text-emerald-400" />;
      case 'ERROR':
        return <AlertCircle className="h-4 w-4 text-red-400" />;
      default:
        return <CheckCircle2 className="h-4 w-4 text-emerald-400" />;
    }
  };

  const getPhaseBadge = (phase: ExecutionPhase) => {
    switch (phase) {
      case 'PLANNING':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'FETCHING':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'COMPARING':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'SYNTHESIZING':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'ERROR':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  return (
    <div className="w-full rounded-2xl border border-slate-800 bg-[#0b0f19]/90 shadow-xl overflow-hidden mb-6">
      {/* Accordion Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-5 py-3.5 bg-slate-900/50 hover:bg-slate-900/80 transition-colors border-b border-slate-800/80"
      >
        <div className="flex items-center gap-3">
          <div className="relative p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Cpu className="h-4 w-4" />
            )}
          </div>
          <div className="text-left">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white tracking-wide">
                Agent Multi-Step Reasoning Trace
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {steps.length} Steps Executed
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Deterministic planner & custom tool orchestration pipeline
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-3 text-xs text-slate-400">
            <span>Latency: <strong className="text-slate-200">{totalTimeMs}ms</strong></span>
            <span>•</span>
            <span>Credits: <strong className="text-emerald-400">{creditsConsumed}</strong></span>
          </div>
          <div className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white">
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </div>
        </div>
      </button>

      {/* Accordion Body */}
      {isExpanded && (
        <div className="p-5 space-y-4 max-h-96 overflow-y-auto bg-slate-950/40">
          <div className="relative pl-6 space-y-5 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
            {steps.map((step, idx) => (
              <div key={step.id || idx} className="relative group">
                {/* Timeline Dot */}
                <div className="absolute -left-6 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 border border-slate-700 group-hover:border-emerald-500 transition-colors">
                  <div className="h-2 w-2 rounded-full bg-emerald-400"></div>
                </div>

                {/* Step Card */}
                <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-3.5 hover:border-slate-700 transition-all">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xs font-bold text-slate-200 truncate">
                        Step {step.step_number}: {step.title}
                      </span>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-md border ${getPhaseBadge(step.phase)}`}>
                        {step.phase}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 font-mono shrink-0">
                      {step.timestamp}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {step.detail}
                  </p>

                  {/* Tool Call Metadata if present */}
                  {step.tool_call && (
                    <div className="mt-2.5 pt-2.5 border-t border-slate-800/60 flex flex-wrap items-center gap-2 text-[11px] font-mono text-slate-400">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-cyan-400 border border-slate-700/60">
                        {step.tool_call.endpoint}
                      </span>
                      {step.tool_call.latency_ms > 0 && (
                        <span className="text-slate-500">
                          {step.tool_call.latency_ms}ms
                        </span>
                      )}
                      <span className="text-emerald-400">
                        Status {step.tool_call.status}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
