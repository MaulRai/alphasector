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

| Segment | Timestamp | Duration | Core Feature & Focus | UI Route |
| :--- | :--- | :--- | :--- | :--- |
| **Segment 1** | 0:00 - 0:35 | 35s | **The High-Stakes Problem & Zero-Friction Entry**<br>Information overload across 900+ IDX stocks, fragmented PDFs, AlphaSector intro & 1-Click Demo Login. | `/` (Landing Page)<br>AuthGate Modal |
| **Segment 2** | 0:35 - 1:20 | 45s | **Multi-Step Agent Reasoning & Dynamic DAG**<br>Autonomous reasoning at `/copilot`, `LiveThinkingTrace`, concurrent Sectors API dispatch, grounded synthesis. | `/copilot` |
| **Segment 3** | 1:20 - 1:55 | 35s | **Deterministic Quant Engine & Battle Mode**<br>4-way comparison at `/battle`, 9-criteria Piotroski F-Score & historical P/E SD bands without LLM hallucinations. | `/battle`<br>`/company/ASII` |
| **Segment 4** | 1:55 - 2:30 | 35s | **Market Intelligence & 1-Click Institutional Notion Sync**<br>Smart money radar at `/smart-money`, floating dock at `/screener`, 1-click Wall Street-grade Notion memo export. | `/smart-money`<br>`/screener`<br>Notion Modal |
| **Segment 5** | 2:30 - 3:00 | 30s | **Track 01 Qualification, Real-World Impact & Closing**<br>Rule 12 compliance (zero automated trading), custom DAG vs MCP wrapper, production readiness. | VS Code / Arch<br>Wrap-up |

---

## 2. Timecoded Script & Visual Storyboard

---

### SEGMENT 1: The High-Stakes Problem & Zero-Friction Entry (0:00 - 0:35)
* **Duration**: 35 Seconds
* **Objective**: Establish the core real-world pain point in the Indonesian equity market (900+ listed companies, unstructured PDFs, manual financial math), introduce AlphaSector, and demonstrate zero-friction evaluator onboarding.

#### Visual Screen Actions & Clicks:
1. **[0:00 - 0:07] B-Roll / Screen Capture**: Display a screen overflowing with 20+ open browser tabs: complex Indonesian annual report PDFs, cluttered financial spreadsheets, and disjointed price charts. The mouse moves erratically, illustrating the frustration of manual equity research.
2. **[0:07 - 0:15] Smooth Transition**: Smooth zoom-in cut directly to AlphaSector’s Landing Page (`localhost:3000`). Highlight the Deep Obsidian theme (`#07090e`) with vibrant neon emerald and cyan glows. Cursor hovers gently over the hero headline: *"Autonomous Equity Research Agent for Indonesian Capital Markets"*.
3. **[0:15 - 0:25] Quick Feature Tour**: Smooth scroll down revealing the 5 core modules (Copilot Workspace, Peer Battle Terminal, Screener Pro, Smart Money Radar, and Notion Sync).
4. **[0:25 - 0:35] AuthGate & 1-Click Login**: Click the navigation button toward `/copilot`. The elegant `AuthGate` modal appears. Cursor clicks the glowing emerald button: **"1-Click Demo Login (Instant Access)"** (`demo@alphasector.id`). In under 500ms, authentication succeeds and the workspace opens seamlessly.

#### On-Screen Graphics & English Text Overlays:
* `[0:02]` **Title Card**: `"900+ IDX Stocks • Hundreds of PDF Pages • Hours of Manual Research"`
* `[0:10]` **Brand Badge**: **AlphaSector Terminal** — *Track 01: AI Agents & Assistants*
* `[0:27]` **Highlight Banner**: **Zero-Friction Access** — *Pre-seeded Pro Analyst Account (50 Demo Credits)*

#### Audio Design:
* BGM: Low-hum ambient mystery synth for the first 7 seconds, swelling into an upbeat modern tech corporate groove (115 BPM) as AlphaSector appears.
* SFX: Rapid paper rustling/keystrokes initially, followed by a crisp *digital whoosh* into AlphaSector, and an affirming *success chime* upon 1-click login.

