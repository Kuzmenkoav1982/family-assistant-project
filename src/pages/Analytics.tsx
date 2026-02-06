import { useMemo, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { FamilyMembersContext } from '@/contexts/FamilyMembersContext';
import { useTasks } from '@/hooks/useTasks';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import { AnalyticsSkeleton } from '@/components/skeletons/AnalyticsSkeleton';
import { AnalyticsHeader } from '@/components/analytics/AnalyticsHeader';
import { AnalyticsStatsCards } from '@/components/analytics/AnalyticsStatsCards';
import { AnalyticsContentTabs } from '@/components/analytics/AnalyticsContentTabs';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useDemoMode } from '@/contexts/DemoModeContext';

type Period = 'week' | 'month' | 'quarter' | 'half-year' | 'year';

// Демо-данные для аналитики
const demoAnalyticsData = {
  members: [
    { id: '1', name: 'Алексей', role: 'Родитель', level: 5, points: 320, age: 35 },
    { id: '2', name: 'Анастасия', role: 'Родитель', level: 4, points: 280, age: 33 },
    { id: '3', name: 'Матвей', role: 'Ребёнок', level: 3, points: 150, age: 8 },
    { id: '4', name: 'Илья', role: 'Ребёнок', level: 2, points: 90, age: 5 }
  ],
  tasks: [
    { id: '1', title: 'Купить продукты', assignee_id: '1', completed: true, created_at: new Date().toISOString() },
    { id: '2', title: 'Помыть посуду', assignee_id: '2', completed: true, created_at: new Date().toISOString() },
    { id: '3', title: 'Убрать комнату', assignee_id: '3', completed: false, created_at: new Date().toISOString() },
    { id: '4', title: 'Сделать уроки', assignee_id: '3', completed: true, created_at: new Date(Date.now() - 86400000).toISOString() },
    { id: '5', title: 'Погулять с собакой', assignee_id: '4', completed: false, created_at: new Date().toISOString() },
    { id: '6', title: 'Приготовить ужин', assignee_id: '1', completed: true, created_at: new Date(Date.now() - 172800000).toISOString() },
    { id: '7', title: 'Полить цветы', assignee_id: '2', completed: true, created_at: new Date(Date.now() - 259200000).toISOString() },
    { id: '8', title: 'Вынести мусор', assignee_id: '4', completed: true, created_at: new Date(Date.now() - 345600000).toISOString() }
  ],
  children_profiles: [
    { id: '1', child_member_id: '3', child_name: 'Матвей', age: 8 },
    { id: '2', child_member_id: '4', child_name: 'Илья', age: 5 }
  ],
  calendar_events: [
    { id: '1', title: 'День рождения Матвея', date: new Date(Date.now() + 604800000).toISOString(), participants: ['1', '2', '3', '4'] },
    { id: '2', title: 'Родительское собрание', date: new Date(Date.now() + 259200000).toISOString(), participants: ['1', '2'] },
    { id: '3', title: 'Поход в театр', date: new Date(Date.now() + 1209600000).toISOString(), participants: ['1', '2', '3', '4'] },
    { id: '4', title: 'Врач - педиатр', date: new Date(Date.now() + 86400000).toISOString(), participants: ['2', '4'] },
    { id: '5', title: 'Семейный ужин', date: new Date().toISOString(), participants: ['1', '2', '3', '4'] }
  ],
  blog_posts: [
    { id: '1', title: 'Первый день в школе', content: 'Матвей пошёл в первый класс!', author_name: 'Анастасия', created_at: new Date(Date.now() - 2592000000).toISOString() },
    { id: '2', title: 'Семейный отдых на море', content: 'Провели замечательную неделю в Сочи', author_name: 'Алексей', created_at: new Date(Date.now() - 5184000000).toISOString() },
    { id: '3', title: 'Илья научился читать', content: 'Сегодня Илья прочитал свою первую книгу!', author_name: 'Анастасия', created_at: new Date(Date.now() - 1296000000).toISOString() }
  ],
  traditions: [],
  family_values: []
};

