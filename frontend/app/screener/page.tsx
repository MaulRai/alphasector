'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { AuthGate } from '@/components/AuthGate';
import { AlphaAgentLogo } from '@/components/AlphaAgentLogo';
import { useScreener } from '@/hooks/useScreener';
import { useBackendHealth } from '@/hooks/useBackendHealth';
import { ScreenerFilterControls } from '@/components/screener/ScreenerFilterControls';
import { ScreenerResultsTable } from '@/components/screener/ScreenerResultsTable';
import { ScreenerBattleDock } from '@/components/screener/ScreenerBattleDock';
import { queryAgent } from '@/lib/api';
import { Search, RefreshCw, ArrowRight, AlertCircle, Database } from 'lucide-react';

export default function ScreenerPage() {
  const router = useRouter();
  const { backendOnline } = useBackendHealth();
  const [isPreparingChat, setIsPreparingChat] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);

  const resultsTableRef = useRef<HTMLDivElement>(null);
  const wasLoadingRef = useRef(false);

  const {
    nlQuery,
    setNlQuery,
    selectedSubsector,
    setSelectedSubsector,
    orderBy,
    setOrderBy,
    subsectors,
    results,
    isLoading,
    error,
    activePreset,
    hasSearched,
    selectedTickersForBattle,
    toggleTickerForBattle,
    clearSelectedTickersForBattle,
    handleFilterSearch,
    handleNlSearch,
    handleSelectPreset,
    getScreeningThesisQuery,
  } = useScreener();

  // Automatically scroll down directly to the results table when screening completes
  useEffect(() => {
    if (wasLoadingRef.current && !isLoading && results.length > 0) {
      const timer = setTimeout(() => {
        resultsTableRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }, 150);
      return () => clearTimeout(timer);
    }
    wasLoadingRef.current = isLoading;
  }, [isLoading, results.length]);

  const handleResetFilters = () => {
    setNlQuery('');
    setSelectedSubsector('');
    handleFilterSearch('', '-market_cap');
  };

  const handleDiscussInChat = async () => {
    if (results.length === 0 || isPreparingChat) return;
    setIsPreparingChat(true);
    setChatError(null);
    try {
      const query = getScreeningThesisQuery();
      const res = await queryAgent(query);
      if (res?.session_id) {
        router.push(`/alpha-agent?session_id=${encodeURIComponent(res.session_id)}`);
      } else {
        router.push(`/alpha-agent?initial_query=${encodeURIComponent(query)}`);
      }
    } catch (err: any) {
      console.error('Failed to prepare chat room from screener:', err);
      setChatError(err.message || 'Gagal menyiapkan chat room.');
    } finally {
      setIsPreparingChat(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col">
      <Navbar backendOnline={backendOnline} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-16">
        <AuthGate
          featureName="Screener Pro & Trade Ideas Radar"
          featureDescription="Identifikasi peluang investasi unggulan dari 900+ saham BEI melalui pencarian intuitif dan parameter fundamental komprehensif."
        >
          {/* Header */}
          <div className="mb-8 pb-6 border-b border-slate-800">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Search className="h-5 w-5" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Screener Pro & Trade Ideas Radar
              </h1>
            </div>
            <p className="text-sm text-slate-400">
              Temukan peluang investasi unggulan dari 900+ emiten di Bursa Efek Indonesia melalui pencarian intuitif berbasis tesis investasi maupun parameter fundamental terkurasi.
            </p>
          </div>

          {/* Filter Controls Component */}
          <ScreenerFilterControls
            activePreset={activePreset}
            onSelectPreset={handleSelectPreset}
            nlQuery={nlQuery}
            onNlQueryChange={setNlQuery}
            onNlSearch={handleNlSearch}
            selectedSubsector={selectedSubsector}
            onSubsectorChange={(val) => {
              setSelectedSubsector(val);
              handleFilterSearch(val ? `sub_sector = '${val}'` : undefined);
            }}
            subsectors={subsectors}
            orderBy={orderBy}
            onOrderByChange={(val) => {
              setOrderBy(val);
              handleFilterSearch(undefined, val);
            }}
            onFilterSearch={() => handleFilterSearch()}
            onReset={handleResetFilters}
            isLoading={isLoading}
          />

          {/* Error Message */}
          {(error || chatError) && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error || chatError}</span>
            </div>
          )}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="py-20 text-center space-y-3">
              <RefreshCw className="h-8 w-8 text-emerald-400 animate-spin mx-auto" />
              <p className="text-xs text-slate-400 font-medium">
                Menyaring semesta 900+ emiten melalui Sectors Financial API...
              </p>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && hasSearched && results.length === 0 && (
            <div className="py-16 text-center space-y-3 rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
              <Database className="h-10 w-10 text-slate-500 mx-auto" />
              <h3 className="text-base font-bold text-white">Tidak Ada Emiten yang Cocok</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Kriteria skrining tidak menemukan hasil. Coba longgarkan batasan filter atau gunakan kueri natural language yang lebih umum.
              </p>
            </div>
          )}

          {/* Results Table & Follow-Up Actions */}
          {!isLoading && results.length > 0 && (
            <div 
              ref={resultsTableRef} 
              id="screener-results-section" 
              className="space-y-6 animate-in fade-in duration-300 scroll-mt-24 sm:scroll-mt-28"
            >
              <ScreenerResultsTable
                results={results}
                selectedSubsector={selectedSubsector}
                selectedTickersForBattle={selectedTickersForBattle}
                onToggleTickerForBattle={toggleTickerForBattle}
              />

              {/* Follow-Up Chat Room CTA Card */}
              <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-[#0d121e] p-6 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-5 glass-panel">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0 flex items-center justify-center">
                    <AlphaAgentLogo size={26} glow />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white flex items-center gap-2">
                      Bahas Tesis & Top Pick Screening di AlphaAgent Chat
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                        Screening Discovery
                      </span>
                    </h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Buka room chat interaktif untuk mengulas katalis sektor, alasan emiten terpilih, dan rekomendasi alokasi portofolio.
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleDiscussInChat}
                  disabled={isPreparingChat}
                  className="w-full md:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 disabled:opacity-60 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95 shrink-0 cursor-pointer"
                >
                  {isPreparingChat ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin text-slate-950" />
                      <span>Menganalisis Tesis Screening...</span>
                    </>
                  ) : (
                    <>
                      <span>Bahas Tesis Screening di Chat</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>

              {/* Floating Action Bar for Peer Battle */}
              <ScreenerBattleDock
                selectedTickers={selectedTickersForBattle}
                onToggleTicker={toggleTickerForBattle}
                onClear={clearSelectedTickersForBattle}
              />
            </div>
          )}
        </AuthGate>
      </main>
    </div>
  );
}
