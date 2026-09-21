'use client';

import React from 'react';
import { ChatMessage } from '@/lib/types';
import { AlphaAgentLogo } from '@/components/AlphaAgentLogo';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import { AgentThinkingTrace } from '@/components/AgentThinkingTrace';
import { ResearchDossierLayout } from './ResearchDossierLayout';
import { ClarificationQnACard } from './ClarificationQnACard';

interface ChatMessageItemProps {
  message: ChatMessage;
  index: number;
  itemRef?: React.Ref<HTMLDivElement>;
  isLoading?: boolean;
  onSendMessage: (query: string) => void;
  onOpenArtifact: (artifactId: string) => void;
}

export const ChatMessageItem: React.FC<ChatMessageItemProps> = ({
  message,
  index,
  itemRef,
  isLoading = false,
  onSendMessage,
  onOpenArtifact,
}) => {
  const isUser = message.role === 'user';
  const report = message.report_data;

  const hasClarification = Boolean(
    report?.clarification || report?.intent === 'CLARIFICATION_REQUIRED'
  );

  const isConversational =
    !hasClarification &&
    !report?.peer_matrix &&
    !report?.broker_summary &&
    (!report?.synthesis?.key_findings || report.synthesis.key_findings.length === 0);

  return (
    <div
      ref={itemRef}
      className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-4xl mx-auto w-full scroll-mt-6`}
    >
      {/* Sender Header for Assistant */}
      {!isUser && (
        <div className="flex items-center gap-2 mb-1.5 text-[11px] text-slate-400">
          <div className="p-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
            <AlphaAgentLogo size={16} />
          </div>
          <span className="font-semibold text-emerald-400">AlphaAgent</span>
        </div>
      )}

      {/* Message Body */}
      {isUser ? (
        <div className="p-3.5 sm:p-4 rounded-2xl rounded-tr-none bg-emerald-600/90 text-white text-xs sm:text-sm shadow-lg max-w-xl leading-relaxed animate-card-reveal flex flex-col gap-2.5">
          {message.image_url && (
            <div className="rounded-xl overflow-hidden border border-emerald-400/30 bg-black/20 max-h-64 flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={message.image_url}
                alt="Attached financial chart"
                className="max-h-60 w-auto object-contain rounded-lg hover:scale-105 transition-transform duration-200"
              />
            </div>
          )}
          <div>{message.content}</div>
        </div>
      ) : hasClarification && report?.clarification ? (
        /* Interactive Clarification QnA Gate Mode */
        <div className="w-full space-y-4 animate-card-reveal">
          {report?.reasoning_trace && report.reasoning_trace.length > 0 && (
            <div className="animate-card-reveal">
              <AgentThinkingTrace
                steps={report.reasoning_trace}
                totalTimeMs={report.total_execution_time_ms}
                creditsConsumed={report.credits_consumed}
                isLoading={false}
              />
            </div>
          )}
          <ClarificationQnACard
            clarification={report.clarification}
            onSendMessage={onSendMessage}
            isLoading={isLoading}
          />
        </div>
      ) : isConversational ? (
        /* Conversational Follow-Up Mode */
        <div className="w-full space-y-4 animate-card-reveal">
          {report?.reasoning_trace && report.reasoning_trace.length > 0 && (
            <div className="animate-card-reveal">
              <AgentThinkingTrace
                steps={report.reasoning_trace}
                totalTimeMs={report.total_execution_time_ms}
                creditsConsumed={report.credits_consumed}
                isLoading={false}
              />
            </div>
          )}

          <div className="p-4 sm:p-5 rounded-2xl rounded-tl-none bg-[#0d121e]/90 border border-slate-800 shadow-xl glass-panel text-slate-200">
            <MarkdownRenderer content={message.content || report?.synthesis?.executive_summary || ''} />
          </div>
        </div>
      ) : (
        /* Autonomous Research Dossier Mode */
        <ResearchDossierLayout
          report={report!}
          artifactId={String(message.id || `artifact-${index}`)}
          onOpenArtifact={onOpenArtifact}
          onSendMessage={onSendMessage}
          isLoading={isLoading}
        />
      )}
    </div>
  );
};
