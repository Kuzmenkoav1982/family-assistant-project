import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import Icon from '@/components/ui/icon';
import { useNavigate } from 'react-router-dom';
import type {
  FamilyMember,
  Task,
  Tradition,
  FamilyValue,
  BlogPost,
  ImportantDate,
  ChildProfile,
  DevelopmentPlan,
  ChatMessage,
  FamilyAlbum,
  FamilyNeed,
  FamilyTreeMember,
  CalendarEvent,
  ShoppingItem,
  FamilyGoal,
} from '@/types/family.types';
import { FamilyTabsContent } from '@/components/FamilyTabsContent';
import { FamilyMembersGrid } from '@/components/FamilyMembersGrid';
import { GoalsSection } from '@/components/GoalsSection';
import { FamilyCohesionChart } from '@/components/FamilyCohesionChart';
import { TasksWidget } from '@/components/TasksWidget';
import { ShoppingWidget } from '@/components/widgets/ShoppingWidget';
import { VotingWidget } from '@/components/widgets/VotingWidget';
import { NutritionWidget } from '@/components/widgets/NutritionWidget';
import { WeeklyMenuWidget } from '@/components/widgets/WeeklyMenuWidget';
import { CalendarWidget } from '@/components/widgets/CalendarWidget';
import { WidgetSettingsDialog } from '@/components/WidgetSettingsDialog';

interface MainContentGridProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  totalPoints: number;
  avgWorkload: number;
  completionRate: number;
  familyMembers: FamilyMember[];
  setFamilyMembers: (value: FamilyMember[] | ((prev: FamilyMember[]) => FamilyMember[])) => void;
  tasks: Task[];
  setTasks: () => void;
  createTask: any;
  updateTask: any;
  deleteTask: any;
  traditions: Tradition[];
  familyValues: FamilyValue[];
  blogPosts: BlogPost[];
  importantDates: ImportantDate[];
  childrenProfiles: ChildProfile[];
  developmentPlans: DevelopmentPlan[];
  chatMessages: ChatMessage[];
  setChatMessages: (messages: ChatMessage[]) => void;
  familyAlbum: FamilyAlbum[];
  setFamilyAlbum: (album: FamilyAlbum[]) => void;
  familyNeeds: FamilyNeed[];
  setFamilyNeeds: (needs: FamilyNeed[]) => void;
  familyTree: FamilyTreeMember[];
  setFamilyTree: (tree: FamilyTreeMember[]) => void;
  selectedTreeMember: FamilyTreeMember | null;
  setSelectedTreeMember: (member: FamilyTreeMember | null) => void;
  currentUserId: string;
  newMessage: string;
  setNewMessage: (message: string) => void;
  toggleTask: (id: string) => void;
  addPoints: (userId: string, amount: number) => void;
  getWorkloadColor: (workload: number) => string;
  getMemberById: (id: string) => FamilyMember | undefined;
  getAISuggestedMeals: any;
  exportStatsToCSV: () => void;
  updateMember: any;
  deleteMember: any;
  familyGoals: FamilyGoal[];
  calendarEvents: CalendarEvent[];
  calendarFilter: string;
  setCalendarFilter: (filter: string) => void;
  setShowWidgetSettings: (show: boolean) => void;
  isWidgetEnabled: (widgetId: string) => boolean;
}

