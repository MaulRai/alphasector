'use client';

import React from 'react';

interface IdxBrokerLeaderboardCardProps {
  topBrokers: any[];
}

export const IdxBrokerLeaderboardCard: React.FC<IdxBrokerLeaderboardCardProps> = ({
  topBrokers,
}) => {
  if (!topBrokers || topBrokers.length === 0) return null;

  return (
    <div className="rounded-2xl border border-slate-800 bg-[#0d121e]/90 p-6 glass-panel mt-6">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
        <div>
          <h3 className="text-base font-bold text-white">
            IDX Broker Leaderboard (Top Gross Members)
          </h3>
          <p className="text-xs text-slate-400">
            Anggota Bursa (AB) dengan volume transaksi pasar terbesar
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {topBrokers.map((b, idx) => (
          <div
            key={idx}
            className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-3"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800 border border-slate-700 text-xs font-bold text-emerald-400 font-mono">
              {b.broker_code || b.code || `#${idx + 1}`}
            </div>
            <div className="truncate">
              <div className="text-xs font-bold text-white truncate">
                {b.broker_name || b.name || `Broker ${b.broker_code}`}
              </div>
              <div className="text-[11px] text-slate-400">
                {b.total_value ? `Rp ${(b.total_value / 1e12).toFixed(1)} T` : 'Aktif'}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
