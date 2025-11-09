import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import type {
  FamilyMember,
  Task,
  Reminder,
  Tradition,
  FamilyValue,
  BlogPost,
  ImportantDate,
  MealVoting,
  ChildProfile,
  DevelopmentPlan,
  ChatMessage,
  FamilyAlbum,
  FamilyNeed,
  FamilyTreeMember,
  CalendarEvent,
} from '@/types/family.types';
import {
  initialFamilyMembers,
  initialTasks,
  initialChildrenProfiles,
  initialDevelopmentPlans,
  initialImportantDates,
  initialFamilyValues,
  initialBlogPosts,
  initialTraditions,
  initialMealVotings,
  initialChatMessages,
  initialFamilyAlbum,
  initialFamilyNeeds,
  initialFamilyTree,
  initialCalendarEvents,
  getWeekDays,
} from '@/data/mockData';
import { FamilyTabsContent } from '@/components/FamilyTabsContent';

export default function Index() {
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>(initialFamilyMembers);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [importantDates] = useState<ImportantDate[]>(initialImportantDates);
  const [familyValues] = useState<FamilyValue[]>(initialFamilyValues);
  const [blogPosts] = useState<BlogPost[]>(initialBlogPosts);
  const [traditions] = useState<Tradition[]>(initialTraditions);
  const [mealVotings] = useState<MealVoting[]>(initialMealVotings);
  const [childrenProfiles] = useState<ChildProfile[]>(initialChildrenProfiles);
  const [developmentPlans] = useState<DevelopmentPlan[]>(initialDevelopmentPlans);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(initialChatMessages);
  const [familyAlbum, setFamilyAlbum] = useState<FamilyAlbum[]>(initialFamilyAlbum);
  const [familyNeeds, setFamilyNeeds] = useState<FamilyNeed[]>(initialFamilyNeeds);
  const [familyTree, setFamilyTree] = useState<FamilyTreeMember[]>(initialFamilyTree);
  const [selectedTreeMember, setSelectedTreeMember] = useState<FamilyTreeMember | null>(null);
  const [selectedUserId] = useState<string>('1');
  const [newMessage, setNewMessage] = useState('');
  const [calendarEvents] = useState<CalendarEvent[]>(initialCalendarEvents);

  useEffect(() => {
    const newReminders: Reminder[] = tasks
      .filter(task => !task.completed && task.reminderTime)
      .map(task => ({
        id: `reminder-${task.id}`,
        taskId: task.id,
        taskTitle: task.title,
        time: task.reminderTime!,
        notified: false
      }));
    setReminders(newReminders);
  }, [tasks]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      reminders.forEach(reminder => {
        if (reminder.time === currentTime && !reminder.notified) {
          alert(`Напоминание: ${reminder.taskTitle}`);
          setReminders(prev => 
            prev.map(r => r.id === reminder.id ? { ...r, notified: true } : r)
          );
        }
      });
    }, 60000);

    return () => clearInterval(interval);
  }, [reminders]);

  const toggleTask = (taskId: string) => {
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        const newCompleted = !task.completed;
        if (newCompleted) {
          addPoints(task.assignee, task.points);
        }
        return { ...task, completed: newCompleted };
      }
      return task;
    }));
  };

  const addPoints = (memberName: string, points: number) => {
    setFamilyMembers(familyMembers.map(member => {
      if (member.name === memberName) {
        const newPoints = member.points + points;
        const newLevel = Math.floor(newPoints / 100) + 1;
        return { ...member, points: newPoints, level: newLevel };
      }
      return member;
    }));
  };

  const getWorkloadColor = (workload: number) => {
    if (workload > 70) return 'text-red-600 bg-red-50 border-red-300';
    if (workload > 50) return 'text-yellow-600 bg-yellow-50 border-yellow-300';
    return 'text-green-600 bg-green-50 border-green-300';
  };

  const getMemberById = (id: string) => {
    return familyMembers.find(m => m.id === id);
  };

  const getAISuggestedMeals = () => {
    const allFavorites = familyMembers.flatMap(m => m.foodPreferences?.favorites || []);
    const favoriteCount = allFavorites.reduce((acc, food) => {
      acc[food] = (acc[food] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    const topFavorites = Object.entries(favoriteCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    return [
      {
        name: topFavorites[0]?.[0] || 'Пицца',
        reason: `Любимое блюдо ${topFavorites[0]?.[1] || 3} членов семьи`,
        icon: '🍕'
      },
      {
        name: topFavorites[1]?.[0] || 'Паста',
        reason: `Нравится ${topFavorites[1]?.[1] || 2} членам семьи`,
        icon: '🍝'
      },
      {
        name: topFavorites[2]?.[0] || 'Салат',
        reason: `Популярно у ${topFavorites[2]?.[1] || 2} членов семьи`,
        icon: '🥗'
      }
    ];
  };

  const totalPoints = familyMembers.reduce((sum, member) => sum + member.points, 0);
  const avgWorkload = Math.round(familyMembers.reduce((sum, member) => sum + member.workload, 0) / familyMembers.length);
  const completedTasks = tasks.filter(t => t.completed).length;
  const totalTasks = tasks.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-100 via-pink-100 to-purple-100 p-4 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="text-center mb-8">
          <h1 className="text-4xl lg:text-6xl font-bold bg-gradient-to-r from-orange-600 via-pink-600 to-purple-600 bg-clip-text text-transparent mb-4 animate-fade-in">
            Семейный Органайзер
          </h1>
          <p className="text-lg lg:text-xl text-muted-foreground animate-fade-in" style={{ animationDelay: '0.2s' }}>
            Управление семейной жизнью с AI-помощником
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="animate-fade-in hover:shadow-lg transition-all border-l-4 border-l-orange-500" style={{ animationDelay: '0.1s' }}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Всего баллов</CardTitle>
              <Icon name="Award" className="text-orange-500" size={20} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">{totalPoints}</div>
            </CardContent>
          </Card>

          <Card className="animate-fade-in hover:shadow-lg transition-all border-l-4 border-l-pink-500" style={{ animationDelay: '0.2s' }}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Средняя загрузка</CardTitle>
              <Icon name="TrendingUp" className="text-pink-500" size={20} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-pink-600">{avgWorkload}%</div>
            </CardContent>
          </Card>

          <Card className="animate-fade-in hover:shadow-lg transition-all border-l-4 border-l-purple-500" style={{ animationDelay: '0.3s' }}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Задачи выполнены</CardTitle>
              <Icon name="CheckCircle2" className="text-purple-500" size={20} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">{completedTasks}/{totalTasks}</div>
            </CardContent>
          </Card>

          <Card className="animate-fade-in hover:shadow-lg transition-all border-l-4 border-l-blue-500" style={{ animationDelay: '0.4s' }}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Членов семьи</CardTitle>
              <Icon name="Users" className="text-blue-500" size={20} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{familyMembers.length}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Tabs defaultValue="members" className="space-y-6">
              <TabsList className="grid grid-cols-4 lg:grid-cols-7 gap-1 h-auto p-1 bg-white/50 backdrop-blur-sm">
                <TabsTrigger value="members" className="text-sm lg:text-base py-3">
                  <Icon name="Users" className="mr-1 lg:mr-2" size={16} />
                  Семья
                </TabsTrigger>
                <TabsTrigger value="tree" className="text-sm lg:text-base py-3">
                  <Icon name="Network" className="mr-1 lg:mr-2" size={16} />
                  Древо
                </TabsTrigger>
                <TabsTrigger value="tasks" className="text-sm lg:text-base py-3">
                  <Icon name="CheckSquare" className="mr-1 lg:mr-2" size={16} />
                  Задачи
                </TabsTrigger>
                <TabsTrigger value="chat" className="text-sm lg:text-base py-3">
                  <Icon name="MessageSquare" className="mr-1 lg:mr-2" size={16} />
                  Чат
                </TabsTrigger>
                <TabsTrigger value="album" className="text-sm lg:text-base py-3">
                  <Icon name="Image" className="mr-1 lg:mr-2" size={16} />
                  Альбом
                </TabsTrigger>
                <TabsTrigger value="needs" className="text-sm lg:text-base py-3">
                  <Icon name="ListTodo" className="mr-1 lg:mr-2" size={16} />
                  Потребности
                </TabsTrigger>
                <TabsTrigger value="rating" className="text-sm lg:text-base py-3">
                  <Icon name="Trophy" className="mr-1 lg:mr-2" size={16} />
                  Рейтинг
                </TabsTrigger>
                <TabsTrigger value="traditions" className="text-sm lg:text-base py-3">
                  <Icon name="Calendar" className="mr-1 lg:mr-2" size={16} />
                  Традиции
                </TabsTrigger>
                <TabsTrigger value="values" className="text-sm lg:text-base py-3">
                  <Icon name="Sparkles" className="mr-1 lg:mr-2" size={16} />
                  Ценности
                </TabsTrigger>
                <TabsTrigger value="meals" className="text-sm lg:text-base py-3">
                  <Icon name="ChefHat" className="mr-1 lg:mr-2" size={16} />
                  Меню
                </TabsTrigger>
                <TabsTrigger value="development" className="text-sm lg:text-base py-3">
                  <Icon name="GraduationCap" className="mr-1 lg:mr-2" size={16} />
                  Развитие
                </TabsTrigger>
                <TabsTrigger value="community" className="text-sm lg:text-base py-3">
                  <Icon name="BookOpen" className="mr-1 lg:mr-2" size={16} />
                  Блог
                </TabsTrigger>
                <TabsTrigger value="dates" className="text-sm lg:text-base py-3">
                  <Icon name="Heart" className="mr-1 lg:mr-2" size={16} />
                  Даты
                </TabsTrigger>
              </TabsList>

              <FamilyTabsContent
                familyMembers={familyMembers}
                setFamilyMembers={setFamilyMembers}
                tasks={tasks}
                setTasks={setTasks}
                traditions={traditions}
                familyValues={familyValues}
                blogPosts={blogPosts}
                importantDates={importantDates}
                mealVotings={mealVotings}
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
                selectedUserId={selectedUserId}
                newMessage={newMessage}
                setNewMessage={setNewMessage}
                toggleTask={toggleTask}
                addPoints={addPoints}
                getWorkloadColor={getWorkloadColor}
                getMemberById={getMemberById}
                getAISuggestedMeals={getAISuggestedMeals}
              />
            </Tabs>
          </div>

          <div className="space-y-6">
            <Card className="animate-fade-in border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50" style={{ animationDelay: '0.5s' }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Calendar" size={24} />
                  Календарь на неделю
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {getWeekDays().map((day, index) => {
                    const dayEvents = calendarEvents.filter(event => event.date === day.fullDate);
                    return (
                      <div
                        key={index}
                        className={`p-3 rounded-lg border-2 transition-all hover:shadow-md ${
                          index === 0 
                            ? 'bg-gradient-to-r from-purple-100 to-pink-100 border-purple-300' 
                            : 'bg-white border-gray-200 hover:border-purple-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                              index === 0 ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-600'
                            }`}>
                              {day.date}
                            </div>
                            <span className={`font-semibold ${index === 0 ? 'text-purple-700' : 'text-gray-700'}`}>
                              {day.day}
                            </span>
                          </div>
                          {dayEvents.length > 0 && (
                            <Badge variant="secondary" className="text-xs">
                              {dayEvents.length} событий
                            </Badge>
                          )}
                        </div>
                        {dayEvents.length > 0 && (
                          <div className="space-y-1 mt-2">
                            {dayEvents.map(event => (
                              <div key={event.id} className={`text-xs p-2 rounded ${event.color} border`}>
                                <div className="flex items-center gap-1">
                                  <Icon name="Clock" size={12} />
                                  <span className="font-semibold">{event.time}</span>
                                </div>
                                <p className="font-medium mt-1">{event.title}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card className="animate-fade-in border-orange-200 bg-gradient-to-br from-orange-50 to-yellow-50" style={{ animationDelay: '0.6s' }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Bell" size={24} />
                  Напоминания
                </CardTitle>
              </CardHeader>
              <CardContent>
                {reminders.length > 0 ? (
                  <div className="space-y-2">
                    {reminders.filter(r => !r.notified).map(reminder => (
                      <div key={reminder.id} className="p-3 bg-white border-2 border-orange-300 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <Icon name="Clock" size={16} className="text-orange-500" />
                          <span className="font-semibold text-orange-700">{reminder.time}</span>
                        </div>
                        <p className="text-sm">{reminder.taskTitle}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Нет активных напоминаний
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="animate-fade-in border-green-200 bg-gradient-to-br from-green-50 to-emerald-50" style={{ animationDelay: '0.7s' }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Sparkles" size={24} />
                  AI Советы
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-white border-2 border-green-300 rounded-lg">
                    <p className="text-sm font-semibold text-green-700 mb-1">Баланс нагрузки</p>
                    <p className="text-xs text-muted-foreground">
                      {avgWorkload > 60 
                        ? 'Рекомендуем перераспределить задачи для снижения нагрузки'
                        : 'Отличный баланс! Все члены семьи вовлечены равномерно'
                      }
                    </p>
                  </div>
                  <div className="p-3 bg-white border-2 border-blue-300 rounded-lg">
                    <p className="text-sm font-semibold text-blue-700 mb-1">Семейное время</p>
                    <p className="text-xs text-muted-foreground">
                      Не забудьте про воскресный семейный обед!
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
