// useViewer — derive ViewerKind ('public' | 'authenticated' | 'admin')
// для resolveActiveBanner.
//
// Источники:
//   - authToken через storage (как ProtectedRoute)
//   - adminSessionToken через hasValidLocalAdminSession (как AdminRoute)
//   - AUTH_SESSION_EVENT — реагирует на login/logout в этой же вкладке
//   - window 'storage' event — реагирует на изменения в других вкладках
//
// Не дёргает api, не делает network — только чтение локальных ключей.
// Нагрузка на main thread минимальна (3 листенера, без интервалов).

import { useEffect, useState } from 'react';
import { storage } from '@/lib/storage';
import { AUTH_SESSION_EVENT } from '@/lib/authStorage';
import { hasValidLocalAdminSession } from '@/lib/adminAuth';
import type { ViewerKind } from './types';

function readViewer(): ViewerKind {
  try {
    if (hasValidLocalAdminSession()) return 'admin';
    const token = storage.getItem('authToken');
    const isDemo = localStorage.getItem('isDemoMode') === 'true';
    if (token || isDemo) return 'authenticated';
    return 'public';
  } catch {
    return 'public';
  }
}

export function useViewer(): ViewerKind {
  const [viewer, setViewer] = useState<ViewerKind>(() => readViewer());

  useEffect(() => {
    const update = () => setViewer(readViewer());
    update();

    window.addEventListener(AUTH_SESSION_EVENT, update);
    window.addEventListener('storage', update);
    window.addEventListener('focus', update);

    return () => {
      window.removeEventListener(AUTH_SESSION_EVENT, update);
      window.removeEventListener('storage', update);
      window.removeEventListener('focus', update);
    };
  }, []);

  return viewer;
}