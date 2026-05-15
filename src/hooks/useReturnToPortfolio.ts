import { useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { portfolioApi } from '@/services/portfolioApi';

/**
 * D.1 + D.2.7: Возврат в портфолио после успешного сохранения формы.
 *
 * Поведение:
 *  - если в URL есть ?returnTo=... — уводит пользователя по этому маршруту;
 *  - перед уходом вызывает portfolioApi.aggregate(memberId) в background,
 *    чтобы портфолио пересчиталось с новыми данными и пользователь увидел
 *    обновлённые статусы сфер без ручного refresh;
 *  - без ?returnTo — no-op (остаёмся на текущей странице).
 *
 * Контракт:
 *  - safe by default: возвращаем только на внутренние маршруты, начинающиеся с "/";
 *  - перед навигацией ?returnTo вычищается, чтобы повторный submit не редиректил снова;
 *  - aggregate fire-and-forget — ошибки логируются, но не пробрасываются;
 *  - можно вызывать в onSuccess любого диалога без дополнительных пропсов.
 */
export function useReturnToPortfolio() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const returnIfRequested = useCallback((): boolean => {
    const target = searchParams.get('returnTo');
    if (!target || !target.startsWith('/')) return false;

    // D.2.7: инвалидация портфолио перед возвратом — фоновый пересчёт метрик.
    const memberId = searchParams.get('member') || searchParams.get('childId');
    if (memberId) {
      portfolioApi.aggregate(memberId).catch((err) => {
         
        console.warn('[useReturnToPortfolio] aggregate failed:', err);
      });
    }

    const next = new URLSearchParams(searchParams);
    next.delete('returnTo');
    next.delete('from');
    setSearchParams(next, { replace: true });

    navigate(target);
    return true;
  }, [navigate, searchParams, setSearchParams]);

  return { returnIfRequested };
}
