import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

interface MealPlan {
  day: string;
  date: string;
  breakfast?: string;
  lunch?: string;
  dinner?: string;
  snack?: string;
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
    const saved = localStorage.getItem('weeklyMenu');
    if (saved) {
      try {
        setWeeklyMenu(JSON.parse(saved));
      } catch {
        setWeeklyMenu([]);
      }
    }
  }, []);

  const today = new Date().toISOString().split('T')[0];
  const todayPlan = weeklyMenu.find(plan => plan.date === today);
  
  const nextDays = weeklyMenu
    .filter(plan => new Date(plan.date) >= new Date())
    .slice(0, 3);

  const getTotalMeals = () => {
    return weeklyMenu.reduce((sum, day) => {
      let count = 0;
      if (day.breakfast) count++;
      if (day.lunch) count++;
      if (day.dinner) count++;
      if (day.snack) count++;
      return sum + count;
    }, 0);
  };

  const totalPlanned = getTotalMeals();

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
        {weeklyMenu.length === 0 || totalPlanned === 0 ? (
          <div className="text-center py-6">
            <Icon name="ChefHat" size={48} className="mx-auto text-gray-400 mb-2" />
            <p className="text-sm text-gray-600">Меню не запланировано</p>
          </div>
        ) : (
          <div className="space-y-3">
            {todayPlan && (
              <div className="p-3 rounded-lg bg-gradient-to-r from-teal-100 to-cyan-100 border-2 border-teal-300">
                <div className="flex items-center gap-2 mb-2">
                  <Icon name="Calendar" size={16} className="text-teal-700" />
                  <h4 className="font-bold text-sm text-teal-700">Сегодня</h4>
                </div>
                <div className="space-y-1.5">
                  {todayPlan.breakfast && (
                    <div className="flex items-start gap-2 text-xs">
                      <span className="text-base">{mealIcons.breakfast}</span>
                      <div className="flex-1">
                        <span className="font-semibold text-gray-600">Завтрак:</span>
                        <p className="text-gray-700">{todayPlan.breakfast}</p>
                      </div>
                    </div>
                  )}
                  {todayPlan.lunch && (
                    <div className="flex items-start gap-2 text-xs">
                      <span className="text-base">{mealIcons.lunch}</span>
                      <div className="flex-1">
                        <span className="font-semibold text-gray-600">Обед:</span>
                        <p className="text-gray-700">{todayPlan.lunch}</p>
                      </div>
                    </div>
                  )}
                  {todayPlan.dinner && (
                    <div className="flex items-start gap-2 text-xs">
                      <span className="text-base">{mealIcons.dinner}</span>
                      <div className="flex-1">
                        <span className="font-semibold text-gray-600">Ужин:</span>
                        <p className="text-gray-700">{todayPlan.dinner}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {nextDays.length > (todayPlan ? 1 : 0) && (
              <div className="space-y-2">
                <h4 className="font-bold text-xs text-gray-600">Ближайшие дни</h4>
                {nextDays.slice(todayPlan ? 1 : 0, 3).map((plan, idx) => {
                  const dayIndex = new Date(plan.date).getDay();
                  const mealsCount = [plan.breakfast, plan.lunch, plan.dinner, plan.snack].filter(Boolean).length;
                  
                  return (
                    <div key={idx} className="p-2 rounded-lg bg-white border border-teal-100">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[10px] bg-teal-50">
                            {weekDays[dayIndex === 0 ? 6 : dayIndex - 1]}
                          </Badge>
                          <span className="text-xs text-gray-600">
                            {new Date(plan.date).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' })}
                          </span>
                        </div>
                        <Badge variant="outline" className="text-[10px]">
                          <Icon name="UtensilsCrossed" size={10} className="mr-1" />
                          {mealsCount}
                        </Badge>
                      </div>
                      {plan.dinner && (
                        <p className="text-xs text-gray-600 mt-1 truncate">
                          {mealIcons.dinner} {plan.dinner}
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
