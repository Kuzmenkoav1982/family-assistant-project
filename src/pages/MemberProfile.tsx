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
        <div className="flex justify-between items-start">
          <Button onClick={() => navigate('/')} variant="outline">
            <Icon name="ArrowLeft" className="mr-2" size={16} />
            Назад
          </Button>
        </div>

        <Card className="border-2 border-purple-200">
          <CardContent className="p-4 md:p-6">
            <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-6">
              {member.photoUrl ? (
                <img 
                  src={member.photoUrl} 
                  alt={member.name}
                  className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-purple-300"
                />
              ) : (
                <div className="text-6xl sm:text-8xl animate-bounce-slow">{member.avatar}</div>
              )}
              <div className="flex-1 text-center sm:text-left">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">{member.name}</h1>
                <p className="text-lg md:text-xl text-muted-foreground mb-4">{member.role}</p>
                
                <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                  {member.age && (
                    <Badge variant="outline">
                      <Icon name="Cake" className="mr-1" size={14} />
                      {member.age} лет
                    </Badge>
                  )}
                  <Badge variant="outline" className="bg-orange-50">
                    <Icon name="Award" className="mr-1" size={14} />
                    Уровень {member.level}
                  </Badge>
                  <Badge variant="outline" className="bg-yellow-50">
                    <Icon name="Star" className="mr-1" size={14} />
                    {member.points} баллов
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-muted-foreground">Загруженность</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-purple-600">{member.workload}%</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-muted-foreground">Достижения</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-600">{(member.achievements || []).length}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-muted-foreground">Обязанности</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">{member.responsibilities?.length || 0}</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="info" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
            <TabsTrigger value="info" className="flex items-center justify-center gap-1 md:gap-2">
              <Icon name="Info" size={16} />
              <span className="hidden sm:inline">Инфо</span>
            </TabsTrigger>
            <TabsTrigger value="edit" className="flex items-center justify-center gap-1 md:gap-2">
              <Icon name="Edit" size={16} />
              <span className="hidden sm:inline">Редактировать</span>
            </TabsTrigger>
            {isChild && (
              <>
                <TabsTrigger value="dreams" className="flex items-center justify-center gap-1 md:gap-2">
                  <Icon name="Sparkles" size={16} />
                  <span className="hidden sm:inline">Мечты</span>
                </TabsTrigger>
                <TabsTrigger value="piggybank" className="flex items-center justify-center gap-1 md:gap-2">
                  <Icon name="PiggyBank" size={16} />
                  <span className="hidden sm:inline">Копилка</span>
                </TabsTrigger>
              </>
            )}
            <TabsTrigger value="responsibilities" className="flex items-center justify-center gap-1 md:gap-2">
              <Icon name="ListTodo" size={16} />
              <span className="hidden sm:inline">Обязанности</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="edit">
            <MemberProfileEdit
              member={member}
              onSave={async (updates) => {
                await updateMember({ id: member.id, ...updates });
              }}
            />
          </TabsContent>

          <TabsContent value="info">
            <div className="grid gap-4">
              {member.foodPreferences && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Icon name="Utensils" />
                      Предпочтения в еде
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="font-medium mb-2 flex items-center gap-2">
                        <Icon name="Heart" className="text-green-500" size={16} />
                        Любимое
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {member.foodPreferences.favorites.map((food, index) => (
                          <Badge key={index} variant="outline" className="bg-green-50">
                            {food}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="font-medium mb-2 flex items-center gap-2">
                        <Icon name="X" className="text-red-500" size={16} />
                        Не любит
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {member.foodPreferences.dislikes.map((food, index) => (
                          <Badge key={index} variant="outline" className="bg-red-50">
                            {food}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="Trophy" />
                    Достижения
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {(member.achievements || []).map((achievement, index) => (
                      <Badge key={index} className="bg-gradient-to-r from-yellow-400 to-orange-400">
                        <Icon name="Award" className="mr-1" size={14} />
                        {achievement}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
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

          <TabsContent value="responsibilities">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="ListTodo" />
                  Обязанности в семье
                </CardTitle>
              </CardHeader>
              <CardContent>
                {member.responsibilities && member.responsibilities.length > 0 ? (
                  <ul className="space-y-2">
                    {member.responsibilities.map((resp, index) => (
                      <li key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                        <Icon name="CheckCircle2" className="text-green-500" size={16} />
                        <span>{resp}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    Пока нет закрепленных обязанностей
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}