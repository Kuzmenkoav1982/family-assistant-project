import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '@/components/ui/icon';

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

// Источник правды: собираем сигналы из разных мест (localStorage + проверки).
//
// Правила схлопывания (защита от каскада однотипных сигналов):
//  1. Если у семьи нет состава — показываем ТОЛЬКО про семью.
//     Все остальные сигналы пока бессмысленны.
//  2. Когда семья заполнена — открываем сигналы из других хабов.
//  3. Максимум 3 карточки одновременно.
const readJson = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

const collectAttentionItems = (): AttentionItem[] => {
  const family = readJson<unknown[]>('familyMembers', []);
  const familyEmpty = !Array.isArray(family) || family.length === 0;

  // Гейт №1: пока нет семьи — единственный сигнал.
  // Не дробим на «добавьте профили детей», «постройте древо» и т.п.
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

  // Семья заполнена — собираем сигналы из других модулей
  const items: AttentionItem[] = [];

  // Дом — есть смысл предложить, если квартира не заполнена
  const home = readJson<unknown[]>('home_apartments', []);
  if (!Array.isArray(home) || home.length === 0) {
    items.push({
      id: 'home-empty',
      icon: 'Building',
      iconColor: 'text-amber-600',
      iconBg: 'bg-amber-50 dark:bg-amber-950/40',
      title: 'Новый модуль «Дом»',
      hint: 'Квартира, коммуналка, показания и ремонты в одном месте',
      cta: 'Открыть',
      path: '/home-hub',
      priority: 2,
    });
  }

  // Госуслуги: подбор мер поддержки
  if (!localStorage.getItem('supportNavigatorOpened')) {
    items.push({
      id: 'support-navigator',
      icon: 'Sparkles',
      iconColor: 'text-slate-700',
      iconBg: 'bg-slate-100 dark:bg-slate-800/60',
      title: 'Подобрать меры поддержки',
      hint: 'Что положено вашей семье от государства',
      cta: 'Подобрать',
      path: '/support-navigator',
      priority: 3,
    });
  }

  // Семейный код пары
  if (!localStorage.getItem('familyMatrix.couple')) {
    items.push({
      id: 'couple-code',
      icon: 'Heart',
      iconColor: 'text-pink-600',
      iconBg: 'bg-pink-50 dark:bg-pink-950/40',
      title: 'Соберите код пары',
      hint: 'Семейный код — слой осмысления отношений',
      cta: 'Начать',
      path: '/family-matrix/couple',
      priority: 4,
    });
  }

  return items.sort((a, b) => a.priority - b.priority).slice(0, 3);
};

const AttentionBlock = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<AttentionItem[]>(() => collectAttentionItems());

  useEffect(() => {
    const handler = () => setItems(collectAttentionItems());
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

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