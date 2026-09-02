'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { 
  Swords, Users, Search, BookOpen, 
  Activity, Home, Layers, ArrowRight
} from 'lucide-react';

interface NavbarProps {
  onOpenDossier?: () => void;
  hasActiveReport?: boolean;
  backendOnline?: boolean;
  onOpenCommandPalette?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenDossier,
  hasActiveReport,
  backendOnline,
  onOpenCommandPalette,
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
        
        {/* Left: Brand Logo & Title */}
        <div className="flex items-center">
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
        </div>

        {/* Center: Main Navigation Bar */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800/80 shadow-inner">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.href === '/' 
              ? pathname === '/' 
              : pathname.startsWith(item.href.split('/')[1] ? `/${item.href.split('/')[1]}` : item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
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

        {/* Right: Quick Action / Dossier CTA */}
        <div className="flex items-center gap-3">
          {hasActiveReport && onOpenDossier ? (
            <button
              onClick={onOpenDossier}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-semibold transition-all hover:scale-105 shadow-sm"
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span>Dossier</span>
            </button>
          ) : (
            <Link
              href="/copilot"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/30 text-slate-300 hover:text-white text-xs font-semibold transition-all"
            >
              <span>Copilot</span>
              <ArrowRight className="h-3 w-3 text-emerald-400" />
            </Link>
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
