import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TripWishList } from '@/components/trips/TripWishList';
import { TripBookings } from '@/components/trips/TripBookings';
import { TripItinerary } from '@/components/trips/TripItinerary';
import { TripDiary } from '@/components/trips/TripDiary';
import { TripPhotos } from '@/components/trips/TripPhotos';
import { TripPlanningServices } from '@/components/trips/TripPlanningServices';
import { TripWishes } from '@/components/trips/TripWishes';
import { TripExpenses } from '@/components/trips/TripExpenses';

const TRIPS_API_URL = 'https://functions.poehali.dev/6b3296a3-1703-4ab4-9773-e09a9a93a11a';

interface Trip {
  id: number;
  title: string;
  destination: string;
  country: string | null;
  start_date: string;
  end_date: string;
  status: string;
  budget: number | null;
  spent: number;
  currency: string;
  description: string;
}

interface Booking {
  id: number;
  booking_type: string;
  title: string;
  booking_number?: string;
  provider?: string;
  date_from?: string;
  date_to?: string;
  cost?: number;
  currency: string;
  status: string;
}

interface ItineraryDay {
  id: number;
  day_number: number;
  date: string;
  title?: string;
  description?: string;
  places?: string;
  notes?: string;
}

interface DiaryEntry {
  id: number;
  date: string;
  title?: string;
  content: string;
  mood?: string;
  location?: string;
  weather?: string;
}

interface Photo {
  id: number;
  photo_url: string;
  title?: string;
  description?: string;
  location?: string;
  date_taken?: string;
}

