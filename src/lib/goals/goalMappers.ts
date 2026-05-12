import type { FrameworkType, LifeGoal } from '@/components/life-road/types';
import { isFrameworkType } from './frameworkRegistry';

// Legacy mappers: цели, созданные до триады v1, могут не иметь
// canonical-полей (frameworkType, frameworkState, scope, linkedSphereIds).
// normalizeLegacyGoal приводит любую цель к каноническому виду без потерь.

export function normalizeLegacyGoal(raw: Partial<LifeGoal> & { framework?: string | null }): LifeGoal {
  const legacyFw = raw.framework;

  let frameworkType: FrameworkType = 'generic';
  if (isFrameworkType(raw.frameworkType)) {
    frameworkType = raw.frameworkType;
  } else if (legacyFw && isFrameworkType(legacyFw)) {
    frameworkType = legacyFw as FrameworkType;
  }

  const scope = raw.scope === 'family' ? 'family' : 'personal';

  return {
    id: String(raw.id ?? ''),
    familyId: raw.familyId,
    ownerId: raw.ownerId ?? null,
    title: raw.title ?? '',
    description: raw.description ?? null,
    sphere: raw.sphere ?? 'personal',
    framework: legacyFw ?? frameworkType,
    deadline: raw.deadline ?? null,
    status: (raw.status as LifeGoal['status']) ?? 'active',
    progress: raw.progress ?? 0,
    steps: raw.steps ?? [],
    aiInsights: raw.aiInsights ?? {},
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,

    frameworkType,
    frameworkState: raw.frameworkState ?? {},
    scope,
    horizon: raw.horizon ?? null,
    season: raw.season ?? null,
    whyText: raw.whyText ?? null,
    linkedSphereIds: raw.linkedSphereIds ?? [],
    createdFrom: raw.createdFrom ?? null,
    sourceContext: raw.sourceContext ?? null,
    executionProgress: raw.executionProgress ?? null,
    outcomeSignal: raw.outcomeSignal ?? null,
  };
}

export function normalizeLegacyGoals(rows: Array<Partial<LifeGoal>>): LifeGoal[] {
  return rows.map((r) => normalizeLegacyGoal(r));
}

/** Проверяет, является ли цель «legacy без методики» (для UI-подсказок). */
export function isLegacyGoal(goal: LifeGoal): boolean {
  return goal.frameworkType === 'generic' && !goal.frameworkState;
}
