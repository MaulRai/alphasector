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
| **Segmen 1** | 0:00 - 0:30 | 30 dtk | **The Problem & Zero-Friction Entry**<br>Fragmentasi 900+ emiten BEI, data PDF tebal, perkenalan AlphaSector & 1-Click Demo Login. | `/` (Landing Page)<br>AuthGate Modal |
| **Segmen 2** | 0:30 - 1:10 | 40 dtk | **Multi-Step Agent Reasoning & Dynamic DAG**<br>Autonomous reasoning di `/alpha-agent`, visualisasi `AgentThinkingTrace`, pemanggilan paralel Sectors API, sintesis fundamental. | `/alpha-agent` |
| **Segmen 3** | 1:10 - 1:50 | 40 dtk | **Deterministic Quant & Minerba Deep Intelligence**<br>Peer Battle di `/battle`, Stanford 9-kriteria Piotroski F-Score, P/E Bands, serta Strip Ratio & Cadangan JORC ESDM di `/company/ADRO`. | `/battle`<br>`/company/ADRO` |
| **Segmen 4** | 1:50 - 2:30 | 40 dtk | **Smart Money 2.0 Forensic & 1-Click Notion Sync**<br>Radar 4 pilar di `/smart-money` (Bandarmology, Insider Filings, Kepemilikan Institusi KSEI, Suspensi BEI), ekspor memo Notion. | `/smart-money`<br>Notion Modal |
| **Segmen 5** | 2:30 - 3:00 | 30 dtk | **The Future of Equity Research & Closing**<br>Visi produk, standar etika analitis (Zero Automated Trading) & call-to-action GitHub. | Workspace Showcase<br>Wrap-up |

---

## 2. Naskah Video Berwaktu (Timecoded Script & Visual Storyboard)

---

### SEGMEN 1: The High-Stakes Problem & Zero-Friction Entry (0:00 - 0:30)
* **Durasi**: 30 Detik
* **Tujuan**: Membuka dengan problem nyata di pasar modal Indonesia (900+ emiten BEI, PDF tebal, data terfragmentasi), memperkenalkan AlphaSector, dan membuka akses instan ke terminal riset terpadu.

#### Detail Aksi Visual (Screen Actions & Clicks):
1. **[0:00 - 0:06] B-Roll / Layar Monitor**: Tampilkan layar dengan belasan tab browser terbuka berisi PDF laporan keuangan BEI yang rumit, spreadsheet penuh angka, dan grafik terpisah. Kursor bergerak cepat menggambarkan frustrasi analisis manual.
2. **[0:06 - 0:14] Transisi Cepat**: Transisi *smooth zoom-in* langsung ke browser yang membuka Landing Page AlphaSector (`localhost:3000`). Sorot banner header berlatar *Deep Obsidian* (`#07090e`) dengan aksen neon emerald/cyan. Kursor melakukan *hover* halus pada tagline hero: *"Autonomous Equity Research Agent for Indonesian Capital Markets"*.
3. **[0:14 - 0:22] Jelajah Singkat**: Scroll lembut ke bawah memperlihatkan 5 pilar utama (Alpha Agent, Peer Battle, Screener Pro, Smart Money 2.0, Minerba Suite, dan Notion Sync).
4. **[0:22 - 0:30] AuthGate & 1-Click Login**: Klik tombol navigasi menuju `/alpha-agent`. Modal `AuthGate` muncul elegan. Kursor langsung mengklik tombol hijau bercahaya: **"1-Click Demo Login (Akses Instan)"** (`demo@alphasector.id`). Dalam tempo kurang dari 1 detik, indikator login sukses dan workspace terbuka mulus.

#### On-Screen Graphics & Teks Overlay:
* `[0:02]` Text Card: **"900+ Saham BEI • Ratusan Halaman PDF • Jam-Jaman Riset Manual"**
* `[0:05]` Persona Overlay: **Built for**: *Investor Ritel & Analis Riset Ekuitas Indonesia*
* `[0:08]` Brand Card: **AlphaSector Terminal** — *Track 01: AI Agents & Assistants*
* `[0:24]` Badge Highlight: **Instant Terminal Access** — *Unified Institutional Workspace*

