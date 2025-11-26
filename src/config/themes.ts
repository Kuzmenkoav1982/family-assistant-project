import type { ThemeConfig, ThemeType } from '@/types/family.types';

export const themes: Record<ThemeType, ThemeConfig> = {
  young: {
    name: 'Молодёжный',
    description: 'Яркие цвета и динамичный дизайн',
    ageRange: '8-20 лет',
    colors: {
      primary: 'from-purple-500 via-pink-500 to-red-500',
      secondary: 'from-blue-400 to-cyan-400',
      accent: 'from-yellow-400 to-orange-500',
      background: 'from-fuchsia-200 via-pink-200 to-rose-200',
      text: 'text-gray-900'
    },
    fontSize: {
      base: 'text-base',
      heading: 'text-4xl lg:text-6xl'
    },
    spacing: 'space-y-6',
    borderRadius: 'rounded-3xl'
  },
  
  middle: {
    name: 'Деловой',
    description: 'Сдержанные тона и бизнес-стиль',
    ageRange: '21-45 лет',
    colors: {
      primary: 'from-slate-600 to-slate-800',
      secondary: 'from-blue-600 to-indigo-700',
      accent: 'from-emerald-500 to-teal-600',
      background: 'from-slate-200 via-gray-200 to-zinc-200',
      text: 'text-slate-900'
    },
    fontSize: {
      base: 'text-base',
      heading: 'text-3xl lg:text-5xl'
    },
    spacing: 'space-y-4',
    borderRadius: 'rounded-lg'
  },
  
  senior: {
    name: 'Комфортный',
    description: 'Крупный шрифт и контрастные цвета',
    ageRange: '45-100 лет',
    colors: {
      primary: 'from-blue-700 to-blue-900',
      secondary: 'from-emerald-600 to-green-700',
      accent: 'from-amber-500 to-orange-600',
      background: 'from-amber-100 via-yellow-100 to-lime-100',
      text: 'text-gray-950'
    },
    fontSize: {
      base: 'text-lg',
      heading: 'text-5xl lg:text-7xl'
    },
    spacing: 'space-y-8',
    borderRadius: 'rounded-2xl'
  },
  
  apple: {
    name: 'Apple',
    description: 'Минималистичный дизайн в стиле Apple',
    ageRange: 'Универсальный',
    colors: {
      primary: 'from-gray-800 to-black',
      secondary: 'from-blue-500 to-blue-600',
      accent: 'from-gray-400 to-gray-600',
      background: 'from-gray-100 via-slate-100 to-zinc-100',
      text: 'text-black'
    },
    fontSize: {
      base: 'text-base',
      heading: 'text-4xl lg:text-6xl'
    },
    spacing: 'space-y-6',
    borderRadius: 'rounded-2xl'
  },
  
  mono: {
    name: 'Монохром',
    description: 'Элегантный стиль с геометрией и серыми тонами',
    ageRange: 'Премиум',
    colors: {
      primary: 'from-gray-900 to-gray-800',
      secondary: 'from-gray-700 to-gray-600',
      accent: 'from-gray-500 to-gray-400',
      background: 'from-gray-50 via-gray-100 to-gray-50',
      text: 'text-gray-900'
    },
    fontSize: {
      base: 'text-sm',
      heading: 'text-3xl lg:text-5xl'
    },
    spacing: 'space-y-3',
    borderRadius: 'rounded-none'
  },
  
  '1': {
    name: 'DVO Design',
    description: 'Премиум стиль с тёмно-синим фоном и неоновыми акцентами',
    ageRange: 'Tech & Business',
    colors: {
      primary: 'from-purple-600 via-purple-500 to-pink-500',
      secondary: 'from-indigo-600 to-purple-600',
      accent: 'from-pink-400 to-purple-400',
      background: 'from-[#0a1628] via-[#162447] to-[#1f2e4d]',
      text: 'text-white'
    },
    fontSize: {
      base: 'text-base',
      heading: 'text-5xl lg:text-7xl'
    },
    spacing: 'space-y-5',
    borderRadius: 'rounded-md'
  }
};

export const getThemeClasses = (theme: ThemeType) => {
  const config = themes[theme];
  
  return {
    background: `bg-gradient-to-br ${config.colors.background}`,
    primaryGradient: `bg-gradient-to-r ${config.colors.primary}`,
    secondaryGradient: `bg-gradient-to-r ${config.colors.secondary}`,
    accentGradient: `bg-gradient-to-r ${config.colors.accent}`,
    text: config.colors.text,
    baseFont: config.fontSize.base,
    headingFont: config.fontSize.heading,
    spacing: config.spacing,
    borderRadius: config.borderRadius
  };
};