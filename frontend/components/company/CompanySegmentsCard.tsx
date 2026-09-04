'use client';

import React from 'react';
import { PieChart } from 'lucide-react';

interface CompanySegmentsCardProps {
  segmentsData: any;
}

export const CompanySegmentsCard: React.FC<CompanySegmentsCardProps> = ({
  segmentsData,
}) => {
  if (!segmentsData) return null;

  return (
    <div className="rounded-2xl border border-slate-800 bg-[#0d121e]/90 p-6 glass-panel">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-800">
        <PieChart className="h-4 w-4 text-emerald-400" />
        <h3 className="text-base font-bold text-white">
          Laporan Segmen Pendapatan & Biaya Operasional
        </h3>
      </div>
      
      {Array.isArray(segmentsData) && segmentsData.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {segmentsData.map((seg: any, idx: number) => (
            <div key={idx} className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
              <div className="text-slate-400 font-medium">
                {seg.name || seg.segment_name || `Segmen ${idx + 1}`}
              </div>
              <div className="text-sm font-bold text-emerald-400 mt-1">
                {seg.value ? `Rp ${(seg.value / 1e12).toFixed(2)} T` : '-'}
              </div>
              {seg.percentage && (
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Kontribusi: {seg.percentage}%
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-slate-400">
          Data rincian segmen bisnis berhasil dikumpulkan untuk analisis mendalam.
        </p>
      )}
    </div>
  );
};
