import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import AddGuestDialog from '@/components/events/AddGuestDialog';
import AddTaskDialog from '@/components/events/AddTaskDialog';
import AddExpenseDialog from '@/components/events/AddExpenseDialog';
import AddWishlistItemDialog from '@/components/events/AddWishlistItemDialog';
import AddGuestGiftDialog from '@/components/events/AddGuestGiftDialog';
import ShareEventDialog from '@/components/events/ShareEventDialog';
import AIIdeasDialog from '@/components/events/AIIdeasDialog';
import CateringSection from '@/components/events/CateringSection';
import ThemeSection from '@/components/events/ThemeSection';
import InvitationSection from '@/components/events/InvitationSection';
import func2url from '../../backend/func2url.json';
import type { FamilyEvent, EventGuest, EventTask, EventExpense, WishlistItem, GuestGift } from '@/types/events';

const API_URLS = {
  events: func2url['events'],
  guests: func2url['event-guests'],
  tasks: func2url['event-tasks'],
  expenses: func2url['event-expenses'],
  wishlist: func2url['event-wishlist'],
  guestGifts: func2url['guest-gifts']
};

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

const guestStatusLabels: Record<string, { label: string; variant: 'default' | 'success' | 'destructive' | 'secondary' }> = {
  invited: { label: 'Приглашён', variant: 'default' },
  confirmed: { label: 'Подтвердил', variant: 'success' },
  declined: { label: 'Отказался', variant: 'destructive' },
  maybe: { label: 'Возможно', variant: 'secondary' }
};

const taskStatusLabels: Record<string, { label: string; variant: 'default' | 'secondary' | 'success' }> = {
  pending: { label: 'Ожидает', variant: 'default' },
  in_progress: { label: 'В работе', variant: 'secondary' },
  completed: { label: 'Выполнено', variant: 'success' }
};

const categoryLabels: Record<string, string> = {
  venue: 'Место',
  food: 'Еда',
  decorations: 'Декор',
  entertainment: 'Развлечения',
  gifts: 'Подарки',
  other: 'Прочее'
};

