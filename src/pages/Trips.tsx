import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { TripsHeader } from '@/components/trips/TripsHeader';
import { TripsList } from '@/components/trips/TripsList';
import { CreateTripDialog } from '@/components/trips/CreateTripDialog';
import { EditTripDialog } from '@/components/trips/EditTripDialog';

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
    description: '',
  });
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);

  const loadTrips = useCallback(async (status: string) => {
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
  }, []);

  useEffect(() => {
    loadTrips(activeTab);
  }, [activeTab, loadTrips]);

  const getTabCount = (status: string) => {
    if (status === 'all') return trips.length;
    return trips.filter((trip) => trip.status === status).length;
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
          created_by: 1,
        }),
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
      const response = await fetch(TRIPS_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete_trip',
          trip_id: tripId,
        }),
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
          description: editingTrip.description,
        }),
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
      <TripsHeader
        activeTab={activeTab}
        isInstructionOpen={isInstructionOpen}
        onTabChange={setActiveTab}
        onInstructionToggle={setIsInstructionOpen}
        onNavigateBack={() => navigate('/')}
        onNavigateToWishlist={() => navigate('/trips/wishlist')}
        getTabCount={getTabCount}
      />

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        <TripsList
          trips={trips}
          loading={loading}
          onTripClick={(id) => navigate(`/trips/${id}`)}
          onEditTrip={handleEditTrip}
          onDeleteTrip={handleDeleteTrip}
          onNavigateToWishlist={() => navigate('/trips/wishlist')}
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
    </div>
  );
}
