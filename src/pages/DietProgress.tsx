import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

const API_URL = 'https://functions.poehali.dev/41c5c664-7ded-4c89-8820-7af2dac89d54';
const SYNC_API = 'https://functions.poehali.dev/c94d9639-d8fc-4838-a865-1c01c18f3f25';

interface WeightEntry {
  weight_kg: number;
  wellbeing: string;
  measured_at: string;
}

interface TodayMeal {
  id: number;
  day_number: number;
  meal_type: string;
  time: string;
  title: string;
  calories: number;
  protein: number;
  fats: number;
  carbs: number;
  completed: boolean;
  image_url: string | null;
  recipe: string;
}

interface DashboardStats {
  days_elapsed: number;
  days_remaining: number;
  completed_meals: number;
  total_meals: number;
  adherence_pct: number;
  weight_lost: number;
  start_weight: number | null;
  last_weight: number | null;
  days_since_log: number;
}

interface DashboardPlan {
  id: number;
  plan_type: string;
  start_date: string;
  end_date: string;
  duration_days: number;
  target_weight_loss_kg: number | null;
  target_calories_daily: number;
  status: string;
  daily_water_ml: number | null;
  daily_steps: number | null;
  exercise_recommendation: string | null;
}

interface DashboardData {
  has_plan: boolean;
  plan: DashboardPlan | null;
  weight_log: WeightEntry[];
  today_meals: TodayMeal[];
  stats: DashboardStats | null;
}

const mealTypeLabels: Record<string, string> = {
  breakfast: 'Завтрак', lunch: 'Обед', dinner: 'Ужин', snack: 'Перекус',
};

const mealTypeIcons: Record<string, string> = {
  breakfast: '🌅', lunch: '☀️', dinner: '🌙', snack: '🍎',
};

const sosReasons = [
  { id: 'strong_hunger', label: 'Сильный голод', icon: '🍔' },
  { id: 'weakness', label: 'Упадок сил', icon: '😵' },
  { id: 'psychological', label: 'Психологически тяжело', icon: '😔' },
  { id: 'want_to_quit', label: 'Хочу бросить', icon: '🏳️' },
];

