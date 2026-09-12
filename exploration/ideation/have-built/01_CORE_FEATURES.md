# AlphaSector — Dokumentasi Komprehensif Fitur Utama

Dokumen ini membedah setiap modul dan kapabilitas fungsional yang telah dibangun di dalam platform **AlphaSector**.

---

## 1. 🤖 AlphaAgent Workspace (`/alpha-agent`)

AlphaAgent Workspace adalah pusat komando riset interaktif berbasis multi-turn conversational AI. Antarmuka ini dirancang agar analis tidak hanya melihat teks pasif, melainkan berinteraksi dengan widget data aktif dan artefak analitik.

```
+-------------------------------------------------------------------------+
| [AlphaAgent Sidebar]            [Main Interactive Chat Terminal]        |
| - Ticker Logo Badges (BBCA,..)  - Live Reasoning Trace Accordion        |
| - Sesi Riset Tersimpan          - Inline Company360Card                 |
| - Quick Search & Delete Modal   - Inline PeerBattleMatrix               |
|                                 - Inline BrokerFlowTracker              |
|                                 - Follow-up Dynamic Suggestion Pills    |
|                                 - Auto-expanding Input & Multimodal Bar |
+-------------------------------------------------------------------------+
```

### Fitur Spesifik Copilot:
1. **Multi-turn Context Persistence:**
   Setiap percakapan memiliki `session_id` unik yang disimpan di database SQLite backend. Konteks dialog sebelumnya dipertahankan sehingga pengguna bisa mengajukan pertanyaan lanjutan (misal: *"Bagaimana perbandingan valuasi keduanya jika dibandingkan dengan BMRI?"*).
