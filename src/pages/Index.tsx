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
import { useNavigate } from 'react-router-dom';
import { useTasks } from '@/hooks/useTasks';
import { useFamilyMembers } from '@/hooks/useFamilyMembers';
import { useFamilyData } from '@/hooks/useFamilyData';
import { ChildEducation } from '@/components/ChildEducation';
import { ClickChamomile } from '@/components/ClickChamomile';
import Footer from '@/components/Footer';
import { getDailyMotto } from '@/utils/dailyMottos';
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

  initialChatMessages,
  initialFamilyAlbum,
  initialFamilyNeeds,
  initialFamilyTree,
  initialCalendarEvents,
  initialAIRecommendations,
  initialFamilyGoals,
  initialComplaints,
  initialShoppingList,
  getWeekDays,
} from '@/data/mockData';
import { FamilyTabsContent } from '@/components/FamilyTabsContent';
import { FamilyMembersGrid } from '@/components/FamilyMembersGrid';
import { GoalsSection } from '@/components/GoalsSection';
import { getTranslation, languageOptions, type LanguageCode } from '@/translations';
import { DEMO_FAMILY } from '@/data/demoFamily';
import SettingsMenu from '@/components/SettingsMenu';
import FamilyInviteManager from '@/components/FamilyInviteManager';
import { FamilyCohesionChart } from '@/components/FamilyCohesionChart';
import BottomBar from '@/components/BottomBar';
import PanelSettings from '@/components/PanelSettings';
import FamilyMemberSwitcher from '@/components/FamilyMemberSwitcher';

import StatsCounter from '@/components/StatsCounter';

import { getCurrentMember } from '@/data/demoFamily';
import { ComplaintBook } from '@/components/ComplaintBook';
import KuzyaHelperDialog from '@/components/KuzyaHelperDialog';
import KuzyaFloatingButton from '@/components/KuzyaFloatingButton';
import { useDevSectionVotes } from '@/hooks/useDevSectionVotes';
import { AddFamilyMemberForm } from '@/components/AddFamilyMemberForm';

// Import new components
import { WelcomeScreen } from '@/components/index/WelcomeScreen';
import { TopBar } from '@/components/index/TopBar';
import { LeftMenu } from '@/components/index/LeftMenu';
import { MainContent } from '@/components/index/MainContent';

interface IndexProps {
  onLogout?: () => void;
}

export default function Index({ onLogout }: IndexProps) {
  const navigate = useNavigate();
  const { members: familyMembersRaw, loading: membersLoading, addMember, updateMember, deleteMember } = useFamilyMembers();
  const { tasks: tasksRaw, loading: tasksLoading, toggleTask: toggleTaskDB, createTask, updateTask, deleteTask } = useTasks();
  const { data: familyData, syncing, syncData, getLastSyncTime } = useFamilyData();
  
  const authToken = localStorage.getItem('authToken');
  const authUser = localStorage.getItem('user');
  console.log('Index: authToken =', authToken ? 'EXISTS' : 'NULL');
  console.log('Index: authUser =', authUser);
  console.log('Index: familyMembersRaw =', familyMembersRaw);
  console.log('Index: membersLoading =', membersLoading);

  const familyMembers = familyMembersRaw || [];
  const tasks = tasksRaw || [];
  
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
  const [aiRecommendations] = useState<AIRecommendation[]>(initialAIRecommendations);
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
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>(() => {
    const saved = localStorage.getItem('calendarEvents');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return initialCalendarEvents;
      }
    }
    return initialCalendarEvents;
  });
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
    return !hasSeenWelcome;
  });
  const [showSettingsPanel, setShowSettingsPanel] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    return localStorage.getItem('currentUserId') || '1';
  });

  const { devSectionVotes, addDevSectionVote } = useDevSectionVotes();

  const handleVote = (sectionKey: string, isUpvote: boolean) => {
    addDevSectionVote({
      sectionKey,
      isUpvote,
      userId: currentUserId,
      userName: getMemberById(currentUserId)?.name || 'Unknown',
      timestamp: new Date().toISOString()
    });
  };
  
  useEffect(() => {
    if (showWelcome) {
      navigate('/welcome');
    }
  }, [showWelcome, navigate]);

  useEffect(() => {
    localStorage.setItem('hasSeenWelcome', 'true');
  }, []);

  useEffect(() => {
    localStorage.setItem('familyOrganizerLanguage', currentLanguage);
  }, [currentLanguage]);

  useEffect(() => {
    localStorage.setItem('familyOrganizerTheme', currentTheme);
  }, [currentTheme]);

  useEffect(() => {
    localStorage.setItem('appearanceMode', appearanceMode);
  }, [appearanceMode]);

  useEffect(() => {
    if (appearanceMode === 'auto') {
      const hour = new Date().getHours();
      const isDark = hour < 7 || hour >= 19;
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } else if (appearanceMode === 'system') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } else if (appearanceMode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [appearanceMode]);

  useEffect(() => {
    localStorage.setItem('currentUserId', currentUserId);
  }, [currentUserId]);

  useEffect(() => {
    localStorage.setItem('familyValues', JSON.stringify(familyValues));
  }, [familyValues]);

  useEffect(() => {
    localStorage.setItem('traditions', JSON.stringify(traditions));
  }, [traditions]);

  useEffect(() => {
    localStorage.setItem('shoppingList', JSON.stringify(shoppingList));
  }, [shoppingList]);

  useEffect(() => {
    localStorage.setItem('familyGoals', JSON.stringify(familyGoals));
  }, [familyGoals]);

  useEffect(() => {
    localStorage.setItem('calendarEvents', JSON.stringify(calendarEvents));
  }, [calendarEvents]);

  const getMemberById = (id: string) => {
    return familyMembers.find(m => m.id === id);
  };

  const toggleTask = async (taskId: string) => {
    await toggleTaskDB(taskId);
  };

  const handleAddShoppingItem = () => {
    if (!newItemName.trim()) return;
    
    const newItem: ShoppingItem = {
      id: Date.now().toString(),
      name: newItemName,
      category: newItemCategory,
      quantity: newItemQuantity || '1',
      priority: newItemPriority,
      completed: false,
      addedBy: currentUserId
    };
    
    setShoppingList([...shoppingList, newItem]);
    setNewItemName('');
    setNewItemQuantity('');
    setShowAddItemDialog(false);
  };

  const toggleShoppingItem = (id: string) => {
    setShoppingList(shoppingList.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const deleteShoppingItem = (id: string) => {
    setShoppingList(shoppingList.filter(item => item.id !== id));
  };

  const addCalendarEvent = (event: Omit<CalendarEvent, 'id'>) => {
    const newEvent: CalendarEvent = {
      ...event,
      id: Date.now().toString()
    };
    setCalendarEvents([...calendarEvents, newEvent]);
  };

  const deleteCalendarEvent = (id: string) => {
    setCalendarEvents(calendarEvents.filter(e => e.id !== id));
  };

  const currentThemeConfig = themes[currentTheme];
  const themeClasses = getThemeClasses(currentTheme);

  const motto = getDailyMotto();

  const [activeSection, setActiveSection] = useState('overview');
  const [showKuzyaDialog, setShowKuzyaDialog] = useState(false);
  const [showChildEducation, setShowChildEducation] = useState(false);
  const [selectedChild, setSelectedChild] = useState<ChildProfile | null>(null);
  const [showFamilyInvite, setShowFamilyInvite] = useState(false);
  const [selectedDevSection, setSelectedDevSection] = useState<any>(null);
  const [showTopPanel, setShowTopPanel] = useState(() => {
    const saved = localStorage.getItem('showTopPanel');
    return saved ? JSON.parse(saved) : true;
  });
  const [topPanelAutoHide, setTopPanelAutoHide] = useState(() => {
    const saved = localStorage.getItem('topPanelAutoHide');
    return saved ? JSON.parse(saved) : false;
  });
  const [topPanelSections, setTopPanelSections] = useState<string[]>(() => {
    const saved = localStorage.getItem('topPanelSections');
    return saved ? JSON.parse(saved) : ['voting', 'auth', 'reset', 'settings', 'instructions', 'presentation', 'profile', 'familySwitcher', 'language', 'style', 'appearance'];
  });
  const [showLeftPanel, setShowLeftPanel] = useState(() => {
    const saved = localStorage.getItem('showLeftPanel');
    return saved ? JSON.parse(saved) : true;
  });
  const [leftPanelAutoHide, setLeftPanelAutoHide] = useState(() => {
    const saved = localStorage.getItem('leftPanelAutoHide');
    return saved ? JSON.parse(saved) : false;
  });
  const [leftPanelSections, setLeftPanelSections] = useState<string[]>(() => {
    const saved = localStorage.getItem('leftPanelSections');
    return saved ? JSON.parse(saved) : ['profile', 'instructions', 'kuzya', 'familyInvite', 'psychologist', 'shopping', 'meals', 'rules-section'];
  });
  const [showTopPanelSettings, setShowTopPanelSettings] = useState(false);
  const [showLeftPanelSettings, setShowLeftPanelSettings] = useState(false);
  const [showInDevelopment, setShowInDevelopment] = useState(false);

  const [welcomeText, setWelcomeText] = useState('');
  const fullWelcomeText = 'Добро пожаловать в семейный органайзер! Здесь мы ведём общие дела, планируем события, делимся традициями и создаём тёплую атмосферу вместе.';

  useEffect(() => {
    if (showWelcome) {
      let index = 0;
      const interval = setInterval(() => {
        if (index < fullWelcomeText.length) {
          setWelcomeText(fullWelcomeText.substring(0, index + 1));
          index++;
        } else {
          clearInterval(interval);
        }
      }, 30);
      return () => clearInterval(interval);
    }
  }, [showWelcome]);

  useEffect(() => {
    localStorage.setItem('showTopPanel', JSON.stringify(showTopPanel));
  }, [showTopPanel]);

  useEffect(() => {
    localStorage.setItem('topPanelAutoHide', JSON.stringify(topPanelAutoHide));
  }, [topPanelAutoHide]);

  useEffect(() => {
    localStorage.setItem('topPanelSections', JSON.stringify(topPanelSections));
  }, [topPanelSections]);

  useEffect(() => {
    localStorage.setItem('showLeftPanel', JSON.stringify(showLeftPanel));
  }, [showLeftPanel]);

  useEffect(() => {
    localStorage.setItem('leftPanelAutoHide', JSON.stringify(leftPanelAutoHide));
  }, [leftPanelAutoHide]);

  useEffect(() => {
    localStorage.setItem('leftPanelSections', JSON.stringify(leftPanelSections));
  }, [leftPanelSections]);

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (token) {
        await fetch('https://oauth.poehali.dev/api/logout', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleLogoutLocal = () => {
    localStorage.clear();
    window.location.reload();
  };

  const handleLanguageChange = (lang: string) => {
    setCurrentLanguage(lang as LanguageCode);
    setShowLanguageSelector(false);
  };

  const handleThemeChange = (theme: ThemeType) => {
    setCurrentTheme(theme);
    setShowThemeSelector(false);
  };

  const addPoints = async (memberName: string, points: number) => {
    const member = familyMembers.find(m => m.name === memberName);
    if (!member) return;
    await updateMember({ id: member.id, points: (member.points || 0) + points });
  };

  const getNextOccurrenceDate = (task: Task): string | undefined => {
    if (!task.recurrence || task.recurrence === 'none') return undefined;
    
    const now = new Date();
    const nextDate = new Date(now);
    
    switch (task.recurrence) {
      case 'daily':
        nextDate.setDate(now.getDate() + 1);
        break;
      case 'weekly':
        nextDate.setDate(now.getDate() + 7);
        break;
      case 'monthly':
        nextDate.setMonth(now.getMonth() + 1);
        break;
      case 'yearly':
        nextDate.setFullYear(now.getFullYear() + 1);
        break;
    }
    
    return nextDate.toLocaleDateString('ru-RU');
  };

  const getDevSectionVotes = (sectionId: string) => {
    const votes = devSectionVotes.filter(v => v.sectionKey === sectionId);
    return {
      up: votes.filter(v => v.isUpvote).length,
      down: votes.filter(v => !v.isUpvote).length
    };
  };

  const availableSections = [
    { id: 'overview', icon: 'LayoutGrid', label: 'Обзор', ready: true },
    { id: 'family', icon: 'Users', label: 'Семья', ready: true },
    { id: 'children', icon: 'Baby', label: 'Дети', ready: true },
    { id: 'values', icon: 'Heart', label: 'Ценности', ready: true },
    { id: 'traditions', icon: 'Sparkles', label: 'Традиции', ready: true },
    { id: 'goals', icon: 'Target', label: 'Цели', ready: true },
    { id: 'tasks', icon: 'CheckSquare', label: 'Задачи', ready: true },
    { id: 'calendar', icon: 'Calendar', label: 'Календарь', ready: true },
    { id: 'blog', icon: 'BookOpen', label: 'Блог', ready: true },
    { id: 'tree', icon: 'GitBranch', label: 'Древо', ready: true },
    { id: 'chat', icon: 'MessageCircle', label: 'Чат', ready: true },
    { id: 'achievements', icon: 'Award', label: 'Достижения', ready: true },
    { id: 'voting', icon: 'Vote', label: 'Голосования', ready: true },
  ];

  const inDevelopmentSections = [
    { id: 'budget', icon: 'Wallet', label: 'Бюджет' },
    { id: 'health', icon: 'Heart', label: 'Здоровье' },
    { id: 'education', icon: 'GraduationCap', label: 'Образование' },
    { id: 'travel', icon: 'Plane', label: 'Путешествия' },
    { id: 'pets', icon: 'Dog', label: 'Питомцы' },
    { id: 'hobbies', icon: 'Palette', label: 'Хобби' },
    { id: 'recipes', icon: 'ChefHat', label: 'Рецепты' },
    { id: 'wishlist', icon: 'Gift', label: 'Хотелки' },
    { id: 'documents', icon: 'FileText', label: 'Документы' },
    { id: 'analytics', icon: 'BarChart', label: 'Аналитика' },
  ];

  const menuSections = availableSections
    .filter(s => s.ready !== false)
    .filter(s => leftPanelSections.includes(s.id) || !leftPanelSections.length);

  const currentUser = authUser ? JSON.parse(authUser) : getCurrentMember(currentUserId, familyMembers);

  const hints = [
    { icon: 'Lightbulb', text: 'Совет дня', detail: 'Регулярное общение укрепляет семейные связи' },
    { icon: 'Target', text: 'Цель недели', detail: 'Провести семейный ужин вместе' },
    { icon: 'Heart', text: 'Ценность', detail: 'Взаимоуважение - основа гармонии' },
  ];

  if (membersLoading || tasksLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <WelcomeScreen
        showWelcome={showWelcome}
        welcomeText={welcomeText}
        onDismiss={() => setShowWelcome(false)}
      />

      <div className={`min-h-screen pb-20 ${themeClasses.background} ${themeClasses.pattern}`}>
        <TopBar
          isVisible={showTopPanel}
          setIsVisible={setShowTopPanel}
          autoHide={topPanelAutoHide}
          toggleAutoHide={() => setTopPanelAutoHide(!topPanelAutoHide)}
          topPanelSections={topPanelSections}
          authToken={authToken}
          currentUser={currentUser}
          handleLogout={handleLogout}
          handleLogoutLocal={handleLogoutLocal}
          showLanguageSelector={showLanguageSelector}
          setShowLanguageSelector={setShowLanguageSelector}
          showThemeSelector={showThemeSelector}
          setShowThemeSelector={setShowThemeSelector}
          currentLanguage={currentLanguage}
          handleLanguageChange={handleLanguageChange}
          currentTheme={currentTheme}
          handleThemeChange={handleThemeChange}
          t={t}
          setShowTopPanelSettings={setShowTopPanelSettings}
        />

        <LeftMenu
          isVisible={showLeftPanel}
          setIsVisible={setShowLeftPanel}
          autoHide={leftPanelAutoHide}
          toggleAutoHide={() => setLeftPanelAutoHide(!leftPanelAutoHide)}
          menuSections={menuSections}
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          currentUser={currentUser}
          showInDevelopment={showInDevelopment}
          setShowInDevelopment={setShowInDevelopment}
          inDevelopmentSections={inDevelopmentSections}
          setShowKuzyaDialog={setShowKuzyaDialog}
          setShowFamilyInvite={setShowFamilyInvite}
          setShowLeftPanelSettings={setShowLeftPanelSettings}
        />

        <MainContent
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          familyMembers={familyMembers}
          currentUserId={currentUserId}
          tasks={tasks}
          familyGoals={familyGoals}
          setFamilyGoals={setFamilyGoals}
          updateMember={updateMember}
          toggleTask={toggleTask}
          createTask={createTask}
          updateTask={updateTask}
          deleteTask={deleteTask}
          addPoints={addPoints}
          getNextOccurrenceDate={getNextOccurrenceDate}
          getMemberById={getMemberById}
          inDevelopmentSections={inDevelopmentSections}
          getDevSectionVotes={getDevSectionVotes}
          setSelectedDevSection={setSelectedDevSection}
          syncing={syncing}
          getLastSyncTime={getLastSyncTime}
        />

        <Dialog open={!!showFamilyInvite} onOpenChange={setShowFamilyInvite}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                <Icon name="UserPlus" className="text-green-600" />
                Управление семьёй
              </DialogTitle>
            </DialogHeader>
            <FamilyInviteManager onClose={() => setShowFamilyInvite(false)} />
          </DialogContent>
        </Dialog>

        <div className="fixed bottom-24 right-6 flex flex-col gap-3 z-40 animate-fade-in" style={{ animationDelay: '1s' }}>
          {hints.map((hint, index) => (
            <Tooltip key={index}>
              <TooltipTrigger asChild>
                <div className={`p-3 rounded-lg bg-gradient-to-r ${
                  index === 0 ? 'from-yellow-100 to-orange-100' : 
                  index === 1 ? 'from-blue-100 to-cyan-100' : 
                  'from-pink-100 to-purple-100'
                } shadow-lg cursor-help border-2 ${
                  index === 0 ? 'border-yellow-300' : 
                  index === 1 ? 'border-blue-300' : 
                  'border-pink-300'
                } hover:scale-105 transition-transform`}>
                  <Icon 
                    name={hint.icon as any} 
                    className={
                      index === 0 ? 'text-yellow-600' : 
                      index === 1 ? 'text-blue-600' : 
                      'text-pink-600'
                    } 
                    size={20} 
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent side="left" className="max-w-xs">
                <div className="font-semibold mb-1">{hint.text}</div>
                <div className="text-sm text-gray-600">{hint.detail}</div>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>

        <Dialog open={!!selectedDevSection} onOpenChange={(open) => !open && setSelectedDevSection(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                {selectedDevSection && <Icon name={selectedDevSection.icon as any} size={24} />}
                {selectedDevSection?.label}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <Icon name="Info" size={18} className="text-blue-600" />
                  <span className="font-semibold text-blue-900">Статус разработки</span>
                </div>
                <p className="text-sm text-gray-700">
                  Этот раздел находится в стадии разработки. Мы работаем над его созданием и скоро он будет доступен!
                </p>
              </div>
              
              {selectedDevSection && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-semibold">Голоса сообщества:</span>
                    <div className="flex gap-3">
                      <Badge variant="outline" className="bg-green-50">
                        <Icon name="ThumbsUp" size={14} className="mr-1" />
                        {getDevSectionVotes(selectedDevSection.id).up}
                      </Badge>
                      <Badge variant="outline" className="bg-red-50">
                        <Icon name="ThumbsDown" size={14} className="mr-1" />
                        {getDevSectionVotes(selectedDevSection.id).down}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        handleVote(selectedDevSection.id, true);
                        setSelectedDevSection(null);
                      }}
                      variant="outline"
                      className="flex-1 border-green-300 hover:bg-green-50"
                    >
                      <Icon name="ThumbsUp" size={16} className="mr-1" />
                      Хочу этот раздел
                    </Button>
                    <Button
                      onClick={() => {
                        handleVote(selectedDevSection.id, false);
                        setSelectedDevSection(null);
                      }}
                      variant="outline"
                      className="flex-1 border-red-300 hover:bg-red-50"
                    >
                      <Icon name="ThumbsDown" size={16} className="mr-1" />
                      Не нужен
                    </Button>
                  </div>
                </div>
              )}
              
              <div className="text-sm text-gray-500 text-center">
                Ваше мнение поможет нам определить приоритеты разработки
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={showChildEducation} onOpenChange={setShowChildEducation}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">
                Развитие ребёнка: {selectedChild?.name}
              </DialogTitle>
            </DialogHeader>
            {selectedChild && (
              <ChildEducation
                child={selectedChild}
                developmentPlan={developmentPlans.find(p => p.childId === selectedChild.id)}
              />
            )}
          </DialogContent>
        </Dialog>

        <BottomBar
          currentUserId={currentUserId}
          onUserChange={setCurrentUserId}
          familyMembers={familyMembers}
          currentLanguage={currentLanguage}
          themeClasses={themeClasses}
        />

        <PanelSettings
          isOpen={showSettingsPanel}
          onClose={() => setShowSettingsPanel(false)}
          currentLanguage={currentLanguage}
          onLanguageChange={setCurrentLanguage}
          currentTheme={currentTheme}
          onThemeChange={setCurrentTheme}
          appearanceMode={appearanceMode}
          onAppearanceModeChange={setAppearanceMode}
          themeClasses={themeClasses}
        />

        <Dialog open={showTopPanelSettings} onOpenChange={setShowTopPanelSettings}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Настройки верхней панели</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Показывать панель</span>
                <Checkbox
                  checked={showTopPanel}
                  onCheckedChange={(checked) => setShowTopPanel(!!checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <span>Автоматически скрывать</span>
                <Checkbox
                  checked={topPanelAutoHide}
                  onCheckedChange={(checked) => setTopPanelAutoHide(!!checked)}
                />
              </div>
              <div className="space-y-2">
                <div className="font-semibold">Разделы панели:</div>
                {[
                  { id: 'voting', label: 'Голосования' },
                  { id: 'auth', label: 'Авторизация' },
                  { id: 'reset', label: 'Сброс' },
                  { id: 'settings', label: 'Настройки' },
                  { id: 'instructions', label: 'Инструкции' },
                  { id: 'presentation', label: 'Презентация' },
                  { id: 'profile', label: 'Профиль' },
                  { id: 'familySwitcher', label: 'Переключатель' },
                  { id: 'language', label: 'Язык' },
                  { id: 'style', label: 'Стиль' },
                  { id: 'appearance', label: 'Оформление' },
                ].map((section) => (
                  <div key={section.id} className="flex items-center gap-2">
                    <Checkbox
                      checked={topPanelSections.includes(section.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setTopPanelSections([...topPanelSections, section.id]);
                        } else {
                          setTopPanelSections(topPanelSections.filter(s => s !== section.id));
                        }
                      }}
                    />
                    <span className="text-sm">{section.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={showLeftPanelSettings} onOpenChange={setShowLeftPanelSettings}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Настройки левой панели</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Показывать панель</span>
                <Checkbox
                  checked={showLeftPanel}
                  onCheckedChange={(checked) => setShowLeftPanel(!!checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <span>Автоматически скрывать</span>
                <Checkbox
                  checked={leftPanelAutoHide}
                  onCheckedChange={(checked) => setLeftPanelAutoHide(!!checked)}
                />
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <ClickChamomile
          themeClasses={themeClasses}
          currentLanguage={currentLanguage}
        />

        <KuzyaFloatingButton currentLanguage={currentLanguage} />

        <KuzyaHelperDialog
          isOpen={showKuzyaDialog}
          onClose={() => setShowKuzyaDialog(false)}
          currentLanguage={currentLanguage}
        />

        <Footer currentLanguage={currentLanguage} />
      </div>
    </>
  );
}
