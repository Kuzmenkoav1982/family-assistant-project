import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import type { TodayMeal } from '@/data/dietProgressTypes';
import { mealTypeLabels, mealTypeIcons } from '@/data/dietProgressTypes';

interface TodayMealsProps {
  meals: TodayMeal[];
  markingMeal: number | null;
  mealMenu: number | null;
  setMealMenu: (v: number | null) => void;
  onEat: (id: number) => void;
  onUndo: (id: number) => void;
  onSaveRecipe: (id: number) => void;
  onAddToShopping: (ids: number[]) => void;
}

export default function TodayMeals({
  meals, markingMeal, mealMenu, setMealMenu,
  onEat, onUndo, onSaveRecipe, onAddToShopping,
}: TodayMealsProps) {
  if (!meals || meals.length === 0) return null;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold flex items-center gap-2">
            <Icon name="UtensilsCrossed" size={18} className="text-green-600" />
            Сегодня
          </h3>
          <Button size="sm" variant="outline" className="text-xs h-7 shrink-0"
            onClick={() => onAddToShopping(meals.filter(m => !m.completed).map(m => m.id))}>
            <Icon name="ShoppingCart" size={12} className="mr-1" />
            <span className="hidden sm:inline">Всё в </span>покупки
          </Button>
        </div>
        <div className="space-y-2">
          {meals.map(meal => (
            <div key={meal.id} className="space-y-1">
              <div className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                meal.completed ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
              }`}>
                <div className="text-xl flex-shrink-0">{mealTypeIcons[meal.meal_type] || '\u{1F37D}'}</div>
                <div className="flex-1 min-w-0" onClick={() => setMealMenu(mealMenu === meal.id ? null : meal.id)}>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{meal.time}</span>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                      {mealTypeLabels[meal.meal_type] || meal.meal_type}
                    </Badge>
                  </div>
                  <p className={`text-sm font-medium truncate ${meal.completed ? 'line-through text-muted-foreground' : ''}`}>
                    {meal.title}
                  </p>
                  <p className="text-xs text-muted-foreground">{meal.calories} ккал | Б:{meal.protein} Ж:{meal.fats} У:{meal.carbs}</p>
                </div>
                {meal.completed ? (
                  <Button size="sm" variant="outline" className="bg-green-100 border-green-300 text-green-700"
                    disabled={markingMeal === meal.id} onClick={() => onUndo(meal.id)}>
                    {markingMeal === meal.id ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <Icon name="Check" size={14} />}
                  </Button>
                ) : (
                  <Button size="sm" className="bg-green-600" disabled={markingMeal === meal.id} onClick={() => onEat(meal.id)}>
                    {markingMeal === meal.id ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <>
                      <Icon name="UtensilsCrossed" size={14} className="mr-1" />
                      <span className="text-xs">Съел</span>
                    </>}
                  </Button>
                )}
              </div>
              {mealMenu === meal.id && (
                <div className="flex gap-1 pl-10">
                  <Button size="sm" variant="ghost" className="text-xs h-7 px-2" onClick={() => onSaveRecipe(meal.id)}>
                    <Icon name="BookOpen" size={12} className="mr-1" />
                    В рецепты
                  </Button>
                  <Button size="sm" variant="ghost" className="text-xs h-7 px-2" onClick={() => onAddToShopping([meal.id])}>
                    <Icon name="ShoppingCart" size={12} className="mr-1" />
                    В покупки
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
