/**
 * Единая точка сборки заголовков для запросов к backend.
 *
 * ────────────────────────────────────────────────────────────────────────────
 * ПРАВИЛО
 *
 * Identity передаётся ТОЛЬКО токеном серверной сессии (X-Auth-Token).
 * Сервер сам определяет user_id, family_id, member_id и роль из сессии —
 * ничего из этого нельзя сообщить ему заголовком.
 *
 * X-User-Id больше не является identity. Он допустим лишь как явное
 * указание «действую от имени этого доступного мне участника» и передаётся
 * через subjectMemberId — сервер всё равно проверяет право на этого
 * участника и вернёт 403 при подмене. После завершения миграции параметр
 * уйдёт целиком.
 *
 * Категорически нельзя:
 *   headers['X-User-Id'] = profileId          // id ресурса как личность
 *   headers['X-User-Id'] = localStorage...    // «кто я» со стороны клиента
 *
 * Обе конструкции встречались в health-диалогах до перехода на серверную
 * авторизацию и позволяли читать чужие медицинские данные подстановкой UUID.
 */

import { readAuthToken } from './identity';

export type ApiHeaderOptions = {
  /** Добавить Content-Type: application/json. */
  json?: boolean;
  /**
   * Переходный X-User-Id: от имени какого участника выполняется действие.
   * Указывать ТОЛЬКО когда действие реально совершается за другого человека
   * (например опекун вносит показатель подопечному). Не для «своей» identity.
   */
  subjectMemberId?: string | null;
  /** Дополнительные заголовки. */
  extra?: Record<string, string>;
};

/**
 * Собирает заголовки запроса. Если сессии нет — токен не отправляется,
 * и сервер честно ответит 401. Это сознательно: лучше явный отказ,
 * чем запрос, который «как-то» пройдёт.
 */
export function apiHeaders(options: ApiHeaderOptions = {}): Record<string, string> {
  const { json = false, subjectMemberId, extra } = options;
  const headers: Record<string, string> = { ...(extra || {}) };

  if (json) headers['Content-Type'] = 'application/json';

  const token = readAuthToken();
  if (token) {
    headers['X-Auth-Token'] = token;
    // Authorization дублируется на время миграции: часть функций ещё
    // читает Bearer. auth_guard принимает оба варианта.
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (subjectMemberId) headers['X-User-Id'] = subjectMemberId;

  return headers;
}

/** Заголовки для JSON-запросов (POST/PUT/PATCH). */
export function jsonHeaders(options: Omit<ApiHeaderOptions, 'json'> = {}): Record<string, string> {
  return apiHeaders({ ...options, json: true });
}

/**
 * Есть ли вообще смысл отправлять запрос. Позволяет UI показать
 * «нужно войти» вместо ожидания 401.
 */
export function hasSessionToken(): boolean {
  return !!readAuthToken();
}
