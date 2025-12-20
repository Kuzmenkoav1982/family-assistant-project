import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { ChildDreamsManager } from '@/components/ChildDreamsManager';
import { PiggyBankManager } from '@/components/PiggyBankManager';
import { MemberProfileEdit } from '@/components/MemberProfileEdit';
import { MemberCalendar } from '@/components/MemberCalendar';
import { VotingWidget } from '@/components/VotingWidget';
import { PermissionsManager } from '@/components/PermissionsManager';
import { MemberProfileQuestionnaire } from '@/components/MemberProfileQuestionnaire';
import type { Dream, FamilyMember, MemberProfile as MemberProfileType, Task } from '@/types/family.types';

interface MemberProfileContentProps {
  member: FamilyMember;
  isChild: boolean;
  isOwner: boolean;
  memberTasks: Task[];
  memberProfile: MemberProfileType | null;
  toggleTask: (taskId: string) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  handleAddDream: (dream: Omit<Dream, 'id' | 'createdAt'>) => Promise<void>;
  handleUpdateDream: (dreamId: string, updates: Partial<Dream>) => Promise<void>;
  handleUpdateBalance: (newBalance: number) => Promise<void>;
  saveProfile: (memberId: string, profile: MemberProfileType) => Promise<void>;
}

export function MemberProfileContent({
  member,
  isChild,
  isOwner,
  memberTasks,
  memberProfile,
  toggleTask,
  deleteTask,
  handleAddDream,
  handleUpdateDream,
  handleUpdateBalance,
  saveProfile
}: MemberProfileContentProps) {
  return (
    <Card className="border-2 shadow-xl bg-white/80 backdrop-blur">
      <CardHeader className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              {member.avatarType === 'photo' && member.photoUrl ? (
                <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-lg">
                  <img 
                    src={member.photoUrl} 
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-4xl border-4 border-white shadow-lg">
                  {member.avatar}
                </div>
              )}
              <Badge className="absolute -bottom-1 -right-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-white border-2 border-white">
                Ур. {member.level}
              </Badge>
            </div>
            <div>
              <CardTitle className="text-3xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {member.name}
              </CardTitle>
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
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Icon name="CheckCircle2" className="text-blue-600" size={20} />
              <span className="text-sm font-medium text-blue-900">Выполнено задач</span>
            </div>
            <p className="text-2xl font-bold text-blue-600">{member.tasksCompleted}</p>
          </div>

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
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
            <TabsTrigger value="overview">Общее</TabsTrigger>
            <TabsTrigger value="dreams">Мечты</TabsTrigger>
            <TabsTrigger value="piggybank">Копилка</TabsTrigger>
            <TabsTrigger value="calendar">Календарь</TabsTrigger>
            <TabsTrigger value="edit">Редактировать</TabsTrigger>
            <TabsTrigger value="questionnaire">Анкета</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-6">
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Icon name="ListTodo" className="text-blue-600" />
                Активные задачи
              </h3>
              {memberTasks.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">Нет активных задач</p>
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
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => deleteTask(task.id)}
                          >
                            <Icon name="Trash2" size={16} className="text-red-500" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {member.achievements && member.achievements.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Icon name="Award" className="text-purple-600" />
                  Достижения
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {member.achievements.map((achievement, index) => (
                    <Card key={index} className="bg-gradient-to-br from-yellow-50 to-orange-50">
                      <CardContent className="p-4 text-center">
                        <div className="text-3xl mb-2">🏆</div>
                        <p className="font-medium text-sm">{achievement}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

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
              isChild={isChild}
            />
          </TabsContent>

          <TabsContent value="piggybank" className="mt-6">
            <PiggyBankManager
              currentBalance={member.piggyBank || 0}
              onUpdateBalance={handleUpdateBalance}
              dreams={member.dreams || []}
            />
          </TabsContent>

          <TabsContent value="calendar" className="mt-6">
            <MemberCalendar memberId={member.id} />
          </TabsContent>

          <TabsContent value="edit" className="mt-6">
            <MemberProfileEdit member={member} />
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
    </Card>
  );
}