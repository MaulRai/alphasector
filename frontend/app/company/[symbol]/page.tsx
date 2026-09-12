'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { AuthGate } from '@/components/AuthGate';
import { Company360Card } from '@/components/Company360Card';
import { BrokerFlowTracker } from '@/components/BrokerFlowTracker';
import { AgentThinkingTrace } from '@/components/AgentThinkingTrace';
import { ResearchDossierModal } from '@/components/ResearchDossierModal';
import { NotionExportModal } from '@/components/NotionExportModal';
import { CompanyValuationHistoryTable } from '@/components/company/CompanyValuationHistoryTable';
import { CompanySegmentsCard } from '@/components/company/CompanySegmentsCard';
import { CompanyAiSynthesisBanner } from '@/components/company/CompanyAiSynthesisBanner';
import { MiningOperationalCard } from '@/components/company/MiningOperationalCard';
import { useBackendHealth } from '@/hooks/useBackendHealth';
import { fetchCompanyReport, fetchCompanySegments, fetchBrokerSummary, queryAgent } from '@/lib/api';
import { AgentQueryResponse, PeerCompanyMetric } from '@/lib/types';
import { ArrowLeft, RefreshCw, Printer } from 'lucide-react';

export default function Company360Page() {
  const params = useParams();
  const router = useRouter();
  const rawSymbol = (params?.symbol as string) || 'BBCA';
  const symbol = rawSymbol.toUpperCase().replace('.JK', '');

  const [reportData, setReportData] = useState<any>(null);
  const [segmentsData, setSegmentsData] = useState<any>(null);
  const [brokerData, setBrokerData] = useState<any>(null);
  const [agentReport, setAgentReport] = useState<AgentQueryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDossierOpen, setIsDossierOpen] = useState(false);
  const [isNotionModalOpen, setIsNotionModalOpen] = useState(false);
  const { backendOnline } = useBackendHealth();

  useEffect(() => {
    loadBasicReport(symbol);
  }, [symbol]);

  // Step 1: Lightweight base report on mount (1 Sectors call)
  const loadBasicReport = async (sym: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const rep = await fetchCompanyReport(sym);
      setReportData(rep.data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || `Gagal memuat profil emiten ${sym}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: User-Triggered Deep Dive & AI Synthesis (Deep dive on demand)
  const executeDeepDiveAnalysis = async () => {
    setIsGeneratingAI(true);
    setError(null);
    try {
      if (!segmentsData) {
        try {
          const seg = await fetchCompanySegments(symbol);
          setSegmentsData(seg.data);
        } catch (e) {}
      }

      if (!brokerData) {
        try {
          const brk = await fetchBrokerSummary(symbol);
          setBrokerData(brk.data);
        } catch (e) {}
      }

      const aRes = await queryAgent(`Analisis fundamental, valuasi historis, dan peer group untuk ${symbol}`);
      setAgentReport(aRes);
    } catch (err: any) {
      console.error(err);
      setError(err.message || `Gagal menyintesis riset AI untuk ${symbol}`);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const overview = reportData?.overview || {};
  const valuation = reportData?.valuation || {};
  const financials = reportData?.financials || {};
  const histVal = valuation?.historical_valuation || [];
  const histFin = financials?.historical_financials || [];
  const latestFin = histFin.length > 0 ? histFin[histFin.length - 1] : (financials || {});

  const earnings = Number(latestFin.earnings ?? latestFin.net_income ?? 0);
  const totalEquity = Number(latestFin.total_equity ?? 0);
  const revenue = Number(latestFin.revenue ?? 0);
  const totalDebt = Number(latestFin.total_debt ?? latestFin.total_liabilities ?? 0);

  const calculatedRoe = (earnings !== 0 && totalEquity > 0) ? (earnings / totalEquity) * 100 : (financials.roe ?? financials.return_on_equity ?? null);
  const calculatedNpm = (earnings !== 0 && revenue > 0) ? (earnings / revenue) * 100 : (financials.npm ?? financials.net_profit_margin ?? null);
  const calculatedDer = (totalDebt > 0 && totalEquity > 0) ? (totalDebt / totalEquity) : (financials.der ?? financials.debt_to_equity ?? null);

  // Format metric object for Company360Card
  const metricData: PeerCompanyMetric | null = reportData ? {
    symbol: symbol,
    company_name: reportData.company_name || overview.company_name || symbol,
    sector: overview.sector || '-',
    sub_sector: overview.sub_sector || '-',
    last_close_price: overview.last_close_price || valuation.last_close_price,
    market_cap: overview.market_cap,
    pe: histVal.length > 0 ? histVal[histVal.length - 1].pe : valuation.pe,
    pbv: histVal.length > 0 ? histVal[histVal.length - 1].pb : valuation.pbv,
    pe_peer_avg: histVal.length > 0 ? histVal[histVal.length - 1].pe_peer_avg : null,
    pb_peer_avg: histVal.length > 0 ? histVal[histVal.length - 1].pb_peer_avg : null,
    roe: calculatedRoe,
    der: calculatedDer,
    npm: calculatedNpm,
    tags: overview.tags || []
  } : null;

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col">
      <Navbar 
        backendOnline={backendOnline}
        hasActiveReport={!!agentReport}
        onOpenDossier={() => setIsDossierOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-12">
        <AuthGate
          featureName={`Emiten 360° Profile & Dossier (${symbol})`}
          featureDescription={`Akses profil komprehensif, segmen bisnis, valuasi multi-periode, dan aliran broker flow untuk ${symbol} dengan akun analis.`}
        >
          {/* Navigation Breadcrumb & Actions */}
          <div className="flex items-center justify-between gap-4 mb-6">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5 text-slate-400" />
              <span>Kembali ke Halaman Sebelumnya</span>
            </button>

            <div className="flex items-center gap-2.5">
              {agentReport && (
                <button
                  onClick={() => setIsDossierOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-semibold transition-all cursor-pointer"
                >
                  <Printer className="h-3.5 w-3.5" />
                  <span>Cetak / Export Dossier</span>
                </button>
              )}

              {reportData && (
                <button
                  onClick={() => setIsNotionModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#151c2c] hover:bg-[#1c263c] border border-slate-700 hover:border-emerald-500/40 text-slate-200 hover:text-emerald-300 text-xs font-semibold transition-all shadow-sm cursor-pointer"
                  title="Sync Investment Memo ke Workspace Notion"
                >
                  <span className="font-serif font-black text-white text-[10px] bg-slate-800 px-1 py-0.2 rounded border border-slate-700">N</span>
                  <span>Sync to Notion</span>
                </button>
              )}
            </div>
          </div>

          {/* Loading Base Report */}
          {isLoading && (
            <div className="py-24 text-center space-y-3">
              <RefreshCw className="h-8 w-8 text-blue-400 animate-spin mx-auto" />
              <p className="text-sm text-slate-400 font-medium">
                Memuat data dasar emiten {symbol} dari Sectors API...
              </p>
            </div>
          )}

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Content Body */}
          {!isLoading && reportData && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Emiten 360° Hero Card */}
              {metricData && <Company360Card data={metricData} />}

              {/* AI Autonomous Synthesis Banner & Output */}
              <CompanyAiSynthesisBanner
                symbol={symbol}
                agentReport={agentReport}
                isGeneratingAI={isGeneratingAI}
                onExecuteDeepDive={executeDeepDiveAnalysis}
              />

              {/* Live Agent Reasoning Trace Accordion */}
              {agentReport && (
                <AgentThinkingTrace
                  steps={agentReport.reasoning_trace}
                  totalTimeMs={agentReport.total_execution_time_ms}
                  creditsConsumed={agentReport.credits_consumed}
                />
              )}

              {/* Mining & Commodities Operational Rigor (Strip Ratio, JORC Reserves, Coal Specs) */}
              <MiningOperationalCard ticker={symbol} />

              {/* Historical Valuation Multiples Table */}
              <CompanyValuationHistoryTable
                histVal={histVal}
                subSector={overview.sub_sector}
              />

              {/* Revenue Segments Breakdown */}
              <CompanySegmentsCard segmentsData={segmentsData} />

              {/* Smart Money Broker Flow */}
              {brokerData && (
                <BrokerFlowTracker brokerSummary={brokerData} ticker={symbol} />
              )}
            </div>
          )}
        </AuthGate>
      </main>

      {/* Exportable Dossier Modal */}
      {agentReport && (
        <ResearchDossierModal
          isOpen={isDossierOpen}
          onClose={() => setIsDossierOpen(false)}
          report={agentReport}
        />
      )}

      {/* 1-Click Notion Investment Memo Modal */}
      {reportData && (
        <NotionExportModal
          isOpen={isNotionModalOpen}
          onClose={() => setIsNotionModalOpen(false)}
          ticker={symbol}
          companyName={reportData?.overview?.company_name}
          metrics={metricData}
          piotroski={metricData?.piotroski}
          pe_band={metricData?.pe_band}
          synthesis={agentReport?.synthesis}
          brokerSummary={brokerData}
        />
      )}
    </div>
  );
}
