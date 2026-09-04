'use client';

import React, { useState, useEffect, useRef, useMemo, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { AgentThinkingTrace } from '@/components/AgentThinkingTrace';
import { Company360Card } from '@/components/Company360Card';
import { PeerBattleMatrix } from '@/components/PeerBattleMatrix';
import { BrokerFlowTracker } from '@/components/BrokerFlowTracker';
import { TradeIdeasRadar } from '@/components/TradeIdeasRadar';
import { ResearchDossierModal } from '@/components/ResearchDossierModal';
import { ConfirmModal } from '@/components/ConfirmModal';
import { CopilotArtifactPanel, ArtifactItem } from '@/components/CopilotArtifactPanel';
import { CompanyLogo } from '@/components/CompanyLogo';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
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
  ArrowRight, ShieldCheck, TrendingUp, FileText, Layers, Settings, Key,
  Paperclip, Image as ImageIcon, X
} from 'lucide-react';
import { AuthGate } from '@/components/AuthGate';
import { AlphaAgentLogo } from '@/components/AlphaAgentLogo';

const STOPWORDS_SESSION = new Set([
  'BATU', 'BARA', 'SAHM', 'SAHA', 'KOTA', 'DANA', 'PROS', 'EMIT', 'SEKT', 'JASA',
  'LUAR', 'BAIK', 'JELE', 'BESR', 'KECI', 'KUAT', 'LEMA', 'MURH', 'MAHL', 'TING',
  'REND', 'SKOR', 'HASI', 'TAMP', 'TIPE', 'JENI', 'KATA', 'BANY', 'SEDI', 'PERK',
  'SEMI', 'GAYA', 'TEMA', 'MODL', 'EFIS', 'KARY', 'LEAD', 'TITN', 'GROW', 'VALU',
  'DIVI', 'YILD', 'ROEE', 'ROAA', 'DERR', 'NPMM', 'PBVV', 'PERR', 'MCAP', 'CAPS',
  'SEGI', 'CARA', 'OPSI', 'PILI', 'MENU', 'TABL', 'ROWW', 'COLL', 'KOLO', 'SLOT',
  'CARI', 'CEK', 'LIAT', 'BAGI', 'BACA', 'MAU', 'DENG', 'DATA', 'INFO', 'PEER',
  'FLOW', 'FUND', 'BANK', 'LABA', 'RUGI', 'NAIK', 'TURU', 'JUAL', 'BELI', 'RISK',
  'DEBT', 'YIEL', 'VIEW', 'LIST', 'HELP', 'BEST', 'GOOD', 'MORE', 'LESS', 'SHOW',
  'FIND', 'RANK', 'GAIN', 'LOSS', 'RATE', 'TIME', 'DATE', 'TEST', 'CODE', 'TYPE',
  'TEXT', 'FREE', 'PAGE', 'USER', 'CHAT', 'AUTO', 'TERM', 'COST', 'DEAL', 'SEEK',
  'FAST', 'SLOW', 'TRUE', 'ELSE', 'NULL', 'ITEM', 'NEWS', 'PORT', 'DARI', 'YANG',
  'PADA', 'BISA', 'KITA', 'ATAU', 'IKUT', 'MAKA', 'AKAN', 'SAAT', 'JUGA', 'KAMI',
  'ADAK', 'POST', 'JSON', 'HTTP', 'REST', 'BEDA', 'MANA', 'BUAT', 'PULA', 'SAJA',
  'POIN', 'SATU', 'DUAA', 'TIGA', 'LIMA', 'ENAM', 'RIBU', 'JUTA', 'TRIL', 'SINI',
  'SANA', 'SITU', 'APAL', 'AGAR', 'BIAR', 'SIAP', 'PERU', 'INDX', 'KAYA', 'TREN',
  'POLA', 'AWAL', 'AKHR', 'BLAN', 'THUN', 'HARI', 'MING', 'TAHN', 'KIRA', 'SUDA',
  'TELH', 'LALU', 'KEMU', 'KINI', 'HANY', 'CUMA', 'LAIN', 'BEBR', 'TRUS', 'DULU',
  'LGIK', 'MASI', 'MASA', 'SAMA', 'SEGI'
]);

