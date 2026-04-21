import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import type { QuizData, MedTableHint } from '@/data/dietQuizData';
import { diseaseOptions, allergyOptions, cuisineOptions, dislikedOptions, AI_DIET_COST, calcDietPrice } from '@/data/dietQuizData';

interface QuizStepsProps {
  step: number;
  data: QuizData;
  update: (field: keyof QuizData, value: string | boolean | string[]) => void;
  toggleArrayItem: (field: keyof QuizData, item: string) => void;
  detectedTables: MedTableHint[];
  walletBalance: number | null;
  navigate: (path: string) => void;
}

export default function QuizSteps({ step, data, update, toggleArrayItem, detectedTables, walletBalance, navigate }: QuizStepsProps) {
  switch (step) {
    case 0:
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Рост (см) *</Label>
              <Input type="number" placeholder="175" value={data.height_cm} onChange={e => update('height_cm', e.target.value)} />
            </div>
            <div>
              <Label>Возраст *</Label>
              <Input type="number" placeholder="30" value={data.age} onChange={e => update('age', e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Текущий вес (кг) *</Label>
              <Input type="number" step="0.1" placeholder="80" value={data.current_weight_kg} onChange={e => update('current_weight_kg', e.target.value)} />
            </div>
            <div>
              <Label>Целевой вес (кг)</Label>
              <Input type="number" step="0.1" placeholder="70" value={data.target_weight_kg} onChange={e => update('target_weight_kg', e.target.value)} />
            </div>
          </div>
          <div>
            <Label>Пол *</Label>
            <div className="grid grid-cols-2 gap-3 mt-1">
              {[{ value: 'male', label: 'Мужской', icon: '\u{1F9D4}' }, { value: 'female', label: 'Женский', icon: '\u{1F469}' }].map(g => (
                <button key={g.value} className={`p-3 rounded-lg border-2 text-center transition-all ${data.gender === g.value ? 'border-violet-500 bg-violet-50' : 'border-gray-200 hover:border-violet-300'}`} onClick={() => update('gender', g.value)}>
                  <div className="text-2xl mb-1">{g.icon}</div>
                  <div className="text-sm font-medium">{g.label}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      );

    case 1:
      return (
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-bold mb-2 block">Хронические заболевания</Label>
            <div className="flex flex-wrap gap-2">
              {diseaseOptions.map(d => (
                <Badge key={d} variant={data.chronic_diseases.includes(d) ? 'default' : 'outline'}
                  className={`cursor-pointer text-xs transition-all ${data.chronic_diseases.includes(d) ? 'bg-red-500' : 'hover:bg-red-50'}`}
                  onClick={() => toggleArrayItem('chronic_diseases', d)}>
                  {d}
                </Badge>
              ))}
            </div>
          </div>
          {detectedTables.length > 0 && (
            <Card className="bg-blue-50 border-blue-200 animate-fade-in">
              <CardContent className="p-3">
                <div className="flex items-start gap-2">
                  <Icon name="HeartPulse" size={18} className="text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">
                      Гибридный режим: {detectedTables.map(t => t.table).join(' + ')}
                    </p>
                    <p className="text-xs text-blue-700 mt-1">
                      ИИ автоматически учтёт ограничения {detectedTables.length > 1 ? 'медицинских столов' : 'медицинского стола'}: исключит запрещённые продукты и подберёт щадящие блюда.
                    </p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {detectedTables.flatMap(t => t.forbidden.slice(0, 4)).map((f, i) => (
                        <Badge key={i} variant="secondary" className="text-[10px] bg-red-100 text-red-700">{f}</Badge>
                      ))}
                      <Badge variant="secondary" className="text-[10px]">...</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          <div>
            <Label className="text-sm font-bold mb-2 block">Аллергии и непереносимость</Label>
            <div className="flex flex-wrap gap-2">
              {allergyOptions.map(a => (
                <Badge key={a} variant={data.allergies.includes(a) ? 'default' : 'outline'}
                  className={`cursor-pointer text-xs transition-all ${data.allergies.includes(a) ? 'bg-orange-500' : 'hover:bg-orange-50'}`}
                  onClick={() => toggleArrayItem('allergies', a)}>
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
            <div><Label>Подъём</Label><Input type="time" value={data.wake_time} onChange={(e) => update('wake_time', e.target.value)} /></div>
            <div><Label>Сон</Label><Input type="time" value={data.sleep_time} onChange={(e) => update('sleep_time', e.target.value)} /></div>
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
              {dislikedOptions.map(f => (
                <Badge key={f} variant={data.disliked_foods.includes(f) ? 'default' : 'outline'}
                  className={`cursor-pointer text-xs transition-all ${data.disliked_foods.includes(f) ? 'bg-gray-600' : 'hover:bg-gray-100'}`}
                  onClick={() => toggleArrayItem('disliked_foods', f)}>
                  {f}
                </Badge>
              ))}
            </div>
          </div>
          <div>
            <Label className="text-sm font-bold mb-2 block">Предпочтения кухни</Label>
            <div className="flex flex-wrap gap-2">
              {cuisineOptions.map(c => (
                <Badge key={c} variant={data.cuisine_preferences.includes(c) ? 'default' : 'outline'}
                  className={`cursor-pointer text-xs transition-all ${data.cuisine_preferences.includes(c) ? 'bg-violet-500' : 'hover:bg-violet-50'}`}
                  onClick={() => toggleArrayItem('cuisine_preferences', c)}>
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
          {detectedTables.length > 0 && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Icon name="HeartPulse" size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-bold text-blue-900 mb-1">Гибридный режим: {detectedTables.map(t => t.table).join(' + ')}</p>
                    <p className="text-blue-800">ИИ автоматически учтёт ограничения медицинских столов при составлении плана. Запрещённые продукты будут исключены.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          {(() => {
            const currentPrice = calcDietPrice(parseInt(data.duration_days) || 7);
            return walletBalance !== null && (
              <Card className={`border ${walletBalance >= currentPrice ? 'border-emerald-200 bg-emerald-50' : 'border-red-300 bg-red-50'}`}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Icon name="Wallet" size={20} className={walletBalance >= currentPrice ? 'text-emerald-600' : 'text-red-500'} />
                    <div className="flex-1 text-sm">
                      <p className="font-medium">Баланс: <strong>{walletBalance.toFixed(0)} руб</strong><span className="text-muted-foreground ml-1">(нужно {currentPrice} руб)</span></p>
                    </div>
                    {walletBalance < currentPrice && (
                      <Button size="sm" className="bg-emerald-600" onClick={() => navigate('/wallet')}>
                        <Icon name="Plus" size={14} className="mr-1" />Пополнить
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })()}
          <Card className="border-violet-200">
            <CardContent className="p-4">
              <Label className="text-sm font-bold mb-3 block">Длительность плана</Label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: '7', label: '7 дней', desc: `${calcDietPrice(7)} ₽` },
                  { value: '14', label: '14 дней', desc: `${calcDietPrice(14)} ₽` },
                  { value: '30', label: '30 дней', desc: `${calcDietPrice(30)} ₽` },
                ].map(opt => (
                  <button key={opt.value} className={`p-3 rounded-lg border-2 text-center transition-all ${data.duration_days === opt.value ? 'border-violet-500 bg-violet-50' : 'border-gray-200 hover:border-violet-300'}`} onClick={() => update('duration_days', opt.value)}>
                    <div className="text-lg font-bold">{opt.label}</div>
                    <div className="text-xs text-muted-foreground">{opt.desc}</div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-amber-50 border-amber-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Icon name="Sparkles" size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-bold text-amber-900 mb-1">Что произойдёт дальше?</p>
                  <p className="text-amber-800">ИИ проанализирует ваши данные и составит персональный план питания на {data.duration_days} дней с рецептами, расписанием и рекомендациями.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      );

    default:
      return null;
  }
}