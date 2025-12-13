import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import Icon from '@/components/ui/icon';
import type { FamilyMember } from '@/types/family.types';

interface AssessmentsArchiveProps {
  child: FamilyMember;
  onPlanDeleted?: () => void;
}

interface Plan {
  id: number;
  progress: number;
  status: string;
  created_at: string;
  completed_at: string | null;
  plan_data: {
    overall_score: number;
  };
}

export function AssessmentsArchive({ child, onPlanDeleted }: AssessmentsArchiveProps) {
  const navigate = useNavigate();
  const [archivedPlans, setArchivedPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    fetchArchivedPlans();
  }, [child.id]);

  const fetchArchivedPlans = async () => {
    try {
      const response = await fetch(
        `https://functions.poehali.dev/fd083606-2bb4-436f-a07c-9daf165735a6?child_id=${child.id}&status=completed`
      );

      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          setArchivedPlans(data);
        }
      }
    } catch (err) {
      console.error('Ошибка загрузки архива:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (planId: number) => {
    if (!confirm('Удалить этот план из архива? Это действие нельзя отменить.')) {
      return;
    }

    setDeletingId(planId);
    try {
      const response = await fetch(
        `https://functions.poehali.dev/fd083606-2bb4-436f-a07c-9daf165735a6?plan_id=${planId}`,
        { method: 'DELETE' }
      );

      if (response.ok) {
        setArchivedPlans(plans => plans.filter(p => p.id !== planId));
        onPlanDeleted?.();
      } else {
        alert('Ошибка удаления плана');
      }
    } catch (err) {
      console.error('Ошибка удаления:', err);
      alert('Ошибка удаления плана');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (archivedPlans.length === 0) {
    return null;
  }

  const progressData = archivedPlans.map(plan => ({
    date: new Date(plan.created_at).toLocaleDateString('ru-RU', { month: 'short', day: 'numeric' }),
    score: plan.plan_data.overall_score,
  }));

  const maxScore = Math.max(...progressData.map(d => d.score));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="Archive" size={24} className="text-gray-600" />
          Архив оценок развития
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative h-32 border rounded-lg p-4 bg-gray-50">
          <div className="flex items-end justify-between h-full gap-2">
            {progressData.map((point, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center">
                <div className="relative w-full">
                  <div
                    className="bg-primary rounded-t transition-all"
                    style={{
                      height: `${(point.score / maxScore) * 80}px`,
                    }}
                  />
                </div>
                <span className="text-xs text-gray-600 mt-1">{point.date}</span>
                <span className="text-xs font-semibold text-primary">{point.score}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          {archivedPlans.map((plan) => (
            <div
              key={plan.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Icon name="CheckCircle" size={20} className="text-green-600" />
                <div>
                  <p className="font-medium text-sm">
                    {new Date(plan.created_at).toLocaleDateString('ru-RU')}
                  </p>
                  <p className="text-xs text-gray-600">
                    Оценка: {plan.plan_data.overall_score}%
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    navigate(`/children/assessment-report?planId=${plan.id}&childId=${child.id}&returnMode=parent`)
                  }
                >
                  <Icon name="Eye" size={16} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(plan.id)}
                  disabled={deletingId === plan.id}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Icon name="Trash2" size={16} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}