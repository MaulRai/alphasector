import { AgentQueryResponse } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function queryAgent(query: string, contextTicker?: string): Promise<AgentQueryResponse> {
  const response = await fetch(`${API_BASE_URL}/api/agent/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      context_ticker: contextTicker || null,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Agent query failed (${response.status}): ${errorText}`);
  }

  return response.json();
}

export async function fetchCompanyReport(symbol: string) {
  const cleanSymbol = symbol.toUpperCase().replace('.JK', '');
  const response = await fetch(`${API_BASE_URL}/api/sectors/company/${cleanSymbol}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch report for ${symbol}`);
  }
  return response.json();
}

export async function fetchCompanySegments(symbol: string, year?: number) {
  const cleanSymbol = symbol.toUpperCase().replace('.JK', '');
  const url = year 
    ? `${API_BASE_URL}/api/sectors/company/${cleanSymbol}/segments?year=${year}`
    : `${API_BASE_URL}/api/sectors/company/${cleanSymbol}/segments`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch segments for ${symbol}`);
  }
  return response.json();
}

export async function fetchBrokerSummary(symbol: string) {
  const cleanSymbol = symbol.toUpperCase().replace('.JK', '');
  const response = await fetch(`${API_BASE_URL}/api/sectors/broker-flow/${cleanSymbol}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch broker flow for ${symbol}`);
  }
  return response.json();
}

export async function fetchForeignFlow(symbol: string) {
  const cleanSymbol = symbol.toUpperCase().replace('.JK', '');
  const response = await fetch(`${API_BASE_URL}/api/sectors/foreign-flow/${cleanSymbol}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch foreign flow for ${symbol}`);
  }
  return response.json();
}

export async function fetchScreener(params: {
  where?: string;
  order_by?: string;
  limit?: number;
  q?: string;
}) {
  const searchParams = new URLSearchParams();
  if (params.q) searchParams.set('q', params.q);
  if (params.where) searchParams.set('where', params.where);
  if (params.order_by) searchParams.set('order_by', params.order_by);
  if (params.limit) searchParams.set('limit', params.limit.toString());

  const response = await fetch(`${API_BASE_URL}/api/sectors/screener?${searchParams.toString()}`);
  if (!response.ok) {
    throw new Error(`Failed to screen companies`);
  }
  return response.json();
}

export async function fetchTradeIdeaPreset(ideaSlug: string) {
  const response = await fetch(`${API_BASE_URL}/api/sectors/trade-ideas/${ideaSlug}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch trade idea ${ideaSlug}`);
  }
  return response.json();
}

export async function fetchSubsectors() {
  const response = await fetch(`${API_BASE_URL}/api/sectors/subsectors`);
  if (!response.ok) {
    throw new Error(`Failed to fetch subsectors`);
  }
  return response.json();
}

export async function fetchTopMovers(periods = '7d', n_stock = 5) {
  const response = await fetch(`${API_BASE_URL}/api/sectors/top-movers?periods=${periods}&n_stock=${n_stock}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch top movers`);
  }
  return response.json();
}

export async function fetchTopBrokers(cohort = 'all', metric = 'gross') {
  const response = await fetch(`${API_BASE_URL}/api/sectors/top-brokers?cohort=${cohort}&metric=${metric}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch top brokers`);
  }
  return response.json();
}

export async function checkBackendHealth() {
  try {
    const res = await fetch(`${API_BASE_URL}/health`, { cache: 'no-store' });
    if (!res.ok) return { status: 'offline' };
    return res.json();
  } catch (e) {
    return { status: 'offline' };
  }
}
