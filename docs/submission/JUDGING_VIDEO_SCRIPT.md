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
| **Segmen 1** | 0:00 - 0:35 | 35 dtk | **The High-Stakes Problem & Zero-Friction Entry**<br>Information overload 900+ emiten BEI, data terfragmentasi, perkenalan AlphaSector & 1-Click Demo Login. | `/` (Landing Page)<br>AuthGate Modal |
| **Segmen 2** | 0:35 - 1:20 | 45 dtk | **Multi-Step Agent Reasoning & Dynamic DAG**<br>Autonomous reasoning di `/alpha-agent`, visualisasi `AgentThinkingTrace`, pemanggilan paralel Sectors API, sintesis fundamental. | `/alpha-agent` |
| **Segmen 3** | 1:20 - 1:55 | 35 dtk | **Deterministic Quant Engine & Peer Battle**<br>Mode adu emiten di `/battle`, kalkulasi 9 kriteria Piotroski F-Score & Pita Standar Deviasi P/E historis tanpa halusinasi LLM. | `/battle`<br>`/company/ASII` |
| **Segmen 4** | 1:55 - 2:30 | 35 dtk | **Market Intelligence & 1-Click Institutional Notion Sync**<br>Radar broker bandarmologi di `/smart-money`, floating dock `/screener`, ekspor memo investasi institusional ke Notion. | `/smart-money`<br>`/screener`<br>Notion Modal |
| **Segmen 5** | 2:30 - 3:00 | 30 dtk | **The Future of Equity Research & Closing**<br>Visi produk, demokratisasi riset institusional, etika analitis & call-to-action. | Workspace Showcase<br>Wrap-up |

---

## 2. Naskah Video Berwaktu (Timecoded Script & Visual Storyboard)

---

### SEGMEN 1: The High-Stakes Problem & Zero-Friction Entry (0:00 - 0:35)
* **Durasi**: 35 Detik
* **Tujuan**: Membuka dengan problem nyata di pasar modal Indonesia (900+ emiten BEI, PDF tebal, data terfragmentasi), memperkenalkan AlphaSector, dan membuka akses instan ke terminal riset terpadu.

#### Detail Aksi Visual (Screen Actions & Clicks):
1. **[0:00 - 0:07] B-Roll / Layar Monitor**: Tampilkan layar dengan belasan tab browser terbuka berisi PDF laporan keuangan BEI yang rumit, lembar spreadsheet penuh angka, dan grafik harga yang terpisah-pisah. Kursor bergerak cepat menunjukkan rasa frustrasi analisis manual.
2. **[0:07 - 0:15] Transisi Cepat**: Transisi *smooth wipe* atau *zoom-in* langsung ke browser yang membuka Landing Page AlphaSector (`localhost:3000`). Sorot banner header berlatar *Deep Obsidian* (`#07090e`) dengan aksen neon emerald/cyan. Kursor melakukan *hover* halus pada tagline hero: *"Autonomous Equity Research Agent for Indonesian Capital Markets"*.
3. **[0:15 - 0:25] Jelajah Singkat**: Scroll lembut ke bawah memperlihatkan arsitektur 5 fitur utama (Alpha Agent, Peer Battle, Screener Pro, Smart Money, Notion Sync).
4. **[0:25 - 0:35] AuthGate & 1-Click Login**: Klik tombol navigasi menuju `/alpha-agent`. Modal `AuthGate` muncul elegan. Kursor langsung mengklik tombol hijau bercahaya: **"1-Click Demo Login (Akses Instan)"** (`demo@alphasector.id`). Dalam tempo kurang dari 1 detik, indikator login sukses dan workspace terbuka mulus.

#### On-Screen Graphics & Teks Overlay:
* `[0:02]` Text Card: **"900+ Saham BEI • Ratusan Halaman PDF • Jam-Jaman Riset Manual"**
* `[0:05]` Persona Overlay: **Built for**: *Investor Ritel & Analis Riset Ekuitas Indonesia*
* `[0:10]` Brand Card: **AlphaSector Terminal** — *Track 01: AI Agents & Assistants*
* `[0:27]` Badge Highlight: **Instant Terminal Access** — *Unified Institutional Workspace*

#### Audio Design:
* BGM: Low-hum ambient synth misterius di awal, berubah menjadi upbeat tech corporate groove bertempo 115 BPM saat AlphaSector muncul.
* SFX: Suara lembaran kertas/typing cepat di awal, diikuti *digital whoosh* renyah saat transisi ke AlphaSector, dan *positive chime* saat 1-click login berhasil.

