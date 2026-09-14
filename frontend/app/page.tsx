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
    <div className="min-h-screen bg-[#080e1e] text-slate-100 flex flex-col overflow-x-clip">
      
      {/* Navigation */}
      <Navbar />

      {/* 1. HERO SECTION (ONLY SECTION WITH PURE BLACK BACKGROUND) */}
      <section className="relative pt-20 pb-16 md:pt-28 md:pb-20 px-4 sm:px-6 lg:px-8 w-full bg-black overflow-hidden">
        
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
              Bukan sekadar wrapper chatbot. AlphaSector mengeksekusi multi-step reasoning, 
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

        {/* Seamless Ultra-Smooth Scrim Transition from Pure Black into Rich Donker (Section 2) */}
        <div 
          className="absolute inset-x-0 bottom-0 h-48 sm:h-64 pointer-events-none z-10"
          style={{
            background: 'linear-gradient(to bottom, rgba(8, 14, 30, 0) 0%, rgba(8, 14, 30, 0.04) 15%, rgba(8, 14, 30, 0.14) 30%, rgba(8, 14, 30, 0.35) 50%, rgba(8, 14, 30, 0.65) 70%, rgba(8, 14, 30, 0.88) 88%, rgba(8, 14, 30, 1) 100%)'
          }}
        />

      </section>

      {/* 2. CORE CAPABILITIES (Sticky Left Header + Vertical Stacked Cards with Diagonal Overlapping Preview Images) */}
      <section className="py-24 sm:py-32 bg-[#080e1e] px-4 sm:px-6 lg:px-8 relative">
        {/* Subtle Donker Ambient Lighting centered below the boundary to prevent top-edge seam */}
        <div className="absolute top-28 left-1/2 -translate-x-1/2 w-full max-w-7xl h-64 bg-blue-950/20 blur-[140px] pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
            
            {/* Left Column: Title & Subtitle (Sticky Hold) */}
            <div className="lg:col-span-5 lg:sticky lg:top-32 self-start space-y-4 pt-2">
              <RevealOnScroll direction="left">
                <div className="space-y-4">
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.15]">
                    Dirancang Khusus untuk Analisis Pasar Modal Indonesia
                  </h2>
                  
                  <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-lg">
                    Kombinasi data finansial resmi berlisensi dan AI Agent berkecepatan tinggi tanpa halusinasi angka.
                  </p>
                </div>
              </RevealOnScroll>
            </div>

            {/* Right Column: Vertically Stacked Cards with Diagonal Overlapping Previews & Scroll Resistance */}
            <div className="lg:col-span-7 flex flex-col gap-10 sm:gap-14">
              
              {/* Feature 1: Peer Battle & Multiples Gap */}
              <div className="sticky top-28 sm:top-32 z-10 transition-all duration-300">
                <RevealOnScroll direction="up" delayMs={0}>
                  <div className="relative group min-h-[340px] sm:min-h-[360px] flex flex-col lg:flex-row items-center">
                    
                    {/* Main Card Content (Card Utama - Solid Foreground Layer) */}
                    <div className="relative z-20 w-full lg:w-[360px] xl:w-[390px] rounded-2xl bg-[#0c1426] border border-slate-700/80 p-6 sm:p-7 shadow-[0_20px_50px_rgba(0,0,0,0.9)] space-y-4 shrink-0 hover:border-cyan-500/50 transition-colors duration-300">
                      
                      {/* Badge & Icon */}
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center text-cyan-400 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300 shrink-0">
                          <Swords className="h-5 w-5" />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold tracking-wider text-cyan-400 uppercase block">
                            Head-to-Head Multiples
                          </span>
                          <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-cyan-300 transition-colors">
                            Peer Battle Matrix
                          </h3>
                        </div>
                      </div>

                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                        Bandingkan 2–4 emiten dalam satu subsektor secara head-to-head. Hitung selisih valuasi P/E, PBV, ROE, dan Piotroski F-Score deterministik untuk menemukan saham yang terdiskon.
                      </p>

                      {/* CTA Button */}
                      <div className="pt-2">
                        <Link 
                          href="/battle"
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-xs font-bold text-cyan-300 hover:text-white transition-all group/btn"
                        >
                          <span>Buka Peer Battle Terminal</span>
                          <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-1" />
                        </Link>
                      </div>

                    </div>

                    {/* Compact Elongated Feature Preview (Contoh Fitur - Memanjang & Overlap Dibelakang Card Utama) */}
                    <div className="relative lg:absolute lg:left-[250px] xl:left-[280px] lg:top-1/2 lg:-translate-y-1/2 w-full lg:w-[480px] xl:w-[540px] z-10 mt-4 lg:mt-0">
                      {/* Ambient Accent Glow */}
                      <div className="absolute -inset-4 bg-cyan-500/15 blur-3xl -z-10 rounded-2xl opacity-60 group-hover:opacity-100 transition-opacity duration-500" />
                      
                      <div className="relative aspect-[21/10] w-full rounded-2xl overflow-hidden border border-slate-700/70 shadow-[0_20px_50px_rgba(0,0,0,0.95)] bg-[#070c18] transform rotate-[1.5deg] lg:rotate-[2.5deg] group-hover:lg:rotate-[1deg] group-hover:scale-[1.02] group-hover:-translate-y-1 transition-all duration-700 ease-out">
                        <Image
                          src="/images/landing/Peer Battle & Valuation Matrix.png"
                          alt="Peer Battle & Valuation Matrix"
                          fill
                          sizes="(max-width: 1024px) 100vw, 550px"
                          className="object-cover object-left-top"
                          priority
                        />
                        {/* Subtle soft vignette */}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0c1426]/30 via-transparent to-transparent pointer-events-none" />
                      </div>
                    </div>

                  </div>
                </RevealOnScroll>
              </div>

              {/* Feature 2: Smart Money & Broker Flow Tracker */}
              <div className="sticky top-32 sm:top-36 z-20 transition-all duration-300">
                <RevealOnScroll direction="up" delayMs={100}>
                  <div className="relative group min-h-[340px] sm:min-h-[360px] flex flex-col lg:flex-row items-center">
                    
                    {/* Main Card Content (Card Utama - Solid Foreground Layer) */}
                    <div className="relative z-20 w-full lg:w-[360px] xl:w-[390px] rounded-2xl bg-[#0c1426] border border-slate-700/80 p-6 sm:p-7 shadow-[0_20px_50px_rgba(0,0,0,0.9)] space-y-4 shrink-0 hover:border-amber-500/50 transition-colors duration-300">
                      
                      {/* Badge & Icon */}
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300 shrink-0">
                          <Users className="h-5 w-5" />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold tracking-wider text-amber-400 uppercase block">
                            Institutional Surveillance
                          </span>
                          <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-amber-300 transition-colors">
                            Smart Money Tracker
                          </h3>
                        </div>
                      </div>

                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                        Pantau konsentrasi transaksi broker institusi, asing, dan ritel 14–30 hari terakhir. Dilengkapi pelacakan insider filings, kepemilikan KSEI (Dapen & Reksadana), dan radar suspensi resmi BEI.
                      </p>

                      {/* CTA Button */}
                      <div className="pt-2">
                        <Link 
                          href="/smart-money"
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-xs font-bold text-amber-300 hover:text-white transition-all group/btn"
                        >
                          <span>Lacak Aliran Dana Smart Money</span>
                          <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-1" />
                        </Link>
                      </div>

                    </div>

                    {/* Compact Elongated Feature Preview (Contoh Fitur - Memanjang & Overlap Dibelakang Card Utama) */}
                    <div className="relative lg:absolute lg:left-[250px] xl:left-[280px] lg:top-1/2 lg:-translate-y-1/2 w-full lg:w-[480px] xl:w-[540px] z-10 mt-4 lg:mt-0">
                      {/* Ambient Accent Glow */}
                      <div className="absolute -inset-4 bg-amber-500/15 blur-3xl -z-10 rounded-2xl opacity-60 group-hover:opacity-100 transition-opacity duration-500" />
                      
                      <div className="relative aspect-[21/10] w-full rounded-2xl overflow-hidden border border-slate-700/70 shadow-[0_20px_50px_rgba(0,0,0,0.95)] bg-[#070c18] transform rotate-[1.5deg] lg:rotate-[2.5deg] group-hover:lg:rotate-[1deg] group-hover:scale-[1.02] group-hover:-translate-y-1 transition-all duration-700 ease-out">
                        <Image
                          src="/images/landing/Smart Money & Broker Flow Tracker.png"
                          alt="Smart Money & Broker Flow Tracker"
                          fill
                          sizes="(max-width: 1024px) 100vw, 550px"
                          className="object-cover object-left-top"
                        />
                        {/* Subtle soft vignette */}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0c1426]/30 via-transparent to-transparent pointer-events-none" />
                      </div>
                    </div>

                  </div>
                </RevealOnScroll>
              </div>

              {/* Feature 3: Screener Pro & Trade Ideas */}
              <div className="sticky top-36 sm:top-40 z-30 transition-all duration-300">
                <RevealOnScroll direction="up" delayMs={100}>
                  <div className="relative group min-h-[340px] sm:min-h-[360px] flex flex-col lg:flex-row items-center">
                    
                    {/* Main Card Content (Card Utama - Solid Foreground Layer) */}
                    <div className="relative z-20 w-full lg:w-[360px] xl:w-[390px] rounded-2xl bg-[#0c1426] border border-slate-700/80 p-6 sm:p-7 shadow-[0_20px_50px_rgba(0,0,0,0.9)] space-y-4 shrink-0 hover:border-emerald-500/50 transition-colors duration-300">
                      
                      {/* Badge & Icon */}
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300 shrink-0">
                          <Search className="h-5 w-5" />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold tracking-wider text-emerald-400 uppercase block">
                            Natural Language Discovery
                          </span>
                          <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-emerald-300 transition-colors">
                            Screener Pro & Ideas
                          </h3>
                        </div>
                      </div>

                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                        Saring semesta 900+ emiten BEI dengan bahasa natural (NLP) atau filter terstruktur. Dilengkapi preset 1-klik untuk dividen tinggi, ESG Leaders, dan valuasi terdiskon.
                      </p>

                      {/* CTA Button */}
                      <div className="pt-2">
                        <Link 
                          href="/screener"
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-xs font-bold text-emerald-300 hover:text-white transition-all group/btn"
                        >
                          <span>Mulai Skrining Emiten</span>
                          <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-1" />
                        </Link>
                      </div>

                    </div>

                    {/* Compact Elongated Feature Preview (Contoh Fitur - Memanjang & Overlap Dibelakang Card Utama) */}
                    <div className="relative lg:absolute lg:left-[250px] xl:left-[280px] lg:top-1/2 lg:-translate-y-1/2 w-full lg:w-[480px] xl:w-[540px] z-10 mt-4 lg:mt-0">
                      {/* Ambient Accent Glow */}
                      <div className="absolute -inset-4 bg-emerald-500/15 blur-3xl -z-10 rounded-2xl opacity-60 group-hover:opacity-100 transition-opacity duration-500" />
                      
                      <div className="relative aspect-[21/10] w-full rounded-2xl overflow-hidden border border-slate-700/70 shadow-[0_20px_50px_rgba(0,0,0,0.95)] bg-[#070c18] transform rotate-[1.5deg] lg:rotate-[2.5deg] group-hover:lg:rotate-[1deg] group-hover:scale-[1.02] group-hover:-translate-y-1 transition-all duration-700 ease-out">
                        <Image
                          src="/images/landing/Screener Pro.png"
                          alt="Screener Pro"
                          fill
                          sizes="(max-width: 1024px) 100vw, 550px"
                          className="object-cover object-left-top"
                        />
                        {/* Subtle soft vignette */}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0c1426]/30 via-transparent to-transparent pointer-events-none" />
                      </div>
                    </div>

                  </div>
                </RevealOnScroll>
              </div>

              {/* Feature 4: Emiten 360° Profile & Executive Dossier */}
              <div className="sticky top-40 sm:top-44 z-40 transition-all duration-300">
                <RevealOnScroll direction="up" delayMs={100}>
                  <div className="relative group min-h-[340px] sm:min-h-[360px] flex flex-col lg:flex-row items-center">
                    
                    {/* Main Card Content (Card Utama - Solid Foreground Layer) */}
                    <div className="relative z-20 w-full lg:w-[360px] xl:w-[390px] rounded-2xl bg-[#0c1426] border border-slate-700/80 p-6 sm:p-7 shadow-[0_20px_50px_rgba(0,0,0,0.9)] space-y-4 shrink-0 hover:border-blue-500/50 transition-colors duration-300">
                      
                      {/* Badge & Icon */}
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/25 flex items-center justify-center text-blue-400 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300 shrink-0">
                          <Building2 className="h-5 w-5" />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold tracking-wider text-blue-400 uppercase block">
                            Deep-Dive Fundamental
                          </span>
                          <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-blue-300 transition-colors">
                            Emiten 360° Profile
                          </h3>
                        </div>
                      </div>

                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                        Buka lembar analisis komprehensif emiten manapun di BEI. Dapatkan data historis valuasi tahunan, Sankey visualisasi laba, hingga ekspor riset siap cetak ke format PDF atau Markdown.
                      </p>

                      {/* CTA Button */}
                      <div className="pt-2">
                        <Link 
                          href="/company/BBCA"
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-xs font-bold text-blue-300 hover:text-white transition-all group/btn"
                        >
                          <span>Lihat Contoh Dossier: BBCA</span>
                          <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-1" />
                        </Link>
                      </div>

                    </div>

                    {/* Compact Elongated Feature Preview (Contoh Fitur - Memanjang & Overlap Dibelakang Card Utama) */}
                    <div className="relative lg:absolute lg:left-[250px] xl:left-[280px] lg:top-1/2 lg:-translate-y-1/2 w-full lg:w-[480px] xl:w-[540px] z-10 mt-4 lg:mt-0">
                      {/* Ambient Accent Glow */}
                      <div className="absolute -inset-4 bg-blue-500/15 blur-3xl -z-10 rounded-2xl opacity-60 group-hover:opacity-100 transition-opacity duration-500" />
                      
                      <div className="relative aspect-[21/10] w-full rounded-2xl overflow-hidden border border-slate-700/70 shadow-[0_20px_50px_rgba(0,0,0,0.95)] bg-[#070c18] transform rotate-[1.5deg] lg:rotate-[2.5deg] group-hover:lg:rotate-[1deg] group-hover:scale-[1.02] group-hover:-translate-y-1 transition-all duration-700 ease-out">
                        <Image
                          src="/images/landing/Emiten 360.png"
                          alt="Emiten 360° Profile & Executive Dossier"
                          fill
                          sizes="(max-width: 1024px) 100vw, 550px"
                          className="object-cover object-left-top"
                        />
                        {/* Subtle soft vignette */}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0c1426]/30 via-transparent to-transparent pointer-events-none" />
                      </div>
                    </div>

                  </div>
                </RevealOnScroll>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* 3. SECTORS API DATA ENGINE (x.ai Inspired Cyber Grid & Traveling Neon Beams) */}
      <section className="py-28 sm:py-36 bg-[#080e1e] px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        
        {/* Cybernetic Geometric Grid Background ("kotak-kotak") */}
        <div className="absolute inset-0 bg-grid-cyber mask-radial-fade opacity-85 pointer-events-none select-none" />

        {/* Ambient Subtle Radial Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[360px] bg-cyan-500/10 blur-[150px] pointer-events-none rounded-full" />

        <div className="max-w-6xl mx-auto text-center relative z-10 space-y-16 sm:space-y-20">
          
          {/* Header */}
          <RevealOnScroll direction="up">
            <div className="space-y-4 max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/80 text-xs font-semibold text-slate-300 shadow-sm backdrop-blur-md">
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
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.15]">
                Ditenagai Ekosistem Sectors Financial API v2
              </h2>
              <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
                Akurasi data pasar modal adalah prioritas mutlak. Seluruh analisis berakar langsung dari endpoint resmi Sectors API dengan throughput deterministik tinggi.
              </p>
            </div>
          </RevealOnScroll>

          {/* x.ai Inspired Cybernetic Metrics Board with Single Traveling Neon */}
          <RevealOnScroll direction="up" delayMs={150}>
            <div className="relative border-t border-slate-800/80 overflow-hidden backdrop-blur-[2px]">
              
              {/* Numbers Row (3 Columns, Center Aligned) */}
              <div className="grid grid-cols-3 divide-x divide-slate-800/80 text-center">
                
                {/* Stat 1: 900+ Emiten BEI */}
                <div className="p-6 sm:p-8 lg:p-10 group">
                  <div className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight font-mono tabular-nums group-hover:text-cyan-300 transition-colors">
                    900+
                  </div>
                </div>

                {/* Stat 2: 100+ Anggota Bursa */}
                <div className="p-6 sm:p-8 lg:p-10 group">
                  <div className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight font-mono tabular-nums group-hover:text-amber-300 transition-colors">
                    100+
                  </div>
                </div>

                {/* Stat 3: <6s Agent Latency */}
                <div className="p-6 sm:p-8 lg:p-10 group">
                  <div className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight font-mono tabular-nums group-hover:text-emerald-300 transition-colors">
                    &lt;6s
                  </div>
                </div>

              </div>

              {/* Prominent Center Horizontal Grid Line with Single Traveling Neon Laser Beam */}
              <div className="relative w-full h-[1px] bg-slate-800/90">
                {/* Single Pristine Neon Beam (Cyan/White) */}
                <div className="neon-beam-primary pointer-events-none" />
              </div>

              {/* Labels Row (3 Columns, Center Aligned) */}
              <div className="grid grid-cols-3 divide-x divide-slate-800/80 text-center">
                
                {/* Label 1 */}
                <div className="p-6 sm:p-8 lg:p-10 space-y-1.5">
                  <div className="text-xs sm:text-sm font-bold text-white tracking-wide">
                    Emiten BEI
                  </div>
                  <p className="text-[11px] sm:text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
                    Cakupan semesta seluruh saham terdaftar di BEI
                  </p>
                </div>

                {/* Label 2 */}
                <div className="p-6 sm:p-8 lg:p-10 space-y-1.5">
                  <div className="text-xs sm:text-sm font-bold text-white tracking-wide">
                    Anggota Bursa
                  </div>
                  <p className="text-[11px] sm:text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
                    Data konsentrasi broker dan kepemilikan KSEI
                  </p>
                </div>

                {/* Label 3 */}
                <div className="p-6 sm:p-8 lg:p-10 space-y-1.5">
                  <div className="text-xs sm:text-sm font-bold text-white tracking-wide">
                    Agent Latency
                  </div>
                  <p className="text-[11px] sm:text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
                    Eksekusi paralel otonom multi-agent super cepat
                  </p>
                </div>

              </div>

              {/* Bottom Border Line */}
              <div className="relative w-full h-[1px] bg-slate-800/80" />

            </div>
          </RevealOnScroll>

        </div>
      </section>

      {/* 4. SMART MONEY & MARKET SURVEILLANCE SUITE */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 w-full bg-[#080e1e] relative">
        <div className="max-w-7xl mx-auto">
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
            <div className="relative rounded-2xl border border-slate-800/80 bg-[#0c1426] p-6 hover:border-cyan-500/40 hover:bg-[#101b33] transition-all duration-300 flex flex-col justify-between group h-full space-y-5 overflow-hidden">
              
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
                <div className="absolute inset-0 bg-gradient-to-bl from-transparent via-[#0c1426]/60 to-[#0c1426]" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0c1426] via-[#0c1426]/50 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#0c1426] via-[#0c1426]/40 to-transparent" />
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
            <div className="relative rounded-2xl border border-slate-800/80 bg-[#0c1426] p-6 hover:border-purple-500/40 hover:bg-[#101b33] transition-all duration-300 flex flex-col justify-between group h-full space-y-5 overflow-hidden">
              
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
                <div className="absolute inset-0 bg-gradient-to-bl from-transparent via-[#0c1426]/60 to-[#0c1426]" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0c1426] via-[#0c1426]/50 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#0c1426] via-[#0c1426]/40 to-transparent" />
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
            <div className="relative rounded-2xl border border-slate-800/80 bg-[#0c1426] p-6 hover:border-rose-500/40 hover:bg-[#101b33] transition-all duration-300 flex flex-col justify-between group h-full space-y-5 overflow-hidden">
              
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
                <div className="absolute inset-0 bg-gradient-to-bl from-transparent via-[#0c1426]/60 to-[#0c1426]" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0c1426] via-[#0c1426]/50 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#0c1426] via-[#0c1426]/40 to-transparent" />
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
          <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/30 via-[#0c152a] to-cyan-950/30 p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-5">
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
        </div>
      </section>

      {/* 5. GRAND BOTTOM BANNER / CTA */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 w-full bg-[#080e1e] relative">
        <div className="max-w-6xl mx-auto">
          <RevealOnScroll direction="up">
          <div className="relative rounded-3xl border border-slate-800/80 bg-gradient-to-b from-[#0c162c] to-[#080e1e] p-8 sm:p-14 text-center overflow-hidden hover:border-emerald-500/30 transition-all shadow-2xl shadow-blue-950/20">
            
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
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-bold text-sm hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-emerald-500/20"
                >
                  <span>Buka AlphaAgent Sekarang</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

          </div>
        </RevealOnScroll>
        </div>
      </section>

      {/* 6. FOOTER */}
      <footer className="w-full border-t border-slate-800/50 bg-[#080e1e] py-12 px-4 sm:px-6 lg:px-8 text-xs text-slate-400">
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
