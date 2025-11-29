import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';
import type { FamilyMember } from '@/types/family.types';

export function DevelopmentSection({ child }: { child: FamilyMember }) {
  const developmentAreas = [
    { area: 'Спорт', current: 65, target: 85, icon: '⚽', color: 'blue' },
    { area: 'Образование', current: 80, target: 90, icon: '📚', color: 'purple' },
    { area: 'Творчество', current: 70, target: 80, icon: '🎨', color: 'pink' },
    { area: 'Социальные навыки', current: 75, target: 85, icon: '🤝', color: 'green' }
  ];

  const activities = [
    { name: 'Футбольная секция', schedule: 'Вт, Чт 17:00', cost: 5000, status: 'active' },
    { name: 'Репетитор по математике', schedule: 'Ср 16:00', cost: 2000, status: 'active' },
    { name: 'Художественная школа', schedule: 'Сб 10:00', cost: 3000, status: 'planned' }
  ];

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
          {developmentAreas.map((area, idx) => (
            <div key={idx} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{area.icon}</span>
                  <span className="font-semibold">{area.area}</span>
                </div>
                <span className="text-sm text-gray-600">
                  {area.current}% → {area.target}%
                </span>
              </div>
              <Progress value={area.current} className="h-2" />
            </div>
          ))}
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
          {activities.map((activity, idx) => (
            <div key={idx} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
              <Icon name="CalendarDays" size={24} className="text-blue-600 mt-1" />
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold">{activity.name}</h4>
                  <Badge variant={activity.status === 'active' ? 'default' : 'secondary'}>
                    {activity.status === 'active' ? 'Активно' : 'Запланировано'}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <Icon name="Clock" size={14} />
                    {activity.schedule}
                  </span>
                  <span className="flex items-center gap-1">
                    <Icon name="Wallet" size={14} />
                    {activity.cost} ₽/мес
                  </span>
                </div>
              </div>
              <Button variant="ghost" size="sm">
                <Icon name="MoreVertical" size={16} />
              </Button>
            </div>
          ))}
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
