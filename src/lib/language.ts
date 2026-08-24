export type AppLanguage = 'en' | 'hi' | 'hinglish';

export const LANGUAGE_STORAGE_KEY = 'noma.language';

// Hinglish doesn't have a reliable dedicated Web Speech API language code.
// Rather than pretend the browser can do true Hinglish recognition, we use
// English-India recognition for it and normalize the resulting transcript
// ourselves afterward (see multilingualNormalizer.ts). This is a practical
// approximation, not real Hinglish speech recognition — documented here
// honestly instead of hidden.
export function speechLanguageFor(language: AppLanguage): string {
  if (language === 'hi') return 'hi-IN';
  return 'en-IN'; // english and hinglish both recognize as en-IN
}
