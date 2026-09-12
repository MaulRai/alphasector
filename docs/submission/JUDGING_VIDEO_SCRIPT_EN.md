# AlphaSector — Official 3-Minute Judging Walkthrough Script (English Edition)

**Track**: Track 01 — AI Agents & Assistants (Sectors Hackathon 2026)  
**Target Duration**: Exactly 03:00 (180 Seconds)  
**Language**: English (Verbatim Voiceover Narration & 100% English On-Screen Typography)  
**Pacing / Cadence**: ~135 Words/Minute (~405 Words Total) — Wall Street Equity Research / Tech Lead Tone: Confident, Authoritative, Energetic  
**Video Resolution**: 1080p60 (1920x1080 @ 60fps) or 4K60 (3840x2160 @ 60fps), 16:9 Widescreen  
**Audio Target**: Integrated Loudness -14 LUFS (True Peak -1.0 dBTP), 48kHz / 24-bit  
**Live Demo URL**: `http://localhost:3000` (or deployed URL)  
**Backend API**: `http://localhost:8000` (FastAPI + Sectors Financial API v2)

---

## 1. Timeline & Structure Overview

## 1. Timeline & Structure Overview

| Segment | Timestamp | Duration | Core Feature & Focus | UI Route |
| :--- | :--- | :--- | :--- | :--- |
| **Segment 1** | 0:00 - 0:30 | 30s | **The Problem & Zero-Friction Entry**<br>Information overload across 900+ IDX stocks, fragmented PDFs, AlphaSector intro & 1-Click Demo Login. | `/` (Landing Page)<br>AuthGate Modal |
| **Segment 2** | 0:30 - 1:10 | 40s | **Multi-Step Agent Reasoning & Dynamic DAG**<br>Autonomous reasoning at `/alpha-agent`, `LiveThinkingTrace`, concurrent Sectors API dispatch, grounded synthesis. | `/alpha-agent` |
| **Segment 3** | 1:10 - 1:50 | 40s | **Deterministic Quant & Minerba Deep Intelligence**<br>Peer Battle at `/battle`, Stanford 9-criteria Piotroski F-Score, P/E Bands, plus Strip Ratio & JORC Reserves at `/company/ADRO`. | `/battle`<br>`/company/ADRO` |
| **Segment 4** | 1:50 - 2:30 | 40s | **Smart Money 2.0 Forensic & 1-Click Notion Sync**<br>4-Pillar Radar at `/smart-money` (Bandarmology, Insider Filings, KSEI Institutional Ownership, Suspensions), Notion memo export. | `/smart-money`<br>Notion Modal |
| **Segment 5** | 2:30 - 3:00 | 30s | **The Future of Equity Research & Closing**<br>Product vision, responsible FinTech standards (Zero Automated Trading) & GitHub call-to-action. | Workspace Showcase<br>Wrap-up |

---

## 2. Timecoded Script & Visual Storyboard

---

### SEGMENT 1: The High-Stakes Problem & Zero-Friction Entry (0:00 - 0:30)
* **Duration**: 30 Seconds
* **Objective**: Establish the core real-world pain point in the Indonesian equity market (900+ listed companies, unstructured PDFs, manual financial math), introduce AlphaSector, and open instant access to a unified research workspace.

#### Visual Screen Actions & Clicks:
1. **[0:00 - 0:06] B-Roll / Screen Capture**: Display a screen overflowing with 20+ open browser tabs: complex Indonesian annual report PDFs, cluttered financial spreadsheets, and disjointed price charts. The mouse moves erratically, illustrating the frustration of manual equity research.
2. **[0:06 - 0:14] Smooth Transition**: Smooth zoom-in cut directly to AlphaSector’s Landing Page (`localhost:3000`). Highlight the Deep Obsidian theme (`#07090e`) with vibrant neon emerald and cyan glows. Cursor hovers gently over the hero headline: *"Autonomous Equity Research Agent for Indonesian Capital Markets"*.
3. **[0:14 - 0:22] Quick Feature Tour**: Smooth scroll down revealing the 5 core modules (Alpha Agent Workspace, Peer Battle Terminal, Screener Pro, Smart Money 2.0, Minerba Suite, and Notion Sync).
4. **[0:22 - 0:30] AuthGate & 1-Click Login**: Click the navigation button toward `/alpha-agent`. The elegant `AuthGate` modal appears. Cursor clicks the glowing emerald button: **"1-Click Demo Login (Instant Access)"** (`demo@alphasector.id`). In under 500ms, authentication succeeds and the workspace opens seamlessly.

