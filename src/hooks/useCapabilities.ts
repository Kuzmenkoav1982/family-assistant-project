/**
 * useCapabilities — права текущего пользователя, полученные ОТ СЕРВЕРА.
 *
 * ────────────────────────────────────────────────────────────────────────────
 * ЗАЧЕМ
 *
 * Раньше ролевая матрица жила на фронте (src/utils/permissions.ts) и должна
 * была вручную совпадать с поведением backend. Это ненадёжно: матрица на
 * клиенте — не защита, а подсказка интерфейсу, и любое расхождение либо
 * прячет доступное действие, либо показывает недоступное.
 *
 * Теперь источник истины один — версионируемая политика в backend-коде
 * (backend/_shared/auth_guard.py, ROLE_POLICY). Эндпоинт /auth-me отдаёт
 * актуальные role и capabilities, вычисленные по серверной сессии.
 *
 * ВАЖНО: capabilities нужны ТОЛЬКО для интерфейса —
 *   - показать или скрыть кнопку;
 *   - заблокировать недоступное действие;
 *   - объяснить ограничение.
 *
 * Они НЕ являются защитой. Каждый API-запрос повторно проверяется на сервере,
 * и прямой HTTP-запрос в обход интерфейса получит 401/403.
 */

import { useCallback, useEffect, useState } from 'react';
import func2url from '../../backend/func2url.json';
import { apiHeaders, hasSessionToken } from '@/lib/apiHeaders';

export type Capabilities = Record<string, string[]>;

export type MeResponse = {
  success: boolean;
  user_id: string | null;
  family_id: string | null;
  member_id: string | null;
  role: string;
  is_owner: boolean;
  policy_version: string;
  capabilities: Capabilities;
  accessible_health_subjects: string[];
};

const AUTH_ME_URL = (func2url as Record<string, string>)['auth-me'];

/** Кеш на время жизни вкладки: /auth-me дёргается многими компонентами. */
let cached: MeResponse | null = null;
let inflight: Promise<MeResponse | null> | null = null;

export function invalidateCapabilities(): void {
  cached = null;
  inflight = null;
}

async function fetchMe(): Promise<MeResponse | null> {
  if (!hasSessionToken() || !AUTH_ME_URL) return null;
  const res = await fetch(AUTH_ME_URL, { headers: apiHeaders() });
  if (!res.ok) return null;
  return (await res.json()) as MeResponse;
}

function loadMe(): Promise<MeResponse | null> {
  if (cached) return Promise.resolve(cached);
  if (!inflight) {
    inflight = fetchMe()
      .then((data) => {
        cached = data;
        return data;
      })
      .catch(() => null)
      .finally(() => {
        inflight = null;
      });
  }
  return inflight;
}

export function useCapabilities() {
  const [me, setMe] = useState<MeResponse | null>(cached);
  const [loading, setLoading] = useState(!cached);

  useEffect(() => {
    let cancelled = false;
    loadMe().then((data) => {
      if (cancelled) return;
      setMe(data);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  /**
   * Разрешено ли действие. Пока права не загружены — false (default deny),
   * чтобы интерфейс не мигал доступными кнопками, которые сервер отклонит.
   */
  const can = useCallback(
    (module: string, action: string): boolean => {
      const actions = me?.capabilities?.[module];
      return Array.isArray(actions) && actions.includes(action);
    },
    [me],
  );

  /** Полномочия владельца пространства (удаление семьи, передача владения). */
  const canAsOwner = useCallback(
    (action: string): boolean => {
      const owner = me?.capabilities?.['family_owner'];
      return Array.isArray(owner) && owner.includes(action);
    },
    [me],
  );

  /** Доступны ли чувствительные данные конкретного участника. */
  const canAccessSubject = useCallback(
    (memberId: string | null | undefined): boolean => {
      if (!memberId) return false;
      return (me?.accessible_health_subjects || []).includes(memberId);
    },
    [me],
  );

  return {
    loading,
    role: me?.role ?? null,
    isOwner: me?.is_owner ?? false,
    familyId: me?.family_id ?? null,
    memberId: me?.member_id ?? null,
    userId: me?.user_id ?? null,
    policyVersion: me?.policy_version ?? null,
    capabilities: me?.capabilities ?? {},
    accessibleHealthSubjects: me?.accessible_health_subjects ?? [],
    can,
    canAsOwner,
    canAccessSubject,
    refresh: () => {
      invalidateCapabilities();
      setLoading(true);
      loadMe().then((data) => {
        setMe(data);
        setLoading(false);
      });
    },
  };
}

export default useCapabilities;
