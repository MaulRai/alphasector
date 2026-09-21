'use client';

import React from 'react';
import { PieChart } from 'lucide-react';

interface KseiOwnershipBreakdownProps {
  shareholdersSummary: any;
  primaryTicker?: string;
}

export const KseiOwnershipBreakdown: React.FC<KseiOwnershipBreakdownProps> = ({
  shareholdersSummary,
  primaryTicker,
}) => {
  const kseiRecords = shareholdersSummary?.data || (Array.isArray(shareholdersSummary) ? shareholdersSummary : []);
  const latestKsei = kseiRecords && kseiRecords.length > 0 ? kseiRecords[kseiRecords.length - 1] : null;
  if (!latestKsei) return null;

  const kseiTotal = Number(latestKsei.shares_number) || 1;
  const kseiBreakdown = {
    pension: (((Number(latestKsei.pension_fund_l) || 0) + (Number(latestKsei.pension_fund_f) || 0)) / kseiTotal * 100).toFixed(2),
    mutual: (((Number(latestKsei.mutual_fund_l) || 0) + (Number(latestKsei.mutual_fund_f) || 0)) / kseiTotal * 100).toFixed(2),
    insurance: (((Number(latestKsei.insurance_l) || 0) + (Number(latestKsei.insurance_f) || 0)) / kseiTotal * 100).toFixed(2),
    corporate: (((Number(latestKsei.corporate_l) || 0) + (Number(latestKsei.corporate_f) || 0)) / kseiTotal * 100).toFixed(2),
    individual: (((Number(latestKsei.individual_l) || 0) + (Number(latestKsei.individual_f) || 0)) / kseiTotal * 100).toFixed(2),
    date: latestKsei.date,
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-[#0d121e]/90 p-5 sm:p-6 shadow-2xl glass-panel glow-purple animate-card-reveal-delay-1">
      <div className="flex items-center justify-between gap-4 pb-3 border-b border-slate-800 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
            <PieChart className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">
              Struktur Kepemilikan Institusi KSEI {primaryTicker ? `(${primaryTicker})` : ''}
            </h3>
            <p className="text-[11px] text-slate-400">
              Registri Pemegang Saham Bulanan Resmi KSEI • Periode: {kseiBreakdown.date || 'Terbaru'}
            </p>
          </div>
        </div>
        <span className="text-[10px] px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-300 font-semibold border border-purple-500/20 shrink-0">
          Smart Money Registry
        </span>
      </div>

      {/* Segmented Progress Bar */}
      <div className="h-3 w-full rounded-full overflow-hidden flex bg-slate-900 mb-4 border border-slate-800">
        <div style={{ width: `${kseiBreakdown.pension}%` }} className="bg-purple-500 transition-all duration-500" title={`Dana Pensiun: ${kseiBreakdown.pension}%`} />
        <div style={{ width: `${kseiBreakdown.mutual}%` }} className="bg-blue-500 transition-all duration-500" title={`Reksadana: ${kseiBreakdown.mutual}%`} />
        <div style={{ width: `${kseiBreakdown.insurance}%` }} className="bg-emerald-500 transition-all duration-500" title={`Asuransi: ${kseiBreakdown.insurance}%`} />
        <div style={{ width: `${kseiBreakdown.corporate}%` }} className="bg-amber-500 transition-all duration-500" title={`Korporasi: ${kseiBreakdown.corporate}%`} />
        <div style={{ width: `${kseiBreakdown.individual}%` }} className="bg-slate-500 transition-all duration-500" title={`Ritel / Individu: ${kseiBreakdown.individual}%`} />
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
        <div className="p-2.5 rounded-xl bg-[#090d16] border border-purple-500/20">
          <div className="flex items-center gap-1.5 text-[10px] text-purple-400 mb-1">
            <span className="h-2 w-2 rounded-full bg-purple-500" />
            <span className="font-semibold">Dana Pensiun</span>
          </div>
          <div className="text-base font-bold text-white">{kseiBreakdown.pension}%</div>
          <div className="text-[10px] text-slate-500">Smart money stabil</div>
        </div>
        <div className="p-2.5 rounded-xl bg-[#090d16] border border-blue-500/20">
          <div className="flex items-center gap-1.5 text-[10px] text-blue-400 mb-1">
            <span className="h-2 w-2 rounded-full bg-blue-500" />
            <span className="font-semibold">Reksadana</span>
          </div>
          <div className="text-base font-bold text-white">{kseiBreakdown.mutual}%</div>
          <div className="text-[10px] text-slate-500">Mutual fund institusi</div>
        </div>
        <div className="p-2.5 rounded-xl bg-[#090d16] border border-emerald-500/20">
          <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 mb-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="font-semibold">Asuransi</span>
          </div>
          <div className="text-base font-bold text-white">{kseiBreakdown.insurance}%</div>
          <div className="text-[10px] text-slate-500">Underwriting cadangan</div>
        </div>
        <div className="p-2.5 rounded-xl bg-[#090d16] border border-amber-500/20">
          <div className="flex items-center gap-1.5 text-[10px] text-amber-400 mb-1">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            <span className="font-semibold">Korporasi</span>
          </div>
          <div className="text-base font-bold text-white">{kseiBreakdown.corporate}%</div>
          <div className="text-[10px] text-slate-500">Holding & entitas</div>
        </div>
        <div className="p-2.5 rounded-xl bg-[#090d16] border border-slate-700/40 col-span-2 sm:col-span-1">
          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mb-1">
            <span className="h-2 w-2 rounded-full bg-slate-400" />
            <span className="font-semibold">Ritel / Individu</span>
          </div>
          <div className="text-base font-bold text-white">{kseiBreakdown.individual}%</div>
          <div className="text-[10px] text-slate-500">Investor perorangan</div>
        </div>
      </div>
    </div>
  );
};