#### On-Screen Graphics & English Text Overlays:
* `[0:02]` **Title Card**: `"900+ IDX Stocks • Hundreds of PDF Pages • Hours of Manual Research"`
* `[0:05]` **Persona Overlay**: **Built for**: *Indonesian Retail Investors & Equity Research Analysts*
* `[0:08]` **Brand Badge**: **AlphaSector Terminal** — *Track 01: AI Agents & Assistants*
* `[0:24]` **Highlight Banner**: **Instant Terminal Access** — *Unified Institutional Workspace*

#### Audio Design:
* BGM: Low-hum ambient mystery synth for the first 6 seconds, swelling into an upbeat modern tech corporate groove (115 BPM) as AlphaSector appears.
* SFX: Rapid paper rustling/keystrokes initially, followed by a crisp *digital whoosh* into AlphaSector, and an affirming *success chime* upon 1-click login.

#### Verbatim English Voiceover Narration:
> *"Analyzing over nine hundred publicly listed companies on the Indonesia Stock Exchange is an exhausting challenge. Analysts and retail investors are trapped in hundreds of dense, fragmented PDF disclosures and error-prone manual calculations.*
> 
> *Meet **AlphaSector**: the first autonomous equity research terminal purpose-built for the Indonesian market, powered by Sectors Financial API. With instant one-click access, an institutional-grade research workspace is ready in seconds."*

---

### SEGMENT 2: Multi-Step Agent Reasoning & Tool Calling at `/alpha-agent` (0:30 - 1:10)
* **Duration**: 40 Seconds
* **Objective**: Demonstrate Track 01 qualification by showcasing custom multi-step agent reasoning, dynamic DAG planning, parallel Sectors API calls, and grounded institutional synthesis on `/alpha-agent`.

#### Visual Screen Actions & Clicks:
1. **[0:30 - 0:38] Natural Language Prompt Input**: Cursor focuses on the `ChatInputBar`. Type naturally:
   `"Compare the valuation and financial health of BBRI vs BMRI"` and hit **Enter**.
2. **[0:38 - 0:52] Live Thinking Trace Inspection**: The `LiveThinkingTrace` and `AgentThinkingTrace` components expand immediately. Cursor highlights the dynamic autonomous execution stages:
   - **Phase 1 (PLANNING)**: Intent classified as `PEER_BATTLE_COMPARISON`, targets set to `BBRI` and `BMRI`.
   - **Phase 2 (FETCHING)**: Concurrent execution via `asyncio.gather` to Sectors API endpoints: `GET /company/report/BBRI` (~320ms) and `GET /company/report/BMRI` (~310ms).
   - **Phase 3 (COMPARING)**: Real-time mathematical ratio delta computation.
   - **Phase 4 (SYNTHESIZING)**: Groq LPU inference drafting grounded institutional findings.
   - Highlight latency & credit badge: `(1,520ms • 2 cr)`.
3. **[0:52 - 1:02] PeerBattleMatrix Presentation**: Scroll down to the side-by-side `PeerBattleMatrix`. Highlight key metrics: P/E, PBV, ROE, Net Profit Margin, and glowing green best-in-class badges (`bg-emerald-500/10 text-emerald-400`).
4. **[1:02 - 1:10] Autonomous Synthesis & Research Dossier**: Highlight the **Valuation Verdict** and **Key Findings**. Click the button on the right panel to slide open the **Research Dossier Artifact** drawer.

#### On-Screen Graphics & English Text Overlays:
* `[0:32]` **Prompt Callout**: `"Compare the valuation and financial health of BBRI vs BMRI"`
* `[0:40]` **Architecture Box**: **Custom Dynamic DAG Planner** — *Intent Classification & Parallel Sectors API*
* `[0:48]` **Telemetry Badge**: **Parallel Async Fetch**: `BBRI (320ms)` + `BMRI (310ms)` • Total Latency: `1.52s`
* `[0:56]` **Feature Tag**: **Peer Battle Matrix & Grounded Institutional Synthesis**

#### Audio Design:
* BGM: Modern rhythmic synth bassline driving analytical momentum.
* SFX: Rapid mechanical keyboard clicks, gentle digital resonance during DAG execution, and a double-snap click when the matrix and drawer open.

#### Verbatim English Voiceover Narration:
> *"In the Alpha Agent workspace, analysts simply ask in plain language. Notice this live Thinking Trace: AlphaSector is not a superficial prompt wrapper.*
> 
> *Our orchestrator autonomously classifies user intent, constructs a dynamic Directed Acyclic Graph, and dispatches parallel asynchronous calls to Sectors API in just hundreds of milliseconds.*
> 
> *The result is a rigorous, side-by-side comparative matrix across competing companies—highlighting multiples, margins, and capital efficiency—paired with an objective, hallucination-free institutional synthesis stored instantly as an interactive Research Dossier."*

---

### SEGMENT 3: Deterministic Quant Engine & Minerba Deep Intelligence (1:10 - 1:50)
* **Duration**: 40 Seconds
* **Objective**: Prove quantitative supremacy through pure deterministic computation (Piotroski & P/E Bands) and unveil the **Minerba Deep Intelligence Suite** (official Ministry of Energy and Mineral Resources / ESDM data) on Company 360°.

