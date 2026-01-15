import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Combobox } from '@/components/ui/combobox';
import { formatCurrencyOptions, getCurrencyByCode } from '@/data/currencies';
import { AIAssistant } from '@/components/leisure/AIAssistant';
import { PlaceSearch } from '@/components/leisure/PlaceSearch';
import { LeisureMap } from '@/components/leisure/LeisureMap';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const TRIPS_API_URL = 'https://functions.poehali.dev/6b3296a3-1703-4ab4-9773-e09a9a93a11a';

interface LeisureActivity {
  id: number;
  title: string;
  category: string;
  location?: string;
  date?: string;
  time?: string;
  price?: number;
  currency: string;
  rating?: number;
  status: string;
  notes?: string;
  website?: string;
  phone?: string;
  booking_required: boolean;
  booking_url?: string;
  created_at: string;
}

const CATEGORIES = [
  { value: 'event', label: 'Мероприятие', icon: 'CalendarDays' },
  { value: 'restaurant', label: 'Ресторан', icon: 'UtensilsCrossed' },
  { value: 'attraction', label: 'Достопримечательность', icon: 'Landmark' },
  { value: 'entertainment', label: 'Развлечение', icon: 'Gamepad2' },
  { value: 'sport', label: 'Спорт', icon: 'Dumbbell' },
  { value: 'culture', label: 'Культура', icon: 'Theater' },
  { value: 'other', label: 'Другое', icon: 'MapPin' },
];

const TABS_CONFIG = [
  { value: 'want_to_go', label: 'Хочу посетить', icon: 'Heart' },
  { value: 'planned', label: 'Запланировано', icon: 'CalendarCheck' },
  { value: 'visited', label: 'Посещено', icon: 'Check' },
  { value: 'all', label: 'Все', icon: 'List' },
];

