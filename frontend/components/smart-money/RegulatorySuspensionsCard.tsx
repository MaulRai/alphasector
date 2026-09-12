'use client';

import React, { useState, useEffect } from 'react';
import { fetchSuspensions } from '@/lib/api';
import { AlertTriangle, Lock, RefreshCw, ExternalLink, ShieldAlert, FileText, CheckCircle2 } from 'lucide-react';
import { CompanyLogo } from '@/components/CompanyLogo';
import { TickerAutocompleteInput } from '@/components/TickerAutocompleteInput';

export function RegulatorySuspensionsCard() {
  const [suspensions, setSuspensions] = useState<any[]>([]);
  const [tickerFilter, setTickerFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [latencyMs, setLatencyMs] = useState(0);

  useEffect(() => {
    loadSuspensions();
  }, []);

  const loadSuspensions = async (sym?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const clean = sym ? sym.trim().toUpperCase().replace('.JK', '') : undefined;
      const res = await fetchSuspensions(clean, 30);
      setLatencyMs(res.latency_ms || 0);
      const raw = res.data;
      if (raw && raw.results && Array.isArray(raw.results)) {
        setSuspensions(raw.results);
      } else if (Array.isArray(raw)) {
        setSuspensions(raw);
      } else {
        setSuspensions([]);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Gagal memuat radar suspensi BEI.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault();
    loadSuspensions(tickerFilter);
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-[#0d121e]/90 p-5 sm:p-6 glass-panel space-y-5">
      {/* Card Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Lock className="h-4 w-4" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              BEI Suspension & UMA Watchdog
            </h3>
          </div>
          <p className="text-xs text-slate-400">
            Radar emiten yang sedang digembok atau terkena suspensi Unusual Market Activity (UMA) oleh Bursa Efek Indonesia beserta surat resmi bursa.
          </p>
        </div>

        {/* Ticker Search & Refresh */}
        <div className="flex items-center gap-2">
          <div className="w-56 sm:w-64">
            <TickerAutocompleteInput
              onSelectTicker={(selected) => {
                const clean = selected.toUpperCase().trim();
                setTickerFilter(clean);
                loadSuspensions(clean);
              }}
              selectedTickers={tickerFilter ? [tickerFilter] : []}
              placeholder="Filter emiten (misal: JARR)..."
              showActionButton={false}
              showSearchIcon={true}
              accentColor="amber"
            />
          </div>

          {tickerFilter && (
            <button
              onClick={() => {
                setTickerFilter('');
                loadSuspensions('');
              }}
              className="px-2.5 py-2 text-[11px] font-medium rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer whitespace-nowrap"
              title="Reset Tampilkan Semua Suspensi"
            >
              Semua
            </button>
          )}

          <button
            onClick={() => loadSuspensions(tickerFilter)}
            disabled={isLoading}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-all cursor-pointer disabled:opacity-50 shrink-0"
            title="Refresh Suspensions"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin text-amber-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Latency & Status Bar */}
      <div className="flex items-center justify-between text-[11px] text-slate-400">
        <span>
          Menampilkan <strong className="text-slate-200">{suspensions.length}</strong> catatan suspensi terbaru di Bursa Efek Indonesia
        </span>
        {latencyMs > 0 && (
          <span className="font-mono text-slate-500">Latency: {latencyMs}ms</span>
        )}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="py-12 text-center space-y-2">
          <RefreshCw className="h-6 w-6 text-amber-400 animate-spin mx-auto" />
          <p className="text-xs text-slate-400">Mengambil daftar suspensi dan surat pengumuman bursa...</p>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && suspensions.length === 0 && (
        <div className="py-12 text-center space-y-2 border border-dashed border-slate-800 rounded-xl">
          <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto" />
          <p className="text-sm font-semibold text-slate-300">Tidak ada catatan suspensi aktif</p>
          <p className="text-xs text-slate-500">
            {tickerFilter ? `Emiten ${tickerFilter} dalam status perdagangan normal (tidak digembok).` : 'Tidak ditemukan catatan suspensi yang cocok.'}
          </p>
        </div>
      )}

      {/* Suspensions Table / Card Grid */}
      {!isLoading && suspensions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {suspensions.map((item, idx) => {
            const sym = (item.symbol || '').replace('.JK', '');
            return (
              <div
                key={idx}
                className="p-4 rounded-xl border border-slate-800 bg-slate-900/40 hover:border-amber-500/40 transition-all flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <CompanyLogo symbol={sym} size="sm" />
                      <span className="text-sm font-bold text-white tracking-wide">{sym}</span>
                    </div>

                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
                      {item.suspension_date || 'Suspensi BEI'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {item.reason || 'Suspensi sementara perdagangan efek oleh BEI untuk cooling down pasar.'}
                  </p>
                </div>

                {item.pdf_url && (
                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-end">
                    <a
                      href={item.pdf_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 font-semibold transition-colors"
                    >
                      <FileText className="h-3 w-3" />
                      <span>Surat Pengumuman BEI (PDF)</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