export default function EventDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [event, setEvent] = useState<FamilyEvent | null>(null);
  const [guests, setGuests] = useState<EventGuest[]>([]);
  const [tasks, setTasks] = useState<EventTask[]>([]);
  const [expenses, setExpenses] = useState<EventExpense[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [guestGifts, setGuestGifts] = useState<GuestGift[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [guestsLoading, setGuestsLoading] = useState(false);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [expensesLoading, setExpensesLoading] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [guestGiftsLoading, setGuestGiftsLoading] = useState(false);
  
  const [showAddGuest, setShowAddGuest] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showAddWishlist, setShowAddWishlist] = useState(false);
  const [showAddGuestGift, setShowAddGuestGift] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showAIIdeas, setShowAIIdeas] = useState(false);

  const fetchEvent = async () => {
    try {
      setLoading(true);
      const userId = getUserId();
      const authToken = localStorage.getItem('authToken');

      const response = await fetch(`${API_URLS.events}?id=${id}`, {
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

  const fetchGuests = async () => {
    try {
      setGuestsLoading(true);
      const userId = getUserId();
      const authToken = localStorage.getItem('authToken');

      const response = await fetch(`${API_URLS.guests}?eventId=${id}`, {
        headers: {
          'X-User-Id': userId,
          ...(authToken && { 'Authorization': `Bearer ${authToken}` })
        }
      });

      if (response.ok) {
        const data = await response.json();
        setGuests(data);
      }
    } catch (error) {
      console.error('[FetchGuests] Error:', error);
    } finally {
      setGuestsLoading(false);
    }
  };

  const fetchTasks = async () => {
    try {
      setTasksLoading(true);
      const userId = getUserId();
      const authToken = localStorage.getItem('authToken');

      const response = await fetch(`${API_URLS.tasks}?eventId=${id}`, {
        headers: {
          'X-User-Id': userId,
          ...(authToken && { 'Authorization': `Bearer ${authToken}` })
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTasks(data);
      }
    } catch (error) {
      console.error('[FetchTasks] Error:', error);
    } finally {
      setTasksLoading(false);
    }
  };

  const fetchExpenses = async () => {
    try {
      setExpensesLoading(true);
      const userId = getUserId();
      const authToken = localStorage.getItem('authToken');

      const response = await fetch(`${API_URLS.expenses}?eventId=${id}`, {
        headers: {
          'X-User-Id': userId,
          ...(authToken && { 'Authorization': `Bearer ${authToken}` })
        }
      });

      if (response.ok) {
        const data = await response.json();
        setExpenses(data.expenses || []);
      }
    } catch (error) {
      console.error('[FetchExpenses] Error:', error);
    } finally {
      setExpensesLoading(false);
    }
  };

  const fetchWishlist = async () => {
    try {
      setWishlistLoading(true);
      const userId = getUserId();
      const authToken = localStorage.getItem('authToken');

      const response = await fetch(`${API_URLS.wishlist}?eventId=${id}`, {
        headers: {
          'X-User-Id': userId,
          ...(authToken && { 'Authorization': `Bearer ${authToken}` })
        }
      });

      if (response.ok) {
        const data = await response.json();
        setWishlist(data);
      }
    } catch (error) {
      console.error('[FetchWishlist] Error:', error);
    } finally {
      setWishlistLoading(false);
    }
  };

  const fetchGuestGifts = async () => {
    try {
      setGuestGiftsLoading(true);
      const userId = getUserId();
      const authToken = localStorage.getItem('authToken');

      const response = await fetch(`${API_URLS.guestGifts}?eventId=${id}`, {
        headers: {
          'X-User-Id': userId,
          ...(authToken && { 'Authorization': `Bearer ${authToken}` })
        }
      });

      if (response.ok) {
        const data = await response.json();
        setGuestGifts(data);
      }
    } catch (error) {
      console.error('[FetchGuestGifts] Error:', error);
    } finally {
      setGuestGiftsLoading(false);
    }
  };

  const handleTaskStatusChange = async (taskId: string, currentStatus: string) => {
    const statusOrder = ['pending', 'in_progress', 'completed'];
    const currentIndex = statusOrder.indexOf(currentStatus);
    const newStatus = statusOrder[(currentIndex + 1) % statusOrder.length];

    try {
      const userId = getUserId();
      const authToken = localStorage.getItem('authToken');

      const response = await fetch(API_URLS.tasks, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': userId,
          ...(authToken && { 'Authorization': `Bearer ${authToken}` })
        },
        body: JSON.stringify({ id: taskId, status: newStatus })
      });

      if (response.ok) {
        fetchTasks();
        toast({ title: 'Статус обновлён!' });
      }
    } catch (error) {
      console.error('[UpdateTask] Error:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить статус',
        variant: 'destructive'
      });
    }
  };

  useEffect(() => {
    if (id) {
      fetchEvent();
    }
  }, [id]);

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
            <div className="flex gap-2">
              <Button onClick={() => setShowAIIdeas(true)} variant="outline">
                <Icon name="Sparkles" size={16} />
                ИИ-помощник
              </Button>
              <Button onClick={() => setShowShare(true)} variant="outline">
                <Icon name="Share2" size={16} />
                Поделиться
              </Button>
            </div>
            <div className="flex gap-2">
              <Badge variant={statusLabels[event.status]?.variant || 'default'}>
                {statusLabels[event.status]?.label || event.status}
              </Badge>
              <Badge variant="outline">
                {eventTypeLabels[event.eventType] || event.eventType}
              </Badge>
            </div>
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

      <Tabs defaultValue="guests" className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="guests">Гости</TabsTrigger>
          <TabsTrigger value="theme">Тематика</TabsTrigger>
          <TabsTrigger value="catering">Ресторан</TabsTrigger>
          <TabsTrigger value="invitation">Приглашение</TabsTrigger>
          <TabsTrigger value="wishlist">Подарки</TabsTrigger>
          <TabsTrigger value="expenses">Расходы</TabsTrigger>
          <TabsTrigger value="ideas">Идеи</TabsTrigger>
        </TabsList>

        <TabsContent value="guests" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Список гостей</CardTitle>
              <Button onClick={() => { setShowAddGuest(true); fetchGuests(); }}>
                <Icon name="Plus" size={16} />
                Добавить гостя
              </Button>
            </CardHeader>
            <CardContent>
              {guestsLoading ? (
                <div className="flex justify-center py-8">
                  <Icon name="Loader2" className="animate-spin" size={24} />
                </div>
              ) : guests.length === 0 ? (
                <div className="text-center py-12">
                  <Icon name="Users" size={48} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600 mb-4">Гостей пока нет</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {guests.map((guest) => (
                    <div key={guest.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{guest.name}</p>
                        <p className="text-sm text-gray-600">
                          {guest.adultsCount} взр. {guest.childrenCount > 0 && `• ${guest.childrenCount} реб.`}
                          {guest.phone && ` • ${guest.phone}`}
                        </p>
                        {guest.dietaryRestrictions && (
                          <p className="text-sm text-gray-500 mt-1">🍽️ {guest.dietaryRestrictions}</p>
                        )}
                      </div>
                      <Badge variant={guestStatusLabels[guest.status]?.variant || 'default'}>
                        {guestStatusLabels[guest.status]?.label || guest.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Задачи по организации</CardTitle>
              <Button onClick={() => { setShowAddTask(true); fetchTasks(); }}>
                <Icon name="Plus" size={16} />
                Добавить задачу
              </Button>
            </CardHeader>
            <CardContent>
              {tasksLoading ? (
                <div className="flex justify-center py-8">
                  <Icon name="Loader2" className="animate-spin" size={24} />
                </div>
              ) : tasks.length === 0 ? (
                <div className="text-center py-12">
                  <Icon name="CheckSquare" size={48} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600 mb-4">Задач пока нет</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {tasks.map((task) => (
                    <div key={task.id} className="flex items-start gap-3 p-4 border rounded-lg">
                      <Checkbox
                        checked={task.status === 'completed'}
                        onCheckedChange={() => handleTaskStatusChange(task.id, task.status)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <p className={`font-medium ${task.status === 'completed' ? 'line-through text-gray-500' : ''}`}>
                          {task.title}
                        </p>
                        {task.description && (
                          <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                        )}
                        <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
                          {task.assignedTo && (
                            <span className="flex items-center gap-1">
                              <Icon name="User" size={14} />
                              {task.assignedTo}
                            </span>
                          )}
                          {task.deadline && (
                            <span className="flex items-center gap-1">
                              <Icon name="Calendar" size={14} />
                              {new Date(task.deadline).toLocaleDateString('ru-RU')}
                            </span>
                          )}
                        </div>
                      </div>
                      <Badge variant={taskStatusLabels[task.status]?.variant || 'default'}>
                        {taskStatusLabels[task.status]?.label || task.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="wishlist" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Подарки</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="birthday" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="birthday" onClick={fetchWishlist}>Для именинника</TabsTrigger>
                  <TabsTrigger value="guests" onClick={fetchGuestGifts}>Для гостей</TabsTrigger>
                </TabsList>

                <TabsContent value="birthday" className="mt-4">
                  <div className="space-y-4">
                    <div className="flex justify-end">
                      <Button onClick={() => { setShowAddWishlist(true); fetchWishlist(); }}>
                        <Icon name="Plus" size={16} />
                        Добавить подарок
                      </Button>
                    </div>
                    
                    {wishlistLoading ? (
                      <div className="flex justify-center py-8">
                        <Icon name="Loader2" className="animate-spin" size={24} />
                      </div>
                    ) : wishlist.length === 0 ? (
                      <div className="text-center py-12">
                        <Icon name="Gift" size={48} className="mx-auto text-gray-400 mb-4" />
                        <p className="text-gray-600">Виш-лист пуст</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {wishlist.map((item) => (
                          <div key={item.id} className="border rounded-lg p-4">
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="font-medium">{item.title}</h3>
                              {item.priority === 'high' && (
                                <Badge variant="destructive">Важно</Badge>
                              )}
                            </div>
                            {item.description && (
                              <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                            )}
                            <div className="flex items-center justify-between mt-3">
                              {item.price && (
                                <span className="text-lg font-bold">{item.price.toLocaleString('ru-RU')} ₽</span>
                              )}
                              {item.link && (
                                <Button variant="outline" size="sm" asChild>
                                  <a href={item.link} target="_blank" rel="noopener noreferrer">
                                    <Icon name="ExternalLink" size={14} />
                                    Ссылка
                                  </a>
                                </Button>
                              )}
                            </div>
                            {item.reserved && (
                              <Badge variant="success" className="mt-2">
                                Зарезервировано{item.reservedByName && `: ${item.reservedByName}`}
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="guests" className="mt-4">
                  <div className="space-y-4">
                    <div className="flex justify-end">
                      <Button onClick={() => { setShowAddGuestGift(true); fetchGuestGifts(); }}>
                        <Icon name="Plus" size={16} />
                        Добавить подарок для гостей
                      </Button>
                    </div>
                    
                    {guestGiftsLoading ? (
                      <div className="flex justify-center py-8">
                        <Icon name="Loader2" className="animate-spin" size={24} />
                      </div>
                    ) : guestGifts.length === 0 ? (
                      <div className="text-center py-12">
                        <Icon name="Gift" size={48} className="mx-auto text-gray-400 mb-4" />
                        <p className="text-gray-600">Подарков для гостей нет</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {guestGifts.map((gift) => (
                          <div key={gift.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex-1">
                              <p className="font-medium">{gift.title}</p>
                              {gift.description && (
                                <p className="text-sm text-gray-600">{gift.description}</p>
                              )}
                              <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
                                {gift.category && (
                                  <Badge variant="outline">
                                    {gift.category === 'kids' ? 'Детям' : gift.category === 'adults' ? 'Взрослым' : 'Всем'}
                                  </Badge>
                                )}
                                {gift.pricePerItem && (
                                  <span>{gift.pricePerItem.toLocaleString('ru-RU')} ₽ / шт.</span>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-600">
                                {gift.quantityPurchased || 0} / {gift.quantityNeeded}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expenses" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Расходы</CardTitle>
              <Button onClick={() => { setShowAddExpense(true); fetchExpenses(); }}>
                <Icon name="Plus" size={16} />
                Добавить расход
              </Button>
            </CardHeader>
            <CardContent>
              {expensesLoading ? (
                <div className="flex justify-center py-8">
                  <Icon name="Loader2" className="animate-spin" size={24} />
                </div>
              ) : expenses.length === 0 ? (
                <div className="text-center py-12">
                  <Icon name="Wallet" size={48} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600 mb-4">Расходов пока нет</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {expenses.map((expense) => (
                    <div key={expense.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{expense.title}</p>
                        <p className="text-sm text-gray-600">
                          {categoryLabels[expense.category] || expense.category}
                        </p>
                      </div>
                      <p className="text-lg font-bold">
                        {expense.amount.toLocaleString('ru-RU')} ₽
                      </p>
                    </div>
                  ))}
                  <div className="pt-4 border-t">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Итого:</span>
                      <span>
                        {expenses.reduce((sum, e) => sum + e.amount, 0).toLocaleString('ru-RU')} ₽
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="theme" className="mt-4">
          <ThemeSection event={event} onUpdate={fetchEvent} />
        </TabsContent>

        <TabsContent value="catering" className="mt-4">
          <CateringSection event={event} onUpdate={fetchEvent} />
        </TabsContent>

        <TabsContent value="invitation" className="mt-4">
          <InvitationSection event={event} onUpdate={fetchEvent} />
        </TabsContent>

        <TabsContent value="ideas" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Lightbulb" className="text-yellow-500" />
                  ИИ Идеи и рекомендации
                </CardTitle>
                <Button onClick={() => setShowAIIdeas(true)}>
                  <Icon name="Wand2" size={16} />
                  Генерировать идеи
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Используйте ИИ для генерации идей меню, декора, активностей и распределения бюджета
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AddGuestDialog
        open={showAddGuest}
        onOpenChange={setShowAddGuest}
        eventId={id!}
        onSuccess={() => { fetchGuests(); fetchEvent(); }}
      />

      <AddTaskDialog
        open={showAddTask}
        onOpenChange={setShowAddTask}
        eventId={id!}
        onSuccess={fetchTasks}
      />

      <AddExpenseDialog
        open={showAddExpense}
        onOpenChange={setShowAddExpense}
        eventId={id!}
        onSuccess={() => { fetchExpenses(); fetchEvent(); }}
      />

      <AddWishlistItemDialog
        open={showAddWishlist}
        onOpenChange={setShowAddWishlist}
        eventId={id!}
        onSuccess={fetchWishlist}
      />

      <AddGuestGiftDialog
        open={showAddGuestGift}
        onOpenChange={setShowAddGuestGift}
        eventId={id!}
        onSuccess={fetchGuestGifts}
      />

      <ShareEventDialog
        open={showShare}
        onOpenChange={setShowShare}
        eventId={id!}
        eventTitle={event?.title || ''}
      />

      <AIIdeasDialog
        open={showAIIdeas}
        onOpenChange={setShowAIIdeas}
        eventType={event?.eventType || 'birthday'}
      />
    </div>
  );
}