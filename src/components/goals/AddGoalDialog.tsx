import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import type { FamilyGoal, FamilyMember } from '@/types/family.types';

interface AddGoalDialogProps {
  familyMembers: FamilyMember[];
  currentUserId: string;
  onAddGoal?: (goal: Omit<FamilyGoal, 'id' | 'createdAt'>) => void;
}

export function AddGoalDialog({ familyMembers, currentUserId, onAddGoal }: AddGoalDialogProps) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newGoalData, setNewGoalData] = useState({
    title: '',
    description: '',
    category: 'other' as FamilyGoal['category'],
    priority: 'medium' as FamilyGoal['priority'],
    targetDate: '',
    budget: ''
  });

  const categoryLabels: Record<FamilyGoal['category'], { label: string }> = {
    financial: { label: 'Финансы' },
    health: { label: 'Здоровье' },
    education: { label: 'Образование' },
    travel: { label: 'Путешествия' },
    home: { label: 'Дом' },
    relationship: { label: 'Отношения' },
    other: { label: 'Другое' }
  };

  const priorityLabels: Record<FamilyGoal['priority'], { label: string }> = {
    low: { label: 'Низкий' },
    medium: { label: 'Средний' },
    high: { label: 'Высокий' },
    critical: { label: 'Критичный' }
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

  return (
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
  );
}
