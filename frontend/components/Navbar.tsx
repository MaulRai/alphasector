'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { 
  Swords, Users, Search, BookOpen, 
  Activity, Home, Layers, LogOut, User as UserIcon, LogIn, Settings, Newspaper
} from 'lucide-react';
import { AlphaAgentLogo } from '@/components/AlphaAgentLogo';
import { ApiKeySetupTooltip } from '@/components/ApiKeySetupTooltip';

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
  const { user, isAuthenticated, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 25);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'AlphaAgent', href: '/alpha-agent', isCustomLogo: true },
    { label: 'Peer Battle', href: '/battle', icon: Swords },
    { label: 'Smart Money', href: '/smart-money', icon: Users },
    { label: 'Screener', href: '/screener', icon: Search },
    { label: 'News', href: '/news', icon: Newspaper },
  ];

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <header className="fixed top-0 inset-x-0 z-50">
      
      {/* 1. Full-Width Background Bar at Top (Fades out seamlessly when floating) */}
      <div 
        className={`absolute inset-x-0 top-0 h-16 bg-[#07090e]/80 backdrop-blur-md border-b border-slate-800/60 transition-opacity duration-300 ${
          isScrolled ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`} 
      />

      {/* 2. Nav Container & Floating Island */}
      <div className={`relative px-4 sm:px-6 transition-all duration-300 ${isScrolled ? 'pt-3 sm:pt-4' : 'pt-0'}`}>
        <div
          className={`mx-auto flex items-center justify-between transition-all duration-300 ease-out ${
            isScrolled
              ? 'h-14 max-w-5xl rounded-2xl border border-slate-800 bg-[#07090e]/90 backdrop-blur-2xl shadow-2xl shadow-black/90 px-4 sm:px-6'
              : 'h-16 max-w-7xl bg-transparent border-transparent px-2 sm:px-4'
          }`}
        >
          
          {/* Left: Brand Logo & Title */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="relative flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl overflow-hidden border border-emerald-500/30 group-hover:border-emerald-400/60 transition-all shadow-craft-sm shrink-0">
                <Image 
                  src="/images/alphasector-icon.png"
                  alt="AlphaSector Logo"
                  width={36}
                  height={36}
                  className="w-full h-full object-cover"
                  priority
                />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm sm:text-base font-bold tracking-tight text-white">
                    Alpha<span className="text-emerald-400">Sector</span>
                  </span>
                </div>
                <span className="text-xs text-slate-400 hidden sm:inline -mt-0.5">
                  Autonomous Equity Research
                </span>
              </div>
            </Link>
          </div>

          {/* Center: Main Navigation Bar */}
          <nav className="hidden md:flex items-center gap-1 p-1">
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
                      ? 'bg-emerald-500/15 text-emerald-300 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  {item.isCustomLogo ? (
                    <AlphaAgentLogo size={14} className={isActive ? 'brightness-125 drop-shadow-[0_0_6px_rgba(16,185,129,0.5)]' : 'opacity-80'} />
                  ) : Icon ? (
                    <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                  ) : null}
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right: Auth Profile Status & Dossier CTA */}
          <div className="flex items-center gap-2">
            {/* Export Dossier CTA (Replaced by Artifacts panel on /alpha-agent) */}
            {hasActiveReport && onOpenDossier && pathname !== '/alpha-agent' && (
              <button
                onClick={onOpenDossier}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-semibold transition-all hover:scale-105"
              >
                <BookOpen className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Dossier</span>
              </button>
            )}

            {/* User Profile / Auth State */}
            {mounted ? (
              isAuthenticated && user ? (
                <div className="flex items-center gap-2 pl-1 border-l border-slate-800/80">
                  <div 
                    className="flex items-center gap-2 px-2.5 py-1 text-slate-200"
                    title={`${user.full_name} (${user.email})`}
                  >
                    <div className="flex h-5 w-5 items-center justify-center rounded-md bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                      {getInitials(user.full_name || 'AN')}
                    </div>
                    <span className="text-xs font-medium text-slate-200 max-w-[90px] truncate hidden sm:inline">
                      {user.full_name.split(' ')[0]}
                    </span>
                  </div>
                  
                  <div className="relative">
                    <Link
                      href="/settings"
                      title="Pengaturan & Sectors API Key (Settings)"
                      className="p-1.5 rounded-lg hover:bg-slate-800/70 text-slate-400 hover:text-emerald-400 transition-colors text-xs flex items-center justify-center"
                    >
                      <Settings className="h-3.5 w-3.5" />
                    </Link>

                    {/* Elegant tooltip pointing to Settings for fresh logins without Sectors API key */}
                    <ApiKeySetupTooltip />
                  </div>
                </div>
              ) : (
                <Link
                  href="/alpha-agent"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-slate-800/70 text-slate-300 hover:text-white text-xs font-semibold transition-all"
                >
                  <LogIn className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Masuk</span>
                </Link>
              )
            ) : (
              <div className="w-16 h-7" />
            )}
          </div>

        </div>
      </div>

      {/* Mobile Sub-Navigation */}
      <div className="md:hidden px-4 py-2 border-t border-slate-800/50 overflow-x-auto bg-[#07090e]/95 backdrop-blur-xl flex items-center gap-1">
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
              {item.isCustomLogo ? (
                <AlphaAgentLogo size={14} className={isActive ? 'brightness-125 drop-shadow-[0_0_6px_rgba(16,185,129,0.5)]' : 'opacity-80'} />
              ) : Icon ? (
                <Icon className="h-3.5 w-3.5" />
              ) : null}
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </header>
  );
};