#### Narasi Suara (Verbatim Indonesian Voiceover):
> *"Menganalisis lebih dari sembilan ratus emiten di Bursa Efek Indonesia adalah pekerjaan yang melelahkan. Analis dan investor ritel terpaksa membedah ratusan halaman PDF laporan keuangan yang terfragmentasi, menghitung rasio valuasi secara manual, dan menebak pergerakan dana institusi secara spekulatif.*
> 
> *Inilah **AlphaSector**: Terminal riset ekuitas otonom pertama yang dirancang khusus untuk pasar modal Indonesia bertenaga Sectors Financial API—mengubah data mentah dan laporan keuangan yang rumit menjadi kejelasan analitis berstandar institusi dalam satu ruang kerja terpadu."*

#### English Subtitles:
> *"Analyzing over 900 companies on the Indonesia Stock Exchange is exhausting. Analysts and retail investors must comb through fragmented financial PDFs, calculate valuation multiples manually, and speculate on institutional flows.*
> 
> *Meet **AlphaSector**: the first autonomous equity research terminal purpose-built for the Indonesian market, powered by Sectors Financial API—turning raw market telemetry and dense filings into instant, institutional-grade intelligence in a single unified workspace."*

---

### SEGMEN 2: Multi-Step Agent Reasoning & Tool Calling di `/alpha-agent` (0:35 - 1:20)
* **Durasi**: 45 Detik
* **Tujuan**: Membuktikan kualifikasi Track 01 dengan memperlihatkan multi-step reasoning, dynamic DAG planning, parallel API fetching, dan sintesis fundamental institusional di route `/alpha-agent`.

#### Detail Aksi Visual (Screen Actions & Clicks):
1. **[0:35 - 0:42] Input Natural Language Prompt**: Kursor berada di `ChatInputBar`. Ketik secara natural prompt komparasi:
   `"Bandingkan valuasi dan kesehatan finansial BBRI vs BMRI"` lalu tekan **Enter**.
2. **[0:42 - 0:58] Live Thinking Trace Inspection**: Komponen `LiveThinkingTrace` dan `AgentThinkingTrace` seketika aktif dan terbuka. Arahkan kursor dan sorot tahapan eksekusi otonom yang bergerak dinamis:
   - **Phase 1 (PLANNING)**: Intent diklasifikasikan sebagai `PEER_BATTLE_COMPARISON`, target emiten `BBRI` dan `BMRI`, stopwords finansial Indonesia difilter.
   - **Phase 2 (FETCHING)**: Pemanggilan paralel via `asyncio.gather` ke endpoint Sectors API: `GET /company/report/BBRI` (~320ms) dan `GET /company/report/BMRI` (~310ms).
   - **Phase 3 (COMPARING)**: Kalkulasi rasio matematika dan matriks komparatif.
   - **Phase 4 (SYNTHESIZING)**: Inferensi LPU Groq Llama 3.3 70B menyusun sintesis Bahasa Indonesia.
   - Sorot badge ringkasan: `(1,520ms • 2 cr)`.
3. **[0:58 - 1:12] PeerBattleMatrix Presentation**: Hasil respon muncul di layar. Scroll ke tabel komparasi berdampingan `PeerBattleMatrix`. Kursor menyorot metrik kunci: P/E, PBV, ROE, Net Profit Margin (NPM), dan lencana best-in-class hijau (`bg-emerald-500/10 text-emerald-400`).
4. **[1:12 - 1:20] Autonomous Synthesis & Research Dossier**: Sorot bagian **Valuation Verdict** dan **Key Findings** berbahasa Indonesia yang tajam dan grounded. Klik tombol pada panel kanan untuk membuka drawer **Research Dossier Artifact** yang berisi ringkasan riset siap cetak.

#### On-Screen Graphics & Teks Overlay:
* `[0:38]` Prompt Callout: `"Bandingkan valuasi dan kesehatan finansial BBRI vs BMRI"`
* `[0:45]` Architecture Box: **Custom Dynamic DAG Planner** — *Intent Classification & Parallel Sectors API*
* `[0:52]` Telemetry Badge: **Parallel Async Fetch**: `BBRI (320ms)` + `BMRI (310ms)` • Total Latency: `1.52s`
* `[1:05]` Feature Tag: **Peer Battle Matrix & Grounded Institutional Synthesis**

