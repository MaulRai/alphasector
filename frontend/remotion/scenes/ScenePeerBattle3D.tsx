'use client';

import React from 'react';
import { interpolate, useCurrentFrame, useVideoConfig, Img, staticFile, Easing } from 'remotion';

export const ScenePeerBattle3D: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // Dynamic Camera Motion (Flipped for Left-Angle POV)
  const rotateX = interpolate(frame, [0, durationInFrames], [12, 8], {
    easing: Easing.inOut(Easing.quad),
  });

  // Flipped rotateY: Positive values for POV viewed from the left
  const rotateY = interpolate(frame, [0, durationInFrames], [17, 13], {
    easing: Easing.inOut(Easing.quad),
  });

  // Flipped rotateZ to match left tilt perspective
  const rotateZ = interpolate(frame, [0, durationInFrames], [-1.8, -0.6], {
    easing: Easing.inOut(Easing.quad),
  });

  // Zoomed in comfortably without overflowing screen boundaries
  const scale = interpolate(frame, [0, durationInFrames], [1.08, 1.13], {
    easing: Easing.inOut(Easing.quad),
  });

  // Shift card rightwards to balance left perspective projection
  const translateX = interpolate(frame, [0, durationInFrames], [330, 300], {
    easing: Easing.inOut(Easing.quad),
  });

  // Vertical container offset to prevent top clipping
  const containerY = 15;

  // Gentle descent: keeps the Peer Battle Matrix (BBCA, BBRI, BMRI, BBNI) 
  // and the AI Synthesis verdict heroically together in view at the end
  const travelDistance = 120;
  const translateY = interpolate(
    frame, 
    [20, durationInFrames - 30], 
    [0, -travelDistance], 
    {
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );

  // Sheen light reflection moving across the glass surface
  const sheenX = interpolate(frame, [0, durationInFrames], [-100, 200]);

  return (
    <div className="relative w-full h-full bg-[#05070c] flex items-center justify-center overflow-hidden font-sans select-none text-slate-100">
      {/* Background High-Tech Atmospheric Glow (Violet + Cyan for Peer Battle) */}
      <div className="absolute -top-24 right-1/4 w-[650px] h-[650px] bg-violet-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-24 left-1/4 w-[650px] h-[650px] bg-cyan-500/12 rounded-full blur-[150px] pointer-events-none" />

      {/* Grid line backdrop */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* 3D Perspective Stage */}
      <div
        className="relative flex items-center justify-center"
        style={{
          perspective: '1350px',
          perspectiveOrigin: '50% 45%',
        }}
      >
        {/* 3D Angled Window (Left POV) */}
        <div
          style={{
            transform: `translateX(${translateX}px) translateY(${containerY}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg) scale(${scale})`,
            transformStyle: 'preserve-3d',
            boxShadow: `
              0 30px 90px -15px rgba(0, 0, 0, 0.95),
              0 0 50px -10px rgba(139, 92, 246, 0.2),
              inset 0 1px 1px rgba(255, 255, 255, 0.15)
            `,
          }}
          className="w-[1240px] h-[720px] rounded-2xl border border-violet-500/30 overflow-hidden relative bg-[#07090e]"
        >
          {/* Top Window Accent Bar (Violet to Cyan gradient) */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500/80 via-cyan-400/80 to-emerald-500/30 z-20" />

          {/* Scrolling Screenshot Content */}
          <div
            style={{
              transform: `translateY(${translateY}px)`,
              willChange: 'transform',
            }}
            className="w-full relative"
          >
            <Img
              src={staticFile('peer_battle_full.png')}
              className="w-full h-auto block select-none pointer-events-none"
              alt="Peer Battle Full Terminal"
            />
          </div>

          {/* Dynamic Glass Sheen Reflection */}
          <div 
            className="absolute inset-0 pointer-events-none z-10 opacity-40"
            style={{
              background: `linear-gradient(115deg, transparent 30%, rgba(255, 255, 255, 0.12) ${sheenX}%, transparent ${sheenX + 25}%)`,
            }}
          />

          {/* Subtle vignette around edges */}
          <div className="absolute inset-0 pointer-events-none z-10 shadow-[inset_0_0_80px_rgba(0,0,0,0.5)]" />
        </div>
      </div>
    </div>
  );
};
