import type { VoiceCommand } from '../types';

// Default recognition language. Kept as a named constant rather than
// hardcoded in components so multilingual support can plug in later
// without hunting through the codebase.
export const DEFAULT_SPEECH_LANGUAGE = 'en-IN';

function getSpeechRecognitionConstructor(): { new (): SpeechRecognition } | undefined {
  if (typeof window === 'undefined') return undefined;
  return window.SpeechRecognition ?? window.webkitSpeechRecognition;
}

export function isSpeechRecognitionSupported(): boolean {
  return Boolean(getSpeechRecognitionConstructor());
}

export interface CreateSpeechRecognitionOptions {
  language?: string;
}

// Builds a configured SpeechRecognition instance, or null if the browser
// doesn't support it. Doesn't start it — the caller decides when.
export function createSpeechRecognition(
  options: CreateSpeechRecognitionOptions = {},
): SpeechRecognition | null {
  const Recognition = getSpeechRecognitionConstructor();
  if (!Recognition) return null;

  const recognition = new Recognition();
  recognition.lang = options.language ?? DEFAULT_SPEECH_LANGUAGE;
  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.maxAlternatives = 1;
  return recognition;
}

// Turning a transcript into a structured shopping action is the next
// milestone (local parser + Gemini fallback). Left as a throwing
// placeholder so nothing accidentally depends on it before it's real.
export function parseTranscript(_transcript: string): VoiceCommand {
  throw new Error('parseTranscript is not implemented yet — coming in the NLP milestone');
}
