import { AgentQueryResponse, ChatSession, ChatMessage } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('alphasector_auth_token');
}

export function getCustomSectorsKey(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('alphasector_custom_sectors_key');
}

export function setCustomSectorsKey(key: string | null) {
  if (typeof window === 'undefined') return;
  if (key && key.trim()) {
    localStorage.setItem('alphasector_custom_sectors_key', key.trim());
  } else {
    localStorage.removeItem('alphasector_custom_sectors_key');
  }
}

export async function checkBackendHealth(): Promise<{ status: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/`);
    return { status: res.ok ? 'healthy' : 'unhealthy' };
  } catch {
    return { status: 'offline' };
  }
}

export async function queryAgent(
  query: string, 
  contextTicker?: string, 
  sessionId?: string
): Promise<AgentQueryResponse> {
  const token = getStoredToken();
  const customSectorsKey = getCustomSectorsKey();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (customSectorsKey) {
    headers['X-Sectors-Api-Key'] = customSectorsKey;
  }

  const response = await fetch(`${API_BASE_URL}/api/agent/query`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      query,
      context_ticker: contextTicker || null,
      session_id: sessionId || null,
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

export async function fetchTopBrokers(cohort = 'institutional', metric = 'gross') {
  const response = await fetch(`${API_BASE_URL}/api/sectors/top-brokers?cohort=${cohort}&metric=${metric}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch top brokers`);
  }
  return response.json();
}

// --- AUTHENTICATION API ---

export async function loginUser(email: string, password: string) {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: 'Login gagal.' }));
    throw new Error(err.detail || 'Email atau password salah.');
  }
  return response.json();
}

export async function registerUser(email: string, password: string, fullName: string) {
  const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, full_name: fullName }),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: 'Registrasi gagal.' }));
    throw new Error(err.detail || 'Registrasi gagal.');
  }
  return response.json();
}

export async function getMeProfile(token: string) {
  const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!response.ok) {
    throw new Error('Sesi kedaluwarsa.');
  }
  return response.json();
}

// --- USER-OWNED CHAT ROOMS & MULTI-TURN SESSIONS ---

export async function fetchUserChatSessions(): Promise<{ sessions: ChatSession[] }> {
  const token = getStoredToken();
  if (!token) return { sessions: [] };
  const res = await fetch(`${API_BASE_URL}/api/chat/sessions`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) return { sessions: [] };
  return res.json();
}

export async function createChatRoom(title?: string, primaryTicker?: string): Promise<{ session: ChatSession }> {
  const token = getStoredToken();
  if (!token) throw new Error('Autentikasi diperlukan.');
  const res = await fetch(`${API_BASE_URL}/api/chat/sessions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ title, primary_ticker: primaryTicker }),
  });
  if (!res.ok) throw new Error('Gagal membuat sesi riset baru.');
  return res.json();
}

export async function fetchChatRoomDetails(sessionId: string): Promise<{ session: ChatSession; messages: ChatMessage[] }> {
  const token = getStoredToken();
  if (!token) throw new Error('Autentikasi diperlukan.');
  const res = await fetch(`${API_BASE_URL}/api/chat/sessions/${sessionId}`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Gagal memuat detail sesi riset.');
  return res.json();
}

export async function deleteChatRoom(sessionId: string): Promise<{ status: string }> {
  const token = getStoredToken();
  if (!token) throw new Error('Autentikasi diperlukan.');
  const res = await fetch(`${API_BASE_URL}/api/chat/sessions/${sessionId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Gagal menghapus sesi riset.');
  return res.json();
}

// --- USER-OWNED RESEARCH HISTORY & WATCHLIST ---

export async function fetchUserResearchHistory(limit = 20) {
  const token = getStoredToken();
  if (!token) return { history: [] };
  const res = await fetch(`${API_BASE_URL}/api/agent/history?limit=${limit}`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) return { history: [] };
  return res.json();
}

export async function fetchUserWatchlist() {
  const token = getStoredToken();
  if (!token) return { watchlist: [] };
  const res = await fetch(`${API_BASE_URL}/api/user/watchlist`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) return { watchlist: [] };
  return res.json();
}

export async function addToWatchlist(ticker: string, notes?: string) {
  const token = getStoredToken();
  if (!token) throw new Error('Autentikasi diperlukan.');
  const res = await fetch(`${API_BASE_URL}/api/user/watchlist`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ ticker, notes }),
  });
  if (!res.ok) throw new Error('Gagal menambahkan ke watchlist.');
  return res.json();
}

export async function removeFromWatchlist(ticker: string) {
  const token = getStoredToken();
  if (!token) throw new Error('Autentikasi diperlukan.');
  const res = await fetch(`${API_BASE_URL}/api/user/watchlist/${ticker}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Gagal menghapus dari watchlist.');
  return res.json();
}

// --- SETTINGS & BYOK SECTORS API KEY ---

export async function verifySectorsApiKey(apiKey: string): Promise<{ status: string; message: string; latency_ms: number }> {
  const res = await fetch(`${API_BASE_URL}/api/sectors/verify-key`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ api_key: apiKey }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Verifikasi API key gagal.' }));
    throw new Error(err.detail || 'API key tidak valid.');
  }
  return res.json();
}

export async function saveCustomSectorsApiKey(apiKey: string | null) {
  const token = getStoredToken();
  setCustomSectorsKey(apiKey);
  if (token) {
    try {
      await fetch(`${API_BASE_URL}/api/auth/settings/api-key`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ api_key: apiKey }),
      });
    } catch {}
  }
}

export async function fetchUserCredits(): Promise<{ demo_credits: number; max_credits: number; has_custom_sectors_key: boolean }> {
  const token = getStoredToken();
  if (!token) return { demo_credits: 50, max_credits: 50, has_custom_sectors_key: !!getCustomSectorsKey() };
  const res = await fetch(`${API_BASE_URL}/api/auth/credits`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) return { demo_credits: 50, max_credits: 50, has_custom_sectors_key: !!getCustomSectorsKey() };
  return res.json();
}
