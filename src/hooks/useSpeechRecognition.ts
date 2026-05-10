import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Хук распознавания речи через Web Speech API.
 *
 * Поддержка:
 *  - Chrome / Edge / Yandex Browser (Desktop + Android) — full support
 *  - Safari (Desktop + iOS) — частичная: только короткие фразы, без continuous
 *  - Firefox — на момент написания не поддерживает
 *
 * Бесплатно, нативный браузерный API. Без бэкенда.
 */

// Минимальные типы Web Speech API (TypeScript их не включает по умолчанию)
interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}
interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  [index: number]: SpeechRecognitionAlternative;
}
interface SpeechRecognitionResultList {
  length: number;
  [index: number]: SpeechRecognitionResult;
}
interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}
interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}
interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((e: SpeechRecognitionEvent) => void) | null;
  onerror: ((e: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
}
interface SpeechRecognitionCtor {
  new (): SpeechRecognitionInstance;
}

const getSpeechRecognition = (): SpeechRecognitionCtor | null => {
  if (typeof window === 'undefined') return null;
  const w = window as typeof window & {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
};

export interface UseSpeechRecognitionOptions {
  /** Язык распознавания, по умолчанию ru-RU */
  lang?: string;
  /** Непрерывное распознавание (можно говорить длинно) */
  continuous?: boolean;
  /** Показывать промежуточные результаты, пока говорят */
  interimResults?: boolean;
  /** Колбек на финальный распознанный текст */
  onFinalResult?: (text: string) => void;
  /** Колбек на промежуточный текст (живой preview) */
  onInterimResult?: (text: string) => void;
}

export interface UseSpeechRecognitionResult {
  /** Поддерживается ли API в этом браузере */
  isSupported: boolean;
  /** Идёт ли запись */
  isListening: boolean;
  /** Накопленный финальный текст в текущей сессии */
  transcript: string;
  /** Текущий промежуточный текст (живой) */
  interim: string;
  /** Сообщение об ошибке */
  error: string | null;
  /** Старт записи */
  start: () => void;
  /** Стоп записи */
  stop: () => void;
  /** Очистить накопленный текст */
  reset: () => void;
}

/**
 * Web Speech Recognition в React. Управляемое состояние,
 * автообработка ошибок прав, очистка ресурсов.
 */
export const useSpeechRecognition = (
  opts: UseSpeechRecognitionOptions = {}
): UseSpeechRecognitionResult => {
  const {
    lang = 'ru-RU',
    continuous = true,
    interimResults = true,
    onFinalResult,
    onInterimResult,
  } = opts;

  const Ctor = getSpeechRecognition();
  const isSupported = !!Ctor;

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interim, setInterim] = useState('');
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const finalCbRef = useRef(onFinalResult);
  const interimCbRef = useRef(onInterimResult);

  useEffect(() => {
    finalCbRef.current = onFinalResult;
  }, [onFinalResult]);
  useEffect(() => {
    interimCbRef.current = onInterimResult;
  }, [onInterimResult]);

  // Создаём инстанс один раз
  useEffect(() => {
    if (!Ctor) return;
    const r = new Ctor();
    r.lang = lang;
    r.continuous = continuous;
    r.interimResults = interimResults;
    r.maxAlternatives = 1;

    r.onresult = (e: SpeechRecognitionEvent) => {
      let finalText = '';
      let interimText = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const result = e.results[i];
        const chunk = result[0]?.transcript || '';
        if (result.isFinal) {
          finalText += chunk;
        } else {
          interimText += chunk;
        }
      }
      if (finalText) {
        const cleaned = finalText.trim();
        setTranscript(prev => (prev ? prev + ' ' : '') + cleaned);
        finalCbRef.current?.(cleaned);
        setInterim('');
      }
      if (interimText) {
        setInterim(interimText);
        interimCbRef.current?.(interimText);
      }
    };

    r.onerror = (e: SpeechRecognitionErrorEvent) => {
      const msg = mapError(e.error);
      setError(msg);
      setIsListening(false);
    };

    r.onend = () => {
      setIsListening(false);
      setInterim('');
    };

    r.onstart = () => {
      setError(null);
      setIsListening(true);
    };

    recognitionRef.current = r;

    return () => {
      try {
        r.onresult = null;
        r.onerror = null;
        r.onend = null;
        r.onstart = null;
        r.abort();
      } catch {
        // ignore
      }
      recognitionRef.current = null;
    };
  }, [Ctor, lang, continuous, interimResults]);

  const start = useCallback(() => {
    if (!recognitionRef.current) return;
    if (isListening) return;
    setError(null);
    try {
      recognitionRef.current.start();
    } catch (_e) {
      // Если уже запущено или другая ошибка — игнорируем
    }
  }, [isListening]);

  const stop = useCallback(() => {
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.stop();
    } catch {
      // ignore
    }
  }, []);

  const reset = useCallback(() => {
    setTranscript('');
    setInterim('');
    setError(null);
  }, []);

  return {
    isSupported,
    isListening,
    transcript,
    interim,
    error,
    start,
    stop,
    reset,
  };
};

const mapError = (code: string): string => {
  switch (code) {
    case 'not-allowed':
    case 'service-not-allowed':
      return 'Доступ к микрофону запрещён. Разрешите в настройках браузера.';
    case 'no-speech':
      return 'Не услышал речь. Попробуйте ещё раз.';
    case 'audio-capture':
      return 'Микрофон не найден.';
    case 'network':
      return 'Нет связи с сервером распознавания.';
    case 'aborted':
      return '';
    default:
      return `Ошибка распознавания: ${code}`;
  }
};

export default useSpeechRecognition;
