import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import Icon from '@/components/ui/icon';
import CateringSection from '@/components/events/CateringSection';
import ThemeSection from '@/components/events/ThemeSection';
import InvitationSection from '@/components/events/InvitationSection';
import { guestStatusLabels, taskStatusLabels, categoryLabels } from './eventDetailsConstants';
import type { FamilyEvent, EventGuest, EventTask, EventExpense, WishlistItem, GuestGift } from '@/types/events';

interface EventDetailsTabsProps {
  event: FamilyEvent;
  guests: EventGuest[];
  tasks: EventTask[];
  expenses: EventExpense[];
  wishlist: WishlistItem[];
  guestGifts: GuestGift[];
  guestsLoading: boolean;
  tasksLoading: boolean;
  expensesLoading: boolean;
  wishlistLoading: boolean;
  guestGiftsLoading: boolean;
  onShowAddGuest: () => void;
  onShowAddTask: () => void;
  onShowAddExpense: () => void;
  onShowAddWishlist: () => void;
  onShowAddGuestGift: () => void;
  onShowAIIdeas: () => void;
  fetchEvent: () => void;
  fetchGuests: () => void;
  fetchTasks: () => void;
  fetchExpenses: () => void;
  fetchWishlist: () => void;
  fetchGuestGifts: () => void;
  handleTaskStatusChange: (taskId: string, currentStatus: string) => void;
}

export default function EventDetailsTabs({
  event,
  guests,
  tasks,
  expenses,
  wishlist,
  guestGifts,
  guestsLoading,
  tasksLoading,
  expensesLoading,
  wishlistLoading,
  guestGiftsLoading,
  onShowAddGuest,
  onShowAddTask,
  onShowAddExpense,
  onShowAddWishlist,
  onShowAddGuestGift,
  onShowAIIdeas,
  fetchEvent,
  fetchGuests,
  fetchTasks,
  fetchExpenses,
  fetchWishlist,
  fetchGuestGifts,
  handleTaskStatusChange,
}: EventDetailsTabsProps) {
  return (
    <Tabs defaultValue="guests" className="w-full">
      <TabsList className="w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-7 gap-1 h-auto p-1">
        <TabsTrigger value="guests" className="flex-col md:flex-row gap-1 py-2 text-xs md:text-sm">
          <Icon name="Users" size={14} className="md:hidden" />
          <span>Гости</span>
        </TabsTrigger>
        <TabsTrigger value="theme" className="flex-col md:flex-row gap-1 py-2 text-xs md:text-sm">
          <Icon name="Palette" size={14} className="md:hidden" />
          <span>Тематика</span>
        </TabsTrigger>
        <TabsTrigger value="catering" className="flex-col md:flex-row gap-1 py-2 text-xs md:text-sm">
          <Icon name="MapPin" size={14} className="md:hidden" />
          <span>Ресторан</span>
        </TabsTrigger>
        <TabsTrigger value="invitation" className="flex-col md:flex-row gap-1 py-2 text-xs md:text-sm">
          <Icon name="Mail" size={14} className="md:hidden" />
          <span>Приглашение</span>
        </TabsTrigger>
        <TabsTrigger value="wishlist" className="flex-col md:flex-row gap-1 py-2 text-xs md:text-sm">
          <Icon name="Gift" size={14} className="md:hidden" />
          <span>Подарки</span>
        </TabsTrigger>
        <TabsTrigger value="expenses" className="flex-col md:flex-row gap-1 py-2 text-xs md:text-sm">
          <Icon name="Wallet" size={14} className="md:hidden" />
          <span>Расходы</span>
        </TabsTrigger>
        <TabsTrigger value="ideas" className="flex-col md:flex-row gap-1 py-2 text-xs md:text-sm">
          <Icon name="Lightbulb" size={14} className="md:hidden" />
          <span>Идеи</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="guests" className="mt-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Список гостей</CardTitle>
            <Button onClick={() => { onShowAddGuest(); fetchGuests(); }}>
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
            <Button onClick={() => { onShowAddTask(); fetchTasks(); }}>
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
                    <Button onClick={() => { onShowAddWishlist(); fetchWishlist(); }}>
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
                    <Button onClick={() => { onShowAddGuestGift(); fetchGuestGifts(); }}>
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
            <Button onClick={() => { onShowAddExpense(); fetchExpenses(); }}>
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
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <CardTitle className="flex items-center gap-2">
                <Icon name="Lightbulb" className="text-yellow-500" />
                ИИ Идеи и рекомендации
              </CardTitle>
              <Button onClick={onShowAIIdeas} className="w-full md:w-auto">
                <Icon name="Wand2" size={16} />
                Генерировать идеи
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm md:text-base">
              Используйте ИИ для генерации идей меню, декора, активностей и распределения бюджета
            </p>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