#### Visual Screen Actions & Clicks:
1. **[1:10 - 1:18] Navigate to `/battle`**: Click **"Peer Battle"** in the top Navbar. Click the preset button: **"The Big 4 Banks"** (`BBCA`, `BBRI`, `BMRI`, `BBNI`), then click the cyan button **"Run Peer Battle"**. In ~450ms, the full 4-way comparative table populates with unified historical metrics.
2. **[1:18 - 1:28] Drill Down to `/company/ADRO`**: Search or open commodity titan `ADRO` to view the Company 360° Profile. Scroll to the **Deterministic Quant Panel**:
   - Highlight the **Piotroski F-Score (Score: 7/9 PRIMA)** card across 9 accounting criteria.
   - Highlight the **P/E Historical Standard Deviation Band** showing the undervaluation discount.
3. **[1:28 - 1:50] Minerba Deep Intelligence Suite (ESDM Data)**: Scroll down to the **`MiningOperationalCard`**:
   - Highlight the **Strip Ratio Meter**: `3.9x` tagged as **Low-Cost Producer** (highly efficient overburden removal).
   - Highlight **JORC/KCMI Reserves**: Total `996.2 Mt` (Proven & Probable Reserves vs Total Resources).
   - Highlight **Reserve Life Index**: Automatic mine lifespan calculation (**~15.4 Years**).
   - Highlight official coal quality specifications: Calorific Value (4,843 kcal/kg), Moisture, and Low Sulphur (<1%).

#### On-Screen Graphics & English Text Overlays:
* `[1:12]` **Preset Tag**: **Preset Battle**: *The Big 4 Banks (4-Way Parallel Sectors Ingestion)*
* `[1:20]` **Formula Card**: **Piotroski F-Score Engine (0-9)**: *Profitability • Leverage • Operating Efficiency*
* `[1:30]` **ESDM Badge**: **Minerba Deep Intelligence Suite** — *Official Ditjen Minerba ESDM Data*
* `[1:38]` **Metric Callouts**: **Strip Ratio 3.9x** (Low-Cost Leader) • **JORC Reserves 996.2 Mt** • **Reserve Life ~15.4 Years**

#### Audio Design:
* BGM: Percussion tightens, conveying mathematical precision and institutional authority.
* SFX: Fast swoosh between routes, followed by a resonant *sub-bass hit* on Piotroski and a delicate chime as Minerba metrics appear.

#### Verbatim English Voiceover Narration:
> *"In Peer Battle and Company Profiles, our edge lies in our **Deterministic Quant Engine**—computing Piotroski health scores and historical valuation bands mathematically without LLM hallucinations.*
> 
> *For commodity and energy sectors powering one-third of IDX liquidity, AlphaSector unveils the **Minerba Deep Intelligence Suite**: integrating official Ministry of Energy and Mineral Resources (ESDM) data to evaluate Strip Ratios, JORC reserves, and mine life expectancy in seconds."*

---

### SEGMENT 4: Smart Money 2.0 Forensic Radar & 1-Click Notion Sync (1:50 - 2:30)
* **Duration**: 40 Seconds
* **Objective**: Showcase **Smart Money 2.0** with its 4-pillar forensic radar and 1-click Wall Street-grade Notion memorandum export.

#### Visual Screen Actions & Clicks:
1. **[1:50 - 1:58] Smart Money 2.0 (`/smart-money`)**: Navigate to `/smart-money`. Highlight the **Global 900+ Stock Selector** (select `TLKM`). Pan across the 4-pillar forensic switcher tabs.
2. **[1:58 - 2:12] Explore the 4 Forensic Pillars**:
   - **Pillar 1 (Bandarmology)**: Click analyze, showcasing Top 5 Accumulator vs Distributor brokers and Net Foreign Flow.
   - **Pillar 2 (Insider Filings)**: Switch to the *Insider Filings* tab, spotlighting **`INSIDER BUY / ACCUMULATION`** flags by Directors/Commissioners with transaction prices and official **IDX Disclosure PDF Links**.
   - **Pillar 3 (Institutional Ownership)**: Switch to *Institutional Ownership*, revealing exact KSEI custodian breakdowns: Pension Funds (BPJS-TK/Taspen), Mutual Funds, Insurance, Corporate vs Retail, with Local vs Foreign macro ratio bars.
   - **Pillar 4 (Suspensions Radar)**: Brief click on *IDX Suspensions Radar* monitoring trade halts and Unusual Market Activity (UMA).
