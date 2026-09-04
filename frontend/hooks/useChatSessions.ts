'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { ChatSession, ChatMessage } from '@/lib/types';
import { fetchUserChatSessions, fetchChatRoomDetails, deleteChatRoom } from '@/lib/api';

interface UseChatSessionsOptions {
  user: any;
  sessionIdParam: string | null;
  initialQueryParam: string | null;
  onInitialQueryTrigger?: (query: string) => Promise<void>;
}

export function useChatSessions({
  user,
  sessionIdParam,
  initialQueryParam,
  onInitialQueryTrigger,
}: UseChatSessionsOptions) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessionSearch, setSessionSearch] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isFetchingHistory, setIsFetchingHistory] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Deletion modal state
  const [sessionToDelete, setSessionToDelete] = useState<{ id: string; title: string } | null>(null);
  const [isDeletingSession, setIsDeletingSession] = useState(false);

  const initialQueryExecuted = useRef(false);

  // Load chat room messages
  const handleSelectSession = useCallback(async (sessionId: string) => {
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
  }, []);

  // Create new session reset
  const handleCreateNewSession = useCallback(() => {
    setActiveSessionId(null);
    setMessages([]);
    setError(null);
  }, []);

  // Deletion handlers
  const handleRequestDeleteSession = useCallback((e: React.MouseEvent, session: ChatSession) => {
    e.stopPropagation();
    setSessionToDelete({ id: session.id, title: session.title });
  }, []);

  const handleConfirmDeleteSession = useCallback(async () => {
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
  }, [sessionToDelete, activeSessionId, handleCreateNewSession]);

  // Load sessions on mount or user change
  const refreshSessions = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetchUserChatSessions();
      setSessions(res.sessions || []);
      return res.sessions || [];
    } catch (err) {
      console.error('Failed to fetch user chat sessions:', err);
      return [];
    }
  }, [user]);

  // Initialize workspace sessions & handle param handshakes
  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      if (!user) return;
      try {
        const res = await fetchUserChatSessions();
        if (!isMounted) return;
        const userSessions = res.sessions || [];
        setSessions(userSessions);

        if (sessionIdParam) {
          await handleSelectSession(sessionIdParam);
        } else if (initialQueryParam && !initialQueryExecuted.current && onInitialQueryTrigger) {
          initialQueryExecuted.current = true;
          setActiveSessionId(null);
          setMessages([]);
          await onInitialQueryTrigger(initialQueryParam);
        } else if (userSessions.length > 0 && !activeSessionId) {
          await handleSelectSession(userSessions[0].id);
        }
      } catch (err) {
        console.error('Failed to init sessions:', err);
      }
    };

    init();

    return () => {
      isMounted = false;
    };
  }, [user, sessionIdParam]);

  // Handshake when sessionIdParam changes
  useEffect(() => {
    if (sessionIdParam && sessionIdParam !== activeSessionId) {
      handleSelectSession(sessionIdParam);
    }
  }, [sessionIdParam, activeSessionId, handleSelectSession]);

  return {
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
    isFetchingHistory,
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
  };
}
