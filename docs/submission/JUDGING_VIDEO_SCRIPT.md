# AlphaSector — Official 3-Minute Judging Walkthrough Script

**Track**: Track 01 — AI Agents & Assistants (Sectors Hackathon 2026)  
**Target Duration**: Exactly 03:00 (180 Detik)  
**Language**: Bahasa Indonesia (Verbatim Indonesian Narration) with English Subtitles  
**Pacing / Cadence**: ~140 Kata/Menit (~420 Kata Total) — Institutional Analyst Tone, Tegas, Presisi, Berenergi  
**Video Resolution**: 1080p60 (1920x1080 @ 60fps) atau 4K60 (3840x2160 @ 60fps), 16:9 Widescreen  
**Audio Target**: Integrated Loudness -14 LUFS (True Peak -1.0 dBTP), 48kHz / 24-bit  
**Live Demo URL**: `http://localhost:3000` (atau deployed URL `https://alphasector.id`)  
**Backend API**: `http://localhost:8000` (FastAPI + Sectors Financial API v2)

---

## 1. Ikhtisar Struktur & Peta Waktu (Timeline Map)

| Segmen | Waktu | Durasi | Fokus & Fitur Utama | Rute UI |
|---|---|---|---|---|
| **Segmen 1** | 0:00 - 0:35 | 35 dtk | **The Baseline Pain, Market Shock & Zero-Friction Entry**<br>Fragmentasi 900+ emiten & PDF tebal, diperparah reshuffle Menkeu Purbaya & minyak $100, perkenalan AlphaSector & 1-Click Demo Login. | `/` (Landing Page)<br>AuthGate Modal |
| **Segmen 2** | 0:35 - 1:15 | 40 dtk | **Multi-Step Agent Reasoning & Dynamic DAG**<br>Autonomous reasoning di `/alpha-agent`, visualisasi `AgentThinkingTrace`, pemanggilan paralel Sectors API, sintesis fundamental. | `/alpha-agent` |
| **Segmen 3** | 1:15 - 1:55 | 40 dtk | **Deterministic Quant & Minerba Deep Intelligence**<br>Peer Battle di `/battle`, Stanford 9-kriteria Piotroski F-Score, P/E Bands, serta Strip Ratio & Cadangan JORC ESDM di `/company/ADRO`. | `/battle`<br>`/company/ADRO` |
| **Segmen 4** | 1:55 - 2:35 | 40 dtk | **Smart Money 2.0 Forensic & 1-Click Notion Sync**<br>Radar 4 pilar di `/smart-money` (Bandarmology, Insider Filings, Kepemilikan Institusi KSEI, Suspensi BEI), ekspor memo Notion. | `/smart-money`<br>Notion Modal |
| **Segmen 5** | 2:35 - 3:05 | 30 dtk | **The Future of Equity Research & Closing**<br>Visi produk, standar etika analitis (Zero Automated Trading) & call-to-action GitHub. | Workspace Showcase<br>Wrap-up |

---

## 2. Naskah Video Berwaktu (Timecoded Script & Visual Storyboard)

---

### SEGMEN 1: The High-Stakes Problem & Zero-Friction Entry (0:00 - 0:35)
* **Durasi**: 35 Detik
* **Tujuan**: Menggabungkan problem fundamental pasar modal Indonesia (900+ emiten BEI, ratusan halaman PDF, riset manual) dengan eskalasi drama makro riil (pergantian Menkeu Purbaya, lonjakan minyak dunia $100/barel, volatilitas IHSG anjlok 2,6% lalu memangkas koreksi), memperkenalkan AlphaSector sebagai jawaban rasional, dan membuka akses instan ke terminal riset terpadu.

