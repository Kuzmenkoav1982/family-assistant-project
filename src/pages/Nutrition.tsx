import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';
import { useFamilyMembers } from '@/hooks/useFamilyMembers';

const NUTRITION_API_URL = 'https://functions.poehali.dev/c592ffff-18dd-4d1c-b199-ff8832c83a2c';

interface NutritionData {
  date: string;
  totals: {
    total_calories: number;
    total_protein: number;
    total_fats: number;
    total_carbs: number;
    entries_count: number;
  };
  by_meal: Array<{
    meal_type: string;
    calories: number;
    protein: number;
    fats: number;
    carbs: number;
  }>;
  goals: {
    daily_calories: number;
    daily_protein: number;
    daily_fats: number;
    daily_carbs: number;
  };
  progress: {
    calories: number;
    protein: number;
    fats: number;
    carbs: number;
  };
}

interface FoodDiaryEntry {
  id: number;
  meal_type: string;
  product_name: string;
  amount: number;
  calories: number;
  protein: number;
  fats: number;
  carbs: number;
  created_at: string;
}

export default function Nutrition() {
  const { members } = useFamilyMembers();
  const [selectedMemberId, setSelectedMemberId] = useState<number>(1);
  const [nutritionData, setNutritionData] = useState<NutritionData | null>(null);
  const [foodDiary, setFoodDiary] = useState<FoodDiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    loadNutritionData();
    loadFoodDiary();
  }, [selectedMemberId]);

  const loadNutritionData = async () => {
    try {
      const response = await fetch(
        `${NUTRITION_API_URL}/?action=analytics&user_id=${selectedMemberId}&date=${today}`
      );
      const data = await response.json();
      setNutritionData(data);
    } catch (error) {
      console.error('Ошибка загрузки аналитики:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFoodDiary = async () => {
    try {
      const response = await fetch(
        `${NUTRITION_API_URL}/?action=diary&user_id=${selectedMemberId}&date=${today}`
      );
      const data = await response.json();
      setFoodDiary(data.diary || []);
    } catch (error) {
      console.error('Ошибка загрузки дневника:', error);
    }
  };

  const getMealTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      breakfast: '🍳 Завтрак',
      lunch: '🍽️ Обед',
      dinner: '🍷 Ужин',
      snack: '🍎 Перекус'
    };
    return labels[type] || type;
  };

  const getProgressColor = (progress: number) => {
    if (progress < 80) return 'bg-green-500';
    if (progress < 100) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getProgressStatus = (progress: number) => {
    if (progress < 50) return { icon: 'TrendingDown', text: 'Мало', color: 'text-blue-500' };
    if (progress < 80) return { icon: 'CheckCircle2', text: 'Отлично', color: 'text-green-500' };
    if (progress < 100) return { icon: 'AlertCircle', text: 'Близко к норме', color: 'text-yellow-500' };
    return { icon: 'AlertTriangle', text: 'Превышение', color: 'text-red-500' };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Icon name="Loader2" className="animate-spin" size={48} />
      </div>
    );
  }

  if (!nutritionData) return null;

  const caloriesStatus = getProgressStatus(nutritionData.progress.calories);
  const proteinStatus = getProgressStatus(nutritionData.progress.protein);
  const fatsStatus = getProgressStatus(nutritionData.progress.fats);
  const carbsStatus = getProgressStatus(nutritionData.progress.carbs);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white p-4 pb-24">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Заголовок */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Icon name="Apple" className="text-green-600" size={36} />
              Питание
            </h1>
            <p className="text-gray-600 mt-1">Анализ и контроль питания семьи</p>
          </div>
        </div>

        {/* Выбор члена семьи */}
        {members.length > 0 && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-3 overflow-x-auto pb-2">
                {members.map((member) => (
                  <Button
                    key={member.id}
                    variant={selectedMemberId === parseInt(member.id) ? 'default' : 'outline'}
                    onClick={() => setSelectedMemberId(parseInt(member.id))}
                    className="flex items-center gap-2 whitespace-nowrap"
                  >
                    <span className="text-xl">{member.avatar}</span>
                    {member.name}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Главная статистика */}
        <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-white">
              <Icon name="Flame" size={28} />
              Калории сегодня
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-baseline gap-3">
                <div className="text-5xl font-bold">
                  {Math.round(nutritionData.totals.total_calories)}
                </div>
                <div className="text-xl opacity-90">
                  / {nutritionData.goals.daily_calories} ккал
                </div>
              </div>
              <Progress 
                value={nutritionData.progress.calories} 
                className="h-3 bg-white/20"
              />
              <div className="flex items-center gap-2 text-sm">
                <Icon name={caloriesStatus.icon} size={18} />
                <span>{caloriesStatus.text} — {Math.round(nutritionData.progress.calories)}% от нормы</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* БЖУ карточки */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Icon name="Beef" size={18} className="text-red-500" />
                Белки
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {Math.round(nutritionData.totals.total_protein)}г
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Норма: {nutritionData.goals.daily_protein}г
              </div>
              <Progress 
                value={nutritionData.progress.protein} 
                className={`h-2 mt-2 ${getProgressColor(nutritionData.progress.protein)}`}
              />
              <div className={`text-xs mt-1 flex items-center gap-1 ${proteinStatus.color}`}>
                <Icon name={proteinStatus.icon} size={14} />
                {proteinStatus.text}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Icon name="Droplet" size={18} className="text-yellow-500" />
                Жиры
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {Math.round(nutritionData.totals.total_fats)}г
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Норма: {nutritionData.goals.daily_fats}г
              </div>
              <Progress 
                value={nutritionData.progress.fats} 
                className={`h-2 mt-2 ${getProgressColor(nutritionData.progress.fats)}`}
              />
              <div className={`text-xs mt-1 flex items-center gap-1 ${fatsStatus.color}`}>
                <Icon name={fatsStatus.icon} size={14} />
                {fatsStatus.text}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Icon name="Wheat" size={18} className="text-orange-500" />
                Углеводы
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {Math.round(nutritionData.totals.total_carbs)}г
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Норма: {nutritionData.goals.daily_carbs}г
              </div>
              <Progress 
                value={nutritionData.progress.carbs} 
                className={`h-2 mt-2 ${getProgressColor(nutritionData.progress.carbs)}`}
              />
              <div className={`text-xs mt-1 flex items-center gap-1 ${carbsStatus.color}`}>
                <Icon name={carbsStatus.icon} size={14} />
                {carbsStatus.text}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Дневник питания */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="BookOpen" size={24} />
              Дневник питания
            </CardTitle>
          </CardHeader>
          <CardContent>
            {foodDiary.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Icon name="UtensilsCrossed" size={48} className="mx-auto mb-4 opacity-30" />
                <p>Записей пока нет</p>
                <p className="text-sm mt-2">Добавьте приём пищи в разделе "Меню"</p>
              </div>
            ) : (
              <div className="space-y-4">
                {['breakfast', 'lunch', 'dinner', 'snack'].map(mealType => {
                  const meals = foodDiary.filter(entry => entry.meal_type === mealType);
                  if (meals.length === 0) return null;
                  
                  const totalCal = meals.reduce((sum, m) => sum + m.calories, 0);
                  
                  return (
                    <div key={mealType} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-lg">{getMealTypeLabel(mealType)}</h3>
                        <Badge variant="secondary">{Math.round(totalCal)} ккал</Badge>
                      </div>
                      <div className="space-y-2">
                        {meals.map(meal => (
                          <div key={meal.id} className="flex justify-between items-center text-sm bg-gray-50 rounded p-2">
                            <div>
                              <div className="font-medium">{meal.product_name}</div>
                              <div className="text-gray-500 text-xs">
                                {meal.amount}г · Б: {Math.round(meal.protein)}г · Ж: {Math.round(meal.fats)}г · У: {Math.round(meal.carbs)}г
                              </div>
                            </div>
                            <div className="font-semibold">{Math.round(meal.calories)} ккал</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Кнопка спросить Кузю */}
        <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
          <CardContent className="pt-6">
            <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
              <Icon name="Sparkles" className="mr-2" />
              Спросить Кузю-диетолога
            </Button>
            <p className="text-sm text-gray-600 mt-3 text-center">
              Кузя проанализирует ваше питание и даст персональные рекомендации
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