3. **[2:12 - 2:30] 1-Click Institutional Notion Sync**: Click the **"Sync to Notion"** button with the `N` logo. The `NotionExportModal` opens. Click **"Sync Memo to Notion"**. In 1 second, a success checkmark appears. Switch to the Notion tab displaying a fully structured Wall Street investment memo (Executive Summary, Valuation Multiples, and Compliance Disclaimers).

#### On-Screen Graphics & English Text Overlays:
* `[1:52]` **Radar Card**: **Smart Money 2.0 Forensic Radar** — *4 Integrated Institutional Pillars*
* `[2:02]` **Compliance Badge**: **Insider Filings & KSEI Ownership** • *Official IDX Disclosure PDFs*
* `[2:14]` **Integration Box**: **1-Click Institutional Notion Sync** — *Wall Street-Grade Investment Memo*

#### Audio Design:
* BGM: Dynamic, steady tech flow.
* SFX: Soft radar sweep on Smart Money, crisp click on the Notion button, and a pleasant success chime upon sync completion.

#### Verbatim English Voiceover Narration:
> *"Our **Smart Money 2.0** tracks institutional footprints through a 4-pillar Forensic Radar: Bandarmology broker flows, insider filings with official IDX disclosure PDFs, real KSEI institutional ownership breakdown including pension and mutual funds, and exchange suspension alerts.*
> 
> *All research can be exported with a single click directly into Notion Workspaces as a Wall Street-caliber investment memorandum—fully ready for investment committees."*

---

### SEGMENT 5: The Future of Indonesian Equity Research & Closing (2:30 - 3:00)
* **Duration**: 30 Seconds
* **Objective**: Close the walkthrough with commanding authority: unifying the end-to-end workflow (Alpha Agent, Battle, Minerba, Smart Money 2.0, Notion), reinforcing responsible analytical intelligence (zero automated trading), and delivering a crisp, confident call-to-action.

#### Visual Screen Actions & Clicks:
1. **[2:30 - 2:40] Unified Workspace Showcase**: Cinematic smooth zoom-out across the cohesive AlphaSector terminal: from intelligent Alpha Agent reasoning, to the dynamic Peer Battle matrix, the ESDM Minerba cards, the Smart Money 2.0 forensic radar, and the Notion memo.
2. **[2:40 - 2:48] Responsible FinTech Assurance**: Brief highlight on the responsible analytics badge in the footer: confirming a steadfast commitment to pure decision-support intelligence with zero automated trade execution (Rule 12).
3. **[2:48 - 3:00] Hero Outro & Call-To-Action**: Transition to the Deep Obsidian closing canvas. The glowing AlphaSector logo resolves center stage, followed by the punchy tagline *"Smarter Research, Sharper Decisions"*, the public GitHub repository link (`github.com/MaulRai/sectors-hackathon`), and the *Sectors Hackathon 2026* badge.

#### On-Screen Graphics & English Text Overlays:
* `[2:32]` **Headline Card**: **Autonomous Equity Intelligence**: *Multi-Step Reasoning • Deterministic Quant Engine • Minerba Suite*
* `[2:42]` **Assurance Badge**: **Responsible FinTech**: *Pure Decision Support • Zero Automated Trading*
* `[2:50]` **Closing Hero**: **AlphaSector** — *Institutional Research for Everyone* | `github.com/MaulRai/sectors-hackathon`

#### Audio Design:
* BGM: Contemporary melodic synth crescendo reaching its triumphant peak at 2:50, resolving into an upbeat final chord with a pristine reverb tail.
* SFX: Subtle sub-bass impact on the AlphaSector logo reveal, paired with a delicate chime as the GitHub repository link appears.

#### Verbatim English Voiceover Narration:
> *"AlphaSector turns days of manual Indonesian equity research into seconds of clarity. By combining autonomous agent reasoning, deterministic quantitative math, and responsible market forensic intelligence without automated trading—we democratize institutional research for everyone.*
> 
> *AlphaSector: Smarter research, sharper decisions. Explore the code today on GitHub!"*

---

## 3. Production & Recording Guide (English Edition)

### 3.1 Display & Canvas Configuration
* **Recording Software**: OBS Studio or Screen Studio at 1080p60 or 4K60 (Lossless profile).
* **Browser**: Chrome or Brave with a clean profile, bookmark bar hidden, taskbar auto-hidden.
* **Display Scaling**: 100% to ensure financial tables and multiples render with crisp typography.
* **Cursor Smoothing**: Turn on click ripple animations (subtle cyan rings, ~24px diameter).

### 3.2 Voiceover & Audio Mastering
* **Microphone Distance**: 10–15 cm with pop filter (cardioid condenser or dynamic).
* **Target Loudness**: -14 LUFS integrated (YouTube/Vimeo standard), True Peak -1.0 dBTP.
* **Background Noise**: Keep noise floor below -55 dB with gentle gating or Krisp.
* **BGM Ducking**: Duck BGM by -24 dB to -28 dB during active speech.
