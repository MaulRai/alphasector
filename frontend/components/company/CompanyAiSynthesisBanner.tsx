'use client';

import React from 'react';
import { Sparkles, RefreshCw, Play } from 'lucide-react';
import { AgentQueryResponse } from '@/lib/types';

interface CompanyAiSynthesisBannerProps {
  symbol: string;
  agentReport: AgentQueryResponse | null;
  isGeneratingAI: boolean;
  onExecuteDeepDive: () => void;
}

export const CompanyAiSynthesisBanner: React.FC<CompanyAiSynthesisBannerProps> = ({
  symbol,
  agentReport,
  isGeneratingAI,
  onExecuteDeepDive,
}) => {
  return (
    <>
      {/* User-Triggered AI Synthesis Action Banner */}
      {!agentReport && (
        <div className="rounded-2xl border border-slate-800 bg-[#0d121e]/90 p-5 glass-panel flex flex-col sm:flex-row sm:items-center justify-between gap-4 glow-cyan">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="h-4 w-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white">
                Ingin Analisis Riset Otonom Lengkap untuk {symbol}?
              </h3>
            </div>
            <p className="text-xs text-slate-400">
              Agent akan menganalisis segmen bisnis, aliran broker flow, dan menyintesis narasi riset fundamental.
            </p>
          </div>

          <button
            onClick={onExecuteDeepDive}
            disabled={isGeneratingAI}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:brightness-110 active:scale-95 text-black font-bold text-xs transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50 shrink-0 cursor-pointer"
          >
            {isGeneratingAI ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Menyintesis Riset...</span>
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5 fill-black" />
                <span>Generate AI Research Synthesis</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* AI Autonomous Brief Card (Shown after generation) */}
      {agentReport && agentReport.synthesis && (
        <div className="rounded-2xl border border-slate-800 bg-[#0d121e]/90 p-6 glass-panel glow-cyan">
          <div className="flex items-center gap-2 mb-3 pb-3 border-b border-slate-800">
            <Sparkles className="h-4 w-4 text-cyan-400" />
            <h3 className="text-base font-bold text-white">
              Sintesis Riset Fundamental Otonom
            </h3>
          </div>
          <p className="text-sm text-slate-200 leading-relaxed mb-4">
            {agentReport.synthesis.executive_summary}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-300">
              <strong className="text-cyan-400">Valuasi:</strong> {agentReport.synthesis.valuation_verdict || 'N/A'}
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-300">
              <strong className="text-amber-400">Smart Money Flow:</strong> {agentReport.synthesis.smart_money_flow || 'N/A'}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
