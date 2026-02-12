import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTasks } from '@/hooks/useTasks';
import { useFamilyMembersContext } from '@/contexts/FamilyMembersContext';
import { useFamilyData } from '@/hooks/useFamilyData';
import { ChildEducation } from '@/components/ChildEducation';
import { ClickChamomile } from '@/components/ClickChamomile';
import Footer from '@/components/Footer';
import { getDailyMotto } from '@/utils/dailyMottos';
import WidgetSettings from '@/components/WidgetSettings';
import type { WidgetConfig } from '@/components/WidgetSettings';
import type {
  FamilyMember,
  Task,
  Reminder,
  Tradition,
  FamilyValue,
  BlogPost,
  ImportantDate,

  ChildProfile,
  DevelopmentPlan,
  ChatMessage,
  FamilyAlbum,
  FamilyNeed,
  FamilyTreeMember,
  CalendarEvent,
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

  initialChatMessages,
  initialFamilyAlbum,
  initialFamilyNeeds,
  initialFamilyTree,
  initialCalendarEvents,
  initialFamilyGoals,
  initialComplaints,
  initialShoppingList,
  getWeekDays,
} from '@/data/mockData';
import { FamilyTabsContent } from '@/components/FamilyTabsContent';
import { FamilyMembersGrid } from '@/components/FamilyMembersGrid';
import { GoalsSection } from '@/components/GoalsSection';
import { getTranslation, languageOptions, type LanguageCode } from '@/translations';
import SettingsDropdown from '@/components/SettingsDropdown';
import FamilyInviteManager from '@/components/FamilyInviteManager';
import { FamilyCohesionChart } from '@/components/FamilyCohesionChart';
import BottomBar from '@/components/BottomBar';
import FamilyMemberSwitcher from '@/components/FamilyMemberSwitcher';
import { WelcomeScreen } from '@/components/index-page/WelcomeScreen';
import { IndexLayout } from '@/components/index-page/IndexLayout';
import { IndexDialogs } from '@/components/index-page/IndexDialogs';
import { FamilyHeaderBanner } from '@/components/index-page/FamilyHeaderBanner';
import { ComplaintBook } from '@/components/ComplaintBook';
import AIAssistantDialog from '@/components/AIAssistantDialog';
import { useAIAssistant } from '@/contexts/AIAssistantContext';
import { FirstLoginWelcome } from '@/components/FirstLoginWelcome';

import { useDevSectionVotes } from '@/hooks/useDevSectionVotes';
import { useBirthdayReminders } from '@/hooks/useBirthdayReminders';
import { useSubscriptionReminder } from '@/hooks/useSubscriptionReminder';
import { useCalendarReminders } from '@/hooks/useCalendarReminders';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import { AddFamilyMemberForm } from '@/components/AddFamilyMemberForm';
import { TasksWidget } from '@/components/TasksWidget';
import PanelSettings from '@/components/PanelSettings';
import { ShoppingWidget } from '@/components/widgets/ShoppingWidget';
import { VotingWidget } from '@/components/widgets/VotingWidget';
import { NutritionWidget } from '@/components/widgets/NutritionWidget';
import { WeeklyMenuWidget } from '@/components/widgets/WeeklyMenuWidget';
import { MedicationsWidget } from '@/components/widgets/MedicationsWidget';
import { CalendarWidget } from '@/components/widgets/CalendarWidget';

interface IndexProps {
  onLogout?: () => void;
}

