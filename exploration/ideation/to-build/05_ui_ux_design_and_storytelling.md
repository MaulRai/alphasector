# 🎨 UI/UX Design System & Hackathon Video Storytelling Guide

Dokumen ini memuat panduan desain visual berkelas tinggi (*WOW Factor*) dan skenario video demo untuk memenangkan penilaian juri:
* **Real-world Usability (40%)**
* **Video Demo & Storytelling (30%)**

---

## 🌟 1. Design Aesthetics & Visual Identity

### 🎨 Color Palette & Typography
* **Background:** Deep obsidian dark mode (`#0B0F19`, `#111827`) dengan aksen glassmorphism (`backdrop-blur-md`, `border-slate-800/80`).
* **Primary Accent:** Electric Emerald (`#10B981`) & Neon Cyan (`#06B6D4`) untuk sinyal bullish/pertumbuhan.
* **Secondary Accent:** Solar Amber (`#F59E0B`) untuk metrik valuasi/warning dan Crimson (`#EF4444`) untuk risiko/distribusi.
* **Typography:** `Inter` / `Outfit` dari Google Fonts untuk tampilan finansial yang bersih, tajam, dan modern.

### 🖥️ Key UI Components
1. **Command Palette (⌘K / Quick Search):**
   * Input bar melayang di bagian atas dengan saran prompt instan (*"Bandingkan BBCA vs BBRI"*, *"Screen emiten batubara dengan dividen > 10%"*, *"Cek foreign flow TLKM"*).
2. **Interactive Agent Thought Process (Accordion Live Steps):**
   * Menampilkan langkah eksekusi agent secara *real-time* (dengan ikon berputar saat fetch data dan centang hijau saat selesai).
3. **Multi-Ticker Comparison Radar Matrix:**
   * Kartu interaktif dengan highlight warna untuk emiten terbaik di setiap kategori (P/E terendah, ROE tertinggi, Dividen terbesar).
4. **Sankey Revenue Flow Diagram:**
   * Visualisasi interaktif aliran arus pendapatan emiten dari berbagai lini bisnis.

---

## 🎬 2. Skenario Video Demo (3-Minute Judging Walkthrough)

### ⏱️ Menit 0:00 – 0:30 | Hook & Problem Statement
* **Visual:** Cuplikan investor membuka puluhan tab browser (RTI, PDF Laporan Keuangan BEI 200 halaman, Excel).
* **Voiceover / Narasi:**
  > *"Melakukan riset fundamental saham Indonesia seringkali melelahkan. Investor ritel harus membuka puluhan tab, membaca laporan PDF ratusan halaman, atau menebak-nebak aliran dana asing. Memperkenalkan **SektorIQ** — Autonomous Equity Research Copilot untuk Pasar Modal Indonesia."*

### ⏱️ Menit 0:30 – 1:30 | Core Demo: Multi-Step Agent in Action
* **Aksi di Layar:**
  * User mengetik prompt di Command Palette: *"Bandingkan bank BUMN: BBRI vs BMRI vs BBNI dari segi valuasi, profitabilitas, dan pergerakan broker institusi."*
  * Layar menampilkan **Agent Thinking Trace** yang sedang aktif merencanakan, memanggil Sectors API v2 secara paralel, mengalkulasi deviasi valuasi, dan merangkum hasil.
* **Voiceover / Narasi:**
  > *"Perhatikan bagaimana SektorIQ bekerja. Bukan sekadar chatbot biasa, SektorIQ memiliki multi-step orchestrator sendiri. Pertama, Planner memetakan intent dan memanggil endpoint Sectors REST API untuk ketiga emiten. Kedua, Comparator Engine menghitung gap valuasi dan akumulasi broker. Ketiga, Synthesizer merangkum insight dalam Bahasa Indonesia yang tajam."*

### ⏱️ Menit 1:30 – 2:15 | Deep Dive Fitur Khusus (Smart Money & Sankey)
* **Aksi di Layar:**
  * Menunjukkan tab *Smart Money & Foreign Flow Tracker* (grafik net foreign inflow vs harga).
  * Menunjukkan diagram Sankey sumber pendapatan.
* **Voiceover / Narasi:**
  > *"SektorIQ juga mengintegrasikan data aliran dana broker institusi dan diagram Sankey pendapatan untuk melihat dari mana laba perusahaan sebenarnya berasal."*

### ⏱️ Menit 2:15 – 3:00 | Real-World Impact & Closing
* **Aksi di Layar:**
  * Menunjukkan tombol **"Export Research Dossier"** (PDF ringkas) lengkap dengan Disclaimer Keuangan.
  * Tampilan arsitektur GitHub repository dan kode custom orchestrator.
* **Voiceover / Narasi:**
  > *"Dengan SektorIQ, riset yang sebelumnya memakan waktu berjam-jam kini selesai dalam hitungan detik dengan data resmi dan terpercaya dari Sectors API. SektorIQ: Mengubah data pasar modal Indonesia menjadi keunggulan investasi Anda."*

---

## ⚡ 3. Skenario Video Teaser (1-Minute Social Media Teaser)

* **0–10s:** Judul mencolok *"Riset Saham IDX dalam 5 Detik dengan AI Agent Otonom"*.
* **10–40s:** Fast-paced screen recording mengetik prompt, agent step reasoning berjalan cepat, visual kartu komparasi dan Sankey diagram muncul dengan transisi animasi halus.
* **40–60s:** Call-to-action ke Hackathon Sectors 2026, tag `@sectorsapp`, dan logo tim.
