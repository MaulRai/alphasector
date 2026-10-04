'use client';

import React from 'react';
import Link from 'next/link';
import { User, LogOut, KeyRound } from 'lucide-react';

interface ProfileOverviewCardProps {
  user: {
    full_name?: string;
    email?: string;
  } | null;
  onRequestLogout: () => void;
}

export const ProfileOverviewCard: React.FC<ProfileOverviewCardProps> = ({
  user,
  onRequestLogout,
}) => {
  return (
    <div className="rounded-2xl border border-slate-800 bg-[#0a0f1d]/90 backdrop-blur-xl p-5 sm:p-7 space-y-6 shadow-2xl glass-panel">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
            <User className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-white">Profil Analis</h2>
            <p className="text-xs text-slate-400">Informasi akun dan hak akses institutional</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-slate-500 block text-[11px] uppercase font-bold tracking-wider">
            Nama Lengkap
          </span>
          <span className="font-semibold text-white mt-1 block">
            {user?.full_name || 'Demo Analyst'}
          </span>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-slate-500 block text-[11px] uppercase font-bold tracking-wider">
            Email Analis
          </span>
          <span className="font-semibold text-white mt-1 block truncate">
            {user?.email || 'demo@alphasector.id'}
          </span>
        </div>
      </div>

      {/* Action Buttons: Ganti Password & Logout */}
      <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800/60">
        <Link
          href="/settings/password"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700/80 hover:border-emerald-500/50 text-xs sm:text-sm font-semibold transition-all active:scale-95 cursor-pointer shadow-sm group"
        >
          <KeyRound className="h-4 w-4 text-emerald-400 group-hover:rotate-12 transition-transform" />
          <span>Ganti Password</span>
        </Link>

        <button
          type="button"
          onClick={onRequestLogout}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs sm:text-sm font-semibold transition-all active:scale-95 cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
          <span>Keluar dari Akun (Logout)</span>
        </button>
      </div>
    </div>
  );
};
