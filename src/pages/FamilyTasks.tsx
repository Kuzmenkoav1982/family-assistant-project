import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { initialTasks, initialFamilyMembers } from '@/data/mockData';
import { Link } from 'react-router-dom';

export default function FamilyTasks() {
  const [tasks, setTasks] = useState(initialTasks);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  const getMemberById = (id: string) => {
    return initialFamilyMembers.find(m => m.name === id || m.id === id);
  };

  const toggleTask = (taskId: string) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'active') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  });

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Кухня': 'bg-orange-100 text-orange-700',
      'Дом': 'bg-blue-100 text-blue-700',
      'Учеба': 'bg-purple-100 text-purple-700',
      'Сад': 'bg-green-100 text-green-700',
      'Покупки': 'bg-pink-100 text-pink-700',
      'Питомцы': 'bg-amber-100 text-amber-700',
      'Финансы': 'bg-cyan-100 text-cyan-700'
    };
    return colors[category] || 'bg-gray-100 text-gray-700';
  };

  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.completed).length,
    active: tasks.filter(t => !t.completed).length,
    totalPoints: tasks.filter(t => !t.completed).reduce((sum, t) => sum + (t.points || 0), 0)
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4">
            <Icon name="ArrowLeft" size={20} />
            <span>На главную</span>
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Задачи</h1>
              <p className="text-lg text-gray-600">Управление задачами семьи</p>
            </div>
            <Button size="lg" className="bg-orange-500 hover:bg-orange-600">
              <Icon name="Plus" className="w-5 h-5 mr-2" />
              Добавить задачу
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-6 border-2 border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Всего задач</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                <Icon name="ListTodo" className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6 border-2 border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Активные</p>
                <p className="text-3xl font-bold text-gray-900">{stats.active}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center">
                <Icon name="Clock" className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6 border-2 border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Выполнено</p>
                <p className="text-3xl font-bold text-gray-900">{stats.completed}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
                <Icon name="CheckCircle2" className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6 border-2 border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Баллы</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalPoints}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center">
                <Icon name="Star" className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-6 mb-6 border-2 border-gray-100">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Icon name="Filter" className="w-5 h-5 text-gray-600" />
              <span className="font-semibold text-gray-900">Фильтры:</span>
            </div>
            <div className="flex gap-2">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                onClick={() => setFilter('all')}
                className={filter === 'all' ? 'bg-orange-500 hover:bg-orange-600' : ''}
              >
                Все задачи
              </Button>
              <Button
                variant={filter === 'active' ? 'default' : 'outline'}
                onClick={() => setFilter('active')}
                className={filter === 'active' ? 'bg-orange-500 hover:bg-orange-600' : ''}
              >
                Активные
              </Button>
              <Button
                variant={filter === 'completed' ? 'default' : 'outline'}
                onClick={() => setFilter('completed')}
                className={filter === 'completed' ? 'bg-orange-500 hover:bg-orange-600' : ''}
              >
                Выполненные
              </Button>
            </div>
          </div>
        </Card>

        {/* Task List */}
        <div className="space-y-4">
          {filteredTasks.map((task) => {
            const member = getMemberById(task.assignee);
            return (
              <Card key={task.id} className={`p-6 border-2 transition-all ${
                task.completed ? 'border-gray-200 bg-gray-50' : 'border-gray-100 hover:shadow-lg'
              }`}>
                <div className="flex items-start gap-4">
                  <Checkbox
                    checked={task.completed}
                    onCheckedChange={() => toggleTask(task.id)}
                    className="mt-1"
                  />
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className={`text-lg font-semibold mb-2 ${
                          task.completed ? 'line-through text-gray-500' : 'text-gray-900'
                        }`}>
                          {task.title}
                        </h3>
                        <div className="flex items-center gap-3 flex-wrap">
                          <Badge className={`${getCategoryColor(task.category)} border-0`}>
                            {task.category}
                          </Badge>
                          {task.points && (
                            <Badge className="bg-purple-100 text-purple-700 border-0">
                              <Icon name="Star" className="w-3 h-3 mr-1" />
                              {task.points} баллов
                            </Badge>
                          )}
                          {task.isRecurring && (
                            <Badge className="bg-blue-100 text-blue-700 border-0">
                              <Icon name="Repeat" className="w-3 h-3 mr-1" />
                              Повторяется
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    {task.shoppingList && task.shoppingList.length > 0 && (
                      <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm font-semibold text-gray-700 mb-2">Список покупок:</p>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {task.shoppingList.map((item, idx) => (
                            <li key={idx} className="flex items-center gap-2">
                              <Icon name="Check" className="w-3 h-3 text-green-600" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {member && (
                          <>
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={member.photoUrl} />
                              <AvatarFallback>{member.avatar}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium text-gray-700">
                              {member.name}
                            </span>
                          </>
                        )}
                      </div>

                      {task.reminderTime && (
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Icon name="Bell" className="w-4 h-4" />
                          <span>{task.reminderTime}</span>
                        </div>
                      )}

                      {task.nextOccurrence && !task.completed && (
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Icon name="Calendar" className="w-4 h-4" />
                          <span>Следующее: {new Date(task.nextOccurrence).toLocaleDateString('ru-RU')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {filteredTasks.length === 0 && (
          <Card className="p-12 text-center border-2 border-dashed border-gray-200">
            <Icon name="CheckCircle2" className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {filter === 'completed' ? 'Нет выполненных задач' : 'Все задачи выполнены!'}
            </h3>
            <p className="text-gray-600 mb-4">
              {filter === 'completed' 
                ? 'Выполните задачи, чтобы они появились здесь'
                : 'Отличная работа! Добавьте новые задачи или отдохните'}
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
