// useSuggestions — собирает SignalSnapshot из имеющихся источников
// (Web Vitals + manual hint через window.__statusBannerSuggestHint) и
// прогоняет через generateSuggestions().
//
// Контракт:
//   - НИКОГДА не публикует баннеры
//   - НИКОГДА не вызывает admin write API
//   - только превращает сигналы → список предложений для UI
//
// Manual hint (для теста / demo):
//   window.__statusBannerSuggestHint = {
//     type: 'warning', title: '...', message: '...'
//   };
//   // и затем нажать «Обновить» в админке.

import { useCallback, useEffect, useMemo, useState } from 'react';
import { getPerformanceRating } from '@/utils/webVitals';
import { generateSuggestions } from './engine';
import type { BannerSuggestion, SignalSnapshot } from './types';

type ManualHint = SignalSnapshot['manualHint'];

declare global {
  interface Window {
    __statusBannerSuggestHint?: ManualHint;
  }
}

function readSnapshot(): SignalSnapshot {
  const snap: SignalSnapshot = {};
  try {
    const r = getPerformanceRating();
    if (r === 'poor' || r === 'needs-improvement' || r === 'good') {
      snap.performanceRating = r;
    }
  } catch {
    // ignore
  }
  if (typeof window !== 'undefined') {
    const hint = window.__statusBannerSuggestHint;
    if (hint && typeof hint === 'object' && hint.type && hint.title && hint.message) {
      snap.manualHint = hint;
    }
  }
  return snap;
}

export interface UseSuggestions {
  suggestions: BannerSuggestion[];
  refresh: () => void;
  /** Локальный список «отклонённых» id (не уходит на backend). */
  rejected: ReadonlyArray<string>;
  reject: (id: string) => void;
  unreject: (id: string) => void;
}

export function useSuggestions(): UseSuggestions {
  const [tick, setTick] = useState(0);
  const [rejected, setRejected] = useState<string[]>([]);

  const refresh = useCallback(() => setTick((x) => x + 1), []);

  // Re-eval suggestions при tick + при focus (свежие Web Vitals).
  useEffect(() => {
    const onFocus = () => refresh();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [refresh]);

  const all = useMemo(() => {
    void tick;
    return generateSuggestions(readSnapshot());
  }, [tick]);

  const suggestions = useMemo(
    () => all.filter((s) => !rejected.includes(s.id)),
    [all, rejected],
  );

  const reject = useCallback((id: string) => {
    setRejected((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }, []);

  const unreject = useCallback((id: string) => {
    setRejected((prev) => prev.filter((x) => x !== id));
  }, []);

  return { suggestions, refresh, rejected, reject, unreject };
}
