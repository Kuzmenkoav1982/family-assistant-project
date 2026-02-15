import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
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
  ingredients?: string[];
}

const MEAL_TYPES: { value: MealPlan['mealType']; label: string; emoji: string }[] = [
  { value: 'breakfast', label: 'Завтрак', emoji: '🍳' },
  { value: 'lunch', label: 'Обед', emoji: '🍽️' },
  { value: 'dinner', label: 'Ужин', emoji: '🍷' }
];

interface MealsWeekViewProps {
  daysOfWeek: { value: string; label: string }[];
  getMealsByType: (day: string, type: MealPlan['mealType']) => MealPlan[];
  onQuickAddMeal: (day: string, mealType: MealPlan['mealType']) => void;
  onEditMeal: (meal: MealPlan) => void;
  onDeleteMeal: (id: string) => void;
  onAddDayToShopping?: (day: string) => void;
}

export function MealsWeekView({
  daysOfWeek,
  getMealsByType,
  onQuickAddMeal,
  onEditMeal,
  onDeleteMeal,
  onAddDayToShopping
}: MealsWeekViewProps) {
  const [activeDay, setActiveDay] = useState(daysOfWeek[0]?.value || 'monday');

  const activeDayLabel = daysOfWeek.find(d => d.value === activeDay)?.label || '';

  return (
    <div className="space-y-4">
      <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide">
        {daysOfWeek.map(day => {
          const isActive = day.value === activeDay;
          const dayMeals = MEAL_TYPES.reduce(
            (acc, t) => acc + getMealsByType(day.value, t.value).length, 0
          );
          return (
            <button
              key={day.value}
              onClick={() => setActiveDay(day.value)}
              className={`px-3 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-orange-50 border border-gray-200'
              }`}
            >
              {day.label.slice(0, 2)}
              {dayMeals > 0 && (
                <span className={`ml-1 text-[10px] ${isActive ? 'text-orange-100' : 'text-gray-400'}`}>
                  {dayMeals}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="text-center text-sm font-medium text-gray-500 mb-2">
        {activeDayLabel}
      </div>

      <div className="space-y-4">
        {MEAL_TYPES.map(mealType => {
          const meals = getMealsByType(activeDay, mealType.value);
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
                  onClick={() => onQuickAddMeal(activeDay, mealType.value)}
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

      <div className="flex gap-2">
        <Button
          variant="outline"
          className="flex-1 border-dashed border-orange-300 text-orange-600 hover:bg-orange-50"
          onClick={() => onQuickAddMeal(activeDay, 'breakfast')}
        >
          <Icon name="Plus" size={16} className="mr-2" />
          Добавить блюдо
        </Button>
        {onAddDayToShopping && (() => {
          const dayIngCount = MEAL_TYPES.reduce((acc, t) => {
            const meals = getMealsByType(activeDay, t.value);
            return acc + meals.reduce((s, m) => s + (m.ingredients?.length || 0), 0);
          }, 0);
          return dayIngCount > 0 ? (
            <Button
              variant="outline"
              className="border-blue-300 text-blue-600 hover:bg-blue-50"
              onClick={() => onAddDayToShopping(activeDay)}
            >
              <Icon name="ShoppingCart" size={16} className="mr-2" />
              В покупки
              <Badge variant="secondary" className="ml-1.5 text-[10px] px-1.5 py-0">{dayIngCount}</Badge>
            </Button>
          ) : null;
        })()}
      </div>
    </div>
  );
}