'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { AuthGate } from '@/components/AuthGate';
import { MarketNewsFeed } from '@/components/smart-money/MarketNewsFeed';
import { Newspaper, RefreshCw } from 'lucide-react';

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
          {/* Compact Header */}
          <div className="mb-4 pb-3 border-b border-slate-800/60 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 shrink-0">
                <Newspaper className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight leading-tight">
                  Market News & Sentimen Emiten
                </h1>
                <p className="text-[11px] sm:text-xs text-slate-400 hidden sm:block">
                  Berita terverifikasi Bursa Efek Indonesia, aksi korporasi, dan sentimen pasar real-time.
                </p>
              </div>
            </div>
          </div>

          {/* Main Feed Component with integrated compact filter bar */}
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
