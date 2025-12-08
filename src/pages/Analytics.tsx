import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import Icon from '@/components/ui/icon';
import { useNavigate } from 'react-router-dom';
import { useFamilyDataQuery } from '@/hooks/useFamilyDataQuery';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AnalyticsSkeleton } from '@/components/skeletons/AnalyticsSkeleton';
import { VirtualizedList } from '@/components/VirtualizedList';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function Analytics() {
  const navigate = useNavigate();
  const { data: familyData, isLoading, error } = useFamilyDataQuery();
  const [isInstructionOpen, setIsInstructionOpen] = useState(false);

  // Extract data before any conditional returns
  const members = familyData?.members || [];
  const tasks = familyData?.tasks || [];
  const children = familyData?.children_profiles || [];
  const calendarEvents = familyData?.calendar_events || [];
  const traditions = familyData?.traditions || [];
  const blogPosts = familyData?.blog_posts || [];

  const taskStats = useMemo(() => {
    const completedTasks = tasks.filter((t: any) => t.completed).length;
    const totalTasks = tasks.length;
    const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    return { completedTasks, totalTasks, taskCompletionRate };
  }, [tasks]);

  const { completedTasks, totalTasks, taskCompletionRate } = taskStats;

  const activeMembers = useMemo(() => 
    members.filter((m: any) => m.role !== 'inactive').length
  , [members]);
  
  const childrenCount = children.length;

  const tasksByMember = useMemo(() => 
    members.map((member: any) => ({
      name: member.name,
      completed: tasks.filter((t: any) => t.assignee_id === member.id && t.completed).length,
      pending: tasks.filter((t: any) => t.assignee_id === member.id && !t.completed).length,
    }))
  , [members, tasks]);

  const memberActivity = useMemo(() => 
    members.map((member: any) => {
      const memberTasks = tasks.filter((t: any) => t.assignee_id === member.id);
      const memberEvents = calendarEvents.filter((e: any) => e.participants?.includes(member.id));
      return {
        name: member.name,
        tasks: memberTasks.length,
        events: memberEvents.length,
        total: memberTasks.length + memberEvents.length,
      };
    }).sort((a, b) => b.total - a.total)
  , [members, tasks, calendarEvents]);

  const monthlyActivity = useMemo(() => {
    const now = new Date();
    const months = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
    const last6Months = [];
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthIndex = date.getMonth();
      const year = date.getFullYear();
      
      const monthTasks = tasks.filter((t: any) => {
        const taskDate = new Date(t.created_at || t.due_date || Date.now());
        return taskDate.getMonth() === monthIndex && taskDate.getFullYear() === year;
      }).length;
      
      const monthEvents = calendarEvents.filter((e: any) => {
        const eventDate = new Date(e.date);
        return eventDate.getMonth() === monthIndex && eventDate.getFullYear() === year;
      }).length;
      
      last6Months.push({
        month: months[monthIndex],
        tasks: monthTasks,
        events: monthEvents,
      });
    }
    
    return last6Months;
  }, [tasks, calendarEvents]);

  const familyRoles = useMemo(() => 
    [
      { name: 'Родители', value: members.filter((m: any) => m.role === 'Родитель').length },
      { name: 'Дети', value: members.filter((m: any) => m.role === 'Ребёнок').length },
      { name: 'Другие', value: members.filter((m: any) => !['Родитель', 'Ребёнок'].includes(m.role)).length },
    ].filter(item => item.value > 0)
  , [members]);

  const upcomingEvents = useMemo(() => 
    calendarEvents
      .filter((e: any) => new Date(e.date) >= new Date())
      .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 5)
  , [calendarEvents]);

  // Now check loading after all hooks
  if (isLoading) {
    return <AnalyticsSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              📊 Аналитика семьи
            </h1>
            <p className="text-gray-600 mt-2">Отслеживайте активность и развитие вашей семьи</p>
          </div>
          <Button onClick={() => navigate('/')} variant="outline" className="gap-2">
            <Icon name="ArrowLeft" size={18} />
            На главную
          </Button>
        </div>

        {/* Инструкция */}
        <Collapsible open={isInstructionOpen} onOpenChange={setIsInstructionOpen}>
          <Alert className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <div className="flex items-start gap-3">
              <Icon name="Info" className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <CollapsibleTrigger className="flex items-center justify-between w-full text-left group">
                  <h3 className="font-semibold text-blue-900 text-lg">
                    Как работает раздел Аналитика
                  </h3>
                  <Icon 
                    name={isInstructionOpen ? "ChevronUp" : "ChevronDown"} 
                    className="h-5 w-5 text-blue-600 transition-transform group-hover:scale-110" 
                  />
                </CollapsibleTrigger>
                
                <CollapsibleContent className="mt-3 space-y-3">
                  <AlertDescription className="text-blue-800">
                    <div className="space-y-4">
                      <div>
                        <p className="font-medium mb-2">📊 Для чего нужна аналитика?</p>
                        <p className="text-sm">
                          Раздел аналитики помогает отслеживать активность семьи, видеть общую картину выполнения задач, 
                          участия в событиях и развития детей. Все данные обновляются автоматически.
                        </p>
                      </div>

                      <div>
                        <p className="font-medium mb-2">📈 Что можно отслеживать?</p>
                        <ul className="text-sm space-y-1 list-disc list-inside">
                          <li><strong>Активность членов семьи:</strong> Кто сколько выполнил задач и посетил событий</li>
                          <li><strong>Выполнение задач:</strong> Процент завершённых задач и динамика</li>
                          <li><strong>События:</strong> Предстоящие и прошедшие семейные мероприятия</li>
                          <li><strong>Статистика по месяцам:</strong> Тренды активности вашей семьи</li>
                        </ul>
                      </div>

                      <div>
                        <p className="font-medium mb-2">🎯 Как использовать аналитику?</p>
                        <ul className="text-sm space-y-1 list-disc list-inside">
                          <li>Следите за балансом нагрузки между членами семьи</li>
                          <li>Планируйте задачи на основе статистики выполнения</li>
                          <li>Отмечайте самых активных участников семейной жизни</li>
                          <li>Анализируйте, кому нужна помощь с задачами</li>
                        </ul>
                      </div>

                      <div className="pt-2 border-t border-blue-200">
                        <p className="text-sm italic">
                          💡 <strong>Совет:</strong> Регулярно просматривайте аналитику, чтобы справедливо 
                          распределять задачи и обязанности между всеми членами семьи.
                        </p>
                      </div>
                    </div>
                  </AlertDescription>
                </CollapsibleContent>
              </div>
            </div>
          </Alert>
        </Collapsible>

        <div className="grid md:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Членов семьи</p>
                  <p className="text-4xl font-bold mt-2">{activeMembers}</p>
                </div>
                <Icon name="Users" size={48} className="opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Детей</p>
                  <p className="text-4xl font-bold mt-2">{childrenCount}</p>
                </div>
                <Icon name="Baby" size={48} className="opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Задач выполнено</p>
                  <p className="text-4xl font-bold mt-2">{taskCompletionRate}%</p>
                </div>
                <Icon name="CheckCircle2" size={48} className="opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm">Событий</p>
                  <p className="text-4xl font-bold mt-2">{calendarEvents.length}</p>
                </div>
                <Icon name="Calendar" size={48} className="opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Обзор</TabsTrigger>
            <TabsTrigger value="tasks">Задачи</TabsTrigger>
            <TabsTrigger value="activity">Активность</TabsTrigger>
            <TabsTrigger value="events">События</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="TrendingUp" size={24} className="text-blue-600" />
                    Активность по месяцам
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={monthlyActivity}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="tasks" stroke="#3b82f6" name="Задачи" strokeWidth={2} />
                      <Line type="monotone" dataKey="events" stroke="#10b981" name="События" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="PieChart" size={24} className="text-purple-600" />
                    Состав семьи
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={familyRoles}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) => `${entry.name}: ${entry.value}`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {familyRoles.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Activity" size={24} className="text-green-600" />
                  Активность членов семьи
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={memberActivity}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="tasks" fill="#3b82f6" name="Задачи" />
                    <Bar dataKey="events" fill="#10b981" name="События" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tasks" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="ListChecks" size={24} className="text-blue-600" />
                  Статистика задач
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6 mb-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-3xl font-bold text-blue-600">{totalTasks}</p>
                    <p className="text-sm text-gray-600 mt-1">Всего задач</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-3xl font-bold text-green-600">{completedTasks}</p>
                    <p className="text-sm text-gray-600 mt-1">Выполнено</p>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <p className="text-3xl font-bold text-orange-600">{totalTasks - completedTasks}</p>
                    <p className="text-sm text-gray-600 mt-1">В процессе</p>
                  </div>
                </div>

                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={tasksByMember}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="completed" fill="#10b981" name="Выполнено" stackId="a" />
                    <Bar dataKey="pending" fill="#f59e0b" name="В работе" stackId="a" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="Trophy" size={24} className="text-yellow-600" />
                    Самые активные
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {memberActivity.slice(0, 5).map((member, index) => (
                      <div key={member.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-orange-500'
                          } text-white font-bold`}>
                            {index + 1}
                          </div>
                          <span className="font-medium">{member.name}</span>
                        </div>
                        <Badge variant="secondary">{member.total} активностей</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="BookOpen" size={24} className="text-blue-600" />
                    Записи в блоге
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-4">
                    <p className="text-4xl font-bold text-blue-600">{blogPosts.length}</p>
                    <p className="text-sm text-gray-600 mt-1">Всего записей</p>
                  </div>
                  <div className="space-y-2">
                    {blogPosts.slice(0, 3).map((post: any) => (
                      <div key={post.id} className="p-3 bg-blue-50 rounded-lg">
                        <p className="font-medium text-sm">{post.title}</p>
                        <p className="text-xs text-gray-600 mt-1">{post.date}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="events" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="CalendarDays" size={24} className="text-purple-600" />
                  Ближайшие события
                </CardTitle>
              </CardHeader>
              <CardContent>
                {upcomingEvents.length > 0 ? (
                  upcomingEvents.length > 20 ? (
                    <VirtualizedList
                      items={upcomingEvents}
                      estimateSize={120}
                      renderItem={(event: any) => (
                        <div className="flex items-start gap-4 p-4 bg-purple-50 rounded-lg border border-purple-100 mb-4 mx-2">
                          <div className="w-12 h-12 bg-purple-600 text-white rounded-lg flex flex-col items-center justify-center">
                            <span className="text-xs">{new Date(event.date).toLocaleDateString('ru', { month: 'short' })}</span>
                            <span className="text-lg font-bold">{new Date(event.date).getDate()}</span>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">{event.title}</h4>
                            <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                            <Badge variant="secondary" className="mt-2">{event.type}</Badge>
                          </div>
                        </div>
                      )}
                    />
                  ) : (
                    <div className="space-y-4">
                      {upcomingEvents.map((event: any) => (
                        <div key={event.id} className="flex items-start gap-4 p-4 bg-purple-50 rounded-lg border border-purple-100">
                          <div className="w-12 h-12 bg-purple-600 text-white rounded-lg flex flex-col items-center justify-center">
                            <span className="text-xs">{new Date(event.date).toLocaleDateString('ru', { month: 'short' })}</span>
                            <span className="text-lg font-bold">{new Date(event.date).getDate()}</span>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">{event.title}</h4>
                            <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                            <Badge variant="secondary" className="mt-2">{event.type}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <Icon name="Calendar" size={48} className="mx-auto mb-4 opacity-20" />
                    <p>Нет запланированных событий</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Sparkles" size={24} className="text-pink-600" />
                  Семейные традиции
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {traditions.slice(0, 4).map((tradition: any) => (
                    <div key={tradition.id} className="p-4 bg-pink-50 rounded-lg border border-pink-100">
                      <div className="text-2xl mb-2">{tradition.icon}</div>
                      <h4 className="font-semibold text-gray-900">{tradition.name}</h4>
                      <p className="text-sm text-gray-600 mt-2">{tradition.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}