#### Verbatim English Voiceover Narration:
> *"Analyzing over nine hundred publicly listed companies on the Indonesia Stock Exchange is an exhausting challenge. Research analysts and retail investors are forced to comb through hundreds of dense, fragmented PDF disclosures, calculate valuation multiples by hand, and speculate blindly on institutional capital flows.*
> 
> *Meet **AlphaSector**: the first autonomous equity research terminal purpose-built for the Indonesian market, powered by Sectors Financial API. With zero friction, evaluators can immediately test the full platform with a single click using our verified demo analyst account."*

---

### SEGMENT 2: Multi-Step Agent Reasoning & Tool Calling at `/copilot` (0:35 - 1:20)
* **Duration**: 45 Seconds
* **Objective**: Demonstrate Track 01 qualification by showcasing custom multi-step agent reasoning, dynamic DAG planning, parallel Sectors API calls, and grounded institutional synthesis on `/copilot`.

#### Visual Screen Actions & Clicks:
1. **[0:35 - 0:42] Natural Language Prompt Input**: Cursor focuses on the `ChatInputBar`. Type naturally:
   `"Compare the valuation and financial health of BBRI vs BMRI"` and hit **Enter**.
2. **[0:42 - 0:58] Live Thinking Trace Inspection**: The `LiveThinkingTrace` and `AgentThinkingTrace` components expand immediately. Cursor highlights the dynamic autonomous execution stages:
   - **Phase 1 (PLANNING)**: Intent classified as `PEER_BATTLE_COMPARISON`, targets set to `BBRI` and `BMRI`, financial stopwords parsed.
   - **Phase 2 (FETCHING)**: Concurrent execution via `asyncio.gather` to Sectors API endpoints: `GET /company/report/BBRI` (~320ms) and `GET /company/report/BMRI` (~310ms).
   - **Phase 3 (COMPARING)**: Real-time mathematical ratio delta computation.
   - **Phase 4 (SYNTHESIZING)**: Groq LPU inference drafting grounded institutional findings.
   - Highlight latency & credit badge: `(1,520ms • 2 cr)`.
3. **[0:58 - 1:12] PeerBattleMatrix Presentation**: Scroll down to the side-by-side `PeerBattleMatrix`. Highlight key metrics: P/E, PBV, ROE, Net Profit Margin, and glowing green best-in-class badges (`bg-emerald-500/10 text-emerald-400`).
4. **[1:12 - 1:20] Autonomous Synthesis & Research Dossier**: Highlight the **Valuation Verdict** and **Key Findings**. Click the button on the right panel to slide open the **Research Dossier Artifact** drawer.

#### On-Screen Graphics & English Text Overlays:
* `[0:38]` **Prompt Callout**: `"Compare the valuation and financial health of BBRI vs BMRI"`
* `[0:45]` **Architecture Box**: **Custom Dynamic DAG Planner** — *Intent Classification & Parallel Sectors API*
* `[0:52]` **Telemetry Badge**: **Parallel Async Fetch**: `BBRI (320ms)` + `BMRI (310ms)` • Total Latency: `1.52s`
* `[1:05]` **Feature Tag**: **Peer Battle Matrix & Grounded Institutional Synthesis**
* `[1:15]` **Artifact Callout**: **Interactive Research Dossier Drawer**

#### Audio Design:
* BGM: Modern rhythmic synth bassline driving analytical momentum.
* SFX: Rapid mechanical keyboard clicks, gentle digital resonance during DAG execution, and a double-snap click when the matrix and drawer open.

#### Verbatim English Voiceover Narration:
> *"In the Copilot workspace, analysts simply ask in plain language. Notice this live Thinking Trace: AlphaSector is not a superficial prompt wrapper.*
> 
> *Our backend orchestrator autonomously classifies user intent, constructs a dynamic Directed Acyclic Graph, and dispatches parallel asynchronous calls to Sectors API in just hundreds of milliseconds.*
> 
> *The result is a rigorous, side-by-side comparative matrix between BBRI and BMRI—highlighting multiples, margins, and capital efficiency—paired with an objective, hallucination-free institutional synthesis stored instantly as an interactive Research Dossier."*

---

### SEGMENT 3: Deterministic Quant Engine & Battle Mode (1:20 - 1:55)
* **Duration**: 35 Seconds
* **Objective**: Prove quantitative supremacy through pure deterministic computation: Stanford 9-criteria Piotroski F-Score and historical P/E standard deviation bands without LLM calculation hallucinations.

