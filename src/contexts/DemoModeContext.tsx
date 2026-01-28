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
import type { FamilyMember, Task, ShoppingItem } from '@/types/family.types';

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

  useEffect(() => {
    const checkDemoMode = () => {
      const demoFlag = localStorage.getItem('isDemoMode') === 'true';
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
    throw new Error('useDemoMode must be used within DemoModeProvider');
  }
  return context;
}