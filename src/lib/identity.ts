/**
 * Stage 4 — Single source of identity adapter.
 *
 * Точка истины для actor identity на frontend.
 * Все feature-сервисы (portfolio, health, и т.п.) должны читать identity
 * ТОЛЬКО через эти helpers, а не дёргать localStorage напрямую.
 *
 * Контракт значений:
 *   actorUserId   — users.id (каноничный аккаунт). Используется portfolio, health.
 *   actorMemberId — family_members.id. Используется life-road (known exception, KE1).
 *   actorFamilyId — families.id. Для family-scope endpoints.
 *   authToken     — JWT/token. Кладётся в Authorization: Bearer ...
 *
 * Жёсткие правила:
 *   - Никаких fallback на захардкоженные значения вроде '1'.
 *   - Никаких "универсальных" readUserId() — нужно явно различать user vs member.
 *   - Если identity нет — возвращаем null. Caller сам решает: либо не слать header,
 *     либо кидать ошибку. Это сознательно: лучше честный 401, чем тихая утечка.
 *
 * Legacy ключи storage (исторически дублируются по всему проекту):
 *   user-data: 'userData' | 'user_data' | 'user'
 *   token:     'authToken' | 'auth_token'
 *
 * Канонический shape user data (см. backend/auth/index.py login response):
 *   { id: users.id, email, phone, family_id?, family_name?, member_id? }
 */

export type StorageRead = (key: string) => string | null;

export type UserSourceKey = 'userData' | 'user_data' | 'user';
export type TokenSourceKey = 'authToken' | 'auth_token';

export type NormalizedIdentity = {
  actorUserId: string | null;
  actorMemberId: string | null;
  actorFamilyId: string | null;
  authToken: string | null;
  userSourceKey: UserSourceKey | null;
  tokenSourceKey: TokenSourceKey | null;
};

const USER_KEYS: UserSourceKey[] = ['userData', 'user_data', 'user'];
const TOKEN_KEYS: TokenSourceKey[] = ['authToken', 'auth_token'];

/**
 * Пробует распарсить JSON. Возвращает null если строка пустая или невалидная.
 * Никогда не бросает — для безопасности feature-сервисов.
 */
function safeParse(raw: string | null): Record<string, unknown> | null {
  if (!raw) return null;
  try {
    const v = JSON.parse(raw);
    return v && typeof v === 'object' ? (v as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

function pickString(obj: Record<string, unknown> | null, ...candidates: string[]): string | null {
  if (!obj) return null;
  for (const c of candidates) {
    const v = obj[c];
    if (v !== undefined && v !== null && v !== '') return String(v);
  }
  return null;
}

/**
 * Pure-функция от storage reader. Удобно для тестов:
 * можно прокинуть фиктивный getter и проверить поведение без window.localStorage.
 */
export function readNormalizedIdentityFromStorage(read: StorageRead): NormalizedIdentity {
  let userObj: Record<string, unknown> | null = null;
  let userSourceKey: UserSourceKey | null = null;
  for (const key of USER_KEYS) {
    const parsed = safeParse(read(key));
    if (parsed) {
      userObj = parsed;
      userSourceKey = key;
      break;
    }
  }

  let authToken: string | null = null;
  let tokenSourceKey: TokenSourceKey | null = null;
  for (const key of TOKEN_KEYS) {
    const v = read(key);
    if (v) {
      authToken = v;
      tokenSourceKey = key;
      break;
    }
  }

  // user_id — допустимый legacy alias (видели в нескольких местах кода).
  // member_id / memberId — оба формата встречались исторически.
  // family_id / familyId — то же.
  const actorUserId = pickString(userObj, 'id', 'user_id');
  const actorMemberId = pickString(userObj, 'member_id', 'memberId');
  const actorFamilyId = pickString(userObj, 'family_id', 'familyId');

  return {
    actorUserId,
    actorMemberId,
    actorFamilyId,
    authToken,
    userSourceKey,
    tokenSourceKey,
  };
}

function defaultRead(key: string): string | null {
  if (typeof window === 'undefined' || !window.localStorage) return null;
  return window.localStorage.getItem(key);
}

export function readNormalizedIdentity(): NormalizedIdentity {
  return readNormalizedIdentityFromStorage(defaultRead);
}

/** users.id (canonical actor). Portfolio, health и любой actor-protected endpoint. */
export function readActorUserId(): string | null {
  return readNormalizedIdentity().actorUserId;
}

/** family_members.id. Life-road (known exception, не для нового кода без причины). */
export function readActorMemberId(): string | null {
  return readNormalizedIdentity().actorMemberId;
}

/** families.id. Для family-scope ресурсов. */
export function readActorFamilyId(): string | null {
  return readNormalizedIdentity().actorFamilyId;
}

/** JWT/token. Кладётся в Authorization: Bearer ... */
export function readAuthToken(): string | null {
  return readNormalizedIdentity().authToken;
}
