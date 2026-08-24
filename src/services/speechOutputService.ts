// Wraps the browser's native SpeechSynthesis API for speaking voice
// command confirmations aloud. Kept isolated here so UI components never
// touch `window.speechSynthesis` directly — mirrors how voiceService.ts
// isolates SpeechRecognition.

export function isSpeechOutputSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

// Cancelling before speaking — rather than only cancelling on conflict —
// keeps this simple and guarantees confirmations never queue up or
// overlap, which is what short one-off confirmations need.
export function speakConfirmation(text: string, lang?: string): void {
  if (!isSpeechOutputSupported()) return;

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  if (lang) utterance.lang = lang;
  window.speechSynthesis.speak(utterance);
}

export function cancelSpeech(): void {
  if (!isSpeechOutputSupported()) return;
  window.speechSynthesis.cancel();
}
