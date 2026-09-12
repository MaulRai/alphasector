'use client';

import React, { useState, useEffect } from 'react';
import { fetchShareholdersComposition } from '@/lib/api';
import { Building2, PieChart, RefreshCw, AlertCircle, Users, Landmark, Briefcase, Shield, Search } from 'lucide-react';
import { CompanyLogo } from '@/components/CompanyLogo';

interface InstitutionalOwnershipCardProps {
  initialTicker: string;
}

export function InstitutionalOwnershipCard({ initialTicker }: InstitutionalOwnershipCardProps) {
  const [ticker, setTicker] = useState(initialTicker || 'BBCA');
  const [searchInput, setSearchInput] = useState(initialTicker || 'BBCA');
  const [compositionData, setCompositionData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [latencyMs, setLatencyMs] = useState<number>(0);

  useEffect(() => {
    loadComposition(initialTicker || 'BBCA');
  }, [initialTicker]);

  const loadComposition = async (sym: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const clean = sym.trim().toUpperCase().replace('.JK', '');
      const res = await fetchShareholdersComposition(clean);
      setLatencyMs(res.latency_ms || 0);
      setCompositionData(res.data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || `Gagal memuat komposisi pemegang saham ${sym}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = searchInput.trim().toUpperCase();
    if (clean) {
      setTicker(clean);
      loadComposition(clean);
    }
  };

  // Extract latest month snapshot from data array
  const latestSnapshot = React.useMemo(() => {
    if (!compositionData) return null;
    const records = compositionData.data || (Array.isArray(compositionData) ? compositionData : []);
    if (!records || records.length === 0) return null;
    return records[records.length - 1]; // Latest available month
  }, [compositionData]);

  // Compute breakdown percentages
  const breakdown = React.useMemo(() => {
    if (!latestSnapshot) return null;
    const totalShares = Number(latestSnapshot.shares_number) || 1;

    const pensionLocal = Number(latestSnapshot.pension_fund_l) || 0;
    const pensionForeign = Number(latestSnapshot.pension_fund_f) || 0;
    const totalPension = pensionLocal + pensionForeign;

    const mutualLocal = Number(latestSnapshot.mutual_fund_l) || 0;
    const mutualForeign = Number(latestSnapshot.mutual_fund_f) || 0;
    const totalMutual = mutualLocal + mutualForeign;

    const insuranceLocal = Number(latestSnapshot.insurance_l) || 0;
    const insuranceForeign = Number(latestSnapshot.insurance_f) || 0;
    const totalInsurance = insuranceLocal + insuranceForeign;

    const corporateLocal = Number(latestSnapshot.corporate_l) || 0;
    const corporateForeign = Number(latestSnapshot.corporate_f) || 0;
    const totalCorporate = corporateLocal + corporateForeign;

    const individualLocal = Number(latestSnapshot.individual_l) || 0;
    const individualForeign = Number(latestSnapshot.individual_f) || 0;
    const totalIndividual = individualLocal + individualForeign;

    const othersLocal = (Number(latestSnapshot.financial_institutions_l) || 0) + (Number(latestSnapshot.foundation_l) || 0) + (Number(latestSnapshot.other_l) || 0);
    const othersForeign = (Number(latestSnapshot.financial_institutions_f) || 0) + (Number(latestSnapshot.other_f) || 0);
    const totalOthers = othersLocal + othersForeign;

    const totalL = Number(latestSnapshot.total_l) || (pensionLocal + mutualLocal + insuranceLocal + corporateLocal + individualLocal + othersLocal);
    const totalF = Number(latestSnapshot.total_f) || (pensionForeign + mutualForeign + insuranceForeign + corporateForeign + individualForeign + othersForeign);

    return {
      date: latestSnapshot.date || 'Terbaru',
      totalShares,
      localPct: (totalL / totalShares) * 100,
      foreignPct: (totalF / totalShares) * 100,
      pension: {
        shares: totalPension,
        pct: (totalPension / totalShares) * 100,
        localShares: pensionLocal,
        foreignShares: pensionForeign,
      },
      mutual: {
        shares: totalMutual,
        pct: (totalMutual / totalShares) * 100,
        localShares: mutualLocal,
        foreignShares: mutualForeign,
      },
      insurance: {
        shares: totalInsurance,
        pct: (totalInsurance / totalShares) * 100,
        localShares: insuranceLocal,
        foreignShares: insuranceForeign,
      },
      corporate: {
        shares: totalCorporate,
        pct: (totalCorporate / totalShares) * 100,
        localShares: corporateLocal,
        foreignShares: corporateForeign,
      },
      individual: {
        shares: totalIndividual,
        pct: (totalIndividual / totalShares) * 100,
        localShares: individualLocal,
        foreignShares: individualForeign,
      },
      others: {
        shares: totalOthers,
        pct: (totalOthers / totalShares) * 100,
      },
    };
  }, [latestSnapshot]);

  const formatBillion = (num: number) => {
    if (num >= 1e9) return (num / 1e9).toFixed(2) + ' Miliar';
    if (num >= 1e6) return (num / 1e6).toFixed(2) + ' Juta';
    return num.toLocaleString();
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-[#0d121e]/90 p-5 sm:p-6 glass-panel space-y-6">
      {/* Card Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Landmark className="h-4 w-4" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              Institutional Breakdown: Dapen, Reksadana & Asuransi
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-semibold font-mono">
                MCP MONTHLY
              </span>
            </h3>
          </div>
          <p className="text-xs text-slate-400">
            Dekomposisi kepemilikan saham riil dari KSEI: Dana Pensiun (smart money jangka panjang), Reksadana, Asuransi, Korporasi vs Ritel.
          </p>
        </div>

        {/* Ticker Search & Refresh */}
        <div className="flex items-center gap-2">
          <form onSubmit={handleSearch} className="relative flex items-center">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Ganti Emiten (misal: BBCA)..."
              className="w-44 sm:w-52 px-3 py-1.5 pl-8 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
            />
            <Search className="h-3.5 w-3.5 text-slate-500 absolute left-2.5 pointer-events-none" />
          </form>

          <button
            onClick={() => loadComposition(ticker)}
            disabled={isLoading}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-all cursor-pointer disabled:opacity-50"
            title="Refresh Data"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="py-12 text-center space-y-2">
          <RefreshCw className="h-6 w-6 text-cyan-400 animate-spin mx-auto" />
          <p className="text-xs text-slate-400">Memproses dekomposisi data pemegang saham {ticker}...</p>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Content */}
      {!isLoading && breakdown && (
        <div className="space-y-6">
          {/* Top Level Macro Split: Domestik vs Asing Bar */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
                Domestik (Lokal): <strong className="text-emerald-300 ml-1">{breakdown.localPct.toFixed(1)}%</strong>
              </span>
              <span className="text-slate-400 text-[11px] font-mono">Periode: {breakdown.date}</span>
              <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block" />
                Asing (Foreign): <strong className="text-cyan-300 ml-1">{breakdown.foreignPct.toFixed(1)}%</strong>
              </span>
            </div>

            {/* Split Bar */}
            <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden flex">
              <div
                style={{ width: `${breakdown.localPct}%` }}
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
              />
              <div
                style={{ width: `${breakdown.foreignPct}%` }}
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500"
              />
            </div>
          </div>

          {/* Granular Institution Categories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 1. Dana Pensiun (Dapen) */}
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/40 hover:border-slate-700 transition-all space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    <Shield className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-200">Dana Pensiun (Dapen)</span>
                </div>
                <span className="text-sm font-bold text-indigo-300 font-mono">
                  {breakdown.pension.pct.toFixed(2)}%
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                {formatBillion(breakdown.pension.shares)} lembar saham
              </p>
              <div className="pt-2 border-t border-slate-800/80 flex justify-between text-[10px] text-slate-500">
                <span>Lokal: {formatBillion(breakdown.pension.localShares)}</span>
                <span>Asing: {formatBillion(breakdown.pension.foreignShares)}</span>
              </div>
            </div>

            {/* 2. Reksadana (Mutual Funds) */}
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/40 hover:border-slate-700 transition-all space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <Briefcase className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-200">Reksadana (Mutual Funds)</span>
                </div>
                <span className="text-sm font-bold text-emerald-300 font-mono">
                  {breakdown.mutual.pct.toFixed(2)}%
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                {formatBillion(breakdown.mutual.shares)} lembar saham
              </p>
              <div className="pt-2 border-t border-slate-800/80 flex justify-between text-[10px] text-slate-500">
                <span>Lokal: {formatBillion(breakdown.mutual.localShares)}</span>
                <span>Asing: {formatBillion(breakdown.mutual.foreignShares)}</span>
              </div>
            </div>

            {/* 3. Asuransi (Insurance) */}
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/40 hover:border-slate-700 transition-all space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-200">Asuransi (Insurance)</span>
                </div>
                <span className="text-sm font-bold text-amber-300 font-mono">
                  {breakdown.insurance.pct.toFixed(2)}%
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                {formatBillion(breakdown.insurance.shares)} lembar saham
              </p>
              <div className="pt-2 border-t border-slate-800/80 flex justify-between text-[10px] text-slate-500">
                <span>Lokal: {formatBillion(breakdown.insurance.localShares)}</span>
                <span>Asing: {formatBillion(breakdown.insurance.foreignShares)}</span>
              </div>
            </div>

            {/* 4. Korporasi & Pengendali */}
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/40 hover:border-slate-700 transition-all space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    <Landmark className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-200">Korporasi & Holding</span>
                </div>
                <span className="text-sm font-bold text-purple-300 font-mono">
                  {breakdown.corporate.pct.toFixed(2)}%
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                {formatBillion(breakdown.corporate.shares)} lembar saham
              </p>
              <div className="pt-2 border-t border-slate-800/80 flex justify-between text-[10px] text-slate-500">
                <span>Lokal: {formatBillion(breakdown.corporate.localShares)}</span>
                <span>Asing: {formatBillion(breakdown.corporate.foreignShares)}</span>
              </div>
            </div>

            {/* 5. Investor Individu / Ritel */}
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/40 hover:border-slate-700 transition-all space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    <Users className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-200">Individu / Ritel</span>
                </div>
                <span className="text-sm font-bold text-cyan-300 font-mono">
                  {breakdown.individual.pct.toFixed(2)}%
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                {formatBillion(breakdown.individual.shares)} lembar saham
              </p>
              <div className="pt-2 border-t border-slate-800/80 flex justify-between text-[10px] text-slate-500">
                <span>Ritel Lokal: {formatBillion(breakdown.individual.localShares)}</span>
                <span>Ritel Asing: {formatBillion(breakdown.individual.foreignShares)}</span>
              </div>
            </div>

            {/* 6. Lembaga Finansial & Lainnya */}
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/40 hover:border-slate-700 transition-all space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-slate-700/20 text-slate-400 border border-slate-700/30">
                    <PieChart className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-200">Lembaga Finansial & Lainnya</span>
                </div>
                <span className="text-sm font-bold text-slate-300 font-mono">
                  {breakdown.others.pct.toFixed(2)}%
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                {formatBillion(breakdown.others.shares)} lembar saham
              </p>
              <div className="pt-2 border-t border-slate-800/80 text-[10px] text-slate-500">
                Sekuritas, Yayasan & Bank Kustodian
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
