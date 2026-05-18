import type { Modality } from '@/components/hub/ModalityBadge';
import type { CardStatus } from '@/components/hub/StatusBadge';

export interface SubSection {
  id: string;
  title: string;
  description: string;
  icon: string;
  iconColor: string;
  iconBg: string;
  path: string;
  modality: Modality;
  status: CardStatus;
  isNew?: boolean;
  group: 'analysis' | 'accounting' | 'goals' | 'protection' | 'service';
  cta?: string;
}

export const subSections: SubSection[] = [
  { id: 'analytics', title: 'Финансовый пульс', description: 'Анализ здоровья финансов, ИИ-рекомендации, прогнозы', icon: 'Activity',  iconColor: 'text-violet-600', iconBg: 'bg-violet-50 dark:bg-violet-950/40', path: '/finance/analytics', modality: 'ai',      status: 'new', isNew: true, group: 'analysis', cta: 'Открыть' },
  { id: 'strategy',  title: 'Стратегия погашения', description: 'Лавина, снежный ком — сравни стратегии и симулятор «Что если?»', icon: 'Swords',  iconColor: 'text-orange-600', iconBg: 'bg-orange-50 dark:bg-orange-950/40', path: '/finance/strategy', modality: 'ai', status: 'new', isNew: true, group: 'analysis', cta: 'Открыть' },
  { id: 'cashflow',  title: 'Кэш-флоу прогноз', description: 'Прогноз движения денег на 24 месяца и кассовые разрывы', icon: 'TrendingUp', iconColor: 'text-teal-600', iconBg: 'bg-teal-50 dark:bg-teal-950/40', path: '/finance/cashflow', modality: 'ai', status: 'new', isNew: true, group: 'analysis', cta: 'Открыть' },

  { id: 'budget',    title: 'Бюджет', description: 'Доходы, расходы, аналитика по категориям и лимиты', icon: 'PieChart', iconColor: 'text-emerald-600', iconBg: 'bg-emerald-50 dark:bg-emerald-950/40', path: '/finance/budget', modality: 'service', status: 'ready', group: 'accounting', cta: 'Открыть' },
  { id: 'accounts',  title: 'Счета и карты', description: 'Банковские карты, счета и наличные — все балансы вместе', icon: 'CreditCard', iconColor: 'text-blue-600', iconBg: 'bg-blue-50 dark:bg-blue-950/40', path: '/finance/accounts', modality: 'service', status: 'ready', group: 'accounting', cta: 'Открыть' },
  { id: 'debts',     title: 'Кредиты и долги', description: 'Ипотека, кредиты, займы — остатки, графики, переплаты', icon: 'Receipt', iconColor: 'text-rose-600', iconBg: 'bg-rose-50 dark:bg-rose-950/40', path: '/finance/debts', modality: 'service', status: 'ready', group: 'accounting', cta: 'Открыть' },
  { id: 'assets',    title: 'Имущество', description: 'Недвижимость, транспорт, техника — учёт и стоимость активов', icon: 'Home', iconColor: 'text-sky-600', iconBg: 'bg-sky-50 dark:bg-sky-950/40', path: '/finance/assets', modality: 'service', status: 'ready', group: 'accounting', cta: 'Открыть' },

  { id: 'goals',     title: 'Финансовые цели', description: 'Накопления на мечту: квартира, машина, отпуск, образование', icon: 'Target', iconColor: 'text-amber-600', iconBg: 'bg-amber-50 dark:bg-amber-950/40', path: '/finance/goals', modality: 'service', status: 'ready', group: 'goals', cta: 'Открыть' },
  { id: 'literacy',  title: 'Финансовая грамотность', description: 'Обучение для всей семьи: курсы, тесты и задания по возрастам', icon: 'GraduationCap', iconColor: 'text-purple-600', iconBg: 'bg-purple-50 dark:bg-purple-950/40', path: '/finance/literacy', modality: 'content', status: 'ready', group: 'goals', cta: 'Открыть' },

  { id: 'antiscam',  title: 'Антимошенник', description: 'База мошеннических схем, проверка ссылок и тревожная кнопка', icon: 'ShieldAlert', iconColor: 'text-rose-700', iconBg: 'bg-rose-50 dark:bg-rose-950/40', path: '/finance/antiscam', modality: 'service', status: 'recommended', group: 'protection', cta: 'Открыть' },

  { id: 'loyalty',   title: 'Скидочные карты', description: 'Карты лояльности магазинов, аптек, АЗС — вся семья видит все карты', icon: 'Ticket', iconColor: 'text-pink-600', iconBg: 'bg-pink-50 dark:bg-pink-950/40', path: '/finance/loyalty', modality: 'service', status: 'ready', group: 'service', cta: 'Открыть' },
  { id: 'wallet',    title: 'Кошелёк сервиса', description: 'Баланс для ИИ-функций: диета, рецепты, открытки, рекомендации', icon: 'Wallet', iconColor: 'text-cyan-600', iconBg: 'bg-cyan-50 dark:bg-cyan-950/40', path: '/wallet', modality: 'service', status: 'ready', group: 'service', cta: 'Открыть' },
];

export const OWNER_ONLY_SECTIONS = ['budget', 'debts', 'accounts', 'recurring', 'assets', 'analytics', 'strategy', 'cashflow'];

export const GROUPS: { id: SubSection['group']; title: string; subtitle: string }[] = [
  { id: 'analysis',   title: 'Анализ и стратегия', subtitle: 'Картина и прогнозы' },
  { id: 'accounting', title: 'Учёт',               subtitle: 'Деньги, балансы, обязательства' },
  { id: 'goals',      title: 'Цели и обучение',    subtitle: 'Куда двигаемся и что учим' },
  { id: 'protection', title: 'Защита',             subtitle: 'Безопасность семейных финансов' },
  { id: 'service',    title: 'Сервис',             subtitle: 'Дополнительные инструменты' },
];

export const HOW_IT_WORKS_STEPS = [
  {
    icon: 'Wallet',
    title: 'Шаг 1. Добавьте счета',
    description: 'Внесите счета, карты и накопления. Это основа: финансовый пульс семьи начинает работать сразу.',
  },
  {
    icon: 'PieChart',
    title: 'Шаг 2. Настройте бюджет',
    description: 'Распределите доходы по категориям. Кэш-флоу прогноз покажет, куда движутся деньги.',
  },
  {
    icon: 'Target',
    title: 'Шаг 3. Поставьте цели',
    description: 'Подушка безопасности, отпуск, крупные покупки. Стратегия погашения долгов — отдельный модуль.',
  },
  {
    icon: 'Shield',
    title: 'Шаг 4. Защита и финграмотность',
    description: 'Антимошенник, скидочные карты, имущество и обучение — финансовая безопасность на каждый день.',
  },
];
