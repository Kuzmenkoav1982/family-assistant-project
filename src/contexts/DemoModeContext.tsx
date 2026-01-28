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
} from '@/data/extendedMockData';
import type { FamilyMember, Task, ShoppingItem } from '@/types/family.types';

interface DemoModeContextType {
  isDemoMode: boolean;
  demoMembers: FamilyMember[];
  demoTasks: Task[];
  demoShoppingList: ShoppingItem[];
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
