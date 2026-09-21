'use client';

import { PastedContextItem } from './contextClipboard';
import { AttachedImageData } from '@/hooks/useImageUpload';

export interface ChatDraftState {
  inputQuery: string;
  pastedContexts: PastedContextItem[];
  attachedImage: AttachedImageData | null;
  sessionId: string | null;
  updatedAt: number;
}

const STORAGE_KEY = 'alphasector_chat_draft_v1';
const LAST_SESSION_KEY = 'alphasector_last_chat_session_id_v1';

// In-memory singleton: retains full objects (including images and context chips) across SPA page navigations
let memoryDraft: ChatDraftState | null = null;
let memoryLastSessionId: string | null | undefined = undefined;

export function getChatDraft(): ChatDraftState {
  if (memoryDraft) {
    return memoryDraft;
  }

  if (typeof window !== 'undefined') {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY) || localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        let restoredImage: AttachedImageData | null = parsed.attachedImage || null;
        
        // Reconstruct previewUrl from base64 if blob URL is invalidated on reload
        if (restoredImage && restoredImage.base64 && (!restoredImage.previewUrl || restoredImage.previewUrl.startsWith('blob:'))) {
          restoredImage = {
            ...restoredImage,
            previewUrl: `data:${restoredImage.mimeType || 'image/png'};base64,${restoredImage.base64}`,
          };
        }

        memoryDraft = {
          inputQuery: typeof parsed.inputQuery === 'string' ? parsed.inputQuery : '',
          pastedContexts: Array.isArray(parsed.pastedContexts) ? parsed.pastedContexts : [],
          attachedImage: restoredImage,
          sessionId: parsed.sessionId || null,
          updatedAt: parsed.updatedAt || Date.now(),
        };
        return memoryDraft;
      }
    } catch (e) {
      console.warn('Failed to restore chat draft from storage:', e);
    }
  }

  return {
    inputQuery: '',
    pastedContexts: [],
    attachedImage: null,
    sessionId: null,
    updatedAt: Date.now(),
  };
}

export function saveChatDraft(draft: Partial<ChatDraftState>): void {
  const current = getChatDraft();
  const updated: ChatDraftState = {
    ...current,
    ...draft,
    updatedAt: Date.now(),
  };

  memoryDraft = updated;

  if (typeof window !== 'undefined') {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Storage quota safety: If large base64 image exceeds quota, store text & context chips in storage
      // while memoryDraft retains the image in browser RAM
      try {
        const fallback = {
          ...updated,
          attachedImage: null,
        };
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(fallback));
      } catch {
        // ignore
      }
    }
  }
}

export function clearChatDraft(): void {
  memoryDraft = {
    inputQuery: '',
    pastedContexts: [],
    attachedImage: null,
    sessionId: null,
    updatedAt: Date.now(),
  };

  if (typeof window !== 'undefined') {
    try {
      sessionStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }
}

export function saveLastActiveSessionId(sessionId: string | null): void {
  memoryLastSessionId = sessionId;
  if (typeof window !== 'undefined') {
    try {
      if (sessionId) {
        sessionStorage.setItem(LAST_SESSION_KEY, sessionId);
      } else {
        sessionStorage.setItem(LAST_SESSION_KEY, '__NEW__');
      }
    } catch {
      // ignore
    }
  }
}

export function getLastActiveSessionId(): string | null | undefined {
  if (memoryLastSessionId !== undefined) {
    return memoryLastSessionId;
  }
  if (typeof window !== 'undefined') {
    try {
      const stored = sessionStorage.getItem(LAST_SESSION_KEY);
      if (stored === '__NEW__') return null;
      if (stored) return stored;
    } catch {
      // ignore
    }
  }
  return undefined;
}
