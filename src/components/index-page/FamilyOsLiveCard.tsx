import { useNavigate } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { useDomovoyContext } from '@/hooks/useDomovoyContext';

/**
 * Виджет «Семейная ОС в реальном времени».
 * Показывает живую сводку всех модулей: то же, что видит Домовой.
 *
 * Источник истины: backend domovoy-context (с in-memory кешем 1 мин).
 *
 * Демонстрирует «единый организм» — пользователь и инвестор за 5 секунд
 * видят весь срез семьи на одном экране.
 */

interface CellProps {
  icon: string;
  iconColor: string;
  iconBg: string;
  label: string;
  value: string | number;
  hint?: string;
  highlight?: 'attention' | 'ready' | 'idle';
  onClick?: () => void;
}

const Cell = ({ icon, iconColor, iconBg, label, value, hint, highlight, onClick }: CellProps) => {
  const ringClass =
    highlight === 'attention' ? 'ring-1 ring-orange-200 dark:ring-orange-800' :
    highlight === 'ready' ? 'ring-1 ring-emerald-200 dark:ring-emerald-800' :
    'ring-1 ring-gray-100 dark:ring-gray-800';

  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      className={`group text-left rounded-xl bg-white dark:bg-gray-900 p-3 ${ringClass} ${onClick ? 'hover:shadow-md hover:scale-[1.01]' : ''} transition-all`}
    >
      <div className="flex items-center justify-between mb-1.5">
        <div className={`w-7 h-7 rounded-lg ${iconBg} flex items-center justify-center`}>
          <Icon name={icon} fallback="Circle" size={14} className={iconColor} />
        </div>
        {onClick && (
          <Icon name="ArrowUpRight" size={11} className="text-gray-300 group-hover:text-gray-500 transition-colors" />
        )}
      </div>
      <div className="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400 truncate">
        {label}
      </div>
      <div className="text-[15px] font-bold text-gray-900 dark:text-white truncate leading-tight">
        {value}
      </div>
      {hint && (
        <div className="text-[10px] text-gray-400 dark:text-gray-500 truncate mt-0.5">
          {hint}
        </div>
      )}
    </button>
  );
};

const FamilyOsLiveCard = () => {
  const navigate = useNavigate();
  const { data, loading, isReady, refresh } = useDomovoyContext(true);

  if (!isReady && loading) {
    return (
      <div className="rounded-2xl border bg-white dark:bg-gray-900 p-4 sm:p-5 animate-pulse">
        <div className="h-4 w-40 bg-gray-100 dark:bg-gray-800 rounded mb-3" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="h-20 bg-gray-50 dark:bg-gray-800/40 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!isReady) return null;

  const fam = data?.family;
  const home = data?.home;
  const fin = data?.finance;
  const sh = data?.shopping;
  const tasks = data?.tasks;
  const goals = data?.goals;
  const cal = data?.calendar;

  const fmt = (n?: number) => (n ?? 0).toLocaleString('ru-RU');

  const cells: CellProps[] = [
    {
      icon: 'Users',
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-50 dark:bg-blue-950/40',
      label: 'Семья',
      value: fam?.members_count ? `${fam.members_count} чел` : '—',
      hint: fam?.members?.[0]?.name ? `${fam.members.slice(0, 2).map(m => m.name).join(', ')}${fam.members_count > 2 ? '...' : ''}` : undefined,
      highlight: fam?.members_count ? 'ready' : 'idle',
      onClick: () => navigate('/family-hub'),
    },
    {
      icon: 'Building',
      iconColor: 'text-amber-600',
      iconBg: 'bg-amber-50 dark:bg-amber-950/40',
      label: 'Дом',
      value: home?.unpaid_utilities_count
        ? `${home.unpaid_utilities_count} к оплате`
        : home?.apartment_filled ? 'В порядке' : '—',
      hint: home?.unpaid_utilities_total ? `${fmt(home.unpaid_utilities_total)} ₽` : (home?.active_repairs_count ? `${home.active_repairs_count} ремонт(а)` : undefined),
      highlight: home?.unpaid_utilities_count ? 'attention' : (home?.apartment_filled ? 'ready' : 'idle'),
      onClick: () => navigate('/home-hub'),
    },
    {
      icon: 'Wallet',
      iconColor: 'text-emerald-600',
      iconBg: 'bg-emerald-50 dark:bg-emerald-950/40',
      label: 'Бюджет',
      value: fin && (fin.month_income || fin.month_expense) ? `${fmt(Math.round(fin.month_balance))} ₽` : '—',
      hint: fin && fin.month_expense ? `−${fmt(Math.round(fin.month_expense))} ₽ за месяц` : undefined,
      highlight: fin && fin.month_balance < 0 ? 'attention' : (fin && fin.month_income ? 'ready' : 'idle'),
      onClick: () => navigate('/finance/budget'),
    },
    {
      icon: 'CreditCard',
      iconColor: 'text-rose-600',
      iconBg: 'bg-rose-50 dark:bg-rose-950/40',
      label: 'Долги',
      value: fin?.active_debts_count ? `${fin.active_debts_count}` : '—',
      hint: fin?.active_debts_count ? 'кредитов открыто' : undefined,
      highlight: fin?.active_debts_count ? 'attention' : 'idle',
      onClick: () => navigate('/finance/debts'),
    },
    {
      icon: 'ShoppingCart',
      iconColor: 'text-orange-600',
      iconBg: 'bg-orange-50 dark:bg-orange-950/40',
      label: 'Покупки',
      value: sh?.pending_count ? `${sh.pending_count}` : '—',
      hint: sh?.urgent_count ? `${sh.urgent_count} срочно` : (sh?.pending_count ? 'в списке' : undefined),
      highlight: sh?.urgent_count ? 'attention' : (sh?.pending_count ? 'ready' : 'idle'),
      onClick: () => navigate('/shopping'),
    },
    {
      icon: 'CheckSquare',
      iconColor: 'text-indigo-600',
      iconBg: 'bg-indigo-50 dark:bg-indigo-950/40',
      label: 'Задачи',
      value: tasks?.open_count ? `${tasks.open_count}` : '—',
      hint: tasks?.overdue_count ? `${tasks.overdue_count} просрочено` : (tasks?.open_count ? 'открыто' : undefined),
      highlight: tasks?.overdue_count ? 'attention' : (tasks?.open_count ? 'ready' : 'idle'),
      onClick: () => navigate('/tasks'),
    },
    {
      icon: 'Target',
      iconColor: 'text-violet-600',
      iconBg: 'bg-violet-50 dark:bg-violet-950/40',
      label: 'Цели',
      value: goals?.active_count ? `${goals.active_count}` : '—',
      hint: goals?.active_count ? 'активных' : undefined,
      highlight: goals?.active_count ? 'ready' : 'idle',
      onClick: () => navigate('/?section=goals'),
    },
    {
      icon: 'Calendar',
      iconColor: 'text-sky-600',
      iconBg: 'bg-sky-50 dark:bg-sky-950/40',
      label: 'Календарь',
      value: cal?.upcoming_count ? `${cal.upcoming_count}` : '—',
      hint: cal?.upcoming_count ? 'на 7 дней' : undefined,
      highlight: cal?.upcoming_count ? 'ready' : 'idle',
      onClick: () => navigate('/calendar'),
    },
  ];

  // Подсчёт свежести данных
  const generatedAt = data?.generated_at ? new Date(data.generated_at) : null;
  const ageSec = generatedAt ? Math.floor((Date.now() - generatedAt.getTime()) / 1000) : 0;
  const ageStr = ageSec < 60 ? 'только что' : ageSec < 3600 ? `${Math.floor(ageSec / 60)} мин назад` : 'недавно';

  return (
    <div className="rounded-2xl border bg-white dark:bg-gray-900 p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-blue-500 flex items-center justify-center">
              <Icon name="Activity" size={14} className="text-white" />
            </div>
            <h3 className="text-[15px] font-bold text-gray-900 dark:text-white">
              Семейная ОС в реальном времени
            </h3>
            <span className="relative inline-flex flex-shrink-0">
              <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-40" />
              <span className="relative block w-1.5 h-1.5 rounded-full bg-emerald-500" />
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            То же, что видит ваш Домовой · обновлено {ageStr}
          </p>
        </div>
        <button
          onClick={() => refresh()}
          className="text-[11px] text-gray-500 hover:text-gray-700 inline-flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex-shrink-0"
          title="Обновить"
          disabled={loading}
        >
          <Icon name="RefreshCcw" size={11} className={loading ? 'animate-spin' : ''} />
          Обновить
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {cells.map((c, i) => (
          <Cell key={i} {...c} />
        ))}
      </div>

      {/* Сноска: смысл ОС */}
      <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center gap-2 text-[11px] text-gray-400 dark:text-gray-500">
        <Icon name="Sparkles" size={11} />
        <span>Все данные семьи в одном месте — Домовой отвечает с учётом этой картины</span>
      </div>
    </div>
  );
};

export default FamilyOsLiveCard;
