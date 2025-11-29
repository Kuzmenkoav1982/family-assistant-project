import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';
import { useChildrenData } from '@/hooks/useChildrenData';
import type { FamilyMember } from '@/types/family.types';

export function DevelopmentSection({ child }: { child: FamilyMember }) {
  const { data, loading } = useChildrenData(child.id);
  
  const developmentAreas = data?.development || [];
  
  const getAreaIcon = (area: string) => {
    switch (area) {
      case 'sport': return '⚽';
      case 'education': return '📚';
      case 'creativity': return '🎨';
      case 'social': return '🤝';
      case 'music': return '🎵';
      default: return '🎯';
    }
  };

  const getAreaName = (area: string) => {
    switch (area) {
      case 'sport': return 'Спорт';
      case 'education': return 'Образование';
      case 'creativity': return 'Творчество';
      case 'social': return 'Социальные навыки';
      case 'music': return 'Музыка';
      default: return area;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Icon name="TrendingUp" size={24} />
              Области развития
            </CardTitle>
            <Button variant="outline" className="gap-2">
              <Icon name="Plus" size={16} />
              Добавить область
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {loading ? (
            <div className="text-center py-4 text-gray-500">Загрузка...</div>
          ) : developmentAreas.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              <p>Областей развития пока нет</p>
              <p className="text-sm">Добавьте первую область для отслеживания прогресса</p>
            </div>
          ) : (
            developmentAreas.map((area: any) => (
              <div key={area.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{getAreaIcon(area.area)}</span>
                    <span className="font-semibold">{getAreaName(area.area)}</span>
                  </div>
                  <span className="text-sm text-gray-600">
                    {area.current_level}% → {area.target_level}%
                  </span>
                </div>
                <Progress value={area.current_level} className="h-2" />
                {area.activities && area.activities.length > 0 && (
                  <div className="mt-2 text-sm text-gray-600">
                    Занятий: {area.activities.length}
                  </div>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Icon name="Calendar" size={24} />
              Активности и занятия
            </CardTitle>
            <Button variant="outline" className="gap-2">
              <Icon name="Plus" size={16} />
              Добавить занятие
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="text-center py-4 text-gray-500">Загрузка...</div>
          ) : developmentAreas.length === 0 || !developmentAreas.some((d: any) => d.activities && d.activities.length > 0) ? (
            <div className="text-center py-4 text-gray-500">
              <p>Занятий пока нет</p>
              <p className="text-sm">Добавьте первое занятие для ребёнка</p>
            </div>
          ) : (
            developmentAreas.map((area: any) => 
              area.activities?.map((activity: any) => (
                <div key={activity.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                  <Icon name="CalendarDays" size={24} className="text-blue-600 mt-1" />
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold">{activity.name}</h4>
                        <p className="text-xs text-gray-500">{getAreaName(area.area)}</p>
                      </div>
                      <Badge variant={activity.status === 'active' ? 'default' : 'secondary'}>
                        {activity.status === 'active' ? 'Активно' : activity.status === 'planned' ? 'Запланировано' : activity.status}
                      </Badge>
                    </div>
                    {activity.schedule && (
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Icon name="Clock" size={14} />
                          {activity.schedule}
                        </span>
                        {activity.cost && (
                          <span className="flex items-center gap-1">
                            <Icon name="Wallet" size={14} />
                            {activity.cost} ₽/мес
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Icon name="ClipboardList" size={24} />
              Тесты и проверки
            </CardTitle>
            <Button className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600">
              <Icon name="Plus" size={16} />
              Назначить тест
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center py-8 text-gray-500">
            <Icon name="FileQuestion" size={48} className="mx-auto mb-4 text-gray-300" />
            <p>Пока нет назначенных тестов</p>
            <p className="text-sm mt-2">Создайте тест для оценки знаний и навыков</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}