import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MealCard } from '@/components/meals/MealCard';

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

const MEAL_TYPES_ORDER: { value: MealPlan['mealType']; label: string; emoji: string }[] = [
  { value: 'breakfast', label: 'Завтрак', emoji: '🍳' },
  { value: 'lunch', label: 'Обед', emoji: '🍽️' },
  { value: 'dinner', label: 'Ужин', emoji: '🍷' }
];

interface MealsDayViewProps {
  selectedDay: string;
  onDayChange: (day: string) => void;
  selectedDayLabel: string;
  mealsForSelectedDay: MealPlan[];
  onEditMeal: (meal: MealPlan) => void;
  onDeleteMeal: (id: string) => void;
  daysOfWeek: { value: string; label: string }[];
  mealTypes: { value: string; label: string; emoji: string }[];
  onQuickAddMeal?: (day: string, mealType: MealPlan['mealType']) => void;
}

export function MealsDayView({
  selectedDay,
  onDayChange,
  selectedDayLabel,
  mealsForSelectedDay,
  onEditMeal,
  onDeleteMeal,
  daysOfWeek,
  onQuickAddMeal
}: MealsDayViewProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 font-semibold">
          <Icon name="Calendar" size={20} />
          День: {selectedDayLabel}
        </h3>
        <Select value={selectedDay} onValueChange={onDayChange}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {daysOfWeek.map(day => (
              <SelectItem key={day.value} value={day.value}>
                {day.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        {MEAL_TYPES_ORDER.map(mealType => {
          const meals = mealsForSelectedDay.filter(m => m.mealType === mealType.value);
          return (
            <div key={mealType.value}>
              {meals.length > 0 ? (
                <div className="space-y-2">
                  {meals.map(meal => (
                    <MealCard
                      key={meal.id}
                      meal={meal}
                      onEdit={onEditMeal}
                      onDelete={onDeleteMeal}
                    />
                  ))}
                </div>
              ) : (
                <div
                  className="flex items-center gap-3 p-3 border-2 border-dashed border-gray-200 rounded-lg cursor-pointer hover:border-orange-300 hover:bg-orange-50/30 transition-colors"
                  onClick={() => onQuickAddMeal?.(selectedDay, mealType.value)}
                >
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                    <span className="text-lg">{mealType.emoji}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-400">{mealType.label} не добавлен</p>
                  </div>
                  <Icon name="Plus" size={16} className="text-gray-400" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {onQuickAddMeal && (
        <Button
          variant="outline"
          className="w-full border-dashed border-orange-300 text-orange-600 hover:bg-orange-50"
          onClick={() => onQuickAddMeal(selectedDay, 'breakfast')}
        >
          <Icon name="Plus" size={16} className="mr-2" />
          Добавить блюдо
        </Button>
      )}
    </div>
  );
}
