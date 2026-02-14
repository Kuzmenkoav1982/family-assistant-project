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
}

const initialData: QuizData = {
  height_cm: '', current_weight_kg: '', target_weight_kg: '', age: '',
  gender: '', activity_level: '', smoking: false, alcohol_frequency: '',
  work_schedule: '', wake_time: '07:00', sleep_time: '23:00',
  medications: [], chronic_diseases: [], allergies: [], disliked_foods: [],
  diet_type: '', cuisine_preferences: [], budget: '', cooking_complexity: '',
  cooking_time_max: '', gym_frequency: '', activity_type: '',
};

const steps = [
  { id: 'body', title: 'Тело', icon: 'User', description: 'Рост, вес, возраст' },
  { id: 'health', title: 'Здоровье', icon: 'HeartPulse', description: 'Болезни, аллергии, лекарства' },
  { id: 'lifestyle', title: 'Образ жизни', icon: 'Activity', description: 'Режим, активность, привычки' },
  { id: 'food', title: 'Предпочтения', icon: 'ChefHat', description: 'Кухня, бюджет, сложность' },
  { id: 'summary', title: 'Итого', icon: 'CheckCircle', description: 'Проверка и запуск' },
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

export default function DietQuiz() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<QuizData>(initialData);

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

  const handleSubmit = () => {
    localStorage.setItem('dietQuizData', JSON.stringify(data));
    navigate('/nutrition');
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
            {data.height_cm && data.current_weight_kg && (
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Icon name="Calculator" size={16} className="text-blue-600" />
                    <span>ИМТ: <strong>{(parseFloat(data.current_weight_kg) / Math.pow(parseFloat(data.height_cm) / 100, 2)).toFixed(1)}</strong></span>
                    {data.target_weight_kg && (
                      <span className="text-muted-foreground ml-2">
                        Цель: снизить на {(parseFloat(data.current_weight_kg) - parseFloat(data.target_weight_kg)).toFixed(1)} кг
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
              <Icon name={i < currentStep ? 'CheckCircle' : step.icon} size={14} />
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
