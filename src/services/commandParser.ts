// Turns a spoken transcript into structured shopping commands.
// Deterministic and rule-based on purpose — no AI/NLP service involved.
// Gemini comes in later for the sentences this can't handle.

import { singularizeWord } from '../lib/textNormalize';

export type CommandIntent = 'add' | 'remove' | 'update';

export interface ParsedCommand {
  intent: CommandIntent;
  item: string; // normalized, singular — e.g. "milk", "apple"
  quantity?: number;
  unit?: string;
}

export interface ParseResult {
  commands: ParsedCommand[];
  understood: boolean;
  reason?: 'missing_item' | 'unrecognized';
}

const numberWords: Record<string, number> = {
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
};

const unitWords: Record<string, string> = {
  bottle: 'bottle',
  bottles: 'bottle',
  piece: 'piece',
  pieces: 'piece',
  packet: 'packet',
  packets: 'packet',
  pack: 'pack',
  packs: 'pack',
  loaf: 'loaf',
  loaves: 'loaf',
  bag: 'bag',
  bags: 'bag',
  tube: 'tube',
  tubes: 'tube',
  dozen: 'dozen',
  dozens: 'dozen',
  box: 'box',
  boxes: 'box',
  can: 'can',
  cans: 'can',
};

const fillerWords = new Set(['a', 'an', 'the', 'some', 'of']);

const addPrefixes = [
  /^i want to buy\s+/i,
  /^i want\s+/i,
  /^i need\s+/i,
  /^add\s+/i,
  /^buy\s+/i,
  /^get\s+/i,
];

const removePrefixes = [/^remove\s+/i, /^delete\s+/i];

const bareAddTriggers = new Set(['add', 'buy', 'get', 'i need', 'i want', 'i want to buy']);
const bareRemoveTriggers = new Set(['remove', 'delete']);

function wordToNumber(word: string | undefined): number | undefined {
  if (!word) return undefined;
  if (/^\d+$/.test(word)) return parseInt(word, 10);
  return numberWords[word.toLowerCase()];
}

// Applies the shared word-level stemmer to a whole phrase — fine here since
// our item phrases are short (1-2 words) and only the last word is plural.
function singularize(phrase: string): string {
  return singularizeWord(phrase);
}

function stripFillerWords(words: string[]): string[] {
  return words.filter((word) => !fillerWords.has(word));
}

function parseItemChunk(rawChunk: string): ParsedCommand | null {
  const words = rawChunk.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0) return null;

  let index = 0;
  let quantity: number | undefined;

  const maybeQuantity = wordToNumber(words[index]);
  if (maybeQuantity !== undefined) {
    quantity = maybeQuantity;
    index++;
  }

  let unit: string | undefined;
  if (index < words.length && unitWords[words[index]]) {
    unit = unitWords[words[index]];
    index++;
    if (words[index] === 'of') index++;
  }

  const itemWords = stripFillerWords(words.slice(index));
  if (itemWords.length === 0) return null;

  return { intent: 'add', item: singularize(itemWords.join(' ')), quantity, unit };
}

function splitItems(text: string): string[] {
  return text
    .split(/,|\band\b/i)
    .map((part) => part.trim())
    .filter(Boolean);
}

function cleanItemPhrase(phrase: string): string {
  const words = stripFillerWords(phrase.trim().toLowerCase().split(/\s+/).filter(Boolean));
  return singularize(words.join(' '));
}

function tryParseUpdate(lower: string): ParseResult | null {
  const quantityMatch = lower.match(/^change\s+(?:the\s+)?(.+?)\s+quantity\s+to\s+(.+)$/);
  const changeMatch = quantityMatch ?? lower.match(/^change\s+(.+?)\s+to\s+(.+)$/);
  const makeMatch = changeMatch ?? lower.match(/^make\s+(.+?)\s+(.+)$/);

  if (!makeMatch) return null;

  const [, itemPart, quantityPart] = makeMatch;
  const item = cleanItemPhrase(itemPart);
  const quantity = wordToNumber(quantityPart.trim().split(/\s+/)[0]);

  if (!item || quantity === undefined) {
    return { commands: [], understood: false, reason: 'unrecognized' };
  }

  return { commands: [{ intent: 'update', item, quantity }], understood: true };
}

export function parseCommand(rawTranscript: string): ParseResult {
  const transcript = rawTranscript.trim();
  if (!transcript) return { commands: [], understood: false, reason: 'unrecognized' };

  const lower = transcript.toLowerCase();

  if (bareAddTriggers.has(lower) || bareRemoveTriggers.has(lower)) {
    return { commands: [], understood: false, reason: 'missing_item' };
  }

  const updateResult = tryParseUpdate(lower);
  if (updateResult) return updateResult;

  for (const prefix of removePrefixes) {
    if (prefix.test(lower)) {
      const remainder = lower
        .replace(prefix, '')
        .replace(/\s+from my list$/, '')
        .trim();
      if (!remainder) return { commands: [], understood: false, reason: 'missing_item' };
      return { commands: [{ intent: 'remove', item: cleanItemPhrase(remainder) }], understood: true };
    }
  }

  for (const prefix of addPrefixes) {
    if (prefix.test(lower)) {
      const remainder = lower.replace(prefix, '').trim();
      if (!remainder) return { commands: [], understood: false, reason: 'missing_item' };

      const chunks = splitItems(remainder);
      const commands = chunks
        .map(parseItemChunk)
        .filter((command): command is ParsedCommand => command !== null);

      if (commands.length === 0) return { commands: [], understood: false, reason: 'unrecognized' };
      return { commands, understood: true };
    }
  }

  return { commands: [], understood: false, reason: 'unrecognized' };
}