function extractSessionTickers(session: ChatSession): string[] {
  const text = `${session.title || ''} ${session.primary_ticker || ''}`;
  const matches = text.match(/\b[A-Z]{4}\b/g) || [];
  const validTickers: string[] = [];
  
  for (const m of matches) {
    const sym = m.toUpperCase();
    if (!STOPWORDS_SESSION.has(sym) && !validTickers.includes(sym)) {
      validTickers.push(sym);
    }
  }

  if (validTickers.length === 0 && session.primary_ticker) {
    const sym = session.primary_ticker.toUpperCase().replace('.JK', '');
    if (!STOPWORDS_SESSION.has(sym) && !validTickers.includes(sym)) {
      validTickers.push(sym);
    }
  }

  return validTickers.slice(0, 4);
}

function formatLastInteraction(dateStr?: string): string {
  if (!dateStr) return 'Baru saja';
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 1) return 'Baru saja';
    if (diffMins < 60) return `${diffMins} mnt lalu`;
    if (diffHours < 24 && now.getDate() === d.getDate()) {
      return `Hari ini, ${d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`;
    }
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  } catch {
    return 'Baru saja';
  }
}

function CopilotWorkspace() {
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const searchParams = useSearchParams();
  const sessionIdParam = searchParams.get('session_id');
  const initialQueryParam = searchParams.get('initial_query') || searchParams.get('q');
  
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

  // Multimodal Image State
  const [attachedImage, setAttachedImage] = useState<{
    base64: string;
    mimeType: string;
    previewUrl: string;
    fileName: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Modal State for session deletion
  const [sessionToDelete, setSessionToDelete] = useState<{ id: string; title: string } | null>(null);
  const [isDeletingSession, setIsDeletingSession] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const latestAssistantMsgRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  // Initialize sessions and handle navigation from Peer Battle, Smart Money, or Screener
  useEffect(() => {
    let isMounted = true;

    const initCopilotWorkspace = async () => {
      if (!user) return;

      try {
        const res = await fetchUserChatSessions();
        if (!isMounted) return;
        const userSessions = res.sessions || [];
        setSessions(userSessions);

        if (sessionIdParam) {
          // Direct handshake from Peer Battle / Smart Money (zero re-generation)
          await handleSelectSession(sessionIdParam);
        } else if (initialQueryParam && !initialQueryExecuted.current) {
          // Initial prompt from Screener
          initialQueryExecuted.current = true;
          setActiveSessionId(null);
          setMessages([]);
          await handleSendMessage(initialQueryParam);
        } else if (userSessions.length > 0 && !activeSessionId) {
          // Default: load latest existing session
          await handleSelectSession(userSessions[0].id);
        }
      } catch (err) {
        console.error('Failed to initialize copilot workspace:', err);
      }
    };

    initCopilotWorkspace();

    return () => {
      isMounted = false;
    };
  }, [user, sessionIdParam]);

  // Load message history when session selected
  useEffect(() => {
    if (sessionIdParam && sessionIdParam !== activeSessionId) {
      handleSelectSession(sessionIdParam);
    }
  }, [sessionIdParam]);

  const handleSelectSession = async (sessionId: string) => {
    try {
      setIsFetchingHistory(true);
      setActiveSessionId(sessionId);
      setError(null);
      const res = await fetchChatRoomDetails(sessionId);
      setMessages(res.messages || []);
    } catch (err: any) {
      console.error('Failed to load session history:', err);
      setError('Gagal memuat riwayat percakapan sesi ini.');
    } finally {
      setIsFetchingHistory(false);
    }
  };

  const handleCreateNewSession = () => {
    setActiveSessionId(null);
    setMessages([]);
    setInputQuery('');
    setError(null);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.focus();
    }
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

  // Reusable Image File Processor for both File Input and Clipboard Paste
  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Hanya file gambar (PNG, JPG, WEBP) yang didukung.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Ukuran gambar maksimal adalah 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64Data = result.split(',')[1];
      setAttachedImage({
        base64: base64Data,
        mimeType: file.type,
        previewUrl: result,
        fileName: file.name || 'clipboard-image.png'
      });
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  // Handle Image Selection via File Browser
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processImageFile(file);
    e.target.value = '';
  };

  // Handle Clipboard Paste directly in textarea
  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.indexOf('image') !== -1) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file) {
          processImageFile(file);
        }
        break;
      }
    }
  };

  const handleRemoveImage = () => {
    setAttachedImage(null);
  };

  // Auto-resize textarea up to max 3 lines (~84px) and wrap properly
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputQuery(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 84)}px`;
    }
  };

  // Handle Enter to Send, Shift+Enter for new line
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading && (inputQuery.trim() || attachedImage)) {
        handleSendMessage(inputQuery);
      }
    }
  };

  const handleSendMessage = async (queryText: string) => {
    const textToSend = queryText.trim();
    if ((!textToSend && !attachedImage) || isLoading) return;

    const currentImg = attachedImage;
    setAttachedImage(null);
    setInputQuery('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    setError(null);
    setIsLoading(true);

    const defaultQuery = textToSend || (currentImg ? 'Jelaskan dan analisis konteks gambar finansial ini secara mendalam' : '');

    // Optimistically append user message to thread
    const optimisticUserMsg: ChatMessage = {
      id: Date.now(),
      session_id: activeSessionId || 'temp',
      user_id: user?.id || 1,
      role: 'user',
      content: defaultQuery,
      image_url: currentImg?.previewUrl,
      created_at: new Date().toISOString()
    };
    setMessages((prev) => [...prev, optimisticUserMsg]);

    try {
      const response: AgentQueryResponse = await queryAgent(
        defaultQuery,
        undefined,
        activeSessionId || undefined,
        currentImg?.base64,
        currentImg?.mimeType
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

  // Extract all generated artifacts in this conversation room (filter out conversational follow-up text)
  const artifacts: ArtifactItem[] = useMemo(() => {
    return messages
      .filter((m) => {
        if (m.role !== 'assistant' || !m.report_data) return false;
        const rep = m.report_data;
        const isConversational = !rep.peer_matrix && !rep.broker_summary && (!rep.synthesis?.key_findings || rep.synthesis.key_findings.length === 0);
        return !isConversational;
      })
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
                const tickers = extractSessionTickers(s);
                return (
                  <div
                    key={s.id}
                    onClick={() => handleSelectSession(s.id)}
                    className={`group relative flex items-center justify-between p-2.5 rounded-xl text-xs cursor-pointer transition-all ${
                      isActive
                        ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-medium'
                        : 'text-slate-400 hover:bg-slate-900/80 hover:text-slate-200 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-2 flex-1">
                      {/* Left: Complete Company Logos Cluster (No star icon) */}
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
                        ) : (
                          <div className={`p-1.5 rounded-lg shrink-0 ${isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
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
                <div className="inline-flex p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-4 shadow-lg shadow-emerald-500/5">
                  <AlphaAgentLogo size={44} glow />
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
                  {/* Message Sender Header (Only for AlphaAgent Assistant) */}
                  {!isUser && (
                    <div className="flex items-center gap-2 mb-1.5 text-[11px] text-slate-400">
                      <div className="p-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                        <AlphaAgentLogo size={16} />
                      </div>
                      <span className="font-semibold text-emerald-400">AlphaAgent</span>
                    </div>
                  )}

                  {/* Message Body Content */}
                  {isUser ? (
                    <div className="p-3.5 sm:p-4 rounded-2xl rounded-tr-none bg-emerald-600/90 text-white text-xs sm:text-sm shadow-lg max-w-xl leading-relaxed animate-card-reveal flex flex-col gap-2.5">
                      {msg.image_url && (
                        <div className="rounded-xl overflow-hidden border border-emerald-400/30 bg-black/20 max-h-64 flex items-center justify-center">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={msg.image_url}
                            alt="Attached financial chart"
                            className="max-h-60 w-auto object-contain rounded-lg hover:scale-105 transition-transform duration-200"
                          />
                        </div>
                      )}
                      <div>{msg.content}</div>
                    </div>
                  ) : (!report?.peer_matrix && !report?.broker_summary && (!report?.synthesis?.key_findings || report.synthesis.key_findings.length === 0)) ? (
                    /* Conversational Follow-Up Mode: Clean Markdown Bubble with Custom Tables */
                    <div className="w-full space-y-2 animate-card-reveal">
                      <div className="p-4 sm:p-5 rounded-2xl rounded-tl-none bg-[#0d121e]/90 border border-slate-800 shadow-xl glass-panel text-slate-200">
                        <MarkdownRenderer content={msg.content || report?.synthesis?.executive_summary || ''} />
                      </div>
                    </div>
                  ) : (
                    /* Autonomous Research Dossier Mode with Feature-Aware Signature Layout Builder */
                    (() => {
                      const isMarketScreening = Boolean(
                        report?.intent === 'MARKET_SCREENING_DISCOVERY'
                      );
                      const isPeerBattle = Boolean(
                        !isMarketScreening && (
                          report?.intent === 'PEER_BATTLE_COMPARISON' ||
                          (report?.peer_matrix && report.peer_matrix.length > 1 && !report?.metrics_summary)
                        )
                      );
                      const isSmartMoney = Boolean(
                        report?.intent === 'SMART_MONEY_RADAR' ||
                        (report?.broker_summary && !report?.peer_matrix && !report?.metrics_summary)
                      );
                      const isCompany360 = Boolean(
                        report?.intent === 'SINGLE_TICKER_DEEP_DIVE' ||
                        (report?.metrics_summary && !report?.peer_matrix)
                      );


                      return (
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

                          {/* ============================================================ */}
                          {/* 1. PEER BATTLE SIGNATURE LAYOUT (Matches /battle exactly)     */}
                          {/* ============================================================ */}
                          {isPeerBattle && (
                            <>
                              {/* Prominent Multi-Emiten Head-to-Head Comparison Matrix */}
                              {report?.peer_matrix && report.peer_matrix.length > 0 && (
                                <div className="animate-card-reveal-delay-1">
                                  <PeerBattleMatrix matrix={report.peer_matrix} />
                                </div>
                              )}

                              {/* Cyan-Themed Ringkasan & Valuation Verdict Card */}
                              {report?.synthesis && (
                                <div className="rounded-2xl border border-slate-800 bg-[#0d121e]/90 p-5 sm:p-6 shadow-2xl glass-panel glow-cyan animate-card-reveal-delay-2">
                                  <div className="flex items-center justify-between gap-4 pb-3 border-b border-slate-800 mb-3">
                                    <div className="flex items-center gap-2">
                                      <Sparkles className="h-4 w-4 text-cyan-400" />
                                      <h3 className="text-sm font-bold text-white">
                                        Ringkasan & Valuation Verdict (AI Synthesis)
                                      </h3>
                                    </div>
                                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 font-semibold border border-cyan-500/20">
                                      Peer Battle Head-to-Head
                                    </span>
                                  </div>

                                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed mb-4">
                                    {report.synthesis.executive_summary}
                                  </p>

                                  {report.synthesis.valuation_verdict && (
                                    <div className="p-3.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-xs text-cyan-200 mb-3 font-medium">
                                      <strong className="text-cyan-400">Valuation Verdict:</strong> {report.synthesis.valuation_verdict}
                                    </div>
                                  )}

                                  {report.synthesis.key_findings && report.synthesis.key_findings.length > 0 && (
                                    <div className="pt-3 border-t border-slate-800/60 text-xs">
                                      <h4 className="font-bold text-slate-400 uppercase tracking-wider mb-2 text-[10px]">
                                        Key Comparative Highlights
                                      </h4>
                                      <ul className="space-y-1.5 text-slate-300">
                                        {report.synthesis.key_findings.map((f, fi) => (
                                          <li key={fi} className="flex items-start gap-2">
                                            <span className="text-cyan-400 mt-0.5">•</span>
                                            <span>{f}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Cyan-Accented Artifact Dossier Link */}
                              {report && (
                                <div
                                  onClick={() => {
                                    setSelectedArtifactId(String(msg.id || `artifact-${index}`));
                                    setIsArtifactPanelOpen(true);
                                  }}
                                  className="p-3.5 rounded-2xl bg-[#090e1a] border border-cyan-500/30 hover:border-cyan-400/70 hover:bg-[#0c1426] transition-all cursor-pointer group flex items-center justify-between shadow-lg animate-card-reveal-delay-2 hover:scale-[1.008]"
                                >
                                  <div className="flex items-center gap-3 min-w-0">
                                    <div className="h-9 w-9 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform shrink-0">
                                      <FileText className="h-4 w-4" />
                                    </div>
                                    <div className="min-w-0">
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors truncate">
                                          {report.query || 'Peer Battle Dossier'}
                                        </span>
                                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 font-semibold border border-cyan-500/20 shrink-0">
                                          Peer Battle Dossier
                                        </span>
                                      </div>
                                      <p className="text-[11px] text-slate-400 mt-0.5">
                                        Buka visualisasi komparatif lengkap di Artifact Panel ➔
                                      </p>
                                    </div>
                                  </div>
                                  <ArrowRight className="h-4 w-4 text-cyan-400 group-hover:translate-x-1 transition-transform shrink-0" />
                                </div>
                              )}
                            </>
                          )}

                          {/* ============================================================ */}
                          {/* 2. SMART MONEY SIGNATURE LAYOUT (Matches /smart-money)       */}
                          {/* ============================================================ */}
                          {isSmartMoney && (
                            <>
                              {/* Broker Flow Tracker Component */}
                              {report?.broker_summary && (
                                <div className="animate-card-reveal-delay-1">
                                  <BrokerFlowTracker
                                    brokerSummary={report.broker_summary}
                                    ticker={report.primary_ticker}
                                  />
                                </div>
                              )}

                              {/* Amber/Teal-Themed Smart Money Synthesis Card */}
                              {report?.synthesis && (
                                <div className="rounded-2xl border border-slate-800 bg-[#0d121e]/90 p-5 sm:p-6 shadow-2xl glass-panel glow-emerald animate-card-reveal-delay-2">
                                  <div className="flex items-center justify-between gap-4 pb-3 border-b border-slate-800 mb-3">
                                    <div className="flex items-center gap-2">
                                      <Sparkles className="h-4 w-4 text-amber-400" />
                                      <h3 className="text-sm font-bold text-white">
                                        Sintesis Smart Money {report.primary_ticker ? `(${report.primary_ticker})` : ''}
                                      </h3>
                                    </div>
                                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 font-semibold border border-amber-500/20">
                                      Bandarmology & Flow
                                    </span>
                                  </div>

                                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed mb-4">
                                    {report.synthesis.executive_summary}
                                  </p>

                                  {report.synthesis.smart_money_flow && (
                                    <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 mb-3 font-medium">
                                      <strong className="text-amber-400">Deteksi Flow:</strong> {report.synthesis.smart_money_flow}
                                    </div>
                                  )}

                                  {report.synthesis.key_findings && report.synthesis.key_findings.length > 0 && (
                                    <div className="pt-3 border-t border-slate-800/60 text-xs">
                                      <h4 className="font-bold text-slate-400 uppercase tracking-wider mb-2 text-[10px]">
                                        Broker Accumulation Highlights
                                      </h4>
                                      <ul className="space-y-1.5 text-slate-300">
                                        {report.synthesis.key_findings.map((f, fi) => (
                                          <li key={fi} className="flex items-start gap-2">
                                            <span className="text-amber-400 mt-0.5">•</span>
                                            <span>{f}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Amber-Accented Artifact Dossier Link */}
                              {report && (
                                <div
                                  onClick={() => {
                                    setSelectedArtifactId(String(msg.id || `artifact-${index}`));
                                    setIsArtifactPanelOpen(true);
                                  }}
                                  className="p-3.5 rounded-2xl bg-[#090e1a] border border-amber-500/30 hover:border-amber-400/70 hover:bg-[#0c1426] transition-all cursor-pointer group flex items-center justify-between shadow-lg animate-card-reveal-delay-2 hover:scale-[1.008]"
                                >
                                  <div className="flex items-center gap-3 min-w-0">
                                    <div className="h-9 w-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform shrink-0">
                                      <FileText className="h-4 w-4" />
                                    </div>
                                    <div className="min-w-0">
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors truncate">
                                          {report.query || 'Smart Money Dossier'}
                                        </span>
                                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 font-semibold border border-amber-500/20 shrink-0">
                                          Smart Money Dossier
                                        </span>
                                      </div>
                                      <p className="text-[11px] text-slate-400 mt-0.5">
                                        Buka visualisasi flow lengkap di Artifact Panel ➔
                                      </p>
                                    </div>
                                  </div>
                                  <ArrowRight className="h-4 w-4 text-amber-400 group-hover:translate-x-1 transition-transform shrink-0" />
                                </div>
                              )}
                            </>
                          )}

                          {/* ============================================================ */}
                          {/* 3. COMPANY 360 DEEP DIVE SIGNATURE LAYOUT (Single Ticker)     */}
                          {/* ============================================================ */}
                          {isCompany360 && (
                            <>
                              {/* 360 Fundamental Overview Card */}
                              {report?.metrics_summary && (
                                <div className="animate-card-reveal-delay-1">
                                  <Company360Card data={report.metrics_summary} />
                                </div>
                              )}

                              {/* Fundamental AI Synthesis Card */}
                              {report?.synthesis && (
                                <div className="rounded-2xl border border-slate-800 bg-[#0d121e]/90 p-5 sm:p-6 shadow-2xl glass-panel glow-emerald animate-card-reveal-delay-2">
                                  <div className="flex items-center justify-between gap-4 pb-3 border-b border-slate-800 mb-3">
                                    <div className="flex items-center gap-2">
                                      <Sparkles className="h-4 w-4 text-emerald-400" />
                                      <h3 className="text-sm font-bold text-white">
                                        Sintesis Riset Fundamental ({report.primary_ticker || 'Emiten'})
                                      </h3>
                                    </div>
                                    <span className="text-[11px] font-mono text-slate-500">
                                      Verified IDX Fact-Grounded
                                    </span>
                                  </div>

                                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed mb-4">
                                    {report.synthesis.executive_summary}
                                  </p>

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
                                        Valuasi & Sinyal Pasar
                                      </h4>
                                      <div className="space-y-2">
                                        <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 text-slate-300">
                                          <strong className="text-cyan-400">Valuasi:</strong> {report.synthesis.valuation_verdict || 'N/A'}
                                        </div>
                                        {report.synthesis.smart_money_flow && (
                                          <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 text-slate-300">
                                            <strong className="text-amber-400">Smart Money:</strong> {report.synthesis.smart_money_flow}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Optional Secondary Broker Flow if available */}
                              {report?.broker_summary && (
                                <div className="animate-card-reveal-delay-2">
                                  <BrokerFlowTracker
                                    brokerSummary={report.broker_summary}
                                    ticker={report.primary_ticker}
                                  />
                                </div>
                              )}

                              {/* Artifact Link */}
                              {report && (
                                <div
                                  onClick={() => {
                                    setSelectedArtifactId(String(msg.id || `artifact-${index}`));
                                    setIsArtifactPanelOpen(true);
                                  }}
                                  className="p-3.5 rounded-2xl bg-[#090e1a] border border-emerald-500/30 hover:border-emerald-400/70 hover:bg-[#0c1426] transition-all cursor-pointer group flex items-center justify-between shadow-lg animate-card-reveal-delay-2 hover:scale-[1.008]"
                                >
                                  <div className="flex items-center gap-3 min-w-0">
                                    <div className="h-9 w-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform shrink-0">
                                      <FileText className="h-4 w-4" />
                                    </div>
                                    <div className="min-w-0">
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors truncate">
                                          {report.query || 'Company 360 Dossier'}
                                        </span>
                                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20 shrink-0">
                                          Company 360 Dossier
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
                            </>
                          )}

                          {/* ============================================================ */}
                          {/* 4. MARKET SCREENING DISCOVERY SIGNATURE LAYOUT               */}
                          {/* ============================================================ */}
                          {isMarketScreening && (
                            <>
                              {/* Screened Peer Universe Table */}
                              {report?.peer_matrix && report.peer_matrix.length > 0 && (
                                <div className="animate-card-reveal-delay-1">
                                  <div className="mb-2 flex items-center justify-between">
                                    <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                                      <Layers className="h-3.5 w-3.5 text-emerald-400" />
                                      Hasil Saring Semesta Emiten ({report.peer_matrix.length} Emiten Terpilih)
                                    </span>
                                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                                      Screener Discovery
                                    </span>
                                  </div>
                                  <PeerBattleMatrix matrix={report.peer_matrix} />
                                </div>
                              )}

                              {/* Emerald/Teal-Themed Screening Thesis Card */}
                              {report?.synthesis && (
                                <div className="rounded-2xl border border-slate-800 bg-[#0d121e]/90 p-5 sm:p-6 shadow-2xl glass-panel glow-emerald animate-card-reveal-delay-2">
                                  <div className="flex items-center justify-between gap-4 pb-3 border-b border-slate-800 mb-3">
                                    <div className="flex items-center gap-2">
                                      <Sparkles className="h-4 w-4 text-emerald-400" />
                                      <h3 className="text-sm font-bold text-white">
                                        Tesis Investasi & Temuan Skrining
                                      </h3>
                                    </div>
                                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 font-semibold border border-emerald-500/20">
                                      Screener Discovery Thesis
                                    </span>
                                  </div>

                                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed mb-4">
                                    {report.synthesis.executive_summary}
                                  </p>

                                  {report.synthesis.valuation_verdict && (
                                    <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-200 mb-3 font-medium">
                                      <strong className="text-emerald-400">Rekomendasi & Top Pick:</strong> {report.synthesis.valuation_verdict}
                                    </div>
                                  )}

                                  {report.synthesis.key_findings && report.synthesis.key_findings.length > 0 && (
                                    <div className="pt-3 border-t border-slate-800/60 text-xs">
                                      <h4 className="font-bold text-slate-400 uppercase tracking-wider mb-2 text-[10px]">
                                        Katalis & Alasan Pemilihan Emiten
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
                                  )}
                                </div>
                              )}

                              {/* Emerald-Accented Artifact Link */}
                              {report && (
                                <div
                                  onClick={() => {
                                    setSelectedArtifactId(String(msg.id || `artifact-${index}`));
                                    setIsArtifactPanelOpen(true);
                                  }}
                                  className="p-3.5 rounded-2xl bg-[#090e1a] border border-emerald-500/30 hover:border-emerald-400/70 hover:bg-[#0c1426] transition-all cursor-pointer group flex items-center justify-between shadow-lg animate-card-reveal-delay-2 hover:scale-[1.008]"
                                >
                                  <div className="flex items-center gap-3 min-w-0">
                                    <div className="h-9 w-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform shrink-0">
                                      <FileText className="h-4 w-4" />
                                    </div>
                                    <div className="min-w-0">
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors truncate">
                                          {report.query || 'Screener Discovery Dossier'}
                                        </span>
                                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20 shrink-0">
                                          Screener Dossier
                                        </span>
                                      </div>
                                      <p className="text-[11px] text-slate-400 mt-0.5">
                                        Buka hasil skrining dan metrik komparasi lengkap di Artifact Panel ➔
                                      </p>
                                    </div>
                                  </div>
                                  <ArrowRight className="h-4 w-4 text-emerald-400 group-hover:translate-x-1 transition-transform shrink-0" />
                                </div>
                              )}
                            </>
                          )}

                          {/* ============================================================ */}
                          {/* 5. GENERAL / FALLBACK                                        */}
                          {/* ============================================================ */}
                          {!isPeerBattle && !isSmartMoney && !isCompany360 && !isMarketScreening && (
                            <>
                              {report?.peer_matrix && report.peer_matrix.length > 0 && (
                                <div className="animate-card-reveal-delay-1">
                                  <PeerBattleMatrix matrix={report.peer_matrix} />
                                </div>
                              )}

                              {report?.synthesis && (
                                <div className="rounded-2xl border border-slate-800 bg-[#0d121e]/90 p-5 sm:p-6 shadow-2xl glass-panel animate-card-reveal-delay-2">
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
                                </div>
                              )}

                              {report && (
                                <div
                                  onClick={() => {
                                    setSelectedArtifactId(String(msg.id || `artifact-${index}`));
                                    setIsArtifactPanelOpen(true);
                                  }}
                                  className="p-3.5 rounded-2xl bg-[#090e1a] border border-emerald-500/30 hover:border-emerald-400/70 hover:bg-[#0c1426] transition-all cursor-pointer group flex items-center justify-between shadow-lg animate-card-reveal-delay-2 hover:scale-[1.008]"
                                >
                                  <div className="flex items-center gap-3 min-w-0">
                                    <div className="h-9 w-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform shrink-0">
                                      <FileText className="h-4 w-4" />
                                    </div>
                                    <div className="min-w-0">
                                      <span className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors truncate">
                                        {report.query || 'Research Dossier'}
                                      </span>
                                    </div>
                                  </div>
                                  <ArrowRight className="h-4 w-4 text-emerald-400 group-hover:translate-x-1 transition-transform shrink-0" />
                                </div>
                              )}
                            </>
                          )}

                          {/* Smart Follow-up Questions Pills */}
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
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 border text-xs text-left transition-all active:scale-95 group shadow-sm ${
                                      isPeerBattle
                                        ? 'hover:bg-cyan-950/40 border-slate-700/80 hover:border-cyan-500/50 text-slate-300 hover:text-cyan-300'
                                        : isSmartMoney
                                        ? 'hover:bg-amber-950/40 border-slate-700/80 hover:border-amber-500/50 text-slate-300 hover:text-amber-300'
                                        : 'hover:bg-emerald-950/40 border-slate-700/80 hover:border-emerald-500/50 text-slate-300 hover:text-emerald-300'
                                    }`}
                                  >
                                    <span className="line-clamp-1">{followup}</span>
                                    <ArrowRight className="h-3 w-3 text-slate-500 group-hover:text-current shrink-0 transition-transform group-hover:translate-x-0.5" />
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()

                  )}
                </div>
              );
            })}

            {/* Clean & Simple Loading State */}
            {isLoading && (
              <div className="flex flex-col items-start max-w-4xl mx-auto w-full animate-card-reveal">
                <div className="flex items-center gap-2 mb-1.5 text-[11px] text-slate-400">
                  <div className="p-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                    <AlphaAgentLogo size={16} />
                  </div>
                  <span className="font-semibold text-emerald-400">AlphaAgent</span>
                </div>
                <div className="flex items-center gap-3 px-4 py-3 rounded-2xl rounded-tl-none bg-[#0d121e]/90 border border-slate-800 text-xs text-slate-300 shadow-xl glass-panel">
                  <RefreshCw className="h-3.5 w-3.5 text-emerald-400 animate-spin shrink-0" />
                  <span className="text-slate-300 font-medium">
                    AlphaAgent sedang menganalisis pasar & menyusun data...
                  </span>
                  <span className="flex space-x-1 ml-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </span>
                </div>
              </div>
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
            {/* Image Preview Chip if attached */}
            {attachedImage && (
              <div className="max-w-4xl mx-auto mb-2 flex items-center justify-between px-3 py-2 rounded-xl bg-[#0d121e] border border-emerald-500/40 text-xs text-slate-200 animate-card-reveal">
                <div className="flex items-center gap-2.5 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={attachedImage.previewUrl}
                    alt="Preview"
                    className="h-8 w-8 object-cover rounded-lg border border-slate-700 shrink-0"
                  />
                  <div className="truncate">
                    <span className="font-semibold text-emerald-400 block truncate">{attachedImage.fileName}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition-colors shrink-0 ml-2"
                  title="Hapus gambar"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="max-w-4xl mx-auto relative flex items-end rounded-2xl border border-slate-700/80 bg-[#0d121e] p-2 shadow-2xl focus-within:border-emerald-500/80 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all glow-emerald"
            >
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleImageSelect}
                className="hidden"
              />

              {/* Attach Image Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                title="Lampirkan Chart atau Screenshot Laporan Keuangan (Maks 5MB • Bisa juga langsung Ctrl+V)"
                className="p-2 ml-1 mr-1.5 rounded-xl text-slate-400 hover:text-emerald-400 hover:bg-slate-800/80 transition-colors shrink-0 disabled:opacity-40 mb-0.5"
              >
                <Paperclip className="h-4 w-4" />
              </button>

              {/* Auto-wrapping & Auto-expanding Textarea (Max 3 lines, Enter to send, Shift+Enter for newline, Ctrl+V image paste supported) */}
              <textarea
                ref={textareaRef}
                rows={1}
                value={inputQuery}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onPaste={handlePaste}
                placeholder={attachedImage ? "Tanyakan analisis gambar ini ke AlphaAgent..." : "Tanyakan analisis emiten ke AlphaAgent..."}
                className="w-full bg-transparent text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none px-2 py-1.5 resize-none overflow-y-auto max-h-[84px] leading-relaxed my-auto"
                disabled={isLoading}
              />

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || (!inputQuery.trim() && !attachedImage)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-black text-xs font-bold hover:brightness-110 active:scale-95 disabled:opacity-40 disabled:pointer-events-none transition-all shrink-0 mb-0.5 ml-1.5"
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
            <div className="text-[10px] text-slate-500 text-center mt-2 flex items-center justify-center gap-2 flex-wrap">
              <span>Sesi terenkripsi & tersimpan lokal</span>
              <span className="text-slate-700">•</span>
              <span className="inline-flex items-center gap-1.5 text-slate-400 font-medium">
                <Image
                  src="/images/sectors-icon.png"
                  alt="Sectors Logo"
                  width={13}
                  height={13}
                  className="rounded-sm object-contain"
                />
                <span>Terverifikasi Data Resmi Sectors Financial API</span>
              </span>
            </div>
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

export default function CopilotPage() {
  return (
    <Suspense fallback={
      <div className="h-screen w-full bg-[#07090e] text-slate-100 flex flex-col overflow-hidden selection:bg-emerald-500 selection:text-black">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <RefreshCw className="h-6 w-6 text-emerald-400 animate-spin" />
            <p className="text-xs text-slate-400 font-medium animate-pulse">Memuat AlphaAgent workspace...</p>
          </div>
        </div>
      </div>
    }>
      <CopilotWorkspace />
    </Suspense>
  );
}
