/**
 * Единый источник истины для статусов карточек разделов.
 *
 * Правила (канон):
 * - 'idle'        — нет базовой записи (счётчик === 0, признак не задан)
 * - 'partial'     — заполнено меньше минимального набора
 * - 'ready'       — выполнен минимальный набор, всё ок
 * - 'attention'   — есть просрочка, ошибка, незакрытый риск
 * - 'new'         — feature свежая (≤ NEW_TTL_DAYS дней)
 * - 'recommended' — есть логичный next-best-action
 *
 * Правила приоритета (если применимо несколько):
 *   attention > new > partial > recommended > ready > idle
 *
 * Подключение:
 *   import { resolveCardStatus, signals } from '@/lib/cardStatus';
 *   const status = resolveCardStatus({
 *     count: family.length,
 *     minRequired: 2,
 *     hasOverdue: unpaid > 0,
 *   });
 */

import type { CardStatus } from '@/components/hub/StatusBadge';

export const NEW_TTL_DAYS = 14;
export const MAX_TOP_LEVEL_NEW_BADGES = 2;

export interface ResolveInput {
  /** Количество элементов (профилей, записей, и т.п.). */
  count?: number;
  /** Сколько нужно для статуса 'ready'. По умолчанию — 1. */
  minRequired?: number;
  /** Сколько нужно для статуса 'partial'. По умолчанию — 1 (т.е. что-то есть). */
  minPartial?: number;
  /** Есть ли просрочка/ошибка — даёт 'attention'. */
  hasOverdue?: boolean;
  /** Дата появления фичи (ISO). Если ≤ NEW_TTL_DAYS — статус 'new'. */
  newSince?: string;
  /** Был ли первый визит. Если есть — 'new' гасится. */
  visited?: boolean;
  /** Принудительно рекомендовать (по бизнес-логике). */
  recommended?: boolean;
}

export const isNewByDate = (newSince?: string, visited?: boolean): boolean => {
  if (!newSince || visited) return false;
  const fresh = (Date.now() - new Date(newSince).getTime()) / 86400000;
  return fresh >= 0 && fresh <= NEW_TTL_DAYS;
};

export const resolveCardStatus = (input: ResolveInput): CardStatus => {
  const {
    count = 0,
    minRequired = 1,
    minPartial = 1,
    hasOverdue = false,
    newSince,
    visited,
    recommended = false,
  } = input;

  if (hasOverdue) return 'attention';
  if (isNewByDate(newSince, visited)) return 'new';
  if (count >= minRequired) return 'ready';
  if (count >= minPartial) return 'partial';
  if (recommended) return 'recommended';
  return 'idle';
};

/**
 * Готовые сигналы для конкретных доменов.
 * Каждый возвращает CardStatus + опционально statusLabel.
 */

interface ResolvedStatus {
  status: CardStatus;
  statusLabel?: string;
}

export const signals = {
  /** Профили семьи. ready ≥ 2, partial = 1, иначе idle. */
  familyProfiles: (count: number): ResolvedStatus => ({
    status: count === 0 ? 'idle' : count < 2 ? 'partial' : 'ready',
    statusLabel:
      count === 0
        ? 'Не настроено'
        : count === 1
        ? '1 профиль'
        : `${count} профилей`,
  }),

  /** Профили детей. */
  children: (count: number): ResolvedStatus => ({
    status: count === 0 ? 'idle' : 'ready',
    statusLabel:
      count === 0 ? 'Не настроено' : `${count} ${pluralize(count, ['ребёнок', 'детей', 'детей'])}`,
  }),

  /** Семейное древо. partial < 5, ready ≥ 5. */
  familyTree: (count: number): ResolvedStatus => ({
    status: count === 0 ? 'idle' : count < 5 ? 'partial' : 'ready',
    statusLabel: count === 0 ? 'Не заполнено' : `${count} в древе`,
  }),

  /** Коммунальные платежи. attention если есть неоплаченные. */
  homeUtilities: (total: number, unpaid: number): ResolvedStatus => {
    if (unpaid > 0) {
      return {
        status: 'attention',
        statusLabel: `${unpaid} ${pluralize(unpaid, ['счёт', 'счёта', 'счетов'])} к оплате`,
      };
    }
    if (total === 0) return { status: 'idle', statusLabel: 'Не настроено' };
    return { status: 'ready', statusLabel: `${total} ${pluralize(total, ['платёж', 'платежа', 'платежей'])}` };
  },

  /** Показания счётчиков. */
  homeMeters: (count: number): ResolvedStatus => ({
    status: count === 0 ? 'idle' : 'ready',
    statusLabel: count === 0 ? 'Нет показаний' : `${count} ${pluralize(count, ['запись', 'записи', 'записей'])}`,
  }),

  /** Активные ремонты. */
  homeRepairs: (active: number): ResolvedStatus => ({
    status: active === 0 ? 'idle' : 'ready',
    statusLabel: active === 0 ? 'Нет задач' : `${active} ${pluralize(active, ['задача', 'задачи', 'задач'])}`,
  }),

  /** Свежая фича по дате. */
  fresh: (newSince: string, visited?: boolean): ResolvedStatus => ({
    status: isNewByDate(newSince, visited) ? 'new' : 'ready',
    statusLabel: isNewByDate(newSince, visited) ? 'Новое' : undefined,
  }),

  /** Рекомендуем настроить. */
  recommend: (label = 'Рекомендуем'): ResolvedStatus => ({
    status: 'recommended',
    statusLabel: label,
  }),

  /** Готово без счётчиков. */
  ready: (label?: string): ResolvedStatus => ({
    status: 'ready',
    statusLabel: label,
  }),

  /** Не настроено. */
  idle: (label = 'Не настроено'): ResolvedStatus => ({
    status: 'idle',
    statusLabel: label,
  }),
};

function pluralize(n: number, forms: [string, string, string]): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return forms[0];
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return forms[1];
  return forms[2];
}
