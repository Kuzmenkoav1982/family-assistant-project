import { useState } from 'react';
import type { ThemeType } from '@/types/family.types';
import type { LanguageCode } from '@/translations';

export default function useAppearanceState() {
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [showThemeSelector, setShowThemeSelector] = useState(false);

  const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>(() => {
    return (localStorage.getItem('familyOrganizerLanguage') as LanguageCode) || 'ru';
  });

  const [currentTheme, setCurrentTheme] = useState<ThemeType>(() => {
    const saved = localStorage.getItem('familyOrganizerTheme');
    return (saved as ThemeType) || 'middle';
  });

  const [appearanceMode, setAppearanceMode] = useState<'light' | 'dark' | 'system' | 'auto'>(() => {
    return (localStorage.getItem('appearanceMode') as 'light' | 'dark' | 'system' | 'auto') || 'light';
  });

  const [chamomileEnabled, setChamomileEnabled] = useState(() => localStorage.getItem('chamomileEnabled') === 'true');
  const [soundEnabled, setSoundEnabled] = useState(() => localStorage.getItem('soundEnabled') === 'true');

  return {
    showLanguageSelector, setShowLanguageSelector,
    showThemeSelector, setShowThemeSelector,
    currentLanguage, setCurrentLanguage,
    currentTheme, setCurrentTheme,
    appearanceMode, setAppearanceMode,
    chamomileEnabled, setChamomileEnabled,
    soundEnabled, setSoundEnabled,
  };
}
