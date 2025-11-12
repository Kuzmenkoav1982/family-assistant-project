import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import Icon from '@/components/ui/icon';
import { useNavigate } from 'react-router-dom';
import { useTasks } from '@/hooks/useTasks';
import { useFamilyMembers } from '@/hooks/useFamilyMembers';
import type {
  FamilyMember,
  Task,
  Reminder,
  Tradition,
  FamilyValue,
  BlogPost,
  ImportantDate,
  MealVoting,
  ChildProfile,
  DevelopmentPlan,
  ChatMessage,
  FamilyAlbum,
  FamilyNeed,
  FamilyTreeMember,
  CalendarEvent,
  AIRecommendation,
  ThemeType,
} from '@/types/family.types';
import { themes, getThemeClasses } from '@/config/themes';
import {
  initialChildrenProfiles,
  initialDevelopmentPlans,
  initialImportantDates,
  initialFamilyValues,
  initialBlogPosts,
  initialTraditions,
  initialMealVotings,
  initialChatMessages,
  initialFamilyAlbum,
  initialFamilyNeeds,
  initialFamilyTree,
  initialCalendarEvents,
  initialAIRecommendations,
  getWeekDays,
} from '@/data/mockData';
import { FamilyTabsContent } from '@/components/FamilyTabsContent';
import { FamilyMembersGrid } from '@/components/FamilyMembersGrid';
import { getTranslation, type LanguageCode } from '@/translations';
import SettingsMenu from '@/components/SettingsMenu';

interface IndexProps {
  onLogout?: () => void;
}

