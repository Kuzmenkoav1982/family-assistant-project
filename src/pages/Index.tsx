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
import { MainHeader } from '@/components/index-page/MainHeader';
import { MainContentGrid } from '@/components/index-page/MainContentGrid';
import { ComplaintBook } from '@/components/ComplaintBook';
import AIAssistantDialog from '@/components/AIAssistantDialog';
import { useAIAssistant } from '@/contexts/AIAssistantContext';

import { useDevSectionVotes } from '@/hooks/useDevSectionVotes';
import { AddFamilyMemberForm } from '@/components/AddFamilyMemberForm';
import { TasksWidget } from '@/components/TasksWidget';
import PanelSettings from '@/components/PanelSettings';
import { ShoppingWidget } from '@/components/widgets/ShoppingWidget';
import { VotingWidget } from '@/components/widgets/VotingWidget';
import { NutritionWidget } from '@/components/widgets/NutritionWidget';
import { WeeklyMenuWidget } from '@/components/widgets/WeeklyMenuWidget';

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
  const [showAssistantSelector, setShowAssistantSelector] = useState(false);
  
  const authToken = localStorage.getItem('authToken');
  const authUser = localStorage.getItem('user');
  console.log('Index: authToken =', authToken ? 'EXISTS' : 'NULL');
  console.log('Index: authUser =', authUser);
  console.log('Index: familyMembersRaw =', familyMembersRaw);
  console.log('Index: membersLoading =', membersLoading);

  const familyMembers = familyMembersRaw || [];
  const tasks = tasksRaw || [];
  
  const [familyName, setFamilyName] = useState('Наша семья');
  const [familyLogo, setFamilyLogo] = useState('https://cdn.poehali.dev/files/35561da4-c60e-44c0-9bf9-c57eef88996b.png');
  
  useEffect(() => {
    const userData = localStorage.getItem('userData');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        console.log('[DEBUG Index] userData from localStorage:', user);
        if (user.family_name) {
          console.log('[DEBUG Index] Setting family name:', user.family_name);
          setFamilyName(user.family_name);
        }
        if (user.logo_url) {
          console.log('[DEBUG Index] Setting logo URL:', user.logo_url);
          setFamilyLogo(user.logo_url);
        }
      } catch (e) {
        console.error('[DEBUG Index] Error parsing userData:', e);
      }
    } else {
      console.log('[DEBUG Index] No userData in localStorage');
    }
  }, []);

  useEffect(() => {
    if (!hasCompletedSetup) {
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
  const [familyGoals, setFamilyGoals] = useState<FamilyGoal[]>(initialFamilyGoals);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>(initialCalendarEvents);
  const [complaints, setComplaints] = useState(() => initialComplaints);
  const [newComplaint, setNewComplaint] = useState({
    title: '',
    description: '',
  });

  const [currentTheme, setCurrentTheme] = useState<ThemeType>(() => {
    const saved = localStorage.getItem('familyTheme');
    return (saved as ThemeType) || 'warm';
  });
  const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>(() => {
    const saved = localStorage.getItem('familyLanguage');
    return (saved as LanguageCode) || 'ru';
  });

  const [treeViewMode, setTreeViewMode] = useState<'tree' | 'grid'>('tree');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved === 'true';
  });

  useEffect(() => {
    localStorage.setItem('darkMode', String(isDarkMode));
  }, [isDarkMode]);

  const t = (key: string) => getTranslation(key, currentLanguage);

  useEffect(() => {
    localStorage.setItem('familyTheme', currentTheme);
  }, [currentTheme]);

  useEffect(() => {
    localStorage.setItem('familyLanguage', currentLanguage);
  }, [currentLanguage]);

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
    if (widgetSettings) {
      localStorage.setItem('widgetSettings', JSON.stringify(widgetSettings));
    }
  }, [widgetSettings]);

  useEffect(() => {
    const hash = window.location.hash.substring(1);
    if (hash) {
      setTimeout(() => {
        const element = document.getElementById(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  }, []);

  const [dailyMotto] = useState(getDailyMotto());

  const getMemberById = (memberId: string | null): FamilyMember | undefined => {
    if (!memberId) return undefined;
    return familyMembers.find((m: FamilyMember) => m.id === memberId);
  };

  const handleStatusChange = (taskId: string, newStatus: 'pending' | 'in_progress' | 'completed') => {
    updateTask(taskId, { status: newStatus });
  };

  const handleToggleTask = (taskId: string) => {
    const task = tasks.find((t: Task) => t.id === taskId);
    if (task) {
      toggleTaskDB(taskId);
    }
  };

  const handleCompleteGoal = (goalId: string) => {
    setFamilyGoals((prev) =>
      prev.map((g) =>
        g.id === goalId ? { ...g, completed: !g.completed } : g
      )
    );
  };

  const handleDeleteGoal = (goalId: string) => {
    setFamilyGoals((prev) => prev.filter((g) => g.id !== goalId));
  };

  const handleUpdateGoal = (goalId: string, progress: number) => {
    setFamilyGoals((prev) =>
      prev.map((g) =>
        g.id === goalId ? { ...g, progress } : g
      )
    );
  };

  const handleAddGoal = (newGoal: FamilyGoal) => {
    setFamilyGoals([...familyGoals, newGoal]);
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const newMsg: ChatMessage = {
        id: `msg-${Date.now()}`,
        sender: 'Папа',
        content: newMessage,
        timestamp: new Date(),
        avatar: '👨',
      };
      setChatMessages([...chatMessages, newMsg]);
      setNewMessage('');
    }
  };

  const handleAddPhoto = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const newPhoto: FamilyAlbum = {
          id: `photo-${Date.now()}`,
          url: e.target?.result as string,
          caption: '',
          date: new Date(),
          uploader: 'Вы',
          likes: 0,
        };
        setFamilyAlbum([...familyAlbum, newPhoto]);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLikePhoto = (photoId: string) => {
    setFamilyAlbum((prev) =>
      prev.map((photo) =>
        photo.id === photoId ? { ...photo, likes: (photo.likes || 0) + 1 } : photo
      )
    );
  };

  const handleCompleteNeed = (needId: string) => {
    setFamilyNeeds((prev) =>
      prev.map((n) =>
        n.id === needId ? { ...n, fulfilled: !n.fulfilled } : n
      )
    );
  };

  const handleDeleteNeed = (needId: string) => {
    setFamilyNeeds((prev) => prev.filter((n) => n.id !== needId));
  };

  const handleTreeMemberClick = (member: FamilyTreeMember) => {
    setSelectedTreeMember(member);
  };

  const handleAddMember = (formData: {
    name: string;
    age: string;
    role: string;
    avatar: string;
  }) => {
    const newMember: FamilyMember = {
      id: `member-${Date.now()}`,
      name: formData.name,
      age: parseInt(formData.age) || 0,
      role: formData.role,
      avatar: formData.avatar || '👤',
      mood: 'хорошее',
      tasks: [],
    };
    addMember(newMember);
  };

  const handleAddShoppingItem = () => {
    if (newItemName.trim()) {
      const newItem: ShoppingItem = {
        id: `item-${Date.now()}`,
        name: newItemName,
        category: newItemCategory,
        quantity: newItemQuantity,
        priority: newItemPriority,
        completed: false,
      };
      setShoppingList([...shoppingList, newItem]);
      setNewItemName('');
      setNewItemQuantity('');
      setShowAddItemDialog(false);
    }
  };

  const handleToggleShoppingItem = (itemId: string) => {
    setShoppingList((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const handleDeleteShoppingItem = (itemId: string) => {
    setShoppingList((prev) => prev.filter((item) => item.id !== itemId));
  };

  const handleWidgetSettingsSave = (settings: WidgetConfig) => {
    setWidgetSettings(settings);
    setShowWidgetSettings(false);
  };

  const handleAddComplaint = () => {
    if (newComplaint.title.trim() && newComplaint.description.trim()) {
      const complaint = {
        id: `complaint-${Date.now()}`,
        title: newComplaint.title,
        description: newComplaint.description,
        author: 'Текущий пользователь',
        date: new Date().toISOString().split('T')[0],
        status: 'new' as const,
        priority: 'medium' as const,
        category: 'other' as const,
      };
      setComplaints([...complaints, complaint]);
      setNewComplaint({ title: '', description: '' });
    }
  };

  const handleUpdateComplaint = (id: string, updates: Partial<typeof complaints[0]>) => {
    setComplaints((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
  };

  const handleDeleteComplaint = (id: string) => {
    setComplaints((prev) => prev.filter((c) => c.id !== id));
  };

  const handleAddValue = (value: FamilyValue) => {
    setFamilyValues([...familyValues, value]);
  };

  const handleUpdateValue = (id: string, updates: Partial<FamilyValue>) => {
    setFamilyValues((prev) =>
      prev.map((v) => (v.id === id ? { ...v, ...updates } : v))
    );
  };

  const handleDeleteValue = (id: string) => {
    setFamilyValues((prev) => prev.filter((v) => v.id !== id));
  };

  const handleAddTradition = (tradition: Tradition) => {
    setTraditions([...traditions, tradition]);
  };

  const handleUpdateTradition = (id: string, updates: Partial<Tradition>) => {
    setTraditions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );
  };

  const handleDeleteTradition = (id: string) => {
    setTraditions((prev) => prev.filter((t) => t.id !== id));
  };

  const { 
    votingSections, 
    votes, 
    handleVote, 
    handleAddSection, 
    handleDeleteSection 
  } = useDevSectionVotes();

  const activeSection = searchParams.get('section') || 'overview';

  if (membersLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Загрузка...</p>
        </div>
      </div>
    );
  }

  const shouldShowWelcome = !authToken || !authUser || !familyMembers || familyMembers.length === 0;

  if (shouldShowWelcome) {
    return (
      <WelcomeScreen
        onLogin={() => navigate('/login')}
        onRegister={() => navigate('/register')}
      />
    );
  }

  return (
    <>
    <IndexLayout 
      currentTheme={currentTheme}
      isDarkMode={isDarkMode}
      familyName={familyName}
      familyLogo={familyLogo}
      dailyMotto={dailyMotto}
      familyMembers={familyMembers}
      getMemberById={getMemberById}
      syncing={syncing}
      syncData={syncData}
      getLastSyncTime={getLastSyncTime}
      currentLanguage={currentLanguage}
      setCurrentLanguage={setCurrentLanguage}
      currentTheme={currentTheme}
      setCurrentTheme={setCurrentTheme}
      isDarkMode={isDarkMode}
      setIsDarkMode={setIsDarkMode}
      onLogout={onLogout}
      setShowWidgetSettings={setShowWidgetSettings}
    >
      <MainHeader 
        currentTheme={currentTheme}
        activeSection={activeSection}
        t={t}
      />
      
      <MainContentGrid
        activeSection={activeSection}
        currentTheme={currentTheme}
        isDarkMode={isDarkMode}
        
        tasks={tasks}
        familyMembers={familyMembers}
        tasksLoading={tasksLoading}
        getMemberById={getMemberById}
        handleToggleTask={handleToggleTask}
        createTask={createTask}
        updateTask={updateTask}
        deleteTask={deleteTask}
        
        shoppingList={shoppingList}
        handleToggleShoppingItem={handleToggleShoppingItem}
        handleDeleteShoppingItem={handleDeleteShoppingItem}
        handleAddShoppingItem={handleAddShoppingItem}
        
        votingSections={votingSections}
        votes={votes}
        handleVote={handleVote}
        handleAddSection={handleAddSection}
        handleDeleteSection={handleDeleteSection}
        
        widgetSettings={widgetSettings}
        
        importantDates={importantDates}
        traditions={traditions}
        familyValues={familyValues}
        blogPosts={blogPosts}
        childrenProfiles={childrenProfiles}
        developmentPlans={developmentPlans}
        chatMessages={chatMessages}
        newMessage={newMessage}
        setNewMessage={setNewMessage}
        handleSendMessage={handleSendMessage}
        familyAlbum={familyAlbum}
        handleAddPhoto={handleAddPhoto}
        handleLikePhoto={handleLikePhoto}
        familyNeeds={familyNeeds}
        handleCompleteNeed={handleCompleteNeed}
        handleDeleteNeed={handleDeleteNeed}
        familyTree={familyTree}
        treeViewMode={treeViewMode}
        setTreeViewMode={setTreeViewMode}
        handleTreeMemberClick={handleTreeMemberClick}
        selectedTreeMember={selectedTreeMember}
        setSelectedTreeMember={setSelectedTreeMember}
        calendarEvents={calendarEvents}
        setCalendarEvents={setCalendarEvents}
        complaints={complaints}
        handleAddComplaint={handleAddComplaint}
        handleUpdateComplaint={handleUpdateComplaint}
        handleDeleteComplaint={handleDeleteComplaint}
        newComplaint={newComplaint}
        setNewComplaint={setNewComplaint}
        familyGoals={familyGoals}
        handleCompleteGoal={handleCompleteGoal}
        handleDeleteGoal={handleDeleteGoal}
        handleUpdateGoal={handleUpdateGoal}
        handleAddGoal={handleAddGoal}
        
        t={t}
        
        handleAddValue={handleAddValue}
        handleUpdateValue={handleUpdateValue}
        handleDeleteValue={handleDeleteValue}
        handleAddTradition={handleAddTradition}
        handleUpdateTradition={handleUpdateTradition}
        handleDeleteTradition={handleDeleteTradition}
        
        addMember={addMember}
        updateMember={updateMember}
        deleteMember={deleteMember}
      />
      
      <IndexDialogs 
        showAddItemDialog={showAddItemDialog}
        setShowAddItemDialog={setShowAddItemDialog}
        newItemName={newItemName}
        setNewItemName={setNewItemName}
        newItemCategory={newItemCategory}
        setNewItemCategory={setNewItemCategory}
        newItemQuantity={newItemQuantity}
        setNewItemQuantity={setNewItemQuantity}
        newItemPriority={newItemPriority}
        setNewItemPriority={setNewItemPriority}
        handleAddShoppingItem={handleAddShoppingItem}
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
