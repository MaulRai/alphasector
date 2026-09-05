'use client';

import React, { useState, useEffect } from 'react';
import { X, ExternalLink, CheckCircle2, Sparkles, AlertCircle, Loader2, FileText, ChevronDown, ChevronUp } from 'lucide-react';
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
  const [notionToken, setNotionToken] = useState('');
  const [notionPageId, setNotionPageId] = useState('');
  const [showConfig, setShowConfig] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    notion_url?: string;
    message?: string;
    is_mock?: boolean;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Restore saved BYON tokens from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedToken = localStorage.getItem(NOTION_STORAGE_TOKEN) || '';
      const savedPage = localStorage.getItem(NOTION_STORAGE_PAGE) || '';
      setNotionToken(savedToken);
      setNotionPageId(savedPage);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleExport = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    // Persist custom BYON settings in localStorage if entered
    if (typeof window !== 'undefined') {
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
        custom_notion_api_key: notionToken.trim() || undefined,
        custom_parent_page_id: notionPageId.trim() || undefined,
      };

      const res = await exportToNotion(payload);
      setResult(res);
      if (res && !res.success) {
        setShowConfig(true);
      }
    } catch (err: any) {
      setError(err.message || 'Gagal mengekspor memo ke Notion.');
    } finally {
      setIsLoading(false);
    }
  };

  const pScore = piotroski?.score ?? metrics?.piotroski?.score;
  const pRating = piotroski?.rating ?? metrics?.piotroski?.rating;
  const peBandStatus = pe_band?.status ?? metrics?.pe_band?.status;
  const peDiscount = pe_band?.discount_pct ?? metrics?.pe_band?.discount_pct;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-700/80 bg-[#0b0f19] p-6 shadow-2xl glass-panel glow-cyan text-slate-100">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#1f2638] border border-slate-700 text-white font-serif font-black text-xl shadow-md">
            N
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              Sync Memo to Notion
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                1-Click Export
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Kirim memo riset institusional lengkap ke workspace Notion Anda.
            </p>
          </div>
        </div>

        {/* Preview Summary Card */}
        <div className="mb-5 p-3.5 rounded-xl border border-slate-800 bg-slate-900/60 text-xs">
          <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-800/80">
            <span className="font-bold text-white text-sm">
              {ticker} • {companyName || 'IDX Company'}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              Sectors Financial Data
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-slate-300 mb-2">
            <div>
              <span className="text-slate-500 block text-[10px]">Piotroski F-Score:</span>
              <span className="font-semibold text-white">
                {pScore !== undefined && pScore !== null ? `${pScore}/9 (${pRating || 'Status'})` : 'Tersedia'}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">P/E Band Valuasi:</span>
              <span className="font-semibold text-emerald-400">
                {peBandStatus ? `${peBandStatus} (${peDiscount ? `${peDiscount}%` : ''})` : 'Tervalidasi'}
              </span>
            </div>
          </div>

          <div className="text-slate-400 text-[11px] line-clamp-2 italic bg-slate-950/40 p-2 rounded-lg border border-slate-800/50">
            &quot;{synthesis?.executive_summary || synthesis?.valuation_verdict || 'Analisis fundamental, valuasi multi-tahun, dan smart money flow telah siap disinkronisasi.'}&quot;
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 text-xs flex items-start gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Success Alert */}
        {result?.success && (
          <div className="mb-4 p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-xs">
            <div className="flex items-center gap-2 font-bold mb-1">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>{result.message}</span>
            </div>
            {result.notion_url && (
              <a
                href={result.notion_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all shadow-md"
              >
                <span>Buka Memo di Notion</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
        )}

        {/* Warning / Requires Config Alert */}
        {result && !result.success && (
          <div className="mb-4 p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-300 text-xs">
            <div className="flex items-start gap-2 font-semibold mb-1">
              <AlertCircle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
              <span>Konfigurasi Kredensial Notion Diperlukan</span>
            </div>
            <p className="text-[11px] text-amber-200/90 leading-relaxed mt-1">
              {result.message}
            </p>
          </div>
        )}

        {/* Collapsible BYON Configuration (Bring Your Own Notion) */}
        <div className="mb-5 border border-slate-800 rounded-xl overflow-hidden">
          <button
            type="button"
            onClick={() => setShowConfig(!showConfig)}
            className="w-full flex items-center justify-between p-3 bg-slate-900/40 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
          >
            <span>Pengaturan Kunci Notion Pribadi (Opsional)</span>
            {showConfig ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>

          {showConfig && (
            <div className="p-3 bg-slate-950/60 border-t border-slate-800/80 space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 text-[11px] mb-1">
                  Notion Internal Integration Token:
                </label>
                <input
                  type="password"
                  placeholder="secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  value={notionToken}
                  onChange={(e) => setNotionToken(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 text-[11px] mb-1">
                  Target Parent Page ID:
                </label>
                <input
                  type="text"
                  placeholder="Contoh: 2379e4318c8646b5a34e022dfecb92ea"
                  value={notionPageId}
                  onChange={(e) => setNotionPageId(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500 font-mono"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Kosongkan untuk menggunakan default server (.env) atau mode simulasi instan.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            Tutup
          </button>
          
          <button
            type="button"
            onClick={handleExport}
            disabled={isLoading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-400 hover:to-cyan-500 text-black font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all active:scale-95 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Menyinkronkan...</span>
              </>
            ) : (
              <>
                <FileText className="h-4 w-4" />
                <span>Sync ke Notion Sekarang</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
