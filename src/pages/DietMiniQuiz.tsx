import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';

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

  const programName = programNames[slug || ''] || 'Программа';
  const emoji = programEmoji[slug || ''] || '🍽️';
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

  const handleSubmit = () => {
    localStorage.setItem('dietMiniQuizData', JSON.stringify({ ...data, program_slug: slug }));
    navigate('/nutrition');
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
