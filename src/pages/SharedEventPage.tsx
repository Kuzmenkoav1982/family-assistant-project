import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import func2url from '../../backend/func2url.json';

const API_URL = func2url['event-share'];

interface SharedEvent {
  id: string;
  title: string;
  eventType: string;
  eventDate: string;
  eventTime?: string;
  description?: string;
  location?: string;
  budget?: number;
  guestsCount: number;
  status: string;
  wishlist: Array<{
    id: string;
    title: string;
    description?: string;
    link?: string;
    price?: number;
    priority: string;
    reservedByName?: string;
    purchased: boolean;
  }>;
}

const eventTypeLabels: Record<string, string> = {
  birthday: 'День рождения',
  anniversary: 'Юбилей',
  holiday: 'Праздник',
  custom: 'Другое'
};

export default function SharedEventPage() {
  const { token } = useParams<{ token: string }>();
  const [event, setEvent] = useState<SharedEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}?token=${token}`);

        if (response.ok) {
          const data = await response.json();
          setEvent(data);
        } else if (response.status === 404) {
          setError('Праздник не найден или ссылка устарела');
        } else {
          throw new Error('Failed to fetch event');
        }
      } catch (error) {
        console.error('[SharedEvent] Error:', error);
        setError('Не удалось загрузить данные праздника');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchEvent();
    }
  }, [token]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric',
      weekday: 'long'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center p-6">
        <Icon name="Loader2" className="animate-spin" size={48} />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center p-6">
        <Card className="max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Icon name="AlertCircle" size={64} className="text-gray-400 mb-4" />
            <h2 className="text-xl font-bold mb-2">Упс!</h2>
            <p className="text-gray-600 text-center">{error || 'Что-то пошло не так'}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 p-6">
      <div className="max-w-4xl mx-auto">
        <Card className="mb-6 shadow-lg">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Icon name="PartyPopper" size={64} className="text-pink-500" />
            </div>
            <CardTitle className="text-4xl mb-2">{event.title}</CardTitle>
            <div className="flex flex-wrap items-center justify-center gap-2 text-gray-600">
              <Badge variant="outline" className="text-base">
                {eventTypeLabels[event.eventType] || event.eventType}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center gap-2 text-lg">
                <Icon name="Calendar" size={20} className="text-pink-500" />
                <span className="font-medium">{formatDate(event.eventDate)}</span>
              </div>
              {event.eventTime && (
                <div className="flex items-center gap-2 text-lg">
                  <Icon name="Clock" size={20} className="text-pink-500" />
                  <span className="font-medium">{event.eventTime}</span>
                </div>
              )}
              {event.location && (
                <div className="flex items-center gap-2 text-lg">
                  <Icon name="MapPin" size={20} className="text-pink-500" />
                  <span className="font-medium">{event.location}</span>
                </div>
              )}
            </div>

            {event.description && (
              <div className="border-t pt-6">
                <p className="text-gray-700 text-center whitespace-pre-wrap">{event.description}</p>
              </div>
            )}

            <div className="flex justify-center">
              <Card className="bg-pink-50 border-pink-200">
                <CardContent className="pt-6 px-8">
                  <div className="flex items-center gap-3">
                    <Icon name="Users" size={24} className="text-pink-500" />
                    <div>
                      <p className="text-sm text-gray-600">Ожидаем гостей</p>
                      <p className="text-2xl font-bold text-pink-600">{event.guestsCount || '...'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {event.wishlist && event.wishlist.length > 0 && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Icon name="Gift" className="text-pink-500" />
                Виш-лист подарков
              </CardTitle>
              <p className="text-gray-600">
                Выберите подарок, который хотите подарить, и свяжитесь с организатором
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {event.wishlist
                  .filter(item => !item.purchased)
                  .map((item) => (
                    <Card key={item.id} className={`${item.reservedByName ? 'bg-gray-50 border-gray-300' : 'border-pink-200'}`}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-bold text-lg">{item.title}</h3>
                          {item.priority === 'high' && !item.reservedByName && (
                            <Badge variant="destructive">Важно</Badge>
                          )}
                        </div>
                        {item.description && (
                          <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                        )}
                        <div className="flex items-center justify-between mt-4">
                          {item.price && (
                            <span className="text-xl font-bold text-pink-600">
                              {item.price.toLocaleString('ru-RU')} ₽
                            </span>
                          )}
                          {item.link && !item.reservedByName ? (
                            <Button variant="outline" size="sm" asChild>
                              <a href={item.link} target="_blank" rel="noopener noreferrer">
                                <Icon name="ExternalLink" size={14} />
                                Посмотреть
                              </a>
                            </Button>
                          ) : null}
                        </div>
                        {item.reservedByName && (
                          <div className="mt-3 pt-3 border-t">
                            <Badge variant="secondary" className="w-full justify-center">
                              Забронировано: {item.reservedByName}
                            </Badge>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
              </div>

              {event.wishlist.every(item => item.purchased || item.reservedByName) && (
                <div className="text-center py-8">
                  <Icon name="CheckCircle2" size={48} className="mx-auto text-green-500 mb-4" />
                  <p className="text-lg text-gray-600">
                    Все подарки забронированы! Спасибо! 🎉
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <div className="text-center mt-8 text-gray-600">
          <p className="text-sm">
            Создано в{' '}
            <a href="https://nasha-semiya.ru" className="text-pink-500 hover:underline font-medium">
              Наша Семья
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
