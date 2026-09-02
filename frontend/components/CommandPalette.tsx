'use client';

import React, { useState, useEffect } from 'react';
import { Search, Sparkles, TrendingUp, Users, ShieldCheck, Zap, X, CornerDownLeft } from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitQuery: (query: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onSubmitQuery,
}) => {
  const [input, setInput] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else onClose(); // parent handles toggle
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const quickPrompts = [
    {
      title: 'Peer Battle: BBRI vs BMRI',
      desc: 'Bandingkan valuasi PBV, laba bersih, dan konsistensi dividen',
      query: 'Bandingkan valuasi dan dividen BBRI vs BMRI',
      category: 'Peer Battle',
      icon: TrendingUp,
      badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/20'
    },
    {
      title: 'Deep Dive: BBCA 360°',
      desc: 'Analisis fundamental, valuasi historis, dan peer group',
      query: 'Analisis fundamental dan valuasi BBCA',
      category: 'Deep Dive',
      icon: Sparkles,
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
    },
    {
      title: 'Smart Money: TLKM Foreign Flow',
      desc: 'Lacak akumulasi broker institusi & net foreign flow',
      query: 'Cek broker flow dan akumulasi TLKM',
      category: 'Smart Money',
      icon: Users,
      badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20'
    },
    {
      title: 'Preset: ESG Leaders Indonesia',
      desc: 'Screening emiten dengan tata kelola keberlanjutan terbaik',
      query: 'Screening top emiten dengan ESG score terbaik di Indonesia',
      category: 'Radar Preset',
      icon: ShieldCheck,
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
    },
    {
      title: 'Preset: Efficient Operators',
      desc: 'Emiten dengan net income per karyawan tertinggi',
      query: 'Cari perusahaan dengan laba per karyawan paling efisien',
      category: 'Radar Preset',
      icon: Zap,
      badgeColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
    },
  ];

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim()) return;
    onSubmitQuery(input.trim());
    setInput('');
    onClose();
  };

  const handleSelectPrompt = (q: string) => {
    onSubmitQuery(q);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl rounded-2xl border border-slate-700/60 bg-[#0d121e]/95 shadow-2xl overflow-hidden glow-emerald"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Input Header */}
        <form onSubmit={handleSubmit} className="flex items-center border-b border-slate-800 px-4 py-3.5">
          <Search className="h-5 w-5 text-emerald-400 shrink-0 mr-3" />
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ketik instruksi riset pasar modal (misal: Bandingkan ASII vs AUTO atau Cek BBCA)..."
            className="w-full bg-transparent text-sm sm:text-base text-white placeholder-slate-500 focus:outline-none"
            autoFocus
          />
          <div className="flex items-center gap-2">
            {input.trim() && (
              <button
                type="submit"
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500 text-black text-xs font-semibold hover:bg-emerald-400 transition-all"
              >
                <span>Tanya Agent</span>
                <CornerDownLeft className="h-3 w-3" />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </form>

        {/* Quick Suggestion List */}
        <div className="max-h-96 overflow-y-auto p-3 space-y-1.5">
          <div className="px-3 py-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Saran Prompt Riset Populer
          </div>

          {quickPrompts.map((p, idx) => {
            const Icon = p.icon;
            return (
              <button
                key={idx}
                onClick={() => handleSelectPrompt(p.query)}
                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-800/80 transition-all text-left group border border-transparent hover:border-slate-700"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 group-hover:border-emerald-500/30 text-emerald-400 shrink-0">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="truncate">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-200 group-hover:text-emerald-400 transition-colors truncate">
                        {p.title}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border ${p.badgeColor}`}>
                        {p.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 truncate mt-0.5">
                      {p.desc}
                    </p>
                  </div>
                </div>
                <CornerDownLeft className="h-4 w-4 text-slate-600 group-hover:text-emerald-400 opacity-0 group-hover:opacity-100 transition-all shrink-0 ml-2" />
              </button>
            );
          })}
        </div>

        {/* Footer shortcuts */}
        <div className="border-t border-slate-800/80 px-4 py-2.5 bg-slate-950/60 flex items-center justify-between text-xs text-slate-500">
          <span>Ditenagai oleh <strong>Sectors Financial API v2</strong></span>
          <div className="flex items-center gap-3">
            <span><kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] text-slate-400">Esc</kbd> Tutup</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] text-slate-400">↵</kbd> Jalankan</span>
          </div>
        </div>

      </div>
    </div>
  );
};
