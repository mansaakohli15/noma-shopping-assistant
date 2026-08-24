// Optional AI fallback for requests the local parser/search can't confidently
// handle. This file NEVER holds an API key — Groq (or any provider) must be
// called from a backend, not the browser, or the key would ship in the
// client bundle. See /.env.example and /api/ai/interpret.js.
//
// As of the voice-command milestone, /api/ai/interpret handles `mode:
// 'command'` (backed by Groq server-side). `mode: 'search'` isn't
// implemented server-side yet, so those calls still fail fast (the
// backend returns a non-ok response) and interpretSearchQuery returns
// null — the app behaves exactly as if AI didn't exist for search, same
// as before this endpoint existed. If GROQ_API_KEY isn't configured, or
// Groq is unreachable, times out, or returns something unparsable, the
// endpoint itself falls back to an "unknown" result rather than erroring
// — either way, every call here is safe to await and treat as "maybe
// null".

const AI_ENDPOINT = '/api/ai/interpret';

export interface AiSearchIntent {
  query: string;
  category: string | null;
  brand: string | null;
  minPrice: number | null;
  maxPrice: number | null;
  attributes: string[];
}

export interface AiCommandItem {
  name: string;
  quantity?: number;
  unit?: string;
}

export interface AiCommandIntent {
  intent: 'add' | 'remove' | 'update' | 'unknown';
  items: AiCommandItem[];
}

async function callAi(mode: 'search' | 'command', text: string): Promise<unknown> {
  try {
    const response = await fetch(AI_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode, text }),
    });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    // No backend configured, offline, or the request failed for any other
    // reason — the caller falls back to local parsing either way.
    return null;
  }
}

function isValidSearchIntent(value: unknown): value is AiSearchIntent {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.query === 'string' &&
    (candidate.category === null || typeof candidate.category === 'string') &&
    (candidate.brand === null || typeof candidate.brand === 'string') &&
    (candidate.minPrice === null || typeof candidate.minPrice === 'number') &&
    (candidate.maxPrice === null || typeof candidate.maxPrice === 'number') &&
    Array.isArray(candidate.attributes) &&
    candidate.attributes.every((attribute) => typeof attribute === 'string')
  );
}

function isValidCommandIntent(value: unknown): value is AiCommandIntent {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Record<string, unknown>;
  const validIntent =
    candidate.intent === 'add' ||
    candidate.intent === 'remove' ||
    candidate.intent === 'update' ||
    candidate.intent === 'unknown';
  if (!validIntent || !Array.isArray(candidate.items)) return false;

  return candidate.items.every((item) => {
    if (!item || typeof item !== 'object') return false;
    const candidateItem = item as Record<string, unknown>;
    return (
      typeof candidateItem.name === 'string' &&
      (candidateItem.quantity === undefined || typeof candidateItem.quantity === 'number') &&
      (candidateItem.unit === undefined || typeof candidateItem.unit === 'string')
    );
  });
}

// Never invents products or prices — it only extracts filters, which the
// local catalog search then applies. Returns null if AI isn't available or
// its response doesn't match the expected shape.
export async function interpretSearchQuery(text: string): Promise<AiSearchIntent | null> {
  const result = await callAi('search', text);
  return isValidSearchIntent(result) ? result : null;
}

// Returns a structured intent only — never touches shopping-list state
// directly. The caller runs it through the existing command executor.
export async function interpretShoppingCommand(text: string): Promise<AiCommandIntent | null> {
  const result = await callAi('command', text);
  return isValidCommandIntent(result) ? result : null;
}