#### Detail Aksi Visual (Screen Actions & Clicks):
1. **[0:00 - 0:08] Masalah 1: Banyak Dokumen & Hitungan Valuasi Manual (Information Overload)**: Layar penuh menampilkan 20+ tab browser terbuka: dokumen PDF laporan keuangan bursa (halaman 142 dari 348 Catatan Atas Laporan Keuangan), berdampingan dengan spreadsheet model DCF penuh angka rumit dan error `#REF!`. Kursor bergerak frustrasi bolak-balik antara PDF dan spreadsheet, menggambarkan proses riset manual yang melelahkan dan rawan bias.
2. **[0:08 - 0:17] Masalah 2: Reshuffle Kabinet & Pencopotan Menkeu Purbaya**: Kursor beralih cepat mengklik tab CNBC Indonesia. Layar menampilkan banner merah tebal berkedip: *"BREAKING NEWS: Reshuffle Kabinet: Purbaya Dicopot dari Menkeu, Suahasil Ditunjuk"*. Kursor menyorot judul berita politik dan foto reshuffle menteri yang mendadak memicu ketidakpastian regulasi dan kepanikan di bursa.
3. **[0:17 - 0:26] Masalah 3: Minyak Dunia >$100 & IHSG Anjlok 2,6% (Puncak Kepanikan Pasar)**: Kursor beralih ke tab Bloomberg & RTI Composite. Headline Bloomberg mencolok: *"Crude Oil Surges Past $100/bbl Amid Geopolitical Shocks"*, berdampingan dengan candlestick merah tajam grafik IHSG menukik -2,6% menembus level psikologis ke 6.371 sebelum volume akumulasi asing memborong Big Banks. Kursor menunjuk jurang koreksi indeks dan kepanikan orderbook pasar saham.
4. **[0:26 - 0:35] Solusi: AlphaSector Terminal Reveal & 1-Click Institutional Demo Login**: Dentuman *sub-bass* dan transisi *digital whoosh* cepat seketika memotong layar panik ke Landing Page AlphaSector (`localhost:3000`). Sorot kontras visual yang menenangkan: tema *Deep Obsidian* (`#07090e`) elegan dengan aksen neon emerald/cyan dan badge *Sectors Financial API*. Kursor mengklik tombol navigasi menuju `/alpha-agent`, modal `AuthGate` terbuka, dan kursor langsung menekan tombol hijau bercahaya: **"1-Click Demo Login (Akses Instan)"** (`demo@alphasector.id`). Dalam <500ms, centang hijau muncul dan ruang kerja terminal institusional terbuka seketika tanpa hambatan.

#### On-Screen Graphics & Teks Overlay:
* `[0:02]` Pain Card: **"900+ Saham BEI • Ratusan Halaman PDF • Hitungan Manual Rawan Bias"**
* `[0:09]` Macro Shock 1 Ticker: **"Macro Shock 1: Reshuffle Kabinet • Menkeu Purbaya Dicopot • Ketidakpastian Regulasi"**
* `[0:18]` Macro Shock 2 Ticker: **"Macro Shock 2: Minyak Mentah >$100/Barel • IHSG Swing -2,6% (6.371) • Kepanikan Pasar"**
* `[0:22]` Crisis Question Callout: **"Kepanikan Pasar vs Akumulasi Asing: Bagaimana Mengambil Keputusan Rasional?"**
* `[0:27]` Brand Reveal Card: **AlphaSector Terminal** — *Autonomous Equity Intelligence Powered by Sectors API*
* `[0:31]` Zero-Friction Entry: **1-Click Institutional Demo Login** (`demo@alphasector.id`)
* `[0:34]` Workspace Ready: **Akses Instan ke Terminal `/alpha-agent`**

#### Audio Design:
* BGM:
  - `0:00 - 0:08`: Low-hum ambient synth tegang (frustrasi riset manual banyak dokumen).
  - `0:08 - 0:17`: Tempo meningkat dengan ketukan denyut tegang / sonar saat berita pencopotan Purbaya muncul.
  - `0:17 - 0:26`: Nada disonan dan riser dramatis saat harga minyak $100 dan grafik merah IHSG anjlok ke 6.371.
  - `0:26 - 0:35`: Dentuman *sub-bass impact* dan *digital whoosh* memotong ketegangan, bertransisi seketika ke upbeat modern tech corporate groove (115 BPM) yang jernih dan percaya diri saat AlphaSector muncul, diakhiri *success chime* saat 1-click login berhasil.
