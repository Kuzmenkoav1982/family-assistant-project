import { useCallback, useEffect, useState } from 'react';
import type { GoalKeyResult, LifeGoal } from '@/components/life-road/types';
import { computeProgress } from '@/lib/goals/progress';
import type { ProgressFlash } from './useProgressAnimations';

// Общая механика «после успешного check-in» для всех методик (SMART/OKR/Wheel/...).
//
// Состав:
//  1. useProgressFlash — pulse-эффект полосы и delta-бейдж. Запускается только при
//     реальной дельте execution. Сам сбрасывается через flashDurationMs.
//  2. usePendingCheckinHighlight — id только что созданного check-in, чтобы
//     история подсветила именно эту строку. Сбрасывается явно из UI (родителем).
//  3. useGoalCheckinFlow — наружу один удобный API: progressFlash,
//     pendingHighlightCheckinId, applyAfterSave, consumePendingHighlight.
//
// Хук НЕ знает:
//  - про форму ввода
//  - про API-запросы
//  - про конкретный UI методики

// ============================ useProgressFlash ============================

interface UseProgressFlashOptions {
  /** Сколько мс держим pulse. По умолчанию 2000 мс. */
  durationMs?: number;
}

interface UseProgressFlashResult {
  progressFlash: ProgressFlash | null;
  /** Поднять flash. Сам решает: показывать или нет (delta !== 0). */
  triggerFlash: (delta: number, from: number, to: number) => void;
  /** Принудительный сброс — нужен редко (например, на смене цели). */
  clearFlash: () => void;
}

export function useProgressFlash(options?: UseProgressFlashOptions): UseProgressFlashResult {
  const durationMs = options?.durationMs ?? 2000;
  const [progressFlash, setProgressFlash] = useState<ProgressFlash | null>(null);

  // Авто-сброс по nonce: при каждом новом save — свежий таймер,
  // старый снимается через cleanup.
  useEffect(() => {
    if (!progressFlash) return;
    const t = setTimeout(() => setProgressFlash(null), durationMs);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progressFlash?.nonce, durationMs]);

  const triggerFlash = useCallback((delta: number, from: number, to: number) => {
    if (delta === 0) return; // никаких ложных pulse
    setProgressFlash({ delta, from, to, nonce: Date.now() });
  }, []);

  const clearFlash = useCallback(() => setProgressFlash(null), []);

  return { progressFlash, triggerFlash, clearFlash };
}

// ===================== usePendingCheckinHighlight =====================

interface UsePendingCheckinHighlightResult {
  pendingHighlightCheckinId: string | null;
  /** Запомнить id нового check-in для подсветки строки в истории. */
  setPendingHighlight: (id: string | null | undefined) => void;
  /** Сбросить (обычно вызывает дочерний компонент истории). */
  consumePendingHighlight: () => void;
}

export function usePendingCheckinHighlight(): UsePendingCheckinHighlightResult {
  const [pendingHighlightCheckinId, setId] = useState<string | null>(null);

  const setPendingHighlight = useCallback((id: string | null | undefined) => {
    setId(id ?? null);
  }, []);

  const consumePendingHighlight = useCallback(() => setId(null), []);

  return { pendingHighlightCheckinId, setPendingHighlight, consumePendingHighlight };
}

// ========================= useGoalCheckinFlow =========================

export interface ApplySavedParams {
  /** Цель ДО сохранения — нужна для сравнения execution. */
  prevGoal: LifeGoal | null;
  /** Цель ПОСЛЕ сохранения (свежая, нормализованная). */
  nextGoal: LifeGoal;
  /** Актуальный список KR. Передаётся, потому что для OKR это источник прогресса. */
  prevKeyResults?: GoalKeyResult[];
  /** KR после сохранения (актуальные на момент next). По умолчанию = prevKeyResults. */
  nextKeyResults?: GoalKeyResult[];
  /** Id созданного check-in для подсветки строки истории. */
  checkinId?: string | null;
}

export interface UseGoalCheckinFlowResult {
  /** Pulse-эффект полосы прогресса. Прокидывается в *ProgressDisplay. */
  progressFlash: ProgressFlash | null;
  /** Id check-in для подсветки строки. Прокидывается в GoalCheckinsCard. */
  pendingHighlightCheckinId: string | null;
  /**
   * Применить эффект после сохранения:
   *  - сравнить execution до/после через computeProgress (единый путь)
   *  - запустить flash, если delta !== 0
   *  - если передан checkinId — запомнить для подсветки
   */
  applyAfterSave: (params: ApplySavedParams) => void;
  /** Отдельно поднять подсветку строки (когда POST checkin завершился позже save). */
  setPendingHighlight: (id: string | null | undefined) => void;
  /** Сбросить pending highlight (зовёт GoalCheckinsCard после подсветки). */
  consumePendingHighlight: () => void;
}

export function useGoalCheckinFlow(
  options?: UseProgressFlashOptions,
): UseGoalCheckinFlowResult {
  const flash = useProgressFlash(options);
  const highlight = usePendingCheckinHighlight();

  const applyAfterSave = useCallback(
    ({
      prevGoal,
      nextGoal,
      prevKeyResults = [],
      nextKeyResults,
      checkinId,
    }: ApplySavedParams) => {
      // Единый путь сравнения — тот же computeProgress, что использует UI.
      // Так гарантируется, что pulse не сработает при «визуальном нуле».
      const krsAfter = nextKeyResults ?? prevKeyResults;
      const prevExec = prevGoal ? computeProgress(prevGoal, [], prevKeyResults).execution : 0;
      const nextExec = computeProgress(nextGoal, [], krsAfter).execution;
      flash.triggerFlash(nextExec - prevExec, prevExec, nextExec);
      if (checkinId) highlight.setPendingHighlight(checkinId);
    },
    [flash, highlight],
  );

  return {
    progressFlash: flash.progressFlash,
    pendingHighlightCheckinId: highlight.pendingHighlightCheckinId,
    applyAfterSave,
    setPendingHighlight: highlight.setPendingHighlight,
    consumePendingHighlight: highlight.consumePendingHighlight,
  };
}