export default function Index({ onLogout }: IndexProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { members: familyMembersRaw, loading: membersLoading, addMember, updateMember, deleteMember } = useFamilyMembersContext();
  const { tasks: tasksRaw, loading: tasksLoading, toggleTask: toggleTaskDB, createTask, updateTask, deleteTask } = useTasks();
  const { data: familyData, syncing, syncData, getLastSyncTime } = useFamilyData();
  const { hasCompletedSetup } = useAIAssistant();
  const { events: calendarEventsAPI, loading: calendarLoading } = useCalendarEvents();
  const [showAssistantSelector, setShowAssistantSelector] = useState(false);
  const [showFirstLoginWelcome, setShowFirstLoginWelcome] = useState(false);
  
  const authToken = localStorage.getItem('authToken');
  const authUser = localStorage.getItem('userData');
  console.log('Index: authToken =', authToken ? 'EXISTS' : 'NULL');
  console.log('Index: authUser =', authUser);
  console.log('Index: familyMembersRaw =', familyMembersRaw);
  console.log('Index: membersLoading =', membersLoading);

  const familyMembers = familyMembersRaw || [];
  const tasks = tasksRaw || [];
  
  useBirthdayReminders();
  useSubscriptionReminder();
  useCalendarReminders();
  
  const [familyName, setFamilyName] = useState('Наша Семья');
  const [familyLogo, setFamilyLogo] = useState('https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/bucket/90f87bac-e708-4551-b2dc-061dd3d7b0ed.JPG');
  
  useEffect(() => {
    const loadFamilyData = () => {
      // Загружаем название и логотип из localStorage или userData
      const savedFamilyName = localStorage.getItem('familyName');
      const savedFamilyLogo = localStorage.getItem('familyLogo');
      
      if (savedFamilyName) {
        console.log('[DEBUG Index] Using saved familyName:', savedFamilyName);
        setFamilyName(savedFamilyName);
      }
      
      if (savedFamilyLogo) {
        console.log('[DEBUG Index] Using saved familyLogo:', savedFamilyLogo);
        setFamilyLogo(savedFamilyLogo);
      }
      
      // Если прямых ключей нет, пробуем получить из userData
      const userData = localStorage.getItem('userData');
      const hasSeenWelcome = localStorage.getItem('hasSeenFirstLoginWelcome');
      
      if (userData) {
        try {
          const user = JSON.parse(userData);
          console.log('[DEBUG Index] userData from localStorage:', user);
          
          // Проверяем, настроена ли семья (есть название и логотип)
          const hasFamilySetup = user.family_name && user.logo_url;
          
          // Показываем приветствие только при первом входе И если семья еще не настроена
          if (!hasSeenWelcome && !hasFamilySetup && !savedFamilyName) {
            setShowFirstLoginWelcome(true);
            localStorage.setItem('hasSeenFirstLoginWelcome', 'true');
          }
          
          if (!savedFamilyName && user.family_name) {
            console.log('[DEBUG Index] Setting family name from userData:', user.family_name);
            setFamilyName(user.family_name);
          }
          
          if (!savedFamilyLogo && user.logo_url) {
            console.log('[DEBUG Index] Setting logo URL from userData:', user.logo_url);
            setFamilyLogo(user.logo_url);
          }
        } catch (e) {
          console.error('[DEBUG Index] Error parsing userData:', e);
        }
      }
    };
    
    // Загружаем данные при монтировании
    loadFamilyData();
    
    // Слушаем события изменения localStorage (для обновления при сохранении в настройках)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'familyName' || e.key === 'familyLogo' || e.key === 'userData') {
        loadFamilyData();
      }
    };
    
    // Также слушаем кастомное событие для обновления в том же окне
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
    // Проверяем, настроена ли семья (есть название и логотип в userData)
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
    
    // Показываем выбор ассистента только если он не настроен И семья не настроена
    if (!hasCompletedSetup && !hasFamilySetup) {
      const timer = setTimeout(() => {
        setShowAssistantSelector(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [hasCompletedSetup]);
  
  const [reminders, setReminders] = useState<Reminder[]>([]);
  
  const setFamilyMembers = (value: FamilyMember[] | ((prev: FamilyMember[]) => FamilyMember[])) => {
    console.warn('setFamilyMembers deprecated, use updateMember instead');
  };
  const [importantDates] = useState<ImportantDate[]>(initialImportantDates);
  const [familyValues, setFamilyValues] = useState<FamilyValue[]>(() => {
    const saved = localStorage.getItem('familyValues');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return initialFamilyValues;
      }
    }
    return initialFamilyValues;
  });
  const [blogPosts] = useState<BlogPost[]>(initialBlogPosts);
  const [traditions, setTraditions] = useState<Tradition[]>(() => {
    const saved = localStorage.getItem('traditions');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return initialTraditions;
      }
    }
    return initialTraditions;
  });

  const [childrenProfiles] = useState<ChildProfile[]>(initialChildrenProfiles);
  const [developmentPlans] = useState<DevelopmentPlan[]>(initialDevelopmentPlans);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(initialChatMessages);
  const [familyAlbum, setFamilyAlbum] = useState<FamilyAlbum[]>(initialFamilyAlbum);
  const [familyNeeds, setFamilyNeeds] = useState<FamilyNeed[]>(initialFamilyNeeds);
  const [familyTree, setFamilyTree] = useState<FamilyTreeMember[]>(initialFamilyTree);
  const [selectedTreeMember, setSelectedTreeMember] = useState<FamilyTreeMember | null>(null);
  const [showWidgetSettings, setShowWidgetSettings] = useState(false);
  const [widgetSettings, setWidgetSettings] = useState(() => {
    const saved = localStorage.getItem('widgetSettings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });
  const [newMessage, setNewMessage] = useState('');
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>(() => {
    const saved = localStorage.getItem('shoppingList');
    return saved ? JSON.parse(saved) : initialShoppingList;
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
  // Используем события из API вместо localStorage
  const calendarEvents = calendarEventsAPI || [];
  const setCalendarEvents = () => {
    console.warn('[Index] setCalendarEvents is deprecated, use useCalendarEvents hook instead');
  };
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
  
  const [appearanceMode, setAppearanceMode] = useState<'light' | 'dark' | 'system' | 'auto'>(() => {
    return (localStorage.getItem('appearanceMode') as 'light' | 'dark' | 'system' | 'auto') || 'light';
  });
  const [showWelcome, setShowWelcome] = useState(() => {
    const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
    const userData = localStorage.getItem('userData');
    
    // Не показываем приветствие, если пользователь уже видел его
    if (hasSeenWelcome) return false;
    
    // Не показываем приветствие зарегистрированным пользователям (у которых есть семья)
    if (userData) {
      try {
        const user = JSON.parse(userData);
        if (user.family_name && user.logo_url) {
          // Пользователь уже настроил семью - не показываем приветствие
          localStorage.setItem('hasSeenWelcome', 'true');
          return false;
        }
      } catch (e) {
        console.error('[DEBUG Index] Error checking userData for welcome:', e);
      }
    }
    
    return true;
  });
  const [welcomeText, setWelcomeText] = useState('Добро пожаловать в "Наша семья"! Место, где ваша семья становится командой. Цель проекта: Сохранение семейных ценностей, повышение вовлеченности в семейную жизнь, бережная передача семейных традиций.');
  const [isTopBarVisible, setIsTopBarVisible] = useState(true);
  const [autoHideTopBar, setAutoHideTopBar] = useState(() => {
    // Временно отключаем автоскрытие для проверки зелёной кнопки
    return false;
  });

  const [isLeftMenuVisible, setIsLeftMenuVisible] = useState(false);
  const [autoHideLeftMenu, setAutoHideLeftMenu] = useState(() => {
    return localStorage.getItem('autoHideLeftMenu') === 'true';
  });
  const [activeSection, setActiveSection] = useState<string>('family');
  const [showInDevelopment, setShowInDevelopment] = useState(false);

  // Read section from URL params
  useEffect(() => {
    const sectionParam = searchParams.get('section');
    if (sectionParam) {
      setActiveSection(sectionParam);
    }
  }, [searchParams]);
  const [educationChild, setEducationChild] = useState<FamilyMember | null>(null);
  const [chamomileEnabled, setChamomileEnabled] = useState(() => {
    return localStorage.getItem('chamomileEnabled') === 'true';
  });
  const [soundEnabled, setSoundEnabled] = useState(() => {
    return localStorage.getItem('soundEnabled') === 'true';
  });
  const [showProfileOnboarding, setShowProfileOnboarding] = useState(false);
  const [showFamilyInvite, setShowFamilyInvite] = useState(false);
  const [showKuzyaDialog, setShowKuzyaDialog] = useState(false);
  
  const [isBottomBarVisible, setIsBottomBarVisible] = useState(true);
  const [autoHideBottomBar, setAutoHideBottomBar] = useState(() => {
    return localStorage.getItem('autoHideBottomBar') === 'true';
  });
  const [showTopPanelSettings, setShowTopPanelSettings] = useState(false);
  const [showLeftPanelSettings, setShowLeftPanelSettings] = useState(false);
  const [selectedDevSection, setSelectedDevSection] = useState<typeof inDevelopmentSections[0] | null>(null);
  const [voteComment, setVoteComment] = useState('');
  const [showCommentDialog, setShowCommentDialog] = useState(false);
  const [pendingVote, setPendingVote] = useState<{ sectionId: string; voteType: 'up' | 'down' } | null>(null);
  const { votes: devSectionVotes, castVote: castDevVote } = useDevSectionVotes();


  const authUserData = authUser ? JSON.parse(authUser) : null;
  const currentUser = authUserData?.member_id 
    ? familyMembers.find(m => m.id === authUserData.member_id) || familyMembers[0]
    : familyMembers[0];
  const currentUserId = currentUser?.id || familyMembers[0]?.id || '';

  useEffect(() => {
    localStorage.setItem('familyGoals', JSON.stringify(familyGoals));
  }, [familyGoals]);

  useEffect(() => {
    if (currentTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Сохраняем тему в localStorage
    localStorage.setItem('familyOrganizerTheme', currentTheme);
  }, [currentTheme]);
  
  // Проверяем актуальную тему из localStorage при монтировании
  useEffect(() => {
    const savedTheme = localStorage.getItem('familyOrganizerTheme') as ThemeType;
    if (savedTheme && savedTheme !== currentTheme) {
      setCurrentTheme(savedTheme);
    }
  }, []);
  
  // Слушаем изменения темы (для синхронизации между компонентами)
  useEffect(() => {
    const handleThemeChange = (e: CustomEvent<ThemeType>) => {
      setCurrentTheme(e.detail);
    };
    
    window.addEventListener('themeChange', handleThemeChange as EventListener);
    return () => window.removeEventListener('themeChange', handleThemeChange as EventListener);
  }, []);

  // Отключаем ProfileOnboarding в демо-режиме
  // useEffect(() => {
  //   const needsSetup = localStorage.getItem('needsProfileSetup');
  //   if (needsSetup === 'true' && currentUser && !membersLoading) {
  //     setShowProfileOnboarding(true);
  //   }
  // }, [currentUser, membersLoading]);



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

  const handleLogoutLocal = () => {
    if (confirm('Сбросить все демо-данные и начать заново? Это действие нельзя отменить.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    if (onLogout) {
      onLogout();
    }
    navigate('/login');
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

  const toggleAutoHide = () => {
    const newValue = !autoHideTopBar;
    setAutoHideTopBar(newValue);
    localStorage.setItem('autoHideTopBar', String(newValue));
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



  const handleAutoHideBottomBarChange = (value: boolean) => {
    setAutoHideBottomBar(value);
    localStorage.setItem('autoHideBottomBar', String(value));
  };

  const isWidgetEnabled = (widgetId: string) => {
    if (!widgetSettings) return true;
    const widget = widgetSettings.find((w: WidgetConfig) => w.id === widgetId);
    return widget ? widget.enabled : true;
  };

  const handleWidgetSettingsSave = (settings: WidgetConfig[]) => {
    setWidgetSettings(settings);
    localStorage.setItem('widgetSettings', JSON.stringify(settings));
  };

  const availableSections = [
    { id: 'family', icon: 'Users', label: 'Профили семьи' },
    { id: 'tasks', icon: 'CheckSquare', label: 'Задачи' },
    { id: 'recipes', icon: 'ChefHat', label: 'Рецепты' },
    { id: 'trips', icon: 'Plane', label: 'Путешествия' },
    { id: 'health', icon: 'Heart', label: 'Здоровье' },
    { id: 'analytics', icon: 'BarChart3', label: 'Аналитика' },
    { id: 'calendar', icon: 'Calendar', label: 'Календарь' },
    { id: 'goals', icon: 'Target', label:'Цели' },
    { id: 'values', icon: 'HeartHandshake', label: 'Ценности' },
    { id: 'traditions', icon: 'Sparkles', label: 'Традиции' },
    { id: 'shopping', icon: 'ShoppingCart', label: 'Покупки' },
    { id: 'meals', icon: 'UtensilsCrossed', label: 'Меню' },
  ];

  const availableTopPanelSections = [
    { id: 'stats', icon: 'Users', label: 'Счётчик семей' },
    { id: 'voting', icon: 'Vote', label: 'Голосования' },
    { id: 'auth', icon: 'LogIn', label: 'Вход/Выход' },
    { id: 'reset', icon: 'RotateCcw', label: 'Сбросить демо' },
    { id: 'settings', icon: 'Settings', label: 'Настройки' },
    { id: 'instructions', icon: 'BookOpen', label: 'Инструкции' },
    { id: 'presentation', icon: 'FileText', label: 'Презентация' },
    { id: 'profile', icon: 'UserCircle', label: 'Профиль' },
    { id: 'familySwitcher', icon: 'Users', label: 'Переключатель семьи' },
    { id: 'language', icon: 'Languages', label: 'Язык' },
    { id: 'style', icon: 'Palette', label: 'Стиль' },
    { id: 'appearance', icon: 'Moon', label: 'Оформление' },
  ];

  const menuSections = availableSections.map(s => ({ ...s, ready: true }));

  const [bottomBarSections, setBottomBarSections] = useState<string[]>(() => {
    const saved = localStorage.getItem('bottomBarSections');
    return saved ? JSON.parse(saved) : ['analytics', 'children', 'calendar', 'shopping'];
  });

  const [leftPanelSections, setLeftPanelSections] = useState<string[]>(() => {
    const saved = localStorage.getItem('leftPanelSections');
    return saved ? JSON.parse(saved) : availableSections.map(s => s.id);
  });

  const [topPanelSections, setTopPanelSections] = useState<string[]>(() => {
    const saved = localStorage.getItem('topPanelSections');
    let sections = saved ? JSON.parse(saved) : ['stats', 'auth', 'settings', 'familySwitcher'];
    
    // Миграция: удаляем кнопки которые теперь в Настройках
    sections = sections.filter((s: string) => !['style', 'voting', 'presentation', 'reset', 'language', 'profile', 'instructions', 'appearance'].includes(s));
    
    // Принудительно добавляем 'settings' если его нет
    if (!sections.includes('settings')) {
      sections.push('settings');
    }
    
    // Сохраняем обновленный список
    localStorage.setItem('topPanelSections', JSON.stringify(sections));
    
    return sections;
  });


  
  const getSectionTitle = (sectionId: string) => {
    const section = menuSections.find(s => s.id === sectionId);
    return section?.label || 'Семейный Органайзер';
  };

  const inDevelopmentSections = [
    { 
      id: 'blog', 
      icon: 'BookOpen', 
      label: 'Блог',
      description: 'Семейный блог для публикации историй, рецептов и важных событий',
      features: [
        { icon: '✍️', title: 'Публикации', description: 'Делитесь историями, рецептами, фотографиями' },
        { icon: '💬', title: 'Комментарии', description: 'Обсуждение публикаций всей семьёй' },
        { icon: '❤️', title: 'Реакции', description: 'Лайки и реакции на посты' },
        { icon: '🏷️', title: 'Категории', description: 'Сортировка по темам: путешествия, кулинария, дети' },
        { icon: '🔖', title: 'Избранное', description: 'Сохраняйте важные публикации' },
        { icon: '📅', title: 'Архив', description: 'История всех публикаций по годам' },
      ]
    },
    { 
      id: 'tree', 
      icon: 'GitBranch', 
      label: 'Древо',
      description: 'Генеалогическое древо семьи с историей поколений',
      features: [
        { icon: '🌳', title: 'Визуализация древа', description: 'Красивое графическое отображение родословной' },
        { icon: '👤', title: 'Профили предков', description: 'Детальная информация о каждом члене рода' },
        { icon: '📸', title: 'Фото и документы', description: 'Прикрепляйте фотографии и архивные документы' },
        { icon: '📖', title: 'Истории жизни', description: 'Биографии и истории родственников' },
        { icon: '🔍', title: 'Поиск родственников', description: 'Найдите связи между членами семьи' },
        { icon: '📤', title: 'Экспорт GEDCOM', description: 'Совместимость с другими программами' },
      ]
    },
    { 
      id: 'cohesion', 
      icon: 'TrendingUp', 
      label: 'Сплочённость',
      description: 'Отслеживание уровня сплочённости семьи через совместные активности, задачи и время вместе',
      features: [
        { icon: '📊', title: 'Индекс сплочённости', description: 'Автоматический расчёт уровня сплочённости на основе активностей семьи' },
        { icon: '🎯', title: 'Совместные цели', description: 'Задачи которые выполняются всей семьёй вместе' },
        { icon: '⏱️', title: 'Время вместе', description: 'Учёт совместно проведённого времени, рекомендации' },
        { icon: '📈', title: 'Динамика отношений', description: 'Графики изменения сплочённости по месяцам' },
        { icon: '🏆', title: 'Семейные челленджи', description: 'Задания для укрепления связей: игры, квесты' },
        { icon: '💬', title: 'Обратная связь', description: 'Опросы о качестве отношений в семье' },
      ]
    },
    { 
      id: 'chat', 
      icon: 'MessageCircle', 
      label: 'Чат',
      description: 'Внутренний семейный мессенджер для быстрого общения и обмена важной информацией',
      features: [
        { icon: '💬', title: 'Личные и групповые чаты', description: 'Общение один на один или со всей семьёй' },
        { icon: '📸', title: 'Фото и видео', description: 'Быстрый обмен медиафайлами внутри семьи' },
        { icon: '🔔', title: 'Push-уведомления', description: 'Мгновенные оповещения о новых сообщениях' },
        { icon: '📍', title: 'Геолокация', description: 'Делитесь местоположением с семьёй' },
        { icon: '📎', title: 'Файлы и документы', description: 'Обмен любыми файлами: документы, чеки, билеты' },
        { icon: '⏰', title: 'Отложенные сообщения', description: 'Запланируйте отправку на нужное время' },
      ]
    },
    { 
      id: 'community', 
      icon: 'Users2', 
      label: 'Сообщество',
      description: 'Общение с другими семьями, обмен опытом и советами',
      features: [
        { icon: '👥', title: 'Форумы по интересам', description: 'Обсуждения воспитания, путешествий, хобби' },
        { icon: '📝', title: 'Статьи и советы', description: 'Полезные материалы от экспертов и родителей' },
        { icon: '🎉', title: 'Семейные мероприятия', description: 'Совместные выезды, праздники, встречи' },
        { icon: '⭐', title: 'Рейтинг семей', description: 'Система достижений и мотивации' },
        { icon: '🤝', title: 'Взаимопомощь', description: 'Попросить или предложить помощь соседям' },
        { icon: '🗺️', title: 'Карта сообщества', description: 'Найдите семьи рядом с вами' },
      ]
    },
    { 
      id: 'album', 
      icon: 'Image', 
      label: 'Альбом',
      description: 'Семейный фотоальбом для хранения важных воспоминаний',
      features: [
        { icon: '📸', title: 'Неограниченное хранение', description: 'Загружайте сколько угодно фото и видео' },
        { icon: '📁', title: 'Альбомы по событиям', description: 'Организация по датам: отпуск, день рождения, школа' },
        { icon: '🏷️', title: 'Теги и метки', description: 'Пометьте кто на фото, где и когда снято' },
        { icon: '🤖', title: 'Умная сортировка', description: 'Автоматическая группировка по лицам и датам' },
        { icon: '🎬', title: 'Слайдшоу и коллажи', description: 'Создание красивых подборок из фото' },
        { icon: '🔒', title: 'Приватность', description: 'Доступ только членам вашей семьи' },
      ]
    },
    { 
      id: 'complaints', 
      icon: 'MessageSquareWarning', 
      label: 'Жалобная книга',
      description: 'Анонимный способ высказать недовольство и решить конфликты',
      features: [
        { icon: '🔒', title: 'Анонимность', description: 'Жалобы могут быть анонимными для честности' },
        { icon: '📝', title: 'Структурированные жалобы', description: 'Опишите проблему, предложите решение' },
        { icon: '👥', title: 'Семейное обсуждение', description: 'Обсудите проблему вместе без конфликтов' },
        { icon: '✅', title: 'Отслеживание решений', description: 'Контроль что жалобы не игнорируются' },
        { icon: '📊', title: 'Статистика проблем', description: 'Какие вопросы возникают чаще всего' },
        { icon: '💡', title: 'Предложения улучшений', description: 'Не только жалобы, но и идеи' },
      ]
    },
    { 
      id: 'psychologist', 
      icon: 'Brain', 
      label: 'Психолог ИИ',
      description: 'Искусственный интеллект для консультаций и эмоциональной поддержки',
      features: [
        { icon: '🤖', title: 'ИИ-консультант 24/7', description: 'Помощь в любое время дня и ночи' },
        { icon: '💬', title: 'Конфиденциальные беседы', description: 'Поговорите о проблемах анонимно' },
        { icon: '🧠', title: 'Анализ эмоций', description: 'ИИ распознаёт эмоциональное состояние' },
        { icon: '📚', title: 'База знаний', description: 'Советы по воспитанию, отношениям, стрессу' },
        { icon: '🎯', title: 'Персональные рекомендации', description: 'Советы основанные на вашей ситуации' },
        { icon: '📈', title: 'Трекинг настроения', description: 'Отслеживание эмоционального состояния семьи' },
      ]
    },
    { 
      id: 'garage', 
      icon: 'Car', 
      label: 'Гараж',
      description: 'Управление автомобилями семьи',
      features: [
        { icon: '🚗', title: 'Учёт автомобилей', description: 'Все авто семьи: марка, модель, год, VIN' },
        { icon: '🔧', title: 'График ТО', description: 'Напоминания о техобслуживании' },
        { icon: '🛞', title: 'Замена шин', description: 'Сезонная смена резины' },
        { icon: '⛽', title: 'Расход топлива', description: 'Журнал заправок и статистика' },
        { icon: '📋', title: 'История обслуживания', description: 'Все ремонты и замены запчастей' },
        { icon: '💰', title: 'Расходы на авто', description: 'Бензин, ремонт, страховка, штрафы' },
      ]
    },
    { 
      id: 'health', 
      icon: 'HeartPulse', 
      label: 'Здоровье',
      description: 'Медицинские карты и здоровье семьи',
      features: [
        { icon: '📋', title: 'Медицинские карты', description: 'История болезней, анализы, операции' },
        { icon: '💉', title: 'График прививок', description: 'Календарь вакцинации с напоминаниями' },
        { icon: '👨‍⚕️', title: 'База врачей', description: 'Контакты семейных врачей' },
        { icon: '💊', title: 'Аптечка', description: 'Лекарства дома, сроки годности' },
        { icon: '📊', title: 'Показатели здоровья', description: 'Вес, рост, давление, сахар' },
        { icon: '🔔', title: 'Напоминания', description: 'О приёме лекарств и визитах' },
      ]
    },
    { 
      id: 'finance', 
      icon: 'Wallet', 
      label: 'Финансы',
      description: 'Семейный бюджет и финансовое планирование',
      features: [
        { icon: '💰', title: 'Семейный бюджет', description: 'Учёт доходов и расходов' },
        { icon: '📊', title: 'Категории расходов', description: 'Продукты, жильё, транспорт, развлечения' },
        { icon: '🏦', title: 'Счета и карты', description: 'Все банковские счета в одном месте' },
        { icon: '🎯', title: 'Финансовые цели', description: 'Квартира, машина, отпуск' },
        { icon: '💳', title: 'Кредиты и займы', description: 'График платежей, расчёт переплат' },
        { icon: '📈', title: 'Накопления', description: 'Подушка безопасности, инвестиции' },
      ]
    },
    { 
      id: 'education', 
      icon: 'GraduationCap', 
      label: 'Образование',
      description: 'Школа, кружки и развитие детей',
      features: [
        { icon: '🎓', title: 'Школьное расписание', description: 'Уроки по дням недели' },
        { icon: '📚', title: 'Домашние задания', description: 'Контроль ДЗ с напоминаниями' },
        { icon: '📊', title: 'Успеваемость', description: 'Электронный дневник с оценками' },
        { icon: '🎨', title: 'Кружки и секции', description: 'Расписание допзанятий' },
        { icon: '🏆', title: 'Достижения детей', description: 'Грамоты, дипломы, победы' },
        { icon: '💰', title: 'Расходы на образование', description: 'Учебники, форма, кружки' },
      ]
    },
    { 
      id: 'pets', 
      icon: 'PawPrint', 
      label: 'Питомцы',
      description: 'Уход за домашними животными',
      features: [
        { icon: '🐾', title: 'Профили питомцев', description: 'Кличка, порода, возраст, фото' },
        { icon: '💉', title: 'Вакцинация', description: 'График прививок с напоминаниями' },
        { icon: '👨‍⚕️', title: 'Визиты к ветеринару', description: 'История осмотров' },
        { icon: '🍖', title: 'Питание', description: 'Рацион, любимый корм' },
        { icon: '💰', title: 'Расходы', description: 'Корм, ветеринар, игрушки' },
        { icon: '📸', title: 'Фотоальбом', description: 'Милые фото питомцев' },
      ]
    },
  ];

  const handleDevSectionVote = async (sectionId: string, voteType: 'up' | 'down', withComment = false) => {
    if (withComment) {
      setPendingVote({ sectionId, voteType });
      setShowCommentDialog(true);
      return;
    }

    const result = await castDevVote(sectionId, voteType);
    if (!result.success) {
      alert('❌ Ошибка голосования: ' + result.error);
    }
  };

  const handleSubmitVoteWithComment = async () => {
    if (!pendingVote) return;

    const result = await castDevVote(pendingVote.sectionId, pendingVote.voteType, voteComment.trim() || undefined);
    
    if (result.success) {
      alert('✅ Голос учтён! Спасибо за ваш отзыв.');
      setShowCommentDialog(false);
      setVoteComment('');
      setPendingVote(null);
    } else {
      alert('❌ Ошибка: ' + result.error);
    }
  };

  const getDevSectionVotes = (sectionId: string) => {
    return devSectionVotes[sectionId] || { up: 0, down: 0 };
  };

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

  useBirthdayReminders();
  useSubscriptionReminder();

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
      <IndexDialogs
        showFamilyInvite={showFamilyInvite}
        showAssistantSelector={showAssistantSelector}
        onFamilyInviteChange={setShowFamilyInvite}
        onAssistantSelectorChange={setShowAssistantSelector}
      />

      <WelcomeScreen
        show={showWelcome}
        familyName={familyName}
        familyLogo={familyLogo}
        welcomeText={welcomeText}
        onClose={() => {
          setShowWelcome(false);
          localStorage.setItem('hasSeenWelcome', 'true');
        }}
      />

      <FirstLoginWelcome 
        isFirstLogin={showFirstLoginWelcome}
        onClose={() => setShowFirstLoginWelcome(false)}
      />

      <IndexLayout
        isTopBarVisible={isTopBarVisible}
        isLeftMenuVisible={isLeftMenuVisible}
        currentLanguage={currentLanguage}
        currentTheme={currentTheme}
        themeClasses={themeClasses}
        onTopBarVisibilityChange={setIsTopBarVisible}
        onLeftMenuVisibilityChange={setIsLeftMenuVisible}
        onLogout={handleLogout}
        onLanguageChange={handleLanguageChange}
        onThemeChange={handleThemeChange}
        onResetDemo={handleLogoutLocal}
      >



        <div className="max-w-7xl mx-auto space-y-6 animate-fade-in p-4 lg:p-8" style={{ paddingTop: '4rem' }}>
        <FamilyHeaderBanner 
          familyName={familyName}
          familyLogo={familyLogo}
          syncing={syncing}
        />



        <Dialog open={selectedDevSection !== null} onOpenChange={() => setSelectedDevSection(null)}>
          <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
            <DialogHeader className="bg-gradient-to-r from-amber-400 to-orange-400 text-white -m-6 mb-0 p-6 rounded-t-lg">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center backdrop-blur">
                  <Icon name={selectedDevSection?.icon || 'Wrench'} size={28} />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-bold">
                    {selectedDevSection?.label}
                  </DialogTitle>
                  <p className="text-sm text-amber-50 font-normal mt-1">
                    {selectedDevSection?.description}
                  </p>
                </div>
                <Badge className="ml-auto bg-white/20 text-white border-white/30">
                  <Icon name="Construction" size={12} className="mr-1" />
                  В разработке
                </Badge>
              </div>
            </DialogHeader>
            
            <div className="space-y-6 p-6">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Icon name="Sparkles" size={24} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-blue-900">Что будет в этом разделе?</h3>
                  </div>
                </div>
                <p className="text-gray-800 text-base leading-relaxed">
                  {selectedDevSection?.description}
                </p>
                <div className="mt-4 pt-4 border-t border-blue-200">
                  <p className="text-gray-700 text-sm">
                    Мы активно работаем над реализацией этого функционала. Скоро здесь появятся все планируемые возможности, которые сделают управление семьёй ещё проще и удобнее.
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                  <Icon name="ListChecks" size={20} className="text-purple-600" />
                  Планируемые функции
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedDevSection?.features?.map((feature, idx) => (
                    <Card key={idx} className="border-2 border-purple-100 hover:border-purple-300 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="text-2xl">{feature.icon}</div>
                          <div>
                            <h4 className="font-bold text-sm mb-1">{feature.title}</h4>
                            <p className="text-xs text-muted-foreground">{feature.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Icon name="ThumbsUp" size={22} className="text-green-600" />
                  <h3 className="text-lg font-bold text-green-900">Поддержите создание раздела!</h3>
                </div>
                
                <p className="text-sm text-gray-700 mb-4">
                  Ваш голос поможет нам понять насколько этот функционал нужен пользователям и приоритизировать разработку.
                </p>

                <div className="space-y-3">
                  <div className="flex gap-3">
                    <Button
                      onClick={() => {
                        if (selectedDevSection) {
                          handleDevSectionVote(selectedDevSection.id, 'up', false);
                        }
                      }}
                      className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                      size="lg"
                    >
                      <Icon name="ThumbsUp" size={18} className="mr-2" />
                      Хочу! ({getDevSectionVotes(selectedDevSection?.id || '').up})
                    </Button>
                    <Button
                      onClick={() => {
                        if (selectedDevSection) {
                          handleDevSectionVote(selectedDevSection.id, 'down', false);
                        }
                      }}
                      variant="outline"
                      className="border-red-300 hover:bg-red-50"
                      size="lg"
                    >
                      <Icon name="ThumbsDown" size={18} className="mr-2 text-red-600" />
                      Не нужен ({getDevSectionVotes(selectedDevSection?.id || '').down})
                    </Button>
                  </div>
                  
                  <Button
                    onClick={() => {
                      if (selectedDevSection) {
                        handleDevSectionVote(selectedDevSection.id, 'up', true);
                      }
                    }}
                    variant="outline"
                    className="w-full border-purple-300 text-purple-700 hover:bg-purple-50"
                  >
                    <Icon name="MessageSquare" size={18} className="mr-2" />
                    Оставить комментарий или предложение
                  </Button>
                </div>
                <p className="text-xs text-green-700 mt-3 text-center">
                  ✅ Ваше мнение очень важно для приоритизации разработки
                </p>
              </div>

              <div className="bg-amber-50 border-2 border-amber-300 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Icon name="Info" size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-amber-900 mb-1 text-sm">Когда будет готово?</h4>
                    <p className="text-amber-800 text-xs">
                      Мы активно работаем над разработкой. Следите за обновлениями! 
                      Время реализации зависит от количества голосов и технической сложности.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={showCommentDialog} onOpenChange={setShowCommentDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Icon name="MessageSquare" size={24} />
                Ваш отзыв или предложение
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Расскажите нам подробнее о том, что вы хотите видеть в этом разделе. 
                Ваш комментарий будет отправлен разработчикам на почту.
              </p>

              <Textarea
                value={voteComment}
                onChange={(e) => setVoteComment(e.target.value)}
                placeholder="Например: Хотел бы видеть возможность..."
                rows={5}
                className="resize-none"
              />

              <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <Icon name="Info" size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-blue-800">
                  Комментарий опционален. Вы можете оставить его пустым и просто проголосовать, 
                  или написать развёрнутое предложение.
                </p>
              </div>

              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCommentDialog(false);
                    setVoteComment('');
                    setPendingVote(null);
                  }}
                >
                  Отмена
                </Button>
                <Button
                  onClick={handleSubmitVoteWithComment}
                  className="bg-gradient-to-r from-purple-500 to-pink-500"
                >
                  <Icon name="Send" size={16} className="mr-2" />
                  Отправить
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <header className="text-center mb-8 relative -mx-4 lg:-mx-8 py-6 rounded-2xl overflow-hidden" style={{
            backgroundImage: 'url(https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/99031d20-2ea8-4a39-a89e-1ebe098b6ba4.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}>
          <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/85 to-white/80 backdrop-blur-[1px]"></div>
          <div className="relative">
          <div className="flex items-center justify-center gap-4 mb-3">
            <h1 className={`${themeClasses.headingFont} text-3xl lg:text-4xl font-bold bg-gradient-to-r ${themeClasses.primaryGradient.replace('bg-gradient-to-r ', '')} bg-clip-text text-transparent mt-2 animate-fade-in`}>
              {getSectionTitle(activeSection)}
            </h1>
          </div>
          
          <p className="text-lg lg:text-xl text-gray-700 font-medium animate-fade-in" style={{ animationDelay: '0.2s' }}>
            {activeSection === 'tasks' && 'Управление задачами семьи'}
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
            {activeSection === 'complaints' && 'Разрешение семейных конфликтов'}
            {activeSection === 'about' && 'Миссия проекта'}
            {activeSection === 'shopping' && 'Список покупок семьи'}
          </p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Tabs value={activeSection} onValueChange={setActiveSection} className="space-y-6">

              <TabsContent value="cohesion">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 my-[5px]">
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
                <Card className="border-2 border-blue-200 bg-blue-50/50 mb-4">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                        <Icon name="CheckSquare" size={24} className="text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg mb-2">Как работают задачи?</h3>
                        <div className="space-y-2 text-sm text-muted-foreground">
                          <p><strong>Создавайте задачи</strong> для любых дел: уборка, покупки, домашние задания.</p>
                          <p><strong>Назначайте исполнителей</strong> из членов семьи и следите за прогрессом.</p>
                          <p><strong>Зарабатывайте баллы</strong> за выполнение — мотивация для всей семьи!</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
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
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (window.confirm('Удалить эту задачу?')) {
                                deleteTask(task.id);
                              }
                            }}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Icon name="Trash2" size={16} />
                          </Button>
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
                {isWidgetEnabled('family-members') && (
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
                        tasks={tasks}
                        events={calendarEvents}
                      />
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="calendar">
                <Card className="border-2 border-green-200 bg-green-50/50 mb-4">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center flex-shrink-0">
                        <Icon name="Calendar" size={24} className="text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg mb-2">Как работает календарь?</h3>
                        <div className="space-y-2 text-sm text-muted-foreground">
                          <p><strong>Добавляйте события</strong> — дни рождения, встречи, важные даты.</p>
                          <p><strong>Фильтруйте</strong> по типу: личные, семейные или все события сразу.</p>
                          <p><strong>Не забывайте важное</strong> — все события в одном месте для всей семьи.</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <div className="flex justify-end mb-4">
                  <Button 
                    onClick={() => {
                      const title = prompt('Название события:');
                      if (!title) return;
                      const description = prompt('Описание:');
                      const date = prompt('Дата (ГГГГ-ММ-ДД):');
                      const time = prompt('Время (HH:MM):');
                      const category = prompt('Категория (Встреча/День рождения/Другое):') || 'Другое';
                      const visibility = prompt('Видимость (family/personal):') as 'family' | 'personal' || 'family';
                      
                      const currentUser = familyMembers.find(m => m.id === currentUserId);
                      const newEvent: CalendarEvent = {
                        id: Date.now().toString(),
                        title,
                        description: description || '',
                        date: date || new Date().toISOString().split('T')[0],
                        time: time || '12:00',
                        category,
                        color: 'bg-purple-100',
                        visibility,
                        createdBy: currentUserId,
                        createdByName: currentUser?.name || 'Неизвестно',
                        createdByAvatar: currentUser?.avatar || '👤'
                      };
                      
                      const updated = [...(calendarEvents || []), newEvent];
                      setCalendarEvents(updated);
                      localStorage.setItem('calendarEvents', JSON.stringify(updated));
                    }}
                    className="bg-gradient-to-r from-green-500 to-teal-500"
                  >
                    <Icon name="Plus" className="mr-2" size={16} />
                    Добавить событие
                  </Button>
                </div>
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
                      {(calendarEvents || [])
                        .filter(event => {
                          if (calendarFilter === 'all') return true;
                          if (calendarFilter === 'personal') return event.createdBy === currentUserId;
                          if (calendarFilter === 'family') return event.visibility === 'family';
                          return true;
                        })
                        .map((event, index) => (
                          <div key={event.id} className={`p-4 rounded-lg ${event.color} animate-fade-in`} style={{ animationDelay: `${index * 0.1}s` }}>
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
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
                              <div className="flex items-center gap-2">
                                {event.createdBy === currentUserId && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      if (window.confirm('Удалить это событие?')) {
                                        const updated = (calendarEvents || []).filter(e => e.id !== event.id);
                                        setCalendarEvents(updated);
                                        localStorage.setItem('calendarEvents', JSON.stringify(updated));
                                      }
                                    }}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <Icon name="Trash2" size={16} />
                                  </Button>
                                )}
                                {event.createdByAvatar && event.createdByAvatar.startsWith('http') ? (
                                  <img 
                                    src={event.createdByAvatar} 
                                    alt={event.createdByName}
                                    className="w-12 h-12 rounded-full object-cover border-2 border-purple-300"
                                  />
                                ) : (
                                  <div className="text-3xl">{event.createdByAvatar}</div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      {(calendarEvents || []).filter(event => {
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
                <Card className="border-2 border-pink-200 bg-pink-50/50 mb-4">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center flex-shrink-0">
                        <Icon name="Baby" size={24} className="text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg mb-2">Как работает раздел "Дети"?</h3>
                        <div className="space-y-2 text-sm text-muted-foreground">
                          <p><strong>Отслеживайте развитие</strong> каждого ребёнка — навыки, достижения, расписание занятий.</p>
                          <p><strong>Проходите IQ-тесты</strong> для оценки 6 категорий развития с рекомендациями от ИИ.</p>
                          <p><strong>Видьте прогресс</strong> в визуальной форме и получайте персональные советы.</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <div className="space-y-4">
                  {childrenProfiles.length > 0 ? childrenProfiles.map((child, idx) => {
                    const devPlan = developmentPlans.find(dp => dp.childId === child.childId);
                    const avgProgress = devPlan?.skills ? Math.round(devPlan.skills.reduce((sum, s) => sum + s.progress, 0) / devPlan.skills.length) : 0;
                    const completedMilestones = devPlan?.milestones.filter(m => m.completed).length || 0;
                    const totalMilestones = devPlan?.milestones.length || 0;
                    
                    return (
                      <Card key={child.id} className="animate-fade-in" style={{ animationDelay: `${idx * 0.1}s` }}>
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              {child.avatar.startsWith('http') ? (
                                <img 
                                  src={child.avatar} 
                                  alt={child.name}
                                  className="w-16 h-16 rounded-full object-cover border-2 border-purple-300"
                                />
                              ) : (
                                <span className="text-4xl">{child.avatar}</span>
                              )}
                              <div>
                                <div className="flex items-center gap-2">
                                  <CardTitle className="text-2xl">{child.name}</CardTitle>
                                  <Badge>{child.age} лет</Badge>
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
                        <p className="text-sm text-muted-foreground mb-4">Добавьте первый профиль ребенка, чтобы отслеживать развитие и достижения</p>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button className="bg-gradient-to-r from-blue-500 to-purple-500">
                              <Icon name="Plus" className="mr-2" size={16} />
                              Добавить ребёнка
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Добавить ребёнка</DialogTitle>
                            </DialogHeader>
                            <AddFamilyMemberForm 
                              editingMember={undefined}
                              isChild={true}
                              onSubmit={(newChild) => {
                                if (addMember) {
                                  addMember(newChild);
                                }
                              }}
                            />
                          </DialogContent>
                        </Dialog>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="values">
                <Card className="border-2 border-amber-200 bg-amber-50/50 mb-4">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center flex-shrink-0">
                        <Icon name="Heart" size={24} className="text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg mb-2">Зачем нужны ценности?</h3>
                        <div className="space-y-2 text-sm text-muted-foreground">
                          <p><strong>Определите принципы</strong> которые важны для вашей семьи — честность, доброта, образование.</p>
                          <p><strong>Передайте детям</strong> понимание того, что действительно ценно в жизни.</p>
                          <p><strong>Укрепите идентичность</strong> семьи через общие ценности и убеждения.</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <div className="mb-4">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="w-full" size="lg">
                        <Icon name="Plus" className="mr-2" size={18} />
                        Добавить ценность
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Добавить семейную ценность</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium mb-1 block">Иконка (эмодзи)</label>
                          <Input 
                            id="value-icon-add"
                            placeholder="❤️"
                            maxLength={2}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-1 block">Название</label>
                          <Input 
                            id="value-title-add"
                            placeholder="Честность"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-1 block">Описание</label>
                          <Input 
                            id="value-description-add"
                            placeholder="Почему это важно для нашей семьи?"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-1 block">Практики (через Enter)</label>
                          <textarea
                            id="value-practices-add"
                            placeholder="Семейный совет каждое воскресенье&#10;Откровенные разговоры без осуждения"
                            className="w-full min-h-[100px] px-3 py-2 border rounded-md"
                          />
                        </div>
                        <Button 
                          className="w-full"
                          onClick={() => {
                            const icon = (document.getElementById('value-icon-add') as HTMLInputElement)?.value || '❤️';
                            const title = (document.getElementById('value-title-add') as HTMLInputElement)?.value;
                            const description = (document.getElementById('value-description-add') as HTMLInputElement)?.value;
                            const practicesText = (document.getElementById('value-practices-add') as HTMLTextAreaElement)?.value;
                            
                            if (!title || !description) {
                              alert('Заполните название и описание');
                              return;
                            }
                            
                            const practices = practicesText.split('\n').filter(p => p.trim());
                            
                            const newValue: FamilyValue = {
                              id: Date.now().toString(),
                              icon,
                              title,
                              description,
                              practices
                            };
                            
                            const updated = [...familyValues, newValue];
                            setFamilyValues(updated);
                            localStorage.setItem('familyValues', JSON.stringify(updated));
                            
                            (document.getElementById('value-icon-add') as HTMLInputElement).value = '';
                            (document.getElementById('value-title-add') as HTMLInputElement).value = '';
                            (document.getElementById('value-description-add') as HTMLInputElement).value = '';
                            (document.getElementById('value-practices-add') as HTMLTextAreaElement).value = '';
                            
                            document.querySelector('[data-state="open"]')?.closest('[role="dialog"]')?.querySelector('button[aria-label="Close"]')?.dispatchEvent(new Event('click', { bubbles: true }));
                          }}
                        >
                          Добавить
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="grid gap-4">
                  {familyValues.length > 0 ? familyValues.map((value, idx) => (
                    <Card key={value.id} className="animate-fade-in relative group" style={{ animationDelay: `${idx * 0.1}s` }}>
                      <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                              <Icon name="Edit" size={16} />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Редактировать ценность</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <label className="text-sm font-medium mb-1 block">Иконка</label>
                                <Input 
                                  id={`value-icon-${value.id}`}
                                  defaultValue={value.icon}
                                  maxLength={2}
                                />
                              </div>
                              <div>
                                <label className="text-sm font-medium mb-1 block">Название</label>
                                <Input 
                                  id={`value-title-${value.id}`}
                                  defaultValue={value.title}
                                />
                              </div>
                              <div>
                                <label className="text-sm font-medium mb-1 block">Описание</label>
                                <Input 
                                  id={`value-description-${value.id}`}
                                  defaultValue={value.description}
                                />
                              </div>
                              <div>
                                <label className="text-sm font-medium mb-1 block">Практики (через Enter)</label>
                                <textarea
                                  id={`value-practices-${value.id}`}
                                  defaultValue={value.practices?.join('\n') || ''}
                                  className="w-full min-h-[100px] px-3 py-2 border rounded-md"
                                />
                              </div>
                              <Button 
                                className="w-full"
                                onClick={() => {
                                  const icon = (document.getElementById(`value-icon-${value.id}`) as HTMLInputElement)?.value || value.icon;
                                  const title = (document.getElementById(`value-title-${value.id}`) as HTMLInputElement)?.value;
                                  const description = (document.getElementById(`value-description-${value.id}`) as HTMLInputElement)?.value;
                                  const practicesText = (document.getElementById(`value-practices-${value.id}`) as HTMLTextAreaElement)?.value;
                                  
                                  if (!title || !description) {
                                    alert('Заполните название и описание');
                                    return;
                                  }
                                  
                                  const practices = practicesText.split('\n').filter(p => p.trim());
                                  
                                  const updated = familyValues.map(v => 
                                    v.id === value.id 
                                      ? { ...v, icon, title, description, practices } 
                                      : v
                                  );
                                  setFamilyValues(updated);
                                  localStorage.setItem('familyValues', JSON.stringify(updated));
                                  
                                  document.querySelector('[data-state="open"]')?.closest('[role="dialog"]')?.querySelector('button[aria-label="Close"]')?.dispatchEvent(new Event('click', { bubbles: true }));
                                }}
                              >
                                Сохранить
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                        
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => {
                            if (confirm(`Удалить ценность "${value.title}"?`)) {
                              const updated = familyValues.filter(v => v.id !== value.id);
                              setFamilyValues(updated);
                              localStorage.setItem('familyValues', JSON.stringify(updated));
                            }
                          }}
                        >
                          <Icon name="Trash2" size={16} />
                        </Button>
                      </div>
                      
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
                                <Icon name="ArrowRight" size={14} className="text-amber-500 mt-0.5" />
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
                <Card className="border-2 border-rose-200 bg-rose-50/50 mb-4">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                        <Icon name="Sparkles" size={24} className="text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg mb-2">Зачем нужны традиции?</h3>
                        <div className="space-y-2 text-sm text-muted-foreground">
                          <p><strong>Создавайте особые моменты</strong> — воскресные обеды, новогодние ритуалы, семейные игры.</p>
                          <p><strong>Укрепляйте связи</strong> между поколениями через повторяющиеся события.</p>
                          <p><strong>Передавайте ценности</strong> и создавайте уникальность вашей семьи.</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card 
                  className="mb-4 cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50"
                  onClick={() => navigate('/nationalities')}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                        <span className="text-3xl">🏛️</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg mb-1 text-purple-900">Народы России</h3>
                        <p className="text-sm text-purple-700">
                          Познавательный раздел о культуре и традициях народов нашей страны
                        </p>
                      </div>
                      <Icon name="ChevronRight" size={28} className="text-purple-600 flex-shrink-0" />
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-end mb-4">
                  <Button 
                    onClick={() => {
                      const name = prompt('Название традиции:');
                      if (!name) return;
                      const description = prompt('Описание традиции:');
                      const icon = prompt('Эмодзи иконка (например: 🎄):') || '✨';
                      const frequency = prompt('Частота (weekly/monthly/yearly):') as 'weekly' | 'monthly' | 'yearly' || 'monthly';
                      const nextDate = prompt('Следующая дата (ГГГГ-ММ-ДД):');
                      
                      const newTradition: Tradition = {
                        id: Date.now().toString(),
                        name,
                        description: description || '',
                        icon,
                        frequency,
                        nextDate: nextDate || new Date().toISOString().split('T')[0]
                      };
                      
                      const updated = [...traditions, newTradition];
                      setTraditions(updated);
                      localStorage.setItem('traditions', JSON.stringify(updated));
                    }}
                    className="bg-gradient-to-r from-rose-500 to-pink-500"
                  >
                    <Icon name="Plus" className="mr-2" size={16} />
                    Добавить традицию
                  </Button>
                </div>
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
                                <div className="flex items-center gap-2">
                                  <Badge className={tradition.frequency === 'weekly' ? 'bg-blue-500' : tradition.frequency === 'monthly' ? 'bg-purple-500' : 'bg-pink-500'}>
                                    {tradition.frequency === 'weekly' ? 'Еженедельно' : tradition.frequency === 'monthly' ? 'Ежемесячно' : 'Ежегодно'}
                                  </Badge>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      if (window.confirm('Удалить эту традицию?')) {
                                        const updated = traditions.filter(t => t.id !== tradition.id);
                                        setTraditions(updated);
                                        localStorage.setItem('traditions', JSON.stringify(updated));
                                      }
                                    }}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <Icon name="Trash2" size={16} />
                                  </Button>
                                </div>
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
                {isWidgetEnabled('goals') && (
                  <>
                    <Card className="border-2 border-purple-200 bg-purple-50/50 mb-4">
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                            <Icon name="Target" size={24} className="text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-lg mb-2">Как работают цели?</h3>
                            <div className="space-y-2 text-sm text-muted-foreground">
                              <p><strong>Ставьте долгосрочные цели</strong> — накопить на квартиру, поехать в отпуск, сделать ремонт.</p>
                              <p><strong>Добавляйте контрольные точки</strong> для отслеживания прогресса на диаграмме Ганта.</p>
                              <p><strong>Получайте подсказки от ИИ</strong> для достижения целей быстрее.</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
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
                  </>
                )}
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
                              {(item.addedBy === currentUserId || currentUser?.role === 'owner') && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => deleteShoppingItem(item.id)}
                                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Icon name="Trash2" size={16} />
                                </Button>
                              )}
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

              <TabsContent value="complaints">
                <ComplaintBook 
                  familyMembers={familyMembers}
                  currentUserId={currentUserId}
                  initialComplaints={initialComplaints}
                />
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
                          {msg.senderAvatar && msg.senderAvatar.startsWith('http') ? (
                            <img 
                              src={msg.senderAvatar} 
                              alt={msg.senderName}
                              className="w-10 h-10 rounded-full object-cover border-2 border-purple-300"
                            />
                          ) : (
                            <span className="text-2xl">{msg.senderAvatar}</span>
                          )}
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
                createTask={createTask}
                updateTask={updateTask}
                deleteTask={deleteTask}
                traditions={traditions}
                familyValues={familyValues}
                blogPosts={blogPosts}
                importantDates={importantDates}
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
                deleteMember={deleteMember}
              />
            </Tabs>
          </div>

          <div className="space-y-6">
            <div className="flex justify-end">
              <Button
                onClick={() => setShowWidgetSettings(true)}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <Icon name="Settings" size={16} />
                Настроить виджеты
              </Button>
            </div>
            
            {isWidgetEnabled('calendar') && (
              <div className="animate-fade-in" style={{ animationDelay: '0.5s' }}>
                <CalendarWidget calendarEvents={calendarEvents || []} />
              </div>
            )}

            {isWidgetEnabled('tasks') && (
              <div className="animate-fade-in" style={{ animationDelay: '0.65s' }}>
                <TasksWidget />
              </div>
            )}

            {isWidgetEnabled('shopping') && (
              <div className="animate-fade-in" style={{ animationDelay: '0.8s' }}>
                <ShoppingWidget />
              </div>
            )}

            {isWidgetEnabled('voting') && (
              <div className="animate-fade-in" style={{ animationDelay: '0.95s' }}>
                <VotingWidget />
              </div>
            )}

            {isWidgetEnabled('nutrition') && (
              <div className="animate-fade-in" style={{ animationDelay: '1.1s' }}>
                <NutritionWidget />
              </div>
            )}

            {isWidgetEnabled('weekly-menu') && (
              <div className="animate-fade-in" style={{ animationDelay: '1.25s' }}>
                <WeeklyMenuWidget />
              </div>
            )}

            {isWidgetEnabled('medications') && (
              <div className="animate-fade-in" style={{ animationDelay: '1.4s' }}>
                <MedicationsWidget />
              </div>
            )}

          </div>
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
        onKuzyaClick={() => setShowKuzyaDialog(true)}
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
        availableSections={availableTopPanelSections}
        selectedSections={topPanelSections}
        onSectionsChange={handleTopPanelSectionsChange}
        showLanguageSettings={true}
        currentLanguage={currentLanguage}
        languageOptions={languageOptions}
        onLanguageChange={(code) => {
          setCurrentLanguage(code as LanguageCode);
          localStorage.setItem('familyOrganizerLanguage', code);
          setShowLanguageSelector(false);
        }}
        showAppearanceSettings={true}
        appearanceMode={appearanceMode}
        onAppearanceModeChange={(mode) => {
          setAppearanceMode(mode);
          localStorage.setItem('appearanceMode', mode);
        }}
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


      {chamomileEnabled && <ClickChamomile enabled={chamomileEnabled} soundEnabled={soundEnabled} />}
      
      <AIAssistantDialog 
        open={showKuzyaDialog}
        onOpenChange={setShowKuzyaDialog}
      />
      
      <WidgetSettings
        isOpen={showWidgetSettings}
        onClose={() => setShowWidgetSettings(false)}
        onSave={handleWidgetSettingsSave}
      />
      
      <Footer />
      </IndexLayout>
    </>
  );
}