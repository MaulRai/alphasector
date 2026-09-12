'use client';

import React, { useState, useEffect } from 'react';
import { fetchInsiderFilings } from '@/lib/api';
import { ShieldCheck, TrendingUp, TrendingDown, ExternalLink, RefreshCw, AlertCircle, Search, FileText } from 'lucide-react';
import { CompanyLogo } from '@/components/CompanyLogo';

interface FilingResult {
  title: string;
  body: string;
  source?: string;
  date?: string;
  symbol?: string;
  transaction_type?: string;
}

interface InsiderFilingsCardProps {
  initialTicker?: string;
}

export function InsiderFilingsCard({ initialTicker }: InsiderFilingsCardProps) {
  const [ticker, setTicker] = useState(initialTicker || '');
  const [searchInput, setSearchInput] = useState(initialTicker || '');
  const [filings, setFilings] = useState<FilingResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [latencyMs, setLatencyMs] = useState<number>(0);

  useEffect(() => {
    loadFilings(initialTicker);
  }, [initialTicker]);

  const loadFilings = async (sym?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const clean = sym ? sym.trim().toUpperCase().replace('.JK', '') : undefined;
      const res = await fetchInsiderFilings(clean, 25);
      setLatencyMs(res.latency_ms || 0);

      const raw = res.data;
      if (raw && raw.results && Array.isArray(raw.results)) {
        setFilings(raw.results);
      } else if (Array.isArray(raw)) {
        setFilings(raw);
      } else {
        setFilings([]);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Gagal memuat data transaksi orang dalam.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = searchInput.trim().toUpperCase();
    setTicker(clean);
    loadFilings(clean);
  };

  const isBuyFiling = (title: string, body: string) => {
    const text = (title + ' ' + body).toLowerCase();
    return text.includes('buy') || text.includes('beli') || text.includes('purchas') || text.includes('akumulasi');
  };

  const isSellFiling = (title: string, body: string) => {
    const text = (title + ' ' + body).toLowerCase();
    return text.includes('sell') || text.includes('jual') || text.includes('divest') || text.includes('lepas');
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-[#0d121e]/90 p-5 sm:p-6 glass-panel space-y-5">
      {/* Card Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              Insider Deal Tracker (Direksi & Komisaris)
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold font-mono">
                IDX REALTIME
              </span>
            </h3>
          </div>
          <p className="text-xs text-slate-400">
            Laporan keterbukaan resmi BEI/KSEI atas transaksi pembelian dan penjualan saham oleh Direksi, Komisaris, dan Pengendali.
          </p>
        </div>

        {/* Ticker Search & Refresh */}
        <div className="flex items-center gap-2">
          <form onSubmit={handleSearch} className="relative flex items-center">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Filter Ticker (misal: BBCA)..."
              className="w-44 sm:w-52 px-3 py-1.5 pl-8 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
            />
            <Search className="h-3.5 w-3.5 text-slate-500 absolute left-2.5 pointer-events-none" />
          </form>

          <button
            onClick={() => loadFilings(ticker)}
            disabled={isLoading}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-all cursor-pointer disabled:opacity-50"
            title="Refresh Filings"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin text-emerald-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Latency & Status Bar */}
      <div className="flex items-center justify-between text-[11px] text-slate-400">
        <span>
          Menampilkan <strong className="text-slate-200">{filings.length}</strong> transaksi terbaru
          {ticker && <> untuk emiten <strong className="text-emerald-400">{ticker}</strong></>}
        </span>
        {latencyMs > 0 && (
          <span className="font-mono text-slate-500">Latency: {latencyMs}ms</span>
        )}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="py-12 text-center space-y-2">
          <RefreshCw className="h-6 w-6 text-emerald-400 animate-spin mx-auto" />
          <p className="text-xs text-slate-400">Mengambil dokumen keterbukaan transaksi orang dalam...</p>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && filings.length === 0 && (
        <div className="py-12 text-center space-y-2 border border-dashed border-slate-800 rounded-xl">
          <FileText className="h-8 w-8 text-slate-600 mx-auto" />
          <p className="text-sm font-semibold text-slate-300">Tidak ada pengumuman transaksi orang dalam</p>
          <p className="text-xs text-slate-500">
            {ticker
              ? `Belum ada pelaporan keterbukaan transaksi insider terbaru untuk ${ticker}. Coba cari emiten lain.`
              : 'Belum ada pelaporan transaksi insider terbaru di bursa.'}
          </p>
        </div>
      )}

      {/* Filings Feed List */}
      {!isLoading && filings.length > 0 && (
        <div className="space-y-3">
          {filings.map((filing, idx) => {
            const isBuy = isBuyFiling(filing.title, filing.body);
            const isSell = isSellFiling(filing.title, filing.body);

            return (
              <div
                key={idx}
                className={`p-4 rounded-xl border transition-all ${
                  isBuy
                    ? 'border-emerald-500/20 bg-emerald-950/10 hover:border-emerald-500/40'
                    : isSell
                    ? 'border-red-500/20 bg-red-950/10 hover:border-red-500/40'
                    : 'border-slate-800 bg-slate-900/40 hover:border-slate-700'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    {/* Badge */}
                    {isBuy ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        <TrendingUp className="h-3 w-3" />
                        INSIDER BUY / ACCUMULATION
                      </span>
                    ) : isSell ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-red-500/20 text-red-300 border border-red-500/30">
                        <TrendingDown className="h-3 w-3" />
                        INSIDER SELL / PROFIT TAKING
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                        OFFICIAL DISCLOSURE
                      </span>
                    )}

                    {filing.date && (
                      <span className="text-[11px] text-slate-500 font-mono">
                        {filing.date}
                      </span>
                    )}
                  </div>

                  {filing.source && (
                    <a
                      href={filing.source}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-emerald-400 transition-colors"
                    >
                      <span>Surat Resmi BEI</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>

                <h4 className="text-sm font-bold text-white mb-1.5">
                  {filing.title}
                </h4>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {filing.body}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
