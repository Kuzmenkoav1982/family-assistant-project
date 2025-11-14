import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import { useNavigate } from 'react-router-dom';
import { useTasks } from '@/hooks/useTasks';
import { useFamilyMembers } from '@/hooks/useFamilyMembers';
import { useFamilyData } from '@/hooks/useFamilyData';
import { ClickChamomile } from '@/components/ClickChamomile';
import ProfileOnboarding from '@/components/ProfileOnboarding';
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
import { getTranslation, type LanguageCode } from '@/translations';
import FamilyInviteManager from '@/components/FamilyInviteManager';
import BottomBar from '@/components/BottomBar';
import PanelSettings from '@/components/PanelSettings';

interface IndexProps {
  onLogout?: () => void;
}

export default function Index({ onLogout }: IndexProps) {
  const navigate = useNavigate();
  const { members: familyMembersRaw, loading: membersLoading, addMember, updateMember, deleteMember } = useFamilyMembers();
  const { tasks: tasksRaw, loading: tasksLoading, toggleTask: toggleTaskDB, createTask, updateTask, deleteTask } = useTasks();
  const { data: familyData, syncing, syncData, getLastSyncTime } = useFamilyData();
  
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
  const [educationChild, setEducationChild] = useState<FamilyMember | null>(null);
  const [chamomileEnabled, setChamomileEnabled] = useState(() => {
    return localStorage.getItem('chamomileEnabled') !== 'false';
  });
  const [soundEnabled, setSoundEnabled] = useState(() => {
    return localStorage.getItem('soundEnabled') !== 'false';
  });
  const [showProfileOnboarding, setShowProfileOnboarding] = useState(false);
  const [showHints, setShowHints] = useState(() => {
    return !localStorage.getItem('hasSeenHints');
  });
  const [currentHintStep, setCurrentHintStep] = useState(0);
  const [showFamilyInvite, setShowFamilyInvite] = useState(false);
  
  const [isBottomBarVisible, setIsBottomBarVisible] = useState(true);
  const [autoHideBottomBar, setAutoHideBottomBar] = useState(() => {
    return localStorage.getItem('autoHideBottomBar') === 'true';
  });
  const [showTopPanelSettings, setShowTopPanelSettings] = useState(false);
  const [showLeftPanelSettings, setShowLeftPanelSettings] = useState(false);
  const [showRightPanelSettings, setShowRightPanelSettings] = useState(false);

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const currentUser = familyMembers.find(m => m.user_id === user.id || m.id === user.member_id);
  const currentUserId = currentUser?.id || user.member_id || '';

  useEffect(() => {
    const needsSetup = localStorage.getItem('needsProfileSetup');
    if (needsSetup === 'true' && currentUser && !membersLoading) {
      setShowProfileOnboarding(true);
    }
  }, [currentUser, membersLoading]);

  useEffect(() => {
    if (showHints && !showProfileOnboarding && !membersLoading) {
      const timer = setTimeout(() => {
        if (currentHintStep < hints.length - 1) {
          setCurrentHintStep(currentHintStep + 1);
        }
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showHints, currentHintStep, showProfileOnboarding, membersLoading]);

  const hints = [
    {
      id: 'settings',
      title: 'Настройки',
      description: 'Здесь вы можете настроить приложение, пригласить родственников и управлять семьёй',
      icon: 'Settings',
      position: 'top-left',
      action: () => document.querySelector('[title="Настройки"]')?.scrollIntoView({ behavior: 'smooth' })
    },
    {
      id: 'profile',
      title: 'Мой профиль',
      description: 'Нажмите сюда чтобы отредактировать свой профиль, аватар и предпочтения',
      icon: 'UserCircle',
      position: 'top-left',
      action: () => document.querySelector('[title="Мой профиль"]')?.scrollIntoView({ behavior: 'smooth' })
    },
    {
      id: 'instructions',
      title: 'Инструкции',
      description: 'Подробные инструкции по всем разделам приложения',
      icon: 'BookOpen',
      position: 'top-left',
      action: () => document.querySelector('[title="Инструкции"]')?.scrollIntoView({ behavior: 'smooth' })
    },
    {
      id: 'sections',
      title: 'Разделы',
      description: 'Переключайтесь между разделами: Задачи, Семья, Календарь, Дети и другие',
      icon: 'Menu',
      position: 'left',
      action: () => setIsLeftMenuVisible(true)
    },
    {
      id: 'mood',
      title: 'Настроение семьи',
      description: 'Отслеживайте настроение каждого члена семьи',
      icon: 'Smile',
      position: 'right',
      action: () => setIsMoodWidgetVisible(true)
    }
  ];

  const handleDismissHints = () => {
    setShowHints(false);
    localStorage.setItem('hasSeenHints', 'true');
  };

  const handleNextHint = () => {
    if (currentHintStep < hints.length - 1) {
      setCurrentHintStep(currentHintStep + 1);
    } else {
      handleDismissHints();
    }
  };

  const handlePrevHint = () => {
    if (currentHintStep > 0) {
      setCurrentHintStep(currentHintStep - 1);
    }
  };

  const handleLogoutLocal = () => {
    onLogout?.();
  };

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
      .filter(task => !task.completed && task.reminder_time)
      .map(task => ({
        id: `reminder-${task.id}`,
        taskId: task.id,
        taskTitle: task.title,
        time: task.reminder_time!,
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

  const handleBottomBarSectionsChange = (sections: string[]) => {
    setBottomBarSections(sections);
    localStorage.setItem('bottomBarSections', JSON.stringify(sections));
  };

  const handleLeftPanelSectionsChange = (sections: string[]) => {
    setLeftPanelSections(sections);
    localStorage.setItem('leftPanelSections', JSON.stringify(sections));
  };

  const handleTopPanelSectionsChange = (sections: string[]) => {
    setTopPanelSections(sections);
    localStorage.setItem('topPanelSections', JSON.stringify(sections));
  };

  const handleRightPanelSectionsChange = (sections: string[]) => {
    setRightPanelSections(sections);
    localStorage.setItem('rightPanelSections', JSON.stringify(sections));
  };

  const handleAutoHideBottomBarChange = (value: boolean) => {
    setAutoHideBottomBar(value);
    localStorage.setItem('autoHideBottomBar', String(value));
  };

  const availableSections = [
    { id: 'tasks', icon: 'CheckSquare', label: 'Задачи' },
    { id: 'calendar', icon: 'Calendar', label: 'Календарь' },
    { id: 'family', icon: 'Users', label: 'Семья' },
    { id: 'children', icon: 'Baby', label: 'Дети' },
    { id: 'chat', icon: 'MessageCircle', label: 'Чат' },
    { id: 'values', icon: 'Heart', label: 'Ценности' },
    { id: 'traditions', icon: 'Sparkles', label: 'Традиции' },
    { id: 'rules', icon: 'Scale', label: 'Правила' },
    { id: 'blog', icon: 'BookOpen', label: 'Блог' },
    { id: 'album', icon: 'Image', label: 'Альбом' },
    { id: 'tree', icon: 'GitBranch', label: 'Древо' },
    { id: 'about', icon: 'Info', label: 'О проекте' },
  ];

  const menuSections = availableSections.map(s => ({ ...s, ready: true }));

  const [bottomBarSections, setBottomBarSections] = useState<string[]>(() => {
    const saved = localStorage.getItem('bottomBarSections');
    return saved ? JSON.parse(saved) : ['chat', 'calendar', 'tasks'];
  });

  const [leftPanelSections, setLeftPanelSections] = useState<string[]>(() => {
    const saved = localStorage.getItem('leftPanelSections');
    return saved ? JSON.parse(saved) : availableSections.map(s => s.id);
  });

  const [topPanelSections, setTopPanelSections] = useState<string[]>(() => {
    const saved = localStorage.getItem('topPanelSections');
    return saved ? JSON.parse(saved) : [];
  });

  const [rightPanelSections, setRightPanelSections] = useState<string[]>(() => {
    const saved = localStorage.getItem('rightPanelSections');
    return saved ? JSON.parse(saved) : [];
  });
  
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
    if (!task.recurring_frequency) return undefined;
    
    const now = new Date();
    const next = new Date(now);
    
    switch (task.recurring_frequency) {
      case 'daily':
        next.setDate(next.getDate() + (task.recurring_interval || 1));
        break;
      case 'weekly':
        next.setDate(next.getDate() + 7 * (task.recurring_interval || 1));
        break;
      case 'monthly':
        next.setMonth(next.getMonth() + (task.recurring_interval || 1));
        break;
      case 'yearly':
        next.setFullYear(next.getFullYear() + (task.recurring_interval || 1));
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
    setCurrentLanguage(language as LanguageCode);
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
      <ProfileOnboarding
        isOpen={showProfileOnboarding}
        onComplete={() => {
          setShowProfileOnboarding(false);
          window.location.reload();
        }}
        memberId={currentUserId}
        memberName={currentUser?.name || 'Пользователь'}
      />

      <Dialog open={showFamilyInvite} onOpenChange={setShowFamilyInvite}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col p-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b">
            <DialogTitle className="flex items-center gap-2 text-xl md:text-2xl">
              <Icon name="UserPlus" size={24} />
              Управление семьёй
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-6 pb-6">
            <FamilyInviteManager />
          </div>
        </DialogContent>
      </Dialog>

      {showHints && !showProfileOnboarding && !membersLoading && (
        <>
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] animate-fade-in" onClick={handleDismissHints} />
          
          <Card className="fixed z-[70] max-w-md w-[90%] shadow-2xl border-4 border-purple-400 animate-fade-in" 
            style={{
              top: hints[currentHintStep].position.includes('top') ? '100px' : 'auto',
              bottom: hints[currentHintStep].position.includes('bottom') ? '20px' : 'auto',
              left: hints[currentHintStep].position.includes('left') ? '20px' : 'auto',
              right: hints[currentHintStep].position.includes('right') ? '20px' : 'auto',
              ...(hints[currentHintStep].position === 'center' && {
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)'
              })
            }}
          >
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 pb-3">
              <div className="flex items-center justify-between mb-2">
                <Badge className="bg-purple-600">
                  Подсказка {currentHintStep + 1} из {hints.length}
                </Badge>
                <Button variant="ghost" size="sm" onClick={handleDismissHints} className="h-6 w-6 p-0">
                  <Icon name="X" size={14} />
                </Button>
              </div>
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center">
                  <Icon name={hints[currentHintStep].icon} size={20} className="text-white" />
                </div>
                {hints[currentHintStep].title}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="text-sm text-gray-700 mb-4">
                {hints[currentHintStep].description}
              </p>
              
              <div className="flex items-center justify-between gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrevHint}
                  disabled={currentHintStep === 0}
                  className="flex-1"
                >
                  <Icon name="ArrowLeft" size={14} className="mr-1" />
                  Назад
                </Button>
                
                {hints[currentHintStep].action && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      hints[currentHintStep].action?.();
                      setTimeout(handleNextHint, 500);
                    }}
                    className="flex-1 border-purple-300 text-purple-700"
                  >
                    <Icon name="Eye" size={14} className="mr-1" />
                    Показать
                  </Button>
                )}
                
                <Button
                  size="sm"
                  onClick={handleNextHint}
                  className="flex-1 bg-purple-600"
                >
                  {currentHintStep === hints.length - 1 ? (
                    <>
                      <Icon name="Check" size={14} className="mr-1" />
                      Понятно
                    </>
                  ) : (
                    <>
                      Далее
                      <Icon name="ArrowRight" size={14} className="ml-1" />
                    </>
                  )}
                </Button>
              </div>

              <div className="flex justify-center gap-1 mt-4">
                {hints.map((_, index) => (
                  <div
                    key={index}
                    className={`h-1.5 rounded-full transition-all ${
                      index === currentHintStep
                        ? 'w-8 bg-purple-600'
                        : 'w-1.5 bg-gray-300'
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={handleDismissHints}
                className="w-full mt-3 text-xs text-gray-500 hover:text-gray-700 transition-colors"
              >
                Пропустить все подсказки
              </button>
            </CardContent>
          </Card>
        </>
      )}

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
      
      <div className={`min-h-screen ${themeClasses.background} ${themeClasses.baseFont} transition-all duration-700 ease-in-out`}>
        <div className="pt-16 pb-20">
          <div className="container mx-auto px-4 max-w-7xl">
            <h1 className={`text-3xl font-bold mb-6 ${themeClasses.heading}`}>
              {getTranslation(currentLanguage, activeSection)}
            </h1>
          </div>
        </div>

        <BottomBar
          isVisible={isBottomBarVisible}
          activeSection={activeSection}
          availableSections={availableSections}
          selectedSections={bottomBarSections}
          autoHide={autoHideBottomBar}
          onSectionChange={setActiveSection}
          onVisibilityChange={setIsBottomBarVisible}
          onAutoHideChange={(value) => {
            setAutoHideBottomBar(value);
            localStorage.setItem('autoHideBottomBar', String(value));
          }}
          onSectionsChange={(sections) => {
            setBottomBarSections(sections);
            localStorage.setItem('bottomBarSections', JSON.stringify(sections));
          }}
        />

        {chamomileEnabled && <ClickChamomile soundEnabled={soundEnabled} />}

        {showTopPanelSettings && (
          <PanelSettings
            title="Настройки верхней панели"
            availableSections={availableSections}
            selectedSections={topPanelSections}
            autoHide={autoHideTopBar}
            onSectionsChange={handleTopPanelSectionsChange}
            onAutoHideChange={(value) => {
              setAutoHideTopBar(value);
              localStorage.setItem('autoHideTopBar', String(value));
            }}
            onClose={() => setShowTopPanelSettings(false)}
          />
        )}

        {showLeftPanelSettings && (
          <PanelSettings
            title="Настройки левого меню"
            availableSections={availableSections}
            selectedSections={leftPanelSections}
            autoHide={autoHideLeftMenu}
            onSectionsChange={handleLeftPanelSectionsChange}
            onAutoHideChange={(value) => {
              setAutoHideLeftMenu(value);
              localStorage.setItem('autoHideLeftMenu', String(value));
            }}
            onClose={() => setShowLeftPanelSettings(false)}
          />
        )}

        {showRightPanelSettings && (
          <PanelSettings
            title="Настройки виджета настроения"
            availableSections={[]}
            selectedSections={rightPanelSections}
            autoHide={autoHideMoodWidget}
            onSectionsChange={handleRightPanelSectionsChange}
            onAutoHideChange={(value) => {
              setAutoHideMoodWidget(value);
              localStorage.setItem('autoHideMoodWidget', String(value));
            }}
            onClose={() => setShowRightPanelSettings(false)}
          />
        )}
      </div>
    </>
  );
}