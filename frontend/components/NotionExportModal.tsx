'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, ExternalLink, CheckCircle2, AlertCircle, 
  Loader2, FileText, ChevronDown, ChevronUp, 
  Database, Key, Sparkles, ArrowRight, ShieldCheck
} from 'lucide-react';
import { exportToNotion, NotionExportPayload } from '@/lib/api';

interface NotionExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticker: string;
  companyName?: string;
  synthesis?: any;
  metrics?: any;
  piotroski?: any;
  pe_band?: any;
  brokerSummary?: any;
}

const NOTION_STORAGE_TOKEN = 'alphasector_notion_token';
const NOTION_STORAGE_PAGE = 'alphasector_notion_page_id';

export const NotionExportModal: React.FC<NotionExportModalProps> = ({
  isOpen,
  onClose,
  ticker,
  companyName,
  synthesis,
  metrics,
  piotroski,
  pe_band,
  brokerSummary,
}) => {
  const [mounted, setMounted] = useState(false);
  const [notionToken, setNotionToken] = useState('');
  const [notionPageId, setNotionPageId] = useState('');
  const [exportMode, setExportMode] = useState<'cloud' | 'custom'>('cloud');
  const [showConfig, setShowConfig] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    notion_url?: string;
    page_id?: string;
    message?: string;
    is_mock?: boolean;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Ensure mounting for createPortal to avoid SSR hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Restore saved BYON tokens from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedToken = localStorage.getItem(NOTION_STORAGE_TOKEN) || '';
      const savedPage = localStorage.getItem(NOTION_STORAGE_PAGE) || '';
      setNotionToken(savedToken);
      setNotionPageId(savedPage);
      if (savedToken || savedPage) {
        setExportMode('custom');
        setShowConfig(true);
      }
    }
  }, [isOpen]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  if (!isOpen || !mounted) return null;

  const handleExport = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    // Persist custom BYON settings in localStorage if entered
    if (typeof window !== 'undefined' && exportMode === 'custom') {
      if (notionToken) localStorage.setItem(NOTION_STORAGE_TOKEN, notionToken.trim());
      if (notionPageId) localStorage.setItem(NOTION_STORAGE_PAGE, notionPageId.trim());
    }

    try {
      const payload: NotionExportPayload = {
        ticker,
        company_name: companyName,
        synthesis,
        metrics,
        piotroski: piotroski || metrics?.piotroski,
        pe_band: pe_band || metrics?.pe_band,
        broker_summary: brokerSummary,
        custom_notion_api_key: exportMode === 'custom' ? (notionToken.trim() || undefined) : undefined,
        custom_parent_page_id: exportMode === 'custom' ? (notionPageId.trim() || undefined) : undefined,
      };

      const res = await exportToNotion(payload);
      setResult(res);
      if (res && !res.success) {
        setExportMode('custom');
        setShowConfig(true);
      }
    } catch (err: any) {
      setError(err.message || 'Gagal mengekspor memo riset ke Notion.');
    } finally {
      setIsLoading(false);
    }
  };

  const pScore = piotroski?.score ?? metrics?.piotroski?.score;
  const pRating = piotroski?.rating ?? metrics?.piotroski?.rating;
  const peBandStatus = pe_band?.status ?? metrics?.pe_band?.status;
  const peDiscount = pe_band?.discount_pct ?? metrics?.pe_band?.discount_pct;
  const peRatio = metrics?.pe_ratio ?? metrics?.pe;
  const roeVal = metrics?.roe;

  const modalContent = (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading) onClose();
      }}
    >
      <div 
        className="relative w-full max-w-lg my-auto rounded-2xl border border-slate-700/80 bg-[#0c101c]/95 p-5 sm:p-6 shadow-2xl glass-panel glow-cyan text-slate-100 max-h-[90vh] flex flex-col overflow-hidden animate-card-reveal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500" />

        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-all disabled:opacity-40"
          aria-label="Tutup Modal"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-start gap-3.5 pb-4 border-b border-slate-800/80">
          <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-[#181d2c] border border-slate-700/80 text-white shadow-lg shrink-0 group">
            {/* Notion Official Style SVG Icon */}
            <svg className="w-6 h-6 fill-current text-white" viewBox="0 0 24 24">
              <path d="M4.459 4.208c.746.606 1.026.56 2.428.466l11.455-.84c1.12-.094 1.306-.514.886-1.074L16.892 1.36c-.466-.606-1.213-.886-2.239-.84L3.48 1.408c-.886.093-1.073.466-.606 1.073l1.585 1.727zm.98 3.824v13.62c0 .934.514 1.4 1.587 1.307l12.48-.746c1.074-.094 1.307-.654 1.307-1.587V6.96c0-.84-.42-1.26-1.307-1.213L5.439 6.819c-.886.093-1.213.466-.98 1.213zm11.758 1.027c.094.466 0 .886-.466.933l-.747.047v9.423c-.746.42-1.493.653-2.146.653-1.074 0-1.4-.42-2.193-1.447l-4.153-6.483v6.716l1.353.28c.373.093.466.42.373.84-.093.373-.373.466-.98.466l-3.266.187c-.373 0-.513-.374-.373-.794.093-.42.373-.466.793-.56l.886-.186V9.479l-1.12-.093c-.373-.047-.466-.374-.373-.794.093-.42.42-.466.98-.513l3.686-.233 4.293 6.623V9.106l-1.073-.187c-.374-.047-.467-.373-.374-.793.094-.42.374-.467.98-.513l3.36-.234c.42 0 .56.374.467.794z" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Sync Memo to Notion
              </h3>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" />
                1-Click Export
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Ekspor lembar riset institusional <span className="text-white font-semibold">{ticker}</span> langsung ke workspace Notion Anda.
            </p>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 py-4 space-y-4">
          
          {/* Memo Structure Preview Card */}
          <div className="rounded-xl border border-slate-800/90 bg-slate-900/50 p-3.5 text-xs">
            <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-bold text-white text-xs tracking-tight">
                  {ticker} — {companyName || 'IDX Emiten Memo'}
                </span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono border border-slate-700/60">
                Institutional Dossier
              </span>
            </div>

            {/* Key Metrics Pill Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
              <div className="p-2 rounded-lg bg-slate-950/50 border border-slate-800/60">
                <span className="text-slate-500 block text-[9px] uppercase tracking-wider">F-Score</span>
                <span className="font-bold text-white text-xs">
                  {pScore !== undefined && pScore !== null ? `${pScore}/9` : '—'}
                </span>
                <span className="text-[9px] text-slate-400 block truncate">
                  {pRating || 'Kondisi'}
                </span>
              </div>

              <div className="p-2 rounded-lg bg-slate-950/50 border border-slate-800/60">
                <span className="text-slate-500 block text-[9px] uppercase tracking-wider">P/E Band</span>
                <span className="font-bold text-emerald-400 text-xs">
                  {peBandStatus || 'Fair'}
                </span>
                <span className="text-[9px] text-slate-400 block truncate">
                  {peDiscount ? `${peDiscount}%` : 'Tervalidasi'}
                </span>
              </div>

              <div className="p-2 rounded-lg bg-slate-950/50 border border-slate-800/60">
                <span className="text-slate-500 block text-[9px] uppercase tracking-wider">Valuasi P/E</span>
                <span className="font-bold text-white text-xs">
                  {peRatio ? `${Number(peRatio).toFixed(2)}x` : '—'}
                </span>
                <span className="text-[9px] text-slate-400 block truncate">
                  {metrics?.pbv ? `PBV ${Number(metrics.pbv).toFixed(2)}x` : 'Valuasi Pasar'}
                </span>
              </div>

              <div className="p-2 rounded-lg bg-slate-950/50 border border-slate-800/60">
                <span className="text-slate-500 block text-[9px] uppercase tracking-wider">Profitabilitas</span>
                <span className="font-bold text-teal-300 text-xs">
                  {roeVal ? `${Number(roeVal).toFixed(1)}%` : '—'}
                </span>
                <span className="text-[9px] text-slate-400 block truncate">
                  Return on Equity
                </span>
              </div>
            </div>

            {/* Executive Quote Box */}
            <div className="text-slate-300 text-[11px] leading-relaxed bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/60">
              <span className="text-emerald-400 font-semibold mr-1.5">Executive Summary:</span>
              <span className="italic text-slate-400">
                &ldquo;{synthesis?.executive_summary || synthesis?.valuation_verdict || 'Analisis fundamental komprehensif, valuasi historis, data broker flow, dan audit tata kelola siap disinkronisasikan ke Notion.'}&rdquo;
              </span>
            </div>
          </div>

          {/* Destination Selector Tabs */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-1 flex items-center gap-1 text-xs">
            <button
              type="button"
              onClick={() => { setExportMode('cloud'); setShowConfig(false); }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg font-semibold transition-all ${
                exportMode === 'cloud'
                  ? 'bg-[#1a2336] text-white shadow-sm border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span>AlphaSector Cloud (Default)</span>
            </button>
            <button
              type="button"
              onClick={() => { setExportMode('custom'); setShowConfig(true); }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg font-semibold transition-all ${
                exportMode === 'custom'
                  ? 'bg-[#1a2336] text-white shadow-sm border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Key className="w-3.5 h-3.5 text-cyan-400" />
              <span>Custom Notion Workspace</span>
            </button>
          </div>

          {/* Destination Description */}
          {exportMode === 'cloud' && (
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-emerald-300 text-[11px]">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Langsung mengekspor ke workspace Notion AlphaSector resmi tanpa perlu memasukkan API key pribadi.</span>
            </div>
          )}

          {/* Custom BYON Inputs (when custom tab is active) */}
          {exportMode === 'custom' && (
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3 text-xs animate-in fade-in duration-200">
              <div>
                <label className="block text-slate-300 text-[11px] font-semibold mb-1">
                  Notion Internal Integration Token:
                </label>
                <input
                  type="password"
                  placeholder="secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  value={notionToken}
                  onChange={(e) => setNotionToken(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-500 font-mono transition-colors"
                />
              </div>

              <div>
                <label className="block text-slate-300 text-[11px] font-semibold mb-1">
                  Target Parent Page / Database ID:
                </label>
                <input
                  type="text"
                  placeholder="Contoh: 2379e4318c8646b5a34e022dfecb92ea"
                  value={notionPageId}
                  onChange={(e) => setNotionPageId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-500 font-mono transition-colors"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Pastikan integrasi Notion Anda telah di-invite ke halaman target tersebut.
                </span>
              </div>
            </div>
          )}

          {/* Error Alert */}
          {error && (
            <div className="p-3 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 text-xs flex items-start gap-2.5 animate-shake">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Success Card */}
          {result?.success && (
            <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-200 text-xs animate-in fade-in">
              <div className="flex items-center gap-2 font-bold text-emerald-300 mb-1">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>{result.message || 'Memo Riset Berhasil Disinkronkan ke Notion!'}</span>
              </div>
              <p className="text-[11px] text-emerald-200/80 mb-2.5">
                Dokumen telah tersusun rapi dengan blok tabel rasio finansial, valuasi, dan ringkasan eksekutif.
              </p>
              {result.notion_url && (
                <a
                  href={result.notion_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs transition-all shadow-md active:scale-95"
                >
                  <span>Buka Halaman Memo di Notion</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
          )}

          {/* Warning Card */}
          {result && !result.success && (
            <div className="p-3 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-200 text-xs flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-300">Gagal Mengirim ke Workspace</p>
                <p className="text-[11px] text-amber-200/80 mt-0.5">{result.message}</p>
              </div>
            </div>
          )}

        </div>

        {/* Modal Action Buttons Footer */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800/80 mt-auto">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors disabled:opacity-50"
          >
            Tutup
          </button>
          
          <button
            type="button"
            onClick={handleExport}
            disabled={isLoading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-black font-bold text-xs shadow-lg shadow-white/10 transition-all active:scale-95 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-black" />
                <span>Menyinkronkan ke Notion...</span>
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5 fill-current text-black" viewBox="0 0 24 24">
                  <path d="M4.459 4.208c.746.606 1.026.56 2.428.466l11.455-.84c1.12-.094 1.306-.514.886-1.074L16.892 1.36c-.466-.606-1.213-.886-2.239-.84L3.48 1.408c-.886.093-1.073.466-.606 1.073l1.585 1.727zm.98 3.824v13.62c0 .934.514 1.4 1.587 1.307l12.48-.746c1.074-.094 1.307-.654 1.307-1.587V6.96c0-.84-.42-1.26-1.307-1.213L5.439 6.819c-.886.093-1.213.466-.98 1.213zm11.758 1.027c.094.466 0 .886-.466.933l-.747.047v9.423c-.746.42-1.493.653-2.146.653-1.074 0-1.4-.42-2.193-1.447l-4.153-6.483v6.716l1.353.28c.373.093.466.42.373.84-.093.373-.373.466-.98.466l-3.266.187c-.373 0-.513-.374-.373-.794.093-.42.373-.466.793-.56l.886-.186V9.479l-1.12-.093c-.373-.047-.466-.374-.373-.794.093-.42.42-.466.98-.513l3.686-.233 4.293 6.623V9.106l-1.073-.187c-.374-.047-.467-.373-.374-.793.094-.42.374-.467.98-.513l3.36-.234c.42 0 .56.374.467.794z" />
                </svg>
                <span>Export Memo ke Notion</span>
                <ArrowRight className="h-3.5 w-3.5 text-black" />
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
