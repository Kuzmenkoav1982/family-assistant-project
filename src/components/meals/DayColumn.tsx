import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { MealCard } from './MealCard';

interface MealPlan {
  id: string;
  day: string;
  mealType: 'breakfast' | 'lunch' | 'dinner';
  dishName: string;
  description?: string;
  addedBy: string;
  addedByName: string;
  addedAt: string;
  emoji?: string;
}

const MEAL_TYPES = [
  { value: 'breakfast', label: '🍳 Завтрак', emoji: '🍳' },
  { value: 'lunch', label: '🍽️ Обед', emoji: '🍽️' },
  { value: 'dinner', label: '🍷 Ужин', emoji: '🍷' }
];

interface DayColumnProps {
  day: { value: string; label: string };
  getMealsByType: (day: string, type: MealPlan['mealType']) => MealPlan[];
  onQuickAddMeal: (day: string, mealType: MealPlan['mealType']) => void;
  onEditMeal: (meal: MealPlan) => void;
  deleteMeal: (id: string) => void;
}

export function DayColumn({
  day,
  getMealsByType,
  onQuickAddMeal,
  onEditMeal,
  deleteMeal
}: DayColumnProps) {
  return (
    <Card className="bg-gradient-to-br from-orange-50 to-amber-50 flex flex-col h-full">
      <CardHeader className="pb-2 pt-3 px-3">
        <CardTitle className="text-sm font-bold text-center truncate">{day.label}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 px-3 pb-3 flex-1 overflow-auto">
        {MEAL_TYPES.map(mealType => {
          const meals = getMealsByType(day.value, mealType.value as MealPlan['mealType']) || [];
          return (
            <div key={mealType.value} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold flex items-center gap-1">
                  <span className="text-base">{mealType.emoji}</span>
                  <span className="truncate">{mealType.label.replace(mealType.emoji, '').trim()}</span>
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 w-5 p-0 hover:bg-orange-200"
                  onClick={() => onQuickAddMeal(day.value, mealType.value as MealPlan['mealType'])}
                  title="Добавить блюдо"
                >
                  <Icon name="Plus" size={12} />
                </Button>
              </div>

              {!meals || meals.length === 0 ? (
                <div className="bg-white/50 border-dashed border-gray-300 rounded-lg p-2 text-center text-[10px] text-muted-foreground">
                  Нет блюд
                </div>
              ) : (
                <div className="space-y-1.5">
                  {meals.map(meal => (
                    <MealCard
                      key={meal.id}
                      meal={meal}
                      onEdit={onEditMeal}
                      onDelete={deleteMeal}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}