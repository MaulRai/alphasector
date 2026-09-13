export interface PastedContextItem {
  id: string;
  type: 'INSIDER_FILINGS' | 'INSTITUTIONAL_OWNERSHIP' | 'REGULATORY_SUSPENSIONS' | string;
  title: string;
  ticker?: string;
  summary: string;
  details?: string;
  timestamp: string;
}

export const MAX_PASTED_CONTEXTS = 3;

const CONTEXT_START_MARKER = '--- [ALPHASECTOR_CONTEXT_START] ---';
const CONTEXT_END_MARKER = '--- [ALPHASECTOR_CONTEXT_END] ---';

/**
 * Encodes structured context data into a clipboard-friendly string.
 * Contains machine-parsable JSON enclosed within delimiters followed by
 * a clean human-readable representation if pasted outside AlphaSector.
 */
export function encodeContextForClipboard(item: Omit<PastedContextItem, 'id' | 'timestamp'>): string {
  const payload: PastedContextItem = {
    ...item,
    id: `ctx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString(),
  };

  const jsonStr = JSON.stringify(payload);
  const readable = `[AlphaSector Insight: ${payload.title}]\n${payload.summary}\n\nDetail:\n${payload.details || '-'}`;

  return `${CONTEXT_START_MARKER}\n${jsonStr}\n${CONTEXT_END_MARKER}\n\n${readable}`;
}

/**
 * Detects and parses structured AlphaSector context from raw clipboard text.
 * Returns the PastedContextItem if valid, or null if plain text.
 */
export function parseContextFromClipboard(text: string): PastedContextItem | null {
  if (!text || !text.includes(CONTEXT_START_MARKER) || !text.includes(CONTEXT_END_MARKER)) {
    return null;
  }

  try {
    const parts = text.split(CONTEXT_START_MARKER)[1].split(CONTEXT_END_MARKER);
    const jsonStr = parts[0].trim();
    const parsed = JSON.parse(jsonStr);

    if (parsed && parsed.title && parsed.type) {
      return {
        id: parsed.id || `ctx-${Date.now()}`,
        type: parsed.type,
        title: parsed.title,
        ticker: parsed.ticker,
        summary: parsed.summary || '',
        details: parsed.details || '',
        timestamp: parsed.timestamp || new Date().toISOString(),
      };
    }
  } catch (err) {
    console.error('Failed to parse clipboard context:', err);
  }

  return null;
}
