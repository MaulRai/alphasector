# 💡 Sectors Hackathon: Use Cases & Project Ideas

Berdasarkan dataset, API endpoints, dan fitur yang disediakan oleh Sectors.app, berikut adalah pemetaan use-case dan ide proyek bernilai tinggi yang dapat dibangun untuk hackathon:

---

## 1. 🤖 AI Financial Analyst & Autonomous Agent (MCP / Multi-Agent)
* **Konsep:** Membangun AI Agent berbasis LLM yang memanfaatkan **Sectors MCP Server** atau Function Calling API untuk melakukan riset fundamental saham secara otomatis.
* **Fitur Utama:**
  * User memberikan prompt: *"Analisis perbandingan emiten perbankan big 4 (BBCA, BBRI, BMRI, BBNI) dari sisi profitabilitas, NPL, dan valuasi saat ini, lalu berikan rekomendasi."*
  * Agent memanggil endpoint `/v2/company/report/{symbol}/` dan `/v2/companies/?sub_sector=banks` secara otomatis.
  * Agent merangkum *executive summary*, risiko, dan katalis positif.
* **Komponen Teknis:** Next.js / Streamlit + Sectors API + LangChain / CrewAI / Google Gemini API.

---

## 2. 🕵️ IDX Broker & Foreign Flow Tracking Radar (Bandarmology / Smart Money)
* **Konsep:** Dashboard visual real-time untuk mendeteksi akumulasi & distribusi tersembunyi oleh broker institusi / asing (*Smart Money*).
* **Fitur Utama:**
  * **Top Accumulation / Distribution:** Menampilkan saham mana saja yang sedang diakumulasi secara masif oleh broker tertentu (misal: `AK`, `YP`, `CC`, `MG`) menggunakan `/v2/broker-activity/top/`.
  * **Net Foreign Inflow Tracker:** Visualisasi aliran dana asing harian vs pergerakan harga saham (`/v2/broker-summary/foreign-flow/{symbol}/`).
  * **Smart Money Alerts:** Notifikasi ketika ada lonjakan akumulasi yang anomali dibanding rata-rata 14 hari.

---

## 3. 📊 Interactive Financial Intelligence & Sankey Revenue Visualizer
* **Konsep:** Platform visualisasi interaktif yang membongkar dari mana sebenarnya pendapatan dan laba perusahaan berasal.
* **Fitur Utama:**
  * Menggunakan endpoint `/v2/company/segments/{symbol}/` untuk menggambar diagram **Sankey** (Revenue Streams -> Gross Profit -> Operating Expenses -> Net Income).
  * Komparasi segmen bisnis antar kompetitor dalam satu industri (misal: `ASII` otomotif vs pertambangan vs jasa keuangan).
  * Filter multi-year untuk melihat evolusi diversifikasi bisnis emiten.

---

## 4. ⛏️ Indonesian Mining & Energy Transition Intelligence Portal
* **Konsep:** Portal komprehensif yang mengintegrasikan data pasar modal emiten tambang dengan data fisik/operasional ESDM Minerba.
* **Fitur Utama:**
  * **Peta Sebaran Tambang (GIS Map):** Visualisasi koordinat site tambang (`/v2/mining/sites/`) dengan data cadangan (*resources & reserves*) nikel, batubara, tembaga, emas.
  * **Korelasi Harga Komoditas & Kinerja Saham:** Menghubungkan tren harga komoditas global (`/v2/mining/commodities/price/`) dengan laba bersih dan pergerakan harga saham emiten terkait.
  * **Auction & License Tracker:** Memantau lelang WIUP baru dari Minerba ESDM (`/v2/mining/auctions/`) untuk mendeteksi ekspansi aset emiten.

---

## 5. 🌏 Southeast Asia Cross-Market Screener (IDX vs SGX vs KLSE)
* **Konsep:** Screener lintas negara untuk membandingkan valuasi dan performa sektor antar bursa di ASEAN.
* **Fitur Utama:**
  * Membandingkan sektor perbankan regional (contoh: `BBCA` di Indonesia vs `D05` DBS di Singapura vs `1155` Maybank di Malaysia).
  * Mengidentifikasi anomali valuasi (misal: PBV/PE gap antar emiten sejenis di regional).
  * Fitur *Natural Language Screener* multi-bahasa (Inggris, Indonesia).
