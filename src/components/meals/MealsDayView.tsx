import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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

interface MealsDayViewProps {
  selectedDay: string;
  onDayChange: (day: string) => void;
  selectedDayLabel: string;
  mealsForSelectedDay: MealPlan[];
  onEditMeal: (meal: MealPlan) => void;
  onDeleteMeal: (id: string) => void;
  daysOfWeek: { value: string; label: string }[];
  mealTypes: { value: string; label: string; emoji: string }[];
}

const MEAL_TYPE_LABELS: Record<string, string> = {
  breakfast: 'Завтрак',
  lunch: 'Обед',
  dinner: 'Ужин'
};

export function MealsDayView({
  selectedDay,
  onDayChange,
  selectedDayLabel,
  mealsForSelectedDay,
  onEditMeal,
  onDeleteMeal,
  daysOfWeek,
  mealTypes
}: MealsDayViewProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Icon name="Calendar" size={24} />
            День: {selectedDayLabel}
          </CardTitle>
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
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {mealTypes.map(type => {
            const meals = mealsForSelectedDay.filter(m => m.mealType === type.value);
            return (
              <div key={type.value}>
                <h3 className="font-semibold mb-3 flex items-center gap-2 text-lg">
                  <span>{type.emoji}</span>
                  {MEAL_TYPE_LABELS[type.value]}
                </h3>
                {meals.length > 0 ? (
                  <div className="space-y-2">
                    {meals.map(meal => (
                      <Card key={meal.id} className="bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-2xl">{meal.emoji || type.emoji}</span>
                                <h4 className="font-semibold text-lg">{meal.dishName}</h4>
                              </div>
                              {meal.description && (
                                <p className="text-sm text-gray-600 mb-2">{meal.description}</p>
                              )}
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  <Icon name="User" size={12} className="mr-1" />
                                  {meal.addedByName}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  <Icon name="Clock" size={12} className="mr-1" />
                                  {new Date(meal.addedAt).toLocaleDateString('ru-RU')}
                                </Badge>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => onEditMeal(meal)}
                              >
                                <Icon name="Edit" size={16} />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => onDeleteMeal(meal.id)}
                              >
                                <Icon name="Trash2" size={16} />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400 border-2 border-dashed rounded-lg">
                    <Icon name="UtensilsCrossed" size={32} className="mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Блюд не добавлено</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
