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
  dayValue: string;
  dayLabel: string;
  getMealsByType: (day: string, type: MealPlan['mealType']) => MealPlan[];
  onQuickAdd: (day: string, mealType: MealPlan['mealType']) => void;
  onEdit: (meal: MealPlan) => void;
  onDelete: (id: string) => void;
}

export function DayColumn({
  dayValue,
  dayLabel,
  getMealsByType,
  onQuickAdd,
  onEdit,
  onDelete
}: DayColumnProps) {
  return (
    <Card className="bg-gradient-to-br from-orange-50 to-amber-50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg text-center">{dayLabel}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {MEAL_TYPES.map(mealType => {
          const meals = getMealsByType(dayValue, mealType.value as MealPlan['mealType']);
          return (
            <div key={mealType.value} className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold flex items-center gap-1">
                  <span>{mealType.emoji}</span>
                  <span>{mealType.label.replace(mealType.emoji, '').trim()}</span>
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs"
                  onClick={() => onQuickAdd(dayValue, mealType.value as MealPlan['mealType'])}
                >
                  <Icon name="Plus" size={12} className="mr-1" />
                  Добавить
                </Button>
              </div>

              {meals.length === 0 ? (
                <Card className="bg-white/50 border-dashed">
                  <CardContent className="p-3 text-center text-xs text-muted-foreground">
                    Нет блюд
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-2">
                  {meals.map(meal => (
                    <MealCard
                      key={meal.id}
                      meal={meal}
                      onEdit={onEdit}
                      onDelete={onDelete}
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
