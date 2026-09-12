'use client';

import React, { useState, useEffect } from 'react';
import { fetchMiningPerformance, fetchMiningOwnership } from '@/lib/api';
import { Pickaxe, ShieldCheck, Flame, Scale, Layers, AlertCircle, RefreshCw, Sparkles, Building, ChevronRight } from 'lucide-react';

interface MiningOperationalCardProps {
  ticker: string;
}

export function MiningOperationalCard({ ticker }: MiningOperationalCardProps) {
  const [performanceData, setPerformanceData] = useState<any>(null);
  const [ownershipData, setOwnershipData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [latencyMs, setLatencyMs] = useState(0);

  useEffect(() => {
    loadMiningData();
  }, [ticker]);

  const loadMiningData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [perfRes, ownRes] = await Promise.allSettled([
        fetchMiningPerformance(ticker),
        fetchMiningOwnership(ticker)
      ]);

      if (perfRes.status === 'fulfilled' && perfRes.value.data) {
        setPerformanceData(perfRes.value.data);
        setLatencyMs(perfRes.value.latency_ms || 0);
      } else {
        setPerformanceData(null);
      }

      if (ownRes.status === 'fulfilled' && ownRes.value.data) {
        setOwnershipData(ownRes.value.data);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Gagal memuat data operasional tambang.');
    } finally {
      setIsLoading(false);
    }
  };

  // If no mining performance data exists for this ticker, return null (non-mining company)
  if (!isLoading && !performanceData) {
    return null;
  }

  const latestData = performanceData?.data?.[0];
  const stats = latestData?.commodity_stats;
  const reserves = stats?.resources_reserves;
  const products = stats?.products || [];
  const primaryProduct = products[0];

  const stripRatio = stats?.strip_ratio;
  const prodVolume = stats?.production_volume;
  const salesVolume = stats?.sales_volume;
  const obRemoval = stats?.overburden_removal_volume;
  const unit = stats?.unit || 'Mt';

  // Reserve Life Index (years = total reserves / annual production)
  const totalReserves = reserves?.total_reserves_Mt || (reserves?.proven_reserves_Mt || 0) + (reserves?.probable_reserves_Mt || 0);
  const reserveLifeYears = (totalReserves && prodVolume && prodVolume > 0)
    ? (totalReserves / prodVolume).toFixed(1)
    : null;

  return (
    <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-b from-[#111624] to-[#0a0d16] p-5 sm:p-7 glass-panel space-y-6 shadow-xl relative overflow-hidden">
      {/* Background Accent Glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Card Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Pickaxe className="h-5 w-5" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              Minerba Deep Intelligence: Rigor Operasional & Cadangan Tambang
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Data terverifikasi Ditjen Minerba Kementerian ESDM: Strip ratio, cadangan JORC/KCMI, dan spesifikasi batubara/mineral emiten {ticker}.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {latencyMs > 0 && (
            <span className="text-xs text-slate-500 font-mono">ESDM Latency: {latencyMs}ms</span>
          )}
          <button
            onClick={loadMiningData}
            disabled={isLoading}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer disabled:opacity-50"
            title="Refresh Data Tambang"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin text-amber-400' : ''}`} />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="py-12 text-center space-y-2">
          <RefreshCw className="h-6 w-6 text-amber-400 animate-spin mx-auto" />
          <p className="text-xs text-slate-400">Mengambil matriks operasional & cadangan tambang ESDM...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Top Key Operational Metrics Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Strip Ratio */}
            <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 space-y-1">
              <div className="flex items-center justify-between text-xs text-amber-300 font-semibold">
                <span>Strip Ratio (OB / Coal)</span>
                <Scale className="h-4 w-4 text-amber-400" />
              </div>
              <div className="text-2xl font-black text-white font-mono">
                {stripRatio !== undefined && stripRatio !== null ? `${stripRatio}x` : 'N/A'}
              </div>
              <p className="text-[10px] text-slate-400">
                {stripRatio !== undefined && stripRatio !== null
                  ? stripRatio < 4.0
                    ? '🟢 Sangat efisien (< 4.0x) - Biaya produksi rendah'
                    : stripRatio <= 6.0
                    ? '🟡 Rata-rata industri batubara (4.0 - 6.0x)'
                    : '🔴 Rasio kupas tinggi (> 6.0x)'
                  : 'Data rasio kupas'}
              </p>
            </div>

            {/* 2. Total Reserves (Proven + Probable) */}
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
                <span>Cadangan JORC/KCMI</span>
                <Layers className="h-4 w-4 text-slate-400" />
              </div>
              <div className="text-2xl font-black text-white font-mono">
                {totalReserves ? `${totalReserves} ${unit}` : 'N/A'}
              </div>
              <p className="text-[10px] text-slate-400">
                Proven: <strong className="text-slate-200">{reserves?.proven_reserves_Mt || 0}</strong> {unit} • Probable: <strong className="text-slate-200">{reserves?.probable_reserves_Mt || 0}</strong> {unit}
              </p>
            </div>

            {/* 3. Reserve Life Index */}
            <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 space-y-1">
              <div className="flex items-center justify-between text-xs text-emerald-300 font-semibold">
                <span>Reserve Life Index</span>
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-black text-white font-mono">
                {reserveLifeYears ? `~${reserveLifeYears} Tahun` : 'N/A'}
              </div>
              <p className="text-[10px] text-slate-400">
                Estimasi umur tambang pada laju produksi tahunan {prodVolume || 0} {unit}
              </p>
            </div>

            {/* 4. Production & Sales Volume */}
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
                <span>Volume Produksi & Jual</span>
                <Flame className="h-4 w-4 text-slate-400" />
              </div>
              <div className="text-2xl font-black text-white font-mono">
                {prodVolume ? `${prodVolume} ${unit}` : 'N/A'}
              </div>
              <p className="text-[10px] text-slate-400">
                Penjualan: <strong className="text-slate-200">{salesVolume || 0}</strong> {unit} • Overburden: <strong className="text-slate-200">{obRemoval || 0}</strong> Mbcm
              </p>
            </div>
          </div>

          {/* Granular JORC Breakdown & Mineral Specifications */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* JORC Reserves & Resources Detailed Table */}
            <div className="p-4 sm:p-5 rounded-xl border border-slate-800 bg-slate-950/60 space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-amber-400" />
                Matriks Cadangan & Sumber Daya Mineral ({latestData?.commodity_type || 'Komoditas'})
              </h4>

              <div className="divide-y divide-slate-800/80 text-xs">
                <div className="py-2 flex justify-between">
                  <span className="text-slate-400">Proven Reserves (Cadangan Terbukti)</span>
                  <span className="font-bold text-emerald-400 font-mono">{reserves?.proven_reserves_Mt || 0} {unit}</span>
                </div>
                <div className="py-2 flex justify-between">
                  <span className="text-slate-400">Probable Reserves (Cadangan Terkira)</span>
                  <span className="font-bold text-emerald-300 font-mono">{reserves?.probable_reserves_Mt || 0} {unit}</span>
                </div>
                <div className="py-2 flex justify-between bg-slate-900/30 px-2 rounded">
                  <span className="text-slate-200 font-semibold">Total Marketable Reserves</span>
                  <span className="font-black text-amber-400 font-mono">{totalReserves || 0} {unit}</span>
                </div>
                <div className="py-2 flex justify-between">
                  <span className="text-slate-400">Measured Resources (Terukur)</span>
                  <span className="font-medium text-slate-300 font-mono">{reserves?.measured_resources_Mt || 0} {unit}</span>
                </div>
                <div className="py-2 flex justify-between">
                  <span className="text-slate-400">Indicated Resources (Tertunjuk)</span>
                  <span className="font-medium text-slate-300 font-mono">{reserves?.indicated_resources_Mt || 0} {unit}</span>
                </div>
                <div className="py-2 flex justify-between">
                  <span className="text-slate-400">Inferred Resources (Terkira)</span>
                  <span className="font-medium text-slate-300 font-mono">{reserves?.inferred_resources_Mt || 0} {unit}</span>
                </div>
                <div className="py-2 flex justify-between bg-slate-900/30 px-2 rounded">
                  <span className="text-slate-200 font-semibold">Total Mineral Resources</span>
                  <span className="font-black text-cyan-400 font-mono">{reserves?.total_resources_Mt || 0} {unit}</span>
                </div>
              </div>
            </div>

            {/* Mineral / Coal Quality Specifications */}
            <div className="p-4 sm:p-5 rounded-xl border border-slate-800 bg-slate-950/60 space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Flame className="h-3.5 w-3.5 text-orange-400" />
                Spesifikasi Kualitas Batubara / Mineral ({primaryProduct?.product_name || 'Standar Tambang'})
              </h4>

              <div className="divide-y divide-slate-800/80 text-xs">
                <div className="py-2 flex justify-between">
                  <span className="text-slate-400">Nilai Kalori (Calorific Value)</span>
                  <span className="font-bold text-orange-400 font-mono">
                    {primaryProduct?.calorific_value_kcal?.max || primaryProduct?.calorific_value_kcal?.min || 'N/A'} kcal/kg
                  </span>
                </div>
                <div className="py-2 flex justify-between">
                  <span className="text-slate-400">Kandungan Air (Total Moisture)</span>
                  <span className="font-bold text-cyan-300 font-mono">
                    {primaryProduct?.total_moisture_pct?.max || primaryProduct?.total_moisture_pct?.min || 'N/A'}%
                  </span>
                </div>
                <div className="py-2 flex justify-between">
                  <span className="text-slate-400">Kadar Abu (Ash Content)</span>
                  <span className="font-bold text-slate-300 font-mono">
                    {primaryProduct?.ash_content_adb?.max || primaryProduct?.ash_content_adb?.min || 'N/A'}%
                  </span>
                </div>
                <div className="py-2 flex justify-between">
                  <span className="text-slate-400">Kadar Belerang (Total Sulphur)</span>
                  <span className="font-bold text-amber-300 font-mono">
                    {primaryProduct?.total_sulphur_adb?.max || primaryProduct?.total_sulphur_adb?.min || 'N/A'}%
                  </span>
                </div>
                <div className="py-2 flex justify-between">
                  <span className="text-slate-400">Volatile Matter</span>
                  <span className="font-bold text-slate-300 font-mono">
                    {primaryProduct?.volatile_matter_adb?.max || primaryProduct?.volatile_matter_adb?.min || 'N/A'}%
                  </span>
                </div>
              </div>

              {ownershipData && (
                <div className="mt-3 p-3 rounded-lg bg-slate-900/60 border border-slate-800/80 text-[11px] text-slate-400 flex items-center gap-2">
                  <Building className="h-4 w-4 text-amber-400 shrink-0" />
                  <span>
                    Struktur Holding Tambang Terdaftar: <strong className="text-white">{ownershipData?.company_name || ticker}</strong>
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
