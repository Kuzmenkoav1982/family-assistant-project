import { useState } from 'react';
import type { FamilyMember } from '@/types/family.types';
import type { WidgetConfig } from '@/components/WidgetSettings';
import useLayoutState from '@/hooks/useLayoutState';
import useAppearanceState from '@/hooks/useAppearanceState';
import useFamilyDataState from '@/hooks/useFamilyDataState';
import useShoppingState from '@/hooks/useShoppingState';
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
} from '@/types/family.types';
import type { LanguageCode } from '@/translations';

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

export default function useIndexState(): UseIndexStateReturn {
  const layout = useLayoutState();
  const appearance = useAppearanceState();
  const familyData = useFamilyDataState();
  const shopping = useShoppingState();

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

  const [activeSection, setActiveSection] = useState<string>('today');
  const [showInDevelopment, setShowInDevelopment] = useState(false);
  const [educationChild, setEducationChild] = useState<FamilyMember | null>(null);

  const [showProfileOnboarding, setShowProfileOnboarding] = useState(false);
  const [showFamilyInvite, setShowFamilyInvite] = useState(false);
  const [showKuzyaDialog, setShowKuzyaDialog] = useState(false);

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
  const [calendarFilter, setCalendarFilter] = useState<'all' | 'personal' | 'family'>('all');
  const [selectedDevSection, setSelectedDevSection] = useState<any | null>(null);
  const [voteComment, setVoteComment] = useState('');
  const [showCommentDialog, setShowCommentDialog] = useState(false);
  const [pendingVote, setPendingVote] = useState<{ sectionId: string; voteType: 'up' | 'down' } | null>(null);

  return {
    ...layout,
    ...appearance,
    ...familyData,
    ...shopping,
    familyName, setFamilyName,
    familyLogo, setFamilyLogo,
    familyBanner, setFamilyBanner,
    showAssistantSelector, setShowAssistantSelector,
    showFirstLoginWelcome, setShowFirstLoginWelcome,
    showWelcome, setShowWelcome,
    welcomeText, setWelcomeText,
    activeSection, setActiveSection,
    showInDevelopment, setShowInDevelopment,
    educationChild, setEducationChild,
    showProfileOnboarding, setShowProfileOnboarding,
    showFamilyInvite, setShowFamilyInvite,
    showKuzyaDialog, setShowKuzyaDialog,
    widgetSettings, setWidgetSettings,
    newMessage, setNewMessage,
    calendarFilter, setCalendarFilter,
    selectedDevSection, setSelectedDevSection,
    voteComment, setVoteComment,
    showCommentDialog, setShowCommentDialog,
    pendingVote, setPendingVote,
  };
}