// Server intent interpretation service for complex phrase processing.
// Securely proxies serverless API processing to extract product entities and intent.

const INTENT_ENDPOINT = '/api/ai/interpret';

export interface SearchIntent {
  query: string;
  category: string | null;
  brand: string | null;
  minPrice: number | null;
  maxPrice: number | null;
  attributes: string[];
}

export interface CommandItem {
  name: string;
  quantity?: number;
  unit?: string;
}

export interface CommandIntent {
  intent: 'add' | 'remove' | 'update' | 'unknown';
  items: CommandItem[];
}

async function callIntentService(mode: 'search' | 'command', text: string): Promise<unknown> {
  try {
    const response = await fetch(INTENT_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode, text }),
    });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    // If serverless proxy is offline or unconfigured, caller handles locally.
    return null;
  }
}

function isValidSearchIntent(value: unknown): value is SearchIntent {
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

function isValidCommandIntent(value: unknown): value is CommandIntent {
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

export async function interpretSearchQuery(text: string): Promise<SearchIntent | null> {
  const result = await callIntentService('search', text);
  return isValidSearchIntent(result) ? result : null;
}

export async function interpretShoppingCommand(text: string): Promise<CommandIntent | null> {
  const result = await callIntentService('command', text);
  return isValidCommandIntent(result) ? result : null;
}
