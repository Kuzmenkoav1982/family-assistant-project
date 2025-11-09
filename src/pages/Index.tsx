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
}

interface Task {
  id: string;
  title: string;
  assignee: string;
  completed: boolean;
  category: string;
}

interface ImportantDate {
  id: string;
  title: string;
  date: string;
  type: string;
  daysLeft: number;
}

export default function Index() {
  const [familyMembers] = useState<FamilyMember[]>([
    { id: '1', name: 'Александр', role: 'Муж', workload: 65, avatar: '👨' },
    { id: '2', name: 'Елена', role: 'Жена', workload: 75, avatar: '👩' },
    { id: '3', name: 'Максим', role: 'Сын', workload: 30, avatar: '👦' },
    { id: '4', name: 'София', role: 'Дочь', workload: 25, avatar: '👧' }
  ]);

  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', title: 'Приготовить ужин', assignee: 'Елена', completed: false, category: 'Кухня' },
    { id: '2', title: 'Вынести мусор', assignee: 'Александр', completed: true, category: 'Дом' },
    { id: '3', title: 'Сделать уроки', assignee: 'Максим', completed: false, category: 'Учеба' },
    { id: '4', title: 'Убрать комнату', assignee: 'София', completed: false, category: 'Дом' },
    { id: '5', title: 'Купить продукты', assignee: 'Александр', completed: false, category: 'Покупки' },
    { id: '6', title: 'Постирать белье', assignee: 'Елена', completed: false, category: 'Дом' }
  ]);

  const [importantDates] = useState<ImportantDate[]>([
    { id: '1', title: 'День рождения Елены', date: '15 ноября', type: 'birthday', daysLeft: 6 },
    { id: '2', title: 'Годовщина свадьбы', date: '20 ноября', type: 'anniversary', daysLeft: 11 },
    { id: '3', title: 'День рождения Максима', date: '03 декабря', type: 'birthday', daysLeft: 24 }
  ]);

  const toggleTask = (taskId: string) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
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
          <TabsList className="grid w-full grid-cols-3 h-14">
            <TabsTrigger value="members" className="text-base">
              <Icon name="Users" className="mr-2" size={18} />
              Члены семьи
            </TabsTrigger>
            <TabsTrigger value="tasks" className="text-base">
              <Icon name="CheckSquare" className="mr-2" size={18} />
              Обязанности
            </TabsTrigger>
            <TabsTrigger value="dates" className="text-base">
              <Icon name="Heart" className="mr-2" size={18} />
              Важные даты
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
                      <Badge variant="outline" className={getWorkloadColor(member.workload)}>
                        Загрузка: {member.workload}%
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Уровень вовлеченности</span>
                        <span className={`font-semibold ${getWorkloadColor(member.workload)}`}>
                          {member.workload > 70 ? 'Высокая' : member.workload > 50 ? 'Средняя' : 'Низкая'}
                        </span>
                      </div>
                      <Progress value={member.workload} className="h-2" />
                      <div className="flex gap-2 mt-4">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Icon name="BarChart3" className="mr-2" size={16} />
                          Статистика
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          <Icon name="Trophy" className="mr-2" size={16} />
                          Рейтинг
                        </Button>
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
