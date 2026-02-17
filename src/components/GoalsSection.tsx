import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import type { FamilyGoal, FamilyMember } from '@/types/family.types';
import { AddGoalDialog } from './goals/AddGoalDialog';
import { GoalCard } from './goals/GoalCard';

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
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [showAddCheckpointDialog, setShowAddCheckpointDialog] = useState(false);
  const [selectedGoalForCheckpoint, setSelectedGoalForCheckpoint] = useState<string | null>(null);
  const [newCheckpointData, setNewCheckpointData] = useState({
    title: '',
    description: '',
    dueDate: ''
  });

  const handleToggleCheckpoint = (goalId: string, checkpointId: string) => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;

    const updatedCheckpoints = (goal.checkpoints || []).map(cp => 
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

  const handleAddCheckpoint = () => {
    if (!selectedGoalForCheckpoint || !newCheckpointData.title || !newCheckpointData.dueDate) return;

    const goal = goals.find(g => g.id === selectedGoalForCheckpoint);
    if (!goal) return;

    const newCheckpoint = {
      id: `cp${Date.now()}`,
      title: newCheckpointData.title,
      description: newCheckpointData.description,
      dueDate: newCheckpointData.dueDate,
      completed: false
    };

    const updatedCheckpoints = [...(goal.checkpoints || []), newCheckpoint];
    onUpdateGoal?.(selectedGoalForCheckpoint, { checkpoints: updatedCheckpoints });

    setNewCheckpointData({ title: '', description: '', dueDate: '' });
    setShowAddCheckpointDialog(false);
    setSelectedGoalForCheckpoint(null);
  };

  const handleAddCheckpointClick = (goalId: string) => {
    setSelectedGoalForCheckpoint(goalId);
    setShowAddCheckpointDialog(true);
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
        
        <AddGoalDialog
          familyMembers={familyMembers}
          currentUserId={currentUserId}
          onAddGoal={onAddGoal}
        />
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
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {goals.map((goal, idx) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              idx={idx}
              selectedGoalId={selectedGoalId}
              onSelectGoal={setSelectedGoalId}
              onUpdateGoal={onUpdateGoal}
              onDeleteGoal={onDeleteGoal}
              onToggleCheckpoint={handleToggleCheckpoint}
              onAddCheckpoint={handleAddCheckpointClick}
            />
          ))}
        </div>
      )}

      <Dialog open={showAddCheckpointDialog} onOpenChange={setShowAddCheckpointDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Добавить контрольную точку</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Название *</label>
              <Input
                value={newCheckpointData.title}
                onChange={(e) => setNewCheckpointData({ ...newCheckpointData, title: e.target.value })}
                placeholder="Например: Собрать 30% от суммы"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Описание</label>
              <Textarea
                value={newCheckpointData.description}
                onChange={(e) => setNewCheckpointData({ ...newCheckpointData, description: e.target.value })}
                placeholder="Подробности..."
                rows={2}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Срок выполнения *</label>
              <Input
                type="date"
                value={newCheckpointData.dueDate}
                onChange={(e) => setNewCheckpointData({ ...newCheckpointData, dueDate: e.target.value })}
              />
            </div>
            <Button onClick={handleAddCheckpoint} className="w-full">
              Добавить контрольную точку
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}