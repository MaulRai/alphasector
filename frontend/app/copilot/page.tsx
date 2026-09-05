'use client';

import React, { useState, useEffect, useRef, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { ResearchDossierModal } from '@/components/ResearchDossierModal';
import { ConfirmModal } from '@/components/ConfirmModal';
import { CopilotArtifactPanel, ArtifactItem } from '@/components/CopilotArtifactPanel';
import { ChatSidebar } from '@/components/copilot/ChatSidebar';
import { ChatMessageList } from '@/components/copilot/ChatMessageList';
import { ChatInputBar } from '@/components/copilot/ChatInputBar';
import { queryAgent, fetchUserChatSessions } from '@/lib/api';
import { AgentQueryResponse, ChatMessage } from '@/lib/types';
import { useAuth } from '@/lib/auth-context';
import { useChatSessions } from '@/hooks/useChatSessions';
import { useImageUpload } from '@/hooks/useImageUpload';
import { 
  RefreshCw, PanelLeftClose, PanelLeft, FileText
} from 'lucide-react';
import { AuthGate } from '@/components/AuthGate';

function CopilotWorkspace() {
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const searchParams = useSearchParams();
  const sessionIdParam = searchParams.get('session_id');
  const initialQueryParam = searchParams.get('initial_query') || searchParams.get('q');

  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDossierOpen, setIsDossierOpen] = useState(false);
  const [isArtifactPanelOpen, setIsArtifactPanelOpen] = useState(false);
  const [selectedArtifactId, setSelectedArtifactId] = useState<string | null>(null);
  const [activeModalReport, setActiveModalReport] = useState<AgentQueryResponse | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const latestAssistantMsgRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Hook 1: Multimodal image upload
  const {
    attachedImage,
    fileInputRef,
    handleFileChange,
    handleClearImage,
    handlePaste,
  } = useImageUpload();

  // Send message handler (declared before hook for initial trigger callback)
  const handleSendMessage = async (queryText: string) => {
    const textToSend = queryText.trim();
    if ((!textToSend && !attachedImage) || isLoading) return;

    const currentImg = attachedImage;
    handleClearImage();
    setInputQuery('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    setError(null);
    setIsLoading(true);

    const defaultQuery = textToSend || (currentImg ? 'Jelaskan dan analisis konteks gambar finansial ini secara mendalam' : '');

    // Optimistically append user message
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

      if (response.session_id && response.session_id !== activeSessionId) {
        setActiveSessionId(response.session_id);
      }

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
      await refreshSessions();

    } catch (err: any) {
      console.error('Query execution error:', err);
      setError(err.message || 'Gagal mengeksekusi penalaran agent.');
    } finally {
      setIsLoading(false);
    }
  };

  // Hook 2: Chat sessions & rooms management
  const {
    sessions,
    setSessions,
    activeSessionId,
    setActiveSessionId,
    messages,
    setMessages,
    sessionSearch,
    setSessionSearch,
    isSidebarOpen,
    setIsSidebarOpen,
    error,
    setError,
    sessionToDelete,
    setSessionToDelete,
    isDeletingSession,
    handleSelectSession,
    handleCreateNewSession,
    handleRequestDeleteSession,
    handleConfirmDeleteSession,
    refreshSessions,
  } = useChatSessions({
    user,
    sessionIdParam,
    initialQueryParam,
    onInitialQueryTrigger: handleSendMessage,
  });

  // Natural scroll handling
  useEffect(() => {
    if (isLoading) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    } else if (messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.role === 'assistant') {
        latestAssistantMsgRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [messages, isLoading]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    handleSendMessage(inputQuery);
  };

  // Extract artifacts from assistant responses in this room
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

  const latestReport = [...messages]
    .reverse()
    .find((m) => m.role === 'assistant' && m.report_data)?.report_data || null;

  if (isAuthLoading) {
    return (
      <div className="h-screen w-full bg-[#07090e] text-slate-100 flex flex-col overflow-hidden">
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
      <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col">
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
    <div className="h-screen w-full bg-[#07090e] text-slate-100 flex flex-col overflow-hidden">
      <Navbar />

      <div className="flex-1 flex min-h-0 pt-16 relative overflow-hidden">
        {/* Left Drawer Sidebar */}
        <ChatSidebar
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          sessions={sessions}
          activeSessionId={activeSessionId}
          sessionSearch={sessionSearch}
          onSearchChange={setSessionSearch}
          onSelectSession={handleSelectSession}
          onCreateNewSession={handleCreateNewSession}
          onRequestDeleteSession={handleRequestDeleteSession}
          user={user}
        />

        {/* Main Conversation Center */}
        <section className="flex-1 flex flex-col h-full min-h-0 bg-[#07090e] overflow-hidden relative">
          {/* Top Session Bar */}
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

            {/* Artifacts Library Toggle Button */}
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

          {/* Chat Messages Feed */}
          <ChatMessageList
            messages={messages}
            isLoading={isLoading}
            error={error}
            onSendMessage={handleSendMessage}
            onOpenArtifact={(artId) => {
              setSelectedArtifactId(artId);
              setIsArtifactPanelOpen(true);
            }}
            latestAssistantMsgRef={latestAssistantMsgRef}
            messagesEndRef={messagesEndRef}
          />

          {/* Bottom Chat Input Bar */}
          <ChatInputBar
            inputQuery={inputQuery}
            onInputChange={setInputQuery}
            onSubmit={handleSubmit}
            isLoading={isLoading}
            attachedImage={attachedImage}
            onRemoveImage={handleClearImage}
            fileInputRef={fileInputRef}
            onImageSelect={handleFileChange}
            onPaste={handlePaste}
            textareaRef={textareaRef}
          />
        </section>

        {/* Right Artifact Panel */}
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

      {/* Session Deletion Confirmation Modal */}
      <ConfirmModal
        isOpen={!!sessionToDelete}
        onClose={() => setSessionToDelete(null)}
        onConfirm={handleConfirmDeleteSession}
        title="Hapus Sesi Riset"
        description={
          <>
            Apakah Anda yakin ingin menghapus sesi riset{' '}
            <span className="font-semibold text-white">&quot;{sessionToDelete?.title}&quot;</span>? Seluruh riwayat percakapan dan dossier di dalamnya akan dihapus secara permanen.
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
      <div className="h-screen w-full bg-[#07090e] text-slate-100 flex items-center justify-center">
        <RefreshCw className="h-6 w-6 text-emerald-400 animate-spin" />
      </div>
    }>
      <CopilotWorkspace />
    </Suspense>
  );
}
