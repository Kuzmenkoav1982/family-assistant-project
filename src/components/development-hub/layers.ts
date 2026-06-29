import type { DevLayer } from './types';

export const layers: DevLayer[] = [
  {
    id: 'panorama',
    title: 'Панорама',
    fullTitle: 'Панорама развития',
    subtitle: 'Видим картину семьи целиком',
    description:
      'Карта по 8 сферам для каждого члена семьи. Не оценка и не диагноз — живая картина роста, источники данных и подсказки. Здесь начинается осмысленное развитие.',
    icon: 'LayoutDashboard',
    accent: 'emerald',
    badge: 'Картина',
    sections: [
      {
        id: 'portfolio',
        title: 'Портфолио развития',
        description:
          'Живая карта по 8 сферам для каждого члена семьи: радар, источники данных, подсказки. Не оценка и не диагноз — карта роста.',
        icon: 'Sparkles',
        iconColor: 'text-emerald-600',
        iconBg: 'bg-emerald-50 dark:bg-emerald-950/40',
        path: '/portfolio',
        modality: 'reflect',
        status: 'new',
        isNew: true,
        cta: 'Открыть',
      },
    ],
  },
  {
    id: 'practice',
    title: 'Практика',
    fullTitle: 'Практика и навыки',
    subtitle: 'Растём ежедневно',
    description:
      'Планы развития, навыки, достижения, мастерская жизни. Здесь картина превращается в реальные шаги и привычки. Семья как мастерская роста.',
    icon: 'Hammer',
    accent: 'blue',
    badge: 'Шаги',
    sections: [
      {
        id: 'development',
        title: 'Развитие семьи',
        description: 'Планы развития, навыки и достижения каждого члена семьи',
        icon: 'TrendingUp',
        iconColor: 'text-blue-600',
        iconBg: 'bg-blue-50 dark:bg-blue-950/40',
        path: '/development',
        modality: 'service',
        status: 'ready',
        cta: 'Открыть',
      },
      {
        id: 'life-road',
        title: 'Мастерская жизни',
        description: 'Хронология событий, сезоны жизни, цели и инструменты для осознанного планирования',
        icon: 'Hammer',
        iconColor: 'text-pink-600',
        iconBg: 'bg-pink-50 dark:bg-pink-950/40',
        path: '/life-road',
        modality: 'reflect',
        status: 'new',
        isNew: true,
        cta: 'Открыть',
      },
    ],
  },
  {
    id: 'dialog',
    title: 'Диалог',
    fullTitle: 'Диалог и поддержка',
    subtitle: 'Разговор, который помогает',
    description:
      'Семейный ИИ-помощник, техники релаксации, справочник кризисов и поддержки. Здесь вы говорите — и вас слышат. Бережный собеседник для тонких семейных вопросов.',
    icon: 'MessagesSquare',
    accent: 'violet',
    badge: 'ИИ-помощник',
    sections: [
      {
        id: 'psychologist',
        title: 'Семейный ИИ-помощник',
        description: 'Идеи для размышления, техники релаксации, упражнения для семьи, справочник кризисов. Не заменяет специалиста.',
        icon: 'Brain',
        iconColor: 'text-violet-600',
        iconBg: 'bg-violet-50 dark:bg-violet-950/40',
        path: '/psychologist',
        modality: 'ai',
        status: 'ready',
        cta: 'Поговорить',
      },
    ],
  },
  {
    id: 'reflection',
    title: 'Рефлексия',
    fullTitle: 'Рефлексия родителя',
    subtitle: 'Смотрим на себя честно',
    description:
      'Зеркало родителя: научный тест PARI, радар-диаграмма установок, ИИ-разбор. Это пространство тихого взгляда внутрь — без оценок, только наблюдение и осознание.',
    icon: 'HeartHandshake',
    accent: 'amber',
    badge: 'Шорткат в «Семейный код»',
    sections: [
      {
        id: 'pari-mirror',
        title: 'Зеркало родителя',
        description:
          'Научный тест родительских установок (PARI Шефера-Белла). 35 вопросов, радар-диаграмма, ИИ-разбор.',
        icon: 'HeartHandshake',
        iconColor: 'text-amber-600',
        iconBg: 'bg-amber-50 dark:bg-amber-950/40',
        path: '/pari-test',
        modality: 'reflect',
        status: 'recommended',
        cta: 'Пройти тест',
      },
    ],
  },
];

export const LAYER_TAB_ACCENT: Record<DevLayer['accent'], { active: string; inactive: string }> = {
  emerald: { active: 'bg-emerald-600 text-white border-transparent shadow-md scale-105', inactive: 'bg-white dark:bg-gray-900 text-emerald-700 dark:text-emerald-300 border-slate-200 dark:border-gray-700 hover:border-slate-300' },
  blue:    { active: 'bg-blue-600 text-white border-transparent shadow-md scale-105',    inactive: 'bg-white dark:bg-gray-900 text-blue-700 dark:text-blue-300 border-slate-200 dark:border-gray-700 hover:border-slate-300' },
  violet:  { active: 'bg-violet-600 text-white border-transparent shadow-md scale-105',  inactive: 'bg-white dark:bg-gray-900 text-violet-700 dark:text-violet-300 border-slate-200 dark:border-gray-700 hover:border-slate-300' },
  amber:   { active: 'bg-amber-600 text-white border-transparent shadow-md scale-105',   inactive: 'bg-white dark:bg-gray-900 text-amber-700 dark:text-amber-300 border-slate-200 dark:border-gray-700 hover:border-slate-300' },
};