export default function Index({ onLogout }: IndexProps) {
  const navigate = useNavigate();
  const { members: familyMembersRaw, loading: membersLoading, addMember, updateMember, deleteMember } = useFamilyMembers();
  const { tasks: tasksRaw, loading: tasksLoading, toggleTask: toggleTaskDB, createTask, updateTask, deleteTask } = useTasks();
  
  const familyMembers = familyMembersRaw || [];
  const tasks = tasksRaw || [];
  
  const [reminders, setReminders] = useState<Reminder[]>([]);
  
  const setFamilyMembers = (value: FamilyMember[] | ((prev: FamilyMember[]) => FamilyMember[])) => {
    console.warn('setFamilyMembers deprecated, use updateMember instead');
  };
  const [importantDates] = useState<ImportantDate[]>(initialImportantDates);
  const [familyValues] = useState<FamilyValue[]>(initialFamilyValues);
  const [blogPosts] = useState<BlogPost[]>(initialBlogPosts);
  const [traditions] = useState<Tradition[]>(initialTraditions);
  const [mealVotings] = useState<MealVoting[]>(initialMealVotings);
  const [childrenProfiles] = useState<ChildProfile[]>(initialChildrenProfiles);
  const [developmentPlans] = useState<DevelopmentPlan[]>(initialDevelopmentPlans);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(initialChatMessages);
  const [familyAlbum, setFamilyAlbum] = useState<FamilyAlbum[]>(initialFamilyAlbum);
  const [familyNeeds, setFamilyNeeds] = useState<FamilyNeed[]>(initialFamilyNeeds);
  const [familyTree, setFamilyTree] = useState<FamilyTreeMember[]>(initialFamilyTree);
  const [selectedTreeMember, setSelectedTreeMember] = useState<FamilyTreeMember | null>(null);
  const [aiRecommendations] = useState<AIRecommendation[]>(initialAIRecommendations);
  const [newMessage, setNewMessage] = useState('');
  const [calendarEvents] = useState<CalendarEvent[]>(initialCalendarEvents);
  const [calendarFilter, setCalendarFilter] = useState<'all' | 'personal' | 'family'>('all');
  const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>(() => {
    return (localStorage.getItem('familyOrganizerLanguage') as LanguageCode) || 'ru';
  });
  
  const t = (key: keyof typeof import('@/translations').translations.ru) => getTranslation(currentLanguage, key);
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<ThemeType>(() => {
    const saved = localStorage.getItem('familyOrganizerTheme');
    return (saved as ThemeType) || 'middle';
  });
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const [showWelcome, setShowWelcome] = useState(() => {
    const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
    return !hasSeenWelcome;
  });
  const [welcomeText, setWelcomeText] = useState('');
  const [isTopBarVisible, setIsTopBarVisible] = useState(true);
  const [autoHideTopBar, setAutoHideTopBar] = useState(() => {
    return localStorage.getItem('autoHideTopBar') === 'true';
  });
  const [isMoodWidgetVisible, setIsMoodWidgetVisible] = useState(true);
  const [autoHideMoodWidget, setAutoHideMoodWidget] = useState(() => {
    return localStorage.getItem('autoHideMoodWidget') === 'true';
  });

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const currentUser = familyMembers.find(m => m.user_id === user.id || m.id === user.member_id);
  const currentUserId = currentUser?.id || user.member_id || '';

  const handleLogoutLocal = () => {
    onLogout?.();
  };

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
    
    const fullText = "Добро пожаловать в Семейный Органайзер! Место, где ваша семья становится командой. Цель проекта: Сохранение семейных ценностей, повышение вовлеченности в семейную жизнь, бережная передача семейных традиций и истории семьи.";
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
    if (autoHideMoodWidget && isMoodWidgetVisible) {
      hideTimer = setTimeout(() => {
        setIsMoodWidgetVisible(false);
      }, 3000);
    }
    return () => clearTimeout(hideTimer);
  }, [autoHideMoodWidget, isMoodWidgetVisible]);

  const toggleAutoHide = () => {
    const newValue = !autoHideTopBar;
    setAutoHideTopBar(newValue);
    localStorage.setItem('autoHideTopBar', String(newValue));
  };

  const toggleMoodAutoHide = () => {
    const newValue = !autoHideMoodWidget;
    setAutoHideMoodWidget(newValue);
    localStorage.setItem('autoHideMoodWidget', String(newValue));
  };

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

  const toggleTask = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    const result = await toggleTaskDB(taskId);
    
    if (result?.success && !task.completed && task.assignee_id) {
      addPoints(task.assignee_id, task.points);
    }
  };

  const getNextOccurrenceDate = (task: Task): string | undefined => {
    if (!task.recurringPattern) return undefined;
    
    const now = new Date();
    const { frequency, interval, daysOfWeek, endDate } = task.recurringPattern;
    
    if (endDate && new Date(endDate) < now) return undefined;
    
    const next = new Date(now);
    
    switch (frequency) {
      case 'daily':
        next.setDate(next.getDate() + interval);
        break;
      case 'weekly':
        if (daysOfWeek && daysOfWeek.length > 0) {
          const currentDay = next.getDay();
          const sortedDays = [...daysOfWeek].sort((a, b) => a - b);
          const nextDay = sortedDays.find(d => d > currentDay) || sortedDays[0];
          const daysToAdd = nextDay > currentDay 
            ? nextDay - currentDay 
            : 7 - currentDay + nextDay;
          next.setDate(next.getDate() + daysToAdd);
        } else {
          next.setDate(next.getDate() + 7 * interval);
        }
        break;
      case 'monthly':
        next.setMonth(next.getMonth() + interval);
        break;
      case 'yearly':
        next.setFullYear(next.getFullYear() + interval);
        break;
    }
    
    return next.toISOString().split('T')[0];
  };

  const addPoints = async (memberName: string, points: number) => {
    const member = familyMembers.find(m => m.name === memberName);
    if (member) {
      const newPoints = member.points + points;
      const newLevel = Math.floor(newPoints / 100) + 1;
      await updateMember({
        id: member.id,
        points: newPoints,
        level: newLevel
      });
    }
  };

  const getWorkloadColor = (workload: number) => {
    if (workload > 70) return 'text-red-600 bg-red-50 border-red-300';
    if (workload > 50) return 'text-yellow-600 bg-yellow-50 border-yellow-300';
    return 'text-green-600 bg-green-50 border-green-300';
  };

  const getMemberById = (id: string) => {
    return familyMembers.find(m => m.id === id);
  };

  const getAISuggestedMeals = () => {
    const allFavorites = familyMembers.flatMap(m => m.foodPreferences?.favorites || []);
    const favoriteCount = allFavorites.reduce((acc, food) => {
      acc[food] = (acc[food] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    const topFavorites = Object.entries(favoriteCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    return [
      {
        name: topFavorites[0]?.[0] || 'Пицца',
        reason: `Любимое блюдо ${topFavorites[0]?.[1] || 3} членов семьи`,
        icon: '🍕'
      },
      {
        name: topFavorites[1]?.[0] || 'Паста',
        reason: `Нравится ${topFavorites[1]?.[1] || 2} членам семьи`,
        icon: '🍝'
      },
      {
        name: topFavorites[2]?.[0] || 'Салат',
        reason: `Популярно у ${topFavorites[2]?.[1] || 2} членов семьи`,
        icon: '🥗'
      }
    ];
  };

  const handleLanguageChange = (language: string) => {
    setCurrentLanguage(language);
    localStorage.setItem('familyOrganizerLanguage', language);
    setShowLanguageSelector(false);
    
    const languageNames: Record<string, string> = {
      ru: 'Русский',
      en: 'English',
      es: 'Español',
      de: 'Deutsch',
      fr: 'Français',
      zh: '中文',
      ar: 'العربية'
    };
    
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-white border-2 border-blue-500 rounded-lg shadow-2xl p-4 z-[100] animate-fade-in';
    notification.innerHTML = `
      <div class="flex items-center gap-3">
        <div class="text-2xl">🌐</div>
        <div>
          <p class="font-bold text-sm">Язык изменен</p>
          <p class="text-xs text-gray-600">Язык: ${languageNames[language]}</p>
        </div>
      </div>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transform = 'translateX(100px)';
      notification.style.transition = 'all 0.3s ease-out';
      setTimeout(() => notification.remove(), 300);
    }, 2000);
  };

  const handleThemeChange = (theme: ThemeType) => {
    setCurrentTheme(theme);
    localStorage.setItem('familyOrganizerTheme', theme);
    setShowThemeSelector(false);
    
    const themeNames: Record<ThemeType, string> = {
      young: 'Молодёжный',
      middle: 'Деловой',
      senior: 'Комфортный',
      apple: 'Apple'
    };
    
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-white border-2 border-indigo-500 rounded-lg shadow-2xl p-4 z-[100] animate-fade-in';
    notification.innerHTML = `
      <div class="flex items-center gap-3">
        <div class="text-2xl">🎨</div>
        <div>
          <p class="font-bold text-sm">Тема изменена</p>
          <p class="text-xs text-gray-600">Стиль: ${themeNames[theme]}</p>
        </div>
      </div>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transform = 'translateX(100px)';
      notification.style.transition = 'all 0.3s ease-out';
      setTimeout(() => notification.remove(), 300);
    }, 2000);
  };

  const handleFeedbackButton = (type: 'will_use' | 'not_interested') => {
    const stats = JSON.parse(localStorage.getItem('feedbackStats') || '{}');
    stats[type] = (stats[type] || 0) + 1;
    stats.timestamp = new Date().toISOString();
    localStorage.setItem('feedbackStats', JSON.stringify(stats));
    
    alert(type === 'will_use' 
      ? '✅ Спасибо! Ваше мнение очень важно для нас!' 
      : 'Спасибо за обратную связь! Мы будем работать над улучшением проекта.');
  };

  const exportStatsToCSV = () => {
    const stats = JSON.parse(localStorage.getItem('feedbackStats') || '{}');
    const willUse = stats.will_use || 0;
    const notInterested = stats.not_interested || 0;
    const total = willUse + notInterested;
    const willUsePercent = total > 0 ? ((willUse / total) * 100).toFixed(2) : '0';
    const notInterestedPercent = total > 0 ? ((notInterested / total) * 100).toFixed(2) : '0';
    const timestamp = stats.timestamp || new Date().toISOString();
    
    const csvContent = [
      ['Семейный Органайзер - Статистика обратной связи'],
      ['Дата экспорта:', new Date().toLocaleString('ru-RU')],
      ['Последнее обновление:', new Date(timestamp).toLocaleString('ru-RU')],
      [''],
      ['Тип отзыва', 'Количество', 'Процент'],
      ['Буду использовать', willUse.toString(), willUsePercent + '%'],
      ['Не интересно', notInterested.toString(), notInterestedPercent + '%'],
      ['Всего откликов', total.toString(), '100%'],
      [''],
      ['Детальная информация:'],
      ['Положительных откликов:', willUse.toString()],
      ['Отрицательных откликов:', notInterested.toString()],
      ['Процент заинтересованности:', willUsePercent + '%'],
      ['Процент незаинтересованности:', notInterestedPercent + '%']
    ]
      .map(row => row.join(','))
      .join('\n');
    
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `family-organizer-stats-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-white border-2 border-green-500 rounded-lg shadow-2xl p-4 z-[100] animate-fade-in';
    notification.innerHTML = `
      <div class="flex items-center gap-3">
        <div class="text-2xl">✅</div>
        <div>
          <p class="font-bold text-sm">Статистика экспортирована</p>
          <p class="text-xs text-gray-600">Файл CSV сохранён</p>
        </div>
      </div>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transform = 'translateY(-20px)';
      notification.style.transition = 'all 0.3s ease-out';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  };

  const themeClasses = getThemeClasses(currentTheme);

  const totalPoints = familyMembers.reduce((sum, member) => sum + member.points, 0);
  const avgWorkload = familyMembers.length > 0 
    ? Math.round(familyMembers.reduce((sum, member) => sum + member.workload, 0) / familyMembers.length)
    : 0;
  const completedTasks = (tasks || []).filter(t => t.completed).length;
  const totalTasks = (tasks || []).length;

  if (membersLoading || tasksLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Загрузка данных семьи...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {showWelcome && (
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-orange-100 via-pink-100 to-purple-100 animate-fade-in cursor-pointer"
          onClick={() => {
            setShowWelcome(false);
            localStorage.setItem('hasSeenWelcome', 'true');
          }}
        >
          <div className="absolute inset-0 bg-white/40 backdrop-blur-sm"></div>
          
          <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
            <div className="mb-8 animate-bounce-slow">
              <div className="text-9xl mb-4">👨‍👩‍👧‍👦</div>
            </div>
            
            <div className="space-y-6">
              <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-orange-600 via-pink-600 to-purple-600 bg-clip-text text-transparent mb-6 animate-fade-in">
                Семейный Органайзер
              </h1>
              
              <div className="min-h-[200px] flex items-center justify-center px-4">
                <p className="text-xl md:text-2xl text-gray-700 font-medium leading-relaxed max-w-3xl">
                  {welcomeText}
                  <span className="inline-block w-1 h-7 bg-purple-600 ml-1 animate-pulse"></span>
                </p>
              </div>
              
              <div className="flex justify-center gap-4 mt-12 animate-fade-in" style={{ animationDelay: '3s' }}>
                <div className="flex items-center gap-2 text-orange-600">
                  <Icon name="Heart" className="animate-pulse" size={24} />
                  <span className="text-lg font-semibold">Любовь</span>
                </div>
                <div className="flex items-center gap-2 text-pink-600">
                  <Icon name="Users" className="animate-pulse" size={24} style={{ animationDelay: '0.2s' }} />
                  <span className="text-lg font-semibold">Команда</span>
                </div>
                <div className="flex items-center gap-2 text-purple-600">
                  <Icon name="Sparkles" className="animate-pulse" size={24} style={{ animationDelay: '0.4s' }} />
                  <span className="text-lg font-semibold">Традиции</span>
                </div>
              </div>
              
              <p className="text-sm text-gray-500 mt-8 animate-fade-in" style={{ animationDelay: '4s' }}>
                Нажмите в любом месте, чтобы продолжить
              </p>
            </div>
          </div>
        </div>
      )}
      
      <div className={`min-h-screen ${themeClasses.background} ${themeClasses.baseFont} transition-all duration-700 ease-in-out ${currentTheme === 'mono' ? 'theme-mono' : ''}`}>
        <div 
          className={`fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-lg transition-transform duration-300 ${
            isTopBarVisible ? 'translate-y-0' : '-translate-y-full'
          }`}
          onMouseEnter={() => autoHideTopBar && setIsTopBarVisible(true)}
        >
          <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Button
                onClick={handleLogoutLocal}
                variant="ghost"
                size="sm"
                className="h-9 w-9 p-0"
                title="Выход"
              >
                <Icon name="LogOut" size={18} />
              </Button>
              
              <SettingsMenu />
              
              <Button
                onClick={() => navigate('/instructions')}
                variant="ghost"
                size="sm"
                className="h-9 w-9 p-0"
                title="Инструкции"
              >
                <Icon name="BookOpen" size={18} />
              </Button>
            </div>
            
            <div className="flex items-center gap-2 language-selector theme-selector relative">
              <Button
                onClick={() => {
                  setShowLanguageSelector(!showLanguageSelector);
                  setShowThemeSelector(false);
                }}
                variant="ghost"
                size="sm"
                className="h-9 w-9 p-0"
                title="Выбор языка"
              >
                <Icon name="Languages" size={18} />
              </Button>
              
              <Button
                onClick={() => {
                  setShowThemeSelector(!showThemeSelector);
                  setShowLanguageSelector(false);
                }}
                variant="ghost"
                size="sm"
                className="h-9 w-9 p-0"
                title="Выбор стиля"
              >
                <Icon name="Palette" size={18} />
              </Button>
              
              <Button
                onClick={toggleAutoHide}
                variant="ghost"
                size="sm"
                className={`h-9 w-9 p-0 ${autoHideTopBar ? 'text-blue-600' : 'text-gray-400'}`}
                title={autoHideTopBar ? 'Автоскрытие включено' : 'Автоскрытие выключено'}
              >
                <Icon name={autoHideTopBar ? 'EyeOff' : 'Eye'} size={18} />
              </Button>
              
              {showLanguageSelector && (
                <Card className="language-selector absolute right-0 top-full mt-2 z-50 w-80 max-w-[calc(100vw-2rem)] border-2 border-blue-300 shadow-2xl animate-fade-in">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Icon name="Languages" size={20} />
                      {t('selectLanguage')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {[
                      { code: 'ru', name: 'Русский', flag: '🇷🇺' },
                      { code: 'en', name: 'English', flag: '🇬🇧' },
                      { code: 'es', name: 'Español', flag: '🇪🇸' },
                      { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
                      { code: 'fr', name: 'Français', flag: '🇫🇷' },
                      { code: 'zh', name: '中文', flag: '🇨🇳' },
                      { code: 'ar', name: 'العربية', flag: '🇸🇦' }
                    ].map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => handleLanguageChange(lang.code)}
                        className={`w-full text-left p-3 rounded-lg border-2 transition-all hover:shadow-lg ${
                          currentLanguage === lang.code 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200 hover:border-blue-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{lang.flag}</span>
                            <span className="font-medium">{lang.name}</span>
                          </div>
                          {currentLanguage === lang.code && (
                            <Icon name="Check" className="text-blue-600" size={20} />
                          )}
                        </div>
                      </button>
                    ))}
                  </CardContent>
                </Card>
              )}
              
              {showThemeSelector && (
                <Card className="theme-selector absolute right-0 top-full mt-2 z-50 w-80 max-w-[calc(100vw-2rem)] border-2 border-indigo-300 shadow-2xl animate-fade-in">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Icon name="Palette" size={20} />
                      {t('selectStyle')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {(Object.keys(themes) as ThemeType[]).map((themeKey) => {
                      const theme = themes[themeKey];
                      return (
                        <button
                          key={themeKey}
                          onClick={() => handleThemeChange(themeKey)}
                          className={`w-full text-left p-4 rounded-lg border-2 transition-all hover:shadow-lg ${
                            currentTheme === themeKey 
                              ? 'border-indigo-500 bg-indigo-50' 
                              : 'border-gray-200 hover:border-indigo-300'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-bold">{theme.name}</h4>
                            {currentTheme === themeKey && (
                              <Icon name="Check" className="text-indigo-600" size={20} />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">{theme.description}</p>
                          <Badge variant="outline" className="text-xs">{theme.ageRange}</Badge>
                        </button>
                      );
                    })}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
        
        <button
          onClick={() => setIsTopBarVisible(!isTopBarVisible)}
          className="fixed top-0 left-1/2 -translate-x-1/2 z-40 bg-white/90 hover:bg-white shadow-md rounded-b-lg px-4 py-1 transition-all duration-300"
          style={{ top: isTopBarVisible ? '52px' : '0px' }}
        >
          <Icon name={isTopBarVisible ? 'ChevronUp' : 'ChevronDown'} size={20} className="text-gray-600" />
        </button>

        <div 
          className={`fixed right-0 top-20 z-40 bg-white/95 backdrop-blur-md shadow-lg transition-transform duration-300 ${
            isMoodWidgetVisible ? 'translate-x-0' : 'translate-x-full'
          }`}
          onMouseEnter={() => autoHideMoodWidget && setIsMoodWidgetVisible(true)}
          style={{ maxWidth: '320px', width: '100%' }}
        >
          <div className="p-3 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Icon name="Smile" size={16} />
              Настроение семьи
            </h3>
            <div className="flex items-center gap-1">
              <Button
                onClick={toggleMoodAutoHide}
                variant="ghost"
                size="sm"
                className={`h-7 w-7 p-0 ${autoHideMoodWidget ? 'text-blue-600' : 'text-gray-400'}`}
                title={autoHideMoodWidget ? 'Автоскрытие включено' : 'Автоскрытие выключено'}
              >
                <Icon name={autoHideMoodWidget ? 'EyeOff' : 'Eye'} size={14} />
              </Button>
              <Button
                onClick={() => setIsMoodWidgetVisible(false)}
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
              >
                <Icon name="X" size={14} />
              </Button>
            </div>
          </div>
          <div className="p-3 space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto">
            {familyMembers.map((member, index) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-all animate-fade-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex items-center gap-2">
                  <div className="text-2xl">{member.avatar}</div>
                  <div>
                    <p className="text-xs font-medium">{member.name}</p>
                    <p className="text-[10px] text-gray-500">{member.role}</p>
                  </div>
                </div>
                <div className="text-center">
                  {member.moodStatus ? (
                    <>
                      <div className="text-xl">{member.moodStatus.emoji}</div>
                      <p className="text-[9px] text-gray-500">{member.moodStatus.label}</p>
                    </>
                  ) : (
                    <div className="text-xl opacity-30">😐</div>
                  )}
                </div>
              </div>
            ))}
            {familyMembers.length === 0 && (
              <p className="text-xs text-gray-500 text-center py-4">
                Нет данных о членах семьи
              </p>
            )}
          </div>
        </div>
        
        <button
          onClick={() => setIsMoodWidgetVisible(!isMoodWidgetVisible)}
          className="fixed right-0 top-1/2 -translate-y-1/2 z-40 bg-white/90 hover:bg-white shadow-md rounded-l-lg py-4 px-2 transition-all duration-300"
          style={{ right: isMoodWidgetVisible ? '320px' : '0px' }}
        >
          <Icon name={isMoodWidgetVisible ? 'ChevronRight' : 'ChevronLeft'} size={20} className="text-gray-600" />
        </button>

        <div className="max-w-7xl mx-auto space-y-6 animate-fade-in p-4 lg:p-8" style={{ paddingTop: '4rem' }}>
        <header className="text-center mb-8 relative">
          <h1 className={`${themeClasses.headingFont} text-3xl lg:text-4xl font-bold bg-gradient-to-r ${themeClasses.primaryGradient.replace('bg-gradient-to-r ', '')} bg-clip-text text-transparent mb-3 mt-2 animate-fade-in`}>
            Семейный Органайзер
          </h1>
          
          <p className="text-lg lg:text-xl text-muted-foreground animate-fade-in" style={{ animationDelay: '0.2s' }}>
            Управление семейной жизнью с AI-помощником
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="animate-fade-in hover:shadow-lg transition-all border-l-4 border-l-orange-500" style={{ animationDelay: '0.1s' }}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Всего баллов</CardTitle>
              <Icon name="Award" className="text-orange-500" size={20} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">{totalPoints}</div>
            </CardContent>
          </Card>

          <Card className="animate-fade-in hover:shadow-lg transition-all border-l-4 border-l-pink-500" style={{ animationDelay: '0.2s' }}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Средняя загрузка</CardTitle>
              <Icon name="TrendingUp" className="text-pink-500" size={20} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-pink-600">{avgWorkload}%</div>
            </CardContent>
          </Card>

          <Card className="animate-fade-in hover:shadow-lg transition-all border-l-4 border-l-purple-500" style={{ animationDelay: '0.3s' }}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Задачи выполнены</CardTitle>
              <Icon name="CheckCircle2" className="text-purple-500" size={20} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">{completedTasks}/{totalTasks}</div>
            </CardContent>
          </Card>

          <Card className="animate-fade-in hover:shadow-lg transition-all border-l-4 border-l-blue-500" style={{ animationDelay: '0.4s' }}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Членов семьи</CardTitle>
              <Icon name="Users" className="text-blue-500" size={20} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{familyMembers.length}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Tabs defaultValue="members" className="space-y-6">
              <TabsList className="flex flex-wrap gap-2 h-auto p-2 bg-white/50 backdrop-blur-sm justify-start">
                <TabsTrigger value="members" className="text-xs lg:text-sm py-2 px-3 whitespace-nowrap">
                  <Icon name="Users" className="mr-1" size={14} />
                  Семья
                </TabsTrigger>
                <TabsTrigger value="tasks" className="text-xs lg:text-sm py-2 px-3 whitespace-nowrap">
                  <Icon name="CheckSquare" className="mr-1" size={14} />
                  Задачи
                </TabsTrigger>
                <TabsTrigger value="needs" className="text-xs lg:text-sm py-2 px-3 whitespace-nowrap">
                  <Icon name="ListTodo" className="mr-1" size={14} />
                  Потребности
                </TabsTrigger>
                <TabsTrigger value="chat" className="text-xs lg:text-sm py-2 px-3 whitespace-nowrap">
                  <Icon name="MessageSquare" className="mr-1" size={14} />
                  Чат
                </TabsTrigger>
                <TabsTrigger value="tree" className="text-xs lg:text-sm py-2 px-3 whitespace-nowrap">
                  <Icon name="Network" className="mr-1" size={14} />
                  Древо
                </TabsTrigger>
                <TabsTrigger value="profiles" className="text-xs lg:text-sm py-2 px-3 whitespace-nowrap">
                  <Icon name="UserCircle" className="mr-1" size={14} />
                  Профили
                </TabsTrigger>
                <TabsTrigger value="calendar" className="text-xs lg:text-sm py-2 px-3 whitespace-nowrap">
                  <Icon name="Calendar" className="mr-1" size={14} />
                  Календарь
                </TabsTrigger>
                <Button
                  onClick={() => navigate('/community')}
                  variant="outline"
                  className="text-xs lg:text-sm py-2 px-3 whitespace-nowrap border-purple-300 bg-purple-50 hover:bg-purple-100"
                >
                  <Icon name="Users" className="mr-1" size={14} />
                  Сообщество
                </Button>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={() => navigate('/garage')}
                      variant="outline"
                      className="text-xs lg:text-sm py-2 px-3 whitespace-nowrap border-amber-300 bg-amber-50 hover:bg-amber-100"
                    >
                      <Icon name="Car" className="mr-1" size={14} />
                      Гараж
                      <Badge className="ml-2 bg-amber-500 text-white text-[10px] px-1 py-0">DEV</Badge>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="font-medium">🚧 Раздел в разработке</p>
                    <p className="text-xs text-muted-foreground">Нажмите чтобы узнать подробнее</p>
                  </TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={() => navigate('/health')}
                      variant="outline"
                      className="text-xs lg:text-sm py-2 px-3 whitespace-nowrap border-amber-300 bg-amber-50 hover:bg-amber-100"
                    >
                      <Icon name="Heart" className="mr-1" size={14} />
                      Здоровье
                      <Badge className="ml-2 bg-amber-500 text-white text-[10px] px-1 py-0">DEV</Badge>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="font-medium">🚧 Раздел в разработке</p>
                    <p className="text-xs text-muted-foreground">Нажмите чтобы узнать подробнее</p>
                  </TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={() => navigate('/finance')}
                      variant="outline"
                      className="text-xs lg:text-sm py-2 px-3 whitespace-nowrap border-amber-300 bg-amber-50 hover:bg-amber-100"
                    >
                      <Icon name="Wallet" className="mr-1" size={14} />
                      Финансы
                      <Badge className="ml-2 bg-amber-500 text-white text-[10px] px-1 py-0">DEV</Badge>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="font-medium">🚧 Раздел в разработке</p>
                    <p className="text-xs text-muted-foreground">Нажмите чтобы узнать подробнее</p>
                  </TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={() => navigate('/education')}
                      variant="outline"
                      className="text-xs lg:text-sm py-2 px-3 whitespace-nowrap border-amber-300 bg-amber-50 hover:bg-amber-100"
                    >
                      <Icon name="GraduationCap" className="mr-1" size={14} />
                      Образование
                      <Badge className="ml-2 bg-amber-500 text-white text-[10px] px-1 py-0">DEV</Badge>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="font-medium">🚧 Раздел в разработке</p>
                    <p className="text-xs text-muted-foreground">Нажмите чтобы узнать подробнее</p>
                  </TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={() => navigate('/travel')}
                      variant="outline"
                      className="text-xs lg:text-sm py-2 px-3 whitespace-nowrap border-amber-300 bg-amber-50 hover:bg-amber-100"
                    >
                      <Icon name="Plane" className="mr-1" size={14} />
                      Путешествия
                      <Badge className="ml-2 bg-amber-500 text-white text-[10px] px-1 py-0">DEV</Badge>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="font-medium">🚧 Раздел в разработке</p>
                    <p className="text-xs text-muted-foreground">Нажмите чтобы узнать подробнее</p>
                  </TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={() => navigate('/pets')}
                      variant="outline"
                      className="text-xs lg:text-sm py-2 px-3 whitespace-nowrap border-amber-300 bg-amber-50 hover:bg-amber-100"
                    >
                      <Icon name="PawPrint" className="mr-1" size={14} />
                      Питомцы
                      <Badge className="ml-2 bg-amber-500 text-white text-[10px] px-1 py-0">DEV</Badge>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="font-medium">🚧 Раздел в разработке</p>
                    <p className="text-xs text-muted-foreground">Нажмите чтобы узнать подробнее</p>
                  </TooltipContent>
                </Tooltip>
                
                <TabsTrigger value="traditions" className="text-xs lg:text-sm py-2 px-3 whitespace-nowrap">
                  <Icon name="Calendar" className="mr-1" size={14} />
                  Традиции
                </TabsTrigger>
                <TabsTrigger value="values" className="text-xs lg:text-sm py-2 px-3 whitespace-nowrap">
                  <Icon name="Sparkles" className="mr-1" size={14} />
                  Ценности
                </TabsTrigger>
                <TabsTrigger value="dates" className="text-xs lg:text-sm py-2 px-3 whitespace-nowrap">
                  <Icon name="Heart" className="mr-1" size={14} />
                  Даты
                </TabsTrigger>
                <TabsTrigger value="meals" className="text-xs lg:text-sm py-2 px-3 whitespace-nowrap">
                  <Icon name="ChefHat" className="mr-1" size={14} />
                  Меню
                </TabsTrigger>
                <TabsTrigger value="album" className="text-xs lg:text-sm py-2 px-3 whitespace-nowrap">
                  <Icon name="Image" className="mr-1" size={14} />
                  Альбом
                </TabsTrigger>
                <TabsTrigger value="development" className="text-xs lg:text-sm py-2 px-3 whitespace-nowrap">
                  <Icon name="GraduationCap" className="mr-1" size={14} />
                  Развитие
                </TabsTrigger>
                <TabsTrigger value="ai" className="text-xs lg:text-sm py-2 px-3 whitespace-nowrap">
                  <Icon name="Sparkles" className="mr-1" size={14} />
                  ИИ Здоровье
                </TabsTrigger>
                <TabsTrigger value="rating" className="text-xs lg:text-sm py-2 px-3 whitespace-nowrap">
                  <Icon name="Trophy" className="mr-1" size={14} />
                  Рейтинг
                </TabsTrigger>
                <TabsTrigger value="stats" className="text-xs lg:text-sm py-2 px-3 whitespace-nowrap">
                  <Icon name="BarChart3" className="mr-1" size={14} />
                  Статистика
                </TabsTrigger>
                <TabsTrigger value="community" className="text-xs lg:text-sm py-2 px-3 whitespace-nowrap">
                  <Icon name="BookOpen" className="mr-1" size={14} />
                  Блог
                </TabsTrigger>
                <TabsTrigger value="payment" className="text-xs lg:text-sm py-2 px-3 whitespace-nowrap">
                  <Icon name="CreditCard" className="mr-1" size={14} />
                  Оплата
                </TabsTrigger>
                <TabsTrigger value="feedback" className="text-xs lg:text-sm py-2 px-3 whitespace-nowrap">
                  <Icon name="MessageSquare" className="mr-1" size={14} />
                  Тех. поддержка
                </TabsTrigger>
                <TabsTrigger value="alice" className="text-xs lg:text-sm py-2 px-3 whitespace-nowrap">
                  <Icon name="Mic" className="mr-1" size={14} />
                  Алиса
                </TabsTrigger>
              </TabsList>

              <TabsContent value="profiles">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Icon name="UserCircle" />
                      Профили членов семьи
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <FamilyMembersGrid 
                      members={familyMembers}
                      onMemberClick={(member) => navigate(`/member/${member.id}`)}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="calendar">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Icon name="Calendar" />
                        Календарь событий
                      </CardTitle>
                      <Tabs value={calendarFilter} onValueChange={(v) => setCalendarFilter(v as any)}>
                        <TabsList>
                          <TabsTrigger value="all">Все</TabsTrigger>
                          <TabsTrigger value="personal">Мои</TabsTrigger>
                          <TabsTrigger value="family">Семейные</TabsTrigger>
                        </TabsList>
                      </Tabs>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {calendarEvents
                        .filter(event => {
                          if (calendarFilter === 'all') return true;
                          if (calendarFilter === 'personal') return event.createdBy === currentUserId;
                          if (calendarFilter === 'family') return event.visibility === 'family';
                          return true;
                        })
                        .map((event, index) => (
                          <div key={event.id} className={`p-4 rounded-lg ${event.color} animate-fade-in`} style={{ animationDelay: `${index * 0.1}s` }}>
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="font-bold text-lg">{event.title}</h4>
                                <p className="text-sm text-muted-foreground">{event.description}</p>
                                <div className="flex items-center gap-2 mt-2 text-sm">
                                  <Badge variant="outline">{event.category}</Badge>
                                  <span className="flex items-center gap-1">
                                    <Icon name="Clock" size={14} />
                                    {event.time}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Icon name="Calendar" size={14} />
                                    {new Date(event.date).toLocaleDateString('ru-RU')}
                                  </span>
                                </div>
                              </div>
                              <div className="text-3xl">{event.createdByAvatar}</div>
                            </div>
                          </div>
                        ))}
                      {calendarEvents.filter(event => {
                        if (calendarFilter === 'all') return true;
                        if (calendarFilter === 'personal') return event.createdBy === currentUserId;
                        if (calendarFilter === 'family') return event.visibility === 'family';
                        return true;
                      }).length === 0 && (
                        <p className="text-center text-muted-foreground py-8">
                          Нет событий в этом фильтре
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <FamilyTabsContent
                familyMembers={familyMembers}
                setFamilyMembers={setFamilyMembers}
                tasks={tasks}
                setTasks={() => console.warn('setTasks deprecated, tasks managed by useTasks hook')}
                traditions={traditions}
                familyValues={familyValues}
                blogPosts={blogPosts}
                importantDates={importantDates}
                mealVotings={mealVotings}
                childrenProfiles={childrenProfiles}
                developmentPlans={developmentPlans}
                chatMessages={chatMessages}
                setChatMessages={setChatMessages}
                familyAlbum={familyAlbum}
                setFamilyAlbum={setFamilyAlbum}
                familyNeeds={familyNeeds}
                setFamilyNeeds={setFamilyNeeds}
                familyTree={familyTree}
                setFamilyTree={setFamilyTree}
                selectedTreeMember={selectedTreeMember}
                setSelectedTreeMember={setSelectedTreeMember}
                aiRecommendations={aiRecommendations}
                selectedUserId={currentUserId}
                newMessage={newMessage}
                setNewMessage={setNewMessage}
                toggleTask={toggleTask}
                addPoints={addPoints}
                getWorkloadColor={getWorkloadColor}
                getMemberById={getMemberById}
                getAISuggestedMeals={getAISuggestedMeals}
                exportStatsToCSV={exportStatsToCSV}
              />
            </Tabs>
          </div>

          <div className="space-y-6">
            <Card className="animate-fade-in border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50" style={{ animationDelay: '0.5s' }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Calendar" size={24} />
                  Календарь на неделю
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {getWeekDays().map((day, index) => {
                    const dayEvents = calendarEvents.filter(event => event.date === day.fullDate);
                    return (
                      <div
                        key={index}
                        className={`p-3 rounded-lg border-2 transition-all hover:shadow-md ${
                          index === 0 
                            ? 'bg-gradient-to-r from-purple-100 to-pink-100 border-purple-300' 
                            : 'bg-white border-gray-200 hover:border-purple-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                              index === 0 ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-600'
                            }`}>
                              {day.date}
                            </div>
                            <span className={`font-semibold ${index === 0 ? 'text-purple-700' : 'text-gray-700'}`}>
                              {day.day}
                            </span>
                          </div>
                          {dayEvents.length > 0 && (
                            <Badge variant="secondary" className="text-xs">
                              {dayEvents.length} событий
                            </Badge>
                          )}
                        </div>
                        {dayEvents.length > 0 && (
                          <div className="space-y-1 mt-2">
                            {dayEvents.map(event => (
                              <div key={event.id} className={`text-xs p-2 rounded ${event.color} border`}>
                                <div className="flex items-center gap-1">
                                  <Icon name="Clock" size={12} />
                                  <span className="font-semibold">{event.time}</span>
                                </div>
                                <p className="font-medium mt-1">{event.title}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card className="animate-fade-in border-orange-200 bg-gradient-to-br from-orange-50 to-yellow-50" style={{ animationDelay: '0.6s' }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Bell" size={24} />
                  Напоминания
                </CardTitle>
              </CardHeader>
              <CardContent>
                {reminders.length > 0 ? (
                  <div className="space-y-2">
                    {reminders.filter(r => !r.notified).map(reminder => (
                      <div key={reminder.id} className="p-3 bg-white border-2 border-orange-300 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <Icon name="Clock" size={16} className="text-orange-500" />
                          <span className="font-semibold text-orange-700">{reminder.time}</span>
                        </div>
                        <p className="text-sm">{reminder.taskTitle}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Нет активных напоминаний
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="animate-fade-in border-green-200 bg-gradient-to-br from-green-50 to-emerald-50" style={{ animationDelay: '0.7s' }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Sparkles" size={24} />
                  AI Советы
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-white border-2 border-green-300 rounded-lg">
                    <p className="text-sm font-semibold text-green-700 mb-1">Баланс нагрузки</p>
                    <p className="text-xs text-muted-foreground">
                      {avgWorkload > 60 
                        ? 'Рекомендуем перераспределить задачи для снижения нагрузки'
                        : 'Отличный баланс! Все члены семьи вовлечены равномерно'
                      }
                    </p>
                  </div>
                  <div className="p-3 bg-white border-2 border-blue-300 rounded-lg">
                    <p className="text-sm font-semibold text-blue-700 mb-1">Семейное время</p>
                    <p className="text-xs text-muted-foreground">
                      Не забудьте про воскресный семейный обед!
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}