#### Audio Design:
* BGM: Musik berlanjut dengan beat modern teratur yang menonjolkan kecerdasan analitis.
* SFX: Suara ketikan keyboard taktil cepat, *soft digital hum* saat DAG reasoning berjalan, dan *double snap click* saat tabel matriks dan drawer dossier terbuka.

#### Narasi Suara (Verbatim Indonesian Voiceover):
> *"Di halaman Alpha Agent, analis cukup mengajukan pertanyaan dalam bahasa sehari-hari. Perhatikan komponen Thinking Trace ini: AlphaSector bukanlah sekadar wrapper prompt biasa.*
> 
> *Sistem kami secara mandiri mengklasifikasikan intensi, merancang Directed Acyclic Graph atau DAG, lalu mengeksekusi Sectors API secara paralel via asynchronous gather dalam hitungan ratusan milidetik.*
> 
> *Hasilnya adalah matriks komparasi presisi antar-emiten kompetitor—lengkap dengan perbandingan laba, margin, efisiensi modal, serta sintesis naratif institusional berbahasa Indonesia yang objektif, bebas halusinasi, dan tersimpan rapi sebagai Research Dossier interaktif."*

#### English Subtitles:
> *"In the Alpha Agent workspace, analysts simply ask in natural language. Notice this Thinking Trace: AlphaSector is not a simple prompt wrapper.*
> 
> *Our orchestrator autonomously classifies intent, builds a Directed Acyclic Graph (DAG), and executes Sectors API endpoints concurrently via asyncio.gather within hundreds of milliseconds.*
> 
> *The output is a rigorous side-by-side comparative matrix across competing companies—covering multiples, margins, and capital efficiency—paired with an institutional synthesis stored as an interactive Research Dossier."*

---

### SEGMEN 3: Deterministic Quant Engine & Battle Mode (1:20 - 1:55)
* **Durasi**: 35 Detik
* **Tujuan**: Membuktikan keunggulan kuantitatif AlphaSector melalui perhitungan deterministik matematika murni: 9 kriteria Piotroski F-Score dan Pita Standar Deviasi P/E historis tanpa ketergantungan halusinasi angka LLM.

#### Detail Aksi Visual (Screen Actions & Clicks):
1. **[1:20 - 1:28] Navigasi ke `/battle`**: Klik menu **"Peer Battle"** di Navbar atas. Halaman `/battle` terbuka. Kursor mengklik tombol preset: **"The Big 4 Banks"** (`BBCA`, `BBRI`, `BMRI`, `BBNI`). Ticker manager seketika terisi 4 kode bank.
2. **[1:28 - 1:35] Eksekusi Battle 4 Arah**: Klik tombol gradien cyan **"Jalankan Peer Battle (BBCA vs BBRI vs BMRI vs BBNI)"**. Dalam ~450ms, tabel perbandingan 4 emiten terisi penuh dengan data historis terpadu.
3. **[1:35 - 1:44] Drill Down ke `/company/ASII`**: Klik baris atau cari ticker `ASII` untuk membuka halaman `/company/ASII` (Company 360° Profile). Scroll ke bawah menuju kartu **Deterministic Financial Intelligence Panel**.
4. **[1:44 - 1:55] Sorot Piotroski F-Score & P/E Band**:
   - Berikan efek *zoom-in spotlight* pada kartu **Piotroski F-Score (Score: 7/9 PRIMA)**. Tunjukkan pengujian 9 kriteria akuntansi (Profitabilitas, Solvabilitas, Efisiensi Operasional).
   - Sorot kartu **P/E Historical Standard Deviation Band**. Tunjukkan status `UNDERVALUED` dengan deviasi diskon `-18.4%` terhadap rata-rata historis P/E 5 tahun.
   - Tunjukkan sekilas grafik segmen pendapatan bisnis Astra (Otomotif, Jasa Keuangan, Alat Berat & Tambang).

#### On-Screen Graphics & Teks Overlay:
* `[1:24]` Preset Tag: **Preset Battle**: *The Big 4 Banks (BBCA, BBRI, BMRI, BBNI)*
* `[1:32]` Tech Callout: **4-Way Parallel Sectors Ingestion** (~450ms)
* `[1:41]` Formula Card: **Piotroski F-Score Engine (0-9)**: *Profitability • Leverage • Efficiency*
* `[1:48]` Metric Tag: **Historical P/E Band**: *Mean P/E vs Current P/E (-18.4% Discount Undervalued)*

