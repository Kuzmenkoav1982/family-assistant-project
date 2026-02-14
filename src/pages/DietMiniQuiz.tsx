import { useState } from 'react';
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
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<GeneratedPlan | null>(null);
  const [rawText, setRawText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const programName = programNames[slug || ''] || 'Программа';
  const emoji = programEmoji[slug || ''] || '🍽️';
  const details = programDetails[slug || ''];
  const totalSteps = 3;
  const progress = ((step + 1) / totalSteps) * 100;

  const update = (field: keyof MiniQuizData, value: string | string[]) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const toggleDisliked = (item: string) => {
    const updated = data.disliked_foods.includes(item)
      ? data.disliked_foods.filter(i => i !== item)
      : [...data.disliked_foods, item];
    update('disliked_foods', updated);
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

    try {
      const response = await fetch(DIET_PLAN_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
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

            <Card className="bg-emerald-50 border-emerald-200 mt-4">
              <CardContent className="p-4">
                <h4 className="font-bold text-emerald-900 mb-2 flex items-center gap-2">
                  <Icon name="CheckCircle" size={18} />
                  Готово к запуску!
                </h4>
                <div className="text-sm text-emerald-800 space-y-1">
                  <p>Программа: <strong>{programName}</strong></p>
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
          <p className="text-muted-foreground text-sm mb-4">Генерирую меню по программе «{programName}» на 7 дней...</p>
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
              <p className="text-xs text-muted-foreground">План на 7 дней, {data.servings_count} чел.</p>
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
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-white pb-24">
        <div className="max-w-2xl mx-auto p-4 space-y-5">
          <div className="flex items-center gap-3 pt-2">
            <Button variant="ghost" size="sm" onClick={() => { setRawText(null); setStep(2); }}>
              <Icon name="ArrowLeft" size={18} />
            </Button>
            <h1 className="text-lg font-bold">Рекомендации ИИ — {programName}</h1>
          </div>
          <Card>
            <CardContent className="p-5">
              <div className="whitespace-pre-wrap text-sm leading-relaxed">{rawText}</div>
            </CardContent>
          </Card>
          <Button className="w-full bg-gradient-to-r from-emerald-500 to-teal-600" onClick={() => { setRawText(null); handleSubmit(); }}>
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
          <Button className="w-full bg-gradient-to-r from-emerald-500 to-teal-600" onClick={() => { setError(null); handleSubmit(); }}>
            <Icon name="RefreshCw" size={16} className="mr-2" />
            Попробовать снова
          </Button>
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