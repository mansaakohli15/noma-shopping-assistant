// Serverless endpoint: POST /api/ai/interpret
//
// Deployed as a Vercel Function — this file's path (api/ai/interpret.js)
// maps directly to that route, which is the exact URL the frontend
// already calls in src/services/aiService.ts. No extra router, process,
// or framework is needed for a Vite project deployed on Vercel; that's
// the smallest setup that fits.
//
// This file is plain ESM JavaScript (the project's package.json sets
// "type": "module", so this runs as an ES module, not CommonJS). It is
// NOT part of the Vite/tsc build — tsconfig.app.json only includes
// "src" — so it never affects `npm run build`.
//
// Scope for this milestone: shopping-list COMMAND interpretation only.
// A "search" mode request (not implemented yet) gets a plain 400, which
// the existing frontend already treats exactly like "no backend
// available" — see aiService.ts's `!response.ok` check.
//
// The Groq API key is read from process.env.GROQ_API_KEY here, on the
// server, only. It is never sent to, or bundled into, the browser.

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';

// Single place to change the model. llama-3.1-8b-instant is Groq's
// highest-throughput free-tier model — fast enough for a voice-command
// round trip and capable enough for this narrow extraction task.
const GROQ_MODEL = 'llama-3.1-8b-instant';

const GROQ_TIMEOUT_MS = 8000;

const VALID_INTENTS = new Set(['add', 'remove', 'update', 'unknown']);
const ALLOWED_TOP_KEYS = new Set(['intent', 'items']);
const ALLOWED_ITEM_KEYS = new Set(['name', 'quantity', 'unit']);

// Returned whenever Groq can't help — missing key, network failure,
// timeout, invalid JSON, or a low-confidence command. The frontend's own
// validation in aiService.ts already treats this the same as "AI
// unavailable", so returning it explicitly (rather than an error status)
// keeps the response shape uniform for the caller.
const UNKNOWN_RESULT = { intent: 'unknown', items: [] };

const SYSTEM_PROMPT = `You convert one spoken shopping-list command into strict JSON.

Respond with JSON only — no prose, no markdown fences — matching exactly:
{"intent":"add"|"remove"|"update"|"unknown","items":[{"name":string,"quantity":number,"unit":string}]}

Rules:
- Use "add", "remove", or "update" only when the command clearly asks for that shopping-list action on a specific product.
- If the command is unclear, off-topic, or doesn't name a specific product, respond with {"intent":"unknown","items":[]} — never guess or invent a product.
- Interpret the user's own words only. Do not suggest or invent products from your own knowledge (e.g. "something healthy" has no specific product, so it is unknown).
- Each item needs "name" (the product as the user referred to it, lowercase, singular, no brand names invented), a positive "quantity" (default 1 if unstated), and "unit" (default "piece" if unstated, e.g. "bottle", "loaf", "kg").
- "unknown" always has an empty "items" array.

Examples:
"I think we're running low on milk, add some" -> {"intent":"add","items":[{"name":"milk","quantity":1,"unit":"piece"}]}
"Could you put a couple of apples on my shopping list?" -> {"intent":"add","items":[{"name":"apple","quantity":2,"unit":"piece"}]}
"We're out of bread, I need one loaf" -> {"intent":"add","items":[{"name":"bread","quantity":1,"unit":"loaf"}]}
"Please take the milk off my list" -> {"intent":"remove","items":[{"name":"milk","quantity":1,"unit":"piece"}]}
"Actually make the bananas five" -> {"intent":"update","items":[{"name":"banana","quantity":5,"unit":"piece"}]}
"Can you add something healthy for breakfast?" -> {"intent":"unknown","items":[]}`;

function isPlainObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function hasOnlyAllowedKeys(object, allowed) {
  return Object.keys(object).every((key) => allowed.has(key));
}

// Validated independently of the frontend's own check in aiService.ts —
// a malformed or hallucinated model response should never even leave the
// server looking like trustworthy structured data.
function validateCommandIntent(value) {
  if (!isPlainObject(value)) return null;
  if (!hasOnlyAllowedKeys(value, ALLOWED_TOP_KEYS)) return null;
  if (!VALID_INTENTS.has(value.intent)) return null;
  if (!Array.isArray(value.items)) return null;

  const items = [];
  for (const rawItem of value.items) {
    if (!isPlainObject(rawItem)) return null;
    if (!hasOnlyAllowedKeys(rawItem, ALLOWED_ITEM_KEYS)) return null;

    const { name, quantity, unit } = rawItem;
    if (typeof name !== 'string' || !name.trim()) return null;
    if (typeof quantity !== 'number' || !Number.isFinite(quantity) || quantity <= 0) return null;
    if (typeof unit !== 'string' || !unit.trim()) return null;

    items.push({ name: name.trim(), quantity, unit: unit.trim() });
  }

  // "unknown" must carry no items; add/remove/update must name at least one.
  if (value.intent === 'unknown' ? items.length > 0 : items.length === 0) return null;

  return { intent: value.intent, items };
}

function extractJson(rawText) {
  try {
    return JSON.parse(rawText);
  } catch {
    // Smaller models sometimes wrap JSON in stray prose or code fences
    // despite instructions — try pulling out the first {...} block
    // before giving up entirely.
    const match = rawText.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      return JSON.parse(match[0]);
    } catch {
      return null;
    }
  }
}

async function callGroq(transcript) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), GROQ_TIMEOUT_MS);

  try {
    const response = await fetch(GROQ_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        temperature: 0,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: transcript },
        ],
      }),
      signal: controller.signal,
    });

    if (!response.ok) return null;

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;
    if (typeof content !== 'string') return null;

    return validateCommandIntent(extractJson(content));
  } catch {
    // Network failure, timeout/abort, or anything else unexpected — this
    // must never crash the request. Treated the same as "Groq couldn't
    // confidently interpret it".
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method_not_allowed' });
    return;
  }

  const body = isPlainObject(req.body) ? req.body : {};
  const mode = body.mode ?? 'command';
  const transcript = typeof body.text === 'string' ? body.text : body.transcript;

  // Only the command fallback is implemented in this milestone. Search
  // (or any other/unrecognized mode) gets a plain 400 so the existing
  // frontend fallback treats it exactly like no backend being available.
  if (mode !== 'command') {
    res.status(400).json({ error: 'unsupported_mode' });
    return;
  }

  if (typeof transcript !== 'string' || !transcript.trim()) {
    res.status(400).json({ error: 'missing_transcript' });
    return;
  }

  if (!GROQ_API_KEY) {
    // No key configured — behave exactly like Groq being unavailable
    // rather than erroring, so the app works with or without one.
    res.status(200).json(UNKNOWN_RESULT);
    return;
  }

  const result = await callGroq(transcript.trim());
  res.status(200).json(result ?? UNKNOWN_RESULT);
}
