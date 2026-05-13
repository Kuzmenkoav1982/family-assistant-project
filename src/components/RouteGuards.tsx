/**
 * RouteGuards — обёртки для protected/admin маршрутов.
 *
 * Вынесены из App.tsx в Stage refactor B2 — там они были inline.
 *
 * ────────────────────────────────────────────────────────────────────────────
 * Что изменилось по сравнению с inline-версией:
 *
 * 1. Поведение и UI спиннеров — оставлены БЕЗ изменений (тот же градиент,
 *    тот же текст "Проверка авторизации..." / "Проверка админ-доступа…").
 *
 * 2. Источник истины — оставлен прежний:
 *    - ProtectedRoute смотрит на `storage.getItem('authToken')`
 *      + `localStorage.getItem('isDemoMode') === 'true'` (demo-режим).
 *    - AdminRoute смотрит на `localStorage.getItem('adminToken') ===
 *      'admin_authenticated'`.
 *    Identity adapter (readAuthToken и т.п.) сюда сознательно НЕ
 *    подключён — это бы поменяло поведение в edge cases с legacy ключами,
 *    что выходит за scope текущего косметического рефакторинга.
 *
 * 3. Polling 300ms / 500ms через `setInterval` — УБРАН. Вместо него:
 *    - initial check при mount (как было);
 *    - подписка на нативное `window.storage` (срабатывает в ДРУГИХ вкладках,
 *      когда меняется localStorage — закрывает кейс "залогинились в одной
 *      вкладке, открыли protected route в другой");
 *    - подписка на кастомное `AUTH_SESSION_EVENT` из `src/lib/authStorage.ts`
 *      (срабатывает в ЭТОЙ ЖЕ вкладке после saveAuthSession / updateAuthUser /
 *      clearAuthSession — закрывает кейс "вышли через logout, нужно сразу
 *      редиректнуть, не дожидаясь следующего тика интервала").
 *
 *    Profit: вместо 3-4 проверок storage в секунду — события "по делу",
 *    меньше работы основного потока, лучше для батареи на мобилке.
 *
 * 4. Для admin-полей кастомный event пока не диспатчится (мы не пишем
 *    adminToken через authStorage helper — это отдельный flow в AdminLogin).
 *    Поэтому AdminRoute полагается на native 'storage' event + одну
 *    оптимизацию: focus listener (когда юзер возвращается на вкладку —
 *    переcверяем admin-доступ). Это компромисс между UX и нагрузкой.
 *
 * ────────────────────────────────────────────────────────────────────────────
 */

import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { storage } from '@/lib/storage';
import { AUTH_SESSION_EVENT } from '@/lib/authStorage';
import Welcome from '@/pages/Welcome';

type GuardProps = { children: React.ReactNode };

/**
 * ProtectedRoute — пускает либо при наличии auth-токена, либо в demo-режиме.
 * При отсутствии — рендерит Welcome (НЕ редиректит на /welcome, чтобы не
 * терять текущий URL — это то же поведение, что было inline).
 */
export function ProtectedRoute({ children }: GuardProps) {
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      try {
        const token = storage.getItem('authToken');
        const isDemoMode = localStorage.getItem('isDemoMode') === 'true';
        setIsAuthenticated(!!token || isDemoMode);
      } catch (error) {
        // Storage недоступен (private mode / disabled cookies). Считаем юзера
        // неавторизованным — это безопаснее, чем кидать.
        console.warn('[ProtectedRoute] storage unavailable, treating as logged out:', error);
        setIsAuthenticated(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkAuth();

    const onStorage = (e: StorageEvent) => {
      // Реагируем только на ключи, которые реально влияют на auth-state.
      // Прочие изменения localStorage игнорируем — экономим re-render.
      if (!e.key || ['authToken', 'auth_token', 'isDemoMode'].includes(e.key)) {
        checkAuth();
      }
    };

    window.addEventListener('storage', onStorage);
    window.addEventListener(AUTH_SESSION_EVENT, checkAuth);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener(AUTH_SESSION_EVENT, checkAuth);
    };
  }, []);

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Проверка авторизации...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Welcome />;
  }

  return <>{children}</>;
}

/**
 * AdminRoute — пускает только при `adminToken === 'admin_authenticated'`.
 * При отсутствии — редиректит на /admin/login.
 */
export function AdminRoute({ children }: GuardProps) {
  const [isChecking, setIsChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdmin = () => {
      try {
        const adminToken = localStorage.getItem('adminToken');
        setIsAdmin(adminToken === 'admin_authenticated');
      } catch (error) {
        // Аналогично ProtectedRoute: при недоступном storage — нет admin-доступа.
        console.warn('[AdminRoute] storage unavailable, denying admin:', error);
        setIsAdmin(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkAdmin();

    const onStorage = (e: StorageEvent) => {
      if (!e.key || e.key === 'adminToken') {
        checkAdmin();
      }
    };
    // focus — компромисс: AdminLogin не использует authStorage helper, поэтому
    // в текущей вкладке узнаём об изменении adminToken при возврате на вкладку.
    const onFocus = () => checkAdmin();

    window.addEventListener('storage', onStorage);
    window.addEventListener('focus', onFocus);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('focus', onFocus);
    };
  }, []);

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-violet-50/40 to-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-violet-600 mx-auto mb-3"></div>
          <p className="text-sm text-gray-600">Проверка админ-доступа…</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
}
