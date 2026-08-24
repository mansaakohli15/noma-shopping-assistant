export const VOICE_OUTPUT_STORAGE_KEY = 'noma.voiceOutputEnabled';

export function loadVoiceOutputPreference(): boolean {
  try {
    const stored = localStorage.getItem(VOICE_OUTPUT_STORAGE_KEY);
    if (stored === 'false') return false;
    if (stored === 'true') return true;
  } catch {
    // Storage unavailable — fall back to the default below.
  }
  return true; // default: voice output ON
}

export function saveVoiceOutputPreference(enabled: boolean): void {
  try {
    localStorage.setItem(VOICE_OUTPUT_STORAGE_KEY, String(enabled));
  } catch {
    // Storage unavailable — the choice still works for this session.
  }
}
