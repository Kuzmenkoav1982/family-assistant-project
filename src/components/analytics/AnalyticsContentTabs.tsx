import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { VirtualizedList } from '@/components/VirtualizedList';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

interface MonthlyActivity {
  month: string;
  tasks: number;
  events: number;
}

interface FamilyRole {
  name: string;
  value: number;
}

interface MemberActivity {
  name: string;
  tasks: number;
  events: number;
  total: number;
}

interface TasksByMember {
  name: string;
  completed: number;
  pending: number;
}

interface AnalyticsContentTabsProps {
  monthlyActivity: MonthlyActivity[];
  familyRoles: FamilyRole[];
  memberActivity: MemberActivity[];
  tasksByMember: TasksByMember[];
  totalTasks: number;
  completedTasks: number;
  upcomingEvents: any[];
  blogPosts: any[];
}

export function AnalyticsContentTabs({
  monthlyActivity,
  familyRoles,
  memberActivity,
  tasksByMember,
  totalTasks,
  completedTasks,
  upcomingEvents,
  blogPosts
}: AnalyticsContentTabsProps) {
  return (
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
              {monthlyActivity.every(m => m.tasks === 0 && m.events === 0) ? (
                <div className="flex flex-col items-center justify-center h-[300px] text-gray-400">
                  <Icon name="BarChart3" size={64} className="mb-4 opacity-20" />
                  <p className="text-center">Данные появятся, когда вы создадите больше задач и событий</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyActivity}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis allowDecimals={false} domain={[0, 'auto']} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="tasks" stroke="#3b82f6" name="Задачи" strokeWidth={2} />
                    <Line type="monotone" dataKey="events" stroke="#10b981" name="События" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              )}
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
              <div className="flex flex-col items-center justify-center h-[300px] text-gray-400">
                <Icon name="CalendarOff" size={64} className="mb-4 opacity-20" />
                <p className="text-center">Нет запланированных событий</p>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