#### Visual Screen Actions & Clicks:
1. **[1:20 - 1:28] Navigate to `/battle`**: Click **"Peer Battle"** in the top Navbar. The `/battle` arena opens. Click the preset button: **"The Big 4 Banks"** (`BBCA`, `BBRI`, `BMRI`, `BBNI`). The ticker dock instantly populates.
2. **[1:28 - 1:35] Execute 4-Way Showdown**: Click the cyan button **"Run Peer Battle"**. In ~450ms, the full 4-way comparative table populates with unified historical metrics.
3. **[1:35 - 1:44] Drill Down to `/company/ASII`**: Click or search ticker `ASII` to open the Company 360° Profile. Scroll down to the **Deterministic Financial Intelligence Panel**.
4. **[1:44 - 1:55] Highlight Piotroski F-Score & P/E Band**:
   - Spotlight the **Piotroski F-Score (Score: 7/9 PRIMA)** card. Highlight the 9 audited criteria (Profitability, Leverage, Operating Efficiency).
   - Spotlight the **P/E Historical Standard Deviation Band** chart. Highlight the `UNDERVALUED` status at an explicit `-18.4%` discount to its 5-year mean.
   - Pan across Astra's business segment revenue breakdown (Automotive, Financial Services, Heavy Equipment & Mining).

#### On-Screen Graphics & English Text Overlays:
* `[1:24]` **Preset Tag**: **Preset Battle**: *The Big 4 Banks (BBCA, BBRI, BMRI, BBNI)*
* `[1:32]` **Tech Callout**: **4-Way Parallel Sectors Ingestion** (~450ms)
* `[1:41]` **Formula Card**: **Piotroski F-Score Engine (0-9)**: *Profitability • Leverage • Operating Efficiency*
* `[1:48]` **Metric Tag**: **Historical P/E Band**: *Mean P/E vs Current P/E (-18.4% Discount Undervalued)*

#### Audio Design:
* BGM: Percussion tightens, conveying mathematical precision and institutional authority.
* SFX: Fast swoosh between routes, followed by a resonant *sub-bass hit* when spotlighting the 7/9 Piotroski card.

#### Verbatim English Voiceover Narration:
> *"Switching to Peer Battle mode highlights AlphaSector’s core edge: our **Deterministic Quant Engine**. We never outsource financial arithmetic to probabilistic LLM hallucinations.*
> 
> *On Astra International’s 360-degree company profile, our engine deterministically evaluates the complete Stanford nine-criteria Piotroski model—awarding a robust seven out of nine rating.*
> 
> *It simultaneously plots five-year historical P/E standard deviation bands, mathematically proving that the stock trades at an eighteen point four percent discount below its historical mean."*

---

### SEGMENT 4: Market Intelligence & 1-Click Institutional Notion Sync (1:55 - 2:30)
* **Duration**: 35 Seconds
* **Objective**: Showcase smart money institutional flow tracking on `/smart-money`, NLP filtering on `/screener`, and 1-click Wall Street-grade Notion memorandum export.

#### Visual Screen Actions & Clicks:
1. **[1:55 - 2:05] Smart Money Radar (`/smart-money`)**: Navigate to `/smart-money`. Display the national **Top Institutional Brokers Leaderboard**. Select ticker `TLKM`.
2. **[2:05 - 2:12] Broker Flow & Buyer Concentration**: Spotlight the **Broker Flow Tracker**: Top 5 Accumulators vs Distributors with lot volumes, average price, and the glowing golden metric: **"Buyer Concentration: 74%"** alongside green **Net Foreign Flow** bars confirming whale inflows.
3. **[2:12 - 2:20] Screener Pro & Battle Dock (`/screener`)**: Open `/screener`. Type the NLP query: *"Find companies with the highest revenue growth"*. The table filters dynamically. Check two companies, then highlight the floating **ScreenerBattleDock** ready to launch them into battle with one click: **"Battle Selected Peers (2)"**.
4. **[2:20 - 2:30] 1-Click Notion Sync**: Return to the company modal and click the **"Sync to Notion"** button with the `N` logo. The `NotionExportModal` opens showing a rich preview. Click **"Sync Memo to Notion"**. In 1 second, a green checkmark appears with the button **"Open Memo in Notion"**. Switch to the Notion tab displaying a fully formatted Wall Street-style investment memo (Callouts, Metric Tables, Piotroski bullets, and Disclaimers).

