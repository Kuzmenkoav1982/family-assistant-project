import { useState, useEffect } from 'react';
import { useTasks } from '@/hooks/useTasks';
import { useFamilyMembers } from '@/hooks/useFamilyMembers';
import type {
  Reminder,
  ImportantDate,
  FamilyValue,
  BlogPost,
  Tradition,
  ChildProfile,
  DevelopmentPlan,
  ChatMessage,
  FamilyAlbum,
  FamilyNeed,
  FamilyTreeMember,
  CalendarEvent,
  AIRecommendation,
  ThemeType,
  FamilyMember,
} from '@/types/family.types';
import { type LanguageCode } from '@/translations';
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
} from '@/data/mockData';

export function useIndexState() {
  const { members: familyMembersRaw, loading: membersLoading, addMember, updateMember, deleteMember } = useFamilyMembers();
  const { tasks: tasksRaw, loading: tasksLoading, toggleTask: toggleTaskDB, createTask, updateTask, deleteTask } = useTasks();
  
  const familyMembers = familyMembersRaw || [];
  const tasks = tasksRaw || [];
  
  // Используем моки только для неавторизованных пользователей и демо-режима.
  // Авторизованные пользователи видят только реальные данные из API/БД.
  const isAuthed = typeof window !== 'undefined' && !!localStorage.getItem('authToken');
  const isDemo = typeof window !== 'undefined' && localStorage.getItem('demoMode') === 'true';
  const useMocks = !isAuthed || isDemo;

  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [importantDates] = useState<ImportantDate[]>(useMocks ? initialImportantDates : []);
  const [familyValues] = useState<FamilyValue[]>(useMocks ? initialFamilyValues : []);
  const [blogPosts] = useState<BlogPost[]>(useMocks ? initialBlogPosts : []);
  const [traditions] = useState<Tradition[]>(useMocks ? initialTraditions : []);
  const [childrenProfiles] = useState<ChildProfile[]>(useMocks ? initialChildrenProfiles : []);
  const [developmentPlans] = useState<DevelopmentPlan[]>(useMocks ? initialDevelopmentPlans : []);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(useMocks ? initialChatMessages : []);
  const [familyAlbum, setFamilyAlbum] = useState<FamilyAlbum[]>(useMocks ? initialFamilyAlbum : []);
  const [familyNeeds, setFamilyNeeds] = useState<FamilyNeed[]>(useMocks ? initialFamilyNeeds : []);
  const [familyTree, setFamilyTree] = useState<FamilyTreeMember[]>(useMocks ? initialFamilyTree : []);
  const [selectedTreeMember, setSelectedTreeMember] = useState<FamilyTreeMember | null>(null);
  const [aiRecommendations] = useState<AIRecommendation[]>(useMocks ? initialAIRecommendations : []);
  const [newMessage, setNewMessage] = useState('');
  const [calendarEvents] = useState<CalendarEvent[]>(useMocks ? initialCalendarEvents : []);
  const [calendarFilter, setCalendarFilter] = useState<'all' | 'personal' | 'family'>('all');
  const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>(() => {
    return (localStorage.getItem('familyOrganizerLanguage') as LanguageCode) || 'ru';
  });
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

  return {
    familyMembers,
    tasks,
    reminders,
    setReminders,
    importantDates,
    familyValues,
    blogPosts,
    traditions,
    childrenProfiles,
    developmentPlans,
    chatMessages,
    setChatMessages,
    familyAlbum,
    setFamilyAlbum,
    familyNeeds,
    setFamilyNeeds,
    familyTree,
    setFamilyTree,
    selectedTreeMember,
    setSelectedTreeMember,
    aiRecommendations,
    newMessage,
    setNewMessage,
    calendarEvents,
    calendarFilter,
    setCalendarFilter,
    currentLanguage,
    setCurrentLanguage,
    showLanguageSelector,
    setShowLanguageSelector,
    currentTheme,
    setCurrentTheme,
    showThemeSelector,
    setShowThemeSelector,
    showWelcome,
    setShowWelcome,
    welcomeText,
    setWelcomeText,
    isTopBarVisible,
    setIsTopBarVisible,
    autoHideTopBar,
    setAutoHideTopBar,
    isMoodWidgetVisible,
    setIsMoodWidgetVisible,
    autoHideMoodWidget,
    setAutoHideMoodWidget,
    selectedMemberForMood,
    setSelectedMemberForMood,
    isLeftMenuVisible,
    setIsLeftMenuVisible,
    autoHideLeftMenu,
    setAutoHideLeftMenu,
    activeSection,
    setActiveSection,
    showInDevelopment,
    setShowInDevelopment,
    currentUser,
    currentUserId,
    membersLoading,
    tasksLoading,
    addMember,
    updateMember,
    deleteMember,
    toggleTaskDB,
    createTask,
    updateTask,
    deleteTask,
  };
}