'use client';

import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { CompanyLogo } from '@/components/CompanyLogo';
import { Users, FileText, CheckCircle2, TrendingUp, ShieldCheck, Landmark, Lock, ExternalLink } from 'lucide-react';

export const Scene4SmartMoney: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Morph typography (frames 0 - 130)
  const morphOut = interpolate(frame, [120, 140], [1, 0], { extrapolateRight: 'clamp' });

  // Phase 2: Bandarmology Cards (frames 135 - 340)
  const bandarSpring = spring({ frame: frame - 135, fps, config: { damping: 12, mass: 0.5 } });

  // Phase 3: Insider Filings Card (frames 330 - 600)
  const insiderSpring = spring({ frame: frame - 330, fps, config: { damping: 12, mass: 0.6 } });

  return (
    <div className="relative w-full h-full bg-[#07090e] flex items-center justify-center overflow-hidden font-sans select-none text-slate-100">
      {/* Background ambient glow */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />

      {/* PHASE 1: UI-as-Typography Morph ("Follow institutional footprints with [🐋 Smart Money 2.0]") */}
      {frame < 145 && (
        <div 
          className="flex items-center gap-4 text-5xl font-black tracking-tight"
          style={{ opacity: morphOut, transform: `scale(${interpolate(frame, [0, 120], [0.95, 1.05])})` }}
        >
          <span className="text-white">Follow institutional footprints with</span>

          <div className="px-6 py-2 rounded-2xl bg-amber-500 text-slate-950 flex items-center gap-2.5 shadow-xl shadow-amber-500/25 border border-amber-400">
            <span className="text-2xl">🐋</span>
            <span className="font-extrabold text-3xl tracking-tight text-slate-950">Smart Money 2.0</span>
          </div>
        </div>
      )}

      {/* PHASE 2: Bandarmology & Foreign Flow (frames 135 - 350) */}
      {frame >= 135 && frame < 350 && (
        <div 
          className="w-[920px] p-6 rounded-2xl bg-[#0d121e]/90 border border-slate-800 shadow-2xl glass-panel flex flex-col gap-5"
          style={{ transform: `scale(${bandarSpring})` }}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <CompanyLogo symbol="TLKM" size="md" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-base">TLKM — Telkom Indonesia</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                    High Institutional Flow
                  </span>
                </div>
                <p className="text-xs text-slate-400">Pillar 1: Bandarmology & Broker Flow Concentration</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-400">Net Foreign Flow</div>
              <div className="text-lg font-bold text-emerald-400 font-mono">+Rp 245.8 Miliar</div>
            </div>
          </div>

          {/* Metrics Row */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-900/80 border border-amber-500/30">
              <div className="text-xs text-slate-400 font-medium">Konsentrasi Top 5 Buyer</div>
              <div className="text-3xl font-black text-amber-400 mt-1 font-mono">76.4%</div>
              <div className="text-[10px] text-amber-300/80 mt-1 font-bold">Akumulasi Masif Terdeteksi</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="text-xs text-slate-400 font-medium">Top Accumulator Broker</div>
              <div className="text-lg font-bold text-white mt-1">YP, CC, KZ</div>
              <div className="text-[10px] text-slate-400 mt-1">Gross Buy: Rp 310.2B</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="text-xs text-slate-400 font-medium">Top Distributer Broker</div>
              <div className="text-lg font-bold text-slate-300 mt-1">PD, NI, XC</div>
              <div className="text-[10px] text-slate-400 mt-1">Gross Sell: Rp 124.5B</div>
            </div>
          </div>
        </div>
      )}

      {/* PHASE 3: Pillar 2: Insider Filings with Official BEI PDFs (frames 330 - 600) */}
      {frame >= 330 && (
        <div 
          className="w-[960px] p-6 rounded-2xl bg-[#0d121e]/95 border border-amber-500/30 shadow-2xl glass-panel flex flex-col gap-4"
          style={{ transform: `scale(${insiderSpring})` }}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Pillar 2: Insider Filings (Direksi & Komisaris)</h3>
                <p className="text-xs text-slate-400">Verifikasi keterbukaan informasi kepemilikan saham dari dokumen resmi BEI</p>
              </div>
            </div>
            <div className="px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Official IDX Disclosure</span>
            </div>
          </div>

          {/* Insider Rows */}
          <div className="space-y-2.5">
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                  INSIDER BUY
                </span>
                <div>
                  <div className="font-bold text-white text-sm">Direktur Utama (Ririek Adriansyah)</div>
                  <div className="text-xs text-slate-400">Pembelian Saham Langsung • 1.500.000 Lembar @ Rp 2.850</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right font-mono text-xs">
                  <div className="font-bold text-white">Rp 4.275.000.000</div>
                  <div className="text-slate-400 text-[10px]">Tgl Transaksi: 24 Sep 2026</div>
                </div>
                <div className="p-2 rounded-lg bg-slate-800 text-cyan-300 border border-slate-700 hover:bg-slate-700 flex items-center gap-1 text-xs font-semibold cursor-pointer">
                  <FileText className="w-3.5 h-3.5" />
                  <span>Surat BEI (PDF)</span>
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                  INSIDER BUY
                </span>
                <div>
                  <div className="font-bold text-white text-sm">Komisaris Independen</div>
                  <div className="text-xs text-slate-400">Pembelian Saham Langsung • 500.000 Lembar @ Rp 2.840</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right font-mono text-xs">
                  <div className="font-bold text-white">Rp 1.420.000.000</div>
                  <div className="text-slate-400 text-[10px]">Tgl Transaksi: 23 Sep 2026</div>
                </div>
                <div className="p-2 rounded-lg bg-slate-800 text-cyan-300 border border-slate-700 hover:bg-slate-700 flex items-center gap-1 text-xs font-semibold cursor-pointer">
                  <FileText className="w-3.5 h-3.5" />
                  <span>Surat BEI (PDF)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
