'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { fetchMarketNews, fetchNewsTags } from '@/lib/api';
import { NewsArticle, NewsApiResponse } from '@/lib/types';
import { 
  Newspaper, 
  ExternalLink, 
  RefreshCw, 
  AlertCircle, 
  Clock, 
  Search, 
  Tag, 
  TrendingUp, 
  TrendingDown, 
  Copy, 
  Check, 
  Sparkles, 
  Database, 
  Calendar,
  Layers,
  ArrowUpRight,
  ShieldAlert
} from 'lucide-react';
import { CompanyLogo } from '@/components/CompanyLogo';
import { encodeContextForClipboard } from '@/lib/contextClipboard';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface MarketNewsFeedProps {
  initialTicker?: string;
  onTickerSelect?: (ticker: string) => void;
}

const POPULAR_TAGS = [
  'Semua',
  'bullish',
  'bearish',
  'dividend',
  'financial-performance',
  'executive-changes',
  'business-expansion',
  'asset-purchase'
];

export function MarketNewsFeed({ initialTicker, onTickerSelect }: MarketNewsFeedProps) {
  const router = useRouter();
  const [scope, setScope] = useState<'ticker' | 'market'>(initialTicker ? 'ticker' : 'market');
  const [newsData, setNewsData] = useState<NewsApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('Semua');
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  // Sync initialTicker if changed externally
  useEffect(() => {
    if (initialTicker) {
      setScope('ticker');
    }
  }, [initialTicker]);

  // Load tag helper list once
  useEffect(() => {
    async function loadTags() {
      try {
        const res = await fetchNewsTags();
        if (res && res.data) {
          setAvailableTags(res.data);
        }
      } catch (err) {
        console.warn('Failed to load news tags:', err);
      }
    }
    loadTags();
  }, []);

  // Fetch news when scope, ticker, or tag changes
  useEffect(() => {
    loadNews(false);
  }, [scope, initialTicker, selectedTag]);

  const loadNews = async (forceRefresh: boolean = false) => {
    if (forceRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const sym = (scope === 'ticker' && initialTicker) 
        ? initialTicker.toUpperCase().replace('.JK', '') 
        : undefined;
      const tagParam = (selectedTag && selectedTag !== 'Semua') ? selectedTag : undefined;

      const res = await fetchMarketNews({
        symbols: sym,
        tags: tagParam,
        limit: 25,
        force_refresh: forceRefresh,
      });

      setNewsData(res);
    } catch (err: any) {
      console.error('Error fetching market news:', err);
      setError(err.message || 'Gagal memuat berita pasar IDX.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Filter articles locally by searchKeyword
  const filteredArticles = useMemo(() => {
    const rawList = newsData?.data?.results || [];
    if (!searchKeyword.trim()) return rawList;
    const query = searchKeyword.toLowerCase();
    return rawList.filter(article => 
      article.title.toLowerCase().includes(query) ||
      article.body.toLowerCase().includes(query) ||
      article.symbols?.some(s => s.toLowerCase().includes(query)) ||
      article.tags?.some(t => t.toLowerCase().includes(query))
    );
  }, [newsData, searchKeyword]);

  const handleCopySingleNews = (article: NewsArticle, index: number) => {
    const symStr = article.symbols && article.symbols.length > 0 
      ? article.symbols.join(', ') 
      : 'IDX Universe';
    const tagStr = article.tags && article.tags.length > 0 
      ? ` [Tags: ${article.tags.join(', ')}]` 
      : '';

    const payloadText = encodeContextForClipboard({
      type: 'MARKET_NEWS',
      title: `${symStr}: ${article.title}`,
      ticker: article.symbols?.[0]?.replace('.JK', '') || initialTicker,
      summary: `Berita ${symStr}${tagStr}: ${article.title}`,
      details: `${article.body}\n\nSumber: ${article.source}\nTanggal: ${article.timestamp}`,
    });

    navigator.clipboard.writeText(payloadText);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleAnalyzeWithAgent = (article: NewsArticle) => {
    handleCopySingleNews(article, -1);
    const sym = article.symbols?.[0]?.replace('.JK', '') || initialTicker || 'BBCA';
    router.push(`/alpha-agent?ticker=${sym}&prompt=${encodeURIComponent(`Analisis dampak berita: "${article.title}" terhadap prospek fundamental dan harga saham ${sym}.`)}`);
  };

  const handleCopyAllNews = () => {
    if (!filteredArticles || filteredArticles.length === 0) return;
    const topArticles = filteredArticles.slice(0, 6);
    const summaryList = topArticles.map((a, i) => {
      const s = a.symbols?.join(', ') || 'IDX';
      return `${i + 1}. [${s}] ${a.title}\nRingkasan: ${a.body.slice(0, 140)}...`;
    }).join('\n\n');

    const payloadText = encodeContextForClipboard({
      type: 'MARKET_NEWS',
      title: `Kompilasi Berita Pasar IDX (${scope === 'ticker' && initialTicker ? initialTicker : 'Semua Emiten'})`,
      ticker: initialTicker,
      summary: `Ringkasan ${topArticles.length} Berita Utama Terkini:`,
      details: summaryList,
    });

    navigator.clipboard.writeText(payloadText);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  // Format relative time helper
  const formatTimeAgo = (isoString?: string) => {
    if (!isoString) return '-';
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMins < 60) return `${Math.max(1, diffMins)}m lalu`;
      if (diffHours < 24) return `${diffHours}j lalu`;
      if (diffDays < 7) return `${diffDays} hari lalu`;
      return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return isoString;
    }
  };

  // Tag badge color helper
  const getTagBadgeStyle = (tag: string) => {
    const t = tag.toLowerCase();
    if (t.includes('bullish')) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    if (t.includes('bearish')) return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
    if (t.includes('dividend')) return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
    if (t.includes('executive') || t.includes('management')) return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
    if (t.includes('expansion') || t.includes('purchase')) return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    return 'bg-slate-800/80 text-slate-300 border-slate-700/60';
  };

  return (
    <div className="bg-slate-900/70 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-5 md:p-7 shadow-2xl space-y-6">
      {/* Header with Title & Market Hours Status Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 shadow-inner">
              <Newspaper className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold text-slate-100 tracking-tight">
                  Market News & Sentiment Radar
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                  Sectors Financial API v2
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Berita emiten terkurasi resmi BEI dengan shared caching database Neon L2 & sinkronisasi pintar jam bursa.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 self-start lg:self-center flex-wrap">
          <button
            onClick={() => loadNews(true)}
            disabled={isLoading || isRefreshing}
            title="Refresh berita terkini. Sinkronisasi aktif saat jam bursa 08:30 - 16:30 WIB."
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700/60 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-blue-400' : 'text-slate-400'}`} />
            <span>{isRefreshing ? 'Menyinkronkan...' : 'Sinkronkan Berita'}</span>
          </button>

          <button
            onClick={handleCopyAllNews}
            disabled={filteredArticles.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gradient-to-r from-blue-600/30 to-indigo-600/30 hover:from-blue-600/50 hover:to-indigo-600/50 text-blue-300 border border-blue-500/30 transition-all disabled:opacity-50"
          >
            {copiedAll ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-blue-400" />}
            <span>{copiedAll ? 'Tersalin!' : 'Salin Konteks ke AlphaAgent'}</span>
          </button>
        </div>
      </div>

      {/* Market Hours & Shared Cache Status Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Market Hours Notice */}
        <div className={`p-3.5 rounded-xl border flex items-start gap-3 transition-colors ${
          newsData?.is_market_hours 
            ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300' 
            : 'bg-slate-800/40 border-slate-700/60 text-slate-300'
        }`}>
          <div className="mt-0.5">
            {newsData?.is_market_hours ? (
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            ) : (
              <Clock className="w-4 h-4 text-amber-400/80" />
            )}
          </div>
          <div className="text-xs space-y-0.5">
            <div className="font-semibold flex items-center gap-2">
              <span>{newsData?.is_market_hours ? '🟢 Jam Perdagangan Bursa Aktif' : '🌙 Di Luar Jam Bursa (Arsip DB)'}</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-900/60 border border-slate-700/50 text-slate-300">
                08:30 - 16:30 WIB
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              {newsData?.market_status || 'Update berkala 2 jam hanya berlangsung saat jam aktif bursa (08:30 - 16:30 WIB) untuk efisiensi API kredit.'}
            </p>
          </div>
        </div>

        {/* Shared L2 Database Cache Notice */}
        <div className="p-3.5 rounded-xl border bg-blue-950/20 border-blue-500/30 text-blue-300 flex items-start gap-3">
          <Database className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
          <div className="text-xs space-y-0.5">
            <div className="font-semibold flex items-center gap-2">
              <span>Shared Neon DB Cache (L1/L2)</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-blue-900/50 border border-blue-500/40 text-blue-200">
                0 Credit Terpakai
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Sekali di-fetch user manapun, tersimpan di database Neon & berlaku 2 jam bagi seluruh pengunjung tanpa memotong kuota Sectors.
            </p>
          </div>
        </div>
      </div>

      {/* Scope, Ticker, Tag & Search Filters */}
      <div className="space-y-3 bg-slate-950/40 p-4 rounded-xl border border-slate-800/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Scope Radio / Toggle */}
          <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setScope('ticker')}
              disabled={!initialTicker}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                scope === 'ticker'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 disabled:opacity-40'
              }`}
            >
              Emiten: {initialTicker ? initialTicker.toUpperCase() : 'Pilih Emiten'}
            </button>
            <button
              onClick={() => setScope('market')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                scope === 'market'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Semua Emiten (Pasar IDX)
            </button>
          </div>

          {/* Search Box */}
          <div className="relative flex-1 max-w-xs">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="Cari judul berita atau emiten..."
              className="w-full bg-slate-900/90 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500/60 transition-colors"
            />
          </div>
        </div>

        {/* Quick Tag Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-800">
          <Tag className="w-3.5 h-3.5 text-slate-500 flex-shrink-0 mr-1" />
          {POPULAR_TAGS.map((tag) => {
            const isSelected = selectedTag === tag;
            const label = tag === 'Semua' ? 'Semua Kategori' : tag.replace('-', ' ');
            return (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium whitespace-nowrap capitalize transition-all border ${
                  isSelected
                    ? 'bg-blue-500/20 text-blue-300 border-blue-500/50 font-semibold'
                    : 'bg-slate-900/60 text-slate-400 border-slate-800/80 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Articles Feed */}
      {isLoading ? (
        <div className="space-y-3 py-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse bg-slate-800/30 border border-slate-800/60 rounded-xl p-4 flex gap-4">
              <div className="w-24 h-24 rounded-lg bg-slate-800 flex-shrink-0" />
              <div className="flex-1 space-y-2.5">
                <div className="h-4 bg-slate-800 rounded w-3/4" />
                <div className="h-3 bg-slate-800 rounded w-full" />
                <div className="h-3 bg-slate-800 rounded w-2/3" />
                <div className="h-4 bg-slate-800 rounded w-1/4 mt-2" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="p-6 rounded-xl border border-rose-500/30 bg-rose-950/20 text-rose-300 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <p className="font-semibold">Gagal Memuat Berita</p>
            <p className="text-rose-300/80">{error}</p>
            <button 
              onClick={() => loadNews(true)}
              className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded bg-rose-500/20 border border-rose-500/30 text-rose-200 hover:bg-rose-500/30 transition-colors"
            >
              <RefreshCw className="w-3 h-3" /> Coba Lagi
            </button>
          </div>
        </div>
      ) : filteredArticles.length === 0 ? (
        <div className="text-center py-12 px-4 rounded-xl border border-slate-800/80 bg-slate-950/30 space-y-3">
          <Newspaper className="w-10 h-10 text-slate-600 mx-auto" />
          <div className="text-slate-300 text-sm font-medium">Tidak ada berita yang sesuai kriteria filter</div>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Coba ubah kata kunci pencarian, ganti tag sentimen, atau ganti pilihan emiten.
          </p>
          <button
            onClick={() => {
              setSearchKeyword('');
              setSelectedTag('Semua');
              setScope('market');
            }}
            className="px-3.5 py-1.5 rounded-lg text-xs font-medium bg-blue-600/30 border border-blue-500/40 text-blue-300 hover:bg-blue-600/50 transition-colors"
          >
            Tampilkan Semua Berita IDX
          </button>
        </div>
      ) : (
        <div className="space-y-3.5">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span>Menampilkan <strong>{filteredArticles.length}</strong> artikel berita terverifikasi</span>
            {newsData?.last_updated && (
              <span className="text-[11px] text-slate-500 font-mono">
                Pembaruan: {formatTimeAgo(newsData.last_updated)}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 gap-3.5">
            {filteredArticles.map((article, idx) => {
              const cleanSymbols = (article.symbols || []).map(s => s.replace('.JK', ''));
              return (
                <div
                  key={`${article.title}-${idx}`}
                  className="group bg-slate-950/50 hover:bg-slate-900/70 border border-slate-800/80 hover:border-slate-700/90 rounded-xl p-4 md:p-5 transition-all duration-200 shadow-sm hover:shadow-lg flex flex-col md:flex-row gap-4"
                >
                  {/* Thumbnail / Symbol Logo */}
                  <div className="w-full md:w-32 h-32 rounded-lg bg-slate-900 border border-slate-800 overflow-hidden flex-shrink-0 relative">
                    {article.thumbnail ? (
                      <img 
                        src={article.thumbnail} 
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-slate-950 p-2 text-center">
                        {cleanSymbols.length > 0 ? (
                          <div className="space-y-1">
                            <CompanyLogo symbol={cleanSymbols[0]} size="md" className="mx-auto" />
                            <span className="font-mono text-xs font-bold text-slate-300 block">
                              {cleanSymbols[0]}
                            </span>
                          </div>
                        ) : (
                          <Newspaper className="w-8 h-8 text-slate-700" />
                        )}
                      </div>
                    )}

                    {/* Time Badge Overlay */}
                    <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-slate-950/80 backdrop-blur-sm text-[10px] font-mono text-slate-300 border border-slate-800">
                      {formatTimeAgo(article.timestamp)}
                    </div>
                  </div>

                  {/* Article Content */}
                  <div className="flex-1 flex flex-col justify-between space-y-2">
                    <div className="space-y-2">
                      {/* Emiten & Tags Badges */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {cleanSymbols.map((sym) => (
                          <button
                            key={sym}
                            onClick={() => onTickerSelect?.(sym)}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 transition-colors"
                          >
                            <CompanyLogo symbol={sym} size="xs" />
                            <span>{sym}</span>
                          </button>
                        ))}

                        {article.sector && (
                          <span className="px-2 py-0.5 rounded text-[10px] uppercase font-semibold tracking-wider bg-slate-800 text-slate-400">
                            {article.sector}
                          </span>
                        )}

                        {article.tags?.slice(0, 3).map((tag) => (
                          <span 
                            key={tag}
                            className={`px-2 py-0.5 rounded text-[10px] font-medium border ${getTagBadgeStyle(tag)}`}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Title */}
                      <h3 className="text-sm md:text-base font-semibold text-slate-100 group-hover:text-blue-300 transition-colors leading-snug line-clamp-2">
                        {article.title}
                      </h3>

                      {/* Excerpt Body */}
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {article.body}
                      </p>
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-2 border-t border-slate-900 flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        {article.source && (
                          <a
                            href={article.source}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 transition-colors"
                          >
                            <span>Buka Sumber</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleCopySingleNews(article, idx)}
                          title="Salin cuplikan berita untuk konteks prompt AlphaAgent"
                          className="inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border border-slate-700/50 transition-colors"
                        >
                          {copiedIndex === idx ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400">Tersalin</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3 text-slate-400" />
                              <span>Salin Konteks</span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => handleAnalyzeWithAgent(article)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-semibold bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 border border-blue-500/40 transition-colors"
                        >
                          <Sparkles className="w-3 h-3 text-cyan-400" />
                          <span>Analisis AI</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
