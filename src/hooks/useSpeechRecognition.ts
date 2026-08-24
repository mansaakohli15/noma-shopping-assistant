import { useCallback, useEffect, useRef, useState } from 'react';
import {
  createSpeechRecognition,
  isSpeechRecognitionSupported,
  DEFAULT_SPEECH_LANGUAGE,
} from '../services/voiceService';

export type SpeechStatus = 'idle' | 'listening' | 'processing' | 'success' | 'error';

interface UseSpeechRecognitionOptions {
  language?: string;
}

const UNSUPPORTED_MESSAGE = "Voice input isn't supported in this browser. Try Chrome or Edge.";

function messageForError(error: string): string {
  switch (error) {
    case 'not-allowed':
    case 'permission-denied':
    case 'service-not-allowed':
      return "I couldn't access your microphone.";
    case 'audio-capture':
      return 'No microphone was found.';
    case 'no-speech':
    case 'aborted':
      return "I couldn't hear that. Please try again.";
    case 'network':
      return 'A network issue interrupted voice recognition.';
    default:
      return 'Something went wrong. Please try again.';
  }
}

export function useSpeechRecognition(options: UseSpeechRecognitionOptions = {}) {
  const language = options.language ?? DEFAULT_SPEECH_LANGUAGE;
  const isSupported = isSpeechRecognitionSupported();

  const [status, setStatus] = useState<SpeechStatus>('idle');
  const [transcript, setTranscript] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const finalTranscriptRef = useRef('');
  const processingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
      if (processingTimer.current) clearTimeout(processingTimer.current);
    };
  }, []);

  const start = useCallback(() => {
    if (!isSupported) {
      setStatus('error');
      setErrorMessage(UNSUPPORTED_MESSAGE);
      return;
    }

    // Tapping while listening stops it early, same as speaking a full
    // sentence and pausing — whatever was heard so far still gets used.
    if (status === 'listening') {
      recognitionRef.current?.stop();
      return;
    }

    const recognition = createSpeechRecognition({ language });
    if (!recognition) {
      setStatus('error');
      setErrorMessage(UNSUPPORTED_MESSAGE);
      return;
    }

    finalTranscriptRef.current = '';
    setTranscript('');
    setErrorMessage('');
    recognitionRef.current = recognition;

    recognition.onstart = () => setStatus('listening');

    recognition.onresult = (event) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const text = result[0].transcript;
        if (result.isFinal) {
          finalTranscriptRef.current += text;
        } else {
          interim += text;
        }
      }
      setTranscript((finalTranscriptRef.current + interim).trim());
    };

    recognition.onerror = (event) => {
      setStatus('error');
      setErrorMessage(messageForError(event.error));
    };

    recognition.onend = () => {
      setStatus((current) => {
        // An error event already set status/message — don't overwrite it.
        if (current === 'error') return current;

        const heard = finalTranscriptRef.current.trim();
        if (!heard) {
          setErrorMessage("I couldn't hear that. Please try again.");
          return 'error';
        }

        processingTimer.current = setTimeout(() => setStatus('success'), 500);
        return 'processing';
      });
    };

    try {
      recognition.start();
    } catch {
      setStatus('error');
      setErrorMessage('Something went wrong starting the microphone. Please try again.');
    }
  }, [language, status, isSupported]);

  return { status, transcript, errorMessage, isSupported, start };
}
