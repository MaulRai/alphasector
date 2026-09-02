'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '@/components/Navbar';
import { 
  Sparkles, ArrowRight, Swords, Users, Search, 
  Building2, ShieldCheck, TrendingUp, Zap, Database, 
  BarChart3, CheckCircle2, ChevronRight, ChevronLeft, PieChart, Star, Layers, Play,
  Cpu, DollarSign, Activity, FileText
} from 'lucide-react';

export default function LandingPage() {
  // State for Interactive Persona Tabs (Inspired by Frame 05.0s)
  const [activePersona, setActivePersona] = useState<'analyst' | 'retail' | 'fund'>('analyst');

  // State for Curved Integration Arc (Inspired by Frame 08.5s)
  const [activeIntegrationIndex, setActiveIntegrationIndex] = useState(2);

  // State for Testimonials Carousel (Inspired by Frame 13.0s)
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const personaContent = {
    analyst: {
      badge: 'Untuk Equity Analyst & Sekuritas',
      title: 'Validasi Multiples & Valuasi Gap Tanpa Human Error',
      description: 'Dapatkan komparasi P/E, PBV, ROE, dan EV/EBITDA terhadap rata-rata historis subsektor secara instan. Ekspor dossier riset terstruktur siap presentasi.',
      metrics: ['Deterministic Peer Matrix', 'Historical Valuation 5 Tahun', 'PDF/Markdown Brief Export'],
      image: '/images/landing/spider-chart.jpg',
      tagColor: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10',
      actionUrl: '/battle',
      actionText: 'Buka Peer Battle Matrix'
    },
    retail: {
      badge: 'Untuk Retail Value & Swing Trader',
      title: 'Deteksi Akumulasi Bandar & Foreign Flow Sebelum Reli',
      description: 'Lacak konsentrasi 3 broker teratas dan pergerakan aliran dana asing 14 hari terakhir. Dapatkan sinyal Strong Accumulation atau Distribution yang jelas.',
      metrics: ['Top Net Buyers vs Sellers', 'Buyer Concentration Meter', 'Foreign Inflow Pulse'],
      image: '/images/landing/money-charts.jpeg',
      tagColor: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
      actionUrl: '/smart-money',
      actionText: 'Lacak Smart Money Flow'
    },
    fund: {
      badge: 'Untuk Portfolio Manager & Asset Management',
      title: 'Saring 900+ Saham BEI dengan Natural Language & Radar',
      description: 'Gunakan kueri bahasa alami untuk mencari emiten potensial (misal: "perusahaan batu bara dividen > 8% dan PER < 6") atau manfaatkan radar ESG & Revenue Titans.',
      metrics: ['Natural Language Screener', '1-Click Trade Ideas Radar', 'Subsector Universe Sieve'],
      image: '/images/landing/trading-chart-intense.jpg',
      tagColor: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
      actionUrl: '/screener',
      actionText: 'Eksplorasi Screener Pro'
    }
  };

  const integrations = [
    {
      id: 'valuation',
      name: 'Valuation Multiples',
      subtitle: 'PE, PBV, PS, PCF vs Sector Average',
      icon: BarChart3,
      color: 'from-cyan-500/20 to-blue-500/20 text-cyan-400 border-cyan-500/40',
      endpoint: '/v2/company/report/{symbol}/',
      details: 'Menghitung diskon atau premi valuasi historis terhadap rata-rata peers secara matematis.'
    },
    {
      id: 'smart-money',
      name: 'Smart Money & Bandar',
      subtitle: '100+ IDX Broker Member Registry',
      icon: Users,
      color: 'from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/40',
      endpoint: '/v2/broker-summary/{symbol}/top/',
      details: 'Agregasi volume transaksi 14 hari terakhir untuk mengukur konsentrasi pembeli institusi.'
    },
    {
      id: 'core-copilot',
      name: 'Sectors API v2 Core',
      subtitle: 'Official IDX Financial Ecosystem',
      icon: Database,
      color: 'from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/40',
      endpoint: 'https://api.sectors.app/v2',
      details: 'Infrastruktur 70+ REST endpoints resmi mencakup seluruh 900+ emiten terdaftar di Indonesia.'
    },
    {
      id: 'segments',
      name: 'Revenue Segments',
      subtitle: 'Sankey Business Line Breakdown',
      icon: PieChart,
      color: 'from-purple-500/20 to-pink-500/20 text-purple-400 border-purple-500/40',
      endpoint: '/v2/company/report/{symbol}/segments/',
      details: 'Memetakan sumber pendapatan dan kontribusi margin per lini usaha emiten secara rinci.'
    },
    {
      id: 'groq',
      name: 'Groq OpenAI 120B',
      subtitle: 'Ultra-Fast LPU Synthesis Engine',
      icon: Cpu,
      color: 'from-teal-500/20 to-emerald-500/20 text-teal-300 border-teal-500/40',
      endpoint: 'OpenAI 120B Model (LPU Engine)',
      details: 'Menyintesis narasi riset eksekutif berbahasa Indonesia dengan latensi sub-6 detik tanpa halusinasi.'
    }
  ];

  const testimonials = [
    {
      quote: 'Peer Battle Terminal di AlphaSector memangkas waktu valuasi komparatif bank big caps dari 2 jam menjadi 5 detik. Sangat presisi tanpa rekayasa angka.',
      author: 'Dimas Satria, CFA',
      role: 'Senior Equity Research Analyst',
      firm: 'Jakarta Financial Advisory',
      rating: 5
    },
    {
      quote: 'Visualisasi konsentrasi Smart Money dan foreign inflow-nya sangat transparan. Kita langsung tahu apakah suatu saham sedang diakumulasi atau didistribusikan.',
      author: 'Hendra Wijaya',
      role: 'Private Portfolio Investor',
      firm: 'Surabaya Capital Club',
      rating: 5
    },
    {
      quote: 'Fitur Reasoning Trace langkah berpikir agent-nya adalah standar tertinggi untuk Track 01. Kita bisa mengaudit setiap query dan endpoint yang dipanggil AI.',
      author: 'Budi Pratama',
      role: 'Quantitative Strategy Lead',
      firm: 'Apex Quantitative Partners',
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-black overflow-x-hidden">
      
      {/* Navigation */}
      <Navbar />

      {/* ========================================================================= */}
      {/* 1. HERO SECTION (Choreographed Stagger with Fading City IDX Background)    */}
      {/* ========================================================================= */}
      <section className="relative pt-20 pb-28 md:pt-32 md:pb-44 px-4 sm:px-6 lg:px-8 w-full text-center overflow-hidden">
        
        {/* Full Hero Background Image with Smooth Fading Overlay */}
        <div className="absolute inset-0 w-full h-full pointer-events-none select-none z-0">
          <Image
            src="/images/landing/city-with-idx-building.jpg"
            alt="IDX Jakarta City Background"
            fill
            className="object-cover object-top opacity-30 scale-105"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#07090e]/40 via-[#07090e]/80 to-[#07090e]" />
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[380px] bg-emerald-500/15 blur-[150px] rounded-full" />
        </div>

        {/* Hero Stagger Motion Container */}
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.15 }
            }
          }}
          className="relative z-10 max-w-4xl mx-auto space-y-6"
        >
          
          {/* Animated Badge Tag */}
          <motion.div 
            variants={{
              hidden: { opacity: 0, y: -20 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
            }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-slate-800/90 text-xs font-medium text-slate-300 backdrop-blur-md shadow-xl"
          >
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Sectors Hackathon 2026 • Track 01 AI Agents</span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1 
            variants={{
              hidden: { opacity: 0, y: 25 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } }
            }}
            className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.12]"
          >
            Autonomous Equity Copilot untuk <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              Pasar Modal Indonesia
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p 
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
            }}
            className="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal"
          >
            Bukan sekadar chatbot pembungkus. AlphaSector mengeksekusi multi-step reasoning, 
            kalkulasi deterministik valuasi gap, dan pelacakan aliran dana institusi secara otonom.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div 
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
            }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4"
          >
            <Link
              href="/copilot"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-bold text-sm hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40"
            >
              <span>Buka Copilot Workspace</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="/battle"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/60 hover:border-slate-600 text-slate-200 font-semibold text-sm transition-all backdrop-blur-md hover:scale-[1.02]"
            >
              <span>Coba Peer Battle</span>
            </Link>
          </motion.div>

          {/* Quick Metrics Ticker Line with Subtle Float */}
          <motion.div 
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { duration: 0.8, delay: 0.4 } }
            }}
            className="pt-10 flex flex-wrap items-center justify-center gap-6 sm:gap-12 text-xs text-slate-400 font-medium animate-float-slow"
          >
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-emerald-400" />
              <span>900+ Emiten BEI</span>
            </div>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-cyan-400" />
              <span>Multiples Valuasi & Peer Gap</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-amber-400" />
              <span>Smart Money & Foreign Flow</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-teal-400" />
              <span>Groq OpenAI 120b Engine</span>
            </div>
          </motion.div>

        </motion.div>

      </section>

      {/* ========================================================================= */}
      {/* 2. INTERACTIVE SOLUTIONS TABS (Inspired by Frame 05.0s of Reference Video)  */}
      {/* ========================================================================= */}
      <section className="py-24 border-t border-slate-800/80 bg-[#090d16] px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto">
          
          <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
            <span className="text-xs font-bold text-emerald-400 tracking-wider uppercase">
              Solusi Terintegrasi
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Dirancang untuk Setiap Profil Pelaku Pasar
            </h2>
            <p className="text-sm sm:text-base text-slate-400">
              Pilih peran analisis kamu untuk melihat bagaimana AlphaSector mempercepat alur kerja riset.
            </p>

            {/* Interactive Tab Switchers with Spring Slider */}
            <div className="flex items-center justify-center gap-2 pt-6">
              <div className="p-1 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-wrap gap-1 backdrop-blur-md">
                {(['analyst', 'retail', 'fund'] as const).map((personaKey) => {
                  const isActive = activePersona === personaKey;
                  const titles = {
                    analyst: 'Equity Analyst',
                    retail: 'Retail Trader',
                    fund: 'Portfolio Manager'
                  };
                  return (
                    <button
                      key={personaKey}
                      onClick={() => setActivePersona(personaKey)}
                      className={`relative px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        isActive ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="activePersonaPill"
                          className="absolute inset-0 rounded-xl bg-emerald-500/20 border border-emerald-500/40 shadow-md"
                          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        />
                      )}
                      <span className="relative z-10">{titles[personaKey]}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Dynamic Tab Content with Smooth Slide/Fade Transition */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activePersona}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center max-w-6xl mx-auto rounded-3xl border border-slate-800 bg-[#0d121e] p-6 sm:p-10 shadow-2xl"
            >
              {/* Left Column: Descriptions & Value Props */}
              <div className="space-y-6">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${personaContent[activePersona].tagColor}`}>
                  {personaContent[activePersona].badge}
                </span>
                
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
                  {personaContent[activePersona].title}
                </h3>
                
                <p className="text-sm text-slate-300 leading-relaxed">
                  {personaContent[activePersona].description}
                </p>

                <div className="space-y-2.5 pt-2">
                  {personaContent[activePersona].metrics.map((m, idx) => (
                    <div key={idx} className="flex items-center gap-2.5 text-xs text-slate-200 font-medium">
                      <div className="p-1 rounded-full bg-emerald-500/10 text-emerald-400">
                        <CheckCircle2 className="h-4 w-4" />
                      </div>
                      <span>{m}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-4">
                  <Link
                    href={personaContent[activePersona].actionUrl}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-bold text-xs hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-emerald-500/20"
                  >
                    <span>{personaContent[activePersona].actionText}</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>

              {/* Right Column: High-Res Interactive Graphic Showcase */}
              <div className="relative rounded-2xl overflow-hidden border border-slate-700/80 shadow-2xl group">
                <div className="relative h-72 sm:h-96 w-full">
                  <Image
                    src={personaContent[activePersona].image}
                    alt={personaContent[activePersona].title}
                    fill
                    className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0d121e]/80 via-transparent to-transparent" />
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. CURVED INTEGRATION ARC (Inspired by Frame 08.5s of Reference Video)     */}
      {/* ========================================================================= */}
      <section className="py-24 border-t border-slate-800/80 bg-[#07090e] px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        
        <div className="max-w-6xl mx-auto text-center space-y-12">
          
          <div className="space-y-3">
            <span className="text-xs font-bold text-emerald-400 tracking-wider uppercase">
              Ekosistem Data & Model
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Terintegrasi dengan 70+ Endpoint Sectors API
            </h2>
            <p className="text-sm text-slate-400 max-w-xl mx-auto">
              Klik salah satu node data di bawah untuk melihat arsitektur ekstraksi informasi finansial real-time.
            </p>
          </div>

          {/* Fanning Arc Cards Layout (Curved Perspective) */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 max-w-4xl mx-auto pt-4">
            {integrations.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = activeIntegrationIndex === idx;
              
              // Angle rotations for curved arc visual: -16, -8, 0, 8, 16
              const angles = [-12, -6, 0, 6, 12];
              const angle = angles[idx] || 0;

              return (
                <motion.button
                  key={item.id}
                  onClick={() => setActiveIntegrationIndex(idx)}
                  whileHover={{ scale: 1.08, y: -6 }}
                  whileTap={{ scale: 0.95 }}
                  style={{ transform: `rotate(${angle}deg)` }}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col items-center justify-center gap-2.5 w-36 sm:w-44 ${
                    isSelected
                      ? 'bg-slate-800 border-emerald-400 shadow-xl shadow-emerald-500/20 ring-2 ring-emerald-500/30'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 text-slate-400'
                  }`}
                >
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${item.color} border`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="text-xs font-bold text-white text-center truncate max-w-full">
                    {item.name}
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Dynamic Details Box for Selected Integration */}
          <motion.div
            key={activeIntegrationIndex}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="max-w-2xl mx-auto rounded-2xl border border-slate-800 bg-[#0d121e]/90 p-6 glass-panel text-left space-y-3"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h4 className="text-sm font-bold text-white">
                  {integrations[activeIntegrationIndex].name}
                </h4>
                <p className="text-xs text-slate-400">
                  {integrations[activeIntegrationIndex].subtitle}
                </p>
              </div>
              <span className="font-mono text-[11px] px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-emerald-400">
                {integrations[activeIntegrationIndex].endpoint}
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {integrations[activeIntegrationIndex].details}
            </p>
          </motion.div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. INTERACTIVE TESTIMONIAL CAROUSEL (Inspired by Frame 13.0s)              */}
      {/* ========================================================================= */}
      <section className="py-24 border-t border-slate-800/80 bg-[#090d16] px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-10">
          
          <div className="space-y-2">
            <span className="text-xs font-bold text-amber-400 tracking-wider uppercase">
              Validasi Pengguna
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Dipercaya oleh Komunitas Riset Pasar Modal
            </h2>
          </div>

          {/* Carousel Slide Card */}
          <div className="relative rounded-3xl border border-slate-800 bg-[#0d121e] p-8 sm:p-12 shadow-2xl text-center space-y-6 overflow-hidden">
            
            <AnimatePresence mode="wait">
              <motion.div
                key={currentTestimonial}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* 5-Star Rating */}
                <div className="flex items-center justify-center gap-1 text-amber-400">
                  {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-amber-400" />
                  ))}
                </div>

                {/* Quote Text */}
                <p className="text-base sm:text-xl text-slate-200 leading-relaxed italic max-w-2xl mx-auto font-normal">
                  &quot;{testimonials[currentTestimonial].quote}&quot;
                </p>

                {/* Author Info */}
                <div>
                  <div className="text-sm font-bold text-white">
                    {testimonials[currentTestimonial].author}
                  </div>
                  <div className="text-xs text-slate-400">
                    {testimonials[currentTestimonial].role} • {testimonials[currentTestimonial].firm}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Carousel Navigation Buttons */}
            <div className="flex items-center justify-center gap-4 pt-4 border-t border-slate-800">
              <button
                onClick={() => setCurrentTestimonial(prev => (prev === 0 ? testimonials.length - 1 : prev - 1))}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-all active:scale-90"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-1.5">
                {testimonials.map((_, i) => (
                  <span
                    key={i}
                    onClick={() => setCurrentTestimonial(i)}
                    className={`h-2 rounded-full cursor-pointer transition-all ${
                      currentTestimonial === i ? 'w-6 bg-emerald-400' : 'w-2 bg-slate-700'
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={() => setCurrentTestimonial(prev => (prev === testimonials.length - 1 ? 0 : prev + 1))}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-all active:scale-90"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. GRAND BOTTOM BANNER / CTA                                              */}
      {/* ========================================================================= */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
        <motion.div 
          whileHover={{ scale: 1.01 }}
          transition={{ duration: 0.4 }}
          className="relative rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-900/90 via-[#0d121e] to-[#07090e] p-8 sm:p-16 text-center overflow-hidden shadow-2xl"
        >
          {/* Watermark Brand Text */}
          <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none select-none">
            <span className="text-9xl sm:text-[200px] font-black tracking-tighter text-white">
              ALPHA
            </span>
          </div>

          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Mulai Riset Saham Cerdas Sekarang
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Jalankan riset emiten pertama kamu dengan AI Copilot otonom AlphaSector. Dapatkan dossier finansial terstruktur dalam hitungan detik.
            </p>
            <div className="pt-2">
              <Link
                href="/copilot"
                className="inline-flex items-center gap-2.5 px-9 py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-extrabold text-sm hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-emerald-500/25"
              >
                <span>Buka Copilot Workspace</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ========================================================================= */}
      {/* 6. FOOTER                                                                 */}
      {/* ========================================================================= */}
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
