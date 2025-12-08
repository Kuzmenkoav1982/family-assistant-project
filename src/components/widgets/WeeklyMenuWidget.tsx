import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

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

const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

const mealIcons = {
  breakfast: '☀️',
  lunch: '🍽️',
  dinner: '🌙',
  snack: '🍪'
};

export function WeeklyMenuWidget() {
  const navigate = useNavigate();
  const [weeklyMenu, setWeeklyMenu] = useState<MealPlan[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('family_meal_plan');
    if (saved) {
      try {
        setWeeklyMenu(JSON.parse(saved));
      } catch {
        setWeeklyMenu([]);
      }
    }
  }, []);

  const daysMap = {
    'monday': 'Понедельник',
    'tuesday': 'Вторник',
    'wednesday': 'Среда',
    'thursday': 'Четверг',
    'friday': 'Пятница',
    'saturday': 'Суббота',
    'sunday': 'Воскресенье'
  } as Record<string, string>;

  const mealTypesMap = {
    'breakfast': 'Завтрак',
    'lunch': 'Обед',
    'dinner': 'Ужин'
  } as Record<string, string>;
  
  const currentDayOfWeek = new Date().toLocaleString('en-US', { weekday: 'long' }).toLowerCase();
  const todayMeals = weeklyMenu.filter(plan => plan.day === currentDayOfWeek);
  
  const uniqueDays = Array.from(new Set(weeklyMenu.map(m => m.day)));
  const totalPlanned = weeklyMenu.length;

  return (
    <Card 
      className="animate-fade-in border-teal-200 bg-gradient-to-br from-teal-50 to-cyan-50 cursor-pointer hover:shadow-lg transition-all"
      onClick={() => navigate('/meals')}
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="UtensilsCrossed" size={24} />
          Меню на неделю
          {totalPlanned > 0 && (
            <Badge className="ml-auto bg-teal-500">
              {totalPlanned} блюд
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {totalPlanned === 0 ? (
          <div className="text-center py-6">
            <Icon name="ChefHat" size={48} className="mx-auto text-gray-400 mb-2" />
            <p className="text-sm text-gray-600">Меню не запланировано</p>
          </div>
        ) : (
          <div className="space-y-3">
            {todayMeals.length > 0 && (
              <div className="p-3 rounded-lg bg-gradient-to-r from-teal-100 to-cyan-100 border-2 border-teal-300">
                <div className="flex items-center gap-2 mb-2">
                  <Icon name="Calendar" size={16} className="text-teal-700" />
                  <h4 className="font-bold text-sm text-teal-700">Сегодня</h4>
                </div>
                <div className="space-y-1.5">
                  {todayMeals.map((meal) => (
                    <div key={meal.id} className="flex items-start gap-2 text-xs">
                      <span className="text-base">{meal.emoji || mealIcons[meal.mealType]}</span>
                      <div className="flex-1">
                        <span className="font-semibold text-gray-600">{mealTypesMap[meal.mealType]}:</span>
                        <p className="text-gray-700">{meal.dishName}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {uniqueDays.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-bold text-xs text-gray-600">На неделю</h4>
                {uniqueDays.slice(0, 3).map((day, idx) => {
                  const dayMeals = weeklyMenu.filter(m => m.day === day);
                  const mealsCount = dayMeals.length;
                  
                  return (
                    <div key={idx} className="p-2 rounded-lg bg-white border border-teal-100">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[10px] bg-teal-50">
                            {daysMap[day] || day}
                          </Badge>
                        </div>
                        <Badge variant="outline" className="text-[10px]">
                          <Icon name="UtensilsCrossed" size={10} className="mr-1" />
                          {mealsCount}
                        </Badge>
                      </div>
                      {dayMeals[0] && (
                        <p className="text-xs text-gray-600 mt-1 truncate">
                          {dayMeals[0].emoji || '🍽️'} {dayMeals[0].dishName}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full mt-3 text-teal-600"
          onClick={(e) => {
            e.stopPropagation();
            navigate('/meals');
          }}
        >
          Открыть полное меню →
        </Button>
      </CardContent>
    </Card>
  );
}