'use client';

import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { AlphaAgentLogo } from '@/components/AlphaAgentLogo';
import { CompanyLogo } from '@/components/CompanyLogo';
import { Sparkles, ArrowRight, Zap, CheckCircle2, TrendingUp, ShieldCheck, Database } from 'lucide-react';

export const Scene2Agent: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Words flipping on beat (frames 0 - 140 / ~0 - 2.3s)
  const roleIndex = Math.floor(frame / 35) % 4;
  const roles = ['equity analyst', 'forensic auditor', 'quant strategist', 'autonomous copilot'];

  // Transition from Morph to Prompt (around frame 140)
  const morphOut = interpolate(frame, [130, 150], [1, 0], { extrapolateRight: 'clamp' });
  const promptIn = spring({ frame: frame - 140, fps, config: { damping: 12, mass: 0.5 } });

  // Speed-typing prompt (frames 150 - 270)
  const fullPrompt = 'Compare valuation and financial health of BBRI vs BMRI';
  const charCount = Math.floor(interpolate(frame, [160, 260], [0, fullPrompt.length], { extrapolateRight: 'clamp' }));
  const typedText = fullPrompt.slice(0, charCount);

  // Click send button at frame 270
  const isSendClicked = frame >= 270;
  const clickScale = frame >= 270 && frame < 285 ? 0.92 : 1;

  // Thinking trace badges pop in (frames 285 - 420)
  const badge1Spring = spring({ frame: frame - 285, fps, config: { damping: 10 } });
  const badge2Spring = spring({ frame: frame - 325, fps, config: { damping: 10 } });
  const badge3Spring = spring({ frame: frame - 365, fps, config: { damping: 10 } });

  // Resolution Peer Battle Matrix reveal (frame 420 - 600)
  const matrixSpring = spring({ frame: frame - 420, fps, config: { damping: 12, mass: 0.6 } });

  return (
    <div className="relative w-full h-full bg-[#07090e] flex items-center justify-center overflow-hidden font-sans select-none text-slate-100">
      {/* Background neon ambient */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* PHASE 1: UI-as-Typography Morph ("Meet your [⚡ AlphaAgent] analyst") */}
      {frame < 155 && (
        <div 
          className="flex items-center gap-4 text-5xl font-black tracking-tight"
          style={{ opacity: morphOut, transform: `scale(${interpolate(frame, [0, 140], [0.95, 1.05])})` }}
        >
          <span className="text-white">Meet your</span>

          {/* Morphing UI Pill */}
          <div className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 flex items-center gap-3 shadow-xl shadow-emerald-500/25 border border-emerald-400">
            <AlphaAgentLogo size={32} glow={false} />
            <span className="font-extrabold text-3xl tracking-tight text-slate-950">AlphaAgent</span>
          </div>

          <span className="text-emerald-400 min-w-[380px] text-left">
            {roles[roleIndex]}
          </span>
        </div>
      )}

      {/* PHASE 2: Speed-Ramped Prompt & Parallel Telemetry */}
      {frame >= 140 && frame < 430 && (
        <div 
          className="w-[840px] flex flex-col items-center gap-6"
          style={{ transform: `scale(${promptIn})` }}
        >
          {/* Prompt Bar Card */}
          <div className="w-full p-4 rounded-2xl bg-[#0d121e]/90 border border-slate-800 shadow-2xl glass-panel flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="text-xl font-medium text-white font-mono tracking-tight">
                {typedText}
                {frame < 270 && <span className="inline-block w-2.5 h-5 bg-emerald-400 ml-1 animate-pulse" />}
              </div>
            </div>

            <button 
              className={`p-3 rounded-xl transition-all font-bold flex items-center gap-2 ${
                isSendClicked 
                  ? 'bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-400/40' 
                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
              }`}
              style={{ transform: `scale(${clickScale})` }}
            >
              <Zap className="w-5 h-5 fill-slate-950" />
            </button>
          </div>

          {/* Parallel MCP Tool Telemetry Badges */}
          {frame >= 280 && (
            <div className="w-full space-y-2.5">
              <div 
                className="p-3 rounded-xl bg-slate-900/80 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold flex items-center justify-between shadow-md"
                style={{ transform: `scale(${badge1Spring})` }}
              >
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-cyan-400" />
                  <span>INTENT: PEER_BATTLE_COMPARISON</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-200">
                  Target: BBRI, BMRI
                </span>
              </div>

              {frame >= 320 && (
                <div 
                  className="p-3 rounded-xl bg-slate-900/80 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-bold flex items-center justify-between shadow-md"
                  style={{ transform: `scale(${badge2Spring})` }}
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>[Sectors MCP] fetch-company-report/BBRI</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-200">
                    320ms • 26 metrics
                  </span>
                </div>
              )}

              {frame >= 360 && (
                <div 
                  className="p-3 rounded-xl bg-slate-900/80 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-bold flex items-center justify-between shadow-md"
                  style={{ transform: `scale(${badge3Spring})` }}
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>[Sectors MCP] fetch-company-report/BMRI</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-200">
                    310ms • 26 metrics
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* PHASE 3: Peer Battle Matrix Resolution Reveal */}
      {frame >= 415 && (
        <div 
          className="w-[960px] p-6 rounded-2xl bg-[#0d121e]/95 border border-emerald-500/40 shadow-2xl glass-panel flex flex-col gap-5"
          style={{ transform: `scale(${matrixSpring})` }}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <span className="text-xs px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 font-bold uppercase tracking-wider">
                Grounded Institutional Battle Matrix
              </span>
              <span className="text-xs text-slate-400 font-mono">1.52s Latency • 0% Hallucination</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
              <span>Sectors MCP Verified</span>
            </div>
          </div>

          {/* Head-to-Head Table */}
          <div className="grid grid-cols-3 gap-4 text-center items-center">
            {/* Metric column */}
            <div className="text-left space-y-4 font-medium text-xs text-slate-400">
              <div className="h-10 flex items-center font-bold text-white text-sm">Competitor</div>
              <div className="h-10 flex items-center">Price-to-Earnings (P/E)</div>
              <div className="h-10 flex items-center">Price-to-Book (PBV)</div>
              <div className="h-10 flex items-center">Return on Equity (ROE)</div>
              <div className="h-10 flex items-center">Net Profit Margin</div>
            </div>

            {/* BBRI Card */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
              <div className="h-10 flex items-center justify-center gap-2">
                <CompanyLogo symbol="BBRI" size="sm" />
                <span className="font-bold text-white text-base">BBRI</span>
              </div>
              <div className="h-10 flex items-center justify-center text-sm font-bold text-slate-200">
                11.4x
              </div>
              <div className="h-10 flex items-center justify-center text-sm font-bold text-slate-200">
                2.1x
              </div>
              <div className="h-10 flex items-center justify-center text-sm font-bold text-emerald-400 bg-emerald-500/10 rounded-lg border border-emerald-500/30">
                19.4% (Best)
              </div>
              <div className="h-10 flex items-center justify-center text-sm font-bold text-slate-200">
                28.6%
              </div>
            </div>

            {/* BMRI Card */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
              <div className="h-10 flex items-center justify-center gap-2">
                <CompanyLogo symbol="BMRI" size="sm" />
                <span className="font-bold text-white text-base">BMRI</span>
              </div>
              <div className="h-10 flex items-center justify-center text-sm font-bold text-emerald-400 bg-emerald-500/10 rounded-lg border border-emerald-500/30">
                10.2x (Best)
              </div>
              <div className="h-10 flex items-center justify-center text-sm font-bold text-slate-200">
                2.3x
              </div>
              <div className="h-10 flex items-center justify-center text-sm font-bold text-slate-200">
                18.8%
              </div>
              <div className="h-10 flex items-center justify-center text-sm font-bold text-slate-200">
                29.1%
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
