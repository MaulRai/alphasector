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

export function getApiHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const token = getStoredToken();
  const customSectorsKey = getCustomSectorsKey();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (customSectorsKey && customSectorsKey.trim()) {
    headers['X-Sectors-Api-Key'] = customSectorsKey.trim();
  }
  return headers;
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
  sessionId?: string,
  imageBase64?: string | null,
  imageMimeType?: string | null
): Promise<AgentQueryResponse> {
  const headers = getApiHeaders();

  const response = await fetch(`${API_BASE_URL}/api/agent/query`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      query,
      context_ticker: contextTicker || null,
      session_id: sessionId || null,
      image_base64: imageBase64 || null,
      image_mime_type: imageMimeType || null,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Agent query failed (${response.status}): ${errorText}`);
  }

  return response.json();
}

export async function queryAgentStream(
  query: string, 
  contextTicker?: string, 
  sessionId?: string,
  imageBase64?: string | null,
  imageMimeType?: string | null,
  onStep?: (step: any, totalSteps: number) => void
): Promise<AgentQueryResponse> {
  const headers = getApiHeaders();

  const response = await fetch(`${API_BASE_URL}/api/agent/query-stream`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      query,
      context_ticker: contextTicker || null,
      session_id: sessionId || null,
      image_base64: imageBase64 || null,
      image_mime_type: imageMimeType || null,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorMsg = `Agent query failed (${response.status}): ${errorText}`;
    try {
      const parsed = JSON.parse(errorText);
      if (parsed.detail) errorMsg = parsed.detail;
    } catch {}
    throw new Error(errorMsg);
  }

  const reader = response.body?.getReader();
  if (!reader) {
    return queryAgent(query, contextTicker, sessionId, imageBase64, imageMimeType);
  }

  const decoder = new TextDecoder();
  let buffer = '';
  let finalResponse: AgentQueryResponse | null = null;

  // Step queue to pace ultra-fast steps so each is visible for at least 0.25s (250ms)
  const stepQueue: Array<{ step: any; totalSteps: number }> = [];
  let isProcessingQueue = false;

  const processQueue = async () => {
    if (isProcessingQueue) return;
    isProcessingQueue = true;

    while (stepQueue.length > 0) {
      const nextItem = stepQueue.shift();
      if (nextItem && onStep) {
        onStep(nextItem.step, nextItem.totalSteps);
        // Show each fleeting step for at least 0.25s (250ms)
        await new Promise((resolve) => setTimeout(resolve, 250));
      }
    }

    isProcessingQueue = false;
  };

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const chunks = buffer.split('\n\n');
    buffer = chunks.pop() || '';

    for (const chunk of chunks) {
      const trimmed = chunk.trim();
      if (!trimmed.startsWith('data:')) continue;
      const jsonStr = trimmed.slice(5).trim();
      if (!jsonStr) continue;

      try {
        const payload = JSON.parse(jsonStr);
        if (payload.type === 'step') {
          if (onStep && payload.step) {
            stepQueue.push({ step: payload.step, totalSteps: payload.total_steps });
            // Start queue processor in background if not already running
            processQueue();
          }
        } else if (payload.type === 'done') {
          finalResponse = payload.response;
        } else if (payload.type === 'error') {
          throw new Error(payload.detail || 'Gagal mengeksekusi streaming penalaran agent.');
        }
      } catch (err: any) {
        if (err.message && err.message.includes('Gagal')) {
          throw err;
        }
        console.warn('Failed to parse SSE payload chunk:', chunk, err);
      }
    }
  }

  // Ensure any queued steps finish displaying for their full 0.25s before resolving
  while (stepQueue.length > 0 || isProcessingQueue) {
    await new Promise((resolve) => setTimeout(resolve, 50));
  }

  if (!finalResponse) {
    throw new Error('Penalaran agent selesai tanpa hasil sintesis akhir.');
  }

  return finalResponse;
}

export async function fetchCompanyReport(symbol: string) {
  const cleanSymbol = symbol.toUpperCase().replace('.JK', '');
  const response = await fetch(`${API_BASE_URL}/api/sectors/company/${cleanSymbol}`, {
    headers: getApiHeaders(),
  });
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
  const response = await fetch(url, {
    headers: getApiHeaders(),
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch segments for ${symbol}`);
  }
  return response.json();
}

