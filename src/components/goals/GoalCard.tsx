import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import type { FamilyGoal } from '@/types/family.types';
import { GanttChart } from './GanttChart';

interface GoalCardProps {
  goal: FamilyGoal;
  idx: number;
  selectedGoalId: string | null;
  onSelectGoal: (goalId: string | null) => void;
  onUpdateGoal?: (goalId: string, updates: Partial<FamilyGoal>) => void;
  onDeleteGoal?: (goalId: string) => void;
  onToggleCheckpoint: (goalId: string, checkpointId: string) => void;
  onAddCheckpoint: (goalId: string) => void;
}

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

export function GoalCard({ 
  goal, 
  idx, 
  selectedGoalId, 
  onSelectGoal, 
  onUpdateGoal, 
  onDeleteGoal,
  onToggleCheckpoint,
  onAddCheckpoint
}: GoalCardProps) {
  const defaultCategory = { label: 'Другое', icon: 'Star', color: 'bg-gray-100 text-gray-700 border-gray-300' };
  const defaultPriority = { label: 'Средний', color: 'bg-blue-100 text-blue-600' };
  const defaultStatus = { label: 'Планирование', color: 'bg-gray-100 text-gray-700', icon: 'FileText' };

  const categoryInfo = (goal.category && categoryLabels[goal.category as keyof typeof categoryLabels]) || defaultCategory;
  const priorityInfo = (goal.priority && priorityLabels[goal.priority as keyof typeof priorityLabels]) || defaultPriority;
  const statusInfo = (goal.status && statusLabels[goal.status as keyof typeof statusLabels]) || defaultStatus;
  
  const calculateDaysLeft = (targetDate: string) => {
    const now = new Date();
    const target = new Date(targetDate);
    const diff = target.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const targetDate = goal.targetDate || goal.deadline || '';
  const daysLeft = targetDate ? calculateDaysLeft(targetDate) : 0;
  const isOverdue = daysLeft < 0 && (goal.status || 'planning') !== 'completed';
  const isExpanded = selectedGoalId === goal.id;

  return (
    <Card 
      className={`animate-fade-in hover:shadow-lg transition-all ${
        isExpanded ? 'ring-2 ring-blue-500' : ''
      }`}
      style={{ animationDelay: `${idx * 0.1}s` }}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <CardTitle className="text-xl">{goal.title}</CardTitle>
              <Badge className={statusInfo.color}>
                <Icon name={statusInfo.icon} size={12} className="mr-1" />
                {statusInfo.label}
              </Badge>
            </div>
            <p className="text-sm text-gray-600">{goal.description}</p>
            
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <Badge variant="outline" className={categoryInfo.color}>
                <Icon name={categoryInfo.icon} size={12} className="mr-1" />
                {categoryInfo.label}
              </Badge>
              <Badge className={priorityInfo.color}>
                {priorityInfo.label}
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

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (window.confirm('Удалить эту цель?')) {
                  onDeleteGoal?.(goal.id);
                }
              }}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
              title="Удалить цель"
            >
              <Icon name="Trash2" size={16} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSelectGoal(isExpanded ? null : goal.id)}
            >
              <Icon name={isExpanded ? 'ChevronUp' : 'ChevronDown'} size={20} />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <GanttChart goal={goal} />

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

        {isExpanded && (
          <div className="space-y-4 pt-4 border-t animate-fade-in">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <Icon name="Settings" size={18} />
                Управление целью
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Статус</label>
                  <select
                    value={goal.status}
                    onChange={(e) => onUpdateGoal?.(goal.id, { status: e.target.value as FamilyGoal['status'] })}
                    className="w-full p-2 border rounded-md text-sm"
                  >
                    {Object.entries(statusLabels).map(([key, { label }]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Прогресс: {goal.progress}%</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={goal.progress}
                    onChange={(e) => onUpdateGoal?.(goal.id, { progress: parseInt(e.target.value) })}
                    className="w-full"
                  />
                </div>
              </div>
              {goal.budget && (
                <div>
                  <label className="text-sm font-medium mb-1 block">Текущие расходы: {goal.currentSpending?.toLocaleString() || 0} ₽</label>
                  <input
                    type="number"
                    value={goal.currentSpending || 0}
                    onChange={(e) => onUpdateGoal?.(goal.id, { currentSpending: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2 border rounded-md text-sm"
                    placeholder="Введите сумму расходов"
                  />
                </div>
              )}
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <Icon name="CheckSquare" size={18} />
                  Контрольные точки ({(goal.checkpoints || []).filter(cp => cp.completed).length}/{(goal.checkpoints || []).length})
                </h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onAddCheckpoint(goal.id)}
                >
                  <Icon name="Plus" size={14} className="mr-1" />
                  Добавить
                </Button>
              </div>
              {(goal.checkpoints || []).length > 0 ? (
                <div className="space-y-2">
                  {(goal.checkpoints || []).map((checkpoint) => (
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
                          onClick={() => onToggleCheckpoint(goal.id, checkpoint.id)}
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
                {(goal.aiSuggestions || []).map((suggestion) => {
                  const suggestionStyles = {
                    tip: { bg: 'bg-blue-50', border: 'border-blue-200', icon: 'Lightbulb', iconColor: 'text-blue-600' },
                    warning: { bg: 'bg-yellow-50', border: 'border-yellow-200', icon: 'AlertTriangle', iconColor: 'text-yellow-600' },
                    insight: { bg: 'bg-purple-50', border: 'border-purple-200', icon: 'Sparkles', iconColor: 'text-purple-600' }
                  };
                  const style = suggestionStyles[suggestion.type];
                  
                  return (
                    <div key={suggestion.id} className={`p-3 rounded-lg border ${style.bg} ${style.border}`}>
                      <div className="flex gap-2">
                        <Icon name={style.icon} size={16} className={`mt-0.5 ${style.iconColor}`} />
                        <div className="flex-1">
                          <h5 className="text-sm font-medium mb-1">{suggestion.title}</h5>
                          <p className="text-xs text-gray-700">{suggestion.content}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}