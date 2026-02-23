import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useNotificationCenter, NotificationItem } from '@/hooks/useNotificationCenter';

const TYPE_META: Record<string, { icon: string; color: string; label: string }> = {
  medication: { icon: 'Pill', color: 'text-red-500 bg-red-50', label: 'Лекарства' },
  calendar: { icon: 'Calendar', color: 'text-blue-500 bg-blue-50', label: 'Календарь' },
  task: { icon: 'CheckSquare', color: 'text-purple-500 bg-purple-50', label: 'Задачи' },
  shopping: { icon: 'ShoppingCart', color: 'text-emerald-500 bg-emerald-50', label: 'Покупки' },
  voting: { icon: 'Vote', color: 'text-amber-500 bg-amber-50', label: 'Голосования' },
  birthday: { icon: 'Cake', color: 'text-pink-500 bg-pink-50', label: 'Дни рождения' },
  diet: { icon: 'Utensils', color: 'text-orange-500 bg-orange-50', label: 'Питание' },
  geofence: { icon: 'MapPin', color: 'text-indigo-500 bg-indigo-50', label: 'Геозоны' },
  leisure: { icon: 'Sparkles', color: 'text-cyan-500 bg-cyan-50', label: 'Досуг' },
  subscription: { icon: 'CreditCard', color: 'text-violet-500 bg-violet-50', label: 'Подписка' },
};

const FILTER_TABS = [
  { key: '', label: 'Все' },
  { key: 'medication', label: 'Лекарства' },
  { key: 'calendar', label: 'Календарь' },
  { key: 'task', label: 'Задачи' },
  { key: 'diet', label: 'Питание' },
  { key: 'shopping', label: 'Покупки' },
];

function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return 'Только что';
  if (diffMin < 60) return `${diffMin} мин. назад`;
  if (diffHour < 24) return `${diffHour} ч. назад`;
  if (diffDay < 7) return `${diffDay} дн. назад`;
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
}

export default function Notifications() {
  const navigate = useNavigate();
  const { notifications, unreadCount, isLoading, fetchNotifications, markRead, markAllRead } = useNotificationCenter();
  const [activeFilter, setActiveFilter] = useState('');

  useEffect(() => {
    fetchNotifications(50, 0, activeFilter || undefined);
  }, [fetchNotifications, activeFilter]);

  const handleClick = (n: NotificationItem) => {
    if (n.status !== 'read') markRead(n.id);
    if (n.target_url && n.target_url !== '/notifications') {
      navigate(n.target_url);
    }
  };

  const getMeta = (type: string) => TYPE_META[type] || { icon: 'Bell', color: 'text-gray-500 bg-gray-50', label: type };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 pb-24 pt-20">
      <div className="max-w-2xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-xl bg-white shadow-sm hover:shadow-md transition-all">
              <Icon name="ArrowLeft" size={18} />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Уведомления</h1>
              {unreadCount > 0 && (
                <p className="text-sm text-gray-500">{unreadCount} непрочитанных</p>
              )}
            </div>
          </div>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllRead} className="text-blue-600 hover:text-blue-700">
              <Icon name="CheckCheck" size={16} className="mr-1" />
              Прочитать все
            </Button>
          )}
        </div>

        <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-hide">
          {FILTER_TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveFilter(tab.key)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                activeFilter === tab.key
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <Icon name="BellOff" size={28} className="text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium">Нет уведомлений</p>
            <p className="text-sm text-gray-400 mt-1">Здесь появятся ваши напоминания</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map(n => {
              const meta = getMeta(n.type);
              const isUnread = n.status !== 'read';
              return (
                <Card
                  key={n.id}
                  onClick={() => handleClick(n)}
                  className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                    isUnread ? 'bg-white border-l-4 border-l-blue-500 shadow-sm' : 'bg-white/70'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${meta.color}`}>
                      <Icon name={meta.icon} size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={`text-sm font-semibold ${isUnread ? 'text-gray-900' : 'text-gray-600'}`}>
                          {n.title}
                        </span>
                        {isUnread && <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />}
                      </div>
                      <p className="text-sm text-gray-500 line-clamp-2">{n.message}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                          {meta.label}
                        </Badge>
                        <span className="text-xs text-gray-400">{formatTime(n.created_at)}</span>
                      </div>
                    </div>
                    <Icon name="ChevronRight" size={16} className="text-gray-300 shrink-0 mt-2" />
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
