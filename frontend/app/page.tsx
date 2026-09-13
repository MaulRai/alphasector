'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Navbar } from '@/components/Navbar';
import { RevealOnScroll } from '@/components/RevealOnScroll';
import { 
  Sparkles, ArrowRight, Swords, Users, Search, 
  Building2, ShieldCheck, TrendingUp, Zap, Database, 
  BarChart3, CheckCircle2, ChevronRight, PieChart, Layers, Play,
  Landmark, Lock, AlertTriangle, FileText
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col overflow-x-hidden">
      
      {/* Navigation */}
      <Navbar />

      {/* 1. HERO SECTION WITH ISOMETRIC ARCHITECTURE ILLUSTRATION */}
      <section className="relative pt-20 pb-12 md:pt-28 md:pb-16 px-4 sm:px-6 lg:px-8 w-full bg-gradient-to-b from-black via-black to-[#090d16] overflow-hidden">
        
        {/* Subtle Ambient Radial Glow */}
        <div className="absolute top-0 right-0 w-[500px] lg:w-[700px] h-[500px] bg-slate-900/30 blur-[130px] pointer-events-none select-none rounded-full" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start relative z-10 min-h-[460px] lg:min-h-[520px]">
          
          {/* Left Column: Top-Left Aligned Title, Subtitle, 2 CTA */}
          <div className="lg:col-span-5 xl:col-span-5 space-y-4 text-left pt-2 lg:pt-4">
            
            {/* Main Headline (Scaled down to fit elegantly in top-left corner) */}
            <h1 
              className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-[1.12] animate-fade-in-up"
              style={{ animationDelay: '100ms' }}
            >
              <span className="block">Autonomous</span>
              <span className="block text-white">Agentic AI.</span>
              <span className="block text-emerald-400 text-xl sm:text-2xl lg:text-3xl font-bold mt-1.5 sm:mt-2">
                Pasar Modal Indonesia
              </span>
            </h1>

            {/* Subtitle */}
            <p 
              className="text-xs sm:text-sm lg:text-base text-slate-300 max-w-md leading-relaxed font-normal animate-fade-in-up"
              style={{ animationDelay: '200ms' }}
            >
              Bukan sekadar chatbot pembungkus. AlphaSector mengeksekusi multi-step reasoning, 
              kalkulasi deterministik valuasi gap, dan pelacakan aliran dana institusi secara otonom.
            </p>

            {/* 2 CTA Buttons */}
            <div 
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2 animate-fade-in-up"
              style={{ animationDelay: '300ms' }}
            >
              <Link
                href="/alpha-agent"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-bold text-xs sm:text-sm hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-emerald-500/20 group"
              >
                <span>Buka AlphaAgent Workspace</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </Link>

              <Link
                href="/battle"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-200 font-semibold text-xs sm:text-sm transition-all backdrop-blur-md"
              >
                <span>Coba Peer Battle</span>
              </Link>
            </div>

          </div>

          {/* Right Column: Isometric Architecture Illustration Positioned at Bottom Right */}
          <div 
            className="lg:col-span-7 xl:col-span-7 relative flex items-end justify-center lg:justify-end self-end w-full animate-fade-in-up mt-4 lg:mt-0"
            style={{ animationDelay: '300ms' }}
          >
            <div className="relative w-full max-w-[620px] lg:max-w-[760px] aspect-[16/10] lg:scale-105 lg:origin-bottom-right">
              <Image
                src="/images/landing/landing-illu.png"
                alt="AlphaSector Agentic AI Architecture"
                fill
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="object-contain object-right-bottom"
                priority
              />
            </div>
          </div>

        </div>

      </section>

      {/* Seamless Transition Zone Between Section 1 (Black) and Section 2 (#090d16) */}
      <div className="w-full h-24 sm:h-32 bg-gradient-to-b from-black via-[#04060b] to-[#090d16] pointer-events-none" />

      {/* 2. CORE CAPABILITIES (Rich Visual Grid) */}
      <section className="py-20 bg-[#090d16] px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          
          <RevealOnScroll direction="up">
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
              <span className="text-xs font-bold text-emerald-400 tracking-wider uppercase">
                Fitur Riset Unggulan
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Dirancang Khusus untuk Analisis Pasar Modal Indonesia
              </h2>
              <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto">
                Kombinasi data finansial resmi berlisensi dan AI Agent berkecepatan tinggi tanpa halusinasi angka.
              </p>
            </div>
          </RevealOnScroll>

          {/* Capabilities Grid with Staggered Entrance */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Feature 1: Peer Battle */}
            <RevealOnScroll direction="up" delayMs={0}>
              <div className="rounded-2xl border border-slate-800 bg-[#0d121e] p-6 hover:border-cyan-500/40 hover:bg-[#101726] transition-all duration-300 flex flex-col justify-between group h-full">
                <div>
                  <div className="relative h-44 w-full rounded-xl overflow-hidden mb-5">
                    <Image
                      src="/images/landing/peer-battle.jpeg"
                      alt="Peer Battle Matrix"
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0d121e] via-transparent to-transparent" />
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <Swords className="h-5 w-5 text-cyan-400 group-hover:rotate-12 transition-transform duration-300" />
                    <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
                      Peer Battle & Multiples Gap
                    </h3>
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Bandingkan 2–4 emiten dalam satu subsektor secara head-to-head. Hitung selisih valuasi P/E, PBV, ROE, dan identifikasi saham yang terdiskon.
                  </p>
                </div>
                <Link 
                  href="/battle"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-400 hover:text-cyan-300 mt-5 pt-3 border-t border-slate-800 group-hover:border-slate-700 transition-colors"
                >
                  <span>Buka Peer Battle Terminal</span>
                  <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </RevealOnScroll>

            {/* Feature 2: Smart Money Flow */}
            <RevealOnScroll direction="up" delayMs={150}>
              <div className="rounded-2xl border border-slate-800 bg-[#0d121e] p-6 hover:border-amber-500/40 hover:bg-[#101726] transition-all duration-300 flex flex-col justify-between group h-full">
                <div>
                  <div className="relative h-44 w-full rounded-xl overflow-hidden mb-5">
                    <Image
                      src="/images/landing/money-charts.jpeg"
                      alt="Smart Money Flow"
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0d121e] via-transparent to-transparent" />
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-5 w-5 text-amber-400 group-hover:scale-110 transition-transform duration-300" />
                    <h3 className="text-lg font-bold text-white group-hover:text-amber-300 transition-colors">
                      Smart Money & Market Surveillance
                    </h3>
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Pantau broker flow, transaksi orang dalam (insider filings), dekomposisi kepemilikan KSEI (Dapen & Reksadana), hingga radar suspensi BEI & UMA.
                  </p>
                </div>
                <Link 
                  href="/smart-money"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 mt-5 pt-3 border-t border-slate-800 group-hover:border-slate-700 transition-colors"
                >
                  <span>Lacak Aliran Dana Smart Money</span>
                  <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </RevealOnScroll>

            {/* Feature 3: Screener Pro */}
            <RevealOnScroll direction="up" delayMs={300}>
              <div className="rounded-2xl border border-slate-800 bg-[#0d121e] p-6 hover:border-emerald-500/40 hover:bg-[#101726] transition-all duration-300 flex flex-col justify-between group h-full">
                <div>
                  <div className="relative h-44 w-full rounded-xl overflow-hidden mb-5">
                    <Image
                      src="/images/landing/trading-chart-intense.jpg"
                      alt="Screener Pro"
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0d121e] via-transparent to-transparent" />
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <Search className="h-5 w-5 text-emerald-400 group-hover:scale-110 transition-transform duration-300" />
                    <h3 className="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors">
                      Screener Pro & Trade Ideas
                    </h3>
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Saring semesta 900+ emiten BEI dengan bahasa natural (NLP) atau filter terstruktur. Dilengkapi radar 1-klik untuk ESG Leaders dan Revenue Titans.
                  </p>
                </div>
                <Link 
                  href="/screener"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300 mt-5 pt-3 border-t border-slate-800 group-hover:border-slate-700 transition-colors"
                >
                  <span>Mulai Screening Emiten</span>
                  <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </RevealOnScroll>

          </div>

        </div>
      </section>

      {/* 3. EMITEN 360 & DOSSIER SHOWCASE */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          <RevealOnScroll direction="left">
            <div className="space-y-6">
              <span className="text-xs font-bold text-cyan-400 tracking-wider uppercase">
                Deep-Dive Analysis
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                Emiten 360° Profile & Executive Research Dossier
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed max-w-xl">
                Buka lembar analisis komprehensif emiten manapun di BEI. Dapatkan data historis valuasi tahunan, rincian segmen bisnis, hingga ekspor laporan riset siap cetak ke format PDF atau Markdown.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3">
                  <div className="p-1 rounded bg-emerald-500/10 text-emerald-400 mt-0.5">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Sankey Breakdown Pendapatan</h3>
                    <p className="text-xs text-slate-300">Pahami dari mana emiten menghasilkan laba terbesar secara visual.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-1 rounded bg-cyan-500/10 text-cyan-400 mt-0.5">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Kalkulasi Multiples Otomatis</h3>
                    <p className="text-xs text-slate-300">P/E, PBV, P/S, PCF, EV/EBITDA, dan rasio neraca DER tanpa perhitungan manual.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-1 rounded bg-amber-500/10 text-amber-400 mt-0.5">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">One-Click PDF Export</h3>
                    <p className="text-xs text-slate-300">Ekspor brief riset berstandar institusi lengkap dengan disclaimer kepatuhan.</p>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Link
                  href="/company/BBCA"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-all border border-slate-700 hover:border-slate-500"
                >
                  <span>Lihat Contoh Dossier: BBCA</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </RevealOnScroll>

          {/* Visual Showcase Graphic */}
          <RevealOnScroll direction="right" delayMs={200}>
            <div className="relative rounded-2xl border border-slate-800 bg-[#0d121e] overflow-hidden">
              <div className="relative h-80 sm:h-96 w-full">
                <Image
                  src="/images/landing/digital-dossier.jpeg"
                  alt="Digital Dossier Preview"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#07090e] via-transparent to-transparent opacity-80" />
              </div>
            </div>
          </RevealOnScroll>

        </div>
      </section>

      {/* 4. SECTORS API DATA ENGINE */}
      <section className="py-20 border-t border-slate-800/80 bg-[#080c14] px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center space-y-12">
          
          <RevealOnScroll direction="up">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-semibold text-slate-300">
                <div className="relative h-4 w-4">
                  <Image
                    src="/images/sectors-icon.png"
                    alt="Sectors.app"
                    fill
                    className="object-contain"
                  />
                </div>
                <span>Sectors Financial Data Engine</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Ditenagai Ekosistem Sectors Financial API v2
              </h2>
              <p className="text-sm text-slate-400 max-w-xl mx-auto">
                Akurasi data pasar modal adalah prioritas mutlak. Seluruh analisis berakar langsung dari endpoint resmi Sectors API.
              </p>
            </div>
          </RevealOnScroll>

          {/* Integration Arc Nodes with Staggered Delays */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <RevealOnScroll direction="up" delayMs={0}>
              <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/40 transition-all text-center space-y-2 hover:scale-105">
                <div className="text-2xl font-black text-emerald-400 font-mono tabular-nums">70+</div>
                <div className="text-xs font-bold text-white">REST Endpoints</div>
                <p className="text-xs text-slate-400">Valuasi, laporan, dividen, dan pergerakan harga</p>
              </div>
            </RevealOnScroll>

            <RevealOnScroll direction="up" delayMs={100}>
              <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40 transition-all text-center space-y-2 hover:scale-105">
                <div className="text-2xl font-black text-cyan-400 font-mono tabular-nums">900+</div>
                <div className="text-xs font-bold text-white">Emiten BEI</div>
                <p className="text-xs text-slate-400">Cakupan semesta seluruh saham terdaftar di Indonesia</p>
              </div>
            </RevealOnScroll>

            <RevealOnScroll direction="up" delayMs={200}>
              <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-amber-500/40 transition-all text-center space-y-2 hover:scale-105">
                <div className="text-2xl font-black text-amber-400 font-mono tabular-nums">100+</div>
                <div className="text-xs font-bold text-white">Anggota Bursa</div>
                <p className="text-xs text-slate-400">Data konsentrasi broker dan pergerakan asing</p>
              </div>
            </RevealOnScroll>

            <RevealOnScroll direction="up" delayMs={300}>
              <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-teal-500/40 transition-all text-center space-y-2 hover:scale-105">
                <div className="text-2xl font-black text-teal-400 font-mono tabular-nums">&lt;6s</div>
                <div className="text-xs font-bold text-white">Agent Latency</div>
                <p className="text-xs text-slate-400">Eksekusi paralel multi-agent berkecepatan tinggi</p>
              </div>
            </RevealOnScroll>
          </div>

        </div>
      </section>

      {/* 5. SMART MONEY & MARKET SURVEILLANCE SUITE */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <RevealOnScroll direction="up">
          <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
            <span className="text-xs font-bold text-cyan-400 tracking-wider uppercase">
              Market Surveillance & Smart Money Suite
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Deteksi Jejak Smart Money & Keterbukaan Informasi BEI
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Mulai dari transaksi Direksi & Komisaris, dekomposisi pemegang saham riil KSEI, hingga radar suspensi bursa — seluruh insight dapat disalin langsung sebagai konteks ke AlphaAgent.
            </p>
          </div>
        </RevealOnScroll>

        {/* 3 Pillar Cards for New Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Card 1: Insider Deal Tracker */}
          <RevealOnScroll direction="up" delayMs={0}>
            <div className="relative rounded-2xl border border-slate-800 bg-[#0d121e] p-6 hover:border-cyan-500/40 hover:bg-[#101726] transition-all duration-300 flex flex-col justify-between group h-full space-y-5 overflow-hidden">
              
              {/* Faded corner image graphic centered on canvas subject */}
              <div className="absolute top-0 right-0 w-56 sm:w-64 h-44 sm:h-52 pointer-events-none select-none overflow-hidden z-0 rounded-tr-2xl">
                <Image
                  src="/images/landing/Insider Deal Tracker.jpeg"
                  alt="Insider Deal Tracker Preview"
                  fill
                  sizes="(max-width: 768px) 50vw, 30vw"
                  className="object-cover object-center opacity-60 group-hover:scale-105 group-hover:opacity-75 transition-all duration-500"
                />
                {/* Smooth multi-directional fading gradients to blend seamlessly */}
                <div className="absolute inset-0 bg-gradient-to-bl from-transparent via-[#0d121e]/60 to-[#0d121e]" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0d121e] via-[#0d121e]/50 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#0d121e] via-[#0d121e]/40 to-transparent" />
              </div>

              <div className="space-y-4 relative z-10">
                {/* Top spacer gap */}
                <div className="h-10 sm:h-12" aria-hidden="true" />
                <div>
                  <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
                    Insider Deal Tracker
                  </h3>
                  <p className="text-xs font-semibold text-cyan-400 mt-0.5">
                    Transaksi Direksi & Komisaris
                  </p>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Laporan keterbukaan resmi BEI/KSEI atas transaksi pembelian dan pelepasan saham oleh jajaran direksi, komisaris, dan pengendali untuk mendeteksi sinyal keyakinan manajemen emiten.
                </p>
                <div className="space-y-1.5 pt-1 text-[11px] text-slate-400">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                    <span>Klasifikasi Beli vs Jual otomatis</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                    <span>Riwayat nominal & tanggal transaksi</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                    <span>One-click Salin Konteks ke AlphaAgent</span>
                  </div>
                </div>
              </div>
              <Link
                href="/smart-money?tab=insider"
                className="relative z-10 inline-flex items-center justify-between text-xs font-bold text-cyan-400 hover:text-cyan-300 pt-3 border-t border-slate-800/80 group-hover:border-slate-700 transition-colors"
              >
                <span>Lihat Transaksi Insider</span>
                <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </RevealOnScroll>

          {/* Card 2: Institutional Breakdown KSEI */}
          <RevealOnScroll direction="up" delayMs={150}>
            <div className="relative rounded-2xl border border-slate-800 bg-[#0d121e] p-6 hover:border-purple-500/40 hover:bg-[#101726] transition-all duration-300 flex flex-col justify-between group h-full space-y-5 overflow-hidden">
              
              {/* Faded corner image graphic centered on canvas subject */}
              <div className="absolute top-0 right-0 w-56 sm:w-64 h-44 sm:h-52 pointer-events-none select-none overflow-hidden z-0 rounded-tr-2xl">
                <Image
                  src="/images/landing/Institutional Breakdown.png"
                  alt="Institutional Breakdown KSEI Preview"
                  fill
                  sizes="(max-width: 768px) 50vw, 30vw"
                  className="object-cover object-center opacity-60 group-hover:scale-105 group-hover:opacity-75 transition-all duration-500"
                />
                {/* Smooth multi-directional fading gradients to blend seamlessly */}
                <div className="absolute inset-0 bg-gradient-to-bl from-transparent via-[#0d121e]/60 to-[#0d121e]" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0d121e] via-[#0d121e]/50 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#0d121e] via-[#0d121e]/40 to-transparent" />
              </div>

              <div className="space-y-4 relative z-10">
                {/* Top spacer gap */}
                <div className="h-10 sm:h-12" aria-hidden="true" />
                <div>
                  <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors">
                    Institutional Breakdown
                  </h3>
                  <p className="text-xs font-semibold text-purple-400 mt-0.5">
                    Dapen, Reksadana & Asuransi
                  </p>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Dekomposisi kepemilikan saham riil dari KSEI setiap bulan. Ketahui akumulasi dana pensiun (smart money jangka panjang) dan asuransi vs posisi spekulatif ritel.
                </p>
                <div className="space-y-1.5 pt-1 text-[11px] text-slate-400">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-purple-400 shrink-0" />
                    <span>Rasio Asing vs Domestik akurat</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-purple-400 shrink-0" />
                    <span>6 kategori entitas pemegang saham</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-purple-400 shrink-0" />
                    <span>One-click Salin Konteks ke AlphaAgent</span>
                  </div>
                </div>
              </div>
              <Link
                href="/smart-money?tab=institutional"
                className="relative z-10 inline-flex items-center justify-between text-xs font-bold text-purple-400 hover:text-purple-300 pt-3 border-t border-slate-800/80 group-hover:border-slate-700 transition-colors"
              >
                <span>Cek Dekomposisi KSEI</span>
                <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </RevealOnScroll>

          {/* Card 3: BEI Suspension & UMA Watchdog */}
          <RevealOnScroll direction="up" delayMs={300}>
            <div className="relative rounded-2xl border border-slate-800 bg-[#0d121e] p-6 hover:border-rose-500/40 hover:bg-[#101726] transition-all duration-300 flex flex-col justify-between group h-full space-y-5 overflow-hidden">
              
              {/* Faded corner image graphic centered on canvas subject */}
              <div className="absolute top-0 right-0 w-56 sm:w-64 h-44 sm:h-52 pointer-events-none select-none overflow-hidden z-0 rounded-tr-2xl">
                <Image
                  src="/images/landing/BEI Suspension UMA.jpeg"
                  alt="BEI Suspension & UMA Preview"
                  fill
                  sizes="(max-width: 768px) 50vw, 30vw"
                  className="object-cover object-center opacity-60 group-hover:scale-105 group-hover:opacity-75 transition-all duration-500"
                />
                {/* Smooth multi-directional fading gradients to blend seamlessly */}
                <div className="absolute inset-0 bg-gradient-to-bl from-transparent via-[#0d121e]/60 to-[#0d121e]" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0d121e] via-[#0d121e]/50 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#0d121e] via-[#0d121e]/40 to-transparent" />
              </div>

              <div className="space-y-4 relative z-10">
                {/* Top spacer gap */}
                <div className="h-10 sm:h-12" aria-hidden="true" />
                <div>
                  <h3 className="text-lg font-bold text-white group-hover:text-rose-300 transition-colors">
                    BEI Suspension & UMA
                  </h3>
                  <p className="text-xs font-semibold text-rose-400 mt-0.5">
                    Suspensi Perdagangan & Keterbukaan Bursa
                  </p>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Sistem radar penghentian sementara (suspensi) perdagangan efek dan pemantauan Unusual Market Activity (UMA) oleh Bursa Efek Indonesia, lengkap dengan tautan pengumuman resmi bursa.
                </p>
                <div className="space-y-1.5 pt-1 text-[11px] text-slate-400">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-rose-400 shrink-0" />
                    <span>Filter status spesifik emiten / se-Bursa</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-rose-400 shrink-0" />
                    <span>Tautan surat pengumuman resmi BEI</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-rose-400 shrink-0" />
                    <span>One-click Salin Konteks ke AlphaAgent</span>
                  </div>
                </div>
              </div>
              <Link
                href="/smart-money?tab=suspensions"
                className="relative z-10 inline-flex items-center justify-between text-xs font-bold text-rose-400 hover:text-rose-300 pt-3 border-t border-slate-800/80 group-hover:border-slate-700 transition-colors"
              >
                <span>Buka Radar Suspensi BEI</span>
                <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </RevealOnScroll>
        </div>

        {/* Seamless Context Handoff Feature Banner */}
        <RevealOnScroll direction="up" delayMs={400}>
          <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/20 via-[#0d121e] to-cyan-950/20 p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-5">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0 mt-0.5">
                <FileText className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Workflow Baru
                  </span>
                  <h4 className="text-sm sm:text-base font-bold text-white">
                    Seamless Context Handoff ke AlphaAgent
                  </h4>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                  Klik tombol <strong>&quot;Salin Konteks&quot;</strong> di modul Smart Money, lalu tekan <strong>Ctrl+V</strong> di input AlphaAgent. Data akan otomatis diperlakukan sebagai chip konteks khusus (lampiran file) yang tersusun menyamping, siap dievaluasi oleh multi-step reasoning AI Agent.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
              <Link
                href="/smart-money"
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-all border border-slate-700"
              >
                <span>Buka Smart Money</span>
              </Link>
              <Link
                href="/alpha-agent"
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-bold text-xs hover:brightness-110 transition-all"
              >
                <span>Coba di AlphaAgent</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </RevealOnScroll>
      </section>

      {/* 6. GRAND BOTTOM BANNER / CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
        <RevealOnScroll direction="up">
          <div className="relative rounded-3xl border border-slate-800 bg-[#0a0f1d] p-8 sm:p-14 text-center overflow-hidden hover:border-emerald-500/30 transition-all">
            
            {/* Oversized Subtle Background Brand Logo Mark */}
            <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
              <span className="text-9xl sm:text-[180px] font-black tracking-tighter text-white select-none">
                ALPHA
              </span>
            </div>

            <div className="relative z-10 max-w-2xl mx-auto space-y-5">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Mulai Riset Saham Cerdas Hari Ini
              </h2>
              <p className="text-sm sm:text-base text-slate-200 leading-relaxed max-w-xl mx-auto">
                Jalankan riset emiten pertama kamu dengan AI Agent otonom AlphaSector. Dapatkan dossier finansial terstruktur dalam hitungan detik.
              </p>
              <div className="pt-3">
                <Link
                  href="/alpha-agent"
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-bold text-sm hover:brightness-110 active:scale-95 transition-all"
                >
                  <span>Buka AlphaAgent Sekarang</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

          </div>
        </RevealOnScroll>
      </section>

      {/* 7. FOOTER */}
      <footer className="w-full border-t border-slate-800/80 bg-[#05070b] py-12 px-4 sm:px-6 lg:px-8 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="relative h-6 w-6 rounded-lg overflow-hidden border border-emerald-500/40">
                <Image
                  src="/images/alphasector-icon.png"
                  alt="AlphaSector"
                  fill
                  className="object-cover"
                />
              </div>
              <span className="font-bold text-white text-sm tracking-tight">
                Alpha<span className="text-emerald-400">Sector</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Autonomous Equity Research Agent for IDX. Developed for Sectors Hackathon 2026.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-slate-200 text-xs uppercase mb-3">Fitur Aplikasi</h3>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><Link href="/alpha-agent" className="hover:text-emerald-400 transition-colors">AlphaAgent Terminal</Link></li>
              <li><Link href="/battle" className="hover:text-emerald-400 transition-colors">Peer Battle Terminal</Link></li>
              <li><Link href="/smart-money" className="hover:text-emerald-400 transition-colors">Smart Money & Surveillance</Link></li>
              <li><Link href="/screener" className="hover:text-emerald-400 transition-colors">Screener Pro (NLP & SQL)</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-slate-200 text-xs uppercase mb-3">Teknologi & Ekosistem</h3>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-center gap-1.5 text-slate-300 font-medium">
                <div className="relative h-3.5 w-3.5 shrink-0">
                  <Image src="/images/sectors-icon.png" alt="Sectors" fill className="object-contain" />
                </div>
                <span>Sectors Financial API v2</span>
              </li>
              <li>Autonomous Agent Orchestrator</li>
              <li>Ultra-Low Latency Inference Engine</li>
              <li>Modern Full-Stack Architecture</li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-slate-200 text-xs uppercase mb-3">Kepatuhan</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Seluruh informasi disajikan semata-mata untuk kebutuhan edukasi dan analisis riset finansial. Bukan merupakan rekomendasi atau ajakan jual/beli efek.
            </p>
          </div>

        </div>

        <div className="max-w-7xl mx-auto pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <span>© 2026 AlphaSector. All rights reserved.</span>
          <span>Sectors Hackathon 2026 • Track 01 AI Agents & Assistants</span>
        </div>
      </footer>

    </div>
  );
}
