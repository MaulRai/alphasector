'use client';

import React, { useState } from 'react';
import { AgentQueryResponse } from '@/lib/types';
import { 
  FileText, Copy, Check, Printer, Maximize2, X, 
  Layers, Clock, Zap, ArrowRight, ShieldCheck, 
  Search, ExternalLink, ChevronRight, BookOpen, 
  TrendingUp, Award, DollarSign
} from 'lucide-react';
import Link from 'next/link';
import { printDossier } from '@/lib/printDossier';

export interface ArtifactItem {
  id: string;
  timestamp: string;
  report: AgentQueryResponse;
  query: string;
  primaryTicker?: string;
  intent?: string;
}

interface CopilotArtifactPanelProps {
  isOpen: boolean;
  onClose: () => void;
  artifacts: ArtifactItem[];
  selectedArtifactId: string | null;
  onSelectArtifact: (id: string) => void;
  onOpenFullscreenModal?: (report: AgentQueryResponse) => void;
}

export const CopilotArtifactPanel: React.FC<CopilotArtifactPanelProps> = ({
  isOpen,
  onClose,
  artifacts,
  selectedArtifactId,
  onSelectArtifact,
  onOpenFullscreenModal,
}) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'library'>('preview');
  const [copied, setCopied] = useState(false);
  const [librarySearch, setLibrarySearch] = useState('');

  // Selected artifact or default to latest
  const activeArtifact = 
    artifacts.find((a) => a.id === selectedArtifactId) || 
    artifacts[artifacts.length - 1] || 
    null;

  const handleCopyMarkdown = (report: AgentQueryResponse) => {
    if (!report) return;
    const md = `
# ALPHASECTOR EQUITY RESEARCH BRIEF

**Query:** ${report.query}
**Intent:** ${report.intent}
**Target:** ${report.primary_ticker || 'Market-Wide'}
**Tanggal:** ${new Date().toLocaleDateString('id-ID')}

---

## Executive Summary
${report.synthesis.executive_summary}

## Key Findings
${report.synthesis.key_findings.map((f) => `- ${f}`).join('\n')}

## Valuation Verdict
${report.synthesis.valuation_verdict || 'N/A'}

## Smart Money Flow
${report.synthesis.smart_money_flow || 'N/A'}

## Key Catalysts
${report.synthesis.catalysts.map((c) => `- ${c}`).join('\n')}

## Key Risks
${report.synthesis.risks.map((r) => `- ${r}`).join('\n')}

---
${report.synthesis.disclaimer}
`;
    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredArtifacts = artifacts.filter((a) => {
    if (!librarySearch.trim()) return true;
    const q = librarySearch.toLowerCase();
    return (
      a.query.toLowerCase().includes(q) ||
      (a.primaryTicker && a.primaryTicker.toLowerCase().includes(q)) ||
      (a.intent && a.intent.toLowerCase().includes(q))
    );
  });

  return (
    <aside
      className={`${
        isOpen
          ? 'w-full sm:w-[480px] lg:w-[540px] opacity-100 border-l border-slate-800'
          : 'w-0 opacity-0 pointer-events-none border-l-0'
      } shrink-0 bg-[#0a0d16] flex flex-col h-full overflow-hidden relative z-30 transition-all duration-300 ease-out`}
    >
      
      {/* Panel Top Header (Claude Style) */}
      <div className="p-3.5 sm:p-4 border-b border-slate-800 bg-[#07090e]/80 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
            <FileText className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-white truncate">
                Artifacts & Dossier Library
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/15 text-emerald-300 font-bold border border-emerald-500/30 shrink-0">
                {artifacts.length}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 truncate">
              {activeArtifact ? activeArtifact.query : 'Dokumen riset tersimpan'}
            </p>
          </div>
        </div>

        {/* Header Action Tools */}
        <div className="flex items-center gap-1.5 shrink-0">
          {activeArtifact && (
            <>
              <button
                onClick={() => handleCopyMarkdown(activeArtifact.report)}
                title="Salin Markdown"
                className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 text-xs transition-colors"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              </button>

              <button
                onClick={() => {
                  if (activeArtifact) {
                    printDossier(activeArtifact.report, {
                      query: activeArtifact.query,
                      ticker: activeArtifact.primaryTicker,
                      timestamp: activeArtifact.timestamp,
                    });
                  }
                }}
                title="Cetak Laporan Riset (Dossier PDF)"
                className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-emerald-400 border border-slate-800 text-xs transition-colors cursor-pointer"
              >
                <Printer className="h-3.5 w-3.5" />
              </button>

              {onOpenFullscreenModal && (
                <button
                  onClick={() => onOpenFullscreenModal(activeArtifact.report)}
                  title="Perbesar Tampilan (Modal View)"
                  className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 text-xs transition-colors"
                >
                  <Maximize2 className="h-3.5 w-3.5" />
                </button>
              )}
            </>
          )}

          <button
            onClick={onClose}
            title="Tutup Panel"
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 text-xs transition-colors ml-1"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Tab Switcher (Preview vs Library) */}
      <div className="px-3.5 pt-2.5 pb-2 border-b border-slate-800/80 bg-[#080b13] flex items-center justify-between gap-2">
        <div className="flex items-center gap-1 bg-slate-900/90 p-0.5 rounded-xl border border-slate-800 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('preview')}
            className={`px-3 py-1 rounded-lg transition-all ${
              activeTab === 'preview'
                ? 'bg-emerald-500/20 text-emerald-300 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Pratinjau Dossier
          </button>
          <button
            onClick={() => setActiveTab('library')}
            className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'library'
                ? 'bg-emerald-500/20 text-emerald-300 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Library</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-mono">
              {artifacts.length}
            </span>
          </button>
        </div>

        {activeArtifact && activeArtifact.primaryTicker && (
          <Link
            href={`/company/${activeArtifact.primaryTicker}`}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            <span>Emiten 360° ({activeArtifact.primaryTicker})</span>
            <ExternalLink className="h-3 w-3" />
          </Link>
        )}
      </div>

      {/* Main Body Content */}
      <div className="flex-1 overflow-y-auto min-h-0 custom-scrollbar p-4">
        
        {/* ============================================================ */}
        {/* TAB 1: ARTIFACT PREVIEW VIEW                                 */}
        {/* ============================================================ */}
        {activeTab === 'preview' && (
          <div>
            {activeArtifact ? (
              <div className="space-y-6">
                
                {/* Dossier Header Badge & Meta */}
                <div className="p-4 rounded-2xl bg-[#0d121e] border border-slate-800 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {activeArtifact.intent?.replace(/_/g, ' ') || 'EQUITY RESEARCH MEMO'}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {activeArtifact.timestamp}
                    </span>
                  </div>

                  <h2 className="text-base sm:text-lg font-bold text-white leading-snug">
                    {activeArtifact.query}
                  </h2>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Zap className="h-3.5 w-3.5 text-cyan-400" />
                      <span>{activeArtifact.report.credits_consumed || 1} API Credits • {activeArtifact.report.total_execution_time_ms}ms</span>
                    </div>
                    {activeArtifact.primaryTicker && (
                      <span className="font-bold text-emerald-400 font-mono">
                        Ticker: {activeArtifact.primaryTicker}
                      </span>
                    )}
                  </div>
                </div>

                {/* Executive Summary */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Executive Summary
                  </h4>
                  <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 text-xs text-slate-200 leading-relaxed font-sans">
                    {activeArtifact.report.synthesis?.executive_summary}
                  </div>
                </div>

                {/* Key Findings Checklist */}
                {activeArtifact.report.synthesis?.key_findings?.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Key Findings
                    </h4>
                    <div className="space-y-2">
                      {activeArtifact.report.synthesis.key_findings.map((finding, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-900/40 border border-slate-800/80 text-xs text-slate-300"
                        >
                          <div className="h-4 w-4 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                            {idx + 1}
                          </div>
                          <span>{finding}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Valuation Verdict */}
                {activeArtifact.report.synthesis?.valuation_verdict && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Valuation Verdict
                    </h4>
                    <div className="p-3.5 rounded-xl bg-cyan-500/5 border border-cyan-500/20 text-xs text-cyan-300 leading-relaxed">
                      {activeArtifact.report.synthesis.valuation_verdict}
                    </div>
                  </div>
                )}

                {/* Smart Money Flow */}
                {activeArtifact.report.synthesis?.smart_money_flow && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Smart Money Flow & Broker Accumulation
                    </h4>
                    <div className="p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/20 text-xs text-amber-300 leading-relaxed">
                      {activeArtifact.report.synthesis.smart_money_flow}
                    </div>
                  </div>
                )}

                {/* Catalysts & Risks Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Catalysts */}
                  {activeArtifact.report.synthesis?.catalysts?.length > 0 && (
                    <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-1.5">
                      <div className="text-[11px] font-bold text-emerald-400 flex items-center gap-1.5">
                        <TrendingUp className="h-3.5 w-3.5" />
                        <span>Katalis Positif</span>
                      </div>
                      <ul className="space-y-1 text-[11px] text-slate-300 list-disc list-inside">
                        {activeArtifact.report.synthesis.catalysts.map((c, i) => (
                          <li key={i}>{c}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Risks */}
                  {activeArtifact.report.synthesis?.risks?.length > 0 && (
                    <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/20 space-y-1.5">
                      <div className="text-[11px] font-bold text-red-400 flex items-center gap-1.5">
                        <Award className="h-3.5 w-3.5" />
                        <span>Faktor Risiko</span>
                      </div>
                      <ul className="space-y-1 text-[11px] text-slate-300 list-disc list-inside">
                        {activeArtifact.report.synthesis.risks.map((r, i) => (
                          <li key={i}>{r}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Disclaimer */}
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[10px] text-slate-500 leading-normal">
                  {activeArtifact.report.synthesis?.disclaimer}
                </div>

              </div>
            ) : (
              <div className="py-20 text-center space-y-3">
                <FileText className="h-8 w-8 text-slate-600 mx-auto" />
                <p className="text-xs text-slate-400">
                  Belum ada artifact riset dalam sesi ini.
                </p>
                <p className="text-[11px] text-slate-500">
                  Tanyakan perbandingan emiten atau analisis fundamental untuk membuat dokumen riset.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 2: ARTIFACTS LIBRARY LIST                                */}
        {/* ============================================================ */}
        {activeTab === 'library' && (
          <div className="space-y-3">
            {/* Search filter */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
              <input
                type="text"
                value={librarySearch}
                onChange={(e) => setLibrarySearch(e.target.value)}
                placeholder="Cari dalam library artifact..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* List of artifacts */}
            <div className="space-y-2">
              {filteredArtifacts.length > 0 ? (
                filteredArtifacts.map((item, idx) => {
                  const isSelected = activeArtifact?.id === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        onSelectArtifact(item.id);
                        setActiveTab('preview');
                      }}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer group flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-emerald-500/10 border-emerald-500/40 shadow-md'
                          : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-800/60 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`h-8 w-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                          isSelected 
                            ? 'bg-emerald-500 text-black shadow-sm' 
                            : 'bg-slate-800 text-slate-300 group-hover:text-white border border-slate-700'
                        }`}>
                          {item.primaryTicker ? item.primaryTicker.slice(0, 2) : `#${idx + 1}`}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-white truncate">
                              {item.query}
                            </span>
                            {isSelected && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                                Aktif
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                            <span>{item.timestamp}</span>
                            <span>•</span>
                            <span className="text-emerald-400 font-mono font-medium">
                              {item.primaryTicker || 'Market'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all shrink-0" />
                    </div>
                  );
                })
              ) : (
                <div className="py-12 text-center text-xs text-slate-500">
                  Tidak ada artifact yang cocok dengan pencarian.
                </div>
              )}
            </div>
          </div>
        )}

      </div>

    </aside>
  );
};
