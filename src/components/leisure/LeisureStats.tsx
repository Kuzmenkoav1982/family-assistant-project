import { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface LeisureActivity {
  id: number;
  title: string;
  category: string;
  status: string;
  price?: number;
  currency: string;
  rating?: number;
}

interface LeisureStatsProps {
  activities: LeisureActivity[];
}

const CATEGORIES = [
  { value: 'event', label: 'Мероприятие', icon: 'CalendarDays', color: 'bg-purple-500' },
  { value: 'restaurant', label: 'Ресторан', icon: 'UtensilsCrossed', color: 'bg-orange-500' },
  { value: 'attraction', label: 'Достопримечательность', icon: 'Landmark', color: 'bg-blue-500' },
  { value: 'entertainment', label: 'Развлечение', icon: 'Gamepad2', color: 'bg-pink-500' },
  { value: 'sport', label: 'Спорт', icon: 'Dumbbell', color: 'bg-green-500' },
  { value: 'culture', label: 'Культура', icon: 'Theater', color: 'bg-indigo-500' },
  { value: 'other', label: 'Другое', icon: 'MapPin', color: 'bg-gray-500' },
];

export function LeisureStats({ activities }: LeisureStatsProps) {
  const stats = useMemo(() => {
    const categoryStats = CATEGORIES.map(cat => {
      const catActivities = activities.filter(a => a.category === cat.value);
      const visited = catActivities.filter(a => a.status === 'visited').length;
      const avgRating = catActivities
        .filter(a => a.rating && a.status === 'visited')
        .reduce((sum, a) => sum + (a.rating || 0), 0) / 
        (catActivities.filter(a => a.rating && a.status === 'visited').length || 1);

      return {
        ...cat,
        total: catActivities.length,
        visited,
        planned: catActivities.filter(a => a.status === 'planned').length,
        wishlist: catActivities.filter(a => a.status === 'want_to_go').length,
        avgRating: avgRating > 0 ? avgRating : null
      };
    }).filter(cat => cat.total > 0);

    const totalVisited = activities.filter(a => a.status === 'visited').length;
    const totalPlanned = activities.filter(a => a.status === 'planned').length;
    const totalWishlist = activities.filter(a => a.status === 'want_to_go').length;

    const totalSpent = activities
      .filter(a => a.status === 'visited' && a.price && a.currency === 'RUB')
      .reduce((sum, a) => sum + (a.price || 0), 0);

    const avgRating = activities
      .filter(a => a.rating && a.status === 'visited')
      .reduce((sum, a) => sum + (a.rating || 0), 0) / 
      (activities.filter(a => a.rating && a.status === 'visited').length || 1);

    return {
      categoryStats,
      totalVisited,
      totalPlanned,
      totalWishlist,
      totalSpent,
      avgRating: avgRating > 0 ? avgRating.toFixed(1) : null
    };
  }, [activities]);

  const maxTotal = Math.max(...stats.categoryStats.map(c => c.total), 1);

  return (
    <div className="space-y-6">
      {/* Общая статистика */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <Icon name="Check" size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.totalVisited}</p>
              <p className="text-xs text-gray-500">Посещено</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Icon name="CalendarCheck" size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.totalPlanned}</p>
              <p className="text-xs text-gray-500">Запланировано</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
              <Icon name="Heart" size={20} className="text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.totalWishlist}</p>
              <p className="text-xs text-gray-500">В планах</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
              <Icon name="Star" size={20} className="text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.avgRating || '—'}</p>
              <p className="text-xs text-gray-500">Средний рейтинг</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Статистика по категориям */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Категории досуга</h3>
        <div className="space-y-4">
          {stats.categoryStats.map(cat => (
            <div key={cat.value}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Icon name={cat.icon} size={16} />
                  <span className="font-medium">{cat.label}</span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-green-600">{cat.visited} ✓</span>
                  <span className="text-blue-600">{cat.planned} 📅</span>
                  <span className="text-gray-600">{cat.wishlist} ♡</span>
                  {cat.avgRating && (
                    <span className="text-yellow-600">{cat.avgRating.toFixed(1)} ⭐</span>
                  )}
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${cat.color}`}
                  style={{ width: `${(cat.total / maxTotal) * 100}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Всего: {cat.total}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Потрачено */}
      {stats.totalSpent > 0 && (
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <Icon name="Wallet" size={20} />
            <h3 className="text-lg font-semibold">Потрачено на досуг</h3>
          </div>
          <p className="text-3xl font-bold text-primary">
            {stats.totalSpent.toLocaleString('ru-RU')} ₽
          </p>
          <p className="text-sm text-gray-500 mt-1">
            На {stats.totalVisited} посещённых активностей
          </p>
        </Card>
      )}
    </div>
  );
}
