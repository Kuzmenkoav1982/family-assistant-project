// Weekly Review V1.1 — детерминированный narrative + nudges.
//
// Принципы:
//  - Никакого AI. Только шаблоны поверх готового summary + сегментов.
//  - Одна фраза-итог недели, читается за 2 секунды.
//  - 1–2 actionable nudges с приоритетом: overdue > regressed > stale/no-activity > progressed.
//  - Никаких эмоций («ты молодец», «слабая неделя») — нейтрально, фактически.
//  - Если нет конкретной цели-кандидата для nudge — fallback на нейтральный CTA.

import type { LifeGoal } from '@/components/life-road/types';
import type {
  WeeklyGoalView,
  WeeklySummary,
} from './weeklyReviewHelpers';

export type NarrativeTone = 'positive' | 'mixed' | 'attention' | 'empty';

export interface NarrativeNudge {
  /** Уникальный id причины для key. */
  id: string;
  /** Текст кнопки/строки. */
  label: string;
  /** Иконка lucide. */
  icon: string;
  /** Куда вести. */
  target:
    | { kind: 'goal'; goalId: string }
    | { kind: 'tab'; tab: 'progress' | 'regress' | 'review' | 'updated' }
    | { kind: 'route'; path: string };
}

export interface WeeklyNarrative {
  /** Одна фраза-итог. Никогда не пустая. */
  headline: string;
  /** Тон для UI-стилизации (мягкий, не кричащий). */
  tone: NarrativeTone;
  /** 1–2 nudges, в порядке приоритета. */
  nudges: NarrativeNudge[];
}

// ============================ Pluralize ============================

function pluralRu(n: number, one: string, few: string, many: string): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}

function goalsWord(n: number): string {
  return pluralRu(n, 'цель', 'цели', 'целей');
}

function checkinsWord(n: number): string {
  return pluralRu(n, 'замер', 'замера', 'замеров');
}

// ============================ Helpers ============================

function pickGoalTitle(goal: LifeGoal): string {
  const t = (goal.title || '').trim();
  if (!t) return 'без названия';
  if (t.length <= 28) return t;
  return t.slice(0, 26) + '…';
}

// =========================== Headline ===========================

interface BuildNarrativeArgs {
  summary: WeeklySummary;
  segments: {
    progressed: WeeklyGoalView[];
    regressed: WeeklyGoalView[];
    needsReview: WeeklyGoalView[];
  };
  /** Сколько целей всего у пользователя — нужно для разделения empty-сценариев. */
  totalGoals: number;
}

function buildHeadline(args: BuildNarrativeArgs): { text: string; tone: NarrativeTone } {
  const { summary, totalGoals } = args;
  const {
    checkinsThisWeek,
    goalsProgressed,
    goalsRegressed,
    goalsNeedingReview,
  } = summary;

  // 1. Нет целей вообще.
  if (totalGoals === 0) {
    return {
      text: 'Пока нет целей — обзор появится после первой.',
      tone: 'empty',
    };
  }

  // 2. Нет check-in'ов и нет attention.
  if (checkinsThisWeek === 0 && goalsNeedingReview === 0) {
    return {
      text: 'За последние 7 дней новых замеров не было.',
      tone: 'empty',
    };
  }

  // 3. Нет check-in'ов, но есть attention.
  if (checkinsThisWeek === 0 && goalsNeedingReview > 0) {
    return {
      text: `За неделю замеров не было, ${goalsNeedingReview} ${goalsWord(goalsNeedingReview)} ждут пересмотра.`,
      tone: 'attention',
    };
  }

  // 4. Чистый прогресс: только рост, без откатов и attention.
  if (goalsProgressed > 0 && goalsRegressed === 0 && goalsNeedingReview === 0) {
    return {
      text: `Хорошая неделя: ${goalsProgressed} ${goalsWord(goalsProgressed)} ${
        goalsProgressed === 1 ? 'идёт' : 'идут'
      } вверх, без откатов.`,
      tone: 'positive',
    };
  }

  // 5. Прогресс + откаты (без attention).
  if (goalsProgressed > 0 && goalsRegressed > 0 && goalsNeedingReview === 0) {
    return {
      text: `Неделя смешанная: ${goalsProgressed} ${goalsWord(goalsProgressed)} ${
        goalsProgressed === 1 ? 'идёт' : 'идут'
      } вверх, ${goalsRegressed} ${goalsRegressed === 1 ? 'откатилась' : 'откатились'}.`,
      tone: 'mixed',
    };
  }

  // 6. Прогресс + attention (с/без откатов).
  if (goalsProgressed > 0 && goalsNeedingReview > 0) {
    const parts: string[] = [];
    parts.push(
      `${goalsProgressed} ${goalsWord(goalsProgressed)} ${
        goalsProgressed === 1 ? 'идёт' : 'идут'
      } вверх`,
    );
    if (goalsRegressed > 0) {
      parts.push(
        `${goalsRegressed} ${goalsRegressed === 1 ? 'откатилась' : 'откатились'}`,
      );
    }
    parts.push(
      `${goalsNeedingReview} ${
        goalsNeedingReview === 1 ? 'требует' : 'требуют'
      } внимания`,
    );
    return {
      text: parts.join(', ') + '.',
      tone: 'attention',
    };
  }

  // 7. Только откаты.
  if (goalsProgressed === 0 && goalsRegressed > 0) {
    return {
      text: `На этой неделе ${goalsRegressed} ${
        goalsRegressed === 1 ? 'цель откатилась' : 'цели откатились'
      }, прогресса не зафиксировано.`,
      tone: 'attention',
    };
  }

  // 8. Только attention (без прогресса и откатов, но были замеры).
  if (
    goalsProgressed === 0 &&
    goalsRegressed === 0 &&
    goalsNeedingReview > 0 &&
    checkinsThisWeek > 0
  ) {
    return {
      text: `За неделю было ${checkinsThisWeek} ${checkinsWord(checkinsThisWeek)}, но ${goalsNeedingReview} ${goalsWord(
        goalsNeedingReview,
      )} ${goalsNeedingReview === 1 ? 'ждёт' : 'ждут'} пересмотра.`,
      tone: 'attention',
    };
  }

  // 9. Замеры были, но всё ушло в "updated" без знака.
  return {
    text: `За неделю было ${checkinsThisWeek} ${checkinsWord(checkinsThisWeek)} без явного сдвига метрик.`,
    tone: 'mixed',
  };
}

