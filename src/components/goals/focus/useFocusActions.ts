import { useCallback, useState } from 'react';
import { lifeApi } from '@/components/life-road/api';
import type { GoalCheckin, LifeGoal } from '@/components/life-road/types';

// Goals Focus V2 — единый action-слой.
//
// Цель: переиспользовать существующие lifeApi.createCheckin и lifeApi.updateGoal,
// а не строить параллельный flow. Любая Focus quick-action в итоге сводится к
// одной из 3-х операций:
//
//   - quickCheckin   → POST checkin (snapshot прогресса/блокера)
//   - reschedule     → PUT goal (deadline)
//   - complete       → PUT goal (status='done')
//
// Хук:
//   - держит общий busy/error state, чтобы UI не раздувался
//   - guard от двойного клика
//   - сообщает родителю о фактических изменениях через onChanged()
//
// Хук НЕ делает refetch сам — это контракт Workshop'a (он держит данные).
// После успеха хук просто зовёт onChanged, родитель решает: reload() или
// optimistic update.

export type FocusActionKind = 'checkin' | 'reschedule' | 'complete';

export interface FocusActionsOptions {
  /** Зовётся после любого успешного действия. Workshop вызывает reload(). */
  onChanged?: (kind: FocusActionKind, goalId: string) => void;
}

export interface QuickCheckinInput {
  summary: string;
  /** Опциональная самооценка 0..10. */
  selfAssessment?: number | null;
  /** Опциональный nextStep — отдельная подсказка пользователя. */
  nextStep?: string | null;
}

export interface UseFocusActionsResult {
  busy: FocusActionKind | null;
  error: string | null;
  /** Сбросить ошибку (например при закрытии раскрытого item). */
  clearError: () => void;

  /** Inline check-in для stale/regressed. */
  quickCheckin: (
    goal: LifeGoal,
    input: QuickCheckinInput,
  ) => Promise<GoalCheckin | null>;

  /** Reschedule deadline для overdue. ISO 'YYYY-MM-DD'. */
  reschedule: (goal: LifeGoal, newDeadline: string) => Promise<LifeGoal | null>;

  /** Mark as done. Без UI confirm — confirm живёт на уровне компонента. */
  completeGoal: (goal: LifeGoal) => Promise<LifeGoal | null>;
}

const TODAY_LOCAL_ISO = (): string => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
};

/** Простая sanity-валидация ISO даты в формате YYYY-MM-DD, не в прошлом. */
export function validateRescheduleDate(value: string): string | null {
  if (!value) return 'Укажи новый срок';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return 'Неверный формат даты';
  const today = TODAY_LOCAL_ISO();
  if (value < today) return 'Новый срок не может быть в прошлом';
  return null;
}

/** Проверка summary для quick check-in. */
export function validateQuickCheckin(input: QuickCheckinInput): string | null {
  const s = (input.summary ?? '').trim();
  if (!s) return 'Опиши коротко, что изменилось';
  if (s.length < 3) return 'Слишком коротко — добавь хотя бы 3 символа';
  if (s.length > 500) return 'Слишком длинно — сократи до 500 символов';
  if (input.selfAssessment != null) {
    const n = Number(input.selfAssessment);
    if (!Number.isFinite(n) || n < 0 || n > 10) {
      return 'Самооценка должна быть от 0 до 10';
    }
  }
  return null;
}

export function useFocusActions(opts: FocusActionsOptions = {}): UseFocusActionsResult {
  const [busy, setBusy] = useState<FocusActionKind | null>(null);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const quickCheckin = useCallback(
    async (goal: LifeGoal, input: QuickCheckinInput): Promise<GoalCheckin | null> => {
      if (busy) return null;
      const v = validateQuickCheckin(input);
      if (v) {
        setError(v);
        return null;
      }
      setBusy('checkin');
      setError(null);
      try {
        const trimmed = input.summary.trim();
        const next: Partial<GoalCheckin> & { goalId: string } = {
          goalId: goal.id,
          summary: trimmed,
          selfAssessment:
            typeof input.selfAssessment === 'number' ? input.selfAssessment : null,
          nextStep: input.nextStep?.trim() || null,
          data: {
            kind: 'focus-quick-checkin',
            source: 'focus-v2',
          },
        };
        const created = await lifeApi.createCheckin(next);
        opts.onChanged?.('checkin', goal.id);
        return created;
      } catch (e) {
        setError((e as Error).message || 'Не удалось сохранить замер');
        return null;
      } finally {
        setBusy(null);
      }
    },
    [busy, opts],
  );

  const reschedule = useCallback(
    async (goal: LifeGoal, newDeadline: string): Promise<LifeGoal | null> => {
      if (busy) return null;
      const v = validateRescheduleDate(newDeadline);
      if (v) {
        setError(v);
        return null;
      }
      setBusy('reschedule');
      setError(null);
      try {
        const updated = await lifeApi.updateGoal(goal.id, { deadline: newDeadline });
        opts.onChanged?.('reschedule', goal.id);
        return updated;
      } catch (e) {
        setError((e as Error).message || 'Не удалось перенести срок');
        return null;
      } finally {
        setBusy(null);
      }
    },
    [busy, opts],
  );

  const completeGoal = useCallback(
    async (goal: LifeGoal): Promise<LifeGoal | null> => {
      if (busy) return null;
      if (goal.status !== 'active') {
        setError('Цель уже не активна');
        return null;
      }
      setBusy('complete');
      setError(null);
      try {
        const updated = await lifeApi.updateGoal(goal.id, { status: 'done' });
        opts.onChanged?.('complete', goal.id);
        return updated;
      } catch (e) {
        setError((e as Error).message || 'Не удалось завершить цель');
        return null;
      } finally {
        setBusy(null);
      }
    },
    [busy, opts],
  );

  return { busy, error, clearError, quickCheckin, reschedule, completeGoal };
}
