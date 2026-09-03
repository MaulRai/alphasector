'use client';

import React, { useState } from 'react';
import { AgentQueryResponse } from '@/lib/types';
import { X, Printer, Copy, Check, FileText, ShieldAlert } from 'lucide-react';

interface ResearchDossierModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: AgentQueryResponse;
}

export const ResearchDossierModal: React.FC<ResearchDossierModalProps> = ({
  isOpen,
  onClose,
  report,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !report) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyMarkdown = () => {
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
${report.synthesis.key_findings.map(f => `- ${f}`).join('\n')}

## Valuation Verdict
${report.synthesis.valuation_verdict || 'N/A'}

## Smart Money Flow
${report.synthesis.smart_money_flow || 'N/A'}

## Key Catalysts
${report.synthesis.catalysts.map(c => `- ${c}`).join('\n')}

## Key Risks
${report.synthesis.risks.map(r => `- ${r}`).join('\n')}

---
${report.synthesis.disclaimer}
`;
    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="rounded-2xl border border-slate-800 bg-[#0a0d16] w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                AlphaSector Equity Research Brief
              </h3>
              <p className="text-xs text-slate-400">
                Institutional investment intelligence memorandum
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyMarkdown}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-all border border-slate-700"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Salin MD</span>
                </>
              )}
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-xs font-bold text-black transition-all"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Cetak / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-1"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 text-sm" id="printable-dossier">
          
          {/* Metadata Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white">Query:</span>
              <span className="text-slate-300 font-mono italic">"{report.query}"</span>
            </div>
            <div className="flex items-center gap-3">
              <span>Intent: <strong className="text-cyan-400">{report.intent}</strong></span>
              <span>Credits: <strong className="text-emerald-400">{report.credits_consumed}</strong></span>
            </div>
          </div>

          {/* Executive Summary */}
          <div>
            <h4 className="font-bold text-white text-base mb-2">Executive Summary</h4>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-300">
              {report.synthesis.executive_summary}
            </div>
          </div>

          {/* Key Findings */}
          <div>
            <h4 className="font-bold text-white text-base mb-2">Key Findings & Metrics</h4>
            <ul className="space-y-1.5 list-disc list-inside text-slate-300">
              {report.synthesis.key_findings.map((k, i) => (
                <li key={i}>{k}</li>
              ))}
            </ul>
          </div>

          {/* Valuation & Smart Money */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <h5 className="font-bold text-cyan-400 text-xs uppercase mb-1.5">Valuation Verdict</h5>
              <p className="text-xs text-slate-300">{report.synthesis.valuation_verdict || 'N/A'}</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <h5 className="font-bold text-amber-400 text-xs uppercase mb-1.5">Smart Money Pulse</h5>
              <p className="text-xs text-slate-300">{report.synthesis.smart_money_flow || 'N/A'}</p>
            </div>
          </div>

          {/* Catalysts & Risks */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <h5 className="font-bold text-emerald-400 text-xs uppercase mb-2">Growth Catalysts</h5>
              <ul className="space-y-1 text-xs list-disc list-inside text-slate-300">
                {report.synthesis.catalysts.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>
            <div>
              <h5 className="font-bold text-red-400 text-xs uppercase mb-2">Key Risk Factors</h5>
              <ul className="space-y-1 text-xs list-disc list-inside text-slate-300">
                {report.synthesis.risks.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300 flex items-start gap-2.5">
            <ShieldAlert className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
            <p>{report.synthesis.disclaimer}</p>
          </div>

        </div>

      </div>
    </div>
  );
};
