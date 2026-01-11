import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TripWishList } from '@/components/trips/TripWishList';

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
      
      const [tripRes, bookingsRes, itineraryRes, diaryRes, photosRes] = await Promise.all([
        fetch(`${TRIPS_API_URL}/?action=trip&id=${id}`),
        fetch(`${TRIPS_API_URL}/?action=bookings&trip_id=${id}`),
        fetch(`${TRIPS_API_URL}/?action=itinerary&trip_id=${id}`),
        fetch(`${TRIPS_API_URL}/?action=diary&trip_id=${id}`),
        fetch(`${TRIPS_API_URL}/?action=photos&trip_id=${id}`)
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

  const getBookingIcon = (type: string) => {
    const iconMap: Record<string, string> = {
      flight: 'Plane',
      train: 'Train',
      bus: 'Bus',
      hotel: 'Hotel',
      car: 'Car',
      other: 'Ticket'
    };
    return iconMap[type] || 'Ticket';
  };

  const getMoodEmoji = (mood?: string) => {
    const moodMap: Record<string, string> = {
      amazing: '🤩',
      great: '😊',
      good: '🙂',
      neutral: '😐',
      bad: '😕'
    };
    return mood ? moodMap[mood] : '📝';
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
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
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
                <p className="text-sm text-gray-500">{trip.destination}, {typeof trip.country === 'object' ? trip.country.name : trip.country}</p>
              </div>
              {getStatusBadge(trip.status)}
            </div>

            <TabsList className="w-full grid grid-cols-6 text-xs sm:text-sm">
              <TabsTrigger value="overview">Обзор</TabsTrigger>
              <TabsTrigger value="wishlist">
                <Icon name="Star" size={14} className="mr-1 hidden sm:inline" />
                Wish List
              </TabsTrigger>
              <TabsTrigger value="bookings">Брони ({bookings.length})</TabsTrigger>
              <TabsTrigger value="itinerary">Маршрут</TabsTrigger>
              <TabsTrigger value="diary">Дневник ({diary.length})</TabsTrigger>
              <TabsTrigger value="photos">Фото ({photos.length})</TabsTrigger>
            </TabsList>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <TabsContent value="overview" className="space-y-4 mt-0">
          {/* Trip Info Card */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Icon name="Calendar" size={20} />
              Информация о поездке
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Даты</span>
                <span className="font-semibold">{formatDate(trip.start_date)} - {formatDate(trip.end_date)}</span>
              </div>
              {trip.description && (
                <div className="pt-3 border-t">
                  <p className="text-gray-700">{trip.description}</p>
                </div>
              )}
            </div>
          </Card>

          {/* Budget Card */}
          {trip.budget > 0 && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Icon name="Wallet" size={20} />
                Бюджет
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Запланировано</span>
                  <span className="text-lg font-bold">{formatBudget(trip.budget, trip.currency)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Потрачено</span>
                  <span className={`text-lg font-bold ${trip.spent > trip.budget ? 'text-red-600' : 'text-green-600'}`}>
                    {formatBudget(trip.spent, trip.currency)}
                  </span>
                </div>
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      trip.spent > trip.budget ? 'bg-red-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min((trip.spent / trip.budget) * 100, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Остаток</span>
                  <span className="font-semibold">{formatBudget(trip.budget - trip.spent, trip.currency)}</span>
                </div>
              </div>
            </Card>
          )}

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="p-4 text-center">
              <Icon name="Ticket" size={24} className="mx-auto mb-2 text-blue-600" />
              <div className="text-2xl font-bold">{bookings.length}</div>
              <div className="text-sm text-gray-600">Броней</div>
            </Card>
            <Card className="p-4 text-center">
              <Icon name="MapPin" size={24} className="mx-auto mb-2 text-green-600" />
              <div className="text-2xl font-bold">{itinerary.length}</div>
              <div className="text-sm text-gray-600">Дней</div>
            </Card>
            <Card className="p-4 text-center">
              <Icon name="Camera" size={24} className="mx-auto mb-2 text-purple-600" />
              <div className="text-2xl font-bold">{photos.length}</div>
              <div className="text-sm text-gray-600">Фото</div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="wishlist" className="mt-0">
          <TripWishList tripId={Number(id)} currency={trip?.currency} />
        </TabsContent>

        <TabsContent value="bookings" className="space-y-4 mt-0">
          {bookings.length === 0 ? (
            <Card className="p-12 text-center">
              <Icon name="Ticket" size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">Нет броней</p>
            </Card>
          ) : (
            bookings.map((booking) => (
              <Card key={booking.id} className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Icon name={getBookingIcon(booking.booking_type)} size={24} className="text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-gray-900">{booking.title}</h4>
                        {booking.provider && (
                          <p className="text-sm text-gray-600">{booking.provider}</p>
                        )}
                      </div>
                      <Badge variant={booking.status === 'confirmed' ? 'default' : 'outline'}>
                        {booking.status === 'confirmed' ? 'Подтверждено' : 'Ожидание'}
                      </Badge>
                    </div>
                    {booking.booking_number && (
                      <p className="text-sm text-gray-600 mb-2">№ {booking.booking_number}</p>
                    )}
                    {booking.date_from && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Icon name="Calendar" size={16} />
                        <span>{formatDate(booking.date_from)}</span>
                        {booking.date_to && <span>- {formatDate(booking.date_to)}</span>}
                      </div>
                    )}
                    {booking.cost && (
                      <div className="mt-2 text-lg font-bold text-gray-900">
                        {formatBudget(booking.cost, booking.currency)}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="itinerary" className="space-y-4 mt-0">
          {itinerary.length === 0 ? (
            <Card className="p-12 text-center">
              <Icon name="Map" size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">Маршрут не составлен</p>
            </Card>
          ) : (
            itinerary.map((day) => (
              <Card key={day.id} className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                    {day.day_number}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-gray-900">{day.title || `День ${day.day_number}`}</h4>
                      <span className="text-sm text-gray-500">{formatDate(day.date)}</span>
                    </div>
                    {day.description && (
                      <p className="text-gray-700 mb-3">{day.description}</p>
                    )}
                    {day.places && JSON.parse(day.places).length > 0 && (
                      <div className="space-y-2">
                        {JSON.parse(day.places).map((place: any, idx: number) => (
                          <div key={idx} className="flex items-center gap-2 text-sm">
                            <Icon name="MapPin" size={16} className="text-blue-600" />
                            <span className="font-medium">{place.name}</span>
                            {place.time && <span className="text-gray-500">• {place.time}</span>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="diary" className="space-y-4 mt-0">
          {diary.length === 0 ? (
            <Card className="p-12 text-center">
              <Icon name="BookOpen" size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">Дневник пуст</p>
            </Card>
          ) : (
            diary.map((entry) => (
              <Card key={entry.id} className="p-6">
                <div className="flex items-start gap-3 mb-3">
                  <span className="text-3xl">{getMoodEmoji(entry.mood)}</span>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{entry.title || 'Запись из дневника'}</h4>
                    <div className="flex items-center gap-3 text-sm text-gray-600 mt-1">
                      <span>{formatDate(entry.date)}</span>
                      {entry.location && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Icon name="MapPin" size={14} />
                            {entry.location}
                          </span>
                        </>
                      )}
                      {entry.weather && (
                        <>
                          <span>•</span>
                          <span>{entry.weather}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <p className="text-gray-700 whitespace-pre-wrap">{entry.content}</p>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="photos" className="mt-0">
          {photos.length === 0 ? (
            <Card className="p-12 text-center">
              <Icon name="Camera" size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">Нет фотографий</p>
            </Card>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {photos.map((photo) => (
                <Card key={photo.id} className="overflow-hidden">
                  <img
                    src={photo.photo_url}
                    alt={photo.title || 'Фото из поездки'}
                    className="w-full h-48 object-cover"
                  />
                  {(photo.title || photo.location) && (
                    <div className="p-3">
                      {photo.title && (
                        <h4 className="font-semibold text-sm text-gray-900 mb-1">{photo.title}</h4>
                      )}
                      {photo.location && (
                        <p className="text-xs text-gray-600 flex items-center gap-1">
                          <Icon name="MapPin" size={12} />
                          {photo.location}
                        </p>
                      )}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}