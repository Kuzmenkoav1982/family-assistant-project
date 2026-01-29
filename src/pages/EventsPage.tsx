import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useNavigate } from 'react-router-dom';
import type { FamilyEvent } from '@/types/events';
import func2url from '../../backend/func2url.json';

const API_URL = func2url['events'];

function getUserId(): string {
  const userDataStr = localStorage.getItem('userData');
  if (userDataStr) {
    try {
      const userData = JSON.parse(userDataStr);
      return userData.member_id || '1';
    } catch (e) {
      console.error('[getUserId] Failed to parse userData:', e);
    }
  }
  return '1';
}

export default function EventsPage() {
  const [events, setEvents] = useState<FamilyEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const userId = getUserId();
      const authToken = localStorage.getItem('authToken');

      const response = await fetch(API_URL, {
        headers: {
          'X-User-Id': userId,
          ...(authToken && { 'Authorization': `Bearer ${authToken}` })
        },
      });

      if (response.ok) {
        const data = await response.json();
        setEvents(data);
      }
    } catch (error) {
      console.error('[EventsPage] Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'birthday': return '🎂';
      case 'anniversary': return '💍';
      case 'holiday': return '🎉';
      default: return '🎈';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100';
      case 'confirmed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
      case 'completed': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'planning': return 'Планируется';
      case 'confirmed': return 'Подтверждён';
      case 'completed': return 'Завершён';
      case 'cancelled': return 'Отменён';
      default: return status;
    }
  };

  const upcomingEvents = events.filter(e => 
    e.status !== 'completed' && e.status !== 'cancelled' &&
    new Date(e.eventDate) >= new Date()
  );

  const pastEvents = events.filter(e => 
    e.status === 'completed' || new Date(e.eventDate) < new Date()
  );

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="PartyPopper" className="text-pink-500" />
              Праздники
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Загружаем праздники...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Icon name="PartyPopper" className="text-pink-500" size={32} />
          Праздники семьи
        </h1>
        <Button onClick={() => navigate('/events/create')}>
          <Icon name="Plus" size={16} />
          Создать праздник
        </Button>
      </div>

      {upcomingEvents.length === 0 && pastEvents.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-lg font-semibold mb-2">Пока нет праздников</h3>
            <p className="text-muted-foreground mb-4">
              Создайте первый праздник для вашей семьи
            </p>
            <Button onClick={() => navigate('/events/create')}>
              <Icon name="Plus" size={16} />
              Создать праздник
            </Button>
          </CardContent>
        </Card>
      )}

      {upcomingEvents.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <Icon name="CalendarClock" size={24} />
            Предстоящие ({upcomingEvents.length})
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingEvents.map((event) => (
              <Card
                key={event.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => navigate(`/events/${event.id}`)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="text-3xl mb-2">{getEventIcon(event.eventType)}</div>
                      <CardTitle className="text-lg">{event.title}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {new Date(event.eventDate).toLocaleDateString('ru-RU', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${getStatusColor(event.status)}`}>
                      {getStatusLabel(event.status)}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {event.location && (
                    <div className="flex items-center gap-2 text-sm">
                      <Icon name="MapPin" size={14} className="text-muted-foreground" />
                      <span className="truncate">{event.location}</span>
                    </div>
                  )}
                  {event.guestsCount > 0 && (
                    <div className="flex items-center gap-2 text-sm">
                      <Icon name="Users" size={14} className="text-muted-foreground" />
                      <span>{event.guestsCount} гостей</span>
                    </div>
                  )}
                  {event.budget && (
                    <div className="flex items-center gap-2 text-sm">
                      <Icon name="Wallet" size={14} className="text-muted-foreground" />
                      <span>
                        {event.spent.toLocaleString('ru-RU')} / {event.budget.toLocaleString('ru-RU')} ₽
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {pastEvents.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <Icon name="CalendarCheck" size={24} />
            Прошедшие ({pastEvents.length})
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pastEvents.map((event) => (
              <Card
                key={event.id}
                className="cursor-pointer hover:shadow-lg transition-shadow opacity-75"
                onClick={() => navigate(`/events/${event.id}`)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="text-3xl mb-2 grayscale">{getEventIcon(event.eventType)}</div>
                      <CardTitle className="text-lg">{event.title}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {new Date(event.eventDate).toLocaleDateString('ru-RU', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${getStatusColor(event.status)}`}>
                      {getStatusLabel(event.status)}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {event.guestsCount > 0 && (
                    <div className="flex items-center gap-2 text-sm">
                      <Icon name="Users" size={14} className="text-muted-foreground" />
                      <span>{event.guestsCount} гостей</span>
                    </div>
                  )}
                  {event.spent > 0 && (
                    <div className="flex items-center gap-2 text-sm">
                      <Icon name="Wallet" size={14} className="text-muted-foreground" />
                      <span>Потрачено: {event.spent.toLocaleString('ru-RU')} ₽</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
