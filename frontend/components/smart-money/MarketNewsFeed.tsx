'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { fetchMarketNews, fetchNewsTags } from '@/lib/api';
import { NewsArticle, NewsApiResponse } from '@/lib/types';
import { 
  Newspaper, 
  ExternalLink, 
  RefreshCw, 
  AlertCircle, 
  Search, 
  Tag, 
  Copy, 
  Check, 
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
  Building2,
  Filter
} from 'lucide-react';
import { CompanyLogo } from '@/components/CompanyLogo';
import { POPULAR_IDX_TICKERS } from '@/lib/idx-tickers';
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
  const [newsData, setNewsData] = useState<NewsApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('Semua');
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Dropdown states
  const [isTickerDropdownOpen, setIsTickerDropdownOpen] = useState(false);
  const [tickerSearchInput, setTickerSearchInput] = useState('');
  const [isTagDropdownOpen, setIsTagDropdownOpen] = useState(false);

  const tickerDropdownRef = useRef<HTMLDivElement>(null);
  const tagDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (tickerDropdownRef.current && !tickerDropdownRef.current.contains(event.target as Node)) {
        setIsTickerDropdownOpen(false);
      }
      if (tagDropdownRef.current && !tagDropdownRef.current.contains(event.target as Node)) {
        setIsTagDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  // Fetch news when initialTicker or tag changes
  useEffect(() => {
    loadNews();
  }, [initialTicker, selectedTag]);

  const loadNews = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const sym = initialTicker 
        ? initialTicker.trim().toUpperCase().replace('.JK', '') 
        : undefined;
      const tagParam = (selectedTag && selectedTag !== 'Semua') ? selectedTag : undefined;

      const res = await fetchMarketNews({
        symbols: sym,
        tags: tagParam,
        limit: 30,
      });

      setNewsData(res);
    } catch (err: any) {
      console.error('Error fetching market news:', err);
      setError(err.message || 'Gagal memuat berita pasar IDX.');
    } finally {
      setIsLoading(false);
    }
  };

  // 6 Articles per page (2 columns x 3 rows)
  const ITEMS_PER_PAGE = 6;
  const [currentPage, setCurrentPage] = useState(1);

  // Guarantee sorting strictly descending by timestamp (newest first)
  const sortedAndFilteredArticles = useMemo(() => {
    const rawList = [...(newsData?.data?.results || [])];
    rawList.sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime();
      const timeB = new Date(b.timestamp).getTime();
      return timeB - timeA;
    });

    if (!searchKeyword.trim()) return rawList;
    const query = searchKeyword.toLowerCase();
    return rawList.filter(article => 
      article.title.toLowerCase().includes(query) ||
      article.body.toLowerCase().includes(query) ||
      article.symbols?.some(s => s.toLowerCase().includes(query)) ||
      article.tags?.some(t => t.toLowerCase().includes(query))
    );
  }, [newsData, searchKeyword]);

  // Reset page to 1 on filter or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [initialTicker, selectedTag, searchKeyword]);

  const totalPages = Math.max(1, Math.ceil(sortedAndFilteredArticles.length / ITEMS_PER_PAGE));
  const paginatedArticles = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedAndFilteredArticles.slice(start, start + ITEMS_PER_PAGE);
  }, [sortedAndFilteredArticles, currentPage]);

  // Filtered ticker list for searchable dropdown
  const filteredTickers = useMemo(() => {
    if (!tickerSearchInput.trim()) return POPULAR_IDX_TICKERS.slice(0, 16);
    const q = tickerSearchInput.trim().toUpperCase();
    return POPULAR_IDX_TICKERS.filter(item => 
      item.symbol.includes(q) || 
      item.name.toUpperCase().includes(q) || 
      item.sector.toUpperCase().includes(q)
    );
  }, [tickerSearchInput]);

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
    const rawBody = article.body ? article.body.trim() : '';
    const cleanBody = rawBody.length > 600 ? rawBody.slice(0, 600) + '...' : rawBody;

    const promptText = `Analisis dampak berita pasar berikut terhadap prospek fundamental dan harga saham ${sym}:

Judul Berita: "${article.title}"
Sumber: ${article.source || 'IDX Media'} (${formatTimeAgo(article.timestamp)})
${cleanBody ? `Ringkasan:\n${cleanBody}\n` : ''}
Berikan kesimpulan dampak sentimen (bullish/bearish/netral), implikasi terhadap kinerja keuangan emiten ${sym}, serta rekomendasi tindakan strategis bagi investor.`;

    router.push(`/alpha-agent?initial_query=${encodeURIComponent(promptText)}&ticker=${encodeURIComponent(sym)}&prompt=${encodeURIComponent(promptText)}`);
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
    <div className="bg-slate-900/70 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-5 md:p-7 shadow-2xl space-y-5">
      {/* Compact Single-Row Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2.5 bg-slate-950/40 p-2.5 sm:p-3 rounded-xl border border-slate-800/60">
        {/* 1. Search Box Kata Kunci */}
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            placeholder="Cari kata kunci berita atau emiten..."
            className="w-full bg-slate-900/90 border border-slate-800 rounded-lg pl-8.5 pr-8 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500/60 transition-colors"
          />
          {searchKeyword && (
            <button
              onClick={() => setSearchKeyword('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-0.5"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* 2. Searchable Emiten Dropdown */}
          <div className="relative" ref={tickerDropdownRef}>
            <button
              type="button"
              onClick={() => setIsTickerDropdownOpen(prev => !prev)}
              className={`h-8 px-2.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-all cursor-pointer ${
                initialTicker
                  ? 'bg-blue-500/15 text-blue-300 border-blue-500/40'
                  : 'bg-slate-900/90 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
              }`}
            >
              {initialTicker ? (
                <>
                  <CompanyLogo symbol={initialTicker} size="xs" />
                  <span className="font-mono font-bold">{initialTicker.toUpperCase()}</span>
                </>
              ) : (
                <>
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>Semua Emiten</span>
                </>
              )}
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isTickerDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isTickerDropdownOpen && (
              <div className="absolute right-0 sm:left-0 sm:right-auto mt-1.5 w-64 sm:w-72 bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                {/* Search input in dropdown */}
                <div className="relative mb-2">
                  <Search className="w-3 h-3 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={tickerSearchInput}
                    onChange={(e) => setTickerSearchInput(e.target.value)}
                    placeholder="Cari kode / nama emiten..."
                    autoFocus
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-lg pl-7 pr-7 py-1 text-[11px] text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
                  />
                  {tickerSearchInput && (
                    <button
                      onClick={() => setTickerSearchInput('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                <div className="max-h-56 overflow-y-auto space-y-0.5 scrollbar-thin scrollbar-thumb-slate-800 text-xs">
                  {/* Reset / All Tickers */}
                  <button
                    type="button"
                    onClick={() => {
                      onTickerSelect?.('');
                      setIsTickerDropdownOpen(false);
                      setTickerSearchInput('');
                    }}
                    className={`w-full text-left px-2 py-1.5 rounded-lg flex items-center justify-between transition-colors ${
                      !initialTicker
                        ? 'bg-blue-600/20 text-blue-300 font-semibold'
                        : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded bg-slate-800 flex items-center justify-center text-slate-400">
                        <Building2 className="w-3 h-3" />
                      </div>
                      <span>Semua Emiten (Pasar IDX)</span>
                    </div>
                    {!initialTicker && <Check className="w-3.5 h-3.5 text-blue-400" />}
                  </button>

                  {/* Custom ticker option if user typed something not matching exactly */}
                  {tickerSearchInput.trim() && !filteredTickers.some(t => t.symbol === tickerSearchInput.trim().toUpperCase()) && (
                    <button
                      type="button"
                      onClick={() => {
                        const sym = tickerSearchInput.trim().toUpperCase();
                        onTickerSelect?.(sym);
                        setIsTickerDropdownOpen(false);
                        setTickerSearchInput('');
                      }}
                      className="w-full text-left px-2 py-1.5 rounded-lg flex items-center justify-between text-blue-400 hover:bg-blue-500/10 transition-colors border border-dashed border-blue-500/30 my-1"
                    >
                      <span className="truncate">Gunakan &quot;{tickerSearchInput.trim().toUpperCase()}&quot;</span>
                      <Check className="w-3.5 h-3.5 opacity-60" />
                    </button>
                  )}

                  {/* Popular / Searched Tickers */}
                  <div className="pt-1 border-t border-slate-800/60 my-1">
                    <div className="text-[10px] font-semibold text-slate-500 uppercase px-2 py-0.5 tracking-wider">
                      {tickerSearchInput.trim() ? 'Hasil Pencarian' : 'Emiten Populer'}
                    </div>
                    {filteredTickers.map((item) => {
                      const isSelected = initialTicker?.toUpperCase() === item.symbol;
                      return (
                        <button
                          key={item.symbol}
                          type="button"
                          onClick={() => {
                            onTickerSelect?.(item.symbol);
                            setIsTickerDropdownOpen(false);
                            setTickerSearchInput('');
                          }}
                          className={`w-full text-left px-2 py-1.5 rounded-lg flex items-center justify-between transition-colors ${
                            isSelected
                              ? 'bg-blue-600/20 text-blue-300 font-semibold'
                              : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <CompanyLogo symbol={item.symbol} size="xs" />
                            <div className="truncate">
                              <span className="font-mono font-bold mr-1.5">{item.symbol}</span>
                              <span className="text-[11px] text-slate-400 truncate">{item.name}</span>
                            </div>
                          </div>
                          {isSelected && <Check className="w-3.5 h-3.5 text-blue-400 shrink-0 ml-1.5" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 3. Tag / Kategori Dropdown */}
          <div className="relative" ref={tagDropdownRef}>
            <button
              type="button"
              onClick={() => setIsTagDropdownOpen(prev => !prev)}
              className={`h-8 px-2.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-all cursor-pointer ${
                selectedTag !== 'Semua'
                  ? 'bg-blue-500/15 text-blue-300 border-blue-500/40'
                  : 'bg-slate-900/90 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
              }`}
            >
              <Tag className="w-3.5 h-3.5 text-slate-400" />
              <span className="capitalize truncate max-w-[100px] sm:max-w-[120px]">
                {selectedTag === 'Semua' ? 'Semua Tag' : selectedTag.replace('-', ' ')}
              </span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isTagDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isTagDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-48 bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-xl shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="max-h-56 overflow-y-auto space-y-0.5 scrollbar-thin scrollbar-thumb-slate-800 text-xs">
                  {POPULAR_TAGS.map((tag) => {
                    const isSelected = selectedTag === tag;
                    const label = tag === 'Semua' ? 'Semua Kategori' : tag.replace('-', ' ');
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => {
                          setSelectedTag(tag);
                          setIsTagDropdownOpen(false);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between capitalize transition-colors ${
                          isSelected
                            ? 'bg-blue-600/20 text-blue-300 font-semibold'
                            : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                        }`}
                      >
                        <span>{label}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-blue-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Reset Filters button if active */}
          {(initialTicker || selectedTag !== 'Semua' || searchKeyword) && (
            <button
              type="button"
              onClick={() => {
                onTickerSelect?.('');
                setSelectedTag('Semua');
                setSearchKeyword('');
              }}
              title="Reset Semua Filter"
              className="h-8 px-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800/80 transition-colors flex items-center gap-1 text-xs"
            >
              <X className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Articles Feed */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 py-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="animate-pulse bg-slate-800/30 border border-slate-800/60 rounded-xl p-3.5 flex gap-3">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg bg-slate-800 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 bg-slate-800 rounded w-3/4" />
                <div className="h-3 bg-slate-800 rounded w-full" />
                <div className="h-3 bg-slate-800 rounded w-2/3" />
                <div className="h-3 bg-slate-800 rounded w-1/3 mt-2" />
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
              onClick={() => loadNews()}
              className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded bg-rose-500/20 border border-rose-500/30 text-rose-200 hover:bg-rose-500/30 transition-colors"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      ) : sortedAndFilteredArticles.length === 0 ? (
        <div className="text-center py-10 px-4 rounded-xl border border-slate-800/80 bg-slate-950/30 space-y-2.5">
          <Newspaper className="w-9 h-9 text-slate-600 mx-auto" />
          <div className="text-slate-300 text-sm font-medium">Tidak ada berita yang sesuai kriteria filter</div>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Coba ubah kata kunci pencarian, ganti tag sentimen, atau ganti pilihan emiten.
          </p>
          <button
            onClick={() => {
              setSearchKeyword('');
              setSelectedTag('Semua');
              onTickerSelect?.('');
            }}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-600/30 border border-blue-500/40 text-blue-300 hover:bg-blue-600/50 transition-colors cursor-pointer"
          >
            Tampilkan Semua Berita IDX
          </button>
        </div>
      ) : (
        <div className="space-y-3.5">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span>
              Menampilkan <strong>{paginatedArticles.length}</strong> dari <strong>{sortedAndFilteredArticles.length}</strong> berita
              {totalPages > 1 && <span className="text-slate-500 ml-1">(Hal {currentPage}/{totalPages})</span>}
            </span>
            {newsData?.last_updated && (
              <span className="text-[11px] text-slate-500 font-mono">
                Pembaruan: {formatTimeAgo(newsData.last_updated)}
              </span>
            )}
          </div>

          {/* 2 Articles per row grid (total 6 items per page) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
            {paginatedArticles.map((article, idx) => {
              const cleanSymbols = (article.symbols || []).map(s => s.replace('.JK', ''));
              return (
                <div
                  key={`${article.title}-${idx}`}
                  className="group bg-slate-950/50 hover:bg-slate-900/70 border border-slate-800/80 hover:border-slate-700/90 rounded-xl p-3.5 sm:p-4 transition-all duration-200 shadow-sm hover:shadow-md flex flex-col justify-between"
                >
                  <div className="flex gap-3">
                    {/* Thumbnail / Symbol Logo */}
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg bg-slate-900 border border-slate-800 overflow-hidden shrink-0 relative">
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
                              <CompanyLogo symbol={cleanSymbols[0]} size="sm" className="mx-auto" />
                              <span className="font-mono text-[10px] font-bold text-slate-300 block">
                                {cleanSymbols[0]}
                              </span>
                            </div>
                          ) : (
                            <Newspaper className="w-6 h-6 text-slate-700" />
                          )}
                        </div>
                      )}

                      {/* Time Badge Overlay */}
                      <div className="absolute bottom-1 right-1 px-1 py-0.5 rounded bg-slate-950/85 backdrop-blur-sm text-[9px] font-mono text-slate-300 border border-slate-800">
                        {formatTimeAgo(article.timestamp)}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 space-y-1.5">
                      {/* Emiten & Tags Badges */}
                      <div className="flex items-center gap-1 flex-wrap">
                        {cleanSymbols.slice(0, 2).map((sym) => (
                          <button
                            key={sym}
                            onClick={() => onTickerSelect?.(sym)}
                            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 transition-colors"
                          >
                            <CompanyLogo symbol={sym} size="xs" />
                            <span>{sym}</span>
                          </button>
                        ))}

                        {article.sector && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] uppercase font-semibold tracking-wider bg-slate-800 text-slate-400 truncate max-w-[110px]">
                            {article.sector}
                          </span>
                        )}

                        {article.tags?.slice(0, 1).map((tag) => (
                          <span 
                            key={tag}
                            className={`px-1.5 py-0.5 rounded text-[9px] font-medium border ${getTagBadgeStyle(tag)}`}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Title */}
                      <h3 className="text-xs sm:text-sm font-semibold leading-snug line-clamp-2">
                        {article.source ? (
                          <a
                            href={article.source}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-slate-100 hover:text-blue-400 hover:underline transition-colors inline-flex items-center gap-1"
                          >
                            <span>{article.title}</span>
                            <ExternalLink className="w-3 h-3 opacity-60 shrink-0 group-hover:opacity-100" />
                          </a>
                        ) : (
                          <span className="text-slate-100 group-hover:text-blue-300 transition-colors">
                            {article.title}
                          </span>
                        )}
                      </h3>

                      {/* Excerpt Body */}
                      <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                        {article.body}
                      </p>
                    </div>
                  </div>

                  {/* Footer Actions */}
                  <div className="pt-2 mt-2.5 border-t border-slate-900 flex items-center justify-between gap-2">
                    <div>
                      {article.source && (
                        <a
                          href={article.source}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[10px] text-slate-400 hover:text-slate-200 transition-colors"
                        >
                          <span>Buka Sumber</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleCopySingleNews(article, idx)}
                        title="Salin cuplikan berita untuk konteks prompt AlphaAgent"
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer active:scale-95 shadow-sm ${
                          copiedIndex === idx
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : 'bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 hover:text-cyan-200 border-cyan-500/30'
                        }`}
                      >
                        {copiedIndex === idx ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span>Konteks Tersalin!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3 text-cyan-400" />
                            <span>Salin Konteks</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleAnalyzeWithAgent(article)}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 border border-blue-500/40 transition-colors"
                      >
                        <Sparkles className="w-3 h-3 text-cyan-400" />
                        <span>Analisis AI</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination Controls (5 Articles per Page) */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-800/80 text-xs text-slate-400">
              <div className="flex items-center gap-1">
                <span>Halaman</span>
                <span className="font-bold text-slate-200">{currentPage}</span>
                <span>dari</span>
                <span className="font-bold text-slate-200">{totalPages}</span>
                <span className="text-slate-500 ml-1">({sortedAndFilteredArticles.length} total berita terurut terbaru)</span>
              </div>

              <div className="flex items-center gap-1.5 self-start sm:self-center">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Sebelumnya</span>
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                    if (totalPages > 7 && Math.abs(p - currentPage) > 2 && p !== 1 && p !== totalPages) {
                      if (p === 2 || p === totalPages - 1) {
                        return <span key={p} className="px-1 text-slate-600">...</span>;
                      }
                      return null;
                    }
                    return (
                      <button
                        key={p}
                        onClick={() => setCurrentPage(p)}
                        className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          currentPage === p
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'bg-slate-900 text-slate-400 border border-slate-800/80 hover:text-white hover:bg-slate-800'
                        }`}
                      >
                        {p}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                >
                  <span>Selanjutnya</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
