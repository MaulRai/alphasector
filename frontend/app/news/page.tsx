'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { AuthGate } from '@/components/AuthGate';
import { MarketNewsFeed } from '@/components/smart-money/MarketNewsFeed';
import { TickerAutocompleteInput } from '@/components/TickerAutocompleteInput';
import { CompanyLogo } from '@/components/CompanyLogo';
import { Newspaper, Sparkles, RefreshCw, Layers } from 'lucide-react';

const POPULAR_TICKERS = ['BBCA', 'BBRI', 'BMRI', 'TLKM', 'ASII', 'BUMI', 'ADRO', 'ANTM', 'GOTO', 'AMMN', 'BREN'];

function NewsWorkspace() {
  const searchParams = useSearchParams();
  const initialParam = searchParams.get('ticker') || searchParams.get('symbol') || '';

  const [selectedTicker, setSelectedTicker] = useState<string>(() => {
    return initialParam.trim().toUpperCase().replace('.JK', '');
  });

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col selection:bg-blue-500/30">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <AuthGate>
          {/* Header */}
          <div className="mb-8 pb-6 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <Newspaper className="h-5 w-5" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  Market News & Sentimen Emiten
                </h1>
              </div>
              <p className="text-sm text-slate-400">
                Lacak berita emiten terverifikasi dari Bursa Efek Indonesia, aksi korporasi, dan sentimen penggerak pasar secara real-time.
              </p>
            </div>

            {/* Emiten Autocomplete Input */}
            <div className="w-full md:w-80">
              <span className="text-[11px] text-slate-400 block mb-1 font-medium">Filter Emiten Spesifik:</span>
              <TickerAutocompleteInput
                onSelectTicker={(sym) => setSelectedTicker(sym)}
                selectedTickers={selectedTicker ? [selectedTicker] : []}
                singleSelect={true}
                showItemPlusIcon={false}
                placeholder="Cari emiten (cth: BBCA, BREN)..."
                showActionButton={false}
                showSearchIcon={true}
                accentColor="cyan"
              />
            </div>
          </div>

          {/* Popular Ticker Quick Chips */}
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <span className="text-xs text-slate-500 font-medium mr-1">Emiten Populer:</span>
            <button
              onClick={() => setSelectedTicker('')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all border ${
                !selectedTicker
                  ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              Semua Emiten
            </button>
            {POPULAR_TICKERS.map((sym) => (
              <button
                key={sym}
                onClick={() => setSelectedTicker(sym)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all border ${
                  selectedTicker === sym
                    ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                <CompanyLogo symbol={sym} size="xs" />
                <span>{sym}</span>
              </button>
            ))}
          </div>

          {/* Main Feed Component */}
          <MarketNewsFeed
            initialTicker={selectedTicker}
            onTickerSelect={(sym) => setSelectedTicker(sym)}
          />
        </AuthGate>
      </main>
    </div>
  );
}

export default function NewsPage() {
  return (
    <Suspense fallback={
      <div className="h-screen w-full bg-[#07090e] text-slate-100 flex items-center justify-center">
        <RefreshCw className="h-6 w-6 text-blue-400 animate-spin" />
      </div>
    }>
      <NewsWorkspace />
    </Suspense>
  );
}