#### Audio Design:
* BGM: Low-hum ambient synth misterius di awal, berubah menjadi upbeat tech corporate groove bertempo 115 BPM saat AlphaSector muncul.
* SFX: Suara lembaran kertas/typing cepat di awal, diikuti *digital whoosh* renyah saat transisi ke AlphaSector, dan *positive chime* saat 1-click login berhasil.

#### Narasi Suara (Verbatim Indonesian Voiceover):
> *"Menganalisis lebih dari sembilan ratus emiten di Bursa Efek Indonesia adalah pekerjaan yang melelahkan. Analis dan investor ritel terjebak ratusan halaman PDF laporan keuangan yang terfragmentasi dan perhitungan valuasi manual yang rawan bias.*
> 
> *Inilah **AlphaSector**: Terminal riset ekuitas otonom pertama untuk pasar modal Indonesia bertenaga Sectors Financial API. Dengan akses instan satu klik, ruang kerja analitis berstandar institusi siap digunakan seketika."*

#### English Subtitles:
> *"Analyzing over 900 companies on the Indonesia Stock Exchange is exhausting. Analysts and retail investors are trapped in hundreds of fragmented PDF filings and error-prone manual calculations.*
> 
> *Meet **AlphaSector**: the first autonomous equity research terminal purpose-built for the Indonesian market, powered by Sectors Financial API. With instant one-click access, an institutional-grade research workspace is ready in seconds."*

---

### SEGMEN 2: Multi-Step Agent Reasoning & Tool Calling di `/alpha-agent` (0:30 - 1:10)
* **Durasi**: 40 Detik
* **Tujuan**: Membuktikan kualifikasi Track 01 dengan memperlihatkan multi-step reasoning, dynamic DAG planning, parallel API fetching, dan sintesis fundamental institusional di route `/alpha-agent`.

#### Detail Aksi Visual (Screen Actions & Clicks):
1. **[0:30 - 0:38] Input Natural Language Prompt**: Kursor berada di `ChatInputBar`. Ketik prompt komparasi:
   `"Bandingkan valuasi dan kesehatan finansial BBRI vs BMRI"` lalu tekan **Enter**.
2. **[0:38 - 0:52] Live Thinking Trace Inspection**: Komponen `LiveThinkingTrace` dan `AgentThinkingTrace` seketika aktif. Arahkan kursor dan sorot tahapan eksekusi otonom yang bergerak dinamis:
   - **Phase 1 (PLANNING)**: Intent diklasifikasikan sebagai `PEER_BATTLE_COMPARISON`, target emiten `BBRI` dan `BMRI`.
   - **Phase 2 (FETCHING)**: Pemanggilan paralel via `asyncio.gather` ke endpoint Sectors API: `GET /company/report/BBRI` (~320ms) dan `GET /company/report/BMRI` (~310ms).
   - **Phase 3 (COMPARING)**: Kalkulasi rasio matematika dan matriks komparatif.
   - **Phase 4 (SYNTHESIZING)**: Inferensi LPU Groq Llama 3.3 70B menyusun sintesis Bahasa Indonesia.
   - Sorot badge ringkasan: `(1,520ms • 2 cr)`.
3. **[0:52 - 1:02] PeerBattleMatrix Presentation**: Scroll ke tabel komparasi berdampingan `PeerBattleMatrix`. Kursor menyorot metrik kunci: P/E, PBV, ROE, Net Profit Margin (NPM), dan lencana best-in-class hijau (`bg-emerald-500/10 text-emerald-400`).
4. **[1:02 - 1:10] Autonomous Synthesis & Research Dossier**: Sorot bagian **Valuation Verdict** dan **Key Findings**. Klik tombol pada panel kanan untuk membuka drawer **Research Dossier Artifact** yang berisi ringkasan riset terstruktur.