// =========================== Nudges ===========================

/**
 * Возвращаем 1–2 nudges с приоритетом:
 *   overdue → regressed → stale/no-activity → progressed → fallback
 */
function buildNudges(args: BuildNarrativeArgs): NarrativeNudge[] {
  const { segments, totalGoals } = args;
  const result: NarrativeNudge[] = [];
  const usedGoalIds = new Set<string>();

  // 1. Overdue — самый высокий приоритет.
  const overdueView = segments.needsReview.find((v) => v.attention.overdue);
  if (overdueView) {
    result.push({
      id: `nudge-overdue-${overdueView.goal.id}`,
      label: `Открыть просроченную: ${pickGoalTitle(overdueView.goal)}`,
      icon: 'AlertTriangle',
      target: { kind: 'goal', goalId: overdueView.goal.id },
    });
    usedGoalIds.add(overdueView.goal.id);
  }

  // 2. Regressed — самая большая просадка сверху (segments.regressed уже отсортирован).
  if (result.length < 2 && segments.regressed.length > 0) {
    const v = segments.regressed[0];
    if (!usedGoalIds.has(v.goal.id)) {
      result.push({
        id: `nudge-regress-${v.goal.id}`,
        label: `Проверить откат: ${pickGoalTitle(v.goal)}`,
        icon: 'TrendingDown',
        target: { kind: 'goal', goalId: v.goal.id },
      });
      usedGoalIds.add(v.goal.id);
    }
  }

  // 3. Stale / no-activity — заброшенные active цели.
  if (result.length < 2) {
    const staleView = segments.needsReview.find(
      (v) =>
        !usedGoalIds.has(v.goal.id) &&
        !v.attention.overdue &&
        (v.attention.stale || v.weeklyCount === 0),
    );
    if (staleView) {
      result.push({
        id: `nudge-stale-${staleView.goal.id}`,
        label: `Обновить заброшенную: ${pickGoalTitle(staleView.goal)}`,
        icon: 'Hourglass',
        target: { kind: 'goal', goalId: staleView.goal.id },
      });
      usedGoalIds.add(staleView.goal.id);
    }
  }

  // 4. Progressed — самая растущая. Только если уже не набрали 2 actionable из плохих новостей.
  if (result.length < 2 && segments.progressed.length > 0) {
    const v = segments.progressed[0];
    if (!usedGoalIds.has(v.goal.id)) {
      result.push({
        id: `nudge-progress-${v.goal.id}`,
        label: `Продолжить рост: ${pickGoalTitle(v.goal)}`,
        icon: 'TrendingUp',
        target: { kind: 'goal', goalId: v.goal.id },
      });
      usedGoalIds.add(v.goal.id);
    }
  }

  // 5. Fallback — neutral CTA.
  if (result.length === 0) {
    if (totalGoals === 0) {
      result.push({
        id: 'nudge-create',
        label: 'Создать цель',
        icon: 'Plus',
        target: { kind: 'route', path: '/life-road' },
      });
    } else {
      result.push({
        id: 'nudge-open-goals',
        label: 'Открыть мои цели',
        icon: 'Target',
        target: { kind: 'route', path: '/life-road' },
      });
    }
  }

  return result.slice(0, 2);
}

// =========================== Public API ===========================

export function buildWeeklyNarrative(args: BuildNarrativeArgs): WeeklyNarrative {
  const headline = buildHeadline(args);
  const nudges = buildNudges(args);
  return {
    headline: headline.text,
    tone: headline.tone,
    nudges,
  };
}
