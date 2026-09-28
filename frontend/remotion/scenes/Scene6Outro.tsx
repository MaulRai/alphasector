'use client';

import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { AlphaAgentLogo } from '@/components/AlphaAgentLogo';
import { ShieldCheck, Sparkles } from 'lucide-react';

export const Scene6Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Word pulsing indices (frames 0 - 160)
  const pulseIndex = Math.floor(frame / 40);
  const words = ['AUTONOMOUS.', 'DETERMINISTIC.', 'INSTITUTIONAL.', 'ZERO AUTOMATED TRADING.'];

  // Final Logo Lockup (frames 160 - 360)
  const logoSpring = spring({ frame: frame - 160, fps, config: { damping: 10, mass: 0.5 } });
  const logoGlow = interpolate(frame, [160, 220, 360], [0, 40, 25]);
  const textFadeIn = interpolate(frame, [190, 220], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <div className="relative w-full h-full bg-[#05070c] flex items-center justify-center overflow-hidden font-sans select-none text-slate-100">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[160px] pointer-events-none" />

      {/* PHASE 1: Word Pulsing on Beat (frames 0 - 160) */}
      {frame < 165 && pulseIndex < words.length && (
        <div className="text-center">
          <div 
            key={pulseIndex} 
            className="text-7xl font-black text-white tracking-tighter uppercase drop-shadow-2xl animate-in zoom-in-75 duration-150"
            style={{
              textShadow: '0 0 30px rgba(16, 185, 129, 0.6)',
            }}
          >
            {words[pulseIndex]}
          </div>
        </div>
      )}

      {/* PHASE 2: Brand Lockup & Call-To-Action (frames 160 - 360) */}
      {frame >= 160 && (
        <div 
          className="flex flex-col items-center text-center gap-6"
          style={{ transform: `scale(${logoSpring})` }}
        >
          {/* Logo Bloom */}
          <div 
            className="p-5 rounded-3xl bg-[#0d121e] border border-emerald-500/30 flex items-center justify-center shadow-2xl"
            style={{
              boxShadow: `0 0 ${logoGlow}px rgba(16, 185, 129, 0.4)`,
            }}
          >
            <AlphaAgentLogo size={64} glow={true} />
          </div>

          <div>
            <h1 className="text-5xl font-black text-white tracking-tight">
              AlphaSector
            </h1>
            <p className="text-lg font-medium text-emerald-400 mt-1 tracking-wide">
              Smarter Research. Sharper Decisions.
            </p>
          </div>

          {/* Badges & GitHub Link */}
          <div 
            className="flex flex-col items-center gap-3 pt-2"
            style={{ opacity: textFadeIn }}
          >
            <div className="flex items-center gap-3 text-xs font-bold">
              <span className="px-3 py-1 rounded-full bg-slate-900 text-slate-300 border border-slate-800">
                Sectors Hackathon 2026 • Track 01
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                Responsible FinTech Standard
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm text-slate-400 font-mono mt-1">
              <svg className="w-4 h-4 fill-current text-white" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              <span>github.com/MaulRai/sectors-hackathon</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
