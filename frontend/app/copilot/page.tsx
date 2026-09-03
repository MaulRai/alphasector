'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { AgentThinkingTrace } from '@/components/AgentThinkingTrace';
import { LiveThinkingTrace } from '@/components/LiveThinkingTrace';
import { Company360Card } from '@/components/Company360Card';
import { PeerBattleMatrix } from '@/components/PeerBattleMatrix';
import { BrokerFlowTracker } from '@/components/BrokerFlowTracker';
import { TradeIdeasRadar } from '@/components/TradeIdeasRadar';
import { ResearchDossierModal } from '@/components/ResearchDossierModal';
import { ConfirmModal } from '@/components/ConfirmModal';
import { CopilotArtifactPanel, ArtifactItem } from '@/components/CopilotArtifactPanel';
import { CompanyLogo } from '@/components/CompanyLogo';
import { 
  queryAgent, 
  fetchUserChatSessions, 
  fetchChatRoomDetails, 
  createChatRoom, 
  deleteChatRoom 
} from '@/lib/api';
import { AgentQueryResponse, ChatSession, ChatMessage } from '@/lib/types';
import { useAuth } from '@/lib/auth-context';
import { 
  Sparkles, Search, Send, RefreshCw, 
  BookOpen, AlertCircle, Plus, MessageSquare, 
  Trash2, ChevronRight, CornerDownLeft, Bot, 
  User as UserIcon, PanelLeftClose, PanelLeft, Clock,
  ArrowRight, ShieldCheck, TrendingUp, FileText, Layers, Settings, Key
} from 'lucide-react';
import { AuthGate } from '@/components/AuthGate';

