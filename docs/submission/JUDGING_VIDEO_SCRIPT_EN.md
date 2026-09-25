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
| **Segment 1** | 0:00 - 0:35 | 35s | **The Baseline Pain, Market Shock & Zero-Friction Entry**<br>Information overload across 900+ IDX stocks, compounded by Purbaya reshuffle & $100 oil, AlphaSector intro & 1-Click Demo Login. | `/` (Landing Page)<br>AuthGate Modal |
| **Segment 2** | 0:35 - 1:15 | 40s | **Multi-Agent Reasoning & Sectors MCP Protocol**<br>Autonomous reasoning at `/alpha-agent`, Sectors MCP toggle (66 tools), `LiveThinkingTrace`, parallel tool calls, grounded synthesis. | `/alpha-agent` |
| **Segment 3** | 1:15 - 1:55 | 40s | **Deterministic Quant & Company 360° Intelligence**<br>Peer Battle at `/battle` with 1-Click Agent Follow-up, Stanford 9-criteria Piotroski F-Score, P/E Bands, and Company 360° profile at `/company/BBCA`. | `/battle`<br>`/company/BBCA` |
| **Segment 4** | 1:55 - 2:35 | 40s | **Smart Money 2.0 Forensic & 1-Click Notion Sync**<br>4-Pillar Radar at `/smart-money` (Bandarmology, Insider Filings, KSEI Institutional Ownership, Suspensions), Notion memo export. | `/smart-money`<br>Notion Modal |
| **Segment 5** | 2:35 - 3:05 | 30s | **The Future of Equity Research & Closing**<br>Product vision, responsible FinTech standards (Zero Automated Trading) & GitHub call-to-action. | Workspace Showcase<br>Wrap-up |

---

## 2. Timecoded Script & Visual Storyboard

---

