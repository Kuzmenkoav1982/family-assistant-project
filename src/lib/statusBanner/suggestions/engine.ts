// Suggestion engine (B4) — rule-based, без ИИ.
//
// Контракт:
//   - чистая функция, без побочных эффектов
//   - НЕ публикует баннеры (это запрещено в v1)
//   - возвращает массив черновиков отсортированных по confidence desc
//   - каждый draft имеет audience='all' (gated v1)
//   - id предложения детерминирован по содержанию — два одинаковых вызова
//     дадут одинаковый id (позволяет идемпотентно сравнивать на UI)

import { DEFAULT_DISMISSIBLE_BY_TYPE, DEFAULT_PRIORITY_BY_TYPE } from '../types';
import type { BannerSuggestion, SignalSnapshot } from './types';

/** Срезать ведущие symbol/emoji + пробелы — простой проход без regex. */
function stripLeadingEmoji(s: string): string {
  let i = 0;
  while (i < s.length) {
    const code = s.charCodeAt(i);
    // ASCII alnum / cyrillic — стоп
    if (
      (code >= 0x30 && code <= 0x39) ||
      (code >= 0x41 && code <= 0x5a) ||
      (code >= 0x61 && code <= 0x7a) ||
      (code >= 0x400 && code <= 0x4ff)
    ) {
      break;
    }
    i++;
  }
  return s.slice(i).trimStart();
}

function stableId(parts: ReadonlyArray<string>): string {
  // Маленький детерминированный hash без зависимостей.
  // Идёт через charCodeAt — для admin-страницы достаточно.
  let h = 0;
  const s = parts.join('|');
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  }
  return 'sug_' + (h >>> 0).toString(36);
}

export function generateSuggestions(
  snapshot: SignalSnapshot,
  now: Date = new Date(),
): BannerSuggestion[] {
  const out: BannerSuggestion[] = [];
  const nowIso = now.toISOString();

  // 1. Web Vitals → performance suggestion
  if (snapshot.performanceRating === 'poor') {
    out.push({
      id: stableId(['perf', 'poor']),
      sourceKind: 'web_vitals',
      reason: 'Web Vitals показывают деградацию (rating=poor). Имеет смысл предупредить пользователей о возможных тормозах.',
      confidence: 0.75,
      createdAt: nowIso,
      draft: {
        type: 'warning',
        title: 'Возможны задержки в работе',
        message:
          'Сейчас приложение может работать медленнее обычного. Мы уже разбираемся, спасибо за терпение.',
        enabled: false,
        dismissible: DEFAULT_DISMISSIBLE_BY_TYPE.warning,
        audience: 'all',
        routeScope: [],
        priority: DEFAULT_PRIORITY_BY_TYPE.warning,
      },
    });
  } else if (snapshot.performanceRating === 'needs-improvement') {
    out.push({
      id: stableId(['perf', 'needs']),
      sourceKind: 'web_vitals',
      reason: 'Web Vitals: needs-improvement. Скорее всего деградация не критичная — стоит держать наготове, но не публиковать без других сигналов.',
      confidence: 0.4,
      createdAt: nowIso,
      draft: {
        type: 'info',
        title: 'Следим за стабильностью',
        message: 'Часть пользователей может замечать небольшие задержки. Если ощутите — напишите в поддержку.',
        enabled: false,
        dismissible: DEFAULT_DISMISSIBLE_BY_TYPE.info,
        audience: 'all',
        routeScope: [],
        priority: DEFAULT_PRIORITY_BY_TYPE.info,
      },
    });
  }

  // 2. System status → severity-mapped suggestion
  if (snapshot.systemStatus === 'critical') {
    out.push({
      id: stableId(['sys', 'critical']),
      sourceKind: 'system_status',
      reason: 'Системные метрики показывают critical-состояние. Это самый сильный сигнал — стоит проверить и опубликовать critical-баннер.',
      confidence: 0.95,
      createdAt: nowIso,
      draft: {
        type: 'critical',
        title: 'Сервис временно недоступен',
        message:
          'Мы зафиксировали серьёзный сбой и уже работаем над восстановлением. Сообщим, как только всё заработает.',
        enabled: false,
        dismissible: DEFAULT_DISMISSIBLE_BY_TYPE.critical,
        audience: 'all',
        routeScope: [],
        priority: DEFAULT_PRIORITY_BY_TYPE.critical,
      },
    });
  } else if (snapshot.systemStatus === 'warning') {
    out.push({
      id: stableId(['sys', 'warning']),
      sourceKind: 'system_status',
      reason: 'Системные метрики показывают warning. Если совпадает с пользовательскими жалобами — стоит опубликовать.',
      confidence: 0.65,
      createdAt: nowIso,
      draft: {
        type: 'warning',
        title: 'Часть функций работает нестабильно',
        message:
          'Мы видим временные проблемы в работе сервиса. Большинство функций доступно, отдельные действия могут не сработать с первого раза.',
        enabled: false,
        dismissible: DEFAULT_DISMISSIBLE_BY_TYPE.warning,
        audience: 'all',
        routeScope: [],
        priority: DEFAULT_PRIORITY_BY_TYPE.warning,
      },
    });
  }

  // 3. Existing alert items — переводим во встречный draft, если type=critical
  for (const a of snapshot.alerts ?? []) {
    if (a.type === 'critical') {
      out.push({
        id: stableId(['alert', a.id]),
        sourceKind: 'system_status',
        reason: `Алерт «${a.title}» помечен как critical (id=${a.id}). Перенесите в баннер, если это касается пользователей.`,
        confidence: 0.7,
        createdAt: nowIso,
        draft: {
          type: 'warning', // не critical по дефолту — admin сам решит
          title: stripLeadingEmoji(a.title).slice(0, 140),
          message: a.message.slice(0, 500),
          enabled: false,
          dismissible: DEFAULT_DISMISSIBLE_BY_TYPE.warning,
          audience: 'all',
          routeScope: [],
          priority: DEFAULT_PRIORITY_BY_TYPE.warning,
        },
      });
    }
  }

  // 4. Manual hint (для теста и demo).
  if (snapshot.manualHint) {
    const h = snapshot.manualHint;
    out.push({
      id: stableId(['manual', h.type, h.title]),
      sourceKind: 'manual_signal',
      reason: 'Ручной hint (введён в DevTools / тесте). Используется для проверки flow accept/edit/reject.',
      confidence: 0.5,
      createdAt: nowIso,
      draft: {
        type: h.type,
        title: h.title,
        message: h.message,
        enabled: false,
        dismissible: DEFAULT_DISMISSIBLE_BY_TYPE[h.type],
        audience: 'all',
        routeScope: [],
        priority: DEFAULT_PRIORITY_BY_TYPE[h.type],
      },
    });
  }

  // dedupe по id (если сигналов дважды), сортировка confidence desc
  const map = new Map<string, BannerSuggestion>();
  for (const s of out) {
    if (!map.has(s.id)) map.set(s.id, s);
  }
  return [...map.values()].sort((a, b) => b.confidence - a.confidence);
}

// ---------- exports for tests ----------

export const __test__ = { stableId };