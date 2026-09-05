'use client';

import React, { useMemo } from 'react';
import { ChatSession } from '@/lib/types';
import { CompanyLogo } from '@/components/CompanyLogo';
import { extractSessionTickers } from '@/lib/session-utils';
import { formatLastInteraction } from '@/lib/formatters';
import { 
  Plus, Search, MessageSquare, Clock, Trash2, PanelLeftClose, PanelLeft
} from 'lucide-react';

interface ChatSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  sessions: ChatSession[];
  activeSessionId: string | null;
  sessionSearch: string;
  onSearchChange: (val: string) => void;
  onSelectSession: (id: string) => void;
  onCreateNewSession: () => void;
  onRequestDeleteSession: (e: React.MouseEvent, session: ChatSession) => void;
  user: any;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  isOpen,
  onToggle,
  sessions,
  activeSessionId,
  sessionSearch,
  onSearchChange,
  onSelectSession,
  onCreateNewSession,
  onRequestDeleteSession,
  user,
}) => {
  const filteredSessions = useMemo(() => {
    if (!sessionSearch.trim()) return sessions;
    const q = sessionSearch.toLowerCase();
    return sessions.filter((s) => {
      const matchTitle = s.title.toLowerCase().includes(q);
      const matchTicker = s.primary_ticker?.toLowerCase().includes(q);
      return matchTitle || matchTicker;
    });
  }, [sessions, sessionSearch]);

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-30 sm:relative sm:z-auto transition-all duration-300 ease-in-out flex flex-col bg-[#090d16] border-r border-slate-800/80 shadow-2xl shrink-0 ${
        isOpen ? 'w-72 translate-x-0' : 'w-0 -translate-x-full sm:w-0 sm:-translate-x-full overflow-hidden border-none'
      }`}
    >
      {/* Sidebar Header */}
      <div className="p-3 border-b border-slate-800/80 flex items-center justify-between gap-2">
        <button
          onClick={onCreateNewSession}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-all shadow-sm active:scale-95 group"
        >
          <Plus className="h-3.5 w-3.5 group-hover:rotate-90 transition-transform duration-200" />
          <span>Sesi Riset Baru</span>
        </button>

        <button
          onClick={onToggle}
          title="Tutup Sidebar"
          className="sm:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <PanelLeftClose className="h-4 w-4" />
        </button>
      </div>

      {/* Session Search Bar */}
      <div className="p-2 border-b border-slate-800/60">
        <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 focus-within:border-emerald-500/50 transition-colors">
          <Search className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          <input
            type="text"
            value={sessionSearch}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Cari sesi atau ticker..."
            className="w-full bg-transparent text-slate-200 placeholder-slate-500 focus:outline-none text-xs"
          />
        </div>
      </div>

      {/* Sessions List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {filteredSessions.length === 0 ? (
          <div className="py-8 text-center px-4 text-xs text-slate-500">
            <MessageSquare className="h-6 w-6 mx-auto mb-2 opacity-30 text-slate-400" />
            <p>Belum ada sesi riset tersimpan.</p>
            <p className="text-[11px] text-slate-600 mt-1">Mulai riset baru untuk membuat room.</p>
          </div>
        ) : (
          filteredSessions.map((s) => {
            const isActive = s.id === activeSessionId;
            const tickers = extractSessionTickers(s);
            return (
              <div
                key={s.id}
                onClick={() => onSelectSession(s.id)}
                className={`group relative flex items-center justify-between p-2.5 rounded-xl text-xs cursor-pointer transition-all ${
                  isActive
                    ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-medium'
                    : 'text-slate-400 hover:bg-slate-900/80 hover:text-slate-200 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 pr-2 flex-1">
                  {/* Left: Complete Company Logos Cluster */}
                  <div className="flex items-center shrink-0">
                    {tickers.length > 0 ? (
                      <div className="flex -space-x-1.5 items-center p-0.5">
                        {tickers.map((sym, i) => (
                          <div 
                            key={sym} 
                            className="relative rounded-full ring-1.5 ring-[#0a0d16] bg-slate-900 overflow-hidden shadow-sm flex items-center justify-center shrink-0"
                            style={{ zIndex: 10 - i }}
                            title={sym}
                          >
                            <CompanyLogo symbol={sym} size="sm" />
                          </div>
                        ))}
                      </div>
                    ) : isActive ? (
                      <div className="p-1.5 rounded-lg shrink-0 bg-emerald-500/20 text-emerald-400">
                        <MessageSquare className="h-4 w-4" />
                      </div>
                    ) : (
                      <div className="p-1.5 rounded-lg shrink-0 bg-slate-800 text-slate-400">
                        <MessageSquare className="h-4 w-4" />
                      </div>
                    )}
                  </div>

                  {/* Middle: Title & Message Count */}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-slate-200 group-hover:text-white transition-colors">
                      {s.title}
                    </p>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-0.5">
                      <Clock className="h-2.5 w-2.5 opacity-60" />
                      <span>{formatLastInteraction(s.updated_at || s.created_at)}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={(e) => onRequestDeleteSession(e, s)}
                  title="Hapus Sesi"
                  className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-all shrink-0"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Sidebar Footer User Badge */}
      <div className="p-3 border-t border-slate-800/80 bg-[#080b12] flex items-center justify-between text-[11px] text-slate-400">
        <div className="flex items-center gap-2 truncate">
          <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="truncate">{user?.full_name || 'Demo Analyst'}</span>
        </div>
        <span className="font-mono text-slate-500">{sessions.length} Sesi</span>
      </div>
    </aside>
  );
};
