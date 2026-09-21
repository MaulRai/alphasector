'use client';

import React from 'react';
import { FileText, ArrowRight } from 'lucide-react';
import { DossierColorVariant } from './DossierSynthesisCard';

interface DossierArtifactCtaProps {
  title: string;
  badgeLabel?: string;
  description?: string;
  colorVariant?: DossierColorVariant;
  onClick: () => void;
}

const CTA_STYLES: Record<DossierColorVariant, {
  border: string;
  hoverBorder: string;
  iconBg: string;
  iconBorder: string;
  iconText: string;
  hoverText: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  arrowText: string;
}> = {
  cyan: {
    border: 'border-cyan-500/30',
    hoverBorder: 'hover:border-cyan-400/70',
    iconBg: 'bg-cyan-500/15',
    iconBorder: 'border-cyan-500/30',
    iconText: 'text-cyan-400',
    hoverText: 'group-hover:text-cyan-300',
    badgeBg: 'bg-cyan-500/10',
    badgeText: 'text-cyan-400',
    badgeBorder: 'border-cyan-500/20',
    arrowText: 'text-cyan-400',
  },
  amber: {
    border: 'border-amber-500/30',
    hoverBorder: 'hover:border-amber-400/70',
    iconBg: 'bg-amber-500/15',
    iconBorder: 'border-amber-500/30',
    iconText: 'text-amber-400',
    hoverText: 'group-hover:text-amber-300',
    badgeBg: 'bg-amber-500/10',
    badgeText: 'text-amber-400',
    badgeBorder: 'border-amber-500/20',
    arrowText: 'text-amber-400',
  },
  emerald: {
    border: 'border-emerald-500/30',
    hoverBorder: 'hover:border-emerald-400/70',
    iconBg: 'bg-emerald-500/15',
    iconBorder: 'border-emerald-500/30',
    iconText: 'text-emerald-400',
    hoverText: 'group-hover:text-emerald-300',
    badgeBg: 'bg-emerald-500/10',
    badgeText: 'text-emerald-400',
    badgeBorder: 'border-emerald-500/20',
    arrowText: 'text-emerald-400',
  },
  purple: {
    border: 'border-purple-500/30',
    hoverBorder: 'hover:border-purple-400/70',
    iconBg: 'bg-purple-500/15',
    iconBorder: 'border-purple-500/30',
    iconText: 'text-purple-400',
    hoverText: 'group-hover:text-purple-300',
    badgeBg: 'bg-purple-500/10',
    badgeText: 'text-purple-400',
    badgeBorder: 'border-purple-500/20',
    arrowText: 'text-purple-400',
  },
  rose: {
    border: 'border-rose-500/30',
    hoverBorder: 'hover:border-rose-400/70',
    iconBg: 'bg-rose-500/15',
    iconBorder: 'border-rose-500/30',
    iconText: 'text-rose-400',
    hoverText: 'group-hover:text-rose-300',
    badgeBg: 'bg-rose-500/10',
    badgeText: 'text-rose-400',
    badgeBorder: 'border-rose-500/20',
    arrowText: 'text-rose-400',
  },
};

export const DossierArtifactCta: React.FC<DossierArtifactCtaProps> = ({
  title,
  badgeLabel,
  description = 'Buka analisis lengkap di Artifact Panel ➔',
  colorVariant = 'emerald',
  onClick,
}) => {
  const styles = CTA_STYLES[colorVariant];

  return (
    <div
      onClick={onClick}
      className={`p-3.5 rounded-2xl bg-[#090e1a] ${styles.border} ${styles.hoverBorder} hover:bg-[#0c1426] transition-all cursor-pointer group flex items-center justify-between shadow-lg animate-card-reveal-delay-2 hover:scale-[1.008]`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className={`h-9 w-9 rounded-xl ${styles.iconBg} ${styles.iconBorder} flex items-center justify-center ${styles.iconText} group-hover:scale-105 transition-transform shrink-0`}>
          <FileText className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className={`text-xs font-bold text-white ${styles.hoverText} transition-colors truncate`}>
              {title}
            </span>
            {badgeLabel && (
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${styles.badgeBg} ${styles.badgeText} font-semibold border ${styles.badgeBorder} shrink-0`}>
                {badgeLabel}
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {description}
          </p>
        </div>
      </div>
      <ArrowRight className={`h-4 w-4 ${styles.arrowText} group-hover:translate-x-1 transition-transform shrink-0`} />
    </div>
  );
};
