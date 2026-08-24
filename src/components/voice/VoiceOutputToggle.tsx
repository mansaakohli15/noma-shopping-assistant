interface VoiceOutputToggleProps {
  enabled: boolean;
  onToggle: () => void;
}

export function VoiceOutputToggle({ enabled, onToggle }: VoiceOutputToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={!enabled}
      aria-label={enabled ? 'Mute voice confirmations' : 'Unmute voice confirmations'}
      className="inline-flex items-center gap-1.5 rounded-full border border-line bg-cream-soft px-3 py-1 text-xs font-medium text-ink-soft transition-colors hover:text-ink"
    >
      {enabled ? (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M11 5 6 9H3v6h3l5 4V5Z" />
          <path d="M15.5 8.5a5 5 0 0 1 0 7" />
          <path d="M18.5 6a9 9 0 0 1 0 12" />
        </svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M11 5 6 9H3v6h3l5 4V5Z" />
          <path d="m17 9 5 6M22 9l-5 6" />
        </svg>
      )}
      {enabled ? 'Voice on' : 'Voice off'}
    </button>
  );
}
