'use client';

import React, { useState, useEffect } from 'react';
import { fetchSuspensions } from '@/lib/api';
import { AlertTriangle, Lock, RefreshCw, ExternalLink, ShieldAlert, FileText, CheckCircle2, Globe, Copy, Check } from 'lucide-react';
import { CompanyLogo } from '@/components/CompanyLogo';
import { encodeContextForClipboard } from '@/lib/contextClipboard';

interface RegulatorySuspensionsCardProps {
  initialTicker?: string;
}

export function RegulatorySuspensionsCard({ initialTicker }: RegulatorySuspensionsCardProps) {
  const [suspensions, setSuspensions] = useState<any[]>([]);
  const [scope, setScope] = useState<'ticker' | 'all'>('ticker');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [latencyMs, setLatencyMs] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (scope === 'ticker' && initialTicker) {
      loadSuspensions(initialTicker);
    } else {
      loadSuspensions();
    }
  }, [initialTicker, scope]);

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

  const handleCopyContext = () => {
    if (!suspensions || suspensions.length === 0) return;
    const scopeLabel = scope === 'ticker' && initialTicker ? initialTicker.toUpperCase() : 'BEI (Semua)';
    const topItems = suspensions.slice(0, 5);
    const details = topItems.map((s, i) => `${i + 1}. [${s.symbol || 'BEI'}] ${s.title || 'Pengumuman Bursa'}: ${s.description || s.body || ''}`.slice(0, 200)).join('\n');

    const payloadText = encodeContextForClipboard({
      type: 'REGULATORY_SUSPENSIONS',
      title: `Radar Suspensi & UMA BEI (${scopeLabel})`,
      ticker: scope === 'ticker' ? initialTicker : undefined,
      summary: `Terdeteksi ${suspensions.length} catatan suspensi / UMA bursa aktif untuk ${scopeLabel}.`,
      details
    });

    navigator.clipboard.writeText(payloadText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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

        {/* Scope Filter Switcher, Salin Konteks & Refresh */}
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
              <span>Status {initialTicker || 'Emiten'}</span>
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
              <span>Semua Suspensi BEI</span>
            </button>
          </div>

          {/* Salin Konteks Button */}
          <button
            onClick={handleCopyContext}
            disabled={suspensions.length === 0 || isLoading}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
              copied
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm'
                : 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border-rose-500/30 active:scale-95'
            }`}
            title="Salin ringkasan suspensi & UMA bursa untuk dijadikan konteks di AlphaAgent"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span>Tersalin!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 text-rose-400" />
                <span>Salin Konteks</span>
              </>
            )}
          </button>

          <button
            onClick={() => loadSuspensions(scope === 'ticker' ? initialTicker : undefined)}
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
          Menampilkan <strong className="text-slate-200">{suspensions.length}</strong> catatan suspensi
          {scope === 'ticker' && initialTicker ? (
            <> untuk emiten <strong className="text-amber-400">{initialTicker}</strong></>
          ) : (
            <> aktif terbaru di Bursa Efek Indonesia</>
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
            {scope === 'ticker' && initialTicker
              ? `Emiten ${initialTicker} dalam status perdagangan normal (tidak terkena suspensi/gembok bursa).`
              : 'Tidak ditemukan catatan suspensi aktif di BEI saat ini.'}
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