export default function Leisure() {
  const [activities, setActivities] = useState<LeisureActivity[]>([]);
  const [allActivities, setAllActivities] = useState<LeisureActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('want_to_go');
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<LeisureActivity | null>(null);
  const [newActivity, setNewActivity] = useState({
    title: '',
    category: 'event',
    location: '',
    date: '',
    time: '',
    price: '',
    currency: 'RUB',
    status: 'want_to_go',
    notes: '',
    website: '',
    phone: '',
    booking_required: false,
    booking_url: '',
  });

  const loadActivities = useCallback(async (status: string) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken') || localStorage.getItem('auth_token');
      const response = await fetch(`${TRIPS_API_URL}/?action=leisure&status=${status}`, {
        headers: {
          'X-Auth-Token': token || ''
        }
      });
      const data = await response.json();
      setActivities(data.activities || []);
    } catch (error) {
      console.error('Error loading activities:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadAllActivities = useCallback(async () => {
    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('auth_token');
      const response = await fetch(`${TRIPS_API_URL}/?action=leisure&status=all`, {
        headers: {
          'X-Auth-Token': token || ''
        }
      });
      const data = await response.json();
      setAllActivities(data.activities || []);
    } catch (error) {
      console.error('Error loading all activities:', error);
    }
  }, []);

  useEffect(() => {
    loadActivities(activeTab);
    loadAllActivities();
  }, [activeTab, loadActivities, loadAllActivities]);

  const handleCreateActivity = async () => {
    if (!newActivity.title || !newActivity.category) {
      alert('Заполните обязательные поля');
      return;
    }

    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('auth_token');
      const response = await fetch(TRIPS_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': token || ''
        },
        body: JSON.stringify({
          action: 'create_leisure',
          ...newActivity,
          price: newActivity.price ? parseFloat(newActivity.price) : null,
        }),
      });

      if (response.ok) {
        await loadActivities(activeTab);
        await loadAllActivities();
        setIsAddDialogOpen(false);
        resetNewActivity();
      }
    } catch (error) {
      console.error('Error creating activity:', error);
      alert('Ошибка при создании активности');
    }
  };

  const handleUpdateActivity = async () => {
    if (!editingActivity || !editingActivity.title) {
      alert('Заполните обязательные поля');
      return;
    }

    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('auth_token');
      const response = await fetch(TRIPS_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': token || ''
        },
        body: JSON.stringify({
          action: 'update_leisure',
          ...editingActivity,
        }),
      });

      if (response.ok) {
        await loadActivities(activeTab);
        await loadAllActivities();
        setIsEditDialogOpen(false);
        setEditingActivity(null);
      }
    } catch (error) {
      console.error('Error updating activity:', error);
      alert('Ошибка при обновлении активности');
    }
  };

  const handleDeleteActivity = async (activityId: number) => {
    if (!confirm('Удалить эту активность?')) return;

    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('auth_token');
      const response = await fetch(TRIPS_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': token || ''
        },
        body: JSON.stringify({
          action: 'delete_leisure',
          id: activityId,
        }),
      });

      if (response.ok) {
        await loadActivities(activeTab);
        await loadAllActivities();
      }
    } catch (error) {
      console.error('Error deleting activity:', error);
      alert('Ошибка при удалении активности');
    }
  };

  const handleAddFromAI = (place: any) => {
    setNewActivity({
      title: place.title,
      category: mapCategory(place.category),
      location: place.address || '',
      date: '',
      time: '',
      price: '',
      currency: 'RUB',
      status: 'want_to_go',
      notes: place.description || '',
      website: '',
      phone: '',
      booking_required: false,
      booking_url: '',
    });
    setIsAddDialogOpen(true);
  };

  const handleAddFromSearch = (place: any) => {
    setNewActivity({
      title: place.name,
      category: 'other',
      location: place.address || place.description || '',
      date: '',
      time: '',
      price: '',
      currency: 'RUB',
      status: 'want_to_go',
      notes: place.description || '',
      website: place.url || '',
      phone: place.phone || '',
      booking_required: false,
      booking_url: '',
    });
    setIsAddDialogOpen(true);
  };

  const mapCategory = (aiCategory: string): string => {
    const lower = aiCategory.toLowerCase();
    if (lower.includes('ресторан') || lower.includes('еда')) return 'restaurant';
    if (lower.includes('музей') || lower.includes('культура')) return 'culture';
    if (lower.includes('парк') || lower.includes('природа')) return 'attraction';
    if (lower.includes('развлечение')) return 'entertainment';
    if (lower.includes('спорт')) return 'sport';
    return 'other';
  };

  const resetNewActivity = () => {
    setNewActivity({
      title: '',
      category: 'event',
      location: '',
      date: '',
      time: '',
      price: '',
      currency: 'RUB',
      status: 'want_to_go',
      notes: '',
      website: '',
      phone: '',
      booking_required: false,
      booking_url: '',
    });
  };

  const getCategoryInfo = (category: string) => {
    return CATEGORIES.find(c => c.value === category) || CATEGORIES[0];
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      want_to_go: { label: 'Хочу посетить', variant: 'outline' as const },
      planned: { label: 'Запланировано', variant: 'default' as const },
      visited: { label: 'Посещено', variant: 'secondary' as const },
    };
    return badges[status as keyof typeof badges] || badges.want_to_go;
  };

  const formatPrice = (price?: number, currency?: string) => {
    if (!price) return null;
    const currencyInfo = getCurrencyByCode(currency || 'RUB');
    return `${new Intl.NumberFormat('ru-RU').format(price)} ${currencyInfo?.symbol || currency}`;
  };

  const formatDate = (date?: string) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const getTabCounts = () => {
    return {
      want_to_go: allActivities.filter(a => a.status === 'want_to_go').length,
      planned: allActivities.filter(a => a.status === 'planned').length,
      visited: allActivities.filter(a => a.status === 'visited').length,
      all: allActivities.length,
    };
  };

  const counts = getTabCounts();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Досуг</h1>
              <p className="text-sm text-gray-500">Места и активности</p>
            </div>
            <div className="flex gap-2">
              <AIAssistant onAddPlace={handleAddFromAI} />
              <PlaceSearch onSelectPlace={handleAddFromSearch} />
              <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
                <Icon name="Plus" size={20} />
                Добавить
              </Button>
            </div>
          </div>

          {/* View Mode */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Icon name="Grid3x3" size={16} className="mr-2" />
                Сетка
              </Button>
              <Button
                variant={viewMode === 'map' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('map')}
              >
                <Icon name="Map" size={16} className="mr-2" />
                Карта
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {TABS_CONFIG.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                  activeTab === tab.value
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Icon name={tab.icon} size={16} />
                {tab.label}
                <Badge variant="secondary" className="ml-1">
                  {counts[tab.value as keyof typeof counts] || 0}
                </Badge>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex justify-center py-12">
            <Icon name="Loader2" size={32} className="animate-spin text-gray-400" />
          </div>
        ) : viewMode === 'map' ? (
          <div className="h-[600px] rounded-lg overflow-hidden shadow-lg">
            <LeisureMap places={activities.map(a => ({ name: a.title, coordinates: undefined }))} />
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-12">
            <Icon name="MapPin" size={64} className="mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 text-lg mb-4">
              {activeTab === 'all' ? 'Активностей пока нет' : 'Нет активностей в этой категории'}
            </p>
            <div className="flex gap-2 justify-center">
              <AIAssistant onAddPlace={handleAddFromAI} />
              <PlaceSearch onSelectPlace={handleAddFromSearch} />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activities.map((activity) => {
              const categoryInfo = getCategoryInfo(activity.category);
              const statusBadge = getStatusBadge(activity.status);

              return (
                <Card key={activity.id} className="p-4 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Icon name={categoryInfo.icon} size={20} className="text-purple-600" />
                      <span className="text-xs text-gray-500">{categoryInfo.label}</span>
                    </div>
                    <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
                  </div>

                  <h3 className="font-semibold text-lg mb-2">{activity.title}</h3>

                  {activity.location && (
                    <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
                      <Icon name="MapPin" size={14} />
                      {activity.location}
                    </div>
                  )}

                  {activity.date && (
                    <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
                      <Icon name="Calendar" size={14} />
                      {formatDate(activity.date)}
                      {activity.time && <span className="ml-1">в {activity.time}</span>}
                    </div>
                  )}

                  {activity.price && (
                    <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
                      <Icon name="Wallet" size={14} />
                      {formatPrice(activity.price, activity.currency)}
                    </div>
                  )}

                  {activity.rating && (
                    <div className="flex items-center gap-1 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Icon
                          key={i}
                          name="Star"
                          size={14}
                          className={i < activity.rating! ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}
                        />
                      ))}
                    </div>
                  )}

                  {activity.notes && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{activity.notes}</p>
                  )}

                  <div className="flex gap-2 mt-4 pt-4 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        setEditingActivity(activity);
                        setIsEditDialogOpen(true);
                      }}
                    >
                      <Icon name="Pencil" size={14} className="mr-1" />
                      Редактировать
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteActivity(activity.id)}
                    >
                      <Icon name="Trash2" size={14} className="text-red-600" />
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Добавить активность</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Название *</Label>
              <Input
                value={newActivity.title}
                onChange={(e) => setNewActivity({ ...newActivity, title: e.target.value })}
                placeholder="Например: Поход в Большой театр"
              />
            </div>

            <div>
              <Label>Категория *</Label>
              <Select value={newActivity.category} onValueChange={(val) => setNewActivity({ ...newActivity, category: val })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Статус</Label>
              <Select value={newActivity.status} onValueChange={(val) => setNewActivity({ ...newActivity, status: val })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="want_to_go">Хочу посетить</SelectItem>
                  <SelectItem value="planned">Запланировано</SelectItem>
                  <SelectItem value="visited">Посещено</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Место</Label>
              <Input
                value={newActivity.location}
                onChange={(e) => setNewActivity({ ...newActivity, location: e.target.value })}
                placeholder="Москва, Театральная площадь, 1"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Дата</Label>
                <Input
                  type="date"
                  value={newActivity.date}
                  onChange={(e) => setNewActivity({ ...newActivity, date: e.target.value })}
                />
              </div>
              <div>
                <Label>Время</Label>
                <Input
                  type="time"
                  value={newActivity.time}
                  onChange={(e) => setNewActivity({ ...newActivity, time: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Цена</Label>
                <Input
                  type="number"
                  value={newActivity.price}
                  onChange={(e) => setNewActivity({ ...newActivity, price: e.target.value })}
                  placeholder="5000"
                />
              </div>
              <div>
                <Label>Валюта</Label>
                <Combobox
                  value={newActivity.currency}
                  onValueChange={(val) => setNewActivity({ ...newActivity, currency: val })}
                  options={formatCurrencyOptions()}
                  placeholder="Выберите валюту"
                  searchPlaceholder="Поиск валюты..."
                  emptyText="Валюта не найдена"
                />
              </div>
            </div>

            <div>
              <Label>Заметки</Label>
              <Textarea
                value={newActivity.notes}
                onChange={(e) => setNewActivity({ ...newActivity, notes: e.target.value })}
                placeholder="Дополнительная информация..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleCreateActivity}>
              Создать
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      {editingActivity && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Редактировать активность</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Название *</Label>
                <Input
                  value={editingActivity.title}
                  onChange={(e) => setEditingActivity({ ...editingActivity, title: e.target.value })}
                />
              </div>

              <div>
                <Label>Категория *</Label>
                <Select
                  value={editingActivity.category}
                  onValueChange={(val) => setEditingActivity({ ...editingActivity, category: val })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Статус</Label>
                <Select
                  value={editingActivity.status}
                  onValueChange={(val) => setEditingActivity({ ...editingActivity, status: val })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="want_to_go">Хочу посетить</SelectItem>
                    <SelectItem value="planned">Запланировано</SelectItem>
                    <SelectItem value="visited">Посещено</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Место</Label>
                <Input
                  value={editingActivity.location || ''}
                  onChange={(e) => setEditingActivity({ ...editingActivity, location: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Дата</Label>
                  <Input
                    type="date"
                    value={editingActivity.date || ''}
                    onChange={(e) => setEditingActivity({ ...editingActivity, date: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Время</Label>
                  <Input
                    type="time"
                    value={editingActivity.time || ''}
                    onChange={(e) => setEditingActivity({ ...editingActivity, time: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Цена</Label>
                  <Input
                    type="number"
                    value={editingActivity.price || ''}
                    onChange={(e) => setEditingActivity({ ...editingActivity, price: parseFloat(e.target.value) })}
                  />
                </div>
                <div>
                  <Label>Валюта</Label>
                  <Combobox
                    value={editingActivity.currency}
                    onValueChange={(val) => setEditingActivity({ ...editingActivity, currency: val })}
                    options={formatCurrencyOptions()}
                    placeholder="Выберите валюту"
                    searchPlaceholder="Поиск валюты..."
                    emptyText="Валюта не найдена"
                  />
                </div>
              </div>

              {editingActivity.status === 'visited' && (
                <div>
                  <Label>Оценка</Label>
                  <Select
                    value={editingActivity.rating?.toString() || ''}
                    onValueChange={(val) => setEditingActivity({ ...editingActivity, rating: parseInt(val) })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Поставьте оценку" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <SelectItem key={rating} value={rating.toString()}>
                          {'⭐'.repeat(rating)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <Label>Заметки</Label>
                <Textarea
                  value={editingActivity.notes || ''}
                  onChange={(e) => setEditingActivity({ ...editingActivity, notes: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Отмена
              </Button>
              <Button onClick={handleUpdateActivity}>
                Сохранить
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
