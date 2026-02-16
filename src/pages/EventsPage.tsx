import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import SectionHero from '@/components/ui/section-hero';
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

  const handleDelete = async (eventId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Вы уверены, что хотите удалить праздник?')) return;

    try {
      const userId = getUserId();
      const authToken = localStorage.getItem('authToken');

      const response = await fetch(`${API_URL}?eventId=${eventId}`, {
        method: 'DELETE',
        headers: {
          'X-User-Id': userId,
          ...(authToken && { 'Authorization': `Bearer ${authToken}` })
        },
      });

      if (response.ok) {
        await fetchEvents();
      }
    } catch (error) {
      console.error('[EventsPage] Error deleting event:', error);
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
      <div className="min-h-screen bg-gradient-to-b from-pink-50 via-rose-50/30 to-white pb-24">
        <div className="max-w-5xl mx-auto p-4">
          <SectionHero
            title="Праздники"
            subtitle="Организуйте семейные торжества"
            imageUrl="https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/c75655ba-70fa-4bd9-948b-5601b8c82b24.jpg"
            backPath="/leisure-hub"
          />
          <div className="flex justify-center py-12">
            <Icon name="Loader2" size={32} className="animate-spin text-gray-400" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-rose-50/30 to-white pb-24">
      <div className="max-w-5xl mx-auto p-4 space-y-6">
        <SectionHero
          title="Праздники"
          subtitle="Организуйте семейные торжества"
          imageUrl="https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/c75655ba-70fa-4bd9-948b-5601b8c82b24.jpg"
          backPath="/leisure-hub"
          rightAction={
            <Button
              onClick={() => navigate('/events/create')}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
            >
              <Icon name="Plus" size={16} />
              <span className="ml-1 text-sm">Создать</span>
            </Button>
          }
        />

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
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded ${getStatusColor(event.status)}`}>
                        {getStatusLabel(event.status)}
                      </span>
                    </div>
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
                  <div className="flex gap-2 mt-3 pt-3 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/events/edit/${event.id}`);
                      }}
                    >
                      <Icon name="Pencil" size={14} />
                      <span className="ml-1">Изменить</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={(e) => handleDelete(event.id, e)}
                    >
                      <Icon name="Trash2" size={14} />
                      <span className="ml-1">Удалить</span>
                    </Button>
                  </div>
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
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded ${getStatusColor(event.status)}`}>
                        {getStatusLabel(event.status)}
                      </span>
                    </div>
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
                  <div className="flex gap-2 mt-3 pt-3 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/events/edit/${event.id}`);
                      }}
                    >
                      <Icon name="Pencil" size={14} />
                      <span className="ml-1">Изменить</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={(e) => handleDelete(event.id, e)}
                    >
                      <Icon name="Trash2" size={14} />
                      <span className="ml-1">Удалить</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
      </div>
    </div>
  );
}