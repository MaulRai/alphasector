'use client';

import React from 'react';
import Link from 'next/link';
import { ChatMessage } from '@/lib/types';
import { AlphaAgentLogo } from '@/components/AlphaAgentLogo';
import { TradeIdeasRadar } from '@/components/TradeIdeasRadar';
import { AgentThinkingProgress, LiveThinkingStep } from './AgentThinkingProgress';
import { ChatHistorySkeleton } from './ChatHistorySkeleton';
import { ChatMessageItem } from './ChatMessageItem';
import { AlertCircle, Settings } from 'lucide-react';

interface ChatMessageListProps {
  messages: ChatMessage[];
  isLoading: boolean;
  liveThinkingStep?: LiveThinkingStep | null;
  liveTotalSteps?: number;
  isFetchingHistory?: boolean;
  error: string | null;
  onSendMessage: (query: string) => void;
  onOpenArtifact: (artifactId: string) => void;
  latestAssistantMsgRef: React.RefObject<HTMLDivElement | null>;
  latestUserMsgRef?: React.RefObject<HTMLDivElement | null>;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

export const ChatMessageList: React.FC<ChatMessageListProps> = ({
  messages,
  isLoading,
  liveThinkingStep = null,
  liveTotalSteps,
  isFetchingHistory = false,
  error,
  onSendMessage,
  onOpenArtifact,
  latestAssistantMsgRef,
  latestUserMsgRef,
  messagesEndRef,
}) => {
  const lastUserQuery = [...messages].reverse().find((m) => m.role === 'user')?.content || '';

  return (
    <div className="flex-1 overflow-y-auto min-h-0 px-4 sm:px-6 py-6 space-y-6">
      {/* If Fetching History for Last / Active Session: Render Shimmering Skeleton */}
      {isFetchingHistory && messages.length === 0 && (
        <ChatHistorySkeleton />
      )}

      {/* If New / Empty Session: Show Welcome & Radar Presets ONLY when NOT fetching history */}
      {messages.length === 0 && !isLoading && !isFetchingHistory && (
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
            <TradeIdeasRadar onSelectPreset={(presetQuery) => onSendMessage(presetQuery)} />
          </div>
        </div>
      )}

      {/* Render Multi-Turn Message Stream */}
      {messages.map((msg, index) => {
        const isUser = msg.role === 'user';
        const isLastAssistant = !isUser && index === messages.length - 1;
        const isLastUser = isUser && (index === messages.length - 1 || index === messages.length - 2);
        const activeRef = isLastAssistant ? latestAssistantMsgRef : isLastUser ? (latestUserMsgRef || null) : null;

        return (
          <ChatMessageItem
            key={msg.id || index}
            message={msg}
            index={index}
            itemRef={activeRef}
            isLoading={isLoading}
            onSendMessage={onSendMessage}
            onOpenArtifact={onOpenArtifact}
          />
        );
      })}

      {/* Dynamic Step-Aware Loading State with Vertical Fade Animation */}
      {isLoading && (
        <AgentThinkingProgress 
          lastQuery={lastUserQuery}
          liveStep={liveThinkingStep}
          totalSteps={liveTotalSteps}
        />
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
  );
};
