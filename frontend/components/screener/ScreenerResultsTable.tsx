'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CompanyLogo } from '@/components/CompanyLogo';
import { POPULAR_IDX_TICKERS } from '@/lib/idx-tickers';
import { formatTrillion } from '@/lib/formatters';
import { Swords, MessageSquare, ExternalLink } from 'lucide-react';

interface ScreenerResultsTableProps {
  results: any[];
  selectedSubsector: string;
  selectedTickersForBattle: string[];
  onToggleTickerForBattle: (sym: string) => void;
}

export const ScreenerResultsTable: React.FC<ScreenerResultsTableProps> = ({
  results,
  selectedSubsector,
  selectedTickersForBattle,
  onToggleTickerForBattle,
}) => {
  const router = useRouter();

  if (!results || results.length === 0) return null;

  return (
    <div className="rounded-2xl border border-slate-800 bg-[#0d121e]/90 p-5 shadow-2xl glass-panel overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold bg-slate-900/50">
              <th className="py-3 px-3 rounded-l-xl w-10 text-center" title="Pilih emiten untuk Peer Battle">
                <Swords className="h-3.5 w-3.5 text-slate-500 mx-auto" />
              </th>
              <th className="py-3 px-3.5 whitespace-nowrap">Kode Emiten</th>
              <th className="py-3 px-3.5">Nama Perusahaan</th>
              <th className="py-3 px-3.5">Subsektor</th>
              <th className="py-3 px-3.5 whitespace-nowrap">Market Cap</th>
              <th className="py-3 px-3.5 whitespace-nowrap">P/E</th>
              <th className="py-3 px-3.5 whitespace-nowrap">PBV</th>
              <th className="py-3 px-3.5 rounded-r-xl text-right whitespace-nowrap">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-medium">
            {results.map((c, idx) => {
              const sym = (c.symbol || '').replace('.JK', '');
              const matchedTicker = POPULAR_IDX_TICKERS.find((t) => t.symbol === sym);
              const subsector = c.sub_sector || c.sector || (selectedSubsector ? selectedSubsector : matchedTicker?.sector) || 'IDX Listed';
              const isSelected = selectedTickersForBattle.includes(sym);
              const isMaxReached = selectedTickersForBattle.length >= 4;

              return (
                <tr key={idx} className={`transition-colors ${isSelected ? 'bg-cyan-950/20 hover:bg-cyan-950/30' : 'hover:bg-slate-800/40'}`}>
                  <td className="py-3 px-3 text-center">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleTickerForBattle(sym)}
                      disabled={!isSelected && isMaxReached}
                      title={!isSelected && isMaxReached ? "Maksimal 4 emiten untuk Peer Battle" : `Pilih ${sym} untuk Peer Battle`}
                      className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-0 focus:ring-offset-0 cursor-pointer accent-cyan-500 disabled:opacity-30"
                    />
                  </td>
                  <td className="py-3 px-3.5 whitespace-nowrap">
                    <Link 
                      href={`/company/${sym}`}
                      className="font-bold text-white hover:text-emerald-400 transition-colors flex items-center gap-2"
                    >
                      <CompanyLogo symbol={sym} size="xs" />
                      <span>{sym}</span>
                    </Link>
                  </td>
                  <td className="py-3 px-3.5 text-slate-300 truncate max-w-[220px]">
                    {c.company_name || c.name || matchedTicker?.name || '-'}
                  </td>
                  <td className="py-3 px-3.5 text-slate-400">
                    <span className="px-2 py-0.5 rounded-md bg-slate-800/80 border border-slate-700/60 text-[10px] text-slate-300">
                      {subsector}
                    </span>
                  </td>
                  <td className="py-3 px-3.5 text-slate-200 font-mono tabular-nums whitespace-nowrap">
                    {c.market_cap ? formatTrillion(c.market_cap) : <span className="text-slate-500">-</span>}
                  </td>
                  <td className="py-3 px-3.5 text-slate-200 font-mono tabular-nums whitespace-nowrap">
                    {c.pe ? `${Number(c.pe).toFixed(1)}x` : <span className="text-slate-500">-</span>}
                  </td>
                  <td className="py-3 px-3.5 text-slate-200 font-mono tabular-nums whitespace-nowrap">
                    {c.pb || c.pbv ? `${Number(c.pb || c.pbv).toFixed(1)}x` : <span className="text-slate-500">-</span>}
                  </td>
                  <td className="py-3 px-3.5 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          const query = `Bedah prospek fundamental, valuasi, dan katalis emiten ${sym}`;
                          router.push(`/copilot?initial_query=${encodeURIComponent(query)}`);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-xs font-semibold border border-blue-500/20 transition-all hover:scale-105 cursor-pointer"
                        title={`Tanya AlphaAgent tentang ${sym}`}
                      >
                        <MessageSquare className="h-3 w-3" />
                        <span>Tanya AI</span>
                      </button>
                      <Link
                        href={`/company/${sym}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-semibold border border-emerald-500/20 transition-all hover:scale-105"
                      >
                        <span>Dossier 360°</span>
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    </div>
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
