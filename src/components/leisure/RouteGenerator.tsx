import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface LeisureActivity {
  id: number;
  title: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  date?: string;
  time?: string;
  status: string;
}

interface RouteGeneratorProps {
  activities: LeisureActivity[];
}

interface RoutePoint {
  activity: LeisureActivity;
  distance: number;
  duration: number;
}

export function RouteGenerator({ activities }: RouteGeneratorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [route, setRoute] = useState<RoutePoint[] | null>(null);
  const [loading, setLoading] = useState(false);

  const plannedActivities = activities.filter(
    a => a.status === 'planned' && a.latitude && a.longitude && a.date
  );

  const generateRoute = async () => {
    if (plannedActivities.length < 2) {
      alert('Нужно минимум 2 запланированных места с координатами');
      return;
    }

    setLoading(true);
    try {
      // Группируем активности по дате
      const today = new Date().toISOString().split('T')[0];
      const todayActivities = plannedActivities.filter(a => a.date === today);

      if (todayActivities.length === 0) {
        alert('На сегодня нет запланированных активностей');
        setLoading(false);
        return;
      }

      // Сортируем по времени
      const sorted = todayActivities.sort((a, b) => {
        const timeA = a.time || '00:00';
        const timeB = b.time || '00:00';
        return timeA.localeCompare(timeB);
      });

      // Генерируем маршрут (упрощенно, без API)
      const routePoints: RoutePoint[] = sorted.map((activity, index) => {
        // Примерные данные (в реальности нужно вызвать Yandex Routes API)
        const prevActivity = index > 0 ? sorted[index - 1] : null;
        let distance = 0;
        let duration = 0;

        if (prevActivity && prevActivity.latitude && prevActivity.longitude) {
          // Примерный расчет расстояния (Haversine formula)
          const R = 6371; // km
          const dLat = toRad(activity.latitude! - prevActivity.latitude);
          const dLon = toRad(activity.longitude! - prevActivity.longitude);
          const lat1 = toRad(prevActivity.latitude);
          const lat2 = toRad(activity.latitude!);

          const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
          distance = R * c;
          duration = Math.round((distance / 40) * 60); // ~40 км/ч средняя скорость
        }

        return {
          activity,
          distance: Math.round(distance * 10) / 10,
          duration
        };
      });

      setRoute(routePoints);
      setIsOpen(true);
    } catch (error) {
      console.error('Error generating route:', error);
      alert('Ошибка при построении маршрута');
    } finally {
      setLoading(false);
    }
  };

  const toRad = (deg: number) => deg * (Math.PI / 180);

  const totalDistance = route?.reduce((sum, p) => sum + p.distance, 0) || 0;
  const totalDuration = route?.reduce((sum, p) => sum + p.duration, 0) || 0;

  const openInYandexMaps = () => {
    if (!route || route.length === 0) return;

    // Формируем URL для Яндекс.Карт с маршрутом
    const points = route
      .map(p => `${p.activity.longitude},${p.activity.latitude}`)
      .join('~');
    
    const url = `https://yandex.ru/maps/?rtext=${points}&rtt=auto`;
    window.open(url, '_blank');
  };

  return (
    <>
      <Button
        onClick={generateRoute}
        disabled={plannedActivities.length < 2 || loading}
        variant="outline"
        className="gap-2"
      >
        <Icon name={loading ? 'Loader2' : 'Route'} size={16} className={loading ? 'animate-spin' : ''} />
        {loading ? 'Строю маршрут...' : 'Построить маршрут'}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Маршрут на сегодня</DialogTitle>
          </DialogHeader>

          {route && (
            <div className="space-y-4">
              <Card className="p-4 bg-blue-50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Общее расстояние</p>
                    <p className="text-2xl font-bold">{totalDistance.toFixed(1)} км</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Время в пути</p>
                    <p className="text-2xl font-bold">{totalDuration} мин</p>
                  </div>
                  <Button onClick={openInYandexMaps} className="gap-2">
                    <Icon name="ExternalLink" size={16} />
                    Открыть в Я.Картах
                  </Button>
                </div>
              </Card>

              <div className="space-y-3">
                {route.map((point, index) => (
                  <Card key={point.activity.id} className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold">{point.activity.title}</h4>
                        <p className="text-sm text-gray-600">{point.activity.location}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          {point.activity.time && (
                            <span className="flex items-center gap-1">
                              <Icon name="Clock" size={12} />
                              {point.activity.time}
                            </span>
                          )}
                          {index > 0 && (
                            <>
                              <span className="flex items-center gap-1">
                                <Icon name="Navigation" size={12} />
                                {point.distance} км
                              </span>
                              <span className="flex items-center gap-1">
                                <Icon name="Timer" size={12} />
                                {point.duration} мин
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              <p className="text-xs text-gray-500 text-center">
                💡 Совет: планируйте +15% времени на пробки и парковку
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}