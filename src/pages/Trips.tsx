import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { TripsList } from '@/components/trips/TripsList';
import { CreateTripDialog } from '@/components/trips/CreateTripDialog';
import { EditTripDialog } from '@/components/trips/EditTripDialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import SectionHero from '@/components/ui/section-hero';
import { detectCurrencyByCountry } from '@/data/currencies';
import { useDemoMode } from '@/contexts/DemoModeContext';
import ItineraryGenerator from '@/components/ItineraryGenerator';

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
  const { isDemoMode, demoTrips } = useDemoMode();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newTrip, setNewTrip] = useState({
    title: '',
    destination: '',
    country: '',
    start_date: '',
    end_date: '',
    budget: '',
    description: '',
  });
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);

  const loadTrips = useCallback(async (status: string) => {
    if (isDemoMode) {
      setLoading(true);
      const filtered = status === 'all' 
        ? demoTrips 
        : status === 'planning' 
          ? demoTrips.filter(t => t.status === 'planning' || t.status === 'booked')
          : demoTrips.filter(t => t.status === status);
      setTrips(filtered as Trip[]);
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken') || localStorage.getItem('auth_token');
      let actualStatus = status;
      if (status === 'planning') {
        actualStatus = 'planning,booked';
      }
      const response = await fetch(`${TRIPS_API_URL}/?action=trips&status=${actualStatus}`, {
        headers: {
          'X-Auth-Token': token || ''
        }
      });
      const data = await response.json();
      setTrips(data.trips || []);
    } catch (error) {
      console.error('Error loading trips:', error);
    } finally {
      setLoading(false);
    }
  }, [isDemoMode, demoTrips]);

  useEffect(() => {
    loadTrips(activeTab);
  }, [activeTab, loadTrips]);

  const [allTrips, setAllTrips] = useState<Trip[]>([]);

  const loadAllTripsForCounting = useCallback(async () => {
    if (isDemoMode) {
      setAllTrips(demoTrips as Trip[]);
      return;
    }
    
    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('auth_token');
      const response = await fetch(`${TRIPS_API_URL}/?action=trips&status=all`, {
        headers: {
          'X-Auth-Token': token || ''
        }
      });
      const data = await response.json();
      setAllTrips(data.trips || []);
    } catch (error) {
      console.error('Error loading all trips:', error);
    }
  }, []);

  useEffect(() => {
    loadAllTripsForCounting();
  }, [loadAllTripsForCounting]);

  const getTabCount = (status: string) => {
    if (status === 'all') return allTrips.length;
    return allTrips.filter((trip) => trip.status === status).length;
  };

  const handleCreateTrip = async () => {
    console.log('handleCreateTrip called', newTrip);
    
    if (!newTrip.title || !newTrip.destination || !newTrip.start_date || !newTrip.end_date) {
      alert('Заполните обязательные поля');
      return;
    }

    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('auth_token');
      console.log('Sending request with token:', token ? 'exists' : 'missing');
      
      const response = await fetch(TRIPS_API_URL, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Auth-Token': token || ''
        },
        body: JSON.stringify({
          action: 'create_trip',
          ...newTrip,
          budget: newTrip.budget ? parseFloat(newTrip.budget) : null,
          status: 'planning',
          currency: detectCurrencyByCountry(newTrip.country),
          created_by: 1,
        }),
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (response.ok) {
        await loadTrips(activeTab);
        await loadAllTripsForCounting();
        setIsAddDialogOpen(false);
        setNewTrip({
          title: '',
          destination: '',
          country: '',
          start_date: '',
          end_date: '',
          budget: '',
          description: '',
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
      const token = localStorage.getItem('authToken') || localStorage.getItem('auth_token');
      const response = await fetch(TRIPS_API_URL, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Auth-Token': token || ''
        },
        body: JSON.stringify({
          action: 'delete_trip',
          trip_id: tripId,
        }),
      });

      if (response.ok) {
        await loadTrips(activeTab);
        await loadAllTripsForCounting();
      }
    } catch (error) {
      console.error('Error deleting trip:', error);
      alert('Ошибка при удалении поездки');
    }
  };

  const handleArchiveTrip = async (tripId: number) => {
    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('auth_token');
      const response = await fetch(TRIPS_API_URL, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Auth-Token': token || ''
        },
        body: JSON.stringify({
          action: 'archive_trip',
          trip_id: tripId,
        }),
      });

      if (response.ok) {
        await loadTrips(activeTab);
        await loadAllTripsForCounting();
      }
    } catch (error) {
      console.error('Error archiving trip:', error);
      alert('Ошибка при архивации поездки');
    }
  };

  const handleRestoreTrip = async (tripId: number) => {
    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('auth_token');
      const response = await fetch(TRIPS_API_URL, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Auth-Token': token || ''
        },
        body: JSON.stringify({
          action: 'restore_trip',
          trip_id: tripId,
        }),
      });

      if (response.ok) {
        await loadTrips(activeTab);
        await loadAllTripsForCounting();
      }
    } catch (error) {
      console.error('Error restoring trip:', error);
      alert('Ошибка при восстановлении поездки');
    }
  };

  const handleEditTrip = (trip: Trip) => {
    setEditingTrip(trip);
    setIsEditDialogOpen(true);
  };

  const handleUpdateTrip = async () => {
    if (!editingTrip) return;
    if (
      !editingTrip.title ||
      !editingTrip.destination ||
      !editingTrip.start_date ||
      !editingTrip.end_date
    ) {
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
          description: editingTrip.description,
        }),
      });

      if (response.ok) {
        await loadTrips(activeTab);
        await loadAllTripsForCounting();
        setIsEditDialogOpen(false);
        setEditingTrip(null);
      }
    } catch (error) {
      console.error('Error updating trip:', error);
      alert('Ошибка при обновлении поездки');
    }
  };

  const TABS = [
    { value: 'all', label: 'Все' },
    { value: 'planning', label: 'Планируем' },
    { value: 'completed', label: 'Завершено' },
    { value: 'archived', label: 'Архив' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-sky-50/30 to-white pb-24">
      <div className="max-w-5xl mx-auto p-4 space-y-6">
        <SectionHero
          title="Путешествия"
          subtitle="Планируйте незабываемые поездки"
          imageUrl="https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/f7561c5b-e8e8-4ad0-bc38-e2a099d2e324.jpg"
          rightAction={
            <Button
              onClick={() => navigate('/trips/wishlist')}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
            >
              <Icon name="Star" size={16} />
              <span className="ml-1 text-sm">Wish List</span>
            </Button>
          }
        />

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full bg-white/80 backdrop-blur">
            {TABS.map(tab => (
              <TabsTrigger key={tab.value} value={tab.value} className="flex-1 text-xs sm:text-sm">
                {tab.label}
                {getTabCount(tab.value) > 0 && (
                  <span className="ml-1 text-[10px] bg-gray-200 rounded-full px-1.5">
                    {getTabCount(tab.value)}
                  </span>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {activeTab === 'all' && trips.length === 0 && !loading && (
          <ItineraryGenerator />
        )}

        <TripsList
          trips={trips}
          loading={loading}
          onTripClick={(id) => navigate(`/trips/${id}`)}
          onEditTrip={handleEditTrip}
          onDeleteTrip={handleDeleteTrip}
          onArchiveTrip={handleArchiveTrip}
          onRestoreTrip={handleRestoreTrip}
          onAddTrip={() => setIsAddDialogOpen(true)}
        />
      </div>

      <CreateTripDialog
        isOpen={isAddDialogOpen}
        newTrip={newTrip}
        onOpenChange={setIsAddDialogOpen}
        onNewTripChange={setNewTrip}
        onCreateTrip={handleCreateTrip}
      />

      <EditTripDialog
        isOpen={isEditDialogOpen}
        editingTrip={editingTrip}
        onOpenChange={setIsEditDialogOpen}
        onEditingTripChange={setEditingTrip}
        onUpdateTrip={handleUpdateTrip}
      />

      <Button
        className="fixed bottom-24 right-6 h-14 w-14 rounded-full shadow-lg bg-orange-500 hover:bg-orange-600"
        size="icon"
        onClick={() => setIsAddDialogOpen(true)}
      >
        <Icon name="Plus" size={24} />
      </Button>
    </div>
  );
}