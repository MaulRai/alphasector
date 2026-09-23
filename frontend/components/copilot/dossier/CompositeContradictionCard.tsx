'use client';

import React from 'react';
import {
  AlertTriangle,
  Layers,
  PieChart,
  Users,
  Activity
} from 'lucide-react';
import { CompositeDossierPayload, PillarScorecard } from '@/lib/types';

interface CompositeContradictionCardProps {
  data: CompositeDossierPayload;
}

const PILLAR_ICONS: Record<string, React.ElementType> = {
  FUNDAMENTAL: PieChart,
  SMART_MONEY: Activity,
  GOVERNANCE: Users
};

export const CompositeContradictionCard: React.FC<CompositeContradictionCardProps> = ({ data }) => {
  const { ticker, contradiction, pillars, master_verdict } = data;
  const isHighRisk = contradiction.risk_level === 'HIGH';

  return (
    <div className="rounded-2xl border border-slate-800 bg-[#0d121e]/90 p-5 sm:p-6 shadow-2xl glass-panel glow-emerald mb-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-emerald-400 shrink-0" />
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Audit Forensik Komprehensif {ticker ? `(${ticker})` : ''}
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Sintesis terpadu pilar fundamental, aliran smart money, dan tata kelola regulasi
          </p>
        </div>
      </div>

      {/* Master Thesis Box */}
      {master_verdict && (
        <div className="mb-5 text-xs sm:text-sm text-slate-200 leading-relaxed bg-slate-900/60 border border-slate-800/80 rounded-xl p-4">
          <span className="font-bold text-emerald-400 mr-2">Tesis Utama:</span>
          {master_verdict}
        </div>
      )}

      {/* Contradiction Alert Box (ONLY if divergence/contradiction is detected) */}
      {contradiction.has_contradiction && (
        <div className={`p-4 rounded-xl border mb-5 font-medium text-xs ${
          isHighRisk 
            ? 'bg-rose-500/10 border-rose-500/20 text-rose-200' 
            : 'bg-amber-500/10 border-amber-500/20 text-amber-200'
        }`}>
          <div className="flex items-start gap-3">
            <AlertTriangle className={`w-4 h-4 mt-0.5 shrink-0 ${isHighRisk ? 'text-rose-400' : 'text-amber-400'}`} />
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2 font-bold text-xs">
                <span>{contradiction.headline}</span>
                <span className={`text-[9px] uppercase font-mono px-1.5 py-0.2 rounded border ${
                  isHighRisk 
                    ? 'bg-rose-500/20 border-rose-500/40 text-rose-300' 
                    : 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                }`}>
                  Risiko Divergensi: {contradiction.risk_level}
                </span>
              </div>
              <p className="text-xs leading-relaxed opacity-90">
                {contradiction.description}
              </p>
              {contradiction.divergence_pillars && contradiction.divergence_pillars.length > 0 && (
                <div className="flex items-center gap-1.5 pt-1 text-[11px] text-slate-400">
                  <span>Pilar Bertolak Belakang:</span>
                  <span className="font-medium text-slate-200">{contradiction.divergence_pillars.join(' vs ')}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3-Pillar Balanced Scorecards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {pillars.map((p: PillarScorecard, idx: number) => {
          const PillarIcon = PILLAR_ICONS[p.pillar] || Activity;
          const isHigh = p.score >= 7;
          const isLow = p.score <= 4;
          const scoreBadge = isHigh
            ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
            : isLow
            ? 'text-rose-400 border-rose-500/30 bg-rose-500/10'
            : 'text-amber-400 border-amber-500/30 bg-amber-500/10';

          return (
            <div
              key={idx}
              className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 flex flex-col justify-between hover:border-slate-700/80 transition-all"
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-md bg-slate-800 text-slate-300">
                      <PillarIcon className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-bold text-white tracking-tight">
                      {p.title}
                    </span>
                  </div>
                  <div className={`w-6 h-6 rounded-full border flex items-center justify-center font-mono text-xs font-bold ${scoreBadge}`}>
                    {p.score}
                  </div>
                </div>

                {/* Stance tag */}
                <div className="mt-2.5">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 w-fit inline-block">
                    {p.stance.replace(/_/g, ' ')}
                  </span>
                </div>

                {/* Verdict */}
                <p className="mt-2 text-xs text-slate-300 leading-relaxed">
                  {p.verdict}
                </p>
              </div>

              {/* Key Points */}
              {p.key_points && p.key_points.length > 0 && (
                <ul className="mt-3 pt-2.5 border-t border-slate-800/60 space-y-1.5 text-[11px] text-slate-400">
                  {p.key_points.map((pt, pIdx) => (
                    <li key={pIdx} className="flex items-start gap-1.5 leading-snug">
                      <span className="text-emerald-400 mt-0.5">•</span>
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