* SFX:
  - `[0:02]`: Suara kertas dibolak-balik cepat & ketikan frustrasi.
  - `[0:09]`: Alert "Breaking News Ping" tajam saat tab CNBC Purbaya dibuka.
  - `[0:18]`: Alert alarm pasar bursa saat chart IHSG merah menukik.
  - `[0:26]`: *Crisp digital whoosh* memotong kekacauan layar beralih ke interface AlphaSector.
  - `[0:33]`: *Affirming positive chime* saat 1-click login berhasil.

#### Narasi Suara (Verbatim Indonesian Voiceover):
> *"Menganalisis lebih dari sembilan ratus emiten di BEI adalah pekerjaan melelahkan—terjebak ratusan halaman PDF laporan keuangan dan hitungan valuasi manual yang rawan bias.*
> 
> *Situasi semakin genting ketika badai makro menghantam: reshuffle kabinet mencopot Menkeu Purbaya dan harga minyak dunia menembus 100 dolar per barel—memicu IHSG anjlok dua koma enam persen sebelum asing memborong Big Banks. Di tengah kepanikan pasar, bagaimana mengambil keputusan rasional?*
> 
> *Inilah **AlphaSector**: Terminal riset ekuitas otonom pertama untuk pasar modal Indonesia bertenaga Sectors Financial API—mengubah data mentah dan volatilitas pasar menjadi kejelasan analitis institusional dalam satu ruang kerja terpadu."*

#### English Subtitles:
> *"Analyzing over 900 companies on the Indonesia Stock Exchange is exhausting—trapped in hundreds of dense PDF filings and error-prone manual calculations.*
> 
> *The stakes escalate when macro shocks hit: a sudden cabinet reshuffle ousted Finance Minister Purbaya and global crude broke 100 dollars a barrel, plunging the IDX 2.6% before foreign whales bought the dip. Amid market panic, how can investors make grounded decisions without emotional bias?*
> 
> *Meet **AlphaSector**: the first autonomous equity research terminal purpose-built for the Indonesian market, powered by Sectors Financial API—turning raw market telemetry and extreme volatility into institutional clarity in a single unified workspace."*

---

### SEGMEN 2: Multi-Step Agent Reasoning & Tool Calling di `/alpha-agent` (0:35 - 1:15)
* **Durasi**: 40 Detik
* **Tujuan**: Membuktikan kualifikasi Track 01 dengan memperlihatkan multi-step reasoning, dynamic DAG planning, parallel API fetching, dan sintesis fundamental institusional di route `/alpha-agent`.

#### Detail Aksi Visual (Screen Actions & Clicks):
1. **[0:35 - 0:43] Input Natural Language Prompt**: Kursor berada di `ChatInputBar`. Ketik prompt komparasi:
   `"Bandingkan valuasi dan kesehatan finansial BBRI vs BMRI"` lalu tekan **Enter**.
2. **[0:43 - 0:57] Live Thinking Trace Inspection**: Komponen `LiveThinkingTrace` dan `AgentThinkingTrace` seketika aktif. Arahkan kursor dan sorot tahapan eksekusi otonom yang bergerak dinamis:
   - **Phase 1 (PLANNING)**: Intent diklasifikasikan sebagai `PEER_BATTLE_COMPARISON`, target emiten `BBRI` dan `BMRI`.
   - **Phase 2 (FETCHING)**: Pemanggilan paralel via `asyncio.gather` ke endpoint Sectors API: `GET /company/report/BBRI` (~320ms) dan `GET /company/report/BMRI` (~310ms).
   - **Phase 3 (COMPARING)**: Kalkulasi rasio matematika dan matriks komparatif.
   - **Phase 4 (SYNTHESIZING)**: Inferensi LPU Groq Llama 3.3 70B menyusun sintesis Bahasa Indonesia.
   - Sorot badge ringkasan: `(1,520ms • 2 cr)`.
