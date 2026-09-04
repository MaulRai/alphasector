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
  Sparkles, ArrowRight, FileText, RefreshCw, AlertCircle, Settings
} from 'lucide-react';

interface ChatMessageListProps {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  onSendMessage: (query: string) => void;
  onOpenArtifact: (artifactId: string) => void;
  latestAssistantMsgRef: React.RefObject<HTMLDivElement | null>;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

export const ChatMessageList: React.FC<ChatMessageListProps> = ({
  messages,
  isLoading,
  error,
  onSendMessage,
  onOpenArtifact,
  latestAssistantMsgRef,
  messagesEndRef,
}) => {
  return (
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

                    {/* 5. GENERAL / FALLBACK */}
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
  );
};
