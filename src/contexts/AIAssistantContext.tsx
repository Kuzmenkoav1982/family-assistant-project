import React, { createContext, useContext, useState, useEffect } from 'react';

type AssistantType = 'neutral' | 'domovoy';

interface AIAssistantRole {
  id: string;
  name: string;
  icon: string;
  description: string;
  emoji: string;
}

interface AIAssistantContextType {
  assistantType: AssistantType | null;
  assistantName: string;
  assistantLevel: number;
  selectedRole: AIAssistantRole | null;
  setAssistantType: (type: AssistantType) => void;
  setAssistantName: (name: string) => void;
  setAssistantLevel: (level: number) => void;
  setSelectedRole: (role: AIAssistantRole | null) => void;
  resetSelection: () => void;
}

const AIAssistantContext = createContext<AIAssistantContextType | undefined>(undefined);

const defaultRoles: AIAssistantRole[] = [
  { id: 'family', name: 'Семейный помощник', icon: 'Users', description: 'Универсальный помощник', emoji: '👨‍👩‍👧‍👦' },
  { id: 'cook', name: 'Повар', icon: 'ChefHat', description: 'Рецепты и кулинария', emoji: '👨‍🍳' },
  { id: 'organizer', name: 'Организатор', icon: 'Calendar', description: 'Планирование задач', emoji: '📋' },
  { id: 'educator', name: 'Воспитатель', icon: 'GraduationCap', description: 'Советы по детям', emoji: '👨‍🏫' },
  { id: 'finance', name: 'Финансовый советник', icon: 'Wallet', description: 'Бюджет и экономика', emoji: '💰' },
  { id: 'psychologist', name: 'Психолог', icon: 'Heart', description: 'Отношения в семье', emoji: '💖' },
  { id: 'fitness', name: 'Фитнес-тренер', icon: 'Dumbbell', description: 'Здоровье и спорт', emoji: '💪' },
  { id: 'nutritionist', name: 'Диетолог', icon: 'Apple', description: 'Правильное питание', emoji: '🍎' },
  { id: 'travel', name: 'Тревел-планер', icon: 'Plane', description: 'Организация поездок', emoji: '✈️' },
  { id: 'astrologer', name: 'Астролог', icon: 'Moon', description: 'Гороскопы и прогнозы', emoji: '🌙' }
];

export function AIAssistantProvider({ children }: { children: React.ReactNode }) {
  const [assistantType, setAssistantTypeState] = useState<AssistantType | null>(() => {
    const saved = localStorage.getItem('assistantType');
    return saved as AssistantType | null;
  });

  const [assistantName, setAssistantNameState] = useState<string>(() => {
    return localStorage.getItem('assistantName') || '';
  });

  const [assistantLevel, setAssistantLevelState] = useState<number>(() => {
    const saved = localStorage.getItem('assistantLevel');
    return saved ? parseInt(saved) : 1;
  });

  const [selectedRole, setSelectedRoleState] = useState<AIAssistantRole | null>(() => {
    const saved = localStorage.getItem('assistantRole');
    if (saved) {
      return defaultRoles.find(r => r.id === saved) || null;
    }
    return null;
  });

  const setAssistantType = (type: AssistantType) => {
    setAssistantTypeState(type);
    localStorage.setItem('assistantType', type);
    if (type === 'domovoy') {
      setAssistantNameState('Домовой');
      localStorage.setItem('assistantName', 'Домовой');
    }
  };

  const setAssistantName = (name: string) => {
    setAssistantNameState(name);
    localStorage.setItem('assistantName', name);
  };

  const setAssistantLevel = (level: number) => {
    setAssistantLevelState(level);
    localStorage.setItem('assistantLevel', level.toString());
  };

  const setSelectedRole = (role: AIAssistantRole | null) => {
    setSelectedRoleState(role);
    if (role) {
      localStorage.setItem('assistantRole', role.id);
    } else {
      localStorage.removeItem('assistantRole');
    }
  };

  const resetSelection = () => {
    setAssistantTypeState(null);
    setAssistantNameState('');
    setAssistantLevelState(1);
    setSelectedRoleState(null);
    localStorage.removeItem('assistantType');
    localStorage.removeItem('assistantName');
    localStorage.removeItem('assistantLevel');
    localStorage.removeItem('assistantRole');
  };

  return (
    <AIAssistantContext.Provider
      value={{
        assistantType,
        assistantName,
        assistantLevel,
        selectedRole,
        setAssistantType,
        setAssistantName,
        setAssistantLevel,
        setSelectedRole,
        resetSelection
      }}
    >
      {children}
    </AIAssistantContext.Provider>
  );
}

export function useAIAssistant() {
  const context = useContext(AIAssistantContext);
  if (context === undefined) {
    throw new Error('useAIAssistant must be used within AIAssistantProvider');
  }
  return context;
}

export { defaultRoles };
export type { AssistantType, AIAssistantRole };
