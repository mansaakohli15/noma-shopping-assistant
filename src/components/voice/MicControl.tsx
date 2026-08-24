import { useEffect, useRef, useState } from 'react';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import { useShoppingList } from '../../hooks/useShoppingList';
import { useLanguage } from '../../hooks/useLanguage';
import { useVoiceOutput } from '../../hooks/useVoiceOutput';
import { speechLanguageFor } from '../../lib/language';
import { parseCommand, type ParsedCommand, type ParseResult } from '../../services/commandParser';
import { executeParsedCommands, type CommandExecutionResult } from '../../services/commandExecutor';
import { interpretShoppingCommand } from '../../services/aiService';
import { normalizeMultilingualTranscript } from '../../services/multilingualNormalizer';
import { speakConfirmation, cancelSpeech } from '../../services/speechOutputService';
import { recordVoiceActivity } from '../../lib/voiceActivityStore';
import { LanguageSelector } from './LanguageSelector';
import { VoiceOutputToggle } from './VoiceOutputToggle';

export function MicControl() {
  const { language, setLanguage } = useLanguage();
  const { status, transcript, errorMessage, isSupported, start } = useSpeechRecognition({
    language: speechLanguageFor(language),
  });
  const { items, addProduct, removeItem, setQuantity } = useShoppingList();
  const { enabled: voiceOutputEnabled, toggle: toggleVoiceOutput } = useVoiceOutput();

  const [commandResult, setCommandResult] = useState<CommandExecutionResult | null>(null);
  const processedTranscript = useRef<string | null>(null);

  // A ref mirror of the mute preference so the transcript-processing
  // effect below can read the latest value at speak-time without taking
  // a dependency on it — toggling mute mid-listen shouldn't re-run that
  // effect or reprocess an already-handled transcript.
  const voiceOutputEnabledRef = useRef(voiceOutputEnabled);
  useEffect(() => {
    voiceOutputEnabledRef.current = voiceOutputEnabled;
  }, [voiceOutputEnabled]);

  // Starting a new voice command (tapping the mic again) should cut off
  // any confirmation still being spoken from the previous one.
  useEffect(() => {
    if (status === 'listening') {
      cancelSpeech();
    }
  }, [status]);

  // Stop any in-flight speech if the component unmounts mid-utterance.
  useEffect(() => {
    return () => cancelSpeech();
  }, []);

  // Once speech recognition succeeds: try Hindi/Hinglish normalization
  // first (harmless no-op for plain English — it only matches distinctive
  // Hindi/Hinglish phrasing), then the local command parser, then the
  // optional AI fallback for anything still unrecognized — which safely
  // does nothing if no backend is configured (see aiService.ts) — before
  // finally giving up. Either way, the actual list update always goes
  // through the same existing command executor. Guarded by
  // processedTranscript so this only runs once per transcript, even under
  // StrictMode's double-invoked effects.
  useEffect(() => {
    if (status === 'listening') {
      processedTranscript.current = null;
      return;
    }

    if (status !== 'success' || !transcript) return;
    if (processedTranscript.current === transcript) return;
    processedTranscript.current = transcript;

    let cancelled = false;
    const actions = { addProduct, removeItem, setQuantity };

    // Resolves the transcript down to the single ParseResult that should
    // actually be executed — trying local parsing first, then the Groq
    // fallback for anything local parsing didn't recognize. This never
    // touches the shopping list itself; it only decides *what* to run.
    async function resolveParseResult(): Promise<ParseResult> {
      const canonical = normalizeMultilingualTranscript(transcript);
      const local = parseCommand(canonical ?? transcript);

      if (local.understood) return local;
      if (local.reason !== 'unrecognized') return local;

      const aiIntent = await interpretShoppingCommand(transcript);

      // "unknown" means Groq couldn't confidently interpret it — treated
      // the same as no AI result, falling through to the same
      // "couldn't understand" response as if AI weren't available at all.
      if (aiIntent && aiIntent.intent !== 'unknown' && aiIntent.items.length > 0) {
        const intent = aiIntent.intent;
        const aiCommands: ParsedCommand[] = aiIntent.items.map((item) => ({
          intent,
          item: item.name.toLowerCase(),
          quantity: item.quantity,
          unit: item.unit,
        }));
        return { commands: aiCommands, understood: true };
      }

      return local;
    }

    async function run() {
      const parseResult = await resolveParseResult();
      if (cancelled) return;

      // Single, reliable point where the shopping list is actually changed
      // and the outcome is announced — every successful path (local
      // English/Hindi/Hinglish parsing, or Groq fallback) converges here
      // through the same executeParsedCommands + speak call, so there's no
      // branch that can update the list without also confirming it.
      const result = executeParsedCommands(parseResult, items, actions);
      if (cancelled) return;

      const rawIntent = parseResult.understood && parseResult.commands.length > 0 ? parseResult.commands[0].intent : 'unknown';
      const intentMap: Record<string, import('../../types').VoiceCommandIntent> = {
        add: 'add_item',
        remove: 'remove_item',
        update: 'update_quantity',
        search: 'search_product',
      };
      recordVoiceActivity(transcript, intentMap[rawIntent] ?? 'add_item', result.ok ? 'success' : 'error');

      setCommandResult(result);
      if (result.ok && voiceOutputEnabledRef.current) {
        speakConfirmation(result.message, speechLanguageFor(language));
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [status, transcript, items, addProduct, removeItem, setQuantity, language]);

  const disabled = !isSupported || status === 'listening' || status === 'processing';

  return (
    <div className="flex flex-col items-center gap-4 py-6">
      <div className="flex items-center gap-2">
        <LanguageSelector language={language} onChange={setLanguage} />
        <VoiceOutputToggle enabled={voiceOutputEnabled} onToggle={toggleVoiceOutput} />
      </div>

      <button
        type="button"
        onClick={start}
        disabled={disabled}
        aria-label={status === 'listening' ? 'Stop listening' : 'Tap to speak'}
        className={`relative flex h-28 w-28 items-center justify-center rounded-full transition-all duration-300 md:h-32 md:w-32 ${
          status === 'error'
            ? 'bg-coral text-cream'
            : status === 'processing'
              ? 'bg-forest/80 text-cream'
              : 'bg-forest text-cream shadow-[0_8px_24px_-8px_rgba(31,61,43,0.55)] enabled:hover:scale-[1.03] enabled:active:scale-95'
        } ${!isSupported ? 'opacity-40' : ''}`}
      >
        {status === 'listening' && (
          <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-forest/30" />
        )}

        {status === 'listening' ? (
          <span className="flex items-end gap-1" aria-hidden="true">
            {[0, 1, 2, 3, 4].map((bar) => (
              <span
                key={bar}
                className="w-1 rounded-full bg-cream animate-wave"
                style={{ height: 22, animationDelay: `${bar * 0.09}s` }}
              />
            ))}
          </span>
        ) : status === 'processing' ? (
          <span className="h-6 w-6 animate-spin rounded-full border-2 border-cream/40 border-t-cream" />
        ) : status === 'success' ? (
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
            <path d="m5 12 5 5 9-10" />
          </svg>
        ) : status === 'error' ? (
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round">
            <path d="M12 8v5M12 16h.01" />
            <circle cx="12" cy="12" r="9" />
          </svg>
        ) : (
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="3" width="6" height="11" rx="3" />
            <path d="M5 11a7 7 0 0 0 14 0" />
            <path d="M12 18v3" />
          </svg>
        )}
      </button>

      <div className="min-h-12 max-w-xs text-center">
        {!isSupported ? (
          <p className="text-sm text-coral">{errorMessage}</p>
        ) : status === 'idle' ? (
          <p className="text-sm text-ink-soft">Tap to speak</p>
        ) : status === 'listening' ? (
          <div>
            <p className="text-sm font-medium text-ink">Listening…</p>
            {transcript && <p className="mt-1 text-xs italic text-ink-soft/70">&ldquo;{transcript}&rdquo;</p>}
          </div>
        ) : status === 'processing' ? (
          <p className="text-sm font-medium text-ink">Processing…</p>
        ) : status === 'success' ? (
          <div>
            <p className="text-sm font-medium text-forest">You said</p>
            <p className="num mt-0.5 text-xs text-ink-soft">&ldquo;{transcript}&rdquo;</p>
            {commandResult && (
              <p
                className={`mt-2 text-sm font-medium ${
                  commandResult.ok ? 'text-forest' : 'text-coral'
                }`}
              >
                {commandResult.ok ? `✓ ${commandResult.message}` : commandResult.message}
              </p>
            )}
          </div>
        ) : (
          <div>
            <p className="text-sm font-medium text-coral">{errorMessage}</p>
            <p className="text-xs text-ink-soft">Tap the mic to try again.</p>
          </div>
        )}
      </div>
    </div>
  );
}