3. **[0:57 - 1:07] PeerBattleMatrix Presentation**: Scroll ke tabel komparasi berdampingan `PeerBattleMatrix`. Kursor menyorot metrik kunci: P/E, PBV, ROE, Net Profit Margin (NPM), dan lencana best-in-class hijau (`bg-emerald-500/10 text-emerald-400`).
4. **[1:07 - 1:15] Autonomous Synthesis & Research Dossier**: Sorot bagian **Valuation Verdict** dan **Key Findings**. Klik tombol pada panel kanan untuk membuka drawer **Research Dossier Artifact** yang berisi ringkasan riset terstruktur.

#### On-Screen Graphics & Teks Overlay:
* `[0:37]` Prompt Callout: `"Bandingkan valuasi dan kesehatan finansial BBRI vs BMRI"`
* `[0:45]` Architecture Box: **Custom Dynamic DAG Planner** — *Intent Classification & Parallel Sectors API*
* `[0:53]` Telemetry Badge: **Parallel Async Fetch**: `BBRI (320ms)` + `BMRI (310ms)` • Total Latency: `1.52s`
* `[1:01]` Feature Tag: **Peer Battle Matrix & Grounded Institutional Synthesis**

#### Audio Design:
* BGM: Musik berlanjut dengan beat modern teratur yang menonjolkan kecerdasan analitis.
* SFX: Suara ketikan taktil cepat, *soft digital hum* saat DAG reasoning berjalan, dan *double snap click* saat tabel matriks dan drawer dossier terbuka.

#### Narasi Suara (Verbatim Indonesian Voiceover):
> *"Di ruang kerja Alpha Agent, analis cukup bertanya dalam bahasa sehari-hari. Perhatikan Thinking Trace ini: AlphaSector bukanlah sekadar wrapper prompt biasa.*
> 
> *Sistem secara mandiri mengklasifikasikan intensi, merancang Directed Acyclic Graph, dan mengeksekusi Sectors API secara paralel dalam hitungan ratusan milidetik.*
> 
> *Hasilnya adalah matriks komparasi presisi antar-kompetitor—lengkap dengan perbandingan laba, margin, dan efisiensi modal—serta sintesis naratif institusional yang objektif dan tersimpan rapi sebagai Research Dossier interaktif."*

#### English Subtitles:
> *"In the Alpha Agent workspace, analysts simply ask in plain language. Notice this Thinking Trace: AlphaSector is not a superficial prompt wrapper.*
> 
> *Our orchestrator autonomously classifies intent, builds a Directed Acyclic Graph (DAG), and dispatches parallel asynchronous calls to Sectors API in hundreds of milliseconds.*
> 
> *The output is a rigorous side-by-side comparative matrix across competing companies—covering multiples, margins, and capital efficiency—paired with an institutional synthesis stored as an interactive Research Dossier."*

---

### SEGMEN 3: Deterministic Quant Engine & Minerba Deep Intelligence (1:15 - 1:55)
* **Durasi**: 40 Detik
* **Tujuan**: Membuktikan keunggulan kuantitatif AlphaSector melalui perhitungan deterministik matematika murni (Piotroski & P/E Bands) serta memperlihatkan fitur baru **Minerba Deep Intelligence Suite** (data resmi Ditjen Minerba ESDM) di Company 360°.

#### Detail Aksi Visual (Screen Actions & Clicks):
1. **[1:15 - 1:23] Navigasi ke `/battle`**: Klik menu **"Peer Battle"** di Navbar atas. Klik tombol preset: **"The Big 4 Banks"** (`BBCA`, `BBRI`, `BMRI`, `BBNI`), lalu klik tombol gradien cyan **"Jalankan Peer Battle"**. Tabel 4 emiten terisi instan dalam ~450ms.
2. **[1:23 - 1:33] Drill Down ke `/company/ADRO`**: Cari atau buka emiten komoditas `ADRO` untuk membuka halaman Company 360° Profile. Scroll ke kartu **Deterministic Quant Panel**:
   - Tunjukkan kartu **Piotroski F-Score (Score: 7/9 PRIMA)** dengan 9 kriteria akuntansi.
   - Tunjukkan kartu **P/E Historical Standard Deviation Band** dengan deviasi diskon terhadap rata-rata historis.
