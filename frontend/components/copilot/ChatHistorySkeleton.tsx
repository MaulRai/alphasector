'use client';

import React from 'react';
import { AlphaAgentLogo } from '@/components/AlphaAgentLogo';

export const ChatHistorySkeleton: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto w-full space-y-6 animate-in fade-in duration-300">
      {/* Simulated User Message Skeleton (Right Aligned) */}
      <div className="flex flex-col items-end w-full">
        <div className="p-4 rounded-2xl rounded-tr-none bg-emerald-950/30 border border-emerald-500/20 max-w-md w-72 sm:w-96 space-y-2">
          <div className="h-3.5 rounded-md shimmer-item opacity-80 w-3/4 ml-auto" />
          <div className="h-2.5 rounded shimmer-item opacity-50 w-1/2 ml-auto" />
        </div>
      </div>

      {/* Simulated Assistant Response Skeleton (Left Aligned) */}
      <div className="flex flex-col items-start w-full space-y-3">
        {/* Header with Agent Logo */}
        <div className="flex items-center gap-2 mb-1 text-[11px] text-slate-400">
          <div className="p-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
            <AlphaAgentLogo size={16} />
          </div>
          <span className="font-semibold text-emerald-400">AlphaAgent</span>
          <span className="text-[10px] text-slate-500">• Memuat riwayat riset...</span>
        </div>

        {/* Reasoning Trace Bar Skeleton */}
        <div className="w-full rounded-xl border border-slate-800/80 bg-[#090d16]/70 p-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded-md shimmer-item opacity-60" />
            <div className="h-3 w-28 rounded shimmer-item opacity-70" />
            <div className="h-2.5 w-16 rounded shimmer-item opacity-40" />
          </div>
          <div className="h-3 w-14 rounded shimmer-item opacity-40" />
        </div>

        {/* Main Content Card Skeleton */}
        <div className="w-full rounded-2xl border border-slate-800/80 bg-[#0d121e]/90 p-5 sm:p-6 space-y-5">
          {/* Card Title Skeleton */}
          <div className="flex items-center justify-between">
            <div className="space-y-1.5 flex-1">
              <div className="h-5 rounded-md shimmer-item opacity-80 w-64 max-w-full" />
              <div className="h-3 rounded shimmer-item opacity-50 w-96 max-w-full" />
            </div>
            <div className="h-6 w-24 rounded-full shimmer-item opacity-40 shrink-0" />
          </div>

          {/* 4 Metric Tiles Skeleton */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            {[...Array(4)].map((_, i) => (
              <div 
                key={i} 
                className="p-3.5 rounded-xl border border-slate-800/60 bg-[#0a0f1d] space-y-2"
              >
                <div className="h-2.5 rounded shimmer-item opacity-50 w-16" />
                <div className="h-5 rounded shimmer-item opacity-80 w-24" />
                <div className="h-2 rounded shimmer-item opacity-40 w-12" />
              </div>
            ))}
          </div>

          {/* Text Paragraph Lines Skeleton */}
          <div className="space-y-2.5 pt-2">
            <div className="h-3 rounded shimmer-item opacity-70 w-full" />
            <div className="h-3 rounded shimmer-item opacity-70 w-[92%]" />
            <div className="h-3 rounded shimmer-item opacity-60 w-[78%]" />
          </div>

          {/* Bottom Callout Skeleton */}
          <div className="p-3.5 rounded-xl border border-slate-800/60 bg-[#080c14] space-y-2">
            <div className="h-3 rounded shimmer-item opacity-80 w-44" />
            <div className="h-2.5 rounded shimmer-item opacity-50 w-3/4" />
          </div>
        </div>
      </div>
    </div>
  );
};
