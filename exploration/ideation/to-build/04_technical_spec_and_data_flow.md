# ⚙️ Technical Specification & Implementation Architecture

Dokumen ini menjabarkan spesifikasi teknis lengkap untuk pembangunan aplikasi **SektorIQ**.

---

## 1. Tech Stack Rekomendasi

| Lapisan (Layer) | Teknologi yang Digunakan | Alasan Pemilihan |
|---|---|---|
| **Frontend Framework** | **Next.js 14/15 (App Router, TypeScript)** | Modern, performa tinggi, Server-Side Rendering (SSR), Server Actions, API routes bawaan |
| **Styling & Design System** | **Tailwind CSS + Lucide Icons + Framer Motion** | Tampilan modern, dark mode native, animasi halus, glassmorphism UI |
| **Data Visualization** | **Recharts + Plotly / Mermaid JS** | Render chart metrik keuangan, line chart harga, diagram Sankey revenue |
| **LLM & Agent Engine** | **Google Gemini 1.5 Flash / Anthropic Claude 3.5 Sonnet API** | Function calling cepat, latensi rendah, penalaran kuat dalam Bahasa Indonesia |
| **Data Provider** | **Sectors Financial API v2 (REST)** | Sumber data resmi IDX, SGX, KLSE, dan Broker Flow |
| **Local / Session DB** | **SQLite / Prisma ORM / LocalStorage (Zustand)** | Menyimpan watchlist emiten, riwayat riset, dan state percakapan |

---

## 2. Struktur Proyek Aplikasi (Project Directory Structure)

```
sectors-hackathon/
├── app/                        # Next.js App Router
│   ├── api/
│   │   ├── agent/route.ts      # Main Custom Agent Orchestrator Endpoint
│   │   ├── sectors/route.ts    # Proxy & Caching Layer for Sectors API
│   │   └── export-pdf/route.ts # PDF/Markdown Dossier Generator
│   ├── dashboard/              # Main Application Workspace
│   │   ├── page.tsx
│   │   ├── components/
│   │   │   ├── ChatInterface.tsx
│   │   │   ├── AgentThinkingTrace.tsx
│   │   │   ├── Company360Card.tsx
│   │   │   ├── PeerComparisonTable.tsx
│   │   │   ├── BrokerFlowRadar.tsx
│   │   │   ├── SankeyRevenue.tsx
│   │   │   └── WatchlistSidebar.tsx
│   ├── layout.tsx
│   └── page.tsx                # Landing Page with Quick Trade Ideas Radar
├── lib/
│   ├── agent/
│   │   ├── planner.ts          # Intent recognition & DAG generation
│   │   ├── tools.ts            # Custom Tool Definitions for Sectors API
│   │   ├── comparator.ts       # Quantitative comparison logic
│   │   └── synthesizer.ts      # Bahasa Indonesia structured synthesis
│   ├── sectors/
│   │   ├── client.ts           # Typed Sectors API v2 SDK
│   │   └── cache.ts            # Memory Cache (TTL)
│   └── types/
│       ├── sectors.ts          # Full TypeScript interfaces for Sectors payloads
│       └── agent.ts            # Agent State & Step types
├── exploration/                # Exploration & Research artifacts
├── .env.local                  # SECTORS_API_KEY, GEMINI_API_KEY / ANTHROPIC_API_KEY
├── package.json
└── tsconfig.json
```

---

## 3. Skema Data State Agent (TypeScript Interfaces)

```typescript
// lib/types/agent.ts

export type AgentIntent = 
  | 'SINGLE_TICKER_DEEP_DIVE'
  | 'PEER_BATTLE_COMPARISON'
  | 'MARKET_SCREENING_DISCOVERY'
  | 'SMART_MONEY_RADAR'
  | 'COMMODITY_MACRO_IMPACT';

export interface ReasoningStep {
  id: string;
  stepNumber: number;
  phase: 'PLANNING' | 'FETCHING' | 'COMPARING' | 'SYNTHESIZING' | 'COMPLETED' | 'ERROR';
  title: string;
  detail: string;
  toolCall?: {
    endpoint: string;
    params: Record<string, any>;
    latencyMs?: number;
    status?: number;
  };
  timestamp: string;
}

export interface AgentExecutionResponse {
  query: string;
  intent: AgentIntent;
  reasoningTrace: ReasoningStep[];
  primaryTicker?: string;
  comparisonTickers?: string[];
  metricsData?: Record<string, any>;
  brokerData?: Record<string, any>;
  synthesis: {
    executiveSummary: string;
    strengths: string[];
    risks: string[];
    verdict: string;
    disclaimer: string;
  };
  totalExecutionTimeMs: number;
  creditsConsumed: number;
}
```

---

## 4. Custom Tool Mapping ke Sectors REST API v2

| Tool Name | Tujuan | Endpoint Sectors REST v2 |
|---|---|---|
| `getCompanyReport` | Ambil laporan komprehensif emiten | `GET /v2/company/report/{symbol}/` |
| `screenCompanies` | Filter emiten terstruktur | `GET /v2/companies/?where={where}&order_by={order_by}` |
| `getBrokerSummaryTop` | Ambil top broker pembeli/penjual | `GET /v2/broker-summary/{symbol}/top/` |
| `getForeignFlow` | Ambil histori net foreign inflow | `GET /v2/broker-summary/{symbol}/foreign-flow/` |
| `getCompanySegments` | Ambil data segmen pendapatan | `GET /v2/company/segments/{symbol}/` |
| `getTopMovers` | Ambil top gainer/loser periode tertentu | `GET /v2/companies/top-changes/` |
| `getMiningSites` | Ambil lokasi tambang & cadangan | `GET /v2/mining/sites/` |
| `getCommodityPrice` | Ambil histori harga komoditas | `GET /v2/mining/commodities/price/` |
