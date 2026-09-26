'use client';

import { ChatSession, ChatMessage } from './types';

// In-memory singletons: persist across Next.js SPA tab navigations within the browser session
let memoryCachedSessions: ChatSession[] | null = null;
const memoryCachedMessagesMap = new Map<string, ChatMessage[]>();

const SESSIONS_CACHE_KEY = 'alphasector_cached_sessions_v1';
const MESSAGES_CACHE_PREFIX = 'alphasector_cached_messages_v1_';

export function getCachedSessions(): ChatSession[] | null {
  if (memoryCachedSessions && memoryCachedSessions.length > 0) {
    return memoryCachedSessions;
  }
  if (typeof window !== 'undefined') {
    try {
      const raw = sessionStorage.getItem(SESSIONS_CACHE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          memoryCachedSessions = parsed;
          return parsed;
        }
      }
    } catch {
      // ignore
    }
  }
  return null;
}

export function setCachedSessions(sessions: ChatSession[]): void {
  memoryCachedSessions = sessions;
  if (typeof window !== 'undefined') {
    try {
      sessionStorage.setItem(SESSIONS_CACHE_KEY, JSON.stringify(sessions));
    } catch {
      // ignore quota limits
    }
  }
}

export function getCachedMessages(sessionId: string): ChatMessage[] | null {
  if (!sessionId) return null;
  if (memoryCachedMessagesMap.has(sessionId)) {
    return memoryCachedMessagesMap.get(sessionId) || null;
  }
  if (typeof window !== 'undefined') {
    try {
      const raw = sessionStorage.getItem(MESSAGES_CACHE_PREFIX + sessionId);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          memoryCachedMessagesMap.set(sessionId, parsed);
          return parsed;
        }
      }
    } catch {
      // ignore
    }
  }
  return null;
}

export function setCachedMessages(sessionId: string, messages: ChatMessage[]): void {
  if (!sessionId) return;
  memoryCachedMessagesMap.set(sessionId, messages);
  if (typeof window !== 'undefined') {
    try {
      sessionStorage.setItem(MESSAGES_CACHE_PREFIX + sessionId, JSON.stringify(messages));
    } catch {
      // If sessionStorage quota exceeded due to large reports, memory retains it safely
    }
  }
}

export function removeCachedSession(sessionId: string): void {
  if (!sessionId) return;
  memoryCachedMessagesMap.delete(sessionId);
  if (memoryCachedSessions) {
    memoryCachedSessions = memoryCachedSessions.filter((s) => s.id !== sessionId);
  }
  if (typeof window !== 'undefined') {
    try {
      sessionStorage.removeItem(MESSAGES_CACHE_PREFIX + sessionId);
      if (memoryCachedSessions) {
        sessionStorage.setItem(SESSIONS_CACHE_KEY, JSON.stringify(memoryCachedSessions));
      }
    } catch {
      // ignore
    }
  }
}

export function clearChatCache(): void {
  memoryCachedSessions = null;
  memoryCachedMessagesMap.clear();
  if (typeof window !== 'undefined') {
    try {
      sessionStorage.removeItem(SESSIONS_CACHE_KEY);
      for (let i = sessionStorage.length - 1; i >= 0; i--) {
        const key = sessionStorage.key(i);
        if (key && key.startsWith(MESSAGES_CACHE_PREFIX)) {
          sessionStorage.removeItem(key);
        }
      }
    } catch {
      // ignore
    }
  }
}
