'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Navbar } from '@/components/Navbar';
import { RevealOnScroll } from '@/components/RevealOnScroll';
import { 
  Sparkles, ArrowRight, Swords, Users, Search, 
  Building2, ShieldCheck, TrendingUp, Zap, Database, 
  BarChart3, CheckCircle2, ChevronRight, PieChart, Star, Layers, Play
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col overflow-x-hidden">
      
      {/* Navigation */}
      <Navbar />

      {/* 1. HERO SECTION WITH FADING CITY IDX BACKGROUND */}
      <section className="relative pt-20 pb-28 md:pt-32 md:pb-40 px-4 sm:px-6 lg:px-8 w-full text-center overflow-hidden">
        
        {/* Full Hero Background Image: City with IDX Building */}
        <div className="absolute inset-0 w-full h-full pointer-events-none select-none z-0">
          <Image
            src="/images/landing/city-with-idx-building.jpg"
            alt="IDX Jakarta City Background"
            fill
            className="object-cover object-top opacity-30 scale-105 transition-transform duration-1000 ease-out"
            priority
          />
          {/* Vertical Fading Overlay: Transparent at top -> Dark in middle -> Fully #07090e at bottom */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#07090e]/40 via-[#07090e]/80 to-[#07090e]" />
          
          {/* Ambient Radial Lighting */}
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[280px] bg-slate-800/20 blur-[120px] rounded-full" />
        </div>

        {/* Hero Content with Staggered Fade-in Animations */}
        <div className="relative z-10 max-w-4xl mx-auto space-y-6 pt-4">
          
          {/* Main Headline */}
          <h1 
            className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.15] animate-fade-in-up"
            style={{ animationDelay: '100ms' }}
          >
            <span className="block">Autonomous Agentic AI</span>
            <span className="block mt-1 sm:mt-2 text-emerald-400">
              Pasar Modal Indonesia
            </span>
          </h1>

          {/* Subtitle */}
          <p 
            className="text-base sm:text-xl text-slate-200 max-w-xl mx-auto leading-relaxed font-normal animate-fade-in-up"
            style={{ animationDelay: '300ms' }}
          >
            Bukan sekadar chatbot pembungkus. AlphaSector mengeksekusi multi-step reasoning, 
            kalkulasi deterministik valuasi gap, dan pelacakan aliran dana institusi secara otonom.
          </p>

          {/* CTA Buttons */}
          <div 
            className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4 animate-fade-in-up"
            style={{ animationDelay: '400ms' }}
          >
            <Link
              href="/alpha-agent"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-bold text-sm hover:brightness-110 active:scale-95 transition-all"
            >
              <span>Buka AlphaAgent Workspace</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>

            <Link
              href="/battle"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/60 hover:border-slate-600 text-slate-200 font-semibold text-sm transition-all backdrop-blur-md"
            >
              <span>Coba Peer Battle</span>
            </Link>
          </div>

          {/* Quick Metrics Ticker Line */}
          <div 
            className="pt-10 flex flex-wrap items-center justify-center gap-6 sm:gap-12 text-xs text-slate-400 font-medium animate-fade-in-up"
            style={{ animationDelay: '500ms' }}
          >
            <div className="flex items-center gap-2 hover:text-emerald-300 transition-colors">
              <Database className="h-4 w-4 text-emerald-400" />
              <span>900+ Emiten BEI</span>
            </div>
            <div className="flex items-center gap-2 hover:text-cyan-300 transition-colors">
              <BarChart3 className="h-4 w-4 text-cyan-400" />
              <span>Multiples Valuasi & Peer Gap</span>
            </div>
            <div className="flex items-center gap-2 hover:text-amber-300 transition-colors">
              <Users className="h-4 w-4 text-amber-400" />
              <span>Smart Money & Foreign Flow</span>
            </div>
            <div className="flex items-center gap-2 hover:text-teal-300 transition-colors">
              <Sparkles className="h-4 w-4 text-teal-400" />
              <span>Autonomous AI Synthesis</span>
            </div>
          </div>

        </div>

      </section>

      {/* 2. CORE CAPABILITIES (Rich Visual Grid) */}
      <section className="py-20 border-t border-slate-800/80 bg-[#090d16] px-4 sm:px-6 lg:px-8">
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
                      Smart Money & Broker Flow
                    </h3>
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Pantau konsentrasi transaksi broker institusi 14 hari terakhir dan arus foreign net inflow untuk mendeteksi akumulasi bandar sebelum harga reli.
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
                <p className="text-xs text-slate-400">Parallel execution bertenaga LPU Groq 120B</p>
              </div>
            </RevealOnScroll>
          </div>

        </div>
      </section>

      {/* 5. TESTIMONIALS / INSTITUTIONAL USER STORIES */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <RevealOnScroll direction="up">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Dipercaya untuk Efisiensi Riset Pasar Modal
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Membantu investor dan analis memangkas waktu pengumpulan data dari hitungan jam menjadi hitungan detik.
            </p>
          </div>
        </RevealOnScroll>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <RevealOnScroll direction="up" delayMs={0}>
            <div className="rounded-2xl border border-slate-800 bg-[#0d121e] p-6 space-y-4 hover:border-slate-700 transition-all h-full">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-sm text-slate-200 leading-relaxed italic">
                &quot;Peer Battle Terminal sangat membantu membandingkan valuasi bank big caps dengan rata-rata subsektor tanpa perlu membuka laporan keuangan satu per satu.&quot;
              </p>
              <div className="pt-2 border-t border-slate-800">
                <div className="text-xs font-bold text-white">Dimas Satria</div>
                <div className="text-xs text-slate-400">Equity Analyst, Jakarta</div>
              </div>
            </div>
          </RevealOnScroll>

          <RevealOnScroll direction="up" delayMs={150}>
            <div className="rounded-2xl border border-slate-800 bg-[#0d121e] p-6 space-y-4 hover:border-slate-700 transition-all h-full">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-sm text-slate-200 leading-relaxed italic">
                &quot;Pelacak Smart Money-nya akurat. Saya bisa melihat konsentrasi broker pembeli dan arus foreign flow dalam tampilan yang sangat bersih dan mudah dipahami.&quot;
              </p>
              <div className="pt-2 border-t border-slate-800">
                <div className="text-xs font-bold text-white">Hendra Wijaya</div>
                <div className="text-xs text-slate-400">Retail Value Investor</div>
              </div>
            </div>
          </RevealOnScroll>

          <RevealOnScroll direction="up" delayMs={300}>
            <div className="rounded-2xl border border-slate-800 bg-[#0d121e] p-6 space-y-4 hover:border-slate-700 transition-all h-full">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-sm text-slate-200 leading-relaxed italic">
                &quot;Transparency trace langkah berpikir agent-nya luar biasa untuk Track 01. Kita tahu persis API apa yang dipanggil dan bagaimana angka valuasi dihitung.&quot;
              </p>
              <div className="pt-2 border-t border-slate-800">
                <div className="text-xs font-bold text-white">Budi Pratama</div>
                <div className="text-xs text-slate-400">Quantitative Researcher</div>
              </div>
            </div>
          </RevealOnScroll>
        </div>
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
              <li><Link href="/smart-money" className="hover:text-emerald-400 transition-colors">Smart Money Tracker</Link></li>
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
              <li>Groq LPU Inference</li>
              <li>Next.js 16 & FastAPI</li>
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
