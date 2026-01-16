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
import { PhotoUpload } from '@/components/leisure/PhotoUpload';
import { ParticipantsPicker } from '@/components/leisure/ParticipantsPicker';
import { LeisureCalendar } from '@/components/leisure/LeisureCalendar';
import { LeisureStats } from '@/components/leisure/LeisureStats';
import { RouteGenerator } from '@/components/leisure/RouteGenerator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';

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
  tags?: string[];
  latitude?: number;
  longitude?: number;
  participants?: string[];
  share_token?: string;
  is_public?: boolean;
  show_in_calendar?: boolean;
  visible_to?: string[];
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
  const [viewMode, setViewMode] = useState<'grid' | 'map' | 'calendar' | 'stats'>('grid');
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
    latitude: '',
    longitude: '',
    tags: [] as string[],
    participants: [] as string[],
    show_in_calendar: false,
    visible_to: [] as string[],
  });
  const [tagInput, setTagInput] = useState('');
  const [selectedTagFilter, setSelectedTagFilter] = useState<string | null>(null);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [sharingActivity, setSharingActivity] = useState<LeisureActivity | null>(null);
  const [isInstructionOpen, setIsInstructionOpen] = useState(false);
  const navigate = useNavigate();

  const getAllTags = () => {
    const tagsSet = new Set<string>();
    allActivities.forEach(activity => {
      activity.tags?.forEach(tag => tagsSet.add(tag));
    });
    return Array.from(tagsSet).sort();
  };

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
          latitude: newActivity.latitude ? parseFloat(newActivity.latitude) : null,
          longitude: newActivity.longitude ? parseFloat(newActivity.longitude) : null,
          tags: newActivity.tags,
          participants: newActivity.participants,
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
      latitude: place.coordinates?.lat?.toString() || '',
      longitude: place.coordinates?.lon?.toString() || '',
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
      latitude: place.coordinates?.lat?.toString() || '',
      longitude: place.coordinates?.lon?.toString() || '',
      tags: [] as string[],
      participants: [] as string[],
    });
    setIsAddDialogOpen(true);
  };

  const handleGenerateShareLink = async (activity: LeisureActivity) => {
    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('auth_token');
      const response = await fetch(`${TRIPS_API_URL}/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': token || ''
        },
        body: JSON.stringify({
          action: 'generate_share_link',
          id: activity.id
        })
      });

      if (response.ok) {
        const data = await response.json();
        setShareLink(data.share_url);
        setSharingActivity(activity);
        setShareDialogOpen(true);
        await loadActivities(activeTab);
      }
    } catch (error) {
      console.error('Error generating share link:', error);
      alert('Ошибка при генерации ссылки');
    }
  };

  const handleRevokeShareLink = async (activity: LeisureActivity) => {
    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('auth_token');
      const response = await fetch(`${TRIPS_API_URL}/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': token || ''
        },
        body: JSON.stringify({
          action: 'revoke_share_link',
          id: activity.id
        })
      });

      if (response.ok) {
        await loadActivities(activeTab);
        alert('Публичная ссылка удалена');
      }
    } catch (error) {
      console.error('Error revoking share link:', error);
      alert('Ошибка при удалении ссылки');
    }
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(shareLink);
    alert('Ссылка скопирована!');
  };

  const handleCalendarDateChange = async (activityId: number, newDate: string) => {
    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('auth_token');
      const activity = allActivities.find(a => a.id === activityId);
      if (!activity) return;

      const response = await fetch(`${TRIPS_API_URL}/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': token || ''
        },
        body: JSON.stringify({
          action: 'update_leisure',
          id: activityId,
          title: activity.title,
          category: activity.category,
          date: newDate,
          status: 'planned',
          location: activity.location,
          time: activity.time,
          price: activity.price,
          currency: activity.currency,
          notes: activity.notes,
          website: activity.website,
          phone: activity.phone,
          booking_required: activity.booking_required,
          booking_url: activity.booking_url,
          tags: activity.tags || [],
          participants: activity.participants || [],
          latitude: activity.latitude,
          longitude: activity.longitude,
        })
      });

      if (response.ok) {
        await loadActivities(activeTab);
        await loadAllActivities();
      }
    } catch (error) {
      console.error('Error updating activity date:', error);
      alert('Ошибка при изменении даты');
    }
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
      latitude: '',
      longitude: '',
      tags: [],
      participants: [],
      show_in_calendar: false,
      visible_to: [],
    });
    setTagInput('');
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
          {/* Инструкция */}
          {isInstructionOpen && (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Icon name="Info" size={20} className="text-blue-600" />
                  <h3 className="font-semibold text-blue-900">Как пользоваться разделом Досуг</h3>
                </div>
                <button onClick={() => setIsInstructionOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <Icon name="X" size={20} />
                </button>
              </div>
              <div className="space-y-2 text-sm text-gray-700">
                <p><strong>📍 Добавление:</strong> Используйте кнопки AI-помощник, Поиск мест или просто "Добавить" для создания активностей</p>
                <p><strong>📅 Календарь:</strong> Перетаскивайте активности на даты для планирования. Drag & drop работает прямо в календаре!</p>
                <p><strong>🗓️ Общий календарь:</strong> Включите чекбокс "Показать в общем календаре" когда точно решили куда идти</p>
                <p><strong>🏷️ Статусы:</strong> "Хочу посетить" (Wish List) → "Запланировано" (с датой) → "Посещено" (с оценкой)</p>
                <p><strong>🚗 Маршрут:</strong> Кнопка "Построить маршрут" создаст план на день с временем в пути</p>
                <p><strong>📊 Статистика:</strong> Смотрите траты, посещённые места и рейтинги по категориям</p>
                <button
                  onClick={() => navigate('/instructions?section=leisure')}
                  className="mt-3 text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                >
                  Подробная инструкция
                  <Icon name="ExternalLink" size={14} />
                </button>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Досуг</h1>
                <p className="text-sm text-gray-500">Места и активности</p>
              </div>
              <button
                onClick={() => setIsInstructionOpen(!isInstructionOpen)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                title="Показать инструкцию"
              >
                <Icon name="HelpCircle" size={20} />
              </button>
            </div>
            <div className="flex gap-2">
              <RouteGenerator activities={allActivities} />
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
              <Button
                variant={viewMode === 'calendar' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('calendar')}
              >
                <Icon name="Calendar" size={16} className="mr-2" />
                Календарь
              </Button>
              <Button
                variant={viewMode === 'stats' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('stats')}
              >
                <Icon name="BarChart3" size={16} className="mr-2" />
                Статистика
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
        {/* Tag Filter */}
        {getAllTags().length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            <span className="text-sm text-gray-600 self-center">Теги:</span>
            <Badge
              variant={selectedTagFilter === null ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setSelectedTagFilter(null)}
            >
              Все
            </Badge>
            {getAllTags().map(tag => (
              <Badge
                key={tag}
                variant={selectedTagFilter === tag ? 'default' : 'outline'}
                className="cursor-pointer gap-1"
                onClick={() => setSelectedTagFilter(tag === selectedTagFilter ? null : tag)}
              >
                <Icon name="Tag" size={10} />
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <Icon name="Loader2" size={32} className="animate-spin text-gray-400" />
          </div>
        ) : viewMode === 'stats' ? (
          <LeisureStats activities={allActivities} />
        ) : viewMode === 'calendar' ? (
          <LeisureCalendar 
            activities={allActivities} 
            onDateChange={handleCalendarDateChange}
          />
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
            {activities
              .filter(activity => !selectedTagFilter || activity.tags?.includes(selectedTagFilter))
              .map((activity) => {
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

                  {activity.tags && activity.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {activity.tags.map((tag, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          <Icon name="Tag" size={10} className="mr-1" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {activity.participants && activity.participants.length > 0 && (
                    <div className="flex items-center gap-1 text-sm text-gray-600 mb-3">
                      <Icon name="Users" size={14} />
                      <span>{activity.participants.length} участников</span>
                    </div>
                  )}

                  <div className="flex gap-2 mt-4 pt-4 border-t">
                    <PhotoUpload
                      activityId={activity.id}
                      existingPhotos={[]}
                      onPhotosUpdate={(photos) => console.log('Photos updated:', photos)}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingActivity(activity);
                        setTagInput('');
                        setIsEditDialogOpen(true);
                      }}
                    >
                      <Icon name="Pencil" size={14} className="mr-1" />
                      Редактировать
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (activity.is_public) {
                          handleRevokeShareLink(activity);
                        } else {
                          handleGenerateShareLink(activity);
                        }
                      }}
                      title={activity.is_public ? 'Отозвать публичную ссылку' : 'Поделиться'}
                    >
                      <Icon 
                        name={activity.is_public ? 'Link' : 'Share2'} 
                        size={14} 
                        className={activity.is_public ? 'text-blue-600' : ''} 
                      />
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

            <div>
              <Label>Теги</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Введите тег и нажмите Enter"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && tagInput.trim()) {
                      e.preventDefault();
                      if (!newActivity.tags.includes(tagInput.trim())) {
                        setNewActivity({ ...newActivity, tags: [...newActivity.tags, tagInput.trim()] });
                      }
                      setTagInput('');
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (tagInput.trim() && !newActivity.tags.includes(tagInput.trim())) {
                      setNewActivity({ ...newActivity, tags: [...newActivity.tags, tagInput.trim()] });
                      setTagInput('');
                    }
                  }}
                >
                  <Icon name="Plus" size={14} />
                </Button>
              </div>
              {newActivity.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {newActivity.tags.map((tag, idx) => (
                    <Badge key={idx} variant="secondary" className="gap-1">
                      <Icon name="Tag" size={10} />
                      {tag}
                      <button
                        type="button"
                        onClick={() => setNewActivity({ ...newActivity, tags: newActivity.tags.filter((_, i) => i !== idx) })}
                        className="ml-1 hover:text-red-600"
                      >
                        <Icon name="X" size={10} />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div>
              <Label>Участники</Label>
              <ParticipantsPicker
                selectedIds={newActivity.participants}
                onChange={(ids) => setNewActivity({ ...newActivity, participants: ids })}
              />
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-3">
                <Label className="flex items-center gap-2">
                  <Icon name="CalendarDays" size={16} />
                  Показать в общем календаре семьи
                </Label>
                <input
                  type="checkbox"
                  checked={newActivity.show_in_calendar}
                  onChange={(e) => setNewActivity({ ...newActivity, show_in_calendar: e.target.checked })}
                  className="w-4 h-4 rounded"
                />
              </div>
              {newActivity.show_in_calendar && (
                <div className="ml-6 space-y-2">
                  <Label className="text-sm text-gray-600">Кто увидит в календаре?</Label>
                  <ParticipantsPicker
                    selectedIds={newActivity.visible_to}
                    onChange={(ids) => setNewActivity({ ...newActivity, visible_to: ids })}
                  />
                  <p className="text-xs text-gray-500">Если никого не выбрать — увидят все члены семьи</p>
                </div>
              )}
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
        <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
          setIsEditDialogOpen(open);
          if (!open) setTagInput('');
        }}>
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

              {editingActivity.date && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <Label className="flex items-center gap-2 mb-2">
                    <Icon name="Bell" size={14} />
                    Напомнить за...
                  </Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const reminderDate = new Date(`${editingActivity.date}T${editingActivity.time || '12:00'}`);
                        reminderDate.setHours(reminderDate.getHours() - 1);
                        alert(`Напоминание установлено на ${reminderDate.toLocaleString('ru-RU')}`);
                      }}
                    >
                      1 час
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const reminderDate = new Date(`${editingActivity.date}T${editingActivity.time || '12:00'}`);
                        reminderDate.setDate(reminderDate.getDate() - 1);
                        alert(`Напоминание установлено на ${reminderDate.toLocaleString('ru-RU')}`);
                      }}
                    >
                      1 день
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const reminderDate = new Date(`${editingActivity.date}T${editingActivity.time || '12:00'}`);
                        reminderDate.setDate(reminderDate.getDate() - 7);
                        alert(`Напоминание установлено на ${reminderDate.toLocaleString('ru-RU')}`);
                      }}
                    >
                      1 неделя
                    </Button>
                  </div>
                </div>
              )}

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

              <div>
                <Label>Теги</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="Введите тег и нажмите Enter"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && tagInput.trim()) {
                        e.preventDefault();
                        const currentTags = editingActivity.tags || [];
                        if (!currentTags.includes(tagInput.trim())) {
                          setEditingActivity({ ...editingActivity, tags: [...currentTags, tagInput.trim()] });
                        }
                        setTagInput('');
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const currentTags = editingActivity.tags || [];
                      if (tagInput.trim() && !currentTags.includes(tagInput.trim())) {
                        setEditingActivity({ ...editingActivity, tags: [...currentTags, tagInput.trim()] });
                        setTagInput('');
                      }
                    }}
                  >
                    <Icon name="Plus" size={14} />
                  </Button>
                </div>
                {editingActivity.tags && editingActivity.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {editingActivity.tags.map((tag, idx) => (
                      <Badge key={idx} variant="secondary" className="gap-1">
                        <Icon name="Tag" size={10} />
                        {tag}
                        <button
                          type="button"
                          onClick={() => {
                            const currentTags = editingActivity.tags || [];
                            setEditingActivity({ ...editingActivity, tags: currentTags.filter((_, i) => i !== idx) });
                          }}
                          className="ml-1 hover:text-red-600"
                        >
                          <Icon name="X" size={10} />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <Label>Участники</Label>
                <ParticipantsPicker
                  selectedIds={editingActivity.participants || []}
                  onChange={(ids) => setEditingActivity({ ...editingActivity, participants: ids })}
                />
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-3">
                  <Label className="flex items-center gap-2">
                    <Icon name="CalendarDays" size={16} />
                    Показать в общем календаре семьи
                  </Label>
                  <input
                    type="checkbox"
                    checked={editingActivity.show_in_calendar || false}
                    onChange={(e) => setEditingActivity({ ...editingActivity, show_in_calendar: e.target.checked })}
                    className="w-4 h-4 rounded"
                  />
                </div>
                {editingActivity.show_in_calendar && (
                  <div className="ml-6 space-y-2">
                    <Label className="text-sm text-gray-600">Кто увидит в календаре?</Label>
                    <ParticipantsPicker
                      selectedIds={editingActivity.visible_to || []}
                      onChange={(ids) => setEditingActivity({ ...editingActivity, visible_to: ids })}
                    />
                    <p className="text-xs text-gray-500">Если никого не выбрать — увидят все члены семьи</p>
                  </div>
                )}
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

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Публичная ссылка на активность</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Теперь "{sharingActivity?.title}" доступна по публичной ссылке. Любой человек с этой ссылкой сможет посмотреть детали.
            </p>
            <div className="flex gap-2">
              <Input value={shareLink} readOnly className="flex-1" />
              <Button onClick={copyShareLink} variant="outline">
                <Icon name="Copy" size={16} />
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setShareDialogOpen(false)}>Закрыть</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}