3. **[1:33 - 1:55] Minerba Deep Intelligence Suite (ESDM Data)**: Scroll ke bawah menuju komponen kartu **`MiningOperationalCard`**:
   - Sorot **Strip Ratio Meter**: Nilai `3.9x` bertag hijau **Low-Cost Producer** (biaya kupas tanah sangat hemat).
   - Sorot **Cadangan JORC/KCMI**: Total `996.2 Mt` (Proven & Probable Reserves vs Resources).
   - Sorot **Reserve Life Index**: Kalkulasi otomatis sisa umur aset tambang (**~15.4 Tahun**).
   - Sorot spesifikasi kualitas batubara resmi: Kalori (4.843 kkal/kg), Total Moisture, dan Rendah Sulfur (<1%).

#### On-Screen Graphics & Teks Overlay:
* `[1:17]` Preset Tag: **Preset Battle**: *The Big 4 Banks (4-Way Parallel Sectors Ingestion)*
* `[1:25]` Formula Card: **Piotroski F-Score Engine (0-9)**: *Profitability • Leverage • Efficiency*
* `[1:35]` ESDM Badge: **Minerba Deep Intelligence Suite** — *Official Ditjen Minerba ESDM Data*
* `[1:43]` Metric Callouts: **Strip Ratio 3.9x** (Low-Cost Leader) • **Cadangan JORC 996.2 Mt** • **Reserve Life ~15.4 Tahun**

#### Audio Design:
* BGM: Ritme perkusi meningkat stabil, memberikan sensasi presisi matematika dan bobot riset industri.
* SFX: *Whoosh* cepat saat ganti halaman, *deep bass hit* saat kartu Piotroski disorot, dan *chime* lembut saat metrik Minerba ESDM muncul.

#### Narasi Suara (Verbatim Indonesian Voiceover):
> *"Di arena Peer Battle dan Company Profile, keunggulan kami bertumpu pada **Deterministic Quant Engine**—menghitung skor kesehatan Piotroski dan pita valuasi historis secara matematis tanpa campur tangan halusinasi LLM.*
> 
> *Khusus sektor komoditas dan energi yang menyumbang sepertiga likuiditas IHSG, AlphaSector menghadirkan **Minerba Deep Intelligence Suite**: mengintegrasikan data resmi Ditjen Minerba Kementerian ESDM untuk membedah rasio kupas Strip Ratio, Cadangan JORC, hingga estimasi sisa umur operasional tambang secara instan."*

#### English Subtitles:
> *"In Peer Battle and Company Profiles, our edge lies in our **Deterministic Quant Engine**—computing Piotroski health scores and historical valuation bands mathematically without LLM hallucinations.*
> 
> *For commodity and energy sectors powering one-third of the IDX, AlphaSector unveils the **Minerba Deep Intelligence Suite**: integrating official Ministry of Energy and Mineral Resources (ESDM) data to evaluate Strip Ratios, JORC reserves, and mine life expectancy in seconds."*

---

### SEGMEN 4: Smart Money 2.0 Forensic Radar & 1-Click Notion Sync (1:55 - 2:35)
* **Durasi**: 40 Detik
* **Tujuan**: Menampilkan fitur mutakhir **Smart Money 2.0** dengan 4 pilar forensik institusional serta ekspor instan memo investasi ke Notion Workspace.

