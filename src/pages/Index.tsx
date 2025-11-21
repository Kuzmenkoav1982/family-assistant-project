import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import { useNavigate } from 'react-router-dom';
import { useTasks } from '@/hooks/useTasks';
import { useFamilyMembers } from '@/hooks/useFamilyMembers';
import { useFamilyData } from '@/hooks/useFamilyData';
import { ChildEducation } from '@/components/ChildEducation';
import { ClickChamomile } from '@/components/ClickChamomile';
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
  ShoppingItem,
  FamilyGoal,
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
  initialFamilyGoals,
  getWeekDays,
} from '@/data/mockData';
import { FamilyTabsContent } from '@/components/FamilyTabsContent';
import { FamilyMembersGrid } from '@/components/FamilyMembersGrid';
import { GoalsSection } from '@/components/GoalsSection';
import { getTranslation, type LanguageCode } from '@/translations';
import { DEMO_FAMILY } from '@/data/demoFamily';
import SettingsMenu from '@/components/SettingsMenu';
import FamilyInviteManager from '@/components/FamilyInviteManager';
import { FamilyCohesionChart } from '@/components/FamilyCohesionChart';
import BottomBar from '@/components/BottomBar';
import PanelSettings from '@/components/PanelSettings';
import FamilyMemberSwitcher from '@/components/FamilyMemberSwitcher';
import MealVotingWidget from '@/components/MealVotingWidget';
import RightSidebar from '@/components/layout/RightSidebar';
import { getCurrentMember } from '@/data/demoFamily';

interface IndexProps {
  onLogout?: () => void;
}

