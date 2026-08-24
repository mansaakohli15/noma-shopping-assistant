import { useCallback, useState } from 'react';
import { loadVoiceOutputPreference, saveVoiceOutputPreference } from '../lib/voiceOutput';

export function useVoiceOutput() {
  const [enabled, setEnabledState] = useState<boolean>(loadVoiceOutputPreference);

  const toggle = useCallback(() => {
    setEnabledState((current) => {
      const next = !current;
      saveVoiceOutputPreference(next);
      return next;
    });
  }, []);

  return { enabled, toggle };
}
