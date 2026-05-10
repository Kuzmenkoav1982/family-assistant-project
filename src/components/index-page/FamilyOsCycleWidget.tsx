import { useNavigate } from 'react-router-dom';
import Icon from '@/components/ui/icon';

interface CycleNode {
  id: string;
  phase: string;
  question: string;
  icon: string;
  hint: string;
  bg: string;
  iconColor: string;
  ringColor: string;
  hubPath: string;
}

const CYCLES: CycleNode[] = [
  {
    id: 'collect',
    phase: 'Сбор',
    question: 'Что у нас есть?',
    icon: 'Database',
    hint: 'Семья · Здоровье · Финансы',
    bg: 'bg-slate-50 dark:bg-slate-900/40',
    iconColor: 'text-slate-600',
    ringColor: 'ring-slate-200 dark:ring-slate-700',
    hubPath: '/family-hub',
  },
  {
    id: 'panorama',
    phase: 'Панорама',
    question: 'Какая картина?',
    icon: 'LayoutDashboard',
    hint: 'Дашборд · обзоры · прогнозы',
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    iconColor: 'text-emerald-600',
    ringColor: 'ring-emerald-200 dark:ring-emerald-800',
    hubPath: '/dashboard',
  },
  {
    id: 'reflect',
    phase: 'Осмысление',
    question: 'Что для нас важно?',
    icon: 'Brain',
    hint: 'Развитие · мастерская жизни',
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    iconColor: 'text-amber-600',
    ringColor: 'ring-amber-200 dark:ring-amber-800',
    hubPath: '/development-hub',
  },
  {
    id: 'agree',
    phase: 'Договорённости',
    question: 'О чём договорились?',
    icon: 'HandshakeIcon',
    hint: 'Семейный код · правила',
    bg: 'bg-fuchsia-50 dark:bg-fuchsia-950/30',
    iconColor: 'text-fuchsia-600',
    ringColor: 'ring-fuchsia-200 dark:ring-fuchsia-800',
    hubPath: '/family-matrix',
  },
  {
    id: 'execute',
    phase: 'Исполнение',
    question: 'Как сделаем?',
    icon: 'CheckSquare',
    hint: 'Цели · задачи · покупки',
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    iconColor: 'text-blue-600',
    ringColor: 'ring-blue-200 dark:ring-blue-800',
    hubPath: '/planning-hub',
  },
];

const FamilyOsCycleWidget = () => {
  const navigate = useNavigate();

  return (
    <div className="rounded-2xl border bg-white dark:bg-gray-900 p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center">
              <Icon name="Sparkles" size={14} className="text-white" />
            </div>
            <h3 className="text-[15px] font-bold text-gray-900 dark:text-white">
              Семейная ОС: 5 циклов
            </h3>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Как ваша семья проходит путь от фактов до действий
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {CYCLES.map((cycle, idx) => (
          <button
            key={cycle.id}
            onClick={() => navigate(cycle.hubPath)}
            className={`group relative text-left rounded-xl ${cycle.bg} p-3 ring-1 ${cycle.ringColor} hover:scale-[1.02] hover:shadow-sm transition-all`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-7 h-7 rounded-lg bg-white/70 dark:bg-gray-900/40 flex items-center justify-center">
                <Icon name={cycle.icon} fallback="Circle" size={14} className={cycle.iconColor} />
              </div>
              <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500">
                {idx + 1}
              </span>
            </div>
            <div className="text-[12px] font-bold text-gray-900 dark:text-white leading-tight">
              {cycle.phase}
            </div>
            <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 leading-tight">
              {cycle.question}
            </div>
            <div className="text-[10px] text-gray-400 dark:text-gray-500 mt-1.5 leading-tight truncate">
              {cycle.hint}
            </div>
          </button>
        ))}
      </div>

      <div className="mt-3 flex items-center gap-2 text-[11px] text-gray-400 dark:text-gray-500">
        <Icon name="RefreshCcw" size={11} />
        <span>Цикл замкнут: исполнение даёт новые факты для следующего сбора</span>
      </div>
    </div>
  );
};

export default FamilyOsCycleWidget;
