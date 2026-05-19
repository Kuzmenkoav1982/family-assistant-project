// Types for AI-assisted banner suggestions (B4).
//
// Контракт:
//   - suggestions — ТОЛЬКО drafts. Никогда не публикуются автоматически.
//   - admin принимает / редактирует / отклоняет суждение вручную.
//   - источник сигнала всегда виден (reason + sourceKind) для прозрачности.

import type { StatusBannerDraft } from '../types';

/** Откуда пришёл сигнал — для прозрачности и аудита. */
export type SuggestionSourceKind =
  | 'web_vitals'      // performance rating poor/needs-improvement
  | 'system_status'   // healthy/warning/critical из admin stats
  | 'manual_signal'   // ввели сами для теста
  | 'deploy_event';   // (зарезервировано)

export interface BannerSuggestion {
  /** Уникальный id предложения (deterministic по входу). */
  id: string;
  /** Готовый черновик для адмёна — можно сразу скопировать в форму. */
  draft: StatusBannerDraft;
  /** Источник сигнала. */
  sourceKind: SuggestionSourceKind;
  /** Краткое объяснение «почему мы это предлагаем». */
  reason: string;
  /** Уровень уверенности (для сортировки). 0..1. */
  confidence: number;
  /** Когда сгенерировано — для UI «N минут назад». */
  createdAt: string;
}

/** Сырой вход для engine. Любое поле опционально. */
export interface SignalSnapshot {
  /** Web Vitals rating: good | needs-improvement | poor */
  performanceRating?: 'good' | 'needs-improvement' | 'poor';
  /** Общий health: healthy | warning | critical */
  systemStatus?: 'healthy' | 'warning' | 'critical';
  /** Уже сгенерированные alert items (опционально). */
  alerts?: ReadonlyArray<{
    id: string;
    type: 'info' | 'warning' | 'critical';
    title: string;
    message: string;
  }>;
  /** Manual hint от админа в DevTools / тесте. */
  manualHint?: {
    type: 'info' | 'maintenance' | 'warning' | 'critical' | 'update';
    title: string;
    message: string;
  };
}
