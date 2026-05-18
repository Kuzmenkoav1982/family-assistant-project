import type { Modality } from '@/components/hub/ModalityBadge';
import type { CardStatus } from '@/components/hub/StatusBadge';

export interface HubSubSection {
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
  cta?: string;
}

export const FAMILY_CODE_SECTIONS: HubSubSection[] = [
  {
    id: 'personal',
    title: 'Личный код',
    description: 'Полный расклад на каждого члена семьи: числа судьбы, квадрат Пифагора, знаки зодиака, карта Бацзы и арканы Таро',
    icon: 'UserCircle2',
    iconColor: 'text-violet-600',
    iconBg: 'bg-violet-50 dark:bg-violet-950/40',
    path: '/family-matrix/personal',
    modality: 'reflect',
    status: 'recommended',
    cta: 'Открыть',
  },
  {
    id: 'couple',
    title: 'Код пары',
    description: 'Совместимость по всем 4 пластам: нумерология, астрология, арканы, психология. Оценка 0-100% и советы',
    icon: 'Heart',
    iconColor: 'text-rose-600',
    iconBg: 'bg-rose-50 dark:bg-rose-950/40',
    path: '/family-matrix/couple',
    modality: 'reflect',
    status: 'recommended',
    cta: 'Открыть',
  },
  {
    id: 'family',
    title: 'Код семьи',
    description: 'Энергетика семьи сегодня, матрица взаимоотношений, биоритмы и дни силы для каждого',
    icon: 'Users',
    iconColor: 'text-amber-600',
    iconBg: 'bg-amber-50 dark:bg-amber-950/40',
    path: '/family-matrix/family',
    modality: 'family',
    status: 'ready',
    cta: 'Открыть',
  },
  {
    id: 'rituals',
    title: 'Ритуалы примирения',
    description: 'Персональные сценарии после ссор + ИИ-анализ конкретных конфликтов с учётом нумерологии и астрологии обоих участников',
    icon: 'Flame',
    iconColor: 'text-teal-600',
    iconBg: 'bg-teal-50 dark:bg-teal-950/40',
    path: '/family-matrix/rituals',
    modality: 'ai',
    status: 'recommended',
    cta: 'Открыть',
  },
  {
    id: 'child-code',
    title: 'Детский код',
    description: 'Врождённые таланты, стиль обучения, мотивация и рекомендации для родителей',
    icon: 'Baby',
    iconColor: 'text-sky-600',
    iconBg: 'bg-sky-50 dark:bg-sky-950/40',
    path: '/family-matrix/child',
    modality: 'reflect',
    status: 'ready',
    cta: 'Открыть',
  },
  {
    id: 'name-calculator',
    title: 'Имя для малыша',
    description: 'Топ-10 имён по совместимости с родителями + проверка своего варианта',
    icon: 'Sparkles',
    iconColor: 'text-emerald-600',
    iconBg: 'bg-emerald-50 dark:bg-emerald-950/40',
    path: '/family-matrix/name',
    modality: 'service',
    status: 'ready',
    cta: 'Подобрать',
  },
  {
    id: 'astrology',
    title: 'Астрология',
    description: 'Знаки зодиака, китайский гороскоп, карта Бацзы (4 столпа судьбы), прогнозы на день/неделю/месяц и ИИ-прогноз от Домового',
    icon: 'Moon',
    iconColor: 'text-indigo-600',
    iconBg: 'bg-indigo-50 dark:bg-indigo-950/40',
    path: '/family-matrix/astrology',
    modality: 'ai',
    status: 'ready',
    cta: 'Открыть',
  },
  {
    id: 'pari-mirror',
    title: 'Зеркало родителя',
    description: 'Научный тест PARI Шефера-Белла на родительские установки. 35 вопросов, радар-диаграмма, ИИ-разбор результатов',
    icon: 'HeartHandshake',
    iconColor: 'text-purple-600',
    iconBg: 'bg-purple-50 dark:bg-purple-950/40',
    path: '/pari-test',
    modality: 'reflect',
    status: 'recommended',
    cta: 'Пройти тест',
  },
];
