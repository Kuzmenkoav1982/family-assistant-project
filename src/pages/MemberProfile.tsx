import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { useFamilyMembers } from '@/hooks/useFamilyMembers';
import { ChildDreamsManager } from '@/components/ChildDreamsManager';
import { PiggyBankManager } from '@/components/PiggyBankManager';
import { MemberProfileEdit } from '@/components/MemberProfileEdit';
import type { Dream, FamilyMember } from '@/types/family.types';
import { DEMO_FAMILY } from '@/data/demoFamily';

export default function MemberProfile() {
  const { memberId } = useParams();
  const navigate = useNavigate();
  const { members, updateMember } = useFamilyMembers();
  
  let member = members.find(m => m.id === memberId);
  
  if (!member) {
    const demoMember = DEMO_FAMILY.members.find(dm => dm.id === memberId);
    if (demoMember) {
      member = {
        id: demoMember.id,
        name: demoMember.name,
        role: demoMember.role === 'owner' ? 'Папа' : demoMember.role === 'admin' ? 'Мама' : demoMember.role === 'child' ? 'Ребёнок' : 'Участник',
        avatar: '👤',
        avatarType: 'photo' as const,
        photoUrl: demoMember.avatar,
        age: demoMember.age,
        relationship: demoMember.role === 'owner' || demoMember.role === 'admin' ? 'Родитель' : 'Ребёнок',
        points: 0,
        level: 1,
        workload: 0,
        mood: 'Хорошо',
        tasksCompleted: 0,
        achievements: [],
        dreams: [],
        piggyBank: 0
      } as FamilyMember;
    }
  }

  if (!member) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-8">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-lg text-muted-foreground mb-4">Член семьи не найден</p>
          <Button onClick={() => navigate('/')}>На главную</Button>
        </div>
      </div>
    );
  }

  const isChild = member.age && member.age < 18;

  const handleAddDream = async (dream: Omit<Dream, 'id' | 'createdAt'>) => {
    const newDream: Dream = {
      ...dream,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };

    await updateMember({
      id: member.id,
      dreams: [...(member.dreams || []), newDream]
    });
  };

  const handleUpdateDream = async (dreamId: string, updates: Partial<Dream>) => {
    const updatedDreams = (member.dreams || []).map(d => 
      d.id === dreamId ? { ...d, ...updates } : d
    );

    await updateMember({
      id: member.id,
      dreams: updatedDreams
    });
  };

  const handleUpdateBalance = async (newBalance: number) => {
    await updateMember({
      id: member.id,
      piggyBank: newBalance
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Button onClick={() => navigate('/')} variant="outline">
          <Icon name="ArrowLeft" className="mr-2" size={16} />
          Назад
        </Button>

        <Tabs defaultValue="info" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
            <TabsTrigger value="info" className="flex items-center justify-center gap-1 md:gap-2">
              <Icon name="User" size={16} />
              <span>Профиль</span>
            </TabsTrigger>
            {isChild && (
              <>
                <TabsTrigger value="dreams" className="flex items-center justify-center gap-1 md:gap-2">
                  <Icon name="Sparkles" size={16} />
                  <span>Мечты</span>
                </TabsTrigger>
                <TabsTrigger value="piggybank" className="flex items-center justify-center gap-1 md:gap-2">
                  <Icon name="PiggyBank" size={16} />
                  <span>Копилка</span>
                </TabsTrigger>
              </>
            )}
          </TabsList>

          <TabsContent value="info">
            <MemberProfileEdit
              member={member}
              onSave={async (updates) => {
                await updateMember({ id: member.id, ...updates });
              }}
            />
          </TabsContent>

          {isChild && (
            <>
              <TabsContent value="dreams">
                <ChildDreamsManager 
                  dreams={member.dreams || []}
                  onAddDream={handleAddDream}
                  onUpdateDream={handleUpdateDream}
                />
              </TabsContent>

              <TabsContent value="piggybank">
                <PiggyBankManager 
                  balance={member.piggyBank || 0}
                  onUpdateBalance={handleUpdateBalance}
                />
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>
    </div>
  );
}