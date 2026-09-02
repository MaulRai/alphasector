'use client';

import React, { useState, useEffect } from 'react';
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
}) => {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Copilot', href: '/copilot', icon: Activity },
    { label: 'Peer Battle', href: '/battle', icon: Swords },
    { label: 'Smart Money', href: '/smart-money', icon: Users },
    { label: 'Screener', href: '/screener', icon: Search },
    { label: 'Emiten 360°', href: '/company/BBCA', icon: Layers },
  ];

  return (
    <header className="fixed top-0 inset-x-0 z-50 pointer-events-none py-3 sm:py-4 px-3 sm:px-6 transition-all duration-300 ease-out">
      <div
        className={`pointer-events-auto transition-all duration-300 ease-out flex items-center justify-between mx-auto ${
          isScrolled
            ? 'h-14 max-w-5xl rounded-2xl border border-slate-800/80 bg-[#07090e]/90 backdrop-blur-2xl shadow-2xl shadow-black/90 px-4 sm:px-6'
            : 'h-16 max-w-7xl px-4 sm:px-6 lg:px-8 bg-transparent'
        }`}
      >
        
        {/* Left: Brand Logo & Title */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl overflow-hidden border border-emerald-500/30 group-hover:border-emerald-400/60 transition-all glow-emerald shadow-md shrink-0">
              <Image 
                src="/images/alphasector-icon.png"
                alt="AlphaSector Logo"
                width={36}
                height={36}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                priority
              />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-sm sm:text-base font-bold tracking-tight text-white">
                  Alpha<span className="text-emerald-400">Sector</span>
                </span>
              </div>
              <span className="text-[9px] sm:text-[10px] text-slate-400 hidden sm:inline -mt-0.5">
                Autonomous Equity Research
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Main Navigation Bar */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800/80 shadow-inner backdrop-blur-md">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.href === '/' 
              ? pathname === '/' 
              : pathname.startsWith(item.href.split('/')[1] ? `/${item.href.split('/')[1]}` : item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
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

        {/* Right: Dossier CTA if active */}
        <div className="flex items-center gap-2">
          {hasActiveReport && onOpenDossier && (
            <button
              onClick={onOpenDossier}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-semibold transition-all hover:scale-105 shadow-sm"
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Dossier</span>
            </button>
          )}
        </div>

      </div>

      {/* Mobile Sub-Navigation */}
      <div className="md:hidden pointer-events-auto mt-2 flex items-center gap-1 p-2 rounded-xl border border-slate-800/80 overflow-x-auto bg-[#07090e]/95 backdrop-blur-xl">
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
