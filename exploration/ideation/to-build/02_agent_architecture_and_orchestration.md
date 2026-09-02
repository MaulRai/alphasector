# 🧠 Agent Architecture & Custom Orchestration

File ini mendefinisikan arsitektur teknis **Custom Agent Orchestrator** yang menjadi inti kelulusan dan nilai teknis utama di **Track 01: AI Agents & Assistants**.

---

## 1. High-Level Multi-Step Reasoning Flow

```mermaid
graph TD
    User([User Prompt: "Bandingkan valuasi & broker flow BBCA vs BBRI, mana yang lebih menarik untuk dividen?"]) --> Router

    subgraph ORCHESTRATOR["Custom Multi-Step Agent Orchestrator (Backend App)"]
        Router{1. Intent Router & Task Planner}
        
        Router -->|Intent: Peer Comparison + Broker Flow| PlanGraph[2. Execution Plan Graph Generator]
        
        PlanGraph --> Step1[Step 1: Fetch BBCA & BBRI Reports]
        PlanGraph --> Step2[Step 2: Fetch Peer Subsector Banks Overview]
        PlanGraph --> Step3[Step 3: Fetch Broker Accumulation & Foreign Flow]

        subgraph TOOL_EXEC["Custom Tool Execution Engine"]
            Step1 --> T1["sectors_get_company_report('BBCA')"]
            Step1 --> T2["sectors_get_company_report('BBRI')"]
            Step2 --> T3["sectors_screen_companies(where=\"sub_sector = 'banks'\")"]
            Step3 --> T4["sectors_get_broker_summary('BBCA')"]
            Step3 --> T5["sectors_get_broker_summary('BBRI')"]
        end

        T1 & T2 & T3 & T4 & T5 --> CompEngine[3. Quantitative Comparator Engine]
        
        CompEngine --> MetricMatrix[Calculate: PE Gap, PBV Gap, ROE, Div Yield, Net Foreign 14D]
        
        MetricMatrix --> Synthesizer[4. Synthesizer & Fact-Grounding Agent]
        
        Synthesizer --> Guardrail[5. Hallucination Guardrail & Citation Injector]
    end

    TOOL_EXEC <==> SECTORS_API[(Sectors REST API v2)]
    
    Guardrail --> UIOutput([UI Output: Interactive Comparison Cards + Live Reasoning Timeline + Markdown Brief + Disclaimer])

    style ORCHESTRATOR fill:#f4f6ff,stroke:#3b82f6,stroke-width:2px
    style TOOL_EXEC fill:#eff6ff,stroke:#2563eb,stroke-width:1px
    style SECTORS_API fill:#fff7ed,stroke:#ea580c,stroke-width:2px
```

---

## 2. Rincian Komponen Custom Orchestrator

### 🔹 Komponen 1: Intent Router & Planner (Task Decomposition)
* Menganalisis query pengguna (Bahasa Indonesia / Inggris) dan memecahnya menjadi langkah-langkah independen (*DAG / Directed Acyclic Graph*).
* **Intent Types:**
  1. `SINGLE_TICKER_DEEP_DIVE`: Analisis mendalam 1 emiten (fundamental, valuasi, segmen bisnis, kepemilikan).
  2. `PEER_BATTLE_COMPARISON`: Komparasi head-to-head 2 atau lebih emiten dalam satu subsektor.
  3. `MARKET_SCREENING_DISCOVERY`: Pencarian emiten dengan kriteria khusus (misal: Dividend yield $> 5\%$ + PBV $< 1.5$).
  4. `SMART_MONEY_RADAR`: Analisis akumulasi broker institusi & *foreign flow*.
  5. `COMMODITY_MACRO_IMPACT`: Analisis korelasi harga komoditas (emas, nikel, batubara) terhadap emiten tambang terkait.

---

### 🔹 Komponen 2: Custom Tool Execution Engine & Credit Optimizer
* Memanggil Sectors REST API secara efisien dan paralel untuk menghemat waktu respon dan kuota kredit.
* **Strategi Optimasi Kredit & Latensi:**
  * Gunakan structured query (`where`, `order_by`) seharga **1 kredit** alih-alih `q` (3 kredit) untuk parameter yang telah dipetakan.
  * Caching in-memory (TTL 10 menit) untuk data statis seperti `/subsectors/`, `/industries/`, dan `/brokers/`.
  * Asynchronous batch requests menggunakan Python `asyncio` + `httpx` (atau `requests` with connection pooling).

---

### 🔹 Komponen 3: Deterministic Quantitative Comparator
* Bagian ini melakukan komparasi **matematis murni** sebelum data diserahkan ke LLM, mencegah LLM salah menghitung persentase atau ranking:
  $$\text{PE Difference} = \text{PE}_{\text{emiten}} - \text{PE}_{\text{industry\_median}}$$
  $$\text{Dividend Score} = \text{Dividend Yield} \times \text{Payout Ratio Consistency}$$
  $$\text{Smart Money Score} = \frac{\text{Net Institutional Buy (14d)}}{\text{Average Daily Turnover}}$$

---

### 🔹 Komponen 4: Synthesizer & Fact-Grounding Engine
* Mengubah angka-angka terstruktur menjadi analisis naratif berkualitas tinggi berbahasa Indonesia.
* **Format Output Terstruktur:**
  1. 📌 **Executive Summary & Verdict**
  2. 📊 **Key Metrics & Peer Ranking Matrix**
  3. 🏛️ **Smart Money & Institutional Flow Pulse**
  4. ⚠️ **Risiko Kunci & Katalis Positif**
  5. ⚖️ **Mandatory Regulatory Disclaimer**

---

### 🔹 Komponen 5: State & Memory Management
* Menyimpan sesi chat, riwayat analisis, watchlist pengguna, dan custom tag/catatan portofolio pengguna.
* Memungkinkan percakapan multi-turn lanjutan (misal: *"Bagaimana jika dibandingkan dengan BMRI?"* -> Agent mempertahankan konteks BBCA & BBRI dari pertanyaan sebelumnya).

---

## 3. Visualisasi "Live Thinking Trace" di UI

Untuk memenuhi kriteria **Technical Depth (30%)** dan **Video Demo Storytelling (30%)**, antarmuka web menampilkan accordion interaktif: **"Agent Thought Process"**:

```json
[
  {"step": 1, "action": "Intent Classified", "detail": "PEER_BATTLE_COMPARISON (BBCA vs BBRI)"},
  {"step": 2, "action": "Fetching Data", "detail": "GET /v2/company/report/BBCA/ (overview, valuation, financials)"},
  {"step": 3, "action": "Fetching Data", "detail": "GET /v2/company/report/BBRI/ (overview, valuation, financials)"},
  {"step": 4, "action": "Analyzing Broker Flow", "detail": "GET /v2/broker-summary/BBCA/top/ & BBRI/top/"},
  {"step": 5, "action": "Computing Valuation Gap", "detail": "BBCA PE (21.4x) vs BBRI PE (11.2x) vs Sector Avg (14.5x)"},
  {"step": 6, "action": "Synthesizing Brief", "detail": "Generating structured markdown report in Bahasa Indonesia"}
]
```
Juri dapat melihat secara visual bagaimana agent berpikir, memanggil API, mengolah data, dan menyusun laporan akhir.