export function MainContentGrid({
  activeSection,
  setActiveSection,
  totalPoints,
  avgWorkload,
  completionRate,
  familyMembers,
  setFamilyMembers,
  tasks,
  setTasks,
  createTask,
  updateTask,
  deleteTask,
  traditions,
  familyValues,
  blogPosts,
  importantDates,
  childrenProfiles,
  developmentPlans,
  chatMessages,
  setChatMessages,
  familyAlbum,
  setFamilyAlbum,
  familyNeeds,
  setFamilyNeeds,
  familyTree,
  setFamilyTree,
  selectedTreeMember,
  setSelectedTreeMember,
  currentUserId,
  newMessage,
  setNewMessage,
  toggleTask,
  addPoints,
  getWorkloadColor,
  getMemberById,
  getAISuggestedMeals,
  exportStatsToCSV,
  updateMember,
  deleteMember,
  familyGoals,
  calendarEvents,
  calendarFilter,
  setCalendarFilter,
  setShowWidgetSettings,
  isWidgetEnabled,
}: MainContentGridProps) {
  const navigate = useNavigate();
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <Tabs value={activeSection} onValueChange={setActiveSection} className="space-y-6">

          <TabsContent value="cohesion">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 my-[5px]">
                <Card key="stat-points" className="animate-fade-in hover:shadow-lg transition-all border-l-4 border-l-orange-500" style={{ animationDelay: '0.1s' }}>
                  <CardHeader>
                    <div className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Всего баллов</CardTitle>
                      <Icon name="Award" className="text-orange-500" size={20} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-orange-600">{totalPoints}</div>
                  </CardContent>
                </Card>

                <Card key="stat-workload" className="animate-fade-in hover:shadow-lg transition-all border-l-4 border-l-pink-500" style={{ animationDelay: '0.2s' }}>
                  <CardHeader>
                    <div className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Средняя загрузка</CardTitle>
                      <Icon name="TrendingUp" className="text-pink-500" size={20} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-pink-600">{avgWorkload}%</div>
                  </CardContent>
                </Card>

                <Card key="stat-tasks" className="animate-fade-in hover:shadow-lg transition-all border-l-4 border-l-purple-500" style={{ animationDelay: '0.3s' }}>
                  <CardHeader>
                    <div className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Задачи выполнены</CardTitle>
                      <Icon name="CheckCircle2" className="text-purple-500" size={20} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-purple-600">{completionRate}%</div>
                  </CardContent>
                </Card>

                <Card key="stat-members" className="animate-fade-in hover:shadow-lg transition-all border-l-4 border-l-blue-500" style={{ animationDelay: '0.4s' }}>
                  <CardHeader>
                    <div className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Членов семьи</CardTitle>
                      <Icon name="Users" className="text-blue-500" size={20} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-blue-600">{familyMembers.length}</div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <FamilyCohesionChart
                  familyMembers={familyMembers}
                  tasks={tasks}
                  chatMessagesCount={chatMessages.length}
                  albumPhotosCount={familyAlbum.length}
                  lastActivityDays={0}
                  totalFamilies={1250}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="tasks">
            <Card className="border-2 border-blue-200 bg-blue-50/50 mb-4">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                    <Icon name="CheckSquare" size={24} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-2">Как работают задачи?</h3>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <p><strong>Создавайте задачи</strong> для любых дел: уборка, покупки, домашние задания.</p>
                      <p><strong>Назначайте исполнителей</strong> из членов семьи и следите за прогрессом.</p>
                      <p><strong>Зарабатывайте баллы</strong> за выполнение — мотивация для всей семьи!</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="CheckSquare" />
                  Задачи семьи
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {tasks.slice(0, 5).map((task, idx) => (
                    <div key={task.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors animate-fade-in" style={{ animationDelay: `${idx * 0.1}s` }}>
                      <Checkbox
                        checked={task.completed}
                        onCheckedChange={() => toggleTask(task.id)}
                      />
                      <div className="flex-1">
                        <p className={`font-medium ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                          {task.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {getMemberById(task.assignedTo)?.name || 'Не назначено'}
                          </Badge>
                          {task.points && (
                            <Badge className="bg-orange-500 text-white text-xs">
                              <Icon name="Award" size={10} className="mr-1" />
                              {task.points}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <Button className="w-full mt-4" variant="outline" onClick={() => navigate('/tasks')}>
                  Открыть все задачи →
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="family">
            <FamilyMembersGrid 
              members={familyMembers}
              onMemberClick={(member) => navigate(`/member/${member.id}`)}
              tasks={tasks}
              events={calendarEvents}
            />
          </TabsContent>

          <TabsContent value="goals">
            <GoalsSection goals={familyGoals} />
          </TabsContent>

          <TabsContent value="calendar">
            <Card key="calendar-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="Calendar" />
                    Календарь событий
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(calendarEvents || [])
                    .filter(event => {
                      if (calendarFilter === 'all') return true;
                      if (calendarFilter === 'personal') return event.createdBy === currentUserId;
                      if (calendarFilter === 'family') return event.visibility === 'family';
                      return true;
                    })
                    .map((event, index) => (
                      <div key={event.id} className={`p-4 rounded-lg ${event.color} animate-fade-in`} style={{ animationDelay: `${index * 0.1}s` }}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-bold text-lg">{event.title}</h4>
                            <p className="text-sm text-muted-foreground">{event.description}</p>
                            <div className="flex items-center gap-2 mt-2 text-sm">
                              <Badge variant="outline">{event.category}</Badge>
                              <span className="flex items-center gap-1">
                                <Icon name="Clock" size={14} />
                                {event.time}
                              </span>
                              <span className="flex items-center gap-1">
                                <Icon name="Calendar" size={14} />
                                {new Date(event.date).toLocaleDateString('ru-RU')}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
                <Button className="w-full mt-4" variant="outline" onClick={() => navigate('/calendar')}>
                  Открыть полный календарь →
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <FamilyTabsContent
            familyMembers={familyMembers}
            setFamilyMembers={setFamilyMembers}
            tasks={tasks}
            setTasks={setTasks}
            createTask={createTask}
            updateTask={updateTask}
            deleteTask={deleteTask}
            traditions={traditions}
            familyValues={familyValues}
            blogPosts={blogPosts}
            importantDates={importantDates}
            childrenProfiles={childrenProfiles}
            developmentPlans={developmentPlans}
            chatMessages={chatMessages}
            setChatMessages={setChatMessages}
            familyAlbum={familyAlbum}
            setFamilyAlbum={setFamilyAlbum}
            familyNeeds={familyNeeds}
            setFamilyNeeds={setFamilyNeeds}
            familyTree={familyTree}
            setFamilyTree={setFamilyTree}
            selectedTreeMember={selectedTreeMember}
            setSelectedTreeMember={setSelectedTreeMember}
            selectedUserId={currentUserId}
            newMessage={newMessage}
            setNewMessage={setNewMessage}
            toggleTask={toggleTask}
            addPoints={addPoints}
            getWorkloadColor={getWorkloadColor}
            getMemberById={getMemberById}
            getAISuggestedMeals={getAISuggestedMeals}
            exportStatsToCSV={exportStatsToCSV}
            updateMember={updateMember}
            deleteMember={deleteMember}
          />
        </Tabs>
      </div>

      <div className="space-y-6">
        <div className="flex justify-end">
          <Button
            onClick={() => setShowWidgetSettings(true)}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <Icon name="Settings" size={16} />
            Настроить виджеты
          </Button>
        </div>
        
        {isWidgetEnabled('calendar') && (
          <CalendarWidget calendarEvents={calendarEvents} />
        )}

        {isWidgetEnabled('tasks') && (
          <div className="animate-fade-in" style={{ animationDelay: '0.65s' }}>
            <TasksWidget />
          </div>
        )}

        {isWidgetEnabled('shopping') && (
          <div className="animate-fade-in" style={{ animationDelay: '0.8s' }}>
            <ShoppingWidget />
          </div>
        )}

        {isWidgetEnabled('voting') && (
          <div className="animate-fade-in" style={{ animationDelay: '0.95s' }}>
            <VotingWidget />
          </div>
        )}

        {isWidgetEnabled('nutrition') && (
          <div className="animate-fade-in" style={{ animationDelay: '1.1s' }}>
            <NutritionWidget />
          </div>
        )}

        {isWidgetEnabled('weekly-menu') && (
          <div className="animate-fade-in" style={{ animationDelay: '1.25s' }}>
            <WeeklyMenuWidget />
          </div>
        )}

      </div>
    </div>
  );
}