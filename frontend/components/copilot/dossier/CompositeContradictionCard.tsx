'use client';

import React from 'react';
import {
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  Layers,
  TrendingUp,
  ArrowUpRight,
  PieChart,
  Users,
  Activity,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { CompositeDossierPayload, PillarScorecard } from '@/lib/types';

interface CompositeContradictionCardProps {
  data: CompositeDossierPayload;
}

const TACTICAL_BADGES: Record<string, { label: string; bg: string; text: string; border: string; icon: React.ElementType }> = {
  ACCUMULATE: {
    label: 'Akumulasi Bertahap',
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    border: 'border-emerald-500/30',
    icon: ArrowUpRight
  },
  BUY_ON_WEAKNESS: {
    label: 'Buy on Weakness',
    bg: 'bg-cyan-500/10',
    text: 'text-cyan-400',
    border: 'border-cyan-500/30',
    icon: TrendingUp
  },
  WAIT_AND_SEE: {
    label: 'Wait and See (Waspada)',
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
    border: 'border-amber-500/30',
    icon: AlertTriangle
  },
  AVOID: {
    label: 'Hindari Sementara',
    bg: 'bg-rose-500/10',
    text: 'text-rose-400',
    border: 'border-rose-500/30',
    icon: ShieldAlert
  }
};

const PILLAR_ICONS: Record<string, React.ElementType> = {
  FUNDAMENTAL: PieChart,
  SMART_MONEY: Activity,
  GOVERNANCE: Users
};

export const CompositeContradictionCard: React.FC<CompositeContradictionCardProps> = ({ data }) => {
  const { ticker, contradiction, pillars, master_verdict, tactical_recommendation } = data;
  const recBadge = TACTICAL_BADGES[tactical_recommendation] || TACTICAL_BADGES.WAIT_AND_SEE;
  const RecIcon = recBadge.icon;

  const isHighRisk = contradiction.risk_level === 'HIGH';

  return (
    <div className="space-y-3.5 mb-4">
      {/* Top Header Card */}
      <div className="rounded-xl border border-white/[0.08] bg-[#0c1214]/90 backdrop-blur-md p-4 shadow-xl shadow-black/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-sm shadow-emerald-500/10">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-white tracking-wide">
                  Audit Forensik Komprehensif — {ticker}
                </h3>
                <span className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/[0.06] text-neutral-400 border border-white/[0.05]">
                  Multi-Agent Groq
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                Sintesis paralel 3 pilar riset & deteksi divergensi pasar
              </p>
            </div>
          </div>

          {/* Tactical Recommendation Badge */}
          <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold ${recBadge.bg} ${recBadge.text} ${recBadge.border} self-start sm:self-auto`}>
            <RecIcon className="w-3.5 h-3.5" />
            <span>{recBadge.label}</span>
          </div>
        </div>

        {/* Contradiction Alert Box (if contradiction detected) */}
        {contradiction.has_contradiction ? (
          <div className={`mt-3.5 p-3.5 rounded-lg border ${
            isHighRisk 
              ? 'bg-rose-950/20 border-rose-500/30 text-rose-200' 
              : 'bg-amber-950/20 border-amber-500/30 text-amber-200'
          }`}>
            <div className="flex items-start gap-2.5">
              <div className={`p-1 rounded-md mt-0.5 ${
                isHighRisk ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'
              }`}>
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold tracking-tight">
                    {contradiction.headline}
                  </span>
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
                  <div className="flex items-center gap-1.5 pt-1 text-[11px] opacity-80">
                    <span className="text-neutral-400">Pilar Bertolak Belakang:</span>
                    {contradiction.divergence_pillars.map((pil, idx) => (
                      <span key={idx} className="font-medium underline decoration-dotted">
                        {pil}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-3 p-3 rounded-lg border border-emerald-500/20 bg-emerald-950/15 text-emerald-200">
            <div className="flex items-center gap-2 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-medium">{contradiction.headline || 'Konsensus Selaras Antar Seluruh Pilar Riset'}</span>
            </div>
          </div>
        )}

        {/* Master Verdict Banner */}
        <div className="mt-3 pt-3 border-t border-white/[0.06] text-xs text-neutral-300 leading-relaxed">
          <span className="font-semibold text-emerald-400 mr-1.5">Master Thesis:</span>
          {master_verdict}
        </div>
      </div>

      {/* 3-Pillar Balanced Scorecards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {pillars.map((p: PillarScorecard, idx: number) => {
          const PillarIcon = PILLAR_ICONS[p.pillar] || Activity;
          const isHigh = p.score >= 7;
          const isLow = p.score <= 4;
          const scoreColor = isHigh 
            ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' 
            : isLow 
            ? 'text-rose-400 border-rose-500/30 bg-rose-500/10' 
            : 'text-amber-400 border-amber-500/30 bg-amber-500/10';

          return (
            <div
              key={idx}
              className="rounded-xl border border-white/[0.07] bg-[#0c1214]/80 p-3.5 flex flex-col justify-between hover:border-white/[0.14] transition-colors"
            >
              <div>
                {/* Pillar Header */}
                <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-white/[0.06]">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-md bg-white/[0.05] text-neutral-300">
                      <PillarIcon className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-semibold text-neutral-200">
                      {p.title}
                    </span>
                  </div>

                  {/* Score circle badge */}
                  <div className={`w-7 h-7 rounded-full border flex items-center justify-center font-mono text-xs font-bold ${scoreColor}`}>
                    {p.score}
                  </div>
                </div>

                {/* Stance tag */}
                <div className="mt-2.5 flex items-center gap-1.5">
                  <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.08] text-neutral-300">
                    {p.stance.replace(/_/g, ' ')}
                  </span>
                </div>

                {/* Verdict */}
                <p className="mt-2 text-xs text-neutral-300 leading-relaxed">
                  {p.verdict}
                </p>
              </div>

              {/* Key Points */}
              {p.key_points && p.key_points.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-white/[0.05] space-y-1.5">
                  {p.key_points.map((pt, pIdx) => (
                    <div key={pIdx} className="flex items-start gap-1.5 text-[11px] text-neutral-400 leading-snug">
                      <span className="text-emerald-400 mt-0.5">•</span>
                      <span>{pt}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
