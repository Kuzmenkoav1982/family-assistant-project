import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
                className="p-6 hover:shadow-lg transition-all cursor-pointer"
                onClick={() => navigate(`/trips/${trip.id}`)}
              >
                <div className="flex gap-4">
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
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Floating Add Button */}
      <Button
        onClick={() => navigate('/trips/create')}
        className="fixed bottom-24 right-6 h-14 w-14 rounded-full shadow-lg gap-2"
        size="icon"
      >
        <Icon name="Plus" size={24} />
      </Button>
    </div>
  );
}
