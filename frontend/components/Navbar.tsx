'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { 
  Terminal, Swords, Users, 
  Search, BookOpen, ShieldCheck, Activity, Building2, Layers, Home 
} from 'lucide-react';

interface NavbarProps {
  onOpenCommandPalette?: () => void;
  onOpenDossier?: () => void;
  hasActiveReport?: boolean;
  backendOnline?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenCommandPalette,
  onOpenDossier,
  hasActiveReport,
  backendOnline = true,
}) => {
  const pathname = usePathname();

  const navItems = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Copilot', href: '/copilot', icon: Activity },
    { label: 'Peer Battle', href: '/battle', icon: Swords },
    { label: 'Smart Money', href: '/smart-money', icon: Users },
    { label: 'Screener', href: '/screener', icon: Search },
    { label: 'Emiten 360°', href: '/company/BBCA', icon: Layers },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/5 bg-[#07090e]/85 backdrop-blur-xl transition-all">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Brand Logo & Tag */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl overflow-hidden border border-emerald-500/30 group-hover:border-emerald-400/60 transition-all glow-emerald shadow-md">
              <Image 
                src="/images/alphasector-icon.png"
                alt="AlphaSector Logo"
                width={40}
                height={40}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                priority
              />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-base font-bold tracking-tight text-white">
                  Alpha<span className="text-emerald-400">Sector</span>
                </span>
              </div>
              <span className="text-[10px] text-slate-400 hidden sm:inline -mt-0.5">
                Autonomous Equity Research
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800/80">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.href === '/' 
                ? pathname === '/' 
                : pathname.startsWith(item.href.split('/')[1] ? `/${item.href.split('/')[1]}` : item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Center Quick Search Trigger */}
        {onOpenCommandPalette && (
          <div className="hidden lg:flex flex-1 max-w-xs mx-6">
            <button
              onClick={onOpenCommandPalette}
              className="w-full flex items-center justify-between px-3 py-1.5 text-xs text-slate-400 bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 hover:border-emerald-500/40 rounded-xl transition-all shadow-inner group"
            >
              <div className="flex items-center gap-2 truncate">
                <Terminal className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-slate-400 group-hover:text-slate-200 truncate">
                  Tanya agent / screening...
                </span>
              </div>
              <kbd className="inline-flex items-center rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-medium text-slate-400 border border-slate-700">
                ⌘K
              </kbd>
            </button>
          </div>
        )}

        {/* Right Status Actions */}
        <div className="flex items-center gap-3">
          {/* Export Dossier Button if report is active */}
          {hasActiveReport && onOpenDossier && (
            <button
              onClick={onOpenDossier}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-semibold transition-all hover:scale-105"
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span>Dossier</span>
            </button>
          )}

          {/* Mobile Search Button */}
          {onOpenCommandPalette && (
            <button
              onClick={onOpenCommandPalette}
              className="md:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300"
            >
              <Search className="h-4 w-4 text-emerald-400" />
            </button>
          )}
        </div>

      </div>

      {/* Mobile Sub-Navigation */}
      <div className="md:hidden flex items-center gap-1 px-4 py-2 border-t border-white/5 overflow-x-auto bg-[#07090e]">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href.split('/')[1] ? `/${item.href.split('/')[1]}` : item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 ${
                isActive
                  ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200 bg-slate-900/50'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </header>
  );
};
