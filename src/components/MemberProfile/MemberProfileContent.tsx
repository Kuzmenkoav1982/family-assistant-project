import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { ChildDreamsManager } from '@/components/ChildDreamsManager';
import { PiggyBankManager } from '@/components/PiggyBankManager';
import { MemberProfileEdit } from '@/components/MemberProfileEdit';
import { VotingWidget } from '@/components/VotingWidget';
import { PermissionsManager } from '@/components/PermissionsManager';
import { MemberProfileQuestionnaire } from '@/components/MemberProfileQuestionnaire';
import { usePermissions } from '@/hooks/usePermissions';
import { CreateTaskDialog } from '@/components/CreateTaskDialog';
import { calculateMemberWorkload } from '@/utils/memberWorkload';
import MemberMemorySection from '@/components/memory/MemberMemorySection';
import type { Dream, FamilyMember, MemberProfile as MemberProfileType, Task, CalendarEvent } from '@/types/family.types';
import type { LifeEvent } from '@/components/life-road/types';

interface MemberProfileContentProps {
  member: FamilyMember;
  isChild: boolean;
  isOwner: boolean;
  memberTasks: Task[];
  memberEvents: CalendarEvent[];
  memberLifeEvents?: LifeEvent[];
  memberProfile: MemberProfileType | null;
  toggleTask: (taskId: string) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  handleAddDream: (dream: Omit<Dream, 'id' | 'createdAt'>) => Promise<void>;
  handleUpdateDream: (dreamId: string, updates: Partial<Dream>) => Promise<void>;
  handleDeleteDream: (dreamId: string) => Promise<void>;
  handleUpdateBalance: (newBalance: number) => Promise<void>;
  saveProfile: (memberId: string, profile: MemberProfileType) => Promise<void>;
  updateMember: (updates: Partial<FamilyMember> & { id: string }) => Promise<void>;
}

