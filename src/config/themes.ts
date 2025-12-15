import type { ThemeConfig, ThemeType } from '@/types/family.types';

export const themes: Record<ThemeType, ThemeConfig> = {
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
  
  dark: {
    name: 'Тёмная',
    description: 'Полноценная тёмная тема с чёрным фоном',
    ageRange: 'Ночной режим',
    colors: {
      primary: 'from-gray-200 to-white',
      secondary: 'from-blue-400 to-cyan-400',
      accent: 'from-purple-400 to-pink-400',
      background: 'from-[#000000] via-[#0a0a0a] to-[#000000]',
      text: 'text-white'
    },
    fontSize: {
      base: 'text-base',
      heading: 'text-4xl lg:text-6xl'
    },
    spacing: 'space-y-6',
    borderRadius: 'rounded-2xl'
  }
};

export const getThemeClasses = (theme: ThemeType) => {
  const config = themes[theme] || themes.middle;
  
  if (!themes[theme]) {
    console.warn(`[getThemeClasses] Theme "${theme}" not found, using "middle" as fallback`);
  }
  
  const isDark = theme === 'dark';
  
  return {
    background: `bg-gradient-to-br ${config.colors.background}`,
    gradient: `linear-gradient(135deg, var(--tw-gradient-stops))`,
    primaryGradient: `bg-gradient-to-r ${config.colors.primary}`,
    secondaryGradient: `bg-gradient-to-r ${config.colors.secondary}`,
    accentGradient: `bg-gradient-to-r ${config.colors.accent}`,
    text: config.colors.text,
    baseFont: config.fontSize.base,
    headingFont: config.fontSize.heading,
    spacing: config.spacing,
    borderRadius: config.borderRadius,
    sidebarBg: isDark ? 'rgba(17, 17, 17, 0.95)' : 'rgba(255, 255, 255, 0.9)',
    border: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
    cardBg: isDark ? 'bg-[#1a1a1a]/90' : 'bg-white/90',
    inputBg: isDark ? 'bg-[#2a2a2a]' : 'bg-white',
    isDark
  };
};