#### On-Screen Graphics & English Text Overlays:
* `[1:58]` **Radar Card**: **Smart Money & Bandarmology Radar** — *Broker Flow & Foreign Net Inflow*
* `[2:06]` **Data Callout**: **74% Buyer Concentration** • *Institutional Whale Accumulation Detected*
* `[2:14]` **Feature Tag**: **Screener Pro NLP & Floating Battle Dock**
* `[2:24]` **Integration Box**: **1-Click Institutional Notion Sync** — *Wall Street-Grade Investment Memo*

#### Audio Design:
* BGM: Dynamic, steady tech flow.
* SFX: Soft radar ping on Smart Money, crisp click on the Notion button, and a pleasant success chime upon sync completion.

#### Verbatim English Voiceover Narration:
> *"For active market participants, our Smart Money radar tracks institutional broker flows and foreign capital in real time. Here, it flags a seventy-four percent buyer concentration in Telkom, confirming whale accumulation.*
> 
> *In Screener Pro, investors filter hundreds of equities with natural language and beam them directly into Peer Battle using our interactive floating dock.*
> 
> *Best of all, any research dossier can be exported in one click directly into Notion as a Wall Street-grade investment memo—complete with executive summaries, valuation multiples, and financial health scores."*

---

### SEGMENT 5: Track 01 Qualification, Real-World Impact & Closing (2:30 - 3:00)
* **Duration**: 30 Seconds
* **Objective**: Reiterate complete Track 01 qualification (custom orchestrator, not an MCP wrapper, zero automated trading), ethical Rule 12 compliance, and a strong closing statement for the judging panel.

#### Visual Screen Actions & Clicks:
1. **[2:30 - 2:40] Architecture & Track 01 Compliance**: Split screen showing AlphaSector and the clean VS Code backend repository:
   - `backend/app/agent/orchestrator.py` & `planner.py` (Custom 5-Phase DAG Orchestrator).
   - `financial_engine.py` (Deterministic Math Engine).
   - `cache.py` (Two-tier Neon PostgreSQL + SQLite Cache).
   - Next.js 15 App Router interface.
2. **[2:40 - 2:50] Ethical Compliance & Disclaimers**: Scroll to the footer of the app and the Notion memo. Highlight the **Regulatory Financial Disclaimer** (Rule 12): certifying that AlphaSector is strictly an analytical decision-support tool with **zero automated trade execution**.
3. **[2:50 - 3:00] Outro & Brand Identity**: Display the glowing AlphaSector logo against the deep obsidian canvas, flanked by *"Track 01: AI Agents & Assistants — Sectors Hackathon 2026"*, the public GitHub repo link, and a professional closing gratitude card.

#### On-Screen Graphics & English Text Overlays:
* `[2:32]` **Architecture Callout**: **100% Track 01 Qualified**: *Custom Orchestrator • Python Math Engine • Not an MCP Wrapper*
* `[2:42]` **Compliance Shield**: **Rule 12 Compliant**: *Zero Automated Trading • Strict Financial Disclaimer*
* `[2:52]` **Closing Card**: **AlphaSector** — *Autonomous Equity Research for Indonesia* | *Sectors Hackathon 2026*

#### Audio Design:
* BGM: Riser musical crescendo, resolving into a solid, triumphant final chord with a clean reverb tail.
* SFX: Soft sub-bass drop on the AlphaSector closing logo reveal.

#### Verbatim English Voiceover Narration:
> *"AlphaSector unequivocally satisfies every Track 01 requirement: we engineered a custom autonomous orchestrator rather than an MCP wrapper, powered by deterministic quantitative math, with zero automated trading to ensure strict regulatory compliance.*
> 
> *Backed by a two-tier caching architecture that safeguards API credits and a world-class Next.js 15 terminal UI, AlphaSector is ready to democratize Indonesian equity intelligence today.*
> 
> *Thank you to the Sectors team and the esteemed judges. Let’s build the future of Indonesian capital markets together with AlphaSector!"*

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
