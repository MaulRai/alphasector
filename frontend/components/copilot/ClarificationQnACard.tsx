'use client';

import React, { useState } from 'react';
import { HelpCircle, Check, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';
import { ClarificationPayload, ClarificationOption } from '@/lib/types';

interface ClarificationQnACardProps {
  clarification: ClarificationPayload;
  onSendMessage: (focusedQuery: string) => void;
  isLoading?: boolean;
}

export const ClarificationQnACard: React.FC<ClarificationQnACardProps> = ({
  clarification,
  onSendMessage,
  isLoading = false,
}) => {
  const [selectedOptionIds, setSelectedOptionIds] = useState<string[]>(() => {
    if (clarification.selected_option_ids && clarification.selected_option_ids.length > 0) {
      return clarification.selected_option_ids;
    }
    // Default to first option for quick convenience
    return clarification.options.length > 0 ? [clarification.options[0].id] : [];
  });

  const [customInput, setCustomInput] = useState(clarification.custom_input || '');
  const [isSubmitted, setIsSubmitted] = useState(clarification.is_confirmed || false);

  const toggleOption = (id: string) => {
    if (isSubmitted || isLoading) return;
    setSelectedOptionIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isSubmitted || isLoading) return;

    const selectedOptions = clarification.options.filter((opt) => selectedOptionIds.includes(opt.id));
    if (selectedOptions.length === 0 && !customInput.trim()) return;

    // Compose a clear, focused research query from the user's selected intents
    let focusedQuery = '';

    if (selectedOptions.length === 1 && selectedOptions[0].suggested_query) {
      focusedQuery = selectedOptions[0].suggested_query;
      if (customInput.trim()) {
        focusedQuery += ` (Catatan Tambahan: ${customInput.trim()})`;
      }
    } else if (selectedOptions.length > 0) {
      const optionLabels = selectedOptions.map((o) => o.label).join(' dan ');
      const topicPrefix = clarification.context_topic ? `[${clarification.context_topic}] ` : '';
      focusedQuery = `${topicPrefix}Lakukan analisis terfokus pada: ${optionLabels}`;
      if (customInput.trim()) {
        focusedQuery += `. Catatan Tambahan: ${customInput.trim()}`;
      }
    } else if (customInput.trim()) {
      const topicPrefix = clarification.context_topic ? `[${clarification.context_topic}] ` : '';
      focusedQuery = `${topicPrefix}${customInput.trim()}`;
    }

    setIsSubmitted(true);
    onSendMessage(focusedQuery);
  };

  // Render Confirmed Read-Only Snapshot
  if (isSubmitted) {
    const selectedOptions = clarification.options.filter((opt) => selectedOptionIds.includes(opt.id));
    return (
      <div className="w-full rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/30 via-slate-900 to-[#0d121e] p-4 sm:p-5 shadow-lg glass-panel animate-card-reveal">
        <div className="flex items-center gap-2.5 mb-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
            Fokus Riset Terkonfirmasi
          </span>
        </div>
        <p className="text-xs text-slate-300">
          {clarification.question}
        </p>
        <div className="mt-2.5 flex flex-wrap items-center gap-2">
          {selectedOptions.map((opt) => (
            <span
              key={opt.id}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold"
            >
              <Check className="h-3 w-3 text-emerald-400" />
              <span>{opt.label}</span>
            </span>
          ))}
          {customInput.trim() && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 text-xs italic">
              &quot;{customInput.trim()}&quot;
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/40 via-slate-900 to-[#0d121e] p-5 sm:p-6 shadow-2xl glass-panel animate-card-reveal">
      {/* Header Banner */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-indigo-500/20 mb-4">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-1.5 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 shrink-0">
            <HelpCircle className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">
                Clarification Gate
              </span>
              {clarification.context_topic && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                  {clarification.context_topic}
                </span>
              )}
            </div>
          </div>
        </div>
        <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 font-semibold border border-amber-500/20 shrink-0">
          Butuh Arah Riset
        </span>
      </div>

      {/* Clarification Question */}
      <div className="mb-4">
        <h4 className="text-sm sm:text-base font-bold text-white leading-snug">
          {clarification.question}
        </h4>
        <p className="text-xs text-slate-400 mt-1">
          Pilih satu atau beberapa fokus riset di bawah agar AlphaAgent mengeksekusi parameter yang tepat sasaran:
        </p>
      </div>

      {/* Interactive Option Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-4">
        {clarification.options.map((opt: ClarificationOption) => {
          const isSelected = selectedOptionIds.includes(opt.id);
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => toggleOption(opt.id)}
              disabled={isLoading}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3 select-none ${
                isSelected
                  ? 'bg-indigo-600/20 border-indigo-400 text-white shadow-md shadow-indigo-500/10 ring-1 ring-indigo-400/50'
                  : 'bg-[#090e18]/80 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/40'
              }`}
            >
              {/* Checkbox Icon */}
              <div
                className={`mt-0.5 h-4 w-4 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                  isSelected
                    ? 'bg-indigo-500 border-indigo-400 text-white'
                    : 'border-slate-600 bg-slate-900/60'
                }`}
              >
                {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
              </div>

              {/* Label & Description */}
              <div className="min-w-0 flex-1">
                <span className={`text-xs font-bold block ${isSelected ? 'text-indigo-200' : 'text-slate-200'}`}>
                  {opt.label}
                </span>
                {opt.description && (
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                    {opt.description}
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Optional Freeform Custom Input */}
      {clarification.allow_custom_input !== false && (
        <div className="mb-4">
          <input
            type="text"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            disabled={isLoading}
            placeholder="Tambahkan catatan spesifik / batasan preferensi Anda (opsional)..."
            className="w-full px-3.5 py-2 rounded-xl bg-[#090d16] border border-slate-800 focus:border-indigo-500/60 focus:outline-none text-xs text-slate-200 placeholder:text-slate-500 transition-colors"
          />
        </div>
      )}

      {/* Bottom Submit Action */}
      <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-800/70">
        <span className="text-[11px] text-slate-500">
          {selectedOptionIds.length} opsi dipilih
        </span>

        <button
          type="button"
          onClick={() => handleSubmit()}
          disabled={isLoading || (selectedOptionIds.length === 0 && !customInput.trim())}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-500/20 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>Jalankan Riset Terfokus</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};
