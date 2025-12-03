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
import { MemberCalendar } from '@/components/MemberCalendar';
import { VotingWidget } from '@/components/VotingWidget';
import { PermissionsManager } from '@/components/PermissionsManager';
import { MemberProfileQuestionnaire } from '@/components/MemberProfileQuestionnaire';
import type { Dream, FamilyMember, MemberProfile } from '@/types/family.types';
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
  const isOwner = member.role === 'Папа' || member.role.toLowerCase().includes('владел');

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

        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              {member.avatarType === 'photo' && member.photoUrl ? (
                <img 
                  src={member.photoUrl} 
                  alt={member.name}
                  className="w-32 h-32 rounded-full object-cover border-4 border-purple-300"
                />
              ) : (
                <div className="text-8xl">{member.avatar}</div>
              )}
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl font-bold mb-2">{member.name}</h1>
                <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-4">
                  <Badge variant="outline" className="text-sm">
                    <Icon name="User" size={14} className="mr-1" />
                    {member.role}
                  </Badge>
                  {member.age && (
                    <Badge variant="outline" className="text-sm">
                      <Icon name="Calendar" size={14} className="mr-1" />
                      {member.age} лет
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-sm bg-orange-50">
                    <Icon name="Star" size={14} className="mr-1" />
                    {member.points} баллов
                  </Badge>
                  <Badge variant="outline" className="text-sm bg-purple-50">
                    <Icon name="Award" size={14} className="mr-1" />
                    Уровень {member.level}
                  </Badge>
                </div>
                {member.moodStatus && (
                  <div className="flex items-center gap-2 justify-center md:justify-start">
                    <span className="text-2xl">{member.moodStatus.emoji}</span>
                    <div>
                      <p className="text-sm font-medium">{member.moodStatus.label}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(member.moodStatus.timestamp).toLocaleString('ru-RU')}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {isOwner && (
          <Card className="mb-6 bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <Button 
                onClick={() => navigate('/permissions')}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                <Icon name="Shield" size={18} className="mr-2" />
                Управление правами всех членов семьи
              </Button>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="info" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
            <TabsTrigger value="info" className="flex items-center justify-center gap-1 md:gap-2">
              <Icon name="User" size={16} />
              <span>Профиль</span>
            </TabsTrigger>
            <TabsTrigger value="questionnaire" className="flex items-center justify-center gap-1 md:gap-2">
              <Icon name="FileText" size={16} />
              <span>Анкета</span>
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center justify-center gap-1 md:gap-2">
              <Icon name="BarChart3" size={16} />
              <span>Статистика</span>
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center justify-center gap-1 md:gap-2">
              <Icon name="Calendar" size={16} />
              <span>Календарь</span>
            </TabsTrigger>
            <TabsTrigger value="tasks" className="flex items-center justify-center gap-1 md:gap-2">
              <Icon name="CheckSquare" size={16} />
              <span>Задачи</span>
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

          <TabsContent value="questionnaire">
            <MemberProfileQuestionnaire
              member={member}
              onSave={async (profile: MemberProfile) => {
                await updateMember({ id: member.id, profile });
              }}
            />
          </TabsContent>

          <TabsContent value="calendar">
            <div className="space-y-6">
              <MemberCalendar memberId={member.id} memberName={member.name} />
              <VotingWidget />
            </div>
          </TabsContent>

          <TabsContent value="stats">
            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="Award" size={20} />
                    Достижения
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {member.achievements && member.achievements.length > 0 ? (
                    <div className="space-y-2">
                      {member.achievements.map((achievement, i) => (
                        <div key={i} className="flex items-center gap-2 p-2 bg-yellow-50 rounded-lg">
                          <Icon name="Trophy" size={16} className="text-yellow-600" />
                          <span className="text-sm">{achievement}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">Пока нет достижений</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="ListTodo" size={20} />
                    Обязанности
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {member.responsibilities && member.responsibilities.length > 0 ? (
                    <div className="space-y-2">
                      {member.responsibilities.map((resp, i) => (
                        <div key={i} className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
                          <Icon name="CheckCircle" size={16} className="text-blue-600" />
                          <span className="text-sm">{resp}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">Обязанности не назначены</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="Heart" size={20} />
                    Любимые блюда
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {member.foodPreferences?.favorites && member.foodPreferences.favorites.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {member.foodPreferences.favorites.map((food, i) => (
                        <Badge key={i} variant="outline" className="bg-green-50">
                          {food}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">Не указано</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="TrendingUp" size={20} />
                    Прогресс
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Загруженность</span>
                      <span className="font-bold">{member.workload}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all"
                        style={{ width: `${member.workload}%` }}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <p className="text-xs text-gray-600">Задач выполнено</p>
                      <p className="text-2xl font-bold text-purple-600">{member.tasksCompleted}</p>
                    </div>
                    <div className="p-3 bg-orange-50 rounded-lg">
                      <p className="text-xs text-gray-600">Всего баллов</p>
                      <p className="text-2xl font-bold text-orange-600">{member.points}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="tasks">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="CheckSquare" size={20} />
                  Мои задачи
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <Icon name="CheckSquare" size={48} className="mx-auto mb-4 opacity-50" />
                  <p>Задачи появятся здесь, когда они будут назначены</p>
                  <Button className="mt-4" onClick={() => navigate('/')}>
                    <Icon name="Plus" size={16} className="mr-2" />
                    Создать задачу
                  </Button>
                </div>
              </CardContent>
            </Card>
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