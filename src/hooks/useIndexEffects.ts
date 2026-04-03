import { useEffect } from 'react';
import type { Reminder, ThemeType, Task } from '@/types/family.types';
import type { UseIndexStateReturn } from './useIndexState';

export interface UseIndexEffectsParams {
  state: UseIndexStateReturn;
  tasks: Task[];
  hasCompletedSetup: boolean;
  searchParams: URLSearchParams;
}

export default function useIndexEffects({ state, tasks, hasCompletedSetup, searchParams }: UseIndexEffectsParams): void {
  const {
    familyName, setFamilyName,
    familyLogo, setFamilyLogo,
    familyBanner, setFamilyBanner,
    setShowFirstLoginWelcome,
    showAssistantSelector, setShowAssistantSelector,
    showWelcome, setShowWelcome,
    setWelcomeText,
    isTopBarVisible, setIsTopBarVisible,
    autoHideTopBar,
    isLeftMenuVisible, setIsLeftMenuVisible,
    autoHideLeftMenu,
    setActiveSection,
    setChamomileEnabled,
    setSoundEnabled,
    setReminders,
    reminders,
    familyGoals,
    currentTheme, setCurrentTheme,
    appearanceMode,
    showLanguageSelector,
    showThemeSelector,
    setShowLanguageSelector,
    setShowThemeSelector,
  } = state;

  useEffect(() => {
    const loadFamilyData = () => {
      const savedFamilyName = localStorage.getItem('familyName');
      const savedFamilyLogo = localStorage.getItem('familyLogo');
      const savedFamilyBanner = localStorage.getItem('familyBanner');

      if (savedFamilyName) {
        setFamilyName(savedFamilyName);
      }

      if (savedFamilyLogo) {
        setFamilyLogo(savedFamilyLogo);
      }

      if (savedFamilyBanner) {
        setFamilyBanner(savedFamilyBanner);
      }

      const userData = localStorage.getItem('userData');
      const hasSeenWelcome = localStorage.getItem('hasSeenFirstLoginWelcome');

      if (userData) {
        try {
          const user = JSON.parse(userData);
          const hasFamilySetup = user.family_name && user.logo_url;

          if (!hasSeenWelcome && !hasFamilySetup && !savedFamilyName) {
            setShowFirstLoginWelcome(true);
            localStorage.setItem('hasSeenFirstLoginWelcome', 'true');
          }

          if (!savedFamilyName && user.family_name) {
            setFamilyName(user.family_name);
          }

          if (!savedFamilyLogo && user.logo_url) {
            setFamilyLogo(user.logo_url);
          }

          if (!savedFamilyBanner && user.banner_url) {
            setFamilyBanner(user.banner_url);
          }
        } catch (e) {
          console.error('[DEBUG Index] Error parsing userData:', e);
        }
      }
    };

    loadFamilyData();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'familyName' || e.key === 'familyLogo' || e.key === 'userData') {
        loadFamilyData();
      }
    };

    const handleCustomUpdate = () => {
      loadFamilyData();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('familySettingsUpdated', handleCustomUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('familySettingsUpdated', handleCustomUpdate);
    };
  }, []);

  useEffect(() => {
    const userData = localStorage.getItem('userData');
    let hasFamilySetup = false;

    if (userData) {
      try {
        const user = JSON.parse(userData);
        hasFamilySetup = user.family_name && user.logo_url;
      } catch (e) {
        console.error('[DEBUG Index] Error checking family setup:', e);
      }
    }

    if (!hasCompletedSetup && !hasFamilySetup) {
      const timer = setTimeout(() => {
        setShowAssistantSelector(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [hasCompletedSetup]);

  useEffect(() => {
    localStorage.setItem('familyGoals', JSON.stringify(familyGoals));
  }, [familyGoals]);

  useEffect(() => {
    if (currentTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    localStorage.setItem('familyOrganizerTheme', currentTheme);
  }, [currentTheme]);

  useEffect(() => {
    const savedTheme = localStorage.getItem('familyOrganizerTheme') as ThemeType;
    if (savedTheme && savedTheme !== currentTheme) {
      setCurrentTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    const handleThemeChange = (e: CustomEvent<ThemeType>) => {
      setCurrentTheme(e.detail);
    };

    window.addEventListener('themeChange', handleThemeChange as EventListener);
    return () => window.removeEventListener('themeChange', handleThemeChange as EventListener);
  }, []);

  useEffect(() => {
    localStorage.setItem('appearanceMode', appearanceMode);

    const applyTheme = (isDark: boolean) => {
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    if (appearanceMode === 'dark') {
      applyTheme(true);
    } else if (appearanceMode === 'light') {
      applyTheme(false);
    } else if (appearanceMode === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      applyTheme(prefersDark);
    } else if (appearanceMode === 'auto') {
      const hour = new Date().getHours();
      const isDark = hour < 6 || hour >= 20;
      applyTheme(isDark);
    }
  }, [appearanceMode]);

  useEffect(() => {
    const handleChamomileToggle = (e: any) => {
      setChamomileEnabled(e.detail);
    };
    const handleSoundToggle = (e: any) => {
      setSoundEnabled(e.detail);
    };

    window.addEventListener('chamomileToggle', handleChamomileToggle);
    window.addEventListener('soundToggle', handleSoundToggle);

    return () => {
      window.removeEventListener('chamomileToggle', handleChamomileToggle);
      window.removeEventListener('soundToggle', handleSoundToggle);
    };
  }, []);

  useEffect(() => {
    if (!tasks || !Array.isArray(tasks)) {
      setReminders([]);
      return;
    }

    const newReminders: Reminder[] = tasks
      .filter(task => !task.completed && task.reminderTime)
      .map(task => ({
        id: `reminder-${task.id}`,
        taskId: task.id,
        taskTitle: task.title,
        time: task.reminderTime!,
        notified: false
      }));
    setReminders(newReminders);
  }, [tasks]);

  useEffect(() => {
    if (!showWelcome) return;

    const fullText = `Добро пожаловать в "Наша семья"! Место, где ваша семья становится командой. Цель проекта: Сохранение семейных ценностей, повышение вовлеченности в семейную жизнь, бережная передача семейных традиций и истории семьи.`;
    let currentIndex = 0;

    const typingTimer = setInterval(() => {
      if (currentIndex <= fullText.length) {
        setWelcomeText(fullText.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(typingTimer);
      }
    }, 40);

    const hideTimer = setTimeout(() => {
      setShowWelcome(false);
      localStorage.setItem('hasSeenWelcome', 'true');
    }, 14000);

    return () => {
      clearInterval(typingTimer);
      clearTimeout(hideTimer);
    };
  }, [showWelcome]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.language-selector') && !target.closest('.theme-selector')) {
        setShowLanguageSelector(false);
        setShowThemeSelector(false);
      }
    };

    if (showLanguageSelector || showThemeSelector) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showLanguageSelector, showThemeSelector]);

  useEffect(() => {
    let hideTimer: NodeJS.Timeout;
    if (autoHideTopBar && isTopBarVisible) {
      hideTimer = setTimeout(() => {
        setIsTopBarVisible(false);
      }, 3000);
    }
    return () => clearTimeout(hideTimer);
  }, [autoHideTopBar, isTopBarVisible]);

  useEffect(() => {
    let hideTimer: NodeJS.Timeout;
    if (autoHideLeftMenu && isLeftMenuVisible) {
      hideTimer = setTimeout(() => {
        setIsLeftMenuVisible(false);
      }, 3000);
    }
    return () => clearTimeout(hideTimer);
  }, [autoHideLeftMenu, isLeftMenuVisible]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

      reminders.forEach(reminder => {
        if (reminder.time === currentTime && !reminder.notified) {
          alert(`Напоминание: ${reminder.taskTitle}`);
          setReminders(prev =>
            prev.map(r => r.id === reminder.id ? { ...r, notified: true } : r)
          );
        }
      });
    }, 60000);

    return () => clearInterval(interval);
  }, [reminders]);

  useEffect(() => {
    const sectionParam = searchParams.get('section');
    if (sectionParam) {
      setActiveSection(sectionParam);
    }
  }, [searchParams]);
}
