# 🎯 Core Features & Practical Use Cases

Dokumen ini menjabarkan 5 fitur utama **SektorIQ** beserta spesifikasi use-case nyata dan alur kerja data dari Sectors Financial API v2.

---

## 🌟 1. Fitur 1: Emiten 360° — One-Click Autonomous Deep Dive

### 🎯 Tujuan
Mengubah proses riset 1 emiten yang biasanya memakan waktu berjam-jam menjadi ringkasan komprehensif berbobot analis institusi dalam 5 detik.

### 🔄 Alur Kerja Data
1. User mengetik ticker (misal: `ASII` atau `TLKM`).
2. Agent memanggil endpoint:
   * `/v2/company/report/{symbol}/?sections=overview,valuation,financials,peers`
   * `/v2/company/segments/{symbol}/` (untuk diagram alir Sankey revenue streams)
   * `/v2/broker-summary/{symbol}/top/` (untuk komposisi broker akumulasi)
   * `/v2/company/ipo/{symbol}/` (kinerja historis)
3. UI merender:
   * **Radar Skor Fundamental & Valuasi** (PE, PBV, ROE, DER, Div Yield).
   * **Sankey Revenue Breakdown** (dari divisi mana emiten meraup laba terbesar).
   * **Naratif AI:** Executive Summary, Katalis Pertumbuhan, Faktor Risiko, dan Status Arus Kas.

---

## ⚔️ 2. Fitur 2: Peer Battle & Subsector Radar

### 🎯 Tujuan
Membandingkan 2 sampai 4 emiten dalam industri yang sama secara objektif dan matematis (misal: *Big 4 Banks: BBCA vs BBRI vs BMRI vs BBNI* atau *Coal Titans: ADRO vs PTBA vs ITMG*).

### 🔄 Alur Kerja Data
1. User meminta: *"Bandingkan bank BUMN: BBRI vs BMRI vs BBNI, mana yang valuasinya paling terdiskon dan dividend yield tertinggi?"*
2. Agent Planner menentukan subsektor (`banks`), menarik data valuasi dan dividen untuk ketiga emiten.
3. Comparator Engine menghitung deviasi rasio terhadap median industri.
4. UI merender:
   * **Tabel Komparasi Head-to-Head Interaktif** dengan warna indikator hijau/merah.
   * **Sintesis Naratif:** Siapa pemenang dari segi efisiensi (NIM/BOPO), siapa pemenang valuasi termurah (PBV), dan siapa yang menawarkan proteksi dividen terbaik.

---

## 🕵️ 3. Fitur 3: Smart Money & Institutional Flow Tracker

### 🎯 Tujuan
Mendeteksi apakah saham sedang diakumulasi oleh pemodal besar (*Smart Money / Foreign Funds*) sebelum pergerakan harga terjadi.

### 🔄 Alur Kerja Data
1. Agent memanggil:
   * `/v2/brokers/top/?cohort=institutional&metric=gross`
   * `/v2/broker-summary/{symbol}/foreign-flow/` (tren aliran asing 14–90 hari)
   * `/v2/filings/?symbol={symbol}&transaction_type=buy` (transaksi orang dalam & institusi)
2. Agent menganalisis pola akumulasi vs harga.
3. UI merender:
   * **Grafik Net Foreign Inflow vs Pergerakan Harga**.
   * **Top 5 Broker Pembeli Terbesar** (Domestik vs Asing).
   * **Smart Money Signal Badge:** *Heavy Accumulation / Neutral / Distribution*.

---

## 🔍 4. Fitur 4: Natural Language Screener & Trade Ideas Radar

### 🎯 Tujuan
Memungkinkan pengguna menyaring 900+ saham BEI hanya dengan instruksi bahasa sehari-hari atau memilih preset *Trade Ideas* bawaan Sectors.

### 🔄 Preset Trade Ideas Bawaan (One-Click Radar):
* 🌿 **ESG Leaders:** Emiten dengan skor tata kelola & keberlanjutan tertinggi (`where=esg_score IS NOT NULL`).
* 🚀 **Revenue Growth Leaders:** Pertumbuhan omset tercepat (`where=revenue[2024] > revenue[2023]`).
* 👑 **Large Single-Shareholder:** Kepemilikan kuat satu entitas $\ge 70\%$ (`where=major_shareholders >= 0.70`).
* ⚡ **Efficient Operators:** Laba bersih per karyawan tertinggi (`where=earnings / employee_num`).
* 💎 **High Dividend Yield:** SGX & IDX dividend champions di atas 5-8%.

---

## 📄 5. Fitur 5: Exportable Research Dossier (PDF & Markdown)

### 🎯 Tujuan
Memudahkan analis dan investor membagikan hasil riset ke tim, klien, atau media sosial.

### 🔄 Fitur:
* Tombol **"Export Research Brief"** menghasilkan file PDF atau Markdown terformat rapi dengan kop profesional, tabel metrik, grafik visual, dan **Disclaimer Regulasi Keuangan OJK/BEI** yang jelas.
