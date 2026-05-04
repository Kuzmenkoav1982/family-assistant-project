import { TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useNavigate } from 'react-router-dom';
import type { FamilyMember, CalendarEvent } from '@/types/family.types';

interface Task {
  id: string;
  title: string;
  description?: string;
  assignee_id?: string;
  assignee?: string;
  assignee_name?: string;
  completed: boolean;
  priority?: string;
  points?: number;
  dueDate?: string;
  deadline?: string;
}

interface TodayTabContentProps {
  tasks: Task[];
  calendarEvents: CalendarEvent[];
  familyMembers: FamilyMember[];
  currentUserId: string;
  toggleTask: (taskId: string) => void;
  getMemberById: (id: string) => FamilyMember | undefined;
}

const PRIORITY_CONFIG: Record<string, { label: string; color: string }> = {
  high: { label: 'Срочно', color: 'bg-red-100 text-red-700' },
  medium: { label: 'Важно', color: 'bg-yellow-100 text-yellow-700' },
  low: { label: 'Обычная', color: 'bg-gray-100 text-gray-600' },
};

const CATEGORY_COLORS: Record<string, string> = {
  personal: 'border-l-blue-400',
  family: 'border-l-purple-400',
  work: 'border-l-gray-400',
  health: 'border-l-green-400',
  education: 'border-l-yellow-400',
  leisure: 'border-l-pink-400',
};

const CATEGORY_LABELS: Record<string, string> = {
  personal: 'Личное',
  family: 'Семья',
  work: 'Работа',
  health: 'Здоровье',
  education: 'Учёба',
  leisure: 'Досуг',
};

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 6) return 'Доброй ночи';
  if (hour < 12) return 'Доброе утро';
  if (hour < 17) return 'Добрый день';
  if (hour < 22) return 'Добрый вечер';
  return 'Доброй ночи';
}

