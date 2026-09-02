# 🧪 Sectors Financial API v2 - Live Test Results & Verification

Laporan ini merangkum hasil pengujian langsung (*live verification*) seluruh modul utama Sectors Financial API v2 menggunakan `SECTORS_API_KEY`.

---

## 📊 Ringkasan Hasil Pengujian

| No | Modul / Endpoint | Method & URL | Status | Latency | Output Payload Sample |
|---|---|---|---|---|---|
| 1 | **Helper Lists (Subsectors)** | `GET /v2/subsectors/` | `200 OK` | ~450ms | 33 subsektor (`banks`, `heavy-constructions`, dll.) |
| 2 | **Structured Screener** | `GET /v2/companies/?where=sub_sector = 'banks'&order_by=-market_cap&limit=5` | `200 OK` | ~770ms | `BBCA.JK`, `BBRI.JK`, `BMRI.JK`, `BBNI.JK` |
| 3 | **Natural Language Screener (`q`)** | `GET /v2/companies/?q=top 3 coal mining companies by revenue in 2023` | `200 OK` | ~670ms | Hasil AI RAG translation: `AADI.JK`, `DSSA.JK`, `BYAN.JK` |
| 4 | **Company Report** | `GET /v2/company/report/BBCA/?sections=overview,valuation,financials,peers` | `200 OK` | ~640ms | Detail profil, valuasi PBV/PE, rasio keuangan, peers |
| 5 | **Broker Registry** | `GET /v2/brokers/` | `200 OK` | ~420ms | 88 broker terdaftar (kode, nama, asing/domestik, lisensi) |
| 6 | **Top Brokers Daily** | `GET /v2/brokers/top/` | `200 OK` | ~500ms | Peringkat broker harian berdasarkan *gross trade* / net flow |
| 7 | **Broker Summary Top** | `GET /v2/broker-summary/BBCA/top/` | `200 OK` | ~640ms | Broker akumulasi (`top_buyers`) & distribusi (`top_sellers`) |
| 8 | **Top Movers** | `GET /v2/companies/top-changes/?periods=7d&n_stock=5` | `200 OK` | ~850ms | Saham `top_gainers` & `top_losers` periode 7 hari |
| 9 | **SGX Screener** | `GET /v2/sgx/companies/` | `200 OK` | ~1200ms | Daftar emiten bursa Singapura |
| 10 | **SGX Report** | `GET /v2/sgx/company/report/D05/` | `200 OK` | ~1800ms | Fundamental DBS Group Holdings Ltd (`D05.SI`) |
| 11 | **KLSE Sectors** | `GET /v2/klse/sectors/` | `200 OK` | ~1500ms | 24 sektor Bursa Malaysia |
| 12 | **Mining Commodities** | `GET /v2/mining/commodities/` | `200 OK` | ~2700ms | 18 komoditas (Gold, Silver, Coal, Nickel, dll.) sejak 1968 |
| 13 | **Mining Sites & Reserves** | `GET /v2/mining/sites/` | `200 OK` | ~940ms | Data site tambang ESDM, lokasi (provinsi/kabupaten), cadangan |

---

## 🔍 Temuan Penting & Karakteristik API v2

### 1. Perbedaan Query Screener: Structured vs Natural Language
* **Structured Query (`where` & `order_by`):**
  * Sintaks menggunakan operator SQL standar: `=` (bukan `==`), `!=`, `>`, `<`, `like`, `in`.
  * Mendukung aritmatika dan bracket notation tahun: `revenue[2023] / total_assets[2023] > 0.15`.
  * Biaya kuota: **1 kredit**.
* **Natural Language Query (`q` parameter):**
  * Menerima instruksi bebas bahasa Inggris / Indonesia (misal: `"top 3 coal mining companies by revenue in 2023"`).
  * API mengembalikan response beserta `llm_translation` yang memperlihatkan bagaimana query diterjemahkan ke filter terstruktur.
  * Biaya kuota: **3 kredit**.

### 2. Header & Autentikasi
* Header autentikasi:
  ```http
  Authorization: <SECTORS_API_KEY>
  ```
  *(Format tanpa prefix `Bearer` didukung penuh, cukup masukkan raw key).*

### 3. Payload File Contoh Disimpan
Semua sampel response JSON riil dari pengujian ini telah disimpan di folder:
`exploration/sample_responses/`
* `idx_screener_structured_banks.json`
* `idx_screener_nl_query.json`
* `idx_company_report_bbca.json`
* `idx_brokers_registry.json`
* `idx_top_brokers.json`
* `idx_broker_summary_top_bbca.json`
* `idx_top_movers_7d.json`
* `sgx_screener.json`
* `sgx_report_d05.json`
* `klse_sectors.json`
* `mining_commodities.json`
* `mining_sites.json`
* `test_summary.json`
