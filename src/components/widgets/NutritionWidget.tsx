import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import func2url from '../../../backend/func2url.json';

const NUTRITION_API_URL = func2url['nutrition'];

interface NutritionData {
  totals: {
    total_calories: number;
    total_protein: number;
    total_fats: number;
    total_carbs: number;
    entries_count: number;
  };
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

export function NutritionWidget() {
  const navigate = useNavigate();
  const [nutritionData, setNutritionData] = useState<NutritionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNutritionData();
  }, []);

  const loadNutritionData = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const url = `${NUTRITION_API_URL}/?action=analytics&user_id=all&date=${today}`;
      
      console.log('[NutritionWidget] Fetching:', url);

      const response = await fetch(url);
      console.log('[NutritionWidget] Response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('[NutritionWidget] Received data:', data);
        setNutritionData(data);
      } else {
        const errorText = await response.text();
        console.error('[NutritionWidget] Response not OK:', response.status, errorText);
      }
    } catch (error) {
      console.error('[NutritionWidget] Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const caloriesProgress = nutritionData?.progress?.calories || 0;
  const totalCalories = nutritionData?.totals?.total_calories || 0;
  const goalCalories = nutritionData?.goals?.daily_calories || 2000;
  const entriesCount = nutritionData?.totals?.entries_count || 0;

  return (
    <Card 
      className="animate-fade-in border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50 cursor-pointer hover:shadow-lg transition-all"
      onClick={() => navigate('/nutrition')}
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="Apple" size={24} />
          Питание
          {entriesCount > 0 && (
            <Badge className="ml-auto bg-orange-500">
              {entriesCount} запис{entriesCount === 1 ? 'ь' : 'ей'}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-6">
            <Icon name="Loader" size={48} className="mx-auto text-gray-400 mb-2 animate-spin" />
            <p className="text-sm text-gray-600">Загрузка...</p>
          </div>
        ) : totalCalories === 0 ? (
          <div className="text-center py-6">
            <Icon name="Apple" size={48} className="mx-auto text-gray-400 mb-2" />
            <p className="text-sm text-gray-600">Нет записей за сегодня</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-gradient-to-r from-orange-100 to-amber-100 border-2 border-orange-300">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Icon name="Flame" size={20} className="text-orange-600" />
                  <h4 className="font-bold text-sm text-orange-700">Калории сегодня</h4>
                </div>
                <Badge variant="outline" className="text-xs bg-white border-orange-300 text-orange-700">
                  {caloriesProgress.toFixed(0)}%
                </Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-bold text-orange-900">
                    {totalCalories.toFixed(0)}
                  </span>
                  <span className="text-sm text-gray-600">
                    из {goalCalories} ккал
                  </span>
                </div>
                <Progress 
                  value={caloriesProgress} 
                  className="h-2"
                />
              </div>
            </div>

            {nutritionData && (
              <div className="grid grid-cols-3 gap-2">
                <div className="p-2 rounded-lg bg-blue-50 border border-blue-200">
                  <p className="text-[10px] text-gray-600 mb-1">Белки</p>
                  <p className="text-sm font-bold text-blue-700">
                    {nutritionData.totals.total_protein.toFixed(0)}г
                  </p>
                  <Progress 
                    value={nutritionData.progress.protein} 
                    className="h-1 mt-1"
                  />
                </div>
                
                <div className="p-2 rounded-lg bg-amber-50 border border-amber-200">
                  <p className="text-[10px] text-gray-600 mb-1">Жиры</p>
                  <p className="text-sm font-bold text-amber-700">
                    {nutritionData.totals.total_fats.toFixed(0)}г
                  </p>
                  <Progress 
                    value={nutritionData.progress.fats} 
                    className="h-1 mt-1"
                  />
                </div>
                
                <div className="p-2 rounded-lg bg-green-50 border border-green-200">
                  <p className="text-[10px] text-gray-600 mb-1">Углеводы</p>
                  <p className="text-sm font-bold text-green-700">
                    {nutritionData.totals.total_carbs.toFixed(0)}г
                  </p>
                  <Progress 
                    value={nutritionData.progress.carbs} 
                    className="h-1 mt-1"
                  />
                </div>
              </div>
            )}
          </div>
        )}
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full mt-3 text-orange-600"
          onClick={(e) => {
            e.stopPropagation();
            navigate('/nutrition');
          }}
        >
          Подробнее о питании →
        </Button>
      </CardContent>
    </Card>
  );
}