import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import MealRecipeCard from '@/components/MealRecipeCard';

const DIET_PLAN_API_URL = 'https://functions.poehali.dev/18a28f19-8a37-4b2f-8434-ed8b1365f97a';
const MEAL_API = 'https://functions.poehali.dev/aabe67a3-cf0b-409f-8fa8-f3dac3c02223';
const DIET_PROGRESS_API = 'https://functions.poehali.dev/41c5c664-7ded-4c89-8820-7af2dac89d54';

interface MealPlan {
  type: string;
  time: string;
  name: string;
  description: string;
  calories: number;
  protein: number;
  fats: number;
  carbs: number;
  ingredients: string[];
  cooking_time_min: number;
  emoji: string;
}

interface DayPlan {
  day: string;
  meals: MealPlan[];
}

interface GeneratedPlan {
  daily_calories: number;
  daily_protein: number;
  daily_fats: number;
  daily_carbs: number;
  days: DayPlan[];
}

interface QuizData {
  height_cm: string;
  current_weight_kg: string;
  target_weight_kg: string;
  age: string;
  gender: string;
  activity_level: string;
  smoking: boolean;
  alcohol_frequency: string;
  work_schedule: string;
  wake_time: string;
  sleep_time: string;
  medications: string[];
  chronic_diseases: string[];
  allergies: string[];
  disliked_foods: string[];
  diet_type: string;
  cuisine_preferences: string[];
  budget: string;
  cooking_complexity: string;
  cooking_time_max: string;
  gym_frequency: string;
  activity_type: string;
  target_timeframe: string;
}

const initialData: QuizData = {
  height_cm: '', current_weight_kg: '', target_weight_kg: '', age: '',
  gender: '', activity_level: '', smoking: false, alcohol_frequency: '',
  work_schedule: '', wake_time: '07:00', sleep_time: '23:00',
  medications: [], chronic_diseases: [], allergies: [], disliked_foods: [],
  diet_type: '', cuisine_preferences: [], budget: '', cooking_complexity: '',
  cooking_time_max: '', gym_frequency: '', activity_type: '', target_timeframe: '',
};

const steps = [
  { id: 'body', title: 'Тело', icon: 'User', description: 'Рост, вес, возраст' },
  { id: 'health', title: 'Здоровье', icon: 'HeartPulse', description: 'Болезни, аллергии, лекарства' },
  { id: 'lifestyle', title: 'Образ жизни', icon: 'Activity', description: 'Режим, активность, привычки' },
  { id: 'food', title: 'Предпочтения', icon: 'ChefHat', description: 'Кухня, бюджет, сложность' },
  { id: 'summary', title: 'Итого', icon: 'SquareCheck', description: 'Проверка и запуск' },
];

const diseaseOptions = [
  'Гастрит', 'Язва желудка', 'Панкреатит', 'Холецистит',
  'Сахарный диабет 1 типа', 'Сахарный диабет 2 типа',
  'Гипертония', 'Подагра', 'Аллергия пищевая',
  'Заболевания почек', 'Заболевания печени', 'Целиакия',
];

const allergyOptions = [
  'Глютен', 'Лактоза', 'Орехи', 'Арахис', 'Яйца',
  'Рыба', 'Морепродукты', 'Соя', 'Цитрусовые', 'Мёд',
];

const cuisineOptions = [
  'Русская', 'Итальянская', 'Японская', 'Грузинская',
  'Средиземноморская', 'Азиатская', 'Мексиканская', 'Французская',
];

const dislikedOptions = [
  'Лук', 'Чеснок', 'Грибы', 'Рыба', 'Морепродукты',
  'Субпродукты', 'Баклажаны', 'Брокколи', 'Творог', 'Каша',
];

const mealTypeNames: Record<string, string> = {
  breakfast: 'Завтрак',
  lunch: 'Обед',
  dinner: 'Ужин',
  snack: 'Перекус',
};

