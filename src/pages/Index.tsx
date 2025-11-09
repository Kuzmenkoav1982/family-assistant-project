import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';

interface FamilyMember {
  id: string;
  name: string;
  role: string;
  workload: number;
  avatar: string;
  points: number;
  level: number;
  achievements: string[];
}

interface Task {
  id: string;
  title: string;
  assignee: string;
  completed: boolean;
  category: string;
  points: number;
  reminderTime?: string;
  shoppingList?: string[];
}

interface Reminder {
  id: string;
  taskId: string;
  taskTitle: string;
  time: string;
  notified: boolean;
}

interface ImportantDate {
  id: string;
  title: string;
  date: string;
  type: string;
  daysLeft: number;
}

interface FamilyValue {
  id: string;
  title: string;
  description: string;
  icon: string;
  tradition: string;
}

interface BlogPost {
  id: string;
  title: string;
  author: string;
  date: string;
  category: string;
  excerpt: string;
  likes: number;
  comments: number;
}

interface Tradition {
  id: string;
  title: string;
  description: string;
  frequency: string;
  icon: string;
  participants: string[];
}

interface MealOption {
  id: string;
  name: string;
  description: string;
  mealType: 'breakfast' | 'lunch' | 'dinner';
  icon: string;
  cookingTime: string;
  difficulty: 'easy' | 'medium' | 'hard';
  votes: { [memberId: string]: boolean };
}

interface MealVoting {
  id: string;
  title: string;
  mealType: 'breakfast' | 'lunch' | 'dinner';
  date: string;
  options: MealOption[];
  status: 'active' | 'completed';
}

