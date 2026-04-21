import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import MealRecipeCard from '@/components/MealRecipeCard';

const DIET_PLAN_API_URL = 'https://functions.poehali.dev/18a28f19-8a37-4b2f-8434-ed8b1365f97a';
const MEAL_API = 'https://functions.poehali.dev/aabe67a3-cf0b-409f-8fa8-f3dac3c02223';
const DIET_PROGRESS_API = 'https://functions.poehali.dev/41c5c664-7ded-4c89-8820-7af2dac89d54';
const WALLET_API = 'https://functions.poehali.dev/26de1854-01bd-4700-bb2d-6e59cebab238';
const AI_DIET_COST = 17;

const DIET_PRICE_BY_DAYS: Record<number, number> = {
  7: 17,
  14: 29,
  30: 49,
};

function calcDietPrice(days: number): number {
  if (DIET_PRICE_BY_DAYS[days] !== undefined) return DIET_PRICE_BY_DAYS[days];
  if (days <= 7) return 17;
  if (days <= 14) return 29;
  return 49;
}

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

const programNames: Record<string, string> = {
  'stol-1': 'Стол №1',
  'stol-5': 'Стол №5',
  'stol-9': 'Стол №9',
  'vegan': 'Веган',
  'keto': 'Кето',
  'light': 'Облегчённое питание',
};

const programEmoji: Record<string, string> = {
  'stol-1': '🏥',
  'stol-5': '🫀',
  'stol-9': '💉',
  'vegan': '🌱',
  'keto': '🥑',
  'light': '🥗',
};

const programDetails: Record<string, { allowed: string[]; forbidden: string[]; principles: string[] }> = {
  'stol-1': {
    allowed: ['каши на воде и молоке', 'нежирное мясо', 'паровая рыба', 'овощные супы', 'молочные продукты', 'яйца всмятку', 'белый хлеб вчерашний', 'сливочное масло', 'мёд'],
    forbidden: ['жареное', 'острое', 'копчёное', 'маринады', 'газировка', 'алкоголь', 'свежий хлеб', 'грибы', 'бобовые', 'кислые фрукты'],
    principles: ['Пища готовится на пару, варится или запекается', 'Температура блюд 15-65 градусов', 'Дробное питание 5-6 раз в день', 'Тщательное пережёвывание', 'Исключение грубой клетчатки'],
  },
  'stol-5': {
    allowed: ['нежирное мясо и птица', 'нежирная рыба', 'крупы', 'овощи', 'фрукты некислые', 'молочные продукты', 'яйца (белок)', 'вчерашний хлеб', 'растительное масло', 'мёд'],
    forbidden: ['жирное мясо', 'сало', 'субпродукты', 'жареное', 'острое', 'копчёности', 'маринады', 'грибы', 'бобовые', 'шоколад', 'алкоголь'],
    principles: ['Варка, запекание, тушение, приготовление на пару', 'Дробное питание 5-6 раз в день', 'Пища в тёплом виде', 'Ограничение жиров до 70-80 г в сутки', 'Обильное питьё 1.5-2 л воды'],
  },
  'stol-9': {
    allowed: ['нежирное мясо', 'рыба', 'овощи (кроме картофеля)', 'крупы (гречка, овсянка)', 'бобовые', 'кисломолочные продукты', 'яйца', 'хлеб из муки грубого помола', 'несладкие фрукты'],
    forbidden: ['сахар', 'конфеты', 'шоколад', 'мёд', 'варенье', 'белый хлеб', 'сдоба', 'рис', 'манка', 'виноград', 'бананы', 'жирное мясо', 'алкоголь'],
    principles: ['Контроль гликемического индекса продуктов', 'Дробное питание 5-6 раз в день', 'Равномерное распределение углеводов', 'Подсчёт хлебных единиц', 'Замена сахара на сахарозаменители'],
  },
  'vegan': {
    allowed: ['овощи', 'фрукты', 'злаки', 'бобовые', 'орехи', 'семена', 'тофу', 'соевое молоко', 'растительные масла', 'грибы', 'водоросли'],
    forbidden: ['мясо', 'рыба', 'молочные продукты', 'яйца', 'мёд', 'желатин'],
    principles: ['Обязательно B12 как добавка', 'Комбинирование бобовых и злаков для полного белка', 'Достаточное потребление железа', 'Обогащённые продукты для кальция и витамина D'],
  },
  'keto': {
    allowed: ['жирное мясо', 'рыба жирная', 'яйца', 'авокадо', 'орехи', 'масло сливочное', 'масло кокосовое', 'сыр', 'сливки', 'зелёные овощи', 'грибы'],
    forbidden: ['хлеб', 'макароны', 'рис', 'картофель', 'сахар', 'фрукты (большинство)', 'бобовые', 'крупы', 'молоко', 'соки', 'мёд'],
    principles: ['Углеводы 20-50 г в сутки', 'Жиры 70-80% калорий', 'Белок 15-20% калорий', 'Обильное питьё воды', 'Контроль электролитов'],
  },
  'light': {
    allowed: ['нежирное мясо', 'рыба', 'овощи', 'фрукты', 'крупы', 'бобовые', 'кисломолочные продукты', 'яйца', 'цельнозерновой хлеб', 'орехи (умеренно)'],
    forbidden: ['фастфуд', 'полуфабрикаты', 'сладкая газировка', 'чипсы', 'майонез', 'колбасные изделия', 'сдобная выпечка'],
    principles: ['Снижение калорийности на 15-20% от нормы', 'Дробное питание 4-5 раз в день', 'Больше овощей и клетчатки', 'Минимум переработанных продуктов', 'Контроль порций'],
  },
};

interface MiniQuizData {
  servings_count: string;
  budget: string;
  cooking_complexity: string;
  cooking_time_max: string;
  disliked_foods: string[];
  duration_days: string;
}

const dislikedOptions = [
  'Лук', 'Чеснок', 'Грибы', 'Рыба', 'Морепродукты',
  'Субпродукты', 'Баклажаны', 'Брокколи', 'Творог', 'Каша',
  'Свёкла', 'Тыква', 'Шпинат', 'Сельдерей',
];

const mealTypeNames: Record<string, string> = {
  breakfast: 'Завтрак',
  lunch: 'Обед',
  dinner: 'Ужин',
  snack: 'Перекус',
};

const dayNameToValue: Record<string, string> = {
  'Понедельник': 'monday', 'Вторник': 'tuesday', 'Среда': 'wednesday',
  'Четверг': 'thursday', 'Пятница': 'friday', 'Суббота': 'saturday', 'Воскресенье': 'sunday',
};

export default function DietMiniQuiz() {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<MiniQuizData>({
    servings_count: '1',
    budget: '',
    cooking_complexity: '',
    cooking_time_max: '',
    disliked_foods: [],
    duration_days: '7',
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<GeneratedPlan | null>(null);
  const [rawText, setRawText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [savedPlanId, setSavedPlanId] = useState<number | null>(null);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);

  const programName = programNames[slug || ''] || 'Программа';
  const emoji = programEmoji[slug || ''] || '🍽️';
  const details = programDetails[slug || ''];
  const totalSteps = 3;
  const progress = ((step + 1) / totalSteps) * 100;

  useEffect(() => {
    if (step === 2) {
      const authToken = localStorage.getItem('authToken') || '';
      fetch(`${WALLET_API}?action=balance`, { headers: { 'X-Auth-Token': authToken } })
        .then(r => r.json())
        .then(j => setWalletBalance(j.balance ?? null))
        .catch(() => {});
    }
  }, [step]);

  const update = (field: keyof MiniQuizData, value: string | string[]) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const toggleDisliked = (item: string) => {
    const updated = data.disliked_foods.includes(item)
      ? data.disliked_foods.filter(i => i !== item)
      : [...data.disliked_foods, item];
    update('disliked_foods', updated);
  };

  const tryParseRawPlan = (text: string): GeneratedPlan | null => {
    try {
      let jsonStr = text.trim();
      const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) jsonStr = jsonMatch[1].trim();
      
      if (!jsonStr.startsWith('{')) {
        const braceIdx = jsonStr.indexOf('{');
        if (braceIdx !== -1) jsonStr = jsonStr.substring(braceIdx);
      }
      const lastBrace = jsonStr.lastIndexOf('}');
      if (lastBrace !== -1 && lastBrace < jsonStr.length - 1) {
        jsonStr = jsonStr.substring(0, lastBrace + 1);
      }

      const fixed = jsonStr.replace(/,\s*([}\]])/g, '$1');
      try {
        const parsed = JSON.parse(fixed);
        if (parsed.daily_calories && parsed.days && Array.isArray(parsed.days) && parsed.days.length > 0) {
          return parsed as GeneratedPlan;
        }
      } catch { /* continue to regex recovery */ }

      return recoverTruncatedPlan(text);
    } catch {
      return recoverTruncatedPlan(text);
    }
  };

  const recoverTruncatedPlan = (text: string): GeneratedPlan | null => {
    try {
      const result: Record<string, unknown> = {};
      for (const field of ['daily_calories', 'daily_protein', 'daily_fats', 'daily_carbs']) {
        const m = text.match(new RegExp(`"${field}"\\s*:\\s*(\\d+)`));
        if (m) result[field] = parseInt(m[1]);
      }
      if (!result.daily_calories) return null;

      const daysIdx = text.search(/"days"\s*:\s*\[/);
      if (daysIdx === -1) return null;

      const daysText = text.substring(daysIdx);
      const dayMatches = [...daysText.matchAll(/"day"\s*:\s*"([^"]*)"/g)];
      if (dayMatches.length === 0) return null;

      const mealRegex = /\{\s*"type"\s*:\s*"([^"]*)"\s*,\s*"time"\s*:\s*"([^"]*)"\s*,\s*"name"\s*:\s*"([^"]*)"\s*,\s*"description"\s*:\s*"([^"]*)"\s*,\s*"calories"\s*:\s*(\d+)\s*,\s*"protein"\s*:\s*(\d+)\s*,\s*"fats"\s*:\s*(\d+)\s*,\s*"carbs"\s*:\s*(\d+)\s*,\s*"ingredients"\s*:\s*\[([^\]]*)\]\s*,\s*"cooking_time_min"\s*:\s*(\d+)\s*,\s*"emoji"\s*:\s*"([^"]*)"/g;

      const days: DayPlan[] = [];
      for (let i = 0; i < dayMatches.length; i++) {
        const dayName = dayMatches[i][1];
        const startPos = dayMatches[i].index! + dayMatches[i][0].length;
        const endPos = i + 1 < dayMatches.length ? dayMatches[i + 1].index! : daysText.length;
        const dayChunk = daysText.substring(startPos, endPos);

        const meals: MealPlan[] = [];
        let mm;
        mealRegex.lastIndex = 0;
        while ((mm = mealRegex.exec(dayChunk)) !== null) {
          const rawIngs = mm[9];
          const ingredients = rawIngs.split('",').map((s: string) => s.trim().replace(/^"|"$/g, '')).filter(Boolean);
          meals.push({
            type: mm[1], time: mm[2], name: mm[3], description: mm[4],
            calories: parseInt(mm[5]), protein: parseInt(mm[6]),
            fats: parseInt(mm[7]), carbs: parseInt(mm[8]),
            ingredients, cooking_time_min: parseInt(mm[10]), emoji: mm[11],
          });
        }
        if (meals.length > 0) {
          days.push({ day: dayName, meals });
        }
      }

      if (days.length === 0) return null;
      return {
        daily_calories: result.daily_calories as number,
        daily_protein: (result.daily_protein as number) || 0,
        daily_fats: (result.daily_fats as number) || 0,
        daily_carbs: (result.daily_carbs as number) || 0,
        days,
      };
    } catch {
      return null;
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
            savePlanToDB(data.plan);
          } else if (data.rawText) {
            const parsed = tryParseRawPlan(data.rawText);
            if (parsed) {
              setGeneratedPlan(parsed);
              savePlanToDB(parsed);
            } else {
              setRawText(data.rawText);
            }
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

  const spendWallet = async (amount: number, reason: string, description: string) => {
    const authToken = localStorage.getItem('authToken') || '';
    try {
      const res = await fetch(WALLET_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Auth-Token': authToken },
        body: JSON.stringify({ action: 'spend', amount, reason, description }),
      });
      return await res.json();
    } catch {
      return { error: 'Ошибка проверки баланса' };
    }
  };

  const handleSubmit = async () => {
    setIsGenerating(true);
    setError(null);
    setRawText(null);

    try {
      const authToken = localStorage.getItem('authToken') || '';
      const response = await fetch(DIET_PLAN_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Auth-Token': authToken },
        body: JSON.stringify({
          duration_days: parseInt(data.duration_days) || 7,
          programData: {
            program_slug: slug,
            program_name: programName,
            servings_count: data.servings_count,
            budget: data.budget,
            cooking_complexity: data.cooking_complexity,
            cooking_time_max: data.cooking_time_max,
            disliked_foods: data.disliked_foods,
            allowed_foods: details?.allowed || [],
            forbidden_foods: details?.forbidden || [],
            principles: details?.principles || [],
          },
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 402 || result.error === 'insufficient_funds') {
          setError(`Недостаточно средств на балансе. ${result.message || 'Пополните кошелёк.'}`);
        } else {
          setError(result.details ? `${result.error}: ${result.details}` : (result.error || 'Ошибка генерации'));
        }
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
            day: day.day, type: meal.type, time: meal.time,
            name: meal.name, description: meal.description,
            calories: meal.calories, protein: meal.protein,
            fats: meal.fats, carbs: meal.carbs,
            ingredients: meal.ingredients || [],
          });
        }
      }
      const res = await fetch(DIET_PROGRESS_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Auth-Token': authToken || '' },
        body: JSON.stringify({
          action: 'save_plan', plan_type: 'preset_program',
          plan: {
            daily_calories: plan.daily_calories,
            daily_water_ml: (plan as Record<string, unknown>).daily_water_ml || null,
            daily_steps: (plan as Record<string, unknown>).daily_steps || null,
            exercise_recommendation: (plan as Record<string, unknown>).exercise_recommendation || null,
          },
          quiz_data: {}, meals: allMeals,
        }),
      });
      const result = await res.json();
      if (result.success && result.plan_id) {
        setSavedPlanId(result.plan_id);
      }
    } catch (e) {
      console.error('[DietMiniQuiz] Failed to save plan to DB:', e);
    }
  };

  const handleSaveToMenu = async (clearExisting: boolean) => {
    if (!generatedPlan) return;
    setIsSaving(true);

    const meals: Array<Record<string, unknown>> = [];
    for (const day of generatedPlan.days) {
      const dayValue = dayNameToValue[day.day] || day.day.toLowerCase();
      for (const meal of day.meals) {
        meals.push({
          day: dayValue,
          mealType: meal.type,
          dishName: meal.name,
          description: `${meal.description || ''} (${meal.calories} ккал, Б:${meal.protein} Ж:${meal.fats} У:${meal.carbs})`,
          emoji: meal.emoji || '🍽',
          ingredients: meal.ingredients || [],
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
        body: JSON.stringify({ action: 'bulk_add', meals, clearExisting }),
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
    switch (step) {
      case 0:
        return (
          <div className="space-y-5">
            <div>
              <Label className="text-sm font-bold mb-2 block">На сколько человек готовить?</Label>
              <div className="flex gap-2">
                {['1', '2', '3', '4', '5', '6'].map(n => (
                  <Button
                    key={n}
                    variant={data.servings_count === n ? 'default' : 'outline'}
                    className={`w-12 h-12 text-lg ${data.servings_count === n ? 'bg-emerald-600' : ''}`}
                    onClick={() => update('servings_count', n)}
                  >
                    {n}
                  </Button>
                ))}
              </div>
            </div>
            <div>
              <Label>Бюджет на питание</Label>
              <Select value={data.budget} onValueChange={(v) => update('budget', v)}>
                <SelectTrigger><SelectValue placeholder="Выберите бюджет" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="economy">Экономный (до 500 руб/день)</SelectItem>
                  <SelectItem value="medium">Средний (500-1000 руб/день)</SelectItem>
                  <SelectItem value="premium">Не ограничен</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-5">
            <div>
              <Label>Сложность приготовления</Label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {[
                  { val: 'simple', label: 'Простые', icon: '👍', desc: 'До 5 ингредиентов' },
                  { val: 'medium', label: 'Средние', icon: '👨‍🍳', desc: 'Базовые навыки' },
                  { val: 'complex', label: 'Любые', icon: '⭐', desc: 'Не важно' },
                ].map(opt => (
                  <Card
                    key={opt.val}
                    className={`cursor-pointer text-center transition-all ${
                      data.cooking_complexity === opt.val
                        ? 'border-2 border-emerald-500 bg-emerald-50'
                        : 'hover:border-gray-300'
                    }`}
                    onClick={() => update('cooking_complexity', opt.val)}
                  >
                    <CardContent className="p-3">
                      <div className="text-2xl mb-1">{opt.icon}</div>
                      <div className="text-xs font-bold">{opt.label}</div>
                      <div className="text-[10px] text-muted-foreground">{opt.desc}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
            <div>
              <Label>Максимум времени на готовку</Label>
              <div className="grid grid-cols-4 gap-2 mt-2">
                {[
                  { val: '15', label: '15 мин' },
                  { val: '30', label: '30 мин' },
                  { val: '60', label: '1 час' },
                  { val: '120', label: 'Любое' },
                ].map(opt => (
                  <Button
                    key={opt.val}
                    variant={data.cooking_time_max === opt.val ? 'default' : 'outline'}
                    className={`text-sm ${data.cooking_time_max === opt.val ? 'bg-emerald-600' : ''}`}
                    onClick={() => update('cooking_time_max', opt.val)}
                  >
                    {opt.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-bold mb-2 block">
                Что вы не любите? <span className="font-normal text-muted-foreground">(необязательно)</span>
              </Label>
              <p className="text-xs text-muted-foreground mb-3">
                ИИ исключит эти продукты из вашего меню
              </p>
              <div className="flex flex-wrap gap-2">
                {dislikedOptions.map((f) => (
                  <Badge
                    key={f}
                    variant={data.disliked_foods.includes(f) ? 'default' : 'outline'}
                    className={`cursor-pointer text-xs transition-all ${
                      data.disliked_foods.includes(f) ? 'bg-gray-600' : 'hover:bg-gray-100'
                    }`}
                    onClick={() => toggleDisliked(f)}
                  >
                    {data.disliked_foods.includes(f) && <Icon name="X" size={10} className="mr-1" />}
                    {f}
                  </Badge>
                ))}
              </div>
            </div>

            {walletBalance !== null && (
              <Card className={`border ${walletBalance >= AI_DIET_COST ? 'border-emerald-200 bg-emerald-50' : 'border-red-300 bg-red-50'}`}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Icon name="Wallet" size={20} className={walletBalance >= AI_DIET_COST ? 'text-emerald-600' : 'text-red-500'} />
                    <div className="flex-1 text-sm">
                      <p className="font-medium">
                        Баланс: <strong>{walletBalance.toFixed(0)} руб</strong>
                        <span className="text-muted-foreground ml-1">(нужно {AI_DIET_COST} руб)</span>
                      </p>
                    </div>
                    {walletBalance < AI_DIET_COST && (
                      <Button size="sm" className="bg-emerald-600" onClick={() => navigate('/wallet')}>
                        <Icon name="Plus" size={14} className="mr-1" />
                        Пополнить
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            <div>
              <Label className="text-sm font-bold mb-3 block">Длительность плана</Label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: '7', label: '7 дней', desc: 'Пробный' },
                  { value: '14', label: '14 дней', desc: 'Оптимальный' },
                  { value: '30', label: '30 дней', desc: 'Полный курс' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    className={`p-3 rounded-lg border-2 text-center transition-all ${
                      data.duration_days === opt.value
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-gray-200 hover:border-emerald-300'
                    }`}
                    onClick={() => update('duration_days', opt.value)}
                  >
                    <div className="text-lg font-bold">{opt.label}</div>
                    <div className="text-xs text-muted-foreground">{opt.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <Card className="bg-emerald-50 border-emerald-200 mt-4">
              <CardContent className="p-4">
                <h4 className="font-bold text-emerald-900 mb-2 flex items-center gap-2">
                  <Icon name="CircleCheck" size={18} />
                  Готово к запуску!
                </h4>
                <div className="text-sm text-emerald-800 space-y-1">
                  <p>Программа: <strong>{programName}</strong></p>
                  <p>Длительность: <strong>{data.duration_days} дней</strong></p>
                  <p>Порций: <strong>{data.servings_count}</strong></p>
                  <p>Бюджет: <strong>{data.budget === 'economy' ? 'Экономный' : data.budget === 'medium' ? 'Средний' : 'Не ограничен'}</strong></p>
                  <p>Сложность: <strong>{data.cooking_complexity === 'simple' ? 'Простые' : data.cooking_complexity === 'medium' ? 'Средние' : 'Любые'}</strong></p>
                  {data.disliked_foods.length > 0 && (
                    <p>Исключено: <strong>{data.disliked_foods.join(', ')}</strong></p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        );
    }
  };

  if (isGenerating) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-white flex items-center justify-center">
        <div className="text-center max-w-sm mx-auto p-6">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center animate-pulse">
            <span className="text-4xl">{emoji}</span>
          </div>
          <h2 className="text-xl font-bold mb-2">ИИ составляет план</h2>
          <p className="text-muted-foreground text-sm mb-4">Генерирую меню по программе «{programName}» на {data.duration_days} дней...</p>
          <div className="flex justify-center gap-1">
            {[0, 1, 2].map(i => (
              <div key={i} className="w-3 h-3 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: `${i * 0.2}s` }} />
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
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-white pb-24">
        <div className="max-w-2xl mx-auto p-4 space-y-5">
          <div className="flex items-center gap-3 pt-2">
            <Button variant="ghost" size="sm" onClick={() => { setGeneratedPlan(null); setStep(2); }}>
              <Icon name="ArrowLeft" size={18} />
            </Button>
            <div>
              <h1 className="text-lg font-bold flex items-center gap-2">
                <span>{emoji}</span> {programName}
              </h1>
              <p className="text-xs text-muted-foreground">План на {generatedPlan.days.length} дней, {data.servings_count} чел.</p>
            </div>
          </div>

          <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200">
            <CardContent className="p-4">
              <div className="grid grid-cols-4 gap-3 text-center">
                <div>
                  <div className="text-lg font-bold text-emerald-700">{generatedPlan.daily_calories}</div>
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
                    ? 'bg-emerald-600 text-white'
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
                <MealRecipeCard key={i} meal={meal} accentColor="emerald" />
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
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-600"
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
                <Button variant="ghost" className="flex-1 text-sm" onClick={() => { setGeneratedPlan(null); setSaved(false); setStep(2); }}>
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
    const recoveredPlan = tryParseRawPlan(rawText);
    if (recoveredPlan) {
      setGeneratedPlan(recoveredPlan);
      setRawText(null);
      savePlanToDB(recoveredPlan);
      return null;
    }

    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-white pb-24">
        <div className="max-w-2xl mx-auto p-4 space-y-5">
          <div className="flex items-center gap-3 pt-2">
            <Button variant="ghost" size="sm" onClick={() => { setRawText(null); setStep(2); }}>
              <Icon name="ArrowLeft" size={18} />
            </Button>
            <h1 className="text-lg font-bold flex items-center gap-2">
              <span>{emoji}</span> Рекомендации ИИ — {programName}
            </h1>
          </div>
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="p-4 text-center">
              <Icon name="AlertTriangle" size={32} className="text-amber-500 mx-auto mb-2" />
              <p className="font-medium text-amber-800">ИИ сгенерировал план, но в нестандартном формате</p>
              <p className="text-sm text-amber-600 mt-1">Попробуйте сгенерировать заново — обычно со второй попытки всё работает</p>
            </CardContent>
          </Card>
          <div className="space-y-2">
            <Button className="w-full bg-gradient-to-r from-emerald-500 to-teal-600" onClick={() => {
              setRawText(null);
              handleSubmit();
            }}>
              <Icon name="RefreshCw" size={16} className="mr-2" />
              Сгенерировать заново
            </Button>
            <Button variant="outline" className="w-full" onClick={() => navigate('/nutrition/programs')}>
              Вернуться к программам
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-50 via-white to-white pb-24">
        <div className="max-w-2xl mx-auto p-4 space-y-5">
          <div className="flex items-center gap-3 pt-2">
            <Button variant="ghost" size="sm" onClick={() => { setError(null); setStep(2); }}>
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
          {error.includes('Недостаточно средств') ? (
            <div className="space-y-2">
              <Button className="w-full bg-gradient-to-r from-emerald-500 to-teal-600" onClick={() => navigate('/wallet')}>
                <Icon name="Wallet" size={16} className="mr-2" />
                Пополнить кошелёк
              </Button>
              <Button variant="outline" className="w-full" onClick={() => { setError(null); setStep(2); }}>
                Назад к анкете
              </Button>
            </div>
          ) : (
            <Button className="w-full bg-gradient-to-r from-emerald-500 to-teal-600" onClick={() => { setError(null); handleSubmit(); }}>
              <Icon name="RefreshCw" size={16} className="mr-2" />
              Попробовать снова
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-white pb-24">
      <div className="max-w-2xl mx-auto p-4 space-y-5">
        <div className="flex items-center gap-3 pt-2">
          <Button variant="ghost" size="sm" onClick={() => step > 0 ? setStep(step - 1) : navigate('/nutrition/programs')}>
            <Icon name="ArrowLeft" size={18} />
          </Button>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <h1 className="text-lg font-bold flex items-center gap-2">
                <span>{emoji}</span>
                {programName}
              </h1>
              <Badge variant="outline" className="text-xs">{step + 1}/{totalSteps}</Badge>
            </div>
            <Progress value={progress} className="h-1.5" />
          </div>
        </div>

        <Card>
          <CardContent className="p-5">
            {renderStep()}
          </CardContent>
        </Card>

        <div className="flex gap-3">
          {step > 0 && (
            <Button variant="outline" className="flex-1" onClick={() => setStep(step - 1)}>
              <Icon name="ArrowLeft" size={16} className="mr-2" />
              Назад
            </Button>
          )}
          {step < totalSteps - 1 ? (
            <Button
              className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600"
              disabled={step === 0 ? !data.budget : step === 1 ? !data.cooking_complexity || !data.cooking_time_max : false}
              onClick={() => setStep(step + 1)}
            >
              Далее
              <Icon name="ArrowRight" size={16} className="ml-2" />
            </Button>
          ) : (
            <Button
              className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600"
              onClick={handleSubmit}
            >
              <Icon name="Sparkles" size={16} className="mr-2" />
              Сгенерировать план
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}