export default function DietQuiz() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<QuizData>(initialData);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<GeneratedPlan | null>(null);
  const [rawText, setRawText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [savedPlanId, setSavedPlanId] = useState<number | null>(null);

  const progress = ((currentStep + 1) / steps.length) * 100;

  const update = (field: keyof QuizData, value: string | boolean | string[]) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const toggleArrayItem = (field: keyof QuizData, item: string) => {
    const arr = data[field] as string[];
    const updated = arr.includes(item) ? arr.filter(i => i !== item) : [...arr, item];
    update(field, updated);
  };

  const canNext = () => {
    switch (currentStep) {
      case 0: return data.height_cm && data.current_weight_kg && data.age && data.gender;
      case 1: return true;
      case 2: return data.activity_level && data.work_schedule;
      case 3: return data.budget && data.cooking_complexity;
      default: return true;
    }
  };

  const pollOperation = async (operationId: string) => {
    const maxAttempts = 30;
    for (let i = 0; i < maxAttempts; i++) {
      await new Promise(r => setTimeout(r, 5000));

      try {
        const res = await fetch(DIET_PLAN_API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'check', operationId }),
        });
        const data = await res.json();

        if (data.status === 'processing') continue;

        if (data.status === 'done') {
          if (data.plan) {
            setGeneratedPlan(data.plan);
            localStorage.setItem('dietPlan', JSON.stringify(data.plan));
            savePlanToDB(data.plan);
          } else if (data.rawText) {
            setRawText(data.rawText);
          } else {
            setError('ИИ не смог сгенерировать план. Попробуйте ещё раз.');
          }
          return;
        }

        if (data.status === 'error') {
          setError(data.error || 'Ошибка генерации');
          return;
        }
      } catch {
        setError('Ошибка соединения при проверке статуса.');
        return;
      }
    }
    setError('Генерация заняла слишком много времени. Попробуйте ещё раз.');
  };

  const handleSubmit = async () => {
    setIsGenerating(true);
    setError(null);
    setRawText(null);
    localStorage.setItem('dietQuizData', JSON.stringify(data));

    try {
      const response = await fetch(DIET_PLAN_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quizData: data }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('[DietQuiz] API error:', result);
        setError(result.details ? `${result.error}: ${result.details}` : (result.error || 'Ошибка генерации'));
        return;
      }

      if (result.status === 'started' && result.operationId) {
        await pollOperation(result.operationId);
      } else {
        setError('Неожиданный ответ сервера');
      }
    } catch {
      setError('Ошибка соединения. Проверьте интернет и попробуйте снова.');
    } finally {
      setIsGenerating(false);
    }
  };

  const savePlanToDB = async (plan: GeneratedPlan) => {
    try {
      const authToken = localStorage.getItem('authToken');
      const allMeals: Array<Record<string, unknown>> = [];
      for (const day of plan.days) {
        for (const meal of day.meals) {
          allMeals.push({
            day: day.day,
            type: meal.type,
            time: meal.time,
            name: meal.name,
            description: meal.description,
            calories: meal.calories,
            protein: meal.protein,
            fats: meal.fats,
            carbs: meal.carbs,
          });
        }
      }
      const res = await fetch(DIET_PROGRESS_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Auth-Token': authToken || '' },
        body: JSON.stringify({
          action: 'save_plan',
          plan_type: 'ai_personal',
          plan: { daily_calories: plan.daily_calories },
          quiz_data: data,
          meals: allMeals,
        }),
      });
      const result = await res.json();
      if (result.success && result.plan_id) {
        setSavedPlanId(result.plan_id);
        console.log('[DietQuiz] Plan saved to DB, id:', result.plan_id);
      }
    } catch (e) {
      console.error('[DietQuiz] Failed to save plan to DB:', e);
    }
  };

  const dayNameToValue: Record<string, string> = {
    'Понедельник': 'monday', 'Вторник': 'tuesday', 'Среда': 'wednesday',
    'Четверг': 'thursday', 'Пятница': 'friday', 'Суббота': 'saturday', 'Воскресенье': 'sunday',
  };

  const handleSaveToMenu = async (clearExisting: boolean) => {
    if (!generatedPlan) return;
    setIsSaving(true);

    const meals: Array<Record<string, string>> = [];
    for (const day of generatedPlan.days) {
      const dayValue = dayNameToValue[day.day] || day.day.toLowerCase();
      for (const meal of day.meals) {
        meals.push({
          day: dayValue,
          mealType: meal.type,
          dishName: meal.name,
          description: `${meal.description || ''} (${meal.calories} ккал, Б:${meal.protein} Ж:${meal.fats} У:${meal.carbs})`,
          emoji: meal.emoji || '🍽',
        });
      }
    }

    try {
      const authToken = localStorage.getItem('authToken');
      const response = await fetch(MEAL_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': authToken || '',
        },
        body: JSON.stringify({
          action: 'bulk_add',
          meals,
          clearExisting,
        }),
      });

      const result = await response.json();
      if (result.success) {
        setSaved(true);
      } else {
        alert(result.error || 'Ошибка сохранения');
      }
    } catch {
      alert('Ошибка соединения');
    } finally {
      setIsSaving(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Пол</Label>
                <Select value={data.gender} onValueChange={(v) => update('gender', v)}>
                  <SelectTrigger><SelectValue placeholder="Выберите" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Мужской</SelectItem>
                    <SelectItem value="female">Женский</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Возраст</Label>
                <Input type="number" placeholder="35" value={data.age} onChange={(e) => update('age', e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>Рост, см</Label>
                <Input type="number" placeholder="175" value={data.height_cm} onChange={(e) => update('height_cm', e.target.value)} />
              </div>
              <div>
                <Label>Вес, кг</Label>
                <Input type="number" placeholder="80" value={data.current_weight_kg} onChange={(e) => update('current_weight_kg', e.target.value)} />
              </div>
              <div>
                <Label>Цель, кг</Label>
                <Input type="number" placeholder="70" value={data.target_weight_kg} onChange={(e) => update('target_weight_kg', e.target.value)} />
              </div>
            </div>
            {data.target_weight_kg && data.current_weight_kg && parseFloat(data.target_weight_kg) !== parseFloat(data.current_weight_kg) && (
              <div>
                <Label>За какое время хотите достичь цели?</Label>
                <Select value={data.target_timeframe} onValueChange={(v) => update('target_timeframe', v)}>
                  <SelectTrigger><SelectValue placeholder="Выберите срок" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1month">1 месяц</SelectItem>
                    <SelectItem value="3months">3 месяца</SelectItem>
                    <SelectItem value="6months">6 месяцев</SelectItem>
                    <SelectItem value="1year">1 год</SelectItem>
                    <SelectItem value="no_rush">Без спешки</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            {data.height_cm && data.current_weight_kg && (
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Icon name="Calculator" size={16} className="text-blue-600" />
                    <span>ИМТ: <strong>{(parseFloat(data.current_weight_kg) / Math.pow(parseFloat(data.height_cm) / 100, 2)).toFixed(1)}</strong></span>
                    {data.target_weight_kg && (
                      <span className="text-muted-foreground ml-2">
                        Цель: {parseFloat(data.current_weight_kg) > parseFloat(data.target_weight_kg) ? 'снизить' : 'набрать'} на {Math.abs(parseFloat(data.current_weight_kg) - parseFloat(data.target_weight_kg)).toFixed(1)} кг
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        );

      case 1:
        return (
          <div className="space-y-5">
            <div>
              <Label className="text-sm font-bold mb-2 block">Хронические заболевания</Label>
              <div className="flex flex-wrap gap-2">
                {diseaseOptions.map((d) => (
                  <Badge
                    key={d}
                    variant={data.chronic_diseases.includes(d) ? 'default' : 'outline'}
                    className={`cursor-pointer text-xs transition-all ${data.chronic_diseases.includes(d) ? 'bg-red-500' : 'hover:bg-red-50'}`}
                    onClick={() => toggleArrayItem('chronic_diseases', d)}
                  >
                    {d}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <Label className="text-sm font-bold mb-2 block">Аллергии и непереносимость</Label>
              <div className="flex flex-wrap gap-2">
                {allergyOptions.map((a) => (
                  <Badge
                    key={a}
                    variant={data.allergies.includes(a) ? 'default' : 'outline'}
                    className={`cursor-pointer text-xs transition-all ${data.allergies.includes(a) ? 'bg-orange-500' : 'hover:bg-orange-50'}`}
                    onClick={() => toggleArrayItem('allergies', a)}
                  >
                    {a}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Checkbox checked={data.smoking} onCheckedChange={(v) => update('smoking', !!v)} id="smoking" />
              <Label htmlFor="smoking">Курение</Label>
            </div>
            <div>
              <Label>Алкоголь</Label>
              <Select value={data.alcohol_frequency} onValueChange={(v) => update('alcohol_frequency', v)}>
                <SelectTrigger><SelectValue placeholder="Частота" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="never">Не употребляю</SelectItem>
                  <SelectItem value="rarely">Редко (1-2 раза в месяц)</SelectItem>
                  <SelectItem value="weekly">Еженедельно</SelectItem>
                  <SelectItem value="often">Часто</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div>
              <Label>Уровень активности</Label>
              <Select value={data.activity_level} onValueChange={(v) => update('activity_level', v)}>
                <SelectTrigger><SelectValue placeholder="Выберите" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="sedentary">Сидячий образ жизни</SelectItem>
                  <SelectItem value="light">Лёгкая активность (1-2 раза в неделю)</SelectItem>
                  <SelectItem value="moderate">Умеренная (3-4 раза в неделю)</SelectItem>
                  <SelectItem value="active">Активный (5-6 раз в неделю)</SelectItem>
                  <SelectItem value="very_active">Очень активный (ежедневно)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Режим работы</Label>
              <Select value={data.work_schedule} onValueChange={(v) => update('work_schedule', v)}>
                <SelectTrigger><SelectValue placeholder="Выберите" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="office">Офис (8-17)</SelectItem>
                  <SelectItem value="remote">Удалённая работа</SelectItem>
                  <SelectItem value="shifts">Сменный график</SelectItem>
                  <SelectItem value="night">Ночные смены</SelectItem>
                  <SelectItem value="freelance">Свободный график</SelectItem>
                  <SelectItem value="none">Не работаю</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Подъём</Label>
                <Input type="time" value={data.wake_time} onChange={(e) => update('wake_time', e.target.value)} />
              </div>
              <div>
                <Label>Сон</Label>
                <Input type="time" value={data.sleep_time} onChange={(e) => update('sleep_time', e.target.value)} />
              </div>
            </div>
            <div>
              <Label>Спорт / тренировки</Label>
              <Select value={data.gym_frequency} onValueChange={(v) => update('gym_frequency', v)}>
                <SelectTrigger><SelectValue placeholder="Частота" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="never">Не занимаюсь</SelectItem>
                  <SelectItem value="1-2">1-2 раза в неделю</SelectItem>
                  <SelectItem value="3-4">3-4 раза в неделю</SelectItem>
                  <SelectItem value="5+">5+ раз в неделю</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {data.gym_frequency && data.gym_frequency !== 'never' && (
              <div>
                <Label>Тип тренировок</Label>
                <Select value={data.activity_type} onValueChange={(v) => update('activity_type', v)}>
                  <SelectTrigger><SelectValue placeholder="Выберите" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cardio">Кардио (бег, велосипед)</SelectItem>
                    <SelectItem value="strength">Силовые</SelectItem>
                    <SelectItem value="mixed">Смешанные</SelectItem>
                    <SelectItem value="yoga">Йога / Пилатес</SelectItem>
                    <SelectItem value="swimming">Плавание</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-5">
            <div>
              <Label className="text-sm font-bold mb-2 block">Нелюбимые продукты</Label>
              <div className="flex flex-wrap gap-2">
                {dislikedOptions.map((f) => (
                  <Badge
                    key={f}
                    variant={data.disliked_foods.includes(f) ? 'default' : 'outline'}
                    className={`cursor-pointer text-xs transition-all ${data.disliked_foods.includes(f) ? 'bg-gray-600' : 'hover:bg-gray-100'}`}
                    onClick={() => toggleArrayItem('disliked_foods', f)}
                  >
                    {f}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <Label className="text-sm font-bold mb-2 block">Предпочтения кухни</Label>
              <div className="flex flex-wrap gap-2">
                {cuisineOptions.map((c) => (
                  <Badge
                    key={c}
                    variant={data.cuisine_preferences.includes(c) ? 'default' : 'outline'}
                    className={`cursor-pointer text-xs transition-all ${data.cuisine_preferences.includes(c) ? 'bg-violet-500' : 'hover:bg-violet-50'}`}
                    onClick={() => toggleArrayItem('cuisine_preferences', c)}
                  >
                    {c}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Бюджет на питание</Label>
                <Select value={data.budget} onValueChange={(v) => update('budget', v)}>
                  <SelectTrigger><SelectValue placeholder="Выберите" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="economy">Экономный</SelectItem>
                    <SelectItem value="medium">Средний</SelectItem>
                    <SelectItem value="premium">Не ограничен</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Сложность готовки</Label>
                <Select value={data.cooking_complexity} onValueChange={(v) => update('cooking_complexity', v)}>
                  <SelectTrigger><SelectValue placeholder="Выберите" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="simple">Простые блюда</SelectItem>
                    <SelectItem value="medium">Средние</SelectItem>
                    <SelectItem value="complex">Не важно, любые</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Время на готовку (макс. минут)</Label>
              <Select value={data.cooking_time_max} onValueChange={(v) => update('cooking_time_max', v)}>
                <SelectTrigger><SelectValue placeholder="Выберите" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">До 15 минут</SelectItem>
                  <SelectItem value="30">До 30 минут</SelectItem>
                  <SelectItem value="60">До 1 часа</SelectItem>
                  <SelectItem value="120">Без ограничений</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <Card className="bg-gradient-to-r from-violet-50 to-purple-50 border-violet-200">
              <CardContent className="p-4">
                <h3 className="font-bold text-violet-900 mb-3 flex items-center gap-2">
                  <Icon name="FileText" size={18} />
                  Ваши данные
                </h3>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <div><span className="text-gray-500">Пол:</span> {data.gender === 'male' ? 'М' : 'Ж'}</div>
                  <div><span className="text-gray-500">Возраст:</span> {data.age} лет</div>
                  <div><span className="text-gray-500">Рост:</span> {data.height_cm} см</div>
                  <div><span className="text-gray-500">Вес:</span> {data.current_weight_kg} кг</div>
                  {data.target_weight_kg && <div><span className="text-gray-500">Цель:</span> {data.target_weight_kg} кг</div>}
                  <div><span className="text-gray-500">Активность:</span> {data.activity_level}</div>
                  <div><span className="text-gray-500">Бюджет:</span> {data.budget}</div>
                  <div><span className="text-gray-500">Готовка:</span> {data.cooking_complexity}</div>
                </div>
                {data.chronic_diseases.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-violet-200">
                    <span className="text-xs text-gray-500">Заболевания: </span>
                    <span className="text-xs">{data.chronic_diseases.join(', ')}</span>
                  </div>
                )}
                {data.allergies.length > 0 && (
                  <div className="mt-1">
                    <span className="text-xs text-gray-500">Аллергии: </span>
                    <span className="text-xs">{data.allergies.join(', ')}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-amber-50 border-amber-200">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Icon name="Sparkles" size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-bold text-amber-900 mb-1">Что произойдёт дальше?</p>
                    <p className="text-amber-800">ИИ проанализирует ваши данные и составит персональный план питания на 7 дней с рецептами, расписанием и рекомендациями.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );
    }
  };

  if (isGenerating) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-violet-50 via-white to-white flex items-center justify-center">
        <div className="text-center max-w-sm mx-auto p-6">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center animate-pulse">
            <Icon name="Brain" size={36} className="text-white" />
          </div>
          <h2 className="text-xl font-bold mb-2">ИИ составляет план</h2>
          <p className="text-muted-foreground text-sm mb-4">Анализирую ваши данные и подбираю блюда на 7 дней...</p>
          <div className="flex justify-center gap-1">
            {[0, 1, 2].map(i => (
              <div key={i} className="w-3 h-3 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: `${i * 0.2}s` }} />
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-4">Обычно занимает 30-60 секунд</p>
        </div>
      </div>
    );
  }

  if (generatedPlan) {
    const currentDay = generatedPlan.days[selectedDay];
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-white pb-24">
        <div className="max-w-2xl mx-auto p-4 space-y-5">
          <div className="flex items-center gap-3 pt-2">
            <Button variant="ghost" size="sm" onClick={() => { setGeneratedPlan(null); setCurrentStep(4); }}>
              <Icon name="ArrowLeft" size={18} />
            </Button>
            <div>
              <h1 className="text-lg font-bold">Ваш план питания</h1>
              <p className="text-xs text-muted-foreground">Персональный на 7 дней</p>
            </div>
          </div>

          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-4">
              <div className="grid grid-cols-4 gap-3 text-center">
                <div>
                  <div className="text-lg font-bold text-green-700">{generatedPlan.daily_calories}</div>
                  <div className="text-[10px] text-muted-foreground">ккал/день</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-blue-600">{generatedPlan.daily_protein}г</div>
                  <div className="text-[10px] text-muted-foreground">белки</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-amber-600">{generatedPlan.daily_fats}г</div>
                  <div className="text-[10px] text-muted-foreground">жиры</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-orange-600">{generatedPlan.daily_carbs}г</div>
                  <div className="text-[10px] text-muted-foreground">углеводы</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-1 overflow-x-auto pb-1">
            {generatedPlan.days.map((day, i) => (
              <button
                key={i}
                onClick={() => setSelectedDay(i)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  i === selectedDay
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {day.day}
              </button>
            ))}
          </div>

          {currentDay && (
            <div className="space-y-3">
              {currentDay.meals.map((meal, i) => (
                <MealRecipeCard key={i} meal={meal} accentColor="green" />
              ))}
            </div>
          )}

          {saved ? (
            <Card className="bg-green-50 border-green-300">
              <CardContent className="p-4 text-center">
                <Icon name="Check" size={32} className="text-green-600 mx-auto mb-2" />
                <p className="font-bold text-green-800">План сохранён в меню на неделю!</p>
                <Button className="mt-3 bg-gradient-to-r from-green-500 to-emerald-600" onClick={() => navigate('/meals')}>
                  <Icon name="CalendarDays" size={16} className="mr-2" />
                  Открыть меню
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              <Button
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600"
                disabled={isSaving}
                onClick={() => handleSaveToMenu(true)}
              >
                {isSaving ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Сохраняю...
                  </div>
                ) : (
                  <>
                    <Icon name="CalendarDays" size={16} className="mr-2" />
                    Заменить меню на неделю
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                className="w-full"
                disabled={isSaving}
                onClick={() => handleSaveToMenu(false)}
              >
                <Icon name="Plus" size={16} className="mr-2" />
                Добавить к текущему меню
              </Button>
              {savedPlanId && (
                <Button
                  variant="outline"
                  className="w-full border-violet-300 text-violet-700 hover:bg-violet-50"
                  onClick={() => navigate('/nutrition/progress')}
                >
                  <Icon name="TrendingUp" size={16} className="mr-2" />
                  Отслеживать прогресс
                </Button>
              )}
              <div className="flex gap-3">
                <Button variant="ghost" className="flex-1 text-sm" onClick={() => { setGeneratedPlan(null); setSaved(false); setCurrentStep(4); }}>
                  <Icon name="RefreshCw" size={14} className="mr-1" />
                  Заново
                </Button>
                <Button variant="ghost" className="flex-1 text-sm" onClick={() => navigate('/nutrition')}>
                  К питанию
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (rawText) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-violet-50 via-white to-white pb-24">
        <div className="max-w-2xl mx-auto p-4 space-y-5">
          <div className="flex items-center gap-3 pt-2">
            <Button variant="ghost" size="sm" onClick={() => { setRawText(null); setCurrentStep(4); }}>
              <Icon name="ArrowLeft" size={18} />
            </Button>
            <h1 className="text-lg font-bold">Рекомендации ИИ</h1>
          </div>
          <Card>
            <CardContent className="p-5">
              <div className="whitespace-pre-wrap text-sm leading-relaxed">{rawText}</div>
            </CardContent>
          </Card>
          <Button className="w-full" onClick={() => { setRawText(null); setCurrentStep(4); }}>
            <Icon name="RefreshCw" size={16} className="mr-2" />
            Попробовать снова
          </Button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-50 via-white to-white pb-24">
        <div className="max-w-2xl mx-auto p-4 space-y-5">
          <div className="flex items-center gap-3 pt-2">
            <Button variant="ghost" size="sm" onClick={() => { setError(null); setCurrentStep(4); }}>
              <Icon name="ArrowLeft" size={18} />
            </Button>
            <h1 className="text-lg font-bold">Ошибка</h1>
          </div>
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-5 text-center">
              <Icon name="AlertTriangle" size={40} className="text-red-500 mx-auto mb-3" />
              <p className="text-sm text-red-800">{error}</p>
            </CardContent>
          </Card>
          <Button className="w-full bg-gradient-to-r from-violet-500 to-purple-600" onClick={() => { setError(null); handleSubmit(); }}>
            <Icon name="RefreshCw" size={16} className="mr-2" />
            Попробовать снова
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 via-white to-white pb-24">
      <div className="max-w-2xl mx-auto p-4 space-y-5">
        <div className="flex items-center gap-3 pt-2">
          <Button variant="ghost" size="sm" onClick={() => currentStep > 0 ? setCurrentStep(currentStep - 1) : navigate('/nutrition')}>
            <Icon name="ArrowLeft" size={18} />
          </Button>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <h1 className="text-lg font-bold">ИИ-Диета: Анкета</h1>
              <Badge variant="outline" className="text-xs">{currentStep + 1}/{steps.length}</Badge>
            </div>
            <Progress value={progress} className="h-1.5" />
          </div>
        </div>

        <div className="flex gap-1 overflow-x-auto pb-2">
          {steps.map((step, i) => (
            <button
              key={step.id}
              onClick={() => i <= currentStep && setCurrentStep(i)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                i === currentStep
                  ? 'bg-violet-600 text-white'
                  : i < currentStep
                  ? 'bg-violet-100 text-violet-700 cursor-pointer'
                  : 'bg-gray-100 text-gray-400'
              }`}
            >
              <Icon name={i < currentStep ? 'SquareCheck' : step.icon} size={14} />
              {step.title}
            </button>
          ))}
        </div>

        <Card>
          <CardContent className="p-5">
            <div className="mb-4">
              <h2 className="font-bold text-lg">{steps[currentStep].title}</h2>
              <p className="text-sm text-muted-foreground">{steps[currentStep].description}</p>
            </div>
            {renderStep()}
          </CardContent>
        </Card>

        <div className="flex gap-3">
          {currentStep > 0 && (
            <Button variant="outline" className="flex-1" onClick={() => setCurrentStep(currentStep - 1)}>
              <Icon name="ArrowLeft" size={16} className="mr-2" />
              Назад
            </Button>
          )}
          {currentStep < steps.length - 1 ? (
            <Button
              className="flex-1 bg-gradient-to-r from-violet-500 to-purple-600"
              disabled={!canNext()}
              onClick={() => setCurrentStep(currentStep + 1)}
            >
              Далее
              <Icon name="ArrowRight" size={16} className="ml-2" />
            </Button>
          ) : (
            <Button
              className="flex-1 bg-gradient-to-r from-violet-500 to-purple-600"
              onClick={handleSubmit}
            >
              <Icon name="Sparkles" size={16} className="mr-2" />
              Запустить ИИ
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}