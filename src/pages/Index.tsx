import { useState } from 'react';
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

export default function Index() {
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([
    { id: '1', name: 'Александр', role: 'Муж', workload: 65, avatar: '👨', points: 450, level: 5, achievements: ['early_bird', 'helper', 'chef'] },
    { id: '2', name: 'Елена', role: 'Жена', workload: 75, avatar: '👩', points: 680, level: 7, achievements: ['organizer', 'champion', 'master_chef'] },
    { id: '3', name: 'Максим', role: 'Сын', workload: 30, avatar: '👦', points: 210, level: 3, achievements: ['student', 'helper'] },
    { id: '4', name: 'София', role: 'Дочь', workload: 25, avatar: '👧', points: 150, level: 2, achievements: ['beginner'] }
  ]);

  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', title: 'Приготовить ужин', assignee: 'Елена', completed: false, category: 'Кухня', points: 30 },
    { id: '2', title: 'Вынести мусор', assignee: 'Александр', completed: true, category: 'Дом', points: 10 },
    { id: '3', title: 'Сделать уроки', assignee: 'Максим', completed: false, category: 'Учеба', points: 25 },
    { id: '4', title: 'Убрать комнату', assignee: 'София', completed: false, category: 'Дом', points: 20 },
    { id: '5', title: 'Купить продукты', assignee: 'Александр', completed: false, category: 'Покупки', points: 15 },
    { id: '6', title: 'Постирать белье', assignee: 'Елена', completed: false, category: 'Дом', points: 20 }
  ]);

  const [importantDates] = useState<ImportantDate[]>([
    { id: '1', title: 'День рождения Елены', date: '15 ноября', type: 'birthday', daysLeft: 6 },
    { id: '2', title: 'Годовщина свадьбы', date: '20 ноября', type: 'anniversary', daysLeft: 11 },
    { id: '3', title: 'День рождения Максима', date: '03 декабря', type: 'birthday', daysLeft: 24 }
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

  const completedTasksCount = tasks.filter(t => t.completed).length;
  const completionRate = Math.round((completedTasksCount / tasks.length) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-purple-50 to-pink-50">
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
          <TabsList className="grid w-full grid-cols-5 h-14">
            <TabsTrigger value="members" className="text-base">
              <Icon name="Users" className="mr-2" size={18} />
              Члены семьи
            </TabsTrigger>
            <TabsTrigger value="tasks" className="text-base">
              <Icon name="CheckSquare" className="mr-2" size={18} />
              Обязанности
            </TabsTrigger>
            <TabsTrigger value="rating" className="text-base">
              <Icon name="Trophy" className="mr-2" size={18} />
              Рейтинг
            </TabsTrigger>
            <TabsTrigger value="values" className="text-base">
              <Icon name="Sparkles" className="mr-2" size={18} />
              Ценности
            </TabsTrigger>
            <TabsTrigger value="dates" className="text-base">
              <Icon name="Heart" className="mr-2" size={18} />
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
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">{task.category}</Badge>
                          <span className="text-xs text-muted-foreground">• {task.assignee}</span>
                          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300 text-xs">+{task.points} ⭐</Badge>
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