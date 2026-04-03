import { useState } from 'react';
import type {
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
  ShoppingItem,
  FamilyGoal,
  ThemeType,
  FamilyMember,
} from '@/types/family.types';
import type { WidgetConfig } from '@/components/WidgetSettings';
import type { LanguageCode } from '@/translations';
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
  initialFamilyGoals,
  initialShoppingList,
} from '@/data/mockData';

export interface UseIndexStateReturn {
  familyName: string;
  setFamilyName: React.Dispatch<React.SetStateAction<string>>;
  familyLogo: string;
  setFamilyLogo: React.Dispatch<React.SetStateAction<string>>;
  familyBanner: string;
  setFamilyBanner: React.Dispatch<React.SetStateAction<string>>;
  showAssistantSelector: boolean;
  setShowAssistantSelector: React.Dispatch<React.SetStateAction<boolean>>;
  showFirstLoginWelcome: boolean;
  setShowFirstLoginWelcome: React.Dispatch<React.SetStateAction<boolean>>;
  showWelcome: boolean;
  setShowWelcome: React.Dispatch<React.SetStateAction<boolean>>;
  welcomeText: string;
  setWelcomeText: React.Dispatch<React.SetStateAction<string>>;
  isTopBarVisible: boolean;
  setIsTopBarVisible: React.Dispatch<React.SetStateAction<boolean>>;
  autoHideTopBar: boolean;
  setAutoHideTopBar: React.Dispatch<React.SetStateAction<boolean>>;
  isLeftMenuVisible: boolean;
  setIsLeftMenuVisible: React.Dispatch<React.SetStateAction<boolean>>;
  showSidebarHint: boolean;
  setShowSidebarHint: React.Dispatch<React.SetStateAction<boolean>>;
  autoHideLeftMenu: boolean;
  setAutoHideLeftMenu: React.Dispatch<React.SetStateAction<boolean>>;
  activeSection: string;
  setActiveSection: React.Dispatch<React.SetStateAction<string>>;
  showInDevelopment: boolean;
  setShowInDevelopment: React.Dispatch<React.SetStateAction<boolean>>;
  educationChild: FamilyMember | null;
  setEducationChild: React.Dispatch<React.SetStateAction<FamilyMember | null>>;
  chamomileEnabled: boolean;
  setChamomileEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  soundEnabled: boolean;
  setSoundEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  showProfileOnboarding: boolean;
  setShowProfileOnboarding: React.Dispatch<React.SetStateAction<boolean>>;
  showFamilyInvite: boolean;
  setShowFamilyInvite: React.Dispatch<React.SetStateAction<boolean>>;
  showKuzyaDialog: boolean;
  setShowKuzyaDialog: React.Dispatch<React.SetStateAction<boolean>>;
  isBottomBarVisible: boolean;
  setIsBottomBarVisible: React.Dispatch<React.SetStateAction<boolean>>;
  autoHideBottomBar: boolean;
  setAutoHideBottomBar: React.Dispatch<React.SetStateAction<boolean>>;
  showTopPanelSettings: boolean;
  setShowTopPanelSettings: React.Dispatch<React.SetStateAction<boolean>>;
  showLeftPanelSettings: boolean;
  setShowLeftPanelSettings: React.Dispatch<React.SetStateAction<boolean>>;
  showWidgetSettings: boolean;
  setShowWidgetSettings: React.Dispatch<React.SetStateAction<boolean>>;
  showLanguageSelector: boolean;
  setShowLanguageSelector: React.Dispatch<React.SetStateAction<boolean>>;
  showThemeSelector: boolean;
  setShowThemeSelector: React.Dispatch<React.SetStateAction<boolean>>;
  currentLanguage: LanguageCode;
  setCurrentLanguage: React.Dispatch<React.SetStateAction<LanguageCode>>;
  currentTheme: ThemeType;
  setCurrentTheme: React.Dispatch<React.SetStateAction<ThemeType>>;
  appearanceMode: 'light' | 'dark' | 'system' | 'auto';
  setAppearanceMode: React.Dispatch<React.SetStateAction<'light' | 'dark' | 'system' | 'auto'>>;
  reminders: Reminder[];
  setReminders: React.Dispatch<React.SetStateAction<Reminder[]>>;
  familyValues: FamilyValue[];
  setFamilyValues: React.Dispatch<React.SetStateAction<FamilyValue[]>>;
  traditions: Tradition[];
  setTraditions: React.Dispatch<React.SetStateAction<Tradition[]>>;
  blogPosts: BlogPost[];
  importantDates: ImportantDate[];
  childrenProfiles: ChildProfile[];
  developmentPlans: DevelopmentPlan[];
  chatMessages: ChatMessage[];
  setChatMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  familyAlbum: FamilyAlbum[];
  setFamilyAlbum: React.Dispatch<React.SetStateAction<FamilyAlbum[]>>;
  familyNeeds: FamilyNeed[];
  setFamilyNeeds: React.Dispatch<React.SetStateAction<FamilyNeed[]>>;
  familyTree: FamilyTreeMember[];
  setFamilyTree: React.Dispatch<React.SetStateAction<FamilyTreeMember[]>>;
  selectedTreeMember: FamilyTreeMember | null;
  setSelectedTreeMember: React.Dispatch<React.SetStateAction<FamilyTreeMember | null>>;
  widgetSettings: WidgetConfig[] | null;
  setWidgetSettings: React.Dispatch<React.SetStateAction<WidgetConfig[] | null>>;
  newMessage: string;
  setNewMessage: React.Dispatch<React.SetStateAction<string>>;
  shoppingList: ShoppingItem[];
  setShoppingList: React.Dispatch<React.SetStateAction<ShoppingItem[]>>;
  newItemName: string;
  setNewItemName: React.Dispatch<React.SetStateAction<string>>;
  newItemCategory: 'products' | 'household' | 'clothes' | 'other';
  setNewItemCategory: React.Dispatch<React.SetStateAction<'products' | 'household' | 'clothes' | 'other'>>;
  newItemQuantity: string;
  setNewItemQuantity: React.Dispatch<React.SetStateAction<string>>;
  newItemPriority: 'normal' | 'urgent';
  setNewItemPriority: React.Dispatch<React.SetStateAction<'normal' | 'urgent'>>;
  showAddItemDialog: boolean;
  setShowAddItemDialog: React.Dispatch<React.SetStateAction<boolean>>;
  familyGoals: FamilyGoal[];
  setFamilyGoals: React.Dispatch<React.SetStateAction<FamilyGoal[]>>;
  calendarFilter: 'all' | 'personal' | 'family';
  setCalendarFilter: React.Dispatch<React.SetStateAction<'all' | 'personal' | 'family'>>;
  selectedDevSection: any | null;
  setSelectedDevSection: React.Dispatch<React.SetStateAction<any | null>>;
  voteComment: string;
  setVoteComment: React.Dispatch<React.SetStateAction<string>>;
  showCommentDialog: boolean;
  setShowCommentDialog: React.Dispatch<React.SetStateAction<boolean>>;
  pendingVote: { sectionId: string; voteType: 'up' | 'down' } | null;
  setPendingVote: React.Dispatch<React.SetStateAction<{ sectionId: string; voteType: 'up' | 'down' } | null>>;
  bottomBarSections: string[];
  setBottomBarSections: React.Dispatch<React.SetStateAction<string[]>>;
  leftPanelSections: string[];
  setLeftPanelSections: React.Dispatch<React.SetStateAction<string[]>>;
  topPanelSections: string[];
  setTopPanelSections: React.Dispatch<React.SetStateAction<string[]>>;
}