export default function Analytics() {
  const navigate = useNavigate();
  const { isDemoMode } = useDemoMode();
  const familyMembersContext = useContext(FamilyMembersContext);
  const { tasks: tasksData, loading: tasksLoading } = useTasks();
  const { events: calendarEventsData, loading: eventsLoading } = useCalendarEvents();
  const [isInstructionOpen, setIsInstructionOpen] = useState(false);
  const [period, setPeriod] = useState<Period>('month');

  // Extract data - use demo data if in demo mode OR if no auth, otherwise use context/hooks
  const authToken = localStorage.getItem('authToken');
  const shouldUseDemoData = isDemoMode || !authToken;
  
  const members = shouldUseDemoData ? demoAnalyticsData.members : (familyMembersContext?.members || []);
  const tasks = shouldUseDemoData ? demoAnalyticsData.tasks : (tasksData || []);
  const children = shouldUseDemoData ? demoAnalyticsData.children_profiles : [];
  const calendarEvents = shouldUseDemoData ? demoAnalyticsData.calendar_events : (calendarEventsData || []);
  const traditions = shouldUseDemoData ? demoAnalyticsData.traditions : [];
  const blogPosts = shouldUseDemoData ? demoAnalyticsData.blog_posts : [];
  
  const isLoading = !shouldUseDemoData && (familyMembersContext?.loading || tasksLoading || eventsLoading);

  console.log('📊 Analytics - Raw data:', {
    isDemoMode,
    shouldUseDemoData,
    hasAuthToken: !!authToken,
    membersCount: members.length,
    tasksCount: tasks.length,
    childrenCount: children.length,
    eventsCount: calendarEvents.length,
    blogPostsCount: blogPosts.length,
    sampleMembers: members.slice(0, 2).map((m: any) => ({ id: m.id, name: m.name })),
    sampleTasks: tasks.slice(0, 2).map((t: any) => ({ id: t.id, title: t.title, assignee_id: t.assignee_id, completed: t.completed })),
    sampleEvents: calendarEvents.slice(0, 2).map((e: any) => ({ id: e.id, title: e.title, date: e.date, participants: e.participants }))
  });

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
    const result = [];
    
    let periodsCount = 6;
    let periodUnit: 'day' | 'week' | 'month' = 'month';
    const periodOffset = 1;
    
    switch (period) {
      case 'week':
        periodsCount = 7;
        periodUnit = 'day';
        break;
      case 'month':
        periodsCount = 4;
        periodUnit = 'week';
        break;
      case 'quarter':
        periodsCount = 3;
        periodUnit = 'month';
        break;
      case 'half-year':
        periodsCount = 6;
        periodUnit = 'month';
        break;
      case 'year':
        periodsCount = 12;
        periodUnit = 'month';
        break;
    }
    
    for (let i = periodsCount - 1; i >= 0; i--) {
      let periodStart: Date;
      let periodEnd: Date;
      let label: string;
      
      if (periodUnit === 'day') {
        periodStart = new Date(now);
        periodStart.setDate(now.getDate() - i);
        periodStart.setHours(0, 0, 0, 0);
        periodEnd = new Date(periodStart);
        periodEnd.setHours(23, 59, 59, 999);
        label = periodStart.getDate().toString();
      } else if (periodUnit === 'week') {
        periodStart = new Date(now);
        periodStart.setDate(now.getDate() - (i * 7));
        periodStart.setHours(0, 0, 0, 0);
        periodEnd = new Date(periodStart);
        periodEnd.setDate(periodStart.getDate() + 6);
        periodEnd.setHours(23, 59, 59, 999);
        label = `Нед ${periodsCount - i}`;
      } else {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        periodStart = new Date(date.getFullYear(), date.getMonth(), 1);
        periodEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
        label = months[date.getMonth()];
      }
      
      const periodTasks = tasks.filter((t: any) => {
        const taskDate = new Date(t.created_at || t.due_date || Date.now());
        return taskDate >= periodStart && taskDate <= periodEnd;
      }).length;
      
      const periodEvents = calendarEvents.filter((e: any) => {
        const eventDate = new Date(e.date);
        return eventDate >= periodStart && eventDate <= periodEnd;
      }).length;
      
      result.push({
        month: label,
        tasks: periodTasks,
        events: periodEvents,
      });
    }
    
    console.log('📊 Аналитика - Активность по периодам:', result);
    console.log('📊 Всего задач:', tasks.length, 'Всего событий:', calendarEvents.length);
    
    return result;
  }, [tasks, calendarEvents, period]);

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

  // Now check loading after all hooks - skip loading in demo mode
  if (isLoading) {
    return <AnalyticsSkeleton />;
  }

  const hasData = activeMembers > 0 || totalTasks > 0 || calendarEvents.length > 0 || blogPosts.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <AnalyticsHeader
          isInstructionOpen={isInstructionOpen}
          onInstructionToggle={setIsInstructionOpen}
          period={period}
          onPeriodChange={setPeriod}
          onNavigateHome={() => navigate('/')}
        />

        <AnalyticsStatsCards
          activeMembers={activeMembers}
          childrenCount={childrenCount}
          taskCompletionRate={taskCompletionRate}
          eventsCount={calendarEvents.length}
        />

        {!hasData && (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 mb-4">
              <Icon name="BarChart3" size={32} className="text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Данных пока нет</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Начните использовать разделы приложения — создавайте задачи, добавляйте события в календарь, 
              заполняйте профили членов семьи. Здесь появится статистика вашей активности.
            </p>
            <Button 
              onClick={() => navigate('/')}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Icon name="Home" size={20} className="mr-2" />
              На главную
            </Button>
          </div>
        )}

        {hasData && (
          <AnalyticsContentTabs
            monthlyActivity={monthlyActivity}
            familyRoles={familyRoles}
            memberActivity={memberActivity}
            tasksByMember={tasksByMember}
            totalTasks={totalTasks}
            completedTasks={completedTasks}
            upcomingEvents={upcomingEvents}
            blogPosts={blogPosts}
          />
        )}
      </div>
    </div>
  );
}