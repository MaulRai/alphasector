'use client';

import React from 'react';
import { Zap, Database, TrendingUp, Sparkles } from 'lucide-react';

interface SmartMoneyExplainerCardProps {
  ticker: string;
}

export const SmartMoneyExplainerCard: React.FC<SmartMoneyExplainerCardProps> = ({
  ticker,
}) => {
  return (
    <div className="rounded-2xl border border-slate-800 bg-[#0d121e]/70 p-6 glass-panel mb-8">
      <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
        <Zap className="h-4 w-4 text-amber-400" />
        Mengapa Melacak Smart Money & Broker Flow?
      </h3>
      <p className="text-xs text-slate-400 leading-relaxed mb-6">
        Di pasar modal Indonesia (IDX), pergerakan harga sering didahului oleh akumulasi tersembunyi dari investor institusi dan asing. Klik <strong>&quot;Jalankan Analisis Smart Money&quot;</strong> di atas untuk memproses:
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center gap-2 font-bold text-xs text-amber-400 mb-1.5">
            <Database className="h-4 w-4" /> 1. Top Broker Registry
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Mengambil data agregat transaksi anggota bursa (AB) 14 hari terakhir untuk emiten {ticker}.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center gap-2 font-bold text-xs text-orange-400 mb-1.5">
            <TrendingUp className="h-4 w-4" /> 2. Konsentrasi Akumulasi
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Menghitung rasio beli vs jual 3 broker teratas untuk mendeteksi sinyal Strong Accumulation atau Distribution.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center gap-2 font-bold text-xs text-emerald-400 mb-1.5">
            <Sparkles className="h-4 w-4" /> 3. Narasi Sintesis AI
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Menghasilkan ulasan mendalam mengenai sentimen bandar/institusi dalam Bahasa Indonesia yang lugas.
          </p>
        </div>
      </div>
    </div>
  );
};
