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
  AIRecommendation,
  ThemeType,
} from '@/types/family.types';
import { themes, getThemeClasses } from '@/config/themes';
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
  initialAIRecommendations,
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
  const [aiRecommendations] = useState<AIRecommendation[]>(initialAIRecommendations);
  const [selectedUserId] = useState<string>('1');
  const [newMessage, setNewMessage] = useState('');
  const [calendarEvents] = useState<CalendarEvent[]>(initialCalendarEvents);
  const [currentTheme, setCurrentTheme] = useState<ThemeType>(() => {
    const saved = localStorage.getItem('familyOrganizerTheme');
    return (saved as ThemeType) || 'middle';
  });
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [welcomeText, setWelcomeText] = useState('');

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
    const fullText = "Добро пожаловать в Семейный Органайзер! Место, где ваша семья становится командой. Цель проекта: Сохранение семейных ценностей, повышение вовлеченности в семейную жизнь, бережная передача семейных традиций и истории семьи.";
    let currentIndex = 0;
    
    const typingTimer = setInterval(() => {
      if (currentIndex <= fullText.length) {
        setWelcomeText(fullText.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(typingTimer);
      }
    }, 40);
    
    const hideTimer = setTimeout(() => {
      setShowWelcome(false);
    }, 14000);

    return () => {
      clearInterval(typingTimer);
      clearTimeout(hideTimer);
    };
  }, []);

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
    setTasks(prevTasks => {
      return prevTasks.map(task => {
        if (task.id === taskId) {
          const newCompleted = !task.completed;
          
          if (newCompleted) {
            addPoints(task.assignee, task.points);
            
            if (task.isRecurring && task.recurringPattern) {
              const nextDate = getNextOccurrenceDate(task);
              if (nextDate) {
                const newTask: Task = {
                  ...task,
                  id: `${task.id}-${Date.now()}`,
                  completed: false,
                  nextOccurrence: nextDate,
                };
                
                setTimeout(() => {
                  setTasks(prev => [...prev, newTask]);
                }, 100);
              }
            }
          }
          
          return { ...task, completed: newCompleted };
        }
        return task;
      });
    });
  };

  const getNextOccurrenceDate = (task: Task): string | undefined => {
    if (!task.recurringPattern) return undefined;
    
    const now = new Date();
    const { frequency, interval, daysOfWeek, endDate } = task.recurringPattern;
    
    if (endDate && new Date(endDate) < now) return undefined;
    
    const next = new Date(now);
    
    switch (frequency) {
      case 'daily':
        next.setDate(next.getDate() + interval);
        break;
      case 'weekly':
        if (daysOfWeek && daysOfWeek.length > 0) {
          const currentDay = next.getDay();
          const sortedDays = [...daysOfWeek].sort((a, b) => a - b);
          const nextDay = sortedDays.find(d => d > currentDay) || sortedDays[0];
          const daysToAdd = nextDay > currentDay 
            ? nextDay - currentDay 
            : 7 - currentDay + nextDay;
          next.setDate(next.getDate() + daysToAdd);
        } else {
          next.setDate(next.getDate() + 7 * interval);
        }
        break;
      case 'monthly':
        next.setMonth(next.getMonth() + interval);
        break;
      case 'yearly':
        next.setFullYear(next.getFullYear() + interval);
        break;
    }
    
    return next.toISOString().split('T')[0];
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

  const handleThemeChange = (theme: ThemeType) => {
    setCurrentTheme(theme);
    localStorage.setItem('familyOrganizerTheme', theme);
    setShowThemeSelector(false);
    
    const themeNames: Record<ThemeType, string> = {
      young: 'Молодёжный',
      middle: 'Деловой',
      senior: 'Комфортный',
      apple: 'Apple'
    };
    
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-white border-2 border-indigo-500 rounded-lg shadow-2xl p-4 z-[100] animate-fade-in';
    notification.innerHTML = `
      <div class="flex items-center gap-3">
        <div class="text-2xl">🎨</div>
        <div>
          <p class="font-bold text-sm">Тема изменена</p>
          <p class="text-xs text-gray-600">Стиль: ${themeNames[theme]}</p>
        </div>
      </div>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transform = 'translateX(100px)';
      notification.style.transition = 'all 0.3s ease-out';
      setTimeout(() => notification.remove(), 300);
    }, 2000);
  };

  const handleFeedbackButton = (type: 'will_use' | 'not_interested') => {
    const stats = JSON.parse(localStorage.getItem('feedbackStats') || '{}');
    stats[type] = (stats[type] || 0) + 1;
    stats.timestamp = new Date().toISOString();
    localStorage.setItem('feedbackStats', JSON.stringify(stats));
    
    alert(type === 'will_use' 
      ? '✅ Спасибо! Ваше мнение очень важно для нас!' 
      : 'Спасибо за обратную связь! Мы будем работать над улучшением проекта.');
  };

  const exportStatsToCSV = () => {
    const stats = JSON.parse(localStorage.getItem('feedbackStats') || '{}');
    const willUse = stats.will_use || 0;
    const notInterested = stats.not_interested || 0;
    const total = willUse + notInterested;
    const willUsePercent = total > 0 ? ((willUse / total) * 100).toFixed(2) : '0';
    const notInterestedPercent = total > 0 ? ((notInterested / total) * 100).toFixed(2) : '0';
    const timestamp = stats.timestamp || new Date().toISOString();
    
    const csvContent = [
      ['Семейный Органайзер - Статистика обратной связи'],
      ['Дата экспорта:', new Date().toLocaleString('ru-RU')],
      ['Последнее обновление:', new Date(timestamp).toLocaleString('ru-RU')],
      [''],
      ['Тип отзыва', 'Количество', 'Процент'],
      ['Буду использовать', willUse.toString(), willUsePercent + '%'],
      ['Не интересно', notInterested.toString(), notInterestedPercent + '%'],
      ['Всего откликов', total.toString(), '100%'],
      [''],
      ['Детальная информация:'],
      ['Положительных откликов:', willUse.toString()],
      ['Отрицательных откликов:', notInterested.toString()],
      ['Процент заинтересованности:', willUsePercent + '%'],
      ['Процент незаинтересованности:', notInterestedPercent + '%']
    ]
      .map(row => row.join(','))
      .join('\n');
    
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `family-organizer-stats-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-white border-2 border-green-500 rounded-lg shadow-2xl p-4 z-[100] animate-fade-in';
    notification.innerHTML = `
      <div class="flex items-center gap-3">
        <div class="text-2xl">✅</div>
        <div>
          <p class="font-bold text-sm">Статистика экспортирована</p>
          <p class="text-xs text-gray-600">Файл CSV сохранён</p>
        </div>
      </div>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transform = 'translateY(-20px)';
      notification.style.transition = 'all 0.3s ease-out';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  };

  const themeClasses = getThemeClasses(currentTheme);

  const totalPoints = familyMembers.reduce((sum, member) => sum + member.points, 0);
  const avgWorkload = Math.round(familyMembers.reduce((sum, member) => sum + member.workload, 0) / familyMembers.length);
  const completedTasks = tasks.filter(t => t.completed).length;
  const totalTasks = tasks.length;

  return (
    <>
      {showWelcome && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-orange-100 via-pink-100 to-purple-100 animate-fade-in">
          <div className="absolute inset-0 bg-white/40 backdrop-blur-sm"></div>
          
          <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
            <div className="mb-8 animate-bounce-slow">
              <div className="text-9xl mb-4">👨‍👩‍👧‍👦</div>
            </div>
            
            <div className="space-y-6">
              <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-orange-600 via-pink-600 to-purple-600 bg-clip-text text-transparent mb-6 animate-fade-in">
                Семейный Органайзер
              </h1>
              
              <div className="min-h-[200px] flex items-center justify-center px-4">
                <p className="text-xl md:text-2xl text-gray-700 font-medium leading-relaxed max-w-3xl">
                  {welcomeText}
                  <span className="inline-block w-1 h-7 bg-purple-600 ml-1 animate-pulse"></span>
                </p>
              </div>
              
              <div className="flex justify-center gap-4 mt-12 animate-fade-in" style={{ animationDelay: '3s' }}>
                <div className="flex items-center gap-2 text-orange-600">
                  <Icon name="Heart" className="animate-pulse" size={24} />
                  <span className="text-lg font-semibold">Любовь</span>
                </div>
                <div className="flex items-center gap-2 text-pink-600">
                  <Icon name="Users" className="animate-pulse" size={24} style={{ animationDelay: '0.2s' }} />
                  <span className="text-lg font-semibold">Команда</span>
                </div>
                <div className="flex items-center gap-2 text-purple-600">
                  <Icon name="Sparkles" className="animate-pulse" size={24} style={{ animationDelay: '0.4s' }} />
                  <span className="text-lg font-semibold">Традиции</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className={`min-h-screen ${themeClasses.background} p-4 lg:p-8 ${themeClasses.baseFont} transition-all duration-700 ease-in-out`}>
        <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
        <Card className="border-2 border-blue-300 bg-gradient-to-r from-blue-50 to-cyan-50 animate-fade-in">
          <CardContent className="py-6">
            <div className="text-center mb-4">
              <h3 className="text-xl font-bold mb-2">🚀 Помогите нам стать лучше!</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Это демо-проект семейного органайзера. Ваше мнение поможет понять, нужно ли развивать этот проект дальше.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg"
                onClick={() => handleFeedbackButton('will_use')}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all w-full sm:w-auto"
              >
                <Icon name="ThumbsUp" className="mr-2" size={20} />
                Буду использовать этот проект
              </Button>
              <Button 
                size="lg"
                variant="destructive"
                onClick={() => handleFeedbackButton('not_interested')}
                className="bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 shadow-lg hover:shadow-xl transition-all w-full sm:w-auto"
              >
                <Icon name="ThumbsDown" className="mr-2" size={20} />
                Не интересно
              </Button>
            </div>
          </CardContent>
        </Card>

        <header className="text-center mb-8 relative">
          <div className="flex justify-center items-start mb-4 lg:mb-0">
            <div className="lg:absolute lg:top-0 lg:right-4">
              <Button
                onClick={() => setShowThemeSelector(!showThemeSelector)}
                className="bg-gradient-to-r from-indigo-500 to-purple-600"
                size="sm"
              >
                <Icon name="Palette" className="mr-2" size={16} />
                Стиль: {themes[currentTheme].name}
              </Button>
              
              {showThemeSelector && (
                <Card className="absolute right-0 top-12 z-50 w-80 max-w-[calc(100vw-2rem)] border-2 border-indigo-300 shadow-2xl animate-fade-in">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Icon name="Palette" size={20} />
                      Выберите стиль оформления
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {(Object.keys(themes) as ThemeType[]).map((themeKey) => {
                      const theme = themes[themeKey];
                      return (
                        <button
                          key={themeKey}
                          onClick={() => handleThemeChange(themeKey)}
                          className={`w-full text-left p-4 rounded-lg border-2 transition-all hover:shadow-lg ${
                            currentTheme === themeKey 
                              ? 'border-indigo-500 bg-indigo-50' 
                              : 'border-gray-200 hover:border-indigo-300'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-bold">{theme.name}</h4>
                            {currentTheme === themeKey && (
                              <Icon name="Check" className="text-indigo-600" size={20} />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">{theme.description}</p>
                          <Badge variant="outline" className="text-xs">{theme.ageRange}</Badge>
                        </button>
                      );
                    })}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          <h1 className={`${themeClasses.headingFont} font-bold bg-gradient-to-r ${themeClasses.primaryGradient.replace('bg-gradient-to-r ', '')} bg-clip-text text-transparent mb-4 animate-fade-in`}>
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
              <TabsList className="flex flex-wrap gap-2 h-auto p-2 bg-white/50 backdrop-blur-sm justify-start">
                <TabsTrigger value="members" className="text-xs lg:text-sm py-2 px-3 whitespace-nowrap">
                  <Icon name="Users" className="mr-1" size={14} />
                  Семья
                </TabsTrigger>
                <TabsTrigger value="tasks" className="text-xs lg:text-sm py-2 px-3 whitespace-nowrap">
                  <Icon name="CheckSquare" className="mr-1" size={14} />
                  Задачи
                </TabsTrigger>
                <TabsTrigger value="needs" className="text-xs lg:text-sm py-2 px-3 whitespace-nowrap">
                  <Icon name="ListTodo" className="mr-1" size={14} />
                  Потребности
                </TabsTrigger>
                <TabsTrigger value="chat" className="text-xs lg:text-sm py-2 px-3 whitespace-nowrap">
                  <Icon name="MessageSquare" className="mr-1" size={14} />
                  Чат
                </TabsTrigger>
                <TabsTrigger value="tree" className="text-xs lg:text-sm py-2 px-3 whitespace-nowrap">
                  <Icon name="Network" className="mr-1" size={14} />
                  Древо
                </TabsTrigger>
                <TabsTrigger value="traditions" className="text-xs lg:text-sm py-2 px-3 whitespace-nowrap">
                  <Icon name="Calendar" className="mr-1" size={14} />
                  Традиции
                </TabsTrigger>
                <TabsTrigger value="values" className="text-xs lg:text-sm py-2 px-3 whitespace-nowrap">
                  <Icon name="Sparkles" className="mr-1" size={14} />
                  Ценности
                </TabsTrigger>
                <TabsTrigger value="dates" className="text-xs lg:text-sm py-2 px-3 whitespace-nowrap">
                  <Icon name="Heart" className="mr-1" size={14} />
                  Даты
                </TabsTrigger>
                <TabsTrigger value="meals" className="text-xs lg:text-sm py-2 px-3 whitespace-nowrap">
                  <Icon name="ChefHat" className="mr-1" size={14} />
                  Меню
                </TabsTrigger>
                <TabsTrigger value="album" className="text-xs lg:text-sm py-2 px-3 whitespace-nowrap">
                  <Icon name="Image" className="mr-1" size={14} />
                  Альбом
                </TabsTrigger>
                <TabsTrigger value="development" className="text-xs lg:text-sm py-2 px-3 whitespace-nowrap">
                  <Icon name="GraduationCap" className="mr-1" size={14} />
                  Развитие
                </TabsTrigger>
                <TabsTrigger value="ai" className="text-xs lg:text-sm py-2 px-3 whitespace-nowrap">
                  <Icon name="Sparkles" className="mr-1" size={14} />
                  ИИ Здоровье
                </TabsTrigger>
                <TabsTrigger value="rating" className="text-xs lg:text-sm py-2 px-3 whitespace-nowrap">
                  <Icon name="Trophy" className="mr-1" size={14} />
                  Рейтинг
                </TabsTrigger>
                <TabsTrigger value="stats" className="text-xs lg:text-sm py-2 px-3 whitespace-nowrap">
                  <Icon name="BarChart3" className="mr-1" size={14} />
                  Статистика
                </TabsTrigger>
                <TabsTrigger value="community" className="text-xs lg:text-sm py-2 px-3 whitespace-nowrap">
                  <Icon name="BookOpen" className="mr-1" size={14} />
                  Блог
                </TabsTrigger>
                <TabsTrigger value="payment" className="text-xs lg:text-sm py-2 px-3 whitespace-nowrap">
                  <Icon name="CreditCard" className="mr-1" size={14} />
                  Оплата
                </TabsTrigger>
                <TabsTrigger value="feedback" className="text-xs lg:text-sm py-2 px-3 whitespace-nowrap">
                  <Icon name="MessageSquare" className="mr-1" size={14} />
                  Тех. поддержка
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
                aiRecommendations={aiRecommendations}
                selectedUserId={selectedUserId}
                newMessage={newMessage}
                setNewMessage={setNewMessage}
                toggleTask={toggleTask}
                addPoints={addPoints}
                getWorkloadColor={getWorkloadColor}
                getMemberById={getMemberById}
                getAISuggestedMeals={getAISuggestedMeals}
                exportStatsToCSV={exportStatsToCSV}
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
    </>
  );
}