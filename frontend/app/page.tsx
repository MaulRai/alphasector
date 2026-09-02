'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Navbar } from '@/components/Navbar';
import { 
  Sparkles, ArrowRight, Swords, Users, Search, 
  Building2, ShieldCheck, TrendingUp, Zap, Database, 
  BarChart3, CheckCircle2, ChevronRight, PieChart, Star, Layers, Play
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-black overflow-x-hidden">
      
      {/* Navigation */}
      <Navbar />

      {/* 1. HERO SECTION */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full text-center">
        
        {/* Subtle Background Glow Accent */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto space-y-6">
          
          {/* Track Tag */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 text-xs font-medium text-slate-300">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400"></span>
            <span>Sectors Hackathon 2026 • Track 01 AI Agents</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
            Autonomous Equity Copilot untuk <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              Pasar Modal Indonesia
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed font-normal">
            Bukan sekadar chatbot pembungkus. AlphaSector mengeksekusi multi-step reasoning, 
            kalkulasi deterministik valuasi gap, dan pelacakan aliran dana institusi secara otonom.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
            <Link
              href="/copilot"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-bold text-sm hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-emerald-500/15"
            >
              <span>Buka Copilot Workspace</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="/battle"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-200 font-semibold text-sm transition-all"
            >
              <span>Coba Peer Battle</span>
            </Link>
          </div>

        </div>

        {/* Hero Visual Hub (Central Node Showcase inspired by reference) */}
        <div className="relative mt-16 max-w-5xl mx-auto">
          <div className="relative rounded-3xl border border-slate-800 bg-[#0b0f19]/80 p-4 sm:p-8 backdrop-blur-xl shadow-2xl overflow-hidden">
            
            {/* Background Banner Image */}
            <div className="relative h-64 sm:h-96 w-full rounded-2xl overflow-hidden border border-slate-800/80">
              <Image
                src="/images/landing/city-with-idx-building.jpg"
                alt="IDX Financial District"
                fill
                className="object-cover object-center opacity-40 hover:scale-105 transition-transform duration-700"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0b0f19] via-[#0b0f19]/40 to-transparent" />
              
              {/* Floating Core Overlay Nodes */}
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                <div className="relative flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl overflow-hidden border border-emerald-500/40 shadow-2xl glow-emerald mb-4">
                  <Image
                    src="/images/alphasector-icon.png"
                    alt="AlphaSector Core"
                    fill
                    className="object-cover"
                  />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  Autonomous Multi-Step Pipeline
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 max-w-md mt-1">
                  Menghubungkan 70+ endpoint Sectors Financial API ke dalam mesin penalaran deterministik Groq 120b.
                </p>
              </div>

              {/* Floating Node Badges */}
              <div className="hidden md:flex absolute top-6 left-6 items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs font-semibold text-emerald-400 backdrop-blur-md">
                <Database className="h-3.5 w-3.5" /> 900+ Emiten IDX
              </div>

              <div className="hidden md:flex absolute top-6 right-6 items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs font-semibold text-cyan-400 backdrop-blur-md">
                <BarChart3 className="h-3.5 w-3.5" /> Deterministik P/E & PBV
              </div>

              <div className="hidden md:flex absolute bottom-6 left-6 items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs font-semibold text-amber-400 backdrop-blur-md">
                <Users className="h-3.5 w-3.5" /> Smart Money Bandar Flow
              </div>

              <div className="hidden md:flex absolute bottom-6 right-6 items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs font-semibold text-blue-400 backdrop-blur-md">
                <Sparkles className="h-3.5 w-3.5" /> Fact-Grounded Synthesis
              </div>
            </div>

          </div>
        </div>

      </section>

      {/* 2. CORE CAPABILITIES (Rich Visual Grid) */}
      <section className="py-20 border-t border-slate-800/80 bg-[#090d16] px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold text-emerald-400 tracking-wider uppercase">
              Fitur Riset Unggulan
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Dirancang Khusus untuk Analisis Pasar Modal Indonesia
            </h2>
            <p className="text-sm sm:text-base text-slate-400">
              Kombinasi data finansial resmi berlisensi dan AI Agent berkecepatan tinggi tanpa halusinasi angka.
            </p>
          </div>

          {/* Capabilities Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Feature 1: Peer Battle */}
            <div className="rounded-2xl border border-slate-800 bg-[#0d121e] p-6 hover:border-slate-700 transition-all flex flex-col justify-between group">
              <div>
                <div className="relative h-44 w-full rounded-xl overflow-hidden mb-5 border border-slate-800">
                  <Image
                    src="/images/landing/spider-chart.jpg"
                    alt="Peer Battle Matrix"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0d121e] via-transparent to-transparent" />
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <Swords className="h-5 w-5 text-cyan-400" />
                  <h3 className="text-lg font-bold text-white">Peer Battle & Multiples Gap</h3>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Bandingkan 2–4 emiten dalam satu subsektor secara head-to-head. Hitung selisih valuasi P/E, PBV, ROE, dan identifikasi saham yang terdiskon.
                </p>
              </div>
              <Link 
                href="/battle"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-400 hover:text-cyan-300 mt-5 pt-3 border-t border-slate-800"
              >
                <span>Buka Peer Battle Terminal</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Feature 2: Smart Money Flow */}
            <div className="rounded-2xl border border-slate-800 bg-[#0d121e] p-6 hover:border-slate-700 transition-all flex flex-col justify-between group">
              <div>
                <div className="relative h-44 w-full rounded-xl overflow-hidden mb-5 border border-slate-800">
                  <Image
                    src="/images/landing/money-charts.jpeg"
                    alt="Smart Money Flow"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0d121e] via-transparent to-transparent" />
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-5 w-5 text-amber-400" />
                  <h3 className="text-lg font-bold text-white">Smart Money & Broker Flow</h3>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Pantau konsentrasi transaksi broker institusi 14 hari terakhir dan arus foreign net inflow untuk mendeteksi akumulasi bandar sebelum harga reli.
                </p>
              </div>
              <Link 
                href="/smart-money"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 mt-5 pt-3 border-t border-slate-800"
              >
                <span>Lacak Aliran Dana Smart Money</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Feature 3: Screener Pro */}
            <div className="rounded-2xl border border-slate-800 bg-[#0d121e] p-6 hover:border-slate-700 transition-all flex flex-col justify-between group">
              <div>
                <div className="relative h-44 w-full rounded-xl overflow-hidden mb-5 border border-slate-800">
                  <Image
                    src="/images/landing/trading-chart-intense.jpg"
                    alt="Screener Pro"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0d121e] via-transparent to-transparent" />
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <Search className="h-5 w-5 text-emerald-400" />
                  <h3 className="text-lg font-bold text-white">Screener Pro & Trade Ideas</h3>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Saring semesta 900+ emiten BEI dengan bahasa natural (NLP) atau filter terstruktur. Dilengkapi radar 1-klik untuk ESG Leaders dan Revenue Titans.
                </p>
              </div>
              <Link 
                href="/screener"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300 mt-5 pt-3 border-t border-slate-800"
              >
                <span>Mulai Screening Emiten</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

          </div>

        </div>
      </section>

      {/* 3. EMITEN 360 & DOSSIER SHOWCASE */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          <div className="space-y-6">
            <span className="text-xs font-bold text-cyan-400 tracking-wider uppercase">
              Deep-Dive Analysis
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Emiten 360° Profile & Executive Research Dossier
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              Buka lembar analisis komprehensif emiten manapun di BEI. Dapatkan data historis valuasi tahunan, rincian segmen bisnis, hingga ekspor laporan riset siap cetak ke format PDF atau Markdown.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3">
                <div className="p-1 rounded bg-emerald-500/10 text-emerald-400 mt-0.5">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Sankey Breakdown Pendapatan</h4>
                  <p className="text-xs text-slate-400">Pahami dari mana emiten menghasilkan laba terbesar secara visual.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-1 rounded bg-cyan-500/10 text-cyan-400 mt-0.5">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Kalkulasi Multiples Otomatis</h4>
                  <p className="text-xs text-slate-400">P/E, PBV, P/S, PCF, EV/EBITDA, dan rasio neraca DER tanpa perhitungan manual.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-1 rounded bg-amber-500/10 text-amber-400 mt-0.5">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">One-Click PDF Export</h4>
                  <p className="text-xs text-slate-400">Ekspor brief riset berstandar institusi lengkap dengan disclaimer kepatuhan.</p>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <Link
                href="/company/BBCA"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-all border border-slate-700"
              >
                <span>Lihat Contoh Dossier: BBCA</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* Visual Showcase Graphic */}
          <div className="relative rounded-2xl border border-slate-800 bg-[#0d121e] p-3 overflow-hidden shadow-2xl">
            <div className="relative h-80 sm:h-96 w-full rounded-xl overflow-hidden">
              <Image
                src="/images/landing/digital-dossier.jpeg"
                alt="Digital Dossier Preview"
                fill
                className="object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#07090e] via-transparent to-transparent opacity-80" />
            </div>
          </div>

        </div>
      </section>

      {/* 4. SECTORS API DATA ENGINE (Integration Section inspired by reference) */}
      <section className="py-20 border-t border-slate-800/80 bg-[#080c14] px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center space-y-12">
          
          <div className="space-y-3">
            <span className="text-xs font-bold text-emerald-400 tracking-wider uppercase">
              Infrastruktur Data Resmi
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Ditenagai Ekosistem Sectors Financial API v2
            </h2>
            <p className="text-sm text-slate-400 max-w-xl mx-auto">
              Akurasi data pasar modal adalah prioritas mutlak. Seluruh analisis berakar langsung dari endpoint resmi Sectors API.
            </p>
          </div>

          {/* Integration Arc Nodes */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-2">
              <div className="text-2xl font-black text-emerald-400 font-mono">70+</div>
              <div className="text-xs font-bold text-white">REST Endpoints</div>
              <p className="text-[11px] text-slate-500">Valuasi, laporan, dividen, dan pergerakan harga</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-2">
              <div className="text-2xl font-black text-cyan-400 font-mono">900+</div>
              <div className="text-xs font-bold text-white">Emiten BEI</div>
              <p className="text-[11px] text-slate-500">Cakupan semesta seluruh saham terdaftar di Indonesia</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-2">
              <div className="text-2xl font-black text-amber-400 font-mono">100+</div>
              <div className="text-xs font-bold text-white">Anggota Bursa</div>
              <p className="text-[11px] text-slate-500">Data konsentrasi broker dan pergerakan asing</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-2">
              <div className="text-2xl font-black text-blue-400 font-mono">&lt;6s</div>
              <div className="text-xs font-bold text-white">Agent Latency</div>
              <p className="text-[11px] text-slate-500">Parallel execution bertenaga LPU Groq 120B</p>
            </div>
          </div>

        </div>
      </section>

      {/* 5. TESTIMONIALS / INSTITUTIONAL USER STORIES */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Dipercaya untuk Efisiensi Riset Pasar Modal
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Membantu investor dan analis memangkas waktu pengumpulan data dari hitungan jam menjadi hitungan detik.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-slate-800 bg-[#0d121e] p-6 space-y-4">
            <div className="flex items-center gap-1 text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-amber-400" />
              ))}
            </div>
            <p className="text-xs text-slate-300 leading-relaxed italic">
              &quot;Peer Battle Terminal sangat membantu membandingkan valuasi bank big caps dengan rata-rata subsektor tanpa perlu membuka laporan keuangan satu per satu.&quot;
            </p>
            <div className="pt-2 border-t border-slate-800">
              <div className="text-xs font-bold text-white">Dimas Satria</div>
              <div className="text-[11px] text-slate-500">Equity Analyst, Jakarta</div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-[#0d121e] p-6 space-y-4">
            <div className="flex items-center gap-1 text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-amber-400" />
              ))}
            </div>
            <p className="text-xs text-slate-300 leading-relaxed italic">
              &quot;Pelacak Smart Money-nya akurat. Saya bisa melihat konsentrasi broker pembeli dan arus foreign flow dalam tampilan yang sangat bersih dan mudah dipahami.&quot;
            </p>
            <div className="pt-2 border-t border-slate-800">
              <div className="text-xs font-bold text-white">Hendra Wijaya</div>
              <div className="text-[11px] text-slate-500">Retail Value Investor</div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-[#0d121e] p-6 space-y-4">
            <div className="flex items-center gap-1 text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-amber-400" />
              ))}
            </div>
            <p className="text-xs text-slate-300 leading-relaxed italic">
              &quot;Transparency trace langkah berpikir agent-nya luar biasa untuk Track 01. Kita tahu persis API apa yang dipanggil dan bagaimana angka valuasi dihitung.&quot;
            </p>
            <div className="pt-2 border-t border-slate-800">
              <div className="text-xs font-bold text-white">Budi Pratama</div>
              <div className="text-[11px] text-slate-500">Quantitative Researcher</div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. GRAND BOTTOM BANNER / CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
        <div className="relative rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-900/90 to-[#07090e] p-8 sm:p-14 text-center overflow-hidden shadow-2xl">
          
          {/* Oversized Subtle Background Brand Logo Mark */}
          <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
            <span className="text-9xl sm:text-[180px] font-black tracking-tighter text-white">
              ALPHA
            </span>
          </div>

          <div className="relative z-10 max-w-2xl mx-auto space-y-5">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Mulai Riset Saham Cerdas Hari Ini
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Jalankan riset emiten pertama kamu dengan AI Agent otonom AlphaSector. Dapatkan dossier finansial terstruktur dalam hitungan detik.
            </p>
            <div className="pt-3">
              <Link
                href="/copilot"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-bold text-sm hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-emerald-500/20"
              >
                <span>Buka Copilot Sekarang</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* 7. FOOTER */}
      <footer className="w-full border-t border-slate-800/80 bg-[#05070b] py-12 px-4 sm:px-6 lg:px-8 text-xs text-slate-500">
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
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Autonomous Equity Research Copilot for IDX. Developed for Sectors Hackathon 2026.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-slate-300 text-xs uppercase mb-3">Fitur Aplikasi</h4>
            <ul className="space-y-2 text-[11px] text-slate-400">
              <li><Link href="/copilot" className="hover:text-emerald-400 transition-colors">AI Research Copilot</Link></li>
              <li><Link href="/battle" className="hover:text-emerald-400 transition-colors">Peer Battle Terminal</Link></li>
              <li><Link href="/smart-money" className="hover:text-emerald-400 transition-colors">Smart Money Tracker</Link></li>
              <li><Link href="/screener" className="hover:text-emerald-400 transition-colors">Screener Pro (NLP & SQL)</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-300 text-xs uppercase mb-3">Teknologi & Model</h4>
            <ul className="space-y-2 text-[11px] text-slate-400">
              <li>Sectors Financial API v2</li>
              <li>Groq LPU Engine</li>
              <li>OpenAI 120B Model</li>
              <li>Next.js 16 & FastAPI</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-300 text-xs uppercase mb-3">Kepatuhan</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              ⚠️ Seluruh informasi disajikan semata-mata untuk kebutuhan edukasi dan analisis riset finansial. Bukan merupakan rekomendasi atau ajakan jual/beli efek.
            </p>
          </div>

        </div>

        <div className="max-w-7xl mx-auto pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-600">
          <span>© 2026 AlphaSector. All rights reserved.</span>
          <span>Sectors Hackathon 2026 • Track 01 AI Agents & Assistants</span>
        </div>
      </footer>

    </div>
  );
}
