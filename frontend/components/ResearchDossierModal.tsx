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
# 📑 ALPHASECTOR EQUITY RESEARCH BRIEF

**Query:** ${report.query}
**Intent:** ${report.intent}
**Target:** ${report.primary_ticker || 'Market-Wide'}
**Tanggal:** ${new Date().toLocaleDateString('id-ID')}

---

## 📌 Executive Summary
${report.synthesis.executive_summary}

## 📊 Key Findings
${report.synthesis.key_findings.map(f => `- ${f}`).join('\n')}

## ⚖️ Valuation Verdict
${report.synthesis.valuation_verdict || 'N/A'}

## 🏛️ Smart Money Flow
${report.synthesis.smart_money_flow || 'N/A'}

## 🚀 Key Catalysts
${report.synthesis.catalysts.map(c => `- ${c}`).join('\n')}

## ⚠️ Key Risks
${report.synthesis.risks.map(r => `- ${r}`).join('\n')}

---
${report.synthesis.disclaimer}
`;
    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[90vh] rounded-2xl border border-slate-700 bg-[#0d121e] shadow-2xl overflow-hidden flex flex-col glow-emerald">
        
        {/* Header Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-emerald-400" />
            <h3 className="font-bold text-white text-base">
              Executive Research Dossier
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyMarkdown}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy MD'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-semibold transition-all"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Printable Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-200 text-sm leading-relaxed" id="printable-dossier">
          
          {/* Header metadata */}
          <div className="pb-4 border-b border-slate-800">
            <div className="text-xs text-emerald-400 font-bold uppercase tracking-wider">
              AlphaSector Autonomous Research
            </div>
            <h1 className="text-xl font-bold text-white mt-1">
              {report.query}
            </h1>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-400 font-mono">
              <span>Target: <strong className="text-slate-200">{report.primary_ticker || 'Market-Wide'}</strong></span>
              <span>•</span>
              <span>Execution: <strong className="text-slate-200">{report.total_execution_time_ms}ms</strong></span>
              <span>•</span>
              <span>Credits: <strong className="text-emerald-400">{report.credits_consumed}</strong></span>
            </div>
          </div>

          {/* Executive Summary */}
          <div>
            <h4 className="font-bold text-white text-base mb-2">📌 Executive Summary</h4>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-300">
              {report.synthesis.executive_summary}
            </div>
          </div>

          {/* Key Findings */}
          <div>
            <h4 className="font-bold text-white text-base mb-2">📊 Key Findings & Metrics</h4>
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
              <h5 className="font-bold text-emerald-400 text-xs uppercase mb-2">🚀 Growth Catalysts</h5>
              <ul className="space-y-1 text-xs list-disc list-inside text-slate-300">
                {report.synthesis.catalysts.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>
            <div>
              <h5 className="font-bold text-red-400 text-xs uppercase mb-2">⚠️ Key Risk Factors</h5>
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
