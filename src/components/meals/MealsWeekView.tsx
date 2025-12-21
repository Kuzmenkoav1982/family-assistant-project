import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { DayColumn } from '@/components/meals/DayColumn';

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

interface MealsWeekViewProps {
  daysOfWeek: { value: string; label: string }[];
  getMealsByType: (day: string, type: MealPlan['mealType']) => MealPlan[];
  onQuickAddMeal: (day: string, mealType: MealPlan['mealType']) => void;
  onEditMeal: (meal: MealPlan) => void;
  onDeleteMeal: (id: string) => void;
}

export function MealsWeekView({
  daysOfWeek,
  getMealsByType,
  onQuickAddMeal,
  onEditMeal,
  onDeleteMeal
}: MealsWeekViewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="Calendar" size={24} />
          Неделя
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
          {daysOfWeek.map(day => (
            <DayColumn
              key={day.value}
              day={day}
              getMealsByType={getMealsByType}
              onQuickAddMeal={onQuickAddMeal}
              onEditMeal={onEditMeal}
              deleteMeal={onDeleteMeal}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
