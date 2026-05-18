import { useEffect, useMemo, useState } from 'react';
import { signals } from '@/lib/cardStatus';
import type { CardStatus } from '@/components/hub/StatusBadge';
import type { SubSection } from './types';

const readJson = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

interface ShoppingItem { bought?: boolean }
interface HomeUtility { paid?: boolean }

export function useHouseholdSignals() {
  const [version, setVersion] = useState(0);

  useEffect(() => {
    const handler = () => setVersion(v => v + 1);
    window.addEventListener('storage', handler);
    window.addEventListener('focus', handler);
    return () => {
      window.removeEventListener('storage', handler);
      window.removeEventListener('focus', handler);
    };
  }, []);
  void version;

  return useMemo(() => {
    const shoppingList = readJson<ShoppingItem[]>('shoppingItems', []);
    const shoppingPending = Array.isArray(shoppingList)
      ? shoppingList.filter(i => !i?.bought).length
      : 0;
    const shoppingHas = Array.isArray(shoppingList) && shoppingList.length > 0;

    const homeData = readJson<{ utilities?: HomeUtility[] }>('home-module-data-v1', {});
    const homeUtils = Array.isArray(homeData?.utilities) ? homeData.utilities : [];
    const homeUnpaid = homeUtils.filter(u => !u.paid).length;

    const shoppingStatus = shoppingPending > 0
      ? { status: 'attention' as CardStatus, statusLabel: `${shoppingPending} к покупке` }
      : shoppingHas
      ? signals.ready('Список пуст')
      : signals.idle('Не настроено');

    const homeStatus = homeUnpaid > 0
      ? { status: 'attention' as CardStatus, statusLabel: `${homeUnpaid} ${homeUnpaid === 1 ? 'счёт' : 'счетов'} к оплате` }
      : homeUtils.length > 0
      ? signals.ready('Всё оплачено')
      : { status: 'new' as CardStatus, statusLabel: 'Новое', isNew: true };

    const householdSubSections: SubSection[] = [
      {
        id: 'shopping',
        title: 'Список покупок',
        description: 'Общий список покупок для всей семьи с категориями',
        icon: 'ShoppingCart',
        iconColor: 'text-orange-600',
        iconBg: 'bg-orange-50 dark:bg-orange-950/40',
        path: '/shopping',
        modality: 'service',
        status: shoppingStatus.status,
        statusLabel: shoppingStatus.statusLabel,
        cta: 'Открыть',
      },
      {
        id: 'voting',
        title: 'Голосования',
        description: 'Семейные голосования для принятия общих решений',
        icon: 'Vote',
        iconColor: 'text-blue-600',
        iconBg: 'bg-blue-50 dark:bg-blue-950/40',
        path: '/voting',
        modality: 'family',
        status: 'ready',
        cta: 'Открыть',
      },
      {
        id: 'home',
        title: 'Дом',
        description: 'Квартира, коммуналка, показания счётчиков и ремонты',
        icon: 'Building',
        iconColor: 'text-amber-600',
        iconBg: 'bg-amber-50 dark:bg-amber-950/40',
        path: '/home-hub',
        modality: 'service',
        status: homeStatus.status,
        statusLabel: homeStatus.statusLabel,
        isNew: 'isNew' in homeStatus ? homeStatus.isNew : undefined,
        cta: 'Открыть',
      },
    ];

    const transportSubSections: SubSection[] = [
      {
        id: 'garage',
        title: 'Гараж',
        description: 'Учёт автомобилей, ТО, расходы и напоминания',
        icon: 'Car',
        iconColor: 'text-slate-700',
        iconBg: 'bg-slate-100 dark:bg-slate-800',
        path: '/garage',
        modality: 'service',
        status: 'ready',
        cta: 'Открыть',
      },
    ];

    return {
      householdSubSections,
      transportSubSections,
      totalSections: householdSubSections.length + transportSubSections.length,
      unpaidCount: homeUnpaid,
    };
  }, [version]);
}