#### Audio Design:
* BGM: Ritme perkusi sedikit meningkat memberikan sensasi presisi matematika dan ketegasan data institusional.
* SFX: *Whoosh* cepat saat berganti halaman, *deep bass hit* saat kartu Piotroski 7/9 disorot.

#### Narasi Suara (Verbatim Indonesian Voiceover):
> *"Masuk ke mode Peer Battle. Di sinilah keunggulan utama AlphaSector: **Deterministic Quant Engine**. Kami menolak menyerahkan perhitungan angka finansial kepada halusinasi LLM.*
> 
> *Di profil emiten, mesin kuantitatif kami menghitung skor kesehatan Piotroski dan pita valuasi historis secara deterministik—menunjukkan seketika apakah suatu saham sehat secara fundamental dan sedang terdiskon."*

#### English Subtitles:
> *"Entering Peer Battle mode highlights AlphaSector's core edge: our **Deterministic Quant Engine**. We never delegate mathematical computations to LLM hallucinations.*
> 
> *On any company profile, our engine calculates Piotroski health scores and historical valuation bands deterministically—instantly revealing whether a stock is fundamentally sound and trading at a discount."*

---

### SEGMEN 4: Market Intelligence & 1-Click Institutional Notion Sync (1:55 - 2:30)
* **Durasi**: 35 Detik
* **Tujuan**: Menampilkan fitur pelacakan bandarmologi di `/smart-money`, integrasi penyaringan di `/screener`, dan fitur ekspor memo investasi ke Notion Workspace secara instan.

#### Detail Aksi Visual (Screen Actions & Clicks):
1. **[1:55 - 2:05] Smart Money Radar (`/smart-money`)**: Navigasi ke `/smart-money`. Tunjukkan **Top Institutional Brokers Leaderboard** nasional (broker CC, AK, YU, ZP). Pilih ticker `TLKM`.
2. **[2:05 - 2:12] Broker Flow & Buyer Concentration**: Sorot kartu **Broker Flow Tracker**: tabel Top 5 Akumulator vs Distributor dengan volume lot, harga rata-rata, dan angka berpendar emas: **"Buyer Concentration: 74%"** serta grafik batang **Net Foreign Flow** hijau yang menunjukkan inflow asing.
3. **[2:12 - 2:20] Screener Pro & Battle Dock (`/screener`)**: Buka `/screener`. Ketik query NLP *"Cari emiten dengan pertumbuhan revenue tertinggi"*. Tabel hasil tersaring. Centang dua kotak emiten, lalu sorot komponen floating **ScreenerBattleDock** di bawah layar yang siap melempar saham ke arena pertempuran hanya dengan satu klik: **"Adu di Peer Battle (2)"**.
4. **[2:20 - 2:30] 1-Click Notion Sync**: Kembali ke modal emiten, klik tombol **"Sync to Notion"** berlogo `N`. Modal `NotionExportModal` terbuka memperlihatkan pratinjau ringkasan. Klik **"Sync Memo to Notion"**. Dalam 1 detik, muncul notifikasi centang hijau sukses dan tombol **"Buka Memo di Notion"**. Buka tab Notion memperlihatkan dokumen memo investasi lengkap berstruktur Wall-Street (Callout, Metriks, Piotroski bullet, Disclaimer).

#### On-Screen Graphics & Teks Overlay:
* `[1:58]` Radar Card: **Smart Money & Bandarmologi Radar** — *Broker Flow & Foreign Net Inflow*
* `[2:06]` Data Callout: **74% Buyer Concentration** • *Institutional Whale Accumulation Detected*
* `[2:14]` Feature Tag: **Screener Pro NLP & Floating Battle Dock**
* `[2:24]` Integration Box: **1-Click Institutional Notion Sync** — *Wall-Street Style Investment Memo*

#### Audio Design:
* BGM: Melodi dinamis stabil mengalir.
* SFX: *Radar ping* halus saat membuka Smart Money, *crisp mouse click* saat menekan tombol Notion, dan nada *pleasant success chime* saat sinkronisasi Notion selesai.

#### Narasi Suara (Verbatim Indonesian Voiceover):
> *"Bagi pelaku pasar, fitur Smart Money melacak aliran dana bandar dan investor asing secara real-time. Sistem mendeteksi tingkat konsentrasi pembeli dan aliran dana asing secara transparan untuk mengonfirmasi pola akumulasi institusi.*
> 
> *Di Screener Pro, investor dapat memfilter ratusan saham dengan bahasa natural, lalu mengirimkannya langsung ke Peer Battle melalui floating dock interaktif.*
> 
> *Dan luar biasanya: seluruh hasil analisis ini dapat diekspor langsung dalam satu klik ke Notion Workspace dalam bentuk memorandum investasi berstandar institusi global—lengkap dengan ringkasan eksekutif, tabel valuasi, dan skor kesehatan finansial."*

