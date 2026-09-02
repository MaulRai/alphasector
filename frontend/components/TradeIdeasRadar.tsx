'use client';

import React from 'react';
import { ShieldCheck, TrendingUp, Users, Zap, Compass } from 'lucide-react';

interface TradeIdeasRadarProps {
  onSelectPreset: (query: string) => void;
}

export const TradeIdeasRadar: React.FC<TradeIdeasRadarProps> = ({ onSelectPreset }) => {
  const presets = [
    {
      title: '🌿 ESG Leaders IDX',
      tagline: 'Emiten dengan tata kelola keberlanjutan terbaik',
      query: 'Screening top emiten dengan ESG score terbaik di Indonesia',
      icon: ShieldCheck,
      color: 'from-emerald-500/20 to-emerald-700/10 border-emerald-500/30 text-emerald-400'
    },
    {
      title: '🚀 Revenue Growth Titans',
      tagline: 'Pertumbuhan omset YoY tercepat di IDX',
      query: 'Cari emiten dengan pertumbuhan revenue tertinggi di 2024 dibanding 2023',
      icon: TrendingUp,
      color: 'from-blue-500/20 to-blue-700/10 border-blue-500/30 text-blue-400'
    },
    {
      title: '👑 Large Single-Shareholder',
      tagline: 'Kepemilikan entitas tunggal ≥ 70%',
      query: 'Cari saham yang kepemilikan single shareholder minimal 70 persen',
      icon: Users,
      color: 'from-amber-500/20 to-amber-700/10 border-amber-500/30 text-amber-400'
    },
    {
      title: '⚡ Efficient Operators',
      tagline: 'Laba bersih per karyawan tertinggi',
      query: 'Cari perusahaan dengan laba bersih per karyawan paling efisien di sektornya',
      icon: Zap,
      color: 'from-cyan-500/20 to-cyan-700/10 border-cyan-500/30 text-cyan-400'
    },
  ];

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-3">
        <Compass className="h-4 w-4 text-emerald-400" />
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Sectors Trade Ideas Radar (1-Click Screening)
        </h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {presets.map((preset, idx) => {
          const Icon = preset.icon;
          return (
            <button
              key={idx}
              onClick={() => onSelectPreset(preset.query)}
              className={`flex flex-col p-4 rounded-xl border bg-gradient-to-br ${preset.color} glass-panel-interactive text-left group`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm text-white group-hover:text-emerald-300 transition-colors">
                  {preset.title}
                </span>
                <Icon className="h-4 w-4 shrink-0" />
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                {preset.tagline}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};
