import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFamilyDataQuery } from '@/hooks/useFamilyDataQuery';
import { AnalyticsSkeleton } from '@/components/skeletons/AnalyticsSkeleton';
import { AnalyticsHeader } from '@/components/analytics/AnalyticsHeader';
import { AnalyticsStatsCards } from '@/components/analytics/AnalyticsStatsCards';
import { AnalyticsContentTabs } from '@/components/analytics/AnalyticsContentTabs';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

type Period = 'week' | 'month' | 'quarter' | 'half-year' | 'year';

export default function Analytics() {
  const navigate = useNavigate();
  const { data: familyData, isLoading, error } = useFamilyDataQuery();
  const [isInstructionOpen, setIsInstructionOpen] = useState(false);
  const [period, setPeriod] = useState<Period>('month');

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

  // Now check loading after all hooks
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