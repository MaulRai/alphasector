'use client';

import React from 'react';
import { ShieldAlert } from 'lucide-react';

interface SuspensionsMiniTableProps {
  suspensionsData: any[];
}

export const SuspensionsMiniTable: React.FC<SuspensionsMiniTableProps> = ({
  suspensionsData,
}) => {
  if (!suspensionsData || suspensionsData.length === 0) return null;

  return (
    <div className="rounded-2xl border border-slate-800 bg-[#0d121e]/90 p-5 sm:p-6 shadow-2xl glass-panel glow-rose animate-card-reveal-delay-1">
      <div className="flex items-center justify-between gap-4 pb-3 border-b border-slate-800 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
            <ShieldAlert className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">
              Radar Pengawasan & Suspensi Regulasi BEI
            </h3>
            <p className="text-[11px] text-slate-400">
              Daftar tindakan penghentian sementara perdagangan & Unusual Market Activity (UMA)
            </p>
          </div>
        </div>
        <span className="text-[10px] px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-300 font-semibold border border-rose-500/20 shrink-0">
          {suspensionsData.length} Emiten Diawasi
        </span>
      </div>

      {/* Mini Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800/80">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#090d16] text-[10px] uppercase font-bold text-slate-400 border-b border-slate-800">
            <tr>
              <th className="py-2.5 px-3">Emiten</th>
              <th className="py-2.5 px-3">Tanggal</th>
              <th className="py-2.5 px-3">Status</th>
              <th className="py-2.5 px-3">Nomor Surat BEI</th>
              <th className="py-2.5 px-3">Alasan / Catatan Regulasi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 bg-[#070a12]/70">
            {suspensionsData.slice(0, 6).map((sus: any, sIdx: number) => {
              const isUma = (sus.action_type || '').toUpperCase().includes('UMA') || (sus.suspension_reason || '').toUpperCase().includes('UMA');
              return (
                <tr key={sIdx} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-2.5 px-3 font-bold text-white flex items-center gap-1.5">
                    <span className="text-rose-400 font-mono">{(sus.symbol || '').replace('.JK', '')}</span>
                    <span className="text-[10px] font-normal text-slate-400 truncate max-w-[120px]">{sus.company_name}</span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-300 font-mono text-[11px] whitespace-nowrap">{sus.date || '-'}</td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border ${
                      isUma
                        ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                        : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                    }`}>
                      {isUma ? 'Radar UMA' : 'Suspensi BEI'}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-400 font-mono text-[10px]">{sus.letter_number || '-'}</td>
                  <td className="py-2.5 px-3 text-slate-300 text-[11px] max-w-[200px] truncate" title={sus.suspension_reason}>
                    {sus.suspension_reason || 'Pendinginan volatilitas harga'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
