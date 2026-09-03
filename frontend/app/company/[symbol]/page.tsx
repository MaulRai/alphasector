'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Company360Card } from '@/components/Company360Card';
import { BrokerFlowTracker } from '@/components/BrokerFlowTracker';
import { AgentThinkingTrace } from '@/components/AgentThinkingTrace';
import { ResearchDossierModal } from '@/components/ResearchDossierModal';
import { fetchCompanyReport, fetchCompanySegments, fetchBrokerSummary, queryAgent, checkBackendHealth } from '@/lib/api';
import { AgentQueryResponse, PeerCompanyMetric } from '@/lib/types';
import { 
  Building2, Sparkles, TrendingUp, Users, 
  ArrowLeft, RefreshCw, Layers, BookOpen, AlertCircle, Play, ShieldCheck,
  Printer, PieChart, DollarSign, Award
} from 'lucide-react';
import { AuthGate } from '@/components/AuthGate';

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
  const [backendOnline, setBackendOnline] = useState(true);

  useEffect(() => {
    checkBackendHealth().then(res => setBackendOnline(res.status === 'healthy'));
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
      // 1. Fetch Segments if not loaded
      if (!segmentsData) {
        try {
          const seg = await fetchCompanySegments(symbol);
          setSegmentsData(seg.data);
        } catch (e) {}
      }

      // 2. Fetch Broker summary if not loaded
      if (!brokerData) {
        try {
          const brk = await fetchBrokerSummary(symbol);
          setBrokerData(brk.data);
        } catch (e) {}
      }

      // 3. Query Agent for in-depth Indonesian synthesis
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
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col selection:bg-blue-500 selection:text-black">
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
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition-all shadow-sm active:scale-95"
          >
            <ArrowLeft className="h-3.5 w-3.5 text-slate-400" />
            <span>Kembali ke Halaman Sebelumnya</span>
          </button>

          {agentReport && (
            <button
              onClick={() => setIsDossierOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-semibold transition-all"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Cetak / Export Dossier</span>
            </button>
          )}
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

            {/* User-Triggered AI Synthesis Action Banner */}
            {!agentReport && (
              <div className="rounded-2xl border border-slate-800 bg-[#0d121e]/90 p-5 glass-panel flex flex-col sm:flex-row sm:items-center justify-between gap-4 glow-cyan">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="h-4 w-4 text-cyan-400" />
                    <h3 className="text-sm font-bold text-white">
                      Ingin Analisis Riset Otonom Lengkap untuk {symbol}?
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400">
                    Agent akan menganalisis segmen bisnis, aliran broker flow, dan menyintesis narasi riset fundamental.
                  </p>
                </div>

                <button
                  onClick={executeDeepDiveAnalysis}
                  disabled={isGeneratingAI}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:brightness-110 active:scale-95 text-black font-bold text-xs transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50 shrink-0"
                >
                  {isGeneratingAI ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Menyintesis Riset...</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-3.5 w-3.5 fill-black" />
                      <span>Generate AI Research Synthesis</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* AI Autonomous Brief Card (Shown after generation) */}
            {agentReport && agentReport.synthesis && (
              <div className="rounded-2xl border border-slate-800 bg-[#0d121e]/90 p-6 glass-panel glow-cyan">
                <div className="flex items-center gap-2 mb-3 pb-3 border-b border-slate-800">
                  <Sparkles className="h-4 w-4 text-cyan-400" />
                  <h3 className="text-base font-bold text-white">
                    Sintesis Riset Fundamental Otonom
                  </h3>
                </div>
                <p className="text-sm text-slate-200 leading-relaxed mb-4">
                  {agentReport.synthesis.executive_summary}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-300">
                    <strong className="text-cyan-400">Valuasi:</strong> {agentReport.synthesis.valuation_verdict || 'N/A'}
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-300">
                    <strong className="text-amber-400">Smart Money Flow:</strong> {agentReport.synthesis.smart_money_flow || 'N/A'}
                  </div>
                </div>
              </div>
            )}

            {/* Live Agent Reasoning Trace Accordion */}
            {agentReport && (
              <AgentThinkingTrace
                steps={agentReport.reasoning_trace}
                totalTimeMs={agentReport.total_execution_time_ms}
                creditsConsumed={agentReport.credits_consumed}
              />
            )}

            {/* Historical Valuation Multiples Table */}
            {histVal.length > 0 && (
              <div className="rounded-2xl border border-slate-800 bg-[#0d121e]/90 p-6 glass-panel">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
                  <div>
                    <h3 className="text-base font-bold text-white">
                      Valuasi Historis & Peer Comparison (Tahunan)
                    </h3>
                    <p className="text-xs text-slate-400">Multiples historis vs rata-rata peers subsektor {overview.sub_sector}</p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold bg-slate-900/40">
                        <th className="py-2.5 px-3">Tahun</th>
                        <th className="py-2.5 px-3">P/E Rasio</th>
                        <th className="py-2.5 px-3">P/E Peer Avg</th>
                        <th className="py-2.5 px-3">PBV Rasio</th>
                        <th className="py-2.5 px-3">PBV Peer Avg</th>
                        <th className="py-2.5 px-3">P/S</th>
                        <th className="py-2.5 px-3">PCF</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-medium">
                      {histVal.map((v: any, idx: number) => (
                        <tr key={idx} className="hover:bg-slate-800/30">
                          <td className="py-2.5 px-3 font-bold text-white">{v.year || '-'}</td>
                          <td className="py-2.5 px-3 text-emerald-400 font-bold">{v.pe !== null && v.pe !== undefined ? `${Number(v.pe).toFixed(2)}x` : '-'}</td>
                          <td className="py-2.5 px-3 text-slate-400">{v.pe_peer_avg !== null && v.pe_peer_avg !== undefined ? `${Number(v.pe_peer_avg).toFixed(2)}x` : '-'}</td>
                          <td className="py-2.5 px-3 text-cyan-400 font-bold">{v.pb !== null && v.pb !== undefined ? `${Number(v.pb).toFixed(2)}x` : '-'}</td>
                          <td className="py-2.5 px-3 text-slate-400">{v.pb_peer_avg !== null && v.pb_peer_avg !== undefined ? `${Number(v.pb_peer_avg).toFixed(2)}x` : '-'}</td>
                          <td className="py-2.5 px-3 text-slate-300">{v.ps !== null && v.ps !== undefined ? `${Number(v.ps).toFixed(2)}x` : '-'}</td>
                          <td className="py-2.5 px-3 text-slate-300">{v.pcf !== null && v.pcf !== undefined ? `${Number(v.pcf).toFixed(2)}x` : '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Revenue Segments (Sankey Breakdown Data) */}
            {segmentsData && (
              <div className="rounded-2xl border border-slate-800 bg-[#0d121e]/90 p-6 glass-panel">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-800">
                  <PieChart className="h-4 w-4 text-emerald-400" />
                  <h3 className="text-base font-bold text-white">
                    Laporan Segmen Pendapatan & Biaya Operasional
                  </h3>
                </div>
                
                {Array.isArray(segmentsData) && segmentsData.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {segmentsData.map((seg: any, idx: number) => (
                      <div key={idx} className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
                        <div className="text-slate-400 font-medium">{seg.name || seg.segment_name || `Segmen ${idx+1}`}</div>
                        <div className="text-sm font-bold text-emerald-400 mt-1">
                          {seg.value ? `Rp ${(seg.value / 1e12).toFixed(2)} T` : '-'}
                        </div>
                        {seg.percentage && (
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            Kontribusi: {seg.percentage}%
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">
                    Data rincian segmen bisnis berhasil dikumpulkan untuk analisis mendalam.
                  </p>
                )}
              </div>
            )}

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
    </div>
  );
}