export function MemberProfileContent({
  member,
  isChild,
  isOwner,
  memberTasks,
  memberEvents,
  memberLifeEvents = [],
  memberProfile,
  toggleTask,
  deleteTask,
  handleAddDream,
  handleUpdateDream,
  handleDeleteDream,
  handleUpdateBalance,
  saveProfile,
  updateMember
}: MemberProfileContentProps) {
  const navigate = useNavigate();
  const { canDo, loading: permissionsLoading, role } = usePermissions();
  const [activeTab, setActiveTab] = useState('overview');
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);

  // Числовой ID в family_tree — берём из поля tree_node_id, без поиска по имени
  const treeId = member.tree_node_id ?? null;

  console.log('[MemberProfile] Permissions state:', { 
    loading: permissionsLoading, 
    role, 
    canDeleteTasks: canDo('tasks', 'delete') 
  });

  // Динамический подсчёт выполненных задач сегодня и событий
  const metrics = calculateMemberWorkload(member, memberTasks, memberEvents);
  const completedTasksToday = metrics.completedToday;

  const handleCalendarClick = () => {
    navigate(`/calendar?member=${member.id}`);
  };

  return (
    <Card className="border-2 shadow-xl bg-white/80 backdrop-blur">
      <CardHeader className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              {member.photoUrl ? (
                <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-lg">
                  <img 
                    src={member.photoUrl} 
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-4xl border-4 border-white shadow-lg">
                  {member.avatarType === 'emoji' && member.avatar && !member.avatar.startsWith('http') ? member.avatar : '👤'}
                </div>
              )}
              <Badge className="absolute -bottom-1 -right-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-white border-2 border-white">
                Ур. {member.level}
              </Badge>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-3xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {member.name}
                </CardTitle>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 px-2 text-xs border-purple-200 text-purple-600 hover:bg-purple-50"
                  onClick={() => setActiveTab('edit')}
                >
                  <Icon name="Pencil" size={12} className="mr-1" />
                  Изменить
                </Button>
              </div>
              <div className="flex gap-2 mt-2">
                <Badge variant="secondary">{member.role}</Badge>
                {member.age && <Badge variant="outline">{member.age} лет</Badge>}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 text-2xl font-bold text-purple-600">
              <Icon name="Star" className="text-yellow-500" fill="currentColor" />
              {member.points}
            </div>
            <p className="text-sm text-muted-foreground">баллов</p>
          </div>
        </div>

        <div className={`grid grid-cols-1 gap-4 ${isChild ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>
          <button
            onClick={() => setActiveTab('overview')}
            className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg hover:from-blue-100 hover:to-blue-200 transition-all cursor-pointer text-left"
          >
            <div className="flex items-center gap-2 mb-2">
              <Icon name="CheckSquare" className="text-green-600" size={20} />
              <span className="text-sm font-medium text-blue-900">Готово</span>
            </div>
            <p className="text-2xl font-bold text-green-600">{completedTasksToday}</p>
          </button>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Icon name="Award" className="text-purple-600" size={20} />
              <span className="text-sm font-medium text-purple-900">Достижения</span>
            </div>
            <p className="text-2xl font-bold text-purple-600">{member.achievements?.length || 0}</p>
          </div>

          {isChild && (
            <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Icon name="Smile" className="text-pink-600" size={20} />
                <span className="text-sm font-medium text-pink-900">Настроение</span>
              </div>
              <p className="text-lg font-semibold text-pink-600">{member.mood || 'Отлично'}</p>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="flex flex-col h-auto gap-1 w-full bg-gray-100 p-1 rounded-xl">
            <div className="flex w-full gap-1">
              <TabsTrigger value="overview" className="flex-1 rounded-lg">Общее</TabsTrigger>
              <TabsTrigger value="dreams" className="flex-1 rounded-lg">Мечты</TabsTrigger>
              <TabsTrigger value="piggybank" className="flex-1 rounded-lg">Копилка</TabsTrigger>
            </div>
            <div className="flex w-full gap-1">
              <TabsTrigger value="edit" className="flex-1 rounded-lg text-xs px-1">Редактировать</TabsTrigger>
              <TabsTrigger value="questionnaire" className="flex-1 rounded-lg text-xs px-1">Анкета</TabsTrigger>
              <button
                onClick={handleCalendarClick}
                className="flex-1 rounded-lg flex items-center justify-center gap-1 px-1 py-1.5 text-xs font-medium text-gray-600 hover:bg-white hover:text-gray-900 transition-colors"
              >
                <Icon name="Calendar" size={14} />
                Календарь
              </button>
            </div>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-6">
            {/* Фото и воспоминания из Альбома поколений */}
            {treeId !== null && (
              <MemberMemorySection memberId={treeId} memberName={member.name} previewLimit={4} />
            )}

            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Icon name="ListTodo" className="text-blue-600" />
                  Активные задачи
                </h3>
                <Button
                  onClick={() => setIsCreateTaskOpen(true)}
                  size="sm"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <Icon name="Plus" className="mr-2" size={16} />
                  Добавить задачу
                </Button>
              </div>
              {memberTasks.length === 0 ? (
                <div className="text-center py-8 space-y-3">
                  <p className="text-muted-foreground">Нет активных задач</p>
                  <Button
                    onClick={() => setIsCreateTaskOpen(true)}
                    variant="outline"
                    size="sm"
                  >
                    <Icon name="Plus" className="mr-2" size={16} />
                    Создать первую задачу
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {memberTasks.map(task => (
                    <Card key={task.id} className={task.completed ? 'opacity-60' : ''}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <input
                                type="checkbox"
                                checked={task.completed}
                                onChange={() => toggleTask(task.id)}
                                className="w-5 h-5 rounded border-gray-300"
                              />
                              <h4 className={`font-medium ${task.completed ? 'line-through' : ''}`}>
                                {task.title}
                              </h4>
                            </div>
                            {task.description && (
                              <p className="text-sm text-muted-foreground ml-7">{task.description}</p>
                            )}
                            <div className="flex gap-2 mt-2 ml-7">
                              {task.points && (
                                <Badge variant="secondary" className="text-xs">
                                  <Icon name="Star" size={12} className="mr-1" />
                                  {task.points}
                                </Badge>
                              )}
                              {task.priority && (
                                <Badge 
                                  variant={task.priority === 'high' ? 'destructive' : 'outline'}
                                  className="text-xs"
                                >
                                  {task.priority === 'high' ? 'Высокий' : task.priority === 'medium' ? 'Средний' : 'Низкий'}
                                </Badge>
                              )}
                            </div>
                          </div>
                          {!permissionsLoading && canDo('tasks', 'delete') && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={async () => {
                                if (confirm('Удалить эту задачу?')) {
                                  await deleteTask(task.id);
                                }
                              }}
                            >
                              <Icon name="Trash2" size={16} className="text-red-500" />
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* LifeEvents — события жизненного пути */}
            {memberLifeEvents.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                  <Icon name="BookHeart" className="text-pink-500" />
                  Важные события жизни
                </h3>
                <div className="space-y-3">
                  {memberLifeEvents.map(event => {
                    const categoryColors: Record<string, string> = {
                      birth: 'bg-pink-100 text-pink-700',
                      wedding: 'bg-red-100 text-red-700',
                      education: 'bg-blue-100 text-blue-700',
                      career: 'bg-green-100 text-green-700',
                      achievement: 'bg-yellow-100 text-yellow-700',
                      travel: 'bg-cyan-100 text-cyan-700',
                      family: 'bg-purple-100 text-purple-700',
                      health: 'bg-orange-100 text-orange-700',
                      other: 'bg-gray-100 text-gray-700',
                    };
                    const categoryLabels: Record<string, string> = {
                      birth: 'Рождение', wedding: 'Свадьба', education: 'Образование',
                      career: 'Карьера', achievement: 'Достижение', travel: 'Путешествие',
                      family: 'Семья', health: 'Здоровье', other: 'Прочее',
                    };
                    return (
                      <Card key={event.id} className="hover:shadow-md transition-shadow border-l-4 border-l-pink-400">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold">{event.title}</h4>
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${categoryColors[event.category] || categoryColors.other}`}>
                                  {categoryLabels[event.category] || event.category}
                                </span>
                              </div>
                              {event.description && (
                                <p className="text-sm text-gray-600 mb-1">{event.description}</p>
                              )}
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <Icon name="Calendar" size={12} />
                                {new Date(event.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Календарные события */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Icon name="Calendar" className="text-purple-600" />
                  События
                </h3>
              </div>
              {memberEvents.length === 0 ? (
                <div className="text-center py-8 space-y-3 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                  <Icon name="Calendar" size={40} className="mx-auto text-gray-300" />
                  <p className="text-muted-foreground">Нет предстоящих событий</p>
                  <Button
                    onClick={handleCalendarClick}
                    variant="outline"
                    size="sm"
                  >
                    <Icon name="Plus" className="mr-2" size={16} />
                    Создать событие в календаре
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {memberEvents.map(event => (
                    <Card key={event.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <div 
                                className="w-3 h-3 rounded-full flex-shrink-0" 
                                style={{ backgroundColor: event.color }}
                              />
                              <h4 className="font-semibold">{event.title}</h4>
                            </div>
                            {event.description && (
                              <p className="text-sm text-gray-600 mb-2">{event.description}</p>
                            )}
                            <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                              <div className="flex items-center gap-1">
                                <Icon name="Calendar" size={12} />
                                {new Date(event.date).toLocaleDateString('ru-RU', { 
                                  day: 'numeric', 
                                  month: 'long' 
                                })}
                              </div>
                              {event.time && (
                                <div className="flex items-center gap-1">
                                  <Icon name="Clock" size={12} />
                                  {event.time}
                                </div>
                              )}
                              <Badge variant="outline" className="text-xs">
                                {event.category === 'personal' && 'Личное'}
                                {event.category === 'family' && 'Семейное'}
                                {event.category === 'work' && 'Работа'}
                                {event.category === 'health' && 'Здоровье'}
                                {event.category === 'education' && 'Образование'}
                                {event.category === 'leisure' && 'Досуг'}
                              </Badge>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleCalendarClick}
                          >
                            <Icon name="ExternalLink" size={16} className="text-purple-500" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {isOwner && (
              <>
                <VotingWidget memberId={member.id} />
                <PermissionsManager memberId={member.id} />
              </>
            )}
          </TabsContent>

          <TabsContent value="dreams" className="mt-6">
            <ChildDreamsManager
              dreams={member.dreams || []}
              onAddDream={handleAddDream}
              onUpdateDream={handleUpdateDream}
              onDeleteDream={handleDeleteDream}
            />
          </TabsContent>

          <TabsContent value="piggybank" className="mt-6">
            <PiggyBankManager
              balance={member.piggyBank || 0}
              onUpdateBalance={handleUpdateBalance}
            />
          </TabsContent>

          <TabsContent value="edit" className="mt-6">
            <MemberProfileEdit 
              member={member}
              onSave={async (updates) => {
                await updateMember({ ...updates, id: member.id });
              }}
            />
          </TabsContent>

          <TabsContent value="questionnaire" className="mt-6">
            <MemberProfileQuestionnaire
              member={member}
              memberProfile={memberProfile}
              onSave={(profile) => saveProfile(member.id, profile)}
            />
          </TabsContent>
        </Tabs>
      </CardContent>

      <CreateTaskDialog 
        open={isCreateTaskOpen} 
        onOpenChange={setIsCreateTaskOpen}
        preselectedMemberId={member.id}
      />
    </Card>
  );
}