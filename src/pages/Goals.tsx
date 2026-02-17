import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import SectionHero from '@/components/ui/section-hero';
import { GoalsSection } from '@/components/GoalsSection';
import { useFamilyMembersContext } from '@/contexts/FamilyMembersContext';
import type { FamilyGoal } from '@/types/family.types';
import { initialFamilyGoals } from '@/data/mockData';

export default function Goals() {
  const { members } = useFamilyMembersContext();

  const authUserData = (() => {
    try {
      const data = localStorage.getItem('userData');
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  })();

  const currentUserId = authUserData?.member_id || members?.[0]?.id || '';

  const [familyGoals, setFamilyGoals] = useState<FamilyGoal[]>(() => {
    const saved = localStorage.getItem('familyGoals');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((g: Record<string, unknown>) => ({
            ...g,
            checkpoints: g.checkpoints || [],
            aiSuggestions: g.aiSuggestions || [],
            status: g.status || 'planning',
            priority: g.priority || 'medium',
            category: g.category || 'other',
            targetDate: g.targetDate || g.deadline || new Date().toISOString(),
            startDate: g.startDate || g.createdAt || new Date().toISOString(),
            progress: g.progress || 0,
          }));
        }
      } catch {
        return initialFamilyGoals;
      }
    }
    return initialFamilyGoals;
  });

  useEffect(() => {
    localStorage.setItem('familyGoals', JSON.stringify(familyGoals));
  }, [familyGoals]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-blue-50/30 to-white pb-24">
      <div className="max-w-5xl mx-auto p-4 space-y-6">
        <SectionHero
          title="Цели семьи"
          subtitle="Долгосрочное планирование и контроль целей"
          imageUrl="https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/aebca401-927f-4368-af40-780e294f101f.jpg"
          backPath="/planning-hub"
        />

        <Card className="border-2 border-indigo-200 bg-indigo-50/50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                <Icon name="Target" size={24} className="text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-2">Как работают цели?</h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p><strong>Ставьте долгосрочные цели</strong> — накопить на квартиру, поехать в отпуск, сделать ремонт.</p>
                  <p><strong>Добавляйте контрольные точки</strong> для отслеживания прогресса на диаграмме Ганта.</p>
                  <p><strong>Назначайте ответственных</strong> из членов семьи и следите за выполнением.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <GoalsSection
          goals={familyGoals}
          familyMembers={members || []}
          currentUserId={currentUserId}
          onAddGoal={(goalData) => {
            const newGoal: FamilyGoal = {
              ...goalData,
              id: Date.now().toString(),
              createdAt: new Date().toISOString()
            };
            setFamilyGoals(prev => [...prev, newGoal]);
          }}
          onUpdateGoal={(goalId, updates) => {
            setFamilyGoals(prev =>
              prev.map(g => g.id === goalId ? { ...g, ...updates } : g)
            );
          }}
          onDeleteGoal={(goalId) => {
            setFamilyGoals(prev => prev.filter(g => g.id !== goalId));
          }}
        />
      </div>
    </div>
  );
}