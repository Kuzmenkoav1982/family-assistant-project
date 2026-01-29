import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import func2url from '../../backend/func2url.json';
import type { FamilyEvent } from '@/types/events';

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

const eventTypeLabels: Record<string, string> = {
  birthday: 'День рождения',
  anniversary: 'Юбилей',
  holiday: 'Праздник',
  custom: 'Другое'
};

const statusLabels: Record<string, { label: string; variant: 'default' | 'secondary' | 'success' | 'destructive' }> = {
  planning: { label: 'Планируется', variant: 'default' },
  confirmed: { label: 'Подтверждён', variant: 'success' },
  completed: { label: 'Завершён', variant: 'secondary' },
  cancelled: { label: 'Отменён', variant: 'destructive' }
};

export default function EventDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [event, setEvent] = useState<FamilyEvent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        const userId = getUserId();
        const authToken = localStorage.getItem('authToken');

        const response = await fetch(`${API_URL}?id=${id}`, {
          headers: {
            'X-User-Id': userId,
            ...(authToken && { 'Authorization': `Bearer ${authToken}` })
          }
        });

        if (response.ok) {
          const data = await response.json();
          setEvent(data);
        } else {
          throw new Error('Failed to fetch event');
        }
      } catch (error) {
        console.error('[EventDetails] Error:', error);
        toast({
          title: 'Ошибка',
          description: 'Не удалось загрузить данные праздника',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchEvent();
    }
  }, [id, toast]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <Icon name="Loader2" className="animate-spin" size={32} />
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64">
            <Icon name="AlertCircle" size={48} className="text-gray-400 mb-4" />
            <p className="text-lg text-gray-600 mb-4">Праздник не найден</p>
            <Button onClick={() => navigate('/events')}>Вернуться к списку</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <Button
        variant="ghost"
        onClick={() => navigate('/events')}
        className="mb-4"
      >
        <Icon name="ArrowLeft" size={16} />
        Назад к праздникам
      </Button>

      <div className="mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
              <Icon name="PartyPopper" className="text-pink-500" />
              {event.title}
            </h1>
            <div className="flex items-center gap-2 text-gray-600">
              <Icon name="Calendar" size={16} />
              <span>{formatDate(event.eventDate)}</span>
              {event.eventTime && (
                <>
                  <Icon name="Clock" size={16} className="ml-2" />
                  <span>{event.eventTime}</span>
                </>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge variant={statusLabels[event.status]?.variant || 'default'}>
              {statusLabels[event.status]?.label || event.status}
            </Badge>
            <Badge variant="outline">
              {eventTypeLabels[event.eventType] || event.eventType}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <Icon name="Users" size={16} />
                <span className="text-sm">Гостей</span>
              </div>
              <p className="text-2xl font-bold">{event.guestsCount || 0}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <Icon name="Wallet" size={16} />
                <span className="text-sm">Бюджет</span>
              </div>
              <p className="text-2xl font-bold">
                {event.budget ? `${event.budget.toLocaleString('ru-RU')} ₽` : 'Не указан'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <Icon name="TrendingUp" size={16} />
                <span className="text-sm">Потрачено</span>
              </div>
              <p className="text-2xl font-bold">
                {event.spent ? `${event.spent.toLocaleString('ru-RU')} ₽` : '0 ₽'}
              </p>
            </CardContent>
          </Card>
        </div>

        {event.location && (
          <Card className="mb-4">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Icon name="MapPin" size={20} className="text-pink-500" />
                <span className="font-medium">{event.location}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {event.description && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Описание</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 whitespace-pre-wrap">{event.description}</p>
            </CardContent>
          </Card>
        )}
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Обзор</TabsTrigger>
          <TabsTrigger value="guests">Гости</TabsTrigger>
          <TabsTrigger value="tasks">Задачи</TabsTrigger>
          <TabsTrigger value="wishlist">Подарки</TabsTrigger>
          <TabsTrigger value="expenses">Расходы</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Обзор праздника</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Icon name="Users" className="text-blue-500" />
                    <span className="font-medium">Список гостей</span>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => {
                    const tabsList = document.querySelector('[role="tablist"]');
                    const guestsTab = tabsList?.querySelector('[value="guests"]') as HTMLElement;
                    guestsTab?.click();
                  }}>
                    Перейти
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Icon name="CheckSquare" className="text-green-500" />
                    <span className="font-medium">Задачи по организации</span>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => {
                    const tabsList = document.querySelector('[role="tablist"]');
                    const tasksTab = tabsList?.querySelector('[value="tasks"]') as HTMLElement;
                    tasksTab?.click();
                  }}>
                    Перейти
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Icon name="Gift" className="text-pink-500" />
                    <span className="font-medium">Виш-листы подарков</span>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => {
                    const tabsList = document.querySelector('[role="tablist"]');
                    const wishlistTab = tabsList?.querySelector('[value="wishlist"]') as HTMLElement;
                    wishlistTab?.click();
                  }}>
                    Перейти
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Icon name="Wallet" className="text-orange-500" />
                    <span className="font-medium">Бюджет и расходы</span>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => {
                    const tabsList = document.querySelector('[role="tablist"]');
                    const expensesTab = tabsList?.querySelector('[value="expenses"]') as HTMLElement;
                    expensesTab?.click();
                  }}>
                    Перейти
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="guests">
          <Card>
            <CardHeader>
              <CardTitle>Список гостей</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Icon name="Users" size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 mb-4">Гостей пока нет</p>
                <Button>
                  <Icon name="Plus" size={16} />
                  Добавить гостя
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks">
          <Card>
            <CardHeader>
              <CardTitle>Задачи по организации</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Icon name="CheckSquare" size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 mb-4">Задач пока нет</p>
                <Button>
                  <Icon name="Plus" size={16} />
                  Добавить задачу
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="wishlist">
          <Card>
            <CardHeader>
              <CardTitle>Подарки</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="birthday" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="birthday">Для именинника</TabsTrigger>
                  <TabsTrigger value="guests">Для гостей</TabsTrigger>
                </TabsList>

                <TabsContent value="birthday">
                  <div className="text-center py-12">
                    <Icon name="Gift" size={48} className="mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600 mb-4">Виш-лист пуст</p>
                    <Button>
                      <Icon name="Plus" size={16} />
                      Добавить подарок
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="guests">
                  <div className="text-center py-12">
                    <Icon name="Gift" size={48} className="mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600 mb-4">Подарков для гостей нет</p>
                    <Button>
                      <Icon name="Plus" size={16} />
                      Добавить подарок для гостей
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expenses">
          <Card>
            <CardHeader>
              <CardTitle>Расходы</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Icon name="Wallet" size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 mb-4">Расходов пока нет</p>
                <Button>
                  <Icon name="Plus" size={16} />
                  Добавить расход
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