export default function TripDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [itinerary, setItinerary] = useState<ItineraryDay[]>([]);
  const [diary, setDiary] = useState<DiaryEntry[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadTripData();
  }, [id]);

  const loadTripData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken') || localStorage.getItem('auth_token');
      
      const [tripRes, bookingsRes, itineraryRes, diaryRes, photosRes] = await Promise.all([
        fetch(`${TRIPS_API_URL}/?action=trip&id=${id}`, {
          headers: { 'X-Auth-Token': token || '' }
        }),
        fetch(`${TRIPS_API_URL}/?action=bookings&trip_id=${id}`, {
          headers: { 'X-Auth-Token': token || '' }
        }),
        fetch(`${TRIPS_API_URL}/?action=itinerary&trip_id=${id}`, {
          headers: { 'X-Auth-Token': token || '' }
        }),
        fetch(`${TRIPS_API_URL}/?action=diary&trip_id=${id}`, {
          headers: { 'X-Auth-Token': token || '' }
        }),
        fetch(`${TRIPS_API_URL}/?action=photos&trip_id=${id}`, {
          headers: { 'X-Auth-Token': token || '' }
        })
      ]);

      const tripData = await tripRes.json();
      const bookingsData = await bookingsRes.json();
      const itineraryData = await itineraryRes.json();
      const diaryData = await diaryRes.json();
      const photosData = await photosRes.json();

      setTrip(tripData.trip);
      setBookings(bookingsData.bookings || []);
      setItinerary(itineraryData.itinerary || []);
      setDiary(diaryData.diary || []);
      setPhotos(photosData.photos || []);
    } catch (error) {
      console.error('Error loading trip data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      planning: { label: 'Планируем', variant: 'outline' as const },
      booked: { label: 'Забронировано', variant: 'default' as const },
      ongoing: { label: 'В пути', variant: 'default' as const },
      completed: { label: 'Завершено', variant: 'secondary' as const }
    };
    
    const config = statusMap[status as keyof typeof statusMap] || statusMap.planning;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const formatBudget = (amount: number, currency: string) => {
    return new Intl.NumberFormat('ru-RU').format(amount) + ' ' + currency;
  };

  const handleBudgetUpdate = async (newBudget: number) => {
    if (!trip) return;

    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('auth_token');
      const response = await fetch(TRIPS_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': token || '',
        },
        body: JSON.stringify({
          action: 'update_trip',
          id: trip.id,
          title: trip.title,
          destination: trip.destination,
          country: trip.country,
          start_date: trip.start_date,
          end_date: trip.end_date,
          budget: newBudget,
          spent: trip.spent,
          status: trip.status,
          currency: trip.currency,
          description: trip.description,
        }),
      });

      if (response.ok) {
        setTrip({ ...trip, budget: newBudget });
      }
    } catch (error) {
      console.error('Error updating budget:', error);
      alert('Ошибка при обновлении бюджета');
    }
  };



  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Icon name="Loader2" size={32} className="animate-spin text-gray-400" />
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Card className="p-8 text-center">
          <Icon name="AlertCircle" size={48} className="mx-auto text-red-400 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Поездка не найдена</h3>
          <Button onClick={() => navigate('/trips')} className="mt-4">
            Вернуться к списку
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pb-20">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* Header */}
        <div className="bg-white border-b">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center gap-3 mb-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/trips')}
              >
                <Icon name="ArrowLeft" size={24} />
              </Button>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900">{trip.title}</h1>
                <p className="text-sm text-gray-500">{trip.destination}{trip.country ? `, ${typeof trip.country === 'object' ? trip.country.name : trip.country}` : ''}</p>
              </div>
              {getStatusBadge(trip.status)}
            </div>

            <TabsList className="w-full grid grid-cols-4 sm:grid-cols-8 gap-1">
              <TabsTrigger value="overview" className="text-[10px] sm:text-sm px-1 sm:px-3">Обзор</TabsTrigger>
              <TabsTrigger value="wishlist" className="text-[10px] sm:text-sm px-1 sm:px-3">
                <Icon name="Star" size={12} className="mr-0.5 sm:mr-1" />
                Места
              </TabsTrigger>
              <TabsTrigger value="planning" className="text-[10px] sm:text-sm px-1 sm:px-3">
                <Icon name="CalendarCheck" size={12} className="mr-0.5 sm:mr-1" />
                План
              </TabsTrigger>
              <TabsTrigger value="wishes" className="text-[10px] sm:text-sm px-1 sm:px-3">
                <Icon name="Heart" size={12} className="mr-0.5 sm:mr-1" />
                Пожелания
              </TabsTrigger>
              <TabsTrigger value="bookings" className="text-[10px] sm:text-sm px-1 sm:px-3">Брони<span className="hidden sm:inline"> ({bookings.length})</span></TabsTrigger>
              <TabsTrigger value="itinerary" className="text-[10px] sm:text-sm px-1 sm:px-3">Маршрут</TabsTrigger>
              <TabsTrigger value="diary" className="text-[10px] sm:text-sm px-1 sm:px-3">Дневник<span className="hidden sm:inline"> ({diary.length})</span></TabsTrigger>
              <TabsTrigger value="photos" className="text-[10px] sm:text-sm px-1 sm:px-3">Фото<span className="hidden sm:inline"> ({photos.length})</span></TabsTrigger>
            </TabsList>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 py-6">
          <TabsContent value="overview" className="space-y-4 mt-0">
          {/* Trip Info Card */}
          <Card className="p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2">
              <Icon name="Calendar" size={18} className="flex-shrink-0" />
              <span className="truncate">Информация о поездке</span>
            </h3>
            <div className="space-y-2 sm:space-y-3">
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                <span className="text-sm text-gray-600">Даты</span>
                <span className="font-semibold text-sm sm:text-base">{formatDate(trip.start_date)} - {formatDate(trip.end_date)}</span>
              </div>
              {trip.description && (
                <div className="pt-3 border-t">
                  <p className="text-gray-700">{trip.description}</p>
                </div>
              )}
            </div>
          </Card>

          {/* Budget Card with Expenses */}
          <Card className="p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2">
              <Icon name="Wallet" size={18} className="flex-shrink-0" />
              Бюджет
            </h3>
            <TripExpenses
              tripId={Number(id)}
              tripCurrency={trip.currency}
              tripBudget={trip.budget}
              onBudgetUpdate={handleBudgetUpdate}
              onExpensesChange={loadTripData}
            />
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            <Card className="p-3 sm:p-4 text-center">
              <Icon name="Ticket" size={20} className="mx-auto mb-1 sm:mb-2 text-blue-600" />
              <div className="text-xl sm:text-2xl font-bold">{bookings.length}</div>
              <div className="text-xs sm:text-sm text-gray-600">Броней</div>
            </Card>
            <Card className="p-3 sm:p-4 text-center">
              <Icon name="MapPin" size={20} className="mx-auto mb-1 sm:mb-2 text-green-600" />
              <div className="text-xl sm:text-2xl font-bold">{itinerary.length}</div>
              <div className="text-xs sm:text-sm text-gray-600">Дней</div>
            </Card>
            <Card className="p-3 sm:p-4 text-center">
              <Icon name="Camera" size={20} className="mx-auto mb-1 sm:mb-2 text-purple-600" />
              <div className="text-2xl font-bold">{photos.length}</div>
              <div className="text-sm text-gray-600">Фото</div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="wishlist" className="mt-0">
          <TripWishList tripId={Number(id)} currency={trip?.currency} />
        </TabsContent>

        <TabsContent value="planning" className="space-y-4 mt-0">
          <TripPlanningServices 
            destination={trip.destination} 
            country={trip.country ? (typeof trip.country === 'object' ? trip.country.name : trip.country) : ''}
          />
        </TabsContent>

        <TabsContent value="wishes" className="space-y-4 mt-0">
          <TripWishes tripId={Number(id)} />
        </TabsContent>

        <TabsContent value="bookings" className="space-y-4 mt-0">
          <TripBookings tripId={Number(id)} bookings={bookings} onUpdate={loadTripData} />
        </TabsContent>

        <TabsContent value="itinerary" className="space-y-4 mt-0">
          <TripItinerary tripId={Number(id)} itinerary={itinerary} onUpdate={loadTripData} />
        </TabsContent>

        <TabsContent value="diary" className="space-y-4 mt-0">
          <TripDiary tripId={Number(id)} diary={diary} onUpdate={loadTripData} />
        </TabsContent>

        <TabsContent value="photos" className="mt-0">
          <TripPhotos tripId={Number(id)} photos={photos} onUpdate={loadTripData} />
        </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}