export async function fetchBrokerSummary(symbol: string) {
  const cleanSymbol = symbol.toUpperCase().replace('.JK', '');
  const response = await fetch(`${API_BASE_URL}/api/sectors/broker-flow/${cleanSymbol}`, {
    headers: getApiHeaders(),
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch broker flow for ${symbol}`);
  }
  return response.json();
}

export async function fetchForeignFlow(symbol: string) {
  const cleanSymbol = symbol.toUpperCase().replace('.JK', '');
  const response = await fetch(`${API_BASE_URL}/api/sectors/foreign-flow/${cleanSymbol}`, {
    headers: getApiHeaders(),
  });
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

  const response = await fetch(`${API_BASE_URL}/api/sectors/screener?${searchParams.toString()}`, {
    headers: getApiHeaders(),
  });
  if (!response.ok) {
    throw new Error(`Failed to screen companies`);
  }
  return response.json();
}

export async function fetchTradeIdeaPreset(ideaSlug: string) {
  const response = await fetch(`${API_BASE_URL}/api/sectors/trade-ideas/${ideaSlug}`, {
    headers: getApiHeaders(),
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch trade idea ${ideaSlug}`);
  }
  return response.json();
}

export async function fetchSubsectors() {
  const response = await fetch(`${API_BASE_URL}/api/sectors/subsectors`, {
    headers: getApiHeaders(),
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch subsectors`);
  }
  return response.json();
}

export async function fetchTopMovers(periods = '7d', n_stock = 5) {
  const response = await fetch(`${API_BASE_URL}/api/sectors/top-movers?periods=${periods}&n_stock=${n_stock}`, {
    headers: getApiHeaders(),
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch top movers`);
  }
  return response.json();
}