export default function Index() {
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([
    { id: '1', name: 'Александр', role: 'Муж', workload: 65, avatar: '👨', points: 450, level: 5, achievements: ['early_bird', 'helper', 'chef'] },
    { id: '2', name: 'Елена', role: 'Жена', workload: 75, avatar: '👩', points: 680, level: 7, achievements: ['organizer', 'champion', 'master_chef'] },
    { id: '3', name: 'Максим', role: 'Сын', workload: 30, avatar: '👦', points: 210, level: 3, achievements: ['student', 'helper'] },
    { id: '4', name: 'София', role: 'Дочь', workload: 25, avatar: '👧', points: 150, level: 2, achievements: ['beginner'] }
  ]);

  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', title: 'Приготовить ужин', assignee: 'Елена', completed: false, category: 'Кухня', points: 30, reminderTime: '18:00' },
    { id: '2', title: 'Вынести мусор', assignee: 'Александр', completed: true, category: 'Дом', points: 10 },
    { id: '3', title: 'Сделать уроки', assignee: 'Максим', completed: false, category: 'Учеба', points: 25, reminderTime: '16:00' },
    { id: '4', title: 'Убрать комнату', assignee: 'София', completed: false, category: 'Дом', points: 20 },
    { id: '5', title: 'Купить продукты', assignee: 'Александр', completed: false, category: 'Покупки', points: 15, reminderTime: '17:30', shoppingList: ['Молоко', 'Хлеб', 'Яйца', 'Сыр', 'Яблоки', 'Картофель'] },
    { id: '6', title: 'Постирать белье', assignee: 'Елена', completed: false, category: 'Дом', points: 20 }
  ]);

  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [showNotification, setShowNotification] = useState(false);
  const [currentNotification, setCurrentNotification] = useState<Reminder | null>(null);

  const [mealVotings, setMealVotings] = useState<MealVoting[]>([
    {
      id: '1',
      title: 'Что приготовить на ужин сегодня?',
      mealType: 'dinner',
      date: '9 ноября',
      status: 'active',
      options: [
        {
          id: '1',
          name: 'Паста карбонара',
          description: 'Классическая итальянская паста с беконом и сливочным соусом',
          mealType: 'dinner',
          icon: '🍝',
          cookingTime: '30 мин',
          difficulty: 'easy',
          votes: { '1': true, '2': true }
        },
        {
          id: '2',
          name: 'Куриные котлеты с пюре',
          description: 'Сочные котлеты из куриного филе с нежным картофельным пюре',
          mealType: 'dinner',
          icon: '🍗',
          cookingTime: '45 мин',
          difficulty: 'medium',
          votes: { '3': true, '4': true }
        },
        {
          id: '3',
          name: 'Запечённая рыба с овощами',
          description: 'Лёгкое и полезное блюдо с сезонными овощами',
          mealType: 'dinner',
          icon: '🐟',
          cookingTime: '40 мин',
          difficulty: 'easy',
          votes: {}
        }
      ]
    },
    {
      id: '2',
      title: 'Завтрак на выходные',
      mealType: 'breakfast',
      date: '10 ноября',
      status: 'active',
      options: [
        {
          id: '4',
          name: 'Блинчики с начинкой',
          description: 'Пышные блинчики с вареньем, сгущёнкой или творогом',
          mealType: 'breakfast',
          icon: '🥞',
          cookingTime: '25 мин',
          difficulty: 'easy',
          votes: { '1': true }
        },
        {
          id: '5',
          name: 'Омлет с овощами',
          description: 'Богатый белком завтрак с болгарским перцем и помидорами',
          mealType: 'breakfast',
          icon: '🍳',
          cookingTime: '15 мин',
          difficulty: 'easy',
          votes: { '2': true, '3': true }
        },
        {
          id: '6',
          name: 'Овсянка с фруктами',
          description: 'Полезная каша с бананами, ягодами и орехами',
          mealType: 'breakfast',
          icon: '🥣',
          cookingTime: '10 мин',
          difficulty: 'easy',
          votes: { '4': true }
        }
      ]
    }
  ]);

  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      tasks.forEach(task => {
        if (!task.completed && task.reminderTime === currentTime) {
          const existingReminder = reminders.find(r => r.taskId === task.id && r.notified);
          if (!existingReminder) {
            const newReminder: Reminder = {
              id: Date.now().toString(),
              taskId: task.id,
              taskTitle: task.title,
              time: currentTime,
              notified: false
            };
            setCurrentNotification(newReminder);
            setShowNotification(true);
            setReminders(prev => [...prev, { ...newReminder, notified: true }]);
          }
        }
      });
    };

    const interval = setInterval(checkReminders, 60000);
    checkReminders();

    return () => clearInterval(interval);
  }, [tasks, reminders]);

  const [importantDates] = useState<ImportantDate[]>([
    { id: '1', title: 'День рождения Елены', date: '15 ноября', type: 'birthday', daysLeft: 6 },
    { id: '2', title: 'Годовщина свадьбы', date: '20 ноября', type: 'anniversary', daysLeft: 11 },
    { id: '3', title: 'День рождения Максима', date: '03 декабря', type: 'birthday', daysLeft: 24 }
  ]);

  const [blogPosts] = useState<BlogPost[]>([
    {
      id: '1',
      title: 'Как справиться с детскими истериками: 5 проверенных методов',
      author: 'Психолог Мария Иванова',
      date: '7 ноября 2025',
      category: 'Воспитание',
      excerpt: 'Детские истерики — нормальная часть развития. Важно понимать причины и реагировать правильно...',
      likes: 234,
      comments: 45
    },
    {
      id: '2',
      title: 'Распределение обязанностей: найти баланс между супругами',
      author: 'Семейный терапевт Анна Петрова',
      date: '5 ноября 2025',
      category: 'Отношения',
      excerpt: 'Справедливое распределение домашних дел — основа гармонии в паре. Обсуждайте ожидания открыто...',
      likes: 189,
      comments: 32
    },
    {
      id: '3',
      title: 'Семейные традиции: зачем они нужны и как их создать',
      author: 'Психолог Дмитрий Соколов',
      date: '3 ноября 2025',
      category: 'Традиции',
      excerpt: 'Традиции создают чувство принадлежности и безопасности. Начните с малого — еженедельного ужина...',
      likes: 312,
      comments: 67
    },
    {
      id: '4',
      title: 'Личные границы в семье: как говорить "нет" без чувства вины',
      author: 'Коуч Елена Смирнова',
      date: '1 ноября 2025',
      category: 'Психология',
      excerpt: 'Здоровые границы — не эгоизм, а забота о себе и семье. Учитесь отказывать уважительно...',
      likes: 276,
      comments: 54
    },
    {
      id: '5',
      title: 'Как поддержать подростка в переходном возрасте',
      author: 'Психолог Ольга Кузнецова',
      date: '30 октября 2025',
      category: 'Подростки',
      excerpt: 'Переходный возраст — испытание для всей семьи. Сохраняйте связь через уважение и принятие...',
      likes: 198,
      comments: 41
    },
    {
      id: '6',
      title: 'Эмоциональное выгорание родителей: признаки и решения',
      author: 'Психотерапевт Игорь Волков',
      date: '28 октября 2025',
      category: 'Здоровье',
      excerpt: 'Выгорание родителей — реальная проблема. Не игнорируйте сигналы тела и просите помощь...',
      likes: 345,
      comments: 78
    }
  ]);

  const [traditions] = useState<Tradition[]>([
    {
      id: '1',
      title: 'Семейный ужин по воскресеньям',
      description: 'Каждое воскресенье вся семья собирается за большим столом, готовим вместе любимые блюда',
      frequency: 'Еженедельно',
      icon: '🍽️',
      participants: ['Александр', 'Елена', 'Максим', 'София']
    },
    {
      id: '2',
      title: 'Пятничный киновечер',
      description: 'По пятницам выбираем фильм всей семьей, готовим попкорн и проводим вечер вместе',
      frequency: 'Еженедельно',
      icon: '🎬',
      participants: ['Александр', 'Елена', 'Максим', 'София']
    },
    {
      id: '3',
      title: 'Утренние объятия',
      description: 'Начинаем каждый день с семейных объятий и пожеланий хорошего дня',
      frequency: 'Ежедневно',
      icon: '🤗',
      participants: ['Александр', 'Елена', 'Максим', 'София']
    },
    {
      id: '4',
      title: 'День рождения с сюрпризами',
      description: 'Украшаем дом шариками, готовим любимое блюдо именинника и дарим самодельные открытки',
      frequency: 'По случаю',
      icon: '🎂',
      participants: ['Александр', 'Елена', 'Максим', 'София']
    },
    {
      id: '5',
      title: 'Субботняя уборка с музыкой',
      description: 'Убираемся все вместе под любимые песни, превращая работу в веселье',
      frequency: 'Еженедельно',
      icon: '🎵',
      participants: ['Александр', 'Елена', 'Максим', 'София']
    },
    {
      id: '6',
      title: 'Летние походы на природу',
      description: 'Каждое лето выбираемся на природу с палатками, костром и песнями под гитару',
      frequency: 'Сезонно',
      icon: '🏕️',
      participants: ['Александр', 'Елена', 'Максим', 'София']
    }
  ]);

  const [familyValues] = useState<FamilyValue[]>([
    {
      id: '1',
      title: 'Взаимоуважение',
      description: 'Мы цениим мнение каждого члена семьи и уважаем личные границы друг друга',
      icon: '🤝',
      tradition: 'Еженедельный семейный совет по воскресеньям'
    },
    {
      id: '2',
      title: 'Честность',
      description: 'Открытое общение — основа доверия в нашей семье',
      icon: '💬',
      tradition: 'Вечерние разговоры о прошедшем дне'
    },
    {
      id: '3',
      title: 'Поддержка',
      description: 'Мы всегда рядом друг с другом в радости и в трудные моменты',
      icon: '❤️',
      tradition: 'Семейные объятия перед сном'
    },
    {
      id: '4',
      title: 'Развитие',
      description: 'Каждый имеет право на личностный рост и увлечения',
      icon: '🌱',
      tradition: 'Месяц хобби — каждый делится своим увлечением'
    },
    {
      id: '5',
      title: 'Веселье',
      description: 'Совместные развлечения укрепляют семейные связи',
      icon: '🎉',
      tradition: 'Пятничные игровые вечера'
    },
    {
      id: '6',
      title: 'Традиции',
      description: 'Наши ритуалы создают особую атмосферу и воспоминания',
      icon: '🕯️',
      tradition: 'Семейный фотоальбом и совместное приготовление по субботам'
    }
  ]);

  const toggleTask = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const wasCompleted = task.completed;
    const newCompletedState = !wasCompleted;

    setTasks(tasks.map(t => 
      t.id === taskId ? { ...t, completed: newCompletedState } : t
    ));

    if (newCompletedState && !wasCompleted) {
      setFamilyMembers(members => members.map(member => {
        if (member.name === task.assignee) {
          const newPoints = member.points + task.points;
          const newLevel = Math.floor(newPoints / 100) + 1;
          return { ...member, points: newPoints, level: newLevel };
        }
        return member;
      }));
    } else if (!newCompletedState && wasCompleted) {
      setFamilyMembers(members => members.map(member => {
        if (member.name === task.assignee) {
          const newPoints = Math.max(0, member.points - task.points);
          const newLevel = Math.floor(newPoints / 100) + 1;
          return { ...member, points: newPoints, level: newLevel };
        }
        return member;
      }));
    }
  };

  const getWorkloadColor = (workload: number) => {
    if (workload > 70) return 'text-red-500';
    if (workload > 50) return 'text-orange-500';
    return 'text-green-500';
  };

  const toggleVote = (votingId: string, optionId: string, memberId: string) => {
    setMealVotings(votings => 
      votings.map(voting => {
        if (voting.id === votingId) {
          return {
            ...voting,
            options: voting.options.map(option => {
              if (option.id === optionId) {
                const newVotes = { ...option.votes };
                if (newVotes[memberId]) {
                  delete newVotes[memberId];
                } else {
                  newVotes[memberId] = true;
                }
                return { ...option, votes: newVotes };
              }
              return option;
            })
          };
        }
        return voting;
      })
    );
  };

  const getVoteCount = (votes: { [key: string]: boolean }) => {
    return Object.keys(votes).length;
  };

  const getMealTypeLabel = (type: string) => {
    switch (type) {
      case 'breakfast': return 'Завтрак';
      case 'lunch': return 'Обед';
      case 'dinner': return 'Ужин';
      default: return type;
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'Легко';
      case 'medium': return 'Средне';
      case 'hard': return 'Сложно';
      default: return difficulty;
    }
  };

  const completedTasksCount = tasks.filter(t => t.completed).length;
  const completionRate = Math.round((completedTasksCount / tasks.length) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-purple-50 to-pink-50">
      {showNotification && currentNotification && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in">
          <Card className="border-orange-500 border-2 shadow-2xl bg-gradient-to-br from-orange-100 to-yellow-100 min-w-[320px]">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Icon name="Bell" className="text-orange-600 animate-bounce" size={24} />
                  <CardTitle className="text-lg">Напоминание!</CardTitle>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowNotification(false)}
                  className="h-6 w-6 p-0"
                >
                  <Icon name="X" size={16} />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="font-medium mb-2">{currentNotification.taskTitle}</p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                <Icon name="Clock" size={14} />
                Время: {currentNotification.time}
              </div>
              {tasks.find(t => t.id === currentNotification.taskId)?.shoppingList && (
                <div className="bg-white rounded-lg p-3 border border-orange-300">
                  <p className="font-semibold text-sm mb-2 flex items-center gap-1">
                    <Icon name="ShoppingCart" size={14} />
                    Список покупок:
                  </p>
                  <ul className="space-y-1">
                    {tasks.find(t => t.id === currentNotification.taskId)?.shoppingList?.map((item, idx) => (
                      <li key={idx} className="text-sm flex items-center gap-2">
                        <Icon name="Check" size={12} className="text-green-600" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <Button 
                className="w-full mt-3 bg-gradient-to-r from-orange-500 to-yellow-500"
                onClick={() => setShowNotification(false)}
              >
                Понятно
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <header className="mb-8 animate-fade-in">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="text-4xl">🏠</div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-500 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Семейный Помощник
                </h1>
                <p className="text-muted-foreground mt-1">Гармония начинается с порядка</p>
              </div>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="lg" className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600">
                  <Icon name="Settings" className="mr-2" size={20} />
                  Настройки семьи
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Настройки семьи</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <label className="text-sm font-medium">Добавить члена семьи</label>
                    <Input placeholder="Имя" className="mt-2" />
                  </div>
                  <Button className="w-full">Добавить</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="animate-scale-in border-orange-200 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Icon name="TrendingUp" className="text-orange-500" size={22} />
                Общий прогресс
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-5xl font-bold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent mb-2">
                  {completionRate}%
                </div>
                <p className="text-sm text-muted-foreground mb-4">Выполнено задач сегодня</p>
                <Progress value={completionRate} className="h-3" />
              </div>
            </CardContent>
          </Card>

          <Card className="animate-scale-in border-purple-200 shadow-lg hover:shadow-xl transition-shadow" style={{ animationDelay: '0.1s' }}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Icon name="Users" className="text-purple-500" size={22} />
                Активность семьи
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-5xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent mb-2">
                  {familyMembers.length}
                </div>
                <p className="text-sm text-muted-foreground mb-4">Членов семьи</p>
                <div className="flex justify-center gap-2">
                  {familyMembers.map(member => (
                    <div key={member.id} className="text-3xl">{member.avatar}</div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-scale-in border-pink-200 shadow-lg hover:shadow-xl transition-shadow" style={{ animationDelay: '0.2s' }}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Icon name="Calendar" className="text-pink-500" size={22} />
                Ближайшее событие
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-5xl mb-2">🎂</div>
                <p className="font-semibold text-foreground">{importantDates[0].title}</p>
                <p className="text-sm text-muted-foreground mt-1">{importantDates[0].date}</p>
                <Badge className="mt-3 bg-pink-500">Через {importantDates[0].daysLeft} дней</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="members" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 h-auto lg:h-14">
            <TabsTrigger value="members" className="text-sm lg:text-base py-3">
              <Icon name="Users" className="mr-1 lg:mr-2" size={16} />
              Семья
            </TabsTrigger>
            <TabsTrigger value="tasks" className="text-sm lg:text-base py-3">
              <Icon name="CheckSquare" className="mr-1 lg:mr-2" size={16} />
              Задачи
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
            <TabsTrigger value="community" className="text-sm lg:text-base py-3">
              <Icon name="BookOpen" className="mr-1 lg:mr-2" size={16} />
              Блог
            </TabsTrigger>
            <TabsTrigger value="dates" className="text-sm lg:text-base py-3">
              <Icon name="Heart" className="mr-1 lg:mr-2" size={16} />
              Даты
            </TabsTrigger>
          </TabsList>

          <TabsContent value="members" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {familyMembers.map((member, index) => (
                <Card 
                  key={member.id} 
                  className="animate-fade-in border-l-4 hover:shadow-lg transition-all hover:scale-[1.02]"
                  style={{ 
                    borderLeftColor: index % 2 === 0 ? '#f97316' : '#d946ef',
                    animationDelay: `${index * 0.1}s`
                  }}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-5xl">{member.avatar}</div>
                        <div>
                          <CardTitle className="text-xl">{member.name}</CardTitle>
                          <p className="text-sm text-muted-foreground">{member.role}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0">
                          ⭐ Уровень {member.level}
                        </Badge>
                        <Badge variant="outline" className={getWorkloadColor(member.workload)}>
                          Загрузка: {member.workload}%
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-3">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-semibold text-yellow-900">Баллы</span>
                          <span className="text-lg font-bold text-orange-600">{member.points}</span>
                        </div>
                        <Progress value={(member.points % 100)} className="h-2" />
                        <p className="text-xs text-muted-foreground mt-1 text-center">
                          {100 - (member.points % 100)} до следующего уровня
                        </p>
                      </div>
                      
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Уровень вовлеченности</span>
                        <span className={`font-semibold ${getWorkloadColor(member.workload)}`}>
                          {member.workload > 70 ? 'Высокая' : member.workload > 50 ? 'Средняя' : 'Низкая'}
                        </span>
                      </div>
                      <Progress value={member.workload} className="h-2" />
                      
                      <div className="flex gap-1 flex-wrap mt-3">
                        {member.achievements.slice(0, 3).map((achievement, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {achievement === 'early_bird' && '🌅 Ранняя пташка'}
                            {achievement === 'helper' && '🤝 Помощник'}
                            {achievement === 'chef' && '👨‍🍳 Повар'}
                            {achievement === 'organizer' && '📋 Организатор'}
                            {achievement === 'champion' && '🏆 Чемпион'}
                            {achievement === 'master_chef' && '⭐ Мастер-повар'}
                            {achievement === 'student' && '📚 Ученик'}
                            {achievement === 'beginner' && '🌟 Новичок'}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="tasks" className="space-y-4">
            <Card className="border-purple-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl">Список обязанностей</CardTitle>
                  <Button size="sm" className="bg-gradient-to-r from-purple-500 to-pink-500">
                    <Icon name="Plus" className="mr-2" size={16} />
                    Добавить задачу
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {tasks.map((task, index) => (
                    <div 
                      key={task.id} 
                      className="flex items-center gap-4 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors animate-fade-in"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <Checkbox 
                        checked={task.completed} 
                        onCheckedChange={() => toggleTask(task.id)}
                        className="h-5 w-5"
                      />
                      <div className="flex-1">
                        <p className={`font-medium ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                          {task.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <Badge variant="secondary" className="text-xs">{task.category}</Badge>
                          <span className="text-xs text-muted-foreground">• {task.assignee}</span>
                          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300 text-xs">+{task.points} ⭐</Badge>
                          {task.reminderTime && (
                            <Badge className="bg-orange-100 text-orange-800 border-orange-300 text-xs flex items-center gap-1">
                              <Icon name="Bell" size={10} />
                              {task.reminderTime}
                            </Badge>
                          )}
                          {task.shoppingList && (
                            <Dialog>
                              <DialogTrigger asChild>
                                <Badge className="bg-blue-100 text-blue-800 border-blue-300 text-xs flex items-center gap-1 cursor-pointer hover:bg-blue-200">
                                  <Icon name="ShoppingCart" size={10} />
                                  Список ({task.shoppingList.length})
                                </Badge>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle className="flex items-center gap-2">
                                    <Icon name="ShoppingCart" size={20} />
                                    Список покупок
                                  </DialogTitle>
                                </DialogHeader>
                                <div className="space-y-2 mt-4">
                                  {task.shoppingList.map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                                      <Checkbox className="h-4 w-4" />
                                      <span className="text-sm">{item}</span>
                                    </div>
                                  ))}
                                </div>
                              </DialogContent>
                            </Dialog>
                          )}
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Icon name="ArrowLeftRight" size={16} />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rating" className="space-y-4">
            <Card className="border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Icon name="Trophy" className="text-yellow-600" size={28} />
                  Семейный рейтинг
                </CardTitle>
                <p className="text-sm text-muted-foreground">Топ участников этой недели</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[...familyMembers]
                    .sort((a, b) => b.points - a.points)
                    .map((member, index) => {
                      const medals = ['🥇', '🥈', '🥉', '🎖️'];
                      const medal = medals[index] || '🎖️';
                      
                      return (
                        <div 
                          key={member.id}
                          className="flex items-center gap-4 p-4 rounded-lg bg-white border-2 hover:shadow-md transition-all"
                          style={{
                            borderColor: index === 0 ? '#fbbf24' : index === 1 ? '#d1d5db' : index === 2 ? '#cd7f32' : '#e5e7eb'
                          }}
                        >
                          <div className="text-4xl">{medal}</div>
                          <div className="text-4xl">{member.avatar}</div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-lg">{member.name}</h3>
                              <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                                Ур. {member.level}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{member.role}</p>
                            <div className="flex gap-1 mt-2 flex-wrap">
                              {member.achievements.map((achievement, i) => (
                                <span key={i} className="text-xs">
                                  {achievement === 'early_bird' && '🌅'}
                                  {achievement === 'helper' && '🤝'}
                                  {achievement === 'chef' && '👨‍🍳'}
                                  {achievement === 'organizer' && '📋'}
                                  {achievement === 'champion' && '🏆'}
                                  {achievement === 'master_chef' && '⭐'}
                                  {achievement === 'student' && '📚'}
                                  {achievement === 'beginner' && '🌟'}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                              {member.points}
                            </div>
                            <p className="text-xs text-muted-foreground">баллов</p>
                          </div>
                        </div>
                      );
                    })}
                </div>
                
                <div className="mt-6 p-4 bg-white rounded-lg border-2 border-purple-200">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Icon name="Award" className="text-purple-600" size={20} />
                    Достижения
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <div className="text-3xl mb-1">🌅</div>
                      <p className="text-xs font-medium">Ранняя пташка</p>
                      <p className="text-xs text-muted-foreground">10 задач до 9:00</p>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-3xl mb-1">📋</div>
                      <p className="text-xs font-medium">Организатор</p>
                      <p className="text-xs text-muted-foreground">Создать 20 задач</p>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-3xl mb-1">🏆</div>
                      <p className="text-xs font-medium">Чемпион</p>
                      <p className="text-xs text-muted-foreground">500 баллов</p>
                    </div>
                    <div className="text-center p-3 bg-orange-50 rounded-lg">
                      <div className="text-3xl mb-1">⭐</div>
                      <p className="text-xs font-medium">Мастер</p>
                      <p className="text-xs text-muted-foreground">Достичь 10 уровня</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="traditions" className="space-y-4">
            <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl flex items-center gap-2">
                      <Icon name="Calendar" className="text-blue-600" size={28} />
                      Наши семейные традиции
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">Ритуалы, которые объединяют нашу семью</p>
                  </div>
                  <Button className="bg-gradient-to-r from-blue-500 to-cyan-500">
                    <Icon name="Plus" className="mr-2" size={16} />
                    Добавить традицию
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {traditions.map((tradition, index) => (
                    <Card 
                      key={tradition.id}
                      className="animate-fade-in bg-white hover:shadow-xl transition-all hover:scale-[1.02] border-2 border-blue-200"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <CardHeader>
                        <div className="text-center">
                          <div className="text-6xl mb-3">{tradition.icon}</div>
                          <CardTitle className="text-lg">{tradition.title}</CardTitle>
                          <Badge className="mt-2 bg-blue-100 text-blue-800 border-blue-300">
                            {tradition.frequency}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-sm text-center text-muted-foreground leading-relaxed">
                          {tradition.description}
                        </p>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <p className="text-xs font-semibold text-blue-900 mb-2">Участники:</p>
                          <div className="flex gap-1 flex-wrap">
                            {tradition.participants.map((participant, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {participant}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="mt-6 p-6 bg-white rounded-lg border-2 border-blue-300">
                  <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <Icon name="Lightbulb" className="text-blue-600" size={22} />
                    Почему традиции важны?
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex gap-3">
                      <Icon name="Heart" className="text-red-500 flex-shrink-0 mt-1" size={20} />
                      <div>
                        <p className="font-medium text-sm">Укрепляют связи</p>
                        <p className="text-xs text-muted-foreground">Регулярные ритуалы создают чувство единства</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Icon name="Shield" className="text-blue-500 flex-shrink-0 mt-1" size={20} />
                      <div>
                        <p className="font-medium text-sm">Дают стабильность</p>
                        <p className="text-xs text-muted-foreground">Предсказуемость создаёт ощущение безопасности</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Icon name="Star" className="text-yellow-500 flex-shrink-0 mt-1" size={20} />
                      <div>
                        <p className="font-medium text-sm">Создают воспоминания</p>
                        <p className="text-xs text-muted-foreground">Особые моменты остаются в памяти навсегда</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Icon name="Users" className="text-green-500 flex-shrink-0 mt-1" size={20} />
                      <div>
                        <p className="font-medium text-sm">Передают ценности</p>
                        <p className="text-xs text-muted-foreground">Традиции учат детей важным жизненным принципам</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="values" className="space-y-4">
            <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Icon name="Sparkles" className="text-purple-600" size={28} />
                  Семейные ценности
                </CardTitle>
                <p className="text-sm text-muted-foreground">Принципы, которые объединяют нашу семью</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {familyValues.map((value, index) => (
                    <Card 
                      key={value.id}
                      className="animate-fade-in bg-white hover:shadow-xl transition-all hover:scale-[1.02] border-2"
                      style={{ 
                        animationDelay: `${index * 0.1}s`,
                        borderColor: index % 3 === 0 ? '#f97316' : index % 3 === 1 ? '#a855f7' : '#ec4899'
                      }}
                    >
                      <CardHeader>
                        <div className="text-center">
                          <div className="text-6xl mb-3">{value.icon}</div>
                          <CardTitle className="text-lg">{value.title}</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-sm text-center text-muted-foreground leading-relaxed">
                          {value.description}
                        </p>
                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-3">
                          <p className="text-xs font-semibold text-purple-900 mb-1 flex items-center gap-1">
                            <Icon name="Calendar" size={14} className="text-purple-600" />
                            Наша традиция:
                          </p>
                          <p className="text-xs text-purple-800">{value.tradition}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="mt-6 p-6 bg-white rounded-lg border-2 border-purple-300">
                  <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <Icon name="Lightbulb" className="text-purple-600" size={22} />
                    Психологические советы по границам
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex gap-3">
                        <Icon name="CheckCircle2" className="text-green-600 flex-shrink-0 mt-0.5" size={18} />
                        <div>
                          <p className="font-medium text-sm">Уважайте личное пространство</p>
                          <p className="text-xs text-muted-foreground">У каждого должно быть своё время и место для уединения</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <Icon name="CheckCircle2" className="text-green-600 flex-shrink-0 mt-0.5" size={18} />
                        <div>
                          <p className="font-medium text-sm">Говорите о чувствах открыто</p>
                          <p className="text-xs text-muted-foreground">Используйте "Я-сообщения": "Я чувствую...", "Мне важно..."</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <Icon name="CheckCircle2" className="text-green-600 flex-shrink-0 mt-0.5" size={18} />
                        <div>
                          <p className="font-medium text-sm">Учитесь говорить "нет"</p>
                          <p className="text-xs text-muted-foreground">Отказ — это нормально, если он сказан с уважением</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex gap-3">
                        <Icon name="CheckCircle2" className="text-green-600 flex-shrink-0 mt-0.5" size={18} />
                        <div>
                          <p className="font-medium text-sm">Разделяйте обязанности справедливо</p>
                          <p className="text-xs text-muted-foreground">Учитывайте возможности и загруженность каждого</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <Icon name="CheckCircle2" className="text-green-600 flex-shrink-0 mt-0.5" size={18} />
                        <div>
                          <p className="font-medium text-sm">Выделяйте время для себя</p>
                          <p className="text-xs text-muted-foreground">Здоровые границы помогают избежать эмоционального выгорания</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <Icon name="CheckCircle2" className="text-green-600 flex-shrink-0 mt-0.5" size={18} />
                        <div>
                          <p className="font-medium text-sm">Празднуйте успехи вместе</p>
                          <p className="text-xs text-muted-foreground">Признание достижений укрепляет семейные связи</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="community" className="space-y-4">
            <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-pink-50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl flex items-center gap-2">
                      <Icon name="BookOpen" className="text-orange-600" size={28} />
                      Сообщество и блог
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">Советы экспертов по семейным вопросам</p>
                  </div>
                  <Button variant="outline" className="border-orange-300">
                    <Icon name="Rss" className="mr-2" size={16} />
                    Подписаться
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-6 flex gap-2 flex-wrap">
                  <Badge className="bg-orange-100 text-orange-800 border-orange-300 cursor-pointer">Все</Badge>
                  <Badge variant="outline" className="cursor-pointer">Воспитание</Badge>
                  <Badge variant="outline" className="cursor-pointer">Отношения</Badge>
                  <Badge variant="outline" className="cursor-pointer">Психология</Badge>
                  <Badge variant="outline" className="cursor-pointer">Традиции</Badge>
                  <Badge variant="outline" className="cursor-pointer">Здоровье</Badge>
                </div>

                <div className="space-y-4">
                  {blogPosts.map((post, index) => (
                    <Card 
                      key={post.id}
                      className="animate-fade-in bg-white hover:shadow-lg transition-all cursor-pointer"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="secondary" className="text-xs">{post.category}</Badge>
                              <span className="text-xs text-muted-foreground">{post.date}</span>
                            </div>
                            <CardTitle className="text-lg hover:text-orange-600 transition-colors">
                              {post.title}
                            </CardTitle>
                            <p className="text-sm text-muted-foreground mt-2">{post.excerpt}</p>
                            <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Icon name="User" size={14} />
                                {post.author}
                              </div>
                              <div className="flex items-center gap-1">
                                <Icon name="ThumbsUp" size={14} className="text-orange-500" />
                                {post.likes}
                              </div>
                              <div className="flex items-center gap-1">
                                <Icon name="MessageCircle" size={14} className="text-blue-500" />
                                {post.comments}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
                </div>

                <div className="mt-6 p-6 bg-white rounded-lg border-2 border-orange-300">
                  <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <Icon name="Users" className="text-orange-600" size={22} />
                    Присоединяйтесь к сообществу
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <div className="text-3xl font-bold text-orange-600">12,450</div>
                      <p className="text-sm text-muted-foreground">Активных семей</p>
                    </div>
                    <div className="text-center p-4 bg-pink-50 rounded-lg">
                      <div className="text-3xl font-bold text-pink-600">340</div>
                      <p className="text-sm text-muted-foreground">Статей экспертов</p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-3xl font-bold text-purple-600">8,920</div>
                      <p className="text-sm text-muted-foreground">Обсуждений</p>
                    </div>
                  </div>
                  <p className="text-sm text-center text-muted-foreground mb-4">
                    Делитесь опытом, задавайте вопросы и получайте поддержку от других семей
                  </p>
                  <Button className="w-full bg-gradient-to-r from-orange-500 to-pink-500">
                    <Icon name="MessageSquare" className="mr-2" size={16} />
                    Начать обсуждение
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="meals" className="space-y-4">
            <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl flex items-center gap-2">
                      <Icon name="ChefHat" className="text-green-600" size={28} />
                      Семейное меню
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">Голосуйте за любимые блюда всей семьёй</p>
                  </div>
                  <Button className="bg-gradient-to-r from-green-500 to-emerald-500">
                    <Icon name="Plus" className="mr-2" size={16} />
                    Предложить блюдо
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {mealVotings.map((voting, vIndex) => (
                    <Card key={voting.id} className="animate-fade-in bg-white border-2 border-green-200" style={{ animationDelay: `${vIndex * 0.1}s` }}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-xl">{voting.title}</CardTitle>
                            <div className="flex items-center gap-3 mt-2">
                              <Badge className="bg-green-100 text-green-800 border-green-300">
                                {getMealTypeLabel(voting.mealType)}
                              </Badge>
                              <span className="text-sm text-muted-foreground flex items-center gap-1">
                                <Icon name="Calendar" size={14} />
                                {voting.date}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {voting.status === 'active' ? 'Активно' : 'Завершено'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {voting.options.map((option, oIndex) => {
                            const voteCount = getVoteCount(option.votes);
                            const isLeader = voteCount > 0 && voting.options.every(o => getVoteCount(o.votes) <= voteCount);
                            
                            return (
                              <Card 
                                key={option.id}
                                className={`animate-fade-in hover:shadow-lg transition-all ${isLeader && voteCount > 0 ? 'border-2 border-green-500 bg-green-50' : 'border border-gray-200'}`}
                                style={{ animationDelay: `${(vIndex * 0.1) + (oIndex * 0.05)}s` }}
                              >
                                <CardHeader>
                                  <div className="text-center">
                                    <div className="text-5xl mb-2">{option.icon}</div>
                                    <CardTitle className="text-lg">{option.name}</CardTitle>
                                    {isLeader && voteCount > 0 && (
                                      <Badge className="mt-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                                        🏆 Лидер
                                      </Badge>
                                    )}
                                  </div>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                  <p className="text-sm text-center text-muted-foreground min-h-[40px]">
                                    {option.description}
                                  </p>
                                  
                                  <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                      <Icon name="Clock" size={12} />
                                      {option.cookingTime}
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Icon name="Gauge" size={12} />
                                      {getDifficultyLabel(option.difficulty)}
                                    </div>
                                  </div>

                                  <div className="bg-white border border-green-200 rounded-lg p-3">
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="text-sm font-semibold">Голоса:</span>
                                      <Badge className="bg-green-100 text-green-800 border-green-300">
                                        {voteCount} из {familyMembers.length}
                                      </Badge>
                                    </div>
                                    <div className="grid grid-cols-4 gap-2">
                                      {familyMembers.map(member => {
                                        const hasVoted = option.votes[member.id];
                                        return (
                                          <button
                                            key={member.id}
                                            onClick={() => toggleVote(voting.id, option.id, member.id)}
                                            className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${
                                              hasVoted 
                                                ? 'bg-green-100 border-2 border-green-500 scale-110' 
                                                : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                                            }`}
                                            title={member.name}
                                          >
                                            <div className="text-2xl">{member.avatar}</div>
                                            {hasVoted && <Icon name="Check" size={14} className="text-green-600" />}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </div>

                                  <Button 
                                    className={`w-full ${voteCount > 0 ? 'bg-gradient-to-r from-green-500 to-emerald-500' : ''}`}
                                    variant={voteCount > 0 ? 'default' : 'outline'}
                                  >
                                    <Icon name="ThumbsUp" className="mr-2" size={16} />
                                    {voteCount > 0 ? `${voteCount} голос${voteCount > 1 ? 'а' : ''}` : 'Голосовать'}
                                  </Button>
                                </CardContent>
                              </Card>
                            );
                          })}
                        </div>

                        <div className="mt-4 p-4 bg-white rounded-lg border border-green-300">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Icon name="Info" size={18} className="text-green-600" />
                              <span className="text-sm font-medium">Совет:</span>
                            </div>
                            <Button variant="ghost" size="sm">
                              <Icon name="MessageCircle" className="mr-2" size={14} />
                              Обсудить в чате
                            </Button>
                          </div>
                          <p className="text-sm text-muted-foreground mt-2">
                            Нажмите на аватар члена семьи, чтобы проголосовать за блюдо от его имени
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="mt-6 p-6 bg-white rounded-lg border-2 border-green-300">
                  <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <Icon name="Lightbulb" className="text-green-600" size={22} />
                    Популярные идеи для меню
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Button variant="outline" className="justify-start h-auto py-3 flex-col items-start">
                      <div className="text-2xl mb-1">🍕</div>
                      <span className="text-xs">Пицца</span>
                    </Button>
                    <Button variant="outline" className="justify-start h-auto py-3 flex-col items-start">
                      <div className="text-2xl mb-1">🍜</div>
                      <span className="text-xs">Супы</span>
                    </Button>
                    <Button variant="outline" className="justify-start h-auto py-3 flex-col items-start">
                      <div className="text-2xl mb-1">🥗</div>
                      <span className="text-xs">Салаты</span>
                    </Button>
                    <Button variant="outline" className="justify-start h-auto py-3 flex-col items-start">
                      <div className="text-2xl mb-1">🍰</div>
                      <span className="text-xs">Десерты</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="dates" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {importantDates.map((date, index) => (
                <Card 
                  key={date.id} 
                  className="animate-fade-in border-pink-200 hover:shadow-xl transition-all hover:scale-[1.02]"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardHeader>
                    <div className="text-center">
                      <div className="text-6xl mb-3">
                        {date.type === 'birthday' ? '🎂' : date.type === 'anniversary' ? '💍' : '🎉'}
                      </div>
                      <CardTitle className="text-lg">{date.title}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">{date.date}</p>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="text-center">
                        <Badge className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-4 py-1">
                          Через {date.daysLeft} дней
                        </Badge>
                      </div>
                      {date.daysLeft <= 7 && (
                        <div className="bg-pink-50 border border-pink-200 rounded-lg p-3 space-y-2">
                          <p className="text-sm font-medium text-pink-900 flex items-center gap-2">
                            <Icon name="Sparkles" size={16} className="text-pink-500" />
                            Предложения:
                          </p>
                          <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                            <Icon name="Gift" className="mr-2" size={14} />
                            Заказать букет цветов
                          </Button>
                          <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                            <Icon name="Heart" className="mr-2" size={14} />
                            Написать поздравление
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}