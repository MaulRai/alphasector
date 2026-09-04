'use client';

import React from 'react';
import { Zap, Database, Layers, Sparkles } from 'lucide-react';

export const BattleExplainerCard: React.FC = () => {
  return (
    <div className="rounded-2xl border border-slate-800 bg-[#0d121e]/70 p-6 glass-panel mb-8">
      <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
        <Zap className="h-4 w-4 text-cyan-400" />
        Bagaimana Peer Battle Bekerja?
      </h3>
      <p className="text-xs text-slate-400 leading-relaxed mb-6">
        Fitur ini mengomparasikan metrik fundamental beberapa emiten secara objektif tanpa bias. Klik tombol <strong>&quot;Jalankan Peer Battle&quot;</strong> di atas untuk memulai siklus analisis 3-langkah berikut:
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center gap-2 font-bold text-xs text-blue-400 mb-1.5">
            <Database className="h-4 w-4" /> 1. Data Fetching
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Mengambil data laporan keuangan resmi, valuasi historis, dan ringkasan overview setiap emiten langsung dari Sectors Financial API.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center gap-2 font-bold text-xs text-cyan-400 mb-1.5">
            <Layers className="h-4 w-4" /> 2. Deterministik Matrix
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Menghitung rasio P/E gap, PBV gap, profitabilitas ROE, margin NPM, rasio leverage DER, dan menentukan badge Best-in-Class secara matematis.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center gap-2 font-bold text-xs text-emerald-400 mb-1.5">
            <Sparkles className="h-4 w-4" /> 3. AI Valuation Verdict
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Menyintesis kesimpulan komparatif, menyaring emiten yang terdiskon, dan mengidentifikasi katalis utama.
          </p>
        </div>
      </div>
    </div>
  );
};