export async function fetchTopBrokers(cohort = 'institutional', metric = 'gross') {
  const response = await fetch(`${API_BASE_URL}/api/sectors/top-brokers?cohort=${cohort}&metric=${metric}`, {
    headers: getApiHeaders(),
  });
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

export async function fetchCustomSectorsApiKey(): Promise<string> {
  const token = getStoredToken();
  if (!token) return getCustomSectorsKey() || '';
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/settings/api-key`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!res.ok) return getCustomSectorsKey() || '';
    const data = await res.json();
    const key = data.api_key || '';
    if (key) {
      setCustomSectorsKey(key);
    }
    return key;
  } catch {
    return getCustomSectorsKey() || '';
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

// --- NOTION WORKSPACE EXPORT API ---

export interface NotionExportPayload {
  ticker: string;
  company_name?: string;
  synthesis?: any;
  metrics?: any;
  piotroski?: any;
  pe_band?: any;
  broker_summary?: any;
  custom_notion_api_key?: string;
  custom_parent_page_id?: string;
}

export async function exportToNotion(payload: NotionExportPayload): Promise<{
  success: boolean;
  notion_url?: string;
  page_id?: string;
  is_mock?: boolean;
  message?: string;
  error?: string;
}> {
  const res = await fetch(`${API_BASE_URL}/api/export/notion`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Gagal ekspor ke Notion.' }));
    throw new Error(err.detail || err.message || 'Gagal ekspor ke Notion.');
  }
  return res.json();
}

// --- FORENSIC & INSTITUTIONAL (MCP POWERED) ---

export async function fetchInsiderFilings(symbol?: string, limit: number = 20, offset: number = 0): Promise<{
  symbol?: string;
  data: any;
  latency_ms: number;
  status: number;
}> {
  const headers = getApiHeaders();
  const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
  if (symbol) params.append('symbol', symbol.toUpperCase().replace('.JK', ''));
  const res = await fetch(`${API_BASE_URL}/api/sectors/filings?${params.toString()}`, { headers });
  if (!res.ok) throw new Error(`HTTP error ${res.status}`);
  return res.json();
}

export async function fetchShareholdersComposition(symbol: string, year?: number): Promise<{
  symbol: string;
  data: any;
  latency_ms: number;
  status: number;
}> {
  const headers = getApiHeaders();
  const cleanSym = symbol.toUpperCase().replace('.JK', '');
  const params = new URLSearchParams();
  if (year) params.append('year', String(year));
  const res = await fetch(`${API_BASE_URL}/api/sectors/shareholders/${cleanSym}?${params.toString()}`, { headers });
  if (!res.ok) throw new Error(`HTTP error ${res.status}`);
  return res.json();
}

export async function fetchSuspensions(symbol?: string, limit: number = 20, offset: number = 0): Promise<{
  data: any;
  latency_ms: number;
  status: number;
}> {
  const headers = getApiHeaders();
  const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
  if (symbol) params.append('symbol', symbol.toUpperCase().replace('.JK', ''));
  const res = await fetch(`${API_BASE_URL}/api/sectors/suspensions?${params.toString()}`, { headers });
  if (!res.ok) throw new Error(`HTTP error ${res.status}`);
  return res.json();
}

// --- MINING & COMMODITIES INTELLIGENCE (ESDM MINERBA POWERED) ---

export async function fetchMiningPerformance(ticker: string, year?: number, commodityType?: string): Promise<{
  ticker: string;
  data: any;
  latency_ms: number;
  status: number;
  message?: string;
}> {
  const headers = getApiHeaders();
  const cleanSym = ticker.toUpperCase().replace('.JK', '');
  const params = new URLSearchParams();
  if (year) params.append('year', String(year));
  if (commodityType) params.append('commodity_type', commodityType);
  const res = await fetch(`${API_BASE_URL}/api/sectors/mining/performance/${cleanSym}?${params.toString()}`, { headers });
  if (!res.ok) throw new Error(`HTTP error ${res.status}`);
  return res.json();
}

export async function fetchMiningOwnership(ticker: string): Promise<{
  ticker: string;
  data: any;
  latency_ms: number;
  status: number;
}> {
  const headers = getApiHeaders();
  const cleanSym = ticker.toUpperCase().replace('.JK', '');
  const res = await fetch(`${API_BASE_URL}/api/sectors/mining/ownership/${cleanSym}`, { headers });
  if (!res.ok) throw new Error(`HTTP error ${res.status}`);
  return res.json();
}

export async function fetchMiningLicenses(company?: string, commodityType?: string, province?: string, limit: number = 20): Promise<{
  data: any;
  latency_ms: number;
  status: number;
}> {
  const headers = getApiHeaders();
  const params = new URLSearchParams({ limit: String(limit) });
  if (company) params.append('company', company);
  if (commodityType) params.append('commodity_type', commodityType);
  if (province) params.append('province', province);
  const res = await fetch(`${API_BASE_URL}/api/sectors/mining/licenses?${params.toString()}`, { headers });
  if (!res.ok) throw new Error(`HTTP error ${res.status}`);
  return res.json();
}

export async function fetchMiningCommodityPrice(commodity: string = 'Coal', startYear: number = 2020, endYear: number = 2025): Promise<{
  commodity: string;
  data: any;
  latency_ms: number;
  status: number;
}> {
  const headers = getApiHeaders();
  const params = new URLSearchParams({ commodity, start_year: String(startYear), end_year: String(endYear) });
  const res = await fetch(`${API_BASE_URL}/api/sectors/mining/commodity-price?${params.toString()}`, { headers });
  if (!res.ok) throw new Error(`HTTP error ${res.status}`);
  return res.json();
}


