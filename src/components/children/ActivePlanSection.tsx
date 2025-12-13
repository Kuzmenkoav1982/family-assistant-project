import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import Icon from '@/components/ui/icon';
import type { FamilyMember } from '@/types/family.types';

interface ActivePlanSectionProps {
  child: FamilyMember;
  onPlanDeleted?: () => void;
}

interface Plan {
  id: number;
  progress: number;
  status: string;
  created_at: string;
  plan_data: {
    overall_score: number;
    summary: string;
  };
  tasks: Array<{
    id: number;
    completed: boolean;
  }>;
}

export function ActivePlanSection({ child, onPlanDeleted }: ActivePlanSectionProps) {
  const navigate = useNavigate();
  const [activePlan, setActivePlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchActivePlan();
  }, [child.id]);

  const fetchActivePlan = async () => {
    try {
      const response = await fetch(
        `https://functions.poehali.dev/fd083606-2bb4-436f-a07c-9daf165735a6?child_id=${child.id}&status=active`
      );

      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          setActivePlan(data[0]);
        }
      }
    } catch (err) {
      console.error('Ошибка загрузки плана:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!activePlan || !confirm('Удалить этот план развития? Это действие нельзя отменить.')) {
      return;
    }

    setDeleting(true);
    try {
      const response = await fetch(
        `https://functions.poehali.dev/fd083606-2bb4-436f-a07c-9daf165735a6?plan_id=${activePlan.id}`,
        { method: 'DELETE' }
      );

      if (response.ok) {
        setActivePlan(null);
        onPlanDeleted?.();
      } else {
        alert('Ошибка удаления плана');
      }
    } catch (err) {
      console.error('Ошибка удаления:', err);
      alert('Ошибка удаления плана');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!activePlan) {
    return null;
  }

  const completedTasks = activePlan.tasks.filter(t => t.completed).length;
  const totalTasks = activePlan.tasks.length;

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Icon name="Target" size={24} className="text-primary" />
            Активный план развития
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              {activePlan.progress}% выполнено
            </Badge>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDelete}
              disabled={deleting}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Icon name="Trash2" size={18} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl font-bold text-primary">
              {activePlan.plan_data.overall_score}%
            </span>
            <span className="text-sm text-gray-600">
              {completedTasks} из {totalTasks} задач
            </span>
          </div>
          <Progress value={activePlan.progress} className="h-3 mb-3" />
          <p className="text-sm text-gray-700 mb-3">
            {activePlan.plan_data.summary}
          </p>
          <Button
            onClick={() =>
              navigate(
                `/children/assessment-report?planId=${activePlan.id}&childId=${child.id}&returnMode=parent`
              )
            }
            className="w-full"
          >
            Открыть план
            <Icon name="ArrowRight" size={18} className="ml-2" />
          </Button>
        </div>

        <p className="text-xs text-gray-500">
          Создан: {new Date(activePlan.created_at).toLocaleDateString('ru-RU')}
        </p>
      </CardContent>
    </Card>
  );
}