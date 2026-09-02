'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { fetchScreener, fetchTradeIdeaPreset, fetchSubsectors, checkBackendHealth } from '@/lib/api';
import { 
  Search, Filter, ShieldCheck, TrendingUp, Users, 
  Zap, ArrowRight, RefreshCw, Layers, ExternalLink, Play, Sparkles, Database 
} from 'lucide-react';

export default function ScreenerPage() {
  const [nlQuery, setNlQuery] = useState('');
  const [selectedSubsector, setSelectedSubsector] = useState('');
  const [orderBy, setOrderBy] = useState('-market_cap');
  const [subsectors, setSubsectors] = useState<string[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [backendOnline, setBackendOnline] = useState(true);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    checkBackendHealth().then(res => setBackendOnline(res.status === 'healthy'));
    loadSubsectors();
  }, []);

  const loadSubsectors = async () => {
    try {
      const res = await fetchSubsectors();
      if (res && res.data && Array.isArray(res.data)) {
        const subs = res.data.map((x: any) => typeof x === 'string' ? x : x.sub_sector || x.name).filter(Boolean);
        setSubsectors(Array.from(new Set(subs)));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleFilterSearch = async (whereClause?: string, customOrder?: string) => {
    setIsLoading(true);
    setError(null);
    setHasSearched(true);
    try {
      const res = await fetchScreener({
        where: whereClause || (selectedSubsector ? `sub_sector = '${selectedSubsector}'` : undefined),
        order_by: customOrder || orderBy,
        limit: 25,
      });
      if (res && res.data && Array.isArray(res.data)) {
        setResults(res.data);
      } else if (res && res.data && res.data.results) {
        setResults(res.data.results);
      } else {
        setResults([]);
      }
    } catch (err: any) {
      setError(err.message || 'Gagal memfilter emiten.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNlSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!nlQuery.trim()) return;
    setIsLoading(true);
    setError(null);
    setActivePreset(null);
    setHasSearched(true);
    try {
      const res = await fetchScreener({ q: nlQuery.trim(), limit: 25 });
      if (res && res.data && Array.isArray(res.data)) {
        setResults(res.data);
      } else if (res && res.data && res.data.results) {
        setResults(res.data.results);
      } else {
        setResults([]);
      }
    } catch (err: any) {
      setError(err.message || 'Gagal mengeksekusi natural language query.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectPreset = async (slug: string) => {
    setIsLoading(true);
    setError(null);
    setActivePreset(slug);
    setHasSearched(true);
    try {
      const res = await fetchTradeIdeaPreset(slug);
      if (res && res.data && Array.isArray(res.data)) {
        setResults(res.data);
      } else if (res && res.data && res.data.results) {
        setResults(res.data.results);
      } else {
        setResults([]);
      }
    } catch (err: any) {
      setError(err.message || `Gagal memuat preset ${slug}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-black">
      <Navbar backendOnline={backendOnline} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-12">
        
        {/* Header */}
        <div className="mb-8 pb-6 border-b border-slate-800">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Search className="h-5 w-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              🔍 Screener Pro & Trade Ideas Radar
            </h1>
          </div>
          <p className="text-sm text-slate-400">
            Saring 900+ emiten di Bursa Efek Indonesia menggunakan bahasa natural (NLP) atau filter kriteria terstruktur berbasis data resmi Sectors API.
          </p>
        </div>

        {/* 1-Click Trade Ideas Radar Presets */}
        <div className="mb-8">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
            Preset Trade Ideas Populer (1-Click Run)
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <button
              onClick={() => handleSelectPreset('esg-leaders')}
              className={`p-3.5 rounded-xl border text-left transition-all ${
                activePreset === 'esg-leaders'
                  ? 'bg-emerald-500/20 border-emerald-400 text-white shadow-lg shadow-emerald-500/10'
                  : 'bg-slate-900/60 border-slate-800 hover:border-emerald-500/40 text-slate-300'
              }`}
            >
              <div className="flex items-center gap-2 font-bold text-xs mb-1 text-emerald-400">
                <ShieldCheck className="h-4 w-4" /> ESG Leaders IDX
              </div>
              <p className="text-[11px] text-slate-400">Top rating keberlanjutan & tata kelola</p>
            </button>

            <button
              onClick={() => handleSelectPreset('revenue-growth')}
              className={`p-3.5 rounded-xl border text-left transition-all ${
                activePreset === 'revenue-growth'
                  ? 'bg-blue-500/20 border-blue-400 text-white shadow-lg shadow-blue-500/10'
                  : 'bg-slate-900/60 border-slate-800 hover:border-blue-500/40 text-slate-300'
              }`}
            >
              <div className="flex items-center gap-2 font-bold text-xs mb-1 text-blue-400">
                <TrendingUp className="h-4 w-4" /> Revenue Titans
              </div>
              <p className="text-[11px] text-slate-400">Pertumbuhan omset YoY tercepat</p>
            </button>

            <button
              onClick={() => handleSelectPreset('large-shareholder')}
              className={`p-3.5 rounded-xl border text-left transition-all ${
                activePreset === 'large-shareholder'
                  ? 'bg-amber-500/20 border-amber-400 text-white shadow-lg shadow-amber-500/10'
                  : 'bg-slate-900/60 border-slate-800 hover:border-amber-500/40 text-slate-300'
              }`}
            >
              <div className="flex items-center gap-2 font-bold text-xs mb-1 text-amber-400">
                <Users className="h-4 w-4" /> Large Shareholder
              </div>
              <p className="text-[11px] text-slate-400">Kepemilikan pengendali ≥ 70%</p>
            </button>

            <button
              onClick={() => handleSelectPreset('efficient-operators')}
              className={`p-3.5 rounded-xl border text-left transition-all ${
                activePreset === 'efficient-operators'
                  ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-lg shadow-cyan-500/10'
                  : 'bg-slate-900/60 border-slate-800 hover:border-cyan-500/40 text-slate-300'
              }`}
            >
              <div className="flex items-center gap-2 font-bold text-xs mb-1 text-cyan-400">
                <Zap className="h-4 w-4" /> Efficient Operators
              </div>
              <p className="text-[11px] text-slate-400">Laba bersih per karyawan tertinggi</p>
            </button>
          </div>
        </div>

        {/* Search Bar & Filters Form */}
        <div className="rounded-2xl border border-slate-800 bg-[#0d121e]/90 p-5 mb-8 glass-panel space-y-4">
          
          {/* Natural Language Form */}
          <form onSubmit={handleNlSearch} className="flex flex-col sm:flex-row items-center gap-2">
            <div className="relative w-full flex-1 flex items-center rounded-xl border border-slate-700 bg-slate-900 px-3 py-2">
              <Search className="h-4 w-4 text-emerald-400 mr-2 shrink-0" />
              <input
                type="text"
                value={nlQuery}
                onChange={(e) => setNlQuery(e.target.value)}
                placeholder="Ketik kriteria bebas (misal: 'saham perbankan dividen > 5%' atau 'batu bara PE murah')..."
                className="w-full bg-transparent text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || !nlQuery.trim()}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-bold text-xs transition-all disabled:opacity-50 shrink-0 flex items-center justify-center gap-1.5"
            >
              <Play className="h-3.5 w-3.5 fill-black" />
              <span>Saring dengan NLP (3 Credits)</span>
            </button>
          </form>

          {/* Structured Filter Row */}
          <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-800/80 text-xs">
            <span className="text-slate-400 font-medium flex items-center gap-1">
              <Filter className="h-3.5 w-3.5 text-emerald-400" /> Filter Terstruktur (1 Credit):
            </span>

            {/* Subsector Select */}
            <select
              value={selectedSubsector}
              onChange={(e) => {
                setSelectedSubsector(e.target.value);
                setActivePreset(null);
              }}
              className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="">Semua Subsektor</option>
              {subsectors.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            {/* Order By Select */}
            <select
              value={orderBy}
              onChange={(e) => setOrderBy(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="-market_cap">Urutkan: Market Cap Terbesar</option>
              <option value="market_cap">Urutkan: Market Cap Terkecil</option>
              <option value="-pe">Urutkan: P/E Tertinggi</option>
              <option value="pe">Urutkan: P/E Terendah (Murah)</option>
              <option value="-pb">Urutkan: PBV Tertinggi</option>
              <option value="pb">Urutkan: PBV Terendah</option>
            </select>

            <button
              onClick={() => handleFilterSearch()}
              disabled={isLoading}
              className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold transition-all"
            >
              Terapkan Filter
            </button>

            {hasSearched && (
              <span className="text-slate-500 ml-auto">
                Ditemukan: <strong>{results.length}</strong> emiten
              </span>
            )}
          </div>

        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Onboarding Box (Shown before user performs screening) */}
        {!hasSearched && !isLoading && (
          <div className="rounded-2xl border border-slate-800 bg-[#0d121e]/70 p-6 glass-panel mb-8">
            <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <Database className="h-4 w-4 text-emerald-400" />
              Cara Penggunaan Screener Pro
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              Screener ini langsung terhubung ke seluruh universe emiten di Sectors API. Kamu bisa memilih cara penyaringan yang paling hemat dan sesuai kebutuhan:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="font-bold text-xs text-emerald-400 mb-1.5">
                  1. Preset 1-Klik (Hemat)
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Pilih kartu preset seperti ESG Leaders atau Revenue Titans untuk mendapatkan daftar kurasi siap pakai secara instan.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="font-bold text-xs text-blue-400 mb-1.5">
                  2. Filter Terstruktur (1 Kredit)
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Pilih subsektor spesifik dan opsi pengurutan di atas, lalu klik <strong>&quot;Terapkan Filter&quot;</strong>.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="font-bold text-xs text-cyan-400 mb-1.5">
                  3. Bahasa Bebas NLP (3 Kredit)
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Ketik query natural seperti &quot;saham konsumer laba positif&quot; untuk pencarian fleksibel berbasis AI parser.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="py-16 text-center space-y-3">
            <RefreshCw className="h-8 w-8 text-emerald-400 animate-spin mx-auto" />
            <p className="text-sm text-slate-400 font-medium">
              Menyaring emiten dari Sectors Universe API...
            </p>
          </div>
        )}

        {/* Results Table */}
        {!isLoading && results.length > 0 && (
          <div className="rounded-2xl border border-slate-800 bg-[#0d121e]/90 p-5 shadow-2xl glass-panel overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold bg-slate-900/50">
                    <th className="py-3 px-3.5 rounded-l-xl">Kode Emiten</th>
                    <th className="py-3 px-3.5">Nama Perusahaan</th>
                    <th className="py-3 px-3.5">Subsektor</th>
                    <th className="py-3 px-3.5">Market Cap</th>
                    <th className="py-3 px-3.5">P/E</th>
                    <th className="py-3 px-3.5">PBV</th>
                    <th className="py-3 px-3.5 rounded-r-xl text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {results.map((c, idx) => {
                    const sym = (c.symbol || '').replace('.JK', '');
                    return (
                      <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-3.5">
                          <Link 
                            href={`/company/${sym}`}
                            className="font-bold text-white hover:text-emerald-400 transition-colors flex items-center gap-1.5"
                          >
                            <span>{sym}</span>
                          </Link>
                        </td>
                        <td className="py-3 px-3.5 text-slate-300 truncate max-w-[200px]">
                          {c.company_name || c.name || '-'}
                        </td>
                        <td className="py-3 px-3.5 text-slate-400">
                          <span className="px-2 py-0.5 rounded-md bg-slate-800 text-[10px] text-slate-300">
                            {c.sub_sector || c.sector || '-'}
                          </span>
                        </td>
                        <td className="py-3 px-3.5 text-slate-200">
                          {c.market_cap ? `Rp ${(c.market_cap / 1e12).toFixed(1)} T` : '-'}
                        </td>
                        <td className="py-3 px-3.5 text-slate-200">
                          {c.pe ? `${Number(c.pe).toFixed(1)}x` : '-'}
                        </td>
                        <td className="py-3 px-3.5 text-slate-200">
                          {c.pb || c.pbv ? `${Number(c.pb || c.pbv).toFixed(1)}x` : '-'}
                        </td>
                        <td className="py-3 px-3.5 text-right">
                          <Link
                            href={`/company/${sym}`}
                            className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-bold"
                          >
                            <span>Dossier</span>
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
