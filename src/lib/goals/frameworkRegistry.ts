import type { ReactNode } from 'react';
import type {
  FrameworkType,
  GoalKeyResult,
  GoalMilestone,
  LifeGoal,
} from '@/components/life-road/types';

// Framework Registry — единая точка правды о методиках.
// Каждая методика реализует одинаковый интерфейс GoalFrameworkHandler.
// Это позволяет странице цели и движкам Мастерской работать с методикой
// не зная её внутренностей.

export interface ValidationIssue {
  field: string;
  message: string;
}

export interface ValidationResult {
  ok: boolean;
  issues: ValidationIssue[];
}

export interface FrameworkContext {
  goal: LifeGoal;
  milestones?: GoalMilestone[];
  keyResults?: GoalKeyResult[];
}

export interface FrameworkRenderProps extends FrameworkContext {
  readOnly?: boolean;
}

export interface GoalFrameworkHandler {
  type: FrameworkType;
  /** Заголовок методики для UI. */
  title: string;
  /** Краткое описание (1 строка). */
  short: string;
  /** Иконка lucide-react. */
  icon: string;
  /** Цветовой gradient (tailwind). */
  gradient: string;

  /** Возвращает дефолтный frameworkState для новой цели. */
  getInitialState(): Record<string, unknown>;

  /** Валидирует frameworkState. */
  validate(state: Record<string, unknown>): ValidationResult;

  /** Считает execution progress 0..100 на основе milestones/KR/state. */
  computeExecutionProgress(ctx: FrameworkContext): number;

  /** Рендерит панель методики. Возвращает null, если нет специфичного UI. */
  renderPanel?: (props: FrameworkRenderProps) => ReactNode;
}

const handlers = new Map<FrameworkType, GoalFrameworkHandler>();

export function registerFramework(handler: GoalFrameworkHandler): void {
  handlers.set(handler.type, handler);
}

export function getFramework(type: FrameworkType | string | null | undefined): GoalFrameworkHandler {
  const safe = (type || 'generic') as FrameworkType;
  return handlers.get(safe) || handlers.get('generic')!;
}

export function listFrameworks(): GoalFrameworkHandler[] {
  return Array.from(handlers.values());
}

export function isFrameworkType(value: unknown): value is FrameworkType {
  return value === 'generic' || value === 'smart' || value === 'okr' || value === 'wheel';
}

// --- Базовые handler'ы. Полноценные panel-компоненты будут добавлены позже. ---

const genericHandler: GoalFrameworkHandler = {
  type: 'generic',
  title: 'Без методики',
  short: 'Свободная цель',
  icon: 'Target',
  gradient: 'from-slate-400 to-slate-600',
  getInitialState: () => ({}),
  validate: () => ({ ok: true, issues: [] }),
  computeExecutionProgress: ({ goal, milestones }) => {
    if (milestones && milestones.length > 0) {
      const doneWeight = milestones
        .filter((m) => m.status === 'done')
        .reduce((s, m) => s + (m.weight || 1), 0);
      const totalWeight = milestones.reduce((s, m) => s + (m.weight || 1), 0);
      if (totalWeight > 0) return Math.round((doneWeight / totalWeight) * 100);
    }
    if (goal.steps && goal.steps.length > 0) {
      const done = goal.steps.filter((s) => s.done).length;
      return Math.round((done / goal.steps.length) * 100);
    }
    return goal.progress ?? 0;
  },
};

const smartHandler: GoalFrameworkHandler = {
  type: 'smart',
  title: 'SMART',
  short: 'Конкретная измеримая цель',
  icon: 'Target',
  gradient: 'from-blue-500 to-cyan-500',
  getInitialState: () => ({
    specific: '',
    measurable: '',
    achievable: '',
    relevant: '',
    timeBound: '',
  }),
  validate: (state) => {
    const issues: ValidationIssue[] = [];
    const s = state as Record<string, string>;
    if (!s.specific?.trim()) issues.push({ field: 'specific', message: 'Опиши конкретно (S)' });
    if (!s.measurable?.trim()) issues.push({ field: 'measurable', message: 'Укажи метрику (M)' });
    if (!s.timeBound?.trim()) issues.push({ field: 'timeBound', message: 'Укажи срок (T)' });
    return { ok: issues.length === 0, issues };
  },
  computeExecutionProgress: ({ goal, milestones }) => {
    if (milestones && milestones.length > 0) {
      const doneWeight = milestones
        .filter((m) => m.status === 'done')
        .reduce((s, m) => s + (m.weight || 1), 0);
      const totalWeight = milestones.reduce((s, m) => s + (m.weight || 1), 0);
      if (totalWeight > 0) return Math.round((doneWeight / totalWeight) * 100);
    }
    return goal.progress ?? 0;
  },
};

const okrHandler: GoalFrameworkHandler = {
  type: 'okr',
  title: 'OKR',
  short: 'Objective + Key Results',
  icon: 'Rocket',
  gradient: 'from-violet-500 to-fuchsia-500',
  getInitialState: () => ({
    objective: '',
    cadence: 'weekly',
  }),
  validate: () => ({ ok: true, issues: [] }),
  computeExecutionProgress: ({ keyResults }) => {
    if (!keyResults || keyResults.length === 0) return 0;
    let totalWeight = 0;
    let scored = 0;
    for (const kr of keyResults) {
      const w = kr.weight || 1;
      totalWeight += w;
      const span = kr.targetValue - kr.startValue;
      if (span === 0) {
        if (kr.status === 'done') scored += w;
        continue;
      }
      const ratio = (kr.currentValue - kr.startValue) / span;
      const clamped = Math.max(0, Math.min(1, ratio));
      scored += w * clamped;
    }
    if (totalWeight === 0) return 0;
    return Math.round((scored / totalWeight) * 100);
  },
};

const wheelHandler: GoalFrameworkHandler = {
  type: 'wheel',
  title: 'Колесо баланса',
  short: 'Цель по связанным сферам',
  icon: 'PieChart',
  gradient: 'from-emerald-500 to-teal-500',
  getInitialState: () => ({
    baselineScores: {},
    targetScores: {},
    notes: '',
  }),
  validate: (state) => {
    const issues: ValidationIssue[] = [];
    const s = state as { baselineScores?: Record<string, number> };
    if (!s.baselineScores || Object.keys(s.baselineScores).length === 0) {
      issues.push({ field: 'baselineScores', message: 'Зафиксируй базовые оценки сфер' });
    }
    return { ok: issues.length === 0, issues };
  },
  computeExecutionProgress: ({ goal }) => {
    const s = goal.frameworkState as {
      baselineScores?: Record<string, number>;
      targetScores?: Record<string, number>;
      currentScores?: Record<string, number>;
    };
    const baseline = s?.baselineScores || {};
    const target = s?.targetScores || {};
    const current = s?.currentScores || {};
    const keys = Object.keys(target);
    if (keys.length === 0) return goal.progress ?? 0;
    let totalDelta = 0;
    let achievedDelta = 0;
    for (const k of keys) {
      const bs = baseline[k] ?? 0;
      const tg = target[k] ?? 0;
      const cur = current[k] ?? bs;
      const span = tg - bs;
      if (span <= 0) continue;
      totalDelta += span;
      achievedDelta += Math.max(0, Math.min(span, cur - bs));
    }
    if (totalDelta === 0) return goal.progress ?? 0;
    return Math.round((achievedDelta / totalDelta) * 100);
  },
};

registerFramework(genericHandler);
registerFramework(smartHandler);
registerFramework(okrHandler);
registerFramework(wheelHandler);
