import { useEffect, useState } from 'react';
import type { VoiceCommand } from '../types';
import { recentActivity as initialSeed } from '../data/homeContent';

const STORAGE_KEY = 'noma_voice_activity_log';

export function getVoiceActivity(): VoiceCommand[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // fallback
  }
  return initialSeed;
}

export function recordVoiceActivity(
  transcript: string,
  intent: VoiceCommand['intent'] = 'add_item',
  status: 'success' | 'error' = 'success',
) {
  const newEntry: VoiceCommand = {
    id: `activity-${Date.now()}`,
    transcript,
    intent,
    timestamp: new Date().toISOString(),
    status,
  };

  const current = getVoiceActivity();
  const updated = [newEntry, ...current].slice(0, 10);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('noma_voice_activity_updated'));
  } catch {
    // ignore
  }

  return updated;
}

export function useVoiceActivity() {
  const [activity, setActivity] = useState<VoiceCommand[]>(() => getVoiceActivity());

  useEffect(() => {
    const handleUpdate = () => {
      setActivity(getVoiceActivity());
    };

    window.addEventListener('noma_voice_activity_updated', handleUpdate);
    return () => {
      window.removeEventListener('noma_voice_activity_updated', handleUpdate);
    };
  }, []);

  return activity;
}
