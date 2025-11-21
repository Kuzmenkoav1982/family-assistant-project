import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import type { FamilyGoal, FamilyMember } from '@/types/family.types';

interface GoalsSectionProps {
  goals: FamilyGoal[];
  familyMembers: FamilyMember[];
  currentUserId: string;
  onAddGoal?: (goal: Omit<FamilyGoal, 'id' | 'createdAt'>) => void;
  onUpdateGoal?: (goalId: string, updates: Partial<FamilyGoal>) => void;
  onDeleteGoal?: (goalId: string) => void;
}

export function GoalsSection({ 
  goals, 
  familyMembers,
  currentUserId,
  onAddGoal,
  onUpdateGoal,
  onDeleteGoal
}: GoalsSectionProps) {
  const [selectedGoal, setSelectedGoal] = useState<FamilyGoal | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newGoalData, setNewGoalData] = useState({
    title: '',
    description: '',
    category: 'other' as FamilyGoal['category'],
    priority: 'medium' as FamilyGoal['priority'],
    targetDate: '',
    budget: ''
  });

  const categoryLabels: Record<FamilyGoal['category'], { label: string; icon: string; color: string }> = {
    financial: { label: 'Финансы', icon: 'Wallet', color: 'bg-green-100 text-green-700 border-green-300' },
    health: { label: 'Здоровье', icon: 'Heart', color: 'bg-red-100 text-red-700 border-red-300' },
    education: { label: 'Образование', icon: 'GraduationCap', color: 'bg-blue-100 text-blue-700 border-blue-300' },
    travel: { label: 'Путешествия', icon: 'Plane', color: 'bg-purple-100 text-purple-700 border-purple-300' },
    home: { label: 'Дом', icon: 'Home', color: 'bg-orange-100 text-orange-700 border-orange-300' },
    relationship: { label: 'Отношения', icon: 'Heart', color: 'bg-pink-100 text-pink-700 border-pink-300' },
    other: { label: 'Другое', icon: 'Star', color: 'bg-gray-100 text-gray-700 border-gray-300' }
  };

  const priorityLabels: Record<FamilyGoal['priority'], { label: string; color: string }> = {
    low: { label: 'Низкий', color: 'bg-gray-100 text-gray-600' },
    medium: { label: 'Средний', color: 'bg-blue-100 text-blue-600' },
    high: { label: 'Высокий', color: 'bg-orange-100 text-orange-600' },
    critical: { label: 'Критичный', color: 'bg-red-100 text-red-600' }
  };

  const statusLabels: Record<FamilyGoal['status'], { label: string; color: string; icon: string }> = {
    planning: { label: 'Планирование', color: 'bg-gray-100 text-gray-700', icon: 'FileText' },
    in_progress: { label: 'В процессе', color: 'bg-blue-100 text-blue-700', icon: 'Play' },
    completed: { label: 'Завершено', color: 'bg-green-100 text-green-700', icon: 'CheckCircle2' },
    paused: { label: 'Приостановлено', color: 'bg-yellow-100 text-yellow-700', icon: 'Pause' },
    cancelled: { label: 'Отменено', color: 'bg-red-100 text-red-700', icon: 'XCircle' }
  };

  const calculateDaysLeft = (targetDate: string) => {
    const now = new Date();
    const target = new Date(targetDate);
    const diff = target.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const calculateDuration = (startDate: string, targetDate: string) => {
    const start = new Date(startDate);
    const target = new Date(targetDate);
    const diff = target.getTime() - start.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const renderGanttChart = (goal: FamilyGoal) => {
    const totalDays = calculateDuration(goal.startDate, goal.targetDate);
    const now = new Date();
    const startDate = new Date(goal.startDate);
    const daysPassed = Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const progressDays = Math.floor((totalDays * goal.progress) / 100);

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>{new Date(goal.startDate).toLocaleDateString('ru-RU')}</span>
          <span>{new Date(goal.targetDate).toLocaleDateString('ru-RU')}</span>
        </div>
        
        <div className="relative h-12 bg-gray-100 rounded-lg overflow-hidden">
          <div 
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-200 to-blue-300 transition-all"
            style={{ width: `${(daysPassed / totalDays) * 100}%` }}
          />
          
          <div 
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-400 to-green-500 transition-all"
            style={{ width: `${goal.progress}%` }}
          />
          
          {goal.checkpoints.map((checkpoint, idx) => {
            const checkpointDate = new Date(checkpoint.dueDate);
            const checkpointDays = Math.ceil((checkpointDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
            const position = (checkpointDays / totalDays) * 100;
            
            return (
              <div
                key={checkpoint.id}
                className="absolute top-0 bottom-0 w-1 cursor-pointer group"
                style={{ left: `${position}%` }}
                title={checkpoint.title}
              >
                <div className={`h-full ${checkpoint.completed ? 'bg-green-600' : 'bg-orange-400'}`} />
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  <div className="bg-black text-white text-xs px-2 py-1 rounded">
                    {checkpoint.title}
                  </div>
                </div>
              </div>
            );
          })}
          
          <div 
            className="absolute top-0 bottom-0 w-0.5 bg-red-500"
            style={{ left: `${(daysPassed / totalDays) * 100}%` }}
          >
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-red-500 rounded-full" />
          </div>

          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-bold text-gray-700 drop-shadow-sm">
              {goal.progress}%
            </span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-gradient-to-r from-blue-200 to-blue-300 rounded" />
            <span className="text-gray-600">Прошедшее время</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-green-500 rounded" />
            <span className="text-gray-600">Прогресс</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-500 rounded-full" />
            <span className="text-gray-600">Сегодня</span>
          </div>
        </div>
      </div>
    );
  };

  const handleAddGoal = () => {
    if (!newGoalData.title || !newGoalData.targetDate) return;

    const currentUser = familyMembers.find(m => m.id === currentUserId);
    
    const goalData: Omit<FamilyGoal, 'id' | 'createdAt'> = {
      title: newGoalData.title,
      description: newGoalData.description,
      category: newGoalData.category,
      priority: newGoalData.priority,
      status: 'planning',
      startDate: new Date().toISOString().split('T')[0],
      targetDate: newGoalData.targetDate,
      progress: 0,
      assignedMembers: [currentUserId],
      checkpoints: [],
      aiSuggestions: [
        {
          id: '1',
          type: 'tip',
          title: 'Совет по достижению цели',
          content: 'Разбейте большую цель на маленькие контрольные точки. Это поможет отслеживать прогресс и сохранять мотивацию.',
          createdAt: new Date().toISOString()
        }
      ],
      budget: newGoalData.budget ? parseFloat(newGoalData.budget) : undefined,
      currentSpending: 0,
      createdBy: currentUserId,
      createdByName: currentUser?.name || 'Неизвестно'
    };

    onAddGoal?.(goalData);
    setShowAddDialog(false);
    setNewGoalData({
      title: '',
      description: '',
      category: 'other',
      priority: 'medium',
      targetDate: '',
      budget: ''
    });
  };

  const handleToggleCheckpoint = (goalId: string, checkpointId: string) => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;

    const updatedCheckpoints = goal.checkpoints.map(cp => 
      cp.id === checkpointId 
        ? { ...cp, completed: !cp.completed, completedDate: !cp.completed ? new Date().toISOString() : undefined }
        : cp
    );

    const completedCount = updatedCheckpoints.filter(cp => cp.completed).length;
    const newProgress = Math.round((completedCount / updatedCheckpoints.length) * 100);

    onUpdateGoal?.(goalId, { 
      checkpoints: updatedCheckpoints,
      progress: newProgress
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Icon name="Target" size={28} />
            Цели семьи
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Планируйте и отслеживайте долгосрочные цели с помощью диаграммы Ганта
          </p>
        </div>
        
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-500 to-purple-500">
              <Icon name="Plus" className="mr-2" size={16} />
              Добавить цель
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Новая цель семьи</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Название цели</label>
                <Input
                  value={newGoalData.title}
                  onChange={(e) => setNewGoalData({ ...newGoalData, title: e.target.value })}
                  placeholder="Например: Купить дом, Съездить в отпуск..."
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">Описание</label>
                <Textarea
                  value={newGoalData.description}
                  onChange={(e) => setNewGoalData({ ...newGoalData, description: e.target.value })}
                  placeholder="Подробное описание цели..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Категория</label>
                  <select
                    value={newGoalData.category}
                    onChange={(e) => setNewGoalData({ ...newGoalData, category: e.target.value as FamilyGoal['category'] })}
                    className="w-full p-2 border rounded-md"
                  >
                    {Object.entries(categoryLabels).map(([key, { label }]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">Приоритет</label>
                  <select
                    value={newGoalData.priority}
                    onChange={(e) => setNewGoalData({ ...newGoalData, priority: e.target.value as FamilyGoal['priority'] })}
                    className="w-full p-2 border rounded-md"
                  >
                    {Object.entries(priorityLabels).map(([key, { label }]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Целевая дата</label>
                  <Input
                    type="date"
                    value={newGoalData.targetDate}
                    onChange={(e) => setNewGoalData({ ...newGoalData, targetDate: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">Бюджет (необязательно)</label>
                  <Input
                    type="number"
                    value={newGoalData.budget}
                    onChange={(e) => setNewGoalData({ ...newGoalData, budget: e.target.value })}
                    placeholder="0"
                  />
                </div>
              </div>

              <Button onClick={handleAddGoal} className="w-full">
                Создать цель
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {goals.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mb-4">
              <Icon name="Target" size={40} className="text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Нет целей</h3>
            <p className="text-sm text-gray-600 mb-4 max-w-md">
              Начните планировать будущее вашей семьи! Создайте первую долгосрочную цель.
            </p>
            <Button onClick={() => setShowAddDialog(true)} variant="outline">
              <Icon name="Plus" className="mr-2" size={16} />
              Создать первую цель
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {goals.map((goal, idx) => {
            const categoryInfo = categoryLabels[goal.category];
            const daysLeft = calculateDaysLeft(goal.targetDate);
            const isOverdue = daysLeft < 0 && goal.status !== 'completed';
            
            return (
              <Card 
                key={goal.id} 
                className={`animate-fade-in hover:shadow-lg transition-all ${
                  selectedGoal?.id === goal.id ? 'ring-2 ring-blue-500' : ''
                }`}
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="text-xl">{goal.title}</CardTitle>
                        <Badge className={statusLabels[goal.status].color}>
                          <Icon name={statusLabels[goal.status].icon} size={12} className="mr-1" />
                          {statusLabels[goal.status].label}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{goal.description}</p>
                      
                      <div className="flex flex-wrap items-center gap-2 mt-3">
                        <Badge variant="outline" className={categoryInfo.color}>
                          <Icon name={categoryInfo.icon} size={12} className="mr-1" />
                          {categoryInfo.label}
                        </Badge>
                        <Badge className={priorityLabels[goal.priority].color}>
                          {priorityLabels[goal.priority].label}
                        </Badge>
                        {isOverdue ? (
                          <Badge className="bg-red-100 text-red-700">
                            <Icon name="AlertTriangle" size={12} className="mr-1" />
                            Просрочено на {Math.abs(daysLeft)} дн.
                          </Badge>
                        ) : (
                          <Badge variant="outline">
                            <Icon name="Calendar" size={12} className="mr-1" />
                            Осталось {daysLeft} дн.
                          </Badge>
                        )}
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedGoal(selectedGoal?.id === goal.id ? null : goal)}
                    >
                      <Icon name={selectedGoal?.id === goal.id ? 'ChevronUp' : 'ChevronDown'} size={20} />
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {renderGanttChart(goal)}

                  {goal.budget && (
                    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-green-900">Бюджет</span>
                        <span className="text-sm font-medium text-green-700">
                          {goal.currentSpending?.toLocaleString() || 0} / {goal.budget.toLocaleString()} ₽
                        </span>
                      </div>
                      <div className="h-2 bg-green-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-green-500 to-green-600 transition-all"
                          style={{ width: `${Math.min(((goal.currentSpending || 0) / goal.budget) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {selectedGoal?.id === goal.id && (
                    <div className="space-y-4 pt-4 border-t animate-fade-in">
                      <div>
                        <h4 className="font-semibold flex items-center gap-2 mb-3">
                          <Icon name="CheckSquare" size={18} />
                          Контрольные точки ({goal.checkpoints.filter(cp => cp.completed).length}/{goal.checkpoints.length})
                        </h4>
                        {goal.checkpoints.length > 0 ? (
                          <div className="space-y-2">
                            {goal.checkpoints.map((checkpoint) => (
                              <div 
                                key={checkpoint.id}
                                className={`p-3 rounded-lg border-2 transition-all ${
                                  checkpoint.completed 
                                    ? 'bg-green-50 border-green-300' 
                                    : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                                }`}
                              >
                                <div className="flex items-start gap-3">
                                  <button
                                    onClick={() => handleToggleCheckpoint(goal.id, checkpoint.id)}
                                    className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                                      checkpoint.completed 
                                        ? 'bg-green-500 border-green-500' 
                                        : 'border-gray-300 hover:border-green-500'
                                    }`}
                                  >
                                    {checkpoint.completed && (
                                      <Icon name="Check" size={14} className="text-white" />
                                    )}
                                  </button>
                                  <div className="flex-1">
                                    <h5 className={`font-medium ${checkpoint.completed ? 'line-through text-gray-500' : ''}`}>
                                      {checkpoint.title}
                                    </h5>
                                    <p className="text-xs text-gray-600 mt-1">{checkpoint.description}</p>
                                    <div className="flex items-center gap-2 mt-2 text-xs">
                                      <Badge variant="outline" className="text-xs">
                                        <Icon name="Calendar" size={10} className="mr-1" />
                                        {new Date(checkpoint.dueDate).toLocaleDateString('ru-RU')}
                                      </Badge>
                                      {checkpoint.completed && checkpoint.completedDate && (
                                        <Badge className="bg-green-100 text-green-700 text-xs">
                                          <Icon name="CheckCircle2" size={10} className="mr-1" />
                                          Выполнено {new Date(checkpoint.completedDate).toLocaleDateString('ru-RU')}
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500 text-center py-4">
                            Контрольные точки пока не добавлены
                          </p>
                        )}
                      </div>

                      <div>
                        <h4 className="font-semibold flex items-center gap-2 mb-3">
                          <Icon name="Lightbulb" size={18} />
                          Подсказки от ИИ
                        </h4>
                        <div className="space-y-2">
                          {goal.aiSuggestions.map((suggestion) => {
                            const suggestionStyles = {
                              tip: { bg: 'bg-blue-50', border: 'border-blue-200', icon: 'Lightbulb', iconColor: 'text-blue-600' },
                              warning: { bg: 'bg-yellow-50', border: 'border-yellow-200', icon: 'AlertTriangle', iconColor: 'text-yellow-600' },
                              recommendation: { bg: 'bg-purple-50', border: 'border-purple-200', icon: 'Sparkles', iconColor: 'text-purple-600' }
                            };
                            const style = suggestionStyles[suggestion.type];
                            
                            return (
                              <div 
                                key={suggestion.id}
                                className={`p-3 rounded-lg border-2 ${style.bg} ${style.border}`}
                              >
                                <div className="flex items-start gap-3">
                                  <Icon name={style.icon} size={18} className={style.iconColor} />
                                  <div className="flex-1">
                                    <h5 className="font-medium text-sm">{suggestion.title}</h5>
                                    <p className="text-xs text-gray-700 mt-1">{suggestion.content}</p>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold flex items-center gap-2 mb-3">
                          <Icon name="Users" size={18} />
                          Участники
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {goal.assignedMembers.map(memberId => {
                            const member = familyMembers.find(m => m.id === memberId);
                            return member ? (
                              <div key={member.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border">
                                <span className="text-lg">{member.avatar}</span>
                                <span className="text-sm font-medium">{member.name}</span>
                              </div>
                            ) : null;
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
