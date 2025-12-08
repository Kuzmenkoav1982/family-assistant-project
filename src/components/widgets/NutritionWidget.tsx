import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useNavigate } from 'react-router-dom';
import { useFamilyMembersContext } from '@/contexts/FamilyMembersContext';

const allergyIcons: Record<string, string> = {
  'глютен': '🌾',
  'лактоза': '🥛',
  'орехи': '🥜',
  'рыба': '🐟',
  'яйца': '🥚',
  'соя': '🫘',
  'морепродукты': '🦐'
};

export function NutritionWidget() {
  const navigate = useNavigate();
  const { members } = useFamilyMembersContext();

  const allFavorites = members?.flatMap(m => m.foodPreferences?.favorites || []) || [];
  const allDislikes = members?.flatMap(m => m.foodPreferences?.dislikes || []) || [];
  const allAllergies = members?.flatMap(m => m.foodPreferences?.allergies || []) || [];

  const uniqueAllergies = Array.from(new Set(allAllergies));
  const topFavorites = [...new Set(allFavorites)].slice(0, 3);
  
  const getDietCount = (diet: string) => {
    return members?.filter(m => m.foodPreferences?.diet === diet).length || 0;
  };

  const diets = [
    { name: 'Веган', icon: '🌱', count: getDietCount('Веган') },
    { name: 'Вегетарианец', icon: '🥗', count: getDietCount('Вегетарианец') },
    { name: 'Без глютена', icon: '🌾', count: getDietCount('Безглютеновая') },
  ].filter(d => d.count > 0);

  return (
    <Card 
      className="animate-fade-in border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50 cursor-pointer hover:shadow-lg transition-all"
      onClick={() => navigate('/nutrition')}
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="Apple" size={24} />
          Питание
          {uniqueAllergies.length > 0 && (
            <Badge className="ml-auto bg-red-500">
              <Icon name="AlertTriangle" size={12} className="mr-1" />
              {uniqueAllergies.length}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {uniqueAllergies.length > 0 && (
            <div className="p-3 rounded-lg bg-red-50 border-2 border-red-200">
              <div className="flex items-center gap-2 mb-2">
                <Icon name="AlertTriangle" size={16} className="text-red-600" />
                <h4 className="font-bold text-sm text-red-700">Аллергии семьи</h4>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {uniqueAllergies.map((allergy, idx) => (
                  <Badge 
                    key={idx}
                    variant="outline" 
                    className="text-xs bg-white border-red-300 text-red-700"
                  >
                    {allergyIcons[allergy.toLowerCase()] || '⚠️'} {allergy}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {diets.length > 0 && (
            <div className="p-3 rounded-lg bg-green-50 border-2 border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <Icon name="Salad" size={16} className="text-green-600" />
                <h4 className="font-bold text-sm text-green-700">Диеты</h4>
              </div>
              <div className="space-y-1">
                {diets.map((diet, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700">
                      {diet.icon} {diet.name}
                    </span>
                    <Badge variant="outline" className="text-[10px]">
                      {diet.count} чел.
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {topFavorites.length > 0 && (
            <div className="p-3 rounded-lg bg-amber-50 border-2 border-amber-200">
              <div className="flex items-center gap-2 mb-2">
                <Icon name="Heart" size={16} className="text-amber-600" />
                <h4 className="font-bold text-sm text-amber-700">Любимые блюда</h4>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {topFavorites.map((fav, idx) => (
                  <Badge 
                    key={idx}
                    variant="outline" 
                    className="text-xs bg-white border-amber-300 text-amber-700"
                  >
                    {fav}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {allDislikes.length > 0 && (
            <div className="p-2 rounded bg-gray-50 border border-gray-200">
              <p className="text-xs text-gray-600">
                <Icon name="ThumbsDown" size={12} className="inline mr-1" />
                Не любят: {allDislikes.slice(0, 2).join(', ')}
                {allDislikes.length > 2 && ` +${allDislikes.length - 2}`}
              </p>
            </div>
          )}
        </div>
        
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
