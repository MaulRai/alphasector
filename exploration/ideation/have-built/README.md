# Indeks Dokumentasi Aplikasi — AlphaSector

Direktori ini memuat dokumentasi komprehensif mengenai seluruh fitur, arsitektur teknis, integrasi sistem, dan keunggulan kompetitif platform **AlphaSector** yang telah dibangun.

---

## 📚 Daftar Dokumen

1. [**00_OVERVIEW.md**](file:///d:/Projects/Web%20Shi/sectors-hackathon/exploration/ideation/have-built/00_OVERVIEW.md) — **Ringkasan Eksekutif & Identitas Produk**
   - Problem statement dan latar belakang pasar modal Indonesia (IDX).
   - Kualifikasi Track 01 (AI Agents & Assistants) Sectors Hackathon 2026.
   - Peta navigasi seluruh rute aplikasi (`/`, `/copilot`, `/battle`, `/screener`, `/company/[symbol]`, `/smart-money`, `/settings`).
   - Ringkasan tech stack (FastAPI, Next.js 15, Gemini 2.5 Flash, SQLite, Sectors REST API v2).

2. [**01_CORE_FEATURES.md**](file:///d:/Projects/Web%20Shi/sectors-hackathon/exploration/ideation/have-built/01_CORE_FEATURES.md) — **Dokumentasi Komprehensif Fitur Utama**
   - **AlphaAgent Workspace (`/copilot`):** Multi-turn chat context, cluster logo emiten dinamis, analisis visual chart teknikal, reasoning trace accordion, dan widget interaktif.
   - **Peer Battle Terminal (`/battle`):** Komparasi head-to-head hingga 4 emiten, kalkulasi valuasi gap, best-in-class badges, dan handshake ke chat room baru.
   - **Trade Ideas & Multi-Factor Screener (`/screener`):** Natural language screener, 1-click trade presets, table emiten, dan floating battle dock.
   - **Emiten 360° Profile & Dossier (`/company/[symbol]`):** Valuasi historis tahunan, rincian omzet segmen bisnis, broker flow tracker, dan exportable dossier.
   - **Smart Money & Institutional Flow Tracker (`/smart-money`):** Top 3 broker concentration, foreign net flow, dan IDX broker leaderboard.
   - **Analyst Settings & BYOK API Key (`/settings`):** Bring Your Own Key Sectors API, live latency tester, dan kuota server demo.

3. [**02_TECHNICAL_ARCHITECTURE.md**](file:///d:/Projects/Web%20Shi/sectors-hackathon/exploration/ideation/have-built/02_TECHNICAL_ARCHITECTURE.md) — **Arsitektur Teknis & Engine Kuantitatif Deterministik**
   - Diagram alur orkestrasi agent (Planner $\rightarrow$ Tool Pipeline $\rightarrow$ Deterministik Quant Engine $\rightarrow$ Grounded Synthesizer).
   - **Piotroski F-Score (Model 9 Kriteria Akuntansi):** Profitabilitas, struktur modal/likuiditas, dan efisiensi operasi.
   - **P/E Historical Standard Deviation Bands:** Formula Mean P/E, standar deviasi ($\sigma$), batas bands $+2\sigma$ hingga $-2\sigma$, dan persentase gap.
   - Pipeline pengenalan grafik teknikal multimodal (Gemini Vision).
   - Skema database asinkron SQLite (users, sessions, messages, credits, keys).

4. [**03_EXTERNAL_INTEGRATIONS.md**](file:///d:/Projects/Web%20Shi/sectors-hackathon/exploration/ideation/have-built/03_EXTERNAL_INTEGRATIONS.md) — **Integrasi Ekosistem Eksternal & Notion Sync**
   - **1-Click Notion Sync:** Alur ekspor Institutional Investment Memo, schema properti database Notion, dan format blok kaya (toggle, callout, table).
   - Integrasi Sectors Financial REST API v2 (endpoint terstruktur vs search, fallback kuota).
   - Kepatuhan regulasi finansial: Larangan eksekusi order otomatis (*No Automated Trade Execution*), penafian investasi resmi, dan isolasi kunci privat pengguna.

5. [**04_COMPETITIVE_ADVANTAGE_AND_ROADMAP.md**](file:///d:/Projects/Web%20Shi/sectors-hackathon/exploration/ideation/have-built/04_COMPETITIVE_ADVANTAGE_AND_ROADMAP.md) — **Keunggulan Kompetitif & Roadmap Masa Depan**
   - Matriks perbandingan AlphaSector vs Chatbot Generik vs Aplikasi Saham Tradisional (Stockbit/RTI).
   - Kepatuhan terhadap aturan penjurian Track 01 (bukan MCP client wrapper generik).
   - Roadmap pengembangan pasca-hackathon (Scheduled Watchlist Briefs, Audio Public Expose Transcription, Portfolio Stress Testing).
