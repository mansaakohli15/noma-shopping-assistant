import { useEffect, useRef } from 'react';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';

interface SearchMicButtonProps {
  onResult: (transcript: string) => void;
}

export function SearchMicButton({ onResult }: SearchMicButtonProps) {
  const { status, transcript, isSupported, start } = useSpeechRecognition();
  const lastHandled = useRef<string | null>(null);

  useEffect(() => {
    if (status === 'listening') {
      lastHandled.current = null;
      return;
    }
    if (status === 'success' && transcript && lastHandled.current !== transcript) {
      lastHandled.current = transcript;
      onResult(transcript);
    }
  }, [status, transcript, onResult]);

  if (!isSupported) return null; // typed search still works fine without it

  return (
    <button
      type="button"
      onClick={start}
      disabled={status === 'listening' || status === 'processing'}
      aria-label={status === 'listening' ? 'Listening' : 'Search by voice'}
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors ${
        status === 'listening'
          ? 'animate-pulse bg-forest text-cream'
          : 'bg-forest/10 text-forest hover:bg-forest/20'
      }`}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect x="9" y="3" width="6" height="11" rx="3" />
        <path d="M5 11a7 7 0 0 0 14 0" />
        <path d="M12 18v3" />
      </svg>
    </button>
  );
}
