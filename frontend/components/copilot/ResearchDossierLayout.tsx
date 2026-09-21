'use client';

import React from 'react';
import { AgentQueryResponse } from '@/lib/types';
import { AgentThinkingTrace } from '@/components/AgentThinkingTrace';
import { PeerBattleMatrix } from '@/components/PeerBattleMatrix';
import { Company360Card } from '@/components/Company360Card';
import { BrokerFlowTracker } from '@/components/BrokerFlowTracker';
import { DossierSynthesisCard } from './dossier/DossierSynthesisCard';
import { DossierArtifactCta } from './dossier/DossierArtifactCta';
import { SuggestedFollowupPills } from './dossier/SuggestedFollowupPills';
import { KseiOwnershipBreakdown } from './dossier/KseiOwnershipBreakdown';
import { SuspensionsMiniTable } from './dossier/SuspensionsMiniTable';
import { InsiderFilingsMiniGrid } from './dossier/InsiderFilingsMiniGrid';

interface ResearchDossierLayoutProps {
  report: AgentQueryResponse;
  artifactId: string;
  onOpenArtifact: (artifactId: string) => void;
  onSendMessage: (query: string) => void;
  isLoading?: boolean;
}

export const ResearchDossierLayout: React.FC<ResearchDossierLayoutProps> = ({
  report,
  artifactId,
  onOpenArtifact,
  onSendMessage,
  isLoading = false,
}) => {
  const isMarketScreening = Boolean(
    report.intent === 'MARKET_SCREENING_DISCOVERY'
  );
  const isPeerBattle = Boolean(
    !isMarketScreening && (
      report.intent === 'PEER_BATTLE_COMPARISON' ||
      (report.peer_matrix && report.peer_matrix.length > 1 && !report.metrics_summary)
    )
  );
  const isInstitutional = Boolean(
    report.intent === 'INSTITUTIONAL_OWNERSHIP' ||
    Boolean(report.shareholders_summary)
  );
  const isSuspension = Boolean(
    report.intent === 'REGULATORY_SUSPENSION_RADAR' ||
    Boolean(report.suspensions_data && report.suspensions_data.length > 0)
  );
  const isInsider = Boolean(
    report.intent === 'INSIDER_FORENSIC_RADAR' ||
    Boolean(report.insider_filings && report.insider_filings.length > 0)
  );
  const isSmartMoney = Boolean(
    !isInsider && !isInstitutional && !isSuspension && (
      report.intent === 'SMART_MONEY_RADAR' ||
      (report.broker_summary && !report.peer_matrix && !report.metrics_summary)
    )
  );
  const isCompany360 = Boolean(
    !isMarketScreening && !isPeerBattle && !isSmartMoney && !isInstitutional && !isSuspension && !isInsider && (
      report.intent === 'SINGLE_TICKER_DEEP_DIVE' ||
      (report.metrics_summary && !report.peer_matrix)
    )
  );

  const activeColorVariant = isPeerBattle
    ? 'cyan'
    : isSmartMoney
    ? 'amber'
    : isInstitutional
    ? 'purple'
    : isSuspension
    ? 'rose'
    : isInsider
    ? 'cyan'
    : 'emerald';

  const handleOpenArtifact = () => onOpenArtifact(artifactId);

  return (
    <div className="w-full space-y-5 animate-card-reveal">
      {/* Live/Completed Thinking Trace Accordion */}
      {report.reasoning_trace && report.reasoning_trace.length > 0 && (
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
          {report.peer_matrix && report.peer_matrix.length > 0 && (
            <div className="animate-card-reveal-delay-1">
              <PeerBattleMatrix matrix={report.peer_matrix} />
            </div>
          )}

          {report.synthesis && (
            <DossierSynthesisCard
              synthesis={report.synthesis}
              title="Ringkasan & Valuation Verdict (AI Synthesis)"
              badgeLabel="Peer Battle Head-to-Head"
              colorVariant="cyan"
              valuationLabel="Valuation Verdict"
              keyFindingsTitle="Key Comparative Highlights"
            />
          )}

          <DossierArtifactCta
            title={report.query || 'Peer Battle Dossier'}
            badgeLabel="Peer Battle Dossier"
            description="Buka visualisasi komparatif lengkap di Artifact Panel ➔"
            colorVariant="cyan"
            onClick={handleOpenArtifact}
          />
        </>
      )}

      {/* 2. SMART MONEY SIGNATURE LAYOUT */}
      {isSmartMoney && (
        <>
          {report.broker_summary && (
            <div className="animate-card-reveal-delay-1">
              <BrokerFlowTracker
                brokerSummary={report.broker_summary}
                ticker={report.primary_ticker}
              />
            </div>
          )}

          {report.synthesis && (
            <DossierSynthesisCard
              synthesis={report.synthesis}
              title={`Sintesis Smart Money ${report.primary_ticker ? `(${report.primary_ticker})` : ''}`}
              badgeLabel="Smart Money & Institutional Flow"
              colorVariant="amber"
              extraFieldLabel="Flow Analysis"
              extraFieldValue={report.synthesis.smart_money_flow}
              keyFindingsTitle="Bandarmology / Flow Signals"
            />
          )}

          <DossierArtifactCta
            title={report.query || 'Smart Money Dossier'}
            badgeLabel="Smart Money Dossier"
            description="Buka analisis akumulasi broker lengkap di Artifact Panel ➔"
            colorVariant="amber"
            onClick={handleOpenArtifact}
          />
        </>
      )}

      {/* 3. COMPANY 360 SIGNATURE LAYOUT */}
      {isCompany360 && (
        <>
          {report.metrics_summary && (
            <div className="animate-card-reveal-delay-1">
              <Company360Card data={report.metrics_summary} />
            </div>
          )}

          {report.synthesis && (
            <DossierSynthesisCard
              synthesis={report.synthesis}
              title={`Sintesis Riset Fundamental Otonom ${report.primary_ticker ? `(${report.primary_ticker})` : ''}`}
              badgeLabel="Company 360° Deep-Dive"
              colorVariant="emerald"
              valuationLabel="Valuation Verdict"
              keyFindingsTitle="Key Fundamental Findings"
            />
          )}

          <DossierArtifactCta
            title={report.query || 'Company 360 Dossier'}
            badgeLabel="Company 360 Dossier"
            description="Buka laporan riset lengkap di Artifact Panel ➔"
            colorVariant="emerald"
            onClick={handleOpenArtifact}
          />
        </>
      )}

      {/* 4. MARKET SCREENING SIGNATURE LAYOUT */}
      {isMarketScreening && (
        <>
          {report.peer_matrix && report.peer_matrix.length > 0 && (
            <div className="animate-card-reveal-delay-1">
              <PeerBattleMatrix matrix={report.peer_matrix} />
            </div>
          )}

          {report.synthesis && (
            <DossierSynthesisCard
              synthesis={report.synthesis}
              title="Tesis Investasi & Temuan Skrining"
              badgeLabel="Screener Discovery Thesis"
              colorVariant="emerald"
              valuationLabel="Rekomendasi & Top Pick"
              keyFindingsTitle="Katalis & Alasan Pemilihan Emiten"
            />
          )}

          <DossierArtifactCta
            title={report.query || 'Screener Discovery Dossier'}
            badgeLabel="Screener Dossier"
            description="Buka hasil skrining dan metrik komparasi lengkap di Artifact Panel ➔"
            colorVariant="emerald"
            onClick={handleOpenArtifact}
          />
        </>
      )}

      {/* 5. INSTITUTIONAL OWNERSHIP SIGNATURE LAYOUT */}
      {isInstitutional && (
        <>
          {report.metrics_summary && (
            <div className="animate-card-reveal-delay-1">
              <Company360Card data={report.metrics_summary} />
            </div>
          )}

          {report.shareholders_summary && (
            <KseiOwnershipBreakdown
              shareholdersSummary={report.shareholders_summary}
              primaryTicker={report.primary_ticker}
            />
          )}

          {report.synthesis && (
            <DossierSynthesisCard
              synthesis={report.synthesis}
              title="Tesis Kepemilikan Institusional & Smart Money"
              badgeLabel="Institutional Thesis"
              colorVariant="purple"
              extraFieldLabel="Arus Dana Smart Money"
              extraFieldValue={report.synthesis.smart_money_flow}
              valuationLabel="Valuation & Stabilitas"
              keyFindingsTitle="Temuan Kunci Kepemilikan Saham"
            />
          )}

          <DossierArtifactCta
            title={report.query || 'Institutional Ownership Dossier'}
            description="Buka kepemilikan pemegang saham lengkap di Artifact Panel ➔"
            colorVariant="purple"
            onClick={handleOpenArtifact}
          />
        </>
      )}

      {/* 6. REGULATORY SUSPENSION & UMA SIGNATURE LAYOUT */}
      {isSuspension && (
        <>
          {report.metrics_summary && (
            <div className="animate-card-reveal-delay-1">
              <Company360Card data={report.metrics_summary} />
            </div>
          )}

          {report.suspensions_data && report.suspensions_data.length > 0 && (
            <SuspensionsMiniTable suspensionsData={report.suspensions_data} />
          )}

          {report.synthesis && (
            <DossierSynthesisCard
              synthesis={report.synthesis}
              title="Evaluasi Risiko Regulasi & Tindakan Pengawasan Bursa"
              badgeLabel="Regulatory Risk Verdict"
              colorVariant="rose"
              valuationLabel="Catatan Risiko Likuiditas"
              keyFindingsTitle="Daftar Temuan Pengawasan Bursa"
            />
          )}

          <DossierArtifactCta
            title={report.query || 'Suspension Radar Dossier'}
            description="Buka riwayat suspensi regulasi lengkap di Artifact Panel ➔"
            colorVariant="rose"
            onClick={handleOpenArtifact}
          />
        </>
      )}

      {/* 7. INSIDER FORENSIC SIGNATURE LAYOUT */}
      {isInsider && (
        <>
          {report.metrics_summary && (
            <div className="animate-card-reveal-delay-1">
              <Company360Card data={report.metrics_summary} />
            </div>
          )}

          {report.insider_filings && report.insider_filings.length > 0 && (
            <InsiderFilingsMiniGrid
              insiderFilings={report.insider_filings}
              primaryTicker={report.primary_ticker}
            />
          )}

          {report.broker_summary && (
            <div className="animate-card-reveal-delay-1">
              <BrokerFlowTracker
                brokerSummary={report.broker_summary}
                ticker={report.primary_ticker}
              />
            </div>
          )}

          {report.synthesis && (
            <DossierSynthesisCard
              synthesis={report.synthesis}
              title="Sintesis Forensik Transaksi Orang Dalam"
              badgeLabel="Insider Radar"
              colorVariant="cyan"
              extraFieldLabel="Analisis Keyakinan Manajemen"
              extraFieldValue={report.synthesis.smart_money_flow}
              valuationLabel="Valuasi & Sinyal Pasar"
              keyFindingsTitle="Poin Kunci Transaksi Insider"
            />
          )}

          <DossierArtifactCta
            title={report.query || 'Insider Filings Dossier'}
            description="Buka rincian transaksi insider lengkap di Artifact Panel ➔"
            colorVariant="cyan"
            onClick={handleOpenArtifact}
          />
        </>
      )}

      {/* 8. GENERAL / FALLBACK */}
      {!isPeerBattle && !isSmartMoney && !isCompany360 && !isMarketScreening && !isInstitutional && !isSuspension && !isInsider && (
        <>
          {report.peer_matrix && report.peer_matrix.length > 0 && (
            <div className="animate-card-reveal-delay-1">
              <PeerBattleMatrix matrix={report.peer_matrix} />
            </div>
          )}

          {report.metrics_summary && (
            <div className="animate-card-reveal-delay-1">
              <Company360Card data={report.metrics_summary} />
            </div>
          )}

          {report.synthesis && (
            <DossierSynthesisCard
              synthesis={report.synthesis}
              title="Sintesis Riset Otonom"
              badgeLabel="Verified IDX Fact-Grounded"
              colorVariant="emerald"
              valuationLabel="Valuation Verdict"
              extraFieldLabel="Flow Analysis"
              extraFieldValue={report.synthesis.smart_money_flow}
              keyFindingsTitle="Temuan Kunci Riset"
            />
          )}

          <DossierArtifactCta
            title={report.query || 'Research Dossier'}
            description="Buka visualisasi riset lengkap di Artifact Panel ➔"
            colorVariant="emerald"
            onClick={handleOpenArtifact}
          />
        </>
      )}

      {/* Smart Follow-up Questions Pills */}
      {report.suggested_followups && report.suggested_followups.length > 0 && (
        <SuggestedFollowupPills
          followups={report.suggested_followups}
          colorVariant={activeColorVariant}
          isLoading={isLoading}
          onSendMessage={onSendMessage}
        />
      )}
    </div>
  );
};