export default function Index({ onLogout }: IndexProps) {
  const navigate = useNavigate();
  const { members: familyMembersRaw, loading: membersLoading, addMember, updateMember, deleteMember } = useFamilyMembers();
  const { tasks: tasksRaw, loading: tasksLoading, toggleTask: toggleTaskDB, createTask, updateTask, deleteTask } = useTasks();
  const { data: familyData, syncing, syncData, getLastSyncTime } = useFamilyData();
  
  const familyMembers = (familyMembersRaw && familyMembersRaw.length > 0) ? familyMembersRaw : 
    DEMO_FAMILY.members.map((dm, index) => {
      const demoMoods = [
        { emoji: '😊', label: 'Отлично', timestamp: new Date(Date.now() - 30 * 60000).toISOString() },
        { emoji: '😃', label: 'Хорошо', timestamp: new Date(Date.now() - 60 * 60000).toISOString() },
        { emoji: '🥳', label: 'Празднично', timestamp: new Date(Date.now() - 120 * 60000).toISOString() },
        { emoji: '😐', label: 'Нормально', timestamp: new Date(Date.now() - 45 * 60000).toISOString() },
        { emoji: '😊', label: 'Отлично', timestamp: new Date(Date.now() - 90 * 60000).toISOString() },
        { emoji: '😃', label: 'Хорошо', timestamp: new Date(Date.now() - 15 * 60000).toISOString() },
      ];
      
      return {
        id: dm.id,
        name: dm.name,
        role: dm.role === 'owner' ? 'Папа' : dm.role === 'admin' ? 'Мама' : dm.role === 'child' ? 'Ребёнок' : 'Участник',
        avatar: '👤',
        avatarType: 'photo' as const,
        photoUrl: dm.avatar,
        age: dm.age,
        relationship: dm.role === 'owner' || dm.role === 'admin' ? 'Родитель' : 'Ребёнок',
        points: [250, 180, 120, 80, 150, 200][index] || 0,
        level: [5, 4, 3, 2, 4, 5][index] || 1,
        workload: [60, 55, 30, 10, 40, 45][index] || 0,
        tasksCompleted: [15, 12, 8, 3, 10, 13][index] || 0,
        achievements: [
          ['Суперпапа', 'Организатор'],
          ['Душа семьи', 'Повар года'],
          ['Отличница', 'Спортсменка'],
          ['Веселый малыш'],
          ['Мудрая бабушка', 'Лучшие пирожки'],
          ['Семейный историк']
        ][index] || [],
        moodStatus: demoMoods[index],
        dreams: dm.role === 'child' ? [
          { id: '1', title: 'Велосипед', targetAmount: 15000, savedAmount: 3000, createdAt: new Date().toISOString() },
          { id: '2', title: 'Планшет', targetAmount: 30000, savedAmount: 5000, createdAt: new Date().toISOString() }
        ] : [],
        piggyBank: (dm.role === 'child' ? [8000, 0][index - 2] : 0) || 0,
        foodPreferences: {
          favorites: dm.preferences.favoriteFood,
          dislikes: []
        },
        responsibilities: [
          ['Планирование семейных поездок', 'Ремонт техники'],
          ['Приготовление еды', 'Уборка кухни'],
          ['Уборка комнаты', 'Помощь с младшим братом'],
          ['Складывать игрушки'],
          ['Пирожки по выходным', 'Помощь с детьми'],
          ['Рассказывать истории', 'Семейные традиции']
        ][index] || []
      } as FamilyMember;
    });
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
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>(() => {
    const saved = localStorage.getItem('shoppingList');
    return saved ? JSON.parse(saved) : [];
  });
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<'products' | 'household' | 'clothes' | 'other'>('products');
  const [newItemQuantity, setNewItemQuantity] = useState('');
  const [newItemPriority, setNewItemPriority] = useState<'normal' | 'urgent'>('normal');
  const [showAddItemDialog, setShowAddItemDialog] = useState(false);
  const [familyGoals, setFamilyGoals] = useState<FamilyGoal[]>(() => {
    const saved = localStorage.getItem('familyGoals');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return initialFamilyGoals;
      }
    }
    return initialFamilyGoals;
  });
  
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
  const [activeSection, setActiveSection] = useState<string>('family');
  const [showInDevelopment, setShowInDevelopment] = useState(false);
  const [educationChild, setEducationChild] = useState<FamilyMember | null>(null);
  const [chamomileEnabled, setChamomileEnabled] = useState(() => {
    return localStorage.getItem('chamomileEnabled') === 'true';
  });
  const [soundEnabled, setSoundEnabled] = useState(() => {
    return localStorage.getItem('soundEnabled') === 'true';
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

  const demoMember = getCurrentMember();
  const currentUser = demoMember 
    ? familyMembers.find(m => m.id === demoMember.id) || familyMembers[0]
    : familyMembers[0];
  const currentUserId = currentUser?.id || familyMembers[0]?.id || '';

  useEffect(() => {
    localStorage.setItem('familyGoals', JSON.stringify(familyGoals));
  }, [familyGoals]);

  // Отключаем ProfileOnboarding в демо-режиме
  // useEffect(() => {
  //   const needsSetup = localStorage.getItem('needsProfileSetup');
  //   if (needsSetup === 'true' && currentUser && !membersLoading) {
  //     setShowProfileOnboarding(true);
  //   }
  // }, [currentUser, membersLoading]);

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
    },
    {
      id: 'panels',
      title: 'Боковые панели',
      description: 'Панели слева и справа можно раздвигать и сдвигать с помощью кнопок со стрелками',
      icon: 'PanelLeftOpen',
      position: 'both',
      action: () => {}
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
    if (confirm('Сбросить все демо-данные и начать заново? Это действие нельзя отменить.')) {
      localStorage.clear();
      window.location.reload();
    }
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
    { id: 'family', icon: 'Users', label: 'Профили семьи' },
    { id: 'tasks', icon: 'CheckSquare', label: 'Задачи' },
    { id: 'calendar', icon: 'Calendar', label: 'Календарь' },
    { id: 'goals', icon: 'Target', label: 'Цели' },
    { id: 'cohesion', icon: 'TrendingUp', label: 'Сплочённость' },
    { id: 'children', icon: 'Baby', label: 'Дети' },
    { id: 'chat', icon: 'MessageCircle', label: 'Чат' },
    { id: 'values', icon: 'Heart', label: 'Ценности' },
    { id: 'traditions', icon: 'Sparkles', label: 'Традиции' },
    { id: 'rules', icon: 'Scale', label: 'Правила' },
    { id: 'blog', icon: 'BookOpen', label: 'Блог' },
    { id: 'album', icon: 'Image', label: 'Альбом' },
    { id: 'tree', icon: 'GitBranch', label: 'Древо' },
    { id: 'faith', icon: 'Church', label: 'Вера' },
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

  const [showDevSections, setShowDevSections] = useState(false);

  const inDevelopmentSections = [
    { id: 'garage', icon: 'Car', label: 'Гараж', path: '/garage' },
    { id: 'health', icon: 'Heart', label: 'Здоровье', path: '/health' },
    { id: 'finance', icon: 'Wallet', label: 'Финансы', path: '/finance' },
    { id: 'education', icon: 'GraduationCap', label: 'Образование', path: '/education' },
    { id: 'travel', icon: 'Plane', label: 'Путешествия', path: '/travel' },
    { id: 'pets', icon: 'PawPrint', label: 'Питомцы', path: '/pets' },
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

  const addShoppingItem = () => {
    if (!newItemName.trim()) return;
    
    const newItem: ShoppingItem = {
      id: Date.now().toString(),
      name: newItemName,
      category: newItemCategory,
      quantity: newItemQuantity,
      priority: newItemPriority,
      bought: false,
      addedBy: currentUserId,
      addedByName: currentUser?.name || 'Неизвестно',
      addedAt: new Date().toISOString()
    };
    
    const updatedList = [...shoppingList, newItem];
    setShoppingList(updatedList);
    localStorage.setItem('shoppingList', JSON.stringify(updatedList));
    
    setNewItemName('');
    setNewItemQuantity('');
    setNewItemPriority('normal');
    setShowAddItemDialog(false);
  };

  const toggleShoppingItem = (itemId: string) => {
    const updatedList = shoppingList.map(item =>
      item.id === itemId ? { ...item, bought: !item.bought } : item
    );
    setShoppingList(updatedList);
    localStorage.setItem('shoppingList', JSON.stringify(updatedList));
  };

  const deleteShoppingItem = (itemId: string) => {
    const updatedList = shoppingList.filter(item => item.id !== itemId);
    setShoppingList(updatedList);
    localStorage.setItem('shoppingList', JSON.stringify(updatedList));
  };

  const clearBoughtItems = () => {
    const updatedList = shoppingList.filter(item => !item.bought);
    setShoppingList(updatedList);
    localStorage.setItem('shoppingList', JSON.stringify(updatedList));
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
      {/* Отключаем ProfileOnboarding в демо-режиме */}
      {/* <ProfileOnboarding
        isOpen={showProfileOnboarding}
        onComplete={() => {
          setShowProfileOnboarding(false);
          window.location.reload();
        }}
        memberId={currentUserId}
        memberName={currentUser?.name || 'Пользователь'}
      /> */}

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
              <div className="inline-block bg-white rounded-3xl p-6 shadow-2xl">
                <img 
                  src="https://cdn.poehali.dev/files/a67685fd-8ec7-4694-834f-a78a0bab03f2.jpeg" 
                  alt="Семейный Органайзер"
                  className="w-64 h-64 md:w-80 md:h-80 mx-auto object-contain"
                />
              </div>
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
              
              <div className="mt-8 space-y-2">
                <p className="text-sm text-gray-500 animate-fade-in" style={{ animationDelay: '4s' }}>
                  Нажмите в любом месте, чтобы продолжить
                </p>
                <p className="text-xs text-gray-400 animate-fade-in" style={{ animationDelay: '5s' }}>
                  🎭 Демо-режим: все данные хранятся локально в вашем браузере
                </p>
              </div>
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
                className="h-9 gap-1.5 px-3"
                title="Сбросить демо"
              >
                <Icon name="RotateCcw" size={18} />
                <span className="text-sm hidden md:inline">Сбросить</span>
              </Button>
              
              <SettingsMenu />
              
              <Button
                onClick={() => navigate('/instructions')}
                variant="ghost"
                size="sm"
                className="h-9 gap-1.5 px-3"
                title="Инструкции"
              >
                <Icon name="BookOpen" size={18} />
                <span className="text-sm hidden md:inline">Инструкции</span>
              </Button>
              
              {currentUser && (
                <Button
                  onClick={() => navigate(`/member/${currentUser.id}`)}
                  variant="ghost"
                  size="sm"
                  className="h-9 gap-1.5 px-3"
                  title="Мой профиль"
                >
                  <Icon name="UserCircle" size={18} />
                  <span className="text-sm hidden md:inline">Профиль</span>
                </Button>
              )}
              
              <FamilyMemberSwitcher />
            </div>
            
            <div className="flex items-center gap-2 language-selector theme-selector relative">
              <Button
                onClick={() => {
                  setShowLanguageSelector(!showLanguageSelector);
                  setShowThemeSelector(false);
                }}
                variant="ghost"
                size="sm"
                className="h-9 gap-1.5 px-3"
                title="Выбор языка"
              >
                <Icon name="Languages" size={18} />
                <span className="text-sm hidden md:inline">Язык</span>
              </Button>
              
              <Button
                onClick={() => {
                  setShowThemeSelector(!showThemeSelector);
                  setShowLanguageSelector(false);
                }}
                variant="ghost"
                size="sm"
                className="h-9 gap-1.5 px-3"
                title="Выбор стиля"
              >
                <Icon name="Palette" size={18} />
                <span className="text-sm hidden md:inline">Стиль</span>
              </Button>
              
              <Button
                onClick={toggleAutoHide}
                variant="ghost"
                size="sm"
                className={`h-9 gap-1.5 px-3 ${autoHideTopBar ? 'text-blue-600' : 'text-gray-400'}`}
                title={autoHideTopBar ? 'Автоскрытие включено' : 'Автоскрытие выключено'}
              >
                <Icon name={autoHideTopBar ? 'EyeOff' : 'Eye'} size={18} />
                <span className="text-sm hidden md:inline">{autoHideTopBar ? 'Скрыто' : 'Видимо'}</span>
              </Button>
              
              {showLanguageSelector && (
                <Card className="language-selector dropdown-menu absolute right-0 top-full mt-2 w-80 max-w-[calc(100vw-2rem)] border-2 border-blue-300 shadow-2xl animate-fade-in">
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
                <Card className="theme-selector dropdown-menu absolute right-0 top-full mt-2 w-80 max-w-[calc(100vw-2rem)] border-2 border-indigo-300 shadow-2xl animate-fade-in">
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
          className={`fixed left-0 top-20 z-[60] bg-white/95 backdrop-blur-md shadow-lg transition-transform duration-300 ${
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
                onClick={() => setShowLeftPanelSettings(true)}
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                title="Настройки панели"
              >
                <Icon name="Settings" size={14} />
              </Button>
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
            <div className="space-y-2 mb-3 pb-3 border-b border-gray-200">
              {currentUser && (
                <button
                  onClick={() => navigate(`/member/${currentUser.id}`)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 hover:border-purple-300 transition-all"
                >
                  {currentUser.photoUrl ? (
                    <img 
                      src={currentUser.photoUrl} 
                      alt={currentUser.name}
                      className="w-10 h-10 rounded-full object-cover border-2 border-purple-300"
                    />
                  ) : (
                    <div className="text-2xl">{currentUser.avatar || '👤'}</div>
                  )}
                  <div className="flex-1 text-left">
                    <div className="text-sm font-bold text-purple-700">Мой профиль</div>
                    <div className="text-xs text-gray-600">{currentUser.name}</div>
                  </div>
                  <Icon name="ChevronRight" size={16} className="text-purple-400" />
                </button>
              )}
              
              <button
                onClick={() => navigate('/instructions')}
                className="w-full flex items-center gap-3 p-3 rounded-lg bg-blue-50 border-2 border-blue-200 hover:border-blue-300 transition-all"
              >
                <Icon name="BookOpen" size={20} className="text-blue-600" />
                <div className="flex-1 text-left">
                  <div className="text-sm font-bold text-blue-700">Инструкции</div>
                  <div className="text-xs text-gray-600">Помощь по разделам</div>
                </div>
                <Icon name="ChevronRight" size={16} className="text-blue-400" />
              </button>
              
              <button
                onClick={() => setShowFamilyInvite(true)}
                className="w-full flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 hover:border-green-300 transition-all"
              >
                <Icon name="UserPlus" size={20} className="text-green-600" />
                <div className="flex-1 text-left">
                  <div className="text-sm font-bold text-green-700">Управление семьёй</div>
                  <div className="text-xs text-gray-600">Пригласить родственников</div>
                </div>
                <Icon name="ChevronRight" size={16} className="text-green-400" />
              </button>
            </div>
            
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
                onClick={() => setShowRightPanelSettings(true)}
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                title="Настройки панели"
              >
                <Icon name="Settings" size={14} />
              </Button>
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
                    <div className="relative">
                      {member.photoUrl ? (
                        <img 
                          src={member.photoUrl} 
                          alt={member.name}
                          className="w-10 h-10 rounded-full object-cover border-2 border-purple-300"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center text-xl border-2 border-purple-300">
                          {member.avatar}
                        </div>
                      )}
                      {member.moodStatus && (
                        <div className="absolute -bottom-1 -right-1 text-lg bg-white rounded-full border-2 border-white">
                          {member.moodStatus.emoji}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-medium">{member.name}</p>
                      <p className="text-[10px] text-gray-500">{member.role}</p>
                      {member.moodStatus && (
                        <p className="text-[9px] text-gray-400">
                          {member.moodStatus.label} • {new Date(member.moodStatus.timestamp).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-center flex items-center gap-1">
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
        <div 
          className="relative -mx-4 lg:-mx-8 mb-8 overflow-hidden rounded-2xl"
          style={{
            backgroundImage: 'url(https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/99031d20-2ea8-4a39-a89e-1ebe098b6ba4.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            height: '240px'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/85 via-white/75 to-white/65 backdrop-blur-[1px]"></div>
          <div className="relative h-full flex flex-col items-center justify-center px-6">
            <div className="flex items-center gap-4 mb-2">
              <img 
                src="https://cdn.poehali.dev/files/a67685fd-8ec7-4694-834f-a78a0bab03f2.jpeg" 
                alt="Логотип"
                className="w-28 h-28 lg:w-36 lg:h-36 object-contain"
              />
              <div className="flex flex-col gap-1">
                <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-orange-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
                  Семейный Органайзер
                </h1>
                <h2 className="text-xl lg:text-2xl font-semibold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
                  Семейная Экосистема
                </h2>
                <h3 className="text-lg lg:text-xl font-medium bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 bg-clip-text text-transparent">
                  Вселенная Семьи
                </h3>
              </div>
              <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm px-3 py-1">
                ДЕМО
              </Badge>
            </div>
            <p className="text-sm lg:text-base text-gray-700 font-medium flex items-center justify-center gap-2 mt-2">
              Вместе мы — сила! Организуйте жизнь семьи с любовью ❤️
              {syncing && (
                <Badge className="bg-blue-600 animate-pulse">
                  <Icon name="RefreshCw" className="mr-1 animate-spin" size={12} />
                  Синхронизация
                </Badge>
              )}
              {!syncing && getLastSyncTime() && (
                <Badge variant="outline" className="text-xs">
                  Обновлено: {new Date(getLastSyncTime()!).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                </Badge>
              )}
            </p>
          </div>
        </div>

        <Tabs value={activeSection} onValueChange={setActiveSection} className="mb-6">
          <TabsList className="flex flex-wrap gap-2 h-auto p-2 bg-white/95 backdrop-blur-sm justify-start rounded-xl shadow-md border border-gray-200">
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
            <TabsTrigger value="goals" className="text-xs lg:text-sm py-2 px-3 whitespace-nowrap">
              <Icon name="Target" className="mr-1" size={14} />
              Цели
            </TabsTrigger>
            <TabsTrigger value="cohesion" className="text-xs lg:text-sm py-2 px-3 whitespace-nowrap">
              <Icon name="TrendingUp" className="mr-1" size={14} />
              Сплочённость
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
            <TabsTrigger value="shopping" className="text-xs lg:text-sm py-2 px-3 whitespace-nowrap">
              <Icon name="ShoppingCart" className="mr-1" size={14} />
              Покупки
            </TabsTrigger>
            
            <Button
              onClick={() => navigate('/community')}
              variant="outline"
              size="sm"
              className="text-xs lg:text-sm py-2 px-3 whitespace-nowrap border-purple-300 bg-purple-50 hover:bg-purple-100 h-9"
            >
              <Icon name="Users" className="mr-1" size={14} />
              Сообщество
            </Button>
            
            <Button
              onClick={() => navigate('/family-code')}
              variant="outline"
              size="sm"
              className="text-xs lg:text-sm py-2 px-3 whitespace-nowrap border-purple-300 bg-purple-50 hover:bg-purple-100 h-9"
            >
              <Icon name="Scale" className="mr-1" size={14} />
              Семейный кодекс
            </Button>
            
            <div className="relative">
              <Button
                onClick={() => setShowDevSections(!showDevSections)}
                variant="outline"
                size="sm"
                className="text-xs lg:text-sm py-2 px-3 whitespace-nowrap border-amber-300 bg-amber-50 hover:bg-amber-100 h-9"
              >
                <Icon name="Wrench" className="mr-1" size={14} />
                В разработке
                <Badge className="ml-2 bg-amber-500 text-white text-[10px] px-1 py-0">{inDevelopmentSections.length}</Badge>
                <Icon name={showDevSections ? 'ChevronUp' : 'ChevronDown'} className="ml-1" size={14} />
              </Button>
              
              {showDevSections && (
                <div className="absolute top-full left-0 mt-2 z-50 bg-white rounded-lg shadow-xl border border-amber-300 p-2 min-w-[200px] animate-fade-in">
                  <div className="space-y-1">
                    {inDevelopmentSections.map((section) => (
                      <Button
                        key={section.id}
                        onClick={() => navigate(section.path)}
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-xs hover:bg-amber-50"
                      >
                        <Icon name={section.icon} className="mr-2" size={14} />
                        {section.label}
                        <Badge className="ml-auto bg-amber-500 text-white text-[10px] px-1 py-0">DEV</Badge>
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TabsList>

        <header className="text-center mb-8 relative -mx-4 lg:-mx-8 py-6 rounded-2xl overflow-hidden" style={{
            backgroundImage: 'url(https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/99031d20-2ea8-4a39-a89e-1ebe098b6ba4.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}>
          <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/85 to-white/80 backdrop-blur-[1px]"></div>
          <div className="relative">
          <h1 className={`${themeClasses.headingFont} text-3xl lg:text-4xl font-bold bg-gradient-to-r ${themeClasses.primaryGradient.replace('bg-gradient-to-r ', '')} bg-clip-text text-transparent mb-3 mt-2 animate-fade-in`}>
            {getSectionTitle(activeSection)}
          </h1>
          
          <p className="text-lg lg:text-xl text-gray-700 font-medium animate-fade-in" style={{ animationDelay: '0.2s' }}>
            {activeSection === 'tasks' && 'Управление задачами семьи'}
            {activeSection === 'calendar' && 'Семейные события и планы'}
            {activeSection === 'family' && 'Просмотр и редактирование профилей всех членов семьи'}
            {activeSection === 'goals' && 'Долгосрочное планирование и контроль целей'}
            {activeSection === 'cohesion' && 'Анализ сплочённости и рейтинг семьи'}
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
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card key="stat-points" className="animate-fade-in hover:shadow-lg transition-all border-l-4 border-l-orange-500" style={{ animationDelay: '0.1s' }}>
            <CardHeader>
              <div className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Всего баллов</CardTitle>
                <Icon name="Award" className="text-orange-500" size={20} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">{totalPoints}</div>
            </CardContent>
          </Card>

          <Card key="stat-workload" className="animate-fade-in hover:shadow-lg transition-all border-l-4 border-l-pink-500" style={{ animationDelay: '0.2s' }}>
            <CardHeader>
              <div className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Средняя загрузка</CardTitle>
                <Icon name="TrendingUp" className="text-pink-500" size={20} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-pink-600">{avgWorkload}%</div>
            </CardContent>
          </Card>

          <Card key="stat-tasks" className="animate-fade-in hover:shadow-lg transition-all border-l-4 border-l-purple-500" style={{ animationDelay: '0.3s' }}>
            <CardHeader>
              <div className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Задачи выполнены</CardTitle>
                <Icon name="CheckCircle2" className="text-purple-500" size={20} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">{completedTasks}/{totalTasks}</div>
            </CardContent>
          </Card>

          <Card key="stat-members" className="animate-fade-in hover:shadow-lg transition-all border-l-4 border-l-blue-500" style={{ animationDelay: '0.4s' }}>
            <CardHeader>
              <div className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Членов семьи</CardTitle>
                <Icon name="Users" className="text-blue-500" size={20} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{familyMembers.length}</div>
            </CardContent>
          </Card>
        </div>



        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="space-y-6">
              <TabsContent value="cohesion">
                <div className="space-y-6">
                  <FamilyCohesionChart 
                    familyMembers={familyMembers}
                    tasks={tasks}
                    chatMessagesCount={chatMessages.length}
                    albumPhotosCount={familyAlbum.length}
                    lastActivityDays={0}
                    totalFamilies={1250}
                  />
                </div>
              </TabsContent>

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
                          <Badge>{getMemberById(task.assignee_id || task.assignee || '')?.name || 'Не назначено'}</Badge>
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
                  {childrenProfiles.length > 0 ? childrenProfiles.map((child, idx) => {
                    const devPlan = developmentPlans.find(dp => dp.childId === child.childId);
                    const avgProgress = devPlan?.skills ? Math.round(devPlan.skills.reduce((sum, s) => sum + s.progress, 0) / devPlan.skills.length) : 0;
                    const completedMilestones = devPlan?.milestones.filter(m => m.completed).length || 0;
                    const totalMilestones = devPlan?.milestones.length || 0;
                    
                    const familyMember = familyMembers.find(m => m.id === child.childId);
                    const actualAge = familyMember?.age || child.age;
                    const actualAvatar = familyMember?.photoUrl || familyMember?.avatar || child.avatar;
                    
                    return (
                      <Card key={child.id} className="animate-fade-in" style={{ animationDelay: `${idx * 0.1}s` }}>
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              {familyMember?.photoUrl ? (
                                <img 
                                  src={familyMember.photoUrl} 
                                  alt={child.name}
                                  className="w-16 h-16 rounded-full object-cover border-2 border-purple-300"
                                />
                              ) : (
                                <span className="text-4xl">{actualAvatar}</span>
                              )}
                              <div>
                                <div className="flex items-center gap-2">
                                  <CardTitle className="text-2xl">{child.name}</CardTitle>
                                  <Badge>{actualAge} лет</Badge>
                                  <Badge variant="outline" className="bg-blue-50">{child.grade} класс</Badge>
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">{child.personality}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-3xl font-bold text-purple-600">{avgProgress}%</div>
                              <p className="text-xs text-gray-500">Общий прогресс</p>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                            <div className="p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border-2 border-purple-200">
                              <div className="flex items-center justify-between mb-1">
                                <Icon name="Target" className="text-purple-600" size={20} />
                                <span className="text-2xl font-bold text-purple-600">{completedMilestones}/{totalMilestones}</span>
                              </div>
                              <p className="text-xs font-medium text-purple-900">Цели достигнуто</p>
                            </div>
                            
                            <div className="p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border-2 border-blue-200">
                              <div className="flex items-center justify-between mb-1">
                                <Icon name="Sparkles" className="text-blue-600" size={20} />
                                <span className="text-2xl font-bold text-blue-600">{devPlan?.skills.length || 0}</span>
                              </div>
                              <p className="text-xs font-medium text-blue-900">Навыков развивается</p>
                            </div>
                            
                            <div className="p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border-2 border-green-200">
                              <div className="flex items-center justify-between mb-1">
                                <Icon name="Calendar" className="text-green-600" size={20} />
                                <span className="text-2xl font-bold text-green-600">{devPlan?.schedule.length || 0}</span>
                              </div>
                              <p className="text-xs font-medium text-green-900">Занятий в неделю</p>
                            </div>
                            
                            <div className="p-3 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border-2 border-orange-200">
                              <div className="flex items-center justify-between mb-1">
                                <Icon name="Trophy" className="text-orange-600" size={20} />
                                <span className="text-2xl font-bold text-orange-600">{child.achievements?.length || 0}</span>
                              </div>
                              <p className="text-xs font-medium text-orange-900">Достижений</p>
                            </div>
                          </div>
                          
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                                <Icon name="TrendingUp" size={14} className="text-purple-600" />
                                Развиваемые навыки
                              </h4>
                              <div className="space-y-2">
                                {devPlan?.skills.slice(0, 3).map((skill, i) => (
                                  <div key={`${child.id}-skill-${i}`} className="bg-gray-50 rounded-lg p-2">
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="text-xs font-medium">{skill.skillName}</span>
                                      <Badge variant="outline" className="text-[10px] h-5">{skill.progress}%</Badge>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                                      <div 
                                        className="bg-gradient-to-r from-purple-500 to-blue-500 h-1.5 rounded-full transition-all"
                                        style={{ width: `${skill.progress}%` }}
                                      />
                                    </div>
                                  </div>
                                )) || <p className="text-xs text-gray-500">Навыки не добавлены</p>}
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                                <Icon name="Award" size={14} className="text-orange-600" />
                                Последние достижения
                              </h4>
                              <div className="space-y-1">
                                {child.achievements && child.achievements.length > 0 ? (
                                  child.achievements.slice(0, 3).map((achievement, i) => (
                                    <div key={`${child.id}-achievement-${i}`} className="text-xs flex items-start gap-2 p-2 bg-orange-50 rounded">
                                      <Icon name="Trophy" size={12} className="text-orange-500 mt-0.5 flex-shrink-0" />
                                      <span>{achievement}</span>
                                    </div>
                                  ))
                                ) : (
                                  <p className="text-xs text-gray-500">Достижений пока нет</p>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                              <Icon name="CalendarDays" size={14} className="text-blue-600" />
                              Расписание недели
                            </h4>
                            <div className="space-y-2">
                              {devPlan?.schedule && devPlan.schedule.length > 0 ? (
                                devPlan.schedule.map((activity, i) => (
                                  <div key={`${child.id}-schedule-${i}`} className={`p-3 rounded-lg border-2 ${activity.color}`}>
                                    <div className="flex items-start justify-between gap-2">
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                          <span className="text-xs font-bold text-gray-900">{activity.name}</span>
                                          <Badge variant="outline" className="text-[9px] h-4 px-1">{activity.category}</Badge>
                                        </div>
                                        <div className="space-y-0.5 text-[10px] text-gray-600">
                                          <div className="flex items-center gap-1">
                                            <Icon name="Calendar" size={10} />
                                            <span>{activity.dayOfWeek}</span>
                                            <span className="mx-1">•</span>
                                            <Icon name="Clock" size={10} />
                                            <span>{activity.time}</span>
                                            <span className="text-gray-400">({activity.duration})</span>
                                          </div>
                                          {activity.location && (
                                            <div className="flex items-center gap-1">
                                              <Icon name="MapPin" size={10} />
                                              <span>{activity.location}</span>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                      <div className="text-lg">
                                        {activity.category === 'Спорт' ? '⚽' : 
                                         activity.category === 'STEM' ? '🤖' : 
                                         activity.category === 'Творчество' ? '🎨' : 
                                         activity.category === 'Музыка' ? '🎹' : '📚'}
                                      </div>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <p className="text-xs text-gray-500 text-center py-2">Расписание не заполнено</p>
                              )}
                            </div>
                          </div>
                          
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                                <Icon name="Lightbulb" size={14} className="text-yellow-600" />
                                Рекомендации ИИ
                              </h4>
                              <div className="p-3 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg border border-yellow-200">
                                <p className="text-xs text-gray-700">
                                  {child.id === 'child-3' 
                                    ? '🎯 Отличный прогресс в логическом мышлении! Рекомендуем добавить курс по математическим олимпиадам и увеличить время на проекты по робототехнике.'
                                    : '🎨 Творческие способности развиваются прекрасно! Предлагаем добавить занятия музыкальной импровизацией и участие в театральной студии.'}
                                </p>
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                                <Icon name="BarChart3" size={14} className="text-indigo-600" />
                                Загруженность по дням
                              </h4>
                              <div className="grid grid-cols-7 gap-1">
                                {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((day, dayIndex) => {
                                  const dayActivities = devPlan?.schedule.filter(act => 
                                    act.dayOfWeek === ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'][dayIndex]
                                  ).length || 0;
                                  const intensity = dayActivities === 0 ? 'bg-gray-100' : 
                                                   dayActivities === 1 ? 'bg-green-200' : 
                                                   dayActivities === 2 ? 'bg-yellow-300' : 'bg-red-300';
                                  
                                  return (
                                    <div key={`${child.id}-day-${dayIndex}`} className="flex flex-col items-center">
                                      <div className={`w-full h-12 rounded ${intensity} flex items-center justify-center text-xs font-bold transition-all hover:scale-105`}>
                                        {dayActivities}
                                      </div>
                                      <span className="text-[9px] text-gray-600 mt-0.5">{day}</span>
                                    </div>
                                  );
                                })}
                              </div>
                              <div className="flex items-center gap-2 mt-2 text-[9px] text-gray-500">
                                <div className="flex items-center gap-1">
                                  <div className="w-2 h-2 rounded bg-gray-100"></div>
                                  <span>Нет</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <div className="w-2 h-2 rounded bg-green-200"></div>
                                  <span>1</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <div className="w-2 h-2 rounded bg-yellow-300"></div>
                                  <span>2</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <div className="w-2 h-2 rounded bg-red-300"></div>
                                  <span>3+</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="pt-2 grid grid-cols-2 gap-2">
                            <Button
                              onClick={() => setEducationChild(familyMembers.find(m => m.id === child.childId) || null)}
                              className="bg-gradient-to-r from-purple-600 to-blue-600"
                            >
                              <Icon name="GraduationCap" className="mr-2" size={16} />
                              Тесты и развитие
                            </Button>
                            <Button
                              onClick={() => navigate(`/member/${child.childId}`)}
                              variant="outline"
                              className="border-purple-300"
                            >
                              <Icon name="User" className="mr-2" size={16} />
                              Полный профиль
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  }) : (
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
                        <CardTitle>
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{value.icon}</span>
                            <span>{value.title}</span>
                          </div>
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
                        <CardTitle>
                          <div className="flex items-center gap-3">
                            <span className="text-3xl">{tradition.icon}</span>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <span>{tradition.name}</span>
                                <Badge className={tradition.frequency === 'weekly' ? 'bg-blue-500' : tradition.frequency === 'monthly' ? 'bg-purple-500' : 'bg-pink-500'}>
                                  {tradition.frequency === 'weekly' ? 'Еженедельно' : tradition.frequency === 'monthly' ? 'Ежемесячно' : 'Ежегодно'}
                                </Badge>
                              </div>
                            </div>
                          </div>
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

              <TabsContent value="goals">
                <GoalsSection
                  goals={familyGoals}
                  familyMembers={familyMembers}
                  currentUserId={currentUserId}
                  onAddGoal={(goalData) => {
                    const newGoal: FamilyGoal = {
                      ...goalData,
                      id: Date.now().toString(),
                      createdAt: new Date().toISOString()
                    };
                    const updatedGoals = [...familyGoals, newGoal];
                    setFamilyGoals(updatedGoals);
                    localStorage.setItem('familyGoals', JSON.stringify(updatedGoals));
                  }}
                  onUpdateGoal={(goalId, updates) => {
                    const updatedGoals = familyGoals.map(g => 
                      g.id === goalId ? { ...g, ...updates } : g
                    );
                    setFamilyGoals(updatedGoals);
                    localStorage.setItem('familyGoals', JSON.stringify(updatedGoals));
                  }}
                  onDeleteGoal={(goalId) => {
                    const updatedGoals = familyGoals.filter(g => g.id !== goalId);
                    setFamilyGoals(updatedGoals);
                    localStorage.setItem('familyGoals', JSON.stringify(updatedGoals));
                  }}
                />
              </TabsContent>

              <TabsContent value="shopping">
                <Card key="shopping-card">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Icon name="ShoppingCart" />
                        Список покупок
                      </CardTitle>
                      <div className="flex gap-2">
                        {shoppingList.some(item => item.bought) && (
                          <Button variant="outline" size="sm" onClick={clearBoughtItems}>
                            <Icon name="Trash2" className="mr-2" size={14} />
                            Очистить купленное
                          </Button>
                        )}
                        <Dialog open={showAddItemDialog} onOpenChange={setShowAddItemDialog}>
                          <DialogTrigger asChild>
                            <Button className="bg-gradient-to-r from-green-500 to-blue-500">
                              <Icon name="Plus" className="mr-2" size={16} />
                              Добавить товар
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Добавить товар</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 pt-4">
                              <div>
                                <label className="text-sm font-medium mb-2 block">Название товара</label>
                                <Input
                                  placeholder="Молоко, хлеб..."
                                  value={newItemName}
                                  onChange={(e) => setNewItemName(e.target.value)}
                                />
                              </div>
                              <div>
                                <label className="text-sm font-medium mb-2 block">Категория</label>
                                <select
                                  value={newItemCategory}
                                  onChange={(e) => setNewItemCategory(e.target.value as any)}
                                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-md"
                                >
                                  <option value="products">🥛 Продукты</option>
                                  <option value="household">🧴 Хозтовары</option>
                                  <option value="clothes">👕 Одежда</option>
                                  <option value="other">📦 Другое</option>
                                </select>
                              </div>
                              <div>
                                <label className="text-sm font-medium mb-2 block">Количество (опционально)</label>
                                <Input
                                  placeholder="2 литра, 1 кг..."
                                  value={newItemQuantity}
                                  onChange={(e) => setNewItemQuantity(e.target.value)}
                                />
                              </div>
                              <div>
                                <label className="text-sm font-medium mb-2 block">Приоритет</label>
                                <select
                                  value={newItemPriority}
                                  onChange={(e) => setNewItemPriority(e.target.value as any)}
                                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-md"
                                >
                                  <option value="normal">Обычный</option>
                                  <option value="urgent">🔥 Срочно</option>
                                </select>
                              </div>
                              <Button onClick={addShoppingItem} className="w-full">
                                Добавить
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {shoppingList.length > 0 ? (
                      <div className="space-y-2">
                        {shoppingList.map((item, idx) => (
                          <div
                            key={item.id}
                            className={`p-3 rounded-lg border-2 transition-all animate-fade-in ${
                              item.bought ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-300 hover:border-green-400'
                            }`}
                            style={{ animationDelay: `${idx * 0.05}s` }}
                          >
                            <div className="flex items-center gap-3">
                              <Checkbox
                                checked={item.bought}
                                onCheckedChange={() => toggleShoppingItem(item.id)}
                              />
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <h4 className={`font-semibold ${item.bought ? 'line-through text-gray-400' : ''}`}>
                                    {item.name}
                                  </h4>
                                  {item.priority === 'urgent' && (
                                    <Badge className="bg-red-500 text-white">Срочно</Badge>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="outline" className="text-xs">
                                    {item.category === 'products' && '🥛 Продукты'}
                                    {item.category === 'household' && '🧴 Хозтовары'}
                                    {item.category === 'clothes' && '👕 Одежда'}
                                    {item.category === 'other' && '📦 Другое'}
                                  </Badge>
                                  {item.quantity && (
                                    <span className="text-xs text-gray-600">{item.quantity}</span>
                                  )}
                                  <span className="text-xs text-gray-500">• {item.addedByName}</span>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteShoppingItem(item.id)}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              >
                                <Icon name="Trash2" size={16} />
                              </Button>
                            </div>
                          </div>
                        ))}
                        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium">Всего товаров: {shoppingList.length}</span>
                            <span className="text-gray-600">
                              Куплено: {shoppingList.filter(item => item.bought).length} • Осталось: {shoppingList.filter(item => !item.bought).length}
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-8 text-center">
                        <Icon name="ShoppingCart" size={48} className="mx-auto mb-4 text-green-500" />
                        <h3 className="text-lg font-semibold mb-2">Список покупок пуст</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Добавьте первый товар, чтобы начать планировать покупки
                        </p>
                      </div>
                    )}
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
                updateMember={updateMember}
              />
            </div>
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

            <div key="sidebar-meal-voting" className="animate-fade-in" style={{ animationDelay: '0.6s' }}>
              <MealVotingWidget />
            </div>

            <Card key="sidebar-reminders" className="animate-fade-in border-orange-200 bg-gradient-to-br from-orange-50 to-yellow-50" style={{ animationDelay: '0.7s' }}>
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
        </Tabs>
        </div>
      </div>

      <Dialog open={educationChild !== null} onOpenChange={(open) => !open && setEducationChild(null)}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Образовательный центр</DialogTitle>
          </DialogHeader>
          {educationChild && (
            <ChildEducation 
              child={educationChild} 
              onComplete={() => setEducationChild(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      <BottomBar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        autoHide={autoHideBottomBar}
        onAutoHideChange={handleAutoHideBottomBarChange}
        isVisible={isBottomBarVisible}
        onVisibilityChange={setIsBottomBarVisible}
        availableSections={availableSections}
        selectedSections={bottomBarSections}
        onSectionsChange={handleBottomBarSectionsChange}
      />

      <PanelSettings
        title="Настройки верхней панели"
        open={showTopPanelSettings}
        onOpenChange={setShowTopPanelSettings}
        autoHide={autoHideTopBar}
        onAutoHideChange={(value) => {
          setAutoHideTopBar(value);
          localStorage.setItem('autoHideTopBar', String(value));
        }}
        availableSections={availableSections}
        selectedSections={topPanelSections}
        onSectionsChange={handleTopPanelSectionsChange}
      />

      <PanelSettings
        title="Настройки левой панели"
        open={showLeftPanelSettings}
        onOpenChange={setShowLeftPanelSettings}
        autoHide={autoHideLeftMenu}
        onAutoHideChange={(value) => {
          setAutoHideLeftMenu(value);
          localStorage.setItem('autoHideLeftMenu', String(value));
        }}
        availableSections={availableSections}
        selectedSections={leftPanelSections}
        onSectionsChange={handleLeftPanelSectionsChange}
      />

      <PanelSettings
        title="Настройки правой панели"
        open={showRightPanelSettings}
        onOpenChange={setShowRightPanelSettings}
        autoHide={autoHideMoodWidget}
        onAutoHideChange={(value) => {
          setAutoHideMoodWidget(value);
          localStorage.setItem('autoHideMoodWidget', String(value));
        }}
        availableSections={availableSections}
        selectedSections={rightPanelSections}
        onSectionsChange={handleRightPanelSectionsChange}
      />
      
      <RightSidebar
        isVisible={isMoodWidgetVisible}
        autoHide={autoHideMoodWidget}
        familyMembers={familyMembers}
        selectedMemberForMood={selectedMemberForMood}
        moodOptions={moodOptions}
        showRightPanelSettings={showRightPanelSettings}
        onVisibilityChange={setIsMoodWidgetVisible}
        onMemberMoodSelect={setSelectedMemberForMood}
        onMoodChange={handleMoodChange}
        onRightPanelSettingsToggle={setShowRightPanelSettings}
      />
      
      {chamomileEnabled && <ClickChamomile enabled={chamomileEnabled} soundEnabled={soundEnabled} />}
    </>
  );
}