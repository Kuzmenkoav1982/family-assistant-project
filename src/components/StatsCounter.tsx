import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

const STATS_API = 'https://functions.poehali.dev/39a1ae0b-c445-4408-80a0-ce02f5a25ce5';

interface Stats {
  total_users: number;
  total_families: number;
}

export default function StatsCounter() {
  const [stats, setStats] = useState<Stats>({ total_users: 0, total_families: 0 });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const response = await fetch(`${STATS_API}?action=stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setStats({
            total_users: data.stats?.total_users || 0,
            total_families: data.stats?.total_families || 0
          });
        }
      }
    } catch (error) {
      console.error('Ошибка загрузки статистики:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    
    const interval = setInterval(() => {
      fetchStats();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-purple-50 to-pink-50 rounded-full border border-purple-200">
        <div className="animate-pulse flex items-center gap-2">
          <div className="h-4 w-16 bg-purple-200 rounded"></div>
          <div className="h-4 w-16 bg-pink-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-purple-50 to-pink-50 rounded-full border border-purple-200 animate-fade-in">
      <div className="flex items-center gap-1.5">
        <Icon name="Users" size={16} className="text-purple-600" />
        <Badge variant="secondary" className="bg-purple-100 text-purple-700 border-0 font-semibold">
          {stats.total_families.toLocaleString('ru-RU')}
        </Badge>
        <span className="text-xs text-purple-600 hidden sm:inline">семей</span>
      </div>
      
      <div className="w-px h-4 bg-purple-300"></div>
      
      <div className="flex items-center gap-1.5">
        <Icon name="UserCircle" size={16} className="text-pink-600" />
        <Badge variant="secondary" className="bg-pink-100 text-pink-700 border-0 font-semibold">
          {stats.total_users.toLocaleString('ru-RU')}
        </Badge>
        <span className="text-xs text-pink-600 hidden sm:inline">чел.</span>
      </div>
    </div>
  );
}