export default function DietProgress() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardData | null>(null);

  const [showWeightForm, setShowWeightForm] = useState(false);
  const [newWeight, setNewWeight] = useState('');
  const [wellbeing, setWellbeing] = useState('');
  const [savingWeight, setSavingWeight] = useState(false);

  const [showSOS, setShowSOS] = useState(false);
  const [sosComment, setSosComment] = useState('');
  const [sosResponse, setSosResponse] = useState<string | null>(null);
  const [sendingSOS, setSendingSOS] = useState(false);

  const [motivation, setMotivation] = useState<string | null>(null);
  const [loadingMotivation, setLoadingMotivation] = useState(false);

  const [markingMeal, setMarkingMeal] = useState<number | null>(null);
  const [mealMenu, setMealMenu] = useState<number | null>(null);

  const [analysis, setAnalysis] = useState<{
    has_analysis: boolean;
    recommendation: string;
    cal_adjustment: number;
    new_calories: number;
    current_calories: number;
    reason: string;
    advice: string;
    actual_loss_kg: number;
    expected_loss_kg: number;
    weekly_loss_kg: number;
    plan_id: number;
  } | null>(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [adjusting, setAdjusting] = useState(false);

  const authToken = localStorage.getItem('authToken') || '';

  const headers = {
    'Content-Type': 'application/json',
    'X-Auth-Token': authToken,
  };

  const fetchDashboard = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}?action=dashboard`, { headers: { 'X-Auth-Token': authToken } });
      const json = await res.json();
      setData(json);
    } catch (e) {
      console.error('[DietProgress] fetch error:', e);
    } finally {
      setLoading(false);
    }
  }, [authToken]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const handleLogWeight = async () => {
    if (!newWeight || !data?.plan) return;
    setSavingWeight(true);
    try {
      const res = await fetch(API_URL, {
        method: 'POST', headers,
        body: JSON.stringify({ action: 'log_weight', plan_id: data.plan.id, weight_kg: parseFloat(newWeight), wellbeing }),
      });
      const json = await res.json();
      if (json.success) {
        toast({ title: 'Вес записан!' });
        setShowWeightForm(false);
        setNewWeight('');
        setWellbeing('');
        fetchDashboard();
      }
    } catch { toast({ title: 'Ошибка', variant: 'destructive' }); }
    finally { setSavingWeight(false); }
  };

  const handleEatMeal = async (mealId: number) => {
    setMarkingMeal(mealId);
    try {
      const res = await fetch(SYNC_API, {
        method: 'POST', headers,
        body: JSON.stringify({ action: 'log_meal_bju', meal_id: mealId }),
      });
      const json = await res.json();
      if (json.success) {
        toast({ title: 'Записано!', description: json.message });
      }
      fetchDashboard();
    } catch { toast({ title: 'Ошибка', variant: 'destructive' }); }
    finally { setMarkingMeal(null); }
  };

  const handleUndoMeal = async (mealId: number) => {
    setMarkingMeal(mealId);
    try {
      await fetch(API_URL, {
        method: 'POST', headers,
        body: JSON.stringify({ action: 'mark_meal', meal_id: mealId, completed: false }),
      });
      fetchDashboard();
    } catch { toast({ title: 'Ошибка', variant: 'destructive' }); }
    finally { setMarkingMeal(null); }
  };

  const handleSaveRecipe = async (mealId: number) => {
    try {
      const res = await fetch(SYNC_API, {
        method: 'POST', headers,
        body: JSON.stringify({ action: 'save_recipe', meal_id: mealId }),
      });
      const json = await res.json();
      toast({ title: json.success ? 'Сохранено!' : 'Ошибка', description: json.message || json.error });
    } catch { toast({ title: 'Ошибка', variant: 'destructive' }); }
    setMealMenu(null);
  };

  const handleAddToShopping = async (mealIds: number[]) => {
    try {
      const res = await fetch(SYNC_API, {
        method: 'POST', headers,
        body: JSON.stringify({ action: 'add_to_shopping', meal_ids: mealIds }),
      });
      const json = await res.json();
      toast({ title: json.success ? 'Добавлено!' : 'Ошибка', description: json.message || json.error });
    } catch { toast({ title: 'Ошибка', variant: 'destructive' }); }
    setMealMenu(null);
  };

  const handleSOS = async (reason: string) => {
    if (!data?.plan) return;
    setSendingSOS(true);
    try {
      const res = await fetch(API_URL, {
        method: 'POST', headers,
        body: JSON.stringify({ action: 'sos', plan_id: data.plan.id, reason, comment: sosComment }),
      });
      const json = await res.json();
      setSosResponse(json.message);
    } catch { toast({ title: 'Ошибка', variant: 'destructive' }); }
    finally { setSendingSOS(false); }
  };

  const handleMotivation = async () => {
    setLoadingMotivation(true);
    try {
      const hour = new Date().getHours();
      const time = hour < 14 ? 'morning' : 'evening';
      const planId = data?.plan?.id;
      const res = await fetch(API_URL, {
        method: 'POST', headers,
        body: JSON.stringify({ action: 'motivation', plan_id: planId, time }),
      });
      const json = await res.json();
      setMotivation(json.message);
    } catch { toast({ title: 'Ошибка', variant: 'destructive' }); }
    finally { setLoadingMotivation(false); }
  };

  const handleAnalyze = async () => {
    setLoadingAnalysis(true);
    try {
      const res = await fetch(API_URL, {
        method: 'POST', headers,
        body: JSON.stringify({ action: 'analyze_progress', plan_id: data?.plan?.id }),
      });
      const json = await res.json();
      setAnalysis(json);
    } catch { toast({ title: 'Ошибка анализа', variant: 'destructive' }); }
    finally { setLoadingAnalysis(false); }
  };

  const handleAdjust = async () => {
    if (!analysis) return;
    setAdjusting(true);
    try {
      const res = await fetch(API_URL, {
        method: 'POST', headers,
        body: JSON.stringify({ action: 'adjust_plan', plan_id: analysis.plan_id, new_calories: analysis.new_calories }),
      });
      const json = await res.json();
      if (json.success) {
        toast({ title: 'План скорректирован!' });
        setAnalysis(null);
        fetchDashboard();
      }
    } catch { toast({ title: 'Ошибка', variant: 'destructive' }); }
    finally { setAdjusting(false); }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!data?.has_plan) {
    return (
      <div className="min-h-screen min-h-[100dvh] bg-gradient-to-b from-violet-50 via-white to-white pb-24" style={{ paddingBottom: 'calc(6rem + env(safe-area-inset-bottom, 0px))' }}>
        <div className="max-w-2xl mx-auto px-4 py-4 space-y-6" style={{ paddingTop: 'calc(1rem + env(safe-area-inset-top, 0px))' }}>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="shrink-0 h-9 w-9" onClick={() => navigate('/nutrition')}>
              <Icon name="ArrowLeft" size={18} />
            </Button>
            <h1 className="text-lg font-bold">Прогресс диеты</h1>
          </div>
          <Card className="border-2 border-dashed border-violet-200">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-violet-100 flex items-center justify-center">
                <Icon name="TrendingUp" size={32} className="text-violet-500" />
              </div>
              <h2 className="text-lg font-bold mb-2">Нет активного плана</h2>
              <p className="text-muted-foreground text-sm mb-4">
                Создайте план питания, чтобы отслеживать прогресс, получать мотивацию и контролировать вес.
              </p>
              <Button className="bg-gradient-to-r from-violet-500 to-purple-600" onClick={() => navigate('/nutrition/diet')}>
                <Icon name="Sparkles" size={16} className="mr-2" />
                Создать ИИ-диету
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const { plan, weight_log, today_meals, stats } = data;

  const weightChartData = weight_log.map(w => ({
    date: new Date(w.measured_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }),
    weight: w.weight_kg,
  }));

  const targetWeight = stats?.start_weight && plan?.target_weight_loss_kg
    ? stats.start_weight - plan.target_weight_loss_kg
    : null;

  const allWeights = [
    ...weightChartData.map(d => d.weight),
    ...(targetWeight ? [targetWeight] : []),
  ];
  const minW = allWeights.length > 0 ? Math.min(...allWeights) - 1 : 60;
  const maxW = allWeights.length > 0 ? Math.max(...allWeights) + 1 : 100;
  const range = maxW - minW || 1;

  return (
    <div className="min-h-screen min-h-[100dvh] bg-gradient-to-b from-violet-50 via-white to-white pb-24" style={{ paddingBottom: 'calc(6rem + env(safe-area-inset-bottom, 0px))' }}>
      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4" style={{ paddingTop: 'calc(1rem + env(safe-area-inset-top, 0px))' }}>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="shrink-0 h-9 w-9" onClick={() => navigate('/nutrition')}>
            <Icon name="ArrowLeft" size={18} />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold truncate">Прогресс диеты</h1>
            <p className="text-xs text-muted-foreground">
              День {stats?.days_elapsed || 0} из {plan?.duration_days || 0}
            </p>
          </div>
          <Button variant="outline" size="sm" className="shrink-0 border-red-200 text-red-600 hover:bg-red-50" onClick={() => setShowSOS(true)}>
            <Icon name="LifeBuoy" size={16} />
            <span className="hidden xs:inline ml-1">SOS</span>
          </Button>
        </div>

        {stats && stats.days_since_log >= 3 && (
          <Card className="border-amber-300 bg-amber-50">
            <CardContent className="p-3 flex items-center gap-3">
              <Icon name="AlertTriangle" size={20} className="text-amber-600 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-amber-900">Вы {stats.days_since_log} дн. не вносили вес</p>
                <p className="text-amber-700 text-xs">Без данных невозможно корректировать план</p>
              </div>
              <Button size="sm" variant="outline" className="ml-auto border-amber-300" onClick={() => setShowWeightForm(true)}>
                Внести
              </Button>
            </CardContent>
          </Card>
        )}

        {stats && (
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 overflow-hidden">
              <CardContent className="p-2.5 sm:p-3 text-center">
                <div className="text-xl sm:text-2xl font-bold text-green-700 truncate">
                  {stats.weight_lost > 0 ? `-${stats.weight_lost}` : stats.weight_lost} кг
                </div>
                <div className="text-[11px] sm:text-xs text-green-600">сброшено</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 overflow-hidden">
              <CardContent className="p-2.5 sm:p-3 text-center">
                <div className="text-xl sm:text-2xl font-bold text-blue-700 truncate">{stats.adherence_pct}%</div>
                <div className="text-[11px] sm:text-xs text-blue-600">план выполнен</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-violet-50 to-purple-50 border-violet-200 overflow-hidden">
              <CardContent className="p-2.5 sm:p-3 text-center">
                <div className="text-xl sm:text-2xl font-bold text-violet-700 truncate">{stats.last_weight || '—'}</div>
                <div className="text-[11px] sm:text-xs text-violet-600">текущий вес, кг</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200 overflow-hidden">
              <CardContent className="p-2.5 sm:p-3 text-center">
                <div className="text-xl sm:text-2xl font-bold text-amber-700 truncate">{stats.days_remaining}</div>
                <div className="text-[11px] sm:text-xs text-amber-600">дней осталось</div>
              </CardContent>
            </Card>
          </div>
        )}

        {stats && (
          <div className="overflow-hidden">
            <div className="flex items-center justify-between mb-1 px-0.5">
              <span className="text-xs text-muted-foreground">День {stats.days_elapsed}</span>
              <span className="text-xs text-muted-foreground">День {plan?.duration_days}</span>
            </div>
            <Progress value={Math.min(100, (stats.days_elapsed / (plan?.duration_days || 1)) * 100)} className="h-2" />
          </div>
        )}

        {stats && stats.days_elapsed >= 3 && (
          <Card className={`border-2 ${
            analysis?.recommendation === 'ease' ? 'border-amber-300 bg-amber-50/50' :
            analysis?.recommendation === 'intensify' ? 'border-blue-300 bg-blue-50/50' :
            analysis ? 'border-green-300 bg-green-50/50' : 'border-violet-200'
          }`}>
            <CardContent className="p-4">
              {!analysis ? (
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-sm flex items-center gap-2">
                      <Icon name="Activity" size={16} className="text-violet-600" />
                      Анализ прогресса
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Проверю темп и подскажу, нужна ли корректировка
                    </p>
                  </div>
                  <Button size="sm" onClick={handleAnalyze} disabled={loadingAnalysis} className="bg-violet-600">
                    {loadingAnalysis ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Icon name="BarChart3" size={14} className="mr-1" />
                        Анализ
                      </>
                    )}
                  </Button>
                </div>
              ) : !analysis.has_analysis ? (
                <p className="text-sm text-muted-foreground text-center py-2">{analysis.reason || 'Недостаточно данных'}</p>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Icon
                      name={analysis.recommendation === 'ease' ? 'TrendingDown' : analysis.recommendation === 'intensify' ? 'TrendingUp' : 'Check'}
                      size={20}
                      className={
                        analysis.recommendation === 'ease' ? 'text-amber-600' :
                        analysis.recommendation === 'intensify' ? 'text-blue-600' : 'text-green-600'
                      }
                    />
                    <h3 className="font-bold text-sm">{analysis.reason}</h3>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 rounded-lg bg-white/80">
                      <div className="text-sm font-bold">{analysis.actual_loss_kg} кг</div>
                      <div className="text-[10px] text-muted-foreground">фактически</div>
                    </div>
                    <div className="p-2 rounded-lg bg-white/80">
                      <div className="text-sm font-bold">{analysis.expected_loss_kg} кг</div>
                      <div className="text-[10px] text-muted-foreground">ожидалось</div>
                    </div>
                    <div className="p-2 rounded-lg bg-white/80">
                      <div className="text-sm font-bold">{analysis.weekly_loss_kg} кг</div>
                      <div className="text-[10px] text-muted-foreground">в неделю</div>
                    </div>
                  </div>

                  <p className="text-sm">{analysis.advice}</p>

                  {analysis.cal_adjustment !== 0 && (
                    <div className="flex items-center justify-between p-3 rounded-lg bg-white/80 border">
                      <div>
                        <p className="text-xs text-muted-foreground">Калории: {analysis.current_calories} kcal</p>
                        <p className="text-sm font-bold">
                          {analysis.cal_adjustment > 0 ? '+' : ''}{analysis.cal_adjustment} kcal = {analysis.new_calories} kcal/день
                        </p>
                      </div>
                      <Button size="sm" onClick={handleAdjust} disabled={adjusting}
                        className={analysis.recommendation === 'ease' ? 'bg-amber-600' : 'bg-blue-600'}
                      >
                        {adjusting ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          'Применить'
                        )}
                      </Button>
                    </div>
                  )}

                  <Button size="sm" variant="ghost" className="w-full text-xs" onClick={() => setAnalysis(null)}>
                    Скрыть
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold flex items-center gap-2">
                <Icon name="TrendingDown" size={18} className="text-green-600" />
                График веса
              </h3>
              <Button size="sm" variant="outline" onClick={() => setShowWeightForm(true)}>
                <Icon name="Plus" size={14} className="mr-1" />
                Записать вес
              </Button>
            </div>

            {weightChartData.length < 2 ? (
              <div className="text-center py-6 text-muted-foreground text-sm">
                <Icon name="BarChart3" size={32} className="mx-auto mb-2 opacity-30" />
                Нужно минимум 2 записи для графика
              </div>
            ) : (
              <div className="overflow-x-auto -mx-4 px-4">
                <div style={{ minWidth: Math.max(weightChartData.length * 70, 200) }} className="relative h-44">
                  <svg
                    viewBox={`0 0 ${Math.max(weightChartData.length * 70, 200)} 176`}
                    className="w-full h-full"
                    preserveAspectRatio="xMidYMid meet"
                  >
                    <defs>
                      <linearGradient id="weightLine" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="rgb(139, 92, 246)" />
                        <stop offset="100%" stopColor="rgb(124, 58, 237)" />
                      </linearGradient>
                    </defs>
                    {targetWeight && (
                      <>
                        <line
                          x1="0"
                          y1={140 - ((targetWeight - minW) / range) * 110}
                          x2={Math.max(weightChartData.length * 70, 200)}
                          y2={140 - ((targetWeight - minW) / range) * 110}
                          stroke="rgb(34, 197, 94)"
                          strokeWidth="1.5"
                          strokeDasharray="6 4"
                          opacity="0.7"
                        />
                        <text
                          x={Math.max(weightChartData.length * 70, 200) - 5}
                          y={140 - ((targetWeight - minW) / range) * 110 - 6}
                          textAnchor="end"
                          fontSize="10"
                          fontWeight="500"
                          fill="rgb(22, 163, 74)"
                        >
                          Цель: {targetWeight} кг
                        </text>
                      </>
                    )}
                    <polyline
                      fill="none"
                      stroke="url(#weightLine)"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      points={weightChartData.map((d, i) => `${i * 70 + 35},${140 - ((d.weight - minW) / range) * 110}`).join(' ')}
                    />
                    {weightChartData.map((d, i) => {
                      const cx = i * 70 + 35;
                      const cy = 140 - ((d.weight - minW) / range) * 110;
                      return (
                        <g key={i}>
                          <circle cx={cx} cy={cy} r="6" fill="white" stroke="rgb(124, 58, 237)" strokeWidth="2.5" />
                          <circle cx={cx} cy={cy} r="2.5" fill="rgb(124, 58, 237)" />
                          <text x={cx} y={cy - 14} textAnchor="middle" fontSize="12" fontWeight="600" fill="#4b5563">{d.weight}</text>
                          <text x={cx} y={168} textAnchor="middle" fontSize="11" fill="#9ca3af">{d.date}</text>
                        </g>
                      );
                    })}
                  </svg>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {showWeightForm && (
          <Card className="border-violet-300 bg-violet-50/50">
            <CardContent className="p-4 space-y-3">
              <h3 className="font-bold flex items-center gap-2">
                <Icon name="Scale" size={18} className="text-violet-600" />
                Записать вес
              </h3>
              <div>
                <Label>Вес (кг)</Label>
                <Input type="number" step="0.1" placeholder="75.5" value={newWeight} onChange={e => setNewWeight(e.target.value)} />
              </div>
              <div>
                <Label>Самочувствие (необязательно)</Label>
                <Textarea placeholder="Как себя чувствуете?" value={wellbeing} onChange={e => setWellbeing(e.target.value)} rows={2} />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleLogWeight} disabled={!newWeight || savingWeight} className="bg-violet-600">
                  {savingWeight ? 'Сохраняю...' : 'Сохранить'}
                </Button>
                <Button variant="outline" onClick={() => setShowWeightForm(false)}>Отмена</Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold flex items-center gap-2">
                <Icon name="Sparkles" size={18} className="text-amber-500" />
                Мотивация
              </h3>
              <Button size="sm" variant="ghost" onClick={handleMotivation} disabled={loadingMotivation}>
                {loadingMotivation ? (
                  <div className="w-4 h-4 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Icon name="RefreshCw" size={14} />
                )}
              </Button>
            </div>
            {motivation ? (
              <div className="p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200">
                <p className="text-sm leading-relaxed">{motivation}</p>
              </div>
            ) : (
              <Button variant="outline" className="w-full" onClick={handleMotivation} disabled={loadingMotivation}>
                <Icon name="Sparkles" size={16} className="mr-2" />
                {loadingMotivation ? 'Генерирую...' : 'Получить мотивацию от ИИ'}
              </Button>
            )}
          </CardContent>
        </Card>

        {today_meals && today_meals.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold flex items-center gap-2">
                  <Icon name="UtensilsCrossed" size={18} className="text-green-600" />
                  Сегодня
                </h3>
                <Button size="sm" variant="outline" className="text-xs h-7 shrink-0"
                  onClick={() => handleAddToShopping(today_meals.filter(m => !m.completed).map(m => m.id))}>
                  <Icon name="ShoppingCart" size={12} className="mr-1" />
                  <span className="hidden sm:inline">Всё в </span>покупки
                </Button>
              </div>
              <div className="space-y-2">
                {today_meals.map(meal => (
                  <div key={meal.id} className="space-y-1">
                    <div
                      className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                        meal.completed ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
                      }`}
                    >
                      <div className="text-xl flex-shrink-0">{mealTypeIcons[meal.meal_type] || '🍽'}</div>
                      <div className="flex-1 min-w-0" onClick={() => setMealMenu(mealMenu === meal.id ? null : meal.id)}>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">{meal.time}</span>
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                            {mealTypeLabels[meal.meal_type] || meal.meal_type}
                          </Badge>
                        </div>
                        <p className={`text-sm font-medium truncate ${meal.completed ? 'line-through text-muted-foreground' : ''}`}>
                          {meal.title}
                        </p>
                        <p className="text-xs text-muted-foreground">{meal.calories} ккал | Б:{meal.protein} Ж:{meal.fats} У:{meal.carbs}</p>
                      </div>
                      {meal.completed ? (
                        <Button size="sm" variant="outline" className="bg-green-100 border-green-300 text-green-700"
                          disabled={markingMeal === meal.id} onClick={() => handleUndoMeal(meal.id)}>
                          {markingMeal === meal.id ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <Icon name="Check" size={14} />}
                        </Button>
                      ) : (
                        <Button size="sm" className="bg-green-600" disabled={markingMeal === meal.id} onClick={() => handleEatMeal(meal.id)}>
                          {markingMeal === meal.id ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <>
                            <Icon name="UtensilsCrossed" size={14} className="mr-1" />
                            <span className="text-xs">Съел</span>
                          </>}
                        </Button>
                      )}
                    </div>
                    {mealMenu === meal.id && (
                      <div className="flex gap-1 pl-10">
                        <Button size="sm" variant="ghost" className="text-xs h-7 px-2" onClick={() => handleSaveRecipe(meal.id)}>
                          <Icon name="BookOpen" size={12} className="mr-1" />
                          В рецепты
                        </Button>
                        <Button size="sm" variant="ghost" className="text-xs h-7 px-2" onClick={() => handleAddToShopping([meal.id])}>
                          <Icon name="ShoppingCart" size={12} className="mr-1" />
                          В покупки
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {plan?.exercise_recommendation && (
          <Card className="bg-blue-50/50 border-blue-200">
            <CardContent className="p-4">
              <h3 className="font-bold mb-2 flex items-center gap-2 text-blue-900">
                <Icon name="Footprints" size={18} className="text-blue-600" />
                Рекомендации
              </h3>
              <p className="text-sm text-blue-800">{plan.exercise_recommendation}</p>
              {plan.daily_steps && (
                <div className="mt-2 flex items-center gap-2 text-sm text-blue-700">
                  <Icon name="Footprints" size={14} />
                  <span>{plan.daily_steps.toLocaleString()} шагов/день</span>
                </div>
              )}
              {plan.daily_water_ml && (
                <div className="mt-1 flex items-center gap-2 text-sm text-blue-700">
                  <Icon name="Droplets" size={14} />
                  <span>{(plan.daily_water_ml / 1000).toFixed(1)} л воды/день</span>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {showSOS && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-4" style={{ paddingBottom: 'env(safe-area-inset-bottom, 16px)' }}>
            <Card className="w-full max-w-md border-red-200 max-h-[85vh] overflow-y-auto">
              <CardContent className="p-5 space-y-4">
                {sosResponse ? (
                  <>
                    <div className="text-center">
                      <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-green-100 flex items-center justify-center">
                        <Icon name="Heart" size={28} className="text-green-600" />
                      </div>
                      <h3 className="font-bold text-lg mb-2">Я рядом!</h3>
                      <p className="text-sm leading-relaxed">{sosResponse}</p>
                    </div>
                    <Button className="w-full" onClick={() => { setShowSOS(false); setSosResponse(null); setSosComment(''); }}>
                      Спасибо, продолжаю!
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-lg flex items-center gap-2">
                        <Icon name="LifeBuoy" size={20} className="text-red-500" />
                        Что случилось?
                      </h3>
                      <Button variant="ghost" size="sm" onClick={() => setShowSOS(false)}>
                        <Icon name="X" size={18} />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {sosReasons.map(r => (
                        <Button
                          key={r.id}
                          variant="outline"
                          className="h-auto py-3 flex-col gap-1"
                          disabled={sendingSOS}
                          onClick={() => handleSOS(r.id)}
                        >
                          <span className="text-xl">{r.icon}</span>
                          <span className="text-xs">{r.label}</span>
                        </Button>
                      ))}
                    </div>
                    <div>
                      <Label className="text-xs">Комментарий (необязательно)</Label>
                      <Textarea rows={2} placeholder="Расскажите подробнее..." value={sosComment} onChange={e => setSosComment(e.target.value)} />
                    </div>
                    {sendingSOS && (
                      <div className="text-center text-sm text-muted-foreground animate-pulse">Обрабатываю...</div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        )}

      </div>
    </div>
  );
}