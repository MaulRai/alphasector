'use client';

import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { CompanyLogo } from '@/components/CompanyLogo';
import { Filter, Layers, ShieldCheck, Activity, Swords, ArrowRight, Zap, Check } from 'lucide-react';

export const Scene3ScreenerBattle: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Morph typography (frames 0 - 140)
  const morphOut = interpolate(frame, [125, 145], [1, 0], { extrapolateRight: 'clamp' });

  // Screener Table Animation (frames 140 - 300)
  const screenerSpring = spring({ frame: frame - 140, fps, config: { damping: 12, mass: 0.5 } });

  // Battle Dock & Showdown (frames 300 - 600)
  const battleSpring = spring({ frame: frame - 310, fps, config: { damping: 12, mass: 0.6 } });

  return (
    <div className="relative w-full h-full bg-[#07090e] flex items-center justify-center overflow-hidden font-sans select-none text-slate-100">
      {/* Background ambient lighting */}
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />

      {/* PHASE 1: UI-as-Typography Morph ("Scan all 900+ stocks in [⚡ 300ms] via Screener Pro") */}
      {frame < 150 && (
        <div 
          className="flex items-center gap-4 text-5xl font-black tracking-tight"
          style={{ opacity: morphOut, transform: `scale(${interpolate(frame, [0, 130], [0.95, 1.05])})` }}
        >
          <span className="text-white">Scan all 900+ stocks in</span>

          <div className="px-5 py-2 rounded-2xl bg-amber-500 text-slate-950 flex items-center gap-2.5 shadow-xl shadow-amber-500/20 border border-amber-400">
            <Zap className="w-7 h-7 fill-slate-950" />
            <span className="font-extrabold text-3xl tracking-tight text-slate-950">300ms</span>
          </div>

          <span className="text-amber-400">
            via Screener Pro.
          </span>
        </div>
      )}

      {/* PHASE 2: Screener Preset & Results (frames 140 - 320) */}
      {frame >= 140 && frame < 320 && (
        <div 
          className="w-[960px] p-6 rounded-2xl bg-[#0d121e]/90 border border-slate-800 shadow-2xl glass-panel flex flex-col gap-4"
          style={{ transform: `scale(${screenerSpring})` }}
        >
          {/* Preset Pills */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-slate-300">Preset Kriteria Institusional:</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-lg text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                ✓ Undervalued Dividend Aristocrats
              </span>
              <span className="px-3 py-1 rounded-lg text-xs font-medium bg-slate-900 text-slate-400 border border-slate-800">
                High ROE Mid-Caps
              </span>
            </div>
          </div>

          {/* Candidate Table Snippet */}
          <div className="space-y-2 text-xs">
            {[
              { sym: 'BBCA', name: 'Bank Central Asia', pe: '18.4x', roe: '21.5%', div: '3.2%' },
              { sym: 'BBRI', name: 'Bank Rakyat Indonesia', pe: '11.4x', roe: '19.4%', div: '6.4%' },
              { sym: 'BMRI', name: 'Bank Mandiri', pe: '10.2x', roe: '18.8%', div: '5.8%' },
              { sym: 'BBNI', name: 'Bank Negara Indonesia', pe: '9.1x', roe: '15.2%', div: '5.1%' },
            ].map((stock) => (
              <div key={stock.sym} className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CompanyLogo symbol={stock.sym} size="sm" />
                  <div>
                    <span className="font-bold text-white text-sm">{stock.sym}</span>
                    <span className="text-slate-400 ml-2 text-xs">{stock.name}</span>
                  </div>
                </div>
                <div className="flex items-center gap-6 font-mono text-slate-300">
                  <span>P/E: <strong>{stock.pe}</strong></span>
                  <span>ROE: <strong>{stock.roe}</strong></span>
                  <span>Div: <strong className="text-emerald-400">{stock.div}</strong></span>
                  <span className="px-2.5 py-1 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30 font-sans font-bold text-[10px]">
                    Docked
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PHASE 3: Peer Battle Head-to-Head Showdown (frames 310 - 600) */}
      {frame >= 310 && (
        <div 
          className="w-[1000px] p-6 rounded-2xl bg-[#0d121e]/95 border border-cyan-500/30 shadow-2xl glass-panel flex flex-col gap-5"
          style={{ transform: `scale(${battleSpring})` }}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Swords className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Peer Battle: The Big 4 Banks Showdown</h3>
                <p className="text-xs text-slate-400">Head-to-head multi-dimensional accounting & valuation analysis</p>
              </div>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
              Deterministic Math Engine
            </div>
          </div>

          {/* Cards Grid: Piotroski Score & Historical Valuation Band */}
          <div className="grid grid-cols-2 gap-4">
            {/* Piotroski Card */}
            <div className="p-4 rounded-xl bg-[#090f1d] border border-slate-800 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-200">Piotroski F-Score</div>
                  <div className="text-xs text-slate-400 mt-0.5">Stanford 9-Criteria Model</div>
                  <div className="text-[11px] text-emerald-400 mt-1 font-bold">Kesehatan Fundamental Prima</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-black text-white font-mono">
                  7<span className="text-sm text-slate-500">/9</span>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  PRIMA
                </span>
              </div>
            </div>

            {/* Historical PE Band Card */}
            <div className="p-4 rounded-xl bg-[#090f1d] border border-slate-800 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                  <Activity className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-200">Historical P/E SD Band</div>
                  <div className="text-xs text-slate-400 mt-0.5">3-Year Standard Deviation</div>
                  <div className="text-[11px] text-cyan-400 mt-1 font-bold">Valuation Discount (-18.4%)</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-black text-white font-mono">
                  -1.5 <span className="text-xs text-slate-500">SD</span>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  UNDERVALUED
                </span>
              </div>
            </div>
          </div>

          {/* 1-Click Agent Follow-up Banner */}
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-500/10 via-slate-900 to-teal-500/10 border border-emerald-500/30 flex items-center justify-between">
            <span className="text-xs text-slate-300">
              Lanjutkan temuan perbandingan ke ruang riset AlphaAgent dengan satu klik:
            </span>
            <div className="px-4 py-1.5 rounded-lg bg-emerald-500 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-500/20">
              <span>Lanjutkan di AlphaAgent</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
