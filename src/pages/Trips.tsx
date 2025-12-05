import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const TRIPS_API_URL = 'https://functions.poehali.dev/6b3296a3-1703-4ab4-9773-e09a9a93a11a';

interface Trip {
  id: number;
  title: string;
  destination: string;
  country: string;
  start_date: string;
  end_date: string;
  status: string;
  budget: number;
  spent: number;
  currency: string;
  description: string;
  cover_image?: string;
  participants: string;
}

export default function Trips() {
  const navigate = useNavigate();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [isInstructionOpen, setIsInstructionOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newTrip, setNewTrip] = useState({
    title: '',
    destination: '',
    country: '',
    start_date: '',
    end_date: '',
    budget: '',
    description: ''
  });
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);

  useEffect(() => {
    loadTrips(activeTab);
  }, [activeTab]);

  const loadTrips = async (status: string) => {
    try {
      setLoading(true);
      const response = await fetch(`${TRIPS_API_URL}/?action=trips&status=${status}`);
      const data = await response.json();
      setTrips(data.trips || []);
    } catch (error) {
      console.error('Error loading trips:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      wishlist: { label: 'Мечта', variant: 'secondary' as const, icon: 'Star' },
      planning: { label: 'Планируем', variant: 'outline' as const, icon: 'Calendar' },
      booked: { label: 'Забронировано', variant: 'default' as const, icon: 'CheckCircle' },
      ongoing: { label: 'В пути', variant: 'default' as const, icon: 'Plane' },
      completed: { label: 'Завершено', variant: 'secondary' as const, icon: 'Check' }
    };
    
    const config = statusMap[status as keyof typeof statusMap] || statusMap.planning;
    
    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon name={config.icon} size={14} />
        {config.label}
      </Badge>
    );
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
  };

  const calculateDays = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return days;
  };

  const formatBudget = (amount: number, currency: string) => {
    return new Intl.NumberFormat('ru-RU').format(amount) + ' ' + currency;
  };

  const getBudgetProgress = (spent: number, budget: number) => {
    if (!budget) return 0;
    return Math.round((spent / budget) * 100);
  };

  const filterTripsByStatus = (status: string) => {
    if (status === 'all') return trips;
    return trips.filter(trip => trip.status === status);
  };

  const getTabCount = (status: string) => {
    if (status === 'all') return trips.length;
    return trips.filter(trip => trip.status === status).length;
  };

  const handleCreateTrip = async () => {
    if (!newTrip.title || !newTrip.destination || !newTrip.start_date || !newTrip.end_date) {
      alert('Заполните обязательные поля');
      return;
    }

    try {
      const response = await fetch(TRIPS_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_trip',
          ...newTrip,
          budget: newTrip.budget ? parseFloat(newTrip.budget) : null,
          status: 'planning',
          currency: 'RUB',
          created_by: 1
        })
      });

      if (response.ok) {
        await loadTrips(activeTab);
        setIsAddDialogOpen(false);
        setNewTrip({
          title: '',
          destination: '',
          country: '',
          start_date: '',
          end_date: '',
          budget: '',
          description: ''
        });
      }
    } catch (error) {
      console.error('Error creating trip:', error);
      alert('Ошибка при создании поездки');
    }
  };

  const handleDeleteTrip = async (tripId: number) => {
    if (!confirm('Удалить эту поездку? Все связанные данные также будут удалены.')) return;

    try {
      const response = await fetch(TRIPS_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete_trip',
          trip_id: tripId
        })
      });

      if (response.ok) {
        await loadTrips(activeTab);
      }
    } catch (error) {
      console.error('Error deleting trip:', error);
      alert('Ошибка при удалении поездки');
    }
  };

  const handleEditTrip = (trip: Trip) => {
    setEditingTrip(trip);
    setIsEditDialogOpen(true);
  };

  const handleUpdateTrip = async () => {
    if (!editingTrip) return;
    if (!editingTrip.title || !editingTrip.destination || !editingTrip.start_date || !editingTrip.end_date) {
      alert('Заполните обязательные поля');
      return;
    }

    try {
      const response = await fetch(TRIPS_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_trip',
          id: editingTrip.id,
          title: editingTrip.title,
          destination: editingTrip.destination,
          country: editingTrip.country,
          start_date: editingTrip.start_date,
          end_date: editingTrip.end_date,
          budget: editingTrip.budget,
          spent: editingTrip.spent,
          status: editingTrip.status,
          currency: editingTrip.currency,
          description: editingTrip.description
        })
      });

      if (response.ok) {
        await loadTrips(activeTab);
        setIsEditDialogOpen(false);
        setEditingTrip(null);
      }
    } catch (error) {
      console.error('Error updating trip:', error);
      alert('Ошибка при обновлении поездки');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/')}
              >
                <Icon name="ArrowLeft" size={24} />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Путешествия</h1>
                <p className="text-sm text-gray-500">Планируйте незабываемые поездки</p>
              </div>
            </div>
            <Button onClick={() => navigate('/trips/wishlist')} variant="outline" className="gap-2">
              <Icon name="Star" size={18} />
              Wish List
            </Button>
          </div>

          {/* Инструкция */}
          <Collapsible open={isInstructionOpen} onOpenChange={setIsInstructionOpen}>
            <Alert className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 mb-4">
              <div className="flex items-start gap-3">
                <Icon name="Info" className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <CollapsibleTrigger className="flex items-center justify-between w-full text-left group">
                    <h3 className="font-semibold text-blue-900 text-lg">
                      Как планировать путешествия
                    </h3>
                    <Icon 
                      name={isInstructionOpen ? "ChevronUp" : "ChevronDown"} 
                      className="h-5 w-5 text-blue-600 transition-transform group-hover:scale-110" 
                    />
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent className="mt-3 space-y-3">
                    <AlertDescription className="text-blue-800">
                      <div className="space-y-4">
                        <div>
                          <p className="font-medium mb-2">🗺️ Для чего нужен раздел Путешествия?</p>
                          <p className="text-sm">
                            Раздел помогает планировать семейные поездки: куда, когда, бюджет. 
                            Храните билеты, маршруты, дневник впечатлений и фото в одном месте.
                          </p>
                        </div>

                        <div>
                          <p className="font-medium mb-2">✈️ Как создать поездку?</p>
                          <ol className="text-sm space-y-1 ml-4 list-decimal">
                            <li>Нажмите кнопку "+" внизу справа</li>
                            <li>Укажите название и место назначения</li>
                            <li>Выберите даты начала и окончания</li>
                            <li>Установите бюджет (необязательно)</li>
                            <li>Нажмите "Создать" — поездка добавится в список</li>
                          </ol>
                        </div>

                        <div>
                          <p className="font-medium mb-2">📋 Что можно добавить в поездку?</p>
                          <ul className="text-sm space-y-1 ml-4 list-disc">
                            <li><strong>Билеты и брони:</strong> авиа, отели, транспорт с номерами</li>
                            <li><strong>Маршрут:</strong> план по дням с местами и временем</li>
                            <li><strong>Дневник:</strong> записывайте впечатления прямо в поездке</li>
                            <li><strong>Фото:</strong> создайте альбом из путешествия</li>
                          </ul>
                        </div>

                        <div>
                          <p className="font-medium mb-2">⭐ Wish List — места мечты</p>
                          <p className="text-sm">
                            Нажмите "Wish List" вверху — добавьте туда места, куда мечтаете поехать. 
                            Когда придёт время — превратите мечту в реальную поездку одной кнопкой!
                          </p>
                        </div>

                        <div className="bg-white/50 p-3 rounded-lg">
                          <p className="font-medium mb-1 text-sm">💡 Совет:</p>
                          <p className="text-sm">
                            Ведите дневник путешествий и загружайте фото сразу — потом будет приятно вспоминать. 
                            Все поездки архивируются автоматически.
                          </p>
                        </div>
                      </div>
                    </AlertDescription>
                  </CollapsibleContent>
                </div>
              </div>
            </Alert>
          </Collapsible>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full grid grid-cols-4 lg:grid-cols-5">
              <TabsTrigger value="all">Все ({getTabCount('all')})</TabsTrigger>
              <TabsTrigger value="planning">План ({getTabCount('planning')})</TabsTrigger>
              <TabsTrigger value="booked">Брони ({getTabCount('booked')})</TabsTrigger>
              <TabsTrigger value="ongoing" className="hidden lg:block">В пути ({getTabCount('ongoing')})</TabsTrigger>
              <TabsTrigger value="completed">Архив ({getTabCount('completed')})</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        {loading ? (
          <div className="text-center py-12">
            <Icon name="Loader2" size={32} className="animate-spin mx-auto text-gray-400" />
            <p className="text-gray-500 mt-2">Загрузка...</p>
          </div>
        ) : trips.length === 0 ? (
          <Card className="p-12 text-center">
            <Icon name="Plane" size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Нет поездок</h3>
            <p className="text-gray-500 mb-4">Начните планировать свое путешествие</p>
            <Button onClick={() => navigate('/trips/wishlist')} className="gap-2">
              <Icon name="Plus" size={18} />
              Добавить поездку
            </Button>
          </Card>
        ) : (
          <div className="grid gap-4">
            {trips.map((trip) => (
              <Card
                key={trip.id}
                className="p-6 hover:shadow-lg transition-all group relative"
              >
                <div 
                  className="flex gap-4 cursor-pointer"
                  onClick={() => navigate(`/trips/${trip.id}`)}
                >
                  {/* Trip Image/Icon */}
                  <div className="flex-shrink-0">
                    <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white">
                      <Icon name="MapPin" size={32} />
                    </div>
                  </div>

                  {/* Trip Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">{trip.title}</h3>
                        <div className="flex items-center gap-2 text-gray-600 text-sm">
                          <Icon name="MapPin" size={16} />
                          <span>{trip.destination}, {trip.country}</span>
                        </div>
                      </div>
                      {getStatusBadge(trip.status)}
                    </div>

                    {/* Dates and Duration */}
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-1">
                        <Icon name="Calendar" size={16} />
                        <span>{formatDate(trip.start_date)} - {formatDate(trip.end_date)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Icon name="Clock" size={16} />
                        <span>{calculateDays(trip.start_date, trip.end_date)} дней</span>
                      </div>
                    </div>

                    {/* Budget */}
                    {trip.budget > 0 && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Бюджет</span>
                          <span className="font-semibold text-gray-900">
                            {formatBudget(trip.spent, trip.currency)} / {formatBudget(trip.budget, trip.currency)}
                          </span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all ${
                              getBudgetProgress(trip.spent, trip.budget) > 100
                                ? 'bg-red-500'
                                : getBudgetProgress(trip.spent, trip.budget) > 80
                                ? 'bg-yellow-500'
                                : 'bg-green-500'
                            }`}
                            style={{ width: `${Math.min(getBudgetProgress(trip.spent, trip.budget), 100)}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Arrow */}
                  <div className="flex-shrink-0 flex items-center">
                    <Icon name="ChevronRight" size={24} className="text-gray-400" />
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditTrip(trip);
                    }}
                  >
                    <Icon name="Pencil" size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteTrip(trip.id);
                    }}
                  >
                    <Icon name="Trash2" size={16} />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Floating Add Button with Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogTrigger asChild>
          <Button
            className="fixed bottom-24 right-6 h-14 w-14 rounded-full shadow-lg gap-2"
            size="icon"
          >
            <Icon name="Plus" size={24} />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Создать новую поездку</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Название поездки *</Label>
              <Input
                value={newTrip.title}
                onChange={(e) => setNewTrip({ ...newTrip, title: e.target.value })}
                placeholder="Летний отдых в Сочи"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Место назначения *</Label>
                <Input
                  value={newTrip.destination}
                  onChange={(e) => setNewTrip({ ...newTrip, destination: e.target.value })}
                  placeholder="Сочи"
                />
              </div>
              <div>
                <Label>Страна</Label>
                <Input
                  value={newTrip.country}
                  onChange={(e) => setNewTrip({ ...newTrip, country: e.target.value })}
                  placeholder="Россия"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Дата начала *</Label>
                <Input
                  type="date"
                  value={newTrip.start_date}
                  onChange={(e) => setNewTrip({ ...newTrip, start_date: e.target.value })}
                />
              </div>
              <div>
                <Label>Дата окончания *</Label>
                <Input
                  type="date"
                  value={newTrip.end_date}
                  onChange={(e) => setNewTrip({ ...newTrip, end_date: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label>Бюджет (₽)</Label>
              <Input
                type="number"
                value={newTrip.budget}
                onChange={(e) => setNewTrip({ ...newTrip, budget: e.target.value })}
                placeholder="150000"
              />
            </div>

            <div>
              <Label>Описание</Label>
              <Textarea
                value={newTrip.description}
                onChange={(e) => setNewTrip({ ...newTrip, description: e.target.value })}
                placeholder="Семейный отдых на море..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleCreateTrip}>
              Создать поездку
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Trip Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Редактировать поездку</DialogTitle>
          </DialogHeader>
          {editingTrip && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Название *</Label>
                  <Input
                    value={editingTrip.title}
                    onChange={(e) => setEditingTrip({ ...editingTrip, title: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Место назначения *</Label>
                  <Input
                    value={editingTrip.destination}
                    onChange={(e) => setEditingTrip({ ...editingTrip, destination: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label>Страна</Label>
                <Input
                  value={editingTrip.country}
                  onChange={(e) => setEditingTrip({ ...editingTrip, country: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Дата начала *</Label>
                  <Input
                    type="date"
                    value={editingTrip.start_date}
                    onChange={(e) => setEditingTrip({ ...editingTrip, start_date: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Дата окончания *</Label>
                  <Input
                    type="date"
                    value={editingTrip.end_date}
                    onChange={(e) => setEditingTrip({ ...editingTrip, end_date: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Бюджет (₽)</Label>
                  <Input
                    type="number"
                    value={editingTrip.budget}
                    onChange={(e) => setEditingTrip({ ...editingTrip, budget: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label>Потрачено (₽)</Label>
                  <Input
                    type="number"
                    value={editingTrip.spent}
                    onChange={(e) => setEditingTrip({ ...editingTrip, spent: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div>
                <Label>Статус</Label>
                <Select 
                  value={editingTrip.status} 
                  onValueChange={(value) => setEditingTrip({ ...editingTrip, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="wishlist">Мечта</SelectItem>
                    <SelectItem value="planning">Планируем</SelectItem>
                    <SelectItem value="booked">Забронировано</SelectItem>
                    <SelectItem value="ongoing">В пути</SelectItem>
                    <SelectItem value="completed">Завершено</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Описание</Label>
                <Textarea
                  value={editingTrip.description}
                  onChange={(e) => setEditingTrip({ ...editingTrip, description: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleUpdateTrip}>
              Сохранить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}