### SEGMENT 1: The High-Stakes Problem & Zero-Friction Entry (0:00 - 0:35)
* **Duration**: 35 Seconds
* **Objective**: Establish the core real-world pain point in the Indonesian equity market (900+ listed companies, unstructured PDFs, manual financial math), escalate it with real-world macro turbulence (Minister Purbaya's sudden dismissal, crude breaking $100/barrel, and IDX swinging 2.6%), introduce AlphaSector as the antidote to market panic, and open instant access to a unified research workspace.

#### Visual Screen Actions & Clicks:
1. **[0:00 - 0:08] Problem 1: Information Overload & Manual Models (Baseline Friction)**: Full screen displaying 20+ open browser tabs: complex audited financial report PDFs (page 142 of 348 Notes to Consolidated Financial Statements), alongside a messy DCF Excel model full of complex figures and `#REF!` errors. Mouse moves with visible frustration, toggling frantically between PDF footnotes and spreadsheet cells.
2. **[0:08 - 0:17] Problem 2: Cabinet Reshuffle & Minister Purbaya Dismissal (Macro Shock 1)**: Cursor clicks into the CNBC Indonesia tab. The screen displays a bold flashing red banner: *"BREAKING NEWS: Reshuffle Kabinet: Purbaya Dicopot dari Menkeu, Suahasil Ditunjuk"*. Cursor highlights the political headline and reshuffle imagery that injected sudden regulatory uncertainty and panic across capital markets.
3. **[0:17 - 0:26] Problem 3: Crude Oil >$100 & IDX Composite Panic Plunge (Macro Shock 2)**: Cursor switches swiftly to Bloomberg & RTI Composite tabs. Bloomberg headline: *"Crude Oil Surges Past $100/bbl Amid Geopolitical Shocks"*, side-by-side with an RTI candlestick chart plunging -2.6% through the 6,371 psychological support level before foreign accumulation swoops in on Big Banks. Mouse traces the steep red drop and chaotic order books, capturing peak market anxiety.
4. **[0:26 - 0:35] Solution: AlphaSector Terminal Reveal & 1-Click Institutional Demo Login**: A sub-bass drop and crisp digital whoosh instantly cut through the panic into the AlphaSector Landing Page (`localhost:3000`). A soothing visual contrast: clean, elegant Deep Obsidian theme (`#07090e`) with vibrant neon emerald/cyan glows and official *Sectors Financial API* badge. Cursor clicks navigate to `/alpha-agent`, the `AuthGate` modal opens, and cursor clicks the glowing emerald button: **"1-Click Demo Login (Instant Access)"** (`demo@alphasector.id`). In under 500ms, authentication checkmark succeeds and the institutional workspace unlocks seamlessly—poised for Segmen 2.

#### On-Screen Graphics & English Text Overlays:
* `[0:02]` **Pain Card**: `"900+ IDX Stocks • Hundreds of PDF Pages • Hours of Error-Prone Math"`
* `[0:09]` **Macro Shock 1 Ticker**: `"Macro Shock 1: Cabinet Reshuffle • Finance Minister Purbaya Dismissed • Regulatory Uncertainty"`
* `[0:18]` **Macro Shock 2 Ticker**: `"Macro Shock 2: Crude Oil >$100/bbl • IDX Plunges -2.6% to 6,371 • Market Panic"`
* `[0:22]` **Crisis Question Callout**: `"Market Panic vs Foreign Whale Inflows: How to Make Grounded Decisions?"`
* `[0:27]` **Brand Reveal Card**: **AlphaSector Terminal** — *Autonomous Equity Intelligence Powered by Sectors API*
* `[0:31]` **Zero-Friction Entry**: **1-Click Institutional Demo Login** (`demo@alphasector.id`)
* `[0:34]` **Workspace Ready**: **Direct Entry to `/alpha-agent` Terminal**

#### Audio Design:
* BGM:
  - `0:00 - 0:08`: Tense low-hum ambient synth (frustration with manual research across dense filings).
  - `0:08 - 0:17`: Tempo tightens with tense clock-pulse / sonar beat as the Purbaya dismissal headlines break.
  - `0:17 - 0:26`: Dissonant tones and dramatic riser as crude crosses $100 and IDX composite plunges to 6,371.
  - `0:26 - 0:35`: Sub-bass impact and digital whoosh cut through the tension, instantly transitioning into an upbeat modern tech corporate groove (115 BPM) as AlphaSector resolves, punctuated by a success chime upon 1-click login.
* SFX:
  - `[0:02]`: Rapid paper rustling & frantic typing.
  - `[0:09]`: Sharp "Breaking News Ping" alert when the CNBC Purbaya tab is opened.
  - `[0:18]`: Stock market alarm alert as the red IDX chart plunges.
  - `[0:26]`: Crisp *digital whoosh* clearing the screen chaos into AlphaSector.
  - `[0:33]`: Affirming *positive chime* as 1-click demo login succeeds.

#### Verbatim English Voiceover Narration:
> *"Analyzing over 900 companies on the Indonesia Stock Exchange is exhausting—trapped in hundreds of dense PDF filings and error-prone manual calculations.*
> 
> *The stakes escalate when macro shocks hit: a sudden cabinet reshuffle ousted Finance Minister Purbaya and global crude broke 100 dollars a barrel, plunging the IDX two point six percent before foreign whales bought the dip. Amid market panic, how can investors make grounded decisions without emotional bias?*
> 
> *Meet **AlphaSector**: the first autonomous equity research terminal purpose-built for the Indonesian market, powered by Sectors Financial API—turning raw market telemetry and extreme volatility into institutional clarity in a single unified workspace."*

---

### SEGMENT 2: Multi-Agent Reasoning & Sectors MCP Tool Calling at `/alpha-agent` (0:35 - 1:15)
* **Duration**: 40 Seconds
* **Objective**: Demonstrate Track 01 qualification by showcasing custom multi-agent reasoning, native Sectors Model Context Protocol (MCP) tool execution, and grounded institutional synthesis on `/alpha-agent`.

#### Visual Screen Actions & Clicks:
1. **[0:35 - 0:43] Action Menu & Natural Language Prompt**: Cursor clicks the **`+` Action Menu** button adjacent to the input bar, briefly revealing the protocol switcher toggled to **"Sectors MCP"** with a sublink to the *Sectors MCP Tools Catalog (66 Tools)*. Cursor focuses on the `ChatInputBar` and types:
   `"Compare the valuation and financial health of BBRI vs BMRI"` and hits **Enter**.
2. **[0:43 - 0:57] Live Thinking Trace & MCP JSON-RPC Telemetry**: The `LiveThinkingTrace` and `AgentThinkingTrace` components expand immediately. Cursor highlights the dynamic autonomous execution stages:
   - **Phase 1 (PLANNING)**: Intent classified as `PEER_BATTLE_COMPARISON`, targets set to `BBRI` and `BMRI`.
   - **Phase 2 (FETCHING)**: Concurrent execution via Sectors MCP JSON-RPC protocol: `[MCP JSON-RPC] fetch-company-report/BBRI` (~320ms) and `[MCP JSON-RPC] fetch-company-report/BMRI` (~310ms).
   - **Phase 3 (COMPARING)**: Multi-agent sub-routines analyze fundamental deltas, smart money flows, and governance signals.
   - **Phase 4 (SYNTHESIZING)**: Groq LPU inference drafting grounded institutional findings.
   - Highlight latency & credit badge: `(1,520ms • 2 cr)`.
3. **[0:57 - 1:07] PeerBattleMatrix Presentation**: Scroll down to the side-by-side `PeerBattleMatrix`. Highlight key metrics: P/E, PBV, ROE, Net Profit Margin, and glowing green best-in-class badges (`bg-emerald-500/10 text-emerald-400`).
4. **[1:07 - 1:15] Autonomous Synthesis & Research Dossier**: Highlight the **Valuation Verdict** and **Key Findings**. Click the button on the right panel to slide open the **Research Dossier Artifact** drawer.

#### On-Screen Graphics & English Text Overlays:
* `[0:37]` **Protocol Badge**: **Sectors Model Context Protocol (MCP)** — *Native Integration • 66 Financial Tools*
* `[0:45]` **Architecture Box**: **Autonomous Multi-Agent Orchestrator** — *Intent Classification & Parallel MCP Execution*
* `[0:53]` **Telemetry Badge**: **Parallel MCP Fetch**: `BBRI (320ms)` + `BMRI (310ms)` • Total Latency: `1.52s`
* `[1:01]` **Feature Tag**: **Peer Battle Matrix & Grounded Institutional Synthesis**

#### Audio Design:
* BGM: Modern rhythmic synth bassline driving analytical momentum.
* SFX: Rapid mechanical keyboard clicks, gentle digital resonance during multi-agent execution, and a double-snap click when the matrix and drawer open.

#### Verbatim English Voiceover Narration:
> *"In Alpha Agent, analysts simply prompt in plain language—interfacing natively via REST or Sectors’ Model Context Protocol to access over sixty financial tools.*
> 
> *Our multi-agent orchestrator autonomously classifies user intent, dispatches parallel MCP calls, and activates specialized sub-agents across fundamentals, smart money flows, and governance.*
> 
> *The result is a rigorous, side-by-side comparative matrix across competing companies—highlighting multiples, margins, and capital efficiency—paired with an objective, hallucination-free institutional synthesis stored instantly as an interactive Research Dossier."*

---

### SEGMENT 3: Deterministic Quant Engine & Company 360° Intelligence (1:15 - 1:55)
* **Duration**: 40 Seconds
* **Objective**: Prove quantitative supremacy through pure deterministic computation (Piotroski & P/E Bands), highlight seamless 1-click follow-up from Peer Battle to Alpha Agent, and showcase deep fundamental drill-down on Company 360°.

#### Visual Screen Actions & Clicks:
1. **[1:15 - 1:26] Navigate to `/battle` & Deterministic Quant**: Click **"Peer Battle"** in the top Navbar. Click preset **"The Big 4 Banks"** (`BBCA`, `BBRI`, `BMRI`, `BBNI`), then click cyan button **"Run Peer Battle"**. Multi-stock metrics populate in ~450ms. Highlight the side-by-side comparative table, the **Piotroski F-Score (Score: 7/9 PRIMA)** across 9 accounting criteria, and the **Historical P/E Standard Deviation Bands** showing valuation discounts.
2. **[1:26 - 1:36] 1-Click Follow-Up to Alpha Agent**: Highlight the glowing action banner: **"Lanjutkan Diskusi di AlphaAgent"**. Click it, showing seamless 1-click contextual handoff where the agent pre-loads the battle findings for conversational follow-up.
3. **[1:36 - 1:55] Company 360° Profile (`/company/BBCA`)**: Drill down to `BBCA` (or top bank). Scroll through the **Valuation History Table** tracking multi-year cycles and the **Business Segments Breakdown** mapping core revenue drivers and margin trajectories.

#### On-Screen Graphics & English Text Overlays:
* `[1:17]` **Preset Tag**: **Preset Battle**: *The Big 4 Banks (4-Way Parallel Ingestion)*
* `[1:22]` **Formula Card**: **Piotroski F-Score Engine (0-9)**: *Deterministic Accounting Health*
* `[1:28]` **Handoff Feature**: **1-Click Agent Follow-Up** — *Seamless Battle-to-Chat Context Transition*
* `[1:38]` **Profile Badge**: **Company 360° Profile** — *Multi-Year Valuation Cycles & Segment Breakdown*

#### Audio Design:
* BGM: Percussion tightens, conveying mathematical precision and institutional authority.
* SFX: Fast swoosh between routes, followed by a resonant *sub-bass hit* on Piotroski and a delicate chime as valuation history appears.

#### Verbatim English Voiceover Narration:
> *"Peer Battle delivers instant multi-stock comparisons powered by our **Deterministic Quant Engine**—calculating Stanford nine-criteria Piotroski scores and historical valuation bands mathematically without hallucinations.*
> 
> *Analysts can click to seamlessly carry any comparative battle directly into Alpha Agent for deeper autonomous investigation.*
> 
> *Or drill down into **Company 360°** to dissect multi-year valuation cycles and segment revenue drivers across any of the nine hundred listed companies."*

---

### SEGMENT 4: Smart Money 2.0 Forensic Radar & 1-Click Notion Sync (1:55 - 2:35)
* **Duration**: 40 Seconds
* **Objective**: Showcase **Smart Money 2.0** with its 4-pillar forensic radar and 1-click Wall Street-grade Notion memorandum export.

#### Visual Screen Actions & Clicks:
1. **[1:55 - 2:03] Smart Money 2.0 (`/smart-money`)**: Navigate to `/smart-money`. Highlight the **Global 900+ Stock Selector** (select `TLKM`). Pan across the 4-pillar forensic switcher tabs.
2. **[2:03 - 2:17] Explore the 4 Forensic Pillars**:
   - **Pillar 1 (Bandarmology)**: Click analyze, showcasing Top 5 Accumulator vs Distributor brokers and Net Foreign Flow.
   - **Pillar 2 (Insider Filings)**: Switch to the *Insider Filings* tab, spotlighting **`INSIDER BUY / ACCUMULATION`** flags by Directors/Commissioners with transaction prices and official **IDX Disclosure PDF Links**.
   - **Pillar 3 (Institutional Ownership)**: Switch to *Institutional Ownership*, revealing exact KSEI custodian breakdowns: Pension Funds (BPJS-TK/Taspen), Mutual Funds, Insurance, Corporate vs Retail, with Local vs Foreign macro ratio bars.
   - **Pillar 4 (Suspensions Radar)**: Brief click on *IDX Suspensions Radar* monitoring trade halts and Unusual Market Activity (UMA).
3. **[2:17 - 2:35] 1-Click Institutional Notion Sync**: Click the **"Sync to Notion"** button with the `N` logo. The `NotionExportModal` opens. Click **"Sync Memo to Notion"**. In 1 second, a success checkmark appears. Switch to the Notion tab displaying a fully structured Wall Street investment memo (Executive Summary, Valuation Multiples, and Compliance Disclaimers).

#### On-Screen Graphics & English Text Overlays:
* `[1:57]` **Radar Card**: **Smart Money 2.0 Forensic Radar** — *4 Integrated Institutional Pillars*
* `[2:07]` **Compliance Badge**: **Insider Filings & KSEI Ownership** • *Official IDX Disclosure PDFs*
* `[2:19]` **Integration Box**: **1-Click Institutional Notion Sync** — *Wall Street-Grade Investment Memo*

#### Audio Design:
* BGM: Dynamic, steady tech flow.
* SFX: Soft radar sweep on Smart Money, crisp click on the Notion button, and a pleasant success chime upon sync completion.

#### Verbatim English Voiceover Narration:
> *"Our **Smart Money 2.0** tracks institutional footprints through a 4-pillar Forensic Radar: Bandarmology broker flows, insider filings with official IDX disclosure PDFs, real KSEI institutional ownership breakdown including pension and mutual funds, and exchange suspension alerts.*
> 
> *All research can be exported with a single click directly into Notion Workspaces as a Wall Street-caliber investment memorandum—fully ready for investment committees."*

---

### SEGMENT 5: The Future of Indonesian Equity Research & Closing (2:35 - 3:05)
* **Duration**: 30 Seconds
* **Objective**: Close the walkthrough with commanding authority: unifying the end-to-end workflow (Alpha Agent, Battle, Company 360°, Smart Money 2.0, Notion), reinforcing responsible analytical intelligence (zero automated trading), and delivering a crisp, confident call-to-action.

#### Visual Screen Actions & Clicks:
1. **[2:35 - 2:45] Unified Workspace Showcase**: Cinematic smooth zoom-out across the cohesive AlphaSector terminal: from intelligent Alpha Agent reasoning, to the dynamic Peer Battle matrix, Company 360° valuation profiles, the Smart Money 2.0 forensic radar, and the Notion memo.
2. **[2:45 - 2:53] Responsible FinTech Assurance**: Brief highlight on the responsible analytics badge in the footer: confirming a steadfast commitment to pure decision-support intelligence with zero automated trade execution (Rule 12).
3. **[2:53 - 3:05] Hero Outro & Call-To-Action**: Transition to the Deep Obsidian closing canvas. The glowing AlphaSector logo resolves center stage, followed by the punchy tagline *"Smarter Research, Sharper Decisions"*, the public GitHub repository link (`github.com/MaulRai/sectors-hackathon`), and the *Sectors Hackathon 2026* badge.

#### On-Screen Graphics & English Text Overlays:
* `[2:37]` **Headline Card**: **Autonomous Equity Intelligence**: *Multi-Agent Reasoning • Deterministic Quant Engine • Smart Money Radar*
* `[2:47]` **Assurance Badge**: **Responsible FinTech**: *Pure Decision Support • Zero Automated Trading*
* `[2:55]` **Closing Hero**: **AlphaSector** — *Institutional Research for Everyone* | `github.com/MaulRai/sectors-hackathon`

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
