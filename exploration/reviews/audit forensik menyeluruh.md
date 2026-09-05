Sebagai **Juri Teknis Sectors Hackathon 2026** sekaligus **Principal Engineer**, saya telah melakukan audit forensik menyeluruh terhadap:
1. **Regulasi & Pedoman Hackathon** ([`ai-track-guideline.md`](file:///d:/Projects/Web%20Shi/sectors-hackathon/exploration/ideation/ai-track-guideline.md) dan [`competition-general-guideline.md`](file:///d:/Projects/Web%20Shi/sectors-hackathon/exploration/ideation/competition-general-guideline.md)).
2. **Klaim Dokumentasi Tim** ([`have-built/*.md`](file:///d:/Projects/Web%20Shi/sectors-hackathon/exploration/ideation/have-built/)).
3. **Implementasi Kode Sumber Nyata** (Backend FastAPI, Frontend Next.js 16, Skrip SQL/DB, dan Engine Kuantitatif).

Berikut adalah hasil audit teknis mendalam yang mencakup verifikasi kepatuhan, kelemahan kode (*code vulnerabilities/debt*), ketergantungan Sectors API, serta evaluasi objektif kegunaan riil investor vs *gimmick* AI.

---

### 1. 🛡️ Kepatuhan Regulasi & Gate Penjurian (Pass / Fail Eligibility)

| Parameter Regulasi | Status Audit | Temuan Lapangan |
|---|:---:|---|
| **Build Period Window** (19 Ags – 30 Sep 2026) | **PASS** | Commit pertama repositori tercatat pada **2026-09-02 14:29:50 +0700** (`6d2425f`). Repositori dibuat dan dikembangkan murni di dalam masa kompetisi. |
| **Larangan Auto Trade Execution** (Rule 06) | **PASS** | Tidak ditemukan kode eksekusi order (FIX protocol, API sekuritas, order placement). Arsitektur murni *read-only decision support*. |
| **Financial Advice Disclaimer** (Rule 12) | **PASS** | Terdapat disclaimer resmi eksplisit di backend (`synthesizer.py:MANDATORY_DISCLAIMER`) serta di UI frontend. |
| **Bukan MCP Client Wrapper Generik** (Track 01) | **PASS** | Memiliki frontend mandiri Next.js 15/16 dan orchestrator backend custom, bukan sekadar wrapper prompt di atas Claude Desktop atau OpenClaw. |
| **Kerahasiaan API Key di Git** (Rule 08) | **PASS** | File `.env` dan `.env.local` tidak terlacak di riwayat Git commit. |

---

### 2. ⚡ Verifikasi Ketergantungan Sectors API: Inti Data vs Ilusi Mock

Aturan kompetisi menyatakan: *"The product should lose its core functionality if Sectors data is removed."*

#### ✅ Aspek yang Lulus (Ketergantungan Asli):
- Endpoint utama `/v2/company/report/{symbol}/`, `/v2/company/segments/{symbol}/`, `/v2/broker-summary/{symbol}/top/`, dan `/v2/companies/` dipanggil secara nyata melalui [`backend/app/sectors/client.py`](file:///d:/Projects/Web%20Shi/sectors-hackathon/backend/app/sectors/client.py).
- Data fundamental dan valuasi historis emiten IDX yang mengalir ke Peer Battle dan Single Company 360 Card berasal dari payload asli Sectors API.

#### 🚩 TEMUAN MERAH (Red Flags) di Mata Juri Teknis:
1. **Mock Interceptor Hardcoded di `AgentToolExecutor`:**
   Di [`backend/app/agent/tools.py`](file:///d:/Projects/Web%20Shi/sectors-hackathon/backend/app/agent/tools.py#L98-L119):
   ```python
   # Kueri screener yang mengandung kata kunci ini DICEGAT dan langsung mengembalikan data MOCK statis!
   if "esg" in clean_q or "keberlanjutan" in clean_q:
       data = TRADE_IDEAS_MOCK_DATA.get("esg-leaders", [])
   elif "growth" in clean_q or "omset" in clean_q:
       data = TRADE_IDEAS_MOCK_DATA.get("revenue-growth", [])
   elif "shareholder" in clean_q or "pemegang saham" in clean_q:
       data = TRADE_IDEAS_MOCK_DATA.get("large-shareholder", [])
   elif "efficient" in clean_q or "efisiensi" in clean_q:
       data = TRADE_IDEAS_MOCK_DATA.get("efficient-operators", [])
   ```
   *Penilaian Juri:* Jika juri menguji chatbot dengan pertanyaan *"Cari saham growth"* atau *"Saham ESG terbaik"*, agen **tidak memanggil Sectors API sama sekali**, melainkan mengambil data statis dari memori. Ini berisiko tinggi dicatat sebagai *"faked data demo"* saat verifikasi repositori.
2. **Nilai Default `USE_MOCK_DATA=true`:**
   Pada [`backend/.env.example`](file:///d:/Projects/Web%20Shi/sectors-hackathon/backend/.env.example#L26) dan [`config.py`](file:///d:/Projects/Web%20Shi/sectors-hackathon/backend/app/core/config.py#L33), mock data diaktifkan secara default untuk Trade Ideas presets. Jika evaluator mengkloning repositori dan menjalankan aplikasi dengan konfigurasi default, fitur Trade Ideas berjalan tanpa Sectors API.
3. **Mock URL Palsu pada Notion Export:**
   Di [`backend/app/services/notion_service.py`](file:///d:/Projects/Web%20Shi/sectors-hackathon/backend/app/services/notion_service.py#L221), jika kredensial Notion tidak diisi, backend mengembalikan URL fiktif:
   `https://notion.so/alphaagent-investment-memo-{ticker}-preview` yang akan menghasilkan halaman 404 jika diklik oleh pengguna.

---

### 3. 🔍 Diskrepansi Fatal antara Dokumentasi dan Implementasi Kode

Sebagai Principal Engineer, ketidakcocokan (*drift*) antara dokumen arsitektur dan kode nyata adalah pelanggaran integritas teknis:

#### A. Ilusi Database: Dokumen Mengklaim SQLite, Kode Menggunakan Neon Postgres
- **Klaim Dokumen** ([`00_OVERVIEW.md`](file:///d:/Projects/Web%20Shi/sectors-hackathon/exploration/ideation/have-built/00_OVERVIEW.md#L65), [`02_TECHNICAL_ARCHITECTURE.md`](file:///d:/Projects/Web%20Shi/sectors-hackathon/exploration/ideation/have-built/02_TECHNICAL_ARCHITECTURE.md#L138)):
  > *"Database & State: SQLite via aiosqlite (sesi chat multi-turn, watchlist analis, cache kuota & custom key)"*
- **Realita Kode** ([`backend/app/db/database.py`](file:///d:/Projects/Web%20Shi/sectors-hackathon/backend/app/db/database.py#L6-L16)):
  Menggunakan driver `psycopg2` untuk **Neon PostgreSQL Cloud**. Paket `aiosqlite` bahkan tidak terdaftar di [`requirements.txt`](file:///d:/Projects/Web%20Shi/sectors-hackathon/backend/requirements.txt)!
- **Dampak Kritis:** Pada [`backend/main.py`](file:///d:/Projects/Web%20Shi/sectors-hackathon/backend/main.py#L13), fungsi `init_db()` dipanggil langsung secara sinkron saat aplikasi dijalankan. **Jika evaluator menjalankan backend secara lokal tanpa `DATABASE_URL` PostgreSQL yang aktif, aplikasi akan langsung *crash* saat *startup*.** Tidak ada *fallback* otomatis ke SQLite lokal.

#### B. Ilusi Model AI: Dokumen Mengklaim LangChain & Gemini, Kode Menggunakan Groq & Raw Regex
- **Klaim Dokumen** ([`00_OVERVIEW.md`](file:///d:/Projects/Web%20Shi/sectors-hackathon/exploration/ideation/have-built/00_OVERVIEW.md#L64), [`02_TECHNICAL_ARCHITECTURE.md`](file:///d:/Projects/Web%20Shi/sectors-hackathon/exploration/ideation/have-built/02_TECHNICAL_ARCHITECTURE.md#L17)):
  > *"LangChain / Google Gemini 2.5 Flash ... Planner (LLM Intent Engine)"*
- **Realita Kode:**
  - `langchain` sama sekali tidak diimpor ataupun dipasang di repositori.
  - **Planner bukanlah LLM!** [`backend/app/agent/planner.py`](file:///d:/Projects/Web%20Shi/sectors-hackathon/backend/app/agent/planner.py#L6-L100) murni berbasis **Regex 4 huruf** (`TICKER_REGEX`) dan pencocokan kata kunci statis (`PEER_KEYWORDS`, `BROKER_KEYWORDS`, `SCREENER_KEYWORDS`).
  - LLM hanya digunakan pada tahap akhir oleh [`backend/app/agent/synthesizer.py`](file:///d:/Projects/Web%20Shi/sectors-hackathon/backend/app/agent/synthesizer.py#L6-L62) menggunakan **Groq (`openai/gpt-oss-120b`)** via HTTP langsung, dan Google Gemini hanya dipanggil untuk *Vision/chart OCR* di [`gemini_rotator.py`](file:///d:/Projects/Web%20Shi/sectors-hackathon/backend/app/core/gemini_rotator.py).

---

### 4. 🧮 Analisis Kelemahan Kode Deterministik (`financial_engine.py`)

Klaim keunggulan tim adalah *Deterministik Engine Bebas Halusinasi*. Namun implementasi matematisnya memiliki *logical flaws*:

1. **Inflasi Skor Semu pada Piotroski F-Score ([`financial_engine.py`](file:///d:/Projects/Web%20Shi/sectors-hackathon/backend/app/agent/financial_engine.py#L132-L155)):**
   - **Kriteria 6 (Current Ratio):** Formula akuntansi Piotroski mensyaratkan perbandingan *Current Assets* terhadap *Current Liabilities*. Karena Sectors API tidak selalu menyediakan kedua metrik ini per kuartal, kode menggantinya dengan:
     ```python
     if assets_curr and debt_curr is not None and assets_curr > debt_curr:
         score += 1
     elif assets_curr:
         score += 1 # <-- LOGICAL BUG: Jika liabilitas tidak ada, otomatis diberi 1 poin hanya karena ada total aset!
     ```
   - **Kriteria 7 (Dilusi Saham):** Jika data tahun sebelumnya (`shares_prev`) kosong, kode memberikan *default point* +1.
   - *Dampak:* Emiten dengan data tidak lengkap akan mendapatkan skor dasar 3-4 secara cuma-cuma (*artificially inflated score*).
2. **Deviasi Valuasi P/E Band Tidak Sesuai Dokumen:**
   Dokumen mengklaim menghitung rentang $+2\sigma$ hingga $-2\sigma$. Pada kenyataannya, kode [`compute_pe_historical_band`](file:///d:/Projects/Web%20Shi/sectors-hackathon/backend/app/agent/financial_engine.py#L268-L274) hanya menghitung $\pm 1\sigma$ dan memakai *hardcoded threshold* $\pm 0.5\sigma$ untuk melabeli `UNDERVALUED` / `OVERVALUED`.

---

### 5. ⚖️ Uji Nilai Riil Investor vs Gimmick AI (Real-World Usability: Bobot 40%)

| Modul / Fitur | Klasifikasi | Evaluasi Kegunaan Riil untuk Analis/Investor |
|---|:---:|---|
| **Peer Battle Terminal (`/battle`)** | **High Utility (Riil)** | **Sangat Berguna.** Memecahkan friksi komparasi fundamental multi-emiten se-subsektor secara instan tanpa harus membuka 4 laporan keuangan terpisah. |
| **Deterministik Quant Metrics** | **High Utility (Riil)** | **Sangat Berguna.** Mencegah halusinasi angka rasio finansial yang sering terjadi jika meminta ChatGPT/Claude menghitung P/E atau PBV. |
| **Smart Money & Broker Flow (`/smart-money`)** | **High Utility (Riil)** | **Sangat Berguna.** Investor IDX sangat bergantung pada data bandarologi dan aliran dana asing (Foreign Flow 14 hari) untuk konfirmasi momentum. |
| **Multimodal Chart Vision (Gemini)** | **Medium Utility** | Berguna untuk *quick technical glance*, namun rentan salah baca angka harga jika resolusi screenshot buruk. |
| **AI Agent Planner DAG** | **Gimmick / Overclaimed** | **Gimmick.** Diklaim sebagai *"Autonomous Reasoning DAG Planner"*, tetapi sebenarnya adalah rangkaian `if-elif-else` dengan pencarian regex kata kunci statis. |
| **1-Click Notion Sync** | **Feature Polish / Minor Gimmick** | Berguna jika pengguna memiliki API key Notion, namun *gimmick* jika menghasilkan URL palsu tanpa notifikasi error yang jujur saat kunci tidak terpasang. |

---

### 6. 🛠️ Actionable Recommendations (Perbaikan Mendesak Sebelum Final Submission Freeze)

Agar repositori AlphaSector mampu bersaing untuk meraih podium tertinggi pada kriteria **Technical Depth (30%)** dan **Real-World Usability (40%)**, segera lakukan 4 perbaikan ini:

1. **Hapus Mock Interceptor di `tools.py`:**
   Biarkan kueri `esg` atau `growth` memanggil Sectors API secara dinamis (`/companies/?where=...`) alih-alih mengembalikan `TRADE_IDEAS_MOCK_DATA`. Ini membuktikan transparansi 100% tanpa manipulasi data demo.
2. **Implementasikan Fallback SQLite Lokal pada `database.py`:**
   Ubah fungsi `get_db_connection()` agar jika `DATABASE_URL` tidak didefinisikan di `.env`, sistem otomatis menggunakan database SQLite lokal (`sqlite3` / `aiosqlite`) di folder proyek. Juri yang menguji *clone & run* tidak boleh terhalang oleh *database connection timeout*.
3. **Sinkronkan Dokumentasi `have-built` dengan Kode Nyata:**
   - Hapus klaim penggunaan LangChain jika memang menggunakan *lightweight API call*. Ketiadaan LangChain justru merupakan **kelebihan arsitektur** (lebih cepat, minim overhead dependensi bloat).
   - Jelaskan secara jujur bahwa Planner menggunakan *Hybrid Rule-based Classifier* yang deterministik dan cepat, lalu diikuti oleh LLM Synthesizer. Kejujuran teknis (*technical honesty*) berbobot sangat tinggi di mata juri *Principal Engineer*.
4. **Perbaiki Validasi Notion Export:**
   Jika pengguna belum memasang Notion API Key, tampilkan pesan validasi di UI (*"Silakan masukkan Notion API Key & Database ID di modal"*), jangan mengembalikan mock URL dummy `notion.so/...-preview`.