import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { useFamilyMembersContext } from '@/contexts/FamilyMembersContext';
import { useDomovoyContext } from '@/hooks/useDomovoyContext';

interface AttentionItem {
  id: string;
  icon: string;
  iconColor: string;
  iconBg: string;
  title: string;
  hint: string;
  cta: string;
  path: string;
  priority: number; // 1 — высокий
}

/**
 * Блок «Требует внимания» — агрегатор реальных сигналов из всей ОС.
 *
 * Источники истины:
 *  - useFamilyMembersContext() — состав семьи (backend, не localStorage)
 *  - useDomovoyContext() — живая сводка из БД (неоплаченные счета, дом, и т.п.)
 *
 * Правила схлопывания:
 *  1. Если у семьи нет состава — показываем ТОЛЬКО про семью.
 *  2. Когда семья заполнена — открываем сигналы из других хабов.
 *  3. Максимум 3 карточки одновременно.
 *  4. attention из реальных данных идут раньше «декоративных» CTA.
 */

const AttentionBlock = () => {
  const navigate = useNavigate();
  const { members } = useFamilyMembersContext();
  const { data: liveCtx } = useDomovoyContext(true);

  // Локальные сигналы из localStorage (для CTA, у которых пока нет backend-источника)
  const [localFlags, setLocalFlags] = useState({
    supportSeen: typeof window !== 'undefined' && !!localStorage.getItem('supportNavigatorOpened'),
    coupleSeen: typeof window !== 'undefined' && !!localStorage.getItem('familyMatrix.couple'),
  });

  useEffect(() => {
    const handler = () => {
      setLocalFlags({
        supportSeen: !!localStorage.getItem('supportNavigatorOpened'),
        coupleSeen: !!localStorage.getItem('familyMatrix.couple'),
      });
    };
    window.addEventListener('storage', handler);
    window.addEventListener('focus', handler);
    return () => {
      window.removeEventListener('storage', handler);
      window.removeEventListener('focus', handler);
    };
  }, []);

  const items = useMemo<AttentionItem[]>(() => {
    const familyEmpty = !Array.isArray(members) || members.length === 0;

    // Гейт №1: пока нет семьи — единственный сигнал.
    if (familyEmpty) {
      return [{
        id: 'family-empty',
        icon: 'Users',
        iconColor: 'text-blue-600',
        iconBg: 'bg-blue-50 dark:bg-blue-950/40',
        title: 'Заполните состав семьи',
        hint: 'Это фундамент: остальные модули опираются на него',
        cta: 'Добавить',
        path: '/?section=family',
        priority: 1,
      }];
    }

    const list: AttentionItem[] = [];

    // 1. Неоплаченные коммунальные платежи — реальный сигнал из БД (приоритет 1)
    const unpaid = liveCtx?.home?.unpaid_utilities_count || 0;
    const unpaidTotal = liveCtx?.home?.unpaid_utilities_total || 0;
    if (unpaid > 0) {
      list.push({
        id: 'unpaid-utilities',
        icon: 'Receipt',
        iconColor: 'text-rose-600',
        iconBg: 'bg-rose-50 dark:bg-rose-950/40',
        title: `Не оплачено ${unpaid} ${unpaid === 1 ? 'счёт' : 'счетов'} коммуналки`,
        hint: `На сумму ${unpaidTotal.toLocaleString('ru-RU')} ₽`,
        cta: 'Открыть',
        path: '/home-hub',
        priority: 1,
      });
    }

    // 2. Просроченные задачи — реальный сигнал из БД
    const overdue = liveCtx?.tasks?.overdue_count || 0;
    if (overdue > 0) {
      list.push({
        id: 'overdue-tasks',
        icon: 'AlertCircle',
        iconColor: 'text-orange-600',
        iconBg: 'bg-orange-50 dark:bg-orange-950/40',
        title: `Просрочено ${overdue} ${overdue === 1 ? 'задача' : 'задач'}`,
        hint: 'Откройте задачи и закройте срочное',
        cta: 'Открыть',
        path: '/tasks',
        priority: 2,
      });
    }

    // 3. Срочные покупки
    const urgent = liveCtx?.shopping?.urgent_count || 0;
    if (urgent > 0) {
      list.push({
        id: 'urgent-shopping',
        icon: 'ShoppingCart',
        iconColor: 'text-amber-600',
        iconBg: 'bg-amber-50 dark:bg-amber-950/40',
        title: `${urgent} ${urgent === 1 ? 'срочная покупка' : 'срочных покупок'}`,
        hint: 'В списке покупок есть срочные товары',
        cta: 'Открыть',
        path: '/shopping',
        priority: 3,
      });
    }

    // 4. Дом не заполнен — мягкое предложение
    if (!liveCtx?.home?.apartment_filled && list.length < 3) {
      list.push({
        id: 'home-empty',
        icon: 'Building',
        iconColor: 'text-amber-600',
        iconBg: 'bg-amber-50 dark:bg-amber-950/40',
        title: 'Новый модуль «Дом»',
        hint: 'Квартира, коммуналка, показания и ремонты в одном месте',
        cta: 'Открыть',
        path: '/home-hub',
        priority: 4,
      });
    }

    // 5. Госуслуги — подбор мер поддержки (если ещё не открывали)
    if (!localFlags.supportSeen && list.length < 3) {
      list.push({
        id: 'support-navigator',
        icon: 'Sparkles',
        iconColor: 'text-slate-700',
        iconBg: 'bg-slate-100 dark:bg-slate-800/60',
        title: 'Подобрать меры поддержки',
        hint: 'Что положено вашей семье от государства',
        cta: 'Подобрать',
        path: '/support-navigator',
        priority: 5,
      });
    }

    // 6. Семейный код пары
    if (!localFlags.coupleSeen && list.length < 3) {
      list.push({
        id: 'couple-code',
        icon: 'Heart',
        iconColor: 'text-pink-600',
        iconBg: 'bg-pink-50 dark:bg-pink-950/40',
        title: 'Соберите код пары',
        hint: 'Семейный код — слой осмысления отношений',
        cta: 'Начать',
        path: '/family-matrix/couple',
        priority: 6,
      });
    }

    return list.sort((a, b) => a.priority - b.priority).slice(0, 3);
  }, [members, liveCtx, localFlags]);

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border bg-emerald-50/50 dark:bg-emerald-950/20 p-4 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center flex-shrink-0">
          <Icon name="Check" size={18} className="text-emerald-600" />
        </div>
        <div className="min-w-0">
          <div className="text-[13px] font-bold text-gray-900 dark:text-white">Всё на местах</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Сейчас особо ничего не требует внимания</div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border bg-white dark:bg-gray-900 p-4 sm:p-5">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-lg bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center">
          <Icon name="Bell" size={14} className="text-orange-600" />
        </div>
        <h3 className="text-[15px] font-bold text-gray-900 dark:text-white">
          Требует внимания
        </h3>
        <span className="ml-auto text-[11px] text-gray-400 dark:text-gray-500">
          {items.length} {items.length === 1 ? 'сигнал' : 'сигнала'}
        </span>
      </div>

      <div className="space-y-2">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => navigate(item.path)}
            className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors text-left group"
          >
            <div className={`w-9 h-9 rounded-xl ${item.iconBg} flex items-center justify-center flex-shrink-0`}>
              <Icon name={item.icon} fallback="Circle" size={16} className={item.iconColor} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[13px] font-semibold text-gray-900 dark:text-white truncate">
                {item.title}
              </div>
              <div className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                {item.hint}
              </div>
            </div>
            <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 flex-shrink-0 group-hover:underline">
              {item.cta}
            </span>
            <Icon name="ChevronRight" size={14} className="text-gray-300 dark:text-gray-600 flex-shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
};

export default AttentionBlock;
