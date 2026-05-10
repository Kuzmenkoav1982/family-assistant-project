/**
 * Управление бейджами «Новое» с правилами:
 *  - Срок жизни: NEW_TTL_DAYS дней с даты первого появления
 *  - Гасится при первом визите пользователя на этот раздел
 *  - На верхнем уровне (sidebar/dashboard) — не более MAX_TOP_LEVEL_NEW_BADGES
 *    одновременно, остальные превращаются в обычный пункт.
 *
 * Источник правды: localStorage по ключу 'newBadgeState'.
 *   {
 *     [badgeId]: { firstSeenAt: ISO, dismissed: boolean }
 *   }
 */

import { NEW_TTL_DAYS, MAX_TOP_LEVEL_NEW_BADGES } from './cardStatus';

const STORAGE_KEY = 'newBadgeState';

export { NEW_TTL_DAYS, MAX_TOP_LEVEL_NEW_BADGES };

interface BadgeRecord {
  firstSeenAt: string;
  dismissed?: boolean;
}

type BadgeState = Record<string, BadgeRecord>;

const readState = (): BadgeState => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const writeState = (state: BadgeState) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (_e) {
    // ignore
  }
};

/**
 * Регистрирует бейдж в реестре. Если впервые виден —
 * запоминает дату появления.
 */
export const registerNewBadge = (badgeId: string): void => {
  const state = readState();
  if (!state[badgeId]) {
    state[badgeId] = { firstSeenAt: new Date().toISOString() };
    writeState(state);
  }
};

/** Активен ли бейдж сейчас (не истёк, не погашен). */
export const isNewBadgeActive = (badgeId: string): boolean => {
  const state = readState();
  const rec = state[badgeId];
  if (!rec) return true; // ещё не зарегистрирован — считается новым
  if (rec.dismissed) return false;
  const ageDays = (Date.now() - new Date(rec.firstSeenAt).getTime()) / 86400000;
  return ageDays <= NEW_TTL_DAYS;
};

/** Пользователь открыл раздел — гасим бейдж. */
export const dismissNewBadge = (badgeId: string): void => {
  const state = readState();
  if (!state[badgeId]) {
    state[badgeId] = { firstSeenAt: new Date().toISOString(), dismissed: true };
  } else {
    state[badgeId].dismissed = true;
  }
  writeState(state);
};

/**
 * Применяет лимит к списку id топ-уровневых бейджей.
 * Возвращает множество id, которые должны быть показаны.
 * Приоритет: те, что ближе к появлению (более новые).
 */
export const applyTopLevelLimit = (
  candidateIds: string[],
  limit = MAX_TOP_LEVEL_NEW_BADGES,
): Set<string> => {
  const state = readState();
  const active = candidateIds.filter(id => isNewBadgeActive(id));
  // Сортируем: сначала самые свежие (firstSeenAt ↓ то, что только появилось)
  active.sort((a, b) => {
    const ta = state[a]?.firstSeenAt ? new Date(state[a].firstSeenAt).getTime() : Date.now();
    const tb = state[b]?.firstSeenAt ? new Date(state[b].firstSeenAt).getTime() : Date.now();
    return tb - ta;
  });
  return new Set(active.slice(0, limit));
};
