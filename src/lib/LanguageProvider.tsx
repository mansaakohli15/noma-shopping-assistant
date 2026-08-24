import { useState, type ReactNode } from 'react';
import type { AppLanguage } from './language';
import { LANGUAGE_STORAGE_KEY } from './language';
import { LanguageContext } from './languageContextObject';

function loadInitialLanguage(): AppLanguage {
  try {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (stored === 'en' || stored === 'hi' || stored === 'hinglish') return stored;
  } catch {
    // Storage unavailable — fall back to the default below.
  }
  return 'en';
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<AppLanguage>(loadInitialLanguage);

  const setLanguage = (next: AppLanguage) => {
    setLanguageState(next);
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, next);
    } catch {
      // Storage unavailable — the choice still works for this session.
    }
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>{children}</LanguageContext.Provider>
  );
}
