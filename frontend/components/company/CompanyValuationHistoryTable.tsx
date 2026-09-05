'use client';

import React from 'react';

interface CompanyValuationHistoryTableProps {
  histVal: any[];
  subSector?: string;
}

export const CompanyValuationHistoryTable: React.FC<CompanyValuationHistoryTableProps> = ({
  histVal,
  subSector,
}) => {
  if (!histVal || histVal.length === 0) return null;

  return (
    <div className="rounded-2xl border border-slate-800 bg-[#0d121e]/90 p-6 glass-panel">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
        <div>
          <h3 className="text-base font-bold text-white">
            Valuasi Historis & Peer Comparison (Tahunan)
          </h3>
          <p className="text-xs text-slate-400">
            Multiples historis vs rata-rata peers subsektor {subSector || '-'}
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold bg-slate-900/40">
              <th className="py-2.5 px-3">Tahun</th>
              <th className="py-2.5 px-3">P/E Rasio</th>
              <th className="py-2.5 px-3">P/E Peer Avg</th>
              <th className="py-2.5 px-3">PBV Rasio</th>
              <th className="py-2.5 px-3">PBV Peer Avg</th>
              <th className="py-2.5 px-3">P/S</th>
              <th className="py-2.5 px-3">PCF</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-medium">
            {histVal.map((v: any, idx: number) => (
              <tr key={idx} className="hover:bg-slate-800/30">
                <td className="py-2.5 px-3 font-bold text-white font-mono tabular-nums">{v.year || '-'}</td>
                <td className="py-2.5 px-3 text-emerald-400 font-bold font-mono tabular-nums">
                  {v.pe !== null && v.pe !== undefined ? `${Number(v.pe).toFixed(2)}x` : '-'}
                </td>
                <td className="py-2.5 px-3 text-slate-400 font-mono tabular-nums">
                  {v.pe_peer_avg !== null && v.pe_peer_avg !== undefined ? `${Number(v.pe_peer_avg).toFixed(2)}x` : '-'}
                </td>
                <td className="py-2.5 px-3 text-cyan-400 font-bold font-mono tabular-nums">
                  {v.pb !== null && v.pb !== undefined ? `${Number(v.pb).toFixed(2)}x` : '-'}
                </td>
                <td className="py-2.5 px-3 text-slate-400 font-mono tabular-nums">
                  {v.pb_peer_avg !== null && v.pb_peer_avg !== undefined ? `${Number(v.pb_peer_avg).toFixed(2)}x` : '-'}
                </td>
                <td className="py-2.5 px-3 text-slate-300 font-mono tabular-nums">
                  {v.ps !== null && v.ps !== undefined ? `${Number(v.ps).toFixed(2)}x` : '-'}
                </td>
                <td className="py-2.5 px-3 text-slate-300 font-mono tabular-nums">
                  {v.pcf !== null && v.pcf !== undefined ? `${Number(v.pcf).toFixed(2)}x` : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
