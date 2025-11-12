import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
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
  
  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    
    const currentUser = getMemberById(currentUserId);
    if (!currentUser) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      senderId: currentUserId,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      content: newMessage,
      timestamp: new Date().toLocaleString('ru-RU', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }),
      type: 'text'
    };

    setChatMessages([...chatMessages, message]);
    setNewMessage('');
  };
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
  const [selectedMemberForMood, setSelectedMemberForMood] = useState<string | null>(null);
  const [isLeftMenuVisible, setIsLeftMenuVisible] = useState(true);
  const [autoHideLeftMenu, setAutoHideLeftMenu] = useState(() => {
    return localStorage.getItem('autoHideLeftMenu') === 'true';
  });
  const [activeSection, setActiveSection] = useState<string>('tasks');
  const [showInDevelopment, setShowInDevelopment] = useState(false);

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

  useEffect(() => {
    let hideTimer: NodeJS.Timeout;
    if (autoHideLeftMenu && isLeftMenuVisible) {
      hideTimer = setTimeout(() => {
        setIsLeftMenuVisible(false);
      }, 3000);
    }
    return () => clearTimeout(hideTimer);
  }, [autoHideLeftMenu, isLeftMenuVisible]);

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

  const toggleLeftMenuAutoHide = () => {
    const newValue = !autoHideLeftMenu;
    setAutoHideLeftMenu(newValue);
    localStorage.setItem('autoHideLeftMenu', String(newValue));
  };

  const menuSections = [
    { id: 'tasks', icon: 'CheckSquare', label: 'Задачи', ready: true },
    { id: 'calendar', icon: 'Calendar', label: 'Календарь', ready: true },
    { id: 'family', icon: 'Users', label: 'Семья', ready: true },
    { id: 'children', icon: 'Baby', label: 'Дети', ready: true },
    { id: 'values', icon: 'Heart', label: 'Ценности', ready: true },
    { id: 'traditions', icon: 'Sparkles', label: 'Традиции', ready: true },
    { id: 'rules', icon: 'Scale', label: 'Правила', ready: true },
    { id: 'blog', icon: 'BookOpen', label: 'Блог', ready: true },
    { id: 'album', icon: 'Image', label: 'Альбом', ready: true },
    { id: 'tree', icon: 'GitBranch', label: 'Древо', ready: true },
    { id: 'chat', icon: 'MessageCircle', label: 'Чат', ready: true },
    { id: 'about', icon: 'Info', label: 'О проекте', ready: true },
  ];
  
  const getSectionTitle = (sectionId: string) => {
    const section = menuSections.find(s => s.id === sectionId);
    return section?.label || 'Семейный Органайзер';
  };

  const inDevelopmentSections = [
    { id: 'budget', icon: 'Wallet', label: 'Бюджет', votes: { up: 12, down: 3 } },
    { id: 'health', icon: 'HeartPulse', label: 'Здоровье', votes: { up: 8, down: 1 } },
    { id: 'education', icon: 'GraduationCap', label: 'Обучение', votes: { up: 15, down: 2 } },
    { id: 'travel', icon: 'Plane', label: 'Путешествия', votes: { up: 20, down: 5 } },
    { id: 'shopping', icon: 'ShoppingBag', label: 'Покупки', votes: { up: 6, down: 4 } },
    { id: 'recipes', icon: 'ChefHat', label: 'Рецепты', votes: { up: 11, down: 2 } },
  ];

  const moodOptions = [
    { emoji: '😊', label: 'Отлично' },
    { emoji: '😃', label: 'Хорошо' },
    { emoji: '😐', label: 'Нормально' },
    { emoji: '😔', label: 'Грустно' },
    { emoji: '😫', label: 'Устал' },
    { emoji: '😤', label: 'Раздражён' },
    { emoji: '🤒', label: 'Болею' },
    { emoji: '🥳', label: 'Празднично' },
  ];

  const handleMoodChange = async (memberId: string, mood: { emoji: string; label: string }) => {
    await updateMember({
      id: memberId,
      moodStatus: {
        emoji: mood.emoji,
        label: mood.label,
        timestamp: new Date().toISOString()
      }
    });
    setSelectedMemberForMood(null);
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
          className={`fixed left-0 top-20 z-40 bg-white/95 backdrop-blur-md shadow-lg transition-transform duration-300 ${
            isLeftMenuVisible ? 'translate-x-0' : '-translate-x-full'
          }`}
          onMouseEnter={() => autoHideLeftMenu && setIsLeftMenuVisible(true)}
          style={{ maxWidth: '280px', width: '100%' }}
        >
          <div className="p-3 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Icon name="Menu" size={16} />
              Разделы
            </h3>
            <div className="flex items-center gap-1">
              <Button
                onClick={toggleLeftMenuAutoHide}
                variant="ghost"
                size="sm"
                className={`h-7 w-7 p-0 ${autoHideLeftMenu ? 'text-blue-600' : 'text-gray-400'}`}
                title={autoHideLeftMenu ? 'Автоскрытие включено' : 'Автоскрытие выключено'}
              >
                <Icon name={autoHideLeftMenu ? 'EyeOff' : 'Eye'} size={14} />
              </Button>
              <Button
                onClick={() => setIsLeftMenuVisible(false)}
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
              >
                <Icon name="X" size={14} />
              </Button>
            </div>
          </div>
          <div className="p-3 space-y-1 max-h-[calc(100vh-200px)] overflow-y-auto">
            {menuSections.map((section, index) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all animate-fade-in ${
                  activeSection === section.id 
                    ? 'bg-blue-100 text-blue-700 shadow-sm' 
                    : 'hover:bg-gray-100'
                }`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <Icon name={section.icon} size={18} />
                <span className="text-sm font-medium">{section.label}</span>
              </button>
            ))}
            
            <div className="pt-2 mt-2 border-t border-gray-200">
              <button
                onClick={() => setShowInDevelopment(!showInDevelopment)}
                className="w-full flex items-center justify-between gap-2 p-3 rounded-lg hover:bg-gray-100 transition-all"
              >
                <div className="flex items-center gap-2">
                  <Icon name="Wrench" size={16} />
                  <span className="text-xs font-medium text-gray-600">В разработке</span>
                </div>
                <div className="flex items-center gap-1">
                  <Badge variant="secondary" className="text-[10px] px-1 py-0">{inDevelopmentSections.length}</Badge>
                  <Icon name={showInDevelopment ? 'ChevronUp' : 'ChevronDown'} size={14} className="text-gray-400" />
                </div>
              </button>
              
              {showInDevelopment && (
                <div className="mt-1 space-y-1 animate-fade-in">
                  {inDevelopmentSections.map((section, index) => (
                    <div
                      key={section.id}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-all"
                      style={{ animationDelay: `${index * 0.03}s` }}
                    >
                      <div className="flex items-center gap-2">
                        <Icon name={section.icon} size={16} className="text-gray-500" />
                        <span className="text-xs text-gray-600">{section.label}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button className="flex items-center gap-0.5 hover:bg-green-100 rounded px-1 py-0.5 transition-colors">
                          <Icon name="ThumbsUp" size={10} className="text-green-600" />
                          <span className="text-[9px] font-medium text-green-600">{section.votes.up}</span>
                        </button>
                        <button className="flex items-center gap-0.5 hover:bg-red-100 rounded px-1 py-0.5 transition-colors">
                          <Icon name="ThumbsDown" size={10} className="text-red-600" />
                          <span className="text-[9px] font-medium text-red-600">{section.votes.down}</span>
                        </button>
                      </div>
                    </div>
                  ))}
                  <p className="text-[9px] text-gray-500 text-center py-2 px-2">
                    💡 Голосуйте за функции, которые хотите видеть первыми!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <button
          onClick={() => setIsLeftMenuVisible(!isLeftMenuVisible)}
          className="fixed left-0 top-1/2 -translate-y-1/2 z-40 bg-white/90 hover:bg-white shadow-md rounded-r-lg py-4 px-2 transition-all duration-300"
          style={{ left: isLeftMenuVisible ? '280px' : '0px' }}
        >
          <Icon name={isLeftMenuVisible ? 'ChevronLeft' : 'ChevronRight'} size={20} className="text-gray-600" />
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
              <div key={member.id} className="relative">
                <div
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-all animate-fade-in cursor-pointer"
                  style={{ animationDelay: `${index * 0.05}s` }}
                  onClick={() => setSelectedMemberForMood(selectedMemberForMood === member.id ? null : member.id)}
                >
                  <div className="flex items-center gap-2">
                    <div className="text-2xl">{member.avatar}</div>
                    <div>
                      <p className="text-xs font-medium">{member.name}</p>
                      <p className="text-[10px] text-gray-500">{member.role}</p>
                    </div>
                  </div>
                  <div className="text-center flex items-center gap-1">
                    {member.moodStatus ? (
                      <>
                        <div className="text-xl">{member.moodStatus.emoji}</div>
                        <div>
                          <p className="text-[9px] text-gray-500">{member.moodStatus.label}</p>
                          <p className="text-[8px] text-gray-400">
                            {new Date(member.moodStatus.timestamp).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </>
                    ) : (
                      <div className="text-xl opacity-30">😐</div>
                    )}
                    <Icon name="ChevronDown" size={14} className={`text-gray-400 transition-transform ${selectedMemberForMood === member.id ? 'rotate-180' : ''}`} />
                  </div>
                </div>
                
                {selectedMemberForMood === member.id && (
                  <div className="grid grid-cols-4 gap-1 p-2 bg-gray-50 rounded-lg mt-1 animate-fade-in">
                    {moodOptions.map((mood) => (
                      <button
                        key={mood.emoji}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMoodChange(member.id, mood);
                        }}
                        className="flex flex-col items-center p-2 rounded hover:bg-white transition-all hover:scale-110"
                        title={mood.label}
                      >
                        <span className="text-2xl">{mood.emoji}</span>
                        <span className="text-[8px] text-gray-600 mt-1">{mood.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {familyMembers.length === 0 && (
              <p className="text-xs text-gray-500 text-center py-4">
                Нет данных о членах семьи
              </p>
            )}
            
            <div className="mt-2 p-2 bg-blue-50 rounded-lg">
              <p className="text-[10px] text-blue-600 text-center">
                💡 Нажмите на члена семьи, чтобы изменить настроение
              </p>
            </div>
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
            {getSectionTitle(activeSection)}
          </h1>
          
          <p className="text-lg lg:text-xl text-muted-foreground animate-fade-in" style={{ animationDelay: '0.2s' }}>
            {activeSection === 'tasks' && 'Управление задачами семьи'}
            {activeSection === 'calendar' && 'Семейные события и планы'}
            {activeSection === 'family' && 'Профили членов семьи'}
            {activeSection === 'children' && 'Развитие и достижения детей'}
            {activeSection === 'values' && 'Семейные ценности и принципы'}
            {activeSection === 'traditions' && 'Традиции и ритуалы'}
            {activeSection === 'blog' && 'Семейный блог и истории'}
            {activeSection === 'album' && 'Фотоальбом семьи'}
            {activeSection === 'tree' && 'Генеалогическое древо'}
            {activeSection === 'chat' && 'Семейный чат'}
            {activeSection === 'rules' && 'Правила и договоренности'}
            {activeSection === 'about' && 'Миссия проекта'}
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card key="stat-points" className="animate-fade-in hover:shadow-lg transition-all border-l-4 border-l-orange-500" style={{ animationDelay: '0.1s' }}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Всего баллов</CardTitle>
              <Icon name="Award" className="text-orange-500" size={20} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">{totalPoints}</div>
            </CardContent>
          </Card>

          <Card key="stat-workload" className="animate-fade-in hover:shadow-lg transition-all border-l-4 border-l-pink-500" style={{ animationDelay: '0.2s' }}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Средняя загрузка</CardTitle>
              <Icon name="TrendingUp" className="text-pink-500" size={20} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-pink-600">{avgWorkload}%</div>
            </CardContent>
          </Card>

          <Card key="stat-tasks" className="animate-fade-in hover:shadow-lg transition-all border-l-4 border-l-purple-500" style={{ animationDelay: '0.3s' }}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Задачи выполнены</CardTitle>
              <Icon name="CheckCircle2" className="text-purple-500" size={20} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">{completedTasks}/{totalTasks}</div>
            </CardContent>
          </Card>

          <Card key="stat-members" className="animate-fade-in hover:shadow-lg transition-all border-l-4 border-l-blue-500" style={{ animationDelay: '0.4s' }}>
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
            <Tabs value={activeSection} onValueChange={setActiveSection} className="space-y-6">
              <TabsList className="flex flex-wrap gap-2 h-auto p-2 bg-white/50 backdrop-blur-sm justify-start">
                <TabsTrigger value="family" className="text-xs lg:text-sm py-2 px-3 whitespace-nowrap">
                  <Icon name="Users" className="mr-1" size={14} />
                  Семья
                </TabsTrigger>
                <TabsTrigger value="tasks" className="text-xs lg:text-sm py-2 px-3 whitespace-nowrap">
                  <Icon name="CheckSquare" className="mr-1" size={14} />
                  Задачи
                </TabsTrigger>
                <TabsTrigger value="calendar" className="text-xs lg:text-sm py-2 px-3 whitespace-nowrap">
                  <Icon name="Calendar" className="mr-1" size={14} />
                  Календарь
                </TabsTrigger>
                <TabsTrigger value="children" className="text-xs lg:text-sm py-2 px-3 whitespace-nowrap">
                  <Icon name="Baby" className="mr-1" size={14} />
                  Дети
                </TabsTrigger>
                <TabsTrigger value="values" className="text-xs lg:text-sm py-2 px-3 whitespace-nowrap">
                  <Icon name="Heart" className="mr-1" size={14} />
                  Ценности
                </TabsTrigger>
                <TabsTrigger value="traditions" className="text-xs lg:text-sm py-2 px-3 whitespace-nowrap">
                  <Icon name="Sparkles" className="mr-1" size={14} />
                  Традиции
                </TabsTrigger>
                <TabsTrigger value="blog" className="text-xs lg:text-sm py-2 px-3 whitespace-nowrap">
                  <Icon name="BookOpen" className="mr-1" size={14} />
                  Блог
                </TabsTrigger>
                <TabsTrigger value="album" className="text-xs lg:text-sm py-2 px-3 whitespace-nowrap">
                  <Icon name="Image" className="mr-1" size={14} />
                  Альбом
                </TabsTrigger>
                <TabsTrigger value="tree" className="text-xs lg:text-sm py-2 px-3 whitespace-nowrap">
                  <Icon name="GitBranch" className="mr-1" size={14} />
                  Древо
                </TabsTrigger>
                <TabsTrigger value="chat" className="text-xs lg:text-sm py-2 px-3 whitespace-nowrap">
                  <Icon name="MessageCircle" className="mr-1" size={14} />
                  Чат
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
                

              </TabsList>

              <TabsContent value="tasks">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Icon name="CheckSquare" />
                      Задачи семьи
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {tasks.slice(0, 5).map((task, idx) => (
                        <div key={task.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors animate-fade-in" style={{ animationDelay: `${idx * 0.1}s` }}>
                          <Checkbox 
                            checked={task.completed}
                            onCheckedChange={() => toggleTask(task.id)}
                          />
                          <div className="flex-1">
                            <h4 className={`font-semibold ${task.completed ? 'line-through text-gray-400' : ''}`}>
                              {task.title}
                            </h4>
                            <p className="text-sm text-muted-foreground">{task.description}</p>
                          </div>
                          <Badge>{getMemberById(task.assignee)?.name || 'Не назначено'}</Badge>
                        </div>
                      ))}
                      {tasks.length === 0 && (
                        <p className="text-center text-muted-foreground py-8">
                          Задач пока нет. Создайте первую задачу!
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="family">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Icon name="Users" />
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
                <Card key="calendar-card">
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

              <TabsContent value="children">
                <div className="space-y-4">
                  {childrenProfiles.length > 0 ? childrenProfiles.map((child, idx) => (
                    <Card key={child.id} className="animate-fade-in" style={{ animationDelay: `${idx * 0.1}s` }}>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-3">
                          <React.Fragment key={`title-content-${child.id}`}>
                            <span className="text-4xl">{child.avatar}</span>
                            <div>
                              <div className="flex items-center gap-2">
                                <span>{child.name}</span>
                                <Badge>{child.age} лет</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground font-normal">Класс: {child.grade}</p>
                            </div>
                          </React.Fragment>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div>
                            <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                              <Icon name="Star" size={14} />
                              Интересы
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {child.interests && child.interests.length > 0 ? (
                                child.interests.map((interest, i) => (
                                  <Badge key={`${child.id}-interest-${i}`} variant="outline">{interest}</Badge>
                                ))
                              ) : (
                                <p className="text-sm text-muted-foreground">Интересы пока не добавлены</p>
                              )}
                            </div>
                          </div>
                          <div>
                            <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                              <Icon name="Award" size={14} />
                              Достижения
                            </h4>
                            <div className="space-y-1">
                              {child.achievements && child.achievements.length > 0 ? (
                                child.achievements.slice(0, 3).map((achievement, i) => (
                                  <div key={`${child.id}-achievement-${i}`} className="text-sm text-muted-foreground flex items-center gap-2">
                                    <Icon name="CheckCircle" size={12} className="text-green-500" />
                                    {achievement}
                                  </div>
                                ))
                              ) : (
                                <p className="text-sm text-muted-foreground">Достижений пока нет</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )) : (
                    <Card key="empty-children">
                      <CardContent className="p-8 text-center">
                        <Icon name="Baby" size={48} className="mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-lg font-semibold mb-2">Нет профилей детей</h3>
                        <p className="text-sm text-muted-foreground">Добавьте первый профиль ребенка, чтобы отслеживать развитие и достижения</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="values">
                <div className="grid gap-4">
                  {familyValues.length > 0 ? familyValues.map((value, idx) => (
                    <Card key={value.id} className="animate-fade-in" style={{ animationDelay: `${idx * 0.1}s` }}>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <React.Fragment key={`title-content-${value.id}`}>
                            <span className="text-2xl">{value.icon}</span>
                            <span>{value.title}</span>
                          </React.Fragment>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground mb-3">{value.description}</p>
                        <div className="space-y-2">
                          <h4 className="font-semibold text-sm">Как мы это практикуем:</h4>
                          {value.practices && value.practices.length > 0 ? (
                            value.practices.map((practice, i) => (
                              <div key={`${value.id}-practice-${i}`} className="flex items-start gap-2 text-sm">
                                <Icon name="ArrowRight" size={14} className="text-purple-500 mt-0.5" />
                                <span>{practice}</span>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-muted-foreground">Практики пока не описаны</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )) : (
                    <Card key="empty-values">
                      <CardContent className="p-8 text-center">
                        <Icon name="Heart" size={48} className="mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-lg font-semibold mb-2">Нет семейных ценностей</h3>
                        <p className="text-sm text-muted-foreground">Опишите важные для вашей семьи ценности и принципы</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="traditions">
                <div className="grid gap-4">
                  {traditions.length > 0 ? traditions.map((tradition, idx) => (
                    <Card key={tradition.id} className="animate-fade-in" style={{ animationDelay: `${idx * 0.1}s` }}>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-3">
                          <React.Fragment key={`title-content-${tradition.id}`}>
                            <span className="text-3xl">{tradition.icon}</span>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <span>{tradition.name}</span>
                                <Badge className={tradition.frequency === 'weekly' ? 'bg-blue-500' : tradition.frequency === 'monthly' ? 'bg-purple-500' : 'bg-pink-500'}>
                                  {tradition.frequency === 'weekly' ? 'Еженедельно' : tradition.frequency === 'monthly' ? 'Ежемесячно' : 'Ежегодно'}
                                </Badge>
                              </div>
                            </div>
                          </React.Fragment>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground mb-3">{tradition.description}</p>
                        <div className="text-sm text-muted-foreground">
                          <Icon name="Calendar" size={14} className="inline mr-1" />
                          Следующая: {tradition.nextDate}
                        </div>
                      </CardContent>
                    </Card>
                  )) : (
                    <Card key="empty-traditions">
                      <CardContent className="p-8 text-center">
                        <Icon name="Sparkles" size={48} className="mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-lg font-semibold mb-2">Нет традиций</h3>
                        <p className="text-sm text-muted-foreground">Создайте семейные ритуалы и традиции</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="blog">
                <div className="space-y-4">
                  {blogPosts.length > 0 ? blogPosts.map((post, idx) => (
                    <Card key={post.id} className="animate-fade-in" style={{ animationDelay: `${idx * 0.1}s` }}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="mb-2">{post.title}</CardTitle>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <span className="text-xl">{post.authorAvatar}</span>
                                {post.author}
                              </span>
                              <span className="flex items-center gap-1">
                                <Icon name="Calendar" size={14} />
                                {post.date}
                              </span>
                            </div>
                          </div>
                          <Badge>{post.category}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground mb-4">{post.content}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Icon name="Heart" size={14} className="text-red-500" />
                            {post.likes}
                          </span>
                          <span className="flex items-center gap-1">
                            <Icon name="MessageCircle" size={14} />
                            {post.comments} комментариев
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  )) : (
                    <Card key="empty-blog">
                      <CardContent className="p-8 text-center">
                        <Icon name="BookOpen" size={48} className="mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-lg font-semibold mb-2">Блог пуст</h3>
                        <p className="text-sm text-muted-foreground">Начните делиться семейными историями и моментами</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="album">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {familyAlbum.length > 0 ? familyAlbum.map((photo, idx) => (
                    <Card key={photo.id} className="overflow-hidden animate-fade-in cursor-pointer hover:shadow-lg transition-shadow" style={{ animationDelay: `${idx * 0.05}s` }}>
                      <div className="aspect-square bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center text-6xl">
                        📸
                      </div>
                      <CardContent className="p-3">
                        <p className="text-sm font-semibold mb-1">{photo.title}</p>
                        <p className="text-xs text-muted-foreground">{photo.date}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {photo.tags?.slice(0, 3).map((tag, i) => (
                            <Badge key={i} variant="outline" className="text-xs">{tag}</Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )) : (
                    <Card key="empty-album" className="col-span-full">
                      <CardContent className="p-8 text-center">
                        <Icon name="Image" size={48} className="mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-lg font-semibold mb-2">Альбом пуст</h3>
                        <p className="text-sm text-muted-foreground">Добавьте первое семейное фото</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="tree">
                <Card key="tree-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Icon name="GitBranch" />
                      Генеалогическое древо
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {familyTree.length > 0 ? familyTree.map((member, idx) => (
                        <div 
                          key={member.id} 
                          className="p-4 rounded-lg border-2 hover:border-purple-300 transition-all cursor-pointer animate-fade-in"
                          style={{ animationDelay: `${idx * 0.1}s`, marginLeft: `${member.generation * 20}px` }}
                          onClick={() => setSelectedTreeMember(member)}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-3xl">{member.avatar}</span>
                            <div className="flex-1">
                              <h4 className="font-bold">{member.name}</h4>
                              <p className="text-sm text-muted-foreground">{member.birthDate} - {member.deathDate || 'настоящее время'}</p>
                              <p className="text-sm">{member.relationship}</p>
                            </div>
                            <Badge>{member.generation} поколение</Badge>
                          </div>
                        </div>
                      )) : (
                        <div className="text-center py-8">
                          <Icon name="GitBranch" size={48} className="mx-auto mb-4 text-muted-foreground" />
                          <h3 className="text-lg font-semibold mb-2">Древо пусто</h3>
                          <p className="text-sm text-muted-foreground">Добавьте членов семьи в генеалогическое древо</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="chat">
                <Card key="chat-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Icon name="MessageCircle" />
                      Семейный чат
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 mb-4 max-h-[500px] overflow-y-auto">
                      {chatMessages.length > 0 ? chatMessages.map((msg, idx) => (
                        <div key={msg.id} className="flex items-start gap-3 animate-fade-in" style={{ animationDelay: `${idx * 0.05}s` }}>
                          <span className="text-2xl">{msg.senderAvatar}</span>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-sm">{msg.senderName}</span>
                              <span className="text-xs text-muted-foreground">{msg.timestamp}</span>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-3">
                              {msg.type === 'text' && <p className="text-sm">{msg.content}</p>}
                              {msg.type === 'image' && (
                                <div className="space-y-2">
                                  <div className="bg-purple-100 rounded p-4 text-center">📷 Фото</div>
                                  <p className="text-xs text-muted-foreground">{msg.fileName}</p>
                                </div>
                              )}
                              {msg.type === 'video' && (
                                <div className="space-y-2">
                                  <div className="bg-blue-100 rounded p-4 text-center">🎥 Видео</div>
                                  <p className="text-xs text-muted-foreground">{msg.fileName}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )) : (
                        <div className="text-center py-8">
                          <Icon name="MessageCircle" size={48} className="mx-auto mb-4 text-muted-foreground" />
                          <h3 className="text-lg font-semibold mb-2">Чат пуст</h3>
                          <p className="text-sm text-muted-foreground">Начните общение с семьей</p>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Input 
                        placeholder="Написать сообщение..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                      />
                      <Button onClick={handleSendMessage}>
                        <Icon name="Send" size={16} />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="rules">
                <Card key="rules-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Icon name="Scale" />
                      Правила семьи
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-muted-foreground mb-4">
                        Семейные правила помогают создать атмосферу взаимоуважения и понимания. Здесь вы можете описать договоренности, которые важны для вашей семьи.
                      </p>
                      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 text-center">
                        <Icon name="Scale" size={48} className="mx-auto mb-4 text-purple-500" />
                        <h3 className="text-lg font-semibold mb-2">Правила пока не добавлены</h3>
                        <p className="text-sm text-muted-foreground">Создайте список важных для вашей семьи правил и договоренностей</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="about">
                <Card key="about-card" className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                      <Icon name="Heart" className="text-red-500" />
                      О проекте
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="prose prose-lg max-w-none">
                    <div className="space-y-6">
                      <div className="text-center py-8 bg-white rounded-lg shadow-sm">
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 bg-clip-text text-transparent mb-4">
                          Здоровая семья - Здоровая страна!
                        </h1>
                        <p className="text-2xl font-semibold text-purple-700 mb-2">
                          Проект создан для объединения семей!
                        </p>
                      </div>

                      <div className="bg-white rounded-lg p-6 shadow-sm space-y-4">
                        <p className="text-lg leading-relaxed">
                          Семья - главный проект нашей жизни, от успехов в семье зависит успех нашего общества.
                        </p>

                        <p className="text-lg leading-relaxed">
                          Самое важное в семейных ценностях — это возможность сблизить членов семьи, сделать их командой, которая может справиться с любыми невзгодами и каждый в ней имеет значение. Поэтому берегите фамильное наследие вместе, уделяя при этом достаточно внимания ребенку и позволяя ему или ей играть определенную роль, чтобы дать маленькому человеку почувствовать себя частью чего-то большего.
                        </p>

                        <p className="text-lg leading-relaxed">
                          Дети полюбят семейные традиции и ценности, если будут счастливы им следовать. И здесь очень важно поговорить о семейных традициях. Это принятые в семье нормы, манеры поведения, взгляды, которые передаются из поколения в поколение.
                        </p>

                        <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg p-6">
                          <p className="text-lg leading-relaxed font-semibold mb-3">
                            Семейные традиции и ритуалы, с одной стороны, — важный признак здоровой и функциональной семьи, а, с другой — один из важнейших механизмов передачи следующим поколениям законов внутрисемейного взаимодействия:
                          </p>
                          <ul className="space-y-2 ml-6">
                            <li key="role-distribution" className="text-lg flex items-start gap-2">
                              <Icon name="ArrowRight" size={20} className="text-purple-600 mt-1 flex-shrink-0" />
                              <span>распределения ролей во всех сферах семейной жизни;</span>
                            </li>
                            <li key="communication-rules" className="text-lg flex items-start gap-2">
                              <Icon name="ArrowRight" size={20} className="text-purple-600 mt-1 flex-shrink-0" />
                              <span>правил внутрисемейного общения;</span>
                            </li>
                            <li key="conflict-resolution" className="text-lg flex items-start gap-2">
                              <Icon name="ArrowRight" size={20} className="text-purple-600 mt-1 flex-shrink-0" />
                              <span>способов разрешения конфликтов и преодоления возникающих проблем.</span>
                            </li>
                          </ul>
                        </div>

                        <p className="text-lg leading-relaxed">
                          Семейные традиции и обряды основываются не только на общественных, религиозных и исторических традициях и обрядах, но творчески дополняются собственными, поэтому они уникальны.
                        </p>

                        <p className="text-lg leading-relaxed font-semibold text-purple-700">
                          Традиции помогают укрепить доверие и близость между родными людьми и демонстрируют детям, какой на самом деле может быть семья.
                        </p>
                      </div>
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
            <Card key="sidebar-weekly-calendar" className="animate-fade-in border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50" style={{ animationDelay: '0.5s' }}>
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
                        key={day.fullDate}
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
                            {dayEvents.map((event) => (
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

            <Card key="sidebar-reminders" className="animate-fade-in border-orange-200 bg-gradient-to-br from-orange-50 to-yellow-50" style={{ animationDelay: '0.6s' }}>
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

            <Card key="sidebar-ai-tips" className="animate-fade-in border-green-200 bg-gradient-to-br from-green-50 to-emerald-50" style={{ animationDelay: '0.7s' }}>
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