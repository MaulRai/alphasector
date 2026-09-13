'use client';

import React, { useState, useEffect } from 'react';
import { fetchInsiderFilings } from '@/lib/api';
import { ShieldCheck, TrendingUp, TrendingDown, ExternalLink, RefreshCw, AlertCircle, FileText, Globe, Copy, Check } from 'lucide-react';
import { CompanyLogo } from '@/components/CompanyLogo';
import { encodeContextForClipboard } from '@/lib/contextClipboard';

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
  onTickerChange?: (ticker: string) => void;
}

export function InsiderFilingsCard({ initialTicker, onTickerChange }: InsiderFilingsCardProps) {
  const [scope, setScope] = useState<'ticker' | 'all'>('ticker');
  const [filings, setFilings] = useState<FilingResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [latencyMs, setLatencyMs] = useState<number>(0);

  useEffect(() => {
    if (scope === 'ticker' && initialTicker) {
      loadFilings(initialTicker);
    } else {
      loadFilings('');
    }
  }, [initialTicker, scope]);

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

  const [copied, setCopied] = useState(false);

  const handleCopyContext = () => {
    if (!filings || filings.length === 0) return;
    const tickerLabel = scope === 'ticker' && initialTicker ? initialTicker.toUpperCase() : 'Bursa BEI';
    const topFilings = filings.slice(0, 5);
    const summaryList = topFilings.map((f, i) => `${i + 1}. [${f.symbol || tickerLabel}] ${f.title}: ${f.body.slice(0, 150)}...`).join('\n');

    const payloadText = encodeContextForClipboard({
      type: 'INSIDER_FILINGS',
      title: `Insider Filings ${tickerLabel}`,
      ticker: scope === 'ticker' ? initialTicker : undefined,
      summary: `Ditemukan ${filings.length} transaksi orang dalam resmi BEI/KSEI untuk ${tickerLabel}.`,
      details: summaryList
    });

    navigator.clipboard.writeText(payloadText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              Insider Deal Tracker (Direksi & Komisaris)
            </h3>
          </div>
          <p className="text-xs text-slate-400">
            Laporan keterbukaan resmi BEI/KSEI atas transaksi pembelian dan penjualan saham oleh Direksi, Komisaris, dan Pengendali.
          </p>
        </div>

        {/* Scope Filter Switcher, Copy Context & Refresh */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <div className="flex items-center p-1 rounded-xl bg-slate-950 border border-slate-800">
            <button
              onClick={() => setScope('ticker')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                scope === 'ticker'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Hanya {initialTicker || 'Emiten'}</span>
            </button>
            <button
              onClick={() => setScope('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                scope === 'all'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Globe className="h-3 w-3" />
              <span>Semua Bursa</span>
            </button>
          </div>

          {/* Salin Konteks Button */}
          <button
            onClick={handleCopyContext}
            disabled={filings.length === 0 || isLoading}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
              copied
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm'
                : 'bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border-cyan-500/30 active:scale-95'
            }`}
            title="Salin ringkasan data ini untuk ditempelkan (Ctrl+V) ke chat AlphaAgent"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span>Konteks Tersalin!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 text-cyan-400" />
                <span>Salin Konteks</span>
              </>
            )}
          </button>

          <button
            onClick={() => loadFilings(scope === 'ticker' ? initialTicker : '')}
            disabled={isLoading}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-all cursor-pointer disabled:opacity-50 shrink-0"
            title="Refresh Filings"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin text-amber-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Latency & Status Bar */}
      <div className="flex items-center justify-between text-[11px] text-slate-400">
        <span>
          Menampilkan <strong className="text-slate-200">{filings.length}</strong> transaksi terbaru
          {scope === 'ticker' && initialTicker ? (
            <> untuk emiten <strong className="text-amber-400">{initialTicker}</strong></>
          ) : (
            <> dari <strong className="text-amber-400">Seluruh Pasar Bursa BEI</strong></>
          )}
        </span>
        {latencyMs > 0 && (
          <span className="font-mono text-slate-500">Latency: {latencyMs}ms</span>
        )}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="py-12 text-center space-y-2">
          <RefreshCw className="h-6 w-6 text-amber-400 animate-spin mx-auto" />
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
            {scope === 'ticker' && initialTicker
              ? `Belum ada pelaporan keterbukaan transaksi insider terbaru untuk ${initialTicker}. Anda dapat mengklik "Semua Bursa" untuk melihat transaksi emiten lain.`
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
