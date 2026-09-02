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

export async function fetchTradeIdeaPreset(ideaSlug: string) {
  const response = await fetch(`${API_BASE_URL}/api/sectors/trade-ideas/${ideaSlug}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch trade idea ${ideaSlug}`);
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