2. **Cluster Logo Emiten Dinamis:**
   Sidebar mendeteksi kode emiten yang dibahas di dalam obrolan menggunakan parser algoritmis ([`session-utils.ts`](file:///d:/Projects/Web%20Shi/sectors-hackathon/frontend/lib/session-utils.ts)) dan menampilkan kluster logo emiten resmi di samping judul sesi.
3. **Multimodal Technical Chart Recognition:**
   Pengguna dapat mengunggah screenshot grafik candlestick atau screenshot broker summary langsung via file picker maupun menekan **Ctrl+V (Paste)** langsung pada textarea. Model Vision menganalisis pola teknikal, support/resistance, serta membaca tabel broker secara visual.
4. **Agent Thinking Reasoning Trace:**
   Pengguna dapat mengklik dropdown accordion untuk melihat transparansi proses berpikir agent secara real-time:
   - Identifikasi intent kueri.
   - Pemanggilan endpoint Sectors API secara terukur.
   - Kalkulasi metrik dan latensi eksekusi dalam milidetik.
   - Jumlah kuota kredit demo yang dikonsumsi.
5. **Inline Rich Interactive Widgets:**
   Jawaban tidak hanya teks Markdown, tetapi otomatis menyematkan widget interaktif:
   - `Company360Card`: Menampilkan P/E vs Peers, PBV, ROE, DER, NPM, Piotroski F-Score badge, dan P/E Historical Band status.
   - `PeerBattleMatrix`: Matriks komparasi tabel multi-emiten lengkap dengan highlight sel terbaik.
   - `BrokerFlowTracker`: Grafik akumulasi/distribusi broker top 3 dan foreign flow.
6. **Dynamic Follow-Up Recommendation Pills:**
   Setelah setiap jawaban, agent merekomendasikan 3 pertanyaan lanjutan yang relevan dan dapat langsung diklik oleh pengguna.

---

## 2. ⚔️ Peer Battle & Valuation Terminal (`/battle`)

Terminal khusus untuk melakukan komparasi *head-to-head* objektif antara 2 hingga 4 emiten dalam subsektor yang sama atau lintas industri.

### Fitur Spesifik Peer Battle:
1. **Multi-Ticker Autocomplete Tagging:**
   Mendukung pencarian cepat kode emiten BEI dengan visual logo perusahaan, chip penghapusan instan, dan batas keamanan maksimal 4 emiten per sesi.
2. **1-Click Preset Battles:**
   Menyediakan kurasi pertarungan sektor populer:
   - *The Big 4 Banks* (`BBCA`, `BBRI`, `BMRI`, `BBNI`)
   - *Telco Giants* (`TLKM`, `ISAT`, `EXCL`)
   - *Nickel & Metals* (`INCO`, `MBMA`, `NCKL`)
   - *Consumer Staples* (`ICBP`, `INDF`, `MYOR`)
   - *Auto & Industrial* (`ASII`, `AUTO`)
3. **Deterministik Matrix & Best-in-Class Badges:**
   Menghitung selisih valuasi secara matematis tanpa halusinasi:
   - P/E Gap vs Rata-rata Peers.
   - PBV Gap vs Rata-rata Peers.
   - Badge keunggulan objektif: `Best P/E`, `Top ROE`, `Top F-Score`, `Lowest PBV`, dan `Net Cash`.
4. **AI Synthesis & Valuation Verdict:**
   Merangkum ringkasan eksekutif, rekomendasi alokasi, dan penilaian risiko komparatif.
5. **Follow-up Chat Room Handshake:**
   Tombol 1-klik untuk mentransfer seluruh matriks komparasi ke AlphaAgent Copilot room baru guna membedah tesis investasi lebih dalam.

---

## 3. 🔍 Trade Ideas & Multi-Factor Screener (`/screener`)

Engine pencarian dan penyaringan emiten yang menggabungkan kemudahan bahasa natural (*Natural Language Processing*) dan fleksibilitas filter kuantitatif terstruktur.

### Fitur Spesifik Screener:
1. **Natural Language Query Parser:**
   Pengguna dapat mengetik kueri bebas dalam Bahasa Indonesia, misalnya: *"Cari saham perbankan yang ROE di atas 15 persen dan PE di bawah 10"*. Planner backend memetakan bahasa ini menjadi kueri REST terstruktur (`sub_sector`, `min_roe`, `max_pe`, `order_by`).
2. **1-Click Trade Ideas Presets:**
   - **Undervalued Big Caps:** Emiten berkapitalisasi pasar besar dengan rasio P/E di bawah rata-rata historisnya.
   - **High Yield Dividend Titans:** Emiten dengan yield dividen tinggi dan konsistensi dividen bertahun-tahun.
   - **High Growth Momentum:** Perusahaan dengan pertumbuhan laba bersih dan pendapatan signifikan.
   - **Piotroski F-Score Champions:** Perusahaan dengan skor fundamental sehat (skor 7 hingga 9).
3. **Responsive Results Table:**
   Menampilkan daftar emiten lengkap dengan harga terakhir, market cap, P/E, PBV, ROE, NPM, dan DER, dilengkapi checkbox pemilihan battle.
4. **Floating Screener Battle Dock:**
   Saat pengguna mencentang 2 hingga 4 saham dari hasil screener, dermaga aksi mengambang (*floating dock*) akan muncul di bagian bawah layar untuk meluncurkan Peer Battle secara instan dengan parameter terpilih.
5. **Client Caching Engine:**
   Hasil screener disimpan di penyimpanan lokal browser (`alphasector_screener_cache`) untuk menghemat panggilan API Sectors saat pengguna berpindah tab.

---

## 4. 🏢 Emiten 360° Profile & Research Dossier (`/company/[symbol]`)

Halaman profil menyeluruh untuk setiap emiten terdaftar di Bursa Efek Indonesia.

### Fitur Spesifik Company 360:
1. **Multi-Period Historical Valuation Multiples Table:**
   Menampilkan deret waktu tahunan rasio P/E, PBV, P/S, dan PCF emiten berdampingan dengan rata-rata peers subsektornya (`pe_peer_avg`, `pb_peer_avg`).
2. **Business Segment Revenue Breakdown:**
   Membedah portofolio unit bisnis emiten, nilai pendapatan tiap segmen dalam Triliun Rupiah, serta persentase kontribusinya terhadap total omzet perusahaan.
3. **Integrated Broker Flow Tracker:**
   Menampilkan ringkasan aliran dana broker, pergerakan dana investor asing (*foreign net buy/sell*), dan konsentrasi akumulasi.
4. **On-Demand AI Synthesis Banner:**
   Memberikan keleluasaan bagi analis: memuat data dasar dengan latensi cepat, lalu menyediakan tombol *Generate AI Research Synthesis* untuk menyintesis tesis investasi mendalam saat dibutuhkan.
5. **Printable / Exportable Research Dossier:**
   Modal dokumen riset terstruktur yang siap dicetak ke format PDF atau dibagikan ke tim komite investasi.
6. **1-Click Notion Sync:**
   Mengekspor seluruh metrik fundamental, skor Piotroski, band P/E, dan ringkasan eksekutif ke workspace Notion pengguna.

---

## 5. 🌊 Smart Money & Institutional Flow Tracker (`/smart-money`)

Modul pelacak aliran dana institusi, broker lokal, dan investor asing di pasar reguler BEI.

### Fitur Spesifik Smart Money:
1. **Top 3 Broker Concentration Index:**
   Menganalisis rasio akumulasi 3 broker teratas terhadap total volume perdagangan untuk mengidentifikasi fase *Strong Accumulation*, *Normal Accumulation*, *Neutral*, atau *Distribution*.
2. **Foreign Flow Momentum:**
   Melacak net buy/sell investor asing dalam rentang waktu 14 hari perdagangan untuk mengukur minat dana global pada emiten target.
3. **IDX Broker Leaderboard:**
   Menampilkan kartu anggota bursa (AB) dengan nilai transaksi terbesar di pasar modal Indonesia (misal: YU, CC, CS, RX, KZ).
4. **Popular Ticker Quick Switch:**
   Daftar saham likuid (TLKM, BBCA, BBRI, BMRI, ASII, AMMN, BREN, ADRO) untuk pengecekan cepat kondisi bandarologi harian.

---

## 6. ⚙️ Analyst Settings & BYOK API Key (`/settings`)

Pengaturan profil analis dan pengelolaan kunci API pribadi guna mendukung skenario penggunaan tanpa batas.

### Fitur Spesifik Settings:
1. **Bring Your Own Key (BYOK) Sectors API:**
   Pengguna dapat memasukkan Sectors Financial API Key pribadi mereka. Kunci ini disimpan terisolasi di database akun pengguna.
2. **Real-time Latency & Connection Tester:**
   Tombol *Tes Koneksi* yang menguji keabsahan API Key langsung ke server Sectors dan mengukur latensi jaringan dalam milidetik (`ms`).
3. **Demo Credit Meter & Fallback System:**
   Bagi pengguna yang belum memiliki key pribadi, sistem menyediakan kuota server demo sebesar 50 kredit. Bilah progres visual menampilkan sisa kredit secara transparan.
4. **Institutional Analyst Profile & Safe Logout:**
   Menampilkan rincian akun analis dan modal konfirmasi penghapusan key serta sesi logout demi keamanan data perbankan/institusi.
