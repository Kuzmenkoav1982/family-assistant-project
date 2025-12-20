import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';

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

interface NutritionStatsProps {
  nutritionData: NutritionData;
}

const getProgressStatus = (progress: number) => {
  if (progress < 50) return { icon: 'TrendingDown', text: 'Мало', color: 'text-blue-500' };
  if (progress < 80) return { icon: 'CheckCircle2', text: 'Отлично', color: 'text-green-500' };
  if (progress < 100) return { icon: 'AlertCircle', text: 'Близко к норме', color: 'text-yellow-500' };
  return { icon: 'AlertTriangle', text: 'Превышение', color: 'text-red-500' };
};

const getProgressColor = (progress: number) => {
  if (progress < 80) return 'bg-green-500';
  if (progress < 100) return 'bg-yellow-500';
  return 'bg-red-500';
};

export function NutritionStats({ nutritionData }: NutritionStatsProps) {
  const caloriesStatus = getProgressStatus(nutritionData.progress.calories);
  const proteinStatus = getProgressStatus(nutritionData.progress.protein);
  const fatsStatus = getProgressStatus(nutritionData.progress.fats);
  const carbsStatus = getProgressStatus(nutritionData.progress.carbs);

  return (
    <>
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
            <Progress 
              value={nutritionData.progress.protein} 
              className="h-2 mt-2"
            />
            <div className={`flex items-center gap-1 text-xs mt-2 ${proteinStatus.color}`}>
              <Icon name={proteinStatus.icon} size={14} />
              <span>{proteinStatus.text}</span>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Цель: {nutritionData.goals.daily_protein}г
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
            <Progress 
              value={nutritionData.progress.fats} 
              className="h-2 mt-2"
            />
            <div className={`flex items-center gap-1 text-xs mt-2 ${fatsStatus.color}`}>
              <Icon name={fatsStatus.icon} size={14} />
              <span>{fatsStatus.text}</span>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Цель: {nutritionData.goals.daily_fats}г
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
            <Progress 
              value={nutritionData.progress.carbs} 
              className="h-2 mt-2"
            />
            <div className={`flex items-center gap-1 text-xs mt-2 ${carbsStatus.color}`}>
              <Icon name={carbsStatus.icon} size={14} />
              <span>{carbsStatus.text}</span>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Цель: {nutritionData.goals.daily_carbs}г
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
