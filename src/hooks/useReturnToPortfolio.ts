import { useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

/**
 * D.1: Возврат в портфолио после успешного сохранения формы.
 *
 * Если в URL есть ?returnTo=... — вызов returnIfRequested() уведёт пользователя
 * по этому маршруту. Иначе — no-op (остаёмся на текущей странице).
 *
 * Контракт:
 *  - safe by default: возвращаем только на внутренние маршруты, начинающиеся с "/".
 *  - перед навигацией ?returnTo вычищается, чтобы повторный submit не редиректил снова.
 *  - можно вызывать в onSuccess любого диалога без дополнительных пропсов.
 */
export function useReturnToPortfolio() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const returnIfRequested = useCallback((): boolean => {
    const target = searchParams.get('returnTo');
    if (!target || !target.startsWith('/')) return false;

    const next = new URLSearchParams(searchParams);
    next.delete('returnTo');
    next.delete('from');
    setSearchParams(next, { replace: true });

    navigate(target);
    return true;
  }, [navigate, searchParams, setSearchParams]);

  return { returnIfRequested };
}