const availableSections = [
  { id: 'family', icon: 'Users', label: 'Профили семьи' },
  { id: 'tasks', icon: 'CheckSquare', label: 'Задачи' },
  { id: 'recipes', icon: 'ChefHat', label: 'Рецепты' },
  { id: 'trips', icon: 'Plane', label: 'Путешествия' },
  { id: 'health', icon: 'Heart', label: 'Здоровье' },
  { id: 'analytics', icon: 'BarChart3', label: 'Аналитика' },
  { id: 'calendar', icon: 'Calendar', label: 'Календарь' },
  { id: 'goals', icon: 'Target', label: 'Цели' },
  { id: 'values', icon: 'HeartHandshake', label: 'Ценности' },
  { id: 'traditions', icon: 'Sparkles', label: 'Традиции' },
  { id: 'shopping', icon: 'ShoppingCart', label: 'Покупки' },
  { id: 'meals', icon: 'UtensilsCrossed', label: 'Меню' },
];

export default function useIndexState(): UseIndexStateReturn {
  const [familyName, setFamilyName] = useState('Наша Семья');
  const [familyLogo, setFamilyLogo] = useState('https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/bucket/90f87bac-e708-4551-b2dc-061dd3d7b0ed.JPG');
  const [familyBanner, setFamilyBanner] = useState('');

  const [showAssistantSelector, setShowAssistantSelector] = useState(false);
  const [showFirstLoginWelcome, setShowFirstLoginWelcome] = useState(false);

  const [showWelcome, setShowWelcome] = useState(() => {
    if (localStorage.getItem('isDemoMode') === 'true') return false;

    const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
    const userData = localStorage.getItem('userData');

    if (hasSeenWelcome) return false;

    if (userData) {
      try {
        const user = JSON.parse(userData);
        if (user.family_name && user.logo_url) {
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
    return false;
  });

  const [isLeftMenuVisible, setIsLeftMenuVisible] = useState(false);
  const [showSidebarHint, setShowSidebarHint] = useState(false);
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

  const [showFamilyInvite, setShowFamilyInvite] = useState(false);
  const [showKuzyaDialog, setShowKuzyaDialog] = useState(false);

  const [isBottomBarVisible, setIsBottomBarVisible] = useState(true);
  const [autoHideBottomBar, setAutoHideBottomBar] = useState(() => {
    return localStorage.getItem('autoHideBottomBar') === 'true';
  });

  const [showTopPanelSettings, setShowTopPanelSettings] = useState(false);
  const [showLeftPanelSettings, setShowLeftPanelSettings] = useState(false);
  const [showWidgetSettings, setShowWidgetSettings] = useState(false);

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

  const [reminders, setReminders] = useState<Reminder[]>([]);
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
  const [blogPosts] = useState<BlogPost[]>(initialBlogPosts);
  const [importantDates] = useState<ImportantDate[]>(initialImportantDates);

  const [childrenProfiles] = useState<ChildProfile[]>(initialChildrenProfiles);
  const [developmentPlans] = useState<DevelopmentPlan[]>(initialDevelopmentPlans);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(initialChatMessages);
  const [familyAlbum, setFamilyAlbum] = useState<FamilyAlbum[]>(initialFamilyAlbum);
  const [familyNeeds, setFamilyNeeds] = useState<FamilyNeed[]>(initialFamilyNeeds);
  const [familyTree, setFamilyTree] = useState<FamilyTreeMember[]>(initialFamilyTree);
  const [selectedTreeMember, setSelectedTreeMember] = useState<FamilyTreeMember | null>(null);

  const [widgetSettings, setWidgetSettings] = useState<WidgetConfig[] | null>(() => {
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

  const [calendarFilter, setCalendarFilter] = useState<'all' | 'personal' | 'family'>('all');

  const [selectedDevSection, setSelectedDevSection] = useState<any | null>(null);
  const [voteComment, setVoteComment] = useState('');
  const [showCommentDialog, setShowCommentDialog] = useState(false);
  const [pendingVote, setPendingVote] = useState<{ sectionId: string; voteType: 'up' | 'down' } | null>(null);

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

    sections = sections.filter((s: string) => !['style', 'voting', 'presentation', 'reset', 'language', 'profile', 'instructions', 'appearance'].includes(s));

    if (!sections.includes('settings')) {
      sections.push('settings');
    }

    localStorage.setItem('topPanelSections', JSON.stringify(sections));

    return sections;
  });

  return {
    familyName, setFamilyName,
    familyLogo, setFamilyLogo,
    familyBanner, setFamilyBanner,
    showAssistantSelector, setShowAssistantSelector,
    showFirstLoginWelcome, setShowFirstLoginWelcome,
    showWelcome, setShowWelcome,
    welcomeText, setWelcomeText,
    isTopBarVisible, setIsTopBarVisible,
    autoHideTopBar, setAutoHideTopBar,
    isLeftMenuVisible, setIsLeftMenuVisible,
    showSidebarHint, setShowSidebarHint,
    autoHideLeftMenu, setAutoHideLeftMenu,
    activeSection, setActiveSection,
    showInDevelopment, setShowInDevelopment,
    educationChild, setEducationChild,
    chamomileEnabled, setChamomileEnabled,
    soundEnabled, setSoundEnabled,
    showProfileOnboarding, setShowProfileOnboarding,
    showFamilyInvite, setShowFamilyInvite,
    showKuzyaDialog, setShowKuzyaDialog,
    isBottomBarVisible, setIsBottomBarVisible,
    autoHideBottomBar, setAutoHideBottomBar,
    showTopPanelSettings, setShowTopPanelSettings,
    showLeftPanelSettings, setShowLeftPanelSettings,
    showWidgetSettings, setShowWidgetSettings,
    showLanguageSelector, setShowLanguageSelector,
    showThemeSelector, setShowThemeSelector,
    currentLanguage, setCurrentLanguage,
    currentTheme, setCurrentTheme,
    appearanceMode, setAppearanceMode,
    reminders, setReminders,
    familyValues, setFamilyValues,
    traditions, setTraditions,
    blogPosts,
    importantDates,
    childrenProfiles,
    developmentPlans,
    chatMessages, setChatMessages,
    familyAlbum, setFamilyAlbum,
    familyNeeds, setFamilyNeeds,
    familyTree, setFamilyTree,
    selectedTreeMember, setSelectedTreeMember,
    widgetSettings, setWidgetSettings,
    newMessage, setNewMessage,
    shoppingList, setShoppingList,
    newItemName, setNewItemName,
    newItemCategory, setNewItemCategory,
    newItemQuantity, setNewItemQuantity,
    newItemPriority, setNewItemPriority,
    showAddItemDialog, setShowAddItemDialog,
    familyGoals, setFamilyGoals,
    calendarFilter, setCalendarFilter,
    selectedDevSection, setSelectedDevSection,
    voteComment, setVoteComment,
    showCommentDialog, setShowCommentDialog,
    pendingVote, setPendingVote,
    bottomBarSections, setBottomBarSections,
    leftPanelSections, setLeftPanelSections,
    topPanelSections, setTopPanelSections,
  };
}
