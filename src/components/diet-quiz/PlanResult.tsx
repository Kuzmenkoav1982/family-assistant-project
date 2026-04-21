import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import MealRecipeCard from '@/components/MealRecipeCard';
import type { GeneratedPlan } from '@/data/dietQuizData';

interface PlanResultProps {
  plan: GeneratedPlan;
  selectedDay: number;
  setSelectedDay: (d: number) => void;
  isSaving: boolean;
  saved: boolean;
  savedPlanId: number | null;
  onSaveToMenu: (replace: boolean) => void;
  onBack: () => void;
  navigate: (path: string) => void;
}

export default function PlanResult({
  plan, selectedDay, setSelectedDay,
  isSaving, saved, savedPlanId,
  onSaveToMenu, onBack, navigate,
}: PlanResultProps) {
  const currentDay = plan.days[selectedDay];

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-white pb-24">
      <div className="max-w-2xl mx-auto p-4 space-y-5">
        <div className="flex items-center gap-3 pt-2">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <Icon name="ArrowLeft" size={18} />
          </Button>
          <div>
            <h1 className="text-lg font-bold">Ваш план питания</h1>
            <p className="text-xs text-muted-foreground">
              Персональный на {plan.days.length} {plan.days.length === 1 ? 'день' : plan.days.length < 5 ? 'дня' : 'дней'}
            </p>
          </div>
        </div>

        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-4">
            <div className="grid grid-cols-4 gap-3 text-center">
              <div>
                <div className="text-lg font-bold text-green-700">{plan.daily_calories}</div>
                <div className="text-[10px] text-muted-foreground">ккал/день</div>
              </div>
              <div>
                <div className="text-lg font-bold text-blue-600">{plan.daily_protein}г</div>
                <div className="text-[10px] text-muted-foreground">белки</div>
              </div>
              <div>
                <div className="text-lg font-bold text-amber-600">{plan.daily_fats}г</div>
                <div className="text-[10px] text-muted-foreground">жиры</div>
              </div>
              <div>
                <div className="text-lg font-bold text-orange-600">{plan.daily_carbs}г</div>
                <div className="text-[10px] text-muted-foreground">углеводы</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-1 overflow-x-auto pb-1">
          {plan.days.map((day, i) => (
            <button key={i} onClick={() => setSelectedDay(i)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                i === selectedDay ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}>
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
            <Button className="w-full bg-gradient-to-r from-green-500 to-emerald-600" disabled={isSaving} onClick={() => onSaveToMenu(true)}>
              {isSaving ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Сохраняю...
                </div>
              ) : (
                <><Icon name="CalendarDays" size={16} className="mr-2" />Заменить меню на неделю</>
              )}
            </Button>
            <Button variant="outline" className="w-full" disabled={isSaving} onClick={() => onSaveToMenu(false)}>
              <Icon name="Plus" size={16} className="mr-2" />
              Добавить к текущему меню
            </Button>
            {savedPlanId && (
              <Button variant="outline" className="w-full border-violet-300 text-violet-700 hover:bg-violet-50" onClick={() => navigate('/nutrition/progress')}>
                <Icon name="TrendingUp" size={16} className="mr-2" />
                Отслеживать прогресс
              </Button>
            )}
            <div className="flex gap-3">
              <Button variant="ghost" className="flex-1 text-sm" onClick={onBack}>
                <Icon name="RefreshCw" size={14} className="mr-1" />Заново
              </Button>
              <Button variant="ghost" className="flex-1 text-sm" onClick={() => navigate('/nutrition')}>К питанию</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}