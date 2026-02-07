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
  hasCompletedSetup: boolean;
  setAssistantType: (type: AssistantType) => Promise<void>;
  setAssistantName: (name: string) => Promise<void>;
  setAssistantLevel: (level: number) => void;
  setSelectedRole: (role: AIAssistantRole | null) => Promise<void>;
  resetSelection: () => void;
  refreshAssistantLevel: () => Promise<void>;
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
  const [hasCompletedSetup, setHasCompletedSetup] = useState<boolean>(() => {
    return localStorage.getItem('assistantSetupCompleted') === 'true';
  });

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

  // Загрузка настроек ассистента с сервера при авторизации
  useEffect(() => {
    const loadAssistantSettings = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      try {
        const response = await fetch('https://functions.poehali.dev/e7113c2a-154d-46b2-90b6-6752a3fd9085', {
          method: 'GET',
          headers: {
            'X-Auth-Token': token
          },
          signal: AbortSignal.timeout(8000)
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            // Загружаем уровень
            if (data.level) {
              setAssistantLevelState(data.level);
              localStorage.setItem('assistantLevel', data.level.toString());
            }
            
            // Загружаем настройки ассистента с сервера
            if (data.settings) {
              const settings = data.settings;
              
              if (settings.assistant_type) {
                setAssistantTypeState(settings.assistant_type);
                localStorage.setItem('assistantType', settings.assistant_type);
                localStorage.setItem('assistantSetupCompleted', 'true');
                setHasCompletedSetup(true);
              }
              
              if (settings.assistant_name) {
                setAssistantNameState(settings.assistant_name);
                localStorage.setItem('assistantName', settings.assistant_name);
              }
              
              if (settings.assistant_role) {
                const role = defaultRoles.find(r => r.id === settings.assistant_role);
                if (role) {
                  setSelectedRoleState(role);
                  localStorage.setItem('assistantRole', settings.assistant_role);
                }
              }
            }
          }
        }
      } catch (error) {
        console.debug('Assistant settings load skipped:', error);
        // Тихо игнорируем - используем настройки из localStorage
      }
    };

    loadAssistantSettings();
  }, []);

  const setAssistantType = async (type: AssistantType) => {
    setAssistantTypeState(type);
    localStorage.setItem('assistantType', type);
    localStorage.setItem('assistantSetupCompleted', 'true');
    setHasCompletedSetup(true);
    
    const name = type === 'domovoy' ? 'Домовой' : '';
    if (type === 'domovoy') {
      setAssistantNameState(name);
      localStorage.setItem('assistantName', name);
    }
    
    // Сохраняем на сервер
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        await fetch('https://functions.poehali.dev/e7113c2a-154d-46b2-90b6-6752a3fd9085?action=update-settings', {
          method: 'POST',
          headers: {
            'X-Auth-Token': token,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            assistant_type: type,
            assistant_name: name
          })
        });
      } catch (error) {
        console.debug('Failed to save assistant type to server:', error);
      }
    }
  };

  const setAssistantName = async (name: string) => {
    setAssistantNameState(name);
    localStorage.setItem('assistantName', name);
    
    // Сохраняем на сервер
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        await fetch('https://functions.poehali.dev/e7113c2a-154d-46b2-90b6-6752a3fd9085?action=update-settings', {
          method: 'POST',
          headers: {
            'X-Auth-Token': token,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            assistant_name: name
          })
        });
      } catch (error) {
        console.debug('Failed to save assistant name to server:', error);
      }
    }
  };

  const setAssistantLevel = (level: number) => {
    setAssistantLevelState(level);
    localStorage.setItem('assistantLevel', level.toString());
  };

  const setSelectedRole = async (role: AIAssistantRole | null) => {
    setSelectedRoleState(role);
    if (role) {
      localStorage.setItem('assistantRole', role.id);
      
      // Сохраняем на сервер
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          await fetch('https://functions.poehali.dev/e7113c2a-154d-46b2-90b6-6752a3fd9085?action=update-settings', {
            method: 'POST',
            headers: {
              'X-Auth-Token': token,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              assistant_role: role.id
            })
          });
        } catch (error) {
          console.debug('Failed to save assistant role to server:', error);
        }
      }
    } else {
      localStorage.removeItem('assistantRole');
    }
  };

  const resetSelection = () => {
    setAssistantTypeState(null);
    setAssistantNameState('');
    setAssistantLevelState(1);
    setSelectedRoleState(null);
    setHasCompletedSetup(false);
    localStorage.removeItem('assistantType');
    localStorage.removeItem('assistantName');
    localStorage.removeItem('assistantLevel');
    localStorage.removeItem('assistantRole');
    localStorage.removeItem('assistantSetupCompleted');
  };

  const refreshAssistantLevel = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) return;

    try {
      const response = await fetch('https://functions.poehali.dev/e7113c2a-154d-46b2-90b6-6752a3fd9085', {
        method: 'GET',
        headers: {
          'X-Auth-Token': token
        },
        signal: AbortSignal.timeout(8000) // Таймаут 8 секунд
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.level) {
          setAssistantLevelState(data.level);
          localStorage.setItem('assistantLevel', data.level.toString());
        }
      }
    } catch (error) {
      console.debug('Assistant level refresh skipped:', error);
      // Тихо игнорируем - используем текущий уровень
    }
  };

  return (
    <AIAssistantContext.Provider
      value={{
        assistantType,
        assistantName,
        assistantLevel,
        selectedRole,
        hasCompletedSetup,
        setAssistantType,
        setAssistantName,
        setAssistantLevel,
        setSelectedRole,
        resetSelection,
        refreshAssistantLevel
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