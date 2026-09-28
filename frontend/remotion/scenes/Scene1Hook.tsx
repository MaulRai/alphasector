'use client';

import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { AlertTriangle, FileText, Search, FileX } from 'lucide-react';

export const Scene1Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Phase 1: Messy PDF (0 - 100 frames / ~0 - 1.6s)
  const pdfScale = interpolate(frame, [0, 90], [1, 1.15], { extrapolateRight: 'clamp' });
  const pdfOpacity = interpolate(frame, [85, 100], [1, 0], { extrapolateRight: 'clamp' });

  // Phase 2: Kinetic text 1: "900+ IDX STOCKS" (100 - 160 frames / ~1.6 - 2.6s)
  const text1Spring = spring({ frame: frame - 100, fps, config: { damping: 10, mass: 0.5 } });
  const text1Opacity = interpolate(frame, [98, 105, 155, 165], [0, 1, 1, 0], { extrapolateRight: 'clamp' });

  // Phase 3: Kinetic text 2: "HUNDREDS OF PDF FILINGS" (165 - 230 frames / ~2.7 - 3.8s)
  const text2Spring = spring({ frame: frame - 165, fps, config: { damping: 10, mass: 0.5 } });
  const text2Opacity = interpolate(frame, [163, 170, 220, 230], [0, 1, 1, 0], { extrapolateRight: 'clamp' });

  // Phase 4: Punch climax: "STOP MANUAL RESEARCH." (230 - 360 frames / ~3.8 - 6.0s)
  const text3Spring = spring({ frame: frame - 235, fps, config: { damping: 8, mass: 0.4 } });
  const text3Glow = interpolate(frame, [235, 270, 360], [0, 40, 20]);

  return (
    <div className="relative w-full h-full bg-[#05070c] flex items-center justify-center overflow-hidden font-sans select-none">
      {/* Background ambient grid */}
      <div 
        className="absolute inset-0 opacity-15"
        style={{
          backgroundImage: 'radial-gradient(circle at 50% 50%, #1e293b 1px, transparent 1px)',
          backgroundSize: '36px 36px',
        }}
      />

      {/* PHASE 1: Messy PDF Footnote Chaos */}
      {frame < 105 && (
        <div 
          className="absolute inset-0 flex items-center justify-center p-12"
          style={{
            transform: `scale(${pdfScale})`,
            opacity: pdfOpacity,
          }}
        >
          <div className="w-[820px] bg-slate-100 text-slate-800 rounded-xl p-8 shadow-2xl border border-slate-300 relative font-serif">
            <div className="flex items-center justify-between pb-4 border-b border-slate-300 mb-4">
              <div className="flex items-center gap-2 text-xs font-sans font-bold text-slate-600">
                <FileText className="w-4 h-4 text-red-600" />
                <span>LAPORAN KEUANGAN KONSOLIDASIAN (AUDITED) — HALAMAN 184 DARI 348</span>
              </div>
              <span className="text-xs px-2 py-0.5 rounded bg-red-100 text-red-700 font-sans font-bold">
                Dense Filing
              </span>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-slate-700">
              <p className="font-bold">Catatan 24: Liabilitas Kontinjensi dan Instrumen Derivatif Tertanam</p>
              <p className="blur-[0.5px]">
                Grup memiliki eksposur terhadap fluktuasi nilai tukar dan suku bunga pinjaman sindikasi subordinasi sebesar Rp 14.280.920.000.000 dengan klausul restrukturisasi berjenjang mengacu pada SAK 71 paragraf 4.2...
              </p>
              <div className="grid grid-cols-4 gap-2 pt-2 font-mono text-[10px]">
                <div className="p-2 bg-slate-200 rounded">EBITDA: N/A</div>
                <div className="p-2 bg-red-100 text-red-700 font-bold rounded flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> #REF! ERROR
                </div>
                <div className="p-2 bg-slate-200 rounded">ROIC: Uncalc</div>
                <div className="p-2 bg-red-100 text-red-700 font-bold rounded flex items-center gap-1">
                  <FileX className="w-3 h-3" /> Footnote 38
                </div>
              </div>
            </div>

            {/* Stamp */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-[-12deg] border-4 border-red-600 text-red-600 font-sans font-black text-4xl px-8 py-3 rounded-2xl tracking-widest uppercase opacity-85 shadow-lg">
              Manual Spreadsheet Fatigue
            </div>
          </div>
        </div>
      )}

      {/* PHASE 2: "900+ IDX STOCKS." */}
      {frame >= 98 && frame < 165 && (
        <div 
          className="absolute text-center"
          style={{
            transform: `scale(${text1Spring})`,
            opacity: text1Opacity,
          }}
        >
          <div className="text-7xl font-black text-white tracking-tighter uppercase drop-shadow-2xl">
            900+ Listed IDX Stocks.
          </div>
          <div className="text-xl font-medium text-slate-400 mt-3 tracking-wide">
            Endless PDFs • Complex Notes • Hours of Manual Math
          </div>
        </div>
      )}

      {/* PHASE 3: "HUNDREDS OF PDF FILINGS." */}
      {frame >= 163 && frame < 232 && (
        <div 
          className="absolute text-center"
          style={{
            transform: `scale(${text2Spring})`,
            opacity: text2Opacity,
          }}
        >
          <div className="text-7xl font-black text-rose-500 tracking-tighter uppercase drop-shadow-2xl">
            Hundreds of PDF Filings.
          </div>
          <div className="text-xl font-medium text-slate-400 mt-3 tracking-wide">
            Trapped in dense footnotes while the market moves
          </div>
        </div>
      )}

      {/* PHASE 4: "STOP MANUAL RESEARCH." */}
      {frame >= 232 && (
        <div 
          className="absolute text-center flex flex-col items-center"
          style={{
            transform: `scale(${text3Spring})`,
          }}
        >
          <div className="text-xs font-bold text-emerald-400 tracking-widest uppercase mb-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            The Autonomous Upgrade
          </div>
          <div 
            className="text-8xl font-black text-white tracking-tight uppercase"
            style={{
              textShadow: `0 0 ${text3Glow}px rgba(16, 185, 129, 0.8)`,
            }}
          >
            Stop Manual Research<span className="text-emerald-400">.</span>
          </div>
          <div className="text-2xl font-semibold text-slate-300 mt-4 tracking-normal">
            Meet the first autonomous equity research terminal for the IDX.
          </div>
        </div>
      )}
    </div>
  );
};