export default function CopilotPage() {
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  
  // State
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessionSearch, setSessionSearch] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingHistory, setIsFetchingHistory] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDossierOpen, setIsDossierOpen] = useState(false);
  const [isArtifactPanelOpen, setIsArtifactPanelOpen] = useState(false);
  const [selectedArtifactId, setSelectedArtifactId] = useState<string | null>(null);
  const [activeModalReport, setActiveModalReport] = useState<AgentQueryResponse | null>(null);
  
  // Modal State for session deletion
  const [sessionToDelete, setSessionToDelete] = useState<{ id: string; title: string } | null>(null);
  const [isDeletingSession, setIsDeletingSession] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const latestAssistantMsgRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Smart natural scroll: scroll to top of new assistant response, or to bottom when user sends query
  useEffect(() => {
    if (isLoading) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    } else if (messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.role === 'assistant') {
        // Scroll to the top of the newly arrived AI response so the user reads naturally from the top
        latestAssistantMsgRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [messages, isLoading]);

  const initialQueryExecuted = useRef(false);

  // Load user chat sessions on mount or when user logs in
  useEffect(() => {
    if (user) {
      loadSessions();
    }
  }, [user]);

  // Handle follow-up query passed from Peer Battle, Smart Money, or Screener
  useEffect(() => {
    if (typeof window !== 'undefined' && !initialQueryExecuted.current) {
      const params = new URLSearchParams(window.location.search);
      const initQ = params.get('initial_query') || params.get('q');
      if (initQ) {
        initialQueryExecuted.current = true;
        window.history.replaceState({}, '', window.location.pathname);
        setActiveSessionId(null);
        setMessages([]);
        handleSendMessage(initQ);
      }
    }
  }, [user]);

  const loadSessions = async () => {
    try {
      const res = await fetchUserChatSessions();
      setSessions(res.sessions || []);
      const hasInitQuery = typeof window !== 'undefined' && (new URLSearchParams(window.location.search).get('initial_query') || new URLSearchParams(window.location.search).get('q'));
      if (res.sessions && res.sessions.length > 0 && !activeSessionId && !hasInitQuery && !initialQueryExecuted.current) {
        // Load the most recent session by default
        loadSessionDetails(res.sessions[0].id);
      }
    } catch (err) {
      console.error('Failed to load chat sessions:', err);
    }
  };

  const loadSessionDetails = async (sessionId: string) => {
    setIsFetchingHistory(true);
    setActiveSessionId(sessionId);
    setError(null);
    try {
      const res = await fetchChatRoomDetails(sessionId);
      setMessages(res.messages || []);
    } catch (err: any) {
      console.error('Failed to load session details:', err);
      setError('Gagal memuat riwayat pesan.');
    } finally {
      setIsFetchingHistory(false);
    }
  };

  const handleCreateNewSession = () => {
    setActiveSessionId(null);
    setMessages([]);
    setInputQuery('');
    setError(null);
    inputRef.current?.focus();
  };

  const handleRequestDeleteSession = (e: React.MouseEvent, session: ChatSession) => {
    e.stopPropagation();
    setSessionToDelete({ id: session.id, title: session.title });
  };

  const handleConfirmDeleteSession = async () => {
    if (!sessionToDelete) return;
    try {
      setIsDeletingSession(true);
      await deleteChatRoom(sessionToDelete.id);
      setSessions((prev) => prev.filter((s) => s.id !== sessionToDelete.id));
      if (activeSessionId === sessionToDelete.id) {
        handleCreateNewSession();
      }
      setSessionToDelete(null);
    } catch (err: any) {
      setError(err.message || 'Gagal menghapus sesi riset.');
    } finally {
      setIsDeletingSession(false);
    }
  };

  const handleSendMessage = async (queryText: string) => {
    const textToSend = queryText.trim();
    if (!textToSend || isLoading) return;

    setInputQuery('');
    setError(null);
    setIsLoading(true);

    // Optimistically append user message to thread
    const optimisticUserMsg: ChatMessage = {
      id: Date.now(),
      session_id: activeSessionId || 'temp',
      user_id: user?.id || 1,
      role: 'user',
      content: textToSend,
      created_at: new Date().toISOString()
    };
    setMessages((prev) => [...prev, optimisticUserMsg]);

    try {
      const response: AgentQueryResponse = await queryAgent(
        textToSend,
        undefined,
        activeSessionId || undefined
      );

      // If a new session was created on backend, set it
      if (response.session_id && response.session_id !== activeSessionId) {
        setActiveSessionId(response.session_id);
      }

      // Append assistant message
      const assistantMsg: ChatMessage = {
        id: Date.now() + 1,
        session_id: response.session_id || activeSessionId || 'temp',
        user_id: user?.id || 1,
        role: 'assistant',
        content: response.synthesis.executive_summary,
        report_data: response,
        created_at: new Date().toISOString()
      };

      setMessages((prev) => [...prev, assistantMsg]);

      // Refresh sidebar sessions list
      const updatedSessions = await fetchUserChatSessions();
      setSessions(updatedSessions.sessions || []);

    } catch (err: any) {
      console.error('Query execution error:', err);
      setError(err.message || 'Gagal mengeksekusi penalaran agent.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputQuery);
  };

  // Extract all generated artifacts in this conversation room
  const artifacts: ArtifactItem[] = useMemo(() => {
    return messages
      .filter((m) => m.role === 'assistant' && m.report_data)
      .map((m, idx) => ({
        id: String(m.id || `artifact-${idx}`),
        timestamp: m.created_at
          ? new Date(m.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
          : `Dossier #${idx + 1}`,
        report: m.report_data!,
        query: m.report_data?.query || `Riset Pasar Saham #${idx + 1}`,
        primaryTicker: m.report_data?.primary_ticker,
        intent: m.report_data?.intent,
      }));
  }, [messages]);

  // Get latest assistant report for fallback
  const latestReport = [...messages]
    .reverse()
    .find((m) => m.role === 'assistant' && m.report_data)?.report_data || null;

  const filteredSessions = sessions.filter((s) =>
    s.title.toLowerCase().includes(sessionSearch.toLowerCase()) ||
    (s.primary_ticker && s.primary_ticker.toLowerCase().includes(sessionSearch.toLowerCase()))
  );

  if (isAuthLoading) {
    return (
      <div className="h-screen w-full bg-[#07090e] text-slate-100 flex flex-col overflow-hidden selection:bg-emerald-500 selection:text-black">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <RefreshCw className="h-6 w-6 text-emerald-400 animate-spin" />
            <p className="text-xs text-slate-400 font-medium animate-pulse">Memuat terminal riset...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-black">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-12 flex flex-col justify-center">
          <AuthGate
            featureName="AlphaAgent Research Terminal"
            featureDescription="Akses penalaran AI otonom, multi-turn chat rooms, dan perbandingan emiten interaktif memerlukan autentikasi analis."
          >
            <div />
          </AuthGate>
        </main>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-[#07090e] text-slate-100 flex flex-col overflow-hidden selection:bg-emerald-500 selection:text-black">
      
      {/* Top Navbar */}
      <Navbar />

      {/* Main Workspace Layout with Left Sidebar */}
      <div className="flex-1 flex pt-16 overflow-hidden min-h-0 w-full relative">
        
        {/* ============================================================ */}
        {/* LEFT SIDEBAR: User-Owned Research Sessions History          */}
        {/* ============================================================ */}
        <aside
          className={`${
            isSidebarOpen ? 'w-72 sm:w-80' : 'w-0'
          } shrink-0 bg-[#0a0d16] border-r border-slate-800/80 transition-all duration-300 flex flex-col h-full overflow-hidden relative z-20`}
        >
          {/* Sidebar Header */}
          <div className="p-3 sm:p-4 border-b border-slate-800/80 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
                <MessageSquare className="h-4 w-4" />
              </div>
              <span className="text-xs sm:text-sm font-bold text-white truncate">
                Riwayat Riset Sesi
              </span>
            </div>
            <button
              onClick={handleCreateNewSession}
              title="Mulai Sesi Riset Baru"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition-all shrink-0 active:scale-95 shadow-sm"
            >
              <Plus className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Sesi Baru</span>
            </button>
          </div>

          {/* Search Filter */}
          <div className="p-2 sm:p-3 border-b border-slate-800/60">
            <div className="relative flex items-center rounded-lg bg-slate-900/90 border border-slate-800 px-2.5 py-1.5 text-xs">
              <Search className="h-3.5 w-3.5 text-slate-500 mr-2 shrink-0" />
              <input
                type="text"
                value={sessionSearch}
                onChange={(e) => setSessionSearch(e.target.value)}
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
                return (
                  <div
                    key={s.id}
                    onClick={() => loadSessionDetails(s.id)}
                    className={`group relative flex items-center justify-between p-2.5 rounded-xl text-xs cursor-pointer transition-all ${
                      isActive
                        ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-medium'
                        : 'text-slate-400 hover:bg-slate-900/80 hover:text-slate-200 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <div className={`p-1 rounded-md shrink-0 ${isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
                        <Sparkles className="h-3 w-3" />
                      </div>
                      <div className="min-w-0 truncate">
                        <p className="truncate font-semibold text-slate-200">
                          {s.title}
                        </p>
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                          {s.primary_ticker && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-800 text-cyan-400 font-mono font-bold">
                              <CompanyLogo symbol={s.primary_ticker} size="xs" />
                              <span>{s.primary_ticker}</span>
                            </span>
                          )}
                          <span>{s.message_count ? `${s.message_count} pesan` : 'Baru'}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={(e) => handleRequestDeleteSession(e, s)}
                      title="Hapus Sesi"
                      className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all shrink-0"
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

        {/* ============================================================ */}
        {/* MAIN CONVERSATIONAL WORKSPACE (CENTER)                       */}
        {/* ============================================================ */}
        <section className="flex-1 flex flex-col h-full min-h-0 bg-[#07090e] overflow-hidden relative">
          
          {/* Top Session Bar with Sidebar Toggle */}
          <div className="h-12 border-b border-slate-800/80 bg-[#090d17]/80 backdrop-blur-md px-4 flex items-center justify-between gap-3 shrink-0 z-10">
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                title={isSidebarOpen ? 'Tutup Sidebar' : 'Buka Sidebar'}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                {isSidebarOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeft className="h-4 w-4" />}
              </button>
              
              <div className="flex items-center gap-2 truncate">
                <span className="text-xs font-bold text-slate-300 truncate">
                  {activeSessionId 
                    ? sessions.find((s) => s.id === activeSessionId)?.title || 'Sesi Riset Aktif'
                    : 'Sesi Riset Baru'
                  }
                </span>
                {activeSessionId && (
                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                    Room Terhubung
                  </span>
                )}
              </div>
            </div>

            {/* Claude-Style Artifacts Library Toggle Button */}
            {artifacts.length > 0 && (
              <button
                onClick={() => setIsArtifactPanelOpen(!isArtifactPanelOpen)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all shrink-0 ${
                  isArtifactPanelOpen
                    ? 'bg-emerald-500 text-black border-emerald-400 shadow-md shadow-emerald-500/20 font-bold'
                    : 'bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/30 text-emerald-400'
                }`}
              >
                <FileText className="h-3.5 w-3.5" />
                <span>Artifacts ({artifacts.length})</span>
              </button>
            )}
          </div>

          {/* Scrollable Chat Message Feed */}
          <div className="flex-1 overflow-y-auto min-h-0 px-4 sm:px-6 py-6 space-y-6">
            
            {/* If New / Empty Session: Show Welcome & Radar Presets */}
            {messages.length === 0 && !isLoading && (
              <div className="max-w-3xl mx-auto py-8 text-center animate-in fade-in duration-300">
                <div className="inline-flex p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-4">
                  <Bot className="h-8 w-8" />
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white mb-2">
                  AlphaAgent Research Terminal
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto mb-8">
                  Ajukan analisis pasar modal IDX, komparasi multi-emiten, pelacakan bandarmology broker, atau pilih salah satu preset di bawah untuk memulai sesi riset otonom.
                </p>

                {/* Radar Presets */}
                <div className="text-left">
                  <TradeIdeasRadar onSelectPreset={(presetQuery) => handleSendMessage(presetQuery)} />
                </div>
              </div>
            )}

            {/* Render Multi-Turn Message Stream */}
            {messages.map((msg, index) => {
              const isUser = msg.role === 'user';
              const report = msg.report_data;

              const isLastAssistant = !isUser && index === messages.length - 1;

              return (
                <div
                  key={msg.id || index}
                  ref={isLastAssistant ? latestAssistantMsgRef : null}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-4xl mx-auto w-full scroll-mt-6`}
                >
                  {/* Message Sender Header */}
                  <div className="flex items-center gap-2 mb-1.5 text-[11px] text-slate-400">
                    {isUser ? (
                      <>
                        <span className="font-semibold text-slate-300">Anda (Analyst)</span>
                        <div className="p-1 rounded-md bg-slate-800 text-slate-300">
                          <UserIcon className="h-3 w-3" />
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="p-1 rounded-md bg-emerald-500/20 text-emerald-400">
                          <Bot className="h-3 w-3" />
                        </div>
                        <span className="font-semibold text-emerald-400">AlphaSector Agent</span>
                      </>
                    )}
                  </div>

                  {/* Message Body Content */}
                  {isUser ? (
                    <div className="p-3.5 sm:p-4 rounded-2xl rounded-tr-none bg-emerald-600/90 text-white text-xs sm:text-sm shadow-lg max-w-xl leading-relaxed animate-card-reveal">
                      {msg.content}
                    </div>
                  ) : (
                    <div className="w-full space-y-5 animate-card-reveal">
                      
                      {/* Live/Completed Thinking Trace Accordion */}
                      {report?.reasoning_trace && (
                        <div className="animate-card-reveal">
                          <AgentThinkingTrace
                            steps={report.reasoning_trace}
                            totalTimeMs={report.total_execution_time_ms}
                            creditsConsumed={report.credits_consumed}
                            isLoading={false}
                          />
                        </div>
                      )}

                      {/* Executive Narrative Synthesis Card */}
                      {report?.synthesis && (
                        <div className="rounded-2xl border border-slate-800 bg-[#0d121e]/90 p-5 sm:p-6 shadow-2xl glass-panel animate-card-reveal-delay-1">
                          <div className="flex items-center justify-between gap-4 pb-3 border-b border-slate-800 mb-3">
                            <div className="flex items-center gap-2">
                              <Sparkles className="h-4 w-4 text-emerald-400" />
                              <h3 className="text-sm font-bold text-white">
                                Sintesis Riset Otonom
                              </h3>
                            </div>
                            <span className="text-[11px] font-mono text-slate-500">
                              Verified IDX Fact-Grounded
                            </span>
                          </div>

                          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed mb-4">
                            {report.synthesis.executive_summary}
                          </p>

                          {/* Key Findings & Multiples */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-slate-800/60 text-xs">
                            <div>
                              <h4 className="font-bold text-slate-400 uppercase tracking-wider mb-2 text-[10px]">
                                Key Findings & Highlights
                              </h4>
                              <ul className="space-y-1.5 text-slate-300">
                                {report.synthesis.key_findings.map((f, fi) => (
                                  <li key={fi} className="flex items-start gap-2">
                                    <span className="text-emerald-400 mt-0.5">•</span>
                                    <span>{f}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <div>
                              <h4 className="font-bold text-slate-400 uppercase tracking-wider mb-2 text-[10px]">
                                Valuasi & Smart Money Signal
                              </h4>
                              <div className="space-y-2">
                                <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 text-slate-300">
                                  <strong className="text-cyan-400">Valuasi:</strong> {report.synthesis.valuation_verdict || 'N/A'}
                                </div>
                                <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 text-slate-300">
                                  <strong className="text-amber-400">Smart Money:</strong> {report.synthesis.smart_money_flow || 'N/A'}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Claude-Style Interactive Inline Artifact Card */}
                      {report && (
                        <div
                          onClick={() => {
                            setSelectedArtifactId(String(msg.id || `artifact-${index}`));
                            setIsArtifactPanelOpen(true);
                          }}
                          className="p-3.5 rounded-2xl bg-[#090e1a] border border-emerald-500/30 hover:border-emerald-400/70 hover:bg-[#0c1426] transition-all cursor-pointer group flex items-center justify-between shadow-lg animate-card-reveal-delay-1 hover:scale-[1.008]"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="h-9 w-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform shrink-0">
                              <FileText className="h-4 w-4" />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors truncate">
                                  {report.query || 'Research Dossier'}
                                </span>
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20 shrink-0">
                                  Artifact Dossier
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-400 mt-0.5">
                                Buka pratinjau lengkap di Artifact Panel ➔
                              </p>
                            </div>
                          </div>
                          <ArrowRight className="h-4 w-4 text-emerald-400 group-hover:translate-x-1 transition-transform shrink-0" />
                        </div>
                      )}

                      {/* Interactive Financial Cards */}
                      {report?.metrics_summary && (
                        <div className="animate-card-reveal-delay-2">
                          <Company360Card data={report.metrics_summary} />
                        </div>
                      )}

                      {report?.peer_matrix && report.peer_matrix.length > 0 && (
                        <div className="animate-card-reveal-delay-2">
                          <PeerBattleMatrix matrix={report.peer_matrix} />
                        </div>
                      )}

                      {report?.broker_summary && (
                        <div className="animate-card-reveal-delay-2">
                          <BrokerFlowTracker
                            brokerSummary={report.broker_summary}
                            ticker={report.primary_ticker}
                          />
                        </div>
                      )}

                      {/* ============================================================ */}
                      {/* AI-GENERATED FOLLOW-UP QUESTIONS (SMART PROMPT PILLS)       */}
                      {/* ============================================================ */}
                      {report?.suggested_followups && report.suggested_followups.length > 0 && (
                        <div className="pt-2 animate-card-reveal-delay-3">
                          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                            <Sparkles className="h-3 w-3 text-emerald-400" />
                            <span>Pertanyaan Lanjutan yang Disarankan AI:</span>
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {report.suggested_followups.map((followup, fIdx) => (
                              <button
                                key={fIdx}
                                onClick={() => handleSendMessage(followup)}
                                disabled={isLoading}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-emerald-950/40 border border-slate-700/80 hover:border-emerald-500/50 text-slate-300 hover:text-emerald-300 text-xs text-left transition-all active:scale-95 group shadow-sm"
                              >
                                <span className="line-clamp-1">{followup}</span>
                                <ArrowRight className="h-3 w-3 text-slate-500 group-hover:text-emerald-400 shrink-0 transition-transform group-hover:translate-x-0.5" />
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                    </div>
                  )}
                </div>
              );
            })}

            {/* Live Interactive Reasoning Trace Streamer */}
            {isLoading && (
              <LiveThinkingTrace query={inputQuery} />
            )}

            {/* Error & Quota Alert */}
            {error && (
              <div className="max-w-4xl mx-auto w-full p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-card-reveal shadow-xl">
                <div className="flex items-start sm:items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5 sm:mt-0" />
                  <div>
                    <p className="font-semibold text-amber-200">{error}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {error.includes('KUOTA_HABIS') || error.includes('402')
                        ? 'Pasang API Key Sectors pribadi Anda untuk melanjutkan riset tanpa batasan kuota demo server.'
                        : 'Periksa koneksi jaringan atau coba ulangi query Anda.'}
                    </p>
                  </div>
                </div>

                {(error.includes('KUOTA_HABIS') || error.includes('402') || error.includes('Settings')) && (
                  <Link
                    href="/settings"
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:brightness-110 text-black font-bold text-xs shrink-0 transition-all active:scale-95 shadow-md shadow-emerald-500/10"
                  >
                    <Settings className="h-3.5 w-3.5" />
                    <span>Buka Halaman Settings (BYOK)</span>
                  </Link>
                )}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* ============================================================ */}
          {/* BOTTOM FIXED CHAT INPUT BAR                                  */}
          {/* ============================================================ */}
          <div className="p-3 sm:p-4 border-t border-slate-800/80 bg-[#080b13]/95 backdrop-blur-md shrink-0">
            <form
              onSubmit={handleSubmit}
              className="max-w-4xl mx-auto relative flex items-center rounded-2xl border border-slate-700/80 bg-[#0d121e] p-2 shadow-2xl focus-within:border-emerald-500/80 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all glow-emerald"
            >
              <Search className="h-4 w-4 text-emerald-400 ml-3 mr-2 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder="Tanyakan analisis emiten ke AlphaAgent (misal: Bandingkan BBCA vs BBRI, atau periksa foreign flow ASII)..."
                className="w-full bg-transparent text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none px-2 py-1"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !inputQuery.trim()}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-black text-xs font-bold hover:brightness-110 active:scale-95 disabled:opacity-40 disabled:pointer-events-none transition-all shrink-0"
              >
                {isLoading ? (
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <>
                    <span className="hidden sm:inline">Kirim</span>
                    <Send className="h-3.5 w-3.5" />
                  </>
                )}
              </button>
            </form>
            <p className="text-[10px] text-slate-600 text-center mt-2">
              Sesi terenkripsi dan tersimpan di database lokal Anda • Data resmi Sectors Financial API
            </p>
          </div>

        </section>

        {/* ============================================================ */}
        {/* RIGHT SIDEBAR: Claude-Style Artifacts & Dossier Library       */}
        {/* ============================================================ */}
        <CopilotArtifactPanel
          isOpen={isArtifactPanelOpen}
          onClose={() => setIsArtifactPanelOpen(false)}
          artifacts={artifacts}
          selectedArtifactId={selectedArtifactId}
          onSelectArtifact={(id) => setSelectedArtifactId(id)}
          onOpenFullscreenModal={(rep) => {
            setActiveModalReport(rep);
            setIsDossierOpen(true);
          }}
        />

      </div>

      {/* Exportable Research Dossier Modal */}
      {(activeModalReport || latestReport) && (
        <ResearchDossierModal
          isOpen={isDossierOpen}
          onClose={() => {
            setIsDossierOpen(false);
            setActiveModalReport(null);
          }}
          report={activeModalReport || latestReport!}
        />
      )}

      {/* Institutional Reusable Confirmation Modal */}
      <ConfirmModal
        isOpen={!!sessionToDelete}
        onClose={() => setSessionToDelete(null)}
        onConfirm={handleConfirmDeleteSession}
        title="Hapus Sesi Riset"
        description={
          <>
            Apakah Anda yakin ingin menghapus sesi riset{' '}
            <span className="font-semibold text-white">"{sessionToDelete?.title}"</span>? Seluruh riwayat percakapan dan dossier di dalamnya akan dihapus secara permanen dari database.
          </>
        }
        confirmText="Hapus Sesi"
        cancelText="Batal"
        variant="danger"
        isLoading={isDeletingSession}
      />

    </div>
  );
}
