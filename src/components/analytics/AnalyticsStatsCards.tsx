import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface AnalyticsStatsCardsProps {
  activeMembers: number;
  childrenCount: number;
  taskCompletionRate: number;
  eventsCount: number;
}

export function AnalyticsStatsCards({
  activeMembers,
  childrenCount,
  taskCompletionRate,
  eventsCount
}: AnalyticsStatsCardsProps) {
  return (
    <div className="grid md:grid-cols-4 gap-6">
      <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Членов семьи</p>
              <p className="text-4xl font-bold mt-2">{activeMembers}</p>
            </div>
            <Icon name="Users" size={48} className="opacity-20" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Детей</p>
              <p className="text-4xl font-bold mt-2">{childrenCount}</p>
            </div>
            <Icon name="Baby" size={48} className="opacity-20" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Задач выполнено</p>
              <p className="text-4xl font-bold mt-2">{taskCompletionRate}%</p>
            </div>
            <Icon name="CheckCircle2" size={48} className="opacity-20" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Событий</p>
              <p className="text-4xl font-bold mt-2">{eventsCount}</p>
            </div>
            <Icon name="Calendar" size={48} className="opacity-20" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
