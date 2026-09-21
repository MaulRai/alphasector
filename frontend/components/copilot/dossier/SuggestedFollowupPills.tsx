'use client';

import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { DossierColorVariant } from './DossierSynthesisCard';

interface SuggestedFollowupPillsProps {
  followups: string[];
  colorVariant?: DossierColorVariant;
  isLoading?: boolean;
  onSendMessage: (query: string) => void;
}

export const SuggestedFollowupPills: React.FC<SuggestedFollowupPillsProps> = ({
  followups,
  colorVariant = 'emerald',
  isLoading = false,
  onSendMessage,
}) => {
  if (!followups || followups.length === 0) return null;

  const buttonStyle =
    colorVariant === 'cyan'
      ? 'hover:bg-cyan-950/50 border-slate-700/80 hover:border-cyan-500/50 text-white hover:text-cyan-200'
      : colorVariant === 'amber'
      ? 'hover:bg-amber-950/50 border-slate-700/80 hover:border-amber-500/50 text-white hover:text-amber-200'
      : colorVariant === 'purple'
      ? 'hover:bg-purple-950/50 border-slate-700/80 hover:border-purple-500/50 text-white hover:text-purple-200'
      : colorVariant === 'rose'
      ? 'hover:bg-rose-950/50 border-slate-700/80 hover:border-rose-500/50 text-white hover:text-rose-200'
      : 'hover:bg-emerald-950/50 border-slate-700/80 hover:border-emerald-500/50 text-white hover:text-emerald-200';

  return (
    <div className="pt-2 animate-card-reveal-delay-3">
      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
        <Sparkles className="h-3 w-3 text-emerald-400" />
        <span>Pertanyaan Lanjutan yang Disarankan AI:</span>
      </p>
      <div className="flex flex-wrap gap-2">
        {followups.map((followup, fIdx) => (
          <button
            key={fIdx}
            onClick={() => onSendMessage(followup)}
            disabled={isLoading}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 border text-xs text-left transition-all active:scale-95 group shadow-sm cursor-pointer ${buttonStyle}`}
          >
            <span className="line-clamp-1">{followup}</span>
            <ArrowRight className="h-3 w-3 text-slate-400 group-hover:text-current shrink-0 transition-transform group-hover:translate-x-0.5" />
          </button>
        ))}
      </div>
    </div>
  );
};
