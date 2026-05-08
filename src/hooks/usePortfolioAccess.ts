import { useMemo } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useFamilyMembersContext } from '@/contexts/FamilyMembersContext';

/**
 * Доступ к взрослым функциям портфолио (PDF, AI, Семейный обзор).
 * Правила:
 *  - isAdult: текущий пользователь = full-аккаунт в семье (account_type='full')
 *    Если в БД account_type не выставлен (NULL), но user_id привязан, считаем full.
 *  - isStaff: пометка для внутренних админ-страниц (например /admin/portfolio-health).
 *    Источник правды — backend; во фронте показываем только тем, кто прошёл backend-чек.
 */
export interface PortfolioAccess {
  isAdult: boolean;
  isStaff: boolean;
  isOwner: boolean;
  ready: boolean;
}

const STAFF_EMAILS = ['admin@poehali.dev'];

export function usePortfolioAccess(): PortfolioAccess {
  const { currentUser } = useAuth();
  const { members, loading } = useFamilyMembersContext();

  return useMemo<PortfolioAccess>(() => {
    if (loading) {
      return { isAdult: false, isStaff: false, isOwner: false, ready: false };
    }

    const me = members.find((m) => m.user_id && currentUser?.id && String(m.user_id) === String(currentUser.id));

    const accountType = me?.account_type;
    const accessRole = me?.access_role;

    const isAdult = !!me && (accountType === 'full' || accountType == null) && accountType !== 'child_profile';
    const isOwner = accessRole === 'owner' || accessRole === 'admin' || me?.role === 'Владелец';
    const isStaff =
      !!currentUser?.email && STAFF_EMAILS.includes(currentUser.email.toLowerCase().trim());

    return { isAdult, isStaff, isOwner, ready: true };
  }, [members, loading, currentUser]);
}
