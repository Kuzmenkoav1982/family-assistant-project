import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  initialFamilyMembers,
  initialTasks,
  initialShoppingList,
} from '@/data/mockData';
import {
  recipes,
  shoppingList as extendedShoppingList,
  calendarEventsExtended,
  familyGoalsExtended,
  trips,
  votingPolls,
  leisureActivities,
} from '@/data/extendedMockData';
import {
  demoTestResults as testResultsData,
  demoTestSchedule as testScheduleData,
  demoTestStats as testStatsData
} from '@/data/demoTestResults';
import { DEMO_CALENDAR_EVENTS } from '@/data/demoChildrenData';
import { demoCourses, demoLessons, demoTests, demoLessonsProgress, demoTestResults as demoEduTestResults } from '@/data/demoFinancialLiteracy';
import { demoLoyaltyCards } from '@/data/demoLoyaltyCards';
import type { FamilyMember, Task, ShoppingItem } from '@/types/family.types';

export interface DemoLocation {
  memberId: string;
  lat: number;
  lng: number;
  timestamp: string;
  accuracy: number;
}

export interface DemoGeofence {
  id: number;
  name: string;
  center_lat: number;
  center_lng: number;
  radius: number;
  color: string;
}

export interface DemoTrackerMember {
  id: string;
  name: string;
  avatar_url: string | null;
  role: string;
  color: string;
}

interface DemoModeContextType {
  isDemoMode: boolean;
  demoMembers: FamilyMember[];
  demoTasks: Task[];
  demoShoppingList: ShoppingItem[];
  demoRecipes: any[];
  demoCalendarEvents: any[];
  demoGoals: any[];
  demoTrips: any[];
  demoPolls: any[];
  demoTestResults: any[];
  demoTestSchedule: any[];
  demoTestStats: any;
  demoLeisureActivities: any[];
  demoLocations: DemoLocation[];
  demoGeofences: DemoGeofence[];
  demoTrackerMembers: DemoTrackerMember[];
  demoEduCourses: typeof demoCourses;
  demoEduLessons: typeof demoLessons;
  demoEduTests: typeof demoTests;
  demoEduLessonsProgress: typeof demoLessonsProgress;
  demoEduTestResults: typeof demoEduTestResults;
  demoLoyaltyCards: typeof demoLoyaltyCards;
  updateDemoTask: (taskId: string, updates: Partial<Task>) => void;
  toggleDemoTask: (taskId: string) => void;
}

const DemoModeContext = createContext<DemoModeContextType | undefined>(undefined);

export function DemoModeProvider({ children }: { children: React.ReactNode }) {
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [demoMembers] = useState<FamilyMember[]>(initialFamilyMembers);
  const [demoTasks, setDemoTasks] = useState<Task[]>(initialTasks);
  const [demoShoppingList] = useState<ShoppingItem[]>(
    extendedShoppingList.map((item) => ({
      id: item.id,
      name: item.item,
      category: item.category,
      completed: item.purchased,
      assignedTo: item.assignedTo,
      notes: '',
      priority: 'medium' as const,
      createdAt: new Date().toISOString(),
    }))
  );
  const [demoRecipes] = useState(recipes);
  const [demoCalendarEvents] = useState(calendarEventsExtended);
  const [demoGoals] = useState(familyGoalsExtended);
  const [demoTrips] = useState(trips);
  const [demoPolls] = useState(votingPolls);
  const [demoTestResults] = useState(testResultsData);
  const [demoTestSchedule] = useState(testScheduleData);
  const [demoTestStats] = useState(testStatsData);
  const [demoLeisureActivities] = useState(leisureActivities);

  const now = new Date();
  const ts = (minAgo: number) => new Date(now.getTime() - minAgo * 60000).toISOString();

  const [demoTrackerMembers] = useState<DemoTrackerMember[]>([
    { id: '1', name: 'Алексей', role: 'Отец', color: '#3B82F6', avatar_url: 'https://cdn.poehali.dev/files/fb82400e-4e48-4d25-9de7-a9991f13aa29.png' },
    { id: '2', name: 'Анастасия', role: 'Мать', color: '#EC4899', avatar_url: 'https://cdn.poehali.dev/files/3a7d0304-7fd5-4cd7-ac79-f4c235eb7484.png' },
    { id: '3', name: 'Матвей', role: 'Сын', color: '#10B981', avatar_url: 'https://cdn.poehali.dev/files/2c506753-6a4d-447e-a8b2-294bceb38a95.png' },
    { id: '4', name: 'Даша', role: 'Дочь', color: '#F59E0B', avatar_url: 'https://cdn.poehali.dev/files/fcce342c-9b14-420d-b3eb-97084a3bbe08.png' },
  ]);

  const [demoLocations] = useState<DemoLocation[]>([
    { memberId: '1', lat: 55.7558, lng: 37.6173, timestamp: ts(5), accuracy: 15 },
    { memberId: '2', lat: 55.7312, lng: 37.5870, timestamp: ts(8), accuracy: 20 },
    { memberId: '3', lat: 55.7900, lng: 37.5560, timestamp: ts(3), accuracy: 12 },
    { memberId: '4', lat: 55.7650, lng: 37.6800, timestamp: ts(180), accuracy: 25 },
  ]);

  const [demoGeofences] = useState<DemoGeofence[]>([
    { id: 1, name: 'Дом', center_lat: 55.7558, center_lng: 37.6173, radius: 200, color: '#3B82F6' },
    { id: 2, name: 'Офис', center_lat: 55.7312, center_lng: 37.5870, radius: 300, color: '#10B981' },
    { id: 3, name: 'Школа', center_lat: 55.7900, center_lng: 37.5560, radius: 250, color: '#F59E0B' },
    { id: 4, name: 'Поликлиника', center_lat: 55.7650, center_lng: 37.6800, radius: 150, color: '#EC4899' },
  ]);

  useEffect(() => {
    const checkDemoMode = () => {
      const authToken = localStorage.getItem('authToken');
      const demoFlag = localStorage.getItem('isDemoMode') === 'true';
      
      // Если пользователь авторизован - НЕ используем демо-режим
      if (authToken) {
        setIsDemoMode(false);
        return;
      }
      
      // Заполняем демо-данные календаря детей в localStorage
      if (demoFlag) {
        Object.entries(DEMO_CALENDAR_EVENTS).forEach(([childId, events]) => {
          const key = `child_calendar_${childId}`;
          if (!localStorage.getItem(key)) {
            localStorage.setItem(key, JSON.stringify(events));
          }
        });
      }
      
      setIsDemoMode(demoFlag);
    };

    checkDemoMode();
    
    // Подписываемся на изменения localStorage
    const interval = setInterval(checkDemoMode, 500);
    return () => clearInterval(interval);
  }, []);

  const updateDemoTask = (taskId: string, updates: Partial<Task>) => {
    setDemoTasks((prev) =>
      prev.map((task) => (task.id === taskId ? { ...task, ...updates } : task))
    );
  };

  const toggleDemoTask = (taskId: string) => {
    setDemoTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  };

  return (
    <DemoModeContext.Provider
      value={{
        isDemoMode,
        demoMembers,
        demoTasks,
        demoShoppingList,
        demoRecipes,
        demoCalendarEvents,
        demoGoals,
        demoTrips,
        demoPolls,
        demoTestResults,
        demoTestSchedule,
        demoTestStats,
        demoLeisureActivities,
        demoLocations,
        demoGeofences,
        demoTrackerMembers,
        demoEduCourses: demoCourses,
        demoEduLessons: demoLessons,
        demoEduTests: demoTests,
        demoEduLessonsProgress: demoLessonsProgress,
        demoEduTestResults: demoEduTestResults,
        demoLoyaltyCards: demoLoyaltyCards,
        updateDemoTask,
        toggleDemoTask,
      }}
    >
      {children}
    </DemoModeContext.Provider>
  );
}

export function useDemoMode() {
  const context = useContext(DemoModeContext);
  if (!context) {
    return {
      isDemoMode: false,
      demoMembers: [],
      demoTasks: [],
      demoShoppingList: [],
      demoRecipes: [],
      demoCalendarEvents: [],
      demoGoals: [],
      demoTrips: [],
      demoPolls: [],
      demoTestResults: [],
      demoTestSchedule: [],
      demoTestStats: {},
      demoLeisureActivities: [],
      demoLocations: [],
      demoGeofences: [],
      demoTrackerMembers: [],
      demoEduCourses: [],
      demoEduLessons: {},
      demoEduTests: {},
      demoEduLessonsProgress: [],
      demoEduTestResults: [],
      demoLoyaltyCards: [],
      updateDemoTask: () => {},
      toggleDemoTask: () => {}
    };
  }
  return context;
}