#### English Subtitles:
> *"For market practitioners, our Smart Money radar tracks institutional broker flows and foreign capital in real time, detecting institutional buyer concentration and foreign inflows to confirm large-scale accumulation.*
> 
> *In Screener Pro, investors filter hundreds of stocks with natural language and beam them directly into Peer Battle using our interactive floating dock.*
> 
> *Best of all: all research can be exported with 1 click directly into Notion Workspaces as a Wall-Street caliber investment memo—complete with executive summaries, valuation multiples, and financial health scores."*

---

### SEGMEN 5: The Future of Indonesian Equity Research & Closing (2:30 - 3:00)
* **Durasi**: 30 Detik
* **Tujuan**: Menutup video dengan impresi kuat ala peluncuran produk FinTech modern: merangkul seluruh alur kerja terintegrasi (Alpha Agent, Battle, Smart Money, Notion), menegaskan posisi sebagai terminal riset cerdas & bertanggung jawab (tanpa automated trading), dan memberikan call-to-action yang percaya diri.

#### Detail Aksi Visual (Screen Actions & Clicks):
1. **[2:30 - 2:40] Unified Workspace Showcase**: Kamera melakukan *smooth zoom-out* sinematik memperlihatkan ekosistem AlphaSector yang saling terhubung: dari penalaran Alpha Agent yang cerdas, arena Peer Battle, radar Smart Money, hingga memo Notion yang rapi. Transisi antar-fitur bergerak halus membuktikan kelengkapan produk.
2. **[2:40 - 2:48] Responsible FinTech & Disclaimers**: Sorot sekilas kartu etika analitis di footer: menegaskan komitmen pada *pure decision-support intelligence* tanpa eksekusi transaksi otomatis (Rule 12).
3. **[2:48 - 3:00] Hero Closing & Call-To-Action**: Transisi ke layar penutup Deep Obsidian. Logo AlphaSector berkilau di tengah layar, diikuti kemunculan teks tagline *"Smarter Research, Sharper Decisions"*, tautan repositori GitHub publik (`github.com/MaulRai/alphasector`), dan badge *Sectors Hackathon 2026*.

#### On-Screen Graphics & Teks Overlay:
* `[2:32]` Headline Card: **Autonomous Equity Intelligence**: *Multi-Step Reasoning • Deterministic Quant Engine*
* `[2:42]` Assurance Badge: **Responsible FinTech**: *Pure Decision Support • Zero Automated Trading*
* `[2:50]` Closing Hero: **AlphaSector** — *Institutional Research for Everyone* | `github.com/MaulRai/alphasector`

#### Audio Design:
* BGM: Musik bertransisi ke riser modern yang megah dan bersemangat, mencapai puncak pada detik 2:50, lalu diakhiri dengan denting synth jernih dan reverb tail yang bersih.
* SFX: *Sub-bass boom* halus saat logo AlphaSector muncul, diikuti *sparkle chime* saat link GitHub ditampilkan.

#### Narasi Suara (Verbatim Indonesian Voiceover):
> *"Dari membedah ratusan laporan keuangan hingga menyusun tesis investasi yang siap dieksekusi, AlphaSector mentransformasi riset ekuitas Indonesia dari hitungan hari menjadi hitungan detik.*
> 
> *Menggabungkan penalaran agen otonom, komputasi kuantitatif deterministik, dan prinsip analitis yang bertanggung jawab—kami menghadirkan kekuatan terminal riset institusi langsung ke tangan setiap investor.*
> 
> *AlphaSector: Riset cerdas, keputusan terukur. Coba aplikasinya sekarang dan jelajahi kodenya di GitHub!"*

#### English Subtitles:
> *"From dissecting hundreds of financial filings to delivering actionable investment theses, AlphaSector turns days of manual equity research into seconds of clarity.*
> 
> *By pairing autonomous multi-step reasoning with deterministic quantitative math and responsible analytics, we're putting institutional-grade research into the hands of every investor.*
> 
> *AlphaSector: Smarter research, sharper decisions. Try the live demo and explore the code on GitHub!"*

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
