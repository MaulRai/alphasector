export type AgentIntent = 
  | 'SINGLE_TICKER_DEEP_DIVE'
  | 'PEER_BATTLE_COMPARISON'
  | 'MARKET_SCREENING_DISCOVERY'
  | 'SMART_MONEY_RADAR'
  | 'COMMODITY_MACRO_IMPACT'
  | 'GENERAL_FINANCIAL_QUERY';

export type ExecutionPhase = 
  | 'PLANNING'
  | 'FETCHING'
  | 'COMPARING'
  | 'SYNTHESIZING'
  | 'COMPLETED'
  | 'ERROR';

export interface ToolCallLog {
  endpoint: string;
  params?: Record<string, any>;
  status: number;
  latency_ms: number;
  description?: string;
}

export interface ReasoningStep {
  id: string;
  step_number: number;
  phase: ExecutionPhase;
  title: string;
  detail: string;
  tool_call?: ToolCallLog;
  timestamp: string;
}

export interface PeerCompanyMetric {
  symbol: string;
  company_name: string;
  sector: string;
  sub_sector: string;
  last_close_price?: number;
  market_cap?: number;
  pe?: number;
  pbv?: number;
  pe_peer_avg?: number;
  pb_peer_avg?: number;
  roe?: number;
  npm?: number;
  der?: number;
  revenue?: number;
  net_income?: number;
  is_lowest_pe?: boolean;
  is_lowest_pbv?: boolean;
  is_highest_roe?: boolean;
  is_highest_dividend?: boolean;
  has_high_dividend_tag?: boolean;
  tags?: string[];
}

export interface BrokerSummaryInfo {
  sentiment: 'STRONG_ACCUMULATION' | 'MODERATE_ACCUMULATION' | 'STRONG_DISTRIBUTION' | 'MODERATE_DISTRIBUTION' | 'NEUTRAL';
  top_buyers: Array<{
    broker_code: string;
    broker_name?: string;
    net_buy_value?: number;
    buy_val?: number;
    lot_buy?: number;
  }>;
  top_sellers: Array<{
    broker_code: string;
    broker_name?: string;
    net_sell_value?: number;
    sell_val?: number;
    lot_sell?: number;
  }>;
  buyer_concentration: number;
}

export interface SynthesisResult {
  executive_summary: string;
  key_findings: string[];
  valuation_verdict?: string;
  smart_money_flow?: string;
  catalysts: string[];
  risks: string[];
  disclaimer: string;
}

export interface AgentQueryResponse {
  query: string;
  intent: AgentIntent;
  primary_ticker?: string;
  comparison_tickers: string[];
  reasoning_trace: ReasoningStep[];
  metrics_summary?: PeerCompanyMetric;
  peer_matrix?: PeerCompanyMetric[];
  broker_summary?: BrokerSummaryInfo;
  synthesis: SynthesisResult;
  total_execution_time_ms: number;
  credits_consumed: number;
}