#### Detail Aksi Visual (Screen Actions & Clicks):
1. **[1:55 - 2:03] Smart Money 2.0 (`/smart-money`)**: Buka `/smart-money`. Tunjukkan **Global 900+ Emiten Selector** (pilih `TLKM`). Sorot tab bar 4 pilar forensik terpadu.
2. **[2:03 - 2:17] Jelajah 4 Pilar Forensik**:
   - **Pilar 1 (Bandarmology)**: Klik tombol analisis, tunjukkan Top 5 Broker Akumulasi vs Distribusi dan Net Foreign Flow.
   - **Pilar 2 (Insider Filings)**: Klik tab *Insider Filings*, tunjukkan deteksi **`INSIDER BUY / ACCUMULATION`** Direksi/Komisaris lengkap dengan harga beli dan tautan **PDF Surat Resmi BEI**.
   - **Pilar 3 (Kepemilikan Institusi)**: Klik tab *Kepemilikan Institusi*, tunjukkan dekomposisi data KSEI: Dana Pensiun (Dapen BPJS-TK/Taspen), Reksadana, Asuransi, Korporasi vs Ritel, beserta bar rasio Lokal vs Asing.
   - **Pilar 4 (Radar Suspensi)**: Klik sekilas tab *Radar Suspensi BEI* yang mendeteksi gembok bursa dan Unusual Market Activity.
3. **[2:17 - 2:35] 1-Click Institutional Notion Sync**: Kembali ke Company Profile atau klik tombol **"Sync to Notion"** berlogo `N`. Modal `NotionExportModal` terbuka. Klik **"Sync Memo to Notion"**. Dalam 1 detik, indikator sukses muncul. Buka tab Notion: tampilkan memo investasi Wall-Street lengkap berstruktur eksekutif, tabel valuasi, dan disclaimer kepatuhan.

#### On-Screen Graphics & Teks Overlay:
* `[1:57]` Radar Card: **Smart Money 2.0 Forensic Radar** — *4 Integrated Institutional Pillars*
* `[2:07]` Compliance Badge: **Insider Filings & KSEI Ownership** • *Official BEI Disclosure PDFs*
* `[2:19]` Integration Box: **1-Click Institutional Notion Sync** — *Wall-Street Style Investment Memo*

#### Audio Design:
* BGM: Melodi dinamis mengalir penuh percaya diri.
* SFX: *Radar sweep sound* saat tab Smart Money berpindah, *crisp click* saat tombol Notion ditekan, dan *success chime* saat memo Notion terbuka.

#### Narasi Suara (Verbatim Indonesian Voiceover):
> *"Fitur **Smart Money 2.0** melacak jejak dana institusi melalui Forensic Radar 4 Pilar: mulai dari Bandarmology dan aliran dana asing, deteksi akumulasi orang dalam atau Insider Filings bersurat resmi BEI, dekomposisi kepemilikan Dana Pensiun dan Reksadana riil KSEI, hingga radar suspensi bursa.*
> 
> *Seluruh riset mendalam ini dapat diekspor seketika dalam satu klik ke Notion Workspace sebagai memorandum investasi komprehensif berstandar Wall Street—siap pakai untuk komite investasi."*

#### English Subtitles:
> *"Our **Smart Money 2.0** tracks institutional footprints through a 4-pillar Forensic Radar: Bandarmology broker flows, insider filings with official IDX disclosure PDFs, real KSEI institutional ownership breakdown (pension funds and mutual funds), and exchange suspension alerts.*
> 
> *All research can be exported with a single click directly into Notion Workspaces as a Wall Street-caliber investment memorandum—fully ready for investment committees."*

---

### SEGMEN 5: The Future of Indonesian Equity Research & Closing (2:35 - 3:05)
* **Durasi**: 30 Detik
* **Tujuan**: Menutup video dengan impresi kuat ala peluncuran produk FinTech modern: merangkul seluruh alur kerja terintegrasi (Alpha Agent, Battle, Minerba, Smart Money, Notion), menegaskan komitmen Responsible FinTech (tanpa automated trading), dan memberikan call-to-action yang meyakinkan.

#### Detail Aksi Visual (Screen Actions & Clicks):
1. **[2:35 - 2:45] Unified Workspace Showcase**: Kamera melakukan *smooth zoom-out* sinematik memperlihatkan ekosistem AlphaSector yang saling terhubung: dari penalaran Alpha Agent, arena Peer Battle, kartu Minerba ESDM, radar Smart Money 2.0, hingga memo Notion.
2. **[2:45 - 2:53] Responsible FinTech & Disclaimers**: Sorot sekilas kartu etika analitis di footer: menegaskan komitmen pada *pure decision-support intelligence* tanpa eksekusi transaksi otomatis (Rule 12).
3. **[2:53 - 3:05] Hero Closing & Call-To-Action**: Transisi ke layar penutup Deep Obsidian. Logo AlphaSector berkilau di tengah layar, diikuti teks tagline *"Smarter Research, Sharper Decisions"*, tautan repositori GitHub publik (`github.com/MaulRai/sectors-hackathon`), dan badge *Sectors Hackathon 2026*.

#### On-Screen Graphics & Teks Overlay:
* `[2:37]` Headline Card: **Autonomous Equity Intelligence**: *Multi-Step Reasoning • Deterministic Quant Engine • Minerba Suite*
* `[2:47]` Assurance Badge: **Responsible FinTech**: *Pure Decision Support • Zero Automated Trading*
* `[2:55]` Closing Hero: **AlphaSector** — *Institutional Research for Everyone* | `github.com/MaulRai/sectors-hackathon`

#### Audio Design:
* BGM: Musik bertransisi ke riser megah bersemangat, mencapai klimaks pada detik 2:55, lalu diakhiri denting synth jernih dan reverb tail yang bersih.
* SFX: *Sub-bass boom* halus saat logo AlphaSector muncul, diikuti *sparkle chime* saat link GitHub ditampilkan.

#### Narasi Suara (Verbatim Indonesian Voiceover):
> *"AlphaSector mentransformasi riset ekuitas Indonesia dari hitungan hari menjadi hitungan detik. Menggabungkan penalaran agen otonom, komputasi kuantitatif deterministik, dan kecerdasan forensik yang bertanggung jawab tanpa automated trading—kami mendemokratisasi riset institusi untuk semua.*
> 
> *AlphaSector: Riset cerdas, keputusan terukur. Jelajahi kodenya sekarang di GitHub!"*

#### English Subtitles:
> *"AlphaSector turns days of manual Indonesian equity research into seconds of clarity. By combining autonomous agent reasoning, deterministic quantitative math, and responsible market forensic intelligence without automated trading—we democratize institutional research for everyone.*
> 
> *AlphaSector: Smarter research, sharper decisions. Explore the code today on GitHub!"*

---

## 3. Panduan Produksi Video (Production & Recording Guidelines)

Untuk menjamin skor maksimal pada kriteria **Video Demo & Storytelling (30%)** dan **Real-World Usability (40%)**, ikuti panduan teknis perekaman dan pascaproduksi berikut:

### 3.1 Pengaturan Tangkapan Layar (Screen Recording Setup)
* **Software**: Gunakan **Screen Studio** (macOS) atau **OBS Studio** (Windows/macOS) dengan profil rekaman *Lossless High Quality*.
* **Resolusi & Frame Rate**: 1080p (1920x1080) pada **60 fps** stabil. Jangan gunakan 30 fps karena transisi UI dan pergerakan kursor akan tampak patah-patah.
* **Canvas Browser**:
  - Buka browser Chrome / Brave pada profil bersih (tanpa ekstensi yang mengganggu, tanpa bookmark bar).
  - Skala zoom browser diatur pada **100%** atau **110%** agar teks rasio finansial dan tabel terbaca tajam dan kontras tinggi.
  - Sembunyikan taskbar OS (Windows Auto-hide Taskbar) agar area visual terfokus 100% pada AlphaSector.
* **Cursor Smoothing**: Aktifkan fitur *cursor smoothing* dan *mouse click rings* (warna cyan/emerald lembut dengan diameter ~24px) agar dewan juri dapat mengikuti setiap klik dengan mudah.

### 3.2 Rekayasa Audio & Panduan Mikrofon (Audio Engineering)
* **Mikrofon**: Gunakan mikrofon kondensor atau dinamis cardioid (misal: Shure SM7B, Rode NT-USB, atau Audio-Technica AT2020) dengan jarak bibir 10–15 cm menggunakan pop filter.
* **Format Perekaman**: 48.000 Hz (48 kHz), 24-bit PCM mono/stereo.
* **Noise Floor**: Pastikan kebisingan latar belakang (noise floor) berada di bawah **-55 dB**. Gunakan audio noise suppression (misal: Krisp, Elgato Wavelink, atau ReaFir di Reaper/Premiere).
* **Audio Processing Chain (DAW / Premiere / DaVinci)**:
  1. *High-Pass Filter*: Cut frekuensi di bawah 80 Hz untuk menghilangkan suara getaran meja atau hembusan napas.
  2. *Subtle De-Esser*: Meredam desisan konsonan 's' dan 't' pada rentang 5–8 kHz.
  3. *Parametric EQ*: Tambahkan sedikit *presence boost* (+1.5 dB pada 3.5 kHz) untuk kejelasan artikulasi Bahasa Indonesia.
  4. *Compression*: Rasio 3:1 dengan threshold -18 dB untuk menjaga volume narasi tetap konsisten dan terdengar berwibawa.
  5. *Loudness Normalization*: Target terintegrasi **-14 LUFS** (standar YouTube) dengan True Peak maksimal **-1.0 dBTP**.
* **Musik Latar (BGM)**:
  - Gunakan trek synthwave korporat modern / ambient lofi finance (tempo ~110-120 BPM).
  - Volume BGM di-ducking pada **-24 dB** hingga **-28 dB** saat suara narator aktif, dan naik ke **-16 dB** pada jeda transisi layar.

### 3.3 Gaya Penyampaian & Artikulasi (Pacing & Delivery Tone)
* **Persona**: Analis Ekuitas Senior / FinTech Product Lead yang percaya diri, profesional, berwibawa, dan antusias.
* **Kecepatan Bicara**: ~140 kata per menit. Jangan terburu-buru, artikulasikan setiap istilah teknis (`Piotroski`, `Sectors API`, `Valuation Band`, `Directed Acyclic Graph`) secara tegas dan fasih.
* **Bebas Filler Words**: Rekam per segmen secara terpisah (modular recording) dan lakukan *punch-in editing* untuk memotong seluruh kata pengisi (*"umm"*, *"ahh"*, *"jadi"*, nafas berlebihan).

### 3.4 Panduan Teks Terjemahan & Subtitle (Captioning Protocol)
* Siapkan file subtitle **`.srt`** ganda:
  - `judging_video_id.srt` (Subtitle Bahasa Indonesia untuk kenyamanan evaluasi).
  - `judging_video_en.srt` (Subtitle Bahasa Inggris untuk juri internasional).
* **Tipografi Subtitle**: Font sans-serif bersih (Inter, Roboto, atau Neue Haas Grotesk), ukuran terbaca jelas pada perangkat seluler, berlatar belakang semi-transparan hitam (`rgba(0,0,0,0.7)`).
* Unggah video ke YouTube dengan opsi **Unlisted** atau **Public**, dan sertakan link video pada form submisi portal hackathon.

### 3.5 Daftar Periksa Pra-Perekaman (Pre-Recording Checklist)
- [ ] Backend FastAPI berjalan aktif pada port `8000` (`http://localhost:8000/docs` dapat diakses).
- [ ] Frontend Next.js berjalan aktif pada port `3000` (`http://localhost:3000`).
- [ ] Database lokal atau cloud terhubung dengan cache hangat (query `BBRI`, `BMRI`, `ASII`, `TLKM` sudah pernah dijalankan sekali untuk respon instan).
- [ ] Akun demo `demo@alphasector.id` terverifikasi memiliki sisa kuota credits yang cukup.
- [ ] Tab browser bersih dari bookmark dan riwayat yang tidak relevan.
- [ ] Resolusi monitor disetel pada 1920x1080 (100% scaling).
