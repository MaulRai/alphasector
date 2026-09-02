# 💡 Sectors.app Trade Ideas - Deep Dive & API Implementation

Dokumen ini memetakan seluruh menu kurasi **Trade Ideas** yang ada pada UI Sectors.app (Indonesia, Singapore, dan Breakdown Sektor) ke endpoint dan parameter Sectors Financial API v2.

---

## 🧭 Arsitektur Trade Ideas di Sectors.app

Setiap *Trade Idea* di platform Sectors ditenagai oleh kombinasi:
1. **Screener Structured Query (`where` & `order_by`)**
2. **Screener Natural Language Query (`q`)**
3. **Broker Flow & Insider Trading Filings API**
4. **SGX & KLSE Curated Top Rankings**

---

## 🇮🇩 1. Indonesia Trade Ideas

| Trade Idea | Konsep & Definisi | Endpoint & Query API v2 | Contoh Top Emiten (Live) |
|---|---|---|---|
| **🌱 ESG Leaders** | Perusahaan dengan praktik *Environmental, Social, & Governance* terkuat di Indonesia | `GET /v2/companies/`<br>`where=esg_score IS NOT NULL`<br>`order_by=-esg_score` | `SGER.JK`, `MCOL.JK`, `FIRE.JK`, `CUAN.JK` |
| **📈 Revenue Growth Leaders** | Saham dengan pertumbuhan pendapatan (*YoY revenue growth*) tertinggi dari angka penjualan terbaru | `GET /v2/companies/`<br>`where=revenue[2024] IS NOT NULL and revenue[2023] IS NOT NULL and revenue[2024] > revenue[2023]`<br>`order_by=-(revenue[2024]/revenue[2023])` | `ABMM.JK`, `COIN.JK`, `BTPS.JK`, `REAL.JK`, `BANK.JK` |
| **🏛️ Smart Money Buying** | Saham yang diakumulasi secara signifikan oleh broker institusi, fund manager, dan foreign flow | `GET /v2/brokers/top/?cohort=institutional&metric=gross`<br>`GET /v2/filings/?holder_type=institution&transaction_type=buy`<br>`GET /v2/broker-summary/{symbol}/foreign-flow/` | Broker Institusi: `AK`, `YP`, `ZP`, `MG`, `YU` |
| **📉 Cheaper than Peers** | Saham yang diperdagangkan pada valuasi rasio P/E atau PBV di bawah rata-rata *peer group* industrinya | `GET /v2/company/report/{symbol}/?sections=valuation,peers`<br>`GET /v2/companies/` dengan `pe < industry_avg_pe` | Emiten *undervalued* per industri |
| **👑 Large Single-Shareholder** | Saham dengan kepemilikan terkonsentrasi di mana 1 entitas memegang $\ge 70\%$ saham perusahaan | `GET /v2/companies/`<br>`where=executives_shareholdings_share_percentage >= 0.70 OR major_shareholders_share_percentage >= 0.70`<br>`order_by=-market_cap` | `BRPT.JK`, `PANI.JK`, `CUAN.JK`, `ICBP.JK`, `HMSP.JK` |
| **⚡ Efficient Operators** | Perusahaan dengan laba bersih per karyawan (*net income per employee*) tertinggi di sektornya | `GET /v2/companies/`<br>`where=earnings[2024] IS NOT NULL and employee_num > 50`<br>`order_by=-(earnings[2024]/employee_num)` | `PNIN.JK`, `SRTG.JK`, `PTBA.JK`, `SMMA.JK`, `BUMI.JK` |

---

## 🇸🇬 2. Singapore (SGX) Trade Ideas

| Trade Idea | Konsep & Definisi | Endpoint & Query API v2 | Contoh Top Emiten (Live) |
|---|---|---|---|
| **🚀 1-Month Leaders** | Saham SGX dengan performa kenaikan harga terbaik selama 30 hari terakhir | `GET /v2/sgx/companies/top-changes/?periods=30d` | Top gainers bursa Singapura periode 1 bulan |
| **🏔️ All-Time Highs** | Saham SGX yang baru saja mencetak rekor harga tertinggi sepanjang masa (*ATH*) | `GET /v2/sgx/companies/?q=SGX stocks at all time high` | Emiten pada harga puncak historis |
| **📊 Earnings Growth Leaders** | Saham SGX dengan pertumbuhan laba (*earnings*) terkuat | `GET /v2/sgx/companies/top/` (kategori `earnings`) | `TPED.SI`, `D05.SI` (DBS), `O39.SI` (OCBC), `Z74.SI` (Singtel), `K6S.SI` (Prudential) |
| **💰 High Dividend Yield** | Saham SGX dengan *trailing 12-month dividend yield* di atas 5% | `GET /v2/sgx/companies/top/` (kategori `dividend_yield`) | `T14.SI` (27.4%), `NTDU.SI` (12.0%), `9A4U.SI` (9.6%), `K71U.SI` (8.9%) |
| **🌊 Most Active by Volume** | Saham SGX paling aktif diperdagangkan berdasarkan volume transaksi 90 hari | `GET /v2/sgx/companies/top/` | Saham dengan likuiditas volume harian terbesar |
| **💼 Recent Insider Buys** | Saham SGX yang memiliki transaksi pembelian oleh orang dalam (*insiders*) atau *major holders* dalam 1 bulan terakhir | `GET /v2/sgx/filings/?transaction_type=buy` | `H07.SI` (Ow Chio Kiat), `F99.SI` (Stellar Asset Investment) |

---

## 🏭 3. By Industry & Sector Count Breakdown

Jumlah emiten yang dapat difilter langsung per subsektor / industri di API Sectors:

### 🇮🇩 Indonesia (IDX)
* **Banks:** 40+ emiten (`where=sub_sector = 'banks'`)
* **Basic Materials:** 110+ emiten (`where=sector = 'basic-materials'`)
* **Oil, Gas & Coal:** 90+ emiten (`where=sub_sector = 'oil-gas-coal'`)
* **Utilities:** 10+ emiten (`where=sector = 'utilities'`)
* **Software & IT Services:** 30+ emiten (`where=sub_sector = 'software-it-services'`)
* **Real Estate Development & Management:** 90+ emiten
* **Plantations & Crops:** 30+ emiten
* **Hotels, Resorts & Cruise Lines:** 20+ emiten
* **Heavy Constructions & Civil Engineering:** 20+ emiten
* **Logistics & Deliveries:** 20+ emiten
* **Coal Production:** 20+ emiten

### 🇸🇬 Singapore (SGX)
* **REIT (Real Estate Investment Trusts):** 40+ emiten
* **Financial Services:** 20+ emiten
* **Technology:** 60+ emiten
* **Industrials:** 130+ emiten
* **Consumer Cyclicals:** 80+ emiten
* **Healthcare:** 40+ emiten

---

## 💻 4. Cara Menjalankan Script Pengujian Trade Ideas

Script Python untuk mengeksekusi seluruh query Trade Ideas di atas secara otomatis telah tersedia di:
[`exploration/scripts/test_trade_ideas.py`](file:///d:/Projects/Web%20Shi/sectors-hackathon/exploration/scripts/test_trade_ideas.py)

Jalankan dengan perintah:
```powershell
.venv\Scripts\python.exe exploration\scripts\test_trade_ideas.py
```
