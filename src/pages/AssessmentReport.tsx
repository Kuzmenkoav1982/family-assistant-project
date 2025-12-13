import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import Icon from '@/components/ui/icon';
import Footer from '@/components/Footer';

interface CategoryAnalysis {
  category: string;
  score: number;
  status: string;
  comment: string;
}

interface Recommendation {
  category: string;
  tasks: string[];
}

interface Analysis {
  overall_score: number;
  categories_analysis: CategoryAnalysis[];
  strengths: string[];
  areas_to_improve: string[];
  recommendations: Recommendation[];
  summary: string;
}

interface Task {
  id: number;
  category: string;
  task_description: string;
  completed: boolean;
}

interface Plan {
  id: number;
  plan_data: Analysis;
  progress: number;
  status: string;
  tasks: Task[];
  created_at: string;
}

export default function AssessmentReport() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const assessmentId = searchParams.get('assessmentId');
  const planId = searchParams.get('planId');
  const childId = searchParams.get('childId');
  const returnMode = searchParams.get('returnMode') || 'parent';

  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!planId) {
      setError('План развития не найден');
      setLoading(false);
      return;
    }

    fetchPlan();
  }, [planId]);

  const fetchPlan = async () => {
    try {
      const response = await fetch(
        `https://functions.poehali.dev/fd083606-2bb4-436f-a07c-9daf165735a6?plan_id=${planId}`
      );

      if (!response.ok) {
        throw new Error('Не удалось загрузить план');
      }

      const data = await response.json();
      setPlan(data);
    } catch (err) {
      setError('Ошибка загрузки отчёта');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskToggle = async (taskId: number, completed: boolean) => {
    if (!plan) return;

    try {
      const response = await fetch(
        'https://functions.poehali.dev/fd083606-2bb4-436f-a07c-9daf165735a6',
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            task_id: taskId,
            plan_id: plan.id,
            completed,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Не удалось обновить задачу');
      }

      const result = await response.json();
      
      setPlan({
        ...plan,
        progress: result.progress,
        status: result.progress === 100 ? 'completed' : 'active',
        tasks: plan.tasks.map(t =>
          t.id === taskId ? { ...t, completed } : t
        ),
      });
    } catch (err) {
      console.error('Ошибка обновления задачи:', err);
    }
  };

  const getStatusColor = (status: string) => {
    if (status.includes('отлично')) return 'bg-green-100 text-green-700';
    if (status.includes('хорошо')) return 'bg-blue-100 text-blue-700';
    if (status.includes('норма')) return 'bg-yellow-100 text-yellow-700';
    return 'bg-gray-100 text-gray-700';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto p-6 space-y-6">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto p-6">
          <Alert variant="destructive">
            <AlertDescription>{error || 'План не найден'}</AlertDescription>
          </Alert>
          <Button onClick={() => navigate(`/children${childId ? `?childId=${childId}&mode=${returnMode}` : ''}`)} className="mt-4">
            Вернуться к детям
          </Button>
        </div>
      </div>
    );
  }

  const analysis = plan.plan_data;
  const tasksByCategory = plan.tasks.reduce((acc, task) => {
    if (!acc[task.category]) acc[task.category] = [];
    acc[task.category].push(task);
    return acc;
  }, {} as Record<string, Task[]>);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Button
              variant="ghost"
              onClick={() => navigate(`/children?childId=${childId}&mode=${returnMode}`)}
              className="mb-4"
            >
              <Icon name="ArrowLeft" size={18} className="mr-2" />
              Вернуться к профилю
            </Button>
            <h1 className="text-3xl font-bold">Отчёт оценки развития</h1>
            <p className="text-gray-600 mt-1">
              Создан: {new Date(plan.created_at).toLocaleDateString('ru-RU')}
            </p>
          </div>
          <Badge
            variant="outline"
            className={plan.status === 'completed' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-blue-50 text-blue-700 border-blue-200'}
          >
            {plan.status === 'completed' ? 'Завершён' : 'Активный'}
          </Badge>
        </div>

        <Card className="bg-gradient-to-r from-purple-500 to-pink-600 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-5xl font-bold mb-2">{analysis.overall_score}%</h2>
                <p className="text-lg opacity-90">Общий уровень развития</p>
              </div>
              <div className="text-right">
                <div className="text-6xl mb-2">🎯</div>
                <p className="text-sm opacity-75">План выполнен на {plan.progress}%</p>
              </div>
            </div>
            <Progress value={plan.progress} className="mt-6 h-3 bg-white/20" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="TrendingUp" size={24} className="text-green-600" />
              Сильные стороны
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-3">
              {analysis.strengths.map((strength, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <Icon name="CheckCircle" size={20} className="text-green-600 shrink-0" />
                  <span className="text-sm">{strength}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          {analysis.categories_analysis.map((cat, idx) => (
            <Card key={idx}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{cat.category}</CardTitle>
                  <Badge variant="outline" className={getStatusColor(cat.status)}>
                    {cat.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-bold">{cat.score}%</span>
                  </div>
                  <Progress value={cat.score} className="h-2" />
                  <p className="text-sm text-gray-600">{cat.comment}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Target" size={24} className="text-orange-600" />
              Зоны роста
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-3">
              {analysis.areas_to_improve.map((area, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                  <Icon name="AlertCircle" size={20} className="text-orange-600 shrink-0" />
                  <span className="text-sm">{area}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="ListChecks" size={24} className="text-blue-600" />
              План развития
            </CardTitle>
            <p className="text-sm text-gray-600 mt-2">{analysis.summary}</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {Object.entries(tasksByCategory).map(([category, tasks]) => (
                <div key={category}>
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <Icon name="FolderOpen" size={20} className="text-primary" />
                    {category}
                  </h3>
                  <div className="space-y-2 ml-7">
                    {tasks.map((task) => (
                      <div
                        key={task.id}
                        className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Checkbox
                          id={`task-${task.id}`}
                          checked={task.completed}
                          onCheckedChange={(checked) =>
                            handleTaskToggle(task.id, checked as boolean)
                          }
                          className="mt-1"
                        />
                        <label
                          htmlFor={`task-${task.id}`}
                          className={`text-sm cursor-pointer flex-1 ${
                            task.completed ? 'line-through text-gray-400' : ''
                          }`}
                        >
                          {task.task_description}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {plan.status === 'completed' && (
          <Alert className="bg-green-50 border-green-200">
            <Icon name="PartyPopper" size={20} className="text-green-600" />
            <AlertDescription className="text-green-800 font-medium">
              Поздравляем! План развития полностью выполнен! 🎉
            </AlertDescription>
          </Alert>
        )}
      </div>

      <Footer />
    </div>
  );
}