#### On-Screen Graphics & Teks Overlay:
* `[0:32]` Prompt Callout: `"Bandingkan valuasi dan kesehatan finansial BBRI vs BMRI"`
* `[0:40]` Architecture Box: **Custom Dynamic DAG Planner** — *Intent Classification & Parallel Sectors API*
* `[0:48]` Telemetry Badge: **Parallel Async Fetch**: `BBRI (320ms)` + `BMRI (310ms)` • Total Latency: `1.52s`
* `[0:56]` Feature Tag: **Peer Battle Matrix & Grounded Institutional Synthesis**

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

### SEGMEN 3: Deterministic Quant Engine & Minerba Deep Intelligence (1:10 - 1:50)
* **Durasi**: 40 Detik
* **Tujuan**: Membuktikan keunggulan kuantitatif AlphaSector melalui perhitungan deterministik matematika murni (Piotroski & P/E Bands) serta memperlihatkan fitur baru **Minerba Deep Intelligence Suite** (data resmi Ditjen Minerba ESDM) di Company 360°.

#### Detail Aksi Visual (Screen Actions & Clicks):
1. **[1:10 - 1:18] Navigasi ke `/battle`**: Klik menu **"Peer Battle"** di Navbar atas. Klik tombol preset: **"The Big 4 Banks"** (`BBCA`, `BBRI`, `BMRI`, `BBNI`), lalu klik tombol gradien cyan **"Jalankan Peer Battle"**. Tabel 4 emiten terisi instan dalam ~450ms.
2. **[1:18 - 1:28] Drill Down ke `/company/ADRO`**: Cari atau buka emiten komoditas `ADRO` untuk membuka halaman Company 360° Profile. Scroll ke kartu **Deterministic Quant Panel**:
   - Tunjukkan kartu **Piotroski F-Score (Score: 7/9 PRIMA)** dengan 9 kriteria akuntansi.
   - Tunjukkan kartu **P/E Historical Standard Deviation Band** dengan deviasi diskon terhadap rata-rata historis.
3. **[1:28 - 1:50] Minerba Deep Intelligence Suite (ESDM Data)**: Scroll ke bawah menuju komponen kartu **`MiningOperationalCard`**:
   - Sorot **Strip Ratio Meter**: Nilai `3.9x` bertag hijau **Low-Cost Producer** (biaya kupas tanah sangat hemat).
   - Sorot **Cadangan JORC/KCMI**: Total `996.2 Mt` (Proven & Probable Reserves vs Resources).
   - Sorot **Reserve Life Index**: Kalkulasi otomatis sisa umur aset tambang (**~15.4 Tahun**).
   - Sorot spesifikasi kualitas batubara resmi: Kalori (4.843 kkal/kg), Total Moisture, dan Rendah Sulfur (<1%).

#### On-Screen Graphics & Teks Overlay:
* `[1:12]` Preset Tag: **Preset Battle**: *The Big 4 Banks (4-Way Parallel Sectors Ingestion)*
* `[1:20]` Formula Card: **Piotroski F-Score Engine (0-9)**: *Profitability • Leverage • Efficiency*
* `[1:30]` ESDM Badge: **Minerba Deep Intelligence Suite** — *Official Ditjen Minerba ESDM Data*
* `[1:38]` Metric Callouts: **Strip Ratio 3.9x** (Low-Cost Leader) • **Cadangan JORC 996.2 Mt** • **Reserve Life ~15.4 Tahun**

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

### SEGMEN 4: Smart Money 2.0 Forensic Radar & 1-Click Notion Sync (1:50 - 2:30)
* **Durasi**: 40 Detik
* **Tujuan**: Menampilkan fitur mutakhir **Smart Money 2.0** dengan 4 pilar forensik institusional serta ekspor instan memo investasi ke Notion Workspace.

#### Detail Aksi Visual (Screen Actions & Clicks):
1. **[1:50 - 1:58] Smart Money 2.0 (`/smart-money`)**: Buka `/smart-money`. Tunjukkan **Global 900+ Emiten Selector** (pilih `TLKM`). Sorot tab bar 4 pilar forensik terpadu.
2. **[1:58 - 2:12] Jelajah 4 Pilar Forensik**:
   - **Pilar 1 (Bandarmology)**: Klik tombol analisis, tunjukkan Top 5 Broker Akumulasi vs Distribusi dan Net Foreign Flow.
   - **Pilar 2 (Insider Filings)**: Klik tab *Insider Filings*, tunjukkan deteksi **`INSIDER BUY / ACCUMULATION`** Direksi/Komisaris lengkap dengan harga beli dan tautan **PDF Surat Resmi BEI**.
   - **Pilar 3 (Kepemilikan Institusi)**: Klik tab *Kepemilikan Institusi*, tunjukkan dekomposisi data KSEI: Dana Pensiun (Dapen BPJS-TK/Taspen), Reksadana, Asuransi, Korporasi vs Ritel, beserta bar rasio Lokal vs Asing.
   - **Pilar 4 (Radar Suspensi)**: Klik sekilas tab *Radar Suspensi BEI* yang mendeteksi gembok bursa dan Unusual Market Activity.
3. **[2:12 - 2:30] 1-Click Institutional Notion Sync**: Kembali ke Company Profile atau klik tombol **"Sync to Notion"** berlogo `N`. Modal `NotionExportModal` terbuka. Klik **"Sync Memo to Notion"**. Dalam 1 detik, indikator sukses muncul. Buka tab Notion: tampilkan memo investasi Wall-Street lengkap berstruktur eksekutif, tabel valuasi, dan disclaimer kepatuhan.

#### On-Screen Graphics & Teks Overlay:
* `[1:52]` Radar Card: **Smart Money 2.0 Forensic Radar** — *4 Integrated Institutional Pillars*
* `[2:02]` Compliance Badge: **Insider Filings & KSEI Ownership** • *Official BEI Disclosure PDFs*
* `[2:14]` Integration Box: **1-Click Institutional Notion Sync** — *Wall-Street Style Investment Memo*

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

### SEGMEN 5: The Future of Indonesian Equity Research & Closing (2:30 - 3:00)
* **Durasi**: 30 Detik
* **Tujuan**: Menutup video dengan impresi kuat ala peluncuran produk FinTech modern: merangkul seluruh alur kerja terintegrasi (Alpha Agent, Battle, Minerba, Smart Money, Notion), menegaskan komitmen Responsible FinTech (tanpa automated trading), dan memberikan call-to-action yang meyakinkan.

#### Detail Aksi Visual (Screen Actions & Clicks):
1. **[2:30 - 2:40] Unified Workspace Showcase**: Kamera melakukan *smooth zoom-out* sinematik memperlihatkan ekosistem AlphaSector yang saling terhubung: dari penalaran Alpha Agent, arena Peer Battle, kartu Minerba ESDM, radar Smart Money 2.0, hingga memo Notion.
2. **[2:40 - 2:48] Responsible FinTech & Disclaimers**: Sorot sekilas kartu etika analitis di footer: menegaskan komitmen pada *pure decision-support intelligence* tanpa eksekusi transaksi otomatis (Rule 12).
3. **[2:48 - 3:00] Hero Closing & Call-To-Action**: Transisi ke layar penutup Deep Obsidian. Logo AlphaSector berkilau di tengah layar, diikuti teks tagline *"Smarter Research, Sharper Decisions"*, tautan repositori GitHub publik (`github.com/MaulRai/sectors-hackathon`), dan badge *Sectors Hackathon 2026*.

#### On-Screen Graphics & Teks Overlay:
* `[2:32]` Headline Card: **Autonomous Equity Intelligence**: *Multi-Step Reasoning • Deterministic Quant Engine • Minerba Suite*
* `[2:42]` Assurance Badge: **Responsible FinTech**: *Pure Decision Support • Zero Automated Trading*
* `[2:50]` Closing Hero: **AlphaSector** — *Institutional Research for Everyone* | `github.com/MaulRai/sectors-hackathon`

#### Audio Design:
* BGM: Musik bertransisi ke riser megah bersemangat, mencapai klimaks pada detik 2:50, lalu diakhiri denting synth jernih dan reverb tail yang bersih.
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