function formatDate(): string {
  return new Date().toLocaleDateString('ru-RU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

export default function TodayTabContent({
  tasks,
  calendarEvents,
  familyMembers,
  currentUserId,
  toggleTask,
  getMemberById,
}: TodayTabContentProps) {
  const navigate = useNavigate();
  const today = new Date().toISOString().split('T')[0];

  const todayTasks = tasks.filter(task => {
    const taskDate = (task.dueDate || task.deadline)?.split('T')[0];
    return taskDate === today && !task.completed;
  });

  const todayEvents = calendarEvents.filter(event => event.date === today);

  const upcomingEvents = calendarEvents
    .filter(event => event.date > today)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 3);

  const myTasks = todayTasks.filter(
    t => t.assignee_id === currentUserId || t.assignee === currentUserId
  );
  const otherTasks = todayTasks.filter(
    t => t.assignee_id !== currentUserId && t.assignee !== currentUserId
  );

  const currentMember = getMemberById(currentUserId);
  const greeting = getGreeting();
  const dateStr = formatDate();

  return (
    <TabsContent value="today" className="space-y-4 mt-0">

      {/* Приветствие */}
      <div className="rounded-2xl bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 p-5 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/80 text-sm mb-0.5">{greeting}</p>
            <h2 className="text-xl font-bold">
              {currentMember?.name || 'Добро пожаловать'} 👋
            </h2>
            <p className="text-white/70 text-sm mt-1 capitalize">{dateStr}</p>
          </div>
          <div className="text-right flex flex-col items-end gap-2">
            <div className="bg-white/20 rounded-xl px-3 py-2 text-center">
              <p className="text-2xl font-bold">{todayTasks.length}</p>
              <p className="text-xs text-white/80">задач</p>
            </div>
            <div className="bg-white/20 rounded-xl px-3 py-2 text-center">
              <p className="text-2xl font-bold">{todayEvents.length}</p>
              <p className="text-xs text-white/80">событий</p>
            </div>
          </div>
        </div>
      </div>

      {/* Пустой день */}
      {todayTasks.length === 0 && todayEvents.length === 0 && (
        <Card className="border-dashed border-2 border-green-200 bg-green-50/50">
          <CardContent className="pt-6 text-center py-10">
            <div className="text-4xl mb-3">🎉</div>
            <h3 className="font-bold text-lg text-green-800 mb-1">Свободный день!</h3>
            <p className="text-green-600 text-sm mb-4">На сегодня ничего не запланировано</p>
            <div className="flex gap-2 justify-center flex-wrap">
              <Button size="sm" variant="outline" onClick={() => navigate('/tasks')}>
                <Icon name="Plus" size={14} className="mr-1" /> Добавить задачу
              </Button>
              <Button size="sm" variant="outline" onClick={() => navigate('/calendar')}>
                <Icon name="Calendar" size={14} className="mr-1" /> Добавить событие
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Мои задачи на сегодня */}
      {myTasks.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-base">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Icon name="User" size={14} className="text-purple-600" />
                </div>
                Мои задачи на сегодня
                <Badge variant="secondary">{myTasks.length}</Badge>
              </div>
              <Button size="sm" variant="ghost" onClick={() => navigate('/tasks')} className="text-xs">
                Все <Icon name="ChevronRight" size={14} />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 pt-0">
            {myTasks.map(task => (
              <div
                key={task.id}
                className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors group"
              >
                <button
                  onClick={() => toggleTask(task.id)}
                  className="mt-0.5 w-5 h-5 rounded-full border-2 border-purple-400 flex items-center justify-center flex-shrink-0 hover:bg-purple-100 transition-colors"
                >
                  {task.completed && <Icon name="Check" size={10} className="text-purple-600" />}
                </button>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm leading-tight">{task.title}</p>
                  {task.description && (
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{task.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {task.priority && PRIORITY_CONFIG[task.priority] && (
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_CONFIG[task.priority].color}`}>
                      {PRIORITY_CONFIG[task.priority].label}
                    </span>
                  )}
                  {task.points && task.points > 0 && (
                    <span className="text-xs text-yellow-600 font-medium">+{task.points}⭐</span>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Задачи семьи */}
      {otherTasks.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-base">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Icon name="Users" size={14} className="text-blue-600" />
                </div>
                Задачи семьи
                <Badge variant="secondary">{otherTasks.length}</Badge>
              </div>
              <Button size="sm" variant="ghost" onClick={() => navigate('/tasks')} className="text-xs">
                Все <Icon name="ChevronRight" size={14} />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 pt-0">
            {otherTasks.slice(0, 4).map(task => {
              const assignee = getMemberById(task.assignee_id || task.assignee || '');
              return (
                <div
                  key={task.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {assignee ? (assignee.avatar || assignee.name[0]) : '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm leading-tight">{task.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {assignee?.name || 'Не назначено'}
                    </p>
                  </div>
                  {task.priority && PRIORITY_CONFIG[task.priority] && (
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${PRIORITY_CONFIG[task.priority].color}`}>
                      {PRIORITY_CONFIG[task.priority].label}
                    </span>
                  )}
                </div>
              );
            })}
            {otherTasks.length > 4 && (
              <p className="text-xs text-center text-muted-foreground pt-1">
                + ещё {otherTasks.length - 4} задач
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* События сегодня */}
      {todayEvents.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-base">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-green-100 flex items-center justify-center">
                  <Icon name="Calendar" size={14} className="text-green-600" />
                </div>
                Сегодня в календаре
                <Badge variant="secondary">{todayEvents.length}</Badge>
              </div>
              <Button size="sm" variant="ghost" onClick={() => navigate('/calendar')} className="text-xs">
                Открыть <Icon name="ChevronRight" size={14} />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 pt-0">
            {todayEvents.map(event => (
              <div
                key={event.id}
                className={`p-3 rounded-lg border-l-4 bg-gray-50 ${CATEGORY_COLORS[event.category] || 'border-l-gray-300'}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{event.title}</p>
                    {event.description && (
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{event.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {event.time && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Icon name="Clock" size={11} />
                        {event.time}
                      </span>
                    )}
                    <Badge variant="outline" className="text-xs">
                      {CATEGORY_LABELS[event.category] || event.category}
                    </Badge>
                  </div>
                </div>
                {event.attendees && event.attendees.length > 0 && (
                  <div className="flex items-center gap-1 mt-2">
                    {event.attendees.slice(0, 5).map(memberId => {
                      const m = getMemberById(memberId);
                      return m ? (
                        <div
                          key={memberId}
                          className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-xs"
                          title={m.name}
                        >
                          {m.avatar || m.name[0]}
                        </div>
                      ) : null;
                    })}
                    {event.attendees.length > 5 && (
                      <span className="text-xs text-muted-foreground">+{event.attendees.length - 5}</span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Ближайшие события */}
      {upcomingEvents.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-base">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-orange-100 flex items-center justify-center">
                  <Icon name="CalendarClock" size={14} className="text-orange-600" />
                </div>
                Скоро
              </div>
              <Button size="sm" variant="ghost" onClick={() => navigate('/calendar')} className="text-xs">
                Календарь <Icon name="ChevronRight" size={14} />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 pt-0">
            {upcomingEvents.map(event => {
              const eventDate = new Date(event.date);
              const diffDays = Math.ceil(
                (eventDate.getTime() - new Date().setHours(0,0,0,0)) / (1000 * 60 * 60 * 24)
              );
              return (
                <div key={event.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                  <div className="w-10 h-10 rounded-xl bg-orange-100 flex flex-col items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-orange-700 leading-none">
                      {eventDate.getDate()}
                    </span>
                    <span className="text-xs text-orange-500 leading-none">
                      {eventDate.toLocaleDateString('ru-RU', { month: 'short' })}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{event.title}</p>
                    <p className="text-xs text-muted-foreground">
                      через {diffDays} {diffDays === 1 ? 'день' : diffDays < 5 ? 'дня' : 'дней'}
                    </p>
                  </div>
                  {event.time && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1 flex-shrink-0">
                      <Icon name="Clock" size={11} />
                      {event.time}
                    </span>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Быстрые действия */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center">
              <Icon name="Zap" size={14} className="text-gray-600" />
            </div>
            Быстрые действия
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              onClick={() => navigate('/tasks')}
              className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-purple-50 hover:bg-purple-100 transition-colors text-purple-700"
            >
              <Icon name="CheckSquare" size={20} />
              <span className="text-xs font-medium">Задача</span>
            </button>
            <button
              onClick={() => navigate('/calendar')}
              className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-green-50 hover:bg-green-100 transition-colors text-green-700"
            >
              <Icon name="Calendar" size={20} />
              <span className="text-xs font-medium">Событие</span>
            </button>
            <button
              onClick={() => navigate('/shopping')}
              className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors text-blue-700"
            >
              <Icon name="ShoppingCart" size={20} />
              <span className="text-xs font-medium">Покупка</span>
            </button>
            <button
              onClick={() => navigate('/health')}
              className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-red-50 hover:bg-red-100 transition-colors text-red-700"
            >
              <Icon name="Heart" size={20} />
              <span className="text-xs font-medium">Здоровье</span>
            </button>
          </div>
        </CardContent>
      </Card>

    </TabsContent>
  );
}
