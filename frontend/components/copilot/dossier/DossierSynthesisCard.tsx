'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';
import { SynthesisResult } from '@/lib/types';

export type DossierColorVariant = 'cyan' | 'amber' | 'emerald' | 'purple' | 'rose';

interface DossierSynthesisCardProps {
  synthesis: SynthesisResult;
  title: string;
  badgeLabel?: string;
  colorVariant?: DossierColorVariant;
  valuationLabel?: string;
  valuationVerdict?: string;
  extraFieldLabel?: string;
  extraFieldValue?: string;
  keyFindingsTitle?: string;
}

const COLOR_MAP: Record<DossierColorVariant, {
  glowClass: string;
  iconText: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  bulletText: string;
  extraBoxBg: string;
  extraBoxBorder: string;
  extraBoxText: string;
  extraBoxTitle: string;
}> = {
  cyan: {
    glowClass: 'glow-cyan',
    iconText: 'text-cyan-400',
    badgeBg: 'bg-cyan-500/10',
    badgeText: 'text-cyan-300',
    badgeBorder: 'border-cyan-500/20',
    bulletText: 'text-cyan-400',
    extraBoxBg: 'bg-cyan-500/10',
    extraBoxBorder: 'border-cyan-500/20',
    extraBoxText: 'text-cyan-200',
    extraBoxTitle: 'text-cyan-400',
  },
  amber: {
    glowClass: 'glow-emerald',
    iconText: 'text-amber-400',
    badgeBg: 'bg-amber-500/10',
    badgeText: 'text-amber-300',
    badgeBorder: 'border-amber-500/20',
    bulletText: 'text-amber-400',
    extraBoxBg: 'bg-amber-500/10',
    extraBoxBorder: 'border-amber-500/20',
    extraBoxText: 'text-amber-200',
    extraBoxTitle: 'text-amber-400',
  },
  emerald: {
    glowClass: 'glow-emerald',
    iconText: 'text-emerald-400',
    badgeBg: 'bg-emerald-500/10',
    badgeText: 'text-emerald-300',
    badgeBorder: 'border-emerald-500/20',
    bulletText: 'text-emerald-400',
    extraBoxBg: 'bg-emerald-500/10',
    extraBoxBorder: 'border-emerald-500/20',
    extraBoxText: 'text-emerald-200',
    extraBoxTitle: 'text-emerald-400',
  },
  purple: {
    glowClass: 'glow-purple',
    iconText: 'text-purple-400',
    badgeBg: 'bg-purple-500/10',
    badgeText: 'text-purple-300',
    badgeBorder: 'border-purple-500/20',
    bulletText: 'text-purple-400',
    extraBoxBg: 'bg-purple-500/10',
    extraBoxBorder: 'border-purple-500/20',
    extraBoxText: 'text-purple-200',
    extraBoxTitle: 'text-purple-400',
  },
  rose: {
    glowClass: 'glow-rose',
    iconText: 'text-rose-400',
    badgeBg: 'bg-rose-500/10',
    badgeText: 'text-rose-300',
    badgeBorder: 'border-rose-500/20',
    bulletText: 'text-rose-400',
    extraBoxBg: 'bg-rose-500/10',
    extraBoxBorder: 'border-rose-500/20',
    extraBoxText: 'text-rose-200',
    extraBoxTitle: 'text-rose-400',
  },
};

export const DossierSynthesisCard: React.FC<DossierSynthesisCardProps> = ({
  synthesis,
  title,
  badgeLabel,
  colorVariant = 'emerald',
  valuationLabel = 'Valuation Verdict',
  valuationVerdict,
  extraFieldLabel,
  extraFieldValue,
  keyFindingsTitle = 'Key Findings',
}) => {
  const styles = COLOR_MAP[colorVariant];
  const activeVerdict = valuationVerdict || synthesis.valuation_verdict;
  const activeExtra = extraFieldValue || synthesis.smart_money_flow;

  return (
    <div className={`rounded-2xl border border-slate-800 bg-[#0d121e]/90 p-5 sm:p-6 shadow-2xl glass-panel ${styles.glowClass} animate-card-reveal-delay-2`}>
      {/* Header */}
      <div className="flex items-center justify-between gap-4 pb-3 border-b border-slate-800 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <Sparkles className={`h-4 w-4 ${styles.iconText} shrink-0`} />
          <h3 className="text-sm font-bold text-white truncate">
            {title}
          </h3>
        </div>
        {badgeLabel && (
          <span className={`text-[10px] px-2.5 py-0.5 rounded-full ${styles.badgeBg} ${styles.badgeText} font-semibold border ${styles.badgeBorder} shrink-0`}>
            {badgeLabel}
          </span>
        )}
      </div>

      {/* Executive Summary */}
      <p className="text-xs sm:text-sm text-slate-200 leading-relaxed mb-4">
        {synthesis.executive_summary}
      </p>

      {/* Extra Field Box (e.g. Smart Money Flow / Flow Analysis) */}
      {activeExtra && (
        <div className={`p-3.5 rounded-xl ${styles.extraBoxBg} border ${styles.extraBoxBorder} text-xs ${styles.extraBoxText} mb-3 font-medium`}>
          <strong className={styles.extraBoxTitle}>{extraFieldLabel || 'Flow Analysis'}:</strong> {activeExtra}
        </div>
      )}

      {/* Valuation Verdict Box */}
      {activeVerdict && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-200 mb-3 font-medium">
          <strong className="text-emerald-400">{valuationLabel}:</strong> {activeVerdict}
        </div>
      )}

      {/* Key Findings Bullet List */}
      {synthesis.key_findings && synthesis.key_findings.length > 0 && (
        <div className="pt-3 border-t border-slate-800/60 text-xs">
          <h4 className="font-bold text-slate-400 uppercase tracking-wider mb-2 text-[10px]">
            {keyFindingsTitle}
          </h4>
          <ul className="space-y-1.5 text-slate-300">
            {synthesis.key_findings.map((f: string, fi: number) => (
              <li key={fi} className="flex items-start gap-2">
                <span className={`${styles.bulletText} mt-0.5`}>•</span>
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
