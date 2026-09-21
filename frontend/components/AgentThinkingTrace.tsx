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
  // Collapsed by default so investors can immediately focus on the Executive Synthesis and Data
  const [isExpanded, setIsExpanded] = useState(false);

  if (!steps || steps.length === 0) return null;

  const getPhaseIcon = (phase: ExecutionPhase) => {
    switch (phase) {
      case 'PLANNING':
        return <Cpu className="h-3 w-3 text-purple-400" />;
      case 'FETCHING':
        return <Database className="h-3 w-3 text-blue-400" />;
      case 'COMPARING':
        return <Calculator className="h-3 w-3 text-amber-400" />;
      case 'SYNTHESIZING':
        return <FileText className="h-3 w-3 text-emerald-400" />;
      case 'ERROR':
        return <AlertCircle className="h-3 w-3 text-red-400" />;
      default:
        return <CheckCircle2 className="h-3 w-3 text-emerald-400" />;
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
    <div className="w-full rounded-xl border border-slate-800/80 bg-[#090d16]/70 shadow-sm overflow-hidden mb-3">
      {/* Compact Accordion Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-3.5 py-2 hover:bg-slate-800/40 transition-colors text-left"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-1 rounded-md bg-emerald-500/10 text-emerald-400 shrink-0">
            {isLoading ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Cpu className="h-3 w-3" />
            )}
          </div>
          <div className="flex items-center gap-2 truncate">
            <span className="text-xs font-semibold text-slate-300">
              Reasoning Trace
            </span>
            <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700/60">
              {steps.length} Steps
            </span>
            <span className="hidden sm:inline text-[11px] text-slate-500 font-mono">
              ({totalTimeMs}ms • {creditsConsumed} cr)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-slate-500 hover:text-slate-300 text-xs shrink-0">
          <span className="text-[11px] hidden sm:inline">{isExpanded ? 'Tutup' : 'Audit Log'}</span>
          <div className="p-0.5 rounded text-slate-400">
            {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </div>
        </div>
      </button>

      {/* Accordion Body (Subtle compact audit log) */}
      {isExpanded && (
        <div className="p-3.5 space-y-2.5 max-h-72 overflow-y-auto bg-slate-950/60 border-t border-slate-800/60">
          <div className="relative pl-5 space-y-3 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-px before:bg-slate-800">
            {steps.map((step, idx) => (
              <div key={step.id || idx} className="relative group">
                {/* Timeline Dot */}
                <div className="absolute -left-5 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-slate-900 border border-slate-700">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-400"></div>
                </div>

                {/* Compact Step Card */}
                <div className="rounded-lg border border-slate-800/60 bg-slate-900/40 p-2.5 hover:border-slate-700 transition-all text-xs">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="font-semibold text-slate-200 text-xs truncate">
                        Step {step.step_number}: {step.title}
                      </span>
                      {step.title.startsWith("Sub-Agent:") && (
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                          Groq Parallel
                        </span>
                      )}
                      {step.title.includes("Lead Arbiter") && (
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                          Lead Arbiter
                        </span>
                      )}
                      <span className={`text-[9px] font-medium px-1.5 py-0.2 rounded border ${getPhaseBadge(step.phase)}`}>
                        {step.phase}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono shrink-0">
                      {step.timestamp}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    {step.detail}
                  </p>

                  {/* Tool Call Metadata if present */}
                  {step.tool_call && (
                    <div className="mt-1.5 pt-1.5 border-t border-slate-800/40 flex flex-wrap items-center gap-1.5 text-[10px] font-mono text-slate-400">
                      <span className="px-1.5 py-0.2 rounded bg-slate-800 text-cyan-400 border border-slate-700/60">
                        {step.tool_call.endpoint}
                      </span>
                      {step.tool_call.latency_ms > 0 && (
                        <span className="text-slate-500">
                          {step.tool_call.latency_ms}ms
                        </span>
                      )}
                      <span className="text-emerald-400 font-semibold">
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
