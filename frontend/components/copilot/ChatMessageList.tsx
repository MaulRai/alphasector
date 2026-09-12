'use client';

import React from 'react';
import Link from 'next/link';
import { ChatMessage, AgentQueryResponse } from '@/lib/types';
import { AlphaAgentLogo } from '@/components/AlphaAgentLogo';
import { TradeIdeasRadar } from '@/components/TradeIdeasRadar';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import { AgentThinkingTrace } from '@/components/AgentThinkingTrace';
import { PeerBattleMatrix } from '@/components/PeerBattleMatrix';
import { Company360Card } from '@/components/Company360Card';
import { BrokerFlowTracker } from '@/components/BrokerFlowTracker';
import { 
  Sparkles, ArrowRight, FileText, RefreshCw, AlertCircle, Settings,
  PieChart, Users, AlertTriangle, ShieldAlert, Briefcase, UserCheck, TrendingUp, TrendingDown
} from 'lucide-react';
import { AgentThinkingProgress, LiveThinkingStep } from './AgentThinkingProgress';

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
  messagesEndRef,
}) => {
  const lastUserQuery = [...messages].reverse().find(m => m.role === 'user')?.content || '';

  return (
    <div className="flex-1 overflow-y-auto min-h-0 px-4 sm:px-6 py-6 space-y-6">
      {/* If Fetching History for Last / Active Session: Render Shimmering Skeleton */}
      {isFetchingHistory && messages.length === 0 && (
        <div className="max-w-4xl mx-auto w-full space-y-6 animate-in fade-in duration-300">
          {/* Simulated User Message Skeleton (Right Aligned) */}
          <div className="flex flex-col items-end w-full">
            <div className="p-4 rounded-2xl rounded-tr-none bg-emerald-950/30 border border-emerald-500/20 max-w-md w-72 sm:w-96 space-y-2">
              <div className="h-3.5 rounded-md shimmer-item opacity-80 w-3/4 ml-auto" />
              <div className="h-2.5 rounded shimmer-item opacity-50 w-1/2 ml-auto" />
            </div>
          </div>

          {/* Simulated Assistant Response Skeleton (Left Aligned) */}
          <div className="flex flex-col items-start w-full space-y-3">
            {/* Header with Agent Logo */}
            <div className="flex items-center gap-2 mb-1 text-[11px] text-slate-400">
              <div className="p-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                <AlphaAgentLogo size={16} />
              </div>
              <span className="font-semibold text-emerald-400">AlphaAgent</span>
              <span className="text-[10px] text-slate-500">• Memuat riwayat riset...</span>
            </div>

            {/* Reasoning Trace Bar Skeleton */}
            <div className="w-full rounded-xl border border-slate-800/80 bg-[#090d16]/70 p-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded-md shimmer-item opacity-60" />
                <div className="h-3 w-28 rounded shimmer-item opacity-70" />
                <div className="h-2.5 w-16 rounded shimmer-item opacity-40" />
              </div>
              <div className="h-3 w-14 rounded shimmer-item opacity-40" />
            </div>

            {/* Main Content Card Skeleton */}
            <div className="w-full rounded-2xl border border-slate-800/80 bg-[#0d121e]/90 p-5 sm:p-6 space-y-5">
              {/* Card Title Skeleton */}
              <div className="flex items-center justify-between">
                <div className="space-y-1.5 flex-1">
                  <div className="h-5 rounded-md shimmer-item opacity-80 w-64 max-w-full" />
                  <div className="h-3 rounded shimmer-item opacity-50 w-96 max-w-full" />
                </div>
                <div className="h-6 w-24 rounded-full shimmer-item opacity-40 shrink-0" />
              </div>

              {/* 4 Metric Tiles Skeleton */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                {[...Array(4)].map((_, i) => (
                  <div 
                    key={i} 
                    className="p-3.5 rounded-xl border border-slate-800/60 bg-[#0a0f1d] space-y-2"
                  >
                    <div className="h-2.5 rounded shimmer-item opacity-50 w-16" />
                    <div className="h-5 rounded-md shimmer-item opacity-90 w-20" />
                    <div className="h-2 rounded shimmer-item opacity-40 w-12" />
                  </div>
                ))}
              </div>

              {/* Paragraph Lines Skeleton */}
              <div className="space-y-2 pt-2">
                <div className="h-3 rounded shimmer-item opacity-70 w-full" />
                <div className="h-3 rounded shimmer-item opacity-70 w-[92%]" />
                <div className="h-3 rounded shimmer-item opacity-60 w-[78%]" />
              </div>

              {/* Bottom Callout Skeleton */}
              <div className="p-3.5 rounded-xl border border-slate-800/60 bg-[#080c14] space-y-2">
                <div className="h-3 rounded shimmer-item opacity-80 w-44" />
                <div className="h-2.5 rounded shimmer-item opacity-50 w-3/4" />
              </div>
            </div>
          </div>
        </div>
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
                const isInstitutional = Boolean(
                  report?.intent === 'INSTITUTIONAL_OWNERSHIP' ||
                  Boolean(report?.shareholders_summary)
                );
                const isSuspension = Boolean(
                  report?.intent === 'REGULATORY_SUSPENSION_RADAR' ||
                  Boolean(report?.suspensions_data && report.suspensions_data.length > 0)
                );
                const isInsider = Boolean(
                  report?.intent === 'INSIDER_FORENSIC_RADAR' ||
                  Boolean(report?.insider_filings && report.insider_filings.length > 0)
                );
                const isSmartMoney = Boolean(
                  !isInsider && !isInstitutional && !isSuspension && (
                    report?.intent === 'SMART_MONEY_RADAR' ||
                    (report?.broker_summary && !report?.peer_matrix && !report?.metrics_summary)
                  )
                );
                const isCompany360 = Boolean(
                  !isMarketScreening && !isPeerBattle && !isSmartMoney && !isInstitutional && !isSuspension && !isInsider && (
                    report?.intent === 'SINGLE_TICKER_DEEP_DIVE' ||
                    (report?.metrics_summary && !report?.peer_matrix)
                  )
                );

                // Helper for KSEI breakdown calculation
                const kseiRecords = report?.shareholders_summary?.data || (Array.isArray(report?.shareholders_summary) ? report?.shareholders_summary : []);
                const latestKsei = kseiRecords && kseiRecords.length > 0 ? kseiRecords[kseiRecords.length - 1] : null;
                const kseiTotal = latestKsei ? (Number(latestKsei.shares_number) || 1) : 1;
                const kseiBreakdown = latestKsei ? {
                  pension: (((Number(latestKsei.pension_fund_l) || 0) + (Number(latestKsei.pension_fund_f) || 0)) / kseiTotal * 100).toFixed(2),
                  mutual: (((Number(latestKsei.mutual_fund_l) || 0) + (Number(latestKsei.mutual_fund_f) || 0)) / kseiTotal * 100).toFixed(2),
                  insurance: (((Number(latestKsei.insurance_l) || 0) + (Number(latestKsei.insurance_f) || 0)) / kseiTotal * 100).toFixed(2),
                  corporate: (((Number(latestKsei.corporate_l) || 0) + (Number(latestKsei.corporate_f) || 0)) / kseiTotal * 100).toFixed(2),
                  individual: (((Number(latestKsei.individual_l) || 0) + (Number(latestKsei.individual_f) || 0)) / kseiTotal * 100).toFixed(2),
                  date: latestKsei.date
                } : null;

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

                    {/* 1. PEER BATTLE SIGNATURE LAYOUT */}
                    {isPeerBattle && (
                      <>
                        {report?.peer_matrix && report.peer_matrix.length > 0 && (
                          <div className="animate-card-reveal-delay-1">
                            <PeerBattleMatrix matrix={report.peer_matrix} />
                          </div>
                        )}

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

                        {report && (
                          <div
                            onClick={() => onOpenArtifact(String(msg.id || `artifact-${index}`))}
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

                    {/* 2. SMART MONEY SIGNATURE LAYOUT */}
                    {isSmartMoney && (
                      <>
                        {report?.broker_summary && (
                          <div className="animate-card-reveal-delay-1">
                            <BrokerFlowTracker
                              brokerSummary={report.broker_summary}
                              ticker={report.primary_ticker}
                            />
                          </div>
                        )}

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
                                Smart Money & Institutional Flow
                              </span>
                            </div>

                            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed mb-4">
                              {report.synthesis.executive_summary}
                            </p>

                            {report.synthesis.smart_money_flow && (
                              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 mb-3 font-medium">
                                <strong className="text-amber-400">Flow Analysis:</strong> {report.synthesis.smart_money_flow}
                              </div>
                            )}

                            {report.synthesis.key_findings && report.synthesis.key_findings.length > 0 && (
                              <div className="pt-3 border-t border-slate-800/60 text-xs">
                                <h4 className="font-bold text-slate-400 uppercase tracking-wider mb-2 text-[10px]">
                                  Bandarmology / Flow Signals
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

                        {report && (
                          <div
                            onClick={() => onOpenArtifact(String(msg.id || `artifact-${index}`))}
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
                                  Buka analisis akumulasi broker lengkap di Artifact Panel ➔
                                </p>
                              </div>
                            </div>
                            <ArrowRight className="h-4 w-4 text-amber-400 group-hover:translate-x-1 transition-transform shrink-0" />
                          </div>
                        )}
                      </>
                    )}

                    {/* 3. COMPANY 360 SIGNATURE LAYOUT */}
                    {isCompany360 && (
                      <>
                        {report?.metrics_summary && (
                          <div className="animate-card-reveal-delay-1">
                            <Company360Card data={report.metrics_summary} />
                          </div>
                        )}

                        {report?.synthesis && (
                          <div className="rounded-2xl border border-slate-800 bg-[#0d121e]/90 p-5 sm:p-6 shadow-2xl glass-panel glow-emerald animate-card-reveal-delay-2">
                            <div className="flex items-center justify-between gap-4 pb-3 border-b border-slate-800 mb-3">
                              <div className="flex items-center gap-2">
                                <Sparkles className="h-4 w-4 text-emerald-400" />
                                <h3 className="text-sm font-bold text-white">
                                  Sintesis Riset Fundamental Otonom {report.primary_ticker ? `(${report.primary_ticker})` : ''}
                                </h3>
                              </div>
                              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 font-semibold border border-emerald-500/20">
                                Company 360° Deep-Dive
                              </span>
                            </div>

                            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed mb-4">
                              {report.synthesis.executive_summary}
                            </p>

                            {report.synthesis.valuation_verdict && (
                              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-200 mb-3 font-medium">
                                <strong className="text-emerald-400">Valuation Verdict:</strong> {report.synthesis.valuation_verdict}
                              </div>
                            )}

                            {report.synthesis.key_findings && report.synthesis.key_findings.length > 0 && (
                              <div className="pt-3 border-t border-slate-800/60 text-xs">
                                <h4 className="font-bold text-slate-400 uppercase tracking-wider mb-2 text-[10px]">
                                  Key Fundamental Findings
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

                        {report && (
                          <div
                            onClick={() => onOpenArtifact(String(msg.id || `artifact-${index}`))}
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
                                  Buka laporan riset lengkap di Artifact Panel ➔
                                </p>
                              </div>
                            </div>
                            <ArrowRight className="h-4 w-4 text-emerald-400 group-hover:translate-x-1 transition-transform shrink-0" />
                          </div>
                        )}
                      </>
                    )}

                    {/* 4. MARKET SCREENING SIGNATURE LAYOUT */}
                    {isMarketScreening && (
                      <>
                        {report?.peer_matrix && report.peer_matrix.length > 0 && (
                          <div className="animate-card-reveal-delay-1">
                            <PeerBattleMatrix matrix={report.peer_matrix} />
                          </div>
                        )}

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

                        {report && (
                          <div
                            onClick={() => onOpenArtifact(String(msg.id || `artifact-${index}`))}
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

                    {/* 5. INSTITUTIONAL OWNERSHIP SIGNATURE LAYOUT */}
                    {isInstitutional && (
                      <>
                        {report?.metrics_summary && (
                          <div className="animate-card-reveal-delay-1">
                            <Company360Card data={report.metrics_summary} />
                          </div>
                        )}

                        {kseiBreakdown && (
                          <div className="rounded-2xl border border-slate-800 bg-[#0d121e]/90 p-5 sm:p-6 shadow-2xl glass-panel glow-purple animate-card-reveal-delay-1">
                            <div className="flex items-center justify-between gap-4 pb-3 border-b border-slate-800 mb-4">
                              <div className="flex items-center gap-2.5">
                                <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                                  <PieChart className="h-4 w-4" />
                                </div>
                                <div>
                                  <h3 className="text-sm font-bold text-white">
                                    Struktur Kepemilikan Institusi KSEI {report.primary_ticker ? `(${report.primary_ticker})` : ''}
                                  </h3>
                                  <p className="text-[11px] text-slate-400">
                                    Registri Pemegang Saham Bulanan Resmi KSEI • Periode: {kseiBreakdown.date || 'Terbaru'}
                                  </p>
                                </div>
                              </div>
                              <span className="text-[10px] px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-300 font-semibold border border-purple-500/20 shrink-0">
                                Smart Money Registry
                              </span>
                            </div>

                            {/* Segmented Progress Bar */}
                            <div className="h-3 w-full rounded-full overflow-hidden flex bg-slate-900 mb-4 border border-slate-800">
                              <div style={{ width: `${kseiBreakdown.pension}%` }} className="bg-purple-500 transition-all duration-500" title={`Dana Pensiun: ${kseiBreakdown.pension}%`} />
                              <div style={{ width: `${kseiBreakdown.mutual}%` }} className="bg-blue-500 transition-all duration-500" title={`Reksadana: ${kseiBreakdown.mutual}%`} />
                              <div style={{ width: `${kseiBreakdown.insurance}%` }} className="bg-emerald-500 transition-all duration-500" title={`Asuransi: ${kseiBreakdown.insurance}%`} />
                              <div style={{ width: `${kseiBreakdown.corporate}%` }} className="bg-amber-500 transition-all duration-500" title={`Korporasi: ${kseiBreakdown.corporate}%`} />
                              <div style={{ width: `${kseiBreakdown.individual}%` }} className="bg-slate-500 transition-all duration-500" title={`Ritel / Individu: ${kseiBreakdown.individual}%`} />
                            </div>

                            {/* Metrics Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                              <div className="p-2.5 rounded-xl bg-[#090d16] border border-purple-500/20">
                                <div className="flex items-center gap-1.5 text-[10px] text-purple-400 mb-1">
                                  <span className="h-2 w-2 rounded-full bg-purple-500" />
                                  <span className="font-semibold">Dana Pensiun</span>
                                </div>
                                <div className="text-base font-bold text-white">{kseiBreakdown.pension}%</div>
                                <div className="text-[10px] text-slate-500">Smart money stabil</div>
                              </div>
                              <div className="p-2.5 rounded-xl bg-[#090d16] border border-blue-500/20">
                                <div className="flex items-center gap-1.5 text-[10px] text-blue-400 mb-1">
                                  <span className="h-2 w-2 rounded-full bg-blue-500" />
                                  <span className="font-semibold">Reksadana</span>
                                </div>
                                <div className="text-base font-bold text-white">{kseiBreakdown.mutual}%</div>
                                <div className="text-[10px] text-slate-500">Mutual fund institusi</div>
                              </div>
                              <div className="p-2.5 rounded-xl bg-[#090d16] border border-emerald-500/20">
                                <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 mb-1">
                                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                                  <span className="font-semibold">Asuransi</span>
                                </div>
                                <div className="text-base font-bold text-white">{kseiBreakdown.insurance}%</div>
                                <div className="text-[10px] text-slate-500">Underwriting cadangan</div>
                              </div>
                              <div className="p-2.5 rounded-xl bg-[#090d16] border border-amber-500/20">
                                <div className="flex items-center gap-1.5 text-[10px] text-amber-400 mb-1">
                                  <span className="h-2 w-2 rounded-full bg-amber-500" />
                                  <span className="font-semibold">Korporasi</span>
                                </div>
                                <div className="text-base font-bold text-white">{kseiBreakdown.corporate}%</div>
                                <div className="text-[10px] text-slate-500">Holding & entitas</div>
                              </div>
                              <div className="p-2.5 rounded-xl bg-[#090d16] border border-slate-700/40 col-span-2 sm:col-span-1">
                                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mb-1">
                                  <span className="h-2 w-2 rounded-full bg-slate-400" />
                                  <span className="font-semibold">Ritel / Individu</span>
                                </div>
                                <div className="text-base font-bold text-white">{kseiBreakdown.individual}%</div>
                                <div className="text-[10px] text-slate-500">Investor perorangan</div>
                              </div>
                            </div>
                          </div>
                        )}

                        {report?.synthesis && (
                          <div className="rounded-2xl border border-slate-800 bg-[#0d121e]/90 p-5 sm:p-6 shadow-2xl glass-panel glow-purple animate-card-reveal-delay-2">
                            <div className="flex items-center justify-between gap-4 pb-3 border-b border-slate-800 mb-3">
                              <div className="flex items-center gap-2">
                                <Sparkles className="h-4 w-4 text-purple-400" />
                                <h3 className="text-sm font-bold text-white">
                                  Tesis Kepemilikan Institusional & Smart Money
                                </h3>
                              </div>
                              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-300 font-semibold border border-purple-500/20">
                                Institutional Thesis
                              </span>
                            </div>

                            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed mb-4">
                              {report.synthesis.executive_summary}
                            </p>

                            {report.synthesis.smart_money_flow && (
                              <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-200 mb-3 font-medium">
                                <strong className="text-purple-400">Arus Dana Smart Money:</strong> {report.synthesis.smart_money_flow}
                              </div>
                            )}

                            {report.synthesis.valuation_verdict && (
                              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-200 mb-3 font-medium">
                                <strong className="text-emerald-400">Valuation & Stabilitas:</strong> {report.synthesis.valuation_verdict}
                              </div>
                            )}

                            {report.synthesis.key_findings && report.synthesis.key_findings.length > 0 && (
                              <div className="pt-3 border-t border-slate-800/60 text-xs">
                                <h4 className="font-bold text-slate-400 uppercase tracking-wider mb-2 text-[10px]">
                                  Temuan Kunci Kepemilikan Saham
                                </h4>
                                <ul className="space-y-1.5 text-slate-300">
                                  {report.synthesis.key_findings.map((f, fi) => (
                                    <li key={fi} className="flex items-start gap-2">
                                      <span className="text-purple-400 mt-0.5">•</span>
                                      <span>{f}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}

                        {report && (
                          <div
                            onClick={() => onOpenArtifact(String(msg.id || `artifact-${index}`))}
                            className="p-3.5 rounded-2xl bg-[#090e1a] border border-purple-500/30 hover:border-purple-400/70 hover:bg-[#0c1426] transition-all cursor-pointer group flex items-center justify-between shadow-lg animate-card-reveal-delay-2 hover:scale-[1.008]"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="h-9 w-9 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:scale-105 transition-transform shrink-0">
                                <FileText className="h-4 w-4" />
                              </div>
                              <div className="min-w-0">
                                <span className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors truncate">
                                  {report.query || 'Institutional Ownership Dossier'}
                                </span>
                              </div>
                            </div>
                            <ArrowRight className="h-4 w-4 text-purple-400 group-hover:translate-x-1 transition-transform shrink-0" />
                          </div>
                        )}
                      </>
                    )}

                    {/* 6. REGULATORY SUSPENSION & UMA SIGNATURE LAYOUT */}
                    {isSuspension && (
                      <>
                        {report?.metrics_summary && (
                          <div className="animate-card-reveal-delay-1">
                            <Company360Card data={report.metrics_summary} />
                          </div>
                        )}

                        {report?.suspensions_data && report.suspensions_data.length > 0 && (
                          <div className="rounded-2xl border border-slate-800 bg-[#0d121e]/90 p-5 sm:p-6 shadow-2xl glass-panel glow-rose animate-card-reveal-delay-1">
                            <div className="flex items-center justify-between gap-4 pb-3 border-b border-slate-800 mb-4">
                              <div className="flex items-center gap-2.5">
                                <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
                                  <ShieldAlert className="h-4 w-4" />
                                </div>
                                <div>
                                  <h3 className="text-sm font-bold text-white">
                                    Radar Pengawasan & Suspensi Regulasi BEI
                                  </h3>
                                  <p className="text-[11px] text-slate-400">
                                    Daftar tindakan penghentian sementara perdagangan & Unusual Market Activity (UMA)
                                  </p>
                                </div>
                              </div>
                              <span className="text-[10px] px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-300 font-semibold border border-rose-500/20 shrink-0">
                                {report.suspensions_data.length} Emiten Diawasi
                              </span>
                            </div>

                            {/* Mini Table */}
                            <div className="overflow-x-auto rounded-xl border border-slate-800/80">
                              <table className="w-full text-left text-xs">
                                <thead className="bg-[#090d16] text-[10px] uppercase font-bold text-slate-400 border-b border-slate-800">
                                  <tr>
                                    <th className="py-2.5 px-3">Emiten</th>
                                    <th className="py-2.5 px-3">Tanggal</th>
                                    <th className="py-2.5 px-3">Status</th>
                                    <th className="py-2.5 px-3">Nomor Surat BEI</th>
                                    <th className="py-2.5 px-3">Alasan / Catatan Regulasi</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/60 bg-[#070a12]/70">
                                  {report.suspensions_data.slice(0, 6).map((sus: any, sIdx: number) => {
                                    const isUma = (sus.action_type || '').toUpperCase().includes('UMA') || (sus.suspension_reason || '').toUpperCase().includes('UMA');
                                    return (
                                      <tr key={sIdx} className="hover:bg-slate-800/40 transition-colors">
                                        <td className="py-2.5 px-3 font-bold text-white flex items-center gap-1.5">
                                          <span className="text-rose-400 font-mono">{(sus.symbol || '').replace('.JK', '')}</span>
                                          <span className="text-[10px] font-normal text-slate-400 truncate max-w-[120px]">{sus.company_name}</span>
                                        </td>
                                        <td className="py-2.5 px-3 text-slate-300 font-mono text-[11px] whitespace-nowrap">{sus.date || '-'}</td>
                                        <td className="py-2.5 px-3 whitespace-nowrap">
                                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border ${
                                            isUma
                                              ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                                              : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                                          }`}>
                                            {isUma ? 'Radar UMA' : 'Suspensi BEI'}
                                          </span>
                                        </td>
                                        <td className="py-2.5 px-3 text-slate-400 font-mono text-[10px]">{sus.letter_number || '-'}</td>
                                        <td className="py-2.5 px-3 text-slate-300 text-[11px] max-w-[200px] truncate" title={sus.suspension_reason}>
                                          {sus.suspension_reason || 'Pendinginan volatilitas harga'}
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}

                        {report?.synthesis && (
                          <div className="rounded-2xl border border-slate-800 bg-[#0d121e]/90 p-5 sm:p-6 shadow-2xl glass-panel glow-rose animate-card-reveal-delay-2">
                            <div className="flex items-center justify-between gap-4 pb-3 border-b border-slate-800 mb-3">
                              <div className="flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4 text-rose-400" />
                                <h3 className="text-sm font-bold text-white">
                                  Evaluasi Risiko Regulasi & Tindakan Pengawasan Bursa
                                </h3>
                              </div>
                              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-300 font-semibold border border-rose-500/20">
                                Regulatory Risk Verdict
                              </span>
                            </div>

                            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed mb-4">
                              {report.synthesis.executive_summary}
                            </p>

                            {report.synthesis.valuation_verdict && (
                              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-200 mb-3 font-medium">
                                <strong className="text-rose-400">Catatan Risiko Likuiditas:</strong> {report.synthesis.valuation_verdict}
                              </div>
                            )}

                            {report.synthesis.key_findings && report.synthesis.key_findings.length > 0 && (
                              <div className="pt-3 border-t border-slate-800/60 text-xs">
                                <h4 className="font-bold text-slate-400 uppercase tracking-wider mb-2 text-[10px]">
                                  Daftar Temuan Pengawasan Bursa
                                </h4>
                                <ul className="space-y-1.5 text-slate-300">
                                  {report.synthesis.key_findings.map((f, fi) => (
                                    <li key={fi} className="flex items-start gap-2">
                                      <span className="text-rose-400 mt-0.5">•</span>
                                      <span>{f}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}

                        {report && (
                          <div
                            onClick={() => onOpenArtifact(String(msg.id || `artifact-${index}`))}
                            className="p-3.5 rounded-2xl bg-[#090e1a] border border-rose-500/30 hover:border-rose-400/70 hover:bg-[#0c1426] transition-all cursor-pointer group flex items-center justify-between shadow-lg animate-card-reveal-delay-2 hover:scale-[1.008]"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="h-9 w-9 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 group-hover:scale-105 transition-transform shrink-0">
                                <FileText className="h-4 w-4" />
                              </div>
                              <div className="min-w-0">
                                <span className="text-xs font-bold text-white group-hover:text-rose-300 transition-colors truncate">
                                  {report.query || 'Suspension Radar Dossier'}
                                </span>
                              </div>
                            </div>
                            <ArrowRight className="h-4 w-4 text-rose-400 group-hover:translate-x-1 transition-transform shrink-0" />
                          </div>
                        )}
                      </>
                    )}

                    {/* 7. INSIDER FORENSIC SIGNATURE LAYOUT */}
                    {isInsider && (
                      <>
                        {report?.metrics_summary && (
                          <div className="animate-card-reveal-delay-1">
                            <Company360Card data={report.metrics_summary} />
                          </div>
                        )}

                        {report?.insider_filings && report.insider_filings.length > 0 && (
                          <div className="rounded-2xl border border-slate-800 bg-[#0d121e]/90 p-5 sm:p-6 shadow-2xl glass-panel glow-cyan animate-card-reveal-delay-1">
                            <div className="flex items-center justify-between gap-4 pb-3 border-b border-slate-800 mb-4">
                              <div className="flex items-center gap-2.5">
                                <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                                  <Briefcase className="h-4 w-4" />
                                </div>
                                <div>
                                  <h3 className="text-sm font-bold text-white">
                                    Keterbukaan Transaksi Orang Dalam (Insider Filings) {report.primary_ticker ? `(${report.primary_ticker})` : ''}
                                  </h3>
                                  <p className="text-[11px] text-slate-400">
                                    Laporan transaksi resmi Direksi, Komisaris, dan Pemegang Saham Pengendali BEI
                                  </p>
                                </div>
                              </div>
                              <span className="text-[10px] px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-300 font-semibold border border-cyan-500/20 shrink-0">
                                {report.insider_filings.length} Laporan Resmi
                              </span>
                            </div>

                            {/* Mini Filings List */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                              {report.insider_filings.slice(0, 4).map((fil: any, fIdx: number) => {
                                const isBuy = (fil.transaction_type || '').toUpperCase() === 'BUY';
                                return (
                                  <div key={fIdx} className="p-3 rounded-xl bg-[#090d16] border border-slate-800 hover:border-cyan-500/30 transition-colors">
                                    <div className="flex items-center justify-between gap-2 mb-1.5">
                                      <span className="font-bold text-white text-xs truncate">{fil.name || 'Orang Dalam'}</span>
                                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                                        isBuy ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                                      }`}>
                                        {isBuy ? 'Akumulasi Beli' : 'Divestasi Jual'}
                                      </span>
                                    </div>
                                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                                      <span>{fil.position || 'Manajemen Kunci'}</span>
                                      <span className="font-mono text-slate-300">{fil.date || '-'}</span>
                                    </div>
                                    {(fil.shares || fil.value) && (
                                      <div className="mt-1.5 pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                                        <span className="text-slate-500">Volume:</span>
                                        <span className="font-mono text-cyan-300 font-semibold">
                                          {Number(fil.shares || 0).toLocaleString('id-ID')} lembar
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {report?.broker_summary && (
                          <div className="animate-card-reveal-delay-1">
                            <BrokerFlowTracker
                              brokerSummary={report.broker_summary}
                              ticker={report.primary_ticker}
                            />
                          </div>
                        )}

                        {report?.synthesis && (
                          <div className="rounded-2xl border border-slate-800 bg-[#0d121e]/90 p-5 sm:p-6 shadow-2xl glass-panel glow-cyan animate-card-reveal-delay-2">
                            <div className="flex items-center justify-between gap-4 pb-3 border-b border-slate-800 mb-3">
                              <div className="flex items-center gap-2">
                                <Sparkles className="h-4 w-4 text-cyan-400" />
                                <h3 className="text-sm font-bold text-white">
                                  Sintesis Forensik Transaksi Orang Dalam
                                </h3>
                              </div>
                              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 font-semibold border border-cyan-500/20">
                                Insider Radar
                              </span>
                            </div>

                            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed mb-4">
                              {report.synthesis.executive_summary}
                            </p>

                            {report.synthesis.smart_money_flow && (
                              <div className="p-3.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-xs text-cyan-200 mb-3 font-medium">
                                <strong className="text-cyan-400">Analisis Keyakinan Manajemen:</strong> {report.synthesis.smart_money_flow}
                              </div>
                            )}

                            {report.synthesis.valuation_verdict && (
                              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-200 mb-3 font-medium">
                                <strong className="text-emerald-400">Valuasi & Sinyal Pasar:</strong> {report.synthesis.valuation_verdict}
                              </div>
                            )}

                            {report.synthesis.key_findings && report.synthesis.key_findings.length > 0 && (
                              <div className="pt-3 border-t border-slate-800/60 text-xs">
                                <h4 className="font-bold text-slate-400 uppercase tracking-wider mb-2 text-[10px]">
                                  Poin Kunci Transaksi Insider
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

                        {report && (
                          <div
                            onClick={() => onOpenArtifact(String(msg.id || `artifact-${index}`))}
                            className="p-3.5 rounded-2xl bg-[#090e1a] border border-cyan-500/30 hover:border-cyan-400/70 hover:bg-[#0c1426] transition-all cursor-pointer group flex items-center justify-between shadow-lg animate-card-reveal-delay-2 hover:scale-[1.008]"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="h-9 w-9 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform shrink-0">
                                <FileText className="h-4 w-4" />
                              </div>
                              <div className="min-w-0">
                                <span className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors truncate">
                                  {report.query || 'Insider Filings Dossier'}
                                </span>
                              </div>
                            </div>
                            <ArrowRight className="h-4 w-4 text-cyan-400 group-hover:translate-x-1 transition-transform shrink-0" />
                          </div>
                        )}
                      </>
                    )}

                    {/* 8. GENERAL / FALLBACK */}
                    {!isPeerBattle && !isSmartMoney && !isCompany360 && !isMarketScreening && !isInstitutional && !isSuspension && !isInsider && (
                      <>
                        {report?.peer_matrix && report.peer_matrix.length > 0 && (
                          <div className="animate-card-reveal-delay-1">
                            <PeerBattleMatrix matrix={report.peer_matrix} />
                          </div>
                        )}

                        {report?.metrics_summary && (
                          <div className="animate-card-reveal-delay-1">
                            <Company360Card data={report.metrics_summary} />
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

                            {report.synthesis.valuation_verdict && (
                              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-200 mb-3 font-medium">
                                <strong className="text-emerald-400">Valuation Verdict:</strong> {report.synthesis.valuation_verdict}
                              </div>
                            )}

                            {report.synthesis.smart_money_flow && (
                              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 mb-3 font-medium">
                                <strong className="text-amber-400">Flow Analysis:</strong> {report.synthesis.smart_money_flow}
                              </div>
                            )}

                            {report.synthesis.key_findings && report.synthesis.key_findings.length > 0 && (
                              <div className="pt-3 border-t border-slate-800/60 text-xs">
                                <h4 className="font-bold text-slate-400 uppercase tracking-wider mb-2 text-[10px]">
                                  Temuan Kunci Riset
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

                        {report && (
                          <div
                            onClick={() => onOpenArtifact(String(msg.id || `artifact-${index}`))}
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
                              onClick={() => onSendMessage(followup)}
                              disabled={isLoading}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 border text-xs text-left transition-all active:scale-95 group shadow-sm ${
                                isPeerBattle
                                  ? 'hover:bg-cyan-950/50 border-slate-700/80 hover:border-cyan-500/50 text-white hover:text-cyan-200'
                                  : isSmartMoney
                                  ? 'hover:bg-amber-950/50 border-slate-700/80 hover:border-amber-500/50 text-white hover:text-amber-200'
                                  : 'hover:bg-emerald-950/50 border-slate-700/80 hover:border-emerald-500/50 text-white hover:text-emerald-200'
                              }`}
                            >
                              <span className="line-clamp-1">{followup}</span>
                              <ArrowRight className="h-3 w-3 text-slate-400 group-hover:text-current shrink-0 transition-transform group-hover:translate-x-0.5" />
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
