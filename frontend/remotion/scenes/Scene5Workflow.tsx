'use client';

import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { Copy, Check, Sparkles, FileText, ArrowRight, ExternalLink } from 'lucide-react';

export const Scene5Workflow: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Phase 1: Context Clipboard (frames 0 - 180)
  const isCopied = frame >= 60;
  const isPasted = frame >= 100;
  const clipSpring = spring({ frame, fps, config: { damping: 12, mass: 0.5 } });
  const clipOut = interpolate(frame, [160, 180], [1, 0], { extrapolateRight: 'clamp' });

  // Phase 2: Notion Sync (frames 180 - 360)
  const isNotionSynced = frame >= 240;
  const notionSpring = spring({ frame: frame - 180, fps, config: { damping: 12, mass: 0.6 } });

  return (
    <div className="relative w-full h-full bg-[#07090e] flex items-center justify-center overflow-hidden font-sans select-none text-slate-100">
      {/* Background ambient lighting */}
      <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />

      {/* PHASE 1: Seamless Context Clipboard (frames 0 - 180) */}
      {frame < 185 && (
        <div 
          className="w-[880px] flex flex-col items-center gap-6"
          style={{ transform: `scale(${clipSpring})`, opacity: clipOut }}
        >
          <div className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <span>Seamless Cross-Module Context Injection</span>
            <span className="text-xs px-2.5 py-1 rounded bg-cyan-500/20 text-cyan-300 font-mono font-bold">
              0-Friction
            </span>
          </div>

          {/* Action Trigger Card */}
          <div className="w-full p-5 rounded-2xl bg-[#0d121e]/90 border border-slate-800 shadow-2xl glass-panel flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xl">📋</span>
              <div>
                <div className="font-bold text-white text-sm">Forensic Context: Insider Accumulation (TLKM)</div>
                <div className="text-xs text-slate-400">Direksi & Komisaris akumulasi 2.000.000 lembar saham</div>
              </div>
            </div>

            <button 
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                isCopied 
                  ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/30' 
                  : 'bg-cyan-500 text-slate-950'
              }`}
            >
              {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{isCopied ? 'Konteks Berhasil Disalin!' : 'Salin Konteks'}</span>
            </button>
          </div>

          {/* Chat Bar with Pasted Chip */}
          {isPasted && (
            <div className="w-full p-4 rounded-2xl bg-slate-900 border border-cyan-500/40 shadow-xl flex items-center justify-between animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 text-xs font-bold flex items-center gap-1.5 border border-cyan-500/30">
                  <span>📎 Pasted Context: Insider Accumulation (TLKM)</span>
                </span>
                <span className="text-xs text-slate-400 font-mono">Tanyakan analisis emiten ke AlphaAgent...</span>
              </div>
              <div className="p-2 rounded-lg bg-emerald-500 text-slate-950 font-bold">
                <Sparkles className="w-4 h-4" />
              </div>
            </div>
          )}
        </div>
      )}

      {/* PHASE 2: 1-Click Institutional Notion Sync (frames 180 - 360) */}
      {frame >= 180 && (
        <div 
          className="w-[960px] p-6 rounded-2xl bg-[#0d121e]/95 border border-slate-800 shadow-2xl glass-panel flex flex-col gap-5"
          style={{ transform: `scale(${notionSpring})` }}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white text-slate-950 flex items-center justify-center font-serif font-black text-lg">
                N
              </div>
              <div>
                <h3 className="text-base font-bold text-white">1-Click Notion Workspace Sync</h3>
                <p className="text-xs text-slate-400">Ekspor instan seluruh sintesis riset menjadi memo investasi Wall Street</p>
              </div>
            </div>
            <div className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20">
              <Check className="w-4 h-4" />
              <span>Synced to Notion</span>
            </div>
          </div>

          {/* Notion Page Preview Card */}
          <div className="p-5 rounded-xl bg-[#191919] border border-neutral-700 text-neutral-200 font-sans space-y-3 shadow-inner">
            <div className="text-xl font-bold text-white flex items-center gap-2 font-serif">
              <span>📄</span>
              <span>INVESTMENT MEMORANDUM: BBCA — Q3 2026 VALUATION DOSSIER</span>
            </div>
            <div className="p-3 rounded-lg bg-neutral-800 border-l-4 border-emerald-500 text-xs text-neutral-300 leading-relaxed">
              <strong>Executive Summary:</strong> BBCA mencatatkan efisiensi modal terdepan dengan ROE 21.5% dan NIM 5.8%. Skor Piotroski 7/9 mengonfirmasi kekuatan neraca prima di tengah volatilitas makroekonomi...
            </div>
            <div className="grid grid-cols-4 gap-2 text-center text-xs font-mono pt-1">
              <div className="p-2 rounded bg-neutral-800">P/E: 18.4x</div>
              <div className="p-2 rounded bg-neutral-800">PBV: 4.2x</div>
              <div className="p-2 rounded bg-neutral-800 text-emerald-400">Piotroski: 7/9</div>
              <div className="p-2 rounded bg-neutral-800 text-cyan-400">Smart Money: Accumulation</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
