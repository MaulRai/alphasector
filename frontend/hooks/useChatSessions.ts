'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { ChatSession, ChatMessage } from '@/lib/types';
import { fetchUserChatSessions, fetchChatRoomDetails, deleteChatRoom } from '@/lib/api';
import { saveLastActiveSessionId, getLastActiveSessionId } from '@/lib/chatDraftStore';
import {
  getCachedSessions,
  setCachedSessions,
  getCachedMessages,
  setCachedMessages,
  removeCachedSession,
  clearChatCache,
} from '@/lib/chatCacheStore';

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
  // Pre-seed from cache if available so there is zero flash when switching internal tabs
  const initialTargetSessionId = sessionIdParam || (getLastActiveSessionId() === null ? null : (getLastActiveSessionId() || null));
  const cachedInitialSessions = getCachedSessions();
  const cachedInitialMessages = initialTargetSessionId ? getCachedMessages(initialTargetSessionId) : null;

  const [sessions, setSessions] = useState<ChatSession[]>(() => cachedInitialSessions || []);
  const [isLoadingSessions, setIsLoadingSessions] = useState<boolean>(() => !cachedInitialSessions || cachedInitialSessions.length === 0);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(() => initialTargetSessionId);
  const [messages, setMessages] = useState<ChatMessage[]>(() => cachedInitialMessages || []);
  const [sessionSearch, setSessionSearch] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isFetchingHistory, setIsFetchingHistory] = useState<boolean>(() => {
    if (initialTargetSessionId) {
      return !cachedInitialMessages || cachedInitialMessages.length === 0;
    }
    return false;
  });
  const [error, setError] = useState<string | null>(null);

  // Deletion modal state
  const [sessionToDelete, setSessionToDelete] = useState<{ id: string; title: string } | null>(null);
  const [isDeletingSession, setIsDeletingSession] = useState(false);

  const initialQueryExecuted = useRef(false);
  const lastHandledSessionParamRef = useRef<string | null>(initialTargetSessionId);
  const prevUserIdRef = useRef<number | undefined>(user?.id);

  // Automatically wipe chat state and cache when user logs out or switches accounts
  useEffect(() => {
    if (prevUserIdRef.current !== undefined && prevUserIdRef.current !== user?.id) {
      clearChatCache();
      saveLastActiveSessionId(null);
      setSessions([]);
      setActiveSessionId(null);
      setMessages([]);
      setIsLoadingSessions(false);
      setIsFetchingHistory(false);
      lastHandledSessionParamRef.current = null;
      initialQueryExecuted.current = false;
    }
    prevUserIdRef.current = user?.id;
  }, [user?.id]);

  // Auto-sync messages to cache whenever messages change for active session
  useEffect(() => {
    if (activeSessionId && messages && messages.length > 0) {
      setCachedMessages(activeSessionId, messages);
    }
  }, [activeSessionId, messages]);

  // Load chat room messages
  const handleSelectSession = useCallback(async (sessionId: string) => {
    try {
      lastHandledSessionParamRef.current = sessionId;
      setActiveSessionId(sessionId);
      saveLastActiveSessionId(sessionId);
      setError(null);

      // Check cache first for instant display
      const cached = getCachedMessages(sessionId);
      if (cached && cached.length > 0) {
        setMessages(cached);
        setIsFetchingHistory(false);
      } else {
        setIsFetchingHistory(true);
        setMessages([]); // Clear only on cache miss to avoid visual lag
      }

      // Sync browser URL cleanly without page reload
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        url.searchParams.set('session_id', sessionId);
        window.history.replaceState({}, '', url.toString());
      }

      const res = await fetchChatRoomDetails(sessionId);
      const freshMessages = res.messages || [];
      setMessages(freshMessages);
      setCachedMessages(sessionId, freshMessages);
    } catch (err: any) {
      console.error('Failed to load session history:', err);
      const existingCached = getCachedMessages(sessionId);
      if (!existingCached || existingCached.length === 0) {
        setError('Gagal memuat riwayat percakapan sesi ini.');
      }
    } finally {
      setIsFetchingHistory(false);
    }
  }, []);

  // Create new session reset
  const handleCreateNewSession = useCallback(() => {
    lastHandledSessionParamRef.current = null;
    setActiveSessionId(null);
    saveLastActiveSessionId(null);
    setMessages([]);
    setIsFetchingHistory(false);
    setError(null);

    // Clear session_id from URL
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.delete('session_id');
      window.history.replaceState({}, '', url.pathname);
    }
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
      removeCachedSession(sessionToDelete.id);
      setSessions((prev) => {
        const next = prev.filter((s) => s.id !== sessionToDelete.id);
        setCachedSessions(next);
        return next;
      });
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
      const userSessions = res.sessions || [];
      setSessions(userSessions);
      setCachedSessions(userSessions);
      return userSessions;
    } catch (err) {
      console.error('Failed to fetch user chat sessions:', err);
      return [];
    }
  }, [user]);

  // Initialize workspace sessions & handle param handshakes
  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      if (!user) {
        setSessions([]);
        setActiveSessionId(null);
        setMessages([]);
        setIsLoadingSessions(false);
        setIsFetchingHistory(false);
        return;
      }
      try {
        const currentCached = getCachedSessions();
        if (!currentCached || currentCached.length === 0) {
          setIsLoadingSessions(true);
        }

        const res = await fetchUserChatSessions();
        if (!isMounted) return;
        const userSessions = res.sessions || [];
        setSessions(userSessions);
        setCachedSessions(userSessions);
        setIsLoadingSessions(false);

        if (sessionIdParam) {
          lastHandledSessionParamRef.current = sessionIdParam;
          await handleSelectSession(sessionIdParam);
        } else if (initialQueryParam && !initialQueryExecuted.current && onInitialQueryTrigger) {
          initialQueryExecuted.current = true;
          setActiveSessionId(null);
          setMessages([]);
          setIsFetchingHistory(false);
          if (typeof window !== 'undefined' && (window.location.search.includes('initial_query') || window.location.search.includes('prompt') || window.location.search.includes('q'))) {
            window.history.replaceState({}, '', '/alpha-agent');
          }
          await onInitialQueryTrigger(initialQueryParam);
        } else if (userSessions.length > 0 && !initialQueryParam && !initialQueryExecuted.current) {
          const rememberedId = getLastActiveSessionId();
          if (rememberedId && userSessions.some((s) => s.id === rememberedId)) {
            // If already loaded and active from initial cache seed, do quiet background revalidation
            if (activeSessionId === rememberedId && messages.length > 0) {
              try {
                const roomRes = await fetchChatRoomDetails(rememberedId);
                if (isMounted && roomRes.messages) {
                  setMessages(roomRes.messages);
                  setCachedMessages(rememberedId, roomRes.messages);
                }
              } catch (e) {
                // keep cached messages on background failure
              }
            } else {
              await handleSelectSession(rememberedId);
            }
          } else if (rememberedId === null) {
            handleCreateNewSession();
          } else {
            const firstId = userSessions[0].id;
            if (activeSessionId === firstId && messages.length > 0) {
              try {
                const roomRes = await fetchChatRoomDetails(firstId);
                if (isMounted && roomRes.messages) {
                  setMessages(roomRes.messages);
                  setCachedMessages(firstId, roomRes.messages);
                }
              } catch (e) {
                // keep cached messages
              }
            } else {
              await handleSelectSession(firstId);
            }
          }
        } else if (userSessions.length === 0) {
          // Zero sessions: completely clear any old active session & messages
          setActiveSessionId(null);
          setMessages([]);
          setIsFetchingHistory(false);
          saveLastActiveSessionId(null);
        } else {
          setIsFetchingHistory(false);
        }
      } catch (err) {
        console.error('Failed to init sessions:', err);
        setIsFetchingHistory(false);
      } finally {
        if (isMounted) {
          setIsLoadingSessions(false);
        }
      }
    };

    init();

    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  // Handshake when sessionIdParam changes externally (e.g., via router.push or browser navigation)
  useEffect(() => {
    if (sessionIdParam && sessionIdParam !== lastHandledSessionParamRef.current) {
      lastHandledSessionParamRef.current = sessionIdParam;
      handleSelectSession(sessionIdParam);
    }
  }, [sessionIdParam, handleSelectSession]);

  return {
    sessions,
    setSessions,
    isLoadingSessions,
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
