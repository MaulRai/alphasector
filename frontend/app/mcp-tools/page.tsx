'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { 
  Network, Globe, Search, RefreshCw, Loader2, AlertCircle, 
  Server, ShieldCheck, CheckCircle2, ArrowLeft, ExternalLink,
  Cpu, Database, Sparkles, Filter
} from 'lucide-react';
import { 
  fetchMcpStatus, 
  fetchMcpTools, 
  McpStatusResponse, 
  McpToolItem 
} from '@/lib/api';

export default function McpToolsPage() {
  const [tools, setTools] = useState<McpToolItem[]>([]);
  const [isLoadingTools, setIsLoadingTools] = useState(true);
  const [toolSearch, setToolSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [toolLoadError, setToolLoadError] = useState<string | null>(null);

  // Ping state
  const [isPinging, setIsPinging] = useState(false);
  const [pingResult, setPingResult] = useState<McpStatusResponse | null>(null);
  const [pingError, setPingError] = useState<string | null>(null);

  useEffect(() => {
    loadTools();
  }, []);

  const loadTools = async (forceRefresh: boolean = false) => {
    try {
      setIsLoadingTools(true);
      setToolLoadError(null);
      const res = await fetchMcpTools(forceRefresh);
      setTools(res.tools || []);
    } catch (err: any) {
      setToolLoadError(err.message || 'Gagal memuat katalog tools Sectors MCP');
    } finally {
      setIsLoadingTools(false);
    }
  };

  const handleTestPing = async () => {
    try {
      setIsPinging(true);
      setPingError(null);
      const res = await fetchMcpStatus();
      setPingResult(res);
    } catch (err: any) {
      setPingError(err.message || 'Gagal terhubung ke Sectors MCP Server');
      setPingResult(null);
    } finally {
      setIsPinging(false);
    }
  };

  // Filter tools by search query and category
  const filteredTools = tools.filter(tool => {
    const matchesSearch = 
      tool.name.toLowerCase().includes(toolSearch.toLowerCase()) ||
      tool.description.toLowerCase().includes(toolSearch.toLowerCase());
    
    if (!matchesSearch) return false;

    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'company') {
      return tool.name.includes('company') || tool.name.includes('report') || tool.name.includes('overview');
    }
    if (selectedCategory === 'flow') {
      return tool.name.includes('broker') || tool.name.includes('flow') || tool.name.includes('transaction') || tool.name.includes('insiders');
    }
    if (selectedCategory === 'mining') {
      return tool.name.includes('mining') || tool.name.includes('commodity') || tool.name.includes('nickel') || tool.name.includes('coal');
    }
    if (selectedCategory === 'valuation') {
      return tool.name.includes('financial') || tool.name.includes('valuation') || tool.name.includes('peers') || tool.name.includes('dividend');
    }
    if (selectedCategory === 'macro') {
      return tool.name.includes('news') || tool.name.includes('macro') || tool.name.includes('gdp') || tool.name.includes('interest');
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col selection:bg-teal-500/30 selection:text-teal-200">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
        {/* Back Link & Header */}
        <div className="space-y-4">
          <Link
            href="/alpha-agent"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-teal-400 transition-colors group cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
            <span>Kembali ke AlphaAgent</span>
          </Link>

          <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-400 shadow-md shadow-teal-500/5">
                <Network className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-xl sm:text-2xl font-bold text-white tracking-wide">
                    Katalog Tools Resmi Sectors MCP
                  </h1>
                  <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-teal-500/15 text-teal-300 border border-teal-500/30">
                    {tools.length > 0 ? `${tools.length} Tools Terdaftar` : '66 Tools'}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-400">
                  Model Context Protocol JSON-RPC 2.0 Remote Server untuk analisis pasar modal BEI (IDX)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleTestPing}
                disabled={isPinging}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30 text-teal-300 transition-all disabled:opacity-50 cursor-pointer shadow-sm"
              >
                {isPinging ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Pinging Server...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-3.5 w-3.5" />
                    <span>Uji Ping MCP</span>
                  </>
                )}
              </button>

              <a
                href="https://sectors-mcp.supertype.ai/mcp"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <span>Raw Endpoint</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>

        {/* Live Ping Status & Architecture Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {/* Endpoint Card */}
          <div className="p-4 rounded-2xl bg-[#0a0f1d]/90 border border-slate-800/90 space-y-1.5 glass-panel">
            <span className="text-[11px] font-semibold text-slate-400 block flex items-center gap-1.5">
              <Server className="h-3.5 w-3.5 text-teal-400" />
              Remote Server URL
            </span>
            <code className="text-xs font-mono text-teal-300 block truncate bg-slate-900 px-2 py-1 rounded border border-slate-800">
              https://sectors-mcp.supertype.ai/mcp
            </code>
          </div>

          {/* Live Health Status Card */}
          <div className="p-4 rounded-2xl bg-[#0a0f1d]/90 border border-slate-800/90 space-y-1.5 glass-panel">
            <span className="text-[11px] font-semibold text-slate-400 block flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              Status Koneksi Server
            </span>
            {pingResult ? (
              <div className="flex items-center justify-between text-xs">
                <span className="text-emerald-400 font-semibold">{pingResult.message}</span>
                <span className="font-mono text-slate-400">Latensi: <strong className="text-emerald-300">{pingResult.latency_ms}ms</strong></span>
              </div>
            ) : pingError ? (
              <span className="text-xs text-rose-400">{pingError}</span>
            ) : (
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Siap dihubungi (klik Uji Ping untuk tes latensi)</span>
              </div>
            )}
          </div>

          {/* Fallback Guarantee Card */}
          <div className="p-4 rounded-2xl bg-[#0a0f1d]/90 border border-slate-800/90 space-y-1.5 glass-panel">
            <span className="text-[11px] font-semibold text-slate-400 block flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              Auto-Fallback Guarantee
            </span>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Jika remote MCP timeout/rate-limit, AlphaAgent otomatis failover ke REST API tanpa menggagalkan riset.
            </p>
          </div>
        </div>

        {/* Search, Categories & Controls */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#0a0f1d]/90 border border-slate-800/90 space-y-4 glass-panel">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Search className="h-4 w-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari tool MCP berdasarkan nama atau fungsi (misal: report, broker, insider, peers, mining)..."
                value={toolSearch}
                onChange={(e) => setToolSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl bg-slate-900/90 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-500/60 focus:ring-1 focus:ring-teal-500/20"
              />
              {toolSearch && (
                <button
                  type="button"
                  onClick={() => setToolSearch('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-slate-300"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Refresh Cache Button */}
            <button
              type="button"
              onClick={() => loadTools(true)}
              disabled={isLoadingTools}
              className="px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs flex items-center gap-2 transition-colors disabled:opacity-50 cursor-pointer shrink-0"
              title="Refresh tools from remote server"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoadingTools ? 'animate-spin text-teal-400' : ''}`} />
              <span>Refresh Cache</span>
            </button>
          </div>

          {/* Category Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin text-xs">
            <span className="text-slate-400 text-xs font-semibold flex items-center gap-1 shrink-0 mr-1">
              <Filter className="h-3 w-3" />
              Filter:
            </span>

            {[
              { id: 'all', label: `Semua (${tools.length})` },
              { id: 'company', label: 'Company & Reports' },
              { id: 'flow', label: 'Smart Money & Broker' },
              { id: 'valuation', label: 'Valuation & Peers' },
              { id: 'mining', label: 'Mining & Commodities' },
              { id: 'macro', label: 'News & Macro' },
            ].map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all shrink-0 cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-sm'
                    : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tools Results Grid */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span>Menampilkan <strong>{filteredTools.length}</strong> dari <strong>{tools.length}</strong> tools terdaftar</span>
          </div>

          {isLoadingTools ? (
            <div className="py-24 flex flex-col items-center justify-center gap-3 text-slate-400">
              <Loader2 className="h-8 w-8 animate-spin text-teal-400" />
              <span className="text-sm">Menghubungkan ke Sectors MCP Server & mengambil dynamic tool catalog...</span>
            </div>
          ) : toolLoadError ? (
            <div className="p-6 rounded-2xl bg-rose-950/20 border border-rose-500/30 text-rose-300 flex items-center gap-3">
              <AlertCircle className="h-6 w-6 text-rose-400 shrink-0" />
              <div>
                <span className="font-semibold block">Gagal Memuat Tools</span>
                <span className="text-xs text-rose-300/80">{toolLoadError}</span>
              </div>
            </div>
          ) : filteredTools.length === 0 ? (
            <div className="py-20 text-center rounded-2xl bg-[#0a0f1d]/50 border border-slate-800 text-slate-500 space-y-2">
              <Search className="h-8 w-8 mx-auto text-slate-600" />
              <p className="text-sm">Tidak ada tool yang cocok dengan pencarian &quot;{toolSearch}&quot;.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredTools.map((tool) => (
                <div
                  key={tool.name}
                  className="p-4 rounded-xl bg-[#0a0f1d]/90 border border-slate-800/80 hover:border-teal-500/40 transition-all hover:bg-[#0c1324] space-y-2 group shadow-sm"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs sm:text-sm font-semibold text-teal-300 group-hover:text-teal-200 transition-colors truncate">
                      {tool.name}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700/60 shrink-0">
                      {tool.parameters_count} params
                    </span>
                  </div>

                  <p className="text-xs text-slate-300/90 leading-relaxed line-clamp-3">
                    {tool.description || 'Tidak ada deskripsi tersedia untuk tool ini.'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
