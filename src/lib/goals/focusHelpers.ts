// Goals Focus / Execution V1 — очередь "что делать сегодня".
//
// Слой "Focus" отвечает на вопрос пользователя: с чего начать прямо сейчас?
//
// V1 правила (заморожено):
//  - В очередь попадают только active цели (done/paused/archived исключаются).
//  - Категории:
//      1. overdue   — deadline < now
//      2. regressed — weeklyDeltaSum < 0
//      3. stale     — нет check-in > 7 дней (attention.stale)
//  - Если цель подходит под несколько причин — попадает один раз, по самой
//    важной (overdue > regressed > stale).
//  - Жёсткий severity-порядок: overdue → regressed → stale.
//  - Внутри группы:
//      * overdue   — самые просроченные сверху (deadline asc)
//      * regressed — самое сильное падение сверху (delta asc)
//      * stale     — самые заброшенные сверху (daysSinceUpdate desc / lastCheckinAt asc)
//  - Пользовательской сортировки в V1 нет.
//  - low-progress <20% — НЕ V1 (шумный сигнал, перенесено в backlog).

import type { WeeklyGoalView } from '@/lib/goals/weeklyReviewHelpers';

export type FocusReason = 'overdue' | 'regressed' | 'stale';

export interface FocusItem {
  view: WeeklyGoalView;
  /** Первичная причина (то, по чему элемент сейчас стоит в очереди). */
  reason: FocusReason;
  /** Все причины — для отладки/возможной подсветки. */
  reasons: FocusReason[];
  /**
   * Дополнительный контекст, который удобно показать в строке:
   *  - для overdue: сколько дней просрочено
   *  - для regressed: значение weeklyDeltaSum
   *  - для stale: сколько дней без активности
   */
  context: {
    overdueDays: number | null;
    deltaSum: number | null;
    daysSinceUpdate: number | null;
  };
}

export interface BuildFocusQueueArgs {
  views: WeeklyGoalView[];
  now?: Date;
}

const SEVERITY_ORDER: Record<FocusReason, number> = {
  overdue: 0,
  regressed: 1,
  stale: 2,
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function safeDays(fromIso: string | null | undefined, now: Date): number | null {
  if (!fromIso) return null;
  const t = new Date(fromIso).getTime();
  if (!Number.isFinite(t)) return null;
  return Math.floor((now.getTime() - t) / MS_PER_DAY);
}

/** Считаем причины по которым цель попадает в Focus. Порядок в массиве не важен. */
function detectReasons(view: WeeklyGoalView): FocusReason[] {
  const out: FocusReason[] = [];
  if (view.attention.overdue) out.push('overdue');
  if (typeof view.weeklyDeltaSum === 'number' && view.weeklyDeltaSum < 0) {
    out.push('regressed');
  }
  if (view.attention.stale) out.push('stale');
  return out;
}

/** Выбираем приоритетную причину для строки в очереди. */
function pickPrimary(reasons: FocusReason[]): FocusReason | null {
  if (reasons.length === 0) return null;
  return [...reasons].sort(
    (a, b) => SEVERITY_ORDER[a] - SEVERITY_ORDER[b],
  )[0];
}

function deadlineMs(view: WeeklyGoalView): number | null {
  const d = view.goal.deadline;
  if (!d) return null;
  const t = new Date(d).getTime();
  return Number.isFinite(t) ? t : null;
}

/** Сортировка внутри группы (см. правила сверху). */
function compareWithinGroup(
  a: FocusItem,
  b: FocusItem,
  now: Date,
): number {
  switch (a.reason) {
    case 'overdue': {
      const da = deadlineMs(a.view) ?? now.getTime();
      const db = deadlineMs(b.view) ?? now.getTime();
      // самые просроченные сверху: меньший timestamp = более ранний дедлайн = больше просрочка
      return da - db;
    }
    case 'regressed': {
      const da = a.view.weeklyDeltaSum ?? 0;
      const db = b.view.weeklyDeltaSum ?? 0;
      // самое сильное падение сверху: -10 раньше чем -1
      return da - db;
    }
    case 'stale': {
      const da = a.context.daysSinceUpdate ?? -1;
      const db = b.context.daysSinceUpdate ?? -1;
      // самые заброшенные сверху: больше дней — выше
      return db - da;
    }
  }
}

/**
 * Собирает Focus-очередь из weekly views.
 * Идемпотентно: одна цель — одна строка.
 */
export function buildFocusQueue(args: BuildFocusQueueArgs): FocusItem[] {
  const now = args.now ?? new Date();

  const items: FocusItem[] = [];
  for (const view of args.views) {
    // Жёсткая фильтрация по статусу. Focus — только про active.
    if (view.goal.status !== 'active') continue;

    const reasons = detectReasons(view);
    const primary = pickPrimary(reasons);
    if (!primary) continue;

    const deadlineTs = deadlineMs(view);
    const overdueDays =
      primary === 'overdue' && deadlineTs !== null
        ? Math.max(0, Math.floor((now.getTime() - deadlineTs) / MS_PER_DAY))
        : null;

    items.push({
      view,
      reason: primary,
      reasons,
      context: {
        overdueDays,
        deltaSum: view.weeklyDeltaSum ?? null,
        daysSinceUpdate:
          view.attention.daysSinceUpdate ?? safeDays(view.lastCheckinAt, now),
      },
    });
  }

  // Сортировка: сначала severity, потом внутри группы.
  items.sort((a, b) => {
    const s = SEVERITY_ORDER[a.reason] - SEVERITY_ORDER[b.reason];
    if (s !== 0) return s;
    return compareWithinGroup(a, b, now);
  });

  return items;
}

/** Локализованный label для бейджа причины. */
export function reasonLabel(reason: FocusReason): string {
  switch (reason) {
    case 'overdue':
      return 'Просрочено';
    case 'regressed':
      return 'Откат за неделю';
    case 'stale':
      return 'Нет активности 7 дней';
  }
}

/** Иконка lucide для бейджа причины. */
export function reasonIcon(reason: FocusReason): string {
  switch (reason) {
    case 'overdue':
      return 'AlertTriangle';
    case 'regressed':
      return 'TrendingDown';
    case 'stale':
      return 'Hourglass';
  }
}

/** Группировка для возможной подсветки секций (UI может игнорировать). */
export function groupFocusByReason(items: FocusItem[]): Record<FocusReason, FocusItem[]> {
  return {
    overdue: items.filter((i) => i.reason === 'overdue'),
    regressed: items.filter((i) => i.reason === 'regressed'),
    stale: items.filter((i) => i.reason === 'stale'),
  };
}
