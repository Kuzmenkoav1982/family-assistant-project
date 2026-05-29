import { useState, useEffect, useCallback, useContext } from 'react';
import { FamilyMembersContext } from '@/contexts/FamilyMembersContext';

const API = 'https://functions.poehali.dev/1c2b8fba-a386-476a-a78e-dd0d78f1aa61';
const POLL_INTERVAL_MS = 5 * 60 * 1000; // обновляем раз в 5 минут

/**
 * Счётчик pending-заявок на добавление в семейное древо.
 * Возвращает count только для owner/admin, для остальных — 0.
 * Источник истины: tree_link_requests.status = 'pending', а НЕ notifications.
 */
export function usePendingTreeRequests() {
  const [count, setCount] = useState(0);
  const familyCtx = useContext(FamilyMembersContext);

  const currentAccessRole = familyCtx?.currentAccessRole || (() => {
    try { return JSON.parse(localStorage.getItem('userData') || '{}').role || ''; } catch { return ''; }
  })();

  const isOwnerOrAdmin = currentAccessRole === 'admin' || currentAccessRole === 'owner'
    || currentAccessRole === 'Владелец' || currentAccessRole === 'Администратор';

  const fetch_count = useCallback(async () => {
    const token = localStorage.getItem('authToken');
    if (!token || !isOwnerOrAdmin) {
      setCount(0);
      return;
    }
    try {
      const res = await fetch(`${API}?action=count`, {
        headers: { 'X-Auth-Token': token },
      });
      const data = await res.json();
      if (data.success) setCount(data.count ?? 0);
    } catch { /* не блокируем */ }
  }, [isOwnerOrAdmin]);

  useEffect(() => {
    fetch_count();

    // Обновляем по интервалу
    const interval = setInterval(fetch_count, POLL_INTERVAL_MS);

    // Обновляем при возврате в вкладку
    const onFocus = () => fetch_count();
    window.addEventListener('focus', onFocus);

    // Обновляем при кастомном событии (вызывается после review)
    const onReview = () => fetch_count();
    window.addEventListener('tree-link-reviewed', onReview);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('tree-link-reviewed', onReview);
    };
  }, [fetch_count]);

  return { count, isOwnerOrAdmin, refetch: fetch_count };
}
