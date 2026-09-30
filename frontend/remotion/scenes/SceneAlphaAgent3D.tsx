'use client';

import React from 'react';
import { interpolate, useCurrentFrame, useVideoConfig, Img, staticFile, Easing } from 'remotion';

export const SceneAlphaAgent3D: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // Dynamic Camera Motion (Slow cinematic easing)
  const rotateX = interpolate(frame, [0, durationInFrames], [15, 11], {
    easing: Easing.inOut(Easing.quad),
  });

  const rotateY = interpolate(frame, [0, durationInFrames], [-24, -18], {
    easing: Easing.inOut(Easing.quad),
  });

  const rotateZ = interpolate(frame, [0, durationInFrames], [3, 1.5], {
    easing: Easing.inOut(Easing.quad),
  });

  const scale = interpolate(frame, [0, durationInFrames], [0.98, 1.04], {
    easing: Easing.inOut(Easing.quad),
  });

  // Smooth vertical glide from top of chat to bottom
  // 1260px container width -> 1440x1528 image rendered height is ~1337px
  // Window height is 720px, so travel distance is ~600px
  const travelDistance = 600;
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
      {/* Background High-Tech Atmospheric Glow */}
      <div className="absolute -top-24 left-1/4 w-[650px] h-[650px] bg-emerald-500/12 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-24 right-1/4 w-[650px] h-[650px] bg-teal-500/10 rounded-full blur-[150px] pointer-events-none" />

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
        {/* 3D Angled Window (Side POV) */}
        <div
          style={{
            transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg) scale(${scale})`,
            transformStyle: 'preserve-3d',
            boxShadow: `
              0 30px 90px -15px rgba(0, 0, 0, 0.95),
              0 0 50px -10px rgba(16, 185, 129, 0.2),
              inset 0 1px 1px rgba(255, 255, 255, 0.15)
            `,
          }}
          className="w-[1260px] h-[720px] rounded-2xl border border-emerald-500/30 overflow-hidden relative bg-[#07090e]"
        >
          {/* Top Window Accent Bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500/80 via-teal-400/80 to-emerald-500/20 z-20" />

          {/* Scrolling Screenshot Content */}
          <div
            style={{
              transform: `translateY(${translateY}px)`,
              willChange: 'transform',
            }}
            className="w-full relative"
          >
            <Img
              src={staticFile('alpha_agent_full_chat.png')}
              className="w-full h-auto block select-none pointer-events-none"
              alt="AlphaAgent Full Chat"
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
