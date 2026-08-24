// Turns common Hindi/Hinglish shopping phrases into a canonical English
// command string (e.g. "add 2 packet milk"), which then runs through the
// existing, unmodified commandParser — this file does NOT duplicate
// intent/quantity/unit parsing, it only bridges the grammar gap.
//
// Hindi/Hinglish shopping sentences are usually verb-final ("doodh add kar
// do" = "milk add do-it"), which is why this needs its own small pattern
// table rather than reusing commandParser's verb-first English patterns
// directly. Deliberately covers common shopping phrasing, not general
// Hindi grammar — see the milestone notes for what's out of scope.

import { hindiNumberWords, productAliases, unitAliases } from '../data/shoppingVocabulary';

type NormalizedIntent = 'add' | 'remove' | 'update';

interface NormalizedCommand {
  intent: NormalizedIntent;
  item: string;
  quantity?: string;
  unit?: string;
}

const numberPattern = `(\\d+|${Object.keys(hindiNumberWords).join('|')})`;

interface Pattern {
  regex: RegExp;
  build: (match: RegExpMatchArray) => NormalizedCommand;
}

// Checked in order — more specific patterns (with quantity/unit captured)
// come before their more general counterparts, since a general pattern
// like "X add kar do" would otherwise also match a more specific sentence
// that includes a quantity and unit.
const patterns: Pattern[] = [
  // "milk ki quantity 4 kar do" / "milk quantity 4 karo"
  {
    regex: new RegExp(`^(.+?)\\s+(?:ki\\s+)?quantity\\s+${numberPattern}\\s*(?:kar\\s*do|kar\\s*de|karo)?$`, 'i'),
    build: (m) => ({ intent: 'update', item: m[1], quantity: m[2] }),
  },
  // "दूध की मात्रा 4 कर दो" — Devanagari "quantity"
  {
    regex: new RegExp(`^(.+?)\\s+(?:की\\s+)?मात्रा\\s+${numberPattern}\\s*(?:कर\\s*दो|कर\\s*दे)?$`),
    build: (m) => ({ intent: 'update', item: m[1], quantity: m[2] }),
  },
  // "doodh ke do packet add kar do"
  {
    regex: new RegExp(`^(.+?)\\s+ke\\s+${numberPattern}\\s+(\\w+)\\s+add\\s*kar\\s*do$`, 'i'),
    build: (m) => ({ intent: 'add', item: m[1], quantity: m[2], unit: m[3] }),
  },
  // "दूध के दो पैकेट जोड़ो" — Devanagari "of X, N units, add"
  {
    regex: new RegExp(`^(.+?)\\s+के\\s+${numberPattern}\\s+(\\S+)\\s+(?:जोड़ो|जोड़\\s*दो)$`),
    build: (m) => ({ intent: 'add', item: m[1], quantity: m[2], unit: m[3] }),
  },
  // "seb ke paanch add karo" / "seb ke paanch add kar do"
  {
    regex: new RegExp(`^(.+?)\\s+ke\\s+${numberPattern}\\s+add\\s*(?:kar\\s*do|karo)$`, 'i'),
    build: (m) => ({ intent: 'add', item: m[1], quantity: m[2] }),
  },
  // "सेब के पांच जोड़ो" — Devanagari "of X, N, add" (no unit)
  {
    regex: new RegExp(`^(.+?)\\s+के\\s+${numberPattern}\\s+(?:जोड़ो|जोड़\\s*दो)$`),
    build: (m) => ({ intent: 'add', item: m[1], quantity: m[2] }),
  },
  // "do bread le aao"
  {
    regex: new RegExp(`^${numberPattern}\\s+(.+?)\\s+le\\s*aao$`, 'i'),
    build: (m) => ({ intent: 'add', item: m[2], quantity: m[1] }),
  },
  // "milk list mein add kar do"
  {
    regex: /^(.+?)\s+list\s+mein\s+add\s*(?:kar\s*do|karo)$/i,
    build: (m) => ({ intent: 'add', item: m[1] }),
  },
  // "doodh add kar do" / "doodh add karo" (no quantity)
  {
    regex: /^(.+?)\s+add\s*(?:kar\s*do|karo)$/i,
    build: (m) => ({ intent: 'add', item: m[1] }),
  },
  // "mujhe apples chahiye"
  {
    regex: /^mujhe\s+(.+?)\s+chahiye$/i,
    build: (m) => ({ intent: 'add', item: m[1] }),
  },
  // "seb chahiye" (no "mujhe")
  {
    regex: /^(.+?)\s+chahiye$/i,
    build: (m) => ({ intent: 'add', item: m[1] }),
  },
  // "दूध जोड़ो" / "दूध जोड़ दो" — Devanagari "add"
  {
    regex: /^(.+?)\s+(?:जोड़ो|जोड़\s*दो)$/,
    build: (m) => ({ intent: 'add', item: m[1] }),
  },
  // "सेब चाहिए" — Devanagari "want/need"
  {
    regex: /^(.+?)\s+चाहिए$/,
    build: (m) => ({ intent: 'add', item: m[1] }),
  },
  // "eggs hata do" / "eggs hata de" / "eggs nikaal do"
  {
    regex: /^(.+?)\s+(?:hata\s*do|hata\s*de|nikaal\s*do|nikal\s*do)$/i,
    build: (m) => ({ intent: 'remove', item: m[1] }),
  },
  // "ब्रेड हटा दो" / "दूध हटा दो" — Devanagari "remove"
  {
    regex: /^(.+?)\s+(?:हटा\s*दो|हटा\s*दे|निकाल\s*दो|निकल\s*दो)$/,
    build: (m) => ({ intent: 'remove', item: m[1] }),
  },
];

function translateWord(word: string): string {
  return productAliases[word.toLowerCase()] ?? word;
}

function translateItemPhrase(phrase: string): string {
  return phrase
    .trim()
    .split(/\s+/)
    .map(translateWord)
    .join(' ');
}

function translateQuantity(word: string): string {
  if (/^\d+$/.test(word)) return word;
  const value = hindiNumberWords[word.toLowerCase()];
  return value !== undefined ? String(value) : word;
}

function translateUnit(word: string | undefined): string | undefined {
  if (!word) return undefined;
  return unitAliases[word.toLowerCase()] ?? word;
}

// Returns a canonical English command string like "add 2 packet milk", or
// null if the transcript doesn't match any recognized Hindi/Hinglish
// shopping phrasing — the caller then falls back to parsing it as English.
export function normalizeMultilingualTranscript(rawTranscript: string): string | null {
  const transcript = rawTranscript.trim().toLowerCase();
  if (!transcript) return null;

  for (const pattern of patterns) {
    const match = transcript.match(pattern.regex);
    if (!match) continue;

    const command = pattern.build(match);
    const item = translateItemPhrase(command.item);
    const quantity = command.quantity ? translateQuantity(command.quantity) : undefined;
    const unit = translateUnit(command.unit);

    if (command.intent === 'update') {
      return `change ${item} to ${quantity}`;
    }
    if (command.intent === 'remove') {
      return `remove ${item}`;
    }
    return `add ${[quantity, unit, item].filter(Boolean).join(' ')}`;